window.__ModuleLoader__.load({
  id: '@local/dsh-wechat-screenshot',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useLayoutEffect, useRef, useState } = React

    const NS = 'dsh-wechat-screenshot'
    const CAPTURE_PATH = '/api/dsh-wechat-screenshot/capture'
    const IS_ELECTRON = /Electron\//i.test(navigator.userAgent)
    const COLORS = [
      { id: 'red', value: '#e64340', label: 'color.red' },
      { id: 'orange', value: '#ff9500', label: 'color.orange' },
      { id: 'green', value: '#34c759', label: 'color.green' },
      { id: 'blue', value: '#0a84ff', label: 'color.blue' },
      { id: 'white', value: '#ffffff', label: 'color.white' },
      { id: 'black', value: '#1c1c1e', label: 'color.black' },
    ]
    const TOOLS = [
      { id: 'rect', label: 'tool.rect' },
      { id: 'ellipse', label: 'tool.ellipse' },
      { id: 'arrow', label: 'tool.arrow' },
      { id: 'pen', label: 'tool.pen' },
      { id: 'mosaic', label: 'tool.mosaic' },
      { id: 'text', label: 'tool.text' },
    ]
    const CURSORS = {
      nw: 'nwse-resize',
      n: 'ns-resize',
      ne: 'nesw-resize',
      e: 'ew-resize',
      se: 'nwse-resize',
      s: 'ns-resize',
      sw: 'nesw-resize',
      w: 'ew-resize',
    }

    const DICTS = {
      en: {
        'meta.title': 'WeChat Screenshot',
        'meta.description': 'Capture a screen region from the composer, mark it up, then insert it into the chat or copy/save it.',
        'button.label': 'Screenshot',
        'button.title': 'Screenshot (hides the current window first)',
        'button.busy': 'Capturing the screen…',
        'menu.label': 'Screenshot options',
        'menu.noHide': 'Capture without hiding the window',
        'dialog.label': 'Screenshot editor',
        'canvas.label': 'Screen capture. Drag to select a region.',
        'hint.select': 'Drag to select a region · Esc to cancel',
        'hint.annotate': 'Drag to mark up · Ctrl+C to copy · Ctrl+S to save · Esc to cancel',
        'toolbar.label': 'Screenshot tools',
        'tool.rect': 'Rectangle',
        'tool.ellipse': 'Ellipse',
        'tool.arrow': 'Arrow',
        'tool.pen': 'Pen',
        'tool.mosaic': 'Mosaic',
        'tool.text': 'Text',
        'color.red': 'Red',
        'color.orange': 'Orange',
        'color.green': 'Green',
        'color.blue': 'Blue',
        'color.white': 'White',
        'color.black': 'Black',
        'action.undo': 'Undo',
        'action.copy': 'Copy to clipboard and close',
        'action.save': 'Save as PNG',
        'action.insert': 'Insert into chat',
        'action.close': 'Cancel screenshot',
        'text.placeholder': 'Type here, Enter to confirm',
        'error.title': 'Screenshot failed',
        'error.capture': 'The screen could not be captured. Please try again.',
        'error.unsupported': 'Screen capture is not available in this environment.',
        'error.copy': 'Copying the image failed. Try Save instead.',
        'error.save': 'Saving the image failed. Please try again.',
        'error.insert': 'The screenshot could not be added to the composer. Try Copy or Save instead.',
        'error.retry': 'Try again',
        'error.close': 'Close',
        'error.detail': 'Details',
      },
      zh: {
        'meta.title': '微信截图',
        'meta.description': '在输入框左下角直接截取屏幕区域，标注后插入对话框，或复制、保存。',
        'button.label': '截图',
        'button.title': '截图（先隐藏当前界面）',
        'button.busy': '正在截取屏幕…',
        'menu.label': '截图选项',
        'menu.noHide': '不隐藏当前界面',
        'dialog.label': '截图工具',
        'canvas.label': '屏幕截图，拖动以框选区域。',
        'hint.select': '拖动选择截图区域 · Esc 取消',
        'hint.annotate': '拖动绘制标注 · Ctrl+C 复制 · Ctrl+S 保存 · Esc 取消',
        'toolbar.label': '截图工具栏',
        'tool.rect': '矩形',
        'tool.ellipse': '椭圆',
        'tool.arrow': '箭头',
        'tool.pen': '画笔',
        'tool.mosaic': '马赛克',
        'tool.text': '文字',
        'color.red': '红色',
        'color.orange': '橙色',
        'color.green': '绿色',
        'color.blue': '蓝色',
        'color.white': '白色',
        'color.black': '黑色',
        'action.undo': '撤销',
        'action.copy': '复制到剪贴板并关闭',
        'action.save': '保存为 PNG',
        'action.insert': '插入到对话框',
        'action.close': '取消截图',
        'text.placeholder': '输入文字，回车确认',
        'error.title': '截图失败',
        'error.capture': '无法获取屏幕画面，请重试。',
        'error.unsupported': '当前环境不支持屏幕截图。',
        'error.copy': '复制到剪贴板失败，请改用保存。',
        'error.save': '保存图片失败，请重试。',
        'error.insert': '无法将截图添加到对话框，请改用复制或保存。',
        'error.retry': '重试',
        'error.close': '关闭',
        'error.detail': '详情',
      },
    }

    function fallbackT(key) {
      return DICTS.zh[key] ?? key
    }

    function useT(t) {
      return typeof t === 'function' ? t : fallbackT
    }

    const CSS = `
.dsh-wss-split{position:relative;display:inline-flex;align-items:center;flex:none;height:28px;border-radius:var(--dsw-radius-sm,8px)}
.dsh-wss-main{width:28px;height:28px;flex:none;display:grid;place-items:center;padding:0;border:0;border-radius:var(--dsw-radius-sm,8px) 0 0 var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background-color .12s,color .12s}
.dsh-wss-main:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-wss-main:disabled{opacity:.55;cursor:default}
.dsh-wss-main:focus-visible{outline:none;box-shadow:inset 0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}
.dsh-wss-chevron{width:18px;height:28px;flex:none;display:grid;place-items:center;padding:0;border:0;border-radius:0 var(--dsw-radius-sm,8px) var(--dsw-radius-sm,8px) 0;background:transparent;color:var(--dsw-alias-label-caption);cursor:pointer;transition:background-color .12s,color .12s}
.dsh-wss-chevron:hover:not(:disabled),.dsh-wss-chevron[aria-expanded="true"]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-wss-chevron:disabled{opacity:.55;cursor:default}
.dsh-wss-chevron:focus-visible{outline:none;box-shadow:inset 0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}
.dsh-wss-menu{position:absolute;bottom:calc(100% + 6px);left:0;z-index:1200;box-sizing:border-box;min-width:196px;max-width:min(260px,calc(100vw - 24px));padding:4px;display:flex;flex-direction:column;border:0;border-radius:var(--dsw-radius-lg,10px);background:var(--dsw-specific-menu,var(--dsw-alias-bg-overlay));backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-secondary);font-family:var(--dsw-font-family,'Segoe UI',sans-serif);font-size:13px;line-height:20px}
.dsh-wss-menu-item{box-sizing:border-box;width:100%;min-height:34px;display:flex;align-items:center;gap:8px;padding:6px 8px;border:0;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-primary);text-align:left;white-space:nowrap;cursor:pointer;font-family:inherit;font-size:13px;line-height:20px}
.dsh-wss-menu-item:hover,.dsh-wss-menu-item:focus-visible{background:var(--dsw-alias-interactive-bg-hover);outline:none}
.dsh-wss-menu-item:active{background:var(--dsw-alias-interactive-bg-hover-solid,var(--dsw-alias-interactive-bg-hover))}
.dsh-wss-spinner{width:13px;height:13px;box-sizing:border-box;border:1.6px solid currentColor;border-right-color:transparent;border-radius:50%;animation:dsh-wss-spin .7s linear infinite}
@keyframes dsh-wss-spin{to{transform:rotate(360deg)}}
.dsh-wss-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:#050607;color:#f5f5f7;font-family:var(--dsw-font-family,'Segoe UI',sans-serif);user-select:none;-webkit-user-select:none;outline:none;overflow:hidden;pointer-events:auto}
.dsh-wss-canvas{display:block;width:auto;height:auto;max-width:calc(100vw - 44px);max-height:calc(100vh - 92px);border-radius:2px;box-shadow:0 18px 70px rgba(0,0,0,.55);touch-action:none;cursor:crosshair;outline:none}
.dsh-wss-hint{position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:2;max-width:calc(100vw - 32px);padding:6px 12px;border-radius:999px;background:rgba(20,22,25,.82);box-shadow:0 4px 18px rgba(0,0,0,.22);color:rgba(255,255,255,.9);font-size:12px;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;backdrop-filter:blur(10px)}
.dsh-wss-size{position:fixed;z-index:2;padding:3px 7px;border-radius:6px;background:rgba(20,22,25,.86);color:#fff;font-size:11px;line-height:16px;font-variant-numeric:tabular-nums;pointer-events:none;box-shadow:0 2px 10px rgba(0,0,0,.25)}
.dsh-wss-toolbar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:3;display:flex;align-items:center;justify-content:center;gap:3px;flex-wrap:wrap;max-width:calc(100vw - 24px);padding:6px;border-radius:14px;background:rgba(26,27,31,.94);box-shadow:0 10px 34px rgba(0,0,0,.42);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.07);animation:dsh-wss-rise .14s ease-out}
@keyframes dsh-wss-rise{from{opacity:0;transform:translate(-50%,6px)}to{opacity:1;transform:translate(-50%,0)}}
.dsh-wss-close{position:fixed;right:16px;top:16px;z-index:6;width:32px;height:32px;display:grid;place-items:center;padding:0;border:0;border-radius:999px;background:rgba(20,22,25,.82);color:#f5f5f7;cursor:pointer;backdrop-filter:blur(10px);box-shadow:0 4px 18px rgba(0,0,0,.25)}
.dsh-wss-close:hover{background:rgba(48,50,55,.95)}
.dsh-wss-tool{width:32px;height:32px;flex:none;display:grid;place-items:center;padding:0;border:0;border-radius:8px;background:transparent;color:#f5f5f7;cursor:pointer;transition:background-color .1s,color .1s}
.dsh-wss-tool:hover:not(:disabled){background:rgba(255,255,255,.13)}
.dsh-wss-tool:active:not(:disabled){background:rgba(255,255,255,.2)}
.dsh-wss-tool.is-active{background:var(--dsw-alias-brand-primary,#0a84ff);color:#fff}
.dsh-wss-tool:disabled{opacity:.32;cursor:default}
.dsh-wss-tool:focus-visible{outline:2px solid #fff;outline-offset:-2px}
.dsh-wss-confirm{color:#34c759}
.dsh-wss-confirm:hover:not(:disabled){background:rgba(52,199,89,.18);color:#4cd964}
.dsh-wss-confirm:active:not(:disabled){background:rgba(52,199,89,.26)}
.dsh-wss-confirm:focus-visible{outline:2px solid #4cd964;outline-offset:-2px}
.dsh-wss-swatch{width:26px;height:26px;flex:none;display:grid;place-items:center;padding:0;border:0;border-radius:8px;background:transparent;cursor:pointer}
.dsh-wss-swatch:hover{background:rgba(255,255,255,.13)}
.dsh-wss-swatch:focus-visible{outline:2px solid #fff;outline-offset:-2px}
.dsh-wss-swatch span{width:15px;height:15px;box-sizing:border-box;border-radius:50%;border:1px solid rgba(255,255,255,.45);box-shadow:0 1px 3px rgba(0,0,0,.35)}
.dsh-wss-swatch.is-active span{box-shadow:0 0 0 2px #1a1b1f,0 0 0 4px #fff}
.dsh-wss-divider{width:1px;height:20px;flex:none;margin:0 3px;background:rgba(255,255,255,.16)}
.dsh-wss-text{position:fixed;z-index:4;box-sizing:border-box;width:200px;max-width:calc(100vw - 24px);padding:1px 3px;border:1px dashed currentColor;border-radius:3px;background:rgba(0,0,0,.18);outline:none;font-family:var(--dsw-font-family,'Segoe UI',sans-serif);font-size:16px;font-weight:500;line-height:22px;caret-color:currentColor}
.dsh-wss-text::placeholder{color:rgba(255,255,255,.55)}
.dsh-wss-toast{position:fixed;left:50%;bottom:76px;transform:translateX(-50%);z-index:5;padding:7px 12px;border-radius:9px;background:rgba(20,22,25,.94);color:#fff;font-size:12px;line-height:18px;box-shadow:0 6px 24px rgba(0,0,0,.35);pointer-events:none}
.dsh-wss-error-card{box-sizing:border-box;width:min(430px,calc(100vw - 40px));padding:24px;border-radius:16px;background:#1c1e22;color:#f5f5f7;box-shadow:0 24px 80px rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.08)}
.dsh-wss-error-card h2{margin:0 0 8px;font-size:17px;line-height:24px;font-weight:600}
.dsh-wss-error-card p{margin:0;color:rgba(255,255,255,.7);font-size:13px;line-height:21px}
.dsh-wss-error-icon{width:38px;height:38px;display:grid;place-items:center;margin-bottom:14px;border-radius:10px;background:rgba(255,77,79,.12);color:#ff6b6d}
.dsh-wss-error-detail{margin:14px 0 0;max-height:96px;overflow:auto;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.5);font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11px;line-height:17px;word-break:break-word;user-select:text;-webkit-user-select:text}
.dsh-wss-error-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}
.dsh-wss-error-actions button{height:32px;padding:0 14px;border-radius:8px;border:0;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer}
.dsh-wss-error-actions .is-primary{background:var(--dsw-alias-brand-primary,#0a84ff);color:#fff}
.dsh-wss-error-actions .is-secondary{background:rgba(255,255,255,.08);color:#f5f5f7}
.dsh-wss-error-actions button:hover{filter:brightness(1.08)}
.dsh-wss-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media (max-width:560px){.dsh-wss-toolbar{gap:1px;padding:5px}.dsh-wss-tool{width:30px;height:30px}.dsh-wss-hint{font-size:11px}}
`
    //#region store

    const initialState = () => ({
      phase: 'idle',
      open: false,
      image: null,
      error: null,
      detail: '',
    })

    let state = initialState()
    const listeners = new Set()
    let generation = 0
    let lastHideUi = true

    function update(patch) {
      state = { ...state, ...patch }
      for (const listener of [...listeners]) listener(state)
    }

    function useShotState() {
      const [snapshot, setSnapshot] = useState(state)
      useEffect(() => {
        listeners.add(setSnapshot)
        setSnapshot(state)
        return () => {
          listeners.delete(setSnapshot)
        }
      }, [])
      return snapshot
    }

    function releaseCurrentImage() {
      if (state.image?.url) URL.revokeObjectURL(state.image.url)
    }

    function captureFailure(code, message) {
      const error = new Error(message || code)
      error.code = code
      return error
    }

    //#endregion
    //#region capture

    async function captureFromHost(hideUi) {
      const query = hideUi && IS_ELECTRON ? '?hide=1' : '?hide=0'
      const response = await fetch(`${CAPTURE_PATH}${query}`, {
        method: 'GET',
        headers: { 'x-dsh-screenshot': '1' },
        cache: 'no-store',
        credentials: 'same-origin',
      })
      if (!response.ok) {
        let detail = ''
        try {
          const body = await response.json()
          if (body && typeof body.error === 'string') detail = body.error
        } catch {
          // A non-JSON error body is already explained by the status.
        }
        const error = captureFailure('host', `capture route returned ${response.status}${detail ? ` (${detail})` : ''}`)
        error.status = response.status
        throw error
      }
      const type = response.headers.get('content-type') ?? ''
      if (!type.toLowerCase().startsWith('image/png')) {
        throw captureFailure('host', 'capture route returned a non-PNG response')
      }
      const blob = await response.blob()
      if (blob.size < 100) throw captureFailure('host', 'capture route returned an empty image')
      return blob
    }

    async function captureFromDisplay() {
      const media = navigator.mediaDevices
      if (!media || typeof media.getDisplayMedia !== 'function') {
        throw captureFailure('unsupported', 'getDisplayMedia is not available')
      }
      let stream
      try {
        stream = await media.getDisplayMedia({ video: { frameRate: 1 }, audio: false })
      } catch (error) {
        if (error && error.name === 'NotAllowedError') {
          throw captureFailure('cancelled', 'display capture was declined')
        }
        throw captureFailure('capture', error instanceof Error ? error.message : String(error))
      }
      try {
        const video = document.createElement('video')
        video.muted = true
        video.playsInline = true
        video.srcObject = stream
        await new Promise((resolve, reject) => {
          if (video.readyState >= 2) {
            resolve()
            return
          }
          const onReady = () => {
            cleanup()
            resolve()
          }
          const onError = () => {
            cleanup()
            reject(captureFailure('capture', 'the captured stream could not be decoded'))
          }
          const cleanup = () => {
            video.removeEventListener('loadeddata', onReady)
            video.removeEventListener('error', onError)
          }
          video.addEventListener('loadeddata', onReady)
          video.addEventListener('error', onError)
        })
        await video.play().catch(() => {})
        await new Promise((resolve) => setTimeout(resolve, 80))
        const width = video.videoWidth
        const height = video.videoHeight
        if (!width || !height) throw captureFailure('capture', 'the captured frame has no pixels')
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) throw captureFailure('capture', 'a 2D canvas is unavailable')
        context.drawImage(video, 0, 0, width, height)
        return await new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(captureFailure('capture', 'PNG encoding failed'))
          }, 'image/png')
        })
      } finally {
        for (const track of stream.getTracks()) track.stop()
      }
    }

    async function captureBlob(hideUi) {
      let hostFailure
      if (IS_ELECTRON) {
        try {
          return await captureFromHost(hideUi)
        } catch (error) {
          hostFailure = error
        }
      }
      try {
        return await captureFromDisplay()
      } catch (error) {
        if (error && error.code === 'cancelled') throw error
        if (hostFailure) {
          const combined = captureFailure(
            'capture',
            `${hostFailure instanceof Error ? hostFailure.message : String(hostFailure)}; ${error instanceof Error ? error.message : String(error)}`,
          )
          throw combined
        }
        throw error
      }
    }

    function loadBlobImage(blob) {
      const url = URL.createObjectURL(blob)
      return new Promise((resolve, reject) => {
        const element = new Image()
        element.onload = () => {
          if (!element.naturalWidth || !element.naturalHeight) {
            URL.revokeObjectURL(url)
            reject(captureFailure('capture', 'the captured image has no dimensions'))
            return
          }
          resolve({
            url,
            element,
            width: element.naturalWidth,
            height: element.naturalHeight,
          })
        }
        element.onerror = () => {
          URL.revokeObjectURL(url)
          reject(captureFailure('capture', 'the captured image could not be loaded'))
        }
        element.src = url
      })
    }

    async function beginCapture(hideUi = lastHideUi) {
      if (state.phase === 'capturing') return
      const hide = hideUi !== false
      lastHideUi = hide
      const currentGeneration = ++generation
      releaseCurrentImage()
      update({ phase: 'capturing', open: false, image: null, error: null, detail: '' })
      try {
        const blob = await captureBlob(hide)
        if (currentGeneration !== generation) return
        const image = await loadBlobImage(blob)
        if (currentGeneration !== generation) {
          URL.revokeObjectURL(image.url)
          return
        }
        update({ phase: 'ready', open: true, image, error: null, detail: '' })
      } catch (error) {
        if (currentGeneration !== generation) return
        if (error && error.code === 'cancelled') {
          update({ phase: 'idle', open: false, image: null, error: null, detail: '' })
          return
        }
        const code = error && error.code === 'unsupported' ? 'unsupported' : 'capture'
        update({
          phase: 'error',
          open: true,
          image: null,
          error: code,
          detail: error instanceof Error ? error.message : String(error),
        })
      }
    }

    function closeCapture() {
      generation += 1
      releaseCurrentImage()
      update(initialState())
    }

    //#endregion
    //#region geometry and painting

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max)
    }

    function normalizeRect(a, b) {
      const x = Math.min(a.x, b.x)
      const y = Math.min(a.y, b.y)
      return {
        x,
        y,
        w: Math.abs(a.x - b.x),
        h: Math.abs(a.y - b.y),
      }
    }

    function pointInRect(point, rect) {
      return point.x >= rect.x
        && point.x <= rect.x + rect.w
        && point.y >= rect.y
        && point.y <= rect.y + rect.h
    }

    function clampPointToRect(point, rect) {
      return {
        x: clamp(point.x, rect.x, rect.x + rect.w),
        y: clamp(point.y, rect.y, rect.y + rect.h),
      }
    }

    function handleList(rect) {
      const midX = rect.x + rect.w / 2
      const midY = rect.y + rect.h / 2
      return [
        { dir: 'nw', x: rect.x, y: rect.y },
        { dir: 'n', x: midX, y: rect.y },
        { dir: 'ne', x: rect.x + rect.w, y: rect.y },
        { dir: 'e', x: rect.x + rect.w, y: midY },
        { dir: 'se', x: rect.x + rect.w, y: rect.y + rect.h },
        { dir: 's', x: midX, y: rect.y + rect.h },
        { dir: 'sw', x: rect.x, y: rect.y + rect.h },
        { dir: 'w', x: rect.x, y: midY },
      ]
    }

    function handleAt(point, rect, tolerance) {
      for (const handle of handleList(rect)) {
        if (Math.abs(point.x - handle.x) <= tolerance && Math.abs(point.y - handle.y) <= tolerance) {
          return handle
        }
      }
      return undefined
    }

    function resizeRect(rect, direction, point, imageWidth, imageHeight, minimum) {
      let left = rect.x
      let top = rect.y
      let right = rect.x + rect.w
      let bottom = rect.y + rect.h
      if (direction.includes('w')) left = clamp(point.x, 0, right - minimum)
      if (direction.includes('e')) right = clamp(point.x, left + minimum, imageWidth)
      if (direction.includes('n')) top = clamp(point.y, 0, bottom - minimum)
      if (direction.includes('s')) bottom = clamp(point.y, top + minimum, imageHeight)
      return { x: left, y: top, w: right - left, h: bottom - top }
    }

    function makeAnnotation(tool, start, end, color, unit) {
      const width = Math.max(2, unit * 2.4)
      if (tool === 'pen') return { type: 'pen', points: [start], color, width }
      if (tool === 'mosaic') {
        return {
          type: 'mosaic',
          x1: start.x,
          y1: start.y,
          x2: end.x,
          y2: end.y,
          color,
          width,
          block: Math.max(6, unit * 10),
        }
      }
      return {
        type: tool,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        color,
        width,
      }
    }

    function extendAnnotation(annotation, point) {
      if (annotation.type === 'pen') {
        return { ...annotation, points: [...annotation.points, point] }
      }
      return { ...annotation, x2: point.x, y2: point.y }
    }

    function annotationIsUseful(annotation, unit) {
      if (annotation.type === 'pen') return annotation.points.length > 1
      const dx = Math.abs(annotation.x2 - annotation.x1)
      const dy = Math.abs(annotation.y2 - annotation.y1)
      return dx > Math.max(2, unit * 2) || dy > Math.max(2, unit * 2)
    }

    function drawMosaic(context, image, operation) {
      const x = Math.min(operation.x1, operation.x2)
      const y = Math.min(operation.y1, operation.y2)
      const w = Math.abs(operation.x2 - operation.x1)
      const h = Math.abs(operation.y2 - operation.y1)
      if (w < 1 || h < 1) return
      const block = Math.max(4, operation.block || 12)
      const columns = Math.max(1, Math.floor(w / block))
      const rows = Math.max(1, Math.floor(h / block))
      const temporary = document.createElement('canvas')
      temporary.width = columns
      temporary.height = rows
      const temporaryContext = temporary.getContext('2d')
      if (!temporaryContext) return
      temporaryContext.imageSmoothingEnabled = true
      temporaryContext.drawImage(image, x, y, w, h, 0, 0, columns, rows)
      context.save()
      context.beginPath()
      context.rect(x, y, w, h)
      context.clip()
      context.imageSmoothingEnabled = false
      context.drawImage(temporary, 0, 0, columns, rows, x, y, w, h)
      context.restore()
    }

    function drawAnnotation(context, operation, image) {
      if (!operation) return
      context.save()
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle = operation.color
      context.fillStyle = operation.color
      context.lineWidth = operation.width
      const x1 = operation.x1
      const y1 = operation.y1
      const x2 = operation.x2
      const y2 = operation.y2
      switch (operation.type) {
        case 'rect': {
          context.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1))
          break
        }
        case 'ellipse': {
          const cx = (x1 + x2) / 2
          const cy = (y1 + y2) / 2
          context.beginPath()
          context.ellipse(cx, cy, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2, 0, 0, Math.PI * 2)
          context.stroke()
          break
        }
        case 'arrow': {
          const angle = Math.atan2(y2 - y1, x2 - x1)
          const head = Math.max(8, operation.width * 4)
          context.beginPath()
          context.moveTo(x1, y1)
          context.lineTo(x2, y2)
          context.stroke()
          context.beginPath()
          context.moveTo(x2, y2)
          context.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6))
          context.moveTo(x2, y2)
          context.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6))
          context.stroke()
          break
        }
        case 'pen': {
          if (operation.points.length === 0) break
          context.beginPath()
          context.moveTo(operation.points[0].x, operation.points[0].y)
          for (let index = 1; index < operation.points.length; index += 1) {
            context.lineTo(operation.points[index].x, operation.points[index].y)
          }
          context.stroke()
          break
        }
        case 'mosaic': {
          drawMosaic(context, image, operation)
          break
        }
        case 'text': {
          context.font = `500 ${operation.fontSize}px "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif`
          context.textBaseline = 'top'
          const lines = String(operation.text).split('\n')
          lines.forEach((line, index) => {
            context.fillText(line, operation.x, operation.y + index * operation.fontSize * 1.35)
          })
          break
        }
        default:
          break
      }
      context.restore()
    }

    function paintAnnotations(context, operations, image) {
      for (const operation of operations) drawAnnotation(context, operation, image)
    }

    function drawSelectionBorder(context, rect, unit) {
      const line = Math.max(1, unit * 1.5)
      context.save()
      context.strokeStyle = 'rgba(0,0,0,.55)'
      context.lineWidth = line * 2.4
      context.strokeRect(rect.x, rect.y, rect.w, rect.h)
      context.strokeStyle = '#ffffff'
      context.lineWidth = line
      context.strokeRect(rect.x, rect.y, rect.w, rect.h)
      context.restore()
    }

    function drawSelectionHandles(context, rect, unit) {
      const size = Math.max(6, unit * 8)
      context.save()
      for (const handle of handleList(rect)) {
        context.fillStyle = '#ffffff'
        context.strokeStyle = 'rgba(0,0,0,.6)'
        context.lineWidth = Math.max(1, unit)
        context.beginPath()
        context.rect(handle.x - size / 2, handle.y - size / 2, size, size)
        context.fill()
        context.stroke()
      }
      context.restore()
    }

    function paintScene(canvas, image, selection, draftSelection, operations, draft, unit) {
      const context = canvas.getContext('2d')
      if (!context) return
      const width = image.width
      const height = image.height
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, width, height)
      context.drawImage(image.element, 0, 0, width, height)
      const active = draftSelection || selection
      context.fillStyle = 'rgba(0,0,0,.48)'
      if (!active) {
        context.fillRect(0, 0, width, height)
        return
      }
      context.fillRect(0, 0, width, Math.max(0, active.y))
      context.fillRect(0, active.y + active.h, width, Math.max(0, height - active.y - active.h))
      context.fillRect(0, active.y, Math.max(0, active.x), active.h)
      context.fillRect(active.x + active.w, active.y, Math.max(0, width - active.x - active.w), active.h)
      if (selection) {
        context.save()
        context.beginPath()
        context.rect(selection.x, selection.y, selection.w, selection.h)
        context.clip()
        paintAnnotations(context, operations, image.element)
        if (draft) drawAnnotation(context, draft, image.element)
        context.restore()
      }
      drawSelectionBorder(context, active, unit)
      if (selection && !draftSelection) drawSelectionHandles(context, selection, unit)
    }

    async function exportSelectionBlob(image, selection, operations) {
      const x = clamp(Math.round(selection.x), 0, Math.max(0, image.width - 1))
      const y = clamp(Math.round(selection.y), 0, Math.max(0, image.height - 1))
      const width = Math.max(1, Math.min(Math.round(selection.w), image.width - x))
      const height = Math.max(1, Math.min(Math.round(selection.h), image.height - y))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('a 2D canvas is unavailable')
      context.drawImage(image.element, x, y, width, height, 0, 0, width, height)
      context.save()
      context.beginPath()
      context.rect(0, 0, width, height)
      context.clip()
      context.translate(-x, -y)
      paintAnnotations(context, operations, image.element)
      context.restore()
      return await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('PNG encoding failed'))
        }, 'image/png')
      })
    }

    async function copyBlobToClipboard(blob) {
      const ClipboardItemClass = window.ClipboardItem
      if (!navigator.clipboard || typeof navigator.clipboard.write !== 'function' || typeof ClipboardItemClass !== 'function') {
        throw new Error('image clipboard is unavailable')
      }
      await navigator.clipboard.write([new ClipboardItemClass({ 'image/png': blob })])
    }

    function downloadBlob(blob) {
      const now = new Date()
      const stamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
        '-',
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0'),
      ].join('')
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `screenshot-${stamp}.png`
      anchor.style.display = 'none'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 2000)
    }

    function insertBlobIntoComposer(blob) {
      if (typeof DataTransfer !== 'function' || typeof DragEvent !== 'function') return false
      const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      if (!Array.from(dataTransfer.types).includes('Files')) return false
      dataTransfer.effectAllowed = 'copy'
      const event = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      })
      document.dispatchEvent(event)
      return event.defaultPrevented
    }

    //#endregion
    //#region icons

    function CaptureIcon() {
      return h('svg', {
        viewBox: '0 0 16 16',
        width: 16,
        height: 16,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.35,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      },
      h('path', { d: 'M2.2 5.7V4.1c0-1.05.85-1.9 1.9-1.9h1.6' }),
      h('path', { d: 'M10.3 2.2h1.6c1.05 0 1.9.85 1.9 1.9v1.6' }),
      h('path', { d: 'M13.8 10.3v1.6c0 1.05-.85 1.9-1.9 1.9h-1.6' }),
      h('path', { d: 'M5.7 13.8H4.1c-1.05 0-1.9-.85-1.9-1.9v-1.6' }),
      h('circle', { cx: 8, cy: 8, r: 2.25 }))
    }

    function ChevronIcon() {
      return h('svg', {
        viewBox: '0 0 12 12',
        width: 12,
        height: 12,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      },
      h('path', { d: 'm2.5 4.5 3.5 3.5 3.5-3.5' }))
    }

    function ToolIcon({ name }) {
      const common = {
        viewBox: '0 0 16 16',
        width: 17,
        height: 17,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.35,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      }
      switch (name) {
        case 'rect':
          return h('svg', common, h('rect', { x: 2.6, y: 3.2, width: 10.8, height: 9.6, rx: 1.2 }))
        case 'ellipse':
          return h('svg', common, h('ellipse', { cx: 8, cy: 8, rx: 5.4, ry: 4.4 }))
        case 'arrow':
          return h('svg', common, h('path', { d: 'M3 13 13 3M6.4 3H13v6.6' }))
        case 'pen':
          return h('svg', common, h('path', { d: 'm3 13 .95-3.05L11.2 2.7a1.55 1.55 0 0 1 2.2 2.2l-7.25 7.25L3 13Z' }), h('path', { d: 'm10.4 3.5 2.1 2.1' }))
        case 'mosaic':
          return h('svg', common,
            h('rect', { x: 2.8, y: 2.8, width: 3.2, height: 3.2, rx: .4 }),
            h('rect', { x: 10, y: 2.8, width: 3.2, height: 3.2, rx: .4 }),
            h('rect', { x: 6.4, y: 6.4, width: 3.2, height: 3.2, rx: .4 }),
            h('rect', { x: 2.8, y: 10, width: 3.2, height: 3.2, rx: .4 }),
            h('rect', { x: 10, y: 10, width: 3.2, height: 3.2, rx: .4 }))
        case 'text':
          return h('svg', common, h('path', { d: 'M3.6 3h8.8M8 3v10M6.1 13h3.8' }))
        case 'undo':
          return h('svg', common, h('path', { d: 'M6 4 3 7l3 3M3 7h5.7A4.3 4.3 0 0 1 13 11.3V12' }))
        case 'copy':
          return h('svg', common,
            h('rect', { x: 5.3, y: 5.3, width: 8, height: 8, rx: 1.5 }),
            h('path', { d: 'M3.2 10.2V4.4c0-.7.55-1.25 1.25-1.25h5.8' }))
        case 'save':
          return h('svg', common, h('path', { d: 'M8 2v8M4.8 7.2 8 10.4l3.2-3.2M3 13.4h10' }))
        case 'check':
          return h('svg', { ...common, strokeWidth: 1.8 }, h('path', { d: 'm3.2 8.4 3 3L12.8 4.8' }))
        case 'close':
          return h('svg', common, h('path', { d: 'm4 4 8 8M12 4l-8 8' }))
        case 'warning':
          return h('svg', common,
            h('path', { d: 'M8 2.2 14 13H2L8 2.2Z' }),
            h('path', { d: 'M8 6v3.4M8 11.7v.1' }))
        default:
          return null
      }
    }

    function Spinner() {
      return h('span', { className: 'dsh-wss-spinner', 'aria-hidden': true })
    }

    //#endregion
    //#region components

    function ScreenshotButton({ t }) {
      const tr = useT(t)
      const snapshot = useShotState()
      const busy = snapshot.phase === 'capturing'
      const [menuOpen, setMenuOpen] = useState(false)
      const rootRef = useRef(null)
      const triggerRef = useRef(null)
      const itemRef = useRef(null)

      useEffect(() => {
        if (!menuOpen) return undefined
        const onPointerDown = (event) => {
          if (!(event.target instanceof Node)) return
          if (rootRef.current?.contains(event.target)) return
          setMenuOpen(false)
        }
        const onKeyDown = (event) => {
          if (event.key !== 'Escape') return
          event.preventDefault()
          setMenuOpen(false)
          triggerRef.current?.focus()
        }
        document.addEventListener('pointerdown', onPointerDown, true)
        document.addEventListener('keydown', onKeyDown, true)
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true)
          document.removeEventListener('keydown', onKeyDown, true)
        }
      }, [menuOpen])

      const captureWithoutHiding = () => {
        setMenuOpen(false)
        void beginCapture(false)
      }

      return h('span', {
        ref: rootRef,
        className: 'dsh-wss-split',
        'data-open': menuOpen ? 'true' : undefined,
      },
      h('button', {
        type: 'button',
        className: 'dsh-wss-main',
        title: busy ? tr('button.busy') : tr('button.title'),
        'aria-label': busy ? tr('button.busy') : tr('button.title'),
        'aria-busy': busy ? 'true' : undefined,
        disabled: busy,
        'data-testid': 'wechat-screenshot-button',
        onMouseDown: (event) => event.preventDefault(),
        onClick: () => {
          setMenuOpen(false)
          void beginCapture(true)
        },
      }, busy ? h(Spinner) : h(CaptureIcon)),
      h('button', {
        ref: triggerRef,
        type: 'button',
        className: 'dsh-wss-chevron',
        title: tr('menu.label'),
        'aria-label': tr('menu.label'),
        'aria-haspopup': 'menu',
        'aria-expanded': menuOpen ? 'true' : 'false',
        'aria-controls': 'dsh-wss-menu',
        disabled: busy,
        'data-testid': 'wechat-screenshot-menu-trigger',
        onMouseDown: (event) => event.preventDefault(),
        onClick: () => setMenuOpen((open) => !open),
        onKeyDown: (event) => {
          if (event.key !== 'ArrowDown') return
          event.preventDefault()
          setMenuOpen(true)
          requestAnimationFrame(() => itemRef.current?.focus())
        },
      }, h(ChevronIcon)),
      menuOpen && h('span', {
        id: 'dsh-wss-menu',
        className: 'dsh-wss-menu',
        role: 'menu',
        'aria-label': tr('menu.label'),
      },
      h('button', {
        ref: itemRef,
        type: 'button',
        role: 'menuitem',
        className: 'dsh-wss-menu-item',
        'data-testid': 'wechat-screenshot-no-hide',
        onMouseDown: (event) => event.preventDefault(),
        onClick: captureWithoutHiding,
      }, tr('menu.noHide'))))
    }

    function ScreenshotOverlay({ t }) {
      const tr = useT(t)
      const snapshot = useShotState()
      useEffect(() => {
        if (!snapshot.open) return undefined
        const onKeyDown = (event) => {
          if (event.key !== 'Escape' || snapshot.phase !== 'error') return
          event.preventDefault()
          event.stopPropagation()
          closeCapture()
        }
        window.addEventListener('keydown', onKeyDown, true)
        return () => window.removeEventListener('keydown', onKeyDown, true)
      }, [snapshot.open, snapshot.phase])
      if (!snapshot.open) return null
      if (snapshot.phase === 'error') {
        return h(ErrorScreen, {
          t: tr,
          error: snapshot.error,
          detail: snapshot.detail,
          onRetry: () => {
            void beginCapture()
          },
          onClose: closeCapture,
        })
      }
      if (snapshot.phase === 'ready' && snapshot.image) {
        return h(CaptureWorkspace, {
          key: snapshot.image.url,
          image: snapshot.image,
          t: tr,
          onClose: closeCapture,
        })
      }
      return null
    }

    function ErrorScreen({ t, error, detail, onRetry, onClose }) {
      const message = error === 'unsupported' ? t('error.unsupported') : t('error.capture')
      const shortDetail = typeof detail === 'string' ? detail.slice(0, 400) : ''
      return h('div', {
        className: 'dsh-wss-overlay',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': t('dialog.label'),
      },
      h('div', { className: 'dsh-wss-error-card' },
        h('div', { className: 'dsh-wss-error-icon' }, h('svg', {
          viewBox: '0 0 16 16',
          width: 20,
          height: 20,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          'aria-hidden': true,
        }, h('path', { d: 'M8 5.4v3.2M8 11.2v.1' }), h('circle', { cx: 8, cy: 8, r: 6 }))),
        h('h2', null, t('error.title')),
        h('p', null, message),
        shortDetail ? h('div', { className: 'dsh-wss-error-detail' }, `${t('error.detail')}: ${shortDetail}`) : null,
        h('div', { className: 'dsh-wss-error-actions' },
          h('button', { type: 'button', className: 'is-secondary', onClick: onClose }, t('error.close')),
          h('button', { type: 'button', className: 'is-primary', onClick: onRetry }, t('error.retry')))))
    }

    function CaptureWorkspace({ image, t, onClose }) {
      const rootRef = useRef(null)
      const canvasRef = useRef(null)
      const [view, setView] = useState(null)
      const [selection, setSelection] = useState(null)
      const [draftSelection, setDraftSelection] = useState(null)
      const [operations, setOperations] = useState([])
      const operationsRef = useRef([])
      const [draftOperation, setDraftOperation] = useState(null)
      const draftOperationRef = useRef(null)
      const draftSelectionRef = useRef(null)
      const dragRef = useRef(null)
      const [tool, setTool] = useState('rect')
      const [color, setColor] = useState(COLORS[0].value)
      const [textEditor, setTextEditor] = useState(null)
      const textEditorRef = useRef(null)
      const [status, setStatus] = useState(null)
      const statusTimer = useRef(null)
      const [busy, setBusy] = useState(null)
      const busyRef = useRef(null)

      const unit = view && view.width > 0 ? image.width / view.width : 1
      const label = selection ? `${Math.round(selection.w)} × ${Math.round(selection.h)}` : ''

      function setDraftAnnotation(next) {
        const value = typeof next === 'function' ? next(draftOperationRef.current) : next
        draftOperationRef.current = value
        setDraftOperation(value)
      }

      function setDraftRect(next) {
        const value = typeof next === 'function' ? next(draftSelectionRef.current) : next
        draftSelectionRef.current = value
        setDraftSelection(value)
      }

      function changeOperations(next) {
        const value = typeof next === 'function' ? next(operationsRef.current) : next
        operationsRef.current = value
        setOperations(value)
      }

      function showStatus(message) {
        if (statusTimer.current !== null) window.clearTimeout(statusTimer.current)
        setStatus(message)
        statusTimer.current = window.setTimeout(() => {
          statusTimer.current = null
          setStatus(null)
        }, 2400)
      }

      function commitText(inputEditor) {
        const editor = inputEditor || textEditorRef.current
        if (!editor) return
        textEditorRef.current = null
        setTextEditor(null)
        const value = String(editor.value || '').trim()
        if (!value) return
        changeOperations((previous) => [...previous, {
          type: 'text',
          x: editor.x,
          y: editor.y,
          text: value,
          color: editor.color,
          fontSize: editor.fontSize,
        }])
      }

      function cancelText() {
        textEditorRef.current = null
        setTextEditor(null)
      }

      function updateText(value) {
        const current = textEditorRef.current
        if (!current) return
        const next = { ...current, value }
        textEditorRef.current = next
        setTextEditor(next)
      }

      function openText(point) {
        const editor = {
          x: point.x,
          y: point.y,
          value: '',
          color,
          fontSize: clamp(Math.round(16 * unit), 12, 64),
        }
        textEditorRef.current = editor
        setTextEditor(editor)
      }

      function pointFromEvent(event) {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        return {
          x: clamp((event.clientX - rect.left) / Math.max(1, rect.width) * image.width, 0, image.width),
          y: clamp((event.clientY - rect.top) / Math.max(1, rect.height) * image.height, 0, image.height),
        }
      }

      function updateCursor(point) {
        const canvas = canvasRef.current
        if (!canvas) return
        let cursor = 'crosshair'
        if (selection) {
          const handle = handleAt(point, selection, 11 * unit)
          if (handle) cursor = CURSORS[handle.dir] || cursor
          else if (pointInRect(point, selection)) cursor = tool === 'text' ? 'text' : 'crosshair'
        }
        canvas.style.cursor = cursor
      }

      function onPointerDown(event) {
        if (event.button !== 0) return
        event.preventDefault()
        if (textEditorRef.current) commitText(textEditorRef.current)
        rootRef.current?.focus()
        const canvas = canvasRef.current
        if (!canvas) return
        const point = pointFromEvent(event)
        canvas.setPointerCapture?.(event.pointerId)
        if (selection) {
          const handle = handleAt(point, selection, 11 * unit)
          if (handle) {
            dragRef.current = {
              mode: 'resize',
              direction: handle.dir,
              start: point,
              origin: { ...selection },
            }
            return
          }
          if (pointInRect(point, selection)) {
            if (tool === 'text') {
              openText(point)
              dragRef.current = null
              return
            }
            const start = clampPointToRect(point, selection)
            dragRef.current = { mode: 'draw', start, clip: { ...selection } }
            setDraftAnnotation(makeAnnotation(tool, start, start, color, unit))
            return
          }
          changeOperations([])
          setSelection(null)
          setDraftAnnotation(null)
          dragRef.current = { mode: 'select', start: point }
          setDraftRect(normalizeRect(point, point))
          return
        }
        dragRef.current = { mode: 'select', start: point }
        setDraftRect(normalizeRect(point, point))
      }

      function onPointerMove(event) {
        const point = pointFromEvent(event)
        const drag = dragRef.current
        if (!drag) {
          updateCursor(point)
          return
        }
        if (drag.mode === 'select') {
          setDraftRect(normalizeRect(drag.start, point))
          return
        }
        if (drag.mode === 'resize') {
          setSelection(resizeRect(
            drag.origin,
            drag.direction,
            point,
            image.width,
            image.height,
            Math.max(4, 8 * unit),
          ))
          return
        }
        if (drag.mode === 'draw') {
          const next = clampPointToRect(point, drag.clip)
          setDraftAnnotation((previous) => previous ? extendAnnotation(previous, next) : previous)
        }
      }

      function onPointerUp(event) {
        const drag = dragRef.current
        if (!drag) return
        const point = pointFromEvent(event)
        if (drag.mode === 'select') {
          const rect = normalizeRect(drag.start, point)
          if (rect.w >= 8 * unit && rect.h >= 8 * unit) {
            setSelection(rect)
          } else if (!selection) {
            setSelection(null)
          }
          setDraftRect(null)
        } else if (drag.mode === 'draw') {
          const current = draftOperationRef.current
          if (current && annotationIsUseful(current, unit)) {
            changeOperations((previous) => [...previous, current])
          }
          setDraftAnnotation(null)
        }
        dragRef.current = null
        updateCursor(point)
      }

      function onPointerCancel() {
        dragRef.current = null
        setDraftAnnotation(null)
        setDraftRect(null)
      }

      function onDoubleClick(event) {
        if (!selection || busy) return
        if (pointInRect(pointFromEvent(event), selection)) void copySelection()
      }

      function selectTool(nextTool) {
        if (nextTool !== 'text' && textEditorRef.current) commitText(textEditorRef.current)
        setTool(nextTool)
      }

      async function copySelection() {
        if (!selection || busyRef.current) return
        if (textEditorRef.current) commitText(textEditorRef.current)
        busyRef.current = 'copy'
        setBusy('copy')
        try {
          const blob = await exportSelectionBlob(image, selection, operationsRef.current)
          await copyBlobToClipboard(blob)
          onClose()
        } catch {
          showStatus(t('error.copy'))
          busyRef.current = null
          setBusy(null)
        }
      }

      async function saveSelection() {
        if (!selection || busyRef.current) return
        if (textEditorRef.current) commitText(textEditorRef.current)
        busyRef.current = 'save'
        setBusy('save')
        try {
          const blob = await exportSelectionBlob(image, selection, operationsRef.current)
          downloadBlob(blob)
          onClose()
        } catch {
          showStatus(t('error.save'))
          busyRef.current = null
          setBusy(null)
        }
      }

      async function insertSelection() {
        if (!selection || busyRef.current) return
        if (textEditorRef.current) commitText(textEditorRef.current)
        busyRef.current = 'insert'
        setBusy('insert')
        try {
          const blob = await exportSelectionBlob(image, selection, operationsRef.current)
          if (!insertBlobIntoComposer(blob)) {
            showStatus(t('error.insert'))
            busyRef.current = null
            setBusy(null)
            return
          }
          onClose()
        } catch {
          showStatus(t('error.insert'))
          busyRef.current = null
          setBusy(null)
        }
      }

      useLayoutEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return undefined
        const measure = () => {
          const rect = canvas.getBoundingClientRect()
          setView((previous) => {
            if (previous
              && Math.abs(previous.left - rect.left) < 0.5
              && Math.abs(previous.top - rect.top) < 0.5
              && Math.abs(previous.width - rect.width) < 0.5
              && Math.abs(previous.height - rect.height) < 0.5) {
              return previous
            }
            return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
          })
        }
        measure()
        const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null
        observer?.observe(canvas)
        window.addEventListener('resize', measure)
        return () => {
          observer?.disconnect()
          window.removeEventListener('resize', measure)
        }
      }, [image.url])

      useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        paintScene(canvas, image, selection, draftSelection, operations, draftOperation, unit)
      }, [image, selection, draftSelection, operations, draftOperation, unit])

      useEffect(() => {
        rootRef.current?.focus()
      }, [])

      useEffect(() => () => {
        if (statusTimer.current !== null) window.clearTimeout(statusTimer.current)
      }, [])

      useEffect(() => {
        const onKeyDown = (event) => {
          const target = event.target
          const inTextField = target instanceof HTMLElement
            && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            if (textEditorRef.current) cancelText()
            else onClose()
            return
          }
          if (inTextField) return
          if ((event.ctrlKey || event.metaKey) && !event.altKey) {
            const key = event.key.toLowerCase()
            if (key === 'z') {
              event.preventDefault()
              event.stopPropagation()
              changeOperations((previous) => previous.slice(0, -1))
              return
            }
            if (key === 'c' && selection) {
              event.preventDefault()
              event.stopPropagation()
              void copySelection()
              return
            }
            if (key === 's' && selection) {
              event.preventDefault()
              event.stopPropagation()
              void saveSelection()
              return
            }
          }
          event.stopPropagation()
        }
        window.addEventListener('keydown', onKeyDown, true)
        return () => window.removeEventListener('keydown', onKeyDown, true)
      }, [selection, operations, busy, onClose]) // eslint-disable-line react-hooks/exhaustive-deps

      const sizeStyle = (() => {
        if (!selection || !view) return null
        const left = view.left + selection.x / image.width * view.width
        const top = view.top + selection.y / image.height * view.height
        return {
          left: `${clamp(left, 8, Math.max(8, window.innerWidth - 130))}px`,
          top: `${top >= 36 ? top - 27 : Math.min(top + 6, window.innerHeight - 34)}px`,
        }
      })()

      const textStyle = (() => {
        if (!textEditor || !view) return null
        const left = view.left + textEditor.x / image.width * view.width
        const top = view.top + textEditor.y / image.height * view.height
        return {
          left: `${clamp(left, 8, Math.max(8, window.innerWidth - 214))}px`,
          top: `${clamp(top, 8, Math.max(8, window.innerHeight - 38))}px`,
          color: textEditor.color,
        }
      })()

      const hasSelection = selection !== null
      return h('div', {
        ref: rootRef,
        className: 'dsh-wss-overlay',
        role: 'application',
        'aria-label': t('dialog.label'),
        tabIndex: -1,
      },
      h('canvas', {
        ref: canvasRef,
        className: 'dsh-wss-canvas',
        width: image.width,
        height: image.height,
        role: 'img',
        'aria-label': t('canvas.label'),
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onDoubleClick,
      }),
      h('div', { className: 'dsh-wss-hint' }, hasSelection ? t('hint.annotate') : t('hint.select')),
      hasSelection ? null : h('button', {
        type: 'button',
        className: 'dsh-wss-close',
        title: t('action.close'),
        'aria-label': t('action.close'),
        onClick: onClose,
      }, h(ToolIcon, { name: 'close' })),
      hasSelection && sizeStyle ? h('div', { className: 'dsh-wss-size', style: sizeStyle }, label) : null,
      hasSelection ? h('div', {
        className: 'dsh-wss-toolbar',
        role: 'toolbar',
        'aria-label': t('toolbar.label'),
      },
      COLORS.map((entry) => h('button', {
        key: entry.id,
        type: 'button',
        className: `dsh-wss-swatch${color === entry.value ? ' is-active' : ''}`,
        title: t(entry.label),
        'aria-label': t(entry.label),
        'aria-pressed': color === entry.value ? 'true' : 'false',
        onClick: () => setColor(entry.value),
      }, h('span', { style: { background: entry.value } }))),
      h('span', { className: 'dsh-wss-divider', 'aria-hidden': true }),
      TOOLS.map((entry) => h('button', {
        key: entry.id,
        type: 'button',
        className: `dsh-wss-tool${tool === entry.id ? ' is-active' : ''}`,
        title: t(entry.label),
        'aria-label': t(entry.label),
        'aria-pressed': tool === entry.id ? 'true' : 'false',
        onClick: () => selectTool(entry.id),
      }, h(ToolIcon, { name: entry.id }))),
      h('span', { className: 'dsh-wss-divider', 'aria-hidden': true }),
      h('button', {
        type: 'button',
        className: 'dsh-wss-tool',
        title: t('action.undo'),
        'aria-label': t('action.undo'),
        disabled: operations.length === 0,
        onClick: () => changeOperations((previous) => previous.slice(0, -1)),
      }, h(ToolIcon, { name: 'undo' })),
      h('button', {
        type: 'button',
        className: 'dsh-wss-tool',
        title: t('action.copy'),
        'aria-label': t('action.copy'),
        disabled: !hasSelection || busy !== null,
        onClick: () => {
          void copySelection()
        },
      }, h(ToolIcon, { name: 'copy' })),
      h('button', {
        type: 'button',
        className: 'dsh-wss-tool',
        title: t('action.save'),
        'aria-label': t('action.save'),
        disabled: !hasSelection || busy !== null,
        onClick: () => {
          void saveSelection()
        },
      }, h(ToolIcon, { name: 'save' })),
      h('button', {
        type: 'button',
        className: 'dsh-wss-tool',
        title: t('action.close'),
        'aria-label': t('action.close'),
        onClick: onClose,
      }, h(ToolIcon, { name: 'close' })),
      h('button', {
        type: 'button',
        className: 'dsh-wss-tool dsh-wss-confirm',
        title: t('action.insert'),
        'aria-label': t('action.insert'),
        'data-testid': 'wechat-screenshot-insert',
        disabled: !hasSelection || busy !== null,
        onClick: () => {
          void insertSelection()
        },
      }, busy === 'insert' ? h(Spinner) : h(ToolIcon, { name: 'check' }))) : null,
      textEditor && textStyle ? h('input', {
        className: 'dsh-wss-text',
        style: textStyle,
        value: textEditor.value,
        placeholder: t('text.placeholder'),
        autoFocus: true,
        spellCheck: false,
        maxLength: 200,
        'aria-label': t('tool.text'),
        onChange: (event) => updateText(event.target.value),
        onBlur: () => commitText(textEditorRef.current),
        onKeyDown: (event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            event.stopPropagation()
            commitText(textEditorRef.current)
          } else if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            cancelText()
          }
        },
      }) : null,
      status ? h('div', { className: 'dsh-wss-toast', role: 'status' }, status) : null)
    }

    //#endregion

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.plugin = '@local/dsh-wechat-screenshot'
          style.textContent = CSS
          document.head.appendChild(style)
          return () => style.remove()
        }, 'wechat-screenshot.styles')

        ctx.effect(() => {
          const english = ctx.locale.register(NS, 'en', DICTS.en)
          const chinese = ctx.locale.register(NS, 'zh', DICTS.zh)
          return () => {
            chinese()
            english()
          }
        }, 'wechat-screenshot.locales')

        ctx.effect(() => () => {
          generation += 1
          releaseCurrentImage()
          state = initialState()
        }, 'wechat-screenshot.capture-state')

        ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
          name: 'conversation.input.left',
          id: 'wechat-screenshot',
          order: 30,
          locale: NS,
        }, ScreenshotButton))

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'wechat-screenshot-overlay',
          order: 1000,
          locale: NS,
        }, ScreenshotOverlay))
      },
    }
  },
})
