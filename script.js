// ===== אלמנטים =====
const bibi = document.getElementById('bibi');
const bubble = document.getElementById('speech-bubble');
const answerText = document.getElementById('answer-text');
const questionInput = document.getElementById('question');
const askBtn = document.getElementById('ask-btn');
const cardBtn = document.getElementById('card-btn');
const pressureFill = document.getElementById('pressure-fill');
const pressureValue = document.getElementById('pressure-value');
const hudQEl = document.getElementById('hud-q');
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
const startShareBtn = document.getElementById('start-share-btn');
const playShareBtn = document.getElementById('play-share-btn');
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
const resetBtn = document.getElementById('reset-btn');

// ===== מיפוי הבעות =====
const MOOD_IMAGES = {
    idle: 'bibi-idle.png', thinking: 'bibi-thinking.png', answering: 'bibi-answering.png',
    angry: 'bibi-angry.png', proud: 'bibi-proud.png', suspicious: 'bibi-suspicious.png',
    emotional: 'bibi-emotional.png', accusing: 'bibi-accusing.png', sly: 'bibi-sly.png',
    dodging: 'bibi-dodging.png', defiant: 'bibi-defiant.png', 'nervous-smile': 'bibi-nervous-smile.png',
    // מצבים מיוחדים לאירועים נדירים (לא נשלחים ל-Claude, נבחרים מקומית).
    leftstage: 'bibi-leftstage.png',   // ביבי עזב את הבמה
    shutdown: 'bibi-shutdown.png',     // קריסת מערכת
    silenced: 'bibi-silenced.png',     // השתיק אותך
};
const SPIN_MOODS = ['dodging', 'sly', 'accusing', 'suspicious', 'defiant', 'angry'];

// ===== נתוני משחק =====
// 7 שאלות, סוף אוטומטי. ב-100% מתח — ניצחון מיידי. אחרי 7 שאלות:
// אם 90–99% → מופעלת אוטומטית "שאלת הכרעה" אחת. אחרת — מסך סיום.
const MAX_ROUNDS = 7;

// נושאים — חלוקה הגיונית של מילות מפתח לנושאים, כדי שניתן יהיה
// לזהות חזרה על אותו נושא ולהפעיל "תשואות פוחתות".
// סדר ההגדרה חשוב: הנושא הראשון שמתאים מנצח (devastating מופיע אחרון אבל
// המילים הייחודיות שלו לא חופפות לאחרים).
const TOPICS = {
    trial:     { keywords: ['משפט', 'תיק', 'תיקים', 'שוחד', 'חקירה', 'פרקליטות', 'היועצת', 'אישומים', 'עדות'], intensity: 'sensitive' },
    scandals:  { keywords: ['סיגר', 'שמפניה', 'שמפניות', 'מתנות', 'צוללות', 'הדלפה'], intensity: 'sensitive' },
    family:    { keywords: ['שרה', 'יאיר', 'אשתך', 'הבת', 'הבן', 'המשפחה'], intensity: 'sensitive' },
    coalition: { keywords: ['קואליציה', 'חרדים', 'גיוס', 'בן גביר', 'סמוטריץ', 'בחירות', 'סקרים', 'גלנט'], intensity: 'sensitive' },
    media:     { keywords: ['תקשורת', 'ערוץ', 'עיתונאים', 'עיתונות'], intensity: 'sensitive' },
    economy:   { keywords: ['יוקר', 'מחירים', 'דיור'], intensity: 'sensitive' },
    october:   { keywords: ['מחדל', '7 באוקטובר', 'שביעי באוקטובר', 'חטופים', 'משפחות החטופים'], intensity: 'devastating' },
    blame:     { keywords: ['כישלון', 'נכשל', 'אשם', 'אחריות', 'אחראי', 'תפטר', 'אשמתך'], intensity: 'devastating' },
};

// מילים שמסמנות "שאלה ישירה" — מקבלות בונוס לחץ קטן בלי קשר לנושא.
const DIRECT_KEYWORDS = ['כן או לא', 'האם', 'ידעת', 'אחראי', 'בלי להתחמק', 'תענה'];
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

// קלפי שאלה בשלוש רמות. הבחירה משוקללת: 70% שטויות, 20% ביניים, 10% קשות.
// המטרה: שלא ניתן יהיה לנצח את המשחק רק ע"י לחיצה חוזרת על "קלף שאלה".
const SILLY_CARDS = [
    'אתה אוהב חמוצים?',
    'אתה מעדיף חתולים או כלבים?',
    'איזה אייסקרים הכי טעים?',
    'מי המבשל הכי טוב במשפחה שלך?',
    'מה דעתך על מכבי תל אביב?',
    'אתה יודע לרקוד?',
    'מה הסדרה האהובה עליך?',
    'תתאר ארוחת בוקר ישראלית מושלמת.',
    'אתה אוכל בורקסים בבוקר?',
    'מתי הלכת לים בפעם האחרונה?',
    'אתה צופה בריאליטי?',
    'מה הצבע האהוב עליך?',
];
const MEDIUM_CARDS = [
    'מתי בפעם האחרונה הודית בטעות?',
    'אם היית מתחיל מחדש — מה היית עושה אחרת?',
    'מה הדבר היחיד שלא היית רוצה שישאלו אותך עכשיו?',
    'אתה ישן בלילה?',
];
// קלפים קשים — חייבים להיות "נצחיים" ולא תלויי-זמן.
// כלל: אסור להזכיר אירוע שעלול להשתנות / להיגמר (כמו "החטופים עוד מוחזקים").
// במקום זה — שאלות על אופי, אחריות, סגנון, שלעולם לא יוצאות מהקשר.
const HARD_CARDS = [
    'מי באמת אשם במחדל של 7 באוקטובר?',
    'מתי בפעם האחרונה לקחת אחריות אישית — בלי "אבל"?',
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
let decisiveActive = false; // האם אנחנו כרגע בשאלת ההכרעה (אחרי 7 שאלות + 90-99%)
const history = [];
const topicHistory = []; // רשימת הנושאים שכבר הופיעו בראיון הנוכחי — לתשואות פוחתות

const unlocked = new Set(JSON.parse(localStorage.getItem('bibi_achievements') || '[]'));
const bestRecord = {
    questionsToBreak: parseInt(localStorage.getItem('bibi_best_break') || '0', 10) || null,
    bestPercent: parseInt(localStorage.getItem('bibi_best_percent') || '0', 10) || 0,
};

updateBestLine();
showScreen('start');

// ===== ניהול מסכים =====
function showScreen(name) {
    gameState = name;
    screenStart.classList.toggle('hidden', name !== 'start');
    screenPlay.classList.toggle('hidden', name !== 'play');
    screenEnd.classList.toggle('hidden', name !== 'end');
}

// מד הנקודות: 7 נקודות, כל אחת מייצגת שאלה. ממולאות = הסתיימה,
// נוכחית = פועמת אדומה, ריקות = עוד לפנינו.
function renderRoundDots(currentRound) {
    let html = '';
    for (let i = 1; i <= MAX_ROUNDS; i++) {
        let cls = 'round-dot';
        if (i < currentRound) cls += ' done';
        else if (i === currentRound) cls += ' current';
        html += `<span class="${cls}"></span>`;
    }
    return html;
}

// ה-HUD מציג "שאלה X/7" + מד נקודות במשחק רגיל, או טקסט מיוחד כמו "⚡ שאלת הכרעה".
function setHudCounter(value) {
    if (typeof value === 'number') {
        hudQEl.innerHTML = `<span class="round-label">שאלה ${value}/${MAX_ROUNDS}</span><span class="round-dots">${renderRoundDots(value)}</span>`;
    } else {
        hudQEl.textContent = value;
    }
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
    decisiveActive = false;
    currentText = '';
    currentQuestion = '';
    history.length = 0;
    topicHistory.length = 0;
    document.body.classList.remove('bd-1', 'bd-2', 'bd-3');
    panicBadge.classList.add('hidden');
    breaking.classList.add('hidden');
    comboEl.classList.add('hidden');
    resetBtn.classList.add('hidden'); // יופיע אחרי שאלה ראשונה
    pressureFill.style.width = '0%';
    pressureValue.textContent = '0%';
    setHudCounter(1);
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
function endGame(opts = {}) {
    const broke = stress >= 100;
    const nearMiss = !broke && !!opts.nearMiss;
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

    endIcon.textContent = nearMiss ? '😤' : r.icon;
    endRank.textContent = `יצאת ${r.name}`;
    endHeadline.textContent = nearMiss
        ? 'כמעט שברת אותו. הוא שרד על חוט השערה.'
        : r.headline;
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

// ===== זיהוי נושא / סוג שאלה =====
function detectTopic(q) {
    for (const [name, data] of Object.entries(TOPICS)) {
        if (data.keywords.some(kw => q.includes(kw))) return { name, ...data };
    }
    return null;
}
function isDirectQuestion(q) {
    return DIRECT_KEYWORDS.some(kw => q.includes(kw));
}
// כפל תשואות פוחתות: 1.00 לראשונה, 0.55 לשנייה, 0.25 לשלישית, 0.10 מהרביעית והלאה
function topicMultiplier(topicName) {
    if (!topicName) return 1;
    const seen = topicHistory.filter(t => t === topicName).length;
    return [1.0, 0.55, 0.25, 0.10][Math.min(seen, 3)];
}

function applyStress(question, opts = {}) {
    const topic = detectTopic(question);
    const p = calculatePressure(question);
    const direct = isDirectQuestion(question);

    // ניקוד בסיס לפי עוצמה
    let baseDelta = 0;
    let label = '';
    if (topic?.intensity === 'devastating') { baseDelta = 20; label = 'פגיעה ישירה'; }
    else if (topic?.intensity === 'sensitive') { baseDelta = 11; label = 'שאלה רגישה'; }
    else if (p >= 55) { baseDelta = 9; label = 'שאלה קשה'; }
    else if (p >= 35) { baseDelta = 5; label = 'שאלה מסקרנת'; }

    // שאלה רכה לחלוטין ובלי "כיוון ישיר" — ביבי מתאושש
    if (baseDelta === 0 && !direct) {
        const before = stress;
        stress = Math.max(0, Math.round(stress * 0.7) - 5);
        topicHistory.push(null);
        return { delta: stress - before, label: 'התרככת — חזר לשליטה' };
    }

    // תשואות פוחתות לאותו נושא
    const seenCount = topic ? topicHistory.filter(t => t === topic.name).length : 0;
    const mult = topic ? topicMultiplier(topic.name) : 1;
    let delta = Math.round(baseDelta * mult);

    // בונוס שאלה ישירה — קטן אבל מורגש
    if (direct) {
        delta += 4;
        if (!label) label = 'שאלה ישירה';
    }

    // בונוס קומבו — comboCount כבר עודכן ב-ask() לפני הקריאה
    if (comboCount >= 2) {
        delta += (comboCount - 1) * 6;
    }

    // תווית "נושא חוזר" דורסת את התווית הרגילה כשבאמת חוזרים
    if (topic && seenCount === 1) label = 'ערני לנושא — נסה מכיוון אחר';
    else if (topic && seenCount === 2) label = 'אותו נושא — האפקט נשחק';
    else if (topic && seenCount >= 3) label = 'מחוסן לנושא הזה';

    // התנגדות מדורגת: ככל שביבי לחוץ יותר, קשה יותר להמשיך להעלות את הרף.
    // 0–60%: מלא, 60–80%: 80%, 80–95%: 60%, 95%+: 35%.
    let resistMult;
    if (stress < 60) resistMult = 1.0;
    else if (stress < 80) resistMult = 0.8;
    else if (stress < 95) resistMult = 0.6;
    else resistMult = 0.35;
    delta = Math.max(1, Math.round(delta * resistMult));

    // בונוס שאלת הכרעה (+15%) — אחרי ההתנגדות, לרגע הדרמטי.
    if (opts.decisive) {
        delta = Math.round(delta * 1.15);
    }

    const before = stress;
    stress = Math.min(100, stress + delta);
    topicHistory.push(topic?.name || null);
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
    const subtext = n >= 3 ? 'רצף מסוכן' : 'רמת הלחץ עולה';
    comboEl.innerHTML = `COMBO x${n}<span class="combo-sub">${subtext}</span>`;
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
    const type = ['glitch', 'micoff', 'disconnect', 'blackout', 'nocomment', 'advisers', 'leftstage'][rand(0, 6)];
    if (type === 'glitch') { glitchBibi(); await sysMsg('⚠ מערכת הספינים קרסה', 1800); setBibiMood('shutdown'); }
    else if (type === 'micoff') { await sysMsg('🎤 המיקרופון נכבה... במקרה', 2000); setBibiMood('silenced'); }
    else if (type === 'disconnect') { glitchBibi(); await sysMsg('📡 החיבור נותק', 2000); setBibiMood('idle'); }
    else if (type === 'blackout') {
        fx.className = 'blackout';
        await new Promise(r => setTimeout(r, 1200));
        fx.className = '';
        await sysMsg('💡 האורות חזרו... איפה היינו?', 1600);
        setBibiMood('shutdown');
    }
    else if (type === 'advisers') { await sysMsg('🤝 היועצים מבקשים הפסקה', 2000); setBibiMood('dodging'); }
    else if (type === 'leftstage') { await sysMsg('🚪 הוא יצא מהבמה. רגע, רגע...', 2200); setBibiMood('leftstage'); }
    else {
        setBibiMood('nervous-smile');
        currentText = 'אין לי תגובה כרגע.';
        await wait(600);
        showBubble(currentText);
    }
}

// ===== קבלת תשובה =====
// תמיד מנסים את ה-AI קודם. נופלים למאגר הסטטי רק על כשל אמיתי (שרת
// כבוי, תקלת רשת, או הגבלת קצב). אין יותר "gate" שיכול להיתקע.
async function fetchAnswer(question) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000); // הגנת קפיאה
    try {
        const res = await fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, history }),
            signal: controller.signal,
        });
        clearTimeout(timer);

        // הגבלת קצב / תקרה / אין מפתח — נופלים לסטטי לבקשה הזו בלבד
        if (res.status === 429 || res.status === 503) return getResponse(question);
        if (res.ok) {
            const data = await res.json();
            history.push({ role: 'user', content: question });
            history.push({ role: 'assistant', content: data.text });
            return { t: data.text, m: data.mood };
        }
        // שגיאת שרת אחרת — סטטי
    } catch (e) {
        clearTimeout(timer);
        // תקלת רשת / timeout / abort — סטטי
    }
    return getResponse(question);
}

// ===== ניהול סוף סבב / שאלת הכרעה =====
// קוראים אחרי כל שאלה שהושלמה (רגילה או אירוע נדיר). מקדם את המונה ומחליט
// אם המשחק נגמר, אם להפעיל שאלת הכרעה, או אם להמשיך הלאה.
function advanceRound() {
    roundQ++;
    const reachedLimit = roundQ >= MAX_ROUNDS;
    if (!reachedLimit && !decisiveActive) setHudCounter(roundQ + 1);
    askBtn.disabled = false;
    questionInput.value = '';

    if (stress >= 100) {
        setTimeout(() => endGame(), 2200);
    } else if (decisiveActive) {
        // שאלת ההכרעה הסתיימה בלי שבירה — סיום "כמעט"
        setTimeout(() => endGame({ nearMiss: true }), 2200);
    } else if (reachedLimit) {
        if (stress >= 90) setTimeout(triggerDecisive, 1800);
        else setTimeout(() => endGame(), 2200);
    }
}

// נכנס לשאלת הכרעה: סימן ויזואלי בולט + שינוי ה-HUD, מקבל שאלה אחת נוספת.
function triggerDecisive() {
    decisiveActive = true;
    setHudCounter('⚡ שאלת הכרעה');
    showBreaking('🎯 הוא על הקצה — שאלת הכרעה אחת');
    questionInput.focus();
}

// ===== זרימה ראשית =====
function isDevastating(q) { return detectTopic(q)?.intensity === 'devastating'; }
function isDanger(q) { return !!detectTopic(q); }
function isHard(q) { return !!detectTopic(q) || calculatePressure(q) >= 50; }
function findHidden(q) { return HIDDEN_KEYWORDS.find(h => q.includes(h.k)); }

async function ask() {
    if (gameState !== 'play') return;
    const question = questionInput.value;
    currentQuestion = question;
    askBtn.disabled = true;

    // זיהוי ג'יבריש: יש קלט אבל אין אות עברית אחת
    const noHeb = question.trim().length > 0 && !/[֐-׿]/.test(question);

    totalQuestionsLifetime++;
    if (totalQuestionsLifetime === 1) unlock('first');

    // קומבו — דורש שאלה קשה *וגם* מעבר לנושא שונה מהקודם.
    // ככה ספאם של אותו נושא לא ייתן בונוסי קומבו.
    const currentTopic = detectTopic(question);
    const lastTopic = topicHistory[topicHistory.length - 1] ?? null;
    const differentTopic = !!currentTopic && currentTopic.name !== lastTopic;
    if (isHard(question) && differentTopic) {
        comboCount++;
        if (comboCount >= 2) showCombo(comboCount);
        if (comboCount >= 3) unlock('combo3');
    } else {
        comboCount = 0;
        hideCombo();
    }

    // עדכון המתח המצטבר (מחזיר delta + label לפידבק)
    const prevStress = stress;
    const stressResult = applyStress(question, { decisive: decisiveActive });
    if (noHeb) stressResult.label = 'לא בעברית — בזבזת תור';

    // Breaking News (במינון)
    const hidden = findHidden(question);
    if (isDanger(question)) unlock('danger');
    if (hidden) showBreaking(hidden.text);
    else if (isDevastating(question)) showBreaking('שאלה כואבת במיוחד');
    else if (prevStress < 70 && stress >= 70) showBreaking('הלחץ מתחיל להישבר...');

    // אירוע נדיר (1 ל-15) — עוקף את התשובה הרגילה, אבל עדיין סופר כסבב.
    if (Math.random() < 1 / 15) {
        await playRareEvent();
        advanceRound();
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

    resetBtn.classList.remove('hidden');

    advanceRound();
}

// ===== קלף שאלה =====
function pickCard() {
    const r = Math.random();
    const pool = r < 0.10 ? HARD_CARDS : r < 0.30 ? MEDIUM_CARDS : SILLY_CARDS;
    const card = pool[Math.floor(Math.random() * pool.length)];
    questionInput.value = card;
    questionInput.focus();
}

// ===== פעולות =====
function buildShareText() {
    const broke = stress >= 100;
    if (broke) return `הוצאתי את הפוליטיקאי הטוב בכל הזמנים מהכלים תוך ${roundQ} שאלות 😭\nנראה אותך מצליח בפחות.`;
    return `הגעתי ל-${stress}% לחץ ב-${roundQ} שאלות.\n\nתצליחו להוציא את ביבי מהכלים? 👇`;
}
function shareEnd() {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText())}`, '_blank');
}
// שיתוף הזמנה ממסך הפתיחה — מצרף את כתובת האפליקציה כדי שהחבר יוכל להיכנס.
function shareInvite() {
    const text = `תנסה להוציא את ביבי מהכלים — יש לך 7 שאלות 👇\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// ===== אירועים =====
startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);
shareBtn.addEventListener('click', shareEnd);
startShareBtn.addEventListener('click', shareInvite);
playShareBtn.addEventListener('click', shareInvite);
resetBtn.addEventListener('click', () => { if (gameState === 'play') startGame(); });
cardBtn.addEventListener('click', pickCard);
askBtn.addEventListener('click', ask);
questionInput.addEventListener('keydown', e => { if (e.key === 'Enter') ask(); });
