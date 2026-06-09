// ===== אלמנטים =====
const bibi = document.getElementById('bibi');
const bubble = document.getElementById('speech-bubble');
const answerText = document.getElementById('answer-text');
const questionInput = document.getElementById('question');
const askBtn = document.getElementById('ask-btn');
const anotherBtn = document.getElementById('another-btn');
const copyBtn = document.getElementById('copy-btn');
const cardBtn = document.getElementById('card-btn');
const pressureFill = document.getElementById('pressure-fill');
const pressureValue = document.getElementById('pressure-value');
const qCounter = document.getElementById('q-counter');
const loadingLine = document.getElementById('loading-line');
const comboEl = document.getElementById('combo');
const breaking = document.getElementById('breaking');
const breakingText = document.getElementById('breaking-text');
const panicBadge = document.getElementById('panic-badge');
const achievement = document.getElementById('achievement');
const achievementIcon = document.getElementById('achievement-icon');
const achievementText = document.getElementById('achievement-text');
const fx = document.getElementById('fx-overlay');
const bibiContainer = document.querySelector('.bibi-container');
const screenStart = document.getElementById('screen-start');
const screenPlay = document.getElementById('screen-play');
const screenEnd = document.getElementById('screen-end');
const startBtn = document.getElementById('start-btn');
const retryBtn = document.getElementById('retry-btn');
const shareBtn = document.getElementById('share-btn');
const bestLine = document.getElementById('best-line');
const feedbackToast = document.getElementById('feedback-toast');
const feedbackDelta = document.getElementById('feedback-delta');
const feedbackLabel = document.getElementById('feedback-label');
const endIcon = document.getElementById('end-icon');
const endRank = document.getElementById('end-rank');
const endHeadline = document.getElementById('end-headline');
const endStress = document.getElementById('end-stress');
const endQuestions = document.getElementById('end-questions');
const endBest = document.getElementById('end-best');

// ===== מיפוי הבעות =====
const MOOD_IMAGES = {
    idle: 'bibi-idle.png', thinking: 'bibi-thinking.png', answering: 'bibi-answering.png',
    angry: 'bibi-angry.jpg', proud: 'bibi-proud.jpg', suspicious: 'bibi-suspicious.jpg',
    emotional: 'bibi-emotional.jpg', accusing: 'bibi-accusing.jpg', sly: 'bibi-sly.jpg',
    dodging: 'bibi-dodging.jpg', defiant: 'bibi-defiant.jpg', 'nervous-smile': 'bibi-nervous-smile.jpg',
};
const SPIN_MOODS = ['dodging', 'sly', 'accusing', 'suspicious', 'defiant', 'angry'];

// ===== נתוני משחק =====
const MAX_Q = 5;

const SENSITIVE_KEYWORDS = [
    'משפט', 'תיק', 'שוחד', 'חקירה', 'פרקליטות', 'היועצת', 'אישומים', 'עדות',
    'סיגר', 'שמפניה', 'שמפניות', 'מתנות', 'צוללות', 'הדלפה', 'גלנט',
    'תקשורת', 'ערוץ', 'קואליציה', 'חרדים', 'גיוס', 'בן גביר', 'סמוטריץ',
    'בחירות', 'סקרים', 'יוקר', 'מחירים', 'דיור',
];
const DEVASTATING_KEYWORDS = [
    'מחדל', '7 באוקטובר', 'שביעי באוקטובר', 'חטופים', 'משפחות החטופים',
    'כישלון', 'נכשל', 'אשם', 'אחריות', 'אחראי', 'תפטר', 'שרה', 'יאיר',
];
const HIDDEN_KEYWORDS = [
    { k: 'צוללות', text: 'פרשת הצוללות שוב בכותרות' },
    { k: 'שמפניה', text: 'מתנות יוקרה? אין כאן כלום' },
    { k: 'שמפניות', text: 'מתנות יוקרה? אין כאן כלום' },
    { k: 'סיגר', text: 'פרשת המתנות מתחממת' },
    { k: 'הדלפה', text: 'חקירת ההדלפות מתרחבת' },
    { k: 'שרה', text: 'הגברת הראשונה נכנסת לתמונה' },
    { k: 'איראן', text: 'מתיחות ביטחונית בצפון' },
    { k: 'ביביסטים', text: 'הבסיס מתגייס לרשת' },
];

const LOADING_LINES = [
    'מתייעץ עם יועצים', 'מנסח תשובה שלא תסתבך משפטית', 'מחפש ניסוח דיפלומטי',
    'בודק מה מותר להגיד', 'מתאם עמדות', 'שואל את היועצים מה לא לומר',
    'מחפש את מי להאשים', 'מחשב רמת ספין אופטימלית', 'מתכונן להתחמק',
];

const QUESTION_CARDS = [
    'מה הדבר היחיד שלא היית רוצה שישאלו אותך עכשיו?',
    'מי באמת אשם במחדל של 7 באוקטובר?',
    'תגיד כן או לא: אתה מתכוון להתפטר?',
    'מה אמרת לשרה אחרי הריאיון האחרון?',
    'מתי בפעם האחרונה הודית בטעות?',
    'אם תפסיד בבחירות הבאות — מה תעשה ביום שאחרי?',
    'מי בקואליציה אומר לך כן כל הזמן ופוחד להגיד לך לא?',
    'אתה ישן בלילה?',
    'כמה זה עולה לך — באמת — הסיגרים והשמפניות?',
    'מה היה עושה רבין על המחדל?',
    'אם היית מתחיל מחדש — מה היית עושה אחרת?',
    'מה תגיד למשפחות החטופים בלי טקסטים מוכנים?',
    'מי הקואליציה משרתת — אותך או את המדינה?',
    'תאר בכנות יום אחד מהקדנציה הזאת בלי לאשים אף אחד.',
    'אם איראן הייתה תוקפת מחר — האם אתה באמת מוכן?',
];

const ACHIEVEMENTS = {
    first:     { icon: '🎤', text: 'ראיון ראשון' },
    danger:    { icon: '🧨', text: 'שאלת שאלה אסורה' },
    pressure:  { icon: '🔥', text: 'העלית את הלחץ למקסימום' },
    combo3:    { icon: '😱', text: 'קומבו x3 — לחצת אותו ברצף' },
    rare:      { icon: '🎲', text: 'גרמת לאירוע נדיר' },
    victory:   { icon: '💥', text: 'הוצאת אותו מהכלים!' },
};

// ===== מצב =====
let gameState = 'start';    // 'start' | 'play' | 'end'
let roundQ = 0;
let stress = 0;
let comboCount = 0;
let totalQuestionsLifetime = 0;
let currentText = '';
let currentQuestion = '';
let typingTimeout = null;
let loadingTimer = null;
let useAI = true;
const history = [];

const unlocked = new Set(JSON.parse(localStorage.getItem('bibi_achievements') || '[]'));
const bestRecord = {
    questionsToBreak: parseInt(localStorage.getItem('bibi_best_break') || '0', 10) || null,
    bestPercent: parseInt(localStorage.getItem('bibi_best_percent') || '0', 10) || 0,
};

// ===== זיהוי AI =====
async function checkAI() {
    try {
        const res = await fetch('/api/health');
        if (!res.ok) throw new Error();
        const data = await res.json();
        useAI = Boolean(data.hasKey);
    } catch { useAI = false; }
}
checkAI();
updateBestLine();
showScreen('start');

// ===== ניהול מסכים =====
function showScreen(name) {
    gameState = name;
    screenStart.classList.toggle('hidden', name !== 'start');
    screenPlay.classList.toggle('hidden', name !== 'play');
    screenEnd.classList.toggle('hidden', name !== 'end');
}

function updateBestLine() {
    if (bestRecord.questionsToBreak) {
        bestLine.textContent = `🏆 השיא שלך: שברת אותו תוך ${bestRecord.questionsToBreak} שאלות`;
        bestLine.classList.remove('hidden');
    } else if (bestRecord.bestPercent > 0) {
        bestLine.textContent = `🎯 השיא שלך: ${bestRecord.bestPercent}% לחץ`;
        bestLine.classList.remove('hidden');
    } else {
        bestLine.classList.add('hidden');
    }
}

// ===== התחלה/אתחול === ==
function startGame() {
    roundQ = 0;
    stress = 0;
    comboCount = 0;
    currentText = '';
    currentQuestion = '';
    history.length = 0;
    document.body.classList.remove('bd-1', 'bd-2', 'bd-3');
    panicBadge.classList.add('hidden');
    breaking.classList.add('hidden');
    comboEl.classList.add('hidden');
    anotherBtn.classList.add('hidden');
    copyBtn.classList.add('hidden');
    pressureFill.style.width = '0%';
    pressureValue.textContent = '0%';
    qCounter.textContent = '1';
    questionInput.value = '';
    if (typingTimeout) clearTimeout(typingTimeout);
    answerText.textContent = '';
    bubble.classList.add('hidden');
    bubble.classList.remove('visible');
    setBibiMood('idle');
    showScreen('play');
    setTimeout(() => questionInput.focus(), 50);
}

// ===== סיום סיבוב =====
function endGame() {
    const broke = stress >= 100;
    const r = rankFromResult(stress, roundQ, broke);

    // עדכון שיא
    let newBest = false;
    if (broke && (!bestRecord.questionsToBreak || roundQ < bestRecord.questionsToBreak)) {
        bestRecord.questionsToBreak = roundQ;
        localStorage.setItem('bibi_best_break', String(roundQ));
        newBest = true;
    }
    if (stress > bestRecord.bestPercent) {
        bestRecord.bestPercent = stress;
        localStorage.setItem('bibi_best_percent', String(stress));
        if (!broke) newBest = true;
    }

    endIcon.textContent = r.icon;
    endRank.textContent = r.name;
    endHeadline.textContent = r.headline;
    endStress.textContent = `${stress}%`;
    endQuestions.textContent = String(roundQ);
    endBest.textContent = newBest ? '🏆 שיא חדש שלך!' :
        (bestRecord.questionsToBreak ? `השיא שלך: ${bestRecord.questionsToBreak} שאלות` :
         bestRecord.bestPercent ? `השיא שלך: ${bestRecord.bestPercent}% לחץ` : '');

    if (broke) unlock('victory');

    updateBestLine();
    showScreen('end');
}

function rankFromResult(s, qs, broke) {
    if (broke) return { icon: '💥', name: 'שובר ספינים מוסמך', headline: `הוצאת אותו מהכלים תוך ${qs} שאלות!` };
    if (s >= 76) return { icon: '🔥', name: 'איום תקשורתי', headline: 'כמעט שברת אותו — הוא בקושי החזיק' };
    if (s >= 51) return { icon: '💧', name: 'חוקר בוועדה', headline: 'התחיל להזיע — הצלחה ניכרת' };
    if (s >= 26) return { icon: '🎙️', name: 'עיתונאי אולפן', headline: 'שאלות לא רעות, אבל הוא שלט בבמה' };
    return { icon: '📰', name: 'כתב מקומי', headline: 'הוא יצא יבש לגמרי. תחזור עם שאלות חזקות יותר.' };
}

// ===== דמות =====
function setBibiMood(mood) {
    const file = MOOD_IMAGES[mood] || MOOD_IMAGES.idle;
    bibi.classList.add('swap');
    setTimeout(() => {
        bibi.src = `images/${file}`;
        bibi.classList.remove('swap');
        bibi.classList.toggle('nervous', mood === 'thinking');
    }, 200);
}

function hideBubble() {
    bubble.classList.remove('visible');
    setTimeout(() => bubble.classList.add('hidden'), 400);
}

function showBubble(text) {
    if (typingTimeout) clearTimeout(typingTimeout);
    answerText.textContent = '';
    answerText.classList.add('typing');
    bubble.classList.remove('hidden');
    requestAnimationFrame(() => bubble.classList.add('visible'));
    typewriter(text, answerText);
}

function typewriter(text, element) {
    let i = 0;
    const tick = () => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            typingTimeout = setTimeout(tick, 28);
        } else { element.classList.remove('typing'); }
    };
    tick();
}

// ===== שורות טעינה =====
function startLoadingLines() {
    loadingLine.classList.remove('hidden');
    let idx = Math.floor(Math.random() * LOADING_LINES.length);
    loadingLine.textContent = LOADING_LINES[idx];
    loadingTimer = setInterval(() => {
        idx = (idx + 1) % LOADING_LINES.length;
        loadingLine.textContent = LOADING_LINES[idx];
    }, 900);
}
function stopLoadingLines() {
    clearInterval(loadingTimer);
    loadingLine.classList.add('hidden');
}

// ===== מתח מצטבר =====
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function applyStress(question) {
    const p = calculatePressure(question);
    const comboBonus = comboCount > 1 ? (comboCount - 1) * 6 : 0;
    let delta = null, label = '';
    if (isDevastating(question)) { delta = 20 + comboBonus; label = 'פגיעה ישירה'; }
    else if (isSensitive(question)) { delta = 11 + comboBonus; label = 'שאלה רגישה'; }
    else if (p >= 55) { delta = 9 + comboBonus; label = 'שאלה קשה'; }
    else if (p >= 35) { delta = 5; label = 'שאלה מסקרנת'; }

    const before = stress;
    if (delta === null) {
        stress = Math.max(0, Math.round(stress * 0.7) - 5);
        return { delta: stress - before, label: 'התרככת — חזר לשליטה' };
    }
    stress = Math.min(100, stress + delta);
    return { delta: stress - before, label };
}

function updateMeter(mood) {
    pressureFill.style.width = `${stress}%`;
    pressureValue.textContent = `${stress}%`;
    applyBreakdown(stress);
    setPanic(stress);
    if (stress >= 90) unlock('pressure');
}

function applyBreakdown(intensity) {
    document.body.classList.remove('bd-1', 'bd-2', 'bd-3');
    if (intensity >= 88) document.body.classList.add('bd-3');
    else if (intensity >= 68) document.body.classList.add('bd-2');
    else if (intensity >= 45) document.body.classList.add('bd-1');
}

function setPanic(intensity) {
    if (intensity >= 68) panicBadge.classList.remove('hidden');
    else panicBadge.classList.add('hidden');
}

// ===== קומבו =====
function showCombo(n) {
    comboEl.innerHTML = `COMBO x${n}<span class="combo-sub">רמת הלחץ עולה</span>`;
    comboEl.classList.remove('hidden');
    requestAnimationFrame(() => comboEl.classList.add('show'));
}
function hideCombo() {
    comboEl.classList.remove('show');
    setTimeout(() => comboEl.classList.add('hidden'), 250);
}

// ===== Breaking News =====
let breakingTimer = null;
function showBreaking(text) {
    breakingText.textContent = text;
    breaking.classList.remove('hidden');
    redpulse();
    clearTimeout(breakingTimer);
    breakingTimer = setTimeout(() => breaking.classList.add('hidden'), 3200);
}

// ===== טוסט פידבק =====
let feedbackTimer = null;
function showFeedback(delta, label) {
    const positive = delta > 0;
    feedbackDelta.textContent = (positive ? '+' : '') + delta + ' לחץ';
    feedbackLabel.textContent = label;
    feedbackToast.classList.toggle('negative', !positive);
    feedbackToast.classList.remove('hidden');
    requestAnimationFrame(() => feedbackToast.classList.add('show'));
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
        feedbackToast.classList.remove('show');
        setTimeout(() => feedbackToast.classList.add('hidden'), 250);
    }, 1500);
}

// ===== הישגים =====
function unlock(id) {
    if (unlocked.has(id)) return;
    unlocked.add(id);
    localStorage.setItem('bibi_achievements', JSON.stringify([...unlocked]));
    const def = ACHIEVEMENTS[id];
    achievementIcon.textContent = def.icon;
    achievementText.textContent = def.text;
    achievement.classList.remove('hidden');
    requestAnimationFrame(() => achievement.classList.add('show'));
    setTimeout(() => {
        achievement.classList.remove('show');
        setTimeout(() => achievement.classList.add('hidden'), 350);
    }, 2800);
}

// ===== אפקטים =====
function flash() { fx.className = ''; void fx.offsetWidth; fx.className = 'flash'; }
function redpulse() { fx.className = ''; void fx.offsetWidth; fx.className = 'redpulse'; setTimeout(() => fx.className = '', 1600); }
function glitchBibi() { bibi.classList.remove('glitch'); void bibi.offsetWidth; bibi.classList.add('glitch'); setTimeout(() => bibi.classList.remove('glitch'), 1300); }

function sysMsg(text, ms) {
    const el = document.createElement('div');
    el.className = 'sys-msg';
    el.textContent = text;
    bibiContainer.appendChild(el);
    return new Promise(resolve => setTimeout(() => { el.remove(); resolve(); }, ms));
}

// ===== תגובות נדירות =====
async function playRareEvent() {
    unlock('rare');
    hideBubble();
    const type = ['glitch', 'micoff', 'disconnect', 'blackout', 'nocomment'][rand(0, 4)];
    if (type === 'glitch') { glitchBibi(); await sysMsg('⚠ מערכת הספינים קרסה', 1800); setBibiMood('idle'); }
    else if (type === 'micoff') { await sysMsg('🎤 המיקרופון נכבה... במקרה', 2000); setBibiMood('suspicious'); }
    else if (type === 'disconnect') { glitchBibi(); await sysMsg('📡 החיבור נותק', 2000); setBibiMood('idle'); }
    else if (type === 'blackout') {
        fx.className = 'blackout';
        await new Promise(r => setTimeout(r, 1200));
        fx.className = '';
        await sysMsg('💡 האורות חזרו... איפה היינו?', 1600);
        setBibiMood('nervous-smile');
    } else {
        setBibiMood('nervous-smile');
        currentText = 'אין לי תגובה כרגע.';
        await wait(600);
        showBubble(currentText);
    }
}

// ===== קבלת תשובה =====
async function fetchAnswer(question, { another = false } = {}) {
    if (!useAI) await checkAI();
    if (useAI) {
        try {
            const payload = another
                ? { question: 'תן תשובה אחרת לגמרי לשאלה הקודמת — ניסוח שונה, זווית שונה, אבל באותה רוח.', history }
                : { question, history };
            const res = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.status === 429) {
                return another ? getAnotherResponse(question, currentText) : getResponse(question);
            }
            if (!res.ok) throw new Error('api');
            const data = await res.json();
            if (!another) {
                history.push({ role: 'user', content: question });
                history.push({ role: 'assistant', content: data.text });
            }
            return { t: data.text, m: data.mood };
        } catch { useAI = false; }
    }
    return another ? getAnotherResponse(question, currentText) : getResponse(question);
}

// ===== זרימה ראשית =====
function isSensitive(q) { return SENSITIVE_KEYWORDS.some(k => q.includes(k)); }
function isDevastating(q) { return DEVASTATING_KEYWORDS.some(k => q.includes(k)); }
function isDanger(q) { return isSensitive(q) || isDevastating(q); }
function isHard(q) { return calculatePressure(q) >= 50 || isDanger(q); }
function findHidden(q) { return HIDDEN_KEYWORDS.find(h => q.includes(h.k)); }

async function ask() {
    if (gameState !== 'play') return;
    const question = questionInput.value;
    currentQuestion = question;
    askBtn.disabled = true;
    anotherBtn.classList.add('hidden');
    copyBtn.classList.add('hidden');

    totalQuestionsLifetime++;
    if (totalQuestionsLifetime === 1) unlock('first');

    // קומבו
    if (isHard(question)) {
        comboCount++;
        if (comboCount >= 2) showCombo(comboCount);
        if (comboCount >= 3) unlock('combo3');
    } else {
        comboCount = 0;
        hideCombo();
    }

    // עדכון המתח המצטבר (מחזיר delta + label לפידבק)
    const prevStress = stress;
    const stressResult = applyStress(question);

    // Breaking News (במינון)
    const hidden = findHidden(question);
    if (isDanger(question)) unlock('danger');
    if (hidden) showBreaking(hidden.text);
    else if (isDevastating(question)) showBreaking('שאלה כואבת במיוחד');
    else if (prevStress < 70 && stress >= 70) showBreaking('הלחץ מתחיל להישבר...');

    // אירוע נדיר (1 ל-15)
    if (Math.random() < 1 / 15) {
        await playRareEvent();
        roundQ++;
        qCounter.textContent = String(Math.min(roundQ + 1, MAX_Q));
        askBtn.disabled = false;
        questionInput.value = '';
        if (stress >= 100 || roundQ >= MAX_Q) setTimeout(endGame, 800);
        return;
    }

    // זרימה רגילה
    hideBubble();
    setBibiMood('thinking');
    startLoadingLines();

    const [answer] = await Promise.all([fetchAnswer(question), wait(1900)]);

    stopLoadingLines();
    currentText = answer.t;
    setBibiMood(answer.m);
    await wait(600);
    showBubble(answer.t);
    updateMeter(answer.m);
    showFeedback(stressResult.delta, stressResult.label);

    anotherBtn.classList.remove('hidden');
    copyBtn.classList.remove('hidden');

    roundQ++;
    qCounter.textContent = String(Math.min(roundQ + 1, MAX_Q));
    questionInput.value = '';
    askBtn.disabled = false;

    if (stress >= 100 || roundQ >= MAX_Q) {
        // לתת לבועה זמן להופיע לפני המעבר
        setTimeout(endGame, 2200);
    }
}

async function another() {
    if (gameState !== 'play') return;
    anotherBtn.disabled = true;
    hideBubble();
    setBibiMood('thinking');
    startLoadingLines();

    const [answer] = await Promise.all([fetchAnswer(currentQuestion, { another: true }), wait(1100)]);

    stopLoadingLines();
    currentText = answer.t;
    setBibiMood(answer.m);
    await wait(500);
    showBubble(answer.t);
    updateMeter(answer.m);

    anotherBtn.disabled = false;
}

// ===== קלף שאלה =====
function pickCard() {
    const card = QUESTION_CARDS[Math.floor(Math.random() * QUESTION_CARDS.length)];
    questionInput.value = card;
    questionInput.focus();
}

// ===== פעולות =====
async function copyAnswer() {
    if (!currentText) return;
    try { await navigator.clipboard.writeText(currentText); flashButton(copyBtn, 'הועתק!'); }
    catch { flashButton(copyBtn, 'לא הצלחתי'); }
}
function flashButton(btn, text) {
    const original = btn.textContent;
    btn.textContent = text;
    setTimeout(() => btn.textContent = original, 1500);
}
function buildShareText() {
    const broke = stress >= 100;
    if (broke) return `שברתי את ביבי תוך ${roundQ} שאלות! 💥\n\nתצליחו יותר טוב? נסו גם אתם 👇`;
    return `הגעתי ל-${stress}% לחץ ב-${roundQ} שאלות.\n\nתצליחו להוציא את ביבי מהכלים? 👇`;
}
function shareEnd() {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText())}`, '_blank');
}
function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// ===== אירועים =====
startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);
shareBtn.addEventListener('click', shareEnd);
cardBtn.addEventListener('click', pickCard);
askBtn.addEventListener('click', ask);
anotherBtn.addEventListener('click', another);
copyBtn.addEventListener('click', copyAnswer);
questionInput.addEventListener('keydown', e => { if (e.key === 'Enter') ask(); });
