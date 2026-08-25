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
// leaprag 配置 - 预配置协同办公工作流，用户可自定义添加
const FASTGPT_CONFIG = {
  enabled: true, // 默认启用智能路由
  apiUrl: 'https://aiflow.leapmotor.com/api',
  modelName: ''
};

// 内置工作流（协同办公）
const BUILTIN_WORKFLOWS = [
  {
    id: 'wf_builtin_coop',
    name: '协同办公',
    appId: '6a4b7073b415c3419d9fb95d',
    apiKey: 'openapi-kQTdGDDkdnMvTNlR1aJYuMpoTwV9HQ9ckYU6LeVT6WsCODCphW4rRmUsU0wzTs',
    isDefault: true,
    builtIn: true
  }
];

// 用户自定义工作流（从localStorage加载）
let customWorkflows = [];

// 获取全部工作流（内置+自定义）
function getAllWorkflows() {
  return [...BUILTIN_WORKFLOWS, ...customWorkflows];
}

// 获取默认工作流
function getDefaultWorkflow() {
  const all = getAllWorkflows();
  return all.find(w => w.isDefault) || all[0] || null;
}

// 加载用户自定义工作流
function loadCustomWorkflows() {
  const saved = localStorage.getItem('leaprag_workflows');
  if (saved) {
    try {
      customWorkflows = JSON.parse(saved);
    } catch(e) {
      console.error('[leaprag] 加载自定义工作流失败:', e);
      customWorkflows = [];
    }
  }
}

// 保存用户自定义工作流
function saveCustomWorkflows() {
  localStorage.setItem('leaprag_workflows', JSON.stringify(customWorkflows));
}

// 平台检测：Mac 或 Windows/Linux
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.userAgent.includes('Macintosh');
const MOD_KEY = isMac ? '⌘' : 'Ctrl';
const SHIFT_MOD = isMac ? '⇧' : 'Shift';

// ========== 快捷键管理 ==========
// 平台自适应默认快捷键：Mac 用 Cmd+J/⌘⇧J，Windows/Linux 用 Ctrl+M/Ctrl+Shift+M
const DEFAULT_SHORTCUTS = isMac
  ? { 'toggle-assistant': { key: 'j', ctrl: false, shift: false, alt: false, meta: true }, 'analyze-page': { key: 'j', ctrl: false, shift: true, alt: false, meta: true } }
  : { 'toggle-assistant': { key: 'm', ctrl: true, shift: false, alt: false, meta: false }, 'analyze-page': { key: 'm', ctrl: true, shift: true, alt: false, meta: false } };

let customShortcuts = { ...DEFAULT_SHORTCUTS };

let currentRecordingAction = null; // 当前正在录制快捷键的动作

/**
 * 加载用户自定义的快捷键设置
 */
function loadCustomShortcuts() {
  const saved = localStorage.getItem('customShortcuts');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // 迁移旧配置：旧版 ctrl+meta 同时为 true 的，按平台修正为只使用对应修饰键
      for (const action of Object.keys(parsed)) {
        const sc = parsed[action];
        if (sc && sc.ctrl && sc.meta) {
          if (isMac) {
            sc.ctrl = false; // Mac 只用 Cmd
          } else {
            sc.meta = false; // Windows 只用 Ctrl
          }
        }
      }
      customShortcuts = { ...DEFAULT_SHORTCUTS, ...parsed };
    } catch(e) {
      console.error('[快捷键] 加载失败:', e);
      customShortcuts = { ...DEFAULT_SHORTCUTS };
    }
  } else {
    customShortcuts = { ...DEFAULT_SHORTCUTS };
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
  // AI 文本回答挂载悬停复制按钮（HTML 卡片如 OA 流程不挂载，避免与"立即发起"按钮冲突）
  if (role === 'ai' && !isHTML && content) {
    attachCopyButton(bubble, content);
  }
  msg.appendChild(avatar);
  msg.appendChild(msgContent);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  // 同时挂载bubble引用，方便外部访问
  msg._bubble = bubble;
  msg._content = msgContent;
  return msg;
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
async function callFastGPT(question, onStreamChunk, workflow) {
  // 使用传入的工作流，或回退到默认工作流
  const wf = workflow || getDefaultWorkflow();
  if (!FASTGPT_CONFIG.apiUrl || !wf) {
    console.error('[FastGPT] ❌ 配置缺失:', {
      hasApiUrl: !!FASTGPT_CONFIG.apiUrl,
      hasWorkflow: !!wf
    });
    return {
      answer: '',
      sources: [],
      success: false,
      error: 'leaprag-工作流服务未正确配置'
    };
  }

  try {
    // 构建API URL
    if (!FASTGPT_CONFIG.apiUrl) {
      throw new Error('leaprag-工作流 API地址未配置');
    }
    const apiUrl = FASTGPT_CONFIG.apiUrl.replace(/\/$/, '');
    const chatUrl = `${apiUrl}/v1/chat/completions`;

    console.log('[FastGPT] 🚀 开始调用...');
    console.log('[FastGPT] 调用URL:', chatUrl);
    console.log('[FastGPT] 工作流:', wf.name, 'appId:', wf.appId);
    console.log('[FastGPT] 用户问题:', question);

    // 记录调用开始时间
    const startTime = Date.now();

    let response;
    response = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wf.apiKey}`
      },
      body: JSON.stringify({
        model: FASTGPT_CONFIG.modelName || wf.appId,
        messages: [
          {
            role: 'user',
            content: question
          }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const responseTime = Date.now() - startTime;
    console.log(`[FastGPT] ⏱️ 响应时间: ${responseTime}ms`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[FastGPT] ❌ HTTP错误 ${response.status}:`, errorText.substring(0, 500));

      let errorMsg = `leaprag-工作流 HTTP错误 (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error?.message || errorJson.message || errorJson.error || errorMsg;
      } catch(e) {
        if (errorText.length > 200) {
          errorMsg += `: ${errorText.substring(0, 200)}...`;
        } else {
          errorMsg += `: ${errorText}`;
        }
      }

      if (response.status === 401) errorMsg = 'leaprag-工作流 API Key无效或已过期';
      else if (response.status === 403) errorMsg = 'leaprag-工作流访问被拒绝（可能IP白名单限制）';
      else if (response.status === 404) errorMsg = 'leaprag-工作流ID不存在或已删除';
      else if (response.status >= 500) errorMsg = 'leaprag-工作流服务器内部错误，请稍后重试';

      return { answer: '', sources: [], success: false, error: errorMsg };
    }

    // ===== 流式SSE解析 =====
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let hasContent = false;
    let sources = [];

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
              const content = data?.choices?.[0]?.delta?.content ||
                              data?.choices?.[0]?.message?.content;
              if (content && typeof content === 'string') {
                result += content;
                hasContent = true;
                if (onStreamChunk) onStreamChunk(result);
              }
              if (data?.choices?.[0]?.message?.metadata?.sources) {
                sources = data.choices[0].message.metadata.sources;
              } else if (data?.metadata?.sources) {
                sources = data.metadata.sources;
              }
            } catch (parseError) {
              console.warn('[FastGPT流式] 解析失败:', parseError.message);
            }
          }
        }
      } catch (chunkError) {
        console.warn('[FastGPT流式] 数据块错误:', chunkError);
      }
    }

    console.log('[FastGPT] ✅ 流式完成，内容长度:', result.length);

    if (!hasContent || !result || result.trim() === '') {
      return { answer: '', sources: [], success: false, error: 'leaprag-工作流未返回有效内容' };
    }

    return { answer: result.trim(), sources, success: true };

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
      errorMsg = '请求超时：leaprag-工作流服务器响应时间过长';
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

  // 构建对话上下文（最近5轮对话）
  const recentHistory = chatHistory.slice(-10).map(h => {
    const role = h.role === 'user' ? '用户' : 'AI';
    // 截取每条消息的前200字符避免过长
    const content = (h.content || '').substring(0, 200);
    return `${role}: ${content}`;
  }).join('\n');

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
            content: `你是零跑汽车AI助手的意图识别引擎。你的任务是结合对话上下文，判断用户当前问题的意图类型，以便路由到正确的处理通道。

## 四种意图类型：

### 1. oa_process（OA流程查询）
用户明确想**发起/申请/走流程**，需要查询OA系统中可发起的审批流程。
特征：用户想知道某个事项"走什么流程"、"怎么申请"、"用哪个流程"。
示例：
- "我想请病假该走什么流程" → oa_process
- "报销需要走什么流程" → oa_process
- "我想用印该走哪个流程" → oa_process
- "怎么发起采购" → oa_process

### 2. system（系统问题咨询）
用户在**咨询**零跑内部系统的操作、流程问题、政策制度（不是要发起流程，而是在问问题）。
特征：含"怎么办""为什么""报错""登录不了""有问题""找谁"等问题词。
示例：
- "报销流程发起不了怎么办" → system
- "企微登录不了" → system
- "审批被驳回找谁" → system
- "实习生如何报销" → system

### 3. page_analysis（页面分析）
用户要求**分析、总结、提取**当前浏览的网页内容。
特征：含"总结页面""分析页面""提取网页""这个页面说什么"等指令。
示例：
- "总结这个页面" → page_analysis
- "分析当前网页内容" → page_analysis

### 4. general_chat（通用问答）
与零跑内部系统和当前页面都无关的一般性问题。
示例：
- "明天杭州天气" → general_chat
- "帮我写一段Python代码" → general_chat

## 重要判断规则：
1. 区分"发起流程"(oa_process) vs "流程有问题"(system)：用户要"走流程/申请"→oa_process；用户在"问问题/报错/求助"→system
2. 结合对话上下文：如果前几轮在讨论某个系统问题，当前消息可能是追问，应保持system类型
3. 只有用户明确要"发起/申请/走流程"时才是oa_process，纯咨询不算

请严格按以下JSON格式回复，不要包含其他内容：
{"type": "oa_process|system|page_analysis|general_chat", "reason": "简短原因"}`
          },
          {
            role: 'user',
            content: `【对话上下文】\n${recentHistory || '（无历史对话）'}\n\n【当前问题】\n${userMessage}`
          }
        ],
        max_tokens: 150,
        temperature: 0.1,
        stream: false
      })
    });

    if (!response.ok) {
      console.warn('[AI意图识别] API调用失败:', response.status);
      return detectIntentThreeWay(userMessage);
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

      const validTypes = ['oa_process', 'system', 'page_analysis', 'general_chat'];
      const type = validTypes.includes(result.type) ? result.type : 'general_chat';

      return {
        type: type,
        confidence: 0.92,
        reason: result.reason || `AI判定为${getTypeLabel(type)}`,
        systemType: result.systemType || null,
        aiDetected: true
      };
    } catch (parseError) {
      console.warn('[AI意图识别] JSON解析失败:', parseError.message);
      return inferTypeFromText(content);
    }
  } catch (error) {
    console.error('[AI意图识别] 调用失败:', error);
    return detectIntentThreeWay(userMessage);
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
    'oa_process': 'OA流程查询',
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

  // ===== OA流程查询关键词 =====
  // 只有当用户明确想"发起/申请/走流程"时才触发
  // 注意：不单独放"流程"和"发起"（太泛，如"发起会议"不是OA流程）
  const oaProcessKeywords = [
    // 明确询问"走哪个流程"类短语（+5分）
    '发起什么流程', '走什么流程', '什么流程', '走哪个流程', '走哪',
    '哪个流程', '要用哪个', '该走哪个', '应该走哪个',
    '怎么走流程', '如何走流程', '要走什么',
    // 明确申请类短语（+5分）
    '怎么申请', '如何申请', '申请流程', '想申请', '要申请', '需要申请',
    // 具体流程名+流程（+5分）
    '请什么假', '怎么请假', '病假流程', '事假流程', '年假流程',
    '用印流程', '印章流程', '盖章流程', '报销流程', '出差流程',
    '采购流程', '合同流程', '审批流程', '加班流程',
    // 业务场景（+5分）- 这些场景唯一对应OA发起
    '新电脑', '新手机', '办公用品', '资产申请', 'IT设备',
    '门禁卡', '工牌', '名片', '用车申请', '会议室申请',
    // 动词短语（+4分）- 明确的发起意图
    '走流程', '走审批', '发起流程', '发起审批',
    '应该走', '该走', '要走',
    '用印', '用章', '盖章', '请假', '报销', '出差申请', '采购申请'
  ];

  // ===== 问题咨询类关键词（负向信号）=====
  // 检测到这些词时，即使含流程词汇也走知识库，不走OA流程查询
  // 注意：不单独放"审批"（"审批流程"是OA发起），只放明确的问题场景
  const questionKeywords = [
    '有问题', '怎么办', '找谁', '问谁', '怎么回事', '为什么',
    '报错', '失败', '不通过', '被驳回', '驳回', '审批不通过',
    '卡住了', '卡住', '无法', '不能', '不行', '什么原因',
    '咨询', '帮助', '联系谁', '联系', '电话',
    '异常', '故障', 'bug', '错误', '出错', '打不开',
    '登录不了', '登不上', '进不去', '没反应',
    '审核不通过', '被拒', '退回', '打回',
    '怎么查', '在哪看', '哪里看', '进度', '到哪了',
    '怎么处理', '怎么解决', '如何解决', '怎么操作',
    '咨询谁', '问一下', '问下', '了解一下', '请教',
    '找谁处理', '找谁解决', '联系哪个部门', '打什么电话'
  ];

  // ===== 系统问题关键词（知识库）=====
  const systemKeywords = [
    '报销', '发票', '出差', '差旅', '费用', '预算',
    '实习生', '劳务派遣', '入职', '转正', '薪资', '福利',
    '考勤', '打卡', '加班',
    'OA', 'ERP', 'HRBP', 'CRM', 'SAP',
    '企微', '企业微信', '钉钉', '飞书',
    'VPN', '邮箱', '账号', '密码', '登录不上', '无法登录',
    '系统故障', '问题反馈', '技术支持', '制度', '政策', '规定',
    '社保', '公积金', '个税', '工资', '绩效', '年终奖',
    '年假', '调休', '补卡', '离职', '试用期'
  ];

  // ===== 页面分析关键词 =====
  const analysisKeywords = [
    '总结这个页面', '总结当前网页', '总结网页内容', '总结一下',
    '分析这个页面', '分析当前页面', '提取页面', '抓取页面',
    '这个页面说什么', '这个页面的内容', '页面内容'
  ];

  let oaProcessScore = 0;
  let systemScore = 0;
  let analysisScore = 0;
  let questionScore = 0;

  // 计算各维度分数
  oaProcessKeywords.forEach(kw => { if (msg.includes(kw)) oaProcessScore += (kw.length >= 4 ? 5 : 3); });
  systemKeywords.forEach(kw => { if (msg.includes(kw)) systemScore += 2; });
  analysisKeywords.forEach(kw => { if (msg.includes(kw)) analysisScore += 5; });
  questionKeywords.forEach(kw => { if (msg.includes(kw)) questionScore += 3; });

  // ===== 核心判断逻辑 =====

  // 1. 页面分析：明确指令直接走
  if (analysisScore > 0) {
    return { type: 'page_analysis', confidence: 0.85, reason: '检测到页面分析指令' };
  }

  // 2. 问题咨询类：如果有明确的问题信号，即使含流程词也走知识库
  // 例如："报销流程有问题"、"审批被驳回找谁"、"为什么登录不了"
  if (questionScore >= 3) {
    return { type: 'system', confidence: 0.8, reason: `检测到问题咨询(${questionScore}分)，走知识库` };
  }

  // 3. OA流程查询：只有明确"要发起/申请"且不是问题咨询时才触发
  if (oaProcessScore >= 5 && questionScore === 0) {
    return { type: 'oa_process', confidence: 0.85, reason: `检测到${oaProcessScore}分流程发起意图` };
  }

  // 4. 系统问题（知识库）
  if (systemScore >= 2) {
    return { type: 'system', confidence: 0.7, reason: `检测到${systemScore}分系统问题特征` };
  }

  // 5. 如果有流程词但也有问题词（如"报销流程有问题"oa分≥3但question分<3），降级到知识库
  if (oaProcessScore > 0 && questionScore > 0) {
    return { type: 'system', confidence: 0.7, reason: '含流程词汇但为咨询类问题，走知识库' };
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
      text: '⚠️ **未配置员工工号**\n\n要自动查询OA流程，请先在 **设置 → 基础配置** 中填写您的员工工号。\n\n配置后即可在提问时自动匹配相关流程。',
      source: 'oa_process_error',
      usedFastGPT: false,
      routeType: 'oa_process'
    };
  }

  try {
    // 调用OA接口获取流程列表（使用正确的API地址）
    const apiUrl = `https://lppms.leapmotor.com/pmapi/ufOAWorkFlow/collectOAProcess?number=${employeeId}`;
    console.log(`[OA流程查询] 📡 正在调用接口: ${apiUrl}`);

    let rawData;  // 保存原始返回数据用于调试
    let categoryList;  // 原始分类数据
    let processList = [];  // 扁平化后的流程列表
    try {
      // 尝试直连调用
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      rawData = data;  // 保存原始数据
      categoryList = data.data || data;
      console.log(`[OA流程查询] ✅ 直连成功，获取到数据`);
      console.log(`[OA流程查询] 🔍 响应状态:`, data.code, data.msg);
    } catch (directError) {
      console.log(`[OA流程查询] ⚠️ 直连失败，尝试代理模式:`, directError.message);
      // 直连失败，尝试通过background.js代理调用
      // 代理返回格式: { success: true, data: { code:200, data:[分类数组] } }
      const proxyResult = await fetchOAProcessViaProxy(employeeId);
      rawData = proxyResult;
      // 代理返回的数据结构与直连一致，都是 {code, msg, status, data: [分类数组]}
      categoryList = (proxyResult && proxyResult.data) ? proxyResult.data.data || proxyResult.data : proxyResult;
    }

    if (!categoryList || !Array.isArray(categoryList) || categoryList.length === 0) {
      console.error('[OA流程查询] ❌ 数据为空或格式错误:', { rawData, categoryList });
      return {
        text: '📋 **暂无可发起的OA流程**\n\n当前账号可能没有待办流程或权限不足。如需帮助，请咨询人事部门或IT支持。',
        source: 'oa_process_empty',
        usedFastGPT: false,
        routeType: 'oa_process'
      };
    }

    // 【关键修复】扁平化嵌套结构：遍历每个分类，提取其中的 weaverCreateWorkFlowDTOS 流程数组
    // 根据用户提供的API返回结构：
    // data[].typeName = 分类名（如"流程与IT管理类"、"行政与运营类"）
    // data[].weaverCreateWorkFlowDTOS[] = 该分类下的流程数组
    //   ├─ workflowName: "APP单车及开店后台权限申请流程"
    //   ├─ workflowDesc: "适用于全公司申请APP绑车及车机开启后台权限的审批"
    //   └─ workflowUrl: "http://oa.leapmotor.com:80/spa/workflow/static4form/..."
    categoryList.forEach(category => {
      const categoryName = category.typeName || category.workflowTypeName || '未分类';
      const subFlows = category.weaverCreateWorkFlowDTOS || category.flows || [];

      if (Array.isArray(subFlows)) {
        subFlows.forEach(flow => {
          // 为每个流程注入所属分类名（方便后续使用）
          processList.push({
            ...flow,
            _category: categoryName  // 内部使用，打上分类标签
          });
        });
      }
    });

    if (processList.length === 0) {
      console.error('[OA流程查询] ❌ 扁平化后流程列表为空，原始分类列表结构:', categoryList);
      console.error('[OA流程查询] ❌ 第1个分类的keys:', Object.keys(categoryList[0] || {}));
      return {
        text: '📋 **暂无可发起的OA流程**\n\n未找到可发起的流程，请稍后再试或联系IT支持。',
        source: 'oa_process_empty',
        usedFastGPT: false,
        routeType: 'oa_process'
      };
    }

    console.log(`[OA流程查询] ✅ 成功获取 ${categoryList.length} 个分类，共 ${processList.length} 个流程`);

    // 【调试】输出第一个流程的完整字段
    const firstProcess = processList[0];
    console.log(`[OA流程查询] 📋 第1个流程完整字段:`, firstProcess);
    console.log(`[OA流程查询] 📋 第1个流程所有keys:`, Object.keys(firstProcess));

    // 【关键修复】使用截图中确认的准确字段：
    // ✅ workflowName: 流程名称（如"APP单车及开店后台权限申请流程"）
    // ✅ workflowDesc: 流程描述（不是wfDesc！）
    // ✅ workflowUrl: 流程发起链接（不是authUrl！）
    // ✅ _category: 我们注入的分类名（来自外层typeName）
    const processText = processList.map((item, index) => {
      // 流程分类：优先使用注入的_category，其次自身的workflowTypeName/typeName
      const type = item._category || item.workflowTypeName || item.typeName || '未分类';

      // 流程名称：workflowName（截图确认）
      const name = item.workflowName || item.name || `流程${index + 1}`;

      // 流程描述：workflowDesc（截图确认）
      const desc = item.workflowDesc || item.wfDesc || item.description || '';

      // 流程链接：workflowUrl（截图确认！格式如 http://oa.leapmotor.com:80/spa/workflow/static4form/...）
      const url = item.workflowUrl || item.authUrl || item.requrl || '';

      // 【调试】前5个流程和关键词相关流程输出详情
      if (index < 5 || name.includes('用印') || name.includes('印章') || name.includes('盖章')) {
        console.log(`[OA流程查询] 🔍 流程${index + 1} [${type}]:`, {
          name,
          hasUrl: !!url,
          urlPreview: url ? url.substring(0, 80) + '...' : '(空)'
        });
      }

      const urlPart = url ? `\n   🔗 发起链接: ${url}` : '';
      return `${index + 1}. [${type}] **${name}${desc ? ' - ' + desc : ''}**${urlPart}`;
    }).join('\n');

    // 按流程类型分组统计
    const typeCount = {};
    processList.forEach(item => {
      const type = item._category || item.workflowTypeName || item.typeName || '未分类';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    const typeSummary = Object.entries(typeCount)
      .map(([type, count]) => `${type}: ${count}个`)
      .join('、');

    // 构建精简流程清单（给AI看的，不带链接，只带索引+名称+分类+描述）
    const processListForAI = processList.map((item, index) => {
      const name = item.workflowName || '';
      const category = item._category || '';
      const desc = (item.workflowDesc || '').substring(0, 80);
      return `${index + 1}. [${category}] ${name} - ${desc}`;
    }).join('\n');

    // AI提示词：只返回推荐的流程序号（JSON格式），不生成链接
    const systemPrompt = [
      '你是零跑汽车OA流程推荐助手。根据用户问题，从流程清单中推荐最匹配的1-3个流程。',
      '',
      '## 输出要求（极其重要）',
      '你必须严格返回JSON格式，不要输出任何其他文字、解释、Markdown格式。',
      '',
      '## JSON格式：',
      '{"matches":[{"index":流程序号(数字，从1开始),"reason":"推荐理由一句话"}, ...最多3个]}',
      '',
      '## 流程清单（共' + processList.length + '个）：',
      processListForAI,
      '',
      '## 规则：',
      '1. index必须是上面清单中的序号（1-based）',
      '2. 最多推荐3个，按相关性排序',
      '3. 如果完全不相关的问题，返回 {"matches":[]}',
      '4. reason简短说明为什么推荐，15字以内',
      '',
      '用户问题：' + userMessage
    ].join('\n');

    // 调用AI获取推荐索引
    setStatus('正在智能匹配流程...', 'loading');
    let recommendedIndexes = [];
    try {
      const aiResult = await callMainModelWithContext(userMessage, null, systemPrompt);
      console.log('[OA流程查询] 🤖 AI原始返回:', aiResult);

      // 解析JSON
      const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.matches && Array.isArray(parsed.matches)) {
          recommendedIndexes = parsed.matches
            .map(m => ({ idx: parseInt(m.index) - 1, reason: m.reason || '' }))
            .filter(m => m.idx >= 0 && m.idx < processList.length);
        }
      }
      console.log('[OA流程查询] ✅ AI推荐索引:', recommendedIndexes);
    } catch (parseErr) {
      console.warn('[OA流程查询] ⚠️ AI解析失败，降级到关键词匹配:', parseErr.message);
    }

    // 如果AI没返回结果，降级为本地关键词匹配
    if (recommendedIndexes.length === 0) {
      const keywords = userMessage.toLowerCase();
      const scored = processList.map((item, idx) => {
        const name = (item.workflowName || '').toLowerCase();
        const desc = (item.workflowDesc || '').toLowerCase();
        const category = (item._category || '').toLowerCase();
        let score = 0;
        // 简单关键词匹配
        if (name.includes('用印') || name.includes('印章') || name.includes('盖章')) score += 10;
        if (desc.includes('用印') || desc.includes('印章') || desc.includes('盖章')) score += 5;
        if (keywords.includes('用印') && (name.includes('用印') || name.includes('印章'))) score += 20;
        if (keywords.includes('请假') && name.includes('请假')) score += 20;
        if (keywords.includes('报销') && name.includes('报销')) score += 20;
        if (keywords.includes('电脑') && (name.includes('电脑') || name.includes('it设备') || name.includes('资产'))) score += 20;
        if (keywords.includes('会议室') && name.includes('会议')) score += 20;
        if (keywords.includes('门禁') && (name.includes('门禁') || name.includes('卡'))) score += 20;
        if (name.includes('申请')) score += 1;
        return { idx, score };
      }).filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
      recommendedIndexes = scored.map(s => ({ idx: s.idx, reason: '关键词匹配' }));
      console.log('[OA流程查询] 🔍 降级匹配结果:', recommendedIndexes);
    }

    // 根据推荐索引构建液态玻璃卡片HTML（前端直接渲染，确保链接可点击）
    if (recommendedIndexes.length > 0) {
      let cardsHtml = '<div class="oa-recommend">';
      cardsHtml += '<div class="oa-recommend-title">💡 为您找到相关流程：</div>';

      recommendedIndexes.forEach((rec, i) => {
        const flow = processList[rec.idx];
        const name = escapeHtml(flow.workflowName || '未知流程');
        const category = escapeHtml(flow._category || flow.workflowTypeName || '未分类');
        const desc = escapeHtml(flow.workflowDesc || '');
        const url = flow.workflowUrl || '';
        const shortDesc = desc.length > 60 ? desc.substring(0, 60) + '...' : desc;

        if (url) {
          cardsHtml += '<div class="oa-card">';
          cardsHtml += '<div class="oa-card-header">';
          cardsHtml += '<div class="oa-card-name">' + name + '</div>';
          cardsHtml += '<span class="oa-card-category">' + category + '</span>';
          cardsHtml += '</div>';
          if (shortDesc) {
            cardsHtml += '<div class="oa-card-desc">' + shortDesc + '</div>';
          }
          cardsHtml += '<a class="oa-card-btn" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">';
          cardsHtml += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
          cardsHtml += '立即发起';
          cardsHtml += '</a>';
          cardsHtml += '</div>';
        }
      });

      cardsHtml += '</div>';

      return {
        text: cardsHtml,
        isHtml: true,  // 标记为HTML内容，绕过renderMarkdown
        source: 'oa_process_cards',
        sources: [
          { title: 'OA流程智能推荐' }
        ],
        usedFastGPT: false,
        routeType: 'oa_process'
      };
    }

    // 没有找到匹配的流程
    return {
      text: '抱歉，没有找到与"' + escapeHtml(userMessage) + '"直接相关的流程。\n\n💡 您可以点击侧边栏📋按钮查看所有流程列表，或者尝试更具体的关键词（如"请假"、"报销"、"电脑"等）。',
      source: 'oa_process_nomatch',
      sources: [
        { title: 'OA流程数据库' }
      ],
      usedFastGPT: false,
      routeType: 'oa_process'
    };

  } catch (error) {
    console.error('[OA流程查询] ❌ 查询失败:', error);
    return {
      text: `⚠️ **OA流程查询遇到问题**\n\n错误信息：${error.message}\n\n可能的原因：\n1. 网络连接不稳定\n2. 员工工号不正确\n3. 不在公司内网环境\n4. OA系统暂时不可用\n\n您可以稍后再试，或者联系IT支持部门获取帮助。`,
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
async function processMessageWithFastGPT(userMessage, contextContent, preDetectedIntent, onStreamChunk) {
  // 如果FastGPT未启用（用户手动禁用），直接使用主模型
  if (!FASTGPT_CONFIG.enabled) {
    return await callMainModel(userMessage, contextContent, onStreamChunk);
  }

  // ========== 第一步：使用已判断的意图 ==========
  setStatus('正在路由处理...', 'loading');

  let intent;

  if (preDetectedIntent) {
    // sendMessage已通过AI判断了意图，直接使用
    intent = preDetectedIntent;
    console.log('[四路路由] 🤖 使用AI预判断意图:', intent);
  } else {
    // 兜底：如果没有预判断，用关键词匹配
    intent = detectIntentThreeWay(userMessage);
    console.log('[四路路由] 🔍 关键词意图识别结果(兜底):', intent);
  }

  // ========== 第二步：根据类型分发 ==========
  switch (intent.type) {

    // ====== 路由0：OA流程查询 → 调用OA接口 + AI回答 ======
    case 'oa_process':
      console.log('[四路路由] 📋 路由到【OA流程查询】 → 自动调用OA接口');
      return await handleOAProcessQuery(userMessage);

    // ====== 路由1：系统问题 → FastGPT知识库 ======
    case 'system':
      console.log(`[四路路由] 📋 路由到【系统问题】${intent.systemType ? '(' + intent.systemType + ')' : ''} → FastGPT工作流`);
      setStatus('正在查询leaprag知识库...', 'loading');

      const fastgptResult = await callFastGPT(userMessage, onStreamChunk);

      if (fastgptResult.success && fastgptResult.answer) {
        // 知识库有答案，返回并标注来源
        return {
          text: fastgptResult.answer,
          source: 'fastgpt_knowledge_base',
          sources: fastgptResult.sources.length > 0 ? fastgptResult.sources : [{ title: 'leaprag知识库' }],
          usedFastGPT: true,
          routeType: 'system'
        };
      } else {
        // 知识库查询失败，回退到主模型（不插入额外消息避免重复）
        console.warn('[四路路由] ⚠️ 知识库查询失败，回退到主AI模型:', fastgptResult.error);

        // 回退时作为通用问答处理（不传页面内容）
        const fallbackResult = await callMainModel(userMessage, null, onStreamChunk);
        return {
          text: fallbackResult || '（AI未返回有效内容）',
          source: 'ai_model_fallback',
          usedFastGPT: false,
          routeType: 'general_chat'
        };
      }

    // ====== 路由2：页面分析 → 主AI + 页面内容 ======
    case 'page_analysis':
      console.log('[四路路由] 🔍 路由到【页面分析】 → 主AI模型（含页面上下文）');
      setStatus('正在分析页面内容...', 'loading');

      const analysisResult = await callMainModel(userMessage, contextContent || '', onStreamChunk);

      if (!analysisResult || typeof analysisResult !== 'string') {
        console.warn('[四路路由] 页面分析返回无效内容');
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
      console.log('[四路路由] 💬 路由到【通用问答】 → 主AI模型（联网模式）');
      setStatus('正在搜索相关信息...', 'loading');

      const chatResult = await callMainModel(userMessage, null);  // 不传页面内容

      if (!chatResult || typeof chatResult !== 'string') {
        console.warn('[四路路由] 通用问答返回无效内容');
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
async function callAPI(prompt, contextContent, onStreamChunk) {
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
  let hasContent = false;

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
            const content = data?.choices?.[0]?.delta?.content;
            if (content && typeof content === 'string') {
              result += content;
              hasContent = true;
              // 实时流式输出到bubble
              if (onStreamChunk) {
                onStreamChunk(result);
              } else {
                updateLastMessage(result);
              }
            }
          } catch (parseError) {
            console.warn('[流式响应] 解析数据行失败:', parseError.message);
          }
        }
      }
    } catch (chunkError) {
      console.warn('[流式响应] 处理数据块失败:', chunkError);
    }
  }

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
async function callMainModel(prompt, contextContent, onStreamChunk) {
  if (settings.apiType === 'ollama') {
    return await callOllama(prompt, contextContent);
  } else {
    return await callAPI(prompt, contextContent, onStreamChunk);
  }
}

// ========== 发送消息 ==========
// ========== AI思考过程管理器 ==========
let currentThinkingProcess = null;
let currentAIBubble = null;

/**
 * 创建并显示思考过程容器
 */
function showThinkingProcess(messageId) {
  // 隐藏欢迎界面，显示消息列表
  const welcomeScreen = document.getElementById('welcomeScreen');
  const messageList = document.getElementById('messageList');
  if (welcomeScreen) welcomeScreen.style.display = 'none';
  if (messageList) messageList.classList.add('has-messages');

  // ===== 重构：不创建空bubble（避免白色空椭圆），只创建外层AI消息结构 =====
  const container = document.getElementById('chatContainer');

  const msg = document.createElement('div');
  msg.className = 'message ai thinking-active';
  msg.dataset.messageId = messageId;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = LP_LOGO_SVG;

  const msgContent = document.createElement('div');
  msgContent.className = 'message-content';

  // 从模板克隆思考过程（直接作为msgContent的唯一子元素）
  const template = document.getElementById('thinkingProcessTemplate');
  if (!template) {
    console.error('[showThinkingProcess] ❌ 找不到thinkingProcessTemplate');
    return null;
  }

  const thinkingEl = template.content.cloneNode(true).querySelector('.thinking-process');
  thinkingEl.dataset.thinkingId = messageId;

  msgContent.appendChild(thinkingEl);
  msg.appendChild(avatar);
  msg.appendChild(msgContent);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;

  // 自动展开（默认）
  setTimeout(() => thinkingEl.classList.add('expanded'), 100);

  // 挂载引用
  msg._thinking = thinkingEl;
  msg._content = msgContent;
  currentThinkingProcess = thinkingEl;
  currentAIBubble = msg;
  return thinkingEl;
}

// 创建AI回答区域（思考完成后调用）
function createAnswerArea() {
  if (!currentAIBubble) return null;
  const msgContent = currentAIBubble._content || currentAIBubble.querySelector('.message-content');
  if (!msgContent) return null;

  // 创建bubble（此时才有真正的玻璃背景）
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  // 在思考过程后面插入bubble
  const thinkingEl = currentAIBubble._thinking || currentAIBubble.querySelector('.thinking-process');
  if (thinkingEl && thinkingEl.nextSibling) {
    msgContent.insertBefore(bubble, thinkingEl.nextSibling);
  } else {
    msgContent.appendChild(bubble);
  }

  currentAIBubble._bubble = bubble;
  currentAIBubble.classList.remove('thinking-active');
  return bubble;
}

/**
 * 给 AI 回答 bubble 挂载悬停复制按钮
 * @param {HTMLElement} bubble - message-bubble 元素
 * @param {string} text - 待复制的原始文本（markdown 原文）
 */
function attachCopyButton(bubble, text) {
  if (!bubble || !text) return;
  // 避免重复挂载
  if (bubble.querySelector('.copy-btn')) return;

  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.type = 'button';
  btn.title = '复制回答';
  btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      btn.classList.add('copied');
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
      }, 1500);
    } catch (err) {
      console.warn('[attachCopyButton] 复制失败:', err);
    }
  });
  bubble.appendChild(btn);
}

// 流式打字机效果输出
function typeWriterEffect(element, htmlContent, isHtml, onComplete) {
  // HTML内容不做逐字打字（会破坏标签），做淡入显示
  if (isHtml || htmlContent.includes('<') && htmlContent.includes('>')) {
    element.style.opacity = '0';
    element.innerHTML = htmlContent;
    element.style.transition = 'opacity 0.3s ease';
    requestAnimationFrame(() => { element.style.opacity = '1'; });
    if (onComplete) setTimeout(onComplete, 300);
    return;
  }

  // 纯文本逐字输出（简单字符流效果）
  const chars = htmlContent.split('');
  let i = 0;
  element.textContent = '';
  element.style.minHeight = '1em';

  function typeNext() {
    if (i >= chars.length) {
      if (onComplete) onComplete();
      return;
    }
    // 每帧输出2-4个字符，模拟流式
    const chunk = Math.min(chars.length - i, 2 + Math.floor(Math.random() * 3));
    element.textContent += chars.slice(i, i + chunk).join('');
    i += chunk;
    const container = document.getElementById('chatContainer');
    if (container) container.scrollTop = container.scrollHeight;
    setTimeout(typeNext, 15 + Math.random() * 20);
  }
  typeNext();
}

/**
 * 添加思考步骤
 * @param {string} icon - 图标类型: detect/route/fetch/ai/success
 * @param {string} text - 步骤文本
 */
function addThinkingStep(icon, text) {
  if (!currentThinkingProcess) return;

  const stepsContainer = currentThinkingProcess.querySelector('.thinking-steps');
  if (!stepsContainer) return;

  const stepEl = document.createElement('div');
  stepEl.className = 'thinking-step';
  stepEl.innerHTML = `
    <div class="step-icon ${icon}">${getStepIconChar(icon)}</div>
    <div class="step-text">${text}</div>
  `;

  stepsContainer.appendChild(stepEl);
}

/**
 * 获取步骤图标字符
 */
function getStepIconChar(iconType) {
  const icons = {
    detect: '🔍',
    route: '🚦',
    fetch: '⚡',
    ai: '🤖',
    success: '✅'
  };
  return icons[iconType] || '•';
}

/**
 * 更新思考标题
 */
function updateThinkingTitle(title) {
  if (!currentThinkingProcess) return;
  const titleEl = currentThinkingProcess.querySelector('.thinking-title');
  if (titleEl) titleEl.textContent = title;
}

/**
 * 完成思考过程（标记为已完成）
 */
function completeThinkingProcess() {
  if (!currentThinkingProcess) return;
  updateThinkingTitle('✅ 思考完成');

  // 停止图标动画
  const iconSvg = currentThinkingProcess.querySelector('.thinking-icon svg');
  if (iconSvg) iconSvg.style.animation = 'none';

  // 添加完成步骤
  addThinkingStep('success', '已生成回答，正在展示...');
}

/**
 * 获取路由类型的中文显示名和徽章样式
 */
function getRouteDisplayInfo(routeType) {
  const routeMap = {
    oa_process: { name: 'OA流程查询', badgeClass: 'oa_process' },
    system: { name: '系统问题(leaprag)', badgeClass: 'system' },
    page_analysis: { name: '页面分析', badgeClass: 'page_analysis' },
    general_chat: { name: '通用问答', badgeClass: 'general_chat' }
  };
  return routeMap[routeType] || { name: routeType, badgeClass: '' };
}

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

  // 生成唯一消息ID用于关联思考过程
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // ===== 第一步：关键词预检测（仅用于决定是否需要提前抓取页面）=====
  const preIntent = detectIntentThreeWay(text);
  const needPageContent = preIntent.type === 'page_analysis';

  console.log(`[sendMessage] 🚦 关键词预检测: ${preIntent.type}, 需要页面内容: ${needPageContent}`);

  // 获取页面内容（仅在需要时抓取）
  if (activePageId === 'current' && needPageContent) {
    const currentPageInCaptured = capturedPages.find(p => p.id === activePageId || p.id?.startsWith('page_'));

    if (!currentPageInCaptured) {
      console.log('[sendMessage] 📡 正在主动抓取当前页面内容...');
      try {
        const pageContent = await new Promise((resolve) => {
          window.parent.postMessage({ type: 'GET_PAGE_CONTENT' }, '*');

          const timeoutId = setTimeout(() => {
            console.warn('[sendMessage] ⏰ 页面内容获取超时(3秒)');
            window.removeEventListener('message', handler);
            resolve(null);
          }, 3000);

          const handler = (event) => {
            if (event.data.type === 'PAGE_CONTENT' && event.data.content) {
              clearTimeout(timeoutId);
              window.removeEventListener('message', handler);
              resolve(event.data.content);
            }
          };

          window.addEventListener('message', handler);
        });

        if (pageContent) {
          contextContent = formatPageContent(pageContent);
          updateCurrentPageInfo({ title: pageContent.title });
          messageText += `\n\n[已自动抓取当前页面]`;
          console.log('[sendMessage] ✅ 当前页面内容抓取成功:', pageContent.title);
        } else {
          console.warn('[sendMessage] ⚠️ 当前页面内容为空');
        }
      } catch (error) {
        console.error('[sendMessage] ❌ 抓取页面失败:', error);
      }
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

  // ===== 第二步：DOM操作（按正确顺序添加消息）=====

  // 先添加用户消息
  addMessage('user', messageText);
  chatHistory.push({ role: 'user', content: messageText });

  input.value = '';
  input.style.height = 'auto';
  uploadedFiles = [];
  renderFilePreview();
  updateSendButton();

  // 再创建AI气泡（思考过程嵌入气泡顶部）
  const thinkingEl = showThinkingProcess(messageId);
  let finalIntent = preIntent; // 默认使用关键词预检测结果

  if (thinkingEl) {
    // 步骤1：开始分析用户意图
    addThinkingStep('detect', '正在分析您的问题意图...');
    // 页面抓取步骤（如果已抓取）
    if (needPageContent && contextContent) {
      addThinkingStep('success', '✅ 已成功抓取页面内容');
    }

    // ===== 步骤1.5：调用AI进行意图判断（含对话上下文）=====
    try {
      addThinkingStep('detect', '正在结合对话上下文，用AI智能判断意图...');
      finalIntent = await detectIntentWithAI(text);
      console.log('[sendMessage] 🤖 AI意图判断结果:', finalIntent);
    } catch (e) {
      console.warn('[sendMessage] AI意图判断失败，使用关键词结果:', e);
      finalIntent = preIntent;
    }
  }

  try {
    // 步骤2：显示识别到的意图
    const routeInfo = getRouteDisplayInfo(finalIntent.type);

    // 更新思考步骤：显示路由决策
    addThinkingStep('route',
      `问题类型识别为：<span class="route-badge ${routeInfo.badgeClass}">${routeInfo.name}</span>` +
      (finalIntent.reason ? `<br/><small style="color:var(--text-tertiary);margin-top:4px;display:inline-block;">${finalIntent.reason}</small>` : '')
    );

    // 根据路由类型显示不同的处理步骤提示
    if (finalIntent.type === 'oa_process') {
      addThinkingStep('fetch', '正在调用OA流程接口获取可发起的审批流程...');
      updateThinkingTitle('💭 正在查询OA流程...');
    } else if (finalIntent.type === 'system') {
      addThinkingStep('fetch', '正在连接leaprag-工作流...');
      updateThinkingTitle('💭 正在查询leaprag知识库...');
    } else if (finalIntent.type === 'page_analysis') {
      addThinkingStep('fetch', contextContent ? '正在分析页面内容...' : '等待页面内容...');
      updateThinkingTitle('💭 正在分析页面...');
    } else {
      updateThinkingTitle('💭 正在思考如何回答...');
    }

    // ===== 流式输出改造（参考 workbuddy）=====
    // 思考过程仍在更新的同时，提前创建 answer area，让流式 chunk 实时填充 bubble
    const bubble = createAnswerArea();
    let streamContent = '';

    // 流式回调：API 每返回一段 chunk 就实时更新 bubble（用 textContent 累积，避免 markdown 半标签问题）
    const onStreamChunk = (content) => {
      streamContent = content || '';
      if (bubble) {
        bubble.textContent = streamContent;
        bubble.style.opacity = '1';
        const container = document.getElementById('chatContainer');
        if (container) container.scrollTop = container.scrollHeight;
      }
    };

    // 使用智能路由（传入已判断的intent + onStreamChunk 回调，实现流式输出）
    const fastgptResult = await processMessageWithFastGPT(text, contextContent, finalIntent, onStreamChunk);

    removeTypingIndicator();

    // 防御性检查：确保返回结果有效
    if (!fastgptResult || typeof fastgptResult !== 'object') {
      console.error('[sendMessage] processMessageWithFastGPT 返回无效:', fastgptResult);
      throw new Error('AI处理返回异常');
    }

    // 步骤3/4：显示实际使用的路由和API调用信息
    const actualRouteInfo = getRouteDisplayInfo(fastgptResult.routeType || finalIntent.type);
    addThinkingStep('ai',
      `使用 <strong>${actualRouteInfo.name}</strong> 模式处理` +
      (fastgptResult.source ? `<br/>数据来源: ${fastgptResult.source}` : '')
    );

    // 完成思考过程（打勾）
    completeThinkingProcess();

    // 优先使用 API 返回的完整文本，否则回退到流式累积内容
    const aiText = fastgptResult.text || streamContent || '（AI未返回内容）';

    if (bubble) {
      // 流式结束后：用 markdown 重新渲染最终内容（替换流式过程中的纯文本）
      if (fastgptResult.isHtml) {
        // OA流程卡片等 HTML 内容 - 直接显示
        bubble.innerHTML = aiText;
        bubble.style.opacity = '1';
      } else {
        // markdown 内容 - 重新渲染（带淡入效果）
        bubble.style.opacity = '0';
        bubble.innerHTML = renderMarkdown(aiText);
        bubble.style.transition = 'opacity 0.3s ease';
        requestAnimationFrame(() => { bubble.style.opacity = '1'; });
        // 挂载悬停复制按钮（复制 markdown 原文）
        attachCopyButton(bubble, aiText);
      }

      // 如果使用了FastGPT知识库或OA流程，显示来源标签（追加到bubble后面，作为msgContent子元素）
      const msgContent = currentAIBubble ? (currentAIBubble._content || currentAIBubble.querySelector('.message-content')) : null;
      if (msgContent) {
        if (fastgptResult.sources && fastgptResult.sources.length > 0) {
          appendSourceTag(msgContent, fastgptResult.sources);
        } else if (fastgptResult.routeType === 'oa_process') {
          appendSourceTag(msgContent, [{ title: 'OA流程数据库' }]);
        } else if (fastgptResult.usedFastGPT) {
          appendSourceTag(msgContent, [{ title: 'leaprag知识库' }]);
        }
      }
    } else {
      console.error('[sendMessage] ❌ createAnswerArea返回null，currentAIBubble:', currentAIBubble);
    }

    chatHistory.push({ role: 'assistant', content: aiText });
    saveCurrentSession(); // 持久化对话历史
    setStatus('就绪');

    // 延迟重置引用
    setTimeout(() => {
      currentThinkingProcess = null;
      currentAIBubble = null;
    }, 500);

  } catch (error) {
    removeTypingIndicator();
    console.error('[sendMessage] 处理消息失败:', error);

    // 思考过程中出错也要标记完成
    if (currentThinkingProcess) {
      updateThinkingTitle('❌ 思考中断');
      addThinkingStep('error', `处理失败: ${error.message}`);
      setTimeout(() => { currentThinkingProcess = null; }, 500);
    }

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
    tag.textContent = '📚 来自leaprag';
  }

  bubbleElement.appendChild(tag);
}

// 把来源标签追加到msgContent（bubble后面），确保block换行布局
function appendSourceTag(msgContent, sources) {
  if (!msgContent) return;

  const tag = document.createElement('div');
  tag.className = 'rag-source-tag';

  if (sources && sources.length > 0) {
    const sourceNames = sources.map(s => s.title || s.filename || s.name || '文档').slice(0, 3).join(', ');
    tag.textContent = `📚 来源: ${sourceNames}${sources.length > 3 ? ' 等' + sources.length + '篇' : ''}`;
  } else {
    tag.textContent = '📚 来自leaprag';
  }

  msgContent.appendChild(tag);
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
    saveCurrentSession(); // 持久化对话历史
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
  currentSessionId = null; // 新会话：暂无ID，首条消息保存时生成
  const container = document.getElementById('chatContainer');
  container.innerHTML = `
    <div class="welcome-screen">
      <div class="welcome-icon">${LP_LOGO_LARGE}</div>
      <div class="brand-tag">LEAPMOTOR</div>
      <h2>零跑AI助手</h2>
      <p>智能分析当前页面 · 随时随地获取洞察</p>
      <div id="todoCard" class="todo-card hidden">
        <div class="todo-card-header">
          <div class="todo-card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>我的待办</span>
            <span id="todoBadge" class="todo-badge"></span>
          </div>
          <button id="todoRefreshBtn" class="todo-refresh-btn" title="刷新待办">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
        </div>
        <div id="todoCardBody" class="todo-card-body"></div>
      </div>
      <div class="suggestion-chips">
        <button class="chip" data-prompt="请总结这个页面的主要内容">总结页面内容</button>
        <button class="chip" data-prompt="请提取页面中的关键数据和表格">提取关键数据</button>
        <button class="chip" data-prompt="这个页面是做什么的？请详细解释">解释页面用途</button>
        <button class="chip" data-prompt="请列出页面中的主要观点和结论">列出主要观点</button>
      </div>
    </div>
  `;
  bindChips();
  // 待办刷新按钮（欢迎页动态生成，需在此绑定）
  const todoRefreshBtn = document.getElementById('todoRefreshBtn');
  if (todoRefreshBtn) {
    todoRefreshBtn.addEventListener('click', () => {
      todoRefreshBtn.classList.add('spinning');
      _todo_fetching = false;
      fetchTodoItems();
    });
  }
  // 首页自动拉取待办（已配置接口和工号时显示）
  fetchTodoItems();
}

// ========== 对话历史 ==========
const CHAT_SESSIONS_KEY = 'leap_chat_sessions';
const MAX_CHAT_SESSIONS = 50;
let currentSessionId = null; // 当前会话ID；null表示尚未开始的新会话

function loadChatSessions() {
  try {
    const raw = localStorage.getItem(CHAT_SESSIONS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.warn('[对话历史] 读取失败:', e);
    return [];
  }
}

function persistChatSessions(sessions) {
  try {
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    // 存储超限时丢弃最旧的会话重试一次
    if (sessions.length > 5) {
      try {
        localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions.slice(0, Math.floor(sessions.length / 2))));
      } catch (_) { /* 放弃 */ }
    }
    console.warn('[对话历史] 保存失败:', e);
  }
}

// 会话标题取第一条用户消息（去掉抓取/上传后缀）
function getSessionTitle(messages) {
  const firstUser = messages.find(m => m.role === 'user');
  if (!firstUser) return '新对话';
  return firstUser.content
    .replace(/\[已自动抓取当前页面\]/g, '')
    .replace(/\[已抓取 \d+ 个页面进行组合分析\]/g, '')
    .replace(/\[已上传 \d+ 个文件\]/g, '')
    .replace(/🔍\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 30) || '新对话';
}

/**
 * 保存当前会话（在AI回复完成后调用）
 */
function saveCurrentSession() {
  if (!chatHistory || chatHistory.length === 0) return;
  const sessions = loadChatSessions();
  const now = Date.now();
  const title = getSessionTitle(chatHistory);

  const idx = sessions.findIndex(s => s.id === currentSessionId);
  if (idx >= 0) {
    sessions[idx].messages = chatHistory.slice();
    sessions[idx].updatedAt = now;
  } else {
    currentSessionId = `sess_${now}_${Math.random().toString(36).slice(2, 8)}`;
    sessions.unshift({
      id: currentSessionId,
      title,
      createdAt: now,
      updatedAt: now,
      messages: chatHistory.slice()
    });
  }
  // 按 updatedAt 降序，超出上限裁剪最旧的
  sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  if (sessions.length > MAX_CHAT_SESSIONS) sessions.length = MAX_CHAT_SESSIONS;
  persistChatSessions(sessions);
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const MIN = 60000, HOUR = 3600000, DAY = 86400000;
  if (diff < MIN) return '刚刚';
  if (diff < HOUR) return Math.floor(diff / MIN) + ' 分钟前';
  if (diff < DAY) return Math.floor(diff / HOUR) + ' 小时前';
  if (diff < 7 * DAY) return Math.floor(diff / DAY) + ' 天前';
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function openHistoryPanel() {
  const modal = document.getElementById('historyModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  const searchInput = document.getElementById('historySearchInput');
  if (searchInput) {
    searchInput.value = '';
    setTimeout(() => searchInput.focus(), 100);
  }
  renderHistoryList('');
}

function closeHistoryPanel() {
  const modal = document.getElementById('historyModal');
  if (modal) modal.classList.add('hidden');
}

function renderHistoryList(filter = '') {
  const listEl = document.getElementById('historyList');
  const emptyEl = document.getElementById('historyEmpty');
  if (!listEl) return;

  const kw = filter.trim().toLowerCase();
  let sessions = loadChatSessions();
  if (kw) {
    sessions = sessions.filter(s =>
      s.title.toLowerCase().includes(kw) ||
      s.messages.some(m => (m.content || '').toLowerCase().includes(kw))
    );
  }

  if (emptyEl) emptyEl.classList.toggle('hidden', sessions.length > 0);

  listEl.innerHTML = sessions.map(s => {
    const isCurrent = s.id === currentSessionId;
    return `
      <div class="history-item ${isCurrent ? 'current' : ''}" data-session-id="${s.id}">
        <div class="history-item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="history-item-main">
          <div class="history-item-title">${escapeHtml(s.title)}</div>
          <div class="history-item-meta">
            <span class="msg-count">${s.messages.length} 条</span>
            <span>${timeAgo(s.updatedAt)}</span>
          </div>
        </div>
        <div class="history-item-actions">
          <button class="history-action-btn act-rename" data-session-id="${s.id}" title="重命名">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="history-action-btn danger act-delete" data-session-id="${s.id}" title="删除">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // 绑定会话项事件（事件委托）
  listEl.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // 重命名/删除按钮点击不触发恢复
      if (e.target.closest('.history-action-btn')) return;
      restoreSession(item.dataset.sessionId);
    });
  });
  listEl.querySelectorAll('.act-rename').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      renameSession(btn.dataset.sessionId);
    });
  });
  listEl.querySelectorAll('.act-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSession(btn.dataset.sessionId);
    });
  });
}

/**
 * 恢复历史会话到聊天区
 */
function restoreSession(sessionId) {
  const session = loadChatSessions().find(s => s.id === sessionId);
  if (!session) return;

  currentSessionId = session.id;
  chatHistory = session.messages.map(m => ({ role: m.role, content: m.content }));

  const container = document.getElementById('chatContainer');
  container.innerHTML = '';

  session.messages.forEach(m => {
    if (m.role === 'user') {
      addMessage('user', m.content);
    } else {
      // 内容以'<'开头的是HTML卡片（如OA流程），其余按Markdown渲染
      const isHtml = typeof m.content === 'string' && m.content.trim().startsWith('<');
      addMessage('ai', isHtml ? m.content : renderMarkdown(m.content), true);
    }
  });

  closeHistoryPanel();
  setStatus('已恢复历史对话 ✓', 'success');
  setTimeout(() => setStatus('就绪'), 2000);
}

function renameSession(sessionId) {
  const sessions = loadChatSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return;
  const newTitle = prompt('重命名对话：', session.title);
  if (newTitle === null) return; // 取消
  const trimmed = newTitle.trim().slice(0, 50);
  if (!trimmed) return;
  session.title = trimmed;
  persistChatSessions(sessions);
  renderHistoryList(document.getElementById('historySearchInput')?.value || '');
}

function deleteSession(sessionId) {
  let sessions = loadChatSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return;
  if (!confirm(`删除对话"${session.title}"？此操作不可恢复。`)) return;
  sessions = sessions.filter(s => s.id !== sessionId);
  persistChatSessions(sessions);
  // 删除的是当前会话，则重置为空会话
  if (sessionId === currentSessionId) {
    currentSessionId = null;
    chatHistory = [];
  }
  renderHistoryList(document.getElementById('historySearchInput')?.value || '');
}

function clearAllHistory() {
  const sessions = loadChatSessions();
  if (sessions.length === 0) return;
  if (!confirm(`确定清空全部 ${sessions.length} 个历史对话？此操作不可恢复。`)) return;
  localStorage.removeItem(CHAT_SESSIONS_KEY);
  currentSessionId = null;
  renderHistoryList('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

// ========== 我的待办（OA待办聚合） ==========
let _todo_fetching = false;

function getTodoApiConfig() {
  const apiUrl = (localStorage.getItem('oaTodoApiUrl') || '').trim();
  const empId = (localStorage.getItem('employeeId') || '').trim();
  return { apiUrl, empId };
}

/**
 * 拉取并渲染待办列表（首页"我的待办"卡片）
 */
async function fetchTodoItems() {
  const card = document.getElementById('todoCard');
  const body = document.getElementById('todoCardBody');
  if (!card || !body) return;

  const { apiUrl, empId } = getTodoApiConfig();
  // 未配置接口或工号时不显示卡片
  if (!apiUrl || !empId) {
    card.classList.add('hidden');
    return;
  }
  if (_todo_fetching) return;
  _todo_fetching = true;

  card.classList.remove('hidden');
  body.innerHTML = '<div class="todo-status">正在获取待办...</div>';
  setTodoBadge('...');

  const url = apiUrl
    .replace(/\{employeeId\}/g, encodeURIComponent(empId))
    .replace(/\{number\}/g, encodeURIComponent(empId))
    .replace(/\{loginId\}/g, encodeURIComponent(empId));

  try {
    let data = null;
    // 优先直连（扩展已声明 host_permissions，可跨域）
    try {
      const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      data = await resp.json();
    } catch (directErr) {
      console.warn('[待办] 直连失败，尝试background代理:', directErr.message);
      data = await fetchTodoViaProxy(url);
    }

    const items = parseTodoItems(data);
    renderTodoItems(items);
  } catch (err) {
    console.error('[待办] ❌ 获取失败:', err);
    body.innerHTML = `
      <div class="todo-status error">
        待办获取失败：${escapeHtml(err.message || '未知错误')}
        <br/>
        <button class="todo-retry-btn" id="todoRetryBtn">重试</button>
      </div>`;
    setTodoBadge('!');
    const retryBtn = document.getElementById('todoRetryBtn');
    if (retryBtn) retryBtn.addEventListener('click', () => { _todo_fetching = false; fetchTodoItems(); });
  } finally {
    _todo_fetching = false;
    const refreshBtn = document.getElementById('todoRefreshBtn');
    if (refreshBtn) refreshBtn.classList.remove('spinning');
  }
}

/**
 * 通过background代理拉取待办（兜底，处理CORS/内网域限制）
 */
function fetchTodoViaProxy(url) {
  return new Promise((resolve, reject) => {
    window.parent.postMessage({
      type: 'SEND_TO_BACKGROUND',
      callback: 'OA_TODO_RESULT',
      backgroundMessage: { type: 'FETCH_OA_TODO', url }
    }, '*');

    const timeout = setTimeout(() => {
      window.removeEventListener('message', handler);
      reject(new Error('代理请求超时'));
    }, 15000);

    const handler = (event) => {
      if (event.data.type === 'OA_TODO_RESULT') {
        clearTimeout(timeout);
        window.removeEventListener('message', handler);
        if (event.data.success) {
          resolve(event.data.data);
        } else {
          reject(new Error(event.data.error || '代理请求失败'));
        }
      }
    };
    window.addEventListener('message', handler);
  });
}

/**
 * 归一化各种待办接口返回结构为数组
 */
function parseTodoItems(data) {
  if (!data) return [];
  let arr = data;
  if (!Array.isArray(arr)) {
    arr = data.data || data.list || data.rows || data.result || data.records;
    if (arr && !Array.isArray(arr)) {
      arr = arr.list || arr.records || arr.rows || [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr.map(it => {
    if (typeof it === 'string') return { title: it, url: '' };
    return {
      title: it.title || it.name || it.workflowName || it.taskName || it.subject || it.desc || '待办事项',
      url: it.url || it.link || it.workflowUrl || it.href || it.taskUrl || it.detailUrl || '',
      desc: it.desc || it.description || it.content || ''
    };
  }).filter(it => it.title && it.title !== '待办事项');
}

function setTodoBadge(text, isZero = false) {
  const badge = document.getElementById('todoBadge');
  if (!badge) return;
  badge.textContent = text;
  badge.classList.toggle('zero', isZero);
}

function renderTodoItems(items) {
  const body = document.getElementById('todoCardBody');
  const card = document.getElementById('todoCard');
  if (!body || !card) return;

  if (!items || items.length === 0) {
    setTodoBadge('0', true);
    body.innerHTML = '<div class="todo-status">🎉 暂无待办事项，喝杯咖啡吧</div>';
    return;
  }

  setTodoBadge(String(items.length));
  const shown = items.slice(0, 8);
  body.innerHTML = shown.map((it, i) => `
    <div class="todo-item" data-url="${escapeHtml(it.url)}" data-index="${i}">
      <span class="todo-item-dot"></span>
      <span class="todo-item-title" title="${escapeHtml(it.title)}">${escapeHtml(it.title)}</span>
      ${it.url ? '<svg class="todo-item-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><polyline points="7 7 17 7 17 17"/></svg>' : ''}
    </div>
  `).join('') + (items.length > 8 ? `<div class="todo-status">还有 ${items.length - 8} 条待办...</div>` : '');

  body.querySelectorAll('.todo-item').forEach(item => {
    item.addEventListener('click', () => {
      const url = item.dataset.url;
      if (url && /^https?:\/\//.test(url)) {
        window.open(url, '_blank');
      }
    });
  });
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
    const toggle = customShortcuts['toggle-assistant'];
    const toggleKey = toggle ? toggle.key.toUpperCase() : '?';
    el.innerHTML = `<kbd>${MOD_KEY}</kbd><kbd>${toggleKey}</kbd> 唤起 · <kbd>${MOD_KEY}</kbd><kbd>V</kbd> 粘贴`;
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

  // 加载OA待办接口地址（首页"我的待办"）
  const savedTodoApiUrl = localStorage.getItem('oaTodoApiUrl');
  if (savedTodoApiUrl !== null && document.getElementById('oaTodoApiUrl')) {
    document.getElementById('oaTodoApiUrl').value = savedTodoApiUrl;
  }
  // 待办接口地址变更即时保存（与工号输入一致体验）
  const todoApiInput = document.getElementById('oaTodoApiUrl');
  if (todoApiInput) {
    todoApiInput.addEventListener('input', () => {
      localStorage.setItem('oaTodoApiUrl', todoApiInput.value.trim());
    });
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
    // 默认启用智能路由
    enabledCheckbox.checked = FASTGPT_CONFIG.enabled;
    toggleFastGPTSection(FASTGPT_CONFIG.enabled);

    // 绑定开关事件
    enabledCheckbox.addEventListener('change', () => {
      FASTGPT_CONFIG.enabled = enabledCheckbox.checked;
      toggleFastGPTSection(enabledCheckbox.checked);
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

  // 初始化工作流列表
  loadCustomWorkflows();
  renderWorkflowList();
  bindWorkflowForm();
}

function renderWorkflowList() {
  const listEl = document.getElementById('workflowList');
  if (!listEl) return;

  const all = getAllWorkflows();
  if (all.length === 0) {
    listEl.innerHTML = '<div style="color:var(--text-tertiary);font-size:12px;padding:8px 0;">暂无工作流</div>';
    return;
  }

  listEl.innerHTML = all.map(wf => `
    <div class="workflow-item ${wf.isDefault ? 'is-default' : ''}" data-id="${wf.id}">
      <div class="workflow-item-info">
        <span class="workflow-item-icon">${wf.builtIn ? '🏢' : '📋'}</span>
        <span class="workflow-item-name">${escapeHtml(wf.name)}</span>
        ${wf.isDefault ? '<span class="workflow-default-badge">默认</span>' : ''}
      </div>
      <div class="workflow-item-actions">
        ${!wf.isDefault ? `<button class="workflow-action-btn" onclick="setDefaultWorkflow('${wf.id}')">设为默认</button>` : ''}
        ${!wf.builtIn ? `<button class="workflow-action-btn delete" onclick="removeWorkflow('${wf.id}')">删除</button>` : ''}
      </div>
    </div>
  `).join('');
}

function bindWorkflowForm() {
  const addBtn = document.getElementById('addWorkflowBtn');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    const name = document.getElementById('wfName').value.trim();
    const appId = document.getElementById('wfAppId').value.trim();
    const apiKey = document.getElementById('wfApiKey').value.trim();

    if (!name) { alert('请输入工作流名称'); return; }
    if (!appId) { alert('请输入应用ID'); return; }
    if (!apiKey) { alert('请输入API Key'); return; }

    // 检查重复
    const all = getAllWorkflows();
    if (all.some(w => w.appId === appId)) {
      alert('该应用ID已存在');
      return;
    }

    customWorkflows.push({
      id: 'wf_' + Date.now(),
      name,
      appId,
      apiKey,
      isDefault: false,
      builtIn: false
    });
    saveCustomWorkflows();
    renderWorkflowList();

    // 清空表单
    document.getElementById('wfName').value = '';
    document.getElementById('wfAppId').value = '';
    document.getElementById('wfApiKey').value = '';
  });
}

function setDefaultWorkflow(id) {
  // 先清除所有默认标记
  BUILTIN_WORKFLOWS.forEach(w => w.isDefault = false);
  customWorkflows.forEach(w => w.isDefault = false);

  const all = getAllWorkflows();
  const target = all.find(w => w.id === id);
  if (target) {
    target.isDefault = true;
    // 如果是自定义工作流，需要保存
    if (!target.builtIn) {
      saveCustomWorkflows();
    } else {
      // 内置工作流设为默认时，也要清除自定义工作流的默认标记
      saveCustomWorkflows();
    }
  }
  renderWorkflowList();
}

function removeWorkflow(id) {
  customWorkflows = customWorkflows.filter(w => w.id !== id);
  saveCustomWorkflows();

  // 如果删除的是默认工作流，把默认还给协同办公
  const all = getAllWorkflows();
  if (!all.some(w => w.isDefault)) {
    BUILTIN_WORKFLOWS[0].isDefault = true;
  }
  renderWorkflowList();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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
  try {
    console.log('[设置] 💾 开始保存配置...');

    // 1. 保存API配置
    settings = {
      apiType: document.getElementById('apiType')?.value || 'openai',
      apiUrl: document.getElementById('apiUrl')?.value || '',
      apiKey: document.getElementById('apiKey')?.value || '',
      modelName: document.getElementById('modelName')?.value || ''
    };
    localStorage.setItem('aiSettings', JSON.stringify(settings));
    console.log('[设置] ✅ API配置已保存');

    // 2. 保存员工工号（基础配置Tab）
    const employeeIdInput = document.getElementById('employeeId');
    if (employeeIdInput) {
      const empId = employeeIdInput.value.trim();
      if (empId) {
        localStorage.setItem('employeeId', empId);
        employeeId = empId;
        console.log('[设置] ✅ 员工工号已保存:', empId);
      }
    }

    // 3. 保存FastGPT配置
    const fastgptEnabled = document.getElementById('fastgptEnabled')?.checked ?? FASTGPT_CONFIG.enabled;
    localStorage.setItem('fastgptEnabled', fastgptEnabled);
    FASTGPT_CONFIG.enabled = fastgptEnabled;

    // 4. 标记引导已完成
    localStorage.setItem('onboardingSeen', 'true');
    closeOnboarding();
    closeConfigWarning();

    // 5. 关闭设置面板并返回问答界面
    const panel = document.getElementById('settingsPanel');
    if (panel) {
      panel.classList.add('hidden');
      console.log('[设置] 🚪 设置面板已关闭');
    }

    // 6. 显示保存成功状态
    setStatus('✅ 设置已保存', 'success');

    // 7. 延迟检测API连接（不阻塞界面返回）
    setTimeout(async () => {
      try {
        await checkApiConfigAndShowWarning();
        if (isConfigValid) {
          setTimeout(() => updateApiStatus('success', '就绪'), 1500);
        }
      } catch (error) {
        console.error('[设置] ⚠️ API检测失败:', error);
        // 即使检测失败也不影响使用
        updateApiStatus('success', '就绪');
      }
    }, 500);

    console.log('[设置] 🎉 配置保存完成，已返回问答界面');

  } catch (error) {
    console.error('[设置] ❌ 保存失败:', error);
    alert('保存设置时出错: ' + error.message);

    // 即使出错也尝试关闭设置面板
    const panel = document.getElementById('settingsPanel');
    if (panel) panel.classList.add('hidden');
  }
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
  } else if (event.data.type === 'AI_SELECTED_TEXT' && event.data.text) {
    const action = event.data.action;
    const text = event.data.text;
    const promptMap = {
      explain: `请解释以下内容：\n\n${text}`,
      translate: `请将以下内容翻译成中文（如果已经是中文则翻译成英文）：\n\n${text}`,
      summarize: `请总结以下内容的要点：\n\n${text}`,
      ask: `基于以下内容，我的问题是：\n\n${text}`
    };
    const prompt = promptMap[action] || `请分析以下内容：\n\n${text}`;
    const input = document.getElementById('messageInput');
    if (input) {
      input.value = prompt;
      input.focus();
      sendMessage();
    }
  }
});

// ========== 输入框 Placeholder 轮换 ==========
function getPlaceholderHints() {
  const toggleKey = shortcutToDisplay(customShortcuts['toggle-assistant']) || (isMac ? '⌘J' : 'Ctrl+M');
  return [
    '输入你的问题...',
    '试试问我「走哪个流程」',
    '帮我分析这个页面',
    '试试问我「电脑坏了找谁」',
    '输入问题，按 Enter 发送',
    '试试问我「怎么报销」',
    `支持快捷键 ${toggleKey} 唤起哦`,
  ];
}

let placeholderTimer = null;

function startPlaceholderRotation(input) {
  if (!input) return;
  let idx = 0;
  // 用户开始输入时停止轮换
  input.addEventListener('focus', () => {
    if (placeholderTimer) { clearInterval(placeholderTimer); placeholderTimer = null; }
    if (!input.value) input.placeholder = getPlaceholderHints()[0];
  });
  // 失焦且无内容时恢复轮换
  input.addEventListener('blur', () => {
    if (!input.value) startTimer();
  });
  function startTimer() {
    if (placeholderTimer) clearInterval(placeholderTimer);
    placeholderTimer = setInterval(() => {
      if (document.activeElement === input || input.value) return;
      const hints = getPlaceholderHints();
      idx = (idx + 1) % hints.length;
      input.style.transition = 'opacity 0.2s';
      input.style.opacity = '0.5';
      setTimeout(() => {
        input.placeholder = hints[idx];
        input.style.opacity = '1';
      }, 200);
    }, 3500);
  }
  startTimer();
}

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
  initQuickAccessPanel();  // 初始化应用快捷入口弹出面板
  try {
    initAutoUpdateSystem();  // 初始化在线自动更新系统（失败不影响其他功能初始化）
  } catch (e) {
    console.warn('[初始化] 自动更新系统启动失败:', e.message);
  }

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

  // 启动 placeholder 轮换提示
  startPlaceholderRotation(input);

  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  document.getElementById('newChatBtn').addEventListener('click', newChat);

  // ===== 一键页面摘要 =====
  const summaryBtn = document.getElementById('summaryBtn');
  if (summaryBtn) summaryBtn.addEventListener('click', () => {
    summaryBtn.style.transform = 'scale(0.9)';
    setTimeout(() => summaryBtn.style.transform = '', 150);
    const summaryPrompt = `请对以下页面内容进行结构化摘要，按以下格式输出：

## 核心主题
（一句话概括页面主题）

## 关键要点
- 要点1
- 要点2
- 要点3

## 重要数据/结论
（提取页面中的关键数据和结论）

## 行动建议
（基于页面内容给出行动建议）`;
    window.parent.postMessage({ type: 'GET_PAGE_CONTENT' }, '*');
    const handler = (event) => {
      if (event.data.type === 'PAGE_CONTENT' && event.data.content) {
        window.removeEventListener('message', handler);
        const pageText = event.data.content.text || event.data.content.title || '';
        if (pageText) {
          const input = document.getElementById('messageInput');
          if (input) {
            input.value = `${summaryPrompt}\n\n---\n页面标题：${event.data.content.title || ''}\n\n${pageText.slice(0, 3000)}`;
            input.focus();
            sendMessage();
          }
        }
      }
    };
    window.addEventListener('message', handler);
    setTimeout(() => window.removeEventListener('message', handler), 5000);
  });
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingsPanel').classList.toggle('hidden');
  });
  document.getElementById('saveSettings').addEventListener('click', saveSettings);

  // ===== 对话历史面板 =====
  const historyBtn = document.getElementById('historyBtn');
  if (historyBtn) historyBtn.addEventListener('click', openHistoryPanel);
  const closeHistoryBtn = document.getElementById('closeHistoryModal');
  if (closeHistoryBtn) closeHistoryBtn.addEventListener('click', closeHistoryPanel);
  const historyOverlay = document.querySelector('#historyModal .history-overlay');
  if (historyOverlay) historyOverlay.addEventListener('click', closeHistoryPanel);
  const historySearchInput = document.getElementById('historySearchInput');
  if (historySearchInput) {
    historySearchInput.addEventListener('input', (e) => renderHistoryList(e.target.value));
  }
  const clearAllHistoryBtn = document.getElementById('clearAllHistoryBtn');
  if (clearAllHistoryBtn) clearAllHistoryBtn.addEventListener('click', clearAllHistory);

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

    // 【修复】正确解析嵌套结构：data.data = 分类数组，每个分类含 weaverCreateWorkFlowDTOS
    let processList = [];
    const categoryList = data.data || data;

    if (Array.isArray(categoryList)) {
      categoryList.forEach(category => {
        const categoryName = category.typeName || category.workflowTypeName || '未分类';
        const subFlows = category.weaverCreateWorkFlowDTOS || [];
        if (Array.isArray(subFlows)) {
          subFlows.forEach(flow => {
            processList.push({ ...flow, _category: categoryName });
          });
        }
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
          // 代理返回 proxyResult.data = 完整响应 {code, msg, data:[分类数组]}
          let proxyProcessList = [];
          const proxyCategoryList = proxyResult.data.data || proxyResult.data || [];
          if (Array.isArray(proxyCategoryList)) {
            proxyCategoryList.forEach(category => {
              const categoryName = category.typeName || category.workflowTypeName || '未分类';
              const subFlows = category.weaverCreateWorkFlowDTOS || [];
              if (Array.isArray(subFlows)) {
                subFlows.forEach(flow => {
                  proxyProcessList.push({ ...flow, _category: categoryName });
                });
              }
            });
          }
          showOAModalState('list', proxyProcessList);
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
    // 【修复】使用API返回的正确字段：workflowName, workflowDesc, workflowUrl
    const name = process.workflowName || process.name || '未命名流程';
    const desc = process.workflowDesc || process.wfDesc || process.description || '';
    const id = process.workflowId || process.id || index;
    const url = process.workflowUrl || process.authUrl || process.url || '';

    // 显示分类标签
    const category = process._category || process.workflowTypeName || '';

    return `
      <div class="oa-process-item" data-id="${id}" data-name="${escapeHtml(name)}" data-url="${escapeHtml(url)}">
        <div class="oa-process-info">
          <div class="oa-process-name">${escapeHtml(name)}</div>
          ${category ? `<div style="font-size:11px;color:var(--accent-color-light,var(--accent));margin-bottom:4px;">${escapeHtml(category)}</div>` : ''}
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

// ========== 热更新模块 ==========
// 注意：sidebar 运行在 iframe 中（第三方上下文），Chrome 禁止 iframe 调用 showDirectoryPicker。
// 实际文件选择、下载、写入操作都在独立的 popup 窗口（hot-update.html）中执行，
// 该窗口通过 chrome.windows.create 打开，是 chrome-extension:// 第一方上下文。
const HOT_UPDATE = {
  DB_NAME: 'leapmotor-hot-update',
  STORE_NAME: 'handles',
  DIR_KEY: 'extension-dir-handle',
  _cachedEnabled: null,

  /** 初始化：检测是否已有授权目录（优先读chrome.storage.local，popup间实时共享） */
  async init() {
    try {
      // 从chrome.storage.local读取状态（popup授权后会写入此处，实时同步）
      const data = await chrome.storage.local.get('hotUpdateAuthorized');
      if (data.hotUpdateAuthorized) {
        this._cachedEnabled = true;
      } else {
        // 兼容旧版本：从IDB检测
        this._cachedEnabled = await this._hasHandle();
        // 如果IDB有但storage没标记，补上标记
        if (this._cachedEnabled) {
          await chrome.storage.local.set({ hotUpdateAuthorized: Date.now() });
        }
      }
      console.log('[热更新] 状态:', this._cachedEnabled ? '✅ 已启用（有授权目录）' : 'ℹ️ 未启用');
    } catch (err) {
      console.warn('[热更新] 检测状态失败:', err.message);
      this._cachedEnabled = false;
    }
  },

  /** 浏览器是否支持热更新（Chrome 86+） */
  isSupported() {
    // 即使iframe中不能调用showDirectoryPicker，但独立popup窗口可以
    return /Chrome\/(8[6-9]|9\d|1\d\d)/.test(navigator.userAgent) ||
           /Edg\/(8[6-9]|9\d|1\d\d)/.test(navigator.userAgent);
  },

  /** 是否已启用（之前授权过目录） */
  isEnabled() {
    return this._cachedEnabled === true;
  },

  /** 重新检测授权状态并刷新UI（popup授权后调用） */
  async refresh() {
    try {
      const data = await chrome.storage.local.get('hotUpdateAuthorized');
      this._cachedEnabled = !!data.hotUpdateAuthorized;
      updateHotUpdateUI();
    } catch(err) {
      console.warn('[热更新] 刷新状态失败:', err.message);
    }
  },

  /** 通过 background 打开热更新 popup 窗口 */
  openHotUpdateWindow(version) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'OPEN_HOT_UPDATE_WINDOW', version: version },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || '打开窗口失败'));
          }
        }
      );
    });
  },

  /** 清除授权（关闭热更新） */
  async disable() {
    try {
      const db = await this._openDB();
      await new Promise((resolve) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        tx.objectStore(this.STORE_NAME).delete(this.DIR_KEY);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); resolve(); };
      });
      this._cachedEnabled = false;
      await chrome.storage.local.remove('hotUpdateAuthorized');
    } catch (e) { /* 忽略 */ }
  },

  // ---- IndexedDB ----

  _openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(this.STORE_NAME);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async _hasHandle() {
    try {
      const db = await this._openDB();
      return await new Promise((resolve) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const req = tx.objectStore(this.STORE_NAME).get(this.DIR_KEY);
        req.onsuccess = () => { db.close(); resolve(!!req.result); };
        req.onerror = () => { db.close(); resolve(false); };
      });
    } catch (e) {
      return false;
    }
  },
};

/**
 * 初始化在线自动更新系统
 */
function initAutoUpdateSystem() {
  console.log('[在线更新] 🚀 初始化自动更新系统...');

  // 获取当前版本号
  currentVersion = getCurrentVersion();
  console.log('[在线更新] 📌 当前版本:', currentVersion);

  // 显示当前版本号（设置页）
  const versionDisplay = document.getElementById('currentVersionDisplay');
  if (versionDisplay) {
    versionDisplay.textContent = `v${currentVersion}`;
  }

  // 头部更新按钮：默认隐藏，发现新版本时显示；点击打开"关于与更新"
  const headerUpdateBtn = document.getElementById('headerUpdateBtn');
  if (headerUpdateBtn) {
    headerUpdateBtn.addEventListener('click', () => {
      // 打开设置面板
      openSettingsPanel();
      // 切换到"关于与更新"tab
      setTimeout(() => {
        const aboutTab = document.querySelector('.settings-tab[data-tab="about"]');
        if (aboutTab) aboutTab.click();
        // 自动触发检查更新
        handleManualCheckUpdate();
      }, 150);
    });
  }

  // 启动时：若上次已发现未更新的新版本（缓存中），直接显示图标（避免每次都等待网络）
  const cachedNewVersion = localStorage.getItem('pendingNewVersion');
  if (cachedNewVersion && compareVersions(cachedNewVersion, currentVersion)) {
    showHeaderUpdateIcon(cachedNewVersion);
  }

  // 检测版本变化，显示"已更新到 vX.X.X"提示
  const lastVersion = localStorage.getItem('lastActiveVersion');
  if (lastVersion && lastVersion !== currentVersion) {
    showUpdateToast(currentVersion);
    // 版本升级后清除缓存的待更新提示
    localStorage.removeItem('pendingNewVersion');
    hideHeaderUpdateIcon();
  }
  localStorage.setItem('lastActiveVersion', currentVersion);

  // 初始化热更新模块
  HOT_UPDATE.init().then(() => {
    updateHotUpdateUI();
  });

  // 监听popup窗口授权成功的信号，自动刷新热更新状态
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.hotUpdateAuthorized) {
      HOT_UPDATE.refresh();
    }
    // 热更新完成信号：显示成功横幅，提示用户刷新扩展
    if (area === 'local' && changes.hotUpdateCompleted) {
      const info = changes.hotUpdateCompleted.newValue;
      if (info && info.version) {
        showUpdateSuccessBanner(info.version);
        hideHeaderUpdateIcon();
      }
    }
  });

  // 启动时检查：是否存在"文件已更新但扩展未刷新"的状态（用户上次没点刷新）
  chrome.storage.local.get('hotUpdateCompleted', (data) => {
    const info = data && data.hotUpdateCompleted;
    if (info && info.version && compareVersions(info.version, currentVersion)) {
      showUpdateSuccessBanner(info.version);
    }
  });

  // 绑定事件
  bindUpdateEvents();

  // 启动时自动静默检查更新（缩短间隔为1小时，提高更新可见性）
  const lastCheck = parseInt(localStorage.getItem('lastUpdateCheckTime') || '0');
  const oneHour = 60 * 60 * 1000;
  if (Date.now() - lastCheck > oneHour) {
    console.log('[在线更新] ⏰ 启动时静默检查更新...');
    checkForUpdates(true);
  } else {
    console.log('[在线更新] ℹ️ 距离上次检查不足1小时，跳过启动检查');
  }
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
 * 显示"已更新到 vX.X.X"的 Toast 提示
 */
function showUpdateToast(version) {
  // 移除已有的 toast
  const existing = document.querySelector('.update-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'update-toast';
  toast.innerHTML = `<span class="toast-icon">🎉</span>已更新到 <span class="toast-version">v${version}</span>`;
  document.body.appendChild(toast);

  // 触发动画
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  // 3秒后自动消失
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * 显示头部更新提示图标
 * @param {string} newVersion - 新版本号（不带v前缀也可以）
 */
function showHeaderUpdateIcon(newVersion) {
  const btn = document.getElementById('headerUpdateBtn');
  if (!btn) return;
  const v = newVersion && !newVersion.startsWith('v') ? 'v' + newVersion : (newVersion || '');
  btn.title = v ? `发现新版本 ${v}，点击更新` : '发现新版本，点击更新';
  btn.style.display = 'flex';
  // 缓存待更新版本号（跨会话持久显示图标）
  if (newVersion) {
    localStorage.setItem('pendingNewVersion', newVersion.replace(/^v/, ''));
  }
}

/**
 * 隐藏头部更新提示图标
 */
function hideHeaderUpdateIcon() {
  const btn = document.getElementById('headerUpdateBtn');
  if (btn) btn.style.display = 'none';
  localStorage.removeItem('pendingNewVersion');
}

/**
 * 显示热更新成功横幅（提示用户打开扩展管理页刷新）
 * @param {string} version - 新版本号
 */
function showUpdateSuccessBanner(version) {
  // 移除已有横幅
  const existing = document.querySelector('.update-success-banner');
  if (existing) existing.remove();

  const v = version && !String(version).startsWith('v') ? 'v' + version : String(version || '');

  const banner = document.createElement('div');
  banner.className = 'update-success-banner';
  banner.innerHTML = `
    <div class="banner-icon">🎉</div>
    <div class="banner-text">
      <div class="banner-title">已成功更新到 ${v}！</div>
      <div class="banner-desc">① 点击右侧按钮打开扩展管理页，点击零跑AI助手卡片上的 ↻ 刷新<br>② 刷新后请刷新已打开的网页（F5），悬浮按钮才会恢复可用</div>
    </div>
    <button class="banner-refresh-btn" title="打开 chrome://extensions 扩展管理页">🔗 打开扩展管理页</button>
    <button class="banner-close" title="关闭">×</button>
  `;
  document.body.appendChild(banner);

  // 打开 chrome://extensions/（优先聚焦已打开的标签页）
  banner.querySelector('.banner-refresh-btn').addEventListener('click', async () => {
    try {
      const tabs = await chrome.tabs.query({ url: 'chrome://extensions/*' });
      if (tabs && tabs.length > 0) {
        const tab = tabs[0];
        await chrome.tabs.update(tab.id, { active: true });
        if (tab.windowId) await chrome.windows.update(tab.windowId, { focused: true });
      } else {
        await chrome.tabs.create({ url: 'chrome://extensions/', active: true });
      }
    } catch (e) {
      console.warn('[更新横幅] 打开扩展管理页失败:', e);
      const desc = banner.querySelector('.banner-desc');
      if (desc) desc.innerHTML = '打开失败，请手动在地址栏输入 <code>chrome://extensions</code> 并点击 ↻ 刷新';
    }
  });

  // 关闭横幅
  banner.querySelector('.banner-close').addEventListener('click', () => {
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 300);
  });

  // 触发入场动画
  requestAnimationFrame(() => {
    requestAnimationFrame(() => banner.classList.add('show'));
  });
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

  // 热更新按钮
  const hotUpdateBtn = document.getElementById('hotUpdateBtn');
  if (hotUpdateBtn) {
    hotUpdateBtn.addEventListener('click', () => {
      doHotUpdate(updateInfoCache);
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
          downloadUrl: releaseInfo.zipDownloadUrl || releaseInfo.zipball_url || releaseInfo.browser_download_url,
          zipDownloadUrl: releaseInfo.zipDownloadUrl,
          changelog: releaseInfo.body || '请查看完整更新日志',
          releaseDate: releaseInfo.published_at,
          isForceUpdate: false,
          htmlUrl: releaseInfo.html_url
        };

        // 记录检查时间
        localStorage.setItem('lastUpdateCheckTime', Date.now());

        if (!silent) {
          // 热更新已启用：直接打开热更新窗口，跳过modal
          if (HOT_UPDATE.isEnabled()) {
            showUpdateStatus(`⚡ 发现新版本 v${releaseInfo.tag_name}，正在自动热更新...`, 'info');
            doHotUpdate(updateInfoCache);
          } else {
            // 热更新未启用：显示弹窗让用户选择
            showUpdateAvailableModal(releaseInfo);
          }
        } else {
          // 静默模式：状态栏提示 + 头部显示更新图标
          showUpdateStatus(`发现新版本 v${releaseInfo.tag_name}`, 'success');
          showHeaderUpdateIcon(releaseInfo.tag_name);
        }

        return true;
      } else {
        console.log('[在线更新] ✅ 已是最新版本');
        // 已是最新，确保头部图标隐藏（清除可能残留的缓存）
        hideHeaderUpdateIcon();
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

  // 从assets中查找我们上传的zip安装包（文件名以leapmotor-ai-assistant-v开头）
  let zipDownloadUrl = null;
  if (data.assets && data.assets.length > 0) {
    const zipAsset = data.assets.find(a => a.name && a.name.endsWith('.zip'));
    if (zipAsset) {
      zipDownloadUrl = zipAsset.browser_download_url;
      console.log('[在线更新] 📦 找到安装包:', zipAsset.name);
    }
  }

  // 把zip下载链接挂到data上
  data.zipDownloadUrl = zipDownloadUrl;

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
 * 智能清洗/生成更新日志：
 * - 如果 release.body 是默认模板文字（含"请下载下方zip包"等），或为空，则生成内置友好文案
 * - 否则把 Markdown 渲染为 HTML
 */
function renderChangelog(releaseInfo) {
  const version = (releaseInfo.tag_name || '').replace(/^v/, '');
  const raw = (releaseInfo.body || '').trim();

  // 检测是否是默认模板/占位文本
  const isPlaceholder = !raw ||
    /请下载下方\s*zip\s*包/i.test(raw) ||
    /按\s*dist\/windows/i.test(raw) ||
    /安装说明-\w+\.md/i.test(raw) ||
    (raw.length < 15 && !/\*\*|^[-*]|^###/m.test(raw));

  if (isPlaceholder) {
    // 内置版本亮点（按主要版本给出简要说明，最新版放最上）
    const highlights = {
      '1.6.5': [
        '热更新下载失败自动重试 3 次，网络抖动不再中断更新',
        '静态下载地址失效时自动走 GitHub API 查询真实资产，彻底避免 404',
        '发布脚本增强上传重试与资产校验，确保版本发布即可用'
      ],
      '1.6.4': [
        '深色模式整体对比度提升，文字更清晰',
        '背景调整为石墨灰 Apple 风，移除刺眼亮青色',
        '欢迎页图标、标题渐变、用户头像配色统一优化'
      ],
      '1.6.3': [
        '深色模式配色全面重做（石墨灰 · Apple 风）',
        '更新成功后支持一键跳转到扩展管理页'
      ]
    };
    // 当前版本的亮点优先
    const items = highlights[version] || ['功能优化与稳定性提升', '修复若干已知问题'];
    return `<div class="md-content"><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
  }

  return formatChangelogMarkdown(raw);
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

  const newVer = (releaseInfo.tag_name || updateInfoCache?.version || '未知').replace(/^v/, '');
  if (oldVerEl) oldVerEl.textContent = `v${currentVersion}`;
  if (newVerEl) newVerEl.textContent = `v${newVer}`;

  // 渲染更新日志（自动清洗默认模板）
  if (changelogEl) {
    changelogEl.innerHTML = renderChangelog(releaseInfo);
  }

  // 强制更新提示：仅当 major/minor 差距≥1 或 tag 带 force 标识时显示
  if (forceNoticeEl) {
    const force = !!updateInfoCache?.isForceUpdate;
    forceNoticeEl.classList.toggle('hidden', !force);
  }

  // 按钮状态：主按钮始终为「一键热更新」，副按钮为「手动下载」
  const hotUpdateBtn = document.getElementById('hotUpdateBtn');
  const downloadBtn = document.getElementById('downloadUpdateBtn');
  const hotUpdateHint = document.getElementById('hotUpdateHint');
  const skipBtn = document.getElementById('skipUpdateBtn');

  // 热更新主按钮（始终显示，作为推荐选项）
  if (hotUpdateBtn) {
    hotUpdateBtn.classList.remove('hidden');
    const hotEnabled = HOT_UPDATE.isEnabled();
    hotUpdateBtn.querySelector('span').textContent = hotEnabled ? '一键热更新' : '开启并热更新';
  }
  // 手动下载按钮作为次要选项（始终显示但弱化）
  if (downloadBtn) {
    downloadBtn.classList.remove('hidden');
  }
  // 提示条：未启用热更新时才显示说明
  if (hotUpdateHint) {
    hotUpdateHint.classList.toggle('hidden', HOT_UPDATE.isEnabled());
  }
  if (skipBtn) {
    skipBtn.classList.remove('hidden');
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
 * 执行热更新（一键自动更新）- 通过独立popup窗口执行
 */
async function doHotUpdate(updateData) {
  if (!updateData || !updateData.version) {
    showUpdateStatus('❌ 版本信息无效', 'error');
    return;
  }

  const version = updateData.version.replace(/^v/, '');
  console.log('[热更新] 🚀 打开热更新窗口，目标版本 v' + version);

  closeUpdateAvailableModal();
  // 开始热更新时隐藏头部更新图标
  hideHeaderUpdateIcon();

  if (!HOT_UPDATE.isSupported()) {
    showUpdateStatus('❌ 当前浏览器不支持热更新，请使用 Chrome 86+ 或手动下载ZIP更新', 'error');
    return;
  }

  showUpdateStatus('⚡ 正在打开热更新窗口...', 'info');

  try {
    await HOT_UPDATE.openHotUpdateWindow(updateData.version);
    showUpdateStatus(`⚡ 热更新窗口已打开，请在新窗口中完成更新（v${updateData.version}）`, 'success');
  } catch (err) {
    console.error('[热更新] 打开窗口失败:', err);
    showUpdateStatus(`❌ 打开热更新窗口失败: ${err.message}`, 'error');
  }
}

/**
 * 更新关于页面的热更新状态显示
 */
function updateHotUpdateUI() {
  const statusEl = document.getElementById('hotUpdateStatus');
  if (!statusEl) return;

  if (!HOT_UPDATE.isSupported()) {
    statusEl.innerHTML = '<span style="color:var(--text-tertiary);font-size:11px;">⚠️ 当前浏览器不支持热更新（需要 Chrome 86+）</span>';
    return;
  }

  if (HOT_UPDATE.isEnabled()) {
    statusEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;font-size:12px;flex-wrap:wrap;">
        <span style="color:var(--accent);font-weight:600;">⚡ 热更新已启用</span>
        <span style="color:var(--text-tertiary);font-size:11px;">点击「检查更新」即可一键自动覆盖更新</span>
        <button id="disableHotUpdateBtn" style="margin-left:auto;padding:2px 8px;font-size:11px;background:transparent;border:1px solid var(--glass-border);border-radius:4px;color:var(--text-tertiary);cursor:pointer;">关闭</button>
      </div>
    `;
    const disableBtn = document.getElementById('disableHotUpdateBtn');
    if (disableBtn) {
      disableBtn.addEventListener('click', async () => {
        await HOT_UPDATE.disable();
        updateHotUpdateUI();
        showUpdateStatus('热更新已关闭', 'info');
      });
    }
  } else {
    statusEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;font-size:12px;flex-wrap:wrap;">
        <span style="color:var(--text-tertiary);font-size:11px;">热更新未启用 - 首次需选择 extension 目录授权</span>
        <button id="enableHotUpdateBtn" style="padding:2px 8px;font-size:11px;background:rgba(143,224,64,0.12);border:1px solid rgba(143,224,64,0.3);border-radius:4px;color:var(--accent);cursor:pointer;">⚡ 开启热更新</button>
      </div>
    `;
    const enableBtn = document.getElementById('enableHotUpdateBtn');
    if (enableBtn) {
      enableBtn.addEventListener('click', async () => {
        try {
          // 打开热更新窗口但不指定版本，让用户先授权目录
          await HOT_UPDATE.openHotUpdateWindow('__setup__');
        } catch (err) {
          showUpdateStatus(`❌ ${err.message}`, 'error');
        }
      });
    }
  }
}

/**
 * 开始下载更新（使用真实fetch + ReadableStream下载并显示真实进度）
 */
async function startDownloadUpdate(updateData) {
  if (!updateData || (!updateData.zipDownloadUrl && !updateData.downloadUrl)) {
    console.error('[在线更新] ⚠️ 无下载链接');
    showUpdateStatus('❌ 下载链接无效', 'error');
    return;
  }

  const downloadUrl = updateData.zipDownloadUrl || updateData.downloadUrl;
  console.log('[在线更新] 📥 开始下载更新:', downloadUrl);

  // 关闭新版本弹窗
  closeUpdateAvailableModal();

  // 显示进度弹窗
  const progressModal = document.getElementById('updateProgressModal');
  if (progressModal) progressModal.classList.remove('hidden');

  // 填充下载信息
  const verEl = document.getElementById('downloadingVersion');
  if (verEl) verEl.textContent = updateData.version;

  const progressBar = progressModal ? progressModal.querySelector('.progress-fill') : null;
  const progressPercent = document.getElementById('downloadPercent');
  const downloadedSizeEl = document.getElementById('downloadedSize');
  const totalSizeEl = document.getElementById('totalSize');
  const statusText = document.getElementById('downloadStatusText');

  const updateProgress = (loaded, total, percent) => {
    if (progressBar) progressBar.style.width = percent + '%';
    if (progressPercent) progressPercent.textContent = Math.round(percent) + '%';
    if (downloadedSizeEl) downloadedSizeEl.textContent = formatBytes(loaded);
    if (totalSizeEl && total > 0) totalSizeEl.textContent = formatBytes(total);
    if (statusText) {
      statusText.textContent = percent >= 100 ? '下载完成，正在保存...' : `正在下载... ${Math.round(percent)}%`;
    }
  };

  updateProgress(0, 0, 0);

  try {
    // 使用fetch获取真实下载进度
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentLength = parseInt(response.headers.get('content-length') || '0');
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      const percent = contentLength ? (received / contentLength) * 100 : Math.min(90, received / 1024 / 80); // 未知大小估测
      updateProgress(received, contentLength, percent);
    }

    // 合并chunks并创建Blob触发下载
    const blob = new Blob(chunks);
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `leapmotor-ai-assistant-${updateData.version}.zip`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 释放blob URL（延迟以便浏览器开始下载）
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

    updateProgress(received, contentLength, 100);

    setTimeout(() => {
      closeUpdateProgressModal();
      showInstallGuide(updateData);
    }, 800);

  } catch (err) {
    console.error('[在线更新] ❌ 下载失败:', err);
    // fetch失败则降级为简单的a标签下载
    console.log('[在线更新] 🔀 降级为浏览器直接下载...');
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `leapmotor-ai-assistant-${updateData.version}.zip`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      closeUpdateProgressModal();
      showInstallGuide(updateData);
    }, 500);
  }
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

/**
 * 显示安装指引
 */
function showInstallGuide(updateData) {
  const statusEl = document.getElementById('updateStatusText');
  if (statusEl) {
    const ver = updateData.version || '新版本';
    statusEl.innerHTML = `
      <div style="margin-top:8px;line-height:1.7">
        <div style="margin-bottom:10px;padding:10px 12px;background:rgba(143,224,64,0.1);border:1px solid rgba(143,224,64,0.25);border-radius:10px;">
          ✅ <strong>${ver} 安装包已下载！</strong><br>
          <span style="font-size:12px;color:var(--text-secondary);">请按以下 <strong>3步</strong> 完成更新（所有设置和数据会完整保留）</span>
        </div>

        <div style="padding:0 4px;font-size:13px;">
          <div style="margin-bottom:10px;display:flex;gap:8px;align-items:flex-start;">
            <span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:var(--accent);color:#000;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;">1</span>
            <div><strong>解压下载的 ZIP 文件</strong><br>
              <span style="color:var(--text-secondary);font-size:12px;">在浏览器下载栏点击下载的文件，或在「下载」文件夹中找到 <code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:3px;font-size:11px;">leapmotor-ai-assistant-${ver}.zip</code> 双击解压。</span>
            </div>
          </div>

          <div style="margin-bottom:10px;display:flex;gap:8px;align-items:flex-start;">
            <span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:var(--accent);color:#000;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;">2</span>
            <div><strong>覆盖 extension 文件夹</strong><br>
              <span style="color:var(--text-secondary);font-size:12px;">打开解压后的文件夹，把里面 <strong>所有文件</strong>复制到你之前加载扩展的那个 <code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:3px;font-size:11px;">extension</code> 目录，<strong>全部替换</strong>。</span>
            </div>
          </div>

          <div style="margin-bottom:4px;display:flex;gap:8px;align-items:flex-start;">
            <span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:var(--accent);color:#000;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;">3</span>
            <div><strong>刷新扩展</strong><br>
              <span style="color:var(--text-secondary);font-size:12px;">点击下方按钮打开扩展管理页，找到「零跑AI助手」卡片，点击右下角 🔄 刷新按钮即可。</span>
              <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;">
                <button onclick="window.open('chrome://extensions/','_blank')" style="padding:6px 14px;background:var(--accent);color:#000;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">
                  🚀 打开 chrome://extensions
                </button>
                <button onclick="showUpdateStepTip('find-folder')" style="padding:6px 14px;background:rgba(255,255,255,0.08);color:var(--text-primary);border:1px solid var(--glass-border);border-radius:6px;cursor:pointer;font-size:12px;">
                  📁 忘了 extension 在哪？
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top:10px;padding:8px 12px;background:rgba(231,76,60,0.08);border:1px solid rgba(231,76,60,0.25);border-radius:8px;font-size:11px;color:#e74c3c;line-height:1.6;">
          ⚠️ <strong>不要点「加载已解压的扩展程序」！</strong>那会创建副本出现两个助手。只需覆盖旧文件 → 点🔄刷新。
        </div>
      </div>
    `;
    statusEl.className = 'update-status-text success';
  }
}

/**
 * 显示如何找到extension文件夹的提示
 */
function showUpdateStepTip(step) {
  if (step === 'find-folder') {
    const statusEl = document.getElementById('updateStatusText');
    if (!statusEl) return;
    // 追加提示内容
    const tipDiv = document.createElement('div');
    tipDiv.style.cssText = 'margin-top:10px;padding:10px 12px;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);border-radius:8px;font-size:12px;line-height:1.7;';
    tipDiv.innerHTML = `
      📁 <strong>如何找到 extension 文件夹：</strong><br>
      1. 打开 <button onclick="window.open('chrome://extensions/','_blank')" style="padding:2px 8px;background:rgba(0,212,255,0.2);border:1px solid rgba(0,212,255,0.3);border-radius:4px;color:var(--lp-cyan);cursor:pointer;font-size:11px;">chrome://extensions</button><br>
      2. 找到「零跑AI助手」卡片<br>
      3. 卡片上会显示本地路径（类似 <code style="background:rgba(255,255,255,0.1);padding:0 3px;border-radius:2px;">/Users/xxx/extension</code>）<br>
      4. 复制路径在文件管理器中打开即可
    `;
    statusEl.appendChild(tipDiv);
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
    contentEl.innerHTML = `
      <div class="changelog-version latest">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.10.0</span>
          <span class="changelog-version-date">2026-08-25</span>
          <span class="changelog-badge latest-badge">最新</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">⚡ 选中文本浮窗 + 一键页面摘要</h5>
          <ul>
            <li><strong>选中文本浮窗按钮</strong> - 在网页选中文本时，光标旁自动弹出品牌绿AI小按钮，点击直接发送给侧边栏AI解释</li>
            <li><strong>浮窗交互</strong> - 悬浮在选中文本上方，带毛玻璃质感，点击外部或滚动时自动隐藏</li>
            <li><strong>一键页面摘要</strong> - header新增摘要按钮，点击自动抓取页面正文并生成结构化摘要（核心主题/关键要点/重要数据/行动建议）</li>
            <li><strong>摘要Prompt</strong> - 预设4段式摘要模板，AI输出结构化结果，快速浏览长文档</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.9.1</span>
          <span class="changelog-version-date">2026-08-25</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">⚡ Placeholder 快捷键修正</h5>
          <ul>
            <li><strong>快捷键提示动态化</strong> - placeholder快捷键从硬编码改为动态读取配置</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.9.0</span>
          <span class="changelog-version-date">2026-08-25</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">⚡ 右键菜单AI操作</h5>
          <ul>
            <li><strong>选中文本右键AI</strong> - AI解释/翻译/总结/追问</li>
            <li><strong>自动打开侧边栏</strong> - 右键操作自动唤起</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.8.3</span>
          <span class="changelog-version-date">2026-08-25</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">⚡ Header布局紧凑化</h5>
          <ul>
            <li><strong>Header紧凑化</strong> - 按钮缩小，修复溢出问题</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.8.2</span>
          <span class="changelog-version-date">2026-08-25</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">⚡ 快捷入口面板优化</h5>
          <ul>
            <li><strong>图片图标上传</strong> - 支持上传真实图片，替代Emoji</li>
            <li><strong>精致默认图标</strong> - 未上传时使用SVG链接图标</li>
            <li><strong>面板紧凑化</strong> - 缩小至280px宽</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.8.1</span>
          <span class="changelog-version-date">2026-08-25</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">⚡ 快捷入口弹出面板</h5>
          <ul>
            <li><strong>弹出面板交互</strong> - header按钮触发，点击外部自动关闭</li>
            <li><strong>Chrome书签导入</strong> - 浏览书签并一键添加</li>
            <li><strong>面板内管理</strong> - 底部「管理」按钮进入删除模式</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.8.0</span>
          <span class="changelog-version-date">2026-08-25</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">⚡ 应用快捷入口</h5>
          <ul>
            <li><strong>快捷入口网格</strong> - 预置8个企业常用入口，点击在新标签页打开</li>
            <li><strong>自定义管理</strong> - 支持添加/删除/排序快捷入口，自定义名称、URL和Emoji图标</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.7.0</span>
          <span class="changelog-version-date">2026-08-25</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">💼 对话历史 + 待办聚合</h5>
          <ul>
            <li><strong>对话历史管理</strong> - 自动保存对话、搜索、恢复继续聊、管理历史会话</li>
            <li><strong>我的待办聚合</strong> - 首页展示OA待办卡片，支持配置接口自动拉取</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.6.3</span>
          <span class="changelog-version-date">2026-08-23</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">🎨 深色主题重设计</h5>
          <ul>
            <li><strong>石墨灰配色</strong> - 背景从纯黑(#050714)调整为中性石墨灰(#131416)，更接近 macOS 深色模式质感</li>
            <li><strong>光晕大幅柔和</strong> - 品牌绿光晕透明度从 0.35 降到 0.08，不再像霓虹灯一样刺眼</li>
            <li><strong>玻璃层更通透</strong> - 白色透明度从 0.06 降到 0.035，边框更细腻(0.07)，整体更克制高级</li>
            <li><strong>文字层次优化</strong> - 主文字用 #F5F5F7（Apple 标准白），次要文字 60%、三级文字 38%，层次更自然</li>
            <li><strong>品牌绿小面积点缀</strong> - 仅在 logo、发送按钮、就绪点等小面积使用绿色，不喧宾夺主</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.6.1</span>
          <span class="changelog-version-date">2026-08-23</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">✨ 更新完成体验优化</h5>
          <ul>
            <li><strong>更新窗口自动关闭</strong> - 热更新完成后显示成功提示，3 秒后自动关闭窗口</li>
            <li><strong>自动跳转扩展管理页</strong> - 更新完成后自动打开（或聚焦已打开的）chrome://extensions/ 页面</li>
            <li><strong>成功横幅提示</strong> - 侧边栏顶部显示更新成功横幅，引导点击 ↻ 刷新完成更新</li>
            <li><strong>一键刷新扩展</strong> - 横幅内置「↻ 一键刷新扩展」按钮</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.6.0</span>
          <span class="changelog-version-date">2026-08-23</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">✨ 新功能</h5>
          <ul>
            <li><strong>自动检测新版本</strong> - 每次打开助手时自动静默检查 GitHub Release，1小时内不重复检查（避免频繁请求）</li>
            <li><strong>头部更新图标提示</strong> - 发现新版本时，头部显示下载箭头图标 + 红色闪烁小圆点，呼吸动画吸引注意力；点击图标直接跳转到「关于与更新」并开始检查</li>
            <li><strong>无新版本时不显示版本号</strong> - 头部不再常驻版本号徽章，界面更简洁；只有检测到更新时才显示提示图标</li>
            <li><strong>跨会话记忆</strong> - 已发现但未更新的版本会缓存在 localStorage，下次打开时直接显示图标，无需再次等待网络</li>
            <li><strong>更新后自动隐藏</strong> - 升级完成或开始热更新后，图标立即消失</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.5.9</span>
          <span class="changelog-version-date">2026-08-22</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">✨ 新功能</h5>
          <ul>
            <li><strong>AI 回答一键复制</strong> - 鼠标悬停在 AI 回答气泡上时，右上角显示复制按钮，点击即可复制 Markdown 原文到剪贴板，复制后显示绿色对勾反馈</li>
            <li><strong>液态玻璃风格</strong> - 复制按钮采用与整体一致的玻璃质感与悬停高亮，深浅色主题自适应</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.5.8</span>
          <span class="changelog-version-date">2026-08-21</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">✨ 新功能</h5>
          <ul>
            <li><strong>输入框提示语轮换</strong> - 输入框 placeholder 每 3.5 秒自动切换不同提示语，引导用户发现各种功能（如「试试问我走哪个流程」「支持快捷键 Ctrl+M」等）</li>
            <li><strong>淡入动画</strong> - 切换时有淡出再淡入的过渡效果</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.5.7</span>
          <span class="changelog-version-date">2026-08-21</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">✨ 新功能</h5>
          <ul>
            <li><strong>Header 版本号小标签</strong> - 侧边栏顶部右侧新增版本号徽章</li>
            <li><strong>更新 Toast 提示</strong> - 热更新后自动显示"🎉 已更新到 vX.X.X"浮动提示</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.5.6</span>
          <span class="changelog-version-date">2026-08-21</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">🔥 紧急修复</h5>
          <ul>
            <li><strong>修复热更新文件写入损坏</strong> - 修复热更新后CSS/JS文件被写坏导致Chrome报"不是UTF-8编码"的严重bug</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.5.5</span>
          <span class="changelog-version-date">2026-08-21</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">✨ 体验优化</h5>
          <ul>
            <li><strong>修复打开时黑屏闪烁</strong> - 彻底解决唤起助手时侧边栏短暂黑屏的问题</li>
            <li><strong>iframe淡入加载</strong> - iframe完全加载后才显示，避免加载过程中的内容闪烁</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.5.4</span>
          <span class="changelog-version-date">2026-08-21</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">🐛 Bug 修复</h5>
          <ul>
            <li><strong>修复热更新窗口卡住问题</strong> - 解决热更新弹窗停留在步骤2"等待中"无响应的问题。原因是自动打开的窗口缺少用户手势，DirectoryHandle.requestPermission() 无法弹出授权对话框导致 Promise 永久挂起</li>
            <li><strong>增加"开始更新"按钮</strong> - 已授权用户打开更新窗口后，需点击「开始更新」按钮才执行下载，确保权限检查在用户手势上下文中执行</li>
            <li><strong>权限检查超时保护</strong> - queryPermission/requestPermission 添加 5s/10s 超时，避免永久挂起</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.5.3</span>
          <span class="changelog-version-date">2026-08-21</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">⌨️ 快捷键优化</h5>
          <ul>
            <li><strong>Windows 默认快捷键改为 Ctrl+M</strong> - 打开/关闭助手改为 Ctrl+M，分析页面改为 Ctrl+Shift+M，避免与浏览器常用快捷键冲突</li>
            <li><strong>快捷键提示动态更新</strong> - 修改快捷键后，左下角提示文字实时同步变化，不再硬编码显示 J 键</li>
            <li><strong>平台自适应默认快捷键</strong> - Mac 保持 ⌘J/⌘⇧J，Windows 用 Ctrl+M/Ctrl+Shift+M</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.5.2</span>
          <span class="changelog-version-date">2026-08-21</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">🚀 热更新全面升级</h5>
          <ul>
            <li><strong>真正的全自动热更新</strong> - 检测到新版本后自动打开更新窗口、下载ZIP、解压覆盖、重载扩展，全程无需用户干预</li>
            <li><strong>改用 GitHub Release ZIP 下载</strong> - 替换 jsDelivr CDN 逐文件下载方案，直接下载完整 ZIP 包并解压，更稳定可靠</li>
            <li><strong>内置 ZIP 解析器</strong> - 纯 JavaScript 实现 ZIP 格式解析和 deflate 解压，无需第三方库</li>
            <li><strong>真实下载进度</strong> - 显示下载百分比、已下载大小和总大小</li>
            <li><strong>跳过更新弹窗</strong> - 热更新已启用时不再显示弹窗让用户选择，直接开始更新</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.5.1</span>
          <span class="changelog-version-date">2026-08-21</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">🐛 Bug 修复</h5>
          <ul>
            <li><strong>修复热更新授权状态不刷新</strong> - 授权目录成功后，关于页面实时更新为"热更新已启用"，无需手动刷新</li>
            <li><strong>修复关闭窗口按钮无效</strong> - 修复 Chrome 扩展 CSP 禁止内联 onclick 导致"关闭窗口"按钮无反应的问题</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.5.0</span>
          <span class="changelog-version-date">2026-08-21</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">🆕 新功能</h5>
          <ul>
            <li><strong>leaprag 工作流管理</strong> - 全新设计的 leaprag 设置页，支持跳转内部平台、预配置协同办公工作流、用户自定义添加工作流</li>
            <li><strong>多工作流支持</strong> - 用户可在 leaprag 平台创建工作流后，填入应用ID和API Key即可使用，支持设为默认、删除</li>
            <li><strong>品牌升级</strong> - 全面去除 FastGPT 字样，统一为 leaprag 品牌</li>
          </ul>
          <h5 style="margin:8px 0 4px;color:var(--text-primary)">🐛 Bug 修复</h5>
          <ul>
            <li>修复 Service Worker 中 screen 未定义导致热更新窗口无法打开的问题</li>
            <li>修复 zip 包结构，解压后自动生成 extension 目录</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.4.1</span>
          <span class="changelog-version-date">2026-08-21</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">🐛 Bug 修复</h5>
          <ul>
            <li><strong>修复热更新报错</strong> - 解决 iframe 中无法调用 showDirectoryPicker 的问题（Chrome安全限制：第三方iframe禁止打开文件选择器）</li>
            <li>改为通过 background service worker 打开独立 popup 窗口（chrome-extension:// 第一方上下文），在独立窗口中完成目录选择、文件下载、覆盖写入和自动重载</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.4.0</span>
          <span class="changelog-version-date">2026-08-21</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">🆕 新功能</h5>
          <ul>
            <li><strong>真正的热更新！</strong> - 基于 File System Access API，首次选择 extension 目录授权后，后续更新只需点击「一键热更新」，自动下载最新文件覆盖本地目录并重载扩展，无需手动解压覆盖</li>
            <li><strong>热更新状态管理</strong> - 关于页面显示热更新状态，支持开启/关闭</li>
            <li><strong>更新弹窗热更新按钮</strong> - 发现新版本时，弹窗中同时显示「一键热更新」和「手动下载ZIP」两个选项</li>
          </ul>
          <h5 style="margin:16px 0 8px;color:var(--text-primary)">🔧 技术实现</h5>
          <ul>
            <li>使用 IndexedDB 持久化存储 DirectoryHandle，重启后自动恢复</li>
            <li>从 jsDelivr CDN 逐个下载文件并写入本地目录</li>
            <li>通过 chrome.runtime.reload() 实现更新后自动重载</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.3.2</span>
          <span class="changelog-version-date">2026-08-20</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">🔧 改进优化</h5>
          <ul>
            <li>补全更新日志内容，完整显示v1.0.0到最新版本的历史更新</li>
            <li>优化更新日志UI：最新版本高亮卡片 + 「最新」徽章</li>
            <li>更新检查弹窗默认版本号显示同步到最新</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.3.1</span>
          <span class="changelog-version-date">2026-08-20</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">🆕 新功能</h5>
          <ul>
            <li><strong>一键自动更新</strong> - 点击「检查更新」按钮自动检测新版本，真实下载进度显示，清晰3步引导完成更新</li>
            <li><strong>macOS/Windows 更新脚本</strong> - 双击 .command/.bat 文件一键下载并覆盖更新</li>
          </ul>
          <h5 style="margin:16px 0 8px;color:var(--text-primary)">🔧 改进优化</h5>
          <ul>
            <li>使用 fetch + ReadableStream 实现真实下载进度（百分比/已下载大小/总大小）</li>
            <li>优化更新安装指引UI：编号步骤 + 「忘了extension在哪？」辅助按钮</li>
            <li>fetch失败自动降级为浏览器直接下载，保证可用性</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.3.0</span>
          <span class="changelog-version-date">2026-08-20</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">⚡ 流式输出</h5>
          <ul>
            <li><strong>思考过程流式输出</strong> - 参考 WorkBuddy 等平台，AI思考过程实时流式显示，不再等待思考完成才输出</li>
            <li><strong>回复内容流式输出</strong> - AI回复内容逐字实时渲染，打字机效果体验</li>
            <li><strong>双模型流式支持</strong> - 主AI模型（Agnes）和 leaprag-工作流均支持流式输出</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.2.x 系列</span>
          <span class="changelog-version-date">2026-08</span>
        </div>
        <div class="changelog-version-content">
          <h5 style="margin:0 0 8px;color:var(--text-primary)">🆕 功能迭代</h5>
          <ul>
            <li><strong>多标签页分析</strong> - 支持同时选择多个标签页内容进行综合分析</li>
            <li><strong>提示词收藏夹</strong> - 保存常用提示词，一键复用</li>
            <li><strong>快捷键自定义</strong> - 支持自定义唤起和快速分析快捷键</li>
            <li><strong>智能推荐问题</strong> - 基于页面内容动态生成个性化推荐</li>
            <li><strong>历史消息迁移</strong> - 右键菜单支持将历史消息移到当前对话</li>
            <li><strong>OA流程查询</strong> - 一键查看所有可发起的审批流程</li>
            <li><strong>文件上传支持</strong> - 支持上传文件作为对话上下文</li>
            <li><strong>深色/浅色主题切换</strong> - 跟随系统或手动切换</li>
          </ul>
          <h5 style="margin:16px 0 8px;color:var(--text-primary)">🔧 优化修复</h5>
          <ul>
            <li>优化AI意图识别准确率</li>
            <li>优化卡片UI和视觉效果</li>
            <li>修复多个已知问题，提升稳定性</li>
          </ul>
        </div>
      </div>

      <div class="changelog-version">
        <div class="changelog-version-header">
          <span class="changelog-version-number">v1.1.0</span>
          <span class="changelog-version-date">2026-01-10</span>
        </div>
        <div class="changelog-version-content">
          <ul>
            <li>智能推荐问题 - 基于页面内容动态生成个性化推荐</li>
            <li>历史消息迁移 - 右键菜单支持将历史消息移到当前对话</li>
            <li>标签页绿色标注 - 选择多标签时显示视觉标识</li>
            <li>OA流程查询 - 一键查看所有可发起的审批流程</li>
            <li>在线自动更新 - 支持自动检测新版本</li>
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
            <li>leaprag-工作流集成</li>
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

// ========== 应用快捷入口（弹出面板） ==========

const QA_STORAGE_KEY = 'leap_quick_access';
const QA_DEFAULT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
const QA_DEFAULTS = [
  { name: 'OA系统', url: 'http://oa.leapmotor.com', img: null },
  { name: 'AI平台', url: 'https://ai.leapmotor.com', img: null },
  { name: '项目管理', url: 'https://lppms.leapmotor.com', img: null },
  { name: '知识库', url: 'https://ai.leapmotor.com/knowledge', img: null },
  { name: '企业邮箱', url: 'https://mail.leapmotor.com', img: null },
  { name: 'GitHub', url: 'https://github.com/905442346-art/leapmotor-ai-assistant', img: null },
  { name: '模型广场', url: 'https://ai.leapmotor.com/settings/model-square', img: null },
  { name: '流程查询', url: 'https://lppms.leapmotor.com', img: null }
];

let qaManageMode = false;
let qaPendingImage = null;

function loadQuickAccess() {
  try {
    const raw = localStorage.getItem(QA_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) { /* fallthrough */ }
  return JSON.parse(JSON.stringify(QA_DEFAULTS));
}

function saveQuickAccess(list) {
  localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(list));
}

function renderQuickAccessGrid() {
  const grid = document.getElementById('qaPanelGrid');
  if (!grid) return;
  const list = loadQuickAccess();
  grid.innerHTML = list.map((item, idx) => {
    const iconHtml = item.img
      ? `<img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" />`
      : QA_DEFAULT_SVG;
    return `
    <div class="qa-grid-item ${qaManageMode ? 'manage-mode' : ''}" data-idx="${idx}" data-url="${escapeHtml(item.url)}" title="${escapeHtml(item.name)}">
      <div class="qa-grid-item-icon">${iconHtml}</div>
      <div class="qa-grid-item-name">${escapeHtml(item.name)}</div>
      ${qaManageMode ? `<button class="qa-grid-item-delete" data-idx="${idx}" title="删除">×</button>` : ''}
    </div>`;
  }).join('');

  grid.querySelectorAll('.qa-grid-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (qaManageMode) return;
      if (e.target.classList.contains('qa-grid-item-delete')) return;
      const url = el.dataset.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  grid.querySelectorAll('.qa-grid-item-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      const list = loadQuickAccess();
      list.splice(idx, 1);
      saveQuickAccess(list);
      renderQuickAccessGrid();
    });
  });
}

function toggleQuickAccessPanel() {
  const panel = document.getElementById('quickAccessPanel');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    renderQuickAccessGrid();
  }
}

function closeQuickAccessPanel() {
  const panel = document.getElementById('quickAccessPanel');
  if (panel) panel.classList.add('hidden');
}

function toggleQaAddForm() {
  const form = document.getElementById('qaAddForm');
  const bookmarkList = document.getElementById('qaBookmarkList');
  const addBtn = document.getElementById('qaAddToggleBtn');
  const importBtn = document.getElementById('qaImportBookmarksBtn');
  if (!form) return;
  form.classList.toggle('hidden');
  bookmarkList.classList.add('hidden');
  importBtn.classList.remove('active');
  qaPendingImage = null;
  if (form.classList.contains('hidden')) {
    addBtn.classList.remove('active');
    const nameInput = document.getElementById('qaName');
    const urlInput = document.getElementById('qaUrl');
    const imageName = document.getElementById('qaImageName');
    const uploadBtn = document.querySelector('.qa-upload-btn');
    if (nameInput) nameInput.value = '';
    if (urlInput) urlInput.value = '';
    if (imageName) imageName.textContent = '图标';
    if (uploadBtn) uploadBtn.classList.remove('has-image');
  } else {
    addBtn.classList.add('active');
    document.getElementById('qaName')?.focus();
  }
}

function toggleQaManageMode() {
  qaManageMode = !qaManageMode;
  const btn = document.getElementById('qaManageToggleBtn');
  const hint = document.querySelector('.qa-footer-hint');
  if (qaManageMode) {
    btn.textContent = '完成';
    btn.classList.add('active');
    if (hint) hint.textContent = '点击 × 删除';
  } else {
    btn.textContent = '管理';
    btn.classList.remove('active');
    if (hint) hint.textContent = '点击打开';
  }
  renderQuickAccessGrid();
}

function handleQaImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 51200) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        qaPendingImage = canvas.toDataURL('image/png');
        const imageName = document.getElementById('qaImageName');
        const uploadBtn = document.querySelector('.qa-upload-btn');
        if (imageName) imageName.textContent = file.name.substring(0, 10);
        if (uploadBtn) uploadBtn.classList.add('has-image');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    const reader = new FileReader();
    reader.onload = (ev) => {
      qaPendingImage = ev.target.result;
      const imageName = document.getElementById('qaImageName');
      const uploadBtn = document.querySelector('.qa-upload-btn');
      if (imageName) imageName.textContent = file.name.substring(0, 10);
      if (uploadBtn) uploadBtn.classList.add('has-image');
    };
    reader.readAsDataURL(file);
  }
}

function handleQaAdd() {
  const nameInput = document.getElementById('qaName');
  const urlInput = document.getElementById('qaUrl');
  if (!nameInput || !urlInput) return;
  const name = nameInput.value.trim();
  const url = urlInput.value.trim();
  if (!name || !url) return;
  let normalizedUrl = url;
  if (!/^https?:\/\//.test(normalizedUrl)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  const list = loadQuickAccess();
  list.push({ name, url: normalizedUrl, img: qaPendingImage });
  saveQuickAccess(list);
  nameInput.value = '';
  urlInput.value = '';
  qaPendingImage = null;
  const imageName = document.getElementById('qaImageName');
  const uploadBtn = document.querySelector('.qa-upload-btn');
  if (imageName) imageName.textContent = '图标';
  if (uploadBtn) uploadBtn.classList.remove('has-image');
  renderQuickAccessGrid();
  nameInput.focus();
}

function loadBookmarks() {
  const container = document.getElementById('qaBookmarkList');
  if (!container) return;
  container.innerHTML = '<div class="qa-bookmark-loading">正在加载...</div>';

  if (!chrome.bookmarks) {
    container.innerHTML = '<div class="qa-bookmark-loading">无法访问书签</div>';
    return;
  }

  chrome.bookmarks.getTree((tree) => {
    const bookmarks = [];
    function traverse(nodes) {
      for (const node of nodes) {
        if (node.url) {
          bookmarks.push({ title: node.title || node.url, url: node.url });
        }
        if (node.children) traverse(node.children);
      }
    }
    traverse(tree);

    if (bookmarks.length === 0) {
      container.innerHTML = '<div class="qa-bookmark-loading">未找到书签</div>';
      return;
    }

    const existingUrls = new Set(loadQuickAccess().map(a => a.url));

    container.innerHTML = bookmarks.slice(0, 80).map(b => {
      const added = existingUrls.has(b.url);
      let favicon = '';
      try {
        const u = new URL(b.url);
        favicon = `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
      } catch (e) { /* skip */ }
      return `
        <div class="qa-bookmark-item" data-title="${escapeHtml(b.title)}" data-url="${escapeHtml(b.url)}">
          <img class="qa-bookmark-icon" src="${escapeHtml(favicon)}" onerror="this.style.display='none'" />
          <span class="qa-bookmark-title">${escapeHtml(b.title)}</span>
          <svg class="qa-bookmark-add-btn" viewBox="0 0 24 24" fill="none" stroke="${added ? '#ccc' : 'var(--accent)'}" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.qa-bookmark-item').forEach(el => {
      el.addEventListener('click', () => {
        const url = el.dataset.url;
        const title = el.dataset.title;
        const existingUrls = new Set(loadQuickAccess().map(a => a.url));
        if (existingUrls.has(url)) return;
        let favicon = null;
        try {
          const u = new URL(url);
          favicon = `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
        } catch (e) { /* skip */ }
        const list = loadQuickAccess();
        list.push({ name: title.substring(0, 12), url, img: favicon });
        saveQuickAccess(list);
        renderQuickAccessGrid();
        const addIcon = el.querySelector('.qa-bookmark-add-btn');
        if (addIcon) addIcon.style.stroke = '#ccc';
      });
    });
  });
}

function toggleQaBookmarks() {
  const bookmarkList = document.getElementById('qaBookmarkList');
  const addForm = document.getElementById('qaAddForm');
  const importBtn = document.getElementById('qaImportBookmarksBtn');
  const addBtn = document.getElementById('qaAddToggleBtn');
  if (!bookmarkList) return;

  if (bookmarkList.classList.contains('hidden')) {
    bookmarkList.classList.remove('hidden');
    addForm.classList.add('hidden');
    importBtn.classList.add('active');
    addBtn.classList.remove('active');
    loadBookmarks();
  } else {
    bookmarkList.classList.add('hidden');
    importBtn.classList.remove('active');
  }
}

function initQuickAccessPanel() {
  const btn = document.getElementById('quickAccessBtn');
  const panel = document.getElementById('quickAccessPanel');
  if (!btn || !panel) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleQuickAccessPanel();
  });

  panel.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.addEventListener('click', (e) => {
    if (!panel.classList.contains('hidden') && !panel.contains(e.target) && e.target !== btn) {
      closeQuickAccessPanel();
    }
  });

  document.getElementById('qaAddToggleBtn')?.addEventListener('click', toggleQaAddForm);
  document.getElementById('qaImportBookmarksBtn')?.addEventListener('click', toggleQaBookmarks);
  document.getElementById('qaAddConfirmBtn')?.addEventListener('click', handleQaAdd);
  document.getElementById('qaManageToggleBtn')?.addEventListener('click', toggleQaManageMode);
  document.getElementById('qaImageFile')?.addEventListener('change', handleQaImageUpload);

  const nameInput = document.getElementById('qaName');
  const urlInput = document.getElementById('qaUrl');
  nameInput?.addEventListener('keydown', e => { if (e.key === 'Enter') handleQaAdd(); });
  urlInput?.addEventListener('keydown', e => { if (e.key === 'Enter') handleQaAdd(); });
}

document.addEventListener('DOMContentLoaded', init);
