# 🤖 Local AI Assistant - 本地AI页面助手

一个类似Gemini的Chrome浏览器扩展，随时用快捷键唤起，可以查看和分析当前页面内容，使用本地大模型（Ollama），完全离线保护隐私。

## ✨ 功能特性

- ⌨️ **快捷键唤起** - `Cmd+J` (Mac) / `Ctrl+J` (Windows) 随时打开/关闭
- 🔍 **智能页面解析** - 自动提取页面标题、正文、表格、列表、链接等
- 💬 **流式对话** - 实时流式输出，打字机效果
- 📸 **截图视觉分析** - 支持截图后用多模态模型（LLaVA）分析
- 🎯 **快速动作** - 一键分析页面、一键截图、新建对话
- ⚙️ **自定义配置** - 可配置API地址和模型名称
- 🔒 **完全本地** - 所有数据在本地处理，不上传云端
- 🎨 **美观UI** - 现代化聊天界面，类似Gemini体验

## 🚀 快速开始

### 1. 安装 Ollama

首先需要安装Ollama来运行本地大模型：

**macOS:**
```bash
brew install ollama
```

**或从官网下载:** https://ollama.com/download

### 2. 启动 Ollama 并下载模型

```bash
# 启动 Ollama 服务
ollama serve

# 下载推荐的中文模型（约4.7GB）
ollama pull qwen2.5:7b

# （可选）下载视觉模型用于截图分析（约4.5GB）
ollama pull llava:7b
```

### 3. 安装Chrome扩展

1. 打开Chrome浏览器，访问 `chrome://extensions/`
2. 开启右上角的「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择本项目中的 `extension` 文件夹
5. 扩展应该出现在列表中了

### 4. 使用助手

- 按 `Cmd/Ctrl + J` 唤起侧边栏
- 或点击Chrome工具栏中的扩展图标
- 点击「分析页面」按钮或直接输入问题开始对话
- 按 `Cmd/Ctrl + Shift + J` 快速分析当前页面

## 📁 项目结构

```
local-ai-assistant/
├── extension/                 # Chrome扩展
│   ├── manifest.json         # Manifest V3 配置
│   ├── background.js         # Service Worker（快捷键处理）
│   ├── content-scripts/
│   │   ├── content.js        # 页面内容解析、侧边栏注入
│   │   └── content.css       # 样式隔离
│   └── sidebar/
│       ├── index.html        # 侧边栏UI
│       ├── style.css         # 侧边栏样式
│       └── app.js            # 聊天逻辑、API调用
├── server/                   # 本地代理服务（可选）
│   └── index.js              # Node.js 代理服务
├── package.json              # 依赖配置
└── README.md                 # 本文件
```

## 🎮 快捷键说明

| 快捷键 | 功能 |
|--------|------|
| `Cmd/Ctrl + J` | 唤起/关闭AI助手侧边栏 |
| `Cmd/Ctrl + Shift + J` | 快速分析当前页面 |
| `Enter` | 发送消息 |
| `Shift + Enter` | 换行 |

## ⚙️ 配置说明

点击侧边栏右上角的⚙️设置按钮，可以配置：

- **API地址** - Ollama服务地址，默认 `http://localhost:11434`
- **模型名称** - 文本模型，默认 `qwen2.5:7b`
- **视觉模型** - 截图分析用的多模态模型，默认 `llava:7b`

配置会自动保存在浏览器存储中。

## 🧠 推荐模型

### 文本模型
| 模型 | 大小 | 说明 |
|------|------|------|
| `qwen2.5:7b` | ~4.7GB | 🌟 推荐 - 中文最好的7B模型 |
| `qwen2.5:14b` | ~9GB | 更聪明，需要更多显存 |
| `qwen2.5:3b` | ~1.9GB | 轻量版，速度快 |
| `llama3.1:8b` | ~4.7GB | Meta官方，英文优秀 |
| `deepseek-coder:6.7b` | ~3.8GB | 代码专用 |

### 视觉模型（截图分析用）
| 模型 | 大小 | 说明 |
|------|------|------|
| `llava:7b` | ~4.5GB | 🌟 推荐 - 通用视觉理解 |
| `llava:13b` | ~8GB | 更准确 |
| `bakllava:7b` | ~4.5GB | BakLLaVA |

安装模型：
```bash
ollama pull 模型名
# 例如:
ollama pull qwen2.5:7b
```

## 🔧 故障排除

### 连接错误
如果看到"连接错误"提示：
1. 确认Ollama正在运行：在终端运行 `ollama serve`
2. 确认已安装模型：运行 `ollama list` 查看已安装模型
3. 检查API地址是否正确（设置中的地址）
4. 可以先在终端测试：`curl http://localhost:11434/api/tags`

### CORS 问题
本扩展直接调用Ollama API（Manifest V3已配置权限），通常不需要本地代理服务。
如果遇到跨域问题，可以启动本地代理服务：
```bash
npm start
# 然后在设置中将API地址改为 http://localhost:3000
```

### 扩展不显示
1. 确认在 `chrome://extensions/` 中扩展已启用
2. 尝试刷新页面或重启Chrome
3. 检查快捷键是否冲突（在 `chrome://extensions/shortcuts` 中可以自定义）

### 模型响应慢
- 7B模型在普通CPU上运行可能需要几秒到十几秒
- 建议使用更小的模型如 `qwen2.5:3b` 获得更快速度
- 如果有GPU，Ollama会自动利用GPU加速

## 💡 使用技巧

1. **数据分析** - 在数据报表、BI页面打开后，问"提取页面中的所有数据表格"
2. **文章总结** - 看长文章时快速问"总结这篇文章的要点"
3. **代码解释** - 在GitHub/GitLab页面问"解释这段代码做了什么"
4. **页面翻译** - 可以让AI翻译整个页面内容
5. **截图分析** - 对于复杂图表、图片，点击"截图分析"按钮让视觉模型解读

## 🔒 隐私说明

- ✅ 所有数据都在本地处理
- ✅ 不会上传任何页面内容或对话记录到外部服务器
- ✅ 模型在本地运行，无需互联网连接（模型下载后）
- ✅ 不收集任何用户数据

## 📝 技术栈

- **Chrome Extension Manifest V3** - 最新的扩展规范
- **原生JavaScript** - 无框架依赖，轻量快速
- **Ollama API** - 本地大模型运行时
- **流式响应** - SSE实时输出

## 🎯 未来计划

- [ ] 支持选中文字右键菜单分析
- [ ] 对话历史保存
- [ ] 支持更多模型后端（LM Studio、llama.cpp等）
- [ ] 划词翻译功能
- [ ] PDF页面支持
- [ ] 暗色主题

## 📄 许可证

MIT License
