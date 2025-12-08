# 프로젝트 구조

## 📁 디렉토리 구조

```
Java_True/
├── 📄 index.html              # 메인 프론트엔드 파일
├── 📄 server.js                # Express 백엔드 서버
├── 📄 package.json             # Node.js 프로젝트 설정
├── 📄 package-lock.json       # 의존성 잠금 파일
├── 📄 .env                     # 환경 변수 (비밀번호 등)
├── 📄 .gitignore              # Git 제외 파일 목록
│
├── 📁 config/                 # 설정 파일
│   ├── database.js            # 데이터베이스 연결 설정
│   └── init.sql               # 데이터베이스 스키마
│
├── 📁 scripts/                # 유틸리티 스크립트
│   ├── check-db.js            # 데이터베이스 확인 스크립트
│   ├── test-api.js            # API 테스트 스크립트
│   └── quick-check.sh         # 빠른 체크 스크립트
│
├── 📁 docs/                   # 문서
│   ├── DB_CHECK_GUIDE.md      # DB 확인 가이드
│   └── DB_STRUCTURE.md         # DB 구조 문서
│
├── 📁 public/                 # 정적 파일 (이미지 등)
│   └── images/                 # 퀴즈 이미지 파일들
│       ├── covers/             # 썸네일 이미지
│       └── ...                 # 기타 이미지 파일들
│
├── 📁 마추기/                 # 마추기 폴더 (하위 호환)
│   └── public/
│       └── images/             # 이미지 파일 (서버에서 참조)
│
├── 📁 node_modules/           # Node.js 의존성 (자동 생성)
│
└── 📄 README.md               # 프로젝트 설명서
```

## 📋 파일 설명

### 핵심 파일

| 파일 | 설명 |
|------|------|
| `index.html` | 메인 프론트엔드 파일 (SPA) |
| `server.js` | Express 백엔드 서버 |
| `package.json` | 프로젝트 설정 및 의존성 |
| `.env` | 환경 변수 (DB 연결 정보 등) |

### 설정 파일

| 파일 | 설명 |
|------|------|
| `config/database.js` | PostgreSQL 연결 풀 설정 |
| `config/init.sql` | 데이터베이스 스키마 정의 |

### 유틸리티 스크립트

| 파일 | 설명 | 사용법 |
|------|------|--------|
| `scripts/check-db.js` | DB 연결 및 데이터 확인 | `npm run check-db` |
| `scripts/test-api.js` | API 엔드포인트 테스트 | `npm run test-api` |
| `scripts/quick-check.sh` | 빠른 환경 체크 | `./scripts/quick-check.sh` |

### 문서

| 파일 | 설명 |
|------|------|
| `README.md` | 프로젝트 개요 및 설치 가이드 |
| `docs/DB_CHECK_GUIDE.md` | 데이터베이스 확인 방법 |
| `docs/DB_STRUCTURE.md` | 데이터베이스 구조 상세 설명 |

### 정적 파일

| 경로 | 설명 |
|------|------|
| `public/images/` | 퀴즈 이미지 파일들 |
| `public/images/covers/` | 퀴즈 썸네일 이미지 |
| `마추기/public/images/` | 하위 호환을 위한 이미지 경로 |

## 🚀 주요 명령어

```bash
# 서버 실행
npm start

# 개발 모드 (자동 재시작)
npm run dev

# 데이터베이스 확인
npm run check-db

# API 테스트
npm run test-api
```

## 📦 의존성

주요 패키지:
- `express` - 웹 서버 프레임워크
- `pg` - PostgreSQL 클라이언트
- `cors` - CORS 미들웨어
- `dotenv` - 환경 변수 관리
- `express-session` - 세션 관리
- `bcrypt` - 비밀번호 해싱
- `jsonwebtoken` - JWT 인증

## 🔧 환경 변수

`.env` 파일에 다음 변수들이 필요합니다:

```env
DB_HOST=machugi-db.cniigc2sgexq.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password

PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key
SESSION_SECRET=your_session_secret
```

## 📊 데이터베이스

- **타입**: PostgreSQL
- **호스트**: AWS RDS
- **스키마**: `config/init.sql` 참고
- **확인**: `npm run check-db` 또는 `http://localhost:3000/api/db-status`

## 🌐 API 엔드포인트

### 퀴즈
- `GET /api/quizzes` - 퀴즈 목록
- `GET /api/quizzes/:id` - 퀴즈 상세
- `POST /api/quizzes` - 퀴즈 생성
- `GET /api/quiz/:id/questions` - 문제 조회

### 인증
- `POST /api/signup` - 회원가입
- `POST /api/login` - 로그인
- `GET /api/check-login` - 로그인 상태 확인
- `POST /api/logout` - 로그아웃

### 유틸리티
- `POST /api/init-db` - DB 초기화
- `GET /api/db-status` - DB 상태 확인
- `GET /api/db-schema/:table` - 테이블 구조 확인

## 📝 참고사항

1. **이미지 경로**: 서버는 `public/images/`와 `마추기/public/images/` 모두 지원합니다.
2. **데이터베이스**: 마추기 폴더는 `content` 컬럼을 사용하며, 기본 스키마는 `question_text`를 사용합니다.
3. **환경 변수**: `.env` 파일은 Git에 커밋하지 마세요 (`.gitignore`에 포함됨).

