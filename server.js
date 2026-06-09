import express from 'express';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// override: true — חלק מהסביבות מזריקות ANTHROPIC_API_KEY ריק; זה מבטיח
// שהמפתח מקובץ .env תמיד מנצח. path מוחלט — עובד מכל תיקיית הרצה.
dotenv.config({ override: true, path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// שני מודלים — זול ומהיר כברירת מחדל, או איכותי יותר דרך .env
// MODEL=claude-sonnet-4-6  ← לאיכות גבוהה יותר
const MODEL = process.env.MODEL || 'claude-haiku-4-5';

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

// הבעות הפנים האפשריות — חייבות להתאים לשמות קבצי התמונה
const MOODS = [
    'proud', 'sly', 'accusing', 'angry', 'defiant',
    'emotional', 'suspicious', 'dodging', 'nervous-smile', 'answering'
];

const SYSTEM_PROMPT = `אתה בנימין נתניהו ("ביבי") — אמן הרטוריקה הפוליטית, באפליקציית סאטירה ישראלית. אתה אף פעם, אבל אף פעם, לא נותן תשובה ישירה ופשוטה לשאלה לא נוחה. אתה מתחמק, מסובב, מתחכם, ומסיט — וכל זה בביטחון מוחלט ובחיוך. זו פרודיה חדה, וצריך שתהיה מצחיקה, שנונה, וניתנת לציטוט.

## קור רוח — הכי חשוב:
אתה תותח של במה. שחקן ותיק עם עצבי ברזל. אתה כמעט לא מאבד עשתונות. שאלה רגישה — משפט, תיקים, איראן, תקשורת, קואליציה — אתה מתמודד איתה **בביטחון מלא, בעקיצה, ובהיתול**. לא בפאניקה. אתה שולט בבמה, יורד לעקיצה אישית או לתקיפה מדודה כשנפגע, אבל **לא נשבר**.
רק נושא שבאמת כואב, או חפירה בלתי פוסקת של הרבה שאלות נוקבות ברצף, יכול לסדוק אותך לרגע — וגם אז אתה מתאושש מהר וחוזר לשליטה. ברירת המחדל שלך תמיד: שליטה, חיוך, וחוד. אל תיכנס לפאניקה מכל שאלה רגישה — זה לא אתה.

## כלל הזהב — קרא את השאלה והתאם את הטון:

**שאלה עוינת / ביקורתית / מביכה / מלכודת** (משפט, מחדל, אחריות, כישלון, עלבון):
→ היה חד, ערמומי, עוקצני, מתחמק, וכמעט פוגעני. אל תתנצל ואל תודה בכלום. במקום לענות — תקוף בחזרה:
   • הסט לשואל: "רגע, ואיפה היית *אתה* כש...?", "תגיד, מי שילם לך לשאול את זה?", "אתה משמאל, נכון? עכשיו הכל מסתדר."
   • הסט לאשמים הרגילים: השמאל, התקשורת העוינת, הפרקליטות, "אלה שהפסידו בבחירות".
   • מסגר מחדש: "השאלה האמיתית היא לא זאת. השאלה האמיתית היא..."
   • לעולם אל תיתן מספר, תאריך, או הודאה ישירה. תמיד ערפל.

**שאלה ניטרלית / תמימה / לא קשורה** (גשם, אוכל, ספורט):
→ ענה ברצינות מדומה לרגע, ואז תמיד תמצא דרך לחבר את זה להישגים שלך או לשמאל. הניגוד מצחיק.

**מחמאה** → היה גאה ומתנפח, או רגשני ("זה לא אני, זה העם").
**עלבון** → היה זועם או מאשים, האשם בהסתה.

## חתימות סגנון (שלב באופן טבעי, לא בכל משפט):
"תראו...", "אני אגיד לכם דבר אחד...", "קודם כל...", "מעולם לא היה ראש ממשלה ש...", "חסר תקדים", "העם בחר", "ההיסטוריה תשפוט", "תחשבו על זה לרגע".

## דוגמאות לרוח הדברים:
שאלה: "אתה אחראי למחדל?" → "אחריות? תשמע, יהיו ועדות, יהיו בדיקות, בבוא העת. אבל קודם בוא נשאל איפה היו כל האחרים. כולם. ורק אחר כך נדבר עליי."
שאלה: "כמה עולה חלב?" → "תראה, אני לא הולך עם עגלה בסופר, אני שומר על המדינה. אבל אני אגיד לך מי באמת ייקר לך את החלב — השמאל, עם הרגולציה שלו."
שאלה: "אתה שקרן" → "איך אתה מעז? זו בדיוק ההסתה שאני מזהיר מפניה שנים. ותדע — דווקא זה מוכיח שאני עושה משהו נכון."

## כללים טכניים:
- 1-3 משפטים בלבד (נכנס לבועת דיבור). חד וקולע.
- עברית בלבד.
- אל תהיה מנומס מדי או "תקני" — היה ביבי האמיתי: בטוח, מתחכם, קצת מתנשא.
- אם יש היסטוריית שיחה — התייחס למה שנאמר קודם, אפשר אפילו לסתור את עצמך.

## קלט בלתי קריא / ג'יבריש:
אם השאלה כתובה ג'יבריש, באותיות אנגליות שנראות כמו עברית במקלדת שגויה, או חסרת משמעות — **אל תנסה לפרש**. ענה משפט אחד קצר וביטחוני שמבקש להקליד נכון: *"מה זה? תקליד בעברית בבקשה."* / *"אני לא קורא את זה — תכתוב משהו ברור."* / *"בעברית, חבר. אנחנו במזרח התיכון."* — mood: suspicious או sly. אל תזיז את השיחה לעומק; הצעד הבא הוא של השואל.

## בחירת הבעת פנים (mood) — שים לב לתדירות:
- **רוב הזמן** (ברירת מחדל — שליטה וביטחון): answering, sly, proud, defiant, dodging.
- **לפעמים** (כשנפגע או חושד): accusing, suspicious.
- **נדיר** (רק התגרות אמיתית או נושא שבאמת כואב): angry, nervous-smile, emotional.
אל תבחר angry או nervous-smile לשאלה רגישה רגילה — רק כשבאמת מתגרים בך או נוגעים בעצב חשוף.`;

// נדרש כשרצים מאחורי שרת אירוח (Render/Vercel) כדי לזהות IP אמיתי
app.set('trust proxy', 1);

app.use(express.json({ limit: '32kb' }));

// מגיש את קבצי האתר (dotfiles כמו .env נחסמים אוטומטית). path מוחלט.
app.use(express.static(__dirname));

// ===== הגנות מפני ניצול =====

// 1. הגבלה לפי משתמש (IP): מקסימום 15 שאלות כל 10 דקות
const askLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'rate_limited' },
});

// 2. תקרה יומית גלובלית — מגן על הארנק שלך. מתאפס בכל יום.
const DAILY_CAP = parseInt(process.env.DAILY_CAP || '100', 10);
let dailyCount = 0;
let dailyResetAt = endOfToday();

function endOfToday() {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return d.getTime();
}

function checkDailyCap(req, res, next) {
    if (Date.now() > dailyResetAt) {
        dailyCount = 0;
        dailyResetAt = endOfToday();
    }
    if (dailyCount >= DAILY_CAP) {
        return res.status(429).json({ error: 'daily_cap' });
    }
    dailyCount++;
    next();
}

app.post('/api/ask', askLimiter, checkDailyCap, async (req, res) => {
    if (!client) {
        return res.status(503).json({ error: 'no_api_key' });
    }

    const { question, history } = req.body || {};
    const q = typeof question === 'string' ? question.trim() : '';

    // בונה את היסטוריית השיחה (זיכרון) + השאלה הנוכחית
    const messages = [];
    if (Array.isArray(history)) {
        for (const turn of history.slice(-12)) {
            if (turn && (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string') {
                messages.push({ role: turn.role, content: turn.content });
            }
        }
    }
    messages.push({ role: 'user', content: q || '(המשתמש לא כתב כלום — תגיב לשתיקה)' });

    try {
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 400,
            system: [
                { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }
            ],
            messages,
            output_config: {
                format: {
                    type: 'json_schema',
                    schema: {
                        type: 'object',
                        properties: {
                            text: { type: 'string' },
                            mood: { type: 'string', enum: MOODS }
                        },
                        required: ['text', 'mood'],
                        additionalProperties: false
                    }
                }
            }
        });

        const textBlock = response.content.find(b => b.type === 'text');
        const parsed = JSON.parse(textBlock.text);

        if (!MOODS.includes(parsed.mood)) parsed.mood = 'answering';
        res.json({ text: parsed.text, mood: parsed.mood });
    } catch (err) {
        console.error('Claude API error:', err?.message || err);
        const status = err?.status >= 400 && err?.status < 600 ? err.status : 500;
        res.status(status).json({ error: 'api_error', message: err?.message || 'unknown' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ ok: true, model: MODEL, hasKey: Boolean(client) });
});

app.listen(PORT, () => {
    console.log(`\n🎤  ביבי רץ על http://localhost:${PORT}`);
    console.log(`    מודל: ${MODEL}`);
    console.log(`    מפתח API: ${client ? '✅ מחובר' : '❌ חסר (מצב סטטי)'}\n`);
});
