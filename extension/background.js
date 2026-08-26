// ========== 右键菜单：选中文本AI操作 ==========
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

  // 获取E9当前登录用户信息（自动获取工号）
  if (request.type === 'FETCH_E9_USER_INFO') {
    (async () => {
      const baseUrls = ['https://oa.leapmotor.com', 'https://noa.leapmotor.com'];
      for (const baseUrl of baseUrls) {
        try {
          console.log(`[Background] 📡 获取E9用户信息: ${baseUrl}`);
          const response = await fetch(`${baseUrl}/api/hrm/login/getUserAgentInfo`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
          });
          if (!response.ok) continue;
          const ct = response.headers.get('content-type') || '';
          if (!ct.includes('application/json')) continue;
          const data = await response.json();
          console.log(`[Background] ✅ ${baseUrl} E9用户信息获取成功`);
          sendResponse({ success: true, data: data });
          return;
        } catch (e) {
          console.log(`[Background] ${baseUrl} 用户信息失败: ${e.message}`);
        }
      }
      sendResponse({ success: false, error: '未获取到用户信息，请确保已登录OA系统' });
    })();
    return true;
  }

  // 获取E9待办列表（泛微E9标准API，使用当前登录会话，无需工号）
  if (request.type === 'FETCH_E9_TODO') {
    (async () => {
      const baseUrls = ['https://oa.leapmotor.com', 'https://noa.leapmotor.com'];

      // 方案1: 尝试标准E9 RESTful API (多域名+多路径)
      for (const baseUrl of baseUrls) {
        try {
          console.log(`[Background] 📡 E9待办尝试: ${baseUrl}`);

          // 尝试 splitPageKey → getListResult
          const splitResp = await fetch(`${baseUrl}/api/workflow/reqlist/splitPageKey`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ actiontype: 'splitpage', viewScope: 'doing', complete: 0, viewcondition: 0, method: 'all' })
          });

          if (splitResp.ok) {
            const ct = splitResp.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              const splitData = await splitResp.json();
              const sessionkey = splitData.sessionkey;
              if (sessionkey) {
                console.log(`[Background] ✅ ${baseUrl} sessionkey获取成功`);
                const listResp = await fetch(`${baseUrl}/api/workflow/mobile/getListResult`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ sessionkey, pageIndex: 1, pageSize: 20 })
                });
                if (listResp.ok) {
                  const listCt = listResp.headers.get('content-type') || '';
                  if (listCt.includes('application/json')) {
                    const listData = await listResp.json();
                    console.log(`[Background] ✅ ${baseUrl} E9待办列表获取成功`);
                    sendResponse({ success: true, data: listData });
                    return;
                  }
                }
              }
            }
          }
        } catch (e) {
          console.log(`[Background] ${baseUrl} API失败: ${e.message}`);
        }
      }

      // 方案2: 从OA页面DOM提取待办
      try {
        console.log('[Background] 📡 尝试从OA页面DOM提取待办...');
        const tabs = await chrome.tabs.query({ url: '*://oa.leapmotor.com/*' });
        if (tabs.length === 0) {
          // 也尝试 noa 域名
          const noaTabs = await chrome.tabs.query({ url: '*://noa.leapmotor.com/*' });
          if (noaTabs.length === 0) {
            sendResponse({ success: false, error: '未找到OA页面，请先在浏览器中打开 oa.leapmotor.com 并登录' });
            return;
          }
        }

        // 找到OA标签页，注入脚本提取待办
        const oaTabs = tabs.length > 0 ? tabs : await chrome.tabs.query({ url: '*://noa.leapmotor.com/*' });
        const oaTab = oaTabs[0];
        console.log(`[Background] 找到OA标签页: ${oaTab.url}`);

        const results = await chrome.scripting.executeScript({
          target: { tabId: oaTab.id, allFrames: true },
          func: () => {
            const items = [];

            // 方案A: 查找所有包含 requestid 的链接
            const reqLinks = document.querySelectorAll('a[href*="requestid"], a[href*="requestId"], a[href*="workflowid"], a[href*="workflowId"]');
            reqLinks.forEach(link => {
              const title = link.textContent?.trim() || link.title || '';
              const url = link.href || '';
              const match = url.match(/[?&]requestid=(\d+)/i) || url.match(/[?&]requestId=(\d+)/i);
              const requestId = match ? match[1] : '';
              if (title && title.length > 2) {
                items.push({ title, url, requestId, workflowname: '', nodename: '', creater: '', createdate: '' });
              }
            });

            if (items.length > 0) return items;

            // 方案B: 查找表格行（Ant Design / Element UI / 自定义）
            const tableSelectors = [
              '.ant-table-tbody > tr',
              '.el-table__row',
              '.wea-new-idx-content table tbody tr',
              '.wea-table-tbody > tr',
              '.req-list-table tbody tr',
              'table.workflow-list tbody tr',
              '[role="row"]',
              'tbody tr'
            ];

            for (const sel of tableSelectors) {
              const rows = document.querySelectorAll(sel);
              if (rows.length === 0) continue;
              console.log(`[DOM提取] 尝试选择器: ${sel}, 找到 ${rows.length} 行`);

              rows.forEach(row => {
                // 尝试获取行内链接
                const link = row.querySelector('a[href]');
                const title = link?.textContent?.trim() || row.querySelector('td')?.textContent?.trim() || '';
                const url = link?.href || '';
                const match = url.match(/[?&]requestid=(\d+)/i) || url.match(/[?&]requestId=(\d+)/i);
                const requestId = match ? match[1] : '';

                // 尝试提取其他字段
                const cells = row.querySelectorAll('td');
                let creater = '', createdate = '', nodename = '';
                if (cells.length >= 2) creater = cells[1]?.textContent?.trim() || '';
                if (cells.length >= 3) createdate = cells[2]?.textContent?.trim() || '';
                if (cells.length >= 4) nodename = cells[3]?.textContent?.trim() || '';

                if (title && title.length > 2 && !title.includes('暂无数据') && !title.includes('No data')) {
                  items.push({ title, url, requestId, workflowname: '', nodename, creater, createdate });
                }
              });

              if (items.length > 0) break;
            }

            if (items.length > 0) return items;

            // 方案C: 查找所有包含流程标题的点击元素
            const clickables = document.querySelectorAll('[class*="workflow"], [class*="request"], [class*="todo"]');
            clickables.forEach(el => {
              const title = el.textContent?.trim() || '';
              const link = el.querySelector('a[href]') || el.closest('a[href]');
              const url = link?.href || '';
              const match = url.match(/[?&]requestid=(\d+)/i) || url.match(/[?&]requestId=(\d+)/i);
              const requestId = match ? match[1] : '';
              if (title && title.length > 4 && title.length < 200 && !title.includes('暂无数据')) {
                items.push({ title, url, requestId, workflowname: '', nodename: '', creater: '', createdate: '' });
              }
            });
            if (items.length > 0) return items;

            // 方案D: 获取页面所有链接，过滤可能的流程链接
            const allLinks = document.querySelectorAll('a[href]');
            allLinks.forEach(link => {
              const title = link.textContent?.trim() || '';
              const url = link.href || '';
              if (title.length > 4 && title.length < 200 &&
                  (url.includes('requestid') || url.includes('workflowId') || url.includes('workflowid') ||
                   url.includes('processDetail') || url.includes('formDetail'))) {
                const match = url.match(/[?&]requestid=(\d+)/i) || url.match(/[?&]requestId=(\d+)/i) || url.match(/\/request\/(\d+)/i);
                const requestId = match ? match[1] : '';
                items.push({ title, url, requestId, workflowname: '', nodename: '', creater: '', createdate: '' });
              }
            });

            if (items.length > 0) return items;

            // 方案E: 最后兜底 - 收集页面DOM信息用于调试
            const bodyText = document.body?.innerText?.substring(0, 3000) || '';
            const allHrefs = Array.from(document.querySelectorAll('a[href]')).map(a => ({text: a.textContent?.trim()?.substring(0, 50), href: a.href})).filter(a => a.text.length > 0).slice(0, 30);
            const iframes = Array.from(document.querySelectorAll('iframe')).map(f => ({src: f.src, id: f.id, name: f.name}));
            return { _debug: true, bodyTextPreview: bodyText.substring(0, 500), sampleLinks: allHrefs, iframes, title: document.title, url: location.href };
          }
        });

        // 合并所有 frame 的结果
        let todoItems = [];
        let debugInfo = null;
        for (const r of results) {
          if (Array.isArray(r.result) && r.result.length > 0) {
            todoItems = todoItems.concat(r.result);
          } else if (r.result && r.result._debug && !debugInfo) {
            debugInfo = r.result;
          }
        }

        if (todoItems.length > 0) {
          console.log(`[Background] DOM提取到 ${todoItems.length} 条待办`);
          sendResponse({ success: true, data: todoItems });
        } else {
          if (debugInfo) {
            console.log('[Background] DOM调试信息:', debugInfo);
            const iframeInfo = debugInfo.iframes?.length > 0 ? `，发现 ${debugInfo.iframes.length} 个iframe: ${debugInfo.iframes.map(f => f.src?.substring(0, 80)).join(', ')}` : '';
            sendResponse({ success: false, error: `页面「${debugInfo.title}」未匹配到待办数据${iframeInfo}` });
          } else {
            sendResponse({ success: false, error: 'OA页面未找到待办列表，请确保已打开待办页面' });
          }
        }
      } catch (domErr) {
        console.error('[Background] DOM提取失败:', domErr.message);
        sendResponse({ success: false, error: '获取待办失败：' + domErr.message });
      }
    })();
    return true;
  }

  // 获取E9流程详情（用于AI智能预审）
  if (request.type === 'FETCH_E9_WORKFLOW_DETAIL') {
    const requestId = request.requestId;
    if (!requestId) {
      sendResponse({ success: false, error: '缺少requestId' });
      return true;
    }
    (async () => {
      const baseUrls = ['https://oa.leapmotor.com', 'https://noa.leapmotor.com'];
      for (const baseUrl of baseUrls) {
        try {
          const apiUrl = `${baseUrl}/api/workflow/getWorkflowRequest?requestId=${encodeURIComponent(requestId)}`;
          console.log('[Background] 📡 获取E9流程详情:', apiUrl);
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
          });
          if (!response.ok) continue;
          const ct = response.headers.get('content-type') || '';
          if (!ct.includes('application/json')) continue;
          const data = await response.json();
          console.log(`[Background] ✅ ${baseUrl} E9流程详情获取成功`);
          sendResponse({ success: true, data: data });
          return;
        } catch (error) {
          console.error(`[Background] ${baseUrl} 流程详情失败:`, error.message);
        }
      }
      sendResponse({ success: false, error: '获取流程详情失败，请确保已登录OA系统' });
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
