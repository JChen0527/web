document.addEventListener("DOMContentLoaded", function () {
    showPage('about'); // 預設開啟主頁
});

// 切換主要頁面
function showPage(pageId) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => {
        page.style.display = 'none';
    });

    // 顯示選擇的主要頁面
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.style.display = 'block';
    }

    // 如果回到作品集主頁，要確保隱藏所有詳細作品內容
    if (pageId === 'portfolio') {
        document.querySelectorAll('.work-detail').forEach(detail => {
            detail.style.display = 'none';
        });
    }
}

// 顯示作品詳細內容
function showWorkDetails(workId) {
    showPage('work-details'); // 顯示詳細頁區塊

    // 隱藏所有詳細內容
    const allDetails = document.querySelectorAll('.work-detail');
    allDetails.forEach(detail => {
        detail.style.display = 'none';
    });

    // 顯示點擊的那個作品詳細
    const selectedWork = document.getElementById(workId);
    if (selectedWork) {
        selectedWork.style.display = 'block';
    }
}

// 回到作品集主頁
function backToPortfolio() {
    showPage('portfolio');
}

// 圖片輪播功能（如果你有加上）
document.addEventListener("DOMContentLoaded", function () {
    const slider = document.querySelector(".slider");
    const slides = document.querySelectorAll(".slide");
    const totalSlides = slides.length;
    let index = 0;

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (slider && prevBtn && nextBtn) {
        prevBtn.addEventListener("click", function () {
            index = (index > 0) ? index - 1 : totalSlides - 1;
            updateSlider();
        });

        nextBtn.addEventListener("click", function () {
            index = (index < totalSlides - 1) ? index + 1 : 0;
            updateSlider();
        });

        function updateSlider() {
            slider.style.transform = `translateX(-${index * 100}%)`;
        }
    }
});









