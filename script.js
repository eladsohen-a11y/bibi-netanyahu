// ===== אלמנטים =====
const bibi = document.getElementById('bibi');
const bubble = document.getElementById('speech-bubble');
const answerText = document.getElementById('answer-text');
const questionInput = document.getElementById('question');
const askBtn = document.getElementById('ask-btn');
const actions = document.getElementById('actions');
const anotherBtn = document.getElementById('another-btn');
const copyBtn = document.getElementById('copy-btn');
const whatsappBtn = document.getElementById('whatsapp-btn');
const meters = document.getElementById('meters');
const pressureFill = document.getElementById('pressure-fill');
const pressureValue = document.getElementById('pressure-value');
const statLabel = document.getElementById('stat-label');
const statFill = document.getElementById('stat-fill');
const statValue = document.getElementById('stat-value');
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

// ===== מיפוי הבעות =====
const MOOD_IMAGES = {
    idle: 'bibi-idle.png', thinking: 'bibi-thinking.png', answering: 'bibi-answering.png',
    angry: 'bibi-angry.jpg', proud: 'bibi-proud.jpg', suspicious: 'bibi-suspicious.jpg',
    emotional: 'bibi-emotional.jpg', accusing: 'bibi-accusing.jpg', sly: 'bibi-sly.jpg',
    dodging: 'bibi-dodging.jpg', defiant: 'bibi-defiant.jpg', 'nervous-smile': 'bibi-nervous-smile.jpg',
};
const SPIN_MOODS = ['dodging', 'sly', 'accusing', 'suspicious', 'defiant', 'angry'];

// ===== נתוני משחק =====
// רגיש — ביבי מתמודד בקור רוח ועקיצה. לא פאניקה. מעלה מתח מעט.
const SENSITIVE_KEYWORDS = [
    'משפט', 'תיק', 'שוחד', 'חקירה', 'פרקליטות', 'היועצת', 'אישומים', 'עדות',
    'סיגר', 'שמפניה', 'שמפניות', 'מתנות', 'צוללות', 'הדלפה', 'גלנט',
    'תקשורת', 'ערוץ', 'קואליציה', 'חרדים', 'גיוס', 'בן גביר', 'סמוטריץ',
    'בחירות', 'סקרים', 'יוקר', 'מחירים', 'דיור',
];
// כואב באמת — רק אלה (וחפירה חוזרת) באמת סודקים אותו.
const DEVASTATING_KEYWORDS = [
    'מחדל', '7 באוקטובר', 'שביעי באוקטובר', 'חטופים', 'משפחות החטופים',
    'כישלון', 'נכשל', 'אשם', 'אחריות', 'אחראי', 'תפטר', 'שרה', 'יאיר',
];
// מילים נסתרות — תגובת Breaking מותאמת (יוצר חקירה: "מה יקרה אם אכתוב X?")
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

const TICKER_HEADLINES = [
    'מקורות בלשכה: הכל בשליטה, ממש כמו תמיד',
    'סקר חדש: 100% מהיועצים מסכימים עם עצמם',
    'בהול: ראש הממשלה גילה מילה חדשה להתחמק איתה',
    'פרשנים: רמת הספין הגיעה לשיא חדש בהיסטוריה',
    'בלעדי: מישהו שאל שאלה ישירה — הלשכה בהלם',
    'דיווח: העניבה התכלת דורשת ועדת חקירה',
    'מהשטח: השמאל שוב אשם במשהו, פרטים בהמשך',
];

const ACHIEVEMENTS = {
    first:     { icon: '🎤', text: 'ראיון ראשון' },
    danger:    { icon: '🧨', text: 'שאלת שאלה אסורה' },
    pressure:  { icon: '🔥', text: 'העלית את הלחץ למקסימום' },
    combo3:    { icon: '😱', text: 'קומבו x3 — לחצת אותו ברצף' },
    rare:      { icon: '🎲', text: 'גרמת לאירוע נדיר' },
    veteran:   { icon: '📺', text: 'כתב מנוסה — 10 שאלות' },
};

// ===== מצב =====
let currentText = '';
let currentQuestion = '';
let typingTimeout = null;
let loadingTimer = null;
let useAI = true;
let comboCount = 0;
let totalQuestions = 0;
let stress = 0;            // מד מתח מצטבר — זוכר את ההיסטוריה
const history = [];
const unlocked = new Set(JSON.parse(localStorage.getItem('bibi_achievements') || '[]'));

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

// ===== שורות טעינה מצחיקות =====
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

// ===== מדדים =====
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function revealMeters() {
    meters.classList.remove('hidden');
}

function updateMeters(mood) {
    // מד הלחץ משקף את המתח המצטבר
    pressureFill.style.width = `${stress}%`;
    pressureValue.textContent = `${stress}%`;

    // מד מתחלף — לחוסר צפיות
    const stats = ['ספין', 'התחמקות', 'אמינות'];
    const label = stats[Math.floor(Math.random() * stats.length)];
    let value;
    if (label === 'אמינות') {
        value = SPIN_MOODS.includes(mood) ? rand(8, 28) : (mood === 'answering' ? rand(30, 48) : rand(18, 38));
    } else {
        value = SPIN_MOODS.includes(mood) ? rand(78, 97) : (mood === 'answering' ? rand(45, 65) : rand(60, 82));
    }
    statLabel.textContent = label;
    statFill.style.width = `${value}%`;
    statValue.textContent = `${value}%`;

    applyBreakdown(stress);
    setPanic(stress);
    if (stress >= 90) unlock('pressure');
}

// ===== קריסה מתקדמת — נגזרת מהמתח המצטבר =====
function applyBreakdown(intensity) {
    document.body.classList.remove('bd-1', 'bd-2', 'bd-3');
    if (intensity >= 88) document.body.classList.add('bd-3');
    else if (intensity >= 68) document.body.classList.add('bd-2');
    else if (intensity >= 45) document.body.classList.add('bd-1');
}

// ===== מצב פאניקה =====
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
    breakingTimer = setTimeout(() => breaking.classList.add('hidden'), 3500);
}

// ===== מד מתח מצטבר (לב ההסלמה) =====
// ביבי תותח עם קור רוח: רגיש → עולה מעט, נשאר רגוע. רק נושא כואב או
// חפירה בלתי פוסקת מסלימים לפאניקה. שאלה רגילה → מתקרר.
function applyStress(question) {
    const p = calculatePressure(question);
    const comboBonus = comboCount > 1 ? (comboCount - 1) * 6 : 0;
    let delta = null;
    if (isDevastating(question)) delta = 20 + comboBonus;   // כואב — אבל לוקח כמה כאלה לשבור
    else if (isSensitive(question)) delta = 11 + comboBonus; // רגיש — נשאר בשליטה
    else if (p >= 55) delta = 9 + comboBonus;
    else if (p >= 35) delta = 5;

    if (delta === null) {
        stress = Math.max(0, Math.round(stress * 0.7) - 5);  // מתקרר מהר כשמרפים
    } else {
        stress = Math.min(100, stress + delta);
    }
    return stress;
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
    actions.classList.add('hidden');
    const type = ['glitch', 'micoff', 'disconnect', 'blackout', 'nocomment'][rand(0, 4)];

    if (type === 'glitch') {
        glitchBibi();
        await sysMsg('⚠ מערכת הספינים קרסה', 1800);
        setBibiMood('idle');
    } else if (type === 'micoff') {
        await sysMsg('🎤 המיקרופון נכבה... במקרה', 2000);
        setBibiMood('suspicious');
    } else if (type === 'disconnect') {
        glitchBibi();
        await sysMsg('📡 החיבור נותק', 2000);
        setBibiMood('idle');
    } else if (type === 'blackout') {
        fx.className = 'blackout';
        await new Promise(r => setTimeout(r, 1200));
        fx.className = '';
        await sysMsg('💡 האורות חזרו... איפה היינו?', 1600);
        setBibiMood('nervous-smile');
    } else { // nocomment — רגע "כן" נדיר
        setBibiMood('nervous-smile');
        currentText = 'אין לי תגובה כרגע.';
        await wait(600);
        showBubble(currentText);
        actions.classList.remove('hidden');
    }
}

// ===== קבלת תשובה (AI / סטטי) =====
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
    const question = questionInput.value;
    currentQuestion = question;
    askBtn.disabled = true;
    actions.classList.add('hidden');

    totalQuestions++;
    if (totalQuestions === 1) unlock('first');
    if (totalQuestions === 10) unlock('veteran');

    // קומבו
    if (isHard(question)) {
        comboCount++;
        if (comboCount >= 2) showCombo(comboCount);
        if (comboCount >= 3) unlock('combo3');
    } else {
        comboCount = 0;
        hideCombo();
    }

    // עדכון המתח המצטבר
    const prevStress = stress;
    applyStress(question);

    // Breaking News — במינון: מילה נסתרת / נושא כואב / חציית סף פאניקה
    const hidden = findHidden(question);
    if (isDanger(question)) unlock('danger');
    if (hidden) showBreaking(hidden.text);
    else if (isDevastating(question)) showBreaking('שאלה כואבת במיוחד');
    else if (prevStress < 70 && stress >= 70) showBreaking('הלחץ מתחיל להישבר...');

    // אירוע נדיר (1 ל-15)
    if (Math.random() < 1 / 15) {
        await playRareEvent();
        askBtn.disabled = false;
        return;
    }

    // זרימה רגילה
    revealMeters();
    hideBubble();
    setBibiMood('thinking');
    startLoadingLines();

    const [answer] = await Promise.all([fetchAnswer(question), wait(1900)]);

    stopLoadingLines();
    currentText = answer.t;
    setBibiMood(answer.m);
    await wait(700);
    showBubble(answer.t);
    updateMeters(answer.m);

    actions.classList.remove('hidden');
    askBtn.disabled = false;
}

async function another() {
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
    updateMeters(answer.m);

    anotherBtn.disabled = false;
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
    const q = currentQuestion.trim() || 'שאלה';
    return `שאלתי את ביבי: "${q}"\n\nוהוא ענה:\n"${currentText}"\n\nנסו גם אתם 👇`;
}
function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText())}`, '_blank');
}
function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// ===== אירועים =====
askBtn.addEventListener('click', ask);
anotherBtn.addEventListener('click', another);
copyBtn.addEventListener('click', copyAnswer);
whatsappBtn.addEventListener('click', shareWhatsApp);
questionInput.addEventListener('keydown', e => { if (e.key === 'Enter') ask(); });
