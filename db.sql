/* ==============================================
   [1] 초기화 및 테이블 생성 (주석 포함)
   ============================================== */
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS users;

-- 1. 사용자 테이블
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 테이블 및 컬럼 주석 등록
COMMENT ON TABLE users IS '회원 정보를 저장하는 테이블';
COMMENT ON COLUMN users.id IS '사용자 고유 ID (PK)';
COMMENT ON COLUMN users.username IS '로그인 아이디';
COMMENT ON COLUMN users.email IS '이메일 주소';
COMMENT ON COLUMN users.password IS '비밀번호 (암호화 권장)';
COMMENT ON COLUMN users.nickname IS '사용자 별명';
COMMENT ON COLUMN users.created_at IS '가입 일시';


-- 2. 퀴즈 메타데이터 테이블
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    creator_id INTEGER REFERENCES users(id),
    play_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 퀴즈 테이블 및 컬럼 주석 등록
COMMENT ON TABLE quizzes IS '퀴즈의 제목, 설명 등 메타데이터를 저장하는 테이블';
COMMENT ON COLUMN quizzes.id IS '퀴즈 고유 ID (PK)';
COMMENT ON COLUMN quizzes.title IS '퀴즈 제목';
COMMENT ON COLUMN quizzes.description IS '퀴즈 설명';
COMMENT ON COLUMN quizzes.category IS '퀴즈 카테고리 (worldcup: 이상형 월드컵, machugi: 마추기, balance: 밸런스 게임)';
COMMENT ON COLUMN quizzes.image_url IS '퀴즈 대표 썸네일 이미지 경로';
COMMENT ON COLUMN quizzes.creator_id IS '퀴즈 생성자 ID (users 테이블 FK)';
COMMENT ON COLUMN quizzes.play_count IS '퀴즈 플레이 횟수';
COMMENT ON COLUMN quizzes.created_at IS '퀴즈 생성 일시';


-- 3. 문항 데이터 테이블
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    content VARCHAR(255) NOT NULL,
    image_url TEXT,
    choice_a VARCHAR(255),
    choice_b VARCHAR(255),
    answer INT DEFAULT 0
);

-- 문항 테이블 및 컬럼 주석 등록
COMMENT ON TABLE questions IS '각 퀴즈에 포함된 개별 문항 데이터를 저장하는 테이블';
COMMENT ON COLUMN questions.id IS '문항 고유 ID (PK)';
COMMENT ON COLUMN questions.quiz_id IS '소속된 퀴즈 ID (quizzes 테이블 FK)';
COMMENT ON COLUMN questions.content IS '문항 내용 (월드컵/마추기: 대상의 이름/정답, 밸런스: 질문 주제)';
COMMENT ON COLUMN questions.image_url IS '문항 관련 이미지 경로';
COMMENT ON COLUMN questions.choice_a IS '밸런스 게임 선택지 A (월드컵/마추기 미사용)';
COMMENT ON COLUMN questions.choice_b IS '밸런스 게임 선택지 B (월드컵/마추기 미사용)';
COMMENT ON COLUMN questions.answer IS '정답 인덱스 (필요 시 사용, 기본 0)';


/* ==============================================
   [2] 기본 데이터 생성
   ============================================== */
INSERT INTO users (username, email, password, nickname) VALUES ('admin', 'admin@test.com', '1234', '관리자');

-- 퀴즈 목록 
INSERT INTO quizzes (title, description, category, image_url, creator_id) VALUES
('최애 라면 월드컵', '한국인의 소울푸드! 32강', 'worldcup', '', 1),        -- ID: 1
('치킨 브랜드 월드컵', '오늘 저녁은 치킨이다! 32강', 'worldcup', '', 1),    -- ID: 2
('여자 아이돌 월드컵', '4세대 여돌 최애 찾기 32강', 'worldcup', '', 1),     -- ID: 3
('애니메이션 이름 맞추기', '캐릭터를 보고 제목을 맞춰보세요!', 'machugi', '', 1), -- ID: 4
('국내 연예인 맞추기', '사진 속 인물은 누구일까요?', 'machugi', '', 1),       -- ID: 5
('축구선수 이름 맞추기', '축구 덕후라면 만점 도전!', 'machugi', '', 1),       -- ID: 6
('연애 밸런스 게임', '극한의 연애 상황 선택', 'balance', '', 1),            -- ID: 7
('음식 밸런스 게임', '평생 하나만 먹어야 한다면?', 'balance', '', 1),       -- ID: 8
('초능력 밸런스 게임', '갖고 싶은 능력은?', 'balance', '', 1);              -- ID: 9

/* ==============================================
   [3] 데이터 삽입
   ============================================== */

-- [1~3] 월드컵 데이터
INSERT INTO questions (quiz_id, content) VALUES 
(1, '신라면'), (1, '진라면 매운맛'), (1, '너구리'), (1, '안성탕면'), (1, '짜파게티'), (1, '불닭볶음면'), (1, '팔도비빔면'), (1, '육개장 사발면'), 
(1, '삼양라면'), (1, '참깨라면'), (1, '오징어짬뽕'), (1, '스낵면'), (1, '열라면'), (1, '사리곰탕면'), (1, '무파마'), (1, '틈새라면'),
(1, '진라면 순한맛'), (1, '신라면 블랙'), (1, '진짬뽕'), (1, '짜왕'), (1, '비빔면 배홍동'), (1, '꼬꼬면'), (1, '나가사끼 짬뽕'), (1, '남자라면'),
(1, '왕뚜껑'), (1, '튀김우동'), (1, '새우탕'), (1, '감자면'), (1, '멸치칼국수'), (1, '불닭 까르보'), (1, '공화춘'), (1, '간짬뽕');

INSERT INTO questions (quiz_id, content) VALUES 
(2, 'BBQ 황금올리브'), (2, 'BHC 뿌링클'), (2, '교촌 허니콤보'), (2, '굽네 고추바사삭'), 
(2, '네네 스노윙'), (2, '처갓집 슈프림양념'), (2, '노랑통닭 알싸한마늘'), (2, '푸라닭 블랙알리오'), 
(2, '지코바 숯불양념'), (2, '바른치킨 대새레드'), (2, 'KFC 핫크리스피'), (2, '60계 간지치킨'), 
(2, '페리카나 양념'), (2, '멕시카나 땡초'), (2, '호식이 두마리'), (2, '자담 맵슐랭'),
(2, 'BHC 맛초킹'), (2, '교촌 레드콤보'), (2, '굽네 볼케이노'), (2, 'BBQ 자메이카'), 
(2, '네네 파닭'), (2, '또래오래 갈릭반핫양념반'), (2, '부어치킨 크리스피'), (2, '썬더치킨'),
(2, '보드람 치킨'), (2, '둘둘치킨'), (2, '깐부치킨'), (2, '치킨마루'), 
(2, '호치킨'), (2, '오빠닭'), (2, '노랑통닭 후라이드'), (2, '푸라닭 고추마요');

INSERT INTO questions (quiz_id, content) VALUES 
(3, '카리나'), (3, '장원영'), (3, '민지'), (3, '안유진'), (3, '윈터'), (3, '김채원'), (3, '해린'), (3, '설윤'), 
(3, '미연'), (3, '사쿠라'), (3, '리즈'), (3, '하니'), (3, '가을'), (3, '닝닝'), (3, '은채'), (3, '다니엘'),
(3, '지수'), (3, '제니'), (3, '로제'), (3, '리사'), (3, '태연'), (3, '아이유'), (3, '나연'), (3, '사나'),
(3, '모모'), (3, '지효'), (3, '슬기'), (3, '아이린'), (3, '웬디'), (3, '조이'), (3, '유나'), (3, '예지');

-- [4] 애니메이션 이름 맞추기 (30문항)
INSERT INTO questions (quiz_id, content) VALUES
(4, '귀멸의 칼날'), (4, '원피스'), (4, '나루토'), (4, '진격의 거인'), (4, '포켓몬스터'),
(4, '짱구는 못말려'), (4, '도라에몽'), (4, '명탐정 코난'), (4, '슬램덩크'), (4, '주술회전'),
(4, '체인소 맨'), (4, '스파이 패밀리'), (4, '최애의 아이'), (4, '센과 치히로의 행방불명'), (4, '이웃집 토토로'),
(4, '하울의 움직이는 성'), (4, '드래곤볼'), (4, '세일러문'), (4, '디지몬 어드벤처'), (4, '원펀맨'),
(4, '하이큐'), (4, '은혼'), (4, '강철의 연금술사'), (4, '데스노트'), (4, '헌터x헌터'),
(4, '블리치'), (4, '봇치 더 락'), (4, '아따맘마'), (4, '검정고무신'), (4, '아기공룡 둘리');

-- [5] 연예인 이름 맞추기 (30문항)
INSERT INTO questions (quiz_id, content) VALUES
(5, '유재석'), (5, '강호동'), (5, '신동엽'), (5, '이수근'), (5, '최민식'),
(5, '수지'), (5, '차은우'), (5, '마동석'), (5, '손석구'), (5, '김혜수'),
(5, '전지현'), (5, '송중기'), (5, '송혜교'), (5, '박보검'), (5, '공유'),
(5, '김고은'), (5, '황정민'), (5, '이정재'), (5, '정우성'), (5, '현빈'),
(5, '손예진'), (5, '박서준'), (5, '김수현'), (5, '임영웅'), (5, '싸이'),
(5, '지드래곤'), (5, '이병헌'), (5, '김종국'), (5, '하정우'), (5, '이효리');

-- [6] 국기보고 나라 맞추기 (30문항)
INSERT INTO questions (quiz_id, content) VALUES 
(6, '대한민국'), (6, '미국'), (6, '일본'), (6, '중국'), (6, '영국'),
(6, '프랑스'), (6, '독일'), (6, '이탈리아'), (6, '스페인'), (6, '캐나다'),
(6, '호주'), (6, '브라질'), (6, '아르헨티나'), (6, '러시아'), (6, '인도'),
(6, '베트남'), (6, '태국'), (6, '튀르키예'), (6, '이집트'), (6, '스위스'),
(6, '네덜란드'), (6, '벨기에'), (6, '포르투갈'), (6, '스웨덴'), (6, '멕시코'),
(6, '사우디아라비아'), (6, '그리스'), (6, '남아프리카 공화국'), (6, '덴마크'), (6, '폴란드');


-- [7~9] 밸런스 게임
INSERT INTO questions (quiz_id, content, choice_a, choice_b) VALUES
(7, 'Q1. 최악의 이별', '잠수 이별', '환승 이별'), (7, 'Q2. 애인의 남사친/여사친', '단둘이 술마시기', '1박2일 여행(단체)'),
(7, 'Q3. 깻잎 논쟁', '잡아줘도 됨', '절대 안 됨'), (7, 'Q4. 애인의 과거', '동거 경험 있음', '연애 횟수 50번'),
(7, 'Q5. 데이트 스타일', '집순이/집돌이', '밖돌이/밖순이'), (7, 'Q6. 연락 스타일', '24시간 연락', '필요할 때만 연락'),
(7, 'Q7. 패딩 지퍼 논쟁', '올려줘도 됨', '절대 안 됨'), (7, 'Q8. 기념일 선물', '손편지 + 정성', '명품 + 현금'),
(7, 'Q9. 애인의 빚', '학자금 대출 1억', '도박 빚 1천만원'), (7, 'Q10. 싸웠을 때', '그자리에서 풀기', '하루 생각하고 풀기'),
(7, 'Q11. 결혼 후 부모님 모시기', '우리 부모님', '상대 부모님'), (7, 'Q12. 나보다 더', '잘 버는 애인', '못 버는 애인'),
(7, 'Q13. 스킨십 속도', '만난 당일 가능', '최소 한 달 뒤'), (7, 'Q14. 전애인 흔적', '사진첩에 전애인', 'SNS에 전애인 댓글'),
(7, 'Q15. 핸드폰 공유', '비밀번호 공유', '절대 공유 불가'), (7, 'Q16. 애인의 취미', '게임 중독', '쇼핑 중독'),
(7, 'Q17. 새우 까주기', '내 친구에게 까주기', '절대 안 됨'), (7, 'Q18. 이성친구와 톡', '이모티콘 남발', '단답형 칼답'),
(7, 'Q19. 애인의 룩', '노출 심한 패션', '패션 테러리스트'), (7, 'Q20. 애인의 말실수', '전애인 이름 부름', '내 친구랑 비교함'),
(7, 'Q21. 장거리 연애', '서울-부산', '한국-미국'), (7, 'Q22. 결혼 식장', '호텔 결혼식', '스몰 웨딩'),
(7, 'Q23. 2세 계획', '딩크족', '다자녀'), (7, 'Q24. 애인이 찐 살', '20kg 찜', '너무 말라서 뼈만 남음'),
(7, 'Q25. 더 싫은 상황', '애인이 내 친구랑 바람', '내가 애인 친구랑 바람'), (7, 'Q26. 이별 후', '친구로 지냄', '연 끊음'),
(7, 'Q27. 소개팅 주선', '내가 해줌', '애인이 해줌'), (7, 'Q28. 애인의 코골이', '천둥소리', '이갈이 소리'),
(7, 'Q29. 방귀 트기', '가능', '죽어도 불가능'), (7, 'Q30. 다시 태어나면', '지금 애인과 결혼', '새로운 사람과 연애');

INSERT INTO questions (quiz_id, content, choice_a, choice_b) VALUES
(8, 'Q1. 평생 금지', '밀가루 끊기', '고기 끊기'), (8, 'Q2. 탕수육', '부먹', '찍먹'),
(8, 'Q3. 민트초코', '극호', '불호'), (8, 'Q4. 피자 토핑', '하와이안(파인애플)', '오이 피자'),
(8, 'Q5. 라면 취향', '꼬들면', '퍼진면'), (8, 'Q6. 붕어빵', '팥붕', '슈붕'),
(8, 'Q7. 평생 한 가지', '물렁 복숭아', '딱딱 복숭아'), (8, 'Q8. 냉면', '물냉면', '비빔냉면'),
(8, 'Q9. 치킨', '양념치킨', '후라이드'), (8, 'Q10. 계란후라이', '반숙', '완숙'),
(8, 'Q11. 떡볶이', '밀떡', '쌀떡'), (8, 'Q12. 순대 찍먹', '소금', '초장/쌈장'),
(8, 'Q13. 카레 비비기', '비벼 먹기', '떠 먹기'), (8, 'Q14. 김치찌개', '돼지고기', '참치/스팸'),
(8, 'Q15. 된장찌개', '꽃게/해물', '차돌박이'), (8, 'Q16. 콜라', '코카콜라', '펩시'),
(8, 'Q17. 시리얼', '바삭하게', '우유에 불려서'), (8, 'Q18. 콩국수 간', '설탕', '소금'),
(8, 'Q19. 감자튀김', '케첩', '마요네즈/쉐이크'), (8, 'Q20. 회 먹는 법', '초장 맛', '간장/와사비 맛'),
(8, 'Q21. 팥빙수', '다 섞어 먹기', '안 섞고 떠 먹기'), (8, 'Q22. 스테이크 굽기', '레어/미디움', '웰던'),
(8, 'Q23. 파스타 소스', '토마토', '크림/오일'), (8, 'Q24. 중국집', '짜장면', '짬뽕'),
(8, 'Q25. 소주 안주', '삼겹살', '회'), (8, 'Q26. 군만두', '간장 찍먹', '떡볶이 국물'),
(8, 'Q27. 김밥', '참치마요', '일반김밥'), (8, 'Q28. 빵 취향', '피자/소세지빵', '생크림/단팥빵'),
(8, 'Q29. 아이스크림', '초코/바닐라', '과일/샤베트'), (8, 'Q30. 야식 메뉴', '족발', '보쌈');

INSERT INTO questions (quiz_id, content, choice_a, choice_b) VALUES
(9, 'Q1. 이동 능력', '원하는 곳 순간이동', '하늘을 나는 비행'), (9, 'Q2. 시간 조절', '과거로 시간여행', '미래로 시간여행'),
(9, 'Q3. 신체 능력', '투명 인간 되기', '헐크 같은 괴력'), (9, 'Q4. 지식 습득', '모든 언어 마스터', '모든 악기 마스터'),
(9, 'Q5. 생명력', '불로불사 (안 죽음)', '자가 치유 (안 아픔)'), (9, 'Q6. 독심술', '남의 생각 읽기', '내 생각 전송하기'),
(9, 'Q7. 시각 능력', '벽 뚫어보는 투시', '천리안 (멀리 봄)'), (9, 'Q8. 원소 컨트롤', '불 조종하기', '물 조종하기'),
(9, 'Q9. 시간 정지', '나만 움직이기', '세상도 멈추기'), (9, 'Q10. 날씨 조작', '항상 맑음 유지', '원할 때 비/눈 내림'),
(9, 'Q11. 변신 능력', '동물로 변신', '다른 사람으로 변신'), (9, 'Q12. 소환 능력', '현금 소환 (하루 100만)', '맛있는 음식 무한 소환'),
(9, 'Q13. 염력', '물건 마음대로 이동', '사람 마음대로 이동'), (9, 'Q14. 분신술', '내 분신 5명 만들기', '거대화 하기'),
(9, 'Q15. 꿈 조작', '내 꿈 맘대로 꾸기', '남의 꿈에 들어가기'), (9, 'Q16. 기억 조작', '싫은 기억 삭제', '가짜 좋은 기억 생성'),
(9, 'Q17. 소통 능력', '모든 동물과 대화', '식물과 대화'), (9, 'Q18. 수면 능력', '평생 안 자도 됨', '1분 만에 피로 회복'),
(9, 'Q19. 식성 능력', '아무리 먹어도 살 안 찜', '평생 안 먹어도 배부름'),
(9, 'Q20. 매력 능력', '모든 이성이 날 좋아함', '전 세계가 날 존경함'), (9, 'Q21. 행운 조절', '로또 1등 딱 한 번', '평생 소소한 행운'),
(9, 'Q22. 예지력', '1분 뒤 미래 보기', '1년 뒤 미래 보기'), (9, 'Q23. 통과 능력', '벽 통과하기', '물 위 걷기'),
(9, 'Q24. 전기 능력', '전기 쏘기 (공격)', '전자기기 해킹/충전'), (9, 'Q25. 중력 조절', '무중력 상태', '중력 100배'),
(9, 'Q26. 두뇌 속도', '슈퍼 컴퓨터 두뇌', '빛의 속도로 움직임'), (9, 'Q27. 복사 능력', '물건 복제', '타인의 능력 복사'),
(9, 'Q28. 공간 이동', '우주 여행 가능', '심해 여행 가능'), (9, 'Q29. 감정 조절', '항상 행복함 느낌', '슬픔/고통 못 느낌'),
(9, 'Q30. 마지막 선택', '랜덤 초능력 1개', '현금 100억 받고 능력X');


/* ==============================================
   [4] 이미지 업데이트 (파일명 매핑)
   ============================================== */
UPDATE questions SET image_url = '/images/60계 간지치킨.jpg' WHERE content = '60계 간지치킨';
UPDATE questions SET image_url = '/images/BBQ 자메이카.jpg' WHERE content = 'BBQ 자메이카';
UPDATE questions SET image_url = '/images/BBQ 황금올리브.jpg' WHERE content = 'BBQ 황금올리브';
UPDATE questions SET image_url = '/images/BHC 맛초킹.jpg' WHERE content = 'BHC 맛초킹';
UPDATE questions SET image_url = '/images/BHC 뿌링클.avif' WHERE content = 'BHC 뿌링클';
UPDATE questions SET image_url = '/images/KFC 핫크리스피.jpg' WHERE content = 'KFC 핫크리스피';
UPDATE questions SET image_url = '/images/가을.jpg' WHERE content = '가을';
UPDATE questions SET image_url = '/images/간짬뽕.jpg' WHERE content = '간짬뽕';
UPDATE questions SET image_url = '/images/감자면.webp' WHERE content = '감자면';
UPDATE questions SET image_url = '/images/강철의 연금술사.jpg' WHERE content = '강철의 연금술사';
UPDATE questions SET image_url = '/images/강호동.jpg' WHERE content = '강호동';
UPDATE questions SET image_url = '/images/검정고무신.jpg' WHERE content = '검정고무신';
UPDATE questions SET image_url = '/images/공유.jpg' WHERE content = '공유';
UPDATE questions SET image_url = '/images/공화춘.jpg' WHERE content = '공화춘';
UPDATE questions SET image_url = '/images/교촌 레드콤보.png' WHERE content = '교촌 레드콤보';
UPDATE questions SET image_url = '/images/교촌 허니콤보.png' WHERE content = '교촌 허니콤보';
UPDATE questions SET image_url = '/images/굽네 고추바사삭.webp' WHERE content = '굽네 고추바사삭';
UPDATE questions SET image_url = '/images/굽네 볼케이노.jpg' WHERE content = '굽네 볼케이노';
UPDATE questions SET image_url = '/images/귀멸의 칼날.jpg' WHERE content = '귀멸의 칼날';
UPDATE questions SET image_url = '/images/그리스.png' WHERE content = '그리스';
UPDATE questions SET image_url = '/images/김고은.jpg' WHERE content = '김고은';
UPDATE questions SET image_url = '/images/김수현.jpg' WHERE content = '김수현';
UPDATE questions SET image_url = '/images/김종국.jpg' WHERE content = '김종국';
UPDATE questions SET image_url = '/images/김채원.jpg' WHERE content = '김채원';
UPDATE questions SET image_url = '/images/김혜수.jpg' WHERE content = '김혜수';
UPDATE questions SET image_url = '/images/깐부치킨.webp' WHERE content = '깐부치킨';
UPDATE questions SET image_url = '/images/꼬꼬면.webp' WHERE content = '꼬꼬면';
UPDATE questions SET image_url = '/images/나가사끼 짬뽕.webp' WHERE content = '나가사끼 짬뽕';
UPDATE questions SET image_url = '/images/나루토.png' WHERE content = '나루토';
UPDATE questions SET image_url = '/images/나연.jpg' WHERE content = '나연';
UPDATE questions SET image_url = '/images/남아프리카 공화국.png' WHERE content = '남아프리카 공화국';
UPDATE questions SET image_url = '/images/남자라면.webp' WHERE content = '남자라면';
UPDATE questions SET image_url = '/images/너구리.webp' WHERE content = '너구리';
UPDATE questions SET image_url = '/images/네네 스노윙.jpg' WHERE content = '네네 스노윙';
UPDATE questions SET image_url = '/images/네네 파닭.jpg' WHERE content = '네네 파닭';
UPDATE questions SET image_url = '/images/네덜란드.png' WHERE content = '네덜란드';
UPDATE questions SET image_url = '/images/노랑통닭 알싸한마늘.png' WHERE content = '노랑통닭 알싸한마늘';
UPDATE questions SET image_url = '/images/노랑통닭 후라이드.jpg' WHERE content = '노랑통닭 후라이드';
UPDATE questions SET image_url = '/images/닝닝.jpg' WHERE content = '닝닝';
UPDATE questions SET image_url = '/images/다니엘.jpg' WHERE content = '다니엘';
UPDATE questions SET image_url = '/images/대한민국.png' WHERE content = '대한민국';
UPDATE questions SET image_url = '/images/데스노트.jpg' WHERE content = '데스노트';
UPDATE questions SET image_url = '/images/덴마크.png' WHERE content = '덴마크';
UPDATE questions SET image_url = '/images/도라에몽.webp' WHERE content = '도라에몽';
UPDATE questions SET image_url = '/images/독일.png' WHERE content = '독일';
UPDATE questions SET image_url = '/images/둘둘치킨.jpg' WHERE content = '둘둘치킨';
UPDATE questions SET image_url = '/images/드래곤볼.jpg' WHERE content = '드래곤볼';
UPDATE questions SET image_url = '/images/디지몬 어드벤처.jpg' WHERE content = '디지몬 어드벤처';
UPDATE questions SET image_url = '/images/또래오래 갈릭반핫양념반.jpg' WHERE content = '또래오래 갈릭반핫양념반';
UPDATE questions SET image_url = '/images/러시아.png' WHERE content = '러시아';
UPDATE questions SET image_url = '/images/로제.jpg' WHERE content = '로제';
UPDATE questions SET image_url = '/images/리사.jpg' WHERE content = '리사';
UPDATE questions SET image_url = '/images/리즈.jpg' WHERE content = '리즈';
UPDATE questions SET image_url = '/images/마동석.jpg' WHERE content = '마동석';
UPDATE questions SET image_url = '/images/멕시카나 땡초.jpg' WHERE content = '멕시카나 땡초';
UPDATE questions SET image_url = '/images/멕시코.png' WHERE content = '멕시코';
UPDATE questions SET image_url = '/images/멸치칼국수.webp' WHERE content = '멸치칼국수';
UPDATE questions SET image_url = '/images/명탐정 코난.png' WHERE content = '명탐정 코난';
UPDATE questions SET image_url = '/images/모모.jpg' WHERE content = '모모';
UPDATE questions SET image_url = '/images/무파마.webp' WHERE content = '무파마';
UPDATE questions SET image_url = '/images/미국.png' WHERE content = '미국';
UPDATE questions SET image_url = '/images/미연.jpg' WHERE content = '미연';
UPDATE questions SET image_url = '/images/민지.jpg' WHERE content = '민지';
UPDATE questions SET image_url = '/images/바른치킨 대새레드.jpg' WHERE content = '바른치킨 대새레드';
UPDATE questions SET image_url = '/images/박보검.jpg' WHERE content = '박보검';
UPDATE questions SET image_url = '/images/박서준.jpg' WHERE content = '박서준';
UPDATE questions SET image_url = '/images/베트남.png' WHERE content = '베트남';
UPDATE questions SET image_url = '/images/벨기에.png' WHERE content = '벨기에';
UPDATE questions SET image_url = '/images/보드람 치킨.jpg' WHERE content = '보드람 치킨';
UPDATE questions SET image_url = '/images/봇치 더 락.jpg' WHERE content = '봇치 더 락';
UPDATE questions SET image_url = '/images/부어치킨 크리스피.jpg' WHERE content = '부어치킨 크리스피';
UPDATE questions SET image_url = '/images/불닭 까르보.webp' WHERE content = '불닭 까르보';
UPDATE questions SET image_url = '/images/불닭볶음면.webp' WHERE content = '불닭볶음면';
UPDATE questions SET image_url = '/images/브라질.png' WHERE content = '브라질';
UPDATE questions SET image_url = '/images/블리치.jpg' WHERE content = '블리치';
UPDATE questions SET image_url = '/images/비빔면 배홍동.webp' WHERE content = '비빔면 배홍동';
UPDATE questions SET image_url = '/images/사나.jpg' WHERE content = '사나';
UPDATE questions SET image_url = '/images/사리곰탕면.webp' WHERE content = '사리곰탕면';
UPDATE questions SET image_url = '/images/사우디아라비아.png' WHERE content = '사우디아라비아';
UPDATE questions SET image_url = '/images/사쿠라.jpg' WHERE content = '사쿠라';
UPDATE questions SET image_url = '/images/삼양라면.webp' WHERE content = '삼양라면';
UPDATE questions SET image_url = '/images/새우탕.webp' WHERE content = '새우탕';
UPDATE questions SET image_url = '/images/설윤.jpg' WHERE content = '설윤';
UPDATE questions SET image_url = '/images/세일러문.jpg' WHERE content = '세일러문';
UPDATE questions SET image_url = '/images/센과 치히로의 행방불명.jpg' WHERE content = '센과 치히로의 행방불명';
UPDATE questions SET image_url = '/images/손석구.jpg' WHERE content = '손석구';
UPDATE questions SET image_url = '/images/손예진.jpg' WHERE content = '손예진';
UPDATE questions SET image_url = '/images/송중기.jpg' WHERE content = '송중기';
UPDATE questions SET image_url = '/images/송혜교.jpg' WHERE content = '송혜교';
UPDATE questions SET image_url = '/images/수지.jpg' WHERE content = '수지';
UPDATE questions SET image_url = '/images/스낵면.webp' WHERE content = '스낵면';
UPDATE questions SET image_url = '/images/스웨덴.png' WHERE content = '스웨덴';
UPDATE questions SET image_url = '/images/스위스.png' WHERE content = '스위스';
UPDATE questions SET image_url = '/images/스파이 패밀리.jpg' WHERE content = '스파이 패밀리';
UPDATE questions SET image_url = '/images/스페인.png' WHERE content = '스페인';
UPDATE questions SET image_url = '/images/슬기.jpg' WHERE content = '슬기';
UPDATE questions SET image_url = '/images/슬램덩크.jpg' WHERE content = '슬램덩크';
UPDATE questions SET image_url = '/images/신동엽.jpg' WHERE content = '신동엽';
UPDATE questions SET image_url = '/images/신라면 블랙.webp' WHERE content = '신라면 블랙';
UPDATE questions SET image_url = '/images/신라면.webp' WHERE content = '신라면';
UPDATE questions SET image_url = '/images/싸이.jpg' WHERE content = '싸이';
UPDATE questions SET image_url = '/images/썬더치킨.jpg' WHERE content = '썬더치킨';
UPDATE questions SET image_url = '/images/아기공룡 둘리.jpg' WHERE content = '아기공룡 둘리';
UPDATE questions SET image_url = '/images/아따맘마.jpg' WHERE content = '아따맘마';
UPDATE questions SET image_url = '/images/아르헨티나.png' WHERE content = '아르헨티나';
UPDATE questions SET image_url = '/images/아이린.jpg' WHERE content = '아이린';
UPDATE questions SET image_url = '/images/아이유.jpg' WHERE content = '아이유';
UPDATE questions SET image_url = '/images/안성탕면.webp' WHERE content = '안성탕면';
UPDATE questions SET image_url = '/images/안유진.jpg' WHERE content = '안유진';
UPDATE questions SET image_url = '/images/열라면.webp' WHERE content = '열라면';
UPDATE questions SET image_url = '/images/영국.png' WHERE content = '영국';
UPDATE questions SET image_url = '/images/예지.jpg' WHERE content = '예지';
UPDATE questions SET image_url = '/images/오빠닭.png' WHERE content = '오빠닭';
UPDATE questions SET image_url = '/images/오징어짬뽕.webp' WHERE content = '오징어짬뽕';
UPDATE questions SET image_url = '/images/왕뚜껑.webp' WHERE content = '왕뚜껑';
UPDATE questions SET image_url = '/images/원펀맨.jpg' WHERE content = '원펀맨';
UPDATE questions SET image_url = '/images/원피스.jpg' WHERE content = '원피스';
UPDATE questions SET image_url = '/images/웬디.jpg' WHERE content = '웬디';
UPDATE questions SET image_url = '/images/윈터.jpg' WHERE content = '윈터';
UPDATE questions SET image_url = '/images/유나.jpg' WHERE content = '유나';
UPDATE questions SET image_url = '/images/유재석.jpg' WHERE content = '유재석';
UPDATE questions SET image_url = '/images/육개장 사발면.webp' WHERE content = '육개장 사발면';
UPDATE questions SET image_url = '/images/은채.jpg' WHERE content = '은채';
UPDATE questions SET image_url = '/images/은혼.jpg' WHERE content = '은혼';
UPDATE questions SET image_url = '/images/이병헌.jpg' WHERE content = '이병헌';
UPDATE questions SET image_url = '/images/이수근.jpg' WHERE content = '이수근';
UPDATE questions SET image_url = '/images/이웃집 토토로.jpg' WHERE content = '이웃집 토토로';
UPDATE questions SET image_url = '/images/이정재.jpg' WHERE content = '이정재';
UPDATE questions SET image_url = '/images/이집트.png' WHERE content = '이집트';
UPDATE questions SET image_url = '/images/이탈리아.png' WHERE content = '이탈리아';
UPDATE questions SET image_url = '/images/이효리.jpg' WHERE content = '이효리';
UPDATE questions SET image_url = '/images/인도.png' WHERE content = '인도';
UPDATE questions SET image_url = '/images/일본.png' WHERE content = '일본';
UPDATE questions SET image_url = '/images/임영웅.jpg' WHERE content = '임영웅';
UPDATE questions SET image_url = '/images/자담 맵슐랭.png' WHERE content = '자담 맵슐랭';
UPDATE questions SET image_url = '/images/장원영.jpg' WHERE content = '장원영';
UPDATE questions SET image_url = '/images/전지현.jpg' WHERE content = '전지현';
UPDATE questions SET image_url = '/images/정우성.jpg' WHERE content = '정우성';
UPDATE questions SET image_url = '/images/제니.jpg' WHERE content = '제니';
UPDATE questions SET image_url = '/images/조이.jpg' WHERE content = '조이';
UPDATE questions SET image_url = '/images/주술회전.jpg' WHERE content = '주술회전';
UPDATE questions SET image_url = '/images/중국.png' WHERE content = '중국';
UPDATE questions SET image_url = '/images/지드래곤.jpg' WHERE content = '지드래곤';
UPDATE questions SET image_url = '/images/지수.jpg' WHERE content = '지수';
UPDATE questions SET image_url = '/images/지코바 숯불양념.jpg' WHERE content = '지코바 숯불양념';
UPDATE questions SET image_url = '/images/지효.jpg' WHERE content = '지효';
UPDATE questions SET image_url = '/images/진격의 거인.jpg' WHERE content = '진격의 거인';
UPDATE questions SET image_url = '/images/진라면 매운맛.avif' WHERE content = '진라면 매운맛';
UPDATE questions SET image_url = '/images/진라면 순한맛.webp' WHERE content = '진라면 순한맛';
UPDATE questions SET image_url = '/images/진짬뽕.webp' WHERE content = '진짬뽕';
UPDATE questions SET image_url = '/images/짜왕.webp' WHERE content = '짜왕';
UPDATE questions SET image_url = '/images/짜파게티.webp' WHERE content = '짜파게티';
UPDATE questions SET image_url = '/images/짱구는 못말려.jpg' WHERE content = '짱구는 못말려';
UPDATE questions SET image_url = '/images/차은우.jpg' WHERE content = '차은우';
UPDATE questions SET image_url = '/images/참깨라면.webp' WHERE content = '참깨라면';
UPDATE questions SET image_url = '/images/처갓집 슈프림양념.jpg' WHERE content = '처갓집 슈프림양념';
UPDATE questions SET image_url = '/images/체인소 맨.jpg' WHERE content = '체인소 맨';
UPDATE questions SET image_url = '/images/최민식.jpg' WHERE content = '최민식';
UPDATE questions SET image_url = '/images/최애의 아이.jpg' WHERE content = '최애의 아이';
UPDATE questions SET image_url = '/images/치킨마루.jpg' WHERE content = '치킨마루';
UPDATE questions SET image_url = '/images/카리나.jpg' WHERE content = '카리나';
UPDATE questions SET image_url = '/images/캐나다.png' WHERE content = '캐나다';
UPDATE questions SET image_url = '/images/태국.png' WHERE content = '태국';
UPDATE questions SET image_url = '/images/태연.jpg' WHERE content = '태연';
UPDATE questions SET image_url = '/images/튀김우동.webp' WHERE content = '튀김우동';
UPDATE questions SET image_url = '/images/튀르키예.png' WHERE content = '튀르키예';
UPDATE questions SET image_url = '/images/틈새라면.webp' WHERE content = '틈새라면';
UPDATE questions SET image_url = '/images/팔도비빔면.webp' WHERE content = '팔도비빔면';
UPDATE questions SET image_url = '/images/페리카나 양념.jpg' WHERE content = '페리카나 양념';
UPDATE questions SET image_url = '/images/포르투갈.png' WHERE content = '포르투갈';
UPDATE questions SET image_url = '/images/포켓몬스터.jpg' WHERE content = '포켓몬스터';
UPDATE questions SET image_url = '/images/폴란드.png' WHERE content = '폴란드';
UPDATE questions SET image_url = '/images/푸라닭 고추마요.jpg' WHERE content = '푸라닭 고추마요';
UPDATE questions SET image_url = '/images/푸라닭 블랙알리오.jpg' WHERE content = '푸라닭 블랙알리오';
UPDATE questions SET image_url = '/images/프랑스.png' WHERE content = '프랑스';
UPDATE questions SET image_url = '/images/하니.jpg' WHERE content = '하니';
UPDATE questions SET image_url = '/images/하울의 움직이는 성.jpg' WHERE content = '하울의 움직이는 성';
UPDATE questions SET image_url = '/images/하이큐.jpg' WHERE content = '하이큐';
UPDATE questions SET image_url = '/images/하정우.jpg' WHERE content = '하정우';
UPDATE questions SET image_url = '/images/해린.jpg' WHERE content = '해린';
UPDATE questions SET image_url = '/images/헌터x헌터.jpg' WHERE content = '헌터x헌터';
UPDATE questions SET image_url = '/images/현빈.jpg' WHERE content = '현빈';
UPDATE questions SET image_url = '/images/호식이 두마리.jpg' WHERE content = '호식이 두마리';
UPDATE questions SET image_url = '/images/호주.png' WHERE content = '호주';
UPDATE questions SET image_url = '/images/호치킨.jpg' WHERE content = '호치킨';
UPDATE questions SET image_url = '/images/황정민.jpg' WHERE content = '황정민';