// API 엔드포인트 테스트 스크립트
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

async function testAPI() {
  console.log('='.repeat(60));
  console.log('🧪 API 엔드포인트 테스트');
  console.log('='.repeat(60));
  
  // 1. 퀴즈 목록 조회
  console.log('\n1️⃣ GET /api/quizzes');
  try {
    const response = await fetch(`${API_BASE}/api/quizzes`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    if (data.success !== undefined) {
      console.log(`   Success: ${data.success}`);
      console.log(`   퀴즈 수: ${data.quizzes?.length || 0}개`);
      if (data.quizzes && data.quizzes.length > 0) {
        console.log(`   첫 번째 퀴즈: ${data.quizzes[0].title}`);
      }
    } else if (Array.isArray(data)) {
      console.log(`   퀴즈 수: ${data.length}개`);
      if (data.length > 0) {
        console.log(`   첫 번째 퀴즈: ${data[0].title}`);
      }
    } else {
      console.log(`   응답:`, JSON.stringify(data).substring(0, 200));
    }
  } catch (error) {
    console.log(`   ❌ 오류: ${error.message}`);
    console.log(`   서버가 실행 중인지 확인하세요: npm start`);
  }
  
  // 2. 특정 퀴즈 조회
  console.log('\n2️⃣ GET /api/quizzes/:id');
  try {
    const response = await fetch(`${API_BASE}/api/quizzes/1`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    if (data.error) {
      console.log(`   ⚠️  ${data.error}`);
    } else {
      console.log(`   퀴즈 ID: ${data.id}`);
      console.log(`   제목: ${data.title}`);
      console.log(`   문제 수: ${data.questions?.length || 0}개`);
    }
  } catch (error) {
    console.log(`   ❌ 오류: ${error.message}`);
  }
  
  // 3. 문제 조회 (마추기 폴더 형식)
  console.log('\n3️⃣ GET /api/quiz/:id/questions');
  try {
    const response = await fetch(`${API_BASE}/api/quiz/1/questions?count=5`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${data.success}`);
    console.log(`   문제 수: ${data.questions?.length || 0}개`);
    if (data.questions && data.questions.length > 0) {
      console.log(`   첫 번째 문제: ${data.questions[0].content || data.questions[0].question_text || 'N/A'}`);
    }
  } catch (error) {
    console.log(`   ❌ 오류: ${error.message}`);
  }
  
  // 4. 로그인 상태 확인
  console.log('\n4️⃣ GET /api/check-login');
  try {
    const response = await fetch(`${API_BASE}/api/check-login`, {
      credentials: 'include'
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   로그인 상태: ${data.loggedIn ? '✅ 로그인됨' : '❌ 로그인 안됨'}`);
  } catch (error) {
    console.log(`   ❌ 오류: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ API 테스트 완료');
  console.log('='.repeat(60));
}

// node-fetch가 없으면 경고
try {
  require('node-fetch');
  testAPI();
} catch (error) {
  console.log('⚠️  node-fetch가 설치되지 않았습니다.');
  console.log('   브라우저 콘솔에서 다음 코드를 실행하세요:\n');
  console.log(`
fetch('http://localhost:3000/api/quizzes')
  .then(r => r.json())
  .then(data => console.log('퀴즈 목록:', data))
  .catch(err => console.error('오류:', err));
  `);
}

