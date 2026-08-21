/**
 * 主题预初始化脚本 - 在 CSS 加载前同步执行，防止深色/浅色闪烁
 * 必须放在 <link rel="stylesheet" href="style.css"> 之前
 */
(function() {
  try {
    var theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    // 设置 body 背景色防止 iframe 初始空白/黑屏
    document.documentElement.style.background = theme === 'dark' ? '#050714' : '#F0F2F8';
  } catch(e) {
    // localStorage 不可用时默认浅色
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.background = '#F0F2F8';
  }
})();
