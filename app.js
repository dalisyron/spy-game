/* ── Config ── */

const TIMER_SECONDS = 600; // 10 minutes
const MIN_PLAYERS = 3;
const MAX_PLAYERS = 20;

/* ── Word Lists (loaded from locations.txt / countries.txt — entries are NOT translated) ── */

var WORDS = { places: [], countries: [] };

function parseWordList(text) {
    return text.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
}

function loadWords() {
    return Promise.all([
        fetch('locations.txt').then(function (r) { return r.text(); }),
        fetch('countries.txt').then(function (r) { return r.text(); })
    ]).then(function (texts) {
        WORDS.places = parseWordList(texts[0]);
        WORDS.countries = parseWordList(texts[1]);
        return WORDS;
    });
}

/* ── Word category (Places / Countries). Persisted; chosen on the setup screen. ── */

var MODE = (function () {
    try {
        var m = localStorage.getItem('spy-mode');
        if (m === 'places' || m === 'countries') return m;
    } catch (e) {}
    return 'places';
})();

function setMode(mode) {
    MODE = mode;
    try { localStorage.setItem('spy-mode', mode); } catch (e) {}
}

/* ── Language state ── */

var LANG = (function () {
    try {
        var s = localStorage.getItem('spy-lang');
        if (s === 'en' || s === 'fa') return s;
    } catch (e) {}
    return 'fa';
})();

function T() { return STR[LANG]; }

// Locale-aware number formatting (Persian digits for fa, Western for en)
function num(n) {
    var s = String(n);
    if (LANG === 'fa') {
        return s.replace(/\d/g, function (d) {
            return '۰۱۲۳۴۵۶۷۸۹'[d];
        });
    }
    return s;
}

function spyLabel(multi) { return multi ? T().spies : T().spy; }

function setLang(lang) {
    LANG = lang;
    try { localStorage.setItem('spy-lang', lang); } catch (e) {}
    applyDocLang();
}

function applyDocLang() {
    var html = document.documentElement;
    html.setAttribute('lang', LANG);
    html.setAttribute('dir', LANG === 'fa' ? 'rtl' : 'ltr');
    document.title = T().docTitle;
}

/* ── Translations ── */

const STR = {
    fa: {
        catLabel: 'نوع کلمات',
        catPlaces: 'مکان‌ها',
        catCountries: 'کشورها',
        chooseSpiesN: function (n) { return num(n) + ' مظنون را انتخاب کنید'; },
        voteProgress: function (sel, total) { return num(sel) + ' از ' + num(total) + ' انتخاب شد'; },
        wrongAccusation: 'شناسایی درست نبود!',
        docTitle: 'بازی جاسوس',
        sep: '، ',
        // Home
        homeTitle: 'بازی جاسوس',
        homeSubtitle: 'بازی گروهی حدس کلمه',
        startGame: 'شروع بازی',
        homeInfo: function () { return num(MIN_PLAYERS) + ' تا ' + num(MAX_PLAYERS) + ' نفر • یک گوشی'; },
        // Setup
        setupTitle: 'تنظیمات بازی',
        setupSubtitle: 'تعداد و نام بازیکنان',
        playerCount: 'تعداد بازیکنان',
        spyCount: 'تعداد جاسوس‌ها',
        letsGo: 'بزن بریم!',
        back: 'بازگشت',
        playerName: function (n) { return 'بازیکن ' + num(n); },
        // Role reveal
        progress: function (cur, total) { return num(cur) + ' از ' + num(total); },
        passPhoneTo: 'گوشی را بدهید به',
        onlyPlayerSees: 'فقط خود بازیکن صفحه را ببیند',
        ready: 'آماده‌ام',
        tapCard: 'روی کارت بزنید',
        tapToSeeRole: 'برای دیدن نقش بزنید',
        yourRole: 'نقش شما',
        spy: 'جاسوس',
        spies: 'جاسوس‌ها',
        spyHint: 'کلمه مخفی را نمی‌دانید!',
        citizen: 'شهروند',
        gotIt: 'فهمیدم',
        // Playing
        discuss: 'بحث کنید!',
        timeRemaining: 'زمان باقیمانده',
        vote: 'رأی‌گیری',
        spyRevealsSelf: 'جاسوس خودش را لو می‌دهد',
        // Voting
        whoIsSpy: 'چه کسی جاسوس است؟',
        chooseSpy: 'فردی که فکر می‌کنید جاسوس است را انتخاب کنید',
        confirm: 'تأیید',
        backToGame: 'بازگشت به بازی',
        // Spy guess
        caughtTitle: function (multi) { return '🕵️ ' + spyLabel(multi) + ' پیدا شد!'; },
        caughtSubtitle: function (names, multi) {
            return names + (multi ? ' جاسوس بودند!' : ' جاسوس بود!') + ' اما یک شانس آخر برای حدس کلمه دارد.';
        },
        timeoutTitle: '⏰ وقت تمام شد!',
        timeoutSubtitle: function (multi) { return spyLabel(multi) + ' باید کلمه مخفی را حدس بزند.'; },
        revealTitle: function (multi) { return '🕵️ ' + spyLabel(multi) + ' لو رفت!'; },
        revealSubtitle: function (names, multi) {
            return names + (multi ? ' جاسوس هستند' : ' جاسوس است') + ' و می‌خواهد کلمه را حدس بزند.';
        },
        guessQ: '، کلمه مخفی کدام است؟',
        thatsTheWord: 'این کلمه است!',
        // Result
        spyWinTitle: function (multi) { return multi ? 'جاسوس‌ها برنده شدند!' : 'جاسوس برنده شد!'; },
        citizensWinTitle: 'شهروندان برنده شدند!',
        spyResultLabel: function (multi) { return multi ? 'جاسوس‌ها:' : 'جاسوس:'; },
        secretWordLabel: 'کلمه مخفی:',
        newGame: 'بازی جدید',
        home: 'صفحه اصلی',
        notSpyMsg: function (name) { return name + ' جاسوس نبود!'; },
        spyGuessedRightMsg: 'جاسوس کلمه مخفی را درست حدس زد!',
        spyGuessedWrongMsg: 'جاسوس کلمه مخفی را اشتباه حدس زد!'
    },
    en: {
        catLabel: 'Word Type',
        catPlaces: 'Places',
        catCountries: 'Countries',
        chooseSpiesN: function (n) { return 'Select ' + num(n) + ' suspects'; },
        voteProgress: function (sel, total) { return num(sel) + ' of ' + num(total) + ' selected'; },
        wrongAccusation: "That's not the right set of spies!",
        docTitle: 'Spy Game',
        sep: ', ',
        // Home
        homeTitle: 'Spy Game',
        homeSubtitle: 'A party word-guessing game',
        startGame: 'Start Game',
        homeInfo: function () { return num(MIN_PLAYERS) + ' to ' + num(MAX_PLAYERS) + ' players • One phone'; },
        // Setup
        setupTitle: 'Game Setup',
        setupSubtitle: 'Number and names of players',
        playerCount: 'Number of Players',
        spyCount: 'Number of Spies',
        letsGo: "Let's go!",
        back: 'Back',
        playerName: function (n) { return 'Player ' + num(n); },
        // Role reveal
        progress: function (cur, total) { return num(cur) + ' of ' + num(total); },
        passPhoneTo: 'Pass the phone to',
        onlyPlayerSees: 'Only this player should look at the screen',
        ready: "I'm ready",
        tapCard: 'Tap the card',
        tapToSeeRole: 'Tap to see your role',
        yourRole: 'Your role',
        spy: 'Spy',
        spies: 'Spies',
        spyHint: "You don't know the secret word!",
        citizen: 'Citizen',
        gotIt: 'Got it',
        // Playing
        discuss: 'Discuss!',
        timeRemaining: 'Time remaining',
        vote: 'Vote',
        spyRevealsSelf: 'The spy reveals themselves',
        // Voting
        whoIsSpy: 'Who is the spy?',
        chooseSpy: 'Choose the person you think is the spy',
        confirm: 'Confirm',
        backToGame: 'Back to game',
        // Spy guess
        caughtTitle: function (multi) { return '🕵️ ' + spyLabel(multi) + ' caught!'; },
        caughtSubtitle: function (names, multi) {
            return names + (multi ? ' were the spies!' : ' was the spy!') + ' But they get one last chance to guess the word.';
        },
        timeoutTitle: "⏰ Time's up!",
        timeoutSubtitle: function (multi) { return 'The ' + spyLabel(multi).toLowerCase() + ' must guess the secret word.'; },
        revealTitle: function (multi) { return '🕵️ ' + spyLabel(multi) + ' revealed!'; },
        revealSubtitle: function (names, multi) {
            return names + (multi ? ' are the spies' : ' is the spy') + ' and wants to guess the word.';
        },
        guessQ: ', what is the secret word?',
        thatsTheWord: "That's the word!",
        // Result
        spyWinTitle: function (multi) { return multi ? 'The spies win!' : 'The spy wins!'; },
        citizensWinTitle: 'The citizens win!',
        spyResultLabel: function (multi) { return multi ? 'Spies:' : 'Spy:'; },
        secretWordLabel: 'Secret word:',
        newGame: 'New Game',
        home: 'Home',
        notSpyMsg: function (name) { return name + ' was not the spy!'; },
        spyGuessedRightMsg: 'The spy guessed the secret word correctly!',
        spyGuessedWrongMsg: 'The spy guessed the secret word wrong!'
    }
};

/* ── Helpers ── */

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
    this.selectedVotes = [];
    this.selectedWord = '';
    this.rerenderCurrent = null;
    applyDocLang();
    this.buildLangSwitch();
    loadWords();
    this.showHome();
}

/* ── Language switch (segmented control, pre-game only) ── */

SpyGame.prototype.buildLangSwitch = function () {
    var el = document.createElement('div');
    el.className = 'lang-switch';
    document.body.appendChild(el);
    this.langSwitchEl = el;
    this.renderLangSwitch();
};

SpyGame.prototype.renderLangSwitch = function () {
    var self = this;
    var el = this.langSwitchEl;
    el.innerHTML =
        '<button class="lang-btn' + (LANG === 'fa' ? ' active' : '') + '" data-lang="fa">فارسی</button>' +
        '<button class="lang-btn' + (LANG === 'en' ? ' active' : '') + '" data-lang="en">English</button>';
    var btns = el.querySelectorAll('.lang-btn');
    for (var i = 0; i < btns.length; i++) {
        (function (btn) {
            btn.onclick = function () {
                var lang = btn.dataset.lang;
                if (lang === LANG) return;
                setLang(lang);
                self.renderLangSwitch();
                if (self.rerenderCurrent) self.rerenderCurrent();
            };
        })(btns[i]);
    }
};

SpyGame.prototype.setLangSwitchVisible = function (visible) {
    if (this.langSwitchEl) this.langSwitchEl.classList.toggle('hidden', !visible);
};

/* ── Screen transition ── */

SpyGame.prototype.showScreen = function (html, center) {
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
    this.rerenderCurrent = function () { self.showHome(); };
    this.setLangSwitchVisible(true);
    var s = this.showScreen(
        '<div class="home-content">' +
            '<div class="spy-emoji">🕵️</div>' +
            '<h1 class="home-title">' + T().homeTitle + '</h1>' +
            '<p class="home-subtitle">' + T().homeSubtitle + '</p>' +
            '<button class="btn btn-primary btn-lg" data-action="setup">' + T().startGame + '</button>' +
            '<p class="home-info">' + T().homeInfo() + '</p>' +
        '</div>',
        true
    );
    s.querySelector('[data-action="setup"]').onclick = function () { self.showSetup(); };
};

/* ── Setup ── */

SpyGame.prototype.showSetup = function () {
    var self = this;
    this.playerCount = Math.max(MIN_PLAYERS, this.playerCount);
    this.rerenderCurrent = function () { self.saveNames(); self.showSetup(); };
    this.setLangSwitchVisible(true);

    var namesHtml = '';
    for (var i = 0; i < this.playerCount; i++) {
        var val = this.players[i] || '';
        namesHtml +=
            '<div class="player-name-row">' +
                '<span class="player-name-num">' + num(i + 1) + '</span>' +
                '<input class="player-name-input" type="text" ' +
                    'placeholder="' + esc(T().playerName(i + 1)) + '" ' +
                    'value="' + esc(val) + '" data-index="' + i + '" autocomplete="off">' +
            '</div>';
    }

    var s = this.showScreen(
        '<div class="setup-container">' +
            '<div class="setup-header">' +
                '<h2>' + T().setupTitle + '</h2>' +
                '<p class="text-dim">' + T().setupSubtitle + '</p>' +
            '</div>' +
            '<div class="card">' +
                '<h3 class="text-center mb-md">' + T().catLabel + '</h3>' +
                '<div class="mode-switch">' +
                    '<button class="mode-btn' + (MODE === 'places' ? ' active' : '') + '" data-mode="places">' + T().catPlaces + '</button>' +
                    '<button class="mode-btn' + (MODE === 'countries' ? ' active' : '') + '" data-mode="countries">' + T().catCountries + '</button>' +
                '</div>' +
            '</div>' +
            '<div class="card">' +
                '<h3 class="text-center mb-md">' + T().playerCount + '</h3>' +
                '<div class="counter">' +
                    '<button class="counter-btn" data-action="plus">+</button>' +
                    '<span class="counter-value" id="count-val">' + num(this.playerCount) + '</span>' +
                    '<button class="counter-btn" data-action="minus">−</button>' +
                '</div>' +
            '</div>' +
            '<div class="card">' +
                '<h3 class="text-center mb-md">' + T().spyCount + '</h3>' +
                '<div class="counter">' +
                    '<button class="counter-btn" data-action="spy-plus">+</button>' +
                    '<span class="counter-value" id="spy-count-val">' + num(this.spyCount) + '</span>' +
                    '<button class="counter-btn" data-action="spy-minus">−</button>' +
                '</div>' +
            '</div>' +
            '<div class="player-names-list" id="names-list">' + namesHtml + '</div>' +
            '<button class="btn btn-primary btn-lg" data-action="start">' + T().letsGo + '</button>' +
            '<button class="btn btn-outline btn-sm" data-action="back">' + T().back + '</button>' +
        '</div>'
    );

    s.querySelector('[data-action="minus"]').onclick = function () { self.changeCount(-1); };
    s.querySelector('[data-action="plus"]').onclick = function () { self.changeCount(1); };
    s.querySelector('[data-action="spy-minus"]').onclick = function () { self.changeSpyCount(-1); };
    s.querySelector('[data-action="spy-plus"]').onclick = function () { self.changeSpyCount(1); };
    s.querySelector('[data-action="start"]').onclick = function () { self.startGame(); };

    var modeBtns = s.querySelectorAll('.mode-btn');
    for (var mi = 0; mi < modeBtns.length; mi++) {
        (function (btn) {
            btn.onclick = function () {
                if (btn.dataset.mode === MODE) return;
                setMode(btn.dataset.mode);
                for (var k = 0; k < modeBtns.length; k++) {
                    modeBtns[k].classList.toggle('active', modeBtns[k].dataset.mode === MODE);
                }
            };
        })(modeBtns[mi]);
    }

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
    document.getElementById('count-val').textContent = num(n);

    this.spyCount = defaultSpyCount(n);
    var spyEl = document.getElementById('spy-count-val');
    if (spyEl) spyEl.textContent = num(this.spyCount);

    var list = document.getElementById('names-list');
    if (delta > 0) {
        var row = document.createElement('div');
        row.className = 'player-name-row';
        row.innerHTML =
            '<span class="player-name-num">' + num(n) + '</span>' +
            '<input class="player-name-input" type="text" placeholder="' +
            esc(T().playerName(n)) + '" data-index="' + (n - 1) + '" autocomplete="off">';
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
    document.getElementById('spy-count-val').textContent = num(n);
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
        p.push(name || T().playerName(i + 1));
    }
    this.players = p;
    var list = WORDS[MODE];
    if (!list || !list.length) {
        // Word files not loaded yet — fetch then retry.
        var self = this;
        loadWords().then(function () { self.startGame(); });
        return;
    }
    this.secretWord = list[Math.floor(Math.random() * list.length)];

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
    this.selectedVotes = [];
    this.selectedWord = '';
    this.showRevealPass();
};

/* ── Role Reveal: pass screen ── */

SpyGame.prototype.showRevealPass = function () {
    var self = this;
    this.rerenderCurrent = null;
    this.setLangSwitchVisible(false);
    var name = this.players[this.currentRevealIndex];

    var s = this.showScreen(
        '<div class="reveal-container">' +
            '<p class="reveal-progress">' + T().progress(this.currentRevealIndex + 1, this.playerCount) + '</p>' +
            '<div class="pass-icon">📱</div>' +
            '<h2>' + T().passPhoneTo + '</h2>' +
            '<p class="reveal-player-name">' + esc(name) + '</p>' +
            '<p class="text-dim" style="margin-top:12px">' + T().onlyPlayerSees + '</p>' +
            '<button class="btn btn-primary" data-action="ready" style="margin-top:24px">' + T().ready + '</button>' +
        '</div>',
        true
    );

    s.querySelector('[data-action="ready"]').onclick = function () { self.showRevealCard(); };
};

/* ── Role Reveal: card flip ── */

SpyGame.prototype.showRevealCard = function () {
    var self = this;
    this.rerenderCurrent = null;
    this.setLangSwitchVisible(false);
    var isSpy = this.spyIndices.indexOf(this.currentRevealIndex) !== -1;

    var backContent, backClass;
    if (isSpy) {
        backClass = 'spy';
        backContent =
            '<div class="role-emoji">🕵️</div>' +
            '<div class="role-label">' + T().yourRole + '</div>' +
            '<div class="role-title text-accent">' + T().spy + '</div>' +
            '<p class="text-dim" style="font-size:0.9rem;margin-top:8px">' + T().spyHint + '</p>';
    } else {
        backClass = 'local';
        backContent =
            '<div class="role-emoji">👤</div>' +
            '<div class="role-label">' + T().yourRole + '</div>' +
            '<div class="role-title text-green">' + T().citizen + '</div>' +
            '<div class="role-word" dir="ltr">' + esc(this.secretWord) + '</div>';
    }

    var s = this.showScreen(
        '<div class="reveal-container">' +
            '<p class="text-dim">' + T().tapCard + '</p>' +
            '<div class="reveal-card" id="flip-card">' +
                '<div class="reveal-card-inner">' +
                    '<div class="reveal-card-face reveal-card-front">' +
                        '<div class="card-icon">❓</div>' +
                        '<div class="card-text">' + T().tapToSeeRole + '</div>' +
                    '</div>' +
                    '<div class="reveal-card-face reveal-card-back ' + backClass + '">' +
                        backContent +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<button class="btn btn-secondary btn-next-reveal" data-action="next" style="opacity:0;pointer-events:none">' +
                T().gotIt +
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
    this.rerenderCurrent = null;
    this.setLangSwitchVisible(false);
    var chips = '';
    for (var i = 0; i < this.players.length; i++) {
        chips += '<span class="player-chip">' + esc(this.players[i]) + '</span>';
    }

    var C = 2 * Math.PI * 45;
    var offset = C * (1 - this.timeLeft / TIMER_SECONDS);

    var s = this.showScreen(
        '<div class="game-container">' +
            '<div class="game-header"><h2>' + T().discuss + '</h2></div>' +
            '<div class="timer-wrapper">' +
                '<svg class="timer-ring" viewBox="0 0 100 100">' +
                    '<circle class="timer-ring-bg" cx="50" cy="50" r="45"/>' +
                    '<circle class="timer-ring-progress" id="timer-progress" cx="50" cy="50" r="45" ' +
                        'stroke-dasharray="' + C + '" stroke-dashoffset="' + offset + '"/>' +
                '</svg>' +
                '<div class="timer-text">' +
                    '<span class="timer-digits" id="timer-display">' + this.formatTime(this.timeLeft) + '</span>' +
                    '<span class="timer-label">' + T().timeRemaining + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="game-players">' + chips + '</div>' +
            '<div class="game-actions">' +
                '<button class="btn btn-primary" data-action="vote">' + T().vote + '</button>' +
                '<button class="btn btn-gold" data-action="spy-reveal">' + T().spyRevealsSelf + '</button>' +
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
    return num((m < 10 ? '0' : '') + m) + ':' + num((s < 10 ? '0' : '') + s);
};

/* ── Voting ── */

SpyGame.prototype.showVoting = function () {
    this.stopTimer();
    this.selectedVotes = [];
    this.rerenderCurrent = null;
    this.setLangSwitchVisible(false);
    var self = this;
    var need = this.spyCount; // there can be more than one spy — accuse exactly this many

    var opts = '';
    for (var i = 0; i < this.players.length; i++) {
        opts += '<button class="vote-option" data-idx="' + i + '">' + esc(this.players[i]) + '</button>';
    }

    var prompt = (need === 1) ? T().chooseSpy : T().chooseSpiesN(need);
    var hintHtml = (need > 1)
        ? '<p class="vote-progress-hint text-center text-muted" id="vote-hint">' + T().voteProgress(0, need) + '</p>'
        : '';

    var s = this.showScreen(
        '<div class="vote-container">' +
            '<h2 class="text-center">' + T().whoIsSpy + '</h2>' +
            '<p class="text-dim text-center">' + prompt + '</p>' +
            '<div class="vote-grid">' + opts + '</div>' +
            hintHtml +
            '<button class="btn btn-primary" data-action="confirm" disabled>' + T().confirm + '</button>' +
            '<button class="btn btn-outline btn-sm" data-action="back">' + T().backToGame + '</button>' +
        '</div>'
    );

    var options = s.querySelectorAll('.vote-option');
    var confirmBtn = s.querySelector('[data-action="confirm"]');
    var hint = s.querySelector('#vote-hint');

    for (var j = 0; j < options.length; j++) {
        (function (opt) {
            opt.onclick = function () {
                var idx = parseInt(opt.dataset.idx);
                var pos = self.selectedVotes.indexOf(idx);
                if (pos !== -1) {
                    self.selectedVotes.splice(pos, 1);
                    opt.classList.remove('selected');
                } else {
                    if (self.selectedVotes.length >= need) return; // cap at the number of spies
                    self.selectedVotes.push(idx);
                    opt.classList.add('selected');
                }
                if (hint) hint.textContent = T().voteProgress(self.selectedVotes.length, need);
                confirmBtn.disabled = self.selectedVotes.length !== need;
            };
        })(options[j]);
    }

    confirmBtn.onclick = function () {
        if (self.selectedVotes.length !== need) return;
        var sel = self.selectedVotes.slice().sort(function (a, b) { return a - b; });
        var spies = self.spyIndices.slice().sort(function (a, b) { return a - b; });
        var allCorrect = sel.length === spies.length && sel.every(function (v, i) { return v === spies[i]; });
        if (allCorrect) {
            // All spies correctly identified — they get one last chance to guess the word.
            self.showSpyGuess('caught');
        } else if (need === 1) {
            self.showResult('spy', T().notSpyMsg(esc(self.players[self.selectedVotes[0]])));
        } else {
            self.showResult('spy', T().wrongAccusation);
        }
    };

    s.querySelector('[data-action="back"]').onclick = function () { self.showPlaying(); };
};

/* ── Spy Guess ── */

SpyGame.prototype.showSpyGuess = function (context) {
    this.stopTimer();
    this.selectedWord = '';
    this.rerenderCurrent = null;
    this.setLangSwitchVisible(false);
    var self = this;
    var spyNames = this.spyIndices.map(function (i) { return self.players[i]; });
    var spyNamesStr = spyNames.map(esc).join(T().sep);
    var multi = this.spyIndices.length > 1;

    var title, subtitle;
    if (context === 'caught') {
        title = T().caughtTitle(multi);
        subtitle = T().caughtSubtitle(spyNamesStr, multi);
    } else if (context === 'timeout') {
        title = T().timeoutTitle;
        subtitle = T().timeoutSubtitle(multi);
    } else {
        title = T().revealTitle(multi);
        subtitle = T().revealSubtitle(spyNamesStr, multi);
    }

    var wordsHtml = '';
    var shuffled = WORDS[MODE].slice().sort(function () { return Math.random() - 0.5; });
    for (var i = 0; i < shuffled.length; i++) {
        wordsHtml += '<button class="word-option" data-word="' + esc(shuffled[i]) + '">' + esc(shuffled[i]) + '</button>';
    }

    var s = this.showScreen(
        '<div class="guess-container">' +
            '<h2 class="text-center">' + title + '</h2>' +
            '<p class="text-dim text-center">' + subtitle + '</p>' +
            '<p class="text-center"><strong>' + spyNamesStr + '</strong>' + T().guessQ + '</p>' +
            '<div class="word-grid" dir="ltr">' + wordsHtml + '</div>' +
            '<button class="btn btn-gold" data-action="guess" disabled>' + T().thatsTheWord + '</button>' +
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
            self.showResult('spy', T().spyGuessedRightMsg);
        } else {
            self.showResult('locals', T().spyGuessedWrongMsg);
        }
    };
};

/* ── Result ── */

SpyGame.prototype.showResult = function (winner, message) {
    this.stopTimer();
    this.rerenderCurrent = null;
    this.setLangSwitchVisible(false);
    var self = this;
    var isSpyWin = winner === 'spy';
    var emoji = isSpyWin ? '🕵️' : '🎉';
    var multi = this.spyIndices.length > 1;
    var title = isSpyWin ? T().spyWinTitle(multi) : T().citizensWinTitle;
    var cls = isSpyWin ? 'text-accent' : 'text-green';
    var spyNamesStr = this.spyIndices.map(function (i) { return esc(self.players[i]); }).join(T().sep);

    var s = this.showScreen(
        '<div class="result-container">' +
            '<div class="result-emoji">' + emoji + '</div>' +
            '<h1 class="result-title ' + cls + '">' + title + '</h1>' +
            '<p class="text-dim">' + (message || '') + '</p>' +
            '<div class="result-details">' +
                '<div class="result-detail">' +
                    '<span class="result-label">' + T().spyResultLabel(multi) + '</span>' +
                    '<span class="result-value text-accent">' + spyNamesStr + '</span>' +
                '</div>' +
                '<div class="result-detail">' +
                    '<span class="result-label">' + T().secretWordLabel + '</span>' +
                    '<span class="result-value text-gold" dir="ltr">' + esc(this.secretWord) + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="result-actions">' +
                '<button class="btn btn-primary btn-lg" data-action="again">' + T().newGame + '</button>' +
                '<button class="btn btn-outline btn-sm" data-action="home">' + T().home + '</button>' +
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
