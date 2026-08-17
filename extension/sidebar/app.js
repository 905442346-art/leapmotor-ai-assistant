// ========== 零跑AI助手 - 核心应用 ==========

const LP_LOGO_SVG = '<svg width="18" height="18" viewBox="0 0 222 222" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M78.3075218,74.163954 L63.2551941,82.8379344 C62.4800742,83.2871049 62,84.1105841 62,85.0039342 L62,138.001057 C62,138.894407 62.4800742,139.717886 63.2551941,140.167056 L90.4343971,155.828133 C91.2695262,156.307248 92.3146878,155.708354 92.3146878,154.745133 L92.3146878,129.686412 C92.3146878,129.237242 92.0746507,128.827998 91.6895912,128.603413 L80.81791,122.33998 C80.4278497,122.115395 80.1928133,121.706151 80.1928133,121.25698 L80.1928133,75.2469538 C80.1928133,74.2837327 79.1476517,73.6848388 78.3125226,74.163954 L78.3075218,74.163954 Z" fill="currentColor"/><path d="M109.242306,56.3368778 L101.401093,60.8535363 L101.401093,162.146464 L109.242306,166.663122 C110.017425,167.112293 110.972573,167.112293 111.747693,166.663122 L119.588906,162.146464 L119.588906,83.9758329 C119.583905,83.0126118 120.629066,82.4137179 121.464195,82.8928331 L140.18209,93.6779147 C140.57215,93.9024999 140.807187,94.3117441 140.807187,94.7609145 L140.807187,121.261971 C140.807187,121.711142 140.56715,122.120386 140.18209,122.344971 L129.310409,128.608403 C128.920349,128.832989 128.685312,129.242233 128.685312,129.691403 L128.685312,154.750124 C128.685312,155.713345 129.730474,156.312239 130.565603,155.833124 L157.744806,140.172047 C158.519926,139.722877 159,138.899398 159,138.006047 L159,85.0039342 C159,84.1105841 158.519926,83.2871049 157.744806,82.8379344 L111.747693,56.3368778 C110.972573,55.8877074 110.017425,55.8877074 109.242306,56.3368778 Z" fill="currentColor"/></svg>';

const LP_LOGO_LARGE = '<svg width="48" height="48" viewBox="0 0 222 222" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M78.3075218,74.163954 L63.2551941,82.8379344 C62.4800742,83.2871049 62,84.1105841 62,85.0039342 L62,138.001057 C62,138.894407 62.4800742,139.717886 63.2551941,140.167056 L90.4343971,155.828133 C91.2695262,156.307248 92.3146878,155.708354 92.3146878,154.745133 L92.3146878,129.686412 C92.3146878,129.237242 92.0746507,128.827998 91.6895912,128.603413 L80.81791,122.33998 C80.4278497,122.115395 80.1928133,121.706151 80.1928133,121.25698 L80.1928133,75.2469538 C80.1928133,74.2837327 79.1476517,73.6848388 78.3125226,74.163954 L78.3075218,74.163954 Z" fill="currentColor"/><path d="M109.242306,56.3368778 L101.401093,60.8535363 L101.401093,162.146464 L109.242306,166.663122 C110.017425,167.112293 110.972573,167.112293 111.747693,166.663122 L119.588906,162.146464 L119.588906,83.9758329 C119.583905,83.0126118 120.629066,82.4137179 121.464195,82.8928331 L140.18209,93.6779147 C140.57215,93.9024999 140.807187,94.3117441 140.807187,94.7609145 L140.807187,121.261971 C140.807187,121.711142 140.56715,122.120386 140.18209,122.344971 L129.310409,128.608403 C128.920349,128.832989 128.685312,129.242233 128.685312,129.691403 L128.685312,154.750124 C128.685312,155.713345 129.730474,156.312239 130.565603,155.833124 L157.744806,140.172047 C158.519926,139.722877 159,138.899398 159,138.006047 L159,85.0039342 C159,84.1105841 158.519926,83.2871049 157.744806,82.8379344 L111.747693,56.3368778 C110.972573,55.8877074 110.017425,55.8877074 109.242306,56.3368778 Z" fill="currentColor"/></svg>';

let chatHistory = [];
let currentPageContent = null;
let settings = {};
let employeeId = ''; // 员工工号（OA流程查询用）
let uploadedFiles = [];
let capturedPages = [];
let activePageId = 'current';
let selectedTabIds = new Set();
// FastGPT 配置 - 已预配置，用户无需填写
const FASTGPT_CONFIG = {
  enabled: true, // 默认启用智能路由
  apiUrl: 'https://aiflow.leapmotor.com/api',
  apiKey: 'openapi-kQTdGDDkdnMvTNlR1aJYuMpoTwV9HQ9ckYU6LeVT6WsCODCphW4rRmUsU0wzTs',
  workflowId: '6a4b7073b415c3419d9fb95d',
  modelName: '' // 使用工作流默认模型
};

// 平台检测：Mac 或 Windows/Linux
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.userAgent.includes('Macintosh');
const MOD_KEY = isMac ? '⌘' : 'Ctrl';
const SHIFT_MOD = isMac ? '⇧' : 'Shift';

// ========== 快捷键管理 ==========
let customShortcuts = {
  'toggle-assistant': { key: 'j', ctrl: true, shift: false, alt: false, meta: true },  // 默认 Cmd/Ctrl+J
  'analyze-page': { key: 'j', ctrl: true, shift: true, alt: false, meta: true }       // 默认 Cmd/Ctrl+Shift+J
};

let currentRecordingAction = null; // 当前正在录制快捷键的动作

/**
 * 加载用户自定义的快捷键设置
 */
function loadCustomShortcuts() {
  const saved = localStorage.getItem('customShortcuts');
  if (saved) {
    try {
      customShortcuts = JSON.parse(saved);
    } catch(e) {
      console.error('[快捷键] 加载失败:', e);
    }
  }
}

/**
 * 保存自定义快捷键
 */
function saveCustomShortcuts() {
  localStorage.setItem('customShortcuts', JSON.stringify(customShortcuts));
  // 更新底部提示的快捷键显示
  renderShortcutHints();
  // 重新绑定全局键盘监听
  initGlobalKeyboardListener();
}

/**
 * 将快捷键配置转换为显示文本
 */
function shortcutToDisplay(shortcut) {
  if (!shortcut) return '未设置';

  const parts = [];
  if (shortcut.meta) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.ctrl && !isMac) parts.push('Ctrl');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  if (shortcut.key) parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}

/**
 * 初始化设置面板Tab切换
 */
function initSettingsTabs() {
  const tabs = document.querySelectorAll('.settings-tab');
  const panes = document.querySelectorAll('.settings-tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // 移除所有active状态
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      // 激活当前tab和对应面板
      tab.classList.add('active');
      const targetPane = document.getElementById(`tab-${targetTab}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      console.log('[设置Tab] 切换到:', targetTab);
    });
  });
}

/**
 * 初始化快捷键配置UI
 */
function initShortcutConfigUI() {
  // 更新按钮显示
  updateShortcutButtonDisplay('toggle-assistant', document.getElementById('shortcutToggleAssistant'));
  updateShortcutButtonDisplay('analyze-page', document.getElementById('shortcutAnalyzePage'));

  // 绑定点击事件（开始录制）
  const toggleBtn = document.getElementById('shortcutToggleAssistant');
  const analyzeBtn = document.getElementById('shortcutAnalyzePage');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => startShortcutRecording('toggle-assistant', toggleBtn));
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => startShortcutRecording('analyze-page', analyzeBtn));
  }
}

/**
 * 更新快捷键按钮的显示文本
 */
function updateShortcutButtonDisplay(action, buttonEl) {
  if (!buttonEl) return;
  const displayEl = buttonEl.querySelector('.shortcut-display');
  if (displayEl) {
    const shortcut = customShortcuts[action];
    displayEl.textContent = shortcutToDisplay(shortcut);
  }
}

/**
 * 开始录制快捷键
 */
function startShortcutRecording(action, buttonEl) {
  // 如果正在录制，先停止
  if (currentRecordingAction) {
    stopShortcutRecording();
  }

  currentRecordingAction = action;
  buttonEl.classList.add('recording');
  const displayEl = buttonEl.querySelector('.shortcut-display');
  if (displayEl) {
    displayEl.textContent = '按下...';
  }

  // 添加临时键盘监听器
  document.addEventListener('keydown', handleShortcutRecording);
  console.log(`[快捷键] 开始录制 "${action}" 的快捷键`);
}

/**
 * 停止录制快捷键
 */
function stopShortcutRecording() {
  if (currentRecordingAction) {
    const buttons = document.querySelectorAll('.shortcut-btn.recording');
    buttons.forEach(btn => btn.classList.remove('recording'));
    currentRecordingAction = null;
  }
  document.removeEventListener('keydown', handleShortcutRecording);
}

/**
 * 处理快捷键录制事件
 */
function handleShortcutRecording(e) {
  e.preventDefault();
  e.stopPropagation();

  if (!currentRecordingAction) return;

  // 忽略单独的修饰键
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
    return;
  }

  // 记录按键组合
  const newShortcut = {
    key: e.key.toLowerCase(),
    ctrl: e.ctrlKey,
    shift: e.shiftKey,
    alt: e.altKey,
    meta: e.metaKey || (isMac && e.metaKey)
  };

  // 验证：至少需要一个修饰键 + 一个普通键
  if (!newShortcut.ctrl && !newShortcut.shift && !newShortcut.alt && !newShortcut.meta) {
    alert('请使用组合键（如 Ctrl+J, Alt+Shift+A 等）');
    return;
  }

  // 保存新快捷键
  customShortcuts[currentRecordingAction] = newShortcut;

  // 更新UI
  const buttonMap = {
    'toggle-assistant': 'shortcutToggleAssistant',
    'analyze-page': 'shortcutAnalyzePage'
  };
  const buttonId = buttonMap[currentRecordingAction];
  if (buttonId) {
    updateShortcutButtonDisplay(currentRecordingAction, document.getElementById(buttonId));
  }

  console.log(`[快捷键] 已更新 "${currentRecordingAction}":`, newShortcut);

  // 停止录制
  stopShortcutRecording();

  // 自动保存
  saveCustomShortcuts();

  // 显示成功提示
  setStatus(`✓ 快捷键已更新为 ${shortcutToDisplay(newShortcut)}`, 'success');
  setTimeout(() => checkApiStatus(), 2000);
}

/**
 * 检查按下的键是否匹配某个快捷键
 */
function matchShortcut(e, shortcutConfig) {
  if (!shortcutConfig) return false;

  return (
    e.key.toLowerCase() === shortcutConfig.key &&
    e.ctrlKey === (shortcutConfig.ctrl || false) &&
    e.shiftKey === (shortcutConfig.shift || false) &&
    e.altKey === (shortcutConfig.alt || false) &&
    (e.metaKey || false) === (shortcutConfig.meta || false)
  );
}

/**
 * 初始化全局键盘监听器（将配置发送给content.js）
 * 注意：Chrome扩展的全局快捷键必须在content script层面拦截，
 * iframe内的键盘事件监听无法捕获全局按键。
 */
function initGlobalKeyboardListener() {
  // 将当前快捷键配置发送给父窗口（content.js）
  sendShortcutsToContentScript();

  console.log('[快捷键] 已将快捷键配置发送到content script层');
  console.log('[快捷键] 当前配置:', customShortcuts);
}

/**
 * 发送快捷键配置到content.js（用于全局拦截）
 */
function sendShortcutsToContentScript() {
  try {
    // 向父窗口发送消息（content.js会接收并更新）
    window.parent.postMessage({
      type: 'UPDATE_SHORTCUTS',
      shortcuts: customShortcuts
    }, '*');

    console.log('[快捷键] 配置已同步到content.js:', customShortcuts);
  } catch (e) {
    console.warn('[快捷键] 发送配置失败:', e);
  }
}

// ========== 主题管理 ==========
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';  // 默认使用浅色主题
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  if (theme === 'light') {
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
  } else {
    if (sunIcon) sunIcon.style.display = 'block';
    if (moonIcon) moonIcon.style.display = 'none';
  }
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ========== 页面上下文管理 ==========
function initPageContext() {
  const addPageBtn = document.getElementById('addPageBtn');
  if (addPageBtn) {
    addPageBtn.addEventListener('click', openTabPicker);
  }
  document.getElementById('pageList').addEventListener('click', (e) => {
    if (e.target.classList.contains('page-remove')) {
      e.stopPropagation();
      const pageId = e.target.dataset.pageId;
      removePage(pageId);
    } else if (e.target.closest('.page-item')) {
      const item = e.target.closest('.page-item');
      setActivePage(item.dataset.pageId);
    }
  });

  const closeBtn = document.getElementById('closeTabPicker');
  if (closeBtn) closeBtn.addEventListener('click', closeTabPicker);

  const overlay = document.querySelector('.tab-picker-overlay');
  if (overlay) overlay.addEventListener('click', closeTabPicker);

  const captureBtn = document.getElementById('captureSelectedBtn');
  if (captureBtn) captureBtn.addEventListener('click', captureSelectedTabs);

  loadCurrentPageInfo();
}

function loadCurrentPageInfo() {
  window.parent.postMessage({ type: 'GET_TAB_INFO' }, '*');
}

function updateCurrentPageInfo(tabInfo) {
  if (!tabInfo) return;
  const titleEl = document.getElementById('currentPageTitle');
  if (titleEl && activePageId === 'current') {
    titleEl.textContent = tabInfo.title || '当前页面';
  }
}

// ========== 标签页选择弹窗 ==========
function openTabPicker() {
  const modal = document.getElementById('tabPickerModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  selectedTabIds.clear();
  updateSelectedCount();
  loadTabPickerList();
}

function closeTabPicker() {
  const modal = document.getElementById('tabPickerModal');
  if (modal) modal.classList.add('hidden');

  // 关闭时取消所有标签页的绿色标注
  selectedTabIds.forEach(tabId => {
    sendHighlightToTab(tabId, false);
  });
  selectedTabIds.clear();
}

/**
 * 向指定标签页发送高亮/取消高亮消息
 * @param {number} tabId - 标签页ID
 * @param {boolean} highlight - 是否显示高亮
 */
function sendHighlightToTab(tabId, highlight) {
  try {
    // 通过 background.js 转发到目标标签页
    window.parent.postMessage({
      type: 'SEND_TO_BACKGROUND',
      backgroundMessage: {
        type: 'HIGHLIGHT_TAB',
        tabId: tabId,
        highlight: highlight
      }
    }, '*');

    console.log(`[标签高亮] ${highlight ? '✅ 显示' : '🚫 隐藏'} 标签 ${tabId} 的绿色标注`);
  } catch (err) {
    console.error('[标签高亮] 发送消息失败:', err);
  }
}

async function loadTabPickerList() {
  const listEl = document.getElementById('tabPickerList');
  if (!listEl) return;
  listEl.innerHTML = '<div class="tab-picker-loading">正在加载标签页列表...</div>';

  window.parent.postMessage({ type: 'GET_ALL_TABS' }, '*');

  const handler = await new Promise((resolve) => {
    const h = (event) => {
      if (event.data.type === 'ALL_TABS') {
        window.removeEventListener('message', h);
        resolve(event.data.tabs);
      }
    };
    window.addEventListener('message', h);
    setTimeout(() => { window.removeEventListener('message', h); resolve([]); }, 5000);
  });

  if (!handler || handler.length === 0) {
    listEl.innerHTML = '<div class="tab-picker-loading">未找到可抓取的标签页</div>';
    return;
  }

  const capturedUrls = new Set(capturedPages.map(p => p.url));
  let html = '';
  handler.forEach(tab => {
    let domain = '';
    try { domain = new URL(tab.url).hostname.replace('www.', ''); } catch(e) {}
    const favicon = tab.favIconUrl
      ? `<img src="${tab.favIconUrl}" alt="" onerror="this.style.display='none'; this.parentElement.textContent='🌐';">`
      : (domain ? domain[0].toUpperCase() : '🌐');
    const alreadyCaptured = capturedUrls.has(tab.url);
    const truncatedUrl = tab.url.length > 50 ? tab.url.substring(0, 50) + '...' : tab.url;

    html += `
      <div class="tab-picker-item ${alreadyCaptured ? 'already-captured' : ''}" data-tab-id="${tab.id}" data-tab-url="${tab.url}" data-tab-title="${tab.title}">
        <div class="tab-item-checkbox">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="tab-item-icon">${favicon}</div>
        <div class="tab-item-info">
          <div class="tab-item-title">${tab.title}</div>
          <div class="tab-item-url">${truncatedUrl}</div>
        </div>
      </div>
    `;
  });
  listEl.innerHTML = html;

  listEl.querySelectorAll('.tab-picker-item').forEach(item => {
    if (item.classList.contains('already-captured')) return;
    item.addEventListener('click', () => {
      const tabId = parseInt(item.dataset.tabId);
      if (selectedTabIds.has(tabId)) {
        // 取消选择 - 移除绿色标注
        selectedTabIds.delete(tabId);
        item.classList.remove('selected');
        sendHighlightToTab(tabId, false);
      } else {
        // 选中 - 添加绿色标注
        selectedTabIds.add(tabId);
        item.classList.add('selected');
        sendHighlightToTab(tabId, true);
      }
      updateSelectedCount();
    });
  });
}

function updateSelectedCount() {
  const countEl = document.getElementById('selectedCount');
  const btn = document.getElementById('captureSelectedBtn');
  const count = selectedTabIds.size;
  if (countEl) countEl.textContent = `已选择 ${count} 个`;
  if (btn) btn.disabled = count === 0;
}

async function captureSelectedTabs() {
  const btn = document.getElementById('captureSelectedBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '正在抓取...';
  }
  setStatus('正在抓取标签页...', 'loading');

  let successCount = 0;
  let failCount = 0;

  for (const tabId of selectedTabIds) {
    try {
      const result = await captureTabContent(tabId);
      if (result) {
        const pageId = 'page_' + Date.now() + '_' + tabId;
        capturedPages.push({
          id: pageId,
          title: result.title || '未命名页面',
          url: result.url || '',
          content: result
        });
        successCount++;
      } else {
        failCount++;
      }
    } catch (e) {
      failCount++;
    }
  }

  renderPageList();
  if (successCount > 0) {
    const lastPage = capturedPages[capturedPages.length - 1];
    if (lastPage) setActivePage(lastPage.id);
    setStatus(`已抓取 ${successCount} 个页面${failCount > 0 ? `，${failCount} 个失败` : ''}`, 'success');
  } else {
    setStatus('抓取失败', 'error');
  }
  setTimeout(() => setStatus('就绪'), 3000);

  closeTabPicker();
  if (btn) {
    btn.disabled = false;
    btn.textContent = '抓取选中页面';
  }
}

function captureTabContent(tabId) {
  return new Promise((resolve) => {
    const handler = (event) => {
      if (event.data.type === 'TAB_CONTENT_RESULT' && event.data.tabId === tabId) {
        window.removeEventListener('message', handler);
        if (event.data.error) {
          resolve(null);
        } else {
          resolve(event.data.content);
        }
      }
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: 'CAPTURE_TAB_CONTENT', tabId }, '*');
    setTimeout(() => {
      window.removeEventListener('message', handler);
      resolve(null);
    }, 8000);
  });
}

async function captureCurrentPage() {
  setStatus('正在抓取页面...', 'loading');
  window.parent.postMessage({ type: 'GET_PAGE_CONTENT' }, '*');

  const handler = (event) => {
    if (event.data.type === 'PAGE_CONTENT' && event.data.content) {
      window.removeEventListener('message', handler);
      const content = event.data.content;
      const pageId = 'page_' + Date.now();
      const pageData = {
        id: pageId,
        title: content.title || '未命名页面',
        url: content.url || '',
        content: content
      };
      capturedPages.push(pageData);
      renderPageList();
      setActivePage(pageId);
      setStatus('页面已抓取', 'success');
      setTimeout(() => setStatus('就绪'), 2000);
    }
  };
  window.addEventListener('message', handler);
  setTimeout(() => {
    window.removeEventListener('message', handler);
  }, 5000);
}

function removePage(pageId) {
  if (pageId === 'current') return;
  capturedPages = capturedPages.filter(p => p.id !== pageId);
  if (activePageId === pageId) {
    setActivePage('current');
  }
  renderPageList();
}

function setActivePage(pageId) {
  activePageId = pageId;
  document.querySelectorAll('.page-item').forEach(item => {
    item.classList.toggle('active', item.dataset.pageId === pageId);
  });
  if (pageId === 'current') {
    currentPageContent = null;
  } else {
    const page = capturedPages.find(p => p.id === pageId);
    if (page) currentPageContent = page.content;
  }
}

function renderPageList() {
  const list = document.getElementById('pageList');
  if (!list) return;
  let html = `
    <div class="page-item ${activePageId === 'current' ? 'active' : ''}" data-page-id="current">
      <span class="page-favicon">🌐</span>
      <span class="page-title" id="currentPageTitle">当前页面</span>
    </div>
  `;
  capturedPages.forEach(page => {
    let domain = '';
    try { domain = new URL(page.url).hostname.replace('www.', ''); } catch(e) {}
    const favicon = domain ? domain[0].toUpperCase() : '📄';
    html += `
      <div class="page-item ${activePageId === page.id ? 'active' : ''}" data-page-id="${page.id}">
        <span class="page-favicon">${favicon}</span>
        <span class="page-title" title="${page.url}">${page.title}</span>
        <button class="page-remove" data-page-id="${page.id}" title="移除">×</button>
      </div>
    `;
  });
  list.innerHTML = html;
}

function getActivePageContent() {
  if (activePageId === 'current') {
    return null;
  }
  const page = capturedPages.find(p => p.id === activePageId);
  return page ? page.content : null;
}

function getAllPageContents() {
  return capturedPages.map(p => p.content);
}

// ========== AI智能推荐问题（网页上下文理解）==========

let smartSuggestions = []; // 存储当前的智能推荐问题
let isGeneratingSuggestions = false; // 防止重复生成
let suggestionCache = new Map(); // 缓存已生成的推荐（key: url, value: {suggestions, timestamp}）
const CACHE_DURATION = 5 * 60 * 1000; // 缓存5分钟

/**
 * 分析页面类型和关键信息
 * @param {Object} pageContent - 页面内容对象
 * @returns {Object} - 页面分析结果
 */
function analyzePageType(pageContent) {
  const title = (pageContent.title || '').toLowerCase();
  const url = (pageContent.url || '').toLowerCase();
  const text = (pageContent.text || '').toLowerCase();
  
  let pageType = 'general'; // 默认通用型
  let typeHints = '';
  
  // 检测页面类型
  if (text.includes('oa') && (text.includes('审批') || text.includes('流程'))) {
    pageType = 'oa_workflow';
    typeHints = '这是一个OA办公/流程审批系统页面';
  } else if (text.includes('报销') || text.includes('费用') || text.includes('财务')) {
    pageType = 'finance';
    typeHints = '这是一个财务/费用报销系统页面';
  } else if (text.includes('hr') || text.includes('人事') || text.includes('考勤') || text.includes('薪资')) {
    pageType = 'hr';
    typeHints = '这是一个HR/人事管理系统页面';
  } else if (text.includes('代码') || text.includes('api') || text.includes('开发') || text.includes('git')) {
    pageType = 'tech_dev';
    typeHints = '这是一个技术开发/代码相关页面';
  } else if (text.includes('产品') && (text.includes('需求') || text.includes('功能'))) {
    pageType = 'product';
    typeHints = '这是一个产品管理/需求文档页面';
  } else if (text.includes('数据') && (text.includes('报表') || text.includes('统计') || text.includes('分析'))) {
    pageType = 'data_report';
    typeHints = '这是一个数据分析/报表展示页面';
  } else if (text.includes('订单') || text.includes('购物车') || text.includes('商品') || text.includes('价格')) {
    pageType = 'ecommerce';
    typeHints = '这是一个电商/订单管理页面';
  } else if (url.includes('wiki') || url.includes('知识库') || url.includes('help') || url.includes('doc')) {
    pageType = 'knowledge';
    typeHints = '这是一个知识库/帮助文档页面';
  }
  
  // 提取关键信息
  const keywords = extractKeywords(text);
  const hasTable = /<table/i.test(pageContent.html || '') || text.includes('|');
  const hasList = (text.match(/<li>/g) || []).length > 3;
  const hasNumbers = /\d+[\.,]?\d*/.test(text);
  
  return {
    pageType,
    typeHints,
    keywords,
    hasTable,
    hasList,
    hasNumbers,
    title: pageContent.title,
    url: pageContent.url
  };
}

/**
 * 从文本中提取关键词
 */
function extractKeywords(text) {
  // 简单的关键词提取：取出现频率较高的实词
  const words = text.toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 2)
    .slice(0, 100);
  
  const freq = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * 根据页面类型生成针对性的AI prompt
 */
function generatePromptForPageType(analysis, pageText, pageTitle) {
  const basePrompt = `你是一个智能网页助手。用户正在浏览一个网页，需要你根据页面内容生成3-5个最贴切的推荐问题。

【页面基本信息】
- 标题：${pageTitle}
- 页面类型：${analysis.typeHints || '通用网页'}
- URL：${analysis.url}

【页面内容摘要】
${pageText.substring(0, 2500)}

【特殊特征】
${analysis.hasTable ? '- 包含数据表格' : ''}
${analysis.hasList ? '- 包含列表/清单内容' : ''}
${analysis.hasNumbers ? '- 包含数值/统计数据' : ''}`;

  // 根据页面类型添加特定的指令
  let typeSpecificInstructions = '';
  
  switch (analysis.pageType) {
    case 'oa_workflow':
      typeSpecificInstructions = `
【针对此页面的建议】
- 关注流程状态、审批节点、待办事项
- 可以询问如何加速审批、查看历史记录
- 问题要具体到某个流程或单号`;
      break;
      
    case 'finance':
      typeSpecificInstructions = `
【针对此页面的建议】
- 关注金额、报销状态、发票信息
- 可以询问报销进度、费用明细、预算情况
- 问题要涉及具体的财务数据`;
      break;
      
    case 'data_report':
      typeSpecificInstructions = `
【针对此页面的建议】
- 关注数据趋势、异常值、对比分析
- 可以询问数据含义、导出方式、筛选条件
- 问题要围绕数据解读和分析`;
      break;
      
    case 'knowledge':
      typeSpecificInstructions = `
【针对此页面的建议】
- 关注知识点、操作步骤、常见问题
- 可以询问详细说明、使用方法、注意事项
- 问题要便于快速获取关键信息`;
      break;
      
    case 'ecommerce':
      typeSpecificInstructions = `
【针对此页面的建议】
- 关注商品信息、价格、库存、订单状态
- 可以询问详情、比较、退换货政策
- 问题要实用且与购买决策相关`;
      break;
      
    default:
      typeSpecificInstructions = `
【通用建议】
- 覆盖不同角度：总结、细节、操作、原因
- 问题要自然、像真实用户会问的
- 如果是文章类页面，关注核心观点和结论
- 如果是工具类页面，关注使用方法和功能`;
  }

  return `${basePrompt}
${typeSpecificInstructions}

【输出要求】
1. 只输出问题列表，每行一个问题
2. 不要编号、不要引号、不要其他格式
3. 每个问题不超过25个字
4. 问题必须基于页面实际内容，不要泛泛而谈
5. 至少有1个问题包含页面中的具体名词或数字

请直接生成推荐问题：`;
}

/**
 * 根据页面内容生成智能推荐问题（调用AI）
 * @param {Object} pageContent - 页面内容对象 {title, url, text, html}
 * @returns {Promise<Array>} - 推荐问题数组
 */
async function generateSmartSuggestions(pageContent) {
  if (!pageContent) {
    console.log('[智能推荐] ⚠️ 缺少页面内容');
    return getSmartDefaultSuggestions(pageContent);
  }

  // 检查缓存
  const cacheKey = pageContent.url || pageContent.title || 'current';
  const cached = suggestionCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    console.log('[智能推荐] 📦 使用缓存的推荐问题');
    return cached.suggestions;
  }

  if (!settings.apiKey || !settings.apiUrl) {
    console.log('[智能推荐] ⚠️ API未配置，使用智能默认推荐');
    return getSmartDefaultSuggestions(pageContent);
  }

  if (isGeneratingSuggestions) {
    console.log('[智能推荐] ⏳ 正在生成中，跳过重复请求');
    return smartSuggestions.length > 0 ? smartSuggestions : getSmartDefaultSuggestions(pageContent);
  }

  isGeneratingSuggestions = true;
  showSuggestionsLoading();

  try {
    // 分析页面类型
    const analysis = analyzePageType(pageContent);
    console.log('[智能推荐] 📊 页面类型分析:', analysis.pageType, analysis.typeHints);

    const pageText = pageContent.text || '';
    const pageTitle = pageContent.title || '当前页面';

    // 使用针对性prompt
    const prompt = generatePromptForPageType(analysis, pageText, pageTitle);

    // 调用主AI模型生成推荐
    const response = await callAPIForSuggestions(prompt);

    if (response && response.trim()) {
      // 解析AI返回的问题列表
      const questions = response
        .split('\n')
        .map(line => line.replace(/^\d+[\.\、\s]+/, '').replace(/^[-*•]\s*/, '').trim())
        .filter(line => line.length > 5 && line.length < 50 && !line.startsWith('#'));
      
      let suggestions = questions.slice(0, 5); // 最多5个
      
      // 如果AI返回的有效问题太少，补充智能默认问题
      if (suggestions.length < 3) {
        const fallbackSuggestions = getSmartDefaultSuggestions(pageContent).filter(
          q => !suggestions.some(s => s.substring(0, 10) === q.substring(0, 10))
        );
        suggestions = [...suggestions, ...fallbackSuggestions].slice(0, 5);
      }
      
      smartSuggestions = suggestions;
      
      // 缓存结果
      suggestionCache.set(cacheKey, {
        suggestions: smartSuggestions,
        timestamp: Date.now()
      });
      
      console.log('[智能推荐] ✅ 成功生成', smartSuggestions.length, '个个性化推荐问题');
      return smartSuggestions;
    } else {
      console.log('[智能推荐] ⚠️ AI返回为空，使用智能降级推荐');
      return getSmartDefaultSuggestions(pageContent);
    }
  } catch (error) {
    console.error('[智能推荐] ❌ 生成失败:', error.message);
    return getSmartDefaultSuggestions(pageContent);
  } finally {
    isGeneratingSuggestions = false;
  }
}

/**
 * 智能默认推荐（当无法调用AI时使用）- 基于简单规则匹配
 */
function getSmartDefaultSuggestions(pageContent) {
  if (!pageContent) {
    return [
      '请总结这个页面的主要内容',
      '这个页面是做什么用的？',
      '提取页面中的关键信息'
    ];
  }

  const title = (pageContent.title || '').toLowerCase();
  const text = (pageContent.text || '').toLowerCase();
  const url = (pageContent.url || '').toLowerCase();
  
  // 根据URL和标题关键词生成针对性推荐
  if (title.includes('oa') || url.includes('oa') || text.includes('审批')) {
    return [
      '这个流程的当前状态是什么？',
      '有哪些待办事项需要处理？',
      '如何加快审批速度？',
      '查看最近的审批记录'
    ];
  }
  
  if (title.includes('报销') || title.includes('财务') || text.includes('费用')) {
    return [
      '我的报销单现在什么状态？',
      '本月已报销金额是多少？',
      '哪些费用可以报销？',
      '如何提交新的报销申请？'
    ];
  }
  
  if (title.includes('数据') || title.includes('报表') || text.includes('统计')) {
    return [
      '这些数据的趋势是什么？',
      '解释这个图表的含义',
      '导出这份报表的数据',
      '筛选特定条件的数据'
    ];
  }
  
  if (title.includes('知识库') || title.includes('帮助') || url.includes('wiki')) {
    return [
      '快速了解这个主题的核心内容',
      '常见的使用问题有哪些？',
      '详细的操作步骤是什么？'
    ];
  }
  
  if (text.includes('订单') || text.includes('商品')) {
    return [
      '我的订单目前什么状态？',
      '这个商品的详细信息？',
      '如何退换货？'
    ];
  }
  
  // 通用推荐（但会根据页面内容微调）
  const suggestions = [
    `关于"${(pageContent.title || '这个页面').substring(0, 20)}"的核心内容是什么？`
  ];
  
  // 如果页面较长，建议总结
  if ((pageContent.text || '').length > 500) {
    suggestions.push('请提炼这个页面的要点');
  }
  
  // 如果有表格，建议提取数据
  if (/<table/i.test(pageContent.html || '') || text.includes('表格')) {
    suggestions.push('提取页面中的表格数据');
  }
  
  suggestions.push('这个页面的主要用途是什么？');
  
  return suggestions.slice(0, 5);
}

/**
 * 调用API生成推荐问题（简化版，非流式）
 */
async function callAPIForSuggestions(prompt) {
  if (!settings.apiUrl || !settings.apiKey || !settings.modelName) {
    throw new Error('API配置不完整');
  }

  const apiUrl = settings.apiUrl.replace(/\/$/, '');
  const chatUrl = `${apiUrl}/v1/chat/completions`;

  const response = await fetch(chatUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.modelName,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      temperature: 0.8,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error(`API错误: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * 显示推荐问题加载状态
 */
function showSuggestionsLoading() {
  const container = document.getElementById('smartSuggestionsContainer');
  if (container) {
    container.innerHTML = `
      <div class="suggestions-loading">
        <div class="loading-spinner"></div>
        <span>正在分析页面内容...</span>
      </div>
    `;
  }
}

/**
 * 渲染智能推荐问题到指定容器
 * @param {Array} suggestions - 推荐问题数组
 * @param {string} containerId - 容器元素ID
 */
function renderSmartSuggestions(suggestions, containerId = 'smartSuggestionsContainer') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!suggestions || suggestions.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="smart-suggestions">
      <div class="suggestions-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
        <span>基于当前页面为您推荐</span>
      </div>
      <div class="suggestions-list">
        ${suggestions.map((q, i) => `
          <button class="suggestion-chip smart" data-prompt="${q.replace(/"/g, '&quot;')}" data-index="${i}">
            ${q}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // 绑定点击事件
  container.querySelectorAll('.suggestion-chip.smart').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      if (prompt) {
        document.getElementById('messageInput').value = prompt;
        updateSendButton();
        sendMessage();
      }
    });
  });
}

/**
 * 初始化智能推荐（在侧边栏打开时调用）
 * 参考Gemini逻辑：
 * - 如果当前页面有对话历史 → 不显示推荐（显示聊天内容）
 * - 如果当前页面无对话历史 → 显示基于页面的智能推荐
 */
async function initSmartSuggestions() {
  console.log('[智能推荐] 🚀 开始初始化...');

  // ===== 关键改进1：检查是否有对话历史 =====
  const hasMessages = messages && messages.length > 0;

  console.log('[智能推荐] 📊 对话状态:', hasMessages ? '有历史消息' : '无历史消息');

  // 如果已经有对话历史，不显示推荐（让用户继续对话）
  if (hasMessages) {
    console.log('[智能推荐] ℹ️ 当前页面已有对话，跳过推荐显示');
    hideSmartSuggestions();
    return;
  }

  // ===== 关键改进2：增加延迟确保页面加载完成 =====
  await new Promise(resolve => setTimeout(resolve, 500));

  // ===== 关键改进3：带重试机制获取页面内容 =====
  let pageContent = await fetchPageContentWithRetry();

  if (pageContent) {
    console.log('[智能推荐] ✅ 成功获取页面内容:', pageContent.title || pageContent.url);
    const suggestions = await generateSmartSuggestions(pageContent);

    // 检查是否还在欢迎页面（用户可能已经开始对话了）
    const stillOnWelcome = document.querySelector('.welcome-screen')?.offsetParent !== null;
    if (stillOnWelcome) {
      renderSmartSuggestions(suggestions, 'smartSuggestionsContainer');
    }
  } else {
    // ===== 关键改进4：使用浏览器标签信息作为降级方案 =====
    console.log('[智能推荐] ⚠️ 无法获取完整页面内容，尝试使用标签信息');

    const tabInfo = await fetchTabInfo();
    if (tabInfo) {
      const fallbackContent = {
        title: tabInfo.title,
        url: tabInfo.url,
        text: `页面标题: ${tabInfo.title}\nURL: ${tabInfo.url}`,
        html: ''
      };
      const suggestions = await generateSmartSuggestions(fallbackContent);

      const stillOnWelcome = document.querySelector('.welcome-screen')?.offsetParent !== null;
      if (stillOnWelcome) {
        renderSmartSuggestions(suggestions, 'smartSuggestionsContainer');
      }
    } else {
      // 最终降级：使用智能默认推荐
      console.log('[智能推荐] ⚠️ 使用默认推荐');
      renderSmartSuggestions(getSmartDefaultSuggestions(null), 'smartSuggestionsContainer');
    }
  }
}

/**
 * 带重试机制的页面内容获取
 */
async function fetchPageContentWithRetry(maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    console.log(`[智能推荐] 🔄 尝试获取页面内容 (${attempt + 1}/${maxRetries})...`);

    const content = await fetchPageContentOnce();
    if (content) {
      return content;
    }

    // 等待一段时间再重试（递增延迟）
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)));
    }
  }

  return null;
}

/**
 * 单次尝试获取页面内容
 */
function fetchPageContentOnce() {
  return new Promise((resolve) => {
    let resolved = false;

    if (activePageId === 'current') {
      window.parent.postMessage({ type: 'GET_PAGE_CONTENT' }, '*');

      const timeoutId = setTimeout(() => {
        console.warn('[智能推荐] ⏰ 获取页面内容超时');
        if (!resolved) { resolved = true; resolve(null); }
      }, 3000);

      const handler = (event) => {
        if (event.data.type === 'PAGE_CONTENT' && event.data.content) {
          clearTimeout(timeoutId);
          window.removeEventListener('message', handler);
          if (!resolved) { resolved = true; resolve(event.data.content); }
        }
      };

      window.addEventListener('message', handler);
    } else {
      const page = capturedPages.find(p => p.id === activePageId);
      resolve(page ? page.content : null);
    }
  });
}

/**
 * 获取当前标签信息（降级方案）
 */
function fetchTabInfo() {
  return new Promise((resolve) => {
    window.parent.postMessage({ type: 'GET_TAB_INFO' }, '*');

    const timeoutId = setTimeout(() => resolve(null), 2000);

    const handler = (event) => {
      if (event.data.type === 'TAB_INFO' && event.data.tabInfo) {
        clearTimeout(timeoutId);
        window.removeEventListener('message', handler);
        resolve(event.data.tabInfo);
      }
    };

    window.addEventListener('message', handler);
  });
}

/**
 * 隐藏智能推荐容器
 */
function hideSmartSuggestions() {
  const container = document.getElementById('smartSuggestionsContainer');
  if (container) {
    container.innerHTML = '';
  }
}

// ========== 文件上传管理 ==========
function initFileUpload() {
  const fileBtn = document.getElementById('fileUploadBtn');
  const fileInput = document.getElementById('fileInput');
  if (fileBtn) {
    fileBtn.addEventListener('click', () => fileInput.click());
  }
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
  const dropZone = document.querySelector('.input-wrapper');
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--accent)'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = ''; });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '';
      handleFiles(e.dataTransfer.files);
    });
  }
}

function handleFileSelect(e) {
  handleFiles(e.target.files);
  e.target.value = '';
}

function handleFiles(files) {
  Array.from(files).forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      addMessage('ai', `⚠️ 文件 "${file.name}" 超过10MB限制`);
      return;
    }
    uploadedFiles.push(file);
  });
  renderFilePreview();
  updateSendButton();
}

function renderFilePreview() {
  const preview = document.getElementById('filePreview');
  if (!preview) return;
  if (uploadedFiles.length === 0) {
    preview.classList.add('hidden');
    preview.innerHTML = '';
    return;
  }
  preview.classList.remove('hidden');
  let html = '';
  uploadedFiles.forEach((file, index) => {
    const icon = getFileIcon(file.type);
    const size = formatFileSize(file.size);
    html += `
      <div class="file-chip" data-index="${index}">
        <span class="file-icon">${icon}</span>
        <span class="file-name">${file.name}</span>
        <span class="file-size">${size}</span>
        <button class="file-remove" data-index="${index}" title="移除">×</button>
      </div>
    `;
  });
  preview.innerHTML = html;
  preview.querySelectorAll('.file-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      uploadedFiles.splice(idx, 1);
      renderFilePreview();
      updateSendButton();
    });
  });
}

function getFileIcon(type) {
  if (type.startsWith('image/')) return '🖼️';
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('sheet') || type.includes('excel')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📽️';
  if (type.startsWith('text/')) return '📃';
  if (type.includes('json')) return '⚙️';
  if (type.includes('zip') || type.includes('rar')) return '🗜️';
  return '📎';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

async function readFileContent(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      let content = '';
      if (file.type.startsWith('text/') || file.type.includes('json') || file.type.includes('javascript') || file.type.includes('xml')) {
        content = e.target.result;
      } else if (file.type.startsWith('image/')) {
        content = `[图片文件: ${file.name}]`;
      } else {
        content = `[文件: ${file.name} (${formatFileSize(file.size)})]`;
      }
      resolve({ name: file.name, type: file.type, content });
    };
    reader.onerror = () => resolve({ name: file.name, type: file.type, content: '[读取失败]' });
    if (file.type.startsWith('text/') || file.type.includes('json') || file.type.includes('javascript') || file.type.includes('xml')) {
      reader.readAsText(file);
    } else {
      resolve({ name: file.name, type: file.type, content: `[文件: ${file.name}]` });
    }
  });
}

// ========== 消息渲染 ==========
function addMessage(role, content, isHTML = false) {
  const container = document.getElementById('chatContainer');
  const welcome = container.querySelector('.welcome-screen');
  if (welcome) welcome.remove();

  const msg = document.createElement('div');
  msg.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  if (role === 'user') {
    avatar.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  } else {
    avatar.innerHTML = LP_LOGO_SVG;
  }

  const msgContent = document.createElement('div');
  msgContent.className = 'message-content';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  if (isHTML) {
    bubble.innerHTML = content;
  } else {
    bubble.textContent = content;
  }

  // 为用户消息和AI消息添加右键菜单功能
  if (!isHTML && content && typeof content === 'string') {
    bubble.style.cursor = 'context-menu';
    bubble.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      // 创建自定义右键菜单（根据角色显示不同选项）
      showContextMenu(e, content, bubble, role);
    });

    // 长按操作（移动端支持）
    let pressTimer;
    bubble.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => {
        if (role === 'user') {
          addToFavorites(content);
        } else {
          // AI消息长按时复制内容
          navigator.clipboard.writeText(content).then(() => {
            setStatus('已复制AI回答 ✓', 'success');
            setTimeout(() => checkApiStatus(), 1500);
          });
        }
      }, 800); // 800ms算长按
    });
    bubble.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    });
    bubble.addEventListener('touchmove', () => {
      clearTimeout(pressTimer);
    });
  }

  msgContent.appendChild(bubble);
  msg.appendChild(avatar);
  msg.appendChild(msgContent);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

// 显示自定义右键菜单
function showContextMenu(event, promptText, messageElement = null, role = 'user') {
  // 移除已有的菜单
  const existingMenu = document.querySelector('.custom-context-menu');
  if (existingMenu) existingMenu.remove();

  const menu = document.createElement('div');
  menu.className = 'custom-context-menu';

  // 根据消息角色生成不同的菜单项
  let menuItems = '';

  if (role === 'user') {
    // 用户消息的菜单
    menuItems = `
      <div class="context-menu-item" data-action="moveToCurrent">
        <span>📨 移到当前对话</span>
      </div>
      <div class="context-menu-item" data-action="favorite">
        <span>📌 收藏到常用提示词</span>
      </div>
      <div class="context-menu-item" data-action="copy">
        <span>📋 复制文本</span>
      </div>
      <div class="context-menu-item" data-action="edit">
        <span>✏️ 编辑后重新发送</span>
      </div>
    `;
  } else {
    // AI消息的菜单
    menuItems = `
      <div class="context-menu-item" data-action="moveToCurrent">
        <span>📨 引用此回答继续提问</span>
      </div>
      <div class="context-menu-item" data-action="copy">
        <span>📋 复制回答内容</span>
      </div>
      <div class="context-menu-item" data-action="favorite">
        <span>📌 收藏此回答</span>
      </div>
    `;
  }

  menu.innerHTML = menuItems;

  // 定位菜单
  menu.style.left = event.pageX + 'px';
  menu.style.top = event.pageY + 'px';

  document.body.appendChild(menu);

  // 绑定事件（使用可选链防止某些菜单项不存在时报错）
  const moveToCurrentBtn = menu.querySelector('[data-action="moveToCurrent"]');
  if (moveToCurrentBtn) {
    moveToCurrentBtn.addEventListener('click', () => {
      if (role === 'user') {
        moveToCurrentChat(promptText);
      } else {
        // AI消息：引用此回答继续提问
        const input = document.getElementById('messageInput');
        if (input) {
          // 将AI回答作为上下文引用
          input.value = `基于以下回答，请继续详细解释：\n\n"${promptText.substring(0, 200)}${promptText.length > 200 ? '...' : ''}"`;
          updateSendButton();
          input.focus();
          setStatus('已引用AI回答 ✓', 'success');
          setTimeout(() => setStatus('就绪'), 1500);
        }
      }
      menu.remove();
    });
  }

  const favoriteBtn = menu.querySelector('[data-action="favorite"]');
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', () => {
      addToFavorites(promptText);
      menu.remove();
    });
  }

  const copyBtn = menu.querySelector('[data-action="copy"]');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(promptText).then(() => {
        setStatus('已复制 ✓', 'success');
        setTimeout(() => checkApiStatus(), 1500);
      }).catch(() => {
        console.error('复制失败');
      });
      menu.remove();
    });
  }

  const editBtn = menu.querySelector('[data-action="edit"]');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      // 编辑后重新发送：将文本填入输入框并聚焦
      const input = document.getElementById('messageInput');
      if (input) {
        input.value = promptText;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 200) + 'px';
        updateSendButton();
        input.focus();
        setStatus('已填入输入框，可编辑后重新发送', 'success');
        setTimeout(() => setStatus('就绪'), 2000);
      }
      menu.remove();
    });
  }

  // 点击其他地方关闭菜单
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 10);
}

/**
 * 将历史消息移到当前对话（复制到输入框并发送）
 * @param {string} text - 要移动的消息文本
 */
function moveToCurrentChat(text) {
  if (!text || typeof text !== 'string') {
    console.warn('[移到当前对话] ⚠️ 无效的文本内容');
    return;
  }

  console.log('[移到当前对话] 📨 移动消息:', text.substring(0, 50) + '...');

  const input = document.getElementById('messageInput');
  if (input) {
    // 将文本填入输入框
    input.value = text;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 200) + 'px';
    
    // 更新发送按钮状态
    updateSendButton();

    // 显示提示信息
    setStatus('已将问题移到当前对话 ✓', 'success');

    // 可选：自动发送（如果用户希望立即发送）
    // 如果不自动发送，用户可以手动编辑后点击发送
    setTimeout(() => {
      setStatus('就绪');
      // 聚焦到输入框
      input.focus();
    }, 1500);
  }
}

function addTypingIndicator() {
  const container = document.getElementById('chatContainer');
  const welcome = container.querySelector('.welcome-screen');
  if (welcome) welcome.remove();

  const msg = document.createElement('div');
  msg.className = 'message ai';
  msg.id = 'typingMessage';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = LP_LOGO_SVG;

  const msgContent = document.createElement('div');
  msgContent.className = 'message-content';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';

  msgContent.appendChild(bubble);
  msg.appendChild(avatar);
  msg.appendChild(msgContent);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById('typingMessage');
  if (typing) typing.remove();
}

function renderMarkdown(text) {
  // 防御性检查：确保输入有效
  if (!text || typeof text !== 'string') {
    console.warn('[renderMarkdown] 输入为空或非字符串:', text);
    return '';
  }

  let html = text;

  // 安全的替换操作
  try {
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/\n/g, '<br>');
  } catch (e) {
    console.error('[renderMarkdown] 格式化失败:', e);
    // 如果格式化出错，返回转义后的原始文本
    html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return html;
}

// ========== FastGPT 知识库/工作流集成 ==========

/**
 * 意图识别：判断用户问题是系统问题还是页面分析需求
 * 优化版：优先判断是否为页面分析场景
 */
async function detectIntent(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  // ========== 强制规则（最高优先级）==========

  // 规则1：如果有已抓取的页面或文件 → 默认走主AI（除非明确问系统问题）
  if (capturedPages.length > 0 || uploadedFiles.length > 0) {
    // 检查是否明确提到系统/制度/流程等关键词（强系统意图）
    const strongSystemPatterns = [
      /公司.*政策|制度|规定|手册/,
      /请假|报销|审批|年假|加班|考勤/,
      /oa|erp|crm|hr.*系统/,
      /入职|离职|转正|薪资|福利/
    ];

    const hasStrongSystemIntent = strongSystemPatterns.some(pattern => pattern.test(msg));

    if (!hasStrongSystemIntent) {
      return {
        isSystemQuestion: false,
        confidence: 0.9,
        reason: '检测到页面/文件上下文，使用主AI分析'
      };
    }
  }

  // 规则2：明确的分析关键词（强制走主AI）
  const forceAnalysisPatterns = [
    /总结.*(页面|内容|网页|数据)/,
    /分析.*(页面|表格|图表|数据|网页)/,
    /提取.*(数据|信息|内容|文本)/,
    /对比.*(数据|页面|表格)/,
    /统计.*(趋势|数据|信息)/,
    /这个页面|当前页面|网页内容/,
    /页面.*是什么|做什么|怎么样/
  ];

  const hasForceAnalysis = forceAnalysisPatterns.some(pattern => pattern.test(msg));
  if (hasForceAnalysis) {
    return {
      isSystemQuestion: false,
      confidence: 0.95,
      reason: '检测到明确的页面分析指令'
    };
  }

  // ========== 关键词评分（兜底逻辑）==========
  // 系统问题关键词（公司内部系统/制度/流程相关）
  const systemKeywords = [
    // 报销相关（高频问题）
    '报销', '如何报销', '怎样报销', '报销流程', '报销标准', '费用报销',
    '发票', '差旅费', '交通费', '住宿费',

    // 人事/员工相关
    '实习生', '劳务派遣', '派遣人员', '正式员工', '试用期',
    '入职', '离职', '转正', '辞职', '解聘',
    '薪资', '工资', '奖金', '津贴', '补贴', '福利',
    '年假', '病假', '事假', '婚假', '产假', '陪产假', '调休',

    // 审批/流程
    '如何申请', '怎么审批', '审批流程', '申请流程',
    'OA系统', 'ERP系统', 'HR系统', 'HRBP',
    '考勤', '打卡', '加班', '排班', '调休', '请假',

    // 公司制度
    '公司政策', '内部规定', '员工手册', '规章制度',
    '零跑公司', '零跑汽车', '部门流程', '公司流程',

    // IT支持
    'VPN', '邮箱', '账号', '密码', '权限', '系统登录'
  ];

  // 页面分析关键词 - 明确的分析指令才匹配
  const analysisKeywords = [
    // 必须是明确的页面操作指令
    '总结这个页面', '总结当前网页', '总结网页内容',
    '分析这个页面', '分析当前页面', '分析网页',
    '提取页面数据', '提取表格', '提取内容',
    '对比页面', '统计页面', '抓取页面'
  ];

  let systemScore = 0;
  let analysisScore = 0;

  // 计算系统关键词分数（每个词+2分）
  systemKeywords.forEach(keyword => {
    if (msg.includes(keyword)) {
      systemScore += 2;
      console.log(`[意图识别] 匹配系统关键词: "${keyword}" (+2)`);
    }
  });

  // 计算分析关键词分数（必须明确匹配才+5分）
  analysisKeywords.forEach(keyword => {
    if (msg.includes(keyword)) {
      analysisScore += 5; // 明确的分析指令才高分
      console.log(`[意图识别] 匹配分析关键词: "${keyword}" (+5)`);
    }
  });

  // 额外加分项
  if (capturedPages.length > 0) {
    // 只有当用户明确提到"页面/网页"时才加分析分
    if (/页面|网页|当前|这个/.test(msg)) {
      analysisScore += 3;
    }
  }

  // 判断逻辑：
  // 1. 有任何系统关键词匹配 → 倾向系统问题
  // 2. 只有明确的"总结/分析页面"指令 → 才走主AI
  const isSystemQuestion = systemScore >= 2 && !(analysisScore > 0);
  const confidence = Math.max(systemScore, analysisScore) / 10;

  console.log('[意图识别]', {
    message: userMessage.substring(0, 50),
    systemScore,
    analysisScore,
    capturedPages: capturedPages.length,
    uploadedFiles: uploadedFiles.length,
    result: isSystemQuestion ? '→ FastGPT知识库' : '→ 主AI模型'
  });

  return {
    isSystemQuestion,
    confidence: Math.min(confidence, 1),
    reason: isSystemQuestion
      ? `检测到 ${systemScore} 分的系统问题特征`
      : `检测到 ${analysisScore} 分的页面分析特征`
  };
}

/**
 * 调用 FastGPT API 进行知识库检索/工作流执行
 * FastGPT V4 兼容 OpenAI 接口格式
 * @param {string} question - 用户问题
 * @returns {Promise<{answer: string, sources: Array, success: boolean, error?: string}>}
 */
async function callFastGPT(question) {
  // 使用预配置的FastGPT常量（用户无需配置）
  if (!FASTGPT_CONFIG.apiUrl || !FASTGPT_CONFIG.workflowId) {
    console.error('[FastGPT] ❌ 配置缺失:', {
      hasApiUrl: !!FASTGPT_CONFIG.apiUrl,
      hasWorkflowId: !!FASTGPT_CONFIG.workflowId,
      hasApiKey: !!FASTGPT_CONFIG.apiKey
    });
    return {
      answer: '',
      sources: [],
      success: false,
      error: 'FastGPT服务未正确配置'
    };
  }

  try {
    // 构建API URL（FastGPT V4 标准接口 - 调用工作流/应用）
    if (!FASTGPT_CONFIG.apiUrl) {
      throw new Error('FastGPT API地址未配置');
    }
    const apiUrl = FASTGPT_CONFIG.apiUrl.replace(/\/$/, '');
    const chatUrl = `${apiUrl}/v1/chat/completions`;

    console.log('[FastGPT] 🚀 开始调用...');
    console.log('[FastGPT] 调用URL:', chatUrl);
    console.log('[FastGPT] 工作流ID:', FASTGPT_CONFIG.workflowId);
    console.log('[FastGPT] 用户问题:', question);
    console.log('[FastGPT] 完整配置:', JSON.stringify({
      apiUrl: FASTGPT_CONFIG.apiUrl,
      workflowId: FASTGPT_CONFIG.workflowId,
      hasApiKey: !!FASTGPT_CONFIG.apiKey
    }));

    // 记录调用开始时间
    const startTime = Date.now();

    let response;
    response = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FASTGPT_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: FASTGPT_CONFIG.modelName || FASTGPT_CONFIG.workflowId,
        messages: [
          {
            role: 'user',
            content: question
          }
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    // 计算响应时间
    const responseTime = Date.now() - startTime;
    console.log(`[FastGPT] ⏱️ 响应时间: ${responseTime}ms`);

    // 检查网络错误（CORS、DNS、超时等）
    if (!response) {
      throw new Error('网络请求失败：无法连接到FastGPT服务器');
    }

    // 检查HTTP状态码
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[FastGPT] ❌ HTTP错误 ${response.status}:`, errorText.substring(0, 500));

      let errorMsg = `FastGPT HTTP错误 (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error?.message || errorJson.message || errorJson.error || errorMsg;
      } catch(e) {
        // 如果不是JSON，直接使用原始错误文本（截断避免过长）
        if (errorText.length > 200) {
          errorMsg += `: ${errorText.substring(0, 200)}...`;
        } else {
          errorMsg += `: ${errorText}`;
        }
      }

      // 特殊状态码提示
      if (response.status === 401) {
        errorMsg = 'FastGPT API Key无效或已过期';
      } else if (response.status === 403) {
        errorMsg = 'FastGPT访问被拒绝（可能IP白名单限制）';
      } else if (response.status === 404) {
        errorMsg = 'FastGPT工作流ID不存在或已删除';
      } else if (response.status === 500 || response.status === 502 || response.status === 503) {
        errorMsg = 'FastGPT服务器内部错误，请稍后重试';
      }

      return { answer: '', sources: [], success: false, error: errorMsg };
    }

    console.log('[FastGPT] ✅ HTTP请求成功，状态:', response.status);

    // 安全解析JSON响应（处理截断或不完整的情况）
    let data;
    try {
      const responseText = await response.text();
      console.log('[FastGPT] 原始响应长度:', responseText.length);

      // 尝试解析JSON
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[FastGPT] JSON解析失败:', parseError.message);
      return {
        answer: '',
        sources: [],
        success: false,
        error: `知识库响应格式异常，请稍后重试`
      };
    }

    console.log('[FastGPT] 响应数据:', data);

    // 解析FastGPT响应格式（兼容OpenAI格式）
    if (data.choices && data.choices[0]) {
      const choice = data.choices[0];
      const answer = choice.message?.content || '';

      // 验证answer是否有效
      if (!answer || typeof answer !== 'string') {
        console.warn('[FastGPT] 返回内容为空');
        return { answer: '', sources: [], success: false, error: '知识库未返回有效内容' };
      }

      // 提取来源信息（如果FastGPT返回了）
      let sources = [];
      if (choice.message?.metadata?.sources) {
        sources = choice.message.metadata.sources;
      } else if (data.metadata?.sources) {
        sources = data.metadata.sources;
      }

      return {
        answer: answer.trim(),
        sources,
        success: true
      };
    }

    // 尝试其他可能的响应格式
    if (data.answer || data.content || data.result) {
      return {
        answer: (data.answer || data.content || data.result || '').trim(),
        sources: data.sources || [],
        success: true
      };
    }

    console.warn('[FastGPT] 未知响应格式:', JSON.stringify(data).substring(0, 200));
    return { answer: '', sources: [], success: false, error: '响应格式异常' };

  } catch (error) {
    // 详细错误分类
    let errorMsg = '连接失败';
    const errorMessage = error.message || '';

    console.error('[FastGPT] 💥 调用异常:', error);
    console.error('[FastGPT] 错误类型:', error.name);
    console.error('[FastGPT] 错误消息:', errorMessage);

    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      errorMsg = '网络连接失败（可能原因：CORS跨域限制、DNS解析失败、网络不通）';
      console.error('[FastGPT] 🔍 网络错误详情:', {
        url: `${FASTGPT_CONFIG.apiUrl}/v1/chat/completions`,
        corsIssue: 'Chrome扩展可能遇到CORS限制',
        suggestion: '检查manifest.json的host_permissions或使用background.js代理'
      });
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      errorMsg = '请求超时：FastGPT服务器响应时间过长';
    } else if (errorMessage.includes('CORS') || errorMessage.includes('cross-origin')) {
      errorMsg = 'CORS跨域错误：浏览器阻止了跨域请求（需要通过background.js中转）';
    } else if (errorMessage.includes('AbortError')) {
      errorMsg = '请求被取消';
    } else {
      errorMsg = `未知错误: ${errorMessage}`;
    }

    return {
      answer: '',
      sources: [],
      success: false,
      error: errorMsg
    };
  }
}

/**
 * 零跑内部系统列表（用于AI意图识别）
 */
const LEP_SYSTEMS = `
## 零跑汽车内部系统列表：

### 1. OA系统（企业运营管理平台）
- 功能：流程审批、人事行政、会议管理、考勤打卡、请假审批、入职离职、公告通知等一体化办公事务
- 关键词：OA、流程、审批、申请、请假、考勤、打卡、加班、调休、会议、公告

### 2. 报销系统（财务管理核心工具）
- 功能：出差申请、费用申请、发票管理、报销结算、预算合规、差旅费、交通费、住宿费、餐饮费等全生命周期资金管控
- 关键词：报销、发票、出差、差旅、费用、预算、借款、付款、对账、财务

### 3. 企业微信（企业级协作平台）
- 功能：即时通讯、通讯录、审批考勤、会议、客户服务、工资条、打卡、汇报等
- 关键词：企微、企业微信、工资条、通讯录、消息、群聊

### 其他内部相关：
- 人事制度：实习生、劳务派遣、正式员工、转正、薪资、福利、年假、社保、公积金
- IT支持：VPN、邮箱、账号权限、系统登录、密码重置
- 行政后勤：办公用品、车辆使用、访客接待、印章管理
`;

/**
 * 用AI判断用户问题的类型（三路路由）
 * @param {string} userMessage - 用户的问题
 * @returns {Promise<{type: 'system'|'page_analysis'|'general_chat', confidence: number, reason: string, systemType?: string}>}
 */
async function detectIntentWithAI(userMessage) {
  // 如果API未配置，回退到关键词匹配
  if (!settings.apiUrl || !settings.apiKey || !settings.modelName) {
    console.warn('[AI意图识别] API未配置，回退到关键词匹配');
    return detectIntentThreeWay(userMessage);
  }

  try {
    const response = await fetch(`${settings.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.modelName,
        messages: [
          {
            role: 'system',
            content: `你是零跑汽车AI助手的意图识别引擎。你的任务是将用户的问题分类为以下三种类型之一：

${LEP_SYSTEMS}

## 三种类型定义：

### 1. system (系统问题)
用户询问的是零跑汽车内部系统的操作、流程、政策、规定。
包括：OA审批、报销流程、人事制度、企业微信使用、IT支持等公司内部事务。

### 1.1 oa_process (OA流程查询) - system的子类
用户明确询问要发起什么流程、某个事项走什么流程、如何申请某项业务等。
特征词："发起什么流程"、"走什么流程"、"怎么申请"、"请什么假"、"报销"、"审批"、"流程"、"请假"、"加班"、"出差"、"采购"、"用印"、"印章"、"合同"
示例：
- "我想请病假该走什么流程" → {"type": "oa_process"}
- "报销需要走什么流程" → {"type": "oa_process"}
- "怎么发起采购流程" → {"type": "oa_process"}

### 2. page_analysis (页面分析)
用户明确要求分析、总结、提取当前网页的内容或数据。
特征：包含"页面"、"网页"、"总结"、"分析"、"提取"、"表格"、"截图"等与当前浏览页面相关的指令。

### 3. general_chat (通用问答/闲聊)
用户问的是与零跑内部系统和当前页面无关的一般性问题。
包括：天气查询、新闻资讯、购物建议、生活常识、技术知识、闲聊对话等。

## 判断示例：
- "实习生如何报销" → {"type": "system"}
- "总结这个页面的主要内容" → {"type": "page_analysis"}
- "明天杭州天气怎么样" → {"type": "general_chat"}
- "我想买一辆零跑C10" → {"type": "general_chat"}

请严格按以下JSON格式回复，不要包含其他内容：
{"type": "system|page_analysis|general_chat", "systemType": "系统名称或null", "reason": "简短原因"}`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 150,
        temperature: 0.1,  // 低温度确保稳定输出
        stream: false
      })
    });

    if (!response.ok) {
      console.warn('[AI意图识别] API调用失败:', response.status);
      return detectIntentThreeWay(userMessage); // 回退到关键词匹配
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';

    console.log('[AI意图识别] 原始响应:', content);

    // 解析JSON响应
    try {
      let jsonStr = content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const result = JSON.parse(jsonStr);

      // 验证返回的type是否合法
      const validTypes = ['system', 'page_analysis', 'general_chat'];
      const type = validTypes.includes(result.type) ? result.type : 'general_chat';

      return {
        type: type,
        confidence: 0.95, // AI判断置信度高
        reason: result.reason || `AI判定为${getTypeLabel(type)}`,
        systemType: result.systemType || null
      };
    } catch (parseError) {
      console.warn('[AI意图识别] JSON解析失败:', parseError.message);
      // 尝试从文本中推断类型
      return inferTypeFromText(content);
    }
  } catch (error) {
    console.error('[AI意图识别] 调用失败:', error);
    return detectIntentThreeWay(userMessage); // 回退到关键词匹配
  }
}

/**
 * 从文本推断问题类型
 */
function inferTypeFromText(text) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('system') || lowerText.includes('系统') || lowerText.includes('内部')) {
    return { type: 'system', confidence: 0.7, reason: '从文本推断为系统问题' };
  }
  if (lowerText.includes('page') || lowerText.includes('页面') || lowerText.includes('分析') || lowerText.includes('summary')) {
    return { type: 'page_analysis', confidence: 0.7, reason: '从文本推断为页面分析' };
  }

  return { type: 'general_chat', confidence: 0.5, reason: '无法确定，默认为通用问答' };
}

/**
 * 获取类型的中文标签
 */
function getTypeLabel(type) {
  const labels = {
    'system': '系统问题',
    'page_analysis': '页面分析',
    'general_chat': '通用问答'
  };
  return labels[type] || '未知';
}

/**
 * 关键词匹配的三路意图识别（兜底方案）
 * @param {string} userMessage
 * @returns {{type: string, confidence: number, reason: string}}
 */
function detectIntentThreeWay(userMessage) {
  const msg = userMessage.toLowerCase();

  // OA流程查询关键词（优先级最高）
  const oaProcessKeywords = [
    '发起什么流程', '走什么流程', '什么流程', '怎么申请', '如何申请',
    '请什么假', '怎么请假', '病假流程', '事假流程', '年假流程',
    '报销流程', '出差流程', '加班流程', '采购流程', '用印流程',
    '印章流程', '合同流程', '审批流程', '发起流程', '要找谁审批'
  ];

  // 系统问题关键词（一般性）
  const systemKeywords = [
    '报销', '发票', '出差', '差旅', '费用', '预算',
    '实习生', '劳务派遣', '入职', '离职', '转正', '薪资', '福利',
    '年假', '病假', '请假', '考勤', '打卡', '加班',
    'OA', 'ERP', 'HRBP', '审批', '申请', '企微', '企业微信'
  ];

  // 页面分析关键词（必须明确）
  const analysisKeywords = [
    '总结这个页面', '总结当前网页', '总结网页内容',
    '分析这个页面', '分析当前页面', '提取页面', '抓取页面'
  ];

  let oaProcessScore = 0;
  let systemScore = 0;
  let analysisScore = 0;

  oaProcessKeywords.forEach(kw => { if (msg.includes(kw)) oaProcessScore += 3; });
  systemKeywords.forEach(kw => { if (msg.includes(kw)) systemScore += 2; });
  analysisKeywords.forEach(kw => { if (msg.includes(kw)) analysisScore += 5; });

  // 优先级：页面分析 > OA流程 > 系统问题 > 通用问答
  if (analysisScore > 0) {
    return { type: 'page_analysis', confidence: 0.8, reason: '检测到页面分析指令' };
  }
  if (oaProcessScore >= 3) {
    return { type: 'oa_process', confidence: 0.85, reason: `检测到${oaProcessScore}分OA流程查询特征` };
  }
  if (systemScore >= 2) {
    return { type: 'system', confidence: 0.7, reason: `检测到${systemScore}分系统问题特征` };
  }

  return { type: 'general_chat', confidence: 0.6, reason: '未检测到明确特征，默认通用问答' };
}

/**
 * 处理OA流程查询 - 自动调用OA接口获取流程列表，然后AI基于流程列表回答用户问题
 */
async function handleOAProcessQuery(userMessage) {
  setStatus('正在查询可发起的OA流程...', 'loading');

  // 检查员工工号是否配置
  if (!employeeId) {
    return {
      text: '⚠️ **未配置员工工号**\n\n要查询OA流程，请先在 **设置 → 知识库** 中填写您的员工工号。\n\n配置后即可自动查询所有可发起的审批流程。',
      source: 'oa_process_error',
      usedFastGPT: false,
      routeType: 'oa_process'
    };
  }

  try {
    // 调用OA接口获取流程列表
    const processList = await fetchOAProcessViaProxy(employeeId);

    if (!processList || processList.length === 0) {
      return {
        text: '📋 **暂无可发起的OA流程**\n\n当前账号可能没有待办流程或权限不足。如需帮助，请咨询人事部门。',
        source: 'oa_process_empty',
        usedFastGPT: false,
        routeType: 'oa_process'
      };
    }

    console.log(`[OA流程查询] ✅ 成功获取 ${processList.length} 个流程`);

    // 将流程列表格式化为文本（供AI参考）
    const processText = processList.map((item, index) => {
      const name = item.name || item.processName || '未知流程';
      const desc = item.desc || item.description || item.remark || '';
      return `${index + 1}. **${name}${desc ? ' - ' + desc : ''}**`;
    }).join('\n');

    // 构建AI提示词
    const systemPrompt = `你是零跑汽车公司的流程咨询助手。根据以下可发起的OA流程列表，回答用户的问题。

## 可发起的流程列表：
${processText}

## 回答要求：
1. 根据用户的问题，从流程列表中找到最匹配的流程
2. 告诉用户具体要走哪个流程
3. 如果有多个相关流程，都列出来让用户选择
4. 用简洁友好的语言回答
5. 如果找不到匹配的流程，建议用户联系相关部门`;

    // 调用AI生成回答
    setStatus('正在分析匹配的流程...', 'loading');
    const aiAnswer = await callMainModelWithContext(userMessage, null, systemPrompt);

    if (!aiAnswer) {
      // AI回答失败，直接显示流程列表
      return {
        text: `📋 **为您找到 ${processList.length} 个可发起的流程：**\n\n${processText}\n\n💡 您可以点击侧边栏的 📋 按钮查看完整列表`,
        source: 'oa_process_list',
        sources: [{ title: `OA流程列表 (${processList.length}个)` }],
        usedFastGPT: false,
        routeType: 'oa_process'
      };
    }

    return {
      text: aiAnswer,
      source: 'oa_process_ai',
      sources: [{ title: `OA流程智能推荐` }],
      usedFastGPT: false,
      routeType: 'oa_process'
    };

  } catch (error) {
    console.error('[OA流程查询] ❌ 查询失败:', error);
    return {
      text: `⚠️ **OA流程查询失败**\n\n错误信息：${error.message}\n\n请检查：\n1. 网络连接是否正常\n2. 员工工号是否正确\n3. 是否在公司内网环境\n\n您也可以点击侧边栏 📋 按钮手动查看流程列表。`,
      source: 'oa_process_error',
      usedFastGPT: false,
      routeType: 'oa_process'
    };
  }
}

/**
 * 使用自定义system prompt调用主AI模型
 */
async function callMainModelWithContext(userMessage, contextContent, customSystemPrompt) {
  if (!settings.apiUrl || !settings.apiKey || !settings.modelName) {
    throw new Error('主AI模型未配置');
  }

  const response = await fetch(`${settings.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.modelName,
      messages: [
        { role: 'system', content: customSystemPrompt },
        { role: 'user', content: userMessage }
      ],
      stream: false,  // OA流程查询使用非流式，确保完整性
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`API调用失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

/**
 * 三路智能路由 - 根据问题类型分发到不同的处理逻辑
 *
 * 路由规则：
 * 0. oa_process (OA流程查询)  → 调用OA接口 + AI智能匹配
 * 1. system (系统问题)         → 调用FastGPT工作流（零跑内部知识库）
 * 2. page_analysis (页面分析)   → 调用主AI模型 + 传入当前页面内容
 * 3. general_chat (通用问答)     → 调用主AI模型 + 不传页面内容（联网查询）
 */
async function processMessageWithFastGPT(userMessage, contextContent) {
  // 如果FastGPT未启用（用户手动禁用），直接使用主模型
  if (!FASTGPT_CONFIG.enabled) {
    return await callMainModel(userMessage, contextContent);
  }

  // ========== 第一步：意图识别 ==========
  setStatus('正在分析问题类型...', 'loading');

  let intent;
  try {
    // 优先使用AI判断（三路分类）
    intent = await detectIntentWithAI(userMessage);
    console.log('[三路路由] AI意图识别结果:', intent);
  } catch (e) {
    // AI判断失败，回退到关键词匹配
    console.warn('[三路路由] AI意图识别失败，回退到关键词匹配:', e);
    intent = detectIntentThreeWay(userMessage);
    console.log('[三路路由] 关键词意图识别结果:', intent);
  }

  // ========== 第二步：根据类型分发 ==========
  switch (intent.type) {

    // ====== 路由0：OA流程查询 → 调用OA接口 + AI回答 ======
    case 'oa_process':
      console.log('[三路路由] 📋 路由到【OA流程查询】 → 自动调用OA接口');
      return await handleOAProcessQuery(userMessage);

    // ====== 路由1：系统问题 → FastGPT知识库 ======
    case 'system':
      console.log(`[三路路由] 📋 路由到【系统问题】${intent.systemType ? '(' + intent.systemType + ')' : ''} → FastGPT工作流`);
      setStatus('正在查询公司知识库...', 'loading');

      const fastgptResult = await callFastGPT(userMessage);

      if (fastgptResult.success && fastgptResult.answer) {
        // 知识库有答案，返回并标注来源
        return {
          text: fastgptResult.answer,
          source: 'fastgpt_knowledge_base',
          sources: fastgptResult.sources.length > 0 ? fastgptResult.sources : [{ title: '公司知识库' }],
          usedFastGPT: true,
          routeType: 'system'
        };
      } else {
        // 知识库查询失败，回退到主模型
        console.warn('[三路路由] ⚠️ 知识库查询失败:', fastgptResult.error);
        addMessage('ai', `⚠️ 公司知识库暂时无法回答: ${fastgptResult.error}\n\n已切换到通用AI模式继续回答...`);

        // 回退时作为通用问答处理（不传页面内容）
        const fallbackResult = await callMainModel(userMessage, null);
        return {
          text: fallbackResult || '（AI未返回有效内容）',
          source: 'ai_model',
          usedFastGPT: false,
          routeType: 'general_chat_fallback'
        };
      }

    // ====== 路由2：页面分析 → 主AI + 页面内容 ======
    case 'page_analysis':
      console.log('[三路路由] 🔍 路由到【页面分析】 → 主AI模型（含页面上下文）');
      setStatus('正在分析页面内容...', 'loading');

      const analysisResult = await callMainModel(userMessage, contextContent || '');

      if (!analysisResult || typeof analysisResult !== 'string') {
        console.warn('[三路路由] 页面分析返回无效内容');
        return { text: '（页面分析未返回有效内容）', source: 'ai_model', usedFastGPT: false, routeType: 'page_analysis' };
      }

      return {
        text: analysisResult,
        source: 'ai_model',
        usedFastGPT: false,
        routeType: 'page_analysis'
      };

    // ====== 路由3：通用问答 → 主AI（联网查询，无页面内容）=====
    case 'general_chat':
    default:
      console.log('[三路路由] 💬 路由到【通用问答】 → 主AI模型（联网模式）');
      setStatus('正在搜索相关信息...', 'loading');

      const chatResult = await callMainModel(userMessage, null);  // 不传页面内容

      if (!chatResult || typeof chatResult !== 'string') {
        console.warn('[三路路由] 通用问答返回无效内容');
        return { text: '（AI未返回有效内容）', source: 'ai_model', usedFastGPT: false, routeType: 'general_chat' };
      }

      return {
        text: chatResult,
        source: 'ai_model',
        usedFastGPT: false,
        routeType: 'general_chat'
      };
  }
}

// ========== API 调用 ==========
async function callAPI(prompt, contextContent) {
  // 检查API配置是否完整
  if (!settings.apiUrl || !settings.apiKey) {
    throw new Error('主AI模型未配置，请在设置中填写API地址和密钥');
  }

  // 确保URL格式正确
  let apiUrl = settings.apiUrl.trim();
  if (!apiUrl) {
    throw new Error('API地址不能为空');
  }
  
  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.modelName,
      messages: [
        { role: 'system', content: '你是零跑汽车的AI助手，基于零跑汽车品牌设计。请用中文回答问题，语言简洁专业。' },
        ...chatHistory,
        {
          role: 'user',
          content: contextContent && contextContent.trim()
            ? `【当前页面内容】\n${contextContent}\n\n---\n用户问题: ${prompt}`
            : prompt  // 无页面内容时只发送纯问题（通用问答模式）
        }
      ],
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`API错误: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let hasContent = false; // 标记是否收到过有效内容

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    try {
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const data = JSON.parse(line.slice(6));

            // 安全访问嵌套属性
            const content = data?.choices?.[0]?.delta?.content;
            if (content && typeof content === 'string') {
              result += content;
              hasContent = true;
              updateLastMessage(result);
            }
          } catch (parseError) {
            // 忽略单个数据解析错误，继续处理其他行
            console.warn('[流式响应] 解析数据行失败:', parseError.message);
          }
        }
      }
    } catch (chunkError) {
      console.warn('[流式响应] 处理数据块失败:', chunkError);
    }
  }

  // 如果没有收到任何内容，返回提示信息
  if (!hasContent || !result || result.trim() === '') {
    console.warn('[流式响应] 未收到有效内容');
    return '（AI未返回有效内容，请检查API配置或重试）';
  }

  return result;
}

function updateLastMessage(text) {
  // 防御性检查：确保文本有效
  if (!text || typeof text !== 'string') {
    console.warn('[updateLastMessage] 收到无效文本:', text);
    return;
  }

  const messages = document.querySelectorAll('.message.ai .message-bubble');
  const last = messages[messages.length - 1];
  if (last) {
    try {
      last.innerHTML = renderMarkdown(text);
      const container = document.getElementById('chatContainer');
      if (container) container.scrollTop = container.scrollHeight;
    } catch (e) {
      console.error('[updateLastMessage] 更新消息失败:', e);
      // 如果渲染失败，显示纯文本（降级处理）
      last.textContent = text;
    }
  }
}

async function callOllama(prompt, contextContent) {
  // 构建完整提示词（通用问答模式时不包含页面内容）
  const fullPrompt = contextContent && contextContent.trim()
    ? `【当前页面内容】\n${contextContent}\n\n---\n用户问题: ${prompt}`
    : prompt;

  const response = await fetch(`${settings.apiUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.modelName,
      prompt: fullPrompt,
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama错误: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let hasOllamaContent = false; // 标记是否收到有效内容

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.trim());
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        const content = data?.response; // 安全访问
        if (content && typeof content === 'string') {
          result += content;
          hasOllamaContent = true;
          updateLastMessage(result);
        }
      } catch (parseError) {
        console.warn('[Ollama流式响应] 解析数据行失败:', parseError.message);
      }
    }
  }
  if (!hasOllamaContent || !result || result.trim() === '') {
    return '（AI未返回有效内容，请检查Ollama服务是否正常运行）';
  }
  return result;
}

/**
 * 调用主AI模型（封装原有逻辑）
 */
async function callMainModel(prompt, contextContent) {
  if (settings.apiType === 'ollama') {
    return await callOllama(prompt, contextContent);
  } else {
    return await callAPI(prompt, contextContent);
  }
}

// ========== 发送消息 ==========
async function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text && uploadedFiles.length === 0) return;

  // 检查API配置是否有效
  if (!isConfigValid) {
    await checkApiConfigAndShowWarning();
    if (!isConfigValid) {
      // 配置仍然无效，阻止发送并显示警告
      addMessage('ai', '⚠️ 请先完成API配置后再发送消息。点击设置按钮进行配置。');
      return;
    }
  }

  let messageText = text;
  let contextContent = '';

  if (activePageId === 'current') {
    window.parent.postMessage({ type: 'GET_PAGE_CONTENT' }, '*');
    const handler = await new Promise((resolve) => {
      const h = (event) => {
        if (event.data.type === 'PAGE_CONTENT' && event.data.content) {
          window.removeEventListener('message', h);
          resolve(event.data.content);
        }
      };
      window.addEventListener('message', h);
      setTimeout(() => { window.removeEventListener('message', h); resolve(null); }, 3000);
    });
    if (handler) {
      contextContent = formatPageContent(handler);
      updateCurrentPageInfo({ title: handler.title });
    }
  } else {
    const page = capturedPages.find(p => p.id === activePageId);
    if (page) {
      contextContent = formatPageContent(page.content);
    }
  }

  if (capturedPages.length > 0) {
    const allContent = capturedPages.map((c, i) =>
      `\n========== 页面 ${i + 1}: ${c.title} ==========\nURL: ${c.url}\n${formatPageContent(c.content)}`
    ).join('\n\n');
    contextContent = allContent;
    if (activePageId !== 'current') {
      messageText += `\n\n[已抓取 ${capturedPages.length} 个页面进行组合分析]`;
    }
  }

  if (uploadedFiles.length > 0) {
    const fileContents = await Promise.all(uploadedFiles.map(f => readFileContent(f)));
    const fileText = fileContents.map(f => `\n--- 文件: ${f.name} ---\n${f.content}`).join('\n');
    contextContent += fileText;
    messageText += `\n\n[已上传 ${uploadedFiles.length} 个文件]`;
  }

  addMessage('user', messageText);
  chatHistory.push({ role: 'user', content: messageText });

  input.value = '';
  input.style.height = 'auto';
  uploadedFiles = [];
  renderFilePreview();
  updateSendButton();

  addTypingIndicator();

  try {
    // 使用FastGPT智能路由（如果启用）
    const fastgptResult = await processMessageWithFastGPT(text, contextContent);

    removeTypingIndicator();

    // 防御性检查：确保返回结果有效
    if (!fastgptResult || typeof fastgptResult !== 'object') {
      console.error('[sendMessage] processMessageWithFastGPT 返回无效:', fastgptResult);
      throw new Error('AI处理返回异常');
    }

    const aiText = fastgptResult.text || '（AI未返回内容）';

    // 显示AI回答
    const bubble = addMessage('ai', '', true);
    updateLastMessage(aiText);

    // 如果使用了FastGPT知识库，显示来源标签
    if (fastgptResult.usedFastGPT && fastgptResult.sources && fastgptResult.sources.length > 0) {
      showRAGSourceTag(bubble, fastgptResult.sources);
    } else if (fastgptResult.usedFastGPT) {
      showRAGSourceTag(bubble, [{ title: '公司知识库' }]);
    }

    chatHistory.push({ role: 'assistant', content: aiText });
    setStatus('就绪');
  } catch (error) {
    removeTypingIndicator();
    console.error('[sendMessage] 处理消息失败:', error);
    addMessage('ai', `❌ 发生错误: ${error.message}\n\n请检查API设置是否正确。`);
    setStatus('错误', 'error');
    setTimeout(() => setStatus('就绪'), 3000);
  }
}

/**
 * 在消息气泡上显示知识库来源标签
 */
function showRAGSourceTag(bubbleElement, sources) {
  if (!bubbleElement) return;

  const tag = document.createElement('div');
  tag.className = 'rag-source-tag';

  if (sources && sources.length > 0) {
    const sourceNames = sources.map(s => s.title || s.filename || s.name || '文档').slice(0, 3).join(', ');
    tag.textContent = `📚 来源: ${sourceNames}${sources.length > 3 ? ' 等' + sources.length + '篇' : ''}`;
  } else {
    tag.textContent = '📚 来自知识库';
  }

  bubbleElement.appendChild(tag);
}

function formatPageContent(content) {
  if (!content) return '';
  let text = `页面标题: ${content.title || '未知'}\n`;
  text += `URL: ${content.url || '未知'}\n`;
  if (content.metaDescription) text += `描述: ${content.metaDescription}\n`;
  if (content.mainContent) text += `\n正文内容:\n${content.mainContent}\n`;
  if (content.tables && content.tables.length > 0) {
    text += `\n表格数据:\n`;
    content.tables.forEach(t => {
      text += `表${t.index + 1}:\n`;
      t.rows.forEach(row => { text += row.join(' | ') + '\n'; });
    });
  }
  if (content.lists && content.lists.length > 0) {
    text += `\n列表:\n`;
    content.lists.forEach(l => {
      text += `${l.type === 'ol' ? '有序' : '无序'}列表:\n`;
      l.items.forEach(item => { text += `  - ${item}\n`; });
    });
  }
  if (content.headings && content.headings.length > 0) {
    text += `\n标题结构:\n`;
    content.headings.forEach(h => { text += `${'  '.repeat(h.level - 1)}H${h.level}: ${h.text}\n`; });
  }
  return text;
}

// ========== 页面分析 ==========
async function analyzePage() {
  setStatus('正在分析页面...', 'loading');
  window.parent.postMessage({ type: 'GET_PAGE_CONTENT' }, '*');
  const handler = await new Promise((resolve) => {
    const h = (event) => {
      if (event.data.type === 'PAGE_CONTENT' && event.data.content) {
        window.removeEventListener('message', h);
        resolve(event.data.content);
      }
    };
    window.addEventListener('message', h);
    setTimeout(() => { window.removeEventListener('message', h); resolve(null); }, 3000);
  });

  if (!handler) {
    addMessage('ai', '⚠️ 无法获取页面内容，请确保在普通网页上使用。');
    setStatus('错误', 'error');
    return;
  }

  updateCurrentPageInfo({ title: handler.title });
  const contextContent = formatPageContent(handler);
  const prompt = '请全面分析当前页面的内容，包括页面主题、主要内容、关键信息和数据要点。';

  addMessage('user', '🔍 分析当前页面');
  addTypingIndicator();

  try {
    let result;
    if (settings.apiType === 'ollama') {
      result = await callOllama(prompt, contextContent);
    } else {
      result = await callAPI(prompt, contextContent);
    }
    removeTypingIndicator();
    addMessage('ai', '', true);
    updateLastMessage(result);
    chatHistory.push({ role: 'user', content: prompt });
    chatHistory.push({ role: 'assistant', content: result });
    setStatus('就绪');
  } catch (error) {
    removeTypingIndicator();
    addMessage('ai', `❌ 分析失败: ${error.message}`);
    setStatus('错误', 'error');
  }
}

// ========== 截图分析 ==========
async function screenshotAnalyze() {
  setStatus('正在截图...', 'loading');
  window.parent.postMessage({ type: 'GET_SCREENSHOT' }, '*');

  const handler = await new Promise((resolve) => {
    const h = (event) => {
      if (event.data.type === 'SCREENSHOT' && event.data.screenshot) {
        window.removeEventListener('message', h);
        resolve(event.data.screenshot);
      }
    };
    window.addEventListener('message', h);
    setTimeout(() => { window.removeEventListener('message', h); resolve(null); }, 5000);
  });

  if (!handler) {
    addMessage('ai', '⚠️ 截图失败，请重试。');
    setStatus('错误', 'error');
    return;
  }

  addMessage('user', '📸 截图分析');
  addTypingIndicator();

  try {
    const result = await callAPIWithImage('请分析这张截图的内容', handler);
    removeTypingIndicator();
    addMessage('ai', '', true);
    updateLastMessage(result);
    setStatus('就绪');
  } catch (error) {
    removeTypingIndicator();
    addMessage('ai', `❌ 截图分析失败: ${error.message}`);
    setStatus('错误', 'error');
  }
}

async function callAPIWithImage(prompt, imageBase64) {
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const response = await fetch(`${settings.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.modelName,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Data}` } }
          ]
        }
      ],
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`API错误: ${response.status}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

// ========== 新对话 ==========
function newChat() {
  chatHistory = [];
  const container = document.getElementById('chatContainer');
  container.innerHTML = `
    <div class="welcome-screen">
      <div class="welcome-icon">${LP_LOGO_LARGE}</div>
      <div class="brand-tag">LEAPMOTOR</div>
      <h2>零跑AI助手</h2>
      <p>智能分析当前页面 · 随时随地获取洞察</p>
      <div class="suggestion-chips">
        <button class="chip" data-prompt="请总结这个页面的主要内容">总结页面内容</button>
        <button class="chip" data-prompt="请提取页面中的关键数据和表格">提取关键数据</button>
        <button class="chip" data-prompt="这个页面是做什么的？请详细解释">解释页面用途</button>
        <button class="chip" data-prompt="请列出页面中的主要观点和结论">列出主要观点</button>
      </div>
    </div>
  `;
  bindChips();
}

// ========== 工具函数 ==========
function setStatus(text, type = '') {
  const indicator = document.getElementById('statusIndicator');
  if (indicator) {
    indicator.textContent = text;
    indicator.className = 'status-indicator' + (type ? ' ' + type : '');
  }
}

function updateSendButton() {
  const input = document.getElementById('messageInput');
  const btn = document.getElementById('sendBtn');
  if (btn) {
    btn.disabled = !input.value.trim() && uploadedFiles.length === 0;
  }
}

function bindChips() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const input = document.getElementById('messageInput');
      input.value = chip.dataset.prompt;
      updateSendButton();
      sendMessage();
    });
  });
}

// ========== 快捷键提示（平台自适应） ==========
function renderShortcutHints() {
  const el = document.getElementById('shortcutHint');
  if (el) {
    el.innerHTML = `<kbd>${MOD_KEY}</kbd><kbd>J</kbd> 唤起 · <kbd>${MOD_KEY}</kbd><kbd>V</kbd> 粘贴`;
  }
}

// ========== 首次使用引导 & API配置检查 ==========
let isConfigValid = false; // 标记API配置是否有效

function checkOnboarding() {
  const hasApiKey = settings.apiKey && settings.apiKey.trim().length > 0;
  const hasSeenOnboarding = localStorage.getItem('onboardingSeen');
  if (!hasApiKey && !hasSeenOnboarding) {
    showOnboarding();
    return true; // 显示了首次引导
  }
  return false;
}

async function checkApiConfigAndShowWarning() {
  // 先检查是否需要显示首次引导
  const showedOnboarding = checkOnboarding();
  if (showedOnboarding) return;

  // 收集所有配置问题
  const issues = [];

  if (!settings.apiKey || settings.apiKey.trim() === '') {
    issues.push({
      icon: '🔑',
      title: 'API Key 未填写',
      desc: '请输入你的API密钥'
    });
  }

  if (!settings.apiUrl || settings.apiUrl.trim() === '') {
    issues.push({
      icon: '🌐',
      title: 'API 地址未填写',
      desc: '请输入API服务地址（如 https://api.example.com/v1）'
    });
  }

  if (!settings.modelName || settings.modelName.trim() === '') {
    issues.push({
      icon: '🤖',
      title: '模型名称未填写',
      desc: '请输入要使用的模型名称（如 gpt-4、claude-3 等）'
    });
  }

  // 如果有必填项缺失，直接显示警告
  if (issues.length > 0) {
    isConfigValid = false;
    showConfigWarning(issues);
    return;
  }

  // 所有必填项都有，测试连接
  updateApiStatus('loading', '检测连接...');
  const result = await testApiConnection();

  if (!result.success) {
    issues.push({
      icon: '❌',
      title: 'API 连接失败',
      desc: result.error || '无法连接到API服务器，请检查地址和密钥是否正确'
    });

    isConfigValid = false;
    showConfigWarning(issues);
    updateApiStatus('error', '连接失败');
  } else {
    // 配置完全正确
    isConfigValid = true;
    updateApiStatus('success', '就绪');
  }
}

function showConfigWarning(issues) {
  const modal = document.getElementById('configWarningModal');
  if (!modal) return;

  // 填充问题列表
  const issueListEl = document.getElementById('configIssueList');
  if (issueListEl && issues.length > 0) {
    let html = '';
    issues.forEach(issue => {
      html += `
        <div class="config-issue-item">
          <span class="issue-icon">${issue.icon}</span>
          <div class="issue-text">
            <strong>${issue.title}</strong>
            <div>${issue.desc}</div>
          </div>
        </div>
      `;
    });
    issueListEl.innerHTML = html;
  }

  modal.classList.remove('hidden');

  // 绑定按钮事件（每次显示都重新绑定，避免重复）
  const openBtn = document.getElementById('openConfigSettingsBtn');
  const closeBtn = document.getElementById('closeConfigWarningBtn');

  // 移除旧的事件监听器（通过克隆节点）
  if (openBtn) {
    const newOpenBtn = openBtn.cloneNode(true);
    openBtn.parentNode.replaceChild(newOpenBtn, openBtn);
    newOpenBtn.addEventListener('click', () => {
      closeConfigWarning();
      document.getElementById('settingsPanel').classList.remove('hidden');
    });
  }

  if (closeBtn) {
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    newCloseBtn.addEventListener('click', () => {
      closeConfigWarning();
    });
  }

  const overlay = document.querySelector('.config-warning-overlay');
  if (overlay) {
    const newOverlay = overlay.cloneNode(true);
    overlay.parentNode.replaceChild(newOverlay, overlay);
    newOverlay.addEventListener('click', closeConfigWarning);
  }
}

function closeConfigWarning() {
  const modal = document.getElementById('configWarningModal');
  if (modal) modal.classList.add('hidden');
}

function showOnboarding() {
  const modal = document.getElementById('onboardingModal');
  if (modal) modal.classList.remove('hidden');

  const openBtn = document.getElementById('openSettingsBtn');
  const skipBtn = document.getElementById('skipOnboardingBtn');
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      closeOnboarding();
      document.getElementById('settingsPanel').classList.remove('hidden');
    });
  }
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      localStorage.setItem('onboardingSeen', 'true');
      closeOnboarding();
    });
  }

  const overlay = document.querySelector('.onboarding-overlay');
  if (overlay) overlay.addEventListener('click', closeOnboarding);
}

function closeOnboarding() {
  const modal = document.getElementById('onboardingModal');
  if (modal) modal.classList.add('hidden');
}

// ========== 提示词收藏夹 ==========
let savedPrompts = [];

function initPromptFavorites() {
  loadSavedPrompts();

  const favoritesBtn = document.getElementById('promptFavoritesBtn');
  if (favoritesBtn) {
    favoritesBtn.addEventListener('click', openFavorites);
  }

  const closeBtn = document.getElementById('closeFavorites');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeFavorites);
  }

  const overlay = document.querySelector('.favorites-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeFavorites);
  }

  const addBtn = document.getElementById('addNewPromptBtn');
  if (addBtn) {
    addBtn.addEventListener('click', addNewPrompt);
  }

  const newInput = document.getElementById('newPromptInput');
  if (newInput) {
    newInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addNewPrompt();
      }
    });
  }
}

function loadSavedPrompts() {
  const saved = localStorage.getItem('savedPrompts');
  if (saved) {
    try {
      savedPrompts = JSON.parse(saved);
    } catch(e) {
      savedPrompts = [];
    }
  }
}

function savePromptsToStorage() {
  localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
}

function openFavorites() {
  const modal = document.getElementById('promptFavoritesModal');
  if (modal) {
    modal.classList.remove('hidden');
    renderPromptList();
    const input = document.getElementById('newPromptInput');
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function closeFavorites() {
  const modal = document.getElementById('promptFavoritesModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function addNewPrompt() {
  const input = document.getElementById('newPromptInput');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  // 检查是否重复
  if (savedPrompts.includes(text)) {
    input.value = '';
    alert('该提示词已存在');
    return;
  }

  savedPrompts.unshift(text); // 添加到最前面
  savePromptsToStorage();
  renderPromptList();
  input.value = '';
}

function deletePrompt(index) {
  if (index >= 0 && index < savedPrompts.length) {
    savedPrompts.splice(index, 1);
    savePromptsToStorage();
    renderPromptList();
  }
}

function usePrompt(promptText) {
  closeFavorites();
  const input = document.getElementById('messageInput');
  if (input) {
    input.value = promptText;
    updateSendButton();
    sendMessage();
  }
}

function renderPromptList() {
  const listEl = document.getElementById('promptList');
  if (!listEl) return;

  if (savedPrompts.length === 0) {
    listEl.innerHTML = '<div class="empty-favorites">暂无收藏的提示词，点击上方添加</div>';
    return;
  }

  let html = '';
  savedPrompts.forEach((prompt, index) => {
    html += `
      <div class="prompt-item" data-index="${index}">
        <span class="prompt-item-text" title="${prompt.replace(/"/g, '&quot;')}">${prompt}</span>
        <button class="prompt-item-delete" data-index="${index}" title="删除">×</button>
      </div>
    `;
  });
  listEl.innerHTML = html;

  // 绑定使用事件
  listEl.querySelectorAll('.prompt-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // 如果点击的是删除按钮，不触发使用
      if (e.target.classList.contains('prompt-item-delete')) return;
      const idx = parseInt(item.dataset.index);
      usePrompt(savedPrompts[idx]);
    });
  });

  // 绑定删除事件
  listEl.querySelectorAll('.prompt-item-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index);
      deletePrompt(idx);
    });
  });
}

// 收藏当前发送的消息（从消息气泡触发）
function addToFavorites(promptText) {
  if (!promptText || promptText.trim() === '') return;

  const text = promptText.trim();
  // 检查是否重复
  if (!savedPrompts.includes(text)) {
    savedPrompts.unshift(text);
    savePromptsToStorage();
    // 显示短暂的收藏成功提示
    setStatus('已收藏到常用提示词 ✓', 'success');
    setTimeout(() => checkApiStatus(), 1500);
  } else {
    setStatus('该提示词已存在于收藏夹', 'error');
    setTimeout(() => checkApiStatus(), 2000);
  }
}

// ========== API 连接状态检测 ==========
async function testApiConnection() {
  if (!settings.apiKey || settings.apiKey.trim() === '') {
    return { success: false, error: '未配置API Key' };
  }

  if (!settings.apiUrl || settings.apiUrl.trim() === '') {
    return { success: false, error: '未配置API地址' };
  }

  try {
    const response = await fetch(`${settings.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.modelName,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 5,
        stream: false
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: `API错误 ${response.status}: ${errorData.error?.message || response.statusText}` };
    }
  } catch (error) {
    return { success: false, error: `连接失败: ${error.message}` };
  }
}

async function checkApiStatus() {
  // 如果没有API Key，显示未配置状态
  if (!settings.apiKey || settings.apiKey.trim() === '') {
    updateApiStatus('warning', '未配置API Key');
    return;
  }

  // 如果没有API地址，显示错误
  if (!settings.apiUrl || settings.apiUrl.trim() === '') {
    updateApiStatus('error', '未配置API地址');
    return;
  }

  // 显示检测中状态
  updateApiStatus('loading', '检测中...');

  const result = await testApiConnection();
  if (result.success) {
    updateApiStatus('success', '就绪');
  } else {
    updateApiStatus('error', result.error.substring(0, 20));
  }
}

function updateApiStatus(type, message) {
  const indicator = document.getElementById('statusIndicator');
  if (indicator) {
    indicator.textContent = message;
    indicator.className = 'status-indicator';
    if (type && type !== 'success') {
      indicator.classList.add(type);
    }
  }
}

// ========== 粘贴上传（Ctrl+V / Cmd+V） ==========
function initPasteHandler() {
  const input = document.getElementById('messageInput');
  if (!input) return;

  input.addEventListener('paste', async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let hasFile = false;
    for (const item of Array.from(items)) {
      // 处理图片粘贴
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        hasFile = true;
        const file = item.getAsFile();
        if (file) {
          uploadedFiles.push(file);
          renderFilePreview();
          updateSendButton();
        }
        continue;
      }
      // 处理文件粘贴
      if (item.kind === 'file') {
        e.preventDefault();
        hasFile = true;
        const file = item.getAsFile();
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            addMessage('ai', `⚠️ 文件 "${file.name}" 超过10MB限制`);
            continue;
          }
          uploadedFiles.push(file);
          renderFilePreview();
          updateSendButton();
        }
      }
    }
    if (hasFile) {
      input.focus();
    }
  });
}

// ========== 设置管理 ==========
function loadSettings() {
  const saved = localStorage.getItem('aiSettings');
  if (saved) {
    settings = JSON.parse(saved);
  } else {
    settings = {
      apiType: 'openai',
      apiUrl: document.getElementById('apiUrl')?.value || '',
      apiKey: document.getElementById('apiKey')?.value || '',
      modelName: document.getElementById('modelName')?.value || ''
    };
  }
  if (document.getElementById('apiType')) document.getElementById('apiType').value = settings.apiType || 'openai';
  if (document.getElementById('apiUrl')) document.getElementById('apiUrl').value = settings.apiUrl || '';
  if (document.getElementById('apiKey')) document.getElementById('apiKey').value = settings.apiKey || '';
  if (document.getElementById('modelName')) document.getElementById('modelName').value = settings.modelName || '';

  // 加载员工工号（OA流程查询）
  const savedEmployeeId = localStorage.getItem('employeeId');
  if (savedEmployeeId && document.getElementById('employeeId')) {
    document.getElementById('employeeId').value = savedEmployeeId;
    employeeId = savedEmployeeId;
  }

  // 加载FastGPT设置
  const savedFastGpt = localStorage.getItem('fastGptSettings');
  if (savedFastGpt) {
    fastGptSettings = JSON.parse(savedFastGpt);
  }
  initFastGPTConfigUI();
}

function initFastGPTConfigUI() {
  const enabledCheckbox = document.getElementById('fastgptEnabled');
  const configSection = document.getElementById('fastgptConfigSection');

  if (enabledCheckbox && configSection) {
    // 默认启用智能路由（FastGPT已预配置）
    enabledCheckbox.checked = FASTGPT_CONFIG.enabled;
    toggleFastGPTSection(FASTGPT_CONFIG.enabled);

    // 绑定开关事件（允许用户禁用）
    enabledCheckbox.addEventListener('change', () => {
      FASTGPT_CONFIG.enabled = enabledCheckbox.checked;
      toggleFastGPTSection(enabledCheckbox.checked);
      // 保存用户的选择
      localStorage.setItem('fastgptEnabled', enabledCheckbox.checked);
    });

    // 恢复用户的启用/禁用选择
    const userChoice = localStorage.getItem('fastgptEnabled');
    if (userChoice !== null) {
      enabledCheckbox.checked = userChoice === 'true';
      FASTGPT_CONFIG.enabled = enabledCheckbox.checked;
      toggleFastGPTSection(enabledCheckbox.checked);
    }
  }
}

function toggleFastGPTSection(show) {
  const section = document.getElementById('fastgptConfigSection');
  if (section) {
    if (show) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  }
}

function saveSettings() {
  settings = {
    apiType: document.getElementById('apiType').value,
    apiUrl: document.getElementById('apiUrl').value,
    apiKey: document.getElementById('apiKey').value,
    modelName: document.getElementById('modelName').value
  };
  localStorage.setItem('aiSettings', JSON.stringify(settings));

  // FastGPT配置已预固定，只保存用户的启用/禁用选择
  const fastgptEnabled = document.getElementById('fastgptEnabled')?.checked ?? FASTGPT_CONFIG.enabled;
  localStorage.setItem('fastgptEnabled', fastgptEnabled);
  FASTGPT_CONFIG.enabled = fastgptEnabled;

  localStorage.setItem('onboardingSeen', 'true');
  closeOnboarding();
  closeConfigWarning(); // 关闭配置警告弹窗
  const panel = document.getElementById('settingsPanel');
  panel.classList.add('hidden');
  setStatus('设置已保存，正在验证...', 'loading');

  // 延迟检测API连接状态（给UI一点时间更新）
  setTimeout(async () => {
    await checkApiConfigAndShowWarning();

    if (isConfigValid) {
      setStatus('✓ 配置正确，可以使用', 'success');
      setTimeout(() => updateApiStatus('success', '就绪'), 2000);
    }
    // 如果配置有问题，checkApiConfigAndShowWarning已经显示了警告弹窗
  }, 300);
}

function initGlassControls() {
  const opacitySlider = document.getElementById('glassOpacity');
  const opacityValue = document.getElementById('glassOpacityValue');
  const blurSlider = document.getElementById('blurAmount');
  const blurValue = document.getElementById('blurAmountValue');

  const savedOpacity = localStorage.getItem('glassOpacity');
  const savedBlur = localStorage.getItem('blurAmount');
  if (savedOpacity) { opacitySlider.value = savedOpacity; opacityValue.textContent = savedOpacity + '%'; }
  if (savedBlur) { blurSlider.value = savedBlur; blurValue.textContent = savedBlur + 'px'; }
  applyGlassEffect();

  opacitySlider.addEventListener('input', () => {
    opacityValue.textContent = opacitySlider.value + '%';
    localStorage.setItem('glassOpacity', opacitySlider.value);
    applyGlassEffect();
  });
  blurSlider.addEventListener('input', () => {
    blurValue.textContent = blurSlider.value + 'px';
    localStorage.setItem('blurAmount', blurSlider.value);
    applyGlassEffect();
  });
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      opacitySlider.value = btn.dataset.opacity;
      opacityValue.textContent = btn.dataset.opacity + '%';
      localStorage.setItem('glassOpacity', btn.dataset.opacity);
      applyGlassEffect();
    });
  });
}

function applyGlassEffect() {
  const opacity = parseInt(document.getElementById('glassOpacity').value);
  const blur = document.getElementById('blurAmount').value;
  document.documentElement.style.setProperty('--glass-blur', blur + 'px');
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const baseAlpha = isLight ? 0.5 : 0.06;
  const alpha = baseAlpha + (opacity / 100);
  document.documentElement.style.setProperty('--glass-bg', `rgba(${isLight ? '255,255,255' : '255,255,255'}, ${alpha})`);
}

// ========== 消息监听 ==========
window.addEventListener('message', (event) => {
  if (event.data.type === 'AUTO_ANALYZE' && event.data.content) {
    currentPageContent = event.data.content;
    updateCurrentPageInfo({ title: event.data.content.title });
    const input = document.getElementById('messageInput');
    input.value = '请分析当前页面的主要内容';
    sendMessage();
  } else if (event.data.type === 'TAB_INFO' && event.data.tabInfo) {
    updateCurrentPageInfo(event.data.tabInfo);
  }
});

// ========== 初始化 ==========
function init() {
  // 加载自定义快捷键
  loadCustomShortcuts();

  initTheme();
  initPageContext();
  initFileUpload();
  loadSettings();
  initGlassControls();
  bindChips();
  renderShortcutHints();
  initPasteHandler();
  initPromptFavorites();
  initShortcutConfigUI();  // 初始化快捷键配置UI
  initGlobalKeyboardListener();  // 初始化全局键盘监听
  initSettingsTabs();  // 初始化设置面板Tab切换
  initOAProcessFeature();  // 初始化OA流程查询功能
  initAutoUpdateSystem();  // 初始化在线自动更新系统

  // 延迟检查API配置（等设置加载完）
  // 每次打开插件都会检查，有问题就弹出提示
  setTimeout(checkApiConfigAndShowWarning, 500);

  // 初始化AI智能推荐问题（延迟执行以确保页面内容已加载）
  setTimeout(() => {
    initSmartSuggestions().catch(err => {
      console.error('[智能推荐] 初始化失败:', err);
      // 如果智能推荐失败，显示默认建议
      renderSmartSuggestions(getDefaultSuggestions(), 'smartSuggestionsContainer');
    });
  }, 1000);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });

  const input = document.getElementById('messageInput');
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    updateSendButton();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  document.getElementById('newChatBtn').addEventListener('click', newChat);
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingsPanel').classList.toggle('hidden');
  });
  document.getElementById('saveSettings').addEventListener('click', saveSettings);

  // 测试API连接按钮
  const testApiBtn = document.getElementById('testApiConnection');
  if (testApiBtn) {
    testApiBtn.addEventListener('click', handleTestApiConnection);
  }

  // 模型广场按钮 - 跳转到公司内部模型广场
  const modelSquareBtn = document.getElementById('openModelSquare');
  if (modelSquareBtn) {
    modelSquareBtn.addEventListener('click', () => {
      window.open('https://ai.leapmotor.com/settings/model-square', '_blank');
      console.log('[模型广场] 已打开:', 'https://ai.leapmotor.com/settings/model-square');
    });
  }

  document.getElementById('closeBtn').addEventListener('click', () => {
    window.parent.postMessage({ type: 'CLOSE_SIDEBAR' }, '*');
  });
}

/**
 * 处理测试API连接按钮点击
 * 显示弹框提示连接结果
 */
async function handleTestApiConnection() {
  const btn = document.getElementById('testApiConnection');
  const resultSpan = document.getElementById('apiTestResult');

  // 按钮状态：加载中
  btn.disabled = true;
  btn.textContent = '测试中...';
  if (resultSpan) resultSpan.textContent = '正在连接...';

  try {
    // 先读取当前输入框的值（用户可能修改了但还没保存）
    const apiUrl = document.getElementById('apiUrl')?.value?.trim() || settings.apiUrl;
    const apiKey = document.getElementById('apiKey')?.value || settings.apiKey;
    const modelName = document.getElementById('modelName')?.value?.trim() || settings.modelName;

    // 验证必填项
    if (!apiUrl) {
      showApiTestResult(false, '请输入API地址');
      return;
    }
    if (!apiKey) {
      showApiTestResult(false, '请输入API Key');
      return;
    }
    if (!modelName) {
      showApiTestResult(false, '请输入模型名称');
      return;
    }

    // 调用API测试
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 5,
        stream: false
      })
    });

    if (response.ok) {
      showApiTestResult(true, '连接成功！API配置正确');
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
      showApiTestResult(false, `连接失败: ${errorMsg}`);
    }
  } catch (error) {
    showApiTestResult(false, `连接失败: ${error.message}`);
  } finally {
    // 恢复按钮状态
    btn.disabled = false;
    btn.textContent = '测试连接';
  }
}

/**
 * 显示API测试结果弹框
 */
function showApiTestResult(success, message) {
  const resultSpan = document.getElementById('apiTestResult');
  if (resultSpan) {
    resultSpan.textContent = success ? '✅ 成功' : '❌ 失败';
    resultSpan.style.color = success ? 'var(--lp-green)' : '#ff4444';
  }

  // 创建弹框
  const modal = document.createElement('div');
  modal.className = 'api-test-modal-overlay';
  modal.innerHTML = `
    <div class="api-test-modal">
      <div class="api-test-icon">${success ? '✅' : '❌'}</div>
      <h3 class="api-test-title">${success ? '连接成功' : '连接失败'}</h3>
      <p class="api-test-message">${message}</p>
      <button class="btn btn-primary api-test-close">确定</button>
    </div>
  `;

  document.body.appendChild(modal);

  // 点击确定或背景关闭弹框
  const closeModal = () => {
    modal.style.animation = 'modalFadeOut 0.2s ease-out forwards';
    setTimeout(() => modal.remove(), 200);
  };

  modal.querySelector('.api-test-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // 自动关闭（成功3秒，失败不自动关闭）
  if (success) {
    setTimeout(closeModal, 3000);
  }
}

// ========== OA流程查询功能 ==========

/**
 * 初始化OA流程查询功能
 */
function initOAProcessFeature() {
  console.log('[OA流程] 🚀 初始化功能...');

  // 绑定侧边栏的OA流程按钮
  const oaProcessBtn = document.getElementById('oaProcessBtn');
  if (oaProcessBtn) {
    oaProcessBtn.addEventListener('click', () => {
      openOAModal();
    });
  }

  // 绑定设置中的测试按钮
  const testOABtn = document.getElementById('testOAProcessBtn');
  if (testOABtn) {
    testOABtn.addEventListener('click', handleTestOAProcess);
  }

  // 绑定弹窗中的各种按钮
  bindOAModalEvents();

  // 监听工号输入框变化（实时保存）
  const employeeIdInput = document.getElementById('employeeId');
  if (employeeIdInput) {
    employeeIdInput.addEventListener('change', (e) => {
      const value = e.target.value.trim();
      if (value) {
        localStorage.setItem('employeeId', value);
        employeeId = value;
        console.log('[OA流程] ✅ 工号已保存:', value);
      }
    });

    employeeIdInput.addEventListener('input', (e) => {
      employeeId = e.target.value.trim();
    });
  }
}

/**
 * 打开OA流程弹窗
 */
function openOAModal() {
  const modal = document.getElementById('oaProcessModal');
  if (!modal) return;

  modal.classList.remove('hidden');

  // 检查是否已配置工号
  if (!employeeId) {
    showOAModalState('empty');
    return;
  }

  // 自动加载流程列表
  loadOAProcessList();
}

/**
 * 关闭OA流程弹窗
 */
function closeOAModal() {
  const modal = document.getElementById('oaProcessModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

/**
 * 绑定弹窗事件
 */
function bindOAModalEvents() {
  // 关闭按钮
  const closeBtn = document.getElementById('closeOaProcessModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeOAModal);
  }

  // 点击遮罩层关闭
  const overlay = document.querySelector('.oa-process-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeOAModal);
  }

  // 刷新按钮
  const refreshBtn = document.getElementById('refreshOaProcessBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadOAProcessList);
  }

  // 重试按钮
  const retryBtn = document.getElementById('retryOaProcessBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', loadOAProcessList);
  }

  // 去设置按钮
  const goToConfigBtn = document.getElementById('goToConfigEmployeeIdBtn');
  if (goToConfigBtn) {
    goToConfigBtn.addEventListener('click', () => {
      closeOAModal();
      openSettingsPanel();
      // 切换到知识库Tab（工号配置在那里）
      setTimeout(() => {
        const knowledgeTab = document.querySelector('.settings-tab[data-tab="knowledge"]');
        if (knowledgeTab) knowledgeTab.click();
      }, 300);
    });
  }

  // 搜索框
  const searchInput = document.getElementById('oaProcessSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterOAProcessList(e.target.value.trim());
    });
  }
}

/**
 * 显示弹窗的不同状态
 */
function showOAModalState(state, data) {
  // 隐藏所有状态容器
  const containers = ['oaProcessLoading', 'oaProcessList', 'oaProcessError', 'oaProcessEmpty'];
  containers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  // 显示指定状态
  switch (state) {
    case 'loading':
      showElement('oaProcessLoading');
      break;
    case 'list':
      renderOAProcessList(data || []);
      showElement('oaProcessList');
      break;
    case 'error':
      const errorMsgEl = document.getElementById('oaProcessErrorMessage');
      if (errorMsgEl) errorMsgEl.textContent = data || '查询失败，请检查网络连接';
      showElement('oaProcessError');
      break;
    case 'empty':
      showElement('oaProcessEmpty');
      break;
  }
}

/**
 * 显示元素（移除hidden类）
 */
function showElement(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

/**
 * 加载OA流程列表
 */
async function loadOAProcessList() {
  if (!employeeId) {
    showOAModalState('empty');
    return;
  }

  showOAModalState('loading');

  try {
    const apiUrl = `https://lppms.leapmotor.com/pmapi/ufOAWorkFlow/collectOAProcess?number=${encodeURIComponent(employeeId)}`;

    console.log('[OA流程] 📡 正在请求:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors' // 尝试CORS模式，如果不行可能需要background.js代理
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    const data = await response.json();
    console.log('[OA流程] ✅ 获取到数据:', data);

    // 解析返回的数据格式（根据实际API响应调整）
    let processList = [];

    if (Array.isArray(data)) {
      processList = data;
    } else if (data && Array.isArray(data.data)) {
      processList = data.data;
    } else if (data && data.list && Array.isArray(data.list)) {
      processList = data.list;
    } else if (data && typeof data === 'object') {
      // 尝试从对象中提取数组
      Object.values(data).forEach(val => {
        if (Array.isArray(val)) processList = val;
      });
    }

    if (processList.length === 0) {
      showOAModalState('error', '未找到可发起的OA流程');
    } else {
      showOAModalState('list', processList);
    }
  } catch (error) {
    console.error('[OA流程] ❌ 获取失败:', error.message);

    // 如果是CORS错误，尝试通过background.js代理
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      console.log('[OA流程] 🔀 CORS受限，尝试通过代理获取...');
      try {
        const proxyResult = await fetchOAProcessViaProxy(employeeId);
        if (proxyResult.success) {
          showOAModalState('list', proxyResult.data);
        } else {
          showOAModalState('error', proxyResult.error || '通过代理获取失败');
        }
      } catch (proxyError) {
        showOAModalState('error', `网络错误: ${proxyError.message}`);
      }
    } else {
      showOAModalState('error', `查询失败: ${error.message}`);
    }
  }
}

/**
 * 通过background.js代理获取OA流程（解决CORS问题）
 */
async function fetchOAProcessViaProxy(loginId) {
  return new Promise((resolve, reject) => {
    window.parent.postMessage({
      type: 'SEND_TO_BACKGROUND',
      backgroundMessage: {
        type: 'FETCH_OA_PROCESS',
        loginId: loginId
      }
    }, '*');

    // 设置超时
    const timeout = setTimeout(() => {
      reject(new Error('代理请求超时'));
    }, 15000);

    // 监听响应
    const handler = (event) => {
      if (event.data.type === 'OA_PROCESS_RESULT') {
        clearTimeout(timeout);
        window.removeEventListener('message', handler);
        
        if (event.data.success) {
          resolve({ success: true, data: event.data.data });
        } else {
          resolve({ success: false, error: event.data.error });
        }
      }
    };

    window.addEventListener('message', handler);
  });
}

/**
 * 渲染OA流程列表
 */
function renderOAProcessList(processList) {
  const listContainer = document.getElementById('oaProcessList');
  if (!listContainer) return;

  if (!processList || processList.length === 0) {
    listContainer.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">暂无数据</div>';
    return;
  }

  listContainer.innerHTML = processList.map((process, index) => {
    // 根据实际API返回的字段名调整
    const name = process.name || process.processName || process.title || process.workflowName || '未命名流程';
    const desc = process.description || process.desc || process.remark || '';
    const id = process.id || process.processId || process.workflowId || index;
    const url = process.url || process.link || process.formUrl || '';

    return `
      <div class="oa-process-item" data-id="${id}" data-name="${name}" data-url="${url}">
        <div class="oa-process-info">
          <div class="oa-process-name">${escapeHtml(name)}</div>
          ${desc ? `<div class="oa-process-desc">${escapeHtml(desc)}</div>` : ''}
        </div>
        <svg class="oa-process-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    `;
  }).join('');

  // 绑定点击事件
  listContainer.querySelectorAll('.oa-process-item').forEach(item => {
    item.addEventListener('click', () => handleOAProcessClick(item));
  });
}

/**
 * 处理流程项点击
 */
function handleOAProcessClick(item) {
  const name = item.dataset.name;
  const url = item.dataset.url;
  const id = item.dataset.id;

  console.log('[OA流程] 👆 点击流程:', { name, id, url });

  if (url) {
    // 有链接：直接打开或提示用户
    if (confirm(`是否打开流程「${name}」？\n\n将在新标签页打开。`)) {
      window.open(url, '_blank');
    }
  } else {
    // 无链接：将流程名称填入输入框，让AI帮助处理
    const input = document.getElementById('messageInput');
    if (input) {
      input.value = `我想发起「${name}」这个流程，请告诉我如何操作`;
      updateSendButton();
      
      // 关闭弹窗并聚焦输入框
      closeOAModal();
      input.focus();
      
      setStatus('已填入流程名称，可编辑后发送', 'success');
      setTimeout(() => setStatus('就绪'), 2000);
    }
  }
}

/**
 * 过滤流程列表（搜索）
 */
function filterOAProcessList(keyword) {
  const items = document.querySelectorAll('.oa-process-item');
  
  items.forEach(item => {
    const name = item.dataset.name.toLowerCase();
    const match = !keyword || name.includes(keyword.toLowerCase());
    item.style.display = match ? '' : 'none';
  });
}

/**
 * 处理设置中的"测试查询流程"按钮
 */
async function handleTestOAProcess() {
  const testResultEl = document.getElementById('oaProcessTestResult');
  const testBtn = document.getElementById('testOAProcessBtn');
  
  if (!testResultEl || !testBtn) return;

  // 获取当前输入的工号
  const inputEl = document.getElementById('employeeId');
  const currentEmployeeId = inputEl ? inputEl.value.trim() : '';

  if (!currentEmployeeId) {
    testResultEl.className = 'oa-test-result error';
    testResultEl.innerHTML = '⚠️ 请先输入员工工号';
    testResultEl.classList.remove('hidden');
    return;
  }

  // 更新全局变量
  localStorage.setItem('employeeId', currentEmployeeId);
  employeeId = currentEmployeeId;

  // 禁用按钮，显示加载状态
  testBtn.disabled = true;
  testBtn.textContent = '⏳ 查询中...';

  try {
    const apiUrl = `https://lppms.leapmotor.com/pmapi/ufOAWorkFlow/collectOAProcess?number=${encodeURIComponent(currentEmployeeId)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // 计算流程数量
    let count = 0;
    if (Array.isArray(data)) count = data.length;
    else if (data && Array.isArray(data.data)) count = data.data.length;
    else if (data && data.list && Array.isArray(data.list)) count = data.list.length;

    testResultEl.className = 'oa-test-result success';
    testResultEl.innerHTML = `✅ 查询成功！找到 <strong>${count}</strong> 个可发起的OA流程<br><small>点击侧边栏📋按钮查看完整列表</small>`;
    
  } catch (error) {
    testResultEl.className = 'oa-test-result error';
    testResultEl.innerHTML = `❌ 查询失败: ${error.message}<br><small>请检查工号是否正确或网络连接</small>`;
  }

  testResultEl.classList.remove('hidden');
  testBtn.disabled = false;
  testBtn.textContent = '🔍 测试查询流程';
}

/**
 * HTML转义（防止XSS）
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 打开设置面板
 */
function openSettingsPanel() {
  const settingsPanel = document.getElementById('settingsPanel');
  if (settingsPanel) {
    settingsPanel.classList.remove('hidden');
  }
}

// ========== 在线自动更新系统 ==========

/**
 * 更新配置（可自定义）
 */
const UPDATE_CONFIG = {
  // 更新检查间隔（毫秒）- 默认24小时
  checkInterval: 24 * 60 * 60 * 1000,

  // 更新源URL（支持多种格式）
  // 选项1: GitHub Releases API
  // 选项2: 自定义JSON接口
  // 选项3: 零跑内部服务器
  updateUrls: [
    // GitHub Releases（推荐用于公开版本）
    'https://api.github.com/repos/{owner}/{repo}/releases/latest',

    // 自定义服务器（企业内部使用）
    // 'https://your-server.com/api/check-update',
  ],

  // 当前使用的更新源索引
  activeUpdateSource: 0,
};

let currentVersion = ''; // 从manifest读取
let lastCheckTime = 0; // 上次检查时间
let updateInfoCache = null; // 缓存的更新信息

/**
 * 初始化在线自动更新系统
 */
function initAutoUpdateSystem() {
  console.log('[在线更新] 🚀 初始化自动更新系统...');

  // 获取当前版本号
  currentVersion = getCurrentVersion();
  console.log('[在线更新] 📌 当前版本:', currentVersion);

  // 显示当前版本号
  const versionDisplay = document.getElementById('currentVersionDisplay');
  if (versionDisplay) {
    versionDisplay.textContent = `v${currentVersion}`;
  }

  // 绑定事件
  bindUpdateEvents();

  // 检查是否需要自动检查更新
  shouldAutoCheckUpdate().then(shouldCheck => {
    if (shouldCheck) {
      console.log('[在线更新] ⏰ 执行定时检查...');
      checkForUpdates(true); // true = 静默模式
    } else {
      console.log('[在线更新] ℹ️ 跳过自动检查（距离上次检查时间过短）');
    }
  });
}

/**
 * 获取当前扩展版本号
 */
function getCurrentVersion() {
  try {
    // 从manifest.json读取版本号
    const manifest = chrome.runtime.getManifest();
    return manifest.version || '1.0.0';
  } catch (e) {
    console.warn('[在线更新] 无法获取manifest版本:', e);
    return '1.0.0';
  }
}

/**
 * 绑定更新相关事件
 */
function bindUpdateEvents() {
  // 检查更新按钮
  const checkBtn = document.getElementById('checkUpdateBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      handleManualCheckUpdate();
    });
  }

  // 查看更新日志按钮
  const changelogBtn = document.getElementById('viewChangelogBtn');
  if (changelogBtn) {
    changelogBtn.addEventListener('click', () => {
      showChangelogModal();
    });
  }

  // 新版本弹窗事件
  bindUpdateModalEvents();

  // 进度弹窗事件
  bindProgressModalEvents();

  // 日志详情弹窗事件
  bindChangelogModalEvents();
}

/**
 * 绑定新版本发现弹窗事件
 */
function bindUpdateModalEvents() {
  // 关闭按钮
  const closeBtn = document.getElementById('closeUpdateModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeUpdateAvailableModal);
  }

  // 点击遮罩关闭
  const overlay = document.querySelector('#updateAvailableModal .update-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeUpdateAvailableModal);
  }

  // 稍后提醒按钮
  const skipBtn = document.getElementById('skipUpdateBtn');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      closeUpdateAvailableModal();
      showUpdateStatus('已跳过，将在下次打开时再次提醒', 'info');
      // 记录跳过时间，避免频繁提示
      localStorage.setItem('lastSkipUpdateTime', Date.now());
    });
  }

  // 立即下载按钮
  const downloadBtn = document.getElementById('downloadUpdateBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      startDownloadUpdate(updateInfoCache);
    });
  }
}

/**
 * 绑定进度弹窗事件
 */
function bindProgressModalEvents() {
  const cancelBtn = document.getElementById('cancelDownloadBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      // TODO: 实现取消下载逻辑
      closeUpdateProgressModal();
      showUpdateStatus('下载已取消', 'error');
    });
  }
}

/**
 * 绑定日志详情弹窗事件
 */
function bindChangelogModalEvents() {
  const closeBtn = document.getElementById('closeChangelogModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeChangelogModal);
  }

  const overlay = document.querySelector('#changelogModal .update-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeChangelogModal);
  }
}

/**
 * 判断是否应该执行自动检查
 */
async function shouldAutoCheckUpdate() {
  const lastCheck = parseInt(localStorage.getItem('lastUpdateCheckTime') || '0');
  const now = Date.now();
  const timeSinceLastCheck = now - lastCheck;

  return timeSinceLastCheck > UPDATE_CONFIG.checkInterval;
}

/**
 * 手动触发检查更新
 */
async function handleManualCheckUpdate() {
  const statusEl = document.getElementById('updateStatusText');
  const btn = document.getElementById('checkUpdateBtn');

  if (statusEl) {
    statusEl.textContent = '⏳ 正在检查更新...';
    statusEl.className = 'update-status-text';
  }
  if (btn) {
    btn.disabled = true;
    btn.textContent = '🔄 检查中...';
  }

  try {
    const hasUpdate = await checkForUpdates(false); // false = 非静默模式

    if (!hasUpdate) {
      showUpdateStatus('✅ 已是最新版本', 'success');
    }
  } catch (error) {
    console.error('[在线更新] ❌ 检查失败:', error);
    showUpdateStatus(`❌ 检查失败: ${error.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🔄 检查更新';
    }
  }
}

/**
 * 核心函数：检查是否有新版本
 * @param {boolean} silent - 是否静默模式（不显示UI）
 * @returns {Promise<boolean>} - 是否有新版本
 */
async function checkForUpdates(silent = false) {
  console.log('[在线更新] 🔍 开始检查更新...');

  try {
    // 尝试从GitHub Releases获取
    const releaseInfo = await fetchLatestReleaseFromGitHub();

    if (releaseInfo) {
      const isNewer = compareVersions(releaseInfo.tag_name, currentVersion);

      if (isNewer) {
        console.log('[在线更新] ✨ 发现新版本:', releaseInfo.tag_name);

        // 缓存更新信息
        updateInfoCache = {
          version: releaseInfo.tag_name,
          downloadUrl: releaseInfo.zipball_url || releaseInfo.browser_download_url,
          changelog: releaseInfo.body || '请查看完整更新日志',
          releaseDate: releaseInfo.published_at,
          isForceUpdate: false, // 可根据需要标记强制更新
          htmlUrl: releaseInfo.html_url
        };

        // 记录检查时间
        localStorage.setItem('lastUpdateCheckTime', Date.now());

        if (!silent) {
          // 显示更新弹窗
          showUpdateAvailableModal(releaseInfo);
        } else {
          // 静默模式：只在状态栏显示小提示
          showUpdateStatus(`发现新版本 v${releaseInfo.tag_name}`, 'success');
        }

        return true;
      } else {
        console.log('[在线更新] ✅ 已是最新版本');
        return false;
      }
    } else {
      throw new Error('无法获取版本信息');
    }
  } catch (error) {
    console.error('[在线更新] ❌ 检查更新失败:', error.message);

    // 如果GitHub失败，尝试备用源
    if (UPDATE_CONFIG.updateUrls.length > 1) {
      console.log('[在线更新] 🔀 尝试备用更新源...');
      try {
        return await checkForUpdatesFromCustomServer(silent);
      } catch (backupError) {
        throw new Error(`所有更新源均不可用: ${backupError.message}`);
      }
    }

    throw error;
  }
}

/**
 * 从GitHub Releases API获取最新版本
 */
async function fetchLatestReleaseFromGitHub() {
  // GitHub仓库配置（已发布到GitHub）
  const owner = '905442346-art';
  const repo = 'leapmotor-ai-assistant';

  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;

  console.log('[在线更新] 📡 请求GitHub API:', url);

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('仓库不存在或无发布版本');
    }
    throw new Error(`GitHub API错误: ${response.status}`);
  }

  const data = await response.json();
  console.log('[在线更新] ✅ 获取到发布信息:', data.tag_name);

  return data;
}

/**
 * 从自定义服务器检查更新（备用方案）
 */
async function checkForUpdatesFromCustomServer(silent) {
  // 这里可以实现自定义服务器的检查逻辑
  // 示例：从你的服务器获取 update.json
  /*
  const url = 'https://your-server.com/api/update-info';

  const response = await fetch(url);
  const data = await response.json();

  if (data && data.version && compareVersions(data.version, currentVersion)) {
    updateInfoCache = {
      version: data.version,
      downloadUrl: data.downloadUrl,
      changelog: data.changelog,
      releaseDate: data.releaseDate,
      isForceUpdate: data.forceUpdate || false
    };
    return true;
  }
  */

  throw new Error('暂未配置自定义更新源');
}

/**
 * 版本号比较
 * @param {string} v1 - 版本1
 * @param {string} v2 - 版本2
 * @returns {boolean} - v1 是否比 v2 新
 */
function compareVersions(v1, v2) {
  // 移除 'v' 前缀
  const normalize = (v) => (v || '').replace(/^v/i, '').split('.').map(Number);

  const parts1 = normalize(v1);
  const parts2 = normalize(v2);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 > p2) return true;
    if (p1 < p2) return false;
  }

  return false; // 版本相同
}

/**
 * 显示新版本发现弹窗
 */
function showUpdateAvailableModal(releaseInfo) {
  const modal = document.getElementById('updateAvailableModal');
  if (!modal) return;

  // 填充数据
  const oldVerEl = document.getElementById('oldVersionDisplay');
  const newVerEl = document.getElementById('newVersionDisplay');
  const changelogEl = document.getElementById('updateChangelogContent');
  const forceNoticeEl = document.getElementById('forceUpdateNotice');

  if (oldVerEl) oldVerEl.textContent = `v${currentVersion}`;
  if (newVerEl) newVerEl.textContent = releaseInfo.tag_name || updateInfoCache?.version || '未知';

  // 解析Markdown格式的更新日志
  if (changelogEl && releaseInfo.body) {
    changelogEl.innerHTML = formatChangelogMarkdown(releaseInfo.body);
  }

  // 强制更新提示
  if (forceNoticeEl && updateInfoCache?.isForceUpdate) {
    forceNoticeEl.classList.remove('hidden');
  }

  modal.classList.remove('hidden');
}

/**
 * 格式化更新日志Markdown为HTML
 */
function formatChangelogMarkdown(markdown) {
  if (!markdown) return '<p>暂无更新内容</p>';

  // 简单的Markdown转HTML（仅处理常用格式）
  let html = markdown
    // 标题
    .replace(/^### (.+)$/gm, '<strong>$1</strong>')
    .replace(/^## (.+)$/gm, '<h4>$1</h4>')
    // 列表
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    // 粗体和斜体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // 代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 换行
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // 包装列表项
  if (html.includes('<li>')) {
    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
  }

  return `<div class="md-content">${html}</div>`;
}

/**
 * 关闭新版本弹窗
 */
function closeUpdateAvailableModal() {
  const modal = document.getElementById('updateAvailableModal');
  if (modal) modal.classList.add('hidden');
}

/**
 * 开始下载更新
 */
function startDownloadUpdate(updateData) {
  if (!updateData || !updateData.downloadUrl) {
    console.error('[在线更新] ⚠️ 无下载链接');
    showUpdateStatus('❌ 下载链接无效', 'error');
    return;
  }

  console.log('[在线更新] 📥 开始下载:', updateData.downloadUrl);

  // 关闭新版本弹窗
  closeUpdateAvailableModal();

  // 显示进度弹窗
  const progressModal = document.getElementById('updateProgressModal');
  if (progressModal) progressModal.classList.remove('hidden');

  // 填充下载信息
  const verEl = document.getElementById('downloadingVersion');
  if (verEl) verEl.textContent = updateData.version;

  // 由于浏览器安全限制，Chrome扩展无法直接下载并安装
  // 所以我们改为在新标签页打开下载链接
  setTimeout(() => {
    closeUpdateProgressModal();

    // 方式1：直接打开下载页面（推荐）
    if (updateData.htmlUrl) {
      window.open(updateData.htmlUrl, '_blank');
      showUpdateStatus('已在浏览器中打开下载页面', 'success');
    } else if (updateData.downloadUrl) {
      window.open(updateData.downloadUrl, '_blank');
      showUpdateStatus('已开始下载，请在浏览器中查看', 'success');
    }

    // 显示安装指引
    showInstallGuide();
  }, 1500); // 模拟1.5秒的"准备"过程
}

/**
 * 显示安装指引
 */
function showInstallGuide() {
  const statusEl = document.getElementById('updateStatusText');
  if (statusEl) {
    statusEl.innerHTML = `
      <div style="margin-top:8px">
        <strong>安装步骤：</strong><br>
        1. 下载完成后解压ZIP文件<br>
        2. 打开 <code>chrome://extensions/</code><br>
        3. 点击「加载已解压的扩展程序」<br>
        4. 选择解压后的文件夹<br>
        5. 完成更新！🎉
      </div>
    `;
    statusEl.className = 'update-status-text success';
  }
}

/**
 * 关闭进度弹窗
 */
function closeUpdateProgressModal() {
  const modal = document.getElementById('updateProgressModal');
  if (modal) modal.classList.add('hidden');
}

/**
 * 显示更新状态文本
 */
function showUpdateStatus(message, type = '') {
  const el = document.getElementById('updateStatusText');
  if (el) {
    el.textContent = message;
    el.className = `update-status-text ${type}`.trim();
  }
}

/**
 * 显示更新日志详情弹窗
 */
function showChangelogModal() {
  const modal = document.getElementById('changelogModal');
  if (!modal) return;

  const contentEl = document.getElementById('fullChangelogContent');
  if (contentEl) {
    // 加载完整的更新历史（可以从缓存或API获取）
    contentEl.innerHTML = `
      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.1.0</span>
          <span class="changelog-version-date">2026-01-10</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">🆕 新功能</h5>
          <ul>
            <li><strong>智能推荐问题</strong> - 基于页面内容动态生成个性化推荐</li>
            <li><strong>历史消息迁移</strong> - 右键菜单支持将历史消息移到当前对话</li>
            <li><strong>标签页绿色标注</strong> - 选择多标签时显示视觉标识</li>
            <li><strong>OA流程查询</strong> - 一键查看所有可发起的审批流程</li>
            <li><strong>在线自动更新</strong> - 支持自动检测和一键更新</li>
          </ul>

          <h5 style="margin:16px 0 8px;color:var(--text-primary)">🔧 改进优化</h5>
          <ul>
            <li>优化AI意图识别准确率</li>
            <li>修复多个已知问题</li>
            <li>提升整体性能和稳定性</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.0.0</span>
          <span class="changelog-version-date">2026-01-08</span>
        </div>
        <div class="changelog-version-content">
          <ul>
            <li>初始版本发布</li>
            <li>基础AI对话功能</li>
            <li>页面内容分析</li>
            <li>FastGPT知识库集成</li>
            <li>液态玻璃UI设计</li>
          </ul>
        </div>
      </div>
    `;
  }

  modal.classList.remove('hidden');
}

/**
 * 关闭日志详情弹窗
 */
function closeChangelogModal() {
  const modal = document.getElementById('changelogModal');
  if (modal) modal.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', init);
