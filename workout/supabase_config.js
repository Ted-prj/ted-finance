const SUPABASE_URL = 'https://vaamifqzjsrflmprihgv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhYW1pZnF6anNyZmxtcHJpaGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODc2NzksImV4cCI6MjA5MTk2MzY3OX0.qUUs3aoWQMEVjTQkYTZtA8CMjMF_MrgBFa4UfiiEWzI';
const _db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 공통 인증 체크 함수
function checkAuth() {
    if (sessionStorage.getItem('workout_auth') !== 'true') {
        window.location.href = 'index.html';
    }
}

// 스마트 데이트 (새벽 6시 기준)
function getSmartDate() {
    const now = new Date();
    if(now.getHours() < 6 && confirm("새벽입니다. 어제 날짜로 기록할까요?")) now.setDate(now.getDate() - 1);
    return {
        full: now.toISOString(),
        justDate: now.toISOString().split('T')[0],
        idStr: now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0')
    };
}

// 부위별 색상 키
function getPartKey(b) {
    if (b && b.includes('가슴')) return 'chest';
    if (b && b.includes('등')) return 'back';
    if (b && b.includes('어깨')) return 'shoulder';
    if (b && b.includes('하체')) return 'leg';
    return 'etc';
}

// 상세 통계 조회 (BEST & Last)
async function getDetailedStats(exId, setNo = null) {
    const { data } = await _db.schema('workout').from('logs').select('*').eq('exercise_id', exId).eq('status', 'FINAL').order('workout_date', {ascending:false});
    if(!data || data.length === 0) return { best: '-', bestLog: {date:'-', note:''}, recentConfigs: [], lastStr: '-', lastNote: '' };
    
    const bestLog = data.reduce((a, b) => {
        const volA = (a.weight * a.reps) || a.workout_time;
        const volB = (b.weight * b.reps) || b.workout_time;
        return volA >= volB ? a : b;
    });
    
    const lastLog = setNo ? data.find(d => d.set_no === setNo) : data[0];
    const format = (l) => l ? (l.weight ? `${l.weight}x${l.reps}` : `${l.workout_time}m`) : '-';
    const configs = [...new Set(data.slice(0,10).map(l => `${l.equipment_type||''}/${l.grip_type||''}`.replace(/\/$/,'')))].slice(0,3);
    
    return { 
        best: format(bestLog), 
        bestLog: { 
            date: bestLog.workout_date.split('T')[0], 
            note: bestLog.note, weight: bestLog.weight, reps: bestLog.reps, 
            time: bestLog.workout_time, equip: bestLog.equipment_type, 
            grip: bestLog.grip_type, lying: bestLog.lying_type 
        }, 
        recentConfigs: configs, 
        lastStr: format(lastLog), 
        lastNote: lastLog?.note || '' 
    };
}

/* ==========================================================================
   📱 WORKOUT 앱 전역 모바일 횡방향 스크롤 내비게이션 및 드롭업 멀티 허브 엔진
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('global-nav');
    if (!navContainer) return;

    // 1. WORKOUT 서브 앱 내부에서 순환할 로컬 탭 메뉴 리스트
    const LOCAL_MENUS = [
        { id: 'workout', name: 'WORKOUT', url: 'workout.html' },
        { id: 'manage', name: 'MANAGE', url: 'manage.html' },
        { id: 'settings', name: 'SETTINGS', url: 'settings.html' },
        { id: 'dashboard', name: 'DASHBOARD', url: 'dashboard.html' },
        { id: 'logs', name: 'LOGS', url: 'logs.html' }
    ];

    // 2. 버튼 클릭 시 위로 확장 팝업될 깃허브 하브 프로젝트 연대기 리스트
    // 부모 디렉토리 탈출 상대경로(../) 매핑 구조를 취해 환경 무결성 완벽 사수!
    const HUB_PROJECTS = [
        { name: '🥗 DIET HUB', url: '../diet/index.html' },
        { name: '💰 FINANCE HUB', url: '../finance/index.html' },
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
        /* 다이어트 테마의 핑크 포인트 무드를 안전하게 소프트 매칭 */
        .dropup-item:hover, .dropup-item:active { background: rgba(232, 142, 163, 0.15); color: #e88ea3; }
        .dropup-item:not(:last-child) { border-bottom: 1px solid #222; }
    `;
    document.head.appendChild(inlineStyle);

    // 3. 모바일 하단 탭바 뼈대 HTML 렌더링
    const navHtml = `
        <div class="bottom-nav-container">
            <ul class="nav nav-pills" style="position: relative;">
                ${LOCAL_MENUS.map(menu => `
                    <li class="nav-item">
                        <a href="${menu.url}" class="nav-link ${menu.id === activeId ? 'active' : ''}">
                            ${menu.name}
                        </a>
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

    // 4. 전역 팝업 토글 & 바깥 영역 터치 시 자동 닫힘 최적화 기믹
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

    // 현재 활성화된 탭 위치 자동 가로 스크롤 보정
    const activeBtn = navContainer.querySelector('.nav-link.active');
    if (activeBtn) {
        setTimeout(() => {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 150);
    }
});