// ========== 右键菜单：选中文本AI操作 ==========
// 从JSP HTML页面解析待办列表（Service Worker兼容，无DOMParser）

// 注入到OA页面中执行的DOM提取函数
function extractTodoFromDOM() {
  const items = [];

  // 策略1：搜索包含 requestid 的链接
  const links = document.querySelectorAll('a[href*="requestid"]');
  if (links.length > 0) {
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const match = href.match(/requestid=(\d+)/);
      if (!match) return;
      const requestId = match[1];
      const title = link.textContent.trim() || link.getAttribute('title') || '';
      if (!title || title === '待办事项') return;

      // 向上查找所在的行（tr或列表项）
      let row = link.closest('tr');
      if (!row) row = link.closest('[class*="row"], [class*="item"], li');
      if (!row) row = link.parentElement;

      // 从同行中提取其他信息
      let creator = '', createdate = '', workflowName = '', nodename = '';
      if (row) {
        const cells = row.querySelectorAll('td, div, span');
        const cellTexts = Array.from(cells).map(c => c.textContent.trim()).filter(t => t);

        // 尝试匹配日期格式
        const dateMatch = cellTexts.find(t => /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(t));
        if (dateMatch) createdate = dateMatch;

        // 尝试匹配人名（通常在标题后的非日期单元格中）
        const nonTitleNonDate = cellTexts.filter(t => t !== title && t !== dateMatch && t.length > 1 && t.length < 20);
        if (nonTitleNonDate.length > 0) creator = nonTitleNonDate[0];

        // 尝试找流程类型
        const typeCell = row.querySelector('[class*="type"], [class*="workflow"], [class*="category"]');
        if (typeCell) workflowName = typeCell.textContent.trim();

        // 尝试找节点名
        const nodeCell = row.querySelector('[class*="node"], [class*="step"]');
        if (nodeCell) nodename = nodeCell.textContent.trim();
      }

      // 构建完整URL
      let url = href;
      if (href.startsWith('/')) {
        url = window.location.origin + href;
      } else if (!href.startsWith('http')) {
        url = window.location.origin + '/' + href;
      }

      items.push({
        title, url, requestId, creator, workflowName, createdate, nodename,
        raw: { href, text: link.textContent.substring(0, 100) }
      });
    });

    if (items.length > 0) {
      // 去重（同一个requestId可能出现多次）
      const seen = new Set();
      return items.filter(it => {
        if (seen.has(it.requestId)) return false;
        seen.add(it.requestId);
        return true;
      });
    }
  }

  // 策略2：搜索表格行中的数据（E9传统表格）
  const tables = document.querySelectorAll('table');
  for (const table of tables) {
    const rows = table.querySelectorAll('tr');
    if (rows.length < 2) continue; // 至少有表头+1行数据

    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      if (cells.length < 2) continue;

      // 查找行中的链接
      const link = row.querySelector('a[href*="request"], a[href*="workflow"]');
      if (!link) continue;

      const href = link.getAttribute('href') || '';
      const match = href.match(/requestid=(\d+)/) || href.match(/requestId=(\d+)/);
      if (!match) continue;

      const requestId = match[1];
      const title = link.textContent.trim();
      if (!title) continue;

      const cellTexts = Array.from(cells).map(c => c.textContent.trim());
      const dateMatch = cellTexts.find(t => /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(t));
      const nonTitleNonDate = cellTexts.filter(t => t !== title && t !== dateMatch && t.length > 1 && t.length < 30);

      let url = href;
      if (href.startsWith('/')) url = window.location.origin + href;
      else if (!href.startsWith('http')) url = window.location.origin + '/' + href;

      items.push({
        title, url, requestId,
        creator: nonTitleNonDate[0] || '',
        workflowName: nonTitleNonDate[1] || '',
        createdate: dateMatch || '',
        nodename: nonTitleNonDate[2] || '',
        raw: { cellCount: cells.length }
      });
    }

    if (items.length > 0) break;
  }

  if (items.length > 0) return items;

  // 策略3：搜索Vue/React渲染的列表项（E10现代UI）
  const listItems = document.querySelectorAll('[class*="todo"], [class*="task"], [class*="request"], [class*="workflow-item"], [class*="list-item"]');
  for (const item of listItems) {
    const link = item.querySelector('a[href*="request"], a[href*="workflow"]');
    if (!link) continue;

    const href = link.getAttribute('href') || '';
    const match = href.match(/requestid=(\d+)/i) || href.match(/requestId=(\d+)/i);
    if (!match) continue;

    const requestId = match[1];
    const title = link.textContent.trim() || item.textContent.substring(0, 50).trim();
    if (!title) continue;

    const allText = item.textContent;
    const dateMatch = allText.match(/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}[\s\d:]*/);
    const creatorMatch = allText.match(/(?:发起人|创建人|申请人)[：:]\s*(\S+)/);

    let url = href;
    if (href.startsWith('/')) url = window.location.origin + href;
    else if (!href.startsWith('http')) url = window.location.origin + '/' + href;

    items.push({
      title, url, requestId,
      creator: creatorMatch ? creatorMatch[1] : '',
      workflowName: '',
      createdate: dateMatch ? dateMatch[0] : '',
      nodename: '',
      raw: { text: allText.substring(0, 200) }
    });
  }

  if (items.length > 0) {
    const seen = new Set();
    return items.filter(it => {
      if (seen.has(it.requestId)) return false;
      seen.add(it.requestId);
      return true;
    });
  }

  // 策略4：如果页面上有iframe，记录iframe信息（可能待办在iframe内）
  const iframes = document.querySelectorAll('iframe');
  if (iframes.length > 0) {
    return [{
      title: '__IFRAME_DETECTED__',
      url: '',
      requestId: '',
      creator: '',
      workflowName: '',
      createdate: '',
      nodename: '',
      raw: {
        iframeCount: iframes.length,
        iframeSrcs: Array.from(iframes).map(f => f.src || f.getAttribute('src') || '').slice(0, 5)
      }
    }];
  }

  return [];
}

function parseJspTodoList(html) {
  const items = [];
  try {
    // 提取 a 标签中的 requestid
    const linkRegex = /<a[^>]*href=["']([^"']*requestid=(\d+)[^"']*)["'][^>]*>([^<]+)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      items.push({
        title: match[3]?.trim() || '待办事项',
        requestId: match[2],
        url: match[1],
        creator: '', workflowName: '', createdate: ''
      });
    }
    // 提取行数据
    if (items.length === 0) {
      const rowRegex = /requestid["']?\s*[:=]\s*["']?(\d+)/gi;
      while ((match = rowRegex.exec(html)) !== null) {
        // 尝试找附近的标题
        const nearby = html.substring(Math.max(0, match.index - 200), match.index + 200);
        const titleMatch = nearby.match(/requestname["']?\s*[:=]\s*["']([^"']+)["']/i);
        items.push({
          title: titleMatch ? titleMatch[1] : '待办事项',
          requestId: match[1],
          url: '',
          creator: '', workflowName: '', createdate: ''
        });
      }
    }
    // 提取嵌入JSON
    if (items.length === 0) {
      const jsonMatches = html.match(/\{[^{}]*"requestid"[^{}]*\}/gi);
      if (jsonMatches) {
        for (const jsonStr of jsonMatches) {
          try {
            const data = JSON.parse(jsonStr);
            const parsed = parseEcologyResponse(data);
            items.push(...parsed);
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    console.warn('[Background] JSP解析失败:', e.message);
  }
  return items;
}

// 泛微e-cology响应解析：递归查找数组并归一化为统一结构
function parseEcologyResponse(data) {
  if (!data) return [];
  let arr = null;

  // 尝试直接数组
  if (Array.isArray(data)) {
    arr = data;
  } else if (typeof data === 'object') {
    // 尝试常见的顶层字段
    for (const key of ['data', 'list', 'rows', 'result', 'records', 'datas', 'items', 'workflowList']) {
      if (Array.isArray(data[key])) { arr = data[key]; break; }
    }
    // 尝试嵌套 data.xxx
    if (!arr && data.data && typeof data.data === 'object') {
      for (const key of ['data', 'list', 'rows', 'result', 'records', 'datas', 'items', 'workflowList']) {
        if (Array.isArray(data.data[key])) { arr = data.data[key]; break; }
      }
    }
    // 尝试 result.xxx
    if (!arr && data.result && typeof data.result === 'object') {
      for (const key of ['data', 'list', 'rows', 'records', 'datas', 'items']) {
        if (Array.isArray(data.result[key])) { arr = data.result[key]; break; }
      }
    }
    // 深度搜索：找到第一个包含 requestname/requestid 的数组
    if (!arr) {
      arr = deepFindTodoArray(data, 0);
    }
  }

  if (!arr || !Array.isArray(arr)) return [];
  return arr.map(it => {
    if (typeof it === 'string') return { title: it, url: '', requestId: '' };
    if (typeof it !== 'object') return { title: String(it), url: '', requestId: '' };
    const title = it.requestname || it.title || it.name || it.workflowName || it.taskName || it.subject || it.desc || it.flowName || '待办事项';
    const requestId = it.requestid || it.requestId || it.id || it.flowid || it.flowId || '';
    const url = it.pcurl || it.url || it.link || it.workflowUrl || it.href || it.taskUrl || it.detailUrl || it.pcUrl || '';
    const creator = it.creatname || it.creator || it.createrName || it.creater || it.createName || '';
    const workflowName = it.workflowname || it.workflowName || it.flowType || it.workflowtype || '';
    const createdate = it.createdate || it.createDate || it.createtime || it.createTime || '';
    const nodename = it.nodename || it.nodeName || it.currentnode || it.currentNode || '';
    return { title, url, requestId, creator, workflowName, createdate, nodename, raw: it };
  }).filter(it => it.title && it.title !== '待办事项');
}

// 递归查找包含待办特征的数组（最多3层）
function deepFindTodoArray(obj, depth) {
  if (depth > 3 || !obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    // 检查数组元素是否包含待办特征字段
    if (obj.length > 0 && typeof obj[0] === 'object') {
      const keys = Object.keys(obj[0]).join('').toLowerCase();
      if (keys.includes('request') || keys.includes('title') || keys.includes('flow') || keys.includes('workflow')) {
        return obj;
      }
    }
    return null;
  }
  for (const key of Object.keys(obj)) {
    const found = deepFindTodoArray(obj[key], depth + 1);
    if (found) return found;
  }
  return null;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ai-explain',
    title: 'AI 解释选中内容',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'ai-translate',
    title: 'AI 翻译选中内容',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'ai-summarize',
    title: 'AI 总结选中内容',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'ai-ask',
    title: 'AI 追问选中内容',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText || !tab || !tab.id) return;
  const actionMap = {
    'ai-explain': 'explain',
    'ai-translate': 'translate',
    'ai-summarize': 'summarize',
    'ai-ask': 'ask'
  };
  const action = actionMap[info.menuItemId];
  if (!action) return;

  const payload = { type: 'AI_SELECTED_TEXT', action, text: info.selectionText };

  try {
    await chrome.tabs.sendMessage(tab.id, payload);
  } catch (e) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-scripts/content.js']
      });
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content-scripts/content.css']
      });
      await new Promise(resolve => setTimeout(resolve, 200));
      await chrome.tabs.sendMessage(tab.id, payload);
    } catch (e2) {
      console.log('Cannot inject script into this page:', tab.url);
    }
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;
    if (tab.url && tab.url.startsWith('chrome://')) return;
    if (tab.url && tab.url.startsWith('edge://')) return;
    if (tab.url && tab.url.startsWith('about:')) return;

    try {
      await chrome.tabs.sendMessage(tab.id, { type: command === 'toggle-assistant' ? 'TOGGLE_ASSISTANT' : 'ANALYZE_PAGE' });
    } catch (e) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content-scripts/content.js']
        });
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['content-scripts/content.css']
        });
        await new Promise(resolve => setTimeout(resolve, 200));
        await chrome.tabs.sendMessage(tab.id, { type: command === 'toggle-assistant' ? 'TOGGLE_ASSISTANT' : 'ANALYZE_PAGE' });
      } catch (e2) {
        console.log('Cannot inject script into this page:', tab.url);
      }
    }
  } catch (err) {
    console.error('Command error:', err);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id) return;
  if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:'))) return;

  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_ASSISTANT' });
  } catch (e) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-scripts/content.js']
      });
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content-scripts/content.css']
      });
      await new Promise(resolve => setTimeout(resolve, 200));
      await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_ASSISTANT' });
    } catch (e2) {
      console.log('Cannot inject script into this page:', tab.url);
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 处理标签页高亮请求（从sidebar发送过来）
  if (request.type === 'HIGHLIGHT_TAB') {
    const tabId = request.tabId;
    const shouldHighlight = request.highlight;

    if (!tabId) {
      sendResponse({ success: false, error: '缺少tabId' });
      return true;
    }

    try {
      // 设置Badge（在工具栏图标上显示绿色标记）
      if (shouldHighlight) {
        chrome.action.setBadgeText({
          text: '✓',
          tabId: tabId
        });
        chrome.action.setBadgeBackgroundColor({
          color: '#8FE040', // 零跑亮绿色
          tabId: tabId
        });
        chrome.action.setBadgeTextColor({
          color: '#FFFFFF',
          tabId: tabId
        });
      } else {
        // 清除Badge
        chrome.action.setBadgeText({
          text: '',
          tabId: tabId
        });
      }

      // 向目标标签页的content script发送高亮消息（用于页面内标注）
      chrome.tabs.sendMessage(tabId, {
        type: 'HIGHLIGHT_TAB_FROM_BG',
        highlight: shouldHighlight
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('[Background] 发送高亮消息失败:', chrome.runtime.lastError.message);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true });
        }
      });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
    return true;
  }

  // 批量高亮/取消高亮多个标签页
  if (request.type === 'HIGHLIGHT_TABS_BATCH') {
    const tabIds = request.tabIds; // 数组
    const shouldHighlight = request.highlight;

    if (!tabIds || !Array.isArray(tabIds)) {
      sendResponse({ success: false, error: '缺少tabIds数组' });
      return true;
    }

    let successCount = 0;
    let failCount = 0;

    // 设置整体Badge（显示选中数量）
    if (shouldHighlight && tabIds.length > 0) {
      chrome.action.setBadgeText({
        text: tabIds.length.toString(),
        tabId: undefined // 应用到所有窗口
      });
      chrome.action.setBadgeBackgroundColor({
        color: '#8FE040'
      });
    } else {
      // 清除所有Badge（当没有选中时）
      chrome.action.getBadgeText({}, (text) => {
        if (!isNaN(parseInt(text))) {
          chrome.action.setBadgeText({ text: '' });
        }
      });
    }

    tabIds.forEach(tabId => {
      try {
        chrome.tabs.sendMessage(tabId, {
          type: 'HIGHLIGHT_TAB_FROM_BG',
          highlight: shouldHighlight
        }, () => {
          if (chrome.runtime.lastError) {
            failCount++;
          } else {
            successCount++;
          }
        });
      } catch (err) {
        failCount++;
      }
    });

    sendResponse({
      success: true,
      highlighted: successCount,
      failed: failCount
    });
    return true;
  }

  // 处理OA流程查询请求（代理模式，解决CORS问题）
  if (request.type === 'FETCH_OA_PROCESS') {
    const loginId = request.loginId;

    if (!loginId) {
      sendResponse({ success: false, error: '缺少员工工号' });
      return true;
    }

    // 使用async处理
    (async () => {
      try {
        const apiUrl = `https://lppms.leapmotor.com/pmapi/ufOAWorkFlow/collectOAProcess?number=${encodeURIComponent(loginId)}`;

        console.log('[Background] 📡 代理查询OA流程:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`);
        }

        const data = await response.json();

        console.log('[Background] ✅ OA流程查询成功');

        // 向sidebar发送结果（需要找到sidebar的标签页）
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'OA_PROCESS_RESULT',
              success: true,
              data: data
            }).catch(err => {
              console.warn('[Background] 发送OA结果失败:', err.message);
            });
          }
        });

        sendResponse({ success: true, data: data });
      } catch (error) {
        console.error('[Background] ❌ OA流程查询失败:', error.message);

        // 向sidebar发送错误信息
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'OA_PROCESS_RESULT',
              success: false,
              error: error.message
            }).catch(() => {});
          }
        });

        sendResponse({ success: false, error: error.message });
      }
    })();

    return true;
  }

  // 处理OA待办查询请求（代理模式，URL由sidebar配置）
  if (request.type === 'FETCH_OA_TODO') {
    const url = request.url;

    if (!url || !/^https?:\/\//i.test(url)) {
      sendResponse({ success: false, error: '待办接口地址无效' });
      return true;
    }

    (async () => {
      try {
        console.log('[Background] 📡 代理查询OA待办:', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`);
        }

        const data = await response.json();
        console.log('[Background] ✅ OA待办查询成功');
        sendResponse({ success: true, data: data });
      } catch (error) {
        console.error('[Background] ❌ OA待办查询失败:', error.message);
        sendResponse({ success: false, error: error.message });
      }
    })();

    return true;
  }

  // E10 REST API待办获取函数
  async function fetchE10Todos(baseUrl) {
    const url = baseUrl.replace(/\/+$/, '');
    const hostname = url.replace(/^https?:\/\//, '').split('.')[0];
    const items = [];
    let total = 0;

    const e10Endpoints = [
      '/api/e10/wflRequestListRest',
      '/api/wflRequestListRest',
      '/api/e10/workflow/getTodoList',
      '/api/e10/workflow/getDoingList',
      '/api/workflow/getTodoList',
      '/api/workflow/getDoingList',
      '/api/rest/workflow/getTodoList',
      '/api/rest/wflRequestListRest',
      '/sp/api/e10/wflRequestListRest',
      '/sp/api/workflow/getTodoList',
      '/ec/rest/workflow/getTodoList',
      '/ec/api/workflow/getTodoList'
    ];

    for (const ep of e10Endpoints) {
      if (items.length > 0) break;
      try {
        // 尝试先获取E10 token
        let authToken = '';
        try {
          console.log(`[Background] E10 ${hostname} 尝试获取token...`);
          const tokenResp = await fetch(`${url}/api/ec/dev/auth/applyToken`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'include'
          });
          console.log(`[Background] E10 ${hostname} applyToken: HTTP ${tokenResp.status}`);
          if (tokenResp.ok) {
            const tokenText = await tokenResp.text();
            console.log(`[Background] E10 ${hostname} applyToken响应:`, tokenText.substring(0, 300));
            try {
              const tokenData = JSON.parse(tokenText);
              authToken = tokenData.token || tokenData.data?.token || tokenData.access_token || tokenData.data?.access_token || '';
              if (authToken) console.log(`[Background] E10 ${hostname} ✅获取到token: ${authToken.substring(0, 20)}...`);
              else console.log(`[Background] E10 ${hostname} applyToken响应中无token字段, keys:`, Object.keys(tokenData));
            } catch (e) { console.log(`[Background] E10 ${hostname} applyToken非JSON`); }
          }
        } catch (e) {}

        const headers = {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': '*/*'
        };
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
          headers['Token'] = authToken;
        }

        const resp = await fetch(`${url}${ep}`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            pageSize: 20,
            pageNo: 1,
            condition: { status: 'running' }
          }),
          credentials: 'include'
        });
        const text = await resp.text();
        console.log(`[Background] E10 ${hostname} ${ep}: HTTP ${resp.status}, 前300字符:`, text.substring(0, 300));
        if (resp.ok) {
          try {
            const data = JSON.parse(text);
            const parsed = parseEcologyResponse(data);
            if (parsed.length > 0) {
              total = data.data?.total || data.total || parsed.length;
              parsed.forEach(it => { it.sourceSystem = hostname; it.sourceUrl = url; });
              items.push(...parsed);
              console.log('[Background] ✅ E10待办:', items.length, 'from', hostname, 'via', ep);
            }
          } catch (e) {}
        }
      } catch (e) { console.warn('[Background] E10异常:', hostname, ep, e.message); }
    }

    return { items, total, system: hostname };
  }

  // 处理泛微e-cology待办获取请求（session cookie认证）
  if (request.type === 'FETCH_ECOLOGY_TODO') {
    const baseUrl = (request.baseUrl || '').replace(/\/+$/, '');
    const empId = request.employeeId || '';
    const e10Urls = (request.e10Urls || []).filter(u => u.trim());

    if (!baseUrl && e10Urls.length === 0) {
      sendResponse({ success: false, error: '请先在设置中配置OA系统地址' });
      return true;
    }

    (async () => {
      // 在try外部声明，确保catch块也能访问
      let e10Items = [];
      let e10Total = 0;

      try {
        // E10系统并行获取
        const e10Promises = e10Urls.map(url => fetchE10Todos(url));
        const e10Results = await Promise.all(e10Promises);
        e10Items = e10Results.flatMap(r => r.items);
        e10Total = e10Results.reduce((sum, r) => sum + r.total, 0);

        if (!baseUrl) {
          // 只配了E10，没有E9
          if (e10Items.length > 0) {
            sendResponse({ success: true, data: { items: e10Items, total: e10Total } });
          } else {
            sendResponse({ success: false, error: 'E10系统未获取到待办数据。请检查：1)已在浏览器登录E10系统 2)Service Worker控制台日志' });
          }
          return;
        }

        console.log('[Background] 📡 泛微e-cology E9待办查询:', baseUrl);

        const ecHeaders = {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': '*/*'
        };

        // Step0: 先调doingBaseInfo验证连通性
        let treeData = null;
        try {
          const baseForm = new URLSearchParams();
          baseForm.append('actiontype', 'baseinfo');
          baseForm.append('viewScope', 'doing');
          const resp0 = await fetch(`${baseUrl}/api/workflow/reqlist/doingBaseInfo`, {
            method: 'POST', headers: ecHeaders, body: baseForm.toString(), credentials: 'include'
          });
          if (resp0.ok) {
            const data0 = await resp0.json();
            console.log('[Background] doingBaseInfo完整响应keys:', Object.keys(data0));
            // 打印conditioninfo（可能包含数据URL配置）
            if (data0.conditioninfo) {
              const ciStr = JSON.stringify(data0.conditioninfo);
              console.log('[Background] conditioninfo前500字符:', ciStr.substring(0, 500));
            }
            if (data0.countcfg) {
              console.log('[Background] countcfg:', JSON.stringify(data0.countcfg).substring(0, 300));
            }
            treeData = data0.treedata || data0.treeData;
            if (treeData) {
              console.log('[Background] treedata前300字符:', JSON.stringify(treeData).substring(0, 300));
            }
          }
        } catch (e) { console.warn('[Background] doingBaseInfo失败:', e.message); }

        // Step1: 获取splitPageKey（sessionkey）
        const formData = new URLSearchParams();
        formData.append('actiontype', 'splitpage');
        formData.append('viewScope', 'doing');
        formData.append('complete', '0');
        formData.append('method', 'all');
        formData.append('viewcondition', '0');

        const resp1 = await fetch(`${baseUrl}/api/workflow/reqlist/splitPageKey`, {
          method: 'POST',
          headers: ecHeaders,
          body: formData.toString(),
          credentials: 'include'
        });

        if (!resp1.ok) throw new Error(`splitPageKey HTTP ${resp1.status}`);
        const respText1 = await resp1.text();
        console.log('[Background] splitPageKey原始响应(前500字符):', respText1.substring(0, 500));

        let data1;
        try { data1 = JSON.parse(respText1); } catch (e) {
          throw new Error('splitPageKey返回非JSON格式（可能未登录或被重定向）');
        }

        // 尝试从多种结构中提取sessionkey
        const sessionkey = data1.sessionkey || data1.sessionKey || data1.data?.sessionkey || data1.data?.sessionKey;
        console.log('[Background] sessionkey:', sessionkey ? '✓获取到' : '✗未获取到');
        console.log('[Background] splitPageKey完整keys:', Object.keys(data1).join(', '));

        // 即使有sessionkey，也先检查响应本身是否包含列表数据
        let items = parseEcologyResponse(data1);
        if (items.length > 0) {
          console.log('[Background] ✅ 泛微待办(splitPageKey直返):', items.length);
          sendResponse({ success: true, data: { items, total: items.length } });
          return;
        }

        if (!sessionkey) {
          // 如果有treeData说明API连通但没有待办
          if (treeData) {
            sendResponse({ success: false, error: 'API连通但未获取到待办数据（sessionkey为空）。请检查是否有待办事项' });
            return;
          }
          throw new Error('未获取到sessionkey，且无直接列表数据');
        }

        // Step2: 用sessionkey获取实际列表数据
        items = [];
        let total = 0;

        // 尝试E10 REST API（wflRequestListRest）
        const e10Endpoints = [
          '/api/e10/wflRequestListRest',
          '/api/wflRequestListRest',
          '/api/e10/workflow/getTodoList',
          '/api/e10/workflow/getDoingList'
        ];
        for (const ep of e10Endpoints) {
          if (items.length > 0) break;
          try {
            const respE10 = await fetch(`${baseUrl}${ep}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': '*/*'
              },
              body: JSON.stringify({
                pageSize: 20,
                pageNo: 1,
                condition: { status: 'running' }
              }),
              credentials: 'include'
            });
            const e10Text = await respE10.text();
            console.log(`[Background] E10 REST ${ep}: HTTP ${respE10.status}, 前500字符:`, e10Text.substring(0, 500));
            if (respE10.ok) {
              let e10Data;
              try {
                e10Data = JSON.parse(e10Text);
                items = parseEcologyResponse(e10Data);
                if (items.length > 0) {
                  total = e10Data.data?.total || e10Data.total || items.length;
                  console.log('[Background] ✅ 泛微待办(E10 REST):', items.length, 'via', ep);
                }
              } catch (e) {}
            }
          } catch (e) { console.warn('[Background] E10 REST异常:', ep, e.message); }
        }

        // 尝试JSP旧式接口（不受API版本影响）
        const jspPaths = [
          '/requestControl/requestList.jsp?righttype=doing&subrighttype=0&pagesize=20&pageno=1',
          '/workflow/request/RequestList.jsp?status=doing&pagesize=20&pageno=1',
          '/request/requestList.jsp?righttype=doing&pagesize=20&pageno=1'
        ];
        for (const jspPath of jspPaths) {
          if (items.length > 0) break;
          try {
            const respJsp = await fetch(`${baseUrl}${jspPath}`, {
              method: 'GET',
              headers: { 'Accept': 'text/html,*/*', 'X-Requested-With': 'XMLHttpRequest' },
              credentials: 'include'
            });
            const jspText = await respJsp.text();
            console.log(`[Background] JSP ${jspPath}: HTTP ${respJsp.status}, 前500字符:`, jspText.substring(0, 500));
            if (respJsp.ok && (jspText.includes('requestid') || jspText.includes('requestname') || jspText.includes('requestName'))) {
              items = parseJspTodoList(jspText);
              if (items.length > 0) {
                total = items.length;
                console.log('[Background] ✅ 泛微待办(JSP):', items.length);
              }
            }
          } catch (e) { console.warn('[Background] JSP接口异常:', jspPath, e.message); }
        }

        // 尝试旧版JSP数据端点（返回JSON）
        if (items.length === 0) {
          const jspDataPaths = [
            { path: '/workflow/request/RequestListData.jsp', method: 'POST' },
            { path: '/RequestListData.jsp', method: 'POST' },
            { path: '/workflow/request/RequestListData.jsp', method: 'GET' },
            { path: '/workflow/request/RequestList.jsp', method: 'POST' },
            { path: '/workflow/request/RequestList.jsp?method=getData', method: 'POST' },
            { path: '/workflow/request/RequestList.jsp?method=getData', method: 'GET' },
            { path: '/workflow/request/RequestList.jsp?action=getdata', method: 'POST' },
            { path: '/workflow/request/RequestList.jsp?action=list', method: 'POST' }
          ];
          for (const { path: jp, method } of jspDataPaths) {
            if (items.length > 0) break;
            try {
              const reqData = new URLSearchParams();
              reqData.append('sessionkey', sessionkey);
              reqData.append('pageNo', '1');
              reqData.append('pageSize', '20');
              reqData.append('righttype', 'doing');
              const url = method === 'GET'
                ? `${baseUrl}${jp}&${reqData.toString()}`
                : `${baseUrl}${jp}`;
              const opts = { method, headers: ecHeaders, credentials: 'include' };
              if (method === 'POST') opts.body = reqData.toString();
              const respJd = await fetch(url, opts);
              const jdText = await respJd.text();
              console.log(`[Background] JSP数据 ${jp}(${method}): HTTP ${respJd.status}, 前500字符:`, jdText.substring(0, 500));
              if (respJd.ok) {
                try {
                  const jdData = JSON.parse(jdText);
                  items = parseEcologyResponse(jdData);
                  if (items.length > 0) {
                    total = jdData.total || jdData.totalCount || items.length;
                    console.log('[Background] ✅ 泛微待办(JSP数据):', items.length, 'via', jp);
                  }
                } catch (e) {
                  // 不是JSON，尝试HTML解析
                  if (jdText.includes('requestid') || jdText.includes('requestname')) {
                    items = parseJspTodoList(jdText);
                    if (items.length > 0) {
                      total = items.length;
                      console.log('[Background] ✅ 泛微待办(JSP-HTML):', items.length, 'via', jp);
                    }
                  }
                }
              }
            } catch (e) { console.warn('[Background] JSP数据异常:', jp, e.message); }
          }
        }

        // 尝试从RequestList.jsp页面源码中提取API路径和数据
        if (items.length === 0) {
          try {
            // 先用sessionkey POST访问，可能会渲染出数据
            const formData = new URLSearchParams();
            formData.append('sessionkey', sessionkey);
            formData.append('righttype', 'doing');
            formData.append('pageNo', '1');
            formData.append('pageSize', '20');
            formData.append('isajax', '1');
            const respPage = await fetch(`${baseUrl}/workflow/request/RequestList.jsp`, {
              method: 'POST',
              headers: ecHeaders,
              body: formData.toString(),
              credentials: 'include'
            });
            const pageHtml = await respPage.text();
            console.log('[Background] RequestList.jsp(POST+sessionkey)长度:', pageHtml.length, '字符');

            // 1. 搜索全页中的 requestid 出现次数
            const requestIdMatches = pageHtml.match(/requestid[=:]["']*\s*(\d{3,})/gi);
            console.log('[Background] RequestList.jsp中requestid出现次数:', requestIdMatches ? requestIdMatches.length : 0);
            if (requestIdMatches && requestIdMatches.length > 0) {
              console.log('[Background] 前几个requestid匹配:', requestIdMatches.slice(0, 5));
            }

            // 2. 搜索AJAX URL模式
            const ajaxUrls = pageHtml.match(/url\s*[:=]\s*["']([^"']{10,})["']/gi);
            if (ajaxUrls) {
              console.log('[Background] RequestList.jsp中AJAX URL:', [...new Set(ajaxUrls.map(m => m.match(/["']([^"']+)["']/)?.[1]).filter(Boolean))].slice(0, 10));
            }

            // 3. 搜索 ajax/getJSON/post 调用
            const ajaxCalls = pageHtml.match(/\.(?:ajax|getJSON|post|get)\s*\(\s*["']([^"']+)["']/gi);
            if (ajaxCalls) {
              console.log('[Background] RequestList.jsp中ajax调用:', [...new Set(ajaxCalls.map(m => m.match(/["']([^"']+)["']/)?.[1]).filter(Boolean))].slice(0, 10));
            }

            // 4. 尝试直接解析页面中的待办数据
            items = parseJspTodoList(pageHtml);
            if (items.length > 0) {
              total = items.length;
              console.log('[Background] ✅ 泛微待办(JSP页面解析):', items.length);
            } else {
              // 搜索页面中的JSON数据块
              const jsonMatches = pageHtml.match(/var\s+\w+\s*=\s*(\{[^;]{100,}?\});/gi);
              if (jsonMatches) {
                console.log('[Background] RequestList.jsp中发现JSON变量:', jsonMatches.length, '个');
                for (const jm of jsonMatches.slice(0, 5)) {
                  try {
                    const jsonStr = jm.match(/=\s*(\{[\s\S]*\})\s*;/)?.[1];
                    if (jsonStr && jsonStr.includes('request')) {
                      const obj = JSON.parse(jsonStr);
                      const parsed = parseEcologyResponse(obj);
                      if (parsed.length > 0) {
                        items = parsed;
                        total = items.length;
                        console.log('[Background] ✅ 泛微待办(JS变量解析):', items.length);
                        break;
                      }
                    }
                  } catch (e) {}
                }
              }
              // 搜索JS中的API路径
              const apiMatches = pageHtml.match(/["'](\/api\/[^"']*?(?:table|data|list|doing|request)[^"']*?)["']/gi);
              if (apiMatches) {
                console.log('[Background] RequestList.jsp中发现API路径:', [...new Set(apiMatches.map(m => m.replace(/["']/g, '')))].slice(0, 10));
              }
              // 搜索JS文件路径
              const jsFiles = pageHtml.match(/src=["']([^"']*\.js[^"']*)["']/gi);
              if (jsFiles) {
                console.log('[Background] RequestList.jsp加载的JS文件:', jsFiles.slice(0, 5));
              }
              // 打印页面后半部分（可能包含表格数据）
              const midIdx = Math.floor(pageHtml.length / 2);
              console.log('[Background] RequestList.jsp中间部分(500字符):', pageHtml.substring(midIdx, midIdx + 500));

              // 搜索页面中所有script内联代码中的API端点
              const inlineScripts = pageHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
              if (inlineScripts) {
                const allInline = inlineScripts.map(s => s.replace(/<\/?script[^>]*>/gi, '')).join('\n');
                // 搜索ajax url
                const ajaxInInline = allInline.match(/["'](\/(?:api|workflow|request)[^"']{5,})["']/gi);
                if (ajaxInInline) {
                  console.log('[Background] 内联JS中发现的API路径:', [...new Set(ajaxInInline.map(m => m.replace(/["']/g, '')))].slice(0, 15));
                }
                // 搜索 splitPage 相关调用
                const splitCalls = allInline.match(/splitPage[A-Za-z]*\s*\([^)]*\)/gi);
                if (splitCalls) {
                  console.log('[Background] splitPage调用:', splitCalls.slice(0, 5));
                }
                // 搜索 getTableData 调用
                const tableCalls = allInline.match(/(?:getTable|tableData|loadData|refreshData|queryData)\s*\([^)]*\)/gi);
                if (tableCalls) {
                  console.log('[Background] table数据调用:', tableCalls.slice(0, 5));
                }
                // 打印前2000字符的内联JS
                console.log('[Background] 内联JS(前2000字符):', allInline.substring(0, 2000));
              }

              // 尝试fetch JS文件并搜索API端点
              const jsPaths = ['/js/init_wev8.js', '/js/wbusb_wev8.js', '/js/jquery.table_wev8.js'];
              for (const jsPath of jsPaths) {
                try {
                  const jsResp = await fetch(`${baseUrl}${jsPath}`, { credentials: 'include' });
                  if (jsResp.ok) {
                    const jsText = await jsResp.text();
                    // 搜索JS中的API路径模式
                    const apiInJs = jsText.match(/["'](\/(?:api|workflow|request)[^"']{5,}?(?:list|data|table|doing|request)[^"']*)["']/gi);
                    if (apiInJs) {
                      console.log(`[Background] ${jsPath}中发现API路径:`, [...new Set(apiInJs.map(m => m.replace(/["']/g, '')))].slice(0, 10));
                    }
                    // 搜索 ajax url 赋值
                    const urlAssigns = jsText.match(/url\s*[:=]\s*["']([^"']{10,})["']/gi);
                    if (urlAssigns) {
                      const urls = [...new Set(urlAssigns.map(m => m.match(/["']([^"']+)["']/)?.[1]).filter(u => u.includes('/') && !u.startsWith('http://') && !u.startsWith('https://')))].slice(0, 10);
                      if (urls.length > 0) console.log(`[Background] ${jsPath}中url赋值:`, urls);
                    }
                  }
                } catch (e) {}
              }
            }
          } catch (e) { console.warn('[Background] 页面源码分析失败:', e.message); }
        }

        // 尝试更多reqlist下的端点
        if (items.length === 0) {

        const tableEndpoints = [
          '/api/workflow/reqlist/getTableDataList',
          '/api/ec/dev/table/getTableDataList',
          '/api/ec/dev/table/getTableData',
          '/api/workflow/reqlist/getDoingList',
          '/api/workflow/reqlist/getTableData',
          '/api/workflow/reqlist/splitPageList',
          '/api/workflow/reqlist/getListData',
          '/api/workflow/reqlist/doingListData',
          '/api/workflow/reqlist/getDoingData',
          '/api/workflow/center/getDoingList',
          '/api/workflow/center/getTodoList',
          '/api/workflow/reqlist/dataList',
          '/api/workflow/reqlist/listData',
          '/api/workflow/reqlist/getData',
          '/api/workflow/reqlist/queryList',
          '/api/workflow/reqlist/searchList',
          '/api/workflow/reqlist/doingList',
          '/api/workflow/reqlist/getDoingListData',
          '/api/workflow/reqlist/todoList',
          '/api/workflow/reqlist/getTodoList',
          '/api/workflow/reqlist/requestList',
          '/api/workflow/reqlist/getRequestList'
        ];

        for (const ep of tableEndpoints) {
          try {
            const reqData = new URLSearchParams();
            reqData.append('sessionkey', sessionkey);
            reqData.append('pageNo', '1');
            reqData.append('pageSize', '20');

            const resp2 = await fetch(`${baseUrl}${ep}`, {
              method: 'POST',
              headers: ecHeaders,
              body: reqData.toString(),
              credentials: 'include'
            });

            const respText2 = await resp2.text();
            console.log(`[Background] 列表接口 ${ep}: HTTP ${resp2.status}, 前300字符:`, respText2.substring(0, 300));

            if (!resp2.ok) continue;

            let data2;
            try { data2 = JSON.parse(respText2); } catch (e) {
              console.warn('[Background] 列表接口', ep, '非JSON响应');
              continue;
            }
            console.log('[Background] 列表接口', ep, 'keys:', Object.keys(data2));
            items = parseEcologyResponse(data2);
            if (items.length > 0) {
              total = data2.total || data2.totalCount || data2.data?.total || items.length;
              console.log('[Background] ✅ 泛微待办列表:', items.length, 'via', ep);
              break;
            }
          } catch (e) {
            console.warn('[Background] 列表接口异常:', ep, e.message);
          }
        }

        } // end if (items.length === 0)

        // Step3: 如果仍未获取到，尝试移动端和集成接口
        if (items.length === 0) {
          const altEndpoints = [
            { path: '/api/workflow/mobile/getTodoList', method: 'GET', params: { pageNo: '1', pageSize: '20' } },
            { path: '/api/workflow/getToDoRequest', method: 'POST', params: { userId: empId, pageNo: '1', pageSize: '20' } },
            { path: '/api/integration/workflow/getTodoList', method: 'GET', params: { userId: empId, pageNo: '1', pageSize: '20' } },
            { path: '/api/workflow/reqlist/doingList', method: 'POST', params: { pageNo: '1', pageSize: '20', viewScope: 'doing' } },
            { path: '/api/workflow/reqlist/getDoingRequests', method: 'POST', params: { pageNo: '1', pageSize: '20', viewScope: 'doing' } }
          ];

          for (const { path: ep, method, params } of altEndpoints) {
            try {
              const url = method === 'GET'
                ? `${baseUrl}${ep}?${new URLSearchParams(params)}`
                : `${baseUrl}${ep}`;
              const opts = { method, headers: ecHeaders, credentials: 'include' };
              if (method === 'POST') {
                const reqData = new URLSearchParams();
                Object.entries(params).forEach(([k, v]) => reqData.append(k, v));
                opts.body = reqData.toString();
              }
              const resp3 = await fetch(url, opts);
              const respText3 = await resp3.text();
              console.log(`[Background] 备选接口 ${ep}: HTTP ${resp3.status}, 前300字符:`, respText3.substring(0, 300));
              if (resp3.ok) {
                let data3;
                try { data3 = JSON.parse(respText3); } catch (e) { continue; }
                items = parseEcologyResponse(data3);
                if (items.length > 0) {
                  total = items.length;
                  console.log('[Background] ✅ 泛微待办(备选):', items.length, 'via', ep);
                  break;
                }
              }
            } catch (e) {
              console.warn('[Background] 备选接口异常:', ep, e.message);
            }
          }
        }

        // Step4: 尝试旧版e-cology搜索接口和GET方式JSP
        if (items.length === 0) {
          const oldEndpoints = [
            { path: `/workflow/request/RequestList.jsp?righttype=doing&subrighttype=0&pagesize=20&pageno=1&sessionkey=${encodeURIComponent(sessionkey)}`, method: 'GET' },
            { path: `/workflow/request/RequestList.jsp?viewScope=doing&sessionkey=${encodeURIComponent(sessionkey)}&pagesize=20&pageno=1`, method: 'GET' },
            { path: `/api/workflow/searchResult?viewScope=doing&pageSize=20&pageNo=1`, method: 'GET' },
            { path: `/api/workflow/request/getRequestList?viewScope=doing&pageSize=20&pageNo=1`, method: 'GET' },
            { path: `/workflow/searchResult.jsp?viewScope=doing&pageSize=20&pageNo=1`, method: 'GET' },
            { path: `/request/SearchRequest.jsp?viewScope=doing&pageSize=20&pageNo=1`, method: 'GET' },
            { path: `/api/workflow/reqlist/splitPageKey`, method: 'POST', extraParams: { actiontype: 'listdata', sessionkey: sessionkey, pageNo: '1', pageSize: '20' } }
          ];

          for (const { path: ep, method, extraParams } of oldEndpoints) {
            if (items.length > 0) break;
            try {
              const opts = { method, headers: { 'Accept': 'text/html,application/json,*/*', 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'include' };
              if (method === 'POST' && extraParams) {
                const reqData = new URLSearchParams();
                Object.entries(extraParams).forEach(([k, v]) => reqData.append(k, v));
                opts.body = reqData.toString();
                opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
              }
              const resp4 = await fetch(`${baseUrl}${ep}`, opts);
              const respText4 = await resp4.text();
              console.log(`[Background] 旧版接口 ${ep.substring(0, 60)}: HTTP ${resp4.status}, 前500字符:`, respText4.substring(0, 500));
              if (resp4.ok) {
                // 先尝试JSON
                try {
                  const data4 = JSON.parse(respText4);
                  items = parseEcologyResponse(data4);
                  if (items.length > 0) {
                    total = items.length;
                    console.log('[Background] ✅ 泛微待办(旧版JSON):', items.length);
                    break;
                  }
                } catch (e) {}
                // 再尝试HTML解析
                items = parseJspTodoList(respText4);
                if (items.length > 0) {
                  total = items.length;
                  console.log('[Background] ✅ 泛微待办(旧版JSP):', items.length);
                  break;
                }
              }
            } catch (e) {
              console.warn('[Background] 旧版接口异常:', ep.substring(0, 40), e.message);
            }
          }
        }

        if (items.length === 0) {
          let countInfo = '';
          try {
            const countForm = new URLSearchParams();
            countForm.append('actiontype', 'countinfo');
            countForm.append('viewScope', 'doing');
            const respC = await fetch(`${baseUrl}/api/workflow/reqlist/doingCountInfo`, {
              method: 'POST', headers: ecHeaders, body: countForm.toString(), credentials: 'include'
            });
            if (respC.ok) {
              const dataC = await respC.json();
              const tc = dataC.totalcount || dataC.totalCount || {};
              const doing = tc.flowDoing || tc.flowAll || '0';
              console.log('[Background] doingCountInfo待办数:', doing);
              countInfo = `（E9系统显示待办数: ${doing}）`;
            }
          } catch (e) { console.warn('[Background] doingCountInfo失败:', e.message); }

          // 合并E10结果
          if (e10Items.length > 0) {
            sendResponse({ success: true, data: { items: e10Items, total: e10Total, e9Failed: true, e9Info: countInfo } });
          } else {
            sendResponse({ success: false, error: `E9系统${countInfo}未获取到待办列表数据（组件库未安装）。E10系统也未获取到数据。请检查Service Worker控制台日志` });
          }
        } else {
          // E9获取成功，标记来源并合并E10
          items.forEach(it => { if (!it.sourceSystem) { it.sourceSystem = 'oa'; it.sourceUrl = baseUrl; } });
          const allItems = [...items, ...e10Items];
          const allTotal = total + e10Total;
          console.log('[Background] ✅ 合并待办: E9', items.length, '+ E10', e10Items.length, '=', allItems.length);
          sendResponse({ success: true, data: { items: allItems, total: allTotal } });
        }
      } catch (error) {
        console.error('[Background] ❌ E9待办查询失败:', error.message);
        // E9失败，但E10可能有数据
        if (e10Items.length > 0) {
          sendResponse({ success: true, data: { items: e10Items, total: e10Total, e9Failed: true, e9Error: error.message } });
        } else {
          const hint = error.message.includes('HTTP 401') || error.message.includes('HTTP 403')
            ? '请先在浏览器中登录泛微e-cology系统'
            : error.message;
          sendResponse({ success: false, error: hint });
        }
      }
    })();

    return true;
  }

  // 处理DOM注入方式获取待办（方案A：读取已打开的OA页面DOM）
  if (request.type === 'EXTRACT_DOM_TODOS') {
    const oaUrls = request.oaUrls || [];
    if (oaUrls.length === 0) {
      sendResponse({ success: false, error: '请先在设置中配置OA系统地址' });
      return true;
    }

    (async () => {
      try {
        // 查找匹配OA域名的标签页
        const allTabs = await chrome.tabs.query({});
        const oaTabs = allTabs.filter(tab => {
          if (!tab.url) return false;
          try {
            const tabUrl = new URL(tab.url);
            return oaUrls.some(oaUrl => {
              try {
                const oaHostname = new URL(oaUrl).hostname;
                return tabUrl.hostname === oaHostname;
              } catch (e) { return false; }
            });
          } catch (e) { return false; }
        });

        if (oaTabs.length === 0) {
          sendResponse({
            success: false,
            error: 'no_oa_tab',
            oaUrls: oaUrls,
            hint: '请在浏览器中打开OA待办页面后再刷新列表'
          });
          return;
        }

        console.log('[Background] 找到OA标签页:', oaTabs.map(t => `${t.title} (${t.url.substring(0, 50)}...)`));

        const allItems = [];

        for (const tab of oaTabs) {
          try {
            const results = await chrome.scripting.executeScript({
              target: { tabId: tab.id, allFrames: true },
              func: extractTodoFromDOM
            });

            // allFrames: true 时返回多个frame的结果
            for (const result of results) {
              if (result.result && result.result.length > 0) {
                const items = result.result;
                if (items[0] && items[0].title === '__IFRAME_DETECTED__') {
                  console.log('[Background] 检测到iframe:', items[0].raw);
                  continue; // 继续看其他frame的结果
                }
                const hostname = new URL(tab.url).hostname.replace(/\./g, '_').split('_')[0];
                items.forEach(it => {
                  it.sourceSystem = hostname;
                  it.sourceTabId = tab.id;
                  it.sourceUrl = new URL(tab.url).origin;
                });
                allItems.push(...items);
                console.log('[Background] ✅ DOM提取:', items.length, 'from', tab.title, result.frameId !== undefined ? `(frame:${result.frameId})` : '');
              }
            }
          } catch (e) {
            console.warn('[Background] DOM注入失败:', tab.url, e.message);
          }
        }

        if (allItems.length > 0) {
          sendResponse({ success: true, data: { items: allItems, total: allItems.length } });
        } else {
          sendResponse({
            success: false,
            error: 'dom_empty',
            hint: '找到OA页面但未提取到待办数据，请确保页面已加载完成并显示待办列表'
          });
        }
      } catch (error) {
        console.error('[Background] DOM提取失败:', error.message);
        sendResponse({ success: false, error: error.message });
      }
    })();

    return true;
  }

  // 处理泛微e-cology流程详情获取请求
  if (request.type === 'FETCH_ECOLOGY_DETAIL') {
    const baseUrl = (request.baseUrl || '').replace(/\/+$/, '');
    const requestId = request.requestId;

    if (!baseUrl || !requestId) {
      sendResponse({ success: false, error: '参数不完整' });
      return true;
    }

    (async () => {
      try {
        console.log('[Background] 📡 泛微流程详情:', requestId);
        const formData = new URLSearchParams();
        formData.append('requestId', requestId);

        const resp = await fetch(`${baseUrl}/api/workflow/getRequest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-with': 'XMLHttpRequest',
            'Accept': '*/*'
          },
          body: formData.toString(),
          credentials: 'include'
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        console.log('[Background] ✅ 流程详情获取成功');
        sendResponse({ success: true, data });
      } catch (error) {
        console.error('[Background] ❌ 流程详情获取失败:', error.message);
        sendResponse({ success: false, error: error.message });
      }
    })();

    return true;
  }

  // 打开热更新独立窗口（sidebar在iframe中无法调用showDirectoryPicker）
  if (request.type === 'OPEN_HOT_UPDATE_WINDOW') {
    const version = request.version || '';
    const url = chrome.runtime.getURL(`sidebar/hot-update.html?v=${Date.now()}&version=${encodeURIComponent(version)}`);
    // Service Worker环境无screen对象，去掉left/top让Chrome自动居中
    chrome.windows.create({
      url: url,
      type: 'popup',
      width: 460,
      height: 420,
      focused: true,
    }, (win) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, windowId: win.id });
      }
    });
    return true;
  }

  if (request.type === 'CAPTURE_TAB') {
    try {
      chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ screenshot: dataUrl });
        }
      });
    } catch (err) {
      sendResponse({ error: err.message });
    }
    return true;
  } else if (request.type === 'GET_TAB_INFO') {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
          sendResponse({ tabInfo: null });
          return;
        }
        const tab = tabs[0];
        sendResponse({
          tabInfo: {
            title: tab.title || '未命名页面',
            url: tab.url || '',
            favIconUrl: tab.favIconUrl || ''
          }
        });
      });
    } catch (err) {
      sendResponse({ tabInfo: null });
    }
    return true;
  } else if (request.type === 'GET_ALL_TABS') {
    try {
      chrome.tabs.query({}, (tabs) => {
        if (chrome.runtime.lastError || !tabs) {
          sendResponse({ tabs: [] });
          return;
        }
        const validTabs = tabs
          .filter(tab => tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://') && !tab.url.startsWith('about:'))
          .map(tab => ({
            id: tab.id,
            title: tab.title || '未命名页面',
            url: tab.url,
            favIconUrl: tab.favIconUrl || '',
            windowId: tab.windowId,
            active: tab.active
          }));
        sendResponse({ tabs: validTabs });
      });
    } catch (err) {
      sendResponse({ tabs: [] });
    }
    return true;
  } else if (request.type === 'CAPTURE_TAB_CONTENT') {
    const tabId = request.tabId;
    if (!tabId) {
      sendResponse({ error: '缺少tabId' });
      return true;
    }
    try {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: extractPageContentFunc
      }, (results) => {
        if (chrome.runtime.lastError || !results || results.length === 0) {
          sendResponse({ error: chrome.runtime.lastError?.message || '无法抓取此页面' });
          return;
        }
        sendResponse({ content: results[0].result });
      });
    } catch (err) {
      sendResponse({ error: err.message });
    }
    return true;
  }
});

function extractPageContentFunc() {
  function cleanText(text) {
    return text.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim();
  }

  function extractMainContent() {
    const selectors = ['main', 'article', '[role="main"]', '#content', '.content', '#main', '.main'];
    let contentElement = null;
    for (const selector of selectors) {
      contentElement = document.querySelector(selector);
      if (contentElement && contentElement.innerText.trim().length > 200) break;
    }
    if (!contentElement) {
      const paragraphs = document.querySelectorAll('p');
      let maxLength = 0;
      paragraphs.forEach(p => {
        const parent = p.parentElement;
        if (parent && parent.innerText.length > maxLength) {
          maxLength = parent.innerText.length;
          contentElement = parent;
        }
      });
    }
    if (!contentElement) contentElement = document.body;
    return cleanText(contentElement.innerText).slice(0, 8000);
  }

  function extractTables() {
    const tables = [];
    document.querySelectorAll('table').forEach((table, index) => {
      const rows = [];
      table.querySelectorAll('tr').forEach(tr => {
        const cells = [];
        tr.querySelectorAll('th, td').forEach(cell => { cells.push(cleanText(cell.innerText)); });
        if (cells.length > 0) rows.push(cells);
      });
      if (rows.length > 0) tables.push({ index, rows: rows.slice(0, 20) });
    });
    return tables.slice(0, 5);
  }

  function extractLists() {
    const lists = [];
    document.querySelectorAll('ul, ol').forEach((list) => {
      const items = [];
      list.querySelectorAll('li').forEach(li => {
        const text = cleanText(li.innerText);
        if (text && !li.querySelector('ul, ol')) items.push(text);
      });
      if (items.length > 0 && items.length < 50) lists.push({ type: list.tagName.toLowerCase(), items: items.slice(0, 30) });
    });
    return lists.slice(0, 5);
  }

  function extractHeadings() {
    const headings = [];
    document.querySelectorAll('h1, h2, h3').forEach(h => {
      const text = cleanText(h.innerText);
      if (text) headings.push({ level: parseInt(h.tagName[1]), text });
    });
    return headings.slice(0, 20);
  }

  function extractImportantLinks() {
    const links = [];
    document.querySelectorAll('a[href]').forEach(a => {
      const text = cleanText(a.innerText);
      const href = a.href;
      if (text && href && !href.startsWith('javascript:') && text.length > 3) links.push({ text: text.slice(0, 100), href });
    });
    return links.slice(0, 20);
  }

  return {
    title: document.title,
    url: window.location.href,
    metaDescription: document.querySelector('meta[name="description"]')?.content || '',
    mainContent: extractMainContent(),
    tables: extractTables(),
    lists: extractLists(),
    headings: extractHeadings(),
    links: extractImportantLinks(),
    timestamp: new Date().toISOString()
  };
}
