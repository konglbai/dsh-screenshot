# 微信截图 / WeChat Screenshot

<p align="center">
  <img src="icon.svg" width="96" alt="WeChat Screenshot icon">
</p>

<p align="center">
  为 DeepSeek Harness 桌面端打造的微信风格截图插件。
</p>

在输入框左下角加入一个分体式截图按钮：点击左侧图标，先隐藏 DSH 窗口再截图；点击右侧箭头，可以选择“不隐藏当前界面”直接截图。截图后可在全屏编辑器中框选、标注，并把结果直接插入当前对话框。

- 插件包名：`@local/dsh-wechat-screenshot`
- Bundle 入口 id：`wechat-screenshot`
- 当前版本：`1.0.0`
- 平台：Windows（DeepSeek Harness Desktop / Electron）

---

## 功能

### 截图入口

- **主按钮**：先最小化当前 DSH 窗口，等待桌面刷新后截取整个虚拟屏幕，再自动恢复窗口。
- **右侧箭头菜单**：选择“不隐藏当前界面”，立即在当前界面上开始截图。
- 两个动作互不影响，不会保存“隐藏/不隐藏”的持久偏好。

### 截图编辑器

- 拖动鼠标框选任意区域。
- 八个控制点调整选区大小和位置。
- 标注工具：
  - 矩形
  - 椭圆
  - 箭头
  - 画笔
  - 马赛克
  - 文字
- 六种标注颜色：红、橙、绿、蓝、白、黑。
- 撤销上一步标注。
- 复制选区到剪贴板。
- 保存选区为 PNG 文件。
- 将选区连同标注直接插入当前 DSH 对话框。
- 双击选区可快速复制。
- `Esc` 取消截图。

### 快捷键

| 快捷键 | 作用 |
| --- | --- |
| `Ctrl+C` | 复制选区到剪贴板 |
| `Ctrl+S` | 保存选区为 PNG |
| `Ctrl+Z` | 撤销上一步标注 |
| `Esc` | 关闭编辑器 / 取消截图 |

> macOS 上如使用对应按键，可将 `Ctrl` 理解为 `Command`；当前主要面向 Windows。

---

## 环境要求

- **DeepSeek Harness Desktop**，Web GUI 由 Electron 渲染。
- **Windows**：Host 端截图使用 PowerShell + `System.Drawing`，并调用 Win32 API 处理窗口最小化/恢复。
- 需要允许 DSH 访问本机回环地址（`127.0.0.1` / `::1`）。
- 不需要 Node.js 构建步骤；插件以源码形式加载。

在非 Electron 环境，或 Host 截图路由不可用时，客户端会回退到浏览器的 `getDisplayMedia` 屏幕捕获，需要用户授权选择屏幕/窗口。

---

## 安装

### 方式一：DSH 插件管理（推荐）

1. 将本目录放到 DSH 工作区的插件目录，例如：

   ```text
   <DSH workspace>/.dsh-plugins/dsh-wechat-screenshot
   ```

2. 打开 DSH 的插件管理，选择安装本地 bundle，路径指向：

   ```text
   <DSH workspace>/.dsh-plugins/dsh-wechat-screenshot
   ```

3. 确认插件 `微信截图` 已启用。
4. 刷新一次 Web GUI 页面。
5. 如果按钮仍未出现，完全退出并重新启动 DSH Desktop，让 Host 端代码重新加载。

### 方式二：手动登记 bundle

插件通过根目录的 `cordis.patch.yml` 注册到 DSH：

```yaml
- insert:
    - id: wechat-screenshot
      name: '@local/dsh-wechat-screenshot'
```

将本目录加入 DSH 的本地 bundle 列表，并确保依赖使用本地链接即可。通常不需要手动修改 DSH 安装目录。

安装后，输入框左侧应出现截图图标和一个小箭头。

---

## 使用

### 1. 截图

- **隐藏 DSH 后截图**：点击左侧截图图标。
  - Host 会检测当前前台窗口是否属于 DSH。
  - 如果是，则最小化窗口，等待约 320ms，截取整个虚拟桌面，然后恢复窗口。
  - 如果不是 DSH 前台窗口，则直接截图，不会误最小化其他应用。
- **不隐藏当前界面**：点击右侧箭头，选择“不隐藏当前界面”。

### 2. 框选与标注

1. 在截图上拖动鼠标，画出要保留的区域。
2. 拖动选区边缘或八个控制点调整范围。
3. 在底部工具栏选择标注工具和颜色。
4. 在选区内绘制标注；文字工具会弹出输入框，确认后写入。
5. 可使用撤销、复制、保存。

### 3. 插入对话框

点击工具栏最右侧的“√”：

1. 将当前选区与所有标注导出为 PNG。
2. 包装成图片文件，交给 DSH 的附件上传流程。
3. 插入成功后自动关闭截图编辑器。
4. 如果插入失败，编辑器保持打开，并提示改用“复制”或“保存”。

“√”位于“×”的右侧，是工具栏最右边的按钮。

---

## 实现说明

### Host 端（`index.js`）

- 注册精确路由：

  ```text
  /api/dsh-wechat-screenshot/capture
  ```

- 使用 `ctx.inject(['webServer'], ...)` 等待 Web Server 服务就绪后再注册路由，避免服务尚未创建时路由丢失。
- 请求必须满足：
  - 方法为 `GET`
  - 请求头包含 `x-dsh-screenshot: 1`
  - 来源地址为本机回环地址
- 返回 `image/png`，并设置 `cache-control: no-store` 与 `x-content-type-options: nosniff`。
- 通过 PowerShell 的 `System.Drawing` 截取 `SystemInformation.VirtualScreen`，支持多显示器与 DPI 感知。
- 截图先写入临时 PNG，校验 PNG 文件头与大小后读入内存，并在 `finally` 中删除临时文件。
- `?hide=1` 时：
  - 获取前台窗口，判断其进程名是否为 `DeepSeek*`，或窗口标题是否包含 `DeepSeek Harness`。
  - 排除 DevTools 窗口。
  - 记录窗口是否最大化，调用 `ShowWindow(hwnd, SW_MINIMIZE)`。
  - 截图完成后在 `finally` 中恢复窗口；若原本最大化，则再次最大化。
- 选择最小化而不是 `SW_HIDE`，是为了在 PowerShell 异常退出时仍能从任务栏找回窗口。
- 同一时刻的截图请求会按“隐藏/不隐藏”模式分别合并，避免重复截屏。

### Client 端（`client.js`）

- 在 `conversation.input.left` 注册分体式截图控件。
- 在 `shell.overlay` 注册全屏编辑器。
- 菜单使用与 DSH 一致的视觉变量：
  - `--dsw-specific-menu`
  - `--dsw-radius-lg`
  - `--dsw-elevation-prominent`
  - `--dsw-alias-interactive-bg-hover`
- “√”插入不直接调用 DSH 内部附件 API，而是：
  1. 把 PNG 包装成 `File`；
  2. 放入 `DataTransfer`；
  3. 构造 `DragEvent('drop')`；
  4. 派发到页面；
  5. 复用 DSH 附件组件已有的 document 级拖放监听。
- 这样不会额外占用 `conversation.input.attachments` 这个单槽。
- 截图只存在于当前页面内存中；关闭编辑器或卸载插件时会释放对象 URL。

### 安全与隐私

- 截图不会上传到任何第三方服务器。
- Host 路由只监听本机回环地址，并要求自定义请求头，降低被局域网页面调用的风险。
- 复制操作只在用户点击“复制”或按下快捷键时写入剪贴板。
- Host 临时 PNG 在读取后立即删除。
- 插件不包含统计、埋点或远程配置。

---

## 开发与校验

```bash
npm run check
```

等价于：

```bash
node --check index.js
node --check client.js
```

检查语言包：

```bash
node -e "for (const f of ['locale/en.json','locale/zh.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('locale ok')"
```

本项目没有打包步骤。`client.js` 使用 DSH 的 Client Module Loader 和 `React.createElement`，不需要 JSX 或额外构建工具。

修改客户端后：

1. 刷新 Web GUI 页面。
2. 如果修改了 Host 端 `index.js`，需要重启 DSH Desktop。
3. 确认插件仍处于启用状态。

---

## 目录结构

```text
.
├── index.js                 # Host：截图路由、窗口隐藏/恢复
├── client.js                # Client：按钮、编辑器、标注、插入
├── cordis.patch.yml         # DSH bundle 注册
├── locale/
│   ├── en.json              # 英文元数据
│   └── zh.json              # 中文元数据
├── icon.svg                 # 插件图标
├── package.json             # 包信息与检查脚本
├── CHANGELOG.md             # 版本记录
├── .gitattributes
├── .gitignore
└── README.md
```

---

## 常见问题

### 输入框左侧没有截图按钮

- 确认插件已在 DSH 插件管理中启用。
- 刷新 Web GUI 页面。
- 如果仍未出现，重启 DSH Desktop。
- 检查插件是否因客户端异常被回滚；可查看 DSH 日志中是否有 `wechat-screenshot` 相关错误。

### 点击截图没有反应，或网络请求返回 401

- 确认 Host 端已重启，且 `index.js` 的路由已注册。
- 该路由必须带 `x-dsh-screenshot: 1`，并且只能从本机回环地址访问。
- 如果日志出现 `[wechat-screenshot]` 错误，请根据错误信息检查 Web Server 服务是否已就绪。
- 旧版本曾在 `webServer` 尚未创建时就注册路由，导致请求落到 `/api` 的鉴权层并返回 401；当前版本已改为 `ctx.inject(['webServer'])`。

### 截图是黑屏、空白或只截到部分屏幕

- 确认没有停留在 UAC 安全桌面、锁屏或受 DRM 保护的窗口。
- 多显示器环境下会截取整个虚拟屏幕，选区默认覆盖全部屏幕。
- 如果 DSH 窗口被最小化，隐藏模式会先恢复再截取。

### “隐藏界面”没有生效

- Host 只会在前台窗口属于 DSH 时执行最小化。
- 判断依据是进程名 `DeepSeek*` 或窗口标题包含 `DeepSeek Harness`。
- 如果窗口标题被自定义修改，可能无法识别；此时可改用“不隐藏当前界面”。

### “√”插入失败

- 该功能依赖 DSH 附件组件当前的 document 级拖放监听。
- 如果 DSH 升级后修改了附件实现，插入可能失效；请先使用“复制”或“保存”。
- 插入失败时编辑器不会关闭，方便重试或改用其他方式。

### 复制/保存没有反应

- 浏览器或 Electron 可能因权限策略拒绝剪贴板写入。
- 可改用“保存”下载 PNG，或检查系统剪贴板权限。

---

## 版本记录

见 [CHANGELOG.md](CHANGELOG.md)。

## License

未指定。如需开源发布，请补充 `LICENSE` 文件。
