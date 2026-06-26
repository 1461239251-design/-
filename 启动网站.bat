@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ╔════════════════════════════════╗
echo ║   陈泽均 · 剪辑师作品集      ║
echo ╚════════════════════════════════╝
echo.
echo 正在启动网站...
echo 网站将在浏览器自动打开：http://localhost:4173
echo 按 Ctrl+C 可关闭服务器
echo.
npx vite preview --host 0.0.0.0 --port 4173 --open
pause
