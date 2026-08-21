#!/bin/bash

# 零跑AI助手 Chrome扩展打包脚本
# 用于生成 Mac 和 Windows 安装包

echo "=========================================="
echo "  零跑AI助手 - Chrome扩展打包工具"
echo "=========================================="
echo ""

# 设置变量
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
EXTENSION_DIR="${PROJECT_ROOT}/extension"
OUTPUT_DIR="${PROJECT_ROOT}/dist"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
# 从 manifest.json 动态读取版本号，避免硬编码
VERSION=$(grep -o '"version": *"[^"]*"' "${EXTENSION_DIR}/manifest.json" | grep -o '"[^"]*"$' | tr -d '"')
echo "🔖 当前版本: v${VERSION}"
echo ""

# 创建输出目录
mkdir -p "${OUTPUT_DIR}/mac"
mkdir -p "${OUTPUT_DIR}/windows"

echo "📦 开始打包..."
echo ""

# ============================================
# 1. 打包通用扩展文件（ZIP格式）
# ============================================
echo "📁 正在打包扩展文件..."

# 从项目根目录打包，确保 zip 内部包含 extension/ 文件夹
cd "${PROJECT_ROOT}"

zip -r "${OUTPUT_DIR}/leapmotor-ai-assistant-v${VERSION}.zip" extension/ \
    -x "*.DS_Store" \
    -x "__MACOSX/*" \
    -x "*.git/*" \
    -x "*.md" \
    -x "README.md" \

if [ $? -eq 0 ]; then
    echo "✅ 扩展文件打包成功！"
else
    echo "❌ 扩展文件打包失败！"
    exit 1
fi

# 复制到各平台目录
cp "${OUTPUT_DIR}/leapmotor-ai-assistant-v${VERSION}.zip" "${OUTPUT_DIR}/mac/"
cp "${OUTPUT_DIR}/leapmotor-ai-assistant-v${VERSION}.zip" "${OUTPUT_DIR}/windows/"

# ============================================
# 1.5 复制一键更新脚本到 dist 根目录（用户双击即可更新）
# ============================================
# macOS 版本
UPDATE_CMD_MAC="${PROJECT_ROOT}/零跑AI助手-更新.command"
if [ -f "${UPDATE_CMD_MAC}" ]; then
    cp "${UPDATE_CMD_MAC}" "${OUTPUT_DIR}/mac/零跑AI助手-更新.command"
    chmod +x "${OUTPUT_DIR}/mac/零跑AI助手-更新.command"
    cp "${UPDATE_CMD_MAC}" "${OUTPUT_DIR}/零跑AI助手-更新.command"
    chmod +x "${OUTPUT_DIR}/零跑AI助手-更新.command"
    echo "✅ macOS 更新脚本已复制"
else
    echo "⚠️  未找到 零跑AI助手-更新.command，跳过"
fi

# Windows 版本
UPDATE_CMD_WIN="${PROJECT_ROOT}/零跑AI助手-更新.bat"
if [ -f "${UPDATE_CMD_WIN}" ]; then
    cp "${UPDATE_CMD_WIN}" "${OUTPUT_DIR}/windows/零跑AI助手-更新.bat"
    cp "${UPDATE_CMD_WIN}" "${OUTPUT_DIR}/零跑AI助手-更新.bat"
    echo "✅ Windows 更新脚本已复制"
else
    echo "⚠️  未找到 零跑AI助手-更新.bat，跳过"
fi

echo ""
echo "📋 生成的安装包："
echo "   ├── ${OUTPUT_DIR}/leapmotor-ai-assistant-v${VERSION}.zip (通用)"
echo "   ├── ${OUTPUT_DIR}/mac/leapmotor-ai-assistant-v${VERSION}.zip"
echo "   ├── ${OUTPUT_DIR}/windows/leapmotor-ai-assistant-v${VERSION}.zip"
echo "   ├── ${OUTPUT_DIR}/mac/零跑AI助手-更新.command (macOS 一键更新)"
echo "   └── ${OUTPUT_DIR}/windows/零跑AI助手-更新.bat (Windows 一键更新)"
echo ""

# ============================================
# 2. 创建 Mac 版本安装指南
# ============================================
cat > "${OUTPUT_DIR}/mac/安装说明-Mac.md" << 'EOF'
# 零跑AI助手 - Mac版安装指南

## 📦 安装步骤

### 方法一：开发者模式安装（推荐）

1. **打开Chrome浏览器**

2. **进入扩展管理页面**
   - 在地址栏输入：`chrome://extensions`
   - 或点击菜单：`Chrome → 更多工具 → 扩展程序`

3. **开启开发者模式**
   - 点击右上角的 **「开发者模式」** 开关（如果未开启）

4. **加载扩展**
   - 点击 **「加载已解压的扩展程序」** 按钮
   - 选择文件夹：选择解压后的 `extension` 文件夹
   
5. **确认安装成功**
   - 扩展列表中出现 **「零跑AI助手」**
   - 浏览器右上角出现零跑Logo图标 ✅

### 方法二：拖拽安装（快速）

1. 解压 `leapmotor-ai-assistant-v1.0.0.zip` 到桌面
2. 打开 `chrome://extensions`
3. 开启「开发者模式」
4. 将解压后的 `extension` 文件夹直接拖入页面

---

## ⌨️ 使用方法

### 快捷键唤起
- **Cmd + J** : 打开/关闭AI助手侧边栏
- **Cmd + Shift + J** : 分析当前页面（可选功能）

### 功能介绍
- 🤖 智能对话：与AI助手交流
- 📄 页面分析：自动抓取并分析当前网页内容
- 📚 知识库集成：公司内部系统问题自动查询知识库
- 📎 文件上传：支持图片、文档上传分析
- ⌨️ 快捷粘贴：Cmd+V 直接粘贴截图或文件
- 💾 提示词收藏：保存常用提示词，一键调用

---

## 🔧 首次配置

首次使用时需要配置：

1. **主AI模型配置**（用于页面分析）
   - API地址：填写你的API服务地址
   - API Key：填入密钥
   - 模型名称：指定模型

2. **FastGPT工作流配置**（用于系统问题）
   - API地址：`https://aiflow.leapmotor.com/api`（已预填）
   - API Key：填入FastGPT密钥
   - 应用ID：填入应用ID
   - 勾选「启用智能路由」

---

## ❓ 常见问题

### Q: Cmd+J 无法打开插件？
A: 
1. 检查快捷键是否被其他软件占用
2. 尝试点击浏览器右上角的插件图标手动打开
3. 重启Chrome浏览器

### Q: 提示"API连接失败"？
A: 
1. 确认网络可以访问内网FastGPT服务
2. 检查API Key是否正确且未过期
3. 联系IT部门确认服务状态

### Q: 如何更新版本？
A: 
1. 进入 `chrome://extensions`
2. 找到「零跑AI助手」
3. 点击刷新按钮 🔄
4. 新版本自动生效

---

## 📞 技术支持

如有问题请联系：
- IT技术支持团队
- 或在内部反馈渠道提交工单

---
**版本**: v1.0.0  
**平台**: macOS  
**更新日期**: $(date +"%Y-%m-%d")
EOF

# ============================================
# 3. 创建 Windows 版本安装指南
# ============================================
cat > "${OUTPUT_DIR}/windows/安装说明-Windows.md" << 'EOF'
# 零跑AI助手 - Windows版安装指南

## 📦 安装步骤

### 方法一：开发者模式安装（推荐）

1. **打开Chrome浏览器**

2. **进入扩展管理页面**
   - 在地址栏输入：`chrome://extensions`
   - 或点击菜单：`⋮ → 更多工具 → 扩展程序`

3. **开启开发者模式**
   - 点击右上角的 **「开发者模式」** 开关（如果未开启）

4. **加载扩展**
   - 点击 **「加载已解压的扩展程序」** 按钮
   - 在文件选择窗口中，选择解压后的 `extension` 文件夹
   - 点击「选择文件夹」

5. **确认安装成功**
   - 扩展列表中出现 **「零跑AI助手」**
   - 浏览器右上角出现零跑Logo图标 ✅

### 方法二：拖拽安装（快速）

1. 解压 `leapmotor-ai-assistant-v1.0.0.zip` 到任意位置（如桌面）
2. 打开 `chrome://extensions`
3. 开启「开发者模式」（右上角开关）
4. 将解压后的 `extension` 文件夹 **按住鼠标左键拖入** 扩展程序页面
5. 松开鼠标，完成安装

---

## ⌨️ 使用方法

### 快捷键唤起
- **Ctrl + J** : 打开/关闭AI助手侧边栏
- **Ctrl + Shift + J** : 分析当前页面（可选功能）

### 功能介绍
- 🤖 智能对话：与AI助手进行自然语言交流
- 📄 页面分析：自动抓取并智能分析当前网页内容
- 📚 知识库集成：OA/HR等系统问题自动查询公司知识库
- 📎 文件上传：支持图片、PDF、Word等多种格式
- ⌨️ 快捷粘贴：Ctrl+V 直接粘贴截图或文件到对话框
- 💾 提示词收藏：收藏常用提示词，下次一键调用
- 🌓 主题切换：支持深色/浅色两种主题

---

## 🔧 首次配置

首次打开时会弹出引导，按提示完成配置：

### 必须配置项：

#### 1️⃣ 主AI模型（用于数据分析）
```
API地址: https://你的api地址/v1
API Key: sk-xxxxxxxxxxxxxx
模型名称: gpt-4 / claude-3 等
```

#### 2️⃣ FastGPT工作流（用于系统问答）✨推荐
```
✅ 启用智能路由: [勾选]

API地址: https://aiflow.leapmotor.com/api （已预填）
API Key: openapi-xxxxxxxxxxxxxx （需填写）
应用ID: 6a4b7073b415c3419d9fb95d （需填写）
模型名称: [留空]
```

### 配置位置：
点击插件界面右上角 **⚙️齿轮图标** → 设置面板

---

## 💡 使用示例

### 场景1：查询公司制度
```
你: 如何申请年假？
AI: (自动调用FastGPT知识库) 根据员工手册第3章...
    📚 公司知识库
```

### 场景2：分析网页数据
```
你: 总结这个页面的销售数据
AI: (调用主AI模型) 本页面显示Q3销售额...
```

### 场景3：混合使用
```
1. 先抓取当前页面数据
2. 问："对比这些数据和公司标准有什么差异？"
3. AI结合页面数据 + 知识库制度给出专业回答
```

---

## ❓ 常见问题（Windows特有）

### Q: Ctrl+J 是下载快捷键怎么办？
A: 
- Chrome中 Ctrl+J 默认是打开下载页
- 本插件的快捷键可能需要在 `chrome://extensions/shortcuts` 中手动设置
- 或者直接点击浏览器右上角的插件图标打开

### Q: 杀毒软件拦截安装？
A: 
- 这是正常的，因为我们是加载本地文件夹
- 选择「允许」或「信任」即可
- 如被隔离，添加到白名单后重新安装

### Q: 企业环境无法安装？
A: 
- 部分公司限制了Chrome扩展安装权限
- 联系IT部门申请开放扩展安装权限
- 或使用企业策略统一部署

### Q: 提示"无法加载扩展"？
A: 
1. 确保选择了正确的 `extension` 文件夹（不是上级目录）
2. 检查文件夹中是否有 `manifest.json` 文件
3. 重启Chrome后重试
4. 查看错误详情：点击扩展卡片上的「错误」按钮

---

## 🔄 更新方法

### 手动更新：
1. 进入 `chrome://extensions`
2. 找到「零跑AI助手」
3. 点击 **🔄 刷新按钮**（圆形箭头图标）
4. 更新立即生效

### 替换更新（大版本升级）：
1. 删除旧版本扩展
2. 重新加载新的 extension 文件夹
3. 重新配置（建议先备份设置）

---

## 📊 系统要求

- **操作系统**: Windows 10 / 11
- **浏览器**: Google Chrome 90+
- **网络**: 可访问公司内网（用于FastGPT知识库）
- **权限**: 需要管理员权限安装Chrome扩展

---

## 📞 技术支持

- **内部IT支持**: 联系IT帮助台
- **问题反馈**: 内部工单系统
- **更新通知**: 关注企业微信/钉钉通知群

---
**版本**: v1.0.0  
**平台**: Windows 10/11  
**更新日期**: $(date +"%Y-%m-%d")
EOF

# ============================================
# 4. 创建通用 README
# ============================================
cat > "${OUTPUT_DIR}/README.md" << 'EOF'
# 零跑AI助手 Chrome扩展 - 安装包

## 📦 包含文件

```
dist/
├── leapmotor-ai-assistant-v1.0.0.zip    # 通用安装包
├── mac/
│   ├── leapmotor-ai-assistant-v1.0.0.zip
│   └── 安装说明-Mac.md                   # Mac详细安装指南
└── windows/
    ├── leapmotor-ai-assistant-v1.0.0.zip
    └── 安装说明-Windows.md               # Windows详细安装指南
```

## 🚀 快速开始

### Mac用户：
1. 解压 `mac/leapmotor-ai-assistant-v1.0.0.zip`
2. 阅读 `mac/安装说明-Mac.md`
3. 按照3步完成安装

### Windows用户：
1. 解压 `windows/leapmotor-ai-assistant-v1.0.0.zip`
2. 阅读 `windows/安装说明-Windows.md`
3. 按照4步完成安装

## ✨ 核心功能

- 🤖 **智能对话** - 支持多轮对话，上下文理解
- 📄 **页面分析** - 一键抓取网页内容，智能分析
- 📚 **知识库集成** - 自动识别系统问题，查询FastGPT知识库
- 🎯 **智能路由** - 自动判断走知识库还是主AI模型
- 📎 **文件上传** - 支持图片、文档上传分析
- ⌨️ **快捷操作** - Ctrl/Cmd+V粘贴，快捷键唤起
- 💾 **提示词管理** - 收藏常用提示词，提高效率
- 🌓 **双主题** - 深色/浅色模式自由切换

## 🔧 技术架构

```
用户问题
    ↓
[意图识别引擎]
    ├── 系统问题 → FastGPT(内网) → 公司知识库答案
    └── 页面分析 → 主AI模型     → 数据分析结果
```

## 📝 版本信息

- **当前版本**: v1.0.0
- **适用浏览器**: Chrome 90+, Edge 90+
- **兼容平台**: macOS, Windows, Linux
- **最后更新**: $(date +"%Y-%m-%d %H:%M")

## 📄 许可证

内部使用 - 零跑汽车有限公司

---

**开发团队**: AI产品部  
**技术支持**: IT运维部
EOF

# 完成
echo ""
echo "=========================================="
echo "  ✅ 打包完成！"
echo "=========================================="
echo ""
echo "📂 输出目录: ${OUTPUT_DIR}"
echo ""
echo "📋 文件清单:"
ls -lh "${OUTPUT_DIR}"/*.zip 2>/dev/null || echo "   (无zip文件)"
ls -lh "${OUTPUT_DIR}"/**/*.zip 2>/dev/null | head -5
ls -lh "${OUTPUT_DIR}"/**/*.md 2>/dev/null | head -5
echo ""
echo "💡 提示:"
echo "   - Mac用户请查看: dist/mac/安装说明-Mac.md"
echo "   - Windows用户请查看: dist/windows/安装说明-Windows.md"
echo ""
echo "🎉 可以分发给同事使用了！"
