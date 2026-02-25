document.addEventListener('DOMContentLoaded', () => {
    // 實驗室風格：滾動視差效果 (Parallax)
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const parallaxElements = document.querySelectorAll('.page-header-text h1');
        parallaxElements.forEach(el => {
            el.style.transform = `translateY(${scrolled * 0.15}px)`;
        });
    });

    // Header 縮放效果
    const header = document.getElementById('main-header') || document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        });
    }

    // 捲動顯現動畫 (Reveal Animation)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));

    // 側邊欄 Active 狀態自動切換 (Scroll Spy)
    // 僅在頁面上有 .toc-link 元素時才執行，避免在首頁報錯
    const navLinks = document.querySelectorAll('.toc-link');
    if (navLinks.length > 0) {
        const sections = document.querySelectorAll('section');
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= (sectionTop - 150)) {
                    current = section.getAttribute('id');
                }
            });
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current)) {
                    link.classList.add('active');
                }
            });
        });
    }

    // 動態載入 Linktree 連結 (僅在首頁執行)
    const linktreeContainer = document.getElementById('linktree-container');
    if (linktreeContainer) {
        fetch('assets/data/links.json')
            .then(response => response.json())
            .then(links => {
                links.forEach(link => {
                    const a = document.createElement('a');
                    a.href = link.url;
                    a.className = 'linktree-btn';
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    
                    // 這裡可以根據 link.icon 加入對應的 SVG icon，目前先只顯示文字
                    a.textContent = link.title;
                    
                    linktreeContainer.appendChild(a);
                });
            })
            .catch(error => console.error('Error loading links:', error));
    }
});
