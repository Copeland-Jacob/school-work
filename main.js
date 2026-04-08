// --- NAVIGATION LOGIC ---
function switchTab(tabName) {
  // Hide all sections
  document.querySelectorAll('.spa-section').forEach(el => {
    el.classList.remove('active-section');
  });
  // Show selected section
  const target = document.getElementById('view-' + tabName);
  if (target) {
    target.classList.add('active-section');
    // Trigger scroll to top
    window.scrollTo(0,0);
    // Re-trigger animations if needed
    if(window.fadeInObserver) {
      target.querySelectorAll('.fade-in').forEach(el => window.fadeInObserver.observe(el));
    }
  }
}

// Navigation helper for About:Blank
function aboutblank() {
  const siteUrl = window.location.href;
  const win = window.open('about:blank', '_blank');

  if (!win || win.closed) {
    alert('Please allow popups for this feature to work.');
    return;
  }

  const doc = win.document;
  doc.title = "My Drive"; 

  const iframe = doc.createElement('iframe');
  iframe.src = siteUrl;
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.bottom = '0';
  iframe.style.left = '0';
  iframe.style.right = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.margin = '0';
  iframe.style.padding = '0';
  iframe.style.overflow = 'hidden';
  iframe.style.zIndex = '999999';
  doc.body.style.margin = '0';
  doc.body.appendChild(iframe);
}

/* =========================================
           animations.js 
           ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const fadeInElems = document.querySelectorAll(".fade-in");

  const observerOptions = {
    root: null,
    rootMargin: "0px", 
    threshold: 0.0
  };

  const fadeInObserver = new IntersectionObserver((entries) => {
    requestAnimationFrame(() => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        } else {
          entry.target.classList.remove("active");
        }
      });
    });
  }, observerOptions);

  fadeInElems.forEach(elem => {
    fadeInObserver.observe(elem);
    const rect = elem.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isVisible) {
      elem.classList.add("active");
    }
  });

  window.fadeInObserver = fadeInObserver;
});

document.addEventListener("keyup", function(e) {
  switch(e.key) {
    case "Enter":
      const launchBtn = document.getElementById("launch");
      if (launchBtn) launchBtn.click();
      break;
    case "-":
      e.preventDefault();
      e.stopPropagation();
      window.location.replace("https://www.google.com/webhp?igu=1");
      break;
    case "'":
      e.preventDefault();
      e.stopPropagation();
      document.title = "My Drive - Google Drive";
      if (typeof setFavicons === "function") {
        setFavicons("https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png");
      }
      break;
  }
}, { passive: false });

function setFavicons(favImg) {
  let headTitle = document.querySelector("head");
  let setFavicon = document.createElement("link");
  setFavicon.setAttribute("rel", "shortcut icon");
  setFavicon.setAttribute("href", favImg);
  headTitle.appendChild(setFavicon);
}



/* =========================================
           particles.js 
           ========================================= */
particlesJS("particles-js", {
  "particles": {
    "number": {
      "value": 50,
      "density": { "enable": true, "value_area": 800 }
    },
    "color": { "value": "#ffffff" },
    "shape": {
      "type": "circle",
      "stroke": { "width": 0, "color": "#000000" },
    },
    "opacity": {
      "value": 0.3,
      "random": true,
      "anim": { "enable": true, "speed": 0.5, "opacity_min": 0.1, "sync": false }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": { "enable": false }
    },
    "line_linked": {
      "enable": false,
    },
    "move": {
      "enable": true,
      "speed": 2,
      "direction": "top",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": { "enable": false },
      "onclick": { "enable": false },
      "resize": true
    }
  },
  "retina_detect": true
});
/* =========================================
           script.js
           ========================================= */

const urlInput = document.getElementById("link");
const launch = document.getElementById("launch");
const feedbackMessage = document.getElementById("feedbackMessage");
const videoPlayersContainer = document.getElementById("videoPlayersContainer");
const loadStatus = document.getElementById("loadStatus");
const unhelpfulText = document.getElementById("offtext");

// --- CONSTANTS ---
const INITIAL_VIDEO_WIDTH = 688;
const INITIAL_VIDEO_HEIGHT = 387;
const RESIZE_STEP = 0.10;
const ASPECT_RATIO = 0.5625;

// --- FIX SCROLL RESTORATION ---
if ('scrollRestoration' in history)
{
  history.scrollRestoration = 'manual';
}

window.addEventListener('beforeunload', () =>
                        {
  window.scrollTo(0, 0);
});

window.onload = function()
{
  setTimeout(function()
             {
    window.scrollTo(0, 0);
  }, 10); // Small delay to ensure layout is ready
};

function showToast(message, isError = false)
{
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  if (isError) toast.style.borderColor = "#D73939"; // Red border for errors
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() =>
             {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function extractVideoId(url)
{
  if (/playlist|\/channel\/|\/@/.test(url)) return null;
  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /embed\/([\w-]{11})/,
    /shorts\/([\w-]{11})/,
    /googleusercontent\.com\/youtube\.com\/5\/([\w-]{11})/,
  ];
  for (const pattern of patterns)
  {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

function preflightCheck(videoId)
{
  return new Promise((resolve, reject) =>
                     {
    const img = new Image();
    let done = false;
    img.onload = () =>
    {
      if (!done)
      {
        done = true;
        resolve();
      }
    };
    img.onerror = () =>
    {
      if (!done)
      {
        done = true;
        reject("This video is unavailable or blocked.");
      }
    };
    img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    setTimeout(() =>
               {
      if (!done)
      {
        done = true;
        reject("Network blocked video access.");
      }
    }, 1500);
  });
}

// --- PERSISTENCE UTILS ---
function saveOpenVideos()
{
  const videos = [];
  const wrappers = videoPlayersContainer.querySelectorAll(
    ".video-unit-wrapper",
  );
  wrappers.forEach((wrapper) =>
                   {
    if (wrapper.dataset.videoId)
    {
      videos.push(wrapper.dataset.videoId);
    }
  });
  localStorage.setItem("savedVideos", JSON.stringify(videos));
}

function loadSavedVideos()
{
  const saved = localStorage.getItem("savedVideos");
  if (saved)
  {
    try
    {
      const videoIds = JSON.parse(saved);
      [...videoIds].reverse().forEach((videoId) =>
                                      {
        addVideoPlayer(videoId, false);
      });
    }
    catch (e)
    {
      console.error("Failed to load saved videos", e);
    }
  }
}

// --- VIDEO PLAYER LOGIC ---
function addVideoPlayer(videoId, showLoadedFeedback = true)
{
  if (unhelpfulText)
  {
    unhelpfulText.classList.remove("active");
    unhelpfulText.style.display = "none";
  }

  if (!videoId) return showToast("Invalid YouTube URL.", true);

  const videoUnitWrapper = document.createElement("div");
  videoUnitWrapper.classList.add("video-unit-wrapper", "fade-in");
  videoUnitWrapper.dataset.videoId = videoId;

  // --- OPTIMIZED ATTRIBUTES ---
  const iframe = document.createElement("iframe");
  const origin = window.location.origin;
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?origin=${origin}`;

  iframe.setAttribute("frameborder", "0");
  iframe.loading = "lazy";
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.borderRadius = "8px";

  // Spinner load
  const loadingOverlay = document.createElement("div");
  loadingOverlay.className = "video-loading-overlay";
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  loadingOverlay.appendChild(spinner);

  iframe.onload = () =>
  {
    loadingOverlay.classList.add("hidden");
    setTimeout(() => loadingOverlay.remove(), 300);
  };

  const videoDisplay = document.createElement("div");
  videoDisplay.classList.add("video-display");
  videoDisplay.style.width = `${INITIAL_VIDEO_WIDTH}px`;
  videoDisplay.style.height = `${INITIAL_VIDEO_HEIGHT}px`;
  videoDisplay.dataset.initialWidth = INITIAL_VIDEO_WIDTH;
  videoDisplay.dataset.initialHeight = INITIAL_VIDEO_HEIGHT;

  const closeButton = document.createElement("button");
  closeButton.textContent = "X";
  closeButton.title = "Close Video";
  closeButton.classList.add("close-video-button");
  closeButton.addEventListener("click", () =>
                               {
    videoUnitWrapper.remove();
    saveOpenVideos();
    if (videoPlayersContainer.children.length === 0 && unhelpfulText)
    {
      unhelpfulText.classList.add("active");
      unhelpfulText.style.display = "block";
    }
  });

  videoDisplay.appendChild(loadingOverlay);
  videoDisplay.appendChild(iframe);
  videoDisplay.appendChild(closeButton);

  // --- CONTROLS SIDEBAR ---
  const sizeControls = document.createElement("div");
  sizeControls.classList.add("video-size-controls");

  const createCtrlBtn = (text, cls, title, action) =>
  {
    const btn = document.createElement("button");
    btn.innerHTML = text;
    btn.className = `size-button ${cls}`;
    btn.title = title;
    btn.addEventListener("click", action);
    return btn;
  };

  // Plus
  sizeControls.appendChild(
    createCtrlBtn("+", "plus", "Increase Size", () =>
                  {
      const w = videoDisplay.offsetWidth * (1 + RESIZE_STEP);
      resizeVideoElement(videoDisplay, w);
    }),
  );

  // Minus
  sizeControls.appendChild(
    createCtrlBtn("\u2212", "minus", "Decrease Size", () =>
                  {
      const w = videoDisplay.offsetWidth * (1 - RESIZE_STEP);
      resizeVideoElement(videoDisplay, w);
    }),
  );

  // Reset
  sizeControls.appendChild(
    createCtrlBtn("\u21BA", "default", "Reset Size", () =>
                  {
      const w = parseInt(videoDisplay.dataset.initialWidth);
      resizeVideoElement(videoDisplay, w);
    }),
  );

  // Copy Button (SVG)
  const copySvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
  const copyBtn = createCtrlBtn(
    copySvg,
    "copy-mini",
    "Copy Video Link",
    () =>
    {
      const finalLink = `https://www.youtube-nocookie.com/embed/${videoId}`;
      window.open(finalLink, '_blank').focus();
      navigator.clipboard.writeText(finalLink);
      showToast("Video Link Copied and Opened!");
    },
  );
  copyBtn.style.marginTop = "10px";
  copyBtn.style.backgroundColor = "#AB47BC";

  sizeControls.appendChild(copyBtn);

  videoUnitWrapper.appendChild(videoDisplay);
  videoUnitWrapper.appendChild(sizeControls);
  videoPlayersContainer.prepend(videoUnitWrapper);

  if (typeof fadeInObserver !== "undefined")
    fadeInObserver.observe(videoUnitWrapper);

  if (showLoadedFeedback)
  {
    showToast("Video Loaded Successfully!");
  }
  saveOpenVideos();
}

function resizeVideoElement(elementToResize, newWidth)
{
  const newHeight = newWidth * ASPECT_RATIO;
  elementToResize.style.width = `${Math.round(newWidth)}px`;
  elementToResize.style.height = `${Math.round(newHeight)}px`;
}

// --- LAUNCH HANDLER ---
if (launch)
{
  launch.addEventListener("click", async () =>
                          {
    const url = urlInput.value.trim();
    if (!url) return showToast("Please paste a YouTube link first.");

    const videoId = extractVideoId(url);
    if (!videoId)
      return showToast("That doesn't look like a valid YouTube link.");

    launch.disabled = true;
    showToast("Checking availability...");

    try
    {
      await preflightCheck(videoId);
      addVideoPlayer(videoId);
      urlInput.value = "";
    }
    catch (err)
    {
      showToast(err);
    }
    finally
    {
      launch.disabled = false;
    }
  });
}

// --- Button Functions ---
function toggleOptimization()
{
  const toggle = document.getElementById("optToggle");
  const statusText = document.getElementById("optStatusText");
  const isOpt = toggle.checked;

  localStorage.setItem("optimizedMode", isOpt);

  // Update Text UI
  if (isOpt)
  {
    statusText.textContent = "Enabled";
    statusText.classList.remove("disabled");
    statusText.classList.add("enabled");
    document.body.classList.add("optimized");
  }
  else
  {
    statusText.textContent = "Disabled";
    statusText.classList.remove("enabled");
    statusText.classList.add("disabled");
    document.body.classList.remove("optimized");
  }

  // Handle Particles visibility
  const pContainer = document.getElementById("particles-js");
  if (pContainer) pContainer.style.display = isOpt ? "none" : "block";
}

function clearAllVideos()
{
  videoPlayersContainer.innerHTML = "";
  if (unhelpfulText)
  {
    unhelpfulText.classList.add("active");
    unhelpfulText.style.display = "block";
  }
  localStorage.removeItem("savedVideos");
}

// --- MAIN INIT ---
document.addEventListener("DOMContentLoaded", () =>
                          {
  // Check saved mode
  const savedMode = localStorage.getItem("optimizedMode") === "true";
  const toggle = document.getElementById("optToggle");

  // Set initial UI state
  if (toggle)
  {
    toggle.checked = savedMode;
    const statusText = document.getElementById("optStatusText");
    if (savedMode)
    {
      statusText.textContent = "Enabled";
      statusText.classList.add("enabled");
      document.body.classList.add("optimized");
      const pContainer = document.getElementById("particles-js");
      if (pContainer) pContainer.style.display = "none";
    }
    else
    {
      statusText.classList.add("disabled");
    }
  }

  loadSavedVideos();
});

// Toggle Instructions
const settingsBox = document.querySelector(".settings-card");
const instBox = document.getElementById("instructions-home");
const hideBtn = document.querySelector(".hide-button");
const showBtn = document.querySelector(".show-button");

if (hideBtn && showBtn && settingsBox && instBox)
{
  hideBtn.onclick = () =>
  {
    instBox.style.display = "none";
    settingsBox.style.display = "none";
    showBtn.style.display = "block";
  };
  showBtn.onclick = () =>
  {
    instBox.style.display = "block";
    settingsBox.style.display = "block";
    showBtn.style.display = "none";
  };
}
/* =========================================
           PASTE CONTENT OF Links Page Script HERE
           (The contents inside <script> tag of index (4).html)
           ========================================= */
const fetchBtn = document.getElementById("fetchLinks");
const customFetchBtn = document.getElementById("customFetch");
const customInput = document.getElementById("customAmount");
const openBtn = document.getElementById("openSelected");
const selectAllBtn = document.getElementById("selectAll");
const grid = document.getElementById("linkGrid");
const countSpan = document.getElementById("count");
const allLoadedMsg = document.getElementById("allLoadedMsg");
const progressText = document.getElementById("progressText");
let allFoundLinks = [];
let currentIndex = 0;
let selectedLinks = new Set();
async function ensureDataLoaded()
{
  if (allFoundLinks.length > 0) return !0;
  fetchBtn.disabled = !0;
  customFetchBtn.disabled = !0;
  try
  {
    const res = await fetch("https://raw.githubusercontent.com/wea-f/Norepted/refs/heads/master/bphmirror.md", );
    if (!res.ok) throw new Error("GitHub fetch failed");
    const text = await res.text();
    parseMarkdown(text);
    selectAllBtn.disabled = !1;
    fetchBtn.disabled = !1;
    customFetchBtn.disabled = !1;
    return !0
  }
  catch (e)
  {
    return !1
  }
}

function parseMarkdown(markdown)
{
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  const lines = markdown.split("\n");
  let currentHeader = "General";
  lines.forEach((line) =>
                {
    if (line.trim().startsWith("### "))
    {
      currentHeader = line.replace(/###/g, "").split("|")[0].split("[")[0].trim()
    }
    const match = line.match(urlRegex);
    if (match)
    {
      allFoundLinks.push(
        {
          url: match[0],
          siteName: currentHeader,
        })
    }
  });
  console.log(`Parsed ${allFoundLinks.length} links.`)
}
async function loadMore(amount)
{
  const success = await ensureDataLoaded();
  if (!success) return;
  const nextIndex = currentIndex + amount;
  const batch = allFoundLinks.slice(currentIndex, nextIndex);
  if (batch.length === 0 && allFoundLinks.length > 0)
  {
    finishLoading();
    return
  }
  batch.forEach((linkData, i) =>
                {
    const url = linkData.url;
    const card = document.createElement("div");
    card.className = "proxy-card fade-in";
    const displayUrl = url.replace("https://", "").replace("http://", "").replace(/\/$/, "");
    card.innerHTML = `
            <div class="proxy-check">
                <input type="checkbox" class="proxy-checkbox" value="${url}">
            </div>
            <div class="proxy-info">
                <span class="site-tag">${linkData.siteName}</span>
                <span class="proxy-link" title="${url}">${displayUrl}</span>
            </div>
          `;
    card.addEventListener("click", (e) =>
                          {
      const box = card.querySelector(".proxy-checkbox");
      if (e.target === box)
      {
        if (box.checked)
        {
          selectedLinks.add(url);
          card.classList.add("selected")
        }
        else
        {
          selectedLinks.delete(url);
          card.classList.remove("selected")
        }
        updateUI();
        return
      }
      window.open(url, "_blank")
    });
    grid.appendChild(card);
    if (window.fadeInObserver)
    {
      window.fadeInObserver.observe(card)
    }
    else
    {
      card.classList.add("active");
      card.style.opacity = 1
    }
  });
  currentIndex += batch.length;
  progressText.classList.remove("hidden");
  progressText.textContent = `Showing ${currentIndex} of ${allFoundLinks.length} links`;
  if (currentIndex >= allFoundLinks.length)
  {
    finishLoading()
  }
}

function finishLoading()
{
  fetchBtn.disabled = !0;
  fetchBtn.textContent = "All Loaded";
  customFetchBtn.disabled = !0;
  allLoadedMsg.classList.remove("hidden")
}
fetchBtn.addEventListener("click", () =>
                          {
  loadMore(15)
});
customFetchBtn.addEventListener("click", () =>
                                {
  let amt = parseInt(customInput.value);
  if (!amt || amt < 1) amt = 15;
  loadMore(amt)
});
selectAllBtn.addEventListener("click", () =>
                              {
  const checkboxes = document.querySelectorAll(".proxy-checkbox");
  const shouldSelect = Array.from(checkboxes).some((cb) => !cb.checked);
  checkboxes.forEach((box) =>
                     {
    box.checked = shouldSelect;
    const card = box.closest(".proxy-card");
    if (shouldSelect)
    {
      selectedLinks.add(box.value);
      card.classList.add("selected")
    }
    else
    {
      selectedLinks.delete(box.value);
      card.classList.remove("selected")
    }
  });
  updateUI()
});
openBtn.addEventListener("click", () => {
  if (selectedLinks.size === 0) return;
  if (selectedLinks.size > 10) {
    if (!confirm(`You are about to open ${selectedLinks.size} tabs. Continue?`)) return;
  }

  let blocked = false;
  selectedLinks.forEach((url) => {
    const newWin = window.open(url, "_blank");

    if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
      blocked = true;
    }
  });

  if (blocked) {
    alert("One site opened! Please turn on 'Always allow pop-ups and redirects' from Norepted to open multiple links!");
  }
});

function updateUI()
{
  countSpan.textContent = selectedLinks.size;
  openBtn.disabled = selectedLinks.size === 0;
  const checkboxes = document.querySelectorAll(".proxy-checkbox");
  if (checkboxes.length > 0)
  {
    const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
    selectAllBtn.textContent = allChecked ? "Deselect All" : "Select All Loaded"
  }
}
