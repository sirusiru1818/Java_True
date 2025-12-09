const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function addChickenQuiz() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 관리자 계정 ID 가져오기
    const adminResult = await client.query("SELECT id FROM users WHERE username = 'asdf'");
    const adminId = adminResult.rows[0]?.id || null;
    
    console.log('📁 치킨 폴더에서 이미지 읽기 시작...');
    
    // 치킨 폴더 처리
    const chickenFolder = path.join(__dirname, '..', '치킨');
    const chickenFiles = fs.readdirSync(chickenFolder)
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => ({
        name: path.parse(file).name,
        path: path.join(chickenFolder, file)
      }));
    
    console.log(`\n🍗 치킨 폴더: ${chickenFiles.length}개 이미지 발견`);
    
    // 치킨 퀴즈 생성
    const chickenQuizResult = await client.query(
      `INSERT INTO quizzes (title, description, category, creator_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['치킨 맞추기', '다양한 치킨 메뉴를 보고 이름을 맞춰보세요!', 'machugi', adminId]
    );
    const chickenQuizId = chickenQuizResult.rows[0].id;
    
    console.log(`✅ 치킨 퀴즈 생성 완료 (ID: ${chickenQuizId})`);
    
    // 치킨 이미지들을 문제로 추가
    for (let i = 0; i < chickenFiles.length; i++) {
      const file = chickenFiles[i];
      const imageBuffer = fs.readFileSync(file.path);
      const answer = file.name; // 파일명이 정답
      
      await client.query(
        `INSERT INTO questions (quiz_id, content, image_data)
         VALUES ($1, $2, $3)`,
        [chickenQuizId, answer, imageBuffer]
      );
      
      console.log(`  ✅ ${i + 1}/${chickenFiles.length}: ${answer}`);
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ 치킨 퀴즈 구축 완료!');
    console.log(`   - 치킨 퀴즈: ${chickenFiles.length}개 문제`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 스크립트 실행
addChickenQuiz()
  .then(() => {
    console.log('\n🎉 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 실패:', error);
    process.exit(1);
  });

