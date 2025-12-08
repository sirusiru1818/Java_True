-- 마추기 퀴즈 플랫폼 데이터베이스 스키마

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 퀴즈 테이블
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'normal', 'worldcup', 'balance', 'test'
    creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    thumbnail_url TEXT,
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 문제 테이블 (일반 퀴즈용)
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    image_url TEXT,
    correct_answer INTEGER, -- 선택지 인덱스 (0, 1, 2, 3)
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 선택지 테이블
CREATE TABLE IF NOT EXISTS options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 월드컵 후보 테이블
CREATE TABLE IF NOT EXISTS worldcup_candidates (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    candidate_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 밸런스 게임 문항 테이블
CREATE TABLE IF NOT EXISTS balance_items (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    image_a_url TEXT,
    image_b_url TEXT,
    item_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 성격 테스트 질문 테이블
CREATE TABLE IF NOT EXISTS personality_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    type_a VARCHAR(50), -- 유형 A (예: 'I', 'J', 'T')
    type_b VARCHAR(50), -- 유형 B (예: 'E', 'P', 'F')
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 퀴즈 결과 테이블
CREATE TABLE IF NOT EXISTS quiz_results (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    score INTEGER,
    result_data JSONB, -- 결과 상세 정보 (JSON 형식)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quizzes_creator ON quizzes(creator_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_options_question ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_worldcup_quiz ON worldcup_candidates(quiz_id);
CREATE INDEX IF NOT EXISTS idx_balance_quiz ON balance_items(quiz_id);
CREATE INDEX IF NOT EXISTS idx_personality_quiz ON personality_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_results_quiz ON quiz_results(quiz_id);


