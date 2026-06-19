// Supabase 연결 설정
const SUPABASE_URL = 'https://vaamifqzjsrflmprihgv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhYW1pZnF6anNyZmxtcHJpaGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODc2NzksImV4cCI6MjA5MTk2MzY3OX0.qUUs3aoWQMEVjTQkYTZtA8CMjMF_MrgBFa4UfiiEWzI';
const _db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 테이블 메타데이터 정의 (group 속성을 통해 성격별 지능형 중앙 제어 시스템 구축)
const DIET_TABLES = [
    { schema: 'diet', id: 'ai_rulebook', name: '1. AI 룰셋', dateCol: false, group: 'master' },
    { schema: 'diet', id: 'user_goals', name: '2. 사용자 정보', dateCol: false, group: 'master' },
    { schema: 'diet', id: 'project_goals', name: '3. 프로젝트 목표', dateCol: false, group: 'master' },
    { schema: 'diet', id: 'strategies', name: '4. 다이어트 전략', dateCol: false, group: 'master' },
    { schema: 'diet', id: 'project_schedules', name: '5. 프로젝트 스케줄', dateCol: 'plan_date', allowAdd: true, group: 'master' },
    { schema: 'diet', id: 'snacks', name: '6. 간식 라이브러리', dateCol: false, group: 'master' },
    { schema: 'diet', id: 'supplements', name: '7. 섭취 영양제 리스트', dateCol: false, group: 'master' },
    { schema: 'diet', id: 'dinner_menus', name: '8. 식단 저녁 메뉴', dateCol: false, group: 'master' },
    { schema: 'diet', id: 'weekday_routine_master', name: '9. 평일 루틴 마스터', dateCol: false, group: 'master' },
    { schema: 'diet', id: 'inbody_logs', name: '10. 인바디 기록', dateCol: 'test_date', group: 'daily' },
    { schema: 'diet', id: 'meal_logs', name: '11. 식단 로그', dateCol: 'log_date', group: 'daily' },
    { schema: 'diet', id: 'condition_logs', name: '12. 생활/컨디션', dateCol: 'log_date', group: 'daily' },
    { schema: 'diet', id: 'sleep_logs', name: '13. 수면 로그', dateCol: 'log_date', group: 'daily' },
    { schema: 'workout', id: 'session_logs', name: 'W1. 운동 세션 로그', dateCol: 'workout_date', group: 'workout' },
    { schema: 'workout', id: 'logs', name: 'W2. 운동 상세 로그', dateCol: 'workout_date', group: 'workout' },
    { schema: 'workout', id: 'active_workout', name: 'W3. 오늘의 운동', dateCol: 'created_at', group: 'workout' }
];

// 전역 업데이트 대기 데이터 객체
let PENDING_UPDATES = {};

/* ==========================================================================
   📱 모바일 최적화 하단 고정 스크롤 탭바 및 상단 드롭업 멀티 프로젝트 엔진
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('global-nav');
    if (!navContainer) return;

    // 1. 현재 서브 앱 내부에서 가볍게 회전할 콤팩트 탭 메뉴
    const LOCAL_MENUS = [
        { id: 'export', name: 'EXPORT', url: 'export.html' },
        { id: 'view', name: 'VIEW & EDIT', url: 'view.html' },
        { id: 'schedule', name: 'SCHEDULE', url: 'schedule.html' },
        { id: 'import', name: 'IMPORT', url: 'import.html' }
    ];

    // 2. 버튼 클릭 시 위로 팝업될 독립 허브 프로젝트 리스트 (추후 여기에 한 줄만 추가하면 확장 끝!)
    const HUB_PROJECTS = [
        { name: '🏋️‍♂️ WORKOUT HUB', url: '../workout/index.html' },
        { name: '💰 FINANCE HUB', url: '../finance/index.html' },
        { name: '📚 BOOKCLUB HUB', url: '../bookclub/index.html' }
    ];

    const activeId = navContainer.getAttribute('data-active');

    // 💡 팝업 구조 제어용 초경량 CSS 스타일 동적 주입 기믹
    const inlineStyle = document.createElement('style');
    inlineStyle.innerHTML = `
        .dropup-wrapper { position: relative; flex: 1 0 auto; min-width: 90px; text-align: center; }
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
        .dropup-item:hover, .dropup-item:active { background: rgba(232, 142, 163, 0.15); color: var(--bp-pink); }
        .dropup-item:not(:last-child) { border-bottom: 1px solid #222; }
    `;
    document.head.appendChild(inlineStyle);

    // 3. 글로벌 레이아웃 조립
    const navHtml = `
        <div class="bottom-nav-container">
            <ul class="nav nav-pills" style="position: relative;">
                ${LOCAL_MENUS.map(menu => `
                    <li class="nav-item">
                        <button class="nav-link ${menu.id === activeId ? 'active' : ''}" 
                                onclick="window.location.href='${menu.url}'">
                            ${menu.name}
                        </button>
                    </li>
                `).join('')}
                
                <li class="dropup-wrapper">
                    <button class="nav-link" style="color: var(--neon-pink); border: 1px dashed rgba(255, 63, 126, 0.4);" onclick="window.toggleProjectHub(event)">
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

    // 4. 전역 토글 핸들러 바인딩 (바깥 구역 클릭 시 자동 닫힘 안전장치 내장)
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

    // 활성 탭 스크롤 포커싱 기믹 유지
    const activeBtn = navContainer.querySelector('.nav-link.active');
    if (activeBtn) {
        setTimeout(() => {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 150);
    }
});