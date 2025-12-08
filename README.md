# 마추기 퀴즈 플랫폼

퀴즈 플랫폼 백엔드 서버 (Node.js + Express + PostgreSQL)

## 📁 프로젝트 구조

```
Java_True/
├── index.html              # 메인 프론트엔드 (SPA)
├── server.js               # Express 백엔드 서버
├── package.json            # 프로젝트 설정
│
├── config/                 # 설정 파일
│   ├── database.js        # DB 연결 설정
│   └── init.sql           # DB 스키마
│
├── scripts/                # 유틸리티 스크립트
│   ├── check-db.js        # DB 확인
│   ├── test-api.js        # API 테스트
│   └── quick-check.sh     # 빠른 체크
│
├── docs/                   # 문서
│   ├── DB_CHECK_GUIDE.md  # DB 확인 가이드
│   └── DB_STRUCTURE.md    # DB 구조
│
├── public/                 # 정적 파일
│   └── images/            # 퀴즈 이미지
│
└── 마추기/public/images/  # 하위 호환 이미지
```

자세한 구조는 `PROJECT_STRUCTURE.md`를 참고하세요.

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 열어서 데이터베이스 비밀번호를 설정하세요:
```
DB_PASSWORD=your_actual_password
JWT_SECRET=your_jwt_secret_key
```

### 3. 데이터베이스 초기화
서버를 실행한 후 다음 엔드포인트를 호출하여 데이터베이스 테이블을 생성합니다:
```bash
curl -X POST http://localhost:3000/api/init-db
```

또는 브라우저에서 직접 접속:
```
http://localhost:3000/api/init-db
```

### 4. 서버 실행
```bash
npm start
```

개발 모드 (자동 재시작):
```bash
npm run dev
```

## API 엔드포인트

### 퀴즈
- `GET /api/quizzes` - 퀴즈 목록 조회
- `GET /api/quizzes/:id` - 퀴즈 상세 조회
- `POST /api/quizzes` - 퀴즈 생성
- `POST /api/quizzes/:id/results` - 퀴즈 결과 저장

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인

### 유틸리티
- `POST /api/init-db` - 데이터베이스 초기화
- `GET /api/db-status` - 데이터베이스 상태 확인
- `GET /api/db-schema/:table` - 테이블 구조 확인

## 유틸리티 스크립트

```bash
# 데이터베이스 확인
npm run check-db

# API 테스트
npm run test-api

# 빠른 환경 체크
./scripts/quick-check.sh
```

## 데이터베이스 연결 정보

- **호스트**: machugi-db.cniigc2sgexq.ap-south-1.rds.amazonaws.com
- **포트**: 5432
- **리전**: ap-south-1a
- **데이터베이스 타입**: PostgreSQL

## 주의사항

1. `.env` 파일에 실제 데이터베이스 비밀번호를 설정해야 합니다.
2. AWS RDS 보안 그룹에서 현재 IP 주소의 5432 포트 접근을 허용해야 합니다.
3. 프로덕션 환경에서는 `JWT_SECRET`을 안전한 랜덤 문자열로 변경하세요.

