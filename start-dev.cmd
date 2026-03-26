@echo off
set "NODE_DIR=D:\Claude\to-do_APP\node-portable\node-v20.15.0-win-x64"
set "PATH=%NODE_DIR%;%PATH%"
cd /d "D:\Claude\to-do_APP"
"%NODE_DIR%\node.exe" "%NODE_DIR%\node_modules\npm\bin\npm-cli.js" run dev
