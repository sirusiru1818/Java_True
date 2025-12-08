import os

# ==========================================
# [설정] 이미지가 들어있는 폴더 경로
# ==========================================
IMAGE_DIR = "./public/images"
SQL_FILE = "final_image_match.sql"

def main():
    if not os.path.exists(IMAGE_DIR):
        print(f"❌ 오류: '{IMAGE_DIR}' 폴더가 없습니다.")
        return

    # 폴더 내의 모든 파일 목록 가져오기
    files = os.listdir(IMAGE_DIR)
    
    sql_lines = []
    print(f"📂 '{IMAGE_DIR}' 폴더 스캔 중... ({len(files)}개 파일 발견)")

    for filename in files:
        # 파일명과 확장자 분리 (예: "신라면.webp" -> name="신라면", ext=".webp")
        name, ext = os.path.splitext(filename)
        
        # 시스템 파일 등 건너뛰기
        if name.startswith('.'):
            continue

        # SQL 생성: content(정답)가 파일명과 같으면 image_url을 해당 파일로 업데이트
        # 예: UPDATE questions SET image_url = '/images/신라면.webp' WHERE content = '신라면';
        sql = f"UPDATE questions SET image_url = '/images/{filename}' WHERE content = '{name}';"
        sql_lines.append(sql)

    # SQL 파일 저장
    with open(SQL_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))

    print("-" * 30)
    print(f"🎉 처리 완료! 총 {len(sql_lines)}개의 연결 코드를 생성했습니다.")
    print(f"👉 생성된 '{SQL_FILE}' 파일을 열어 DB(pgAdmin)에서 실행해주세요!")

if __name__ == "__main__":
    main()