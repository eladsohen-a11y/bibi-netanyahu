const bibi = document.getElementById('bibi');
const bubble = document.getElementById('speech-bubble');
const answerText = document.getElementById('answer-text');
const questionInput = document.getElementById('question');
const askBtn = document.getElementById('ask-btn');
const actions = document.getElementById('actions');
const anotherBtn = document.getElementById('another-btn');
const copyBtn = document.getElementById('copy-btn');
const whatsappBtn = document.getElementById('whatsapp-btn');
const pressureMeter = document.getElementById('pressure-meter');
const pressureFill = document.getElementById('pressure-fill');
const pressureValue = document.getElementById('pressure-value');

// מיפוי הבעת פנים -> קובץ תמונה
const MOOD_IMAGES = {
    idle: 'bibi-idle.png',
    thinking: 'bibi-thinking.png',
    answering: 'bibi-answering.png',
    angry: 'bibi-angry.jpg',
    proud: 'bibi-proud.jpg',
    suspicious: 'bibi-suspicious.jpg',
    emotional: 'bibi-emotional.jpg',
    accusing: 'bibi-accusing.jpg',
    sly: 'bibi-sly.jpg',
    dodging: 'bibi-dodging.jpg',
    defiant: 'bibi-defiant.jpg',
    'nervous-smile': 'bibi-nervous-smile.jpg',
};

let currentText = '';
let currentQuestion = '';
let typingTimeout = null;
let useAI = true;               // האם להשתמש ב-AI (נכבה אוטומטית אם אין שרת/מפתח)
const history = [];             // זיכרון השיחה: [{role, content}, ...]

// בודק אם השרת + מפתח ה-AI זמינים
async function checkAI() {
    try {
        const res = await fetch('/api/health');
        if (!res.ok) throw new Error();
        const data = await res.json();
        useAI = Boolean(data.hasKey);
    } catch {
        useAI = false; // כנראה נפתח כקובץ ישירות, או שאין שרת
    }
}
checkAI();

function setBibiMood(mood) {
    const file = MOOD_IMAGES[mood] || MOOD_IMAGES.idle;
    bibi.classList.add('swap');
    setTimeout(() => {
        bibi.src = `images/${file}`;
        bibi.classList.remove('swap');
        if (mood === 'thinking') {
            bibi.classList.add('nervous');
        } else {
            bibi.classList.remove('nervous');
        }
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
    const speed = 28;
    const tick = () => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            typingTimeout = setTimeout(tick, speed);
        } else {
            element.classList.remove('typing');
        }
    };
    tick();
}

function resetPressure() {
    pressureMeter.classList.remove('hidden');
    pressureFill.style.width = '0%';
    pressureValue.textContent = '0%';
}

function updatePressure(question) {
    const level = calculatePressure(question);
    pressureMeter.classList.remove('hidden');
    pressureFill.style.width = `${level}%`;
    pressureValue.textContent = `${level}%`;
}

// מקבל תשובה — דרך ה-AI אם זמין, אחרת מהמאגר הסטטי המקומי
async function fetchAnswer(question, { another = false } = {}) {
    // ריפוי עצמי: אם ה-AI לא זוהה (אולי הדף נטען לפני שהשרת עלה) — בדוק שוב
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
            // הגבלת קצב / תקרה יומית — נופלים למאגר המקומי לבקשה הזו בלבד,
            // בלי לכבות את ה-AI לצמיתות
            if (res.status === 429) {
                return another ? getAnotherResponse(question, currentText) : getResponse(question);
            }
            if (!res.ok) throw new Error('api');
            const data = await res.json();
            // שמירת ההקשר לזיכרון — רק בשאלה רגילה (לא ב"תשובה אחרת")
            if (!another) {
                history.push({ role: 'user', content: question });
                history.push({ role: 'assistant', content: data.text });
            }
            return { t: data.text, m: data.mood };
        } catch {
            useAI = false; // נפל — עוברים למצב סטטי מכאן והלאה
        }
    }
    // מצב סטטי (fallback)
    return another ? getAnotherResponse(question, currentText) : getResponse(question);
}

async function deliver(answerPromise, thinkMs, pauseMs) {
    hideBubble();
    setBibiMood('thinking');

    // ממתינים גם לחשיבה הדרמטית וגם לתשובה (מה שלוקח יותר זמן)
    const [answer] = await Promise.all([answerPromise, wait(thinkMs)]);

    currentText = answer.t;
    setBibiMood(answer.m);
    await wait(pauseMs);
    showBubble(answer.t);
}

async function ask() {
    const question = questionInput.value;
    currentQuestion = question;

    askBtn.disabled = true;
    actions.classList.add('hidden');

    resetPressure();                 // מתאפס בתחילת כל שאלה
    await deliver(fetchAnswer(question), 1900, 700);
    updatePressure(question);        // מתמלא כשהתשובה מופיעה

    actions.classList.remove('hidden');
    askBtn.disabled = false;
}

async function another() {
    anotherBtn.disabled = true;
    await deliver(fetchAnswer(currentQuestion, { another: true }), 1100, 500);
    anotherBtn.disabled = false;
}

async function copyAnswer() {
    if (!currentText) return;
    try {
        await navigator.clipboard.writeText(currentText);
        flashButton(copyBtn, 'הועתק!');
    } catch (e) {
        flashButton(copyBtn, 'לא הצלחתי');
    }
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
    const text = encodeURIComponent(buildShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

askBtn.addEventListener('click', ask);
anotherBtn.addEventListener('click', another);
copyBtn.addEventListener('click', copyAnswer);
whatsappBtn.addEventListener('click', shareWhatsApp);
questionInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') ask();
});
