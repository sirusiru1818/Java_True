# 데이터베이스 확인 가이드

데이터가 안 뜰 때 단계별로 확인하는 방법입니다.

## 1. 환경 변수 확인

`.env` 파일이 제대로 설정되어 있는지 확인:

```bash
cat .env
```

필수 항목:
- `DB_HOST=machugi-db.cniigc2sgexq.ap-south-1.rds.amazonaws.com`
- `DB_PORT=5432`
- `DB_NAME=postgres`
- `DB_USER=postgres`
- `DB_PASSWORD=실제_비밀번호`

## 2. 데이터베이스 연결 확인

### 방법 1: 스크립트 실행
```bash
node check-db.js
```

이 스크립트는 다음을 확인합니다:
- ✅ 데이터베이스 연결 상태
- ✅ 테이블 존재 여부
- ✅ 각 테이블의 데이터 개수
- ✅ 퀴즈/문제/사용자 데이터 샘플

### 방법 2: 브라우저에서 확인
서버 실행 후 브라우저에서 접속:
```
http://localhost:3000/api/db-status
```

## 3. 테이블 구조 확인

특정 테이블의 구조를 확인하려면:
```
http://localhost:3000/api/db-schema/quizzes
http://localhost:3000/api/db-schema/questions
http://localhost:3000/api/db-schema/users
```

## 4. 데이터베이스 초기화

테이블이 없거나 데이터가 없으면 초기화:

### 방법 1: 브라우저에서
```
http://localhost:3000/api/init-db
```
또는 POST 요청:
```bash
curl -X POST http://localhost:3000/api/init-db
```

### 방법 2: 직접 SQL 실행
PostgreSQL 클라이언트로 연결:
```bash
psql -h machugi-db.cniigc2sgexq.ap-south-1.rds.amazonaws.com -p 5432 -U postgres -d postgres
```

그 다음:
```sql
\i config/init.sql
```

## 5. API 엔드포인트 테스트

### 브라우저 콘솔에서 테스트:
```javascript
// 퀴즈 목록 조회
fetch('http://localhost:3000/api/quizzes')
  .then(r => r.json())
  .then(data => console.log('퀴즈 목록:', data))
  .catch(err => console.error('오류:', err));

// 데이터베이스 상태 확인
fetch('http://localhost:3000/api/db-status')
  .then(r => r.json())
  .then(data => console.log('DB 상태:', data))
  .catch(err => console.error('오류:', err));
```

### 터미널에서 테스트:
```bash
# 퀴즈 목록
curl http://localhost:3000/api/quizzes

# DB 상태
curl http://localhost:3000/api/db-status

# 특정 퀴즈
curl http://localhost:3000/api/quizzes/1
```

## 6. 샘플 데이터 추가

데이터가 없으면 샘플 데이터를 추가할 수 있습니다:

```sql
-- 샘플 사용자 추가
INSERT INTO users (username, email, password, nickname) 
VALUES ('testuser', 'test@example.com', 'test1234', '테스트유저');

-- 샘플 퀴즈 추가
INSERT INTO quizzes (title, description, category) 
VALUES ('테스트 퀴즈', '이것은 테스트 퀴즈입니다', 'machugi');

-- 샘플 문제 추가
INSERT INTO questions (quiz_id, question_text, image_url, correct_answer, question_order)
VALUES (1, '이 캐릭터의 이름은?', '/images/test.jpg', 0, 1);
```

## 7. 프론트엔드 디버깅

브라우저 개발자 도구(F12)에서:

1. **Network 탭** 확인:
   - `/api/quizzes` 요청이 성공하는지
   - 응답 상태 코드 확인 (200이어야 함)
   - 응답 데이터 확인

2. **Console 탭** 확인:
   - JavaScript 오류 확인
   - `console.log`로 데이터 확인

3. **Application 탭** 확인:
   - LocalStorage에 저장된 데이터 확인

## 8. 일반적인 문제 해결

### 문제 1: "데이터베이스 연결 실패"
- ✅ `.env` 파일의 비밀번호 확인
- ✅ AWS RDS 보안 그룹에서 현재 IP 허용 확인
- ✅ 네트워크 연결 확인

### 문제 2: "테이블이 존재하지 않음"
- ✅ `/api/init-db` 실행하여 테이블 생성
- ✅ `check-db.js` 실행하여 확인

### 문제 3: "데이터가 없음"
- ✅ 샘플 데이터 추가
- ✅ 퀴즈 생성 기능으로 데이터 추가

### 문제 4: "API 응답이 빈 배열"
- ✅ 데이터베이스에 실제 데이터가 있는지 확인
- ✅ API 응답 형식 확인 (마추기 폴더는 `{success: true, quizzes: []}` 형식)

## 9. 빠른 체크리스트

- [ ] `.env` 파일이 존재하고 비밀번호가 설정됨
- [ ] `npm install` 실행됨
- [ ] 서버가 실행 중 (`npm start`)
- [ ] `http://localhost:3000/api/db-status` 접속 가능
- [ ] 테이블이 생성됨 (`/api/init-db` 실행)
- [ ] 데이터가 존재함 (`check-db.js` 실행)
- [ ] 브라우저 콘솔에 오류 없음
- [ ] Network 탭에서 API 요청 성공

## 10. 로그 확인

서버 콘솔에서 다음 메시지 확인:
- ✅ `✅ PostgreSQL 데이터베이스 연결 성공`
- ✅ `🚀 서버가 http://localhost:3000 에서 실행 중입니다.`

오류 메시지가 있으면 그 내용을 확인하세요.

