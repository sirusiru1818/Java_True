/* 파일명: server.js */
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const session = require('express-session');
const path = require('path'); // [추가됨] 파일 경로를 다루기 위한 도구
const app = express();
const port = 3000;

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], 
    credentials: true
}));

app.use(express.json());

// 1. public 폴더를 정적 파일 경로로 설정 (이미지 로딩용)
app.use(express.static('public'));

app.use(session({
    secret: 'machugi_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
}));

// [AWS RDS 연결]
const pool = new Pool({
    user: 'postgres',
    host: 'machugi-db.cniigc2sgexq.ap-south-1.rds.amazonaws.com', 
    database: 'postgres',
    password: 'qwer1234', 
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

pool.connect((err) => {
    if (err) console.error("❌ DB 연결 실패:", err.message);
    else console.log("📂 AWS RDS 연결 성공!");
});

/* ================================================= */
/* ▼▼▼ [핵심 수정] 메인 페이지 연결 코드 추가 ▼▼▼ */
/* ================================================= */

// 사용자가 'http://localhost:3000' 으로 접속하면 index.html을 보여줌
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/* ================================================= */


/* ================= API ================= */

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

app.get('/api/quizzes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM quizzes ORDER BY id ASC');
        res.json({ success: true, quizzes: result.rows });
    } catch (err) {
        res.json({ success: false, message: "목록 로딩 실패" });
    }
});

app.get('/api/quiz/:id/questions', async (req, res) => {
    const quizId = req.params.id;
    const count = req.query.count; 
    try {
        let query = 'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY RANDOM()';
        const params = [quizId];
        if (count && count !== 'all') {
            query += ' LIMIT $2';
            params.push(parseInt(count));
        }
        const result = await pool.query(query, params);
        res.json({ success: true, questions: result.rows });
    } catch (err) {
        res.json({ success: false, message: "문제 로딩 실패" });
    }
});

app.listen(port, () => {
    console.log(`🚀 서버 실행: http://localhost:${port}`);
});