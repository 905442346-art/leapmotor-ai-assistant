#!/bin/bash
# 零跑AI助手 - GitHub Release 发布脚本
# 用法: bash release.sh
# 功能: 推送代码 + tag + 创建 GitHub Release + 上传 zip 资产
# 前提: manifest.json 已更新版本号，且本地已 commit

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
EXTENSION_DIR="${PROJECT_ROOT}/extension"
DIST_DIR="${PROJECT_ROOT}/dist"

# 从 manifest.json 读取版本号
VERSION=$(grep -o '"version": *"[^"]*"' "${EXTENSION_DIR}/manifest.json" | grep -o '"[^"]*"$' | tr -d '"')
TAG="v${VERSION}"
ZIP_PATH="${DIST_DIR}/leapmotor-ai-assistant-${TAG}.zip"

echo "=========================================="
echo "  🚀 发布到 GitHub: ${TAG}"
echo "=========================================="

# 1. 前置检查
if [ ! -f "${ZIP_PATH}" ]; then
  echo "❌ 找不到安装包: ${ZIP_PATH}"
  echo "   请先运行: bash package.sh"
  exit 1
fi

# 从 git remote URL 提取 token 和仓库
REMOTE_URL=$(git -C "${PROJECT_ROOT}" remote get-url origin)
# 形如 https://<user>:<token>@github.com/<owner>/<repo>.git
TOKEN=$(echo "${REMOTE_URL}" | sed -n 's#https://[^:]*:\([^@]*\)@github.com/.*#\1#p')
REPO_SLUG=$(echo "${REMOTE_URL}" | sed -n 's#https://[^@]*@github.com/\(.*\)\.git#\1#p')

if [ -z "${TOKEN}" ] || [ -z "${REPO_SLUG}" ]; then
  echo "❌ 无法从 git remote 解析 token 或仓库 (检查 origin URL 是否含认证信息)"
  exit 1
fi
echo "🔖 版本: ${TAG}"
echo "📦 仓库: ${REPO_SLUG}"
echo "🗂  安装包: ${ZIP_PATH}"
echo ""

# 2. 网络预检（重试3次，避免抖动误判）
echo "🌐 检查 GitHub 连通性..."
API_OK=false
for i in 1 2 3; do
  CODE=$(curl -sS -o /dev/null -m 15 -w "%{http_code}" https://api.github.com 2>/dev/null || echo "000")
  if [ "${CODE}" = "200" ]; then API_OK=true; break; fi
  echo "   尝试 $i: HTTP=${CODE}，重试中..."
  sleep 2
done
if [ "${API_OK}" != "true" ]; then
  echo "❌ api.github.com 不可达，请检查网络/代理后重试"
  exit 1
fi
echo "   ✅ api.github.com 可达"

# github.com 推送通道预检（失败只警告不退出）
CODE=$(curl -sS -o /dev/null -m 20 -w "%{http_code}" https://github.com 2>/dev/null || echo "000")
if [ "${CODE}" = "200" ]; then
  echo "   ✅ github.com 可达（推送通道正常）"
else
  echo "   ⚠️  github.com 暂不可达 (HTTP=${CODE})，push 可能失败，仍继续尝试..."
fi
echo ""

# 3. 推送代码和 tag
echo "📤 推送代码到 main..."
git -C "${PROJECT_ROOT}" push origin main || echo "⚠️  push main 失败（可能已推送或网络问题）"

# 创建 tag（如不存在）
if ! git -C "${PROJECT_ROOT}" rev-parse -q --verify "refs/tags/${TAG}" >/dev/null; then
  echo "🏷  创建 tag ${TAG}"
  git -C "${PROJECT_ROOT}" tag -a "${TAG}" -m "Release ${TAG}"
fi

# 推送 tag（重试3次；远端已存在则视为成功，避免 SSL 抖动误报）
echo "📤 推送 tag ${TAG}..."
TAG_OK=false
for i in 1 2 3; do
  if git -C "${PROJECT_ROOT}" ls-remote --exit-code origin "refs/tags/${TAG}" >/dev/null 2>&1; then
    echo "   ✅ tag 已存在于远端"
    TAG_OK=true; break
  fi
  if git -C "${PROJECT_ROOT}" push origin "${TAG}" 2>/dev/null; then
    echo "   ✅ tag 推送成功"
    TAG_OK=true; break
  fi
  echo "   尝试 $i: tag 推送失败，3 秒后重试..."
  sleep 3
done
if [ "${TAG_OK}" != "true" ]; then
  echo "⚠️  tag 推送失败（网络问题），Release 仍将尝试创建"
fi
echo ""

# 4. 用 GitHub API 创建 Release
echo "📝 创建 GitHub Release..."
API_RESPONSE=$(curl -sS -X POST \
  -H "Authorization: token ${TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/${REPO_SLUG}/releases" \
  -d "$(cat <<EOF
{
  "tag_name": "${TAG}",
  "name": "${TAG}",
  "body": "## ${TAG}\n\n请下载下方 zip 包，按 dist/windows/安装说明-Windows.md 或 dist/mac/安装说明-Mac.md 安装。",
  "draft": false,
  "prerelease": false
}
EOF
)")

# 解析 release ID
RELEASE_ID=$(echo "${API_RESPONSE}" | grep -o '"id": *[0-9]*' | head -1 | grep -o '[0-9]*')
if [ -z "${RELEASE_ID}" ]; then
  echo "⚠️  Release 创建失败（可能已存在）"
  echo "${API_RESPONSE}" | head -20
  echo ""
  echo "→ 若已存在，请到 GitHub 手动上传资产: ${ZIP_PATH}"
  exit 0
fi
echo "✅ Release 已创建 (id: ${RELEASE_ID})"
echo "🔗 https://github.com/${REPO_SLUG}/releases/tag/${TAG}"

# 5. 上传 zip 资产（重试3次，防止「Release已建但资产没传上」导致热更新404）
echo ""
echo "📎 上传安装包到 Release..."
ZIP_NAME=$(basename "${ZIP_PATH}")
ZIP_URL=""
for i in 1 2 3; do
  echo "   上传尝试 $i..."
  UPLOAD_RESULT=$(curl -sS --retry 3 --retry-delay 2 -m 300 -X POST \
    -H "Authorization: token ${TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "Content-Type: application/zip" \
    --data-binary @"${ZIP_PATH}" \
    "https://uploads.github.com/repos/${REPO_SLUG}/releases/${RELEASE_ID}/assets?name=${ZIP_NAME}" 2>&1)
  ZIP_URL=$(echo "${UPLOAD_RESULT}" | grep -o '"browser_download_url": *"[^"]*"' | head -1 | sed 's/.*"browser_download_url": *"//;s/"$//')
  if [ -n "${ZIP_URL}" ]; then
    echo "✅ zip 资产上传成功"
    echo "🔗 ${ZIP_URL}"
    break
  fi
  echo "   ⚠️ 第 $i 次上传失败:"
  echo "${UPLOAD_RESULT}" | head -5
  if [ "$i" -lt 3 ]; then echo "   等待 5 秒后重试..."; sleep 5; fi
done

# 上传结果校验：通过 API 查询资产列表，确认 zip 真实存在且已就绪
echo ""
echo "🔍 校验 Release 资产..."
VERIFY_OK=false
for i in 1 2 3; do
  ASSETS_JSON=$(curl -sS -m 30 -H "Authorization: token ${TOKEN}" -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/${REPO_SLUG}/releases/${RELEASE_ID}/assets" 2>/dev/null)
  if echo "${ASSETS_JSON}" | grep -q "\"name\": *\"${ZIP_NAME}\""; then
    VERIFY_OK=true
    break
  fi
  echo "   尝试 $i: 未发现 zip 资产，3 秒后重查..."
  sleep 3
done
if [ "${VERIFY_OK}" = "true" ]; then
  echo "   ✅ zip 资产已确认存在，热更新下载地址可用"
else
  echo "   ❌ 未检测到 zip 资产！热更新将 404，请到 Release 页面手动上传:"
  echo "      https://github.com/${REPO_SLUG}/releases/${TAG}"
  echo "      本地包路径: ${ZIP_PATH}"
fi

# 6. 上传一键更新脚本（独立资产，方便用户单独下载）
upload_asset() {
  local FILE_PATH="$1"
  local ASSET_NAME="$2"
  local CONTENT_TYPE="$3"

  if [ ! -f "${FILE_PATH}" ]; then
    echo "⚠️  跳过 ${ASSET_NAME}：文件不存在"
    return
  fi

  echo ""
  echo "📎 上传 ${ASSET_NAME} 到 Release..."
  # GitHub 资产名只接受 ASCII，直接用英文资产名（文件内容仍含中文注释）
  local UPLOAD_URL="https://uploads.github.com/repos/${REPO_SLUG}/releases/${RELEASE_ID}/assets?name=${ASSET_NAME}"
  local URL=""
  local RESULT=""
  for i in 1 2 3; do
    RESULT=$(curl -sS --retry 2 --retry-delay 2 -m 120 -X POST \
      -H "Authorization: token ${TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      -H "Content-Type: ${CONTENT_TYPE}" \
      --data-binary @"${FILE_PATH}" \
      "${UPLOAD_URL}" 2>&1)
    URL=$(echo "${RESULT}" | grep -o '"browser_download_url": *"[^"]*"' | head -1 | sed 's/.*"browser_download_url": *"//;s/"$//')
    if [ -n "${URL}" ]; then break; fi
    echo "   ⚠️ 第 $i 次上传失败，重试..."
    sleep 3
  done
  if [ -n "${URL}" ]; then
    echo "✅ 上传成功: ${ASSET_NAME}"
    echo "🔗 ${URL}"
  else
    echo "⚠️  上传失败: ${ASSET_NAME}"
    echo "${RESULT}" | head -5
  fi
}

# macOS 更新脚本（资产名用英文，避免 GitHub 把中文替换为点号）
upload_asset "${DIST_DIR}/零跑AI助手-更新.command" "leapmotor-ai-assistant-update.command" "application/octet-stream"
# Windows 更新脚本
upload_asset "${DIST_DIR}/零跑AI助手-更新.bat" "leapmotor-ai-assistant-update.bat" "application/octet-stream"

echo ""
echo "=========================================="
echo "  ✅ 发布流程结束"
echo "=========================================="
