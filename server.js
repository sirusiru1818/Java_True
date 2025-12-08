const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public'))); // public 폴더 정적 파일 서빙
app.use(express.static(path.join(__dirname, '마추기', 'public'))); // 마추기 폴더의 이미지

app.use(session({
  secret: process.env.SESSION_SECRET || 'machugi_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
}));

// 정적 파일 제공 (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ==================== API 라우트 ====================

// 1. 퀴즈 목록 조회
app.get('/api/quizzes', async (req, res) => {
  try {
    const { category, sort = 'latest' } = req.query;
    
    // 마추기 폴더 호환성을 위한 간단한 쿼리
    try {
      let query = `
        SELECT q.*, u.username as creator_name,
               COUNT(DISTINCT qr.id) as play_count
        FROM quizzes q
        LEFT JOIN users u ON q.creator_id = u.id
        LEFT JOIN quiz_results qr ON q.id = qr.quiz_id
      `;
      
      const params = [];
      if (category && category !== 'all') {
        query += ` WHERE q.category = $1`;
        params.push(category);
      }
      
      query += ` GROUP BY q.id, u.username`;
      
      if (sort === 'popular') {
        query += ` ORDER BY play_count DESC, q.created_at DESC`;
      } else {
        query += ` ORDER BY q.created_at DESC`;
      }
      
      const result = await pool.query(query, params);
      res.json({ success: true, quizzes: result.rows });
    } catch (dbError) {
      // 테이블이 없으면 빈 배열 반환
      console.log('테이블이 아직 생성되지 않았습니다. 빈 배열을 반환합니다.');
      res.json({ success: true, quizzes: [] });
    }
  } catch (error) {
    console.error('퀴즈 목록 조회 오류:', error);
    res.json({ success: false, message: '목록 로딩 실패' });
  }
});

// 2. 퀴즈 상세 조회
app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const quizType = req.query.type || 'normal';
    
    // 퀴즈 기본 정보
    const quizResult = await pool.query(
      'SELECT * FROM quizzes WHERE id = $1',
      [id]
    );
    
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: '퀴즈를 찾을 수 없습니다.' });
    }
    
    const quiz = quizResult.rows[0];
    let questions = [];
    
    // 카테고리별 데이터 조회
    if (quizType === 'normal') {
      const qResult = await pool.query(
        `SELECT q.*, 
         (SELECT json_agg(json_build_object('text', o.option_text, 'order', o.option_order) ORDER BY o.option_order)
          FROM options o WHERE o.question_id = q.id) as options
         FROM questions q 
         WHERE q.quiz_id = $1 
         ORDER BY q.question_order`,
        [id]
      );
      questions = qResult.rows;
    } else if (quizType === 'worldcup') {
      const wResult = await pool.query(
        'SELECT * FROM worldcup_candidates WHERE quiz_id = $1 ORDER BY candidate_order',
        [id]
      );
      questions = wResult.rows;
    } else if (quizType === 'balance') {
      const bResult = await pool.query(
        'SELECT * FROM balance_items WHERE quiz_id = $1 ORDER BY item_order',
        [id]
      );
      questions = bResult.rows;
    } else if (quizType === 'test') {
      const pResult = await pool.query(
        'SELECT * FROM personality_questions WHERE quiz_id = $1 ORDER BY question_order',
        [id]
      );
      questions = pResult.rows;
    }
    
    res.json({ ...quiz, questions });
  } catch (error) {
    console.error('퀴즈 상세 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 3. 퀴즈 생성
app.post('/api/quizzes', async (req, res) => {
  try {
    const { title, description, category, questions, creator_id } = req.body;
    
    // 퀴즈 생성
    const quizResult = await pool.query(
      `INSERT INTO quizzes (title, description, category, creator_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, category, creator_id || null]
    );
    
    const quizId = quizResult.rows[0].id;
    
    // 카테고리별 문제 저장
    if (category === 'normal' && questions) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const qResult = await pool.query(
          `INSERT INTO questions (quiz_id, question_text, image_url, correct_answer, question_order)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [quizId, q.question_text, q.image_url || null, q.correct_answer, i + 1]
        );
        
        const questionId = qResult.rows[0].id;
        
        // 선택지 저장
        if (q.options && Array.isArray(q.options)) {
          for (let j = 0; j < q.options.length; j++) {
            await pool.query(
              `INSERT INTO options (question_id, option_text, option_order)
               VALUES ($1, $2, $3)`,
              [questionId, q.options[j], j]
            );
          }
        }
      }
    } else if (category === 'worldcup' && questions) {
      for (let i = 0; i < questions.length; i++) {
        const c = questions[i];
        await pool.query(
          `INSERT INTO worldcup_candidates (quiz_id, name, image_url, candidate_order)
           VALUES ($1, $2, $3, $4)`,
          [quizId, c.name, c.image_url || null, i + 1]
        );
      }
    } else if (category === 'balance' && questions) {
      for (let i = 0; i < questions.length; i++) {
        const b = questions[i];
        await pool.query(
          `INSERT INTO balance_items (quiz_id, option_a, option_b, image_a_url, image_b_url, item_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [quizId, b.option_a, b.option_b, b.image_a_url || null, b.image_b_url || null, i + 1]
        );
      }
    } else if (category === 'test' && questions) {
      for (let i = 0; i < questions.length; i++) {
        const p = questions[i];
        await pool.query(
          `INSERT INTO personality_questions (quiz_id, question_text, option_a, option_b, type_a, type_b, question_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [quizId, p.question_text, p.option_a, p.option_b, p.type_a || null, p.type_b || null, i + 1]
        );
      }
    }
    
    res.json({ success: true, quiz_id: quizId });
  } catch (error) {
    console.error('퀴즈 생성 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 4. 퀴즈 결과 저장
app.post('/api/quizzes/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, score, result_data } = req.body;
    
    await pool.query(
      `INSERT INTO quiz_results (quiz_id, user_id, score, result_data)
       VALUES ($1, $2, $3, $4)`,
      [id, user_id || null, score || null, JSON.stringify(result_data || {})]
    );
    
    // 퀴즈 플레이 횟수 증가
    await pool.query(
      'UPDATE quizzes SET play_count = play_count + 1 WHERE id = $1',
      [id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('결과 저장 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 5. 사용자 회원가입 (JWT 기반 - 기존 API 유지)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const bcrypt = require('bcrypt');
    
    // 비밀번호 해시화
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username)
       VALUES ($1, $2, $3) RETURNING id, email, username`,
      [email, passwordHash, username]
    );
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // 중복 키 오류
      res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
    } else {
      console.error('회원가입 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  }
});

// 5-1. 사용자 로그인 (JWT 기반 - 기존 API 유지)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, username: user.username }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 6. 사용자 회원가입 (마추기 폴더 호환)
app.post('/api/signup', async (req, res) => {
  const { username, email, password, nickname } = req.body;
  if (!username || !email || !password || !nickname) return res.json({ success: false, message: "모든 정보를 입력해주세요." });

  try {
    const check = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2 OR nickname = $3', 
      [username, email, nickname]
    );
    if (check.rows.length > 0) return res.json({ success: false, message: "이미 존재하는 아이디, 이메일, 또는 닉네임입니다." });

    await pool.query(
      `INSERT INTO users (username, email, password, nickname) VALUES ($1, $2, $3, $4)`, 
      [username, email, password, nickname]
    );
    res.json({ success: true, message: "가입 완료!" });
  } catch (err) {
    res.json({ success: false, message: "서버 오류: " + err.message });
  }
});

// 7. 사용자 로그인 (세션 기반)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(`SELECT * FROM users WHERE username = $1 AND password = $2`, [username, password]);
    if (result.rows.length > 0) {
      req.session.user = result.rows[0];
      req.session.save(() => {
        res.json({ success: true, nickname: result.rows[0].nickname });
      });
    } else {
      res.json({ success: false, message: "아이디 또는 비밀번호가 틀렸습니다." });
    }
  } catch (err) {
    res.json({ success: false, message: "서버 오류: " + err.message });
  }
});

app.get('/api/check-login', (req, res) => {
  if (req.session.user) res.json({ loggedIn: true, user: req.session.user });
  else res.json({ loggedIn: false });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

app.post('/api/check-username', async (req, res) => {
  const { username } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) res.json({ success: false, message: "이미 사용 중인 아이디입니다." });
    else res.json({ success: true, message: "사용 가능한 아이디입니다." });
  } catch (err) { res.json({ success: false, message: "서버 오류" }); }
});

app.post('/api/find-account', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query('SELECT username, password FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) res.json({ success: true, username: result.rows[0].username, password: result.rows[0].password });
    else res.json({ success: false, message: "등록되지 않은 이메일입니다." });
  } catch (err) { res.json({ success: false, message: "서버 오류" }); }
});

// 8. 퀴즈 문제 조회 (마추기 폴더 호환)
app.get('/api/quiz/:id/questions', async (req, res) => {
  const quizId = req.params.id;
  const count = req.query.count; 
  try {
    // 먼저 퀴즈 카테고리 확인
    const quizResult = await pool.query('SELECT category FROM quizzes WHERE id = $1', [quizId]);
    if (quizResult.rows.length === 0) {
      return res.json({ success: false, message: "퀴즈를 찾을 수 없습니다." });
    }
    
    const category = quizResult.rows[0].category;
    let query, params;
    
    if (category === 'machugi' || category === 'normal') {
      query = 'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY RANDOM()';
      params = [quizId];
    } else if (category === 'worldcup') {
      query = 'SELECT * FROM worldcup_candidates WHERE quiz_id = $1 ORDER BY RANDOM()';
      params = [quizId];
    } else if (category === 'balance') {
      query = 'SELECT * FROM balance_items WHERE quiz_id = $1 ORDER BY RANDOM()';
      params = [quizId];
    } else {
      query = 'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY RANDOM()';
      params = [quizId];
    }
    
    if (count && count !== 'all') {
      query += ' LIMIT $2';
      params.push(parseInt(count));
    }
    
    const result = await pool.query(query, params);
    
    // 마추기 폴더 형식에 맞게 변환
    const questions = result.rows.map(q => {
      if (category === 'machugi' || category === 'normal') {
        return {
          id: q.id,
          content: q.question_text || q.content,
          image_url: q.image_url,
          correct_answer: q.correct_answer
        };
      } else if (category === 'worldcup') {
        return {
          id: q.id,
          content: q.name,
          image_url: q.image_url
        };
      } else if (category === 'balance') {
        return {
          id: q.id,
          content: q.content || '',
          choice_a: q.option_a,
          choice_b: q.option_b
        };
      }
      return q;
    });
    
    res.json({ success: true, questions });
  } catch (err) {
    console.error('문제 로딩 오류:', err);
    res.json({ success: false, message: "문제 로딩 실패" });
  }
});

// 데이터베이스 초기화 (개발용)
app.post('/api/init-db', async (req, res) => {
  try {
    const fs = require('fs');
    const sql = fs.readFileSync(path.join(__dirname, 'config', 'init.sql'), 'utf8');
    await pool.query(sql);
    res.json({ success: true, message: '데이터베이스 초기화 완료' });
  } catch (error) {
    console.error('DB 초기화 오류:', error);
    res.status(500).json({ error: '데이터베이스 초기화 실패', details: error.message });
  }
});

// 데이터베이스 상태 확인 API
app.get('/api/db-status', async (req, res) => {
  try {
    // 연결 테스트
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    
    // 테이블 목록 확인
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    const tables = tablesResult.rows.map(r => r.table_name);
    
    // 각 테이블의 행 수 확인
    const tableCounts = {};
    for (const table of tables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        tableCounts[table] = parseInt(countResult.rows[0].count);
      } catch (err) {
        tableCounts[table] = 'error';
      }
    }
    
    // 퀴즈 데이터 샘플
    let quizSample = [];
    try {
      const quizResult = await pool.query('SELECT id, title, category FROM quizzes LIMIT 5');
      quizSample = quizResult.rows;
    } catch (err) {
      // 테이블이 없을 수 있음
    }
    
    res.json({
      success: true,
      connected: true,
      currentTime: connectionTest.rows[0].current_time,
      tables: tables,
      tableCounts: tableCounts,
      quizSample: quizSample,
      message: '데이터베이스 연결 정상'
    });
  } catch (error) {
    res.json({
      success: false,
      connected: false,
      error: error.message,
      message: '데이터베이스 연결 실패'
    });
  }
});

// 테이블 구조 확인 API
app.get('/api/db-schema/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `, [table]);
    
    res.json({
      success: true,
      table: table,
      columns: result.rows
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// 마추기 카테고리 지원을 위한 questions 테이블에 content 컬럼 추가 확인
// (기존 question_text와 호환)

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`📊 데이터베이스: ${process.env.DB_HOST || 'machugi-db.cniigc2sgexq.ap-south-1.rds.amazonaws.com'}:${process.env.DB_PORT || 5432}`);
});

