/* ── Word List ── */

const WORDS = [
    'تجارى', 'عطارى', 'قصابى', 'بيمارستان', 'تيمارستان',
    'قبرستان', 'پارجه فروشى', 'سوپر ماركت', 'بازار', 'كابارة',
    'ميل فروشى', 'املاك', 'محرم', 'اسباب بازى فروشى', 'بهشت',
    'جهنم', 'برزخ', 'باغ', 'كاخ', 'طويله',
    'مزرعه', 'كاودارى', 'كَلحانه', 'كل فروشى', 'لياس فروشى',
    'درمانكاة', 'دارومخانه', 'دفتر وكالت', 'خانه سالمندان', 'مدرسه',
    'دانشكاة', 'داد كاة', 'شهر دارى', 'عطر فروشى', 'رستوران',
    'قهوة خانه', 'زيد دريايى', 'كالدى نقاشى', 'ديرى سرا', 'كله ياجه فروشى',
    'كافه', 'موبايل فروشى', 'بانك', 'بيمه', 'استخر',
    'دستشويي', 'باغ وحش', 'آزمايشكاة', 'جنكل', 'دريا',
    'اقيانوس', 'مرداب', 'خُشكشويي', 'صحرا', 'كوير',
    'آتليه عكاسى', 'نمايشكاه كتاب', 'كيم نت', 'صحافى', 'آشپزخانه',
    'بادكانْ', 'فرودگاه', 'شهر بازى', 'شاليزار', 'خياطى',
    'كوه', 'آهنكرى', 'كالدى اتوموبيل', 'پرورشكاة', 'كليسا',
    'مكان', 'تالار عروسى', 'بازار ميوة', 'سيرك', 'سينما',
    'بورس', 'دماوند', 'پاركينك', 'موزه', 'مسجد',
    'تعميركاه', 'ساحل', 'آسيا', 'اروپا', 'آفريقا', 'استراليا'
];

const TIMER_SECONDS = 600; // 10 minutes
const MIN_PLAYERS = 3;
const MAX_PLAYERS = 20;

/* ── Helpers ── */

function toPersian(n) {
    return String(n).replace(/\d/g, function (d) {
        return '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9'[d];
    });
}

function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function defaultSpyCount(playerCount) {
    if (playerCount <= 8) return 1;
    if (playerCount <= 14) return 2;
    return 3;
}

/* ── Game ── */

function SpyGame() {
    this.app = document.getElementById('app');
    this.playerCount = 4;
    this.players = [];
    this.spyIndices = [];
    this.spyCount = 1;
    this.secretWord = '';
    this.timeLeft = TIMER_SECONDS;
    this.timerInterval = null;
    this.timerStartTime = 0;
    this.timerStartValue = 0;
    this.currentRevealIndex = 0;
    this.selectedVote = -1;
    this.selectedWord = '';
    this.showHome();
}

/* ── Screen transition ── */

SpyGame.prototype.showScreen = function (html, center) {
    var self = this;
    var prev = this.app.querySelector('.screen.active');
    var el = document.createElement('div');
    el.className = 'screen' + (center ? ' screen-center' : '');
    el.innerHTML = html;
    this.app.appendChild(el);
    void el.offsetHeight;
    requestAnimationFrame(function () {
        if (prev) {
            prev.classList.remove('active');
            setTimeout(function () { if (prev.parentNode) prev.remove(); }, 400);
        }
        el.classList.add('active');
    });
    return el;
};

/* ── Home ── */

SpyGame.prototype.showHome = function () {
    this.stopTimer();
    var self = this;
    var s = this.showScreen(
        '<div class="home-content">' +
            '<div class="spy-emoji">🕵️</div>' +
            '<h1 class="home-title">بازی جاسوس</h1>' +
            '<p class="home-subtitle">بازی گروهی حدس کلمه</p>' +
            '<button class="btn btn-primary btn-lg" data-action="setup">شروع بازی</button>' +
            '<p class="home-info">۳ تا ۲۰ نفر &bull; یک گوشی</p>' +
        '</div>',
        true
    );
    s.querySelector('[data-action="setup"]').onclick = function () { self.showSetup(); };
};

/* ── Setup ── */

SpyGame.prototype.showSetup = function () {
    var self = this;
    this.playerCount = Math.max(MIN_PLAYERS, this.playerCount);

    var namesHtml = '';
    for (var i = 0; i < this.playerCount; i++) {
        var val = this.players[i] || '';
        namesHtml +=
            '<div class="player-name-row">' +
                '<span class="player-name-num">' + toPersian(i + 1) + '</span>' +
                '<input class="player-name-input" type="text" ' +
                    'placeholder="بازیکن ' + toPersian(i + 1) + '" ' +
                    'value="' + esc(val) + '" data-index="' + i + '" autocomplete="off">' +
            '</div>';
    }

    var s = this.showScreen(
        '<div class="setup-container">' +
            '<div class="setup-header">' +
                '<h2>تنظیمات بازی</h2>' +
                '<p class="text-dim">تعداد و نام بازیکنان</p>' +
            '</div>' +
            '<div class="card">' +
                '<h3 class="text-center mb-md">تعداد بازیکنان</h3>' +
                '<div class="counter">' +
                    '<button class="counter-btn" data-action="plus">+</button>' +
                    '<span class="counter-value" id="count-val">' + toPersian(this.playerCount) + '</span>' +
                    '<button class="counter-btn" data-action="minus">\u2212</button>' +
                '</div>' +
            '</div>' +
            '<div class="card">' +
                '<h3 class="text-center mb-md">تعداد جاسوس\u200Cها</h3>' +
                '<div class="counter">' +
                    '<button class="counter-btn" data-action="spy-plus">+</button>' +
                    '<span class="counter-value" id="spy-count-val">' + toPersian(this.spyCount) + '</span>' +
                    '<button class="counter-btn" data-action="spy-minus">\u2212</button>' +
                '</div>' +
            '</div>' +
            '<div class="player-names-list" id="names-list">' + namesHtml + '</div>' +
            '<button class="btn btn-primary btn-lg" data-action="start">بزن بریم!</button>' +
            '<button class="btn btn-outline btn-sm" data-action="back">بازگشت</button>' +
        '</div>'
    );

    s.querySelector('[data-action="minus"]').onclick = function () { self.changeCount(-1); };
    s.querySelector('[data-action="plus"]').onclick = function () { self.changeCount(1); };
    s.querySelector('[data-action="spy-minus"]').onclick = function () { self.changeSpyCount(-1); };
    s.querySelector('[data-action="spy-plus"]').onclick = function () { self.changeSpyCount(1); };
    s.querySelector('[data-action="start"]').onclick = function () { self.startGame(); };
    s.querySelector('[data-action="back"]').onclick = function () {
        self.playerCount = 4;
        self.players = [];
        self.spyCount = 1;
        self.showHome();
    };
};

SpyGame.prototype.changeCount = function (delta) {
    var n = this.playerCount + delta;
    if (n < MIN_PLAYERS || n > MAX_PLAYERS) return;
    this.saveNames();
    this.playerCount = n;
    document.getElementById('count-val').textContent = toPersian(n);

    this.spyCount = defaultSpyCount(n);
    var spyEl = document.getElementById('spy-count-val');
    if (spyEl) spyEl.textContent = toPersian(this.spyCount);

    var list = document.getElementById('names-list');
    if (delta > 0) {
        var row = document.createElement('div');
        row.className = 'player-name-row';
        row.innerHTML =
            '<span class="player-name-num">' + toPersian(n) + '</span>' +
            '<input class="player-name-input" type="text" placeholder="بازیکن ' +
            toPersian(n) + '" data-index="' + (n - 1) + '" autocomplete="off">';
        list.appendChild(row);
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        var rows = list.querySelectorAll('.player-name-row');
        if (rows.length) rows[rows.length - 1].remove();
    }
};

SpyGame.prototype.changeSpyCount = function (delta) {
    var n = this.spyCount + delta;
    if (n < 1 || n > this.playerCount - 2) return;
    this.spyCount = n;
    document.getElementById('spy-count-val').textContent = toPersian(n);
};

SpyGame.prototype.saveNames = function () {
    var inputs = document.querySelectorAll('.player-name-input');
    for (var i = 0; i < inputs.length; i++) {
        this.players[parseInt(inputs[i].dataset.index)] = inputs[i].value;
    }
};

/* ── Start Game ── */

SpyGame.prototype.startGame = function () {
    this.saveNames();
    var p = [];
    for (var i = 0; i < this.playerCount; i++) {
        var name = (this.players[i] || '').trim();
        p.push(name || ('\u0628\u0627\u0632\u06CC\u06A9\u0646 ' + toPersian(i + 1)));
    }
    this.players = p;
    this.secretWord = WORDS[Math.floor(Math.random() * WORDS.length)];

    // Pick spyCount random unique indices via Fisher-Yates partial shuffle
    var indices = [];
    for (var j = 0; j < this.playerCount; j++) indices.push(j);
    for (var j = indices.length - 1; j > 0; j--) {
        var r = Math.floor(Math.random() * (j + 1));
        var tmp = indices[j]; indices[j] = indices[r]; indices[r] = tmp;
    }
    this.spyIndices = indices.slice(0, this.spyCount);

    this.currentRevealIndex = 0;
    this.timeLeft = TIMER_SECONDS;
    this.selectedVote = -1;
    this.selectedWord = '';
    this.showRevealPass();
};

/* ── Role Reveal: pass screen ── */

SpyGame.prototype.showRevealPass = function () {
    var self = this;
    var name = this.players[this.currentRevealIndex];
    var num = toPersian(this.currentRevealIndex + 1);
    var total = toPersian(this.playerCount);

    var s = this.showScreen(
        '<div class="reveal-container">' +
            '<p class="reveal-progress">' + num + ' از ' + total + '</p>' +
            '<div class="pass-icon">📱</div>' +
            '<h2>گوشی را بدهید به</h2>' +
            '<p class="reveal-player-name">' + esc(name) + '</p>' +
            '<p class="text-dim" style="margin-top:12px">فقط خود بازیکن صفحه را ببیند</p>' +
            '<button class="btn btn-primary" data-action="ready" style="margin-top:24px">آماده‌ام</button>' +
        '</div>',
        true
    );

    s.querySelector('[data-action="ready"]').onclick = function () { self.showRevealCard(); };
};

/* ── Role Reveal: card flip ── */

SpyGame.prototype.showRevealCard = function () {
    var self = this;
    var isSpy = this.spyIndices.indexOf(this.currentRevealIndex) !== -1;

    var backContent, backClass;
    if (isSpy) {
        backClass = 'spy';
        backContent =
            '<div class="role-emoji">🕵️</div>' +
            '<div class="role-label">نقش شما</div>' +
            '<div class="role-title text-accent">جاسوس</div>' +
            '<p class="text-dim" style="font-size:0.9rem;margin-top:8px">کلمه مخفی را نمی‌دانید!</p>';
    } else {
        backClass = 'local';
        backContent =
            '<div class="role-emoji">👤</div>' +
            '<div class="role-label">نقش شما</div>' +
            '<div class="role-title text-green">شهروند</div>' +
            '<div class="role-word">' + esc(this.secretWord) + '</div>';
    }

    var s = this.showScreen(
        '<div class="reveal-container">' +
            '<p class="text-dim">روی کارت بزنید</p>' +
            '<div class="reveal-card" id="flip-card">' +
                '<div class="reveal-card-inner">' +
                    '<div class="reveal-card-face reveal-card-front">' +
                        '<div class="card-icon">❓</div>' +
                        '<div class="card-text">برای دیدن نقش بزنید</div>' +
                    '</div>' +
                    '<div class="reveal-card-face reveal-card-back ' + backClass + '">' +
                        backContent +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<button class="btn btn-secondary btn-next-reveal" data-action="next" style="opacity:0;pointer-events:none">' +
                'فهمیدم' +
            '</button>' +
        '</div>',
        true
    );

    var card = s.querySelector('#flip-card');
    var nextBtn = s.querySelector('[data-action="next"]');
    var flipped = false;

    card.onclick = function () {
        if (flipped) return;
        flipped = true;
        card.classList.add('flipped');
        setTimeout(function () {
            nextBtn.style.opacity = '1';
            nextBtn.style.pointerEvents = 'all';
        }, 500);
    };

    nextBtn.onclick = function () {
        self.currentRevealIndex++;
        if (self.currentRevealIndex < self.playerCount) {
            self.showRevealPass();
        } else {
            self.showPlaying();
        }
    };
};

/* ── Game Phase ── */

SpyGame.prototype.showPlaying = function () {
    var self = this;
    var chips = '';
    for (var i = 0; i < this.players.length; i++) {
        chips += '<span class="player-chip">' + esc(this.players[i]) + '</span>';
    }

    var C = 2 * Math.PI * 45;
    var offset = C * (1 - this.timeLeft / TIMER_SECONDS);

    var s = this.showScreen(
        '<div class="game-container">' +
            '<div class="game-header"><h2>بحث کنید!</h2></div>' +
            '<div class="timer-wrapper">' +
                '<svg class="timer-ring" viewBox="0 0 100 100">' +
                    '<circle class="timer-ring-bg" cx="50" cy="50" r="45"/>' +
                    '<circle class="timer-ring-progress" id="timer-progress" cx="50" cy="50" r="45" ' +
                        'stroke-dasharray="' + C + '" stroke-dashoffset="' + offset + '"/>' +
                '</svg>' +
                '<div class="timer-text">' +
                    '<span class="timer-digits" id="timer-display">' + this.formatTime(this.timeLeft) + '</span>' +
                    '<span class="timer-label">زمان باقیمانده</span>' +
                '</div>' +
            '</div>' +
            '<div class="game-players">' + chips + '</div>' +
            '<div class="game-actions">' +
                '<button class="btn btn-primary" data-action="vote">رأی‌گیری</button>' +
                '<button class="btn btn-gold" data-action="spy-reveal">جاسوس خودش را لو می‌دهد</button>' +
            '</div>' +
        '</div>'
    );

    s.querySelector('[data-action="vote"]').onclick = function () { self.showVoting(); };
    s.querySelector('[data-action="spy-reveal"]').onclick = function () { self.showSpyGuess('reveal'); };

    // Update color class right away
    this.updateTimerColor();
    this.startTimer();
};

SpyGame.prototype.startTimer = function () {
    this.stopTimer();
    var self = this;
    this.timerStartTime = Date.now();
    this.timerStartValue = this.timeLeft;

    this.timerInterval = setInterval(function () {
        var elapsed = Math.floor((Date.now() - self.timerStartTime) / 1000);
        self.timeLeft = Math.max(0, self.timerStartValue - elapsed);
        self.updateTimerDisplay();

        if (self.timeLeft <= 0) {
            self.stopTimer();
            self.showSpyGuess('timeout');
        }
    }, 250);
};

SpyGame.prototype.stopTimer = function () {
    if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }
};

SpyGame.prototype.updateTimerDisplay = function () {
    var display = document.getElementById('timer-display');
    var progress = document.getElementById('timer-progress');
    if (display) display.textContent = this.formatTime(this.timeLeft);
    if (progress) {
        var C = 2 * Math.PI * 45;
        progress.style.strokeDashoffset = C * (1 - this.timeLeft / TIMER_SECONDS);
    }
    this.updateTimerColor();
};

SpyGame.prototype.updateTimerColor = function () {
    var progress = document.getElementById('timer-progress');
    var display = document.getElementById('timer-display');
    if (!progress) return;
    progress.classList.remove('warning', 'danger');
    if (display) display.classList.remove('timer-pulse');
    if (this.timeLeft <= 60) {
        progress.classList.add('danger');
        if (display) display.classList.add('timer-pulse');
    } else if (this.timeLeft <= 180) {
        progress.classList.add('warning');
    }
};

SpyGame.prototype.formatTime = function (sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return toPersian((m < 10 ? '0' : '') + m) + ':' + toPersian((s < 10 ? '0' : '') + s);
};

/* ── Voting ── */

SpyGame.prototype.showVoting = function () {
    this.stopTimer();
    this.selectedVote = -1;
    var self = this;

    var opts = '';
    for (var i = 0; i < this.players.length; i++) {
        opts += '<button class="vote-option" data-idx="' + i + '">' + esc(this.players[i]) + '</button>';
    }

    var s = this.showScreen(
        '<div class="vote-container">' +
            '<h2 class="text-center">چه کسی جاسوس است؟</h2>' +
            '<p class="text-dim text-center">فردی که فکر می‌کنید جاسوس است را انتخاب کنید</p>' +
            '<div class="vote-grid">' + opts + '</div>' +
            '<button class="btn btn-primary" data-action="confirm" disabled>تأیید</button>' +
            '<button class="btn btn-outline btn-sm" data-action="back">بازگشت به بازی</button>' +
        '</div>'
    );

    var options = s.querySelectorAll('.vote-option');
    var confirmBtn = s.querySelector('[data-action="confirm"]');

    for (var j = 0; j < options.length; j++) {
        (function (opt) {
            opt.onclick = function () {
                for (var k = 0; k < options.length; k++) options[k].classList.remove('selected');
                opt.classList.add('selected');
                self.selectedVote = parseInt(opt.dataset.idx);
                confirmBtn.disabled = false;
            };
        })(options[j]);
    }

    confirmBtn.onclick = function () {
        if (self.selectedVote < 0) return;
        if (self.spyIndices.indexOf(self.selectedVote) !== -1) {
            self.showSpyGuess('caught');
        } else {
            self.showResult('spy', esc(self.players[self.selectedVote]) + ' جاسوس نبود!');
        }
    };

    s.querySelector('[data-action="back"]').onclick = function () { self.showPlaying(); };
};

/* ── Spy Guess ── */

SpyGame.prototype.showSpyGuess = function (context) {
    this.stopTimer();
    this.selectedWord = '';
    var self = this;
    var spyNames = this.spyIndices.map(function (i) { return self.players[i]; });
    var spyNamesStr = spyNames.map(esc).join('\u060C ');
    var multi = this.spyIndices.length > 1;
    var spyLabel = multi ? 'جاسوس\u200Cها' : 'جاسوس';

    var title, subtitle;
    if (context === 'caught') {
        title = '🕵️ ' + spyLabel + ' پیدا شد!';
        subtitle = spyNamesStr + (multi ? ' جاسوس بودند!' : ' جاسوس بود!') + ' اما یک شانس آخر برای حدس کلمه دارد.';
    } else if (context === 'timeout') {
        title = '⏰ وقت تمام شد!';
        subtitle = spyLabel + ' باید کلمه مخفی را حدس بزند.';
    } else {
        title = '🕵️ ' + spyLabel + ' لو رفت!';
        subtitle = spyNamesStr + (multi ? ' جاسوس هستند' : ' جاسوس است') + ' و می‌خواهد کلمه را حدس بزند.';
    }

    var wordsHtml = '';
    var shuffled = WORDS.slice().sort(function () { return Math.random() - 0.5; });
    for (var i = 0; i < shuffled.length; i++) {
        wordsHtml += '<button class="word-option" data-word="' + esc(shuffled[i]) + '">' + esc(shuffled[i]) + '</button>';
    }

    var s = this.showScreen(
        '<div class="guess-container">' +
            '<h2 class="text-center">' + title + '</h2>' +
            '<p class="text-dim text-center">' + subtitle + '</p>' +
            '<p class="text-center"><strong>' + spyNamesStr + '</strong>، کلمه مخفی کدام است؟</p>' +
            '<div class="word-grid">' + wordsHtml + '</div>' +
            '<button class="btn btn-gold" data-action="guess" disabled>این کلمه است!</button>' +
        '</div>'
    );

    var wordBtns = s.querySelectorAll('.word-option');
    var guessBtn = s.querySelector('[data-action="guess"]');

    for (var j = 0; j < wordBtns.length; j++) {
        (function (btn) {
            btn.onclick = function () {
                for (var k = 0; k < wordBtns.length; k++) wordBtns[k].classList.remove('selected');
                btn.classList.add('selected');
                self.selectedWord = btn.dataset.word;
                guessBtn.disabled = false;
                // Scroll confirm button into view
                guessBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            };
        })(wordBtns[j]);
    }

    guessBtn.onclick = function () {
        if (!self.selectedWord) return;
        if (self.selectedWord === self.secretWord) {
            self.showResult('spy', 'جاسوس کلمه مخفی را درست حدس زد!');
        } else {
            self.showResult('locals', 'جاسوس کلمه مخفی را اشتباه حدس زد!');
        }
    };
};

/* ── Result ── */

SpyGame.prototype.showResult = function (winner, message) {
    this.stopTimer();
    var self = this;
    var isSpyWin = winner === 'spy';
    var emoji = isSpyWin ? '🕵️' : '🎉';
    var multi = this.spyIndices.length > 1;
    var title = isSpyWin
        ? (multi ? 'جاسوس\u200Cها برنده شدند!' : 'جاسوس برنده شد!')
        : 'شهروندان برنده شدند!';
    var cls = isSpyWin ? 'text-accent' : 'text-green';
    var spyNamesStr = this.spyIndices.map(function (i) { return esc(self.players[i]); }).join('\u060C ');

    var s = this.showScreen(
        '<div class="result-container">' +
            '<div class="result-emoji">' + emoji + '</div>' +
            '<h1 class="result-title ' + cls + '">' + title + '</h1>' +
            '<p class="text-dim">' + (message || '') + '</p>' +
            '<div class="result-details">' +
                '<div class="result-detail">' +
                    '<span class="result-label">' + (multi ? 'جاسوس\u200Cها:' : 'جاسوس:') + '</span>' +
                    '<span class="result-value text-accent">' + spyNamesStr + '</span>' +
                '</div>' +
                '<div class="result-detail">' +
                    '<span class="result-label">کلمه مخفی:</span>' +
                    '<span class="result-value text-gold">' + esc(this.secretWord) + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="result-actions">' +
                '<button class="btn btn-primary btn-lg" data-action="again">بازی جدید</button>' +
                '<button class="btn btn-outline btn-sm" data-action="home">صفحه اصلی</button>' +
            '</div>' +
        '</div>',
        true
    );

    if (!isSpyWin) this.confetti();

    s.querySelector('[data-action="again"]').onclick = function () {
        var saved = self.players.slice();
        var count = self.playerCount;
        var sc = self.spyCount;
        self.players = saved;
        self.playerCount = count;
        self.spyCount = sc;
        self.startGame();
    };

    s.querySelector('[data-action="home"]').onclick = function () {
        self.playerCount = 4;
        self.players = [];
        self.spyCount = 1;
        self.showHome();
    };
};

/* ── Confetti ── */

SpyGame.prototype.confetti = function () {
    var container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    var colors = ['#e94560', '#fbbf24', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    for (var i = 0; i < 60; i++) {
        var piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
        piece.style.animationDelay = Math.random() * 0.6 + 's';
        piece.style.width = (Math.random() * 8 + 5) + 'px';
        piece.style.height = (Math.random() * 8 + 5) + 'px';
        container.appendChild(piece);
    }
    setTimeout(function () { container.remove(); }, 4500);
};

/* ── Init ── */

var game = new SpyGame();
