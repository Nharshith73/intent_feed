const modes = {
  study: {
    block: ["prank", "vlog", "shorts", "reaction", "gaming", "meme", "troll"],
    allow: ["tutorial", "lecture", "course", "python", "math", "physics"]
  },
  deep: {
    block: ["music", "song", "movie", "trailer", "gaming", "shorts", "prank", "vlog"],
    allow: ["lecture", "tutorial", "full course", "documentary"]
  },
  off: {
    block: [],
    allow: []
  }
};

let currentMode = "study";
let userKeywords = { block: [], allow: [] };
let blockedChannels = [];

function getTitle(card) {
  const titleEl   = card.querySelector("h3 a span");
  const titleAttr = card.querySelector("#video-title");
  const titleH3   = card.querySelector("h3.ytLockupMetadataViewModelHeadingReset");
  return (
    titleEl?.textContent ||
    titleAttr?.getAttribute("title") ||
    titleH3?.getAttribute("title") ||
    ""
  ).toLowerCase();
}

function getChannelName(card) {
  const anchors = card.querySelectorAll("a[href]");
  for (const a of anchors) {
    const href = a.getAttribute("href") || "";
    if (
      href.startsWith("/@") ||
      href.startsWith("/channel/") ||
      href.startsWith("/c/") ||
      href.startsWith("/user/")
    ) {
      const name = a.textContent.trim().toLowerCase();
      if (name) return name;
    }
  }
  return "";
}

/** Match keyword against title in two ways:
 *  1. Direct: "hugging face" in "what is hugging face?"         -> true
 *  2. Spaceless: "hugging face" -> "huggingface" in "huggingface tutorial" -> true
 */
function titleMatches(title, keyword) {
  const kw = keyword.toLowerCase();
  if (title.includes(kw)) return true;
  // Also compare with spaces stripped from both sides
  const kwNoSpace = kw.replace(/\s+/g, "");
  const titleNoSpace = title.replace(/\s+/g, "");
  return titleNoSpace.includes(kwNoSpace);
}

function shouldHide(title) {
  const mode = modes[currentMode] || modes.off;
  const blockList = [...mode.block, ...userKeywords.block].map(k => k.toLowerCase());
  const allowList = [...mode.allow, ...userKeywords.allow].map(k => k.toLowerCase());

  // User-added block keywords always win
  const userBlockList = userKeywords.block.map(k => k.toLowerCase());
  if (userBlockList.some(kw => titleMatches(title, kw))) return true;

  // Mode allow list overrides mode block list
  if (allowList.some(kw => titleMatches(title, kw))) return false;
  if (blockList.some(kw => titleMatches(title, kw))) return true;

  return false;
}

function resetAndFilter() {
  document.querySelectorAll("[data-checked]")
    .forEach(el => el.removeAttribute("data-checked"));
  filterVideos();
}

window.__ytFilterReload = resetAndFilter;

function filterVideos() {
  document.querySelectorAll("ytd-reel-shelf-renderer").forEach(el => {
    el.style.display = "none";
  });

  const cards = document.querySelectorAll(
    "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, yt-lockup-view-model"
  );

  cards.forEach(card => {
    if (card.dataset.checked) return;
    card.dataset.checked = "1";

    const channel = getChannelName(card);
    if (channel && blockedChannels.includes(channel)) {
      card.style.display = "none";
      return;
    }

    const title = getTitle(card);
    if (!title) return;

    if (shouldHide(title)) {
      card.style.display = "none";
    }
  });
}

chrome.storage.sync.get(["mode", "userKeywords", "blockedChannels"], (data) => {
  currentMode     = data.mode           || "study";
  userKeywords    = data.userKeywords   || { block: [], allow: [] };
  blockedChannels = data.blockedChannels || [];
  filterVideos();
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.mode)            currentMode     = changes.mode.newValue;
  if (changes.userKeywords)    userKeywords    = changes.userKeywords.newValue;
  if (changes.blockedChannels) blockedChannels = changes.blockedChannels.newValue || [];
  resetAndFilter();
});

let debounceTimer;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(filterVideos, 150);
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

document.addEventListener("yt-navigate-finish", () => {
  setTimeout(resetAndFilter, 500);
});