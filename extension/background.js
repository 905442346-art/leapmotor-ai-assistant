// ========== 右键菜单：选中文本AI操作 ==========
// 泛微e-cology响应解析：归一化各种返回结构为统一数组
function parseEcologyResponse(data) {
  if (!data) return [];
  let arr = data;
  if (!Array.isArray(arr)) {
    arr = data.data || data.list || data.rows || data.result || data.records || data.datas;
    if (arr && !Array.isArray(arr)) {
      arr = arr.list || arr.records || arr.rows || arr.data || arr.datas || [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr.map(it => {
    if (typeof it === 'string') return { title: it, url: '', requestId: '' };
    const title = it.requestname || it.title || it.name || it.workflowName || it.taskName || it.subject || it.desc || '待办事项';
    const requestId = it.requestid || it.requestId || it.id || '';
    const url = it.pcurl || it.url || it.link || it.workflowUrl || it.href || it.taskUrl || it.detailUrl ||
      (requestId ? '' : '');
    const creator = it.creatname || it.creator || it.createrName || it.nodename || '';
    const workflowName = it.workflowname || it.workflowName || it.flowType || '';
    const createdate = it.createdate || it.createDate || it.createtime || '';
    const nodename = it.nodename || it.nodeName || it.currentnode || '';
    return { title, url, requestId, creator, workflowName, createdate, nodename, raw: it };
  }).filter(it => it.title && it.title !== '待办事项');
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

  // 处理泛微e-cology待办获取请求（session cookie认证）
  if (request.type === 'FETCH_ECOLOGY_TODO') {
    const baseUrl = (request.baseUrl || '').replace(/\/+$/, '');
    const empId = request.employeeId || '';

    if (!baseUrl) {
      sendResponse({ success: false, error: 'e-cology系统地址未配置' });
      return true;
    }

    (async () => {
      try {
        console.log('[Background] 📡 泛微e-cology待办查询:', baseUrl);

        // Step1: 获取splitPageKey（sessionkey）
        const formData = new URLSearchParams();
        formData.append('actiontype', 'splitpage');
        formData.append('viewScope', 'doing');
        formData.append('complete', '0');
        formData.append('method', 'all');
        formData.append('viewcondition', '0');

        const resp1 = await fetch(`${baseUrl}/api/workflow/reqlist/splitPageKey`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'Accept': 'application/json'
          },
          body: formData.toString(),
          credentials: 'include'
        });

        if (!resp1.ok) throw new Error(`splitPageKey HTTP ${resp1.status}`);
        const data1 = await resp1.json();
        console.log('[Background] splitPageKey响应:', JSON.stringify(data1).substring(0, 200));

        const sessionkey = data1.sessionkey || data1.sessionKey;
        if (!sessionkey) {
          // 某些版本直接返回列表数据
          const items = parseEcologyResponse(data1);
          if (items.length > 0) {
            console.log('[Background] ✅ 泛微待办(splitPageKey直返):', items.length);
            sendResponse({ success: true, data: { items, total: items.length } });
            return;
          }
          throw new Error('未获取到sessionkey或列表数据');
        }

        // Step2: 用sessionkey获取实际列表数据
        let items = [];
        let total = 0;

        // 尝试多个可能的列表数据接口
        const tableEndpoints = [
          '/api/workflow/reqlist/getTableDataList',
          '/api/ec/dev/table/getTableData',
          '/api/workflow/reqlist/getDoingList'
        ];

        for (const ep of tableEndpoints) {
          try {
            const reqData = new URLSearchParams();
            reqData.append('sessionkey', sessionkey);
            reqData.append('pageNo', '1');
            reqData.append('pageSize', '20');

            const resp2 = await fetch(`${baseUrl}${ep}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                'Accept': 'application/json'
              },
              body: reqData.toString(),
              credentials: 'include'
            });

            if (resp2.ok) {
              const data2 = await resp2.json();
              console.log('[Background] 列表接口响应:', ep, JSON.stringify(data2).substring(0, 300));
              items = parseEcologyResponse(data2);
              if (items.length > 0) {
                total = data2.total || data2.totalCount || items.length;
                console.log('[Background] ✅ 泛微待办列表:', items.length, 'via', ep);
                break;
              }
            }
          } catch (e) {
            console.warn('[Background] 列表接口失败:', ep, e.message);
          }
        }

        if (items.length === 0) {
          // 最后尝试getToDoRequest接口
          try {
            const reqData3 = new URLSearchParams();
            reqData3.append('userId', empId);
            reqData3.append('pageNo', '1');
            reqData3.append('pageSize', '20');

            const resp3 = await fetch(`${baseUrl}/api/workflow/getToDoRequest`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                'Accept': 'application/json'
              },
              body: reqData3.toString(),
              credentials: 'include'
            });

            if (resp3.ok) {
              const data3 = await resp3.json();
              console.log('[Background] getToDoRequest响应:', JSON.stringify(data3).substring(0, 300));
              items = parseEcologyResponse(data3);
              total = items.length;
            }
          } catch (e) {
            console.warn('[Background] getToDoRequest失败:', e.message);
          }
        }

        if (items.length === 0) {
          sendResponse({ success: false, error: '已登录但未获取到待办数据，可能需要检查e-cology版本或权限' });
        } else {
          sendResponse({ success: true, data: { items, total } });
        }
      } catch (error) {
        console.error('[Background] ❌ 泛微待办查询失败:', error.message);
        const hint = error.message.includes('HTTP 401') || error.message.includes('HTTP 403')
          ? '请先在浏览器中登录泛微e-cology系统'
          : error.message;
        sendResponse({ success: false, error: hint });
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
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'Accept': 'application/json'
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
