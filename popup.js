// ── State ────────────────────────────────────────────────────────────────────
let currentMode  = "study";
let userKeywords = { block: [], allow: [] };
let blockedChannels = [];

// ── DOM refs ─────────────────────────────────────────────────────────────────
const modeButtons    = document.querySelectorAll(".mode-btn");
const blockInput     = document.getElementById("block-input");
const allowInput     = document.getElementById("allow-input");
const blockTagsEl    = document.getElementById("block-tags");
const allowTagsEl    = document.getElementById("allow-tags");
const channelInput   = document.getElementById("channel-input");
const channelListEl  = document.getElementById("channel-list");
const saveBtn        = document.getElementById("save-btn");
const toast          = document.getElementById("toast");

// ── Render helpers ────────────────────────────────────────────────────────────

function renderModeButtons() {
  modeButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === currentMode);
  });
}

function renderTags(list, container, type) {
  container.innerHTML = "";
  list.forEach((kw, i) => {
    const tag = document.createElement("span");
    tag.className = `tag ${type}`;
    tag.innerHTML = `${kw}<button class="tag-remove" data-type="${type}" data-index="${i}" title="Remove">×</button>`;
    container.appendChild(tag);
  });
}

function renderChannels() {
  channelListEl.innerHTML = "";
  blockedChannels.forEach((ch, i) => {
    const tag = document.createElement("span");
    tag.className = "tag channel";
    tag.innerHTML = `${ch}<button class="tag-remove" data-type="channel" data-index="${i}" title="Remove">×</button>`;
    channelListEl.appendChild(tag);
  });
}

function renderAll() {
  renderModeButtons();
  renderTags(userKeywords.block, blockTagsEl, "block");
  renderTags(userKeywords.allow, allowTagsEl, "allow");
  renderChannels();
}

// ── Tag removal (event delegation) ───────────────────────────────────────────
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("tag-remove")) return;
  const { type, index } = e.target.dataset;
  if (type === "channel") {
    blockedChannels.splice(Number(index), 1);
    renderChannels();
  } else {
    userKeywords[type].splice(Number(index), 1);
    renderTags(userKeywords[type], type === "block" ? blockTagsEl : allowTagsEl, type);
  }
});

// ── Mode selection ────────────────────────────────────────────────────────────
modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentMode = btn.dataset.mode;
    renderModeButtons();
  });
});

// ── Add keyword ───────────────────────────────────────────────────────────────
function addKeyword(type) {
  const input = type === "block" ? blockInput : allowInput;
  const value = input.value.trim().toLowerCase();
  if (!value || userKeywords[type].includes(value)) { input.value = ""; return; }
  userKeywords[type].push(value);
  input.value = "";
  renderTags(userKeywords[type], type === "block" ? blockTagsEl : allowTagsEl, type);
}

document.getElementById("add-block").addEventListener("click", () => addKeyword("block"));
document.getElementById("add-allow").addEventListener("click", () => addKeyword("allow"));

// Allow Enter key in inputs
blockInput.addEventListener("keydown",   (e) => { if (e.key === "Enter") addKeyword("block"); });
allowInput.addEventListener("keydown",   (e) => { if (e.key === "Enter") addKeyword("allow"); });

// ── Add channel ───────────────────────────────────────────────────────────────
function addChannel() {
  const value = channelInput.value.trim().toLowerCase();
  if (!value || blockedChannels.includes(value)) { channelInput.value = ""; return; }
  blockedChannels.push(value);
  channelInput.value = "";
  renderChannels();
}

document.getElementById("add-channel").addEventListener("click", addChannel);
channelInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addChannel(); });

// ── Save ──────────────────────────────────────────────────────────────────────
saveBtn.addEventListener("click", () => {
  chrome.storage.sync.set({ mode: currentMode, userKeywords, blockedChannels }, () => {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
  });
});

// ── Load on open ──────────────────────────────────────────────────────────────
chrome.storage.sync.get(["mode", "userKeywords", "blockedChannels"], (data) => {
  currentMode     = data.mode           || "study";
  userKeywords    = data.userKeywords   || { block: [], allow: [] };
  blockedChannels = data.blockedChannels || [];
  renderAll();
});