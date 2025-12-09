-- 카테고리별 퀴즈 3개씩 생성 (총 15개)
-- 실제 DB 스키마에 맞춘 버전

BEGIN;

--------------------------------------------------
-- 1. 일반 퀴즈 (normal) - 3개
--------------------------------------------------

-- 일반 퀴즈 1: 한국사 퀴즈
WITH q1 AS (
  INSERT INTO quizzes (title, description, category, creator_id)
  VALUES ('한국사 기초 퀴즈', '한국 역사의 기본 지식을 테스트하는 퀴즈입니다.', 'normal', 1)
  RETURNING id
),
q1_questions AS (
  INSERT INTO questions (quiz_id, content, answer)
  SELECT id, txt, ans FROM q1,
     (VALUES 
       ('조선왕조의 첫 번째 왕은?', 0),
       ('한국의 수도는?', 1),
       ('한글을 만든 왕은?', 1)
     ) AS v(txt, ans)
  RETURNING id, quiz_id
)
INSERT INTO options (question_id, option_text, option_order)
SELECT q.id, txt, ord
FROM (SELECT id FROM q1_questions ORDER BY id LIMIT 1) q,
     (VALUES ('태조', 0), ('세종', 1), ('광해군', 2), ('인조', 3)) AS v(txt, ord);

INSERT INTO options (question_id, option_text, option_order)
SELECT q.id, txt, ord
FROM (SELECT id FROM (SELECT id FROM questions WHERE quiz_id = (SELECT id FROM quizzes WHERE title = '한국사 기초 퀴즈' LIMIT 1) ORDER BY id OFFSET 1 LIMIT 1) AS sub) q,
     (VALUES ('부산', 0), ('서울', 1), ('인천', 2), ('대구', 3)) AS v(txt, ord);

INSERT INTO options (question_id, option_text, option_order)
SELECT q.id, txt, ord
FROM (SELECT id FROM (SELECT id FROM questions WHERE quiz_id = (SELECT id FROM quizzes WHERE title = '한국사 기초 퀴즈' LIMIT 1) ORDER BY id OFFSET 2 LIMIT 1) AS sub) q,
     (VALUES ('태종', 0), ('세종', 1), ('문종', 2), ('단종', 3)) AS v(txt, ord);

-- 일반 퀴즈 2: 과학 상식
WITH q2 AS (
  INSERT INTO quizzes (title, description, category, creator_id)
  VALUES ('과학 상식 퀴즈', '일상에서 접할 수 있는 과학 지식을 테스트합니다.', 'normal', 1)
  RETURNING id
),
q2_questions AS (
  INSERT INTO questions (quiz_id, content, answer)
  SELECT id, txt, ans FROM q2,
     (VALUES 
       ('물의 화학식은?', 0),
       ('지구에서 가장 가까운 별은?', 0),
       ('인간의 정상 체온은?', 1)
     ) AS v(txt, ans)
  RETURNING id
)
SELECT 1;

INSERT INTO options (question_id, option_text, option_order)
SELECT q.id, txt, ord
FROM (SELECT id FROM questions WHERE quiz_id = (SELECT id FROM quizzes WHERE title = '과학 상식 퀴즈' LIMIT 1) ORDER BY id LIMIT 1) q,
     (VALUES ('H2O', 0), ('CO2', 1), ('O2', 2), ('NaCl', 3)) AS v(txt, ord);

INSERT INTO options (question_id, option_text, option_order)
SELECT q.id, txt, ord
FROM (SELECT id FROM questions WHERE quiz_id = (SELECT id FROM quizzes WHERE title = '과학 상식 퀴즈' LIMIT 1) ORDER BY id OFFSET 1 LIMIT 1) q,
     (VALUES ('태양', 0), ('달', 1), ('화성', 2), ('금성', 3)) AS v(txt, ord);

INSERT INTO options (question_id, option_text, option_order)
SELECT q.id, txt, ord
FROM (SELECT id FROM questions WHERE quiz_id = (SELECT id FROM quizzes WHERE title = '과학 상식 퀴즈' LIMIT 1) ORDER BY id OFFSET 2 LIMIT 1) q,
     (VALUES ('36.5도', 0), ('37도', 1), ('35도', 2), ('38도', 3)) AS v(txt, ord);

-- 일반 퀴즈 3: 음악 퀴즈
INSERT INTO quizzes (title, description, category, creator_id)
VALUES ('K-POP 음악 퀴즈', '한국 대중음악에 대한 퀴즈입니다.', 'normal', 1);

INSERT INTO questions (quiz_id, content, answer)
SELECT id, txt, ans FROM (SELECT id FROM quizzes WHERE title = 'K-POP 음악 퀴즈' LIMIT 1) q,
     (VALUES 
       ('"Gangnam Style"을 부른 가수는?', 0),
       ('BTS의 팬클럽 이름은?', 0),
       ('소녀시대의 데뷔곡은?', 0)
     ) AS v(txt, ans);

INSERT INTO options (question_id, option_text, option_order)
SELECT q.id, txt, ord
FROM (SELECT id FROM questions WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'K-POP 음악 퀴즈' LIMIT 1) ORDER BY id LIMIT 1) q,
     (VALUES ('싸이', 0), ('빅뱅', 1), ('아이유', 2), ('태연', 3)) AS v(txt, ord);

INSERT INTO options (question_id, option_text, option_order)
SELECT q.id, txt, ord
FROM (SELECT id FROM questions WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'K-POP 음악 퀴즈' LIMIT 1) ORDER BY id OFFSET 1 LIMIT 1) q,
     (VALUES ('ARMY', 0), ('ONCE', 1), ('BLINK', 2), ('VIP', 3)) AS v(txt, ord);

INSERT INTO options (question_id, option_text, option_order)
SELECT q.id, txt, ord
FROM (SELECT id FROM questions WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'K-POP 음악 퀴즈' LIMIT 1) ORDER BY id OFFSET 2 LIMIT 1) q,
     (VALUES ('다시 만난 세계', 0), ('Gee', 1), ('소원을 말해봐', 2), ('The Boys', 3)) AS v(txt, ord);

--------------------------------------------------
-- 2. 마추기 (machugi) - 3개
--------------------------------------------------

INSERT INTO quizzes (title, description, category, creator_id)
VALUES ('애니메이션 캐릭터 맞추기', '유명 애니메이션 캐릭터의 이름을 맞춰보세요!', 'machugi', 1);

INSERT INTO questions (quiz_id, content)
SELECT id, txt FROM (SELECT id FROM quizzes WHERE title = '애니메이션 캐릭터 맞추기' LIMIT 1) q,
     (VALUES ('뽀로로'), ('짱구'), ('도라에몽')) AS v(txt);

INSERT INTO quizzes (title, description, category, creator_id)
VALUES ('아이돌 얼굴 맞추기', 'K-POP 아이돌의 이름을 맞춰보세요!', 'machugi', 1);

INSERT INTO questions (quiz_id, content)
SELECT id, txt FROM (SELECT id FROM quizzes WHERE title = '아이돌 얼굴 맞추기' LIMIT 1) q,
     (VALUES ('아이유'), ('태연'), ('지수')) AS v(txt);

INSERT INTO quizzes (title, description, category, creator_id)
VALUES ('국기 맞추기', '각 나라의 국기를 보고 나라 이름을 맞춰보세요!', 'machugi', 1);

INSERT INTO questions (quiz_id, content)
SELECT id, txt FROM (SELECT id FROM quizzes WHERE title = '국기 맞추기' LIMIT 1) q,
     (VALUES ('대한민국'), ('일본'), ('미국')) AS v(txt);

--------------------------------------------------
-- 3. 월드컵 (worldcup) - 3개
--------------------------------------------------

INSERT INTO quizzes (title, description, category, creator_id)
VALUES ('치킨 브랜드 월드컵', '나의 최애 치킨 브랜드를 골라보세요!', 'worldcup', 1);

INSERT INTO worldcup_candidates (quiz_id, name, image_url, candidate_order)
SELECT id, name, img, ord FROM (SELECT id FROM quizzes WHERE title = '치킨 브랜드 월드컵' LIMIT 1) q,
     (VALUES 
       ('BBQ 황금올리브', NULL, 1),
       ('BHC 뿌링클', NULL, 2),
       ('교촌 오리지널', NULL, 3),
       ('네네 치즈볼 세트', NULL, 4),
       ('푸라닭 블랙알리오', NULL, 5),
       ('굽네 고추바사삭', NULL, 6),
       ('멕시카나 뿌리고', NULL, 7),
       ('호식이 두마리 치킨', NULL, 8)
     ) AS v(name, img, ord);

INSERT INTO quizzes (title, description, category, creator_id)
VALUES ('음료수 월드컵', '가장 좋아하는 음료수를 골라보세요!', 'worldcup', 1);

INSERT INTO worldcup_candidates (quiz_id, name, image_url, candidate_order)
SELECT id, name, img, ord FROM (SELECT id FROM quizzes WHERE title = '음료수 월드컵' LIMIT 1) q,
     (VALUES 
       ('콜라', NULL, 1),
       ('사이다', NULL, 2),
       ('환타', NULL, 3),
       ('스프라이트', NULL, 4),
       ('펩시', NULL, 5),
       ('환타 오렌지', NULL, 6),
       ('코카콜라', NULL, 7),
       ('칠성사이다', NULL, 8)
     ) AS v(name, img, ord);

INSERT INTO quizzes (title, description, category, creator_id)
VALUES ('과일 월드컵', '가장 좋아하는 과일을 골라보세요!', 'worldcup', 1);

INSERT INTO worldcup_candidates (quiz_id, name, image_url, candidate_order)
SELECT id, name, img, ord FROM (SELECT id FROM quizzes WHERE title = '과일 월드컵' LIMIT 1) q,
     (VALUES 
       ('사과', NULL, 1),
       ('바나나', NULL, 2),
       ('딸기', NULL, 3),
       ('포도', NULL, 4),
       ('오렌지', NULL, 5),
       ('수박', NULL, 6),
       ('복숭아', NULL, 7),
       ('체리', NULL, 8)
     ) AS v(name, img, ord);

--------------------------------------------------
-- 4. 밸런스 게임 (balance) - 3개
--------------------------------------------------

INSERT INTO quizzes (title, description, category, creator_id)
VALUES ('일상 밸런스 게임', '둘 중 하나만 선택해야 한다면?', 'balance', 1);

INSERT INTO balance_items (quiz_id, option_a, option_b, image_a_url, image_b_url, item_order)
SELECT id, a, b, img_a, img_b, ord FROM (SELECT id FROM quizzes WHERE title = '일상 밸런스 게임' LIMIT 1) q,
     (VALUES 
       ('평생 치킨 무제한', '평생 피자 무제한', NULL, NULL, 1),
       ('하루 4시간만 수면', '하루 4시간만 자유시간', NULL, NULL, 2),
       ('과거로 돌아가기', '미래로 순간이동하기', NULL, NULL, 3)
     ) AS v(a, b, img_a, img_b, ord);

INSERT INTO quizzes (title, description, category, creator_id)
VALUES ('음식 밸런스 게임', '음식 관련 밸런스 게임입니다.', 'balance', 1);

INSERT INTO balance_items (quiz_id, option_a, option_b, image_a_url, image_b_url, item_order)
SELECT id, a, b, img_a, img_b, ord FROM (SELECT id FROM quizzes WHERE title = '음식 밸런스 게임' LIMIT 1) q,
     (VALUES 
       ('떡볶이', '순대', NULL, NULL, 1),
       ('김치찌개', '된장찌개', NULL, NULL, 2),
       ('라면', '국수', NULL, NULL, 3)
     ) AS v(a, b, img_a, img_b, ord);

INSERT INTO quizzes (title, description, category, creator_id)
VALUES ('취미 밸런스 게임', '취미 관련 밸런스 게임입니다.', 'balance', 1);

INSERT INTO balance_items (quiz_id, option_a, option_b, image_a_url, image_b_url, item_order)
SELECT id, a, b, img_a, img_b, ord FROM (SELECT id FROM quizzes WHERE title = '취미 밸런스 게임' LIMIT 1) q,
     (VALUES 
       ('독서', '영화보기', NULL, NULL, 1),
       ('운동', '게임', NULL, NULL, 2),
       ('여행', '집에서 쉬기', NULL, NULL, 3)
     ) AS v(a, b, img_a, img_b, ord);

--------------------------------------------------
-- 5. 성격 테스트 (test) - 3개
--------------------------------------------------

INSERT INTO quizzes (title, description, category, creator_id)
VALUES ('간단 MBTI 테스트', '4문항으로 알아보는 간단한 성격 유형 테스트입니다.', 'test', 1);

INSERT INTO personality_questions (quiz_id, question_text, option_a, option_b, type_a, type_b, question_order)
SELECT id, q, a, b, ta, tb, ord FROM (SELECT id FROM quizzes WHERE title = '간단 MBTI 테스트' LIMIT 1) q,
     (VALUES 
       ('주말에 나는?', '집에서 쉬는 편이다', '밖에 나가 사람들을 만난다', 'I', 'E', 1),
       ('일을 할 때 나는?', '계획을 세우고 차근차근 진행한다', '즉흥적으로 유연하게 움직인다', 'J', 'P', 2),
       ('갈등 상황에서 나는?', '논리적으로 판단하려 한다', '상대의 감정을 우선한다', 'T', 'F', 3),
       ('새로운 사람을 만날 때 나는?', '먼저 말을 잘 거는 편이 아니다', '먼저 말을 잘 거는 편이다', 'I', 'E', 4)
     ) AS v(q, a, b, ta, tb, ord);

INSERT INTO quizzes (title, description, category, creator_id)
VALUES ('라이프스타일 테스트', '당신의 라이프스타일을 알아보는 테스트입니다.', 'test', 1);

INSERT INTO personality_questions (quiz_id, question_text, option_a, option_b, type_a, type_b, question_order)
SELECT id, q, a, b, ta, tb, ord FROM (SELECT id FROM quizzes WHERE title = '라이프스타일 테스트' LIMIT 1) q,
     (VALUES 
       ('아침에 일어나면?', '즉시 일어난다', '5분만 더...', 'A', 'B', 1),
       ('식사할 때?', '집중해서 먹는다', 'TV나 영상 보면서 먹는다', 'A', 'B', 2),
       ('쇼핑할 때?', '필요한 것만 산다', '이것저것 다 산다', 'A', 'B', 3),
       ('주말 계획은?', '미리 계획한다', '그때그때 결정한다', 'A', 'B', 4)
     ) AS v(q, a, b, ta, tb, ord);

INSERT INTO quizzes (title, description, category, creator_id)
VALUES ('커뮤니케이션 스타일 테스트', '당신의 소통 방식을 알아보는 테스트입니다.', 'test', 1);

INSERT INTO personality_questions (quiz_id, question_text, option_a, option_b, type_a, type_b, question_order)
SELECT id, q, a, b, ta, tb, ord FROM (SELECT id FROM quizzes WHERE title = '커뮤니케이션 스타일 테스트' LIMIT 1) q,
     (VALUES 
       ('대화할 때?', '듣는 편이다', '말하는 편이다', 'A', 'B', 1),
       ('의견이 다를 때?', '직접 말한다', '돌려서 말한다', 'A', 'B', 2),
       ('감정 표현은?', '솔직하게 표현한다', '숨기는 편이다', 'A', 'B', 3),
       ('갈등 해결은?', '빨리 해결하려 한다', '시간을 두고 해결한다', 'A', 'B', 4)
     ) AS v(q, a, b, ta, tb, ord);

-- 확인
SELECT 
  category,
  COUNT(*) as quiz_count
FROM quizzes
GROUP BY category
ORDER BY category;

COMMIT;
