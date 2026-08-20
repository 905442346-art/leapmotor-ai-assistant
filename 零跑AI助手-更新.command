#!/bin/bash
# ============================================================
#  零跑AI助手 - 一键更新工具 (macOS)
# ============================================================
#  使用方法：
#    1. 双击此文件即可运行
#    2. 首次运行会要求你把"extension"文件夹拖入终端窗口
#    3. 之后每次双击都会自动检查并更新到 GitHub 最新版本
#  原理：
#    - 调用 GitHub API 获取最新 release
#    - 对比本地 manifest.json 版本号
#    - 下载 zip 并解压覆盖到 extension 目录
#    - 提示到 chrome://extensions 点刷新按钮
# ============================================================

# ====== 配置 ======
REPO="905442346-art/leapmotor-ai-assistant"
CONFIG_DIR="$HOME/.leapmotor-ai-assistant"
PATH_FILE="$CONFIG_DIR/extension-path.txt"

# 颜色输出
G="\033[32m"; Y="\033[33m"; R="\033[31m"; B="\033[34m"; N="\033[0m"
TITLE() { echo ""; echo -e "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"; echo -e "${B}  $1${N}"; echo -e "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"; }

# ====== 步骤1：定位本地 extension 目录 ======
TITLE "🔍 定位本地插件目录"

# 如果有保存的路径且有效，直接使用
if [ -f "$PATH_FILE" ]; then
  SAVED_PATH=$(cat "$PATH_FILE")
  if [ -f "$SAVED_PATH/manifest.json" ]; then
    EXTENSION_DIR="$SAVED_PATH"
    echo -e "${G}✅ 已读取上次配置的路径:${N}"
    echo "   $EXTENSION_DIR"
  else
    echo -e "${Y}⚠️  保存的路径已失效：$SAVED_PATH${N}"
    EXTENSION_DIR=""
  fi
fi

# 首次运行或路径失效：让用户拖入文件夹
if [ -z "$EXTENSION_DIR" ]; then
  echo ""
  echo -e "${Y}首次使用，需要指定本地的 extension 文件夹位置${N}"
  echo -e "请按以下步骤操作："
  echo -e "  1. 打开 Finder 找到你的 ${B}extension${N} 文件夹（包含 manifest.json 的那个）"
  echo -e "  2. ${B}把该文件夹拖到这个终端窗口里${N}，然后按回车"
  echo ""
  printf "👉 请拖入 extension 文件夹: "
  read -r DRAGGED

  # 清理拖入的路径（去掉反斜杠转义和首尾空格）
  EXTENSION_DIR=$(echo "$DRAGGED" | sed 's/\\//g' | sed 's/^ *//;s/ *$//')

  if [ ! -d "$EXTENSION_DIR" ] || [ ! -f "$EXTENSION_DIR/manifest.json" ]; then
    echo -e "${R}❌ 路径无效或找不到 manifest.json：${N}$EXTENSION_DIR"
    echo -e "${Y}   请重新双击运行本文件${N}"
    echo ""
    echo "按回车键退出..."
    read
    exit 1
  fi

  # 保存配置供下次使用
  mkdir -p "$CONFIG_DIR"
  echo "$EXTENSION_DIR" > "$PATH_FILE"
  echo -e "${G}✅ 已保存路径到：$PATH_FILE${N}"
  echo -e "${Y}   下次双击将自动使用此路径${N}"
fi

# ====== 步骤2：读取本地版本 ======
LOCAL_VERSION=$(grep -o '"version": *"[^"]*"' "$EXTENSION_DIR/manifest.json" | grep -o '"[^"]*"$' | tr -d '"')
echo -e "${G}✅ 当前本地版本: v${LOCAL_VERSION}${N}"

# ====== 步骤3：调用 GitHub API 获取最新版本 ======
TITLE "🌐 查询 GitHub 最新版本"

# 重试3次
API_OK=false
for i in 1 2 3; do
  RESPONSE=$(curl -sS -m 15 "https://api.github.com/repos/${REPO}/releases/latest" 2>/dev/null)
  if [ -n "$RESPONSE" ] && echo "$RESPONSE" | grep -q '"tag_name"'; then
    API_OK=true
    break
  fi
  echo -e "${Y}   尝试 $i 失败，重试...${N}"
  sleep 2
done

if [ "$API_OK" != "true" ]; then
  echo -e "${R}❌ 无法访问 GitHub API，请检查网络后重试${N}"
  echo "按回车键退出..."
  read
  exit 1
fi

LATEST_TAG=$(echo "$RESPONSE" | grep -o '"tag_name": *"[^"]*"' | head -1 | sed 's/.*"tag_name": *"//;s/"$//')
LATEST_VERSION="${LATEST_TAG#v}"
ZIP_URL=$(echo "$RESPONSE" | grep -o '"browser_download_url": *"[^"]*"' | grep 'leapmotor-ai-assistant' | head -1 | sed 's/.*"browser_download_url": *"//;s/"$//')

echo -e "  GitHub 最新版本: ${G}v${LATEST_VERSION}${N}"
echo -e "  下载地址: $ZIP_URL"

# ====== 步骤4：版本对比 ======
if [ "$LOCAL_VERSION" = "$LATEST_VERSION" ]; then
  TITLE "✨ 已是最新版本"
  echo -e "${G}本地版本 v${LOCAL_VERSION} 已是 GitHub 最新版${N}"
  echo -e "${Y}💡 如需重新配置 extension 路径，删除此文件后再次双击:${N}"
  echo "   $PATH_FILE"
  echo ""
  echo "按回车键退出..."
  read
  exit 0
fi

echo ""
echo -e "${Y}发现新版本！准备从 v${LOCAL_VERSION} 升级到 v${LATEST_VERSION}${N}"

# ====== 步骤5：下载 + 解压 + 覆盖 ======
TITLE "⬇️  下载新版本"

TMP_DIR=$(mktemp -d)
ZIP_FILE="$TMP_DIR/leapmotor-ai-assistant.zip"

if [ -z "$ZIP_URL" ]; then
  echo -e "${R}❌ Release 未上传 zip 资产，无法自动更新${N}"
  echo "按回车键退出..."
  read
  exit 1
fi

echo -e "下载中..."
curl -sSL -o "$ZIP_FILE" "$ZIP_URL"
if [ $? -ne 0 ] || [ ! -s "$ZIP_FILE" ]; then
  echo -e "${R}❌ 下载失败${N}"
  echo "按回车键退出..."
  read
  exit 1
fi
echo -e "${G}✅ 下载完成 ($(du -h "$ZIP_FILE" | cut -f1))${N}"

# 解压
TITLE "📦 解压并覆盖"
EXTRACT_DIR="$TMP_DIR/extracted"
mkdir -p "$EXTRACT_DIR"
unzip -q "$ZIP_FILE" -d "$EXTRACT_DIR"
if [ $? -ne 0 ]; then
  echo -e "${R}❌ 解压失败${N}"
  echo "按回车键退出..."
  read
  exit 1
fi

# 备份旧版本
BACKUP_DIR="${EXTENSION_DIR}.backup-v${LOCAL_VERSION}-$(date +%Y%m%d%H%M%S)"
cp -R "$EXTENSION_DIR" "$BACKUP_DIR"
echo -e "${G}✅ 旧版本已备份到:${N}"
echo "   $BACKUP_DIR"

# 覆盖文件
echo -e "覆盖中..."
rsync -a --delete "$EXTRACT_DIR/" "$EXTENSION_DIR/"
if [ $? -ne 0 ]; then
  echo -e "${R}❌ 覆盖失败，已备份的旧版本还在，可手动恢复${N}"
  echo "按回车键退出..."
  read
  exit 1
fi

# 验证新版本
NEW_VERSION=$(grep -o '"version": *"[^"]*"' "$EXTENSION_DIR/manifest.json" | grep -o '"[^"]*"$' | tr -d '"')
echo -e "${G}✅ 覆盖完成，新版本: v${NEW_VERSION}${N}"

# 清理临时文件
rm -rf "$TMP_DIR"

# ====== 步骤6：提示刷新 Chrome ======
TITLE "🎉 更新成功！"
echo -e "${G}已从 v${LOCAL_VERSION} 升级到 v${NEW_VERSION}${N}"
echo ""
echo -e "${Y}━━━ 最后一步：让 Chrome 加载新版本 ━━━${N}"
echo -e "  1. 打开 Chrome 浏览器"
echo -e "  2. 地址栏输入: ${B}chrome://extensions${N}"
echo -e "  3. 找到 ${B}零跑AI助手${N}，点击卡片右下角的 ${B}🔄 刷新按钮${N}"
echo -e "  4. 刷新后即可使用新版本"
echo ""
echo -e "${Y}💡 提示:${N}"
echo -e "  - 以后每次只需双击此 .command 文件即可自动更新"
echo -e "  - 旧版本备份在: $BACKUP_DIR"
echo -e "  - 如需修改 extension 路径，删除: $PATH_FILE"
echo ""
echo "按回车键退出..."
read
