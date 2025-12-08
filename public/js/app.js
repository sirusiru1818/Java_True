// API 기본 URL
        const API_BASE = window.location.origin;
        
        // 현재 사용자 정보
        let currentUser = null;
        let allQuizzes = [];
        let currentQuiz = {};
        let selectedCount = 0;
        let isSignupMode = false;
        
        let wcState = { round: [], nextRound: [], roundName: 16 };
        let normalState = { questions: [], index: 0, scoreA: 0, scoreB: 0, score: 0 };
        
        // 통계 관련
        const STORAGE_KEY = 'machugi_stats_v1';
        function loadStats(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e){ return []; } }
        function saveStats(entry){ const list = loadStats(); list.push(entry); localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-200))); }
        function clearStats(){ localStorage.removeItem(STORAGE_KEY); renderStats(); }
        function percent(correct,total){ if(!total) return 0; return Math.round((correct/total)*100); }
        function gradeByPercent(p){ if(p>=90) return 'S'; if(p>=80) return 'A'; if(p>=70) return 'B'; if(p>=60) return 'C'; if(p>=40) return 'D'; return 'F'; }
        function gradeText(g){ return { S:'완벽에 가깝습니다!', A:'매우 우수해요!', B:'좋은 실력이에요.', C:'보통 수준이에요.', D:'조금만 더 연습해요.', F:'시작이 반! 다시 도전!' }[g] || ''; }
        function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
        
        // 페이지 로드 시 초기화
        window.addEventListener('DOMContentLoaded', async () => {
            await checkLogin();
            await fetchQuizzes();
        });

        /* 1. 페이지 네비게이션 */
        function showPage(id) {
            const pages = ['home-page','create-page','login-page','play-page','result-page','select-count-page'];
            pages.forEach(p => {
                const el = document.getElementById(p);
                if(el) el.classList.add('hidden');
            });
            const targetId = id.endsWith('-page') ? id : id + '-page';
            const targetEl = document.getElementById(targetId);
            if(targetEl) targetEl.classList.remove('hidden');
            window.scrollTo(0, 0);
            
            if (id === 'home' || id === 'home-page') {
                fetchQuizzes();
                // 필터는 fetchQuizzes 내부에서 applyFilters()를 호출하므로 여기서는 호출하지 않음
            }
            
            if (id === 'create' && document.querySelectorAll('.question-item').length === 0) {
                changeCategory();
            }
        }
        
        async function fetchQuizzes() {
            try {
                console.log('📡 퀴즈 목록 요청:', `${API_BASE}/api/quizzes`);
                const res = await fetch(`${API_BASE}/api/quizzes`);
                console.log('📥 응답 상태:', res.status, res.statusText);
                
                const data = await res.json();
                console.log('📦 응답 데이터:', data);
                
                if(data.success) {
                    allQuizzes = data.quizzes || [];
                    console.log(`✅ 퀴즈 ${allQuizzes.length}개 로드됨`);
                    console.log('📋 카테고리 분포:', allQuizzes.reduce((acc, q) => {
                        acc[q.category || 'null'] = (acc[q.category || 'null'] || 0) + 1;
                        return acc;
                    }, {}));
                    applyFilters(); // 필터 적용
                } else if(Array.isArray(data)) {
                    allQuizzes = data;
                    console.log(`✅ 퀴즈 ${allQuizzes.length}개 로드됨 (배열 형식)`);
                    console.log('📋 카테고리 분포:', allQuizzes.reduce((acc, q) => {
                        acc[q.category || 'null'] = (acc[q.category || 'null'] || 0) + 1;
                        return acc;
                    }, {}));
                    applyFilters(); // 필터 적용
                } else {
                    allQuizzes = [];
                    console.warn('⚠️  예상치 못한 응답 형식:', data);
                    applyFilters(); // 필터 적용
                }
            } catch(e) {
                console.error('❌ 퀴즈 로드 오류:', e);
                console.error('   서버가 실행 중인지 확인하세요: npm start');
                console.error('   API_BASE:', API_BASE);
                
                // 사용자에게 오류 표시
                const grid = document.getElementById('quiz-grid');
                if(grid) {
                    grid.innerHTML = `
                        <div style="text-align:center; padding:40px; color:#ff6b6b;">
                            <h3>⚠️ 데이터를 불러올 수 없습니다</h3>
                            <p>서버 연결을 확인하세요.</p>
                            <p style="font-size:12px; color:#868e96;">오류: ${e.message}</p>
                            <button onclick="fetchQuizzes()" style="margin-top:20px; padding:10px 20px; background:#4A469F; color:white; border:none; border-radius:8px; cursor:pointer;">
                                다시 시도
                            </button>
                        </div>
                    `;
                }
            }
        }
        
        // 디버깅용: DB 상태 확인
        async function checkDBStatus() {
            try {
                const res = await fetch(`${API_BASE}/api/db-status`);
                const data = await res.json();
                console.log('🗄️  DB 상태:', data);
                return data;
            } catch(e) {
                console.error('❌ DB 상태 확인 실패:', e);
                return null;
            }
        }
        
        // 전역에서 사용 가능하도록 (HTML onclick 핸들러용)
        window.checkDBStatus = checkDBStatus;
        window.fetchQuizzes = fetchQuizzes;
        window.showPage = showPage;
        window.filterCategory = filterCategory;
        window.goToLogin = goToLogin;
        window.handleLogout = handleLogout;
        window.addQuestion = addQuestion;
        window.submitQuiz = submitQuiz;
        window.checkId = checkId;
        window.handleAuth = handleAuth;
        window.toggleFindMode = toggleFindMode;
        window.handleFindAccount = handleFindAccount;
        window.startRealQuiz = startRealQuiz;
        window.selectCount = selectCount;
        window.changeCategory = changeCategory;
        window.removeQuestion = removeQuestion;
        window.prepareQuiz = prepareQuiz;
        
        function renderQuizzes(list) {
            const grid = document.getElementById('quiz-grid');
            grid.innerHTML = '';
            if(list.length === 0) { 
                document.getElementById('empty-state').classList.remove('hidden'); 
                return; 
            }
            document.getElementById('empty-state').classList.add('hidden');

            list.forEach(quiz => {
                const div = document.createElement('div');
                div.className = 'card';
                div.setAttribute('data-category', quiz.category);
                div.onclick = () => prepareQuiz(quiz);

                let bgClass = 'bg-normal';
                if(quiz.category === 'worldcup') bgClass = 'bg-worldcup';
                else if(quiz.category === 'machugi') bgClass = 'bg-machugi';
                else if(quiz.category === 'balance') bgClass = 'bg-balance';

                const imgTag = quiz.image_url ? `<img src="${API_BASE}${quiz.image_url}" onerror="this.style.display='none'">` : '';

                div.innerHTML = `
                    <div class="thumb ${bgClass}">
                        ${imgTag}
                        <div class="play-icon"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></div>
                    </div>
                    <div class="info">
                        <div class="card-title">${quiz.title}</div>
                        <div class="card-desc">${quiz.description || ''}</div>
                        <div class="card-footer"><div class="user-avatar"></div><span>참여자 ${quiz.play_count || 0}</span></div>
                    </div>
                `;
                grid.appendChild(div);
            });
        }
        
        function prepareQuiz(quiz) {
            currentQuiz = quiz;
            showPage('select-count-page');
            const opts = document.getElementById('count-options');
            opts.innerHTML = '';
            document.getElementById('startBtn').classList.add('disabled');
            selectedCount = 0;

            if(quiz.category === 'worldcup') {
                [8, 16, 32].forEach(cnt => {
                    opts.innerHTML += `<button class="count-btn" onclick="selectCount(this, ${cnt})">${cnt}강</button>`;
                });
            } else {
                [10, 20, 30].forEach(cnt => {
                    opts.innerHTML += `<button class="count-btn" onclick="selectCount(this, ${cnt})">${cnt}문제</button>`;
                });
                opts.innerHTML += `<button class="count-btn" onclick="selectCount(this, 'all')">전체 문제</button>`;
            }
        }

        function selectCount(btn, count) {
            document.querySelectorAll('.count-btn').forEach(b => {
                b.classList.remove('selected');
                b.style.backgroundColor = '#f3f3f3';
                b.style.color = '#333';
            });
            btn.classList.add('selected');
            btn.style.backgroundColor = '#6A5AE0';
            btn.style.color = 'white';
            selectedCount = count;
            document.getElementById('startBtn').classList.remove('disabled');
        }

        async function startRealQuiz() {
            if(!selectedCount) return;
            try {
                const res = await fetch(`${API_BASE}/api/quiz/${currentQuiz.id}/questions?count=${selectedCount}`);
                const data = await res.json();
                
                if(data.success && data.questions.length > 0) {
                    if (currentQuiz.category === 'worldcup' && data.questions.length < selectedCount) {
                         alert(`문제가 부족합니다. (현재 ${data.questions.length}개)`);
                         return;
                    }
                    showPage('play-page');
                    if(currentQuiz.category === 'worldcup') initWorldCup(data.questions);
                    else initNormalQuiz(data.questions);
                } else {
                    alert("문제를 불러올 수 없습니다.");
                }
            } catch(e) { 
                console.error('퀴즈 시작 오류:', e);
                alert("오류 발생"); 
            }
        }
        

        /* 2. 만들기 기능 (카테고리별 폼 변경) */
        let currentCreateCategory = 'normal';

        function changeCategory() {
            const select = document.getElementById('category-select');
            currentCreateCategory = select.value;
            const container = document.getElementById('question-list-container');
            const btn = document.getElementById('add-btn');
            const title = document.getElementById('section-title');

            // 기존 문제 비우기 (제목 제외)
            container.innerHTML = `<h3 class="question-section-title" id="section-title"></h3>`;
            
            // 텍스트 업데이트
            if (currentCreateCategory === 'worldcup') {
                document.getElementById('section-title').innerText = '월드컵 후보 등록';
                btn.innerText = '+ 후보 추가하기';
            } else if (currentCreateCategory === 'balance') {
                document.getElementById('section-title').innerText = '밸런스 문항 작성';
                btn.innerText = '+ 문항 추가하기';
            } else {
                document.getElementById('section-title').innerText = '문제 출제';
                btn.innerText = '+ 문제 추가하기';
            }
            addQuestion(); // 첫 번째 문제 자동 추가
        }

        function addQuestion() {
            const container = document.getElementById('question-list-container');
            const count = container.querySelectorAll('.question-item').length + 1;
            let html = '';

            if (currentCreateCategory === 'normal') {
                // [수정됨] 일반 퀴즈: 이미지 업로드 필드 추가 및 레이아웃 개선
                html = `
                <div class="question-item">
                    <div class="question-header">
                        <span class="question-number">Q${count}.</span>
                        <span class="btn-remove" onclick="removeQuestion(this)">삭제</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">문제 이미지 (필수)</label>
                        <input type="file" class="form-input" accept="image/*" style="background: white;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">질문 내용</label>
                        <input type="text" class="form-input" placeholder="예: 이 캐릭터의 이름은?">
                    </div>
                    <div class="form-group">
                        <label class="form-label">정답</label>
                        <input type="text" class="form-input" placeholder="정답을 입력하세요">
                    </div>
                </div>`;
            } else if (currentCreateCategory === 'balance') {
                html = `<div class="question-item"><div class="question-header"><span class="question-number">Round ${count}</span><span class="btn-remove" onclick="removeQuestion(this)">삭제</span></div><div class="half-inputs"><input type="text" class="form-input" placeholder="선택지 A"><input type="text" class="form-input" placeholder="선택지 B"></div></div>`;
            } else if (currentCreateCategory === 'worldcup') {
                html = `<div class="question-item"><div class="question-header"><span class="question-number">후보 ${count}</span><span class="btn-remove" onclick="removeQuestion(this)">삭제</span></div><input type="text" class="form-input" placeholder="후보 이름"><input type="file" class="form-input" style="margin-top:10px;"></div>`;
            } else { // test
                 html = `<div class="question-item"><div class="question-header"><span class="question-number">질문 ${count}</span><span class="btn-remove" onclick="removeQuestion(this)">삭제</span></div><input type="text" class="form-input" placeholder="질문 내용"><div class="half-inputs" style="margin-top:10px;"><input type="text" class="form-input" placeholder="답변 A (유형1)"><input type="text" class="form-input" placeholder="답변 B (유형2)"></div></div>`;
            }
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeQuestion(btn) {
            btn.closest('.question-item').remove();
            // 번호 재정렬 로직 생략 (간소화)
        }
        
        /* 퀴즈 제출 */
        async function submitQuiz() {
            try {
                const title = document.querySelector('#create-page .form-input').value;
                const description = ''; // 설명 필드가 없으면 빈 문자열
                const category = document.getElementById('category-select').value;
                
                const questionItems = document.querySelectorAll('.question-item');
                const questions = [];
                
                for (let item of questionItems) {
                    if (category === 'normal') {
                        const questionText = item.querySelectorAll('.form-input')[1]?.value || '';
                        const correctAnswer = item.querySelectorAll('.form-input')[2]?.value || '';
                        const fileInput = item.querySelector('input[type="file"]');
                        const options = []; // 선택지 입력 필드가 필요하면 추가
                        
                        // 이미지 업로드는 추후 구현 (현재는 URL만 저장)
                        questions.push({
                            question_text: questionText,
                            correct_answer: parseInt(correctAnswer) || 0,
                            options: ['선택지1', '선택지2', '선택지3', '선택지4'] // 임시
                        });
                    } else if (category === 'balance') {
                        const inputs = item.querySelectorAll('.form-input');
                        questions.push({
                            option_a: inputs[0]?.value || '',
                            option_b: inputs[1]?.value || ''
                        });
                    } else if (category === 'worldcup') {
                        const name = item.querySelectorAll('.form-input')[0]?.value || '';
                        questions.push({ name });
                    } else if (category === 'test') {
                        const inputs = item.querySelectorAll('.form-input');
                        questions.push({
                            question_text: inputs[0]?.value || '',
                            option_a: inputs[1]?.value || '',
                            option_b: inputs[2]?.value || ''
                        });
                    }
                }
                
                const response = await fetch(`${API_BASE}/api/quizzes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        description,
                        category,
                        questions,
                        creator_id: currentUser?.id || null
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('퀴즈가 생성되었습니다!');
                    showPage('home');
                } else {
                    alert('퀴즈 생성에 실패했습니다.');
                }
            } catch (error) {
                console.error('퀴즈 제출 오류:', error);
                alert('퀴즈 생성 중 오류가 발생했습니다.');
            }
        }
        
        // 인증 관련
        async function checkLogin() {
            try {
                const res = await fetch(`${API_BASE}/api/check-login`,{credentials:'include'});
                const d = await res.json();
                updateAuthUI(d.loggedIn);
            } catch(e){}
        }

        function updateAuthUI(isLoggedIn) {
            if(isLoggedIn) {
                document.getElementById('auth-guest').classList.add('hidden');
                document.getElementById('auth-user').classList.remove('hidden');
            } else {
                document.getElementById('auth-guest').classList.remove('hidden');
                document.getElementById('auth-user').classList.add('hidden');
            }
        }

        function goToLogin(signup){
            showPage('login');
            isSignupMode = signup;
            toggleAuthMode();
        }
        
        function toggleAuthMode() {
            const t = document.getElementById('auth-title');
            const btn = document.getElementById('auth-btn');
            ['auth-username','auth-email','auth-password','auth-nickname','auth-password-confirm'].forEach(id=>document.getElementById(id).value='');
            if(isSignupMode) {
                t.innerText = '회원가입'; btn.innerText = '가입하기';
                document.getElementById('email-group').classList.remove('hidden');
                document.getElementById('nickname-group').classList.remove('hidden');
                document.getElementById('password-confirm-group').classList.remove('hidden');
                document.getElementById('btn-check-id').classList.remove('hidden');
            } else {
                t.innerText = '로그인'; btn.innerText = '로그인 하기';
                document.getElementById('email-group').classList.add('hidden');
                document.getElementById('nickname-group').classList.add('hidden');
                document.getElementById('password-confirm-group').classList.add('hidden');
                document.getElementById('btn-check-id').classList.add('hidden');
            }
        }
        function toggleFindMode() {
            const as=document.getElementById('auth-section'); const fs=document.getElementById('find-section'); const t=document.getElementById('auth-title');
            if(fs.classList.contains('hidden')){ as.classList.add('hidden'); fs.classList.remove('hidden'); t.innerText='계정 찾기'; }
            else{ fs.classList.add('hidden'); as.classList.remove('hidden'); t.innerText=isSignupMode?'회원가입':'로그인'; }
        }
        
        async function checkId(){ 
            const u=document.getElementById('auth-username').value; if(!u)return alert("아이디 입력"); 
            try{const r=await fetch(`${API_BASE}/api/check-username`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u})}); const d=await r.json(); alert(d.message);}catch(e){alert("오류");} 
        }
        async function handleFindAccount(){ 
            const e=document.getElementById('find-email').value; if(!e)return alert("이메일 입력"); 
            try{const r=await fetch(`${API_BASE}/api/find-account`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e})}); const d=await r.json(); if(d.success){alert(`ID:${d.username}\nPW:${d.password}`); toggleFindMode();}else alert(d.message);}catch(e){alert("오류");} 
        }

        async function handleAuth(){ 
            const u = document.getElementById('auth-username').value; 
            const p = document.getElementById('auth-password').value; 
            if(!u || !p) return alert("정보 입력"); 
            if(isSignupMode) {
                const pConfirm = document.getElementById('auth-password-confirm').value;
                if(p !== pConfirm) return alert("비밀번호 불일치");
            }
            const url = isSignupMode ? `${API_BASE}/api/signup` : `${API_BASE}/api/login`; 
            const body = {username: u, password: p}; 
            if(isSignupMode){ body.email = document.getElementById('auth-email').value; body.nickname = document.getElementById('auth-nickname').value; }
            try{
                const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(body)}); 
                const d=await res.json(); 
                if(d.success){
                    if(isSignupMode){alert("가입 성공"); isSignupMode=false; toggleAuthMode();}
                    else{alert("환영합니다"); updateAuthUI(true); showPage('home');}
                }else alert(d.message);
            }catch(e){alert("오류");} 
        }
        
        async function handleLogout(){ 
            try{await fetch(`${API_BASE}/api/logout`,{method:'POST',credentials:'include'}); alert("로그아웃"); updateAuthUI(false); showPage('home');}catch(e){} 
        }

        // 월드컵 로직
        function initWorldCup(questions) {
            wcState.round = questions; 
            wcState.nextRound = [];
            wcState.roundName = questions.length; 
            nextWorldCupMatch();
        }

        function nextWorldCupMatch() {
            if(wcState.round.length === 0) {
                if(wcState.nextRound.length === 1) {
                    finishGame(wcState.nextRound[0], true); 
                    return;
                }
                wcState.round = wcState.nextRound;
                wcState.nextRound = [];
                wcState.roundName = wcState.round.length;
            }
            const left = wcState.round.pop();
            const right = wcState.round.pop();
            wcState.currentMatch = [left, right]; 
            renderWorldCupMatch(left, right);
        }

        function renderWorldCupMatch(left, right) {
            let roundTitle = wcState.roundName === 2 ? "결승전" : `${wcState.roundName}강`;
            document.getElementById('round-info').innerText = roundTitle;
            const con = document.getElementById('quiz-content');
            
            const imgL = left.image_url ? `${API_BASE}${left.image_url}` : 'https://via.placeholder.com/300?text=No+Image';
            const imgR = right.image_url ? `${API_BASE}${right.image_url}` : 'https://via.placeholder.com/300?text=No+Image';
            
            con.innerHTML = `
                <div class="wc-container">
                    <div class="wc-item" onclick="selectWinner(0)">
                        <img src="${imgL}"><div class="wc-text">${left.content}</div>
                    </div>
                    <div class="wc-vs">VS</div>
                    <div class="wc-item" onclick="selectWinner(1)">
                        <img src="${imgR}"><div class="wc-text">${right.content}</div>
                    </div>
                </div>
            `;
        }

        function selectWinner(idx) {
            wcState.nextRound.push(wcState.currentMatch[idx]);
            nextWorldCupMatch();
        }

        // 마추기/밸런스 로직
        function initNormalQuiz(questions) {
            normalState.questions = questions;
            normalState.index = 0;
            normalState.scoreA = 0; 
            normalState.scoreB = 0; 
            normalState.score = 0;  
            renderNormalQuestion();
        }

        function renderNormalQuestion() {
            if(normalState.index >= normalState.questions.length) {
                finishGame(null, false);
                return;
            }
            const q = normalState.questions[normalState.index];
            document.getElementById('round-info').innerText = `${normalState.index + 1} / ${normalState.questions.length}`;
            const con = document.getElementById('quiz-content');
            
            if(currentQuiz.category === 'machugi') {
                const imgUrl = q.image_url ? `${API_BASE}${q.image_url}` : 'https://via.placeholder.com/400x300?text=Guess+Who';
                
                let questionText = "이 캐릭터/인물의 이름은?";
                if(currentQuiz.id === 6) questionText = "이 국기는 어느 나라일까요?"; 

                con.innerHTML = `
                    <img src="${imgUrl}" class="quiz-image">
                    <h2 class="quiz-question">${questionText}</h2>
                    <div class="machugi-input-container">
                        <input type="text" id="answerInput" class="machugi-input" placeholder="정답을 입력하세요" autocomplete="off" onkeydown="if(event.key === 'Enter') checkMachugiAnswer()">
                        <button class="machugi-btn" onclick="checkMachugiAnswer()">제출</button>
                    </div>
                `;
                setTimeout(()=> document.getElementById('answerInput').focus(), 100);
            } 
            else if(currentQuiz.category === 'balance') {
                con.innerHTML = `<h2 class="quiz-question">${q.content}</h2>`;
                con.innerHTML += `
                    <div class="vs-container">
                        <div class="vs-item" onclick="nextNormal('A')"><h3>${q.choice_a}</h3></div>
                        <div class="vs-item" onclick="nextNormal('B')"><h3>${q.choice_b}</h3></div>
                    </div>`;
            } else { 
                if(q.image_url) con.innerHTML = `<img src="${API_BASE}${q.image_url}" class="quiz-image">` + con.innerHTML;
                con.innerHTML += `<button class="btn btn-create" onclick="nextNormal()">다음</button>`;
            }
        }

        function checkMachugiAnswer() {
            const input = document.getElementById('answerInput').value;
            if(!input.trim()) return alert("답을 입력해주세요!");

            const q = normalState.questions[normalState.index];
            const correct = q.content.replace(/\s+/g, '').toLowerCase(); 
            const user = input.replace(/\s+/g, '').toLowerCase();

            if(correct === user) {
                alert("정답입니다! ⭕");
                normalState.score++;
                normalState.index++;
                renderNormalQuestion();
            } else {
                alert(`틀렸습니다! ❌ (정답: ${q.content})`);
                normalState.index++;
                renderNormalQuestion();
            }
        }

        function nextNormal(choice) { 
            if (choice === 'A') normalState.scoreA++;
            if (choice === 'B') normalState.scoreB++;
            normalState.index++; 
            renderNormalQuestion(); 
        }

        // 결과 처리
        function finishGame(winner, isWorldCup) {
            showPage('result-page');
            const wrapper = document.getElementById('result-content-wrapper');
            
            if(isWorldCup) {
                const img = winner.image_url ? `${API_BASE}${winner.image_url}` : 'https://via.placeholder.com/300';
                wrapper.innerHTML = `
                    <div class="form-container simple-result-container">
                        <span class="result-icon" style="font-size: 50px;">🏆</span>
                        <h2 class="page-title">우승</h2>
                        <img src="${img}" class="simple-result-image">
                        <div class="simple-result-score">${winner.content}</div>
                        <button class="submit-btn" onclick="showPage('home')">메인으로 돌아가기</button>
                    </div>
                `;
            } 
            else if (currentQuiz.category === 'machugi') {
                const total = normalState.questions.length;
                const correct = normalState.score;
                
                saveStats({ title: currentQuiz.title, correct: correct, total: total, ts: Date.now() });

                wrapper.innerHTML = `
                    <section class="panel">
                        <h1 class="page-title">결과</h1>
                        <p class="subtitle">정답률(%)에 따라 등급을 부여합니다</p>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-title">정답 수</div>
                                <div class="stat-value" id="stat-correct">0</div>
                                <div class="subtitle" id="stat-total">전체 0문제</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-title">정답률</div>
                                <div class="stat-value"><span id="stat-percent">0</span>%</div>
                                <div class="progress"><div id="stat-bar" class="progress-bar" style="width:0%"></div></div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-title">등급</div>
                                <div class="stat-value"><span id="stat-grade" class="grade-badge grade-F">F</span></div>
                                <div class="subtitle" id="stat-grade-text"></div>
                            </div>
                        </div>
                        <div class="recent">
                            <div class="recent-head"><div>일시</div><div>퀴즈 제목</div><div>결과</div><div>정답률</div></div>
                            <div id="recent-container"></div>
                            <div class="recent-actions">
                                <button class="btn btn-outline" onclick="clearStats()">기록 초기화</button>
                            </div>
                        </div>
                        <button class="submit-btn" style="margin-top:20px;" onclick="showPage('home')">메인으로 돌아가기</button>
                    </section>
                `;
                renderStats();
            } 
            else if (currentQuiz.category === 'balance') {
                wrapper.innerHTML = `
                    <div class="form-container simple-result-container">
                        <span class="result-icon" style="font-size: 50px;">⚖️</span>
                        <h2 class="page-title">게임 종료</h2>
                        <div class="simple-result-desc">
                            모든 문제를 완료했습니다.
                        </div>
                        <button class="submit-btn" onclick="showPage('home')">메인으로 돌아가기</button>
                    </div>
                `;
            } else {
                wrapper.innerHTML = `<div class="form-container"><h2 class="page-title">완료</h2><button class="submit-btn" onclick="showPage('home')">홈으로</button></div>`;
            }
        }
        
        function renderStats(){
            const list = loadStats();
            let total=0, correct=0;
            list.forEach(it => { total += (it.total||0); correct += (it.correct||0); });
            const p = percent(correct,total); const g = gradeByPercent(p);
            
            if(document.getElementById('stat-correct')) {
                document.getElementById('stat-correct').innerText = String(correct);
                document.getElementById('stat-total').innerText = `전체 ${total}문제`;
                document.getElementById('stat-percent').innerText = String(p);
                document.getElementById('stat-bar').style.width = p + '%';
                const ge = document.getElementById('stat-grade');
                ge.innerText = g; ge.className = 'grade-badge grade-' + g; 
                document.getElementById('stat-grade-text').innerText = gradeText(g);

                const recent = list.slice(-10).reverse();
                const rc = document.getElementById('recent-container');
                rc.innerHTML = recent.map(it => {
                    const d = new Date(it.ts || Date.now()); const pc = percent(it.correct, it.total);
                    return `<div class="recent-row"><div>${d.toLocaleDateString()}<br><span style="color:#adb5bd">${d.toLocaleTimeString()}</span></div><div>${escapeHtml(it.title||'퀴즈')}</div><div>${it.correct}/${it.total}</div><div>${pc}%</div></div>`;
                }).join('') || `<div class="recent-row" style="color:#868e96; display:flex; justify-content:center; grid-template-columns:1fr;">아직 기록이 없습니다.</div>`;
            }
        }

        /* 3. 카테고리 필터링 (홈 화면) */
        let activeCategory = 'all';
        function filterCategory(cat, el) { 
            document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); 
            el.classList.add('active'); 
            activeCategory=cat; 
            applyFilters(); 
        }
        function applyFilters() { 
            const searchInput = document.getElementById('search-input');
            const k = searchInput ? searchInput.value.toLowerCase() : ''; 
            const f = allQuizzes.filter(q=>{ 
                // 카테고리 필터링: activeCategory가 'all'이거나 퀴즈의 category와 일치해야 함
                const categoryMatch = activeCategory === 'all' || (q.category && q.category === activeCategory);
                // 검색어 필터링: 제목에 검색어가 포함되어야 함
                const titleMatch = !k || (q.title && q.title.toLowerCase().includes(k));
                return categoryMatch && titleMatch; 
            }); 
            console.log(`🔍 필터링 결과: ${f.length}개 (카테고리: ${activeCategory}, 검색어: "${k}")`);
            renderQuizzes(f); 
        }
        document.getElementById('search-input')?.addEventListener('input', applyFilters);
