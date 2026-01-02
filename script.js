// ======= DOM 選取 =======
const mainPage = document.getElementById('main-page');
const menuToggle = document.getElementById('menu-toggle');
const navOverlay = document.getElementById('nav-overlay');
const goToProjects = document.getElementById('go-to-projects');
const navLinks = document.querySelectorAll('.nav-link');
const projectsContainer = document.getElementById('projects');
const projectsBackBtn = document.getElementById('projects-back');
const projects = document.querySelectorAll('.project');
const details = document.querySelectorAll('.detail');
const progressBar = document.getElementById('progress-bar');

let currentIndex = 0;
let isScrolling = false;
let isMainPageActive = true; // 首頁預設開啟
let mainScrollPosition = 0;
const total = projects.length;


// ======= 主頁面區塊滾動變數 =======
let mainSectionIndex = 0;
let mainWheelAccumulator = 0;
const MAIN_WHEEL_THRESHOLD = 3; // 阻力門檻 (滾動 3 次)
let isMainPageScrolling = false;

const mainSections = [
  'about-me', 'awards', 'works', 'skills-section', 'main-projects', 'photography', 'contact-section'
].map(id => document.getElementById(id)).filter(el => !!el);

// ======= 顯示專案 =======
function showProject(index) {
  projects.forEach((p, i) => {
    p.style.transform = `translateY(${(i - index) * 100}vh)`;
  });
  updateProgressBar();
}

// ======= 更新進度條 =======
function updateProgressBar() {
  if (!progressBar) return;
  const viewportHeight = window.innerHeight;
  const barHeight = progressBar.offsetHeight;
  const margin = viewportHeight * 0.05;
  const moveRange = viewportHeight - barHeight - margin * 2;
  const ratio = total > 1 ? currentIndex / (total - 1) : 0;
  const top = margin + ratio * moveRange;
  progressBar.style.top = `${top}px`;
}

// ======= 開啟首頁 =======
function openMainPage() {
  isMainPageActive = true;
  mainPage.style.transform = 'translateX(0)';
  projectsContainer.style.transform = 'translateX(100%)';
  if (menuToggle) menuToggle.style.display = 'flex';
}

// ======= 關閉首頁，進入專案列表 =======
function closeMainPage() {
  isMainPageActive = false;
  mainPage.style.transform = 'translateX(-100%)';
  projectsContainer.style.transform = 'translateX(0)';
  if (menuToggle) menuToggle.style.display = 'none';
  showProject(currentIndex);
}

// ======= 桌機滾輪切換專案 / 主頁面區塊 =======
window.addEventListener('wheel', e => {
  // 1. 如果正在滾動中，攔截
  if (isScrolling || isMainPageScrolling) {
    e.preventDefault();
    return;
  }

  // 2. 如果是在專案詳細頁，不處理
  const isDetailActive = Array.from(details).some(d => d.classList.contains('active'));
  if (isDetailActive) return;

  // 3. 處理「主頁面」的區塊滾動 (帶阻力)
  if (isMainPageActive) {
    if (window.innerWidth <= 768) return; // 手機版用原生或 swipe

    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    mainWheelAccumulator += direction;

    if (Math.abs(mainWheelAccumulator) >= MAIN_WHEEL_THRESHOLD) {
      const nextIndex = mainSectionIndex + direction;
      if (nextIndex >= 0 && nextIndex < mainSections.length) {
        mainSectionIndex = nextIndex;
        scrollToMainSection(mainSectionIndex);
      }
      mainWheelAccumulator = 0;
    }
    return;
  }

  // 4. 處理「專案列表」的滾動 (原本的邏輯)
  if (!isMainPageActive && window.innerWidth > 768) {
    if (e.deltaY > 0 && currentIndex < total - 1) currentIndex++;
    else if (e.deltaY < 0 && currentIndex > 0) currentIndex--;
    else return;

    isScrolling = true;
    showProject(currentIndex);
    setTimeout(() => isScrolling = false, 700);
  }
}, { passive: false });

// 主頁面平滑滾動至指定區塊
function scrollToMainSection(index) {
  isMainPageScrolling = true;
  const target = mainSections[index];
  if (target) {
    mainPage.scrollTo({
      top: target.offsetTop,
      behavior: 'smooth'
    });
  }
  // 滾動完畢後冷卻一段時間
  setTimeout(() => {
    isMainPageScrolling = false;
  }, 1000);
}

// ======= 手機 swipe (專案列表 & 主頁面) =======
let touchStartY = 0;
let touchEndY = 0;

// 為主頁面也加入 touch 監聽
mainPage.addEventListener('touchstart', e => {
  if (window.innerWidth > 768) return;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

mainPage.addEventListener('touchend', e => {
  if (window.innerWidth > 768 || !isMainPageActive) return;
  // touchEndY = e.changedTouches[0].clientY;
  // handleMainPageSwipe(); // 移除手機版的區塊自動滾動(停留)動作
}, { passive: true });

projectsContainer.addEventListener('touchstart', e => {
  if (window.innerWidth > 768) return;
  touchStartY = e.touches[0].clientY;
});

projectsContainer.addEventListener('touchend', e => {
  if (window.innerWidth > 768) return;
  touchEndY = e.changedTouches[0].clientY;
  handleSwipe();
});

function handleMainPageSwipe() {
  if (isMainPageScrolling) return;
  const diff = touchStartY - touchEndY;
  if (Math.abs(diff) < 50) return;

  const direction = diff > 0 ? 1 : -1;
  const nextIndex = mainSectionIndex + direction;

  if (nextIndex >= 0 && nextIndex < mainSections.length) {
    // 手機版我們可以不加阻力，但維持 section-based 滾動
    mainSectionIndex = nextIndex;
    scrollToMainSection(mainSectionIndex);
  }
}

function handleSwipe() {
  if (isScrolling || isMainPageActive) return;
  const diff = touchStartY - touchEndY;
  if (Math.abs(diff) < 50) return;

  if (diff > 0 && currentIndex < total - 1) currentIndex++;
  else if (diff < 0 && currentIndex > 0) currentIndex--;
  else return;

  isScrolling = true;
  showProject(currentIndex);
  setTimeout(() => isScrolling = false, 700);
}

// ======= 取得目前滾動位置對應的區塊索引 =======
function updateMainSectionIndexFromScroll() {
  const currentScroll = mainPage.scrollTop;
  let closestIdx = 0;
  let minDiff = Infinity;

  mainSections.forEach((sec, i) => {
    const diff = Math.abs(sec.offsetTop - currentScroll);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  });
  mainSectionIndex = closestIdx;
}

// ======= 點箭頭進入詳細頁 =======
projects.forEach((proj, index) => {
  const arrow = proj.querySelector('.arrow');
  const detailId = proj.dataset.detail;
  const detail = document.getElementById(detailId);

  if (!arrow || !detail) return;

  arrow.addEventListener('click', () => {
    mainScrollPosition = mainPage.scrollTop;
    currentIndex = index;
    detail.querySelector('.detail-scroll').scrollTop = 0;
    detail.classList.add('active');
    projectsContainer.style.transform = 'translateX(-100%)';
  });
});

// ======= 詳細頁返回專案列表 =======
details.forEach(detail => {
  const back = detail.querySelector('.back');
  if (!back) return;

  back.addEventListener('click', () => {
    detail.classList.remove('active');
    projectsContainer.style.transform = 'translateX(0)';
    showProject(currentIndex);
    mainPage.scrollTo(0, mainScrollPosition);
    // 更新區塊索引
    setTimeout(updateMainSectionIndexFromScroll, 100);
  });
});

// ======= Menu Toggle 功能 =======
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    navOverlay.classList.toggle('open');
  });
}

// ======= 導覽列連結點擊 =======
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    // 關閉選單
    menuToggle.classList.remove('open');
    navOverlay.classList.remove('open');

    const href = link.getAttribute('href');

    // 如果是內連連結
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const targetIndex = mainSections.indexOf(targetElement);
        if (targetIndex !== -1) mainSectionIndex = targetIndex;

        mainPage.scrollTo({
          top: targetElement.offsetTop,
          behavior: 'smooth'
        });
      }
    }
  });
});

// ======= 進入專案列表連結 =======
const mainGoToProjects = document.getElementById('main-go-to-projects');
if (mainGoToProjects) {
  mainGoToProjects.addEventListener('click', (e) => {
    e.preventDefault();
    closeMainPage();
  });
}

if (goToProjects) {
  goToProjects.addEventListener('click', (e) => {
    e.preventDefault();
    closeMainPage();
  });
}

// ======= 返回首頁 =======
if (projectsBackBtn) projectsBackBtn.addEventListener('click', openMainPage);

// ======= resize 自動更新進度條 =======
window.addEventListener('resize', updateProgressBar);

// ======= 初始化 =======
openMainPage();
updateProgressBar();

// ======= 手機 vh 修正 =======
function setVh() {
  if (window.innerWidth > 768) return; // 只針對手機
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVh();
window.addEventListener('resize', setVh);

// ======= 下雨效果 =======
const rainContainer = document.querySelector('.rain-lines');
if (rainContainer) {
  const rainDensity = 100;
  for (let i = 0; i < rainDensity; i++) {
    const drop = document.createElement('div');
    drop.classList.add('raindrop');
    drop.style.left = Math.random() * window.innerWidth + 'px';
    drop.style.height = 10 + Math.random() * 30 + 'px';
    drop.style.animationDuration = (1 + Math.random() * 1.5) + 's';
    drop.style.animationDelay = Math.random() * 2 + 's';
    rainContainer.appendChild(drop);
  }

  window.addEventListener('resize', () => {
    document.querySelectorAll('.raindrop').forEach(drop => {
      drop.style.left = Math.random() * window.innerWidth + 'px';
    });
  });
}

// ======= 太陽 & 月亮 生起落下效果 =======
const sun = document.querySelector('.sun');
const moon = document.querySelector('.moon');

function updateSunMoon() {
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;

  // 設定軌跡參數
  // 假設畫面寬度 100% 對應 12 小時的行程
  // 高度變化使用 sin 函數模擬弧線

  // 太陽: 06:00 (升起) ~ 18:00 (落下)
  // 此處設定範圍寬鬆一點確保平滑過渡
  const sunStart = 6;
  const sunEnd = 18;

  if (sun) {
    if (hours >= sunStart && hours <= sunEnd) {
      const duration = sunEnd - sunStart;
      const progress = (hours - sunStart) / duration; // 0 ~ 1

      // 水平位置: 0% -> 100% (亦可考慮留邊距，例如 -10% -> 110%)
      const leftPos = (progress * 130) - 15; // 讓它從畫面外進來，到畫面外出去

      // 垂直位置: 模擬拋物線 (sin 0 ~ PI)
      // 最高點可設為 70vh 或其他高度
      const bottomPos = Math.sin(progress * Math.PI) * 95; // 0 -> 95 -> 0 (單位 vh)

      sun.style.left = `${leftPos}%`;
      sun.style.bottom = `${bottomPos}vh`;
      sun.style.display = 'block';
    } else {
      sun.style.display = 'none';
    }
  }

  // 月亮: 18:00 (升起) ~ 06:00 (落下)
  if (moon) {
    let moonProgress = -1;

    if (hours >= 18) {
      // 18:00 ~ 24:00 -> 前半段 (0 ~ 0.5)
      moonProgress = (hours - 18) / 12;
    } else if (hours < 6) {
      // 00:00 ~ 06:00 -> 後半段 (0.5 ~ 1)
      moonProgress = (hours + 6) / 12; // (hours + 24 - 18) / 12
    }

    if (moonProgress >= 0 && moonProgress <= 1) {
      // 水平位置
      const leftPos = (moonProgress * 130) - 15;

      // 垂直位置
      const bottomPos = Math.sin(moonProgress * Math.PI) * 90;

      moon.style.left = `${leftPos}%`;
      moon.style.bottom = `${bottomPos}vh`;
      moon.style.display = 'block';
    } else {
      moon.style.display = 'none';
    }
  }
}

setInterval(updateSunMoon, 60000); // 每分鐘更新一次即可，1ms 太快了會卡頓
updateSunMoon();

// ======= 職涯區塊滾動淡入效果 =======
const worksSection = document.querySelector('.works');

if (worksSection) {
  const observerOptions = {
    root: null, // 使用視窗作為根元素
    rootMargin: '0px',
    threshold: 0.2 // 當 20% 的區塊進入視窗時觸發
  };

  const worksObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 當職涯區塊進入視窗時，添加 fade-in class
        entry.target.classList.add('fade-in');
        // 可選：只觸發一次後停止觀察
        // worksObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  worksObserver.observe(worksSection);
}

// ======= About Me、Awards、Photography 區塊滾動淡入效果 =======
const sectionsToAnimate = [
  { selector: '.about-me', className: 'fade-in', threshold: 0.2 }, // 幾乎一進入就觸發
  { selector: '.awards', className: 'fade-in', threshold: 0.2 },
  { selector: '.skills-section', className: 'fade-in', threshold: 0.2 },
  { selector: '.main-projects', className: 'fade-in', threshold: 0.2 },
  { selector: '.photography', className: 'fade-in', threshold: 0.2 }
];

sectionsToAnimate.forEach(({ selector, className, threshold }) => {
  const section = document.querySelector(selector);

  if (section) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: threshold || 0.2
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
        }
      });
    }, observerOptions);

    sectionObserver.observe(section);
  }
});

// ======= Horizontal Gallery Auto-Scroll (Time-based for consistency) =======
(function () {
  const track = document.getElementById('track');
  if (!track) return;

  let position = 0;
  const speed = 60; // 像素 / 秒 (這會讓速度在所有裝置一致)
  let lastTime = 0;

  function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000; // 轉換成秒
    lastTime = currentTime;

    position -= speed * deltaTime;

    const totalWidth = track.scrollWidth;
    if (Math.abs(position) >= totalWidth / 2) {
      position = 0;
    }

    track.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();

// ======= Logo Gallery Auto-Scroll (Time-based) =======
(function () {
  const logoTrack = document.getElementById('logo-track');
  if (!logoTrack) return;

  let pos = 0;
  const logoSpeed = 30; // 像素 / 秒
  let lastTime = 0;

  function animateLogos(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    pos -= logoSpeed * deltaTime;
    const halfWidth = logoTrack.scrollWidth / 2;
    if (Math.abs(pos) >= halfWidth) {
      pos = 0;
    }
    logoTrack.style.transform = `translateX(${pos}px)`;
    requestAnimationFrame(animateLogos);
  }

  requestAnimationFrame(animateLogos);
})();

// ======= 職涯垂直 Ticker 自動生成 =======
(function () {
  const ticker = document.querySelector('.work-ticker');
  if (!ticker) return;

  const inner = ticker.querySelector('.ticker-inner');
  const text = ticker.getAttribute('data-text') || 'WORK';

  // 建立單個單元清單 (文字 + 空格)
  // 我們生成兩組一樣的內容以達成無縫循環
  const repeatCount = 10; // 每一組重複 10 次
  let content = '';

  for (let j = 0; j < 2; j++) { // 跑兩輪 (一輪是 0%~50%，一輪是 50%~100%)
    for (let i = 0; i < repeatCount; i++) {
      content += `<span>${text}&nbsp;</span>`;
    }
  }

  inner.innerHTML = content;
})();


document.body.classList.add('loading');

window.addEventListener('load', () => {
  const loader = document.getElementById('loading-screen');

  // 小延遲讓動畫順一點（可調）
  setTimeout(() => {
    loader.classList.add('hide');
    document.body.classList.remove('loading');
  }, 500);
});



// lazy loader
const lazyImages = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const img = entry.target;
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
    img.classList.add('loaded');

    observer.unobserve(img);
  });
}, {
  rootMargin: '200px',
  threshold: 0.01
});

lazyImages.forEach(img => imageObserver.observe(img));
