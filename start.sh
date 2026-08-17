#!/bin/bash

echo "🚀 启动 Local AI Assistant..."
echo ""

if ! command -v ollama &> /dev/null; then
    echo "❌ 未检测到 Ollama，请先安装："
    echo "   brew install ollama"
    echo "   或访问 https://ollama.com/download"
    exit 1
fi

echo "✅ 检查 Ollama 状态..."
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Ollama 未运行，正在启动..."
    ollama serve &
    sleep 3
fi

echo "✅ 检查已安装模型..."
if ! ollama list | grep -q "qwen2.5"; then
    echo "📥 正在下载推荐模型 qwen2.5:7b（约4.7GB）..."
    ollama pull qwen2.5:7b
fi

echo ""
echo "🎉 准备就绪！"
echo ""
echo "📖 下一步："
echo "1. 在 Chrome 中打开 chrome://extensions/"
echo "2. 开启开发者模式"
echo "3. 点击「加载已解压的扩展程序」"
echo "4. 选择文件夹: $(pwd)/extension"
echo ""
echo "⌨️  使用快捷键 Cmd+J (Mac) / Ctrl+J (Win) 唤起助手"
echo ""
echo "📝 可选：启动本地代理服务（如需要）"
echo "   npm start"
echo ""
