const express = require('express');
const cors = require('cors');
const multer = require('multer');
const http = require('http');
const https = require('https');

const app = express();
const PORT = 3000;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    ollamaHost: OLLAMA_HOST,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/tags', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ 
      error: '无法连接到 Ollama', 
      message: error.message,
      hint: '请确保 Ollama 正在运行 (ollama serve)'
    });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { model, prompt, system, images, stream = true, options } = req.body;
    
    const requestBody = {
      model: model || 'qwen2.5:7b',
      prompt,
      stream,
      options: options || { temperature: 0.7 }
    };
    
    if (system) requestBody.system = system;
    if (images && images.length > 0) requestBody.images = images;
    
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const ollamaResponse = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!ollamaResponse.ok) {
        throw new Error(`Ollama error: ${ollamaResponse.status}`);
      }
      
      const reader = ollamaResponse.body.getReader();
      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      } finally {
        reader.releaseLock();
        res.end();
      }
    } else {
      const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ 
      error: '生成失败', 
      message: error.message 
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, stream = true, options } = req.body;
    
    const requestBody = {
      model: model || 'qwen2.5:7b',
      messages,
      stream,
      options: options || { temperature: 0.7 }
    };
    
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const ollamaResponse = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const reader = ollamaResponse.body.getReader();
      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      } finally {
        reader.releaseLock();
        res.end();
      }
    } else {
      const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: '对话失败', message: error.message });
  }
});

app.post('/api/vision', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }
    
    const { prompt = '请描述这张图片', model = 'llava:7b' } = req.body;
    const base64Image = req.file.buffer.toString('base64');
    
    const requestBody = {
      model,
      prompt,
      images: [base64Image],
      stream: false,
      options: { temperature: 0.7 }
    };
    
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Vision error:', error);
    res.status(500).json({ error: '视觉分析失败', message: error.message });
  }
});

app.get('/api/models', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    const data = await response.json();
    const models = data.models || [];
    
    const recommended = [
      { name: 'qwen2.5:7b', description: '通义千问2.5 - 推荐通用中文模型', size: '~4.7GB', type: 'text' },
      { name: 'qwen2.5:14b', description: '通义千问2.5 - 更大更聪明', size: '~9GB', type: 'text' },
      { name: 'llama3.1:8b', description: 'Meta Llama 3.1 - 英文优秀', size: '~4.7GB', type: 'text' },
      { name: 'llava:7b', description: 'LLaVA - 支持图片理解', size: '~4.5GB', type: 'vision' },
      { name: 'llava:13b', description: 'LLaVA 13B - 更准确的视觉模型', size: '~8GB', type: 'vision' },
      { name: 'bakllava:7b', description: 'Bakllava - 轻量视觉模型', size: '~4.5GB', type: 'vision' },
      { name: 'deepseek-coder:6.7b', description: 'DeepSeek Coder - 代码专用', size: '~3.8GB', type: 'code' }
    ];
    
    res.json({
      installed: models.map(m => ({
        name: m.name,
        size: m.size,
        modified: m.modified
      })),
      recommended
    });
  } catch (error) {
    res.status(503).json({ error: '无法连接到 Ollama', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log('\n🚀 Local AI Assistant Server');
  console.log('='.repeat(50));
  console.log(`📡 服务运行在: http://localhost:${PORT}`);
  console.log(`🤖 Ollama 地址: ${OLLAMA_HOST}`);
  console.log('='.repeat(50));
  console.log('\n💡 快速开始:');
  console.log('  1. 确保 Ollama 已安装并运行: ollama serve');
  console.log('  2. 安装推荐模型: ollama pull qwen2.5:7b');
  console.log('  3. (可选) 安装视觉模型: ollama pull llava:7b');
  console.log('  4. 在 Chrome 中加载扩展: chrome://extensions/');
  console.log('  5. 使用快捷键 Cmd+Shift+A (Mac) / Ctrl+Shift+A (Win) 唤起助手\n');
});
