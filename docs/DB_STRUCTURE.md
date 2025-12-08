# 데이터베이스 구조 및 초기화 가이드

## 📊 데이터베이스 구조

### 1. users (사용자 테이블)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**용도**: 사용자 계정 정보 저장
- `id`: 사용자 고유 ID
- `email`: 이메일 (고유)
- `password_hash`: 해시된 비밀번호
- `username`: 사용자명
- `created_at`, `updated_at`: 생성/수정 시간

---

### 2. quizzes (퀴즈 테이블)
```sql
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    thumbnail_url TEXT,
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**용도**: 퀴즈 기본 정보 저장
- `id`: 퀴즈 고유 ID
- `title`: 퀴즈 제목
- `description`: 퀴즈 설명
- `category`: 카테고리 ('normal', 'worldcup', 'balance', 'test', 'machugi')
- `creator_id`: 생성자 ID (users 테이블 참조)
- `thumbnail_url`: 썸네일 이미지 URL
- `play_count`: 플레이 횟수

---

### 3. questions (문제 테이블)
```sql
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,  -- 또는 content (마추기 폴더 호환)
    image_url TEXT,
    correct_answer INTEGER,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**용도**: 일반 퀴즈/마추기 퀴즈 문제 저장
- `id`: 문제 고유 ID
- `quiz_id`: 퀴즈 ID (quizzes 테이블 참조)
- `question_text` 또는 `content`: 문제 내용
- `image_url`: 문제 이미지 URL
- `correct_answer`: 정답 인덱스 (0, 1, 2, 3)
- `question_order`: 문제 순서

**참고**: 마추기 폴더는 `content` 컬럼을 사용합니다.

---

### 4. options (선택지 테이블)
```sql
CREATE TABLE options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**용도**: 일반 퀴즈의 선택지 저장
- `id`: 선택지 고유 ID
- `question_id`: 문제 ID (questions 테이블 참조)
- `option_text`: 선택지 텍스트
- `option_order`: 선택지 순서 (0, 1, 2, 3)

---

### 5. worldcup_candidates (월드컵 후보 테이블)
```sql
CREATE TABLE worldcup_candidates (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    candidate_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**용도**: 월드컵 퀴즈의 후보 저장
- `id`: 후보 고유 ID
- `quiz_id`: 퀴즈 ID (quizzes 테이블 참조)
- `name`: 후보 이름
- `image_url`: 후보 이미지 URL
- `candidate_order`: 후보 순서

---

### 6. balance_items (밸런스 게임 문항 테이블)
```sql
CREATE TABLE balance_items (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    image_a_url TEXT,
    image_b_url TEXT,
    item_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**용도**: 밸런스 게임 문항 저장
- `id`: 문항 고유 ID
- `quiz_id`: 퀴즈 ID (quizzes 테이블 참조)
- `option_a`: 선택지 A
- `option_b`: 선택지 B
- `image_a_url`: 선택지 A 이미지 URL
- `image_b_url`: 선택지 B 이미지 URL
- `item_order`: 문항 순서

---

### 7. personality_questions (성격 테스트 질문 테이블)
```sql
CREATE TABLE personality_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    type_a VARCHAR(50),
    type_b VARCHAR(50),
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**용도**: 성격 테스트 질문 저장
- `id`: 질문 고유 ID
- `quiz_id`: 퀴즈 ID (quizzes 테이블 참조)
- `question_text`: 질문 내용
- `option_a`: 선택지 A
- `option_b`: 선택지 B
- `type_a`: 선택지 A의 유형 (예: 'I', 'J', 'T')
- `type_b`: 선택지 B의 유형 (예: 'E', 'P', 'F')
- `question_order`: 질문 순서

---

### 8. quiz_results (퀴즈 결과 테이블)
```sql
CREATE TABLE quiz_results (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    score INTEGER,
    result_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**용도**: 퀴즈 플레이 결과 저장
- `id`: 결과 고유 ID
- `quiz_id`: 퀴즈 ID (quizzes 테이블 참조)
- `user_id`: 사용자 ID (users 테이블 참조, NULL 가능)
- `score`: 점수
- `result_data`: 결과 상세 정보 (JSON 형식)

---

## 🔄 데이터베이스 초기화 방법

### 방법 1: API 엔드포인트 사용 (추천)

서버가 실행 중일 때:

**브라우저에서:**
```
http://localhost:3000/api/init-db
```

**또는 curl 명령어:**
```bash
curl -X POST http://localhost:3000/api/init-db
```

**또는 JavaScript:**
```javascript
fetch('http://localhost:3000/api/init-db', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log(data));
```

---

### 방법 2: 직접 SQL 실행

PostgreSQL 클라이언트로 연결:
```bash
psql -h machugi-db.cniigc2sgexq.ap-south-1.rds.amazonaws.com \
     -p 5432 \
     -U postgres \
     -d postgres
```

그 다음:
```sql
\i config/init.sql
```

또는 SQL 파일 내용을 직접 복사해서 실행

---

### 방법 3: Node.js 스크립트 실행

```bash
node -e "
const pool = require('./config/database');
const fs = require('fs');
const sql = fs.readFileSync('./config/init.sql', 'utf8');
pool.query(sql).then(() => {
  console.log('✅ 초기화 완료');
  process.exit(0);
}).catch(err => {
  console.error('❌ 오류:', err);
  process.exit(1);
});
"
```

---

## 📋 현재 데이터베이스 상태

현재 존재하는 테이블:
- ✅ `users` (3개 행)
- ✅ `quizzes` (9개 행)
- ✅ `questions` (340개 행)

현재 존재하지 않는 테이블:
- ❌ `options`
- ❌ `worldcup_candidates`
- ❌ `balance_items`
- ❌ `personality_questions`
- ❌ `quiz_results`

**참고**: 일부 테이블이 없어도 기존 데이터(questions 테이블)는 정상 작동합니다.
마추기 폴더는 `questions` 테이블의 `content` 컬럼을 사용합니다.

---

## 🔍 테이블 관계도

```
users
  └── quizzes (creator_id)
       ├── questions (quiz_id)
       │    └── options (question_id)
       ├── worldcup_candidates (quiz_id)
       ├── balance_items (quiz_id)
       ├── personality_questions (quiz_id)
       └── quiz_results (quiz_id, user_id)
```

---

## 📝 인덱스

성능 향상을 위한 인덱스:
- `idx_quizzes_category`: 퀴즈 카테고리 검색
- `idx_quizzes_creator`: 생성자별 퀴즈 검색
- `idx_questions_quiz`: 퀴즈별 문제 검색
- `idx_options_question`: 문제별 선택지 검색
- `idx_worldcup_quiz`: 월드컵 후보 검색
- `idx_balance_quiz`: 밸런스 게임 문항 검색
- `idx_personality_quiz`: 성격 테스트 질문 검색
- `idx_results_quiz`: 퀴즈별 결과 검색

---

## ⚠️ 주의사항

1. **초기화 시 기존 데이터**: `CREATE TABLE IF NOT EXISTS`를 사용하므로 기존 데이터는 유지됩니다.
2. **마추기 폴더 호환성**: `questions` 테이블은 `content` 컬럼을 사용합니다.
3. **외래 키 제약**: 퀴즈를 삭제하면 관련 문제/결과도 함께 삭제됩니다 (CASCADE).
4. **데이터 백업**: 초기화 전에 중요한 데이터가 있다면 백업하세요.

---

## 🛠️ 유용한 명령어

```bash
# DB 상태 확인
npm run check-db

# DB 상태 API 확인
curl http://localhost:3000/api/db-status

# 특정 테이블 구조 확인
curl http://localhost:3000/api/db-schema/quizzes
```

