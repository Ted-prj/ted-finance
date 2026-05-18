/* =========================================================================
   [독한녀들 Book Club - Supabase 공통 설정 및 클라이언트]
   설명: 선장이 제공한 URL과 Key를 바탕으로 bookclub 스키마 클라이언트를 생성하고,
         인증 및 공통 세션 유틸리티를 관리하는 파일
   ========================================================================= */

const SUPABASE_URL = 'https://vaamifqzjsrflmprihgv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhYW1pZnF6anNyZmxtcHJpaGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODc2NzksImV4cCI6MjA5MTk2MzY3OX0.qUUs3aoWQMEVjTQkYTZtA8CMjMF_MrgBFa4UfiiEWzI';

// 선장의 요청에 따라 _db 변수명으로 bookclub 스키마 클라이언트 지정 생성
const _db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    db: { schema: 'bookclub' }
});

// 독서토론 아지트 공통 인증 체크 함수
function checkAuth() {
    if (!localStorage.getItem('login_member')) {
        window.location.href = 'index.html';
    }
}

// 로그아웃 처리 함수
function handleLogout() {
    localStorage.removeItem('login_member');
    window.location.href = 'index.html';
}

// 현재 로그인한 멤버 이름 가져오기
function getLoggedInMember() {
    return localStorage.getItem('login_member') || '';
}