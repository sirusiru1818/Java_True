const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function buildQuizzesFromFolders() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 관리자 계정 ID 가져오기
    const adminResult = await client.query("SELECT id FROM users WHERE username = 'asdf'");
    const adminId = adminResult.rows[0]?.id || null;
    
    console.log('📁 폴더에서 이미지 읽기 시작...');
    
    // 국가 폴더 처리
    const countryFolder = path.join(__dirname, '..', '국가');
    const countryFiles = fs.readdirSync(countryFolder)
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => ({
        name: path.parse(file).name,
        path: path.join(countryFolder, file)
      }));
    
    console.log(`\n🌍 국가 폴더: ${countryFiles.length}개 이미지 발견`);
    
    // 국가 퀴즈 생성
    const countryQuizResult = await client.query(
      `INSERT INTO quizzes (title, description, category, creator_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['국가 맞추기', '세계 각국의 국기를 보고 국가 이름을 맞춰보세요!', 'machugi', adminId]
    );
    const countryQuizId = countryQuizResult.rows[0].id;
    
    // 국가 이미지들을 문제로 추가
    for (let i = 0; i < countryFiles.length; i++) {
      const file = countryFiles[i];
      const imageBuffer = fs.readFileSync(file.path);
      const answer = file.name; // 파일명이 정답
      
      await client.query(
        `INSERT INTO questions (quiz_id, content, image_data)
         VALUES ($1, $2, $3)`,
        [countryQuizId, answer, imageBuffer]
      );
      
      console.log(`  ✅ ${i + 1}/${countryFiles.length}: ${answer}`);
    }
    
    // 애니캐릭터 폴더 처리
    const animeFolder = path.join(__dirname, '..', '애니캐릭터');
    const animeFiles = fs.readdirSync(animeFolder)
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => ({
        name: path.parse(file).name,
        path: path.join(animeFolder, file)
      }));
    
    console.log(`\n🎭 애니캐릭터 폴더: ${animeFiles.length}개 이미지 발견`);
    
    // 애니캐릭터 퀴즈 생성
    const animeQuizResult = await client.query(
      `INSERT INTO quizzes (title, description, category, creator_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['애니캐릭터 맞추기', '애니메이션 캐릭터를 보고 이름을 맞춰보세요!', 'machugi', adminId]
    );
    const animeQuizId = animeQuizResult.rows[0].id;
    
    // 애니캐릭터 이미지들을 문제로 추가
    for (let i = 0; i < animeFiles.length; i++) {
      const file = animeFiles[i];
      const imageBuffer = fs.readFileSync(file.path);
      const answer = file.name; // 파일명이 정답
      
      await client.query(
        `INSERT INTO questions (quiz_id, content, image_data)
         VALUES ($1, $2, $3)`,
        [animeQuizId, answer, imageBuffer]
      );
      
      console.log(`  ✅ ${i + 1}/${animeFiles.length}: ${answer}`);
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ 퀴즈 구축 완료!');
    console.log(`   - 국가 퀴즈: ${countryFiles.length}개 문제`);
    console.log(`   - 애니캐릭터 퀴즈: ${animeFiles.length}개 문제`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 스크립트 실행
buildQuizzesFromFolders()
  .then(() => {
    console.log('\n🎉 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 실패:', error);
    process.exit(1);
  });

