if (window.__localAIAssistantInjected) {
} else {
  window.__localAIAssistantInjected = true;

  let sidebarIframe = null;
  let isSidebarOpen = false;
  let isDOMReady = document.readyState === 'complete' || document.readyState === 'interactive';

  // ========== 自定义快捷键管理 ==========
  // 平台自适应默认快捷键：Mac 用 Cmd+J/⌘⇧J，Windows/Linux 用 Ctrl+M/Ctrl+Shift+M
  const _isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.userAgent.includes('Macintosh');
  const DEFAULT_SHORTCUTS = _isMac
    ? { 'toggle-assistant': { key: 'j', ctrl: false, shift: false, alt: false, meta: true }, 'analyze-page': { key: 'j', ctrl: false, shift: true, alt: false, meta: true } }
    : { 'toggle-assistant': { key: 'm', ctrl: true, shift: false, alt: false, meta: false }, 'analyze-page': { key: 'm', ctrl: true, shift: true, alt: false, meta: false } };
  let customShortcuts = { ...DEFAULT_SHORTCUTS };

  /**
   * 更新快捷键配置（从sidebar接收）
   */
  function updateCustomShortcuts(newShortcuts) {
    if (newShortcuts) {
      customShortcuts = newShortcuts;
      console.log('[快捷键] 已更新全局快捷键:', customShortcuts);
    }
  }

  /**
   * 检查按键事件是否匹配快捷键配置
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
   * 全局键盘事件监听器
   * 在content script层面拦截，确保即使不在iframe内也能响应
   */
  function initGlobalKeyboardListener() {
    document.addEventListener('keydown', function(e) {
      // 如果在输入框中，不触发快捷键
      const target = e.target;
      const tag = target.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || target.isContentEditable;

      // 检查"打开/关闭助手"快捷键（输入框中也允许，方便快速唤起）
      if (matchShortcut(e, customShortcuts['toggle-assistant'])) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[快捷键] 触发: 打开/关闭助手');
        toggleSidebar();
        return false;
      }

      // 检查"分析页面"快捷键（输入框中不触发）
      if (!isInput && matchShortcut(e, customShortcuts['analyze-page'])) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[快捷键] 触发: 分析当前页面');
        if (!isSidebarOpen) {
          toggleSidebar();
        }
        setTimeout(() => {
          const content = extractPageContent();
          if (sidebarIframe) {
            sidebarIframe.contentWindow.postMessage({ type: 'AUTO_ANALYZE', content }, '*');
          }
        }, 500);
        return false;
      }
    }, true); // 使用捕获阶段，优先于页面其他监听器

    console.log('[快捷键] 全局键盘监听已初始化');
    console.log('[快捷键] 当前配置:', customShortcuts);
  }

  function extractPageContent() {
    const title = document.title;
    const url = window.location.href;
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    const mainContent = extractMainContent();
    const tables = extractTables();
    const lists = extractLists();
    const headings = extractHeadings();
    const links = extractImportantLinks();

    return {
      title,
      url,
      metaDescription,
      mainContent,
      tables,
      lists,
      headings,
      links,
      timestamp: new Date().toISOString()
    };
  }

  function extractMainContent() {
    const selectors = [
      'main', 'article', '[role="main"]', '#content', '.content', '#main', '.main'
    ];
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
        tr.querySelectorAll('th, td').forEach(cell => {
          cells.push(cleanText(cell.innerText));
        });
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
      if (items.length > 0 && items.length < 50) {
        lists.push({ type: list.tagName.toLowerCase(), items: items.slice(0, 30) });
      }
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
      if (text && href && !href.startsWith('javascript:') && text.length > 3) {
        links.push({ text: text.slice(0, 100), href });
      }
    });
    return links.slice(0, 20);
  }

  function cleanText(text) {
    return text.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim();
  }

  function ensureDOMReady() {
    return new Promise((resolve) => {
      if (isDOMReady) {
        resolve();
      } else {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
        setTimeout(resolve, 1000);
      }
    });
  }

  async function createSidebar() {
    if (sidebarIframe) return;
    if (document.getElementById('local-ai-assistant-sidebar')) {
      const existing = document.getElementById('local-ai-assistant-sidebar');
      sidebarIframe = existing;
      return;
    }

    await ensureDOMReady();

    sidebarIframe = document.createElement('iframe');
    sidebarIframe.id = 'local-ai-assistant-sidebar';
    sidebarIframe.src = chrome.runtime.getURL('sidebar/index.html');
    sidebarIframe.style.cssText = `
      position: fixed; top: 0; right: 0; width: 400px; height: 100vh;
      border: none; z-index: 2147483647; box-shadow: -8px 0 32px rgba(10,26,47,0.18);
      transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
      background: #F0F2F8; opacity: 0;
    `;
    // iframe加载完成后淡入，避免加载过程中的黑屏/白屏闪烁
    sidebarIframe.addEventListener('load', () => {
      requestAnimationFrame(() => {
        if (sidebarIframe) sidebarIframe.style.opacity = '1';
      });
    });
    document.body.appendChild(sidebarIframe);
    window.addEventListener('message', handleSidebarMessage);
  }

  async function toggleSidebar() {
    await createSidebar();
    if (!sidebarIframe) return;

    isSidebarOpen = !isSidebarOpen;
    if (isSidebarOpen) {
      setTimeout(() => {
        if (sidebarIframe) {
          sidebarIframe.style.transform = 'translateX(0)';
        }
      }, 50);
    } else {
      sidebarIframe.style.transform = 'translateX(100%)';
    }
  }

  function handleSidebarMessage(event) {
    if (!sidebarIframe) return;

    // 接收来自sidebar的快捷键配置更新
    if (event.data.type === 'UPDATE_SHORTCUTS') {
      updateCustomShortcuts(event.data.shortcuts);
      return;
    }

    // 处理标签页高亮/取消高亮请求
    if (event.data.type === 'HIGHLIGHT_TAB') {
      const shouldHighlight = event.data.highlight;
      if (shouldHighlight) {
        showTabHighlight();
      } else {
        hideTabHighlight();
      }
      return;
    }

    // 转发消息到 background.js
    if (event.data.type === 'SEND_TO_BACKGROUND' && event.data.backgroundMessage) {
      try {
        chrome.runtime.sendMessage(event.data.backgroundMessage, (response) => {
          if (chrome.runtime.lastError) {
            console.error('[转发到Background] 失败:', chrome.runtime.lastError.message);
          }
        });
      } catch (err) {
        console.error('[转发到Background] 错误:', err);
      }
      return;
    }

    if (event.data.type === 'CLOSE_SIDEBAR') {
      isSidebarOpen = false;
      sidebarIframe.style.transform = 'translateX(100%)';
    } else if (event.data.type === 'GET_PAGE_CONTENT') {
      const content = extractPageContent();
      sidebarIframe.contentWindow.postMessage({ type: 'PAGE_CONTENT', content }, '*');
    } else if (event.data.type === 'GET_TAB_INFO') {
      try {
        chrome.runtime.sendMessage({ type: 'GET_TAB_INFO' }, (response) => {
          if (chrome.runtime.lastError) {
            sidebarIframe.contentWindow.postMessage({
              type: 'TAB_INFO',
              tabInfo: { title: document.title, url: window.location.href }
            }, '*');
            return;
          }
          if (sidebarIframe && response) {
            sidebarIframe.contentWindow.postMessage({
              type: 'TAB_INFO',
              tabInfo: response.tabInfo
            }, '*');
          }
        });
      } catch (err) {
        sidebarIframe.contentWindow.postMessage({
          type: 'TAB_INFO',
          tabInfo: { title: document.title, url: window.location.href }
        }, '*');
      }
    } else if (event.data.type === 'GET_ALL_TABS') {
      try {
        chrome.runtime.sendMessage({ type: 'GET_ALL_TABS' }, (response) => {
          if (chrome.runtime.lastError) {
            sidebarIframe.contentWindow.postMessage({ type: 'ALL_TABS', tabs: [] }, '*');
            return;
          }
          if (sidebarIframe && response) {
            sidebarIframe.contentWindow.postMessage({ type: 'ALL_TABS', tabs: response.tabs || [] }, '*');
          }
        });
      } catch (err) {
        sidebarIframe.contentWindow.postMessage({ type: 'ALL_TABS', tabs: [] }, '*');
      }
    } else if (event.data.type === 'CAPTURE_TAB_CONTENT' && event.data.tabId) {
      const tabId = event.data.tabId;
      try {
        chrome.runtime.sendMessage({ type: 'CAPTURE_TAB_CONTENT', tabId }, (response) => {
          if (chrome.runtime.lastError) {
            sidebarIframe.contentWindow.postMessage({
              type: 'TAB_CONTENT_RESULT',
              tabId: tabId,
              error: chrome.runtime.lastError.message
            }, '*');
            return;
          }
          if (sidebarIframe && response) {
            sidebarIframe.contentWindow.postMessage({
              type: 'TAB_CONTENT_RESULT',
              tabId: tabId,
              content: response.content,
              error: response.error
            }, '*');
          }
        });
      } catch (err) {
        sidebarIframe.contentWindow.postMessage({
          type: 'TAB_CONTENT_RESULT',
          tabId: tabId,
          error: err.message
        }, '*');
      }
    } else if (event.data.type === 'GET_SCREENSHOT') {
      try {
        chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Screenshot error:', chrome.runtime.lastError);
            return;
          }
          if (sidebarIframe && response) {
            sidebarIframe.contentWindow.postMessage({
              type: 'SCREENSHOT', screenshot: response.screenshot
            }, '*');
          }
        });
      } catch (err) {
        console.log('Screenshot failed:', err);
      }
    }
  }

  // ========== 标签页绿色标注功能 ==========

  /**
   * 显示标签页绿色标注条（在页面顶部，模拟浏览器标签栏效果）
   */
  function showTabHighlight() {
    // 如果已存在，不重复创建
    if (document.getElementById('leapmotor-tab-highlight')) return;

    // 注入样式（如果尚未注入）
    injectTabHighlightStyles();

    // 创建标注条元素（极简设计，只显示细线）
    const highlightBar = document.createElement('div');
    highlightBar.id = 'leapmotor-tab-highlight';
    highlightBar.className = 'leapmotor-highlight-bar';
    highlightBar.innerHTML = ''; // 不显示额外内容，只保留线条

    document.body.appendChild(highlightBar);

    // 触发入场动画
    requestAnimationFrame(() => {
      highlightBar.classList.add('visible');
    });

    console.log('[标签高亮] ✅ 已显示绿色标注');
  }

  /**
   * 隐藏标签页绿色标注条
   */
  function hideTabHighlight() {
    const highlightBar = document.getElementById('leapmotor-tab-highlight');
    if (highlightBar) {
      highlightBar.classList.remove('visible');
      // 等待动画结束后移除
      setTimeout(() => {
        if (highlightBar.parentNode) {
          highlightBar.parentNode.removeChild(highlightBar);
        }
      }, 300);
      console.log('[标签高亮] 🚫 已隐藏绿色标注');
    }
  }

  /**
   * 注入标签页高亮的CSS样式（极简设计，模拟浏览器标签栏效果）
   */
  function injectTabHighlightStyles() {
    const styleId = 'leapmotor-tab-highlight-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* ========== 标签页绿色标注条（极简版）========== */
      .leapmotor-highlight-bar {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: 2px !important; /* 更细的线条 */
        background: #8FE040 !important; /* 纯零跑绿 */
        z-index: 2147483647 !important;
        opacity: 0 !important;
        transform: scaleY(0) !important;
        transform-origin: top center !important;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        box-shadow:
          0 0 8px rgba(143, 224, 64, 0.8),
          0 0 16px rgba(143, 224, 64, 0.5),
          0 2px 4px rgba(90, 154, 27, 0.3) !important;
        pointer-events: none !important;
      }

      .leapmotor-highlight-bar.visible {
        opacity: 1 !important;
        transform: scaleY(1) !important;
        animation: tabHighlightPulse 2s ease-in-out infinite !important;
      }

      /* 呼吸脉冲效果 - 模拟选中状态 */
      @keyframes tabHighlightPulse {
        0%, 100% {
          box-shadow:
            0 0 8px rgba(143, 224, 64, 0.8),
            0 0 16px rgba(143, 224, 64, 0.5),
            0 2px 4px rgba(90, 154, 27, 0.3);
          height: 2px;
        }
        50% {
          box-shadow:
            0 0 12px rgba(143, 224, 64, 1),
            0 0 24px rgba(143, 224, 64, 0.7),
            0 2px 6px rgba(90, 154, 27, 0.4);
          height: 3px;
        }
      }

      /* 入场动画 */
      .leapmotor-highlight-bar.animate-in {
        animation: highlightSlideDown 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
      }

      @keyframes highlightSlideDown {
        from {
          opacity: 0;
          transform: scaleY(0);
        }
        to {
          opacity: 1;
          transform: scaleY(1);
        }
      }

      /* 确保在所有页面都能正常显示 */
      html body > .leapmotor-highlight-bar:first-child {
        position: fixed !important;
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    // 处理来自background的高亮请求
    if (request.type === 'HIGHLIGHT_TAB_FROM_BG') {
      if (request.highlight) {
        showTabHighlight();
      } else {
        hideTabHighlight();
      }
      if (sendResponse) sendResponse({ success: true });
      return;
    }

    if (request.type === 'TOGGLE_ASSISTANT') {
      await toggleSidebar();
      if (sendResponse) sendResponse({ success: true });
    } else if (request.type === 'ANALYZE_PAGE') {
      if (!isSidebarOpen) await toggleSidebar();
      setTimeout(() => {
        const content = extractPageContent();
        if (sidebarIframe) {
          sidebarIframe.contentWindow.postMessage({ type: 'AUTO_ANALYZE', content }, '*');
        }
      }, 500);
      if (sendResponse) sendResponse({ success: true });
    }
    return true;
  });

  document.addEventListener('DOMContentLoaded', () => {
    isDOMReady = true;
    if (!sidebarIframe) createSidebar();
    // DOM 就绪后创建悬浮按钮（确保 body 存在）
    createFloatingButtonSafe();
  });

  if (isDOMReady) {
    createSidebar();
    // body 已存在时直接创建
    createFloatingButtonSafe();
  }

  // 初始化全局快捷键监听（在content script层面拦截）
  initGlobalKeyboardListener();
}

// ========== 悬浮按钮（Floating Action Button）==========
// 使用 var 避免TDZ问题（var会被提升到函数顶部）
var _fab_instance = null;  // 悬浮按钮DOM元素
var _fab_observer = null;   // MutationObserver实例

/**
 * 安全创建悬浮按钮 - 确保 document.body 存在
 */
function createFloatingButtonSafe() {
  if (document.body) {
    createFloatingButton();
  } else {
    // body 还不存在，等待下一次 DOM 更新
    setTimeout(createFloatingButtonSafe, 100);
  }
}

/**
 * 创建悬浮按钮 - 固定在页面右侧边缘
 * 用户可以随时点击打开/关闭AI助手侧边栏
 */
function createFloatingButton() {
  // 防止重复创建
  if (document.getElementById('leapmotor-floating-btn')) {
    _fab_instance = document.getElementById('leapmotor-floating-btn');
    return;
  }

  // 确保 body 存在
  if (!document.body) {
    console.warn('[悬浮按钮] document.body 不存在，稍后重试');
    setTimeout(createFloatingButton, 200);
    return;
  }

  try {
    // 断开旧的observer（如果存在）
    if (_fab_observer) {
      _fab_observer.disconnect();
      _fab_observer = null;
    }

    // 创建按钮容器
    _fab_instance = document.createElement('div');
    _fab_instance.id = 'leapmotor-floating-btn';
    _fab_instance.innerHTML = `
      <div class="floating-btn-inner">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <line x1="8" y1="10" x2="16" y2="10"/>
          <line x1="8" y1="14" x2="12" y2="14"/>
        </svg>
      </div>
      <div class="floating-btn-tooltip">零跑AI助手</div>
    `;

    // 注入样式（在添加到 DOM 之前注入，确保样式生效）
    injectFloatingButtonStyles();

    // 添加到页面
    document.body.appendChild(_fab_instance);

    // 绑定点击事件
    _fab_instance.addEventListener('click', handleFloatingButtonClick);

    // 鼠标悬停效果
    _fab_instance.addEventListener('mouseenter', () => {
      if (_fab_instance) _fab_instance.classList.add('hover');
    });

    _fab_instance.addEventListener('mouseleave', () => {
      if (_fab_instance) _fab_instance.classList.remove('hover');
    });

    // 监视按钮是否被页面移除，如果被移除则重新创建
    _fab_observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          // 使用ID检查而非引用比较（避免闭包问题）
          if (node.id === 'leapmotor-floating-btn' || node === _fab_instance) {
            console.warn('[悬浮按钮] 被页面移除，正在重新创建');
            if (_fab_observer) {
              _fab_observer.disconnect();
              _fab_observer = null;
            }
            _fab_instance = null; // 清空引用
            setTimeout(createFloatingButton, 500);
          }
        });
      });
    });

    if (_fab_observer && document.body) {
      _fab_observer.observe(document.body, { childList: true });
    }

    console.log('[悬浮按钮] ✅ 已初始化并添加到页面');
  } catch (e) {
    console.error('[悬浮按钮] ❌ 创建失败:', e.message || e);
  }
}

/**
 * 悬浮按钮点击处理 - 完全自包含，不依赖外部函数
 */
function handleFloatingButtonClick(e) {
  e.preventDefault();
  e.stopPropagation();

  // ========== 直接操作侧边栏（不调用任何外部函数）==========
  try {
    // 查找或获取侧边栏iframe
    let sidebar = document.getElementById('local-ai-assistant-sidebar');

    // 如果不存在，创建它
    if (!sidebar) {
      console.log('[悬浮按钮] 创建侧边栏...');
      sidebar = document.createElement('iframe');
      sidebar.id = 'local-ai-assistant-sidebar';
      sidebar.src = chrome.runtime.getURL('sidebar/index.html');
      sidebar.style.cssText = `
        position: fixed; top: 0; right: 0; width: 400px; height: 100vh;
        border: none; z-index: 2147483647;
        box-shadow: -8px 0 32px rgba(10,26,47,0.18);
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
        background: #F0F2F8; opacity: 0;
      `;
      // iframe加载完成后淡入，避免黑屏闪烁
      sidebar.addEventListener('load', () => {
        requestAnimationFrame(() => {
          if (sidebar) sidebar.style.opacity = '1';
        });
      });
      document.body.appendChild(sidebar);

      // 延迟打开（等待iframe加载）
      setTimeout(() => {
        if (sidebar && sidebar.style.transform !== 'translateX(0)') {
          sidebar.style.transform = 'translateX(0)';
        }
      }, 150);

      console.log('[悬浮按钮] ✅ 已创建并打开侧边栏');
    } else {
      // 已存在，切换显示/隐藏
      const isOpen = sidebar.style.transform === 'translateX(0)' || sidebar.style.transform === '';

      if (isOpen) {
        // 关闭
        sidebar.style.transform = 'translateX(100%)';
        console.log('[悬浮按钮] 🚪 已关闭侧边栏');
      } else {
        // 打开
        sidebar.style.transform = 'translateX(0)';
        console.log('[悬浮按钮] ✅ 已打开侧边栏');
      }
    }
  } catch (err) {
    console.error('[悬浮按钮] ❌ 操作失败:', err.message || err);
  }

  // 按钮动画反馈（安全访问）
  if (_fab_instance) {
    _fab_instance.classList.add('clicked');
    setTimeout(() => {
      if (_fab_instance) _fab_instance.classList.remove('clicked');
    }, 300);
  }
}

/**
 * 注入悬浮按钮样式 - 液态玻璃科幻风格
 * 与插件主界面（sidebar）保持一致的设计语言
 */
function injectFloatingButtonStyles() {
  const styleId = 'leapmotor-floating-btn-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* ========== 悬浮按钮容器 ========== */
    #leapmotor-floating-btn {
      position: fixed !important;
      top: 50% !important;
      right: 0 !important;
      transform: translateY(-50%) translateX(15px) !important;
      z-index: 2147483646 !important;
      cursor: pointer !important;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      pointer-events: auto !important;
      visibility: visible !important;
      opacity: 1 !important;
      display: block !important;
    }

    /* 默认状态：半隐藏在右侧边缘，露出呼吸光晕 */
    #leapmotor-floating-btn:not(:hover) {
      transform: translateY(-50%) translateX(15px) !important;
    }

    #leapmotor-floating-btn:not(:hover) .floating-btn-inner {
      animation: leapmotor-fab-breathe 3s ease-in-out infinite !important;
    }

    /* 悬停状态：滑出显示完整按钮 */
    #leapmotor-floating-btn:hover {
      transform: translateY(-50%) translateX(0) !important;
    }

    #leapmotor-floating-btn:hover .floating-btn-inner {
      animation: none !important;
    }

    /* 呼吸动画 - 让按钮更容易被发现 */
    @keyframes leapmotor-fab-breathe {
      0%, 100% { 
        box-shadow: 0 0 8px rgba(143, 224, 64, 0.4), 0 8px 32px rgba(90, 154, 27, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }
      50% { 
        box-shadow: 0 0 24px rgba(143, 224, 64, 0.8), 0 8px 32px rgba(90, 154, 27, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }
    }

    /* 点击反馈 */
    #leapmotor-floating-btn:active,
    #leapmotor-floating-btn.clicked {
      transform: translateY(-50%) scale(0.92) translateX(0);
    }

    /* ========== 液态玻璃按钮主体 ========== */
    .floating-btn-inner {
      width: 52px;
      height: 52px;
      background: linear-gradient(
        135deg,
        rgba(90, 154, 27, 0.85) 0%,
        rgba(143, 224, 64, 0.75) 50%,
        rgba(0, 212, 255, 0.65) 100%
      );
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border-radius: 16px 0 0 16px;
      border: 1px solid rgba(143, 224, 64, 0.4);
      border-right: none;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      position: relative;
      overflow: hidden;
      box-shadow:
        /* 外层阴影 */
        0 8px 32px rgba(90, 154, 27, 0.35),
        0 2px 8px rgba(0, 0, 0, 0.15),
        /* 内部高光 */
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* 玻璃光泽层 */
    .floating-btn-inner::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.25) 0%,
        transparent 100%
      );
      border-radius: 16px 0 0 0;
      pointer-events: none;
    }

    /* 动态光晕背景动画 */
    .floating-btn-inner::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(
        circle at center,
        rgba(143, 224, 64, 0.3) 0%,
        transparent 60%
      );
      animation: floatGlow 4s ease-in-out infinite;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
    }

    /* 悬停时的增强效果 */
    #leapmotor-floating-btn:hover .floating-btn-inner {
      background: linear-gradient(
        135deg,
        rgba(109, 181, 40, 0.95) 0%,
        rgba(159, 232, 90, 0.9) 50%,
        rgba(0, 212, 255, 0.8) 100%
      );
      box-shadow:
        0 12px 40px rgba(90, 154, 27, 0.5),
        0 4px 12px rgba(0, 0, 0, 0.2),
        0 0 30px rgba(143, 224, 64, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
      transform: scale(1.08);
    }

    #leapmotor-floating-btn:hover .floating-btn-inner::after {
      opacity: 1;
    }

    /* 点击时的按下效果 */
    #leapmotor-floating-btn.clicked .floating-btn-inner {
      background: linear-gradient(
        135deg,
        rgba(74, 138, 27, 0.95) 0%,
        rgba(127, 208, 48, 0.9) 100%
      );
      box-shadow:
        0 4px 16px rgba(90, 154, 27, 0.4),
        inset 0 2px 4px rgba(0, 0, 0, 0.2);
      transform: scale(0.92);
    }

    /* 图标SVG样式 */
    .floating-btn-inner svg {
      width: 26px;
      height: 26px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      transition: transform 0.3s ease;
      position: relative;
      z-index: 1;
    }

    #leapmotor-floating-btn:hover .floating-btn-inner svg {
      transform: scale(1.1) rotate(-3deg);
    }

    #leapmotor-floating-btn.clicked .floating-btn-inner svg {
      transform: scale(0.9);
    }

    /* ========== Tooltip 提示框（液态玻璃风格）========== */
    .floating-btn-tooltip {
      position: absolute;
      right: 64px;
      top: 50%;
      transform: translateY(-50%) translateX(10px);
      background: linear-gradient(
        135deg,
        rgba(5, 7, 20, 0.95) 0%,
        rgba(20, 25, 40, 0.92) 100%
      );
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      color: #fff;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.02em;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(143, 224, 64, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(143, 224, 64, 0.35);
      border-right: none;
    }

    /* Tooltip 三角箭头 */
    .floating-btn-tooltip::after {
      content: '';
      position: absolute;
      right: -8px;
      top: 50%;
      transform: translateY(-50%);
      width: 14px;
      height: 14px;
      background: linear-gradient(
        135deg,
        rgba(5, 7, 20, 0.95) 0%,
        rgba(20, 25, 40, 0.92) 100%
      );
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(143, 224, 64, 0.35);
      border-right: 1px solid rgba(143, 224, 64, 0.35);
      clip-path: polygon(0 0, 100% 50%, 0 100%);
    }

    /* 悬停时显示tooltip */
    #leapmotor-floating-btn:hover .floating-btn-tooltip {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }

    /* ========== 科幻脉冲动画 ========== */
    @keyframes floatGlow {
      0%, 100% {
        opacity: 0;
        transform: rotate(0deg) scale(0.8);
      }
      50% {
        opacity: 1;
        transform: rotate(180deg) scale(1.2);
      }
    }

    /* 呼吸光环动画 */
    @keyframes floatingPulse {
      0%, 100% {
        box-shadow:
          0 8px 32px rgba(90, 154, 27, 0.35),
          0 0 0 0 rgba(143, 224, 64, 0.4),
          0 0 0 0 rgba(0, 212, 255, 0.2);
      }
      33% {
        box-shadow:
          0 8px 32px rgba(90, 154, 27, 0.35),
          0 0 0 6px rgba(143, 224, 64, 0.2),
          0 0 12px rgba(0, 212, 255, 0.15);
      }
      66% {
        box-shadow:
          0 8px 32px rgba(90, 154, 27, 0.35),
          0 0 0 10px rgba(143, 224, 64, 0.1),
          0 0 20px rgba(0, 212, 255, 0.1);
      }
    }

    /* 未悬停时持续脉冲 */
    #leapmotor-floating-btn:not(:hover) .floating-btn-inner {
      animation: floatingPulse 3s ease-in-out infinite;
    }

    /* 悬停时停止脉冲，改用光晕旋转 */
    #leapmotor-floating-btn:hover .floating-btn-inner {
      animation: none;
    }

    /* ========== 响应式适配 ========== */
    @media (max-width: 768px) {
      #leapmotor-floating-btn {
        transform: translateY(-50%) translateX(6px);
      }

      #leapmotor-floating-btn:hover {
        transform: translateY(-50%) translateX(0);
      }

      .floating-btn-inner {
        width: 46px;
        height: 46px;
        border-radius: 14px 0 0 14px;
      }

      .floating-btn-inner svg {
        width: 22px;
        height: 22px;
      }

      .floating-btn-tooltip {
        display: none; /* 移动端不显示tooltip */
      }
    }

    /* ========== 侧边栏打开时的智能避让 ========== */
    body.leapmotor-sidebar-open #leapmotor-floating-btn {
      transform: translateY(-50%) translateX(400px);
      opacity: 0.6;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    body.leapmotor-sidebar-open #leapmotor-floating-btn:hover {
      opacity: 1;
      transform: translateY(-50%) translateX(388px);
    }

    body.leapmotor-sidebar-open #leapmotor-floating-btn .floating-btn-inner {
      background: linear-gradient(
        135deg,
        rgba(74, 138, 27, 0.9) 0%,
        rgba(127, 208, 48, 0.85) 100%
      );
      animation: none; /* 侧边栏打开时停止脉冲 */
    }

    /* ========== 深色模式优化（如果页面是深色的）========== */
    @media (prefers-color-scheme: dark) {
      .floating-btn-tooltip {
        background: linear-gradient(
          135deg,
          rgba(10, 15, 30, 0.98) 0%,
          rgba(25, 30, 50, 0.96) 100%
        );
        border-color: rgba(143, 224, 64, 0.5);
      }

      .floating-btn-tooltip::after {
        background: linear-gradient(
          135deg,
          rgba(10, 15, 30, 0.98) 0%,
          rgba(25, 30, 50, 0.96) 100%
        );
        border-color: rgba(143, 224, 64, 0.5);
      }
    }
  `;

  (document.head || document.documentElement).appendChild(style);
}
