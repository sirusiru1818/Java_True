#!/bin/bash

# 빠른 데이터베이스 확인 스크립트

echo "=========================================="
echo "🚀 빠른 데이터베이스 확인"
echo "=========================================="
echo ""

# 1. 환경 변수 확인
echo "1️⃣ .env 파일 확인..."
if [ -f .env ]; then
    echo "   ✅ .env 파일 존재"
    if grep -q "DB_PASSWORD" .env && ! grep -q "your_password_here" .env; then
        echo "   ✅ DB_PASSWORD 설정됨"
    else
        echo "   ⚠️  DB_PASSWORD가 설정되지 않았거나 기본값입니다"
    fi
else
    echo "   ❌ .env 파일이 없습니다!"
    echo "   .env.example을 복사하여 .env를 만드세요"
fi

echo ""

# 2. Node 모듈 확인
echo "2️⃣ Node 모듈 확인..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules 존재"
else
    echo "   ⚠️  node_modules가 없습니다. 'npm install' 실행 필요"
fi

echo ""

# 3. 서버 실행 확인
echo "3️⃣ 서버 실행 확인..."
if curl -s http://localhost:3000/api/db-status > /dev/null 2>&1; then
    echo "   ✅ 서버가 실행 중입니다"
    echo "   DB 상태 확인: http://localhost:3000/api/db-status"
else
    echo "   ⚠️  서버가 실행되지 않았습니다"
    echo "   'npm start' 실행 필요"
fi

echo ""

# 4. 데이터베이스 연결 테스트
echo "4️⃣ 데이터베이스 연결 테스트..."
if [ -f .env ]; then
    echo "   'node check-db.js' 실행 중..."
    node check-db.js
else
    echo "   ⚠️  .env 파일이 없어서 연결 테스트를 건너뜁니다"
fi

echo ""
echo "=========================================="
echo "✅ 확인 완료"
echo "=========================================="
echo ""
echo "다음 단계:"
echo "1. .env 파일 확인 및 수정"
echo "2. npm install (필요시)"
echo "3. npm start (서버 실행)"
echo "4. node check-db.js (DB 확인)"
echo "5. 브라우저에서 http://localhost:3000 접속"

