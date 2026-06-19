// TED'S UNIVERSE - Global Gateway Application Configuration (SSO 마스터 키 통합판)
const GATEWAY_APPS = [
    {
        id: 'FINANCE',
        title: 'FINANCE',
        desc: '자산 및 가계부 관리 (by Nami)',
        icon: '🖤',
        color: 'rgb(232, 142, 163)', 
        sessionKey: 'ted_universe_auth', 
        targetUrl: 'finance/out.html'
    },
    {
        id: 'DIET',
        title: 'DIET',
        desc: '식단 및 체중 관리 (by Sanji)',
        icon: '🥗',
        color: '#20c997', 
        sessionKey: 'ted_universe_auth', 
        targetUrl: 'diet/export.html'
    },
    {
        id: 'WORKOUT',
        title: 'WORKOUT',
        desc: '루틴 및 운동 기록 (by Robin)',
        icon: '💪',
        color: '#ff6b6b', 
        sessionKey: 'ted_universe_auth', 
        targetUrl: 'workout/workout.html'
    }
];