/**
 * 热更新独立窗口逻辑（chrome-extension:// 第一方上下文，可以调用 showDirectoryPicker）
 */

const GITHUB_BASE = 'https://cdn.jsdelivr.net/gh/905442346-art/leapmotor-ai-assistant@';
const UPDATE_FILES = [
  'sidebar/app.js',
  'sidebar/style.css',
  'sidebar/index.html',
  'sidebar/hot-update.html',
  'sidebar/hot-update.js',
  'background.js',
  'content-scripts/content.js',
  'content-scripts/content.css',
  'manifest.json',
];
const DB_NAME = 'leapmotor-hot-update';
const STORE_NAME = 'handles';
const DIR_KEY = 'extension-dir-handle';

const params = new URLSearchParams(location.search);
const versionParam = params.get('version') || '';
const targetVersion = versionParam.replace(/^v/, '');
const setupMode = targetVersion === '__setup__';

if (setupMode) {
  document.getElementById('subtitle').textContent = '首次设置：授权 extension 目录';
  document.querySelector('.title').textContent = '开启热更新';
  setupOnly();
} else if (!targetVersion) {
  showError('未指定目标版本号');
} else {
  document.getElementById('subtitle').textContent = `正在更新到 v${targetVersion}`;
  init();
}

/** 仅授权目录模式（不做更新） */
async function setupOnly() {
  // 隐藏第2、3步
  document.getElementById('step2').style.display = 'none';
  document.getElementById('step3').style.display = 'none';

  const area = document.getElementById('actionArea');
  area.innerHTML = `
    <div style="margin-bottom:12px;padding:10px;background:rgba(143,224,64,0.06);border:1px solid rgba(143,224,64,0.15);border-radius:8px;font-size:11px;color:#b8e880;line-height:1.6;">
      📁 点击下方按钮，选择你当初在 chrome://extensions 中「加载已解压的扩展程序」时选择的 <code style="background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:2px;">extension</code> 文件夹。<br>
      选择授权后，以后更新就不用再选目录了。
    </div>
    <button id="selectDirBtn" class="btn btn-primary">📁 选择 extension 目录并授权</button>
    <button id="closeBtn" class="btn btn-secondary" style="margin-top:8px;">关闭</button>
  `;
  document.getElementById('selectDirBtn').addEventListener('click', async () => {
    const btn = document.getElementById('selectDirBtn');
    btn.disabled = true;
    btn.textContent = '等待选择目录...';
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      // 验证目录
      const manifestHandle = await handle.getFileHandle('manifest.json');
      const file = await manifestHandle.getFile();
      const text = await file.text();
      const manifest = JSON.parse(text);
      if (manifest.name !== '零跑AI助手') {
        throw new Error(`该目录下的扩展是 "${manifest.name || '未知'}"，不是零跑AI助手`);
      }
      await saveHandle(handle);

      area.innerHTML = `
        <div class="success-box">
          <div class="success-icon">✅</div>
          <div class="success-title">授权成功！</div>
          <div style="font-size:12px;color:#999;margin-bottom:8px;">热更新已开启，以后点击「检查更新」即可一键自动更新。</div>
          <button class="btn btn-primary" onclick="window.close()">关闭窗口</button>
        </div>
      `;
      document.getElementById('num1').classList.add('done');
      document.getElementById('num1').textContent = '✓';
    } catch (err) {
      btn.disabled = false;
      btn.textContent = '📁 选择 extension 目录并授权';
      if (err.name === 'AbortError') return;
      const errDiv = document.createElement('div');
      errDiv.className = 'error';
      errDiv.textContent = '❌ ' + (err.message || String(err));
      area.insertBefore(errDiv, btn);
    }
  });
  document.getElementById('closeBtn').addEventListener('click', () => window.close());
  setActiveStep(1, 'active');
}

async function init() {
  try {
    // 先尝试从IDB恢复已有目录句柄
    const existingHandle = await loadHandle();
    if (existingHandle) {
      // 已有授权目录，直接开始更新
      setActiveStep(1, 'done');
      startUpdate(existingHandle);
    } else {
      // 需要用户选择目录
      showSelectDirButton();
    }
  } catch (err) {
    console.error(err);
    showSelectDirButton();
  }
}

function setActiveStep(num, state) {
  for (let i = 1; i <= 3; i++) {
    const numEl = document.getElementById('num' + i);
    const stepEl = document.getElementById('step' + i);
    numEl.classList.remove('active', 'done');
    stepEl.style.opacity = '0.4';
    if (i < num) {
      numEl.classList.add('done');
      numEl.textContent = '✓';
      stepEl.style.opacity = '1';
    } else if (i === num) {
      if (state === 'done') {
        numEl.classList.add('done');
        numEl.textContent = '✓';
      } else {
        numEl.classList.add('active');
        numEl.textContent = num;
      }
      stepEl.style.opacity = '1';
    }
  }
}

function showSelectDirButton() {
  setActiveStep(1, 'active');
  const area = document.getElementById('actionArea');
  area.innerHTML = `
    <button id="selectDirBtn" class="btn btn-primary">📁 选择 extension 目录</button>
    <div style="margin-top:10px;padding:10px;background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.15);border-radius:8px;font-size:11px;color:#9cc;line-height:1.6;">
      💡 请选择你当初在 chrome://extensions 中「加载已解压的扩展程序」时选择的 <code style="background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:2px;">extension</code> 文件夹。<br>
      选择后会自动验证是否为零跑AI助手的目录。授权后下次更新无需再选。
    </div>
  `;
  document.getElementById('selectDirBtn').addEventListener('click', selectAndUpdate);
}

async function selectAndUpdate() {
  const btn = document.getElementById('selectDirBtn');
  btn.disabled = true;
  btn.textContent = '等待选择目录...';

  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });

    // 验证目录：检查manifest.json
    let valid = false;
    try {
      const manifestHandle = await handle.getFileHandle('manifest.json');
      const file = await manifestHandle.getFile();
      const text = await file.text();
      const manifest = JSON.parse(text);
      if (manifest.name === '零跑AI助手') {
        valid = true;
      } else {
        throw new Error(`该目录下的扩展是 "${manifest.name || '未知'}"，不是零跑AI助手`);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'NotFoundError') {
        throw new Error('该目录下没有 manifest.json，请选择 extension 文件夹');
      }
      throw e;
    }

    if (!valid) throw new Error('无效的扩展目录');

    // 保存到IDB
    await saveHandle(handle);

    setActiveStep(1, 'done');
    startUpdate(handle);

  } catch (err) {
    btn.disabled = false;
    btn.textContent = '📁 选择 extension 目录';
    if (err.name === 'AbortError') {
      showError('已取消选择，请重试');
    } else {
      showError(err.message || String(err));
    }
  }
}

async function startUpdate(dirHandle) {
  // 检查写入权限
  const perm = await dirHandle.queryPermission({ mode: 'readwrite' });
  if (perm !== 'granted') {
    const req = await dirHandle.requestPermission({ mode: 'readwrite' });
    if (req !== 'granted') {
      showError('未获得目录写入权限，无法更新');
      return;
    }
  }

  setActiveStep(2, 'active');
  const area = document.getElementById('actionArea');
  area.innerHTML = `
    <div class="progress-bar-wrap"><div class="progress-bar" id="pbar"></div></div>
    <div class="file-info" id="fileInfo">准备下载...</div>
  `;

  const pbar = document.getElementById('pbar');
  const fileInfo = document.getElementById('fileInfo');

  try {
    for (let i = 0; i < UPDATE_FILES.length; i++) {
      const filePath = UPDATE_FILES[i];
      const pct = Math.round((i / UPDATE_FILES.length) * 100);
      pbar.style.width = pct + '%';
      fileInfo.textContent = `[${i + 1}/${UPDATE_FILES.length}] ${filePath}`;

      const url = GITHUB_BASE + `v${targetVersion}/extension/${filePath}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`下载失败 ${filePath}: HTTP ${resp.status}`);

      const buffer = await resp.arrayBuffer();
      await writeFile(dirHandle, filePath, buffer);
    }

    pbar.style.width = '100%';
    fileInfo.textContent = '更新完成！';

    setActiveStep(2, 'done');
    setActiveStep(3, 'active');

    // 成功界面
    area.innerHTML = `
      <div class="success-box">
        <div class="success-icon">✅</div>
        <div class="success-title">更新成功！</div>
        <div style="font-size:12px;color:#999;margin-bottom:8px;">已更新到 v${targetVersion}，正在自动重启扩展...</div>
      </div>
    `;
    document.getElementById('subtitle').textContent = '更新完成';

    // 1.5秒后reload
    setTimeout(() => {
      chrome.runtime.reload();
    }, 1500);

  } catch (err) {
    console.error('更新失败:', err);
    showError(`更新失败: ${err.message}\n\n你仍可以使用手动下载ZIP的方式更新。`);
  }
}

async function writeFile(dirHandle, relativePath, buffer) {
  const parts = relativePath.split('/');
  const fileName = parts.pop();
  let dir = dirHandle;
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part, { create: true });
  }
  const fileHandle = await dir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(buffer);
  await writable.close();
}

function showError(msg) {
  const area = document.getElementById('actionArea');
  area.innerHTML = `
    <div class="error">❌ ${msg.replace(/\n/g, '<br>')}</div>
    <button class="btn btn-secondary" onclick="window.close()" style="margin-top:12px;">关闭</button>
  `;
}

// ---- IndexedDB ----
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function saveHandle(handle) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, DIR_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
async function loadHandle() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(DIR_KEY);
    req.onsuccess = () => { db.close(); resolve(req.result || null); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}
