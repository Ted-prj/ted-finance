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
   📱 WORKOUT 앱 전역 모바일 하단 고정 탭바 및 드롭업 멀티 허브 엔진 (레이아웃 분리형)
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('global-nav');
    if (!navContainer) return;

    const LOCAL_MENUS = [
        { id: 'workout', name: 'WORKOUT', url: 'workout.html' },
        { id: 'manage', name: 'MANAGE', url: 'manage.html' },
        { id: 'settings', name: 'SETTINGS', url: 'settings.html' },
        { id: 'dashboard', name: 'DASHBOARD', url: 'dashboard.html' },
        { id: 'logs', name: 'LOGS', url: 'logs.html' }
    ];

    const HUB_PROJECTS = [
        { name: '🥗 DIET HUB', url: '../diet/index.html' },
        { name: '💰 FINANCE HUB', url: '../finance/index.html' },
        { name: '📚 BOOKCLUB HUB', url: '../bookclub/index.html' }
    ];

    const activeId = navContainer.getAttribute('data-active');

    const inlineStyle = document.createElement('style');
    inlineStyle.innerHTML = `
        .bottom-nav-container {
            display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 8px !important;
        }
        .nav-scroll-box { flex: 1 !important; overflow-x: auto !important; width: 100% !important; }
        .nav-scroll-box::-webkit-scrollbar { display: none !important; }
        .nav-scroll-box .nav-pills { flex-wrap: nowrap !important; display: flex !important; padding: 0 !important; margin: 0 !important; list-style: none !important; }
        .nav-scroll-box .nav-item { flex: 1 0 auto !important; min-width: 85px !important; text-align: center !important; }
        
        .dropup-wrapper { position: relative !important; flex: 0 0 auto !important; z-index: 1060 !important; }
        .hub-toggle-btn {
            color: #ff3f7e !important; border: 1px dashed rgba(255, 63, 126, 0.6) !important;
            background: rgba(255, 63, 126, 0.05) !important; font-weight: 900 !important; border-radius: 12px !important;
            padding: 8px 12px !important; font-size: 0.72rem !important; white-space: nowrap !important; transition: 0.2s !important;
        }
        .hub-toggle-btn:active { background: rgba(255, 63, 126, 0.2) !important; }
        
        .dropup-menu-container {
            position: absolute !important; bottom: calc(100% + 12px) !important; right: 0 !important;
            background: rgba(18, 18, 18, 0.98) !important; backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important;
            border: 1px solid #282828 !important; border-radius: 16px !important; min-width: 160px !important;
            padding: 8px 0 !important; opacity: 0 !important; transform: translateY(10px) !important; visibility: hidden !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7) !important; z-index: 1100 !important;
        }
        .dropup-menu-container.show { opacity: 1 !important; transform: translateY(0) !important; visibility: visible !important; }
        .dropup-item {
            display: block !important; width: 100% !important; padding: 12px 16px !important; text-align: left !important;
            color: #ccc !important; font-weight: 700 !important; font-size: 0.75rem !important; border: none !important;
            background: transparent !important; text-decoration: none !important; transition: 0.2s !important;
        }
        .dropup-item:hover, .dropup-item:active { background: rgba(232, 142, 163, 0.15) !important; color: #e88ea3 !important; }
        .dropup-item:not(:last-child) { border-bottom: 1px solid #222 !important; }
    `;
    document.head.appendChild(inlineStyle);

    const navHtml = `
        <div class="bottom-nav-container">
            <div class="nav-scroll-box">
                <ul class="nav nav-pills">
                    ${LOCAL_MENUS.map(menu => `
                        <li class="nav-item">
                            <a href="${menu.url}" class="nav-link ${menu.id === activeId ? 'active' : ''}">
                                ${menu.name}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="dropup-wrapper">
                <button class="hub-toggle-btn" onclick="window.toggleProjectHub(event)">
                    HUB 🚀
                </button>
                <div id="project-dropup-menu" class="dropup-menu-container">
                    ${HUB_PROJECTS.map(proj => `
                        <a href="${proj.url}" class="dropup-item">${proj.name}</a>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    navContainer.innerHTML = navHtml;

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

    const activeBtn = navContainer.querySelector('.nav-link.active');
    if (activeBtn) {
        setTimeout(() => {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 150);
    }
});