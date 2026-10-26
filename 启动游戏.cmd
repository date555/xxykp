@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 向咸鱼开炮
echo 启动后打开浏览器访问 http://127.0.0.1:4178
echo 关闭此窗口会停止本地游戏服务。
node server.mjs
pause
