/**
 * 热更新独立窗口逻辑（chrome-extension:// 第一方上下文，可以调用 showDirectoryPicker）
 * 从 GitHub Release 下载 ZIP，解压并覆盖本地 extension 目录
 */

const REPO_OWNER = '905442346-art';
const REPO_NAME = 'leapmotor-ai-assistant';
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
      const manifestHandle = await handle.getFileHandle('manifest.json');
      const file = await manifestHandle.getFile();
      const text = await file.text();
      const manifest = JSON.parse(text);
      if (manifest.name !== '零跑AI助手') {
        throw new Error(`该目录下的扩展是 "${manifest.name || '未知'}"，不是零跑AI助手`);
      }
      await saveHandle(handle);
      try { chrome.storage.local.set({ hotUpdateAuthorized: Date.now() }); } catch(e) {}

      area.innerHTML = `
        <div class="success-box">
          <div class="success-icon">✅</div>
          <div class="success-title">授权成功！</div>
          <div style="font-size:12px;color:#999;margin-bottom:8px;">热更新已开启，以后点击「检查更新」即可一键自动更新。</div>
          <button id="closeAfterSuccess" class="btn btn-primary">关闭窗口</button>
        </div>
      `;
      document.getElementById('closeAfterSuccess').addEventListener('click', () => window.close());
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
    const existingHandle = await loadHandle();
    if (existingHandle) {
      setActiveStep(1, 'done');
      startUpdate(existingHandle);
    } else {
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

/**
 * 下载 GitHub Release ZIP，解压并覆盖 extension 目录
 */
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
    <div class="progress-bar-wrap"><div class="progress-bar" id="pbar" style="width:0%"></div></div>
    <div class="file-info" id="fileInfo">正在下载更新包...</div>
  `;
  const pbar = document.getElementById('pbar');
  const fileInfo = document.getElementById('fileInfo');

  try {
    // 1. 下载 ZIP
    const zipUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/v${targetVersion}/leapmotor-ai-assistant-v${targetVersion}.zip`;
    console.log('[热更新] 📦 下载ZIP:', zipUrl);

    const resp = await fetch(zipUrl);
    if (!resp.ok) throw new Error(`下载失败: HTTP ${resp.status}`);

    const totalSize = parseInt(resp.headers.get('content-length') || '0');
    const reader = resp.body.getReader();
    let received = 0;
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (totalSize > 0) {
        const pct = Math.round((received / totalSize) * 100);
        pbar.style.width = pct + '%';
        fileInfo.textContent = `下载中... ${pct}% (${formatBytes(received)}/${formatBytes(totalSize)})`;
      } else {
        fileInfo.textContent = `下载中... ${formatBytes(received)}`;
      }
    }
    const zipBuffer = new Blob(chunks).arrayBuffer();
    const zipData = new Uint8Array(await zipBuffer);
    console.log('[热更新] ✅ ZIP下载完成:', formatBytes(zipData.length));

    // 2. 解析 ZIP 并写入文件
    pbar.style.width = '0%';
    fileInfo.textContent = '正在解压并写入文件...';

    const files = parseZip(zipData);
    console.log(`[热更新] 📂 ZIP包含 ${files.length} 个文件`);

    let written = 0;
    for (const file of files) {
      // 跳过目录
      if (file.name.endsWith('/')) { written++; continue; }

      // 去掉 ZIP 内的 extension/ 前缀
      let relPath = file.name;
      if (relPath.startsWith('extension/')) {
        relPath = relPath.substring('extension/'.length);
      }
      if (!relPath) { written++; continue; }

      const pct = Math.round((written / files.length) * 100);
      pbar.style.width = pct + '%';
      fileInfo.textContent = `[${written + 1}/${files.length}] ${relPath}`;

      // 解压文件数据
      let fileData;
      if (file.compMethod === 0) {
        // 无压缩（stored）
        fileData = zipData.subarray(file.dataOffset, file.dataOffset + file.compSize);
      } else if (file.compMethod === 8) {
        // deflate 压缩
        fileData = await inflate(zipData, file.dataOffset, file.compSize);
      } else {
        console.warn(`[热更新] 跳过不支持的压缩方法: ${file.compMethod} (${file.name})`);
        written++;
        continue;
      }

      // 写入目录
      await writeFile(dirHandle, relPath, fileData.buffer.slice(0));
      written++;
    }

    pbar.style.width = '100%';
    fileInfo.textContent = '更新完成！';
    setActiveStep(2, 'done');
    setActiveStep(3, 'active');

    area.innerHTML = `
      <div class="success-box">
        <div class="success-icon">✅</div>
        <div class="success-title">更新成功！</div>
        <div style="font-size:12px;color:#999;margin-bottom:8px;">已更新到 v${targetVersion}，正在自动重启扩展...</div>
      </div>
    `;
    document.getElementById('subtitle').textContent = '更新完成';

    setTimeout(() => { chrome.runtime.reload(); }, 1500);

  } catch (err) {
    console.error('[热更新] 更新失败:', err);
    showError(`更新失败: ${err.message}\n\n你仍可以使用手动下载ZIP的方式更新。`);
  }
}

/**
 * 解析 ZIP 文件，返回文件列表
 */
function parseZip(data) {
  const view = new DataView(data.buffer);
  const files = [];

  // 从末尾搜索 End of Central Directory 记录
  let eocdOffset = -1;
  for (let i = data.length - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset < 0) throw new Error('无效的ZIP文件（未找到EOCD）');

  const cdOffset = view.getUint32(eocdOffset + 16, true);
  const cdEntries = view.getUint16(eocdOffset + 10, true);

  let offset = cdOffset;
  for (let i = 0; i < cdEntries; i++) {
    if (view.getUint32(offset, true) !== 0x02014b50) break;

    const compMethod = view.getUint16(offset + 10, true);
    const compSize = view.getUint32(offset + 20, true);
    const nameLen = view.getUint16(offset + 28, true);
    const extraLen = view.getUint16(offset + 30, true);
    const commentLen = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);

    const name = new TextDecoder().decode(data.subarray(offset + 46, offset + 46 + nameLen));

    // 从 local file header 读取数据偏移
    const localNameLen = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
    const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;

    files.push({ name, compMethod, compSize, dataOffset });
    offset += 46 + nameLen + extraLen + commentLen;
  }

  return files;
}

/**
 * 解压 deflate 数据（使用 DecompressionStream）
 */
async function inflate(data, offset, compSize) {
  const compressed = data.subarray(offset, offset + compSize);
  const ds = new DecompressionStream('deflate-raw');
  const stream = new Blob([compressed]).stream().pipeThrough(ds);
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
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

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / 1048576).toFixed(1) + 'MB';
}

function showError(msg) {
  const area = document.getElementById('actionArea');
  area.innerHTML = `
    <div class="error">❌ ${msg.replace(/\n/g, '<br>')}</div>
    <button id="closeErrorBtn" class="btn btn-secondary" style="margin-top:12px;">关闭</button>
  `;
  document.getElementById('closeErrorBtn').addEventListener('click', () => window.close());
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
