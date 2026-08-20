@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================
REM  零跑AI助手 - 一键更新工具 (Windows)
REM ============================================================
REM  使用方法：
REM    双击此 .bat 文件即可运行
REM    首次运行会要求粘贴 extension 文件夹路径
REM    之后每次双击都会自动检查并更新到 GitHub 最新版本
REM  原理：
REM    - 调用 GitHub API 获取最新 release
REM    - 对比本地 manifest.json 版本号
REM    - 下载 zip 并解压覆盖到 extension 目录
REM    - 提示到 chrome://extensions 点刷新按钮
REM ============================================================

set "REPO=905442346-art/leapmotor-ai-assistant"
set "CONFIG_DIR=%USERPROFILE%\.leapmotor-ai-assistant"
set "PATH_FILE=%CONFIG_DIR%\extension-path.txt"

echo.
echo ============================================================
echo   零跑AI助手 - 一键更新工具 (Windows)
echo ============================================================
echo.

REM ====== 步骤1：定位本地 extension 目录 ======
set "EXTENSION_DIR="

if exist "%PATH_FILE%" (
    for /f "usebackq delims=" %%a in ("%PATH_FILE%") do set "EXTENSION_DIR=%%a"
    if exist "!EXTENSION_DIR!\manifest.json" (
        echo [OK] 已读取上次配置的路径:
        echo    !EXTENSION_DIR!
    ) else (
        echo [WARN] 保存的路径已失效: !EXTENSION_DIR!
        set "EXTENSION_DIR="
    )
)

if "!EXTENSION_DIR!"=="" (
    echo.
    echo 首次使用，需要指定本地的 extension 文件夹位置
    echo 操作步骤:
    echo   1. 打开文件资源管理器，找到 extension 文件夹^(包含 manifest.json^)
    echo   2. 在地址栏复制该文件夹路径^(如 C:\Users\xxx\extension^)
    echo   3. 粘贴到下方按回车
    echo.
    set /p "EXTENSION_DIR=请粘贴 extension 文件夹路径: "

    REM 去掉可能存在的首尾引号
    set "EXTENSION_DIR=!EXTENSION_DIR:"=!"

    if not exist "!EXTENSION_DIR!\manifest.json" (
        echo.
        echo [ERROR] 路径无效或找不到 manifest.json: !EXTENSION_DIR!
        echo 请重新双击运行本文件
        echo.
        pause
        exit /b 1
    )

    if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"
    > "%PATH_FILE%" echo !EXTENSION_DIR!
    echo [OK] 已保存路径到: %PATH_FILE%
    echo     下次双击将自动使用此路径
    echo.
)

REM ====== 步骤2：读取本地版本号（用 PowerShell 解析 JSON）======
for /f "usebackq delims=" %%v in (`powershell -NoProfile -Command "(Get-Content '!EXTENSION_DIR!\manifest.json' -Raw | ConvertFrom-Json).version"`) do set "LOCAL_VERSION=%%v"
echo [OK] 当前本地版本: v%LOCAL_VERSION%

REM ====== 步骤3：调用 GitHub API 获取最新版本 ======
echo.
echo ============================================================
echo   查询 GitHub 最新版本
echo ============================================================

REM 用 PowerShell 调用 API（比 curl 更稳定，返回 TAG 和 ZIP_URL）
for /f "usebackq delims=" %%r in (`powershell -NoProfile -Command "$r = Invoke-RestMethod -Uri 'https://api.github.com/repos/%REPO%/releases/latest' -TimeoutSec 15; Write-Output ($r.tag_name + '|' + ($r.assets | Where-Object {$_.name -like '*.zip'} | Select-Object -First 1).browser_download_url)"`) do set "API_RESULT=%%r"

if "!API_RESULT!"=="" (
    echo [ERROR] 无法访问 GitHub API，请检查网络后重试
    echo.
    pause
    exit /b 1
)

REM 解析 API_RESULT: TAG|ZIP_URL
for /f "tokens=1,2 delims=|" %%a in ("!API_RESULT!") do (
    set "LATEST_TAG=%%a"
    set "ZIP_URL=%%b"
)
REM 去掉 tag 前的 v
set "LATEST_VERSION=!LATEST_TAG:v=!"

echo   GitHub 最新版本: v%LATEST_VERSION%
echo   下载地址: !ZIP_URL!

REM ====== 步骤4：版本对比 ======
if "%LOCAL_VERSION%"=="%LATEST_VERSION%" (
    echo.
    echo ============================================================
    echo   已是最新版本
    echo ============================================================
    echo [OK] 本地版本 v%LOCAL_VERSION% 已是 GitHub 最新版
    echo [TIP] 如需重新配置 extension 路径，删除此文件后再次双击:
    echo       %PATH_FILE%
    echo.
    pause
    exit /b 0
)

echo.
echo 发现新版本！准备从 v%LOCAL_VERSION% 升级到 v%LATEST_VERSION%

REM ====== 步骤5：下载 ======
echo.
echo ============================================================
echo   下载新版本
echo ============================================================

set "TMP_DIR=%TEMP%\leapmotor-update-%RANDOM%"
mkdir "%TMP_DIR%"
set "ZIP_FILE=%TMP_DIR%\leapmotor-ai-assistant.zip"

REM 用 PowerShell 下载（curl 在某些 Windows 版本上行为不一致）
powershell -NoProfile -Command "try { Invoke-WebRequest -Uri '!ZIP_URL!' -OutFile '%ZIP_FILE%' -UseBasicParsing } catch { Write-Error $_.Exception.Message; exit 1 }"
if errorlevel 1 (
    echo [ERROR] 下载失败
    echo.
    pause
    exit /b 1
)
for %%F in ("%ZIP_FILE%") do echo [OK] 下载完成 %%~zF 字节

REM ====== 步骤6：解压并覆盖 ======
echo.
echo ============================================================
echo   解压并覆盖
echo ============================================================

REM 备份旧版本
set "BACKUP_DIR=!EXTENSION_DIR!.backup-v%LOCAL_VERSION%-%date:~0,4%%date:~5,2%%date:~8,2%%time:~0,2%%time:~3,2%"
powershell -NoProfile -Command "Copy-Item -Path '!EXTENSION_DIR!' -Destination '!BACKUP_DIR!' -Recurse -Force"
echo [OK] 旧版本已备份到:
echo    !BACKUP_DIR!

REM 解压到临时目录
set "EXTRACT_DIR=%TMP_DIR%\extracted"
mkdir "%EXTRACT_DIR%"
powershell -NoProfile -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%EXTRACT_DIR%' -Force"
if errorlevel 1 (
    echo [ERROR] 解压失败
    echo.
    pause
    exit /b 1
)

REM 覆盖文件（用 robocopy /MIR 镜像同步，确保完全一致）
echo 覆盖中...
robocopy "!EXTRACT_DIR!" "!EXTENSION_DIR!" /MIR /NFL /NDL /NJH /NJS >nul 2>&1
if errorlevel 8 (
    echo [ERROR] 覆盖失败，已备份的旧版本还在，可手动恢复
    echo.
    pause
    exit /b 1
)

REM 验证新版本
for /f "usebackq delims=" %%v in (`powershell -NoProfile -Command "(Get-Content '!EXTENSION_DIR!\manifest.json' -Raw | ConvertFrom-Json).version"`) do set "NEW_VERSION=%%v"
echo [OK] 覆盖完成，新版本: v%NEW_VERSION%

REM 清理临时文件
rd /s /q "%TMP_DIR%" 2>nul

REM ====== 步骤7：完成提示 ======
echo.
echo ============================================================
echo   更新成功!
echo ============================================================
echo 已从 v%LOCAL_VERSION% 升级到 v%NEW_VERSION%
echo.
echo ---- 最后一步: 让 Chrome 加载新版本 ----
echo   1. 打开 Chrome 浏览器
echo   2. 地址栏输入: chrome://extensions
echo   3. 找到 零跑AI助手，点击卡片右下角的 刷新 按钮
echo   4. 刷新后即可使用新版本
echo.
echo [TIP] 提示:
echo   - 以后每次只需双击此 .bat 文件即可自动更新
echo   - 旧版本备份在: !BACKUP_DIR!
echo   - 如需修改 extension 路径，删除: %PATH_FILE%
echo.
pause
