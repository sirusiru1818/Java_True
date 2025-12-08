// 데이터베이스 연결 및 데이터 확인 스크립트
const pool = require('./config/database');
require('dotenv').config();

async function checkDatabase() {
  console.log('='.repeat(60));
  console.log('📊 데이터베이스 확인 시작');
  console.log('='.repeat(60));
  
  // 1. 연결 정보 확인
  console.log('\n1️⃣ 연결 정보 확인:');
  console.log(`   Host: ${process.env.DB_HOST || 'machugi-db.cniigc2sgexq.ap-south-1.rds.amazonaws.com'}`);
  console.log(`   Port: ${process.env.DB_PORT || 5432}`);
  console.log(`   Database: ${process.env.DB_NAME || 'postgres'}`);
  console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
  console.log(`   Password: ${process.env.DB_PASSWORD ? '***설정됨***' : '❌ 설정되지 않음'}`);
  
  // 2. 연결 테스트
  console.log('\n2️⃣ 연결 테스트:');
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('   ✅ 데이터베이스 연결 성공!');
    console.log(`   현재 시간: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL 버전: ${result.rows[0].pg_version.split(',')[0]}`);
  } catch (error) {
    console.log('   ❌ 데이터베이스 연결 실패!');
    console.log(`   오류: ${error.message}`);
    process.exit(1);
  }
  
  // 3. 테이블 존재 확인
  console.log('\n3️⃣ 테이블 존재 확인:');
  const tables = [
    'users', 'quizzes', 'questions', 'options', 
    'worldcup_candidates', 'balance_items', 
    'personality_questions', 'quiz_results'
  ];
  
  for (const table of tables) {
    try {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);
      
      if (result.rows[0].exists) {
        // 테이블의 행 수 확인
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = countResult.rows[0].count;
        console.log(`   ✅ ${table}: 존재 (${count}개 행)`);
      } else {
        console.log(`   ❌ ${table}: 존재하지 않음`);
      }
    } catch (error) {
      console.log(`   ❌ ${table}: 확인 실패 - ${error.message}`);
    }
  }
  
  // 4. 퀴즈 데이터 확인
  console.log('\n4️⃣ 퀴즈 데이터 확인:');
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM quizzes');
    const count = parseInt(result.rows[0].count);
    console.log(`   총 퀴즈 수: ${count}개`);
    
    if (count > 0) {
      const quizzes = await pool.query('SELECT id, title, category, created_at FROM quizzes ORDER BY id LIMIT 5');
      console.log('\n   최근 퀴즈 목록:');
      quizzes.rows.forEach(q => {
        console.log(`   - [${q.id}] ${q.title} (${q.category}) - ${q.created_at}`);
      });
    } else {
      console.log('   ⚠️  퀴즈 데이터가 없습니다.');
    }
  } catch (error) {
    console.log(`   ❌ 퀴즈 데이터 확인 실패: ${error.message}`);
  }
  
  // 5. 문제 데이터 확인
  console.log('\n5️⃣ 문제 데이터 확인:');
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM questions');
    const count = parseInt(result.rows[0].count);
    console.log(`   총 문제 수: ${count}개`);
    
    if (count > 0) {
      // content 또는 question_text 컬럼 확인
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'questions' 
        AND column_name IN ('content', 'question_text')
        LIMIT 1
      `);
      const textColumn = columnCheck.rows[0]?.column_name || 'content';
      
      const questions = await pool.query(`
        SELECT q.id, q.quiz_id, q.${textColumn} as question_content, qz.title as quiz_title 
        FROM questions q 
        LEFT JOIN quizzes qz ON q.quiz_id = qz.id 
        ORDER BY q.id LIMIT 5
      `);
      console.log('\n   최근 문제 목록:');
      questions.rows.forEach(q => {
        const content = q.question_content || '';
        console.log(`   - [${q.id}] ${content.substring(0, 30)}... (퀴즈: ${q.quiz_title || q.quiz_id})`);
      });
    } else {
      console.log('   ⚠️  문제 데이터가 없습니다.');
    }
  } catch (error) {
    console.log(`   ❌ 문제 데이터 확인 실패: ${error.message}`);
  }
  
  // 6. 사용자 데이터 확인
  console.log('\n6️⃣ 사용자 데이터 확인:');
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    const count = parseInt(result.rows[0].count);
    console.log(`   총 사용자 수: ${count}명`);
    
    if (count > 0) {
      const users = await pool.query('SELECT id, username, email, created_at FROM users ORDER BY id LIMIT 5');
      console.log('\n   최근 사용자 목록:');
      users.rows.forEach(u => {
        console.log(`   - [${u.id}] ${u.username || 'N/A'} (${u.email || 'N/A'}) - ${u.created_at}`);
      });
    } else {
      console.log('   ⚠️  사용자 데이터가 없습니다.');
    }
  } catch (error) {
    console.log(`   ❌ 사용자 데이터 확인 실패: ${error.message}`);
  }
  
  // 7. 마추기 폴더 호환성 확인 (content 컬럼)
  console.log('\n7️⃣ 마추기 폴더 호환성 확인:');
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'questions' 
      AND column_name IN ('content', 'question_text')
    `);
    const columns = result.rows.map(r => r.column_name);
    console.log(`   questions 테이블 컬럼: ${columns.join(', ')}`);
    
    if (columns.includes('content')) {
      console.log('   ✅ content 컬럼 존재 (마추기 폴더 호환)');
    } else if (columns.includes('question_text')) {
      console.log('   ✅ question_text 컬럼 존재 (기본 스키마)');
      console.log('   ⚠️  content 컬럼이 없습니다. 마추기 폴더 호환을 위해 추가가 필요할 수 있습니다.');
    }
  } catch (error) {
    console.log(`   ❌ 컬럼 확인 실패: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ 데이터베이스 확인 완료');
  console.log('='.repeat(60));
  
  await pool.end();
}

// 실행
checkDatabase().catch(error => {
  console.error('❌ 오류 발생:', error);
  process.exit(1);
});

