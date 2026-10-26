# GitHub Pages 上线记录

- 日期：2026-10-26。
- 仓库：https://github.com/zhudate/xxykp
- 游戏：https://zhudate.github.io/xxykp/
- 用户明确同意将新仓库从私有改为公开，以使用当前账号的免费 GitHub Pages。
- 已上传源码、素材和发布流程；本地 `main` 跟踪远程 `origin/main`。
- 已启用 Pages 的 GitHub Actions 发布方式。构建任务具有 `pages: read`，部署任务具有 `pages: write` 和 `id-token: write`。
- 已发布的游戏提交：`e6b0c9db2a431202e3e3faef188ed68459aa060c`。
- 成功的构建与发布记录：https://github.com/zhudate/xxykp/actions/runs/40351345759
- 线上打包包含 2176 个文件、556 组骨骼资源，约 40.8 MB。构建时的相对路径、大小写精确资源引用检查通过。

公网检查：入口页面、`src/app.js`、`style.css`、`assets/spine/manifest.json`、暴击数字图集和 `vendor/spine.js` 均返回 HTTP 200，并具有正确的 HTML / JavaScript / CSS / JSON / 图片响应类型。应用内浏览器已显示线上游戏画面、默认营地与角色。当前网络的网页检查较慢，尚未完成大陆三网测速。

发布没有修改本地 `127.0.0.1:4178` 地址下的存档。线上域名有独立浏览器存档，需要旧进度时从本地设置中导出后，在公网版本导入。

后续：修改游戏并推送到 `main` 会触发自动构建与发布。只更新说明文档可在提交信息使用 `[skip ci]`，避免重复发布相同游戏资源。
