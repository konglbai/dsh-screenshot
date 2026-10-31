import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

/** The Client half fetches this exact route; the custom header keeps casual cross-site reads out. */
const CAPTURE_PATH = '/api/dsh-wechat-screenshot/capture'
const MAX_CAPTURE_BYTES = 64 * 1024 * 1024
const CAPTURE_TIMEOUT_MS = 20_000

const CAPTURE_SCRIPT = String.raw`
$ErrorActionPreference = 'Stop'
Add-Type @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class DshWechatScreenshotDpi {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
}
public static class DshWechatScreenshotWindow {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool IsZoomed(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int maxCount);
}
'@
[DshWechatScreenshotDpi]::SetProcessDPIAware() | Out-Null
$hideWindow = __HIDE_WINDOW__
$hiddenHandle = [IntPtr]::Zero
$restoreMaximized = $false
if ($hideWindow) {
  $candidate = [DshWechatScreenshotWindow]::GetForegroundWindow()
  if ($candidate -ne [IntPtr]::Zero) {
    $processId = [uint32]0
    [void][DshWechatScreenshotWindow]::GetWindowThreadProcessId($candidate, [ref]$processId)
    $title = New-Object System.Text.StringBuilder 512
    [void][DshWechatScreenshotWindow]::GetWindowText($candidate, $title, $title.Capacity)
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    $isDsh = $false
    if ($process -and $process.ProcessName -like 'DeepSeek*') { $isDsh = $true }
    if ($title.ToString() -like '*DeepSeek Harness*') { $isDsh = $true }
    if ($isDsh -and $title.ToString() -notlike '*DevTools*') {
      $hiddenHandle = $candidate
      $restoreMaximized = [DshWechatScreenshotWindow]::IsZoomed($hiddenHandle)
      # Minimize instead of hide: if this process is killed, the window stays recoverable from the taskbar.
      [void][DshWechatScreenshotWindow]::ShowWindow($hiddenHandle, 6)
      Start-Sleep -Milliseconds 320
    }
  }
}
try {
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing
  $bounds = [System.Windows.Forms.SystemInformation]::VirtualScreen
  if ($bounds.Width -le 0 -or $bounds.Height -le 0) { throw 'no screen bounds' }
  $bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.CopyFromScreen($bounds.Left, $bounds.Top, 0, 0, $bitmap.Size)
    } finally {
      $graphics.Dispose()
    }
    $bitmap.Save(__OUT_FILE__, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $bitmap.Dispose()
  }
} finally {
  if ($hiddenHandle -ne [IntPtr]::Zero) {
    [void][DshWechatScreenshotWindow]::ShowWindow($hiddenHandle, 9)
    if ($restoreMaximized) {
      [void][DshWechatScreenshotWindow]::ShowWindow($hiddenHandle, 3)
    }
    [void][DshWechatScreenshotWindow]::SetForegroundWindow($hiddenHandle)
    Start-Sleep -Milliseconds 70
  }
}
`

/** Quote one PowerShell literal without allowing a path to break out of the here-string. */
function powerShellLiteral(value) {
  return `'${value.replaceAll("'", "''")}'`
}

function isPng(data) {
  return data.length > 8
    && data[0] === 0x89
    && data[1] === 0x50
    && data[2] === 0x4e
    && data[3] === 0x47
}

async function runPowerShell(script) {
  const encoded = Buffer.from(script, 'utf16le').toString('base64')
  await execFileAsync('powershell.exe', [
    '-NoLogo',
    '-NoProfile',
    '-NonInteractive',
    '-STA',
    '-WindowStyle',
    'Hidden',
    '-EncodedCommand',
    encoded,
  ], {
    windowsHide: true,
    timeout: CAPTURE_TIMEOUT_MS,
    maxBuffer: 1024 * 1024,
  })
}

/**
 * Capture the whole virtual desktop. The temporary PNG is read and removed in
 * the same operation so a failed read cannot leave captures behind.
 */
async function captureDesktop(hideWindow) {
  const file = join(tmpdir(), `dsh-wechat-screenshot-${randomUUID()}.png`)
  const script = CAPTURE_SCRIPT
    .replace('__OUT_FILE__', powerShellLiteral(file))
    .replace('__HIDE_WINDOW__', hideWindow ? '$true' : '$false')
  try {
    await runPowerShell(script)
    const data = await readFile(file)
    if (!isPng(data)) throw new Error('screen capture did not produce a PNG')
    if (data.length > MAX_CAPTURE_BYTES) throw new Error('screen capture is unexpectedly large')
    return data
  } finally {
    await unlink(file).catch(() => {})
  }
}

/**
 * Host half: expose an authenticated-by-header local capture route. When the
 * Web carrier is absent the Client falls back to the browser capture API.
 */
export function apply(ctx) {
  ctx.inject(['webServer'], (webCtx) => {
    const server = webCtx.webServer
    if (server === undefined || typeof server.register !== 'function') return

    const inFlight = new Map()
    const captureOnce = (hideWindow) => {
      const key = hideWindow ? 'hide' : 'show'
      let pending = inFlight.get(key)
      if (pending === undefined) {
        pending = captureDesktop(hideWindow).finally(() => {
          inFlight.delete(key)
        })
        inFlight.set(key, pending)
      }
      return pending
    }

    webCtx.effect(() => server.register({
      kind: 'exact',
      path: CAPTURE_PATH,
      async handler(req, res) {
        if (req.method !== 'GET') {
          res.writeHead(405, { allow: 'GET', 'cache-control': 'no-store' })
          res.end()
          return
        }
        if (req.headers['x-dsh-screenshot'] !== '1') {
          res.writeHead(403, { 'cache-control': 'no-store' })
          res.end()
          return
        }
        const remote = req.socket.remoteAddress ?? ''
        if (remote !== '127.0.0.1' && remote !== '::1' && remote !== '::ffff:127.0.0.1') {
          res.writeHead(403, { 'cache-control': 'no-store' })
          res.end()
          return
        }
        let hideWindow = false
        try {
          hideWindow = new URL(req.url ?? '/', 'http://localhost').searchParams.get('hide') === '1'
        } catch {
          // A malformed URL falls back to a normal, non-hiding capture.
        }
        try {
          const png = await captureOnce(hideWindow)
          res.writeHead(200, {
            'content-type': 'image/png',
            'content-length': String(png.length),
            'cache-control': 'no-store, max-age=0',
            'x-content-type-options': 'nosniff',
          })
          res.end(png)
        } catch (error) {
          ctx.logger.warn(`[wechat-screenshot] ${error instanceof Error ? error.message : String(error)}`)
          res.writeHead(500, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
          })
          res.end(JSON.stringify({ error: 'capture_failed' }))
        }
      },
    }))
  })
}
