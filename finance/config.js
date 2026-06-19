// Blackpink Money - Global Configuration & Supabase Connection (Schema Locked to finance)
const SUPABASE_URL = 'https://vaamifqzjsrflmprihgv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhYW1pZnF6anNyZmxtcHJpaGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODc2NzksImV4cCI6MjA5MTk2MzY3OX0.qUUs3aoWQMEVjTQkYTZtA8CMjMF_MrgBFa4UfiiEWzI';

// Initialize Supabase Client with Default Schema set to 'finance'
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    db: { schema: 'finance' }
});

// Tab and Page Navigation Management Config (현재 자산 앱 내부 로컬 메뉴)
const TAB_CONFIG = [
    { id: 'OUT', label: 'OUT', url: 'out.html' },
    { id: 'IN', label: 'IN', url: 'in.html' },
    { id: 'TR', label: 'MOVE', url: 'move.html' },
    { id: 'ASSETS', label: 'ASSETS', url: 'assets.html' },
    { id: 'STATS', label: 'STATS', url: 'stats.html' }
];

/* ==========================================================================
   📱 FINANCE 어드민 전역 모바일 하단 고정 탭바 & 드롭업 멀티 허브 엔진
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('global-nav');
    if (!navContainer) return;

    // 위로 확장 팝업될 깃허브 독립 하브 프로젝트 리스트
    // 부모 디렉토리 탈출 상대경로(../) 매핑 구조를 취해 로컬/배포 환경 무결성 완벽 사수!
    const HUB_PROJECTS = [
        { name: '🥗 DIET HUB', url: '../diet/index.html' },
        { name: '🏋️‍♂️ WORKOUT HUB', url: '../workout/index.html' },
        { name: '📚 BOOKCLUB HUB', url: '../bookclub/index.html' }
    ];

    const activeId = navContainer.getAttribute('data-active');

    // 💡 팝업 UI 레이아웃 통제용 상디 커스텀 CSS 동적 캡슐화 인젝션
    const inlineStyle = document.createElement('style');
    inlineStyle.innerHTML = `
        .dropup-wrapper { position: relative; flex: 1 0 auto; min-width: 85px; text-align: center; }
        .dropup-menu-container {
            position: absolute; bottom: calc(100% + 14px); right: 6px;
            background: rgba(18, 18, 18, 0.96); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid #282828; border-radius: 16px; min-width: 160px;
            padding: 8px 0; opacity: 0; transform: translateY(10px); visibility: hidden;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5); z-index: 1100;
        }
        .dropup-menu-container.show { opacity: 1; transform: translateY(0); visibility: visible; }
        .dropup-item {
            display: block; width: 100%; padding: 10px 16px; text-align: left;
            color: #ccc; font-weight: 700; font-size: 0.75rem; border: none;
            background: transparent; text-decoration: none; transition: 0.2s;
        }
        .dropup-item:hover, .dropup-item:active { background: rgba(232, 142, 163, 0.15); color: #e88ea3; }
        .dropup-item:not(:last-child) { border-bottom: 1px solid #222; }
    `;
    document.head.appendChild(inlineStyle);

    // 모바일 하단 고정 탭바 및 드롭업 스위치 레이아웃 조립
    const navHtml = `
        <div class="bottom-nav-container">
            <ul class="nav nav-pills" style="position: relative;">
                ${TAB_CONFIG.map(menu => `
                    <li class="nav-item">
                        <button class="nav-link ${menu.id === activeId ? 'active' : ''}" 
                                onclick="window.location.href='${menu.url}'">
                            ${menu.label}
                        </button>
                    </li>
                `).join('')}
                
                <li class="dropup-wrapper">
                    <button class="nav-link" style="color: #ff3f7e; border: 1px dashed rgba(255, 63, 126, 0.4); background:transparent;" onclick="window.toggleProjectHub(event)">
                        HUB 🚀
                    </button>
                    <div id="project-dropup-menu" class="dropup-menu-container">
                        ${HUB_PROJECTS.map(proj => `
                            <a href="${proj.url}" class="dropup-item">${proj.name}</a>
                        `).join('')}
                    </div>
                </li>
            </ul>
        </div>
    `;

    navContainer.innerHTML = navHtml;

    // 전역 팝업 토글 및 바깥 영역 터치 시 닫힘 처리 핸들러
    window.toggleProjectHub = (e) => {
        e.stopPropagation();
        const menu = document.getElementById('project-dropup-menu');
        if (menu) menu.classList.toggle('show');
    };

    document.addEventListener('click', () => {
        const menu = document.getElementById('project-dropup-menu');
        if (menu && menu.classList.contains('show')) {
            menu.classList.remove('show');
        }
    });

    // 활성 탭 자동 정렬 가로 스크롤 포커싱 기믹
    const activeBtn = navContainer.querySelector('.nav-link.active');
    if (activeBtn) {
        setTimeout(() => {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 150);
    }
});