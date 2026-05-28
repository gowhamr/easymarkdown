/**
 * Markflow — Main Application
 * Handles theme, mode switching, file uploads, exports, and initialization.
 */

// ── 1. Theme Logic ────────────────────────────
function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.getElementById('theme-icon').textContent = dark ? 'light_mode' : 'dark_mode';
  document.getElementById('theme-btn').setAttribute('aria-pressed', dark);
  document.getElementById('hljs-light').disabled = dark;
  document.getElementById('hljs-dark').disabled  = !dark;
  localStorage.setItem('em-theme', dark ? 'dark' : 'light');
  mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'default',
    securityLevel: 'loose', fontFamily: 'DM Sans, sans-serif',
    flowchart: { curve: 'basis', useMaxWidth: true },
    sequence: { useMaxWidth: true }, gantt: { useMaxWidth: true }
  });
}

function toggleTheme() {
  document.body.classList.add('theme-transitioning');
  setTimeout(() => document.body.classList.remove('theme-transitioning'), 280);
  const dark = document.documentElement.getAttribute('data-theme') !== 'dark';
  applyTheme(dark);
}

// ── 2. Mode & View ────────────────────────────
function switchMode(mode) {
  document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => { 
    b.classList.remove('active'); 
    b.setAttribute('aria-selected','false'); 
  });
  document.getElementById(`panel-${mode}`).classList.add('active');
  const tab = document.getElementById(`tab-${mode}`);
  tab.classList.add('active'); 
  tab.setAttribute('aria-selected','true');
  document.getElementById('mobile-view-toggle').style.display = mode === 'editor' ? '' : 'none';
}

let _mobileView = 'editor';
function setMobileView(v) {
  _mobileView = v;
  document.getElementById('editor-pane').classList.toggle('mobile-hidden', v !== 'editor');
  document.getElementById('preview-pane').classList.toggle('mobile-hidden', v !== 'preview');
  
  const editBtn = document.getElementById('mvt-edit');
  const prevBtn = document.getElementById('mvt-preview');
  
  editBtn.classList.toggle('active', v === 'editor');
  editBtn.setAttribute('aria-selected', v === 'editor');
  
  prevBtn.classList.toggle('active', v === 'preview');
  prevBtn.setAttribute('aria-selected', v === 'preview');
}

function currentSource() {
  return document.getElementById('panel-upload').classList.contains('active') ? 'upload' : 'editor';
}

// ── 3. Upload Logic ───────────────────────────
function handleDragOver(e) { e.preventDefault(); e.stopPropagation(); document.getElementById('drop-zone').classList.add('drag-over'); }
function handleDragLeave(e) { document.getElementById('drop-zone').classList.remove('drag-over'); }
function handleDrop(e) {
  e.preventDefault(); e.stopPropagation();
  document.getElementById('drop-zone').classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files.length > 0) processFile(files[0]);
}
function handleFileInput(e) { if (e.target.files.length > 0) processFile(e.target.files[0]); }

function processFile(file) {
  if (!file.name.match(/\.(md|markdown)$/i)) { 
    showSnackbar('Only .md files supported.', 'error', 'error'); return; 
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const md = e.target.result;
    renderUploadPreview(md);
    document.getElementById('file-name-display').textContent = file.name;
    document.getElementById('file-info').classList.add('visible');
    showSnackbar(`"${file.name}" loaded.`, 'check_circle');
  };
  reader.onerror = () => showSnackbar('Failed to read file.', 'error');
  reader.readAsText(file);
}

function renderUploadPreview(markdown) {
  const html = parseMarkdown(markdown);
  const preview = document.getElementById('upload-preview');
  preview.innerHTML = html;
  injectCopyButtons(preview); renderMermaid(preview);
  document.getElementById('upload-preview-card').style.display = 'block';
  const wc = markdown.trim().split(/\s+/).filter(Boolean).length;
  document.getElementById('upload-word-count').textContent = `${wc.toLocaleString()} words`;
}

function clearUpload() {
  document.getElementById('upload-preview').innerHTML = '';
  document.getElementById('upload-preview-card').style.display = 'none';
  document.getElementById('file-info').classList.remove('visible');
  document.getElementById('file-input').value = '';
  showSnackbar('Cleared.', 'delete_outline');
}

// ── 4. Export Functions ───────────────────────
function copyPreviewMarkdown(source) {
  const src = source || 'editor';
  const md = src === 'upload' 
    ? (document.getElementById('upload-preview').innerText || '') 
    : document.getElementById('md-editor').value;
  if (!md) { showSnackbar('Nothing to copy.', 'info'); return; }
  navigator.clipboard.writeText(md).then(() => {
    const btn = document.getElementById(src === 'upload' ? 'upload-copy-btn' : 'preview-copy-btn');
    const lbl = document.getElementById('preview-copy-label');
    btn.classList.add('copied');
    if (lbl) lbl.textContent = 'Copied!';
    showSnackbar('Markdown copied to clipboard!', 'content_copy');
    setTimeout(() => {
      btn.classList.remove('copied');
      if (lbl) lbl.textContent = 'Copy MD';
    }, 2200);
  }).catch(() => showSnackbar('Copy failed.', 'error'));
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getExportFilename(extension) {
  const markdown = document.getElementById('md-editor').value;
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  let name = 'easy-markdown-export';
  if (h1Match && h1Match[1]) {
    name = h1Match[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  return `${name || 'easy-markdown-export'}.${extension}`;
}

function exportHTML(source) {
  const inner = getCleanInnerHTML(source);
  if (!inner || !inner.trim()) { showSnackbar('Nothing to export.', 'warning'); return; }
  
  const copySVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  const checkSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Exported by Easy Markdown</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"/>
  <style>
    body{font-family:sans-serif;max-width:860px;margin:40px auto;padding:0 32px 60px;line-height:1.75;}
    pre{background:#f6f8fa;padding:16px;border-radius:8px;overflow-x:auto;position:relative;}
    code{font-family:monospace;}
  </style>
</head>
<body>${inner}</body></html>`;

  downloadBlob(html, getExportFilename('html'), 'text/html');
  showSnackbar('HTML file downloaded!', 'check_circle');
}

function exportPDF(source) {
  const content = getCleanPreviewEl(source);
  if (!content || !content.innerHTML.trim()) { showSnackbar('Nothing to export.', 'warning'); return; }
  
  // Create a temporary container for PDF generation to avoid style inheritance issues
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '800px'; // Fixed width for consistent PDF layout
  
  const style = document.createElement('style');
  style.innerHTML = `
    .pdf-content { font-family: sans-serif; line-height: 1.6; color: #111; padding: 0; background: #fff; }
    .preview-content { padding: 0 !important; background: transparent !important; min-height: 0 !important; }
    .pdf-content h1, .pdf-content h2, .pdf-content h3 { color: #1a73e8; margin-top: 1.2em; margin-bottom: 0.5em; }
    .pdf-content h1 { border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
    .pdf-content pre { background: #f6f8fa; padding: 16px; border-radius: 8px; border: 1px solid #ddd; margin: 1em 0; overflow: hidden; }
    .pdf-content code { font-family: monospace; font-size: 0.9em; }
    .pdf-content table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    .pdf-content th, .pdf-content td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    .pdf-content th { background-color: #f8f9fa; font-weight: bold; }
    .pdf-content img { max-width: 100%; height: auto; border-radius: 4px; }
    .pdf-content p { margin-bottom: 1em; }
    .pdf-content blockquote { border-left: 4px solid #1a73e8; padding: 8px 16px; background: #f0f7ff; color: #444; margin: 1em 0; }
  `;
  
  const wrapper = document.createElement('div');
  wrapper.className = 'pdf-content';
  wrapper.appendChild(content);
  
  tempContainer.appendChild(style);
  tempContainer.appendChild(wrapper);
  document.body.appendChild(tempContainer);

  const fileName = getExportFilename('pdf');
  const opt = {
    margin:       15,
    filename:     fileName,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 2, 
      useCORS: true, 
      letterRendering: true,
      scrollY: 0,
      scrollX: 0
    },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
  };

  showSnackbar('Generating PDF...', 'sync');
  
  html2pdf().set(opt).from(wrapper).save().then(() => {
    showSnackbar('PDF downloaded!', 'check_circle');
    document.body.removeChild(tempContainer);
  }).catch(err => {
    console.error('PDF Error:', err);
    showSnackbar('PDF export failed.', 'error');
    document.body.removeChild(tempContainer);
  });
}

function exportWord(source) {
  const inner = getCleanInnerHTML(source);
  if (!inner || !inner.trim()) { showSnackbar('Nothing to export.', 'warning'); return; }
  const wordHtml = `<html><body>${inner}</body></html>`;
  downloadBlob(wordHtml, getExportFilename('doc'), 'application/msword');
  showSnackbar('Word file downloaded!', 'check_circle');
}

// ── 5. Feedback ───────────────────────────────
let _snackTimer;
function showSnackbar(msg, icon='info', type='default') {
  const bar = document.getElementById('snackbar');
  document.getElementById('snackbar-text').textContent = msg;
  document.getElementById('snackbar-icon').textContent = icon;
  bar.style.background = type==='error' ? 'var(--c-error)' : type==='warning' ? 'var(--c-warn)' : '';
  bar.classList.add('show');
  clearTimeout(_snackTimer);
  _snackTimer = setTimeout(() => bar.classList.remove('show'), 3200);
}

// ── 6. Initialisation ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  _emptyStateEl = document.getElementById('editor-empty-state');
  const editor = document.getElementById('md-editor');

  // Smart Typing
  editor.addEventListener('keydown', e => {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const val = editor.value;

    if (e.key === 'Tab') {
      e.preventDefault();
      editor.value = val.substring(0, start) + '  ' + val.substring(end);
      editor.selectionStart = editor.selectionEnd = start + 2;
      updatePreview();
    }

    const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
    if (pairs[e.key]) {
      e.preventDefault();
      const pair = pairs[e.key];
      if (start !== end) {
        const selected = val.substring(start, end);
        editor.value = val.substring(0, start) + e.key + selected + pair + val.substring(end);
        editor.selectionStart = start + 1; editor.selectionEnd = end + 1;
      } else {
        editor.value = val.substring(0, start) + e.key + pair + val.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 1;
      }
      updatePreview();
    }

    if (e.key === 'Enter') {
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const currentLine = val.substring(lineStart, start);
      const listMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s+/);
      if (listMatch) {
        const prefix = listMatch[0];
        const content = currentLine.substring(prefix.length).trim();
        if (content.length > 0) {
          e.preventDefault();
          let nextPrefix = prefix;
          if (prefix.match(/\d+\.\s+/)) {
            const num = parseInt(prefix);
            nextPrefix = prefix.replace(/\d+/, num + 1);
          }
          editor.value = val.substring(0, start) + '\n' + nextPrefix + val.substring(end);
          editor.selectionStart = editor.selectionEnd = start + 1 + nextPrefix.length;
          updatePreview();
        } else {
          e.preventDefault();
          editor.value = val.substring(0, lineStart) + '\n' + val.substring(end);
          editor.selectionStart = editor.selectionEnd = lineStart + 1;
          updatePreview();
        }
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); insertSyntax('**','**'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); insertSyntax('*','*'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); toggleFindBar(); }
  });

  // Drop zone
  document.getElementById('drop-zone').addEventListener('keypress', e => {
    if (e.key === 'Enter' || e.key === ' ') document.getElementById('file-input').click();
  });

  window.addEventListener('dragover', e => e.preventDefault());
  window.addEventListener('drop',     e => e.preventDefault());

  // Systems
  setupScrollSync();
  setupResizer();

  // Restore
  const savedContent = localStorage.getItem('markflow-content');
  if (savedContent) {
    editor.value = savedContent;
    updatePreview();
  }

  document.getElementById('sync-dot').classList.add('active');

  // Theme Init
  const savedTheme = localStorage.getItem('em-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme ? savedTheme === 'dark' : prefersDark);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('em-theme')) applyTheme(e.matches);
  });
});
