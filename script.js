// CANVAS SETUP
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const textBox = document.getElementById("textBox");
const puzzleUI = document.getElementById("puzzleUI");
const finalButton = document.getElementById("finalButton");
const finalVideo = document.getElementById("finalVideo");
const closeVideoButton = document.getElementById("closeVideoButton");
const hud = document.getElementById("hud");
const chapterBadge = document.getElementById("chapterBadge");
const progressBadge = document.getElementById("progressBadge");
const gateBadge = document.getElementById("gateBadge");
const startupGate = document.getElementById("startupGate");
const startupPasswordInput = document.getElementById("startupPasswordInput");
const startupUnlockButton = document.getElementById("startupUnlockButton");
const startupFeedback = document.getElementById("startupFeedback");
const foxSpeedDown = document.getElementById("foxSpeedDown");
const foxSpeedUp = document.getElementById("foxSpeedUp");
const foxSpeedValue = document.getElementById("foxSpeedValue");
const storySpeedDown = document.getElementById("storySpeedDown");
const storySpeedUp = document.getElementById("storySpeedUp");
const storySpeedValue = document.getElementById("storySpeedValue");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const startButton = document.getElementById("startButton");
const welcomeScreen = document.getElementById("welcomeScreen");
const STARTUP_PASSWORD = "dcmsk_2026";

function unlockStartupGate() {
    document.body.classList.remove("startupLocked");
    document.body.classList.add("startupUnlocked");
    startupGate.classList.add("hidden");
    startupFeedback.innerText = "";
    startupPasswordInput.value = "";
    startupPasswordInput.blur();
    startButton.focus();
}

function submitStartupPassword() {
    const enteredPassword = startupPasswordInput.value.trim();

    if (enteredPassword === STARTUP_PASSWORD) {
        unlockStartupGate();
        return;
    }

    startupFeedback.innerText = "wrong password";
    startupPasswordInput.value = "";
    startupPasswordInput.focus();
}

if (startupUnlockButton && startupPasswordInput) {
    startupUnlockButton.addEventListener("click", submitStartupPassword);
    startupPasswordInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            submitStartupPassword();
        }
    });
    startupPasswordInput.focus();
}
// 🌍 WORLD SETTINGS
const worldWidth = 10000; // world is bigger than screen
startButton.addEventListener("click", () => {
    welcomeScreen.style.display = "none";
    hud.classList.remove("hidden");
    updateHud();
});
const foxImage = new Image();

foxImage.src = "assets/images/fox.png";
// 🎥 CAMERA
let cameraX = 0;
let storyIndex = 0;
let isShowingText = false;
let activeStoryIndex = -1;
let activeChapterIndex = -1;
// 🌫️ mood control
let mood = "neutral";
const gates = [
    "next gate: song timestamp",
    "next gate: heart collector",
    "next gate: platform jump",
    "next gate: emoji count",
    "next gate: sequence puzzle",
    "next gate: obstacle run",
    "next gate: final reveal"
];
let gatePointer = 0;
let songGateActive = false;
let songGateSolved = false;
let songGateAttempts = 0;
let songGateLockedUntil = 0;
let heartGateActive = false;
let heartGateSolved = false;
let heartTimerId = null;
let heartMoveTimerId = null;
let platformGateActive = false;
let platformGateSolved = false;
let platformTimerId = null;
let platformKeyHandler = null;
let platformBeatTimerId = null;
let emojiGateActive = false;
let emojiGateSolved = false;
let sequenceGateActive = false;
let sequenceGateSolved = false;
let sequenceTimerId = null;
let currentSequencePattern = [];
let obstacleGateActive = false;
let obstacleGateSolved = false;
let obstacleTimerId = null;
let obstacleTickId = null;
let obstacleKeyHandler = null;
let physicalLocksActive = false;
let physicalLocksSolved = false;
let physicalLockIndex = 0;
let finalRevealUnlocked = false;
let endGiftPromptShown = false;
let lives = 3;
let score = 0;
let checkpointX = 100;
let checkpointReachedIndex = -1;
let damageCooldownFrames = 0;
let gameOverActive = false;

// Replace these placeholders with your real answers before gifting.
const SONG_TIMESTAMP_ANSWER = "0:15";
// Gate 1 should appear right after Chapter 3 ends (around x:1500).
const SONG_GATE_TRIGGER_X = 1580;
const SONG_MAX_ATTEMPTS = 4;
const SONG_LOCK_SECONDS = 10;
const HEART_GATE_TRIGGER_X = 2620;
const HEARTS_REQUIRED = 6;
const HEART_TIME_LIMIT = 15;
const HEART_TOTAL_ITEMS = 13;
const HEART_DECOY_COUNT = 4;
const PLATFORM_GATE_TRIGGER_X = 4560;
const PLATFORM_STEPS_REQUIRED = 5;
const PLATFORM_TIME_LIMIT = 28;
const EMOJI_GATE_TRIGGER_X = 5480;
const EMOJI_QUESTION_SYMBOL = "🫶";
const EMOJI_ANSWER = "3";
const SEQUENCE_GATE_TRIGGER_X = 6460;
const SEQUENCE_TIME_LIMIT = 12;
const SEQUENCE_OPTIONS = ["up", "left", "right"];
const SEQUENCE_LENGTH = 5;
const OBSTACLE_GATE_TRIGGER_X = 7420;
const OBSTACLE_TIME_LIMIT = 22;
const OBSTACLE_TARGET = 180;
const FINAL_REVEAL_TRIGGER_X = 9020;
const FOX_SPEED_MIN = 1.2;
const FOX_SPEED_MAX = 6.0;
const FOX_SPEED_STEP = 0.2;
const STORY_SPEED_MIN = 0.6;
const STORY_SPEED_MAX = 1.8;
const STORY_SPEED_STEP = 0.1;
const BASE_ACCELERATION_RATIO = 0.06;
// Spread the clue prompts across the route so they land during the story, not only at the ending.
const PHYSICAL_LOCK_ZONES = [
    { min: 900, max: 1500 },
    { min: 2600, max: 3400 },
    { min: 4700, max: 5900 },
    { min: 7600, max: 8600 }
];
const PHYSICAL_LOCKS = [
    {
        id: "sunflowerMemory",
        label: "sunflower memory",
        question: "which flower have i always compared you with?",
        type: "text",
        answer: "sunflower",
        placeholder: "flower name"
    },
    {
        id: "chocolateBrand",
        label: "chocolate brand",
        question: "remember the brand of chocolate you bought me for Valentine's?",
        type: "text",
        answer: "Amul",
        placeholder: "brand name"
    },
    {
        id: "petalCount",
        label: "petal count",
        question: "how many petals are there in the diary?",
        type: "number",
        answer: "9",
        min: 0,
        max: 30,
        step: 1,
        initial: 0
    },
    {
        id: "letterNumber",
        label: "letter number",
        question: "which letter number did i ask you to remember?",
        type: "number",
        answer: "7",
        min: 1,
        max: 26,
        step: 1,
        initial: 1
    }
].map((lock, index) => ({
    ...lock,
    triggerX: Math.floor(Math.random() * (PHYSICAL_LOCK_ZONES[index].max - PHYSICAL_LOCK_ZONES[index].min + 1)) + PHYSICAL_LOCK_ZONES[index].min
}));
const checkpoints = [
    { x: 1000, label: "checkpoint 1" },
    { x: 1800, label: "checkpoint 2" },
    { x: 2900, label: "checkpoint 3" },
    { x: 4700, label: "checkpoint 4" },
    { x: 6200, label: "checkpoint 5" },
    { x: 7800, label: "checkpoint 6" }
];
const hazards = [
    { x: 1120, width: 22 },
    { x: 2080, width: 24 },
    { x: 3380, width: 23 },
    { x: 5120, width: 24 },
    { x: 6880, width: 26 },
    { x: 8120, width: 22 }
];

function closePuzzleOverlay() {
    puzzleUI.classList.add("hidden");
    puzzleUI.innerHTML = "";
}

function clearMovementInput() {
    keys.ArrowRight = false;
    keys.ArrowLeft = false;
    keys.ArrowUp = false;
    fox.dx = 0;
}

let foxSpeedSetting = 2.5;
let storySpeedSetting = 1.0;

function formatSpeedValue(value) {
    return value.toFixed(1);
}

function getStoryTriggerX(baseX) {
    if (storySpeedSetting >= 1) {
        return baseX / storySpeedSetting;
    }

    const slowRatio = (1 - storySpeedSetting) / (1 - STORY_SPEED_MIN);
    return baseX + (worldWidth - baseX) * slowRatio;
}

function applyFoxSpeedSetting() {
    fox.speed = foxSpeedSetting;
    fox.acceleration = BASE_ACCELERATION_RATIO * foxSpeedSetting;
}

function updateSpeedControlLabels() {
    if (foxSpeedValue) {
        foxSpeedValue.innerText = formatSpeedValue(foxSpeedSetting);
    }

    if (storySpeedValue) {
        storySpeedValue.innerText = `${formatSpeedValue(storySpeedSetting)}x`;
    }
}

function initSpeedControls() {
    applyFoxSpeedSetting();
    updateSpeedControlLabels();

    if (foxSpeedDown) {
        foxSpeedDown.addEventListener("click", () => {
            foxSpeedSetting = Math.max(FOX_SPEED_MIN, foxSpeedSetting - FOX_SPEED_STEP);
            applyFoxSpeedSetting();
            updateSpeedControlLabels();
        });
    }

    if (foxSpeedUp) {
        foxSpeedUp.addEventListener("click", () => {
            foxSpeedSetting = Math.min(FOX_SPEED_MAX, foxSpeedSetting + FOX_SPEED_STEP);
            applyFoxSpeedSetting();
            updateSpeedControlLabels();
        });
    }

    if (storySpeedDown) {
        storySpeedDown.addEventListener("click", () => {
            storySpeedSetting = Math.max(STORY_SPEED_MIN, storySpeedSetting - STORY_SPEED_STEP);
            updateSpeedControlLabels();
        });
    }

    if (storySpeedUp) {
        storySpeedUp.addEventListener("click", () => {
            storySpeedSetting = Math.min(STORY_SPEED_MAX, storySpeedSetting + STORY_SPEED_STEP);
            updateSpeedControlLabels();
        });
    }
}

const story = [

{ x: 200, text: "at first… you were just there" },
{ x: 350, text: "not close… not far" },
{ x: 500, text: "just… there" },

{ x: 700, text: "not because you weren’t enough" },
{ x: 850, text: "but because you felt out of reach" },
{ x: 1000, text: "like someone i wasn’t meant to have" },

{ x: 1200, text: "i thought you didn’t care" },
{ x: 1350, text: "i thought i was just… convenient" },
{ x: 1500, text: "someone you chose because i was there" },

{ x: 1700, text: "i almost walked away" },
{ x: 1850, text: "more than once" },
{ x: 2000, text: "i really thought…" },
{ x: 2150, text: "this wouldn’t last" },

{ x: 2400, text: "and then…" },
{ x: 2550, text: "one day…" },
{ x: 2700, text: "you cried when I cried" },

{ x: 3000, text: "and everything changed" },

{ x: 3200, text: "you weren’t distant" },
{ x: 3350, text: "you were just quiet" },
{ x: 3500, text: "you weren’t indifferent" },
{ x: 3650, text: "you just loved differently" },

{ x: 3900, text: "i didn’t fall all at once" },
{ x: 4050, text: "i fell slowly" },
{ x: 4200, text: "in conversations" },
{ x: 4350, text: "in silences" },
{ x: 4500, text: "in the way you listened" },

{ x: 4700, text: "the way you nod" },
{ x: 4850, text: "and say ‘mm hmm’" },
{ x: 5000, text: "like every word matters" },

{ x: 5200, text: "the way you stay" },
{ x: 5350, text: "without overwhelming me" },

{ x: 5600, text: "the way you care" },
{ x: 5750, text: "without asking for anything back" },

{ x: 6000, text: "every call" },
{ x: 6150, text: "every text" },
{ x: 6300, text: "every little moment" },

{ x: 6550, text: "i kept falling" },
{ x: 6700, text: "again and again" },

{ x: 6900, text: "and i still am" },

{ x: 7200, text: "it’s strange" },
{ x: 7350, text: "how far you are" },

{ x: 7600, text: "and yet…" },
{ x: 7750, text: "how close you feel" },

{ x: 8000, text: "i don’t need you" },
{ x: 8150, text: "to be complete" },

{ x: 8400, text: "but with you…" },
{ x: 8550, text: "everything feels fuller" },

{ x: 8800, text: "there’s something i realized" },
{ x: 8950, text: "something i need to tell you..." },

{ x: 9200, text: "a piece of me with you forever-" }

];

const chapters = [
    { title: "chapter 1: beginning", start: 0, end: 2 },
    { title: "chapter 2: distance", start: 3, end: 5 },
    { title: "chapter 3: doubt", start: 6, end: 8 },
    { title: "chapter 4: almost gone", start: 9, end: 11 },
    { title: "chapter 5: turning point", start: 12, end: 14 },
    { title: "chapter 6: changed", start: 15, end: 17 },
    { title: "chapter 7: understanding", start: 18, end: 20 },
    { title: "chapter 8: falling", start: 21, end: 23 },
    { title: "chapter 9: details", start: 24, end: 26 },
    { title: "chapter 10: presence", start: 27, end: 29 },
    { title: "chapter 11: care", start: 30, end: 32 },
    { title: "chapter 12: moments", start: 33, end: 35 },
    { title: "chapter 13: still falling", start: 36, end: 38 },
    { title: "chapter 14: far yet close", start: 39, end: 41 },
    { title: "chapter 15: fuller", start: 42, end: 44 }
];

function findChapterIndex(storyEntryIndex) {
    if (storyEntryIndex < 0) return -1;

    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        if (storyEntryIndex >= chapter.start && storyEntryIndex <= chapter.end) {
            return i;
        }
    }

    return chapters.length - 1;
}

function updateHud() {
    const currentChapter = activeChapterIndex >= 0 ? chapters[activeChapterIndex].title : "chapter: prologue";
    chapterBadge.innerText = currentChapter;

    const currentProgress = activeStoryIndex >= 0 ? activeStoryIndex + 1 : 0;
    progressBadge.innerText = `story: ${currentProgress} / ${story.length} | lives: ${lives} | score: ${score}`;

    if (finalRevealUnlocked) {
        gateBadge.innerText = "ending unlocked";
        return;
    }

    const gateText = gates[Math.min(gatePointer, gates.length - 1)] || "next gate: final reveal";
    gateBadge.innerText = gateText;
}

function unlockFinalReveal() {
    if (finalRevealUnlocked) return;

    if (!physicalLocksSolved) {
        openPhysicalLocks();
        return;
    }

    finalRevealUnlocked = true;
    finalButton.classList.add("hidden");
    gatePointer = 6;
    checkpointX = Math.max(checkpointX, 9100);
    textBox.innerText = "almost there... walk to the very end";
    textBox.classList.remove("hidden");
    textBox.classList.add("show");

    updateHud();
}

function showEndGiftPrompt() {
    if (endGiftPromptShown) return;

    endGiftPromptShown = true;
    clearMovementInput();

    puzzleUI.innerHTML = `
        <div class="puzzleCard endGiftCard">
            <h3>you made it</h3>
            <p>tap below to open your tiny gift.</p>
            <button id="openGiftFromPopup" type="button">play tiny gift</button>
        </div>
    `;

    puzzleUI.classList.remove("hidden");

    function openFinalVideo() {
        finalVideo.preload = "auto";
        finalVideo.load();
        finalVideo.classList.remove("hidden");
        closeVideoButton.classList.remove("hidden");
        finalButton.classList.remove("hidden");
        finalButton.innerText = "replay";

        finalVideo.play().catch(() => {
            // Ignore autoplay restrictions; user can press play in controls.
        });
    }

    const openGiftFromPopup = document.getElementById("openGiftFromPopup");
    openGiftFromPopup.addEventListener("click", () => {
        puzzleUI.classList.add("hidden");
        puzzleUI.innerHTML = "";
        openFinalVideo();
    });
}

function initFinalRevealUI() {
    finalButton.addEventListener("click", () => {
        finalVideo.preload = "auto";
        finalVideo.load();
        finalVideo.classList.remove("hidden");
        closeVideoButton.classList.remove("hidden");
        finalButton.innerText = "replay";
        finalVideo.play().catch(() => {
            // Ignore autoplay restrictions; user can press play in controls.
        });
    });

    closeVideoButton.addEventListener("click", () => {
        finalVideo.pause();
        finalVideo.classList.add("hidden");
        closeVideoButton.classList.add("hidden");
    });
}

function openPhysicalLocks() {
    if (physicalLocksSolved) {
        unlockFinalReveal();
        return;
    }

    const currentLock = PHYSICAL_LOCKS[physicalLockIndex];
    if (!currentLock) {
        physicalLocksSolved = true;
        unlockFinalReveal();
        return;
    }

    physicalLocksActive = true;
    clearMovementInput();

    const isNumberLock = currentLock.type === "number";
    const isTimestampLock = currentLock.type === "timestamp";

    puzzleUI.innerHTML = `
        <div class="puzzleCard physicalCard">
            <h3>memory clue ${physicalLockIndex + 1} / ${PHYSICAL_LOCKS.length}</h3>
            <p>${currentLock.question || "type the clue you found along the path to keep moving."}</p>
            ${currentLock.promptSymbol ? `<div class="emojiPrompt">${currentLock.promptSymbol}</div>` : ""}
            <label class="physicalLabel">answer
                ${isNumberLock ? `
                    <div class="physicalStepper">
                        <button id="physicalDown" type="button" class="physicalAdjustBtn">-</button>
                        <input id="physicalInput" type="number" min="${currentLock.min ?? 0}" max="${currentLock.max ?? 99}" step="${currentLock.step ?? 1}" value="${currentLock.initial ?? 0}" autocomplete="off" />
                        <button id="physicalUp" type="button" class="physicalAdjustBtn">+</button>
                    </div>
                ` : `
                    <input id="physicalInput" type="text" placeholder="${isTimestampLock ? (currentLock.placeholder || "mm:ss") : (currentLock.placeholder || "answer")}" autocomplete="off" />
                `}
            </label>
            <button id="physicalSubmit" type="button">submit clue</button>
            <button id="physicalSkip" type="button" class="puzzleSkipBtn">skip clue</button>
            <div id="physicalFeedback" class="puzzleFeedback"></div>
        </div>
    `;

    puzzleUI.classList.remove("hidden");
    gateBadge.innerText = `memory clue ${physicalLockIndex + 1}: waiting`;

    const physicalSubmit = document.getElementById("physicalSubmit");
    const physicalSkip = document.getElementById("physicalSkip");
    const physicalFeedback = document.getElementById("physicalFeedback");
    const physicalInput = document.getElementById("physicalInput");
    const physicalDown = document.getElementById("physicalDown");
    const physicalUp = document.getElementById("physicalUp");

    function normalizePhysicalValue(value) {
        if (currentLock.id === "songTimestampPhysical") return normalizeTimestamp(String(value));
        if (currentLock.type === "number") {
            const parsed = Number.parseInt(String(value).trim(), 10);
            return Number.isNaN(parsed) ? "" : String(parsed);
        }
        return String(value).trim().toLowerCase();
    }

    if (isNumberLock && physicalInput) {
        const min = Number.isFinite(currentLock.min) ? currentLock.min : 0;
        const max = Number.isFinite(currentLock.max) ? currentLock.max : 99;
        const step = Number.isFinite(currentLock.step) ? currentLock.step : 1;

        function applyStep(delta) {
            const current = Number.parseInt(String(physicalInput.value).trim(), 10);
            const safeCurrent = Number.isNaN(current) ? min : current;
            const next = Math.max(min, Math.min(max, safeCurrent + delta));
            physicalInput.value = String(next);
        }

        if (physicalDown) {
            physicalDown.addEventListener("click", () => applyStep(-step));
        }

        if (physicalUp) {
            physicalUp.addEventListener("click", () => applyStep(step));
        }
    }

    function submitPhysicalLocks() {
        if (!isAnswerConfigured(currentLock.answer)) {
            physicalFeedback.innerText = "this clue answer is not configured yet in script.js";
            return;
        }

        const entered = normalizePhysicalValue(physicalInput.value);

        const expectedAnswer = currentLock.type === "number"
            ? String(currentLock.answer).trim()
            : String(currentLock.answer).trim().toLowerCase();

        if (entered !== expectedAnswer) {
            physicalFeedback.innerText = "not quite... check the clue again";
            return;
        }

        physicalLockIndex += 1;
        physicalLocksSolved = physicalLockIndex >= PHYSICAL_LOCKS.length;
        physicalLocksActive = false;
        closePuzzleOverlay();
        clearMovementInput();
        textBox.innerText = physicalLocksSolved ? "all clues solved... final gift ready" : "clue solved... keep going";
        textBox.classList.remove("hidden");
        textBox.classList.add("show");
        updateHud();

        if (physicalLocksSolved) {
            unlockFinalReveal();
        }
    }

    physicalSubmit.addEventListener("click", submitPhysicalLocks);
    physicalSkip.addEventListener("click", () => {
        physicalLockIndex += 1;
        physicalLocksSolved = physicalLockIndex >= PHYSICAL_LOCKS.length;
        physicalLocksActive = false;
        closePuzzleOverlay();
        clearMovementInput();
        textBox.innerText = physicalLocksSolved ? "all clues skipped... final gift ready" : "clue skipped... continue";
        textBox.classList.remove("hidden");
        textBox.classList.add("show");
        updateHud();

        if (physicalLocksSolved) {
            unlockFinalReveal();
        }
    });

    physicalInput.focus();
}

function triggerGameOver() {
    gameOverActive = true;
    fox.dx = 0;

    puzzleUI.innerHTML = `
        <div class="puzzleCard">
            <h3>you lost all lives</h3>
            <p>start again from your latest checkpoint with full hearts.</p>
            <button id="gameOverContinue" type="button">continue</button>
        </div>
    `;

    puzzleUI.classList.remove("hidden");

    document.getElementById("gameOverContinue").addEventListener("click", () => {
        lives = 3;
        score = Math.max(0, score - 120);
        fox.x = checkpointX;
        fox.y = canvas.height - 50 - fox.height;
        fox.dy = 0;
        fox.dx = 0;
        gameOverActive = false;
        puzzleUI.classList.add("hidden");
        puzzleUI.innerHTML = "";
        textBox.innerText = "you are back at your checkpoint... keep going";
        textBox.classList.remove("hidden");
        textBox.classList.add("show");
        updateHud();
    });
}

function applyHazardHit() {
    if (damageCooldownFrames > 0 || gameOverActive) return;

    lives -= 1;
    score = Math.max(0, score - 60);
    damageCooldownFrames = 110;

    if (lives <= 0) {
        updateHud();
        triggerGameOver();
        return;
    }

    fox.x = checkpointX;
    fox.y = canvas.height - 50 - fox.height;
    fox.dy = 0;
    fox.dx = 0;
    textBox.innerText = "ouch... jump over hazards";
    textBox.classList.remove("hidden");
    textBox.classList.add("show");
    updateHud();
}

function updateCheckpoints() {
    for (let i = 0; i < checkpoints.length; i++) {
        if (i <= checkpointReachedIndex) continue;
        if (fox.x >= checkpoints[i].x) {
            checkpointReachedIndex = i;
            checkpointX = checkpoints[i].x;
            score += 40;
            textBox.innerText = `${checkpoints[i].label} reached`;
            textBox.classList.remove("hidden");
            textBox.classList.add("show");
            updateHud();
        }
    }
}

function checkHazardCollision() {
    const onGround = fox.grounded;
    if (!onGround) return;

    const safeMargin = 8;
    const foxLeft = fox.x + safeMargin;
    const foxRight = fox.x + fox.width - safeMargin;

    for (let i = 0; i < hazards.length; i++) {
        const hazard = hazards[i];
        const hazardLeft = hazard.x + safeMargin;
        const hazardRight = hazard.x + hazard.width - safeMargin;
        const overlaps = foxRight > hazardLeft && foxLeft < hazardRight;
        if (overlaps) {
            applyHazardHit();
            return;
        }
    }
}

function normalizeTimestamp(value) {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const parts = trimmed.split(":");
    if (parts.length !== 2) return trimmed;

    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);

    if (Number.isNaN(minutes) || Number.isNaN(seconds)) return trimmed;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function isAnswerConfigured(value) {
    const normalized = String(value || "").trim();
    return normalized !== "" && !normalized.startsWith("CHANGE_ME_");
}

function lockForSongGate() {
    songGateActive = true;
    clearMovementInput();

    puzzleUI.innerHTML = `
        <div class="puzzleCard">
            <h3>Unlock Gate</h3>
            <p>
                Enter the timestamp when our lyrics begin in the official music video of our song
            </p>
            <input id="songTimestampInput" type="text" placeholder="mm:ss" autocomplete="off" />
            <button id="songTimestampSubmit" type="button">Unlock Path</button>
            <button id="songTimestampSkip" type="button" class="puzzleSkipBtn">...</button>
            <div id="songTimestampFeedback" class="puzzleFeedback"></div>
        </div>
    `;

    puzzleUI.classList.remove("hidden");

    const input = document.getElementById("songTimestampInput");
    const submit = document.getElementById("songTimestampSubmit");
    const skip = document.getElementById("songTimestampSkip");
    const feedback = document.getElementById("songTimestampFeedback");
    const expected = normalizeTimestamp(SONG_TIMESTAMP_ANSWER);

    function getHint() {
        if (songGateAttempts < 2) return "that is not it yet ... try again";
        if (songGateAttempts < 3) return "hint : It starts in the early part of the song";
        return "hint: use exact mm:ss format from the official video";
    }

    function submitAnswer() {
        if (Date.now() < songGateLockedUntil) {
            const wait = Math.ceil((songGateLockedUntil - Date.now()) / 1000);
            feedback.innerText = `locked for ${wait}s after too many attempts`;
            return;
        }

        if (!isAnswerConfigured(SONG_TIMESTAMP_ANSWER)) {
            feedback.innerText = "song gate answer is not configured yet in script.js";
            return;
        }

        const entered = normalizeTimestamp(input.value);
        if (entered === expected) {
            songGateSolved = true;
            songGateActive = false;
            songGateAttempts = 0;
            songGateLockedUntil = 0;
            gatePointer = 1;
            score += 120;
            checkpointX = Math.max(checkpointX, 1660);
            closePuzzleOverlay();
            clearMovementInput();
            textBox.innerText = "path unlocked... keep walking";
            textBox.classList.remove("hidden");
            textBox.classList.add("show");
            updateHud();
            return;
        }

        songGateAttempts += 1;

        if (songGateAttempts >= SONG_MAX_ATTEMPTS) {
            songGateLockedUntil = Date.now() + SONG_LOCK_SECONDS * 1000;
            input.disabled = true;
            submit.disabled = true;
            feedback.innerText = `too many attempts... wait ${SONG_LOCK_SECONDS}s`;

            setTimeout(() => {
                input.disabled = false;
                submit.disabled = false;
                input.focus();
                feedback.innerText = "try again";
            }, SONG_LOCK_SECONDS * 1000);

            return;
        }

        feedback.innerText = getHint();
    }

    submit.addEventListener("click", submitAnswer);
    skip.addEventListener("click", () => {
        songGateSolved = true;
        songGateActive = false;
        songGateAttempts = 0;
        songGateLockedUntil = 0;
        gatePointer = 1;
        checkpointX = Math.max(checkpointX, 1660);
        closePuzzleOverlay();
        clearMovementInput();
        textBox.innerText = "puzzle skipped... keep walking";
        textBox.classList.remove("hidden");
        textBox.classList.add("show");
        updateHud();
    });
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") submitAnswer();
    });

    gateBadge.innerText = "song gate: locked";
    input.focus();
}

function clearHeartTimer() {
    if (heartTimerId) {
        clearInterval(heartTimerId);
        heartTimerId = null;
    }

    if (heartMoveTimerId) {
        clearInterval(heartMoveTimerId);
        heartMoveTimerId = null;
    }
}

function lockForHeartGate() {
    heartGateActive = true;
    clearMovementInput();

    puzzleUI.innerHTML = `
        <div class="puzzleCard">
            <h3>heart collector</h3>
            <p>collect ${HEARTS_REQUIRED} hearts in ${HEART_TIME_LIMIT} seconds to unlock the path.</p>
            <div class="heartStats">
                <span id="heartCollected">0 / ${HEARTS_REQUIRED}</span>
                <span id="heartTimer">${HEART_TIME_LIMIT}s</span>
            </div>
            <div id="heartField" class="heartField"></div>
            <div>
                <button id="heartSkip" type="button" class="puzzleSkipBtn">skip puzzle</button>
            </div>
            <div id="heartFeedback" class="puzzleFeedback"></div>
            <button id="heartRetry" type="button" class="hidden">try again</button>
        </div>
    `;

    puzzleUI.classList.remove("hidden");
    gateBadge.innerText = "heart collector: locked";

    const heartCollected = document.getElementById("heartCollected");
    const heartTimer = document.getElementById("heartTimer");
    const heartField = document.getElementById("heartField");
    const heartSkip = document.getElementById("heartSkip");
    const heartFeedback = document.getElementById("heartFeedback");
    const heartRetry = document.getElementById("heartRetry");

    heartSkip.addEventListener("click", () => {
        clearHeartTimer();
        heartGateSolved = true;
        heartGateActive = false;
        gatePointer = 2;
        checkpointX = Math.max(checkpointX, 2720);
        closePuzzleOverlay();
        clearMovementInput();
        textBox.innerText = "puzzle skipped... keep going";
        textBox.classList.remove("hidden");
        textBox.classList.add("show");
        updateHud();
    });

    function runRound() {
        clearHeartTimer();
        heartField.innerHTML = "";
        heartFeedback.innerText = "";
        heartRetry.classList.add("hidden");

        let collected = 0;
        let timeLeft = HEART_TIME_LIMIT;

        heartCollected.innerText = `${collected} / ${HEARTS_REQUIRED}`;
        heartTimer.innerText = `${timeLeft}s`;

        const decoyIndexes = new Set();
        while (decoyIndexes.size < HEART_DECOY_COUNT) {
            decoyIndexes.add(Math.floor(Math.random() * HEART_TOTAL_ITEMS));
        }

        for (let i = 0; i < HEART_TOTAL_ITEMS; i++) {
            const heart = document.createElement("button");
            heart.type = "button";
            const isDecoy = decoyIndexes.has(i);
            heart.className = isDecoy ? "heartItem decoy" : "heartItem";
            heart.innerText = isDecoy ? "🖤" : "❤";
            heart.style.left = `${Math.random() * 84 + 4}%`;
            heart.style.top = `${Math.random() * 74 + 8}%`;
            heart.style.padding = "0";
            heart.style.margin = "0";
            heart.style.zIndex = "2";
            heart.style.pointerEvents = "auto";
            heart.style.appearance = "none";
            heart.style.webkitAppearance = "none";
            heart.dataset.decoy = String(isDecoy);

            heart.addEventListener("pointerenter", () => {
                heart.classList.add("hovering");
            });

            heart.addEventListener("pointerleave", () => {
                heart.classList.remove("hovering");
            });

            heart.addEventListener("pointerdown", (event) => {
                event.preventDefault();

                if (heart.classList.contains("caught")) return;
                heart.classList.add("caught");
                heart.style.pointerEvents = "none";
                heart.style.opacity = "0.35";

                if (heart.dataset.decoy === "true") {
                    heartFeedback.innerText = "that one was a decoy... keep going";
                } else {
                    collected += 1;
                    score += 5;
                }

                heartCollected.innerText = `${collected} / ${HEARTS_REQUIRED}`;
                heartTimer.innerText = `${timeLeft}s`;

                if (collected >= HEARTS_REQUIRED) {
                    clearHeartTimer();
                    heartGateSolved = true;
                    heartGateActive = false;
                    gatePointer = 2;
                    score += 180;
                    checkpointX = Math.max(checkpointX, 2720);
                    closePuzzleOverlay();
                    clearMovementInput();
                    textBox.innerText = "you gathered enough hearts... keep going";
                    textBox.classList.remove("hidden");
                    textBox.classList.add("show");
                    updateHud();
                }
            });

            heartField.appendChild(heart);
        }

        heartMoveTimerId = setInterval(() => {
            heartField.querySelectorAll(".heartItem:not(.caught):not(.hovering)").forEach((item) => {
                const nextLeft = Math.random() * 84 + 4;
                const nextTop = Math.random() * 74 + 8;
                item.style.left = `${nextLeft}%`;
                item.style.top = `${nextTop}%`;
            });
        }, 2000);

        heartTimerId = setInterval(() => {
            timeLeft -= 1;
            heartTimer.innerText = `${timeLeft}s`;

            if (timeLeft <= 0) {
                clearHeartTimer();
                heartFeedback.innerText = "time slipped away... try again";
                heartRetry.classList.remove("hidden");
                heartField.querySelectorAll(".heartItem").forEach((item) => {
                    item.style.pointerEvents = "none";
                    item.style.opacity = "0.25";
                });
            }
        }, 1000);
    }

    heartRetry.addEventListener("click", runRound);
    runRound();
}

function clearPlatformRound() {
    if (platformTimerId) {
        clearInterval(platformTimerId);
        platformTimerId = null;
    }

    if (platformBeatTimerId) {
        clearInterval(platformBeatTimerId);
        platformBeatTimerId = null;
    }

    if (platformKeyHandler) {
        document.removeEventListener("keydown", platformKeyHandler);
        platformKeyHandler = null;
    }
}

function lockForPlatformGate() {
    platformGateActive = true;
    clearMovementInput();

    puzzleUI.innerHTML = `
        <div class="puzzleCard">
            <h3>platform jump</h3>
            <p>press arrow up or space when the pink marker is inside the green bar.</p>
            <div class="platformStats">
                <span id="platformProgress">0 / ${PLATFORM_STEPS_REQUIRED}</span>
                <span id="platformTimer">${PLATFORM_TIME_LIMIT}s</span>
            </div>
            <p class="platformInstruction">wait for the pink marker to overlap the green zone, then press jump.</p>
            <div class="timingMeter">
                <span id="timingMarker" class="timingMarker"></span>
            </div>
            <div>
                <button id="platformSkip" type="button" class="puzzleSkipBtn">skip puzzle</button>
            </div>
            <div id="platformTrack" class="platformTrack"></div>
            <div id="platformFeedback" class="puzzleFeedback"></div>
            <button id="platformRetry" type="button" class="hidden">try again</button>
        </div>
    `;

    puzzleUI.classList.remove("hidden");
    gateBadge.innerText = "platform jump: locked";

    const platformProgress = document.getElementById("platformProgress");
    const platformTimer = document.getElementById("platformTimer");
    const platformTrack = document.getElementById("platformTrack");
    const platformSkip = document.getElementById("platformSkip");
    const platformFeedback = document.getElementById("platformFeedback");
    const platformRetry = document.getElementById("platformRetry");
    const timingMarker = document.getElementById("timingMarker");

    platformSkip.addEventListener("click", () => {
        clearPlatformRound();
        platformGateSolved = true;
        platformGateActive = false;
        gatePointer = 3;
        checkpointX = Math.max(checkpointX, 4680);
        closePuzzleOverlay();
        clearMovementInput();
        textBox.innerText = "puzzle skipped... the path opens";
        textBox.classList.remove("hidden");
        textBox.classList.add("show");
        updateHud();
    });

    function renderSteps(step) {
        platformTrack.innerHTML = "";

        for (let i = 0; i < PLATFORM_STEPS_REQUIRED; i++) {
            const tile = document.createElement("span");
            tile.className = "platformStep";

            if (i < step) tile.classList.add("completed");
            else if (i === step) tile.classList.add("active");

            platformTrack.appendChild(tile);
        }
    }

    function runRound() {
        clearPlatformRound();
        platformFeedback.innerText = "";
        platformRetry.classList.add("hidden");

        let jumps = 0;
        let timeLeft = PLATFORM_TIME_LIMIT;
        let meter = 0;
        let meterDir = 1;
        let lastPress = 0;

        platformProgress.innerText = `${jumps} / ${PLATFORM_STEPS_REQUIRED}`;
        platformTimer.innerText = `${timeLeft}s`;
        renderSteps(jumps);

        platformBeatTimerId = setInterval(() => {
            meter += meterDir * 5;
            if (meter >= 100) {
                meter = 100;
                meterDir = -1;
            }
            if (meter <= 0) {
                meter = 0;
                meterDir = 1;
            }
            timingMarker.style.left = `${meter}%`;
        }, 30);

        platformKeyHandler = (event) => {
            if (event.key !== "ArrowUp" && event.key !== " " && event.code !== "Space" && event.key !== "Spacebar") return;

            event.preventDefault();

            const now = Date.now();
            if (now - lastPress < 120) return;
            lastPress = now;

            const inPerfectZone = meter >= 30 && meter <= 100;

            if (inPerfectZone) {
                jumps += 1;
                platformFeedback.innerText = "perfect jump";
                score += 8;
            } else {
                jumps = Math.max(0, jumps - 1);
                platformFeedback.innerText = `mistimed jump (meter at ${Math.round(meter)}%)... lost 1 step`;
            }

            platformProgress.innerText = `${jumps} / ${PLATFORM_STEPS_REQUIRED}`;
            renderSteps(jumps);

            if (jumps >= PLATFORM_STEPS_REQUIRED) {
                clearPlatformRound();
                platformGateSolved = true;
                platformGateActive = false;
                gatePointer = 3;
                score += 220;
                checkpointX = Math.max(checkpointX, 4680);
                closePuzzleOverlay();
                clearMovementInput();
                textBox.innerText = "clean jumps... the path opens";
                textBox.classList.remove("hidden");
                textBox.classList.add("show");
                updateHud();
            }
        };

        document.addEventListener("keydown", platformKeyHandler);

        platformTimerId = setInterval(() => {
            timeLeft -= 1;
            platformTimer.innerText = `${timeLeft}s`;

            if (timeLeft <= 0) {
                clearPlatformRound();
                platformFeedback.innerText = "you slipped before the last jump... try again";
                platformRetry.classList.remove("hidden");
            }
        }, 1000);
    }

    platformRetry.addEventListener("click", runRound);
    runRound();
}

function lockForEmojiGate() {
    emojiGateActive = true;
    clearMovementInput();

    puzzleUI.innerHTML = `
        <div class="puzzleCard">
            <h3>emoji gate</h3>
            <p>how many times would i send this emoji in one text?</p>
            <div class="emojiPrompt">${EMOJI_QUESTION_SYMBOL}</div>
            <input id="emojiInput" type="number" min="1" max="20" placeholder="enter number" autocomplete="off" />
            <button id="emojiSubmit" type="button">unlock path</button>
            <button id="emojiSkip" type="button" class="puzzleSkipBtn">skip puzzle</button>
            <div id="emojiFeedback" class="puzzleFeedback"></div>
        </div>
    `;

    puzzleUI.classList.remove("hidden");
    gateBadge.innerText = "emoji gate: locked";

    const emojiInput = document.getElementById("emojiInput");
    const emojiSubmit = document.getElementById("emojiSubmit");
    const emojiSkip = document.getElementById("emojiSkip");
    const emojiFeedback = document.getElementById("emojiFeedback");

    let attempts = 0;

    function submitAnswer() {
        if (!isAnswerConfigured(EMOJI_ANSWER)) {
            emojiFeedback.innerText = "emoji gate answer is not configured yet in script.js";
            return;
        }

        const entered = String(emojiInput.value).trim();

        if (entered === EMOJI_ANSWER) {
            emojiGateSolved = true;
            emojiGateActive = false;
            gatePointer = 4;
            score += 160;
            checkpointX = Math.max(checkpointX, 5560);
            closePuzzleOverlay();
            clearMovementInput();
            textBox.innerText = "you know me too well... path unlocked";
            textBox.classList.remove("hidden");
            textBox.classList.add("show");
            updateHud();
            return;
        }

        attempts += 1;
        if (attempts < 3) {
            emojiFeedback.innerText = "nope... think of my texting habit";
        } else {
            emojiFeedback.innerText = "hint : it is more than 1 and less than 5";
        }
    }

    emojiSubmit.addEventListener("click", submitAnswer);
    emojiSkip.addEventListener("click", () => {
        emojiGateSolved = true;
        emojiGateActive = false;
        gatePointer = 4;
        checkpointX = Math.max(checkpointX, 5560);
        closePuzzleOverlay();
        clearMovementInput();
        textBox.innerText = "puzzle skipped... path unlocked";
        textBox.classList.remove("hidden");
        textBox.classList.add("show");
        updateHud();
    });
    emojiInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") submitAnswer();
    });

    emojiInput.focus();
}

function clearSequenceRound() {
    if (sequenceTimerId) {
        clearInterval(sequenceTimerId);
        sequenceTimerId = null;
    }
}

function lockForSequenceGate() {
    sequenceGateActive = true;
    clearMovementInput();

    puzzleUI.innerHTML = `
        <div class="puzzleCard">
            <h3>sequence puzzle</h3>
            <p>repeat this sequence before time runs out.</p>
            <div class="sequenceRow" id="sequenceRow"></div>
            <div class="platformStats">
                <span id="sequenceProgress">0 / ${SEQUENCE_LENGTH}</span>
                <span id="sequenceTimer">${SEQUENCE_TIME_LIMIT}s</span>
            </div>
            <div class="sequenceInputRow">
                <button type="button" class="sequenceInputBtn" data-dir="up">↑</button>
                <button type="button" class="sequenceInputBtn" data-dir="left">←</button>
                <button type="button" class="sequenceInputBtn" data-dir="right">→</button>
            </div>
            <div>
                <button id="sequenceSkip" type="button" class="puzzleSkipBtn">skip puzzle</button>
            </div>
            <div id="sequenceFeedback" class="puzzleFeedback"></div>
            <button id="sequenceRetry" type="button" class="hidden">try again</button>
        </div>
    `;

    puzzleUI.classList.remove("hidden");
    gateBadge.innerText = "sequence gate: locked";

    const sequenceRow = document.getElementById("sequenceRow");
    const sequenceProgress = document.getElementById("sequenceProgress");
    const sequenceTimer = document.getElementById("sequenceTimer");
    const sequenceSkip = document.getElementById("sequenceSkip");
    const sequenceFeedback = document.getElementById("sequenceFeedback");
    const sequenceRetry = document.getElementById("sequenceRetry");
    const inputButtons = Array.from(document.querySelectorAll(".sequenceInputBtn"));

    sequenceSkip.addEventListener("click", () => {
        clearSequenceRound();
        sequenceGateSolved = true;
        sequenceGateActive = false;
        gatePointer = 5;
        checkpointX = Math.max(checkpointX, 6540);
        closePuzzleOverlay();
        clearMovementInput();
        textBox.innerText = "puzzle skipped... sequence cleared";
        textBox.classList.remove("hidden");
        textBox.classList.add("show");
        updateHud();
    });

    function dirSymbol(dir) {
        if (dir === "up") return "↑";
        if (dir === "left") return "←";
        return "→";
    }

    function renderSequence(currentIndex) {
        sequenceRow.innerHTML = "";

        currentSequencePattern.forEach((dir, idx) => {
            const bubble = document.createElement("span");
            bubble.className = "sequenceBubble";
            bubble.innerText = dirSymbol(dir);
            if (idx < currentIndex) bubble.classList.add("done");
            sequenceRow.appendChild(bubble);
        });
    }

    function runRound() {
        clearSequenceRound();
        sequenceRetry.classList.add("hidden");
        sequenceFeedback.innerText = "";

        const nextPattern = [];
        for (let i = 0; i < SEQUENCE_LENGTH; i++) {
            let nextChoice = SEQUENCE_OPTIONS[Math.floor(Math.random() * SEQUENCE_OPTIONS.length)];

            while (i > 0 && nextChoice === nextPattern[i - 1]) {
                nextChoice = SEQUENCE_OPTIONS[Math.floor(Math.random() * SEQUENCE_OPTIONS.length)];
            }

            nextPattern.push(nextChoice);
        }

        currentSequencePattern = nextPattern;

        let progress = 0;
        let timeLeft = SEQUENCE_TIME_LIMIT;

        renderSequence(progress);
        sequenceProgress.innerText = `${progress} / ${currentSequencePattern.length}`;
        sequenceTimer.innerText = `${timeLeft}s`;

        inputButtons.forEach((button) => {
            button.disabled = false;
            button.onclick = () => {
                const choice = button.dataset.dir;
                const expected = currentSequencePattern[progress];

                if (choice === expected) {
                    progress += 1;
                    score += 6;
                    sequenceProgress.innerText = `${progress} / ${currentSequencePattern.length}`;
                    renderSequence(progress);
                    sequenceFeedback.innerText = "good";

                    if (progress >= currentSequencePattern.length) {
                        clearSequenceRound();
                        sequenceGateSolved = true;
                        sequenceGateActive = false;
                        gatePointer = 5;
                        score += 200;
                        checkpointX = Math.max(checkpointX, 6540);
                        closePuzzleOverlay();
                        clearMovementInput();
                        textBox.innerText = "sequence complete... the path is yours";
                        textBox.classList.remove("hidden");
                        textBox.classList.add("show");
                        updateHud();
                    }
                } else {
                    progress = 0;
                    sequenceProgress.innerText = `${progress} / ${currentSequencePattern.length}`;
                    renderSequence(progress);
                    sequenceFeedback.innerText = "wrong order... sequence reset";
                }
            };
        });

        sequenceTimerId = setInterval(() => {
            timeLeft -= 1;
            sequenceTimer.innerText = `${timeLeft}s`;

            if (timeLeft <= 0) {
                clearSequenceRound();
                inputButtons.forEach((button) => {
                    button.disabled = true;
                });
                sequenceFeedback.innerText = "time is up... try again";
                sequenceRetry.classList.remove("hidden");
            }
        }, 1000);
    }

    sequenceRetry.addEventListener("click", runRound);
    runRound();
}

function clearObstacleRound() {
    if (obstacleTimerId) {
        clearInterval(obstacleTimerId);
        obstacleTimerId = null;
    }

    if (obstacleTickId) {
        clearInterval(obstacleTickId);
        obstacleTickId = null;
    }

    if (obstacleKeyHandler) {
        document.removeEventListener("keydown", obstacleKeyHandler);
        obstacleKeyHandler = null;
    }
}

function lockForObstacleGate() {
    obstacleGateActive = true;
    clearMovementInput();

    puzzleUI.innerHTML = `
        <div class="puzzleCard">
            <h3>obstacle run</h3>
            <p>switch lanes with arrow up/down and survive till the meter is full.</p>
            <div class="platformStats">
                <span id="obstacleProgress">0 / ${OBSTACLE_TARGET}</span>
                <span id="obstacleTimer">${OBSTACLE_TIME_LIMIT}s</span>
            </div>
            <div id="obstacleArena" class="obstacleArena"></div>
            <div>
                <button id="obstacleSkip" type="button" class="puzzleSkipBtn">skip puzzle</button>
            </div>
            <div id="obstacleFeedback" class="puzzleFeedback"></div>
            <button id="obstacleRetry" type="button" class="hidden">try again</button>
        </div>
    `;

    puzzleUI.classList.remove("hidden");
    gateBadge.innerText = "obstacle gate: locked";

    const obstacleProgress = document.getElementById("obstacleProgress");
    const obstacleTimer = document.getElementById("obstacleTimer");
    const obstacleArena = document.getElementById("obstacleArena");
    const obstacleSkip = document.getElementById("obstacleSkip");
    const obstacleFeedback = document.getElementById("obstacleFeedback");
    const obstacleRetry = document.getElementById("obstacleRetry");

    obstacleSkip.addEventListener("click", () => {
        clearObstacleRound();
        obstacleGateSolved = true;
        obstacleGateActive = false;
        gatePointer = 6;
        checkpointX = Math.max(checkpointX, 7480);
        closePuzzleOverlay();
        clearMovementInput();
        textBox.innerText = "puzzle skipped... final stretch";
        textBox.classList.remove("hidden");
        textBox.classList.add("show");
        updateHud();
    });

    function runRound() {
        clearObstacleRound();
        obstacleRetry.classList.add("hidden");
        obstacleFeedback.innerText = "";

        let lane = 1;
        let progress = 0;
        let timeLeft = OBSTACLE_TIME_LIMIT;
        let obstacles = [];
        let laneBag = [];

        function refillLaneBag() {
            laneBag = [0, 1, 2].sort(() => Math.random() - 0.5);
        }

        function renderArena() {
            obstacleArena.innerHTML = "";

            for (let i = 0; i < 3; i++) {
                const laneLine = document.createElement("div");
                laneLine.className = "obstacleLane";
                laneLine.style.top = `${i * 33.333}%`;
                obstacleArena.appendChild(laneLine);
            }

            const player = document.createElement("div");
            player.className = "runnerPlayer";
            player.style.top = `${lane * 33.333 + 16}%`;
            obstacleArena.appendChild(player);

            obstacles.forEach((obstacle) => {
                const block = document.createElement("div");
                block.className = "runnerObstacle";
                block.style.left = `${obstacle.x}%`;
                block.style.top = `${obstacle.lane * 33.333 + 16}%`;
                obstacleArena.appendChild(block);
            });
        }

        obstacleProgress.innerText = `${progress} / ${OBSTACLE_TARGET}`;
        obstacleTimer.innerText = `${timeLeft}s`;
        renderArena();

        obstacleKeyHandler = (event) => {
            if (event.key === "ArrowUp") lane = Math.max(0, lane - 1);
            if (event.key === "ArrowDown") lane = Math.min(2, lane + 1);
            renderArena();
        };
        document.addEventListener("keydown", obstacleKeyHandler);

        obstacleTickId = setInterval(() => {
            progress += 1;

            if (Math.random() < 0.12) {
                if (laneBag.length === 0) {
                    refillLaneBag();
                }
                obstacles.push({ lane: laneBag.pop(), x: 100 });
            }

            obstacles = obstacles
                .map((obstacle) => ({ ...obstacle, x: obstacle.x - 6 }))
                .filter((obstacle) => obstacle.x > -10);

            let hit = false;
            obstacles = obstacles.filter((obstacle) => {
                const colliding = obstacle.lane === lane && obstacle.x <= 15 && obstacle.x >= 9;
                if (colliding && !hit) {
                    hit = true;
                    return false;
                }
                return true;
            });

            if (hit) {
                progress = Math.max(0, progress - 12);
                obstacleFeedback.innerText = "hit... progress dropped";
            }

            obstacleProgress.innerText = `${progress} / ${OBSTACLE_TARGET}`;
            renderArena();

            if (progress >= OBSTACLE_TARGET) {
                clearObstacleRound();
                obstacleGateSolved = true;
                obstacleGateActive = false;
                gatePointer = 6;
                score += 240;
                checkpointX = Math.max(checkpointX, 7480);
                closePuzzleOverlay();
                clearMovementInput();
                textBox.innerText = "you made it through... final stretch";
                textBox.classList.remove("hidden");
                textBox.classList.add("show");
                updateHud();
            }
        }, 60);

        obstacleTimerId = setInterval(() => {
            timeLeft -= 1;
            obstacleTimer.innerText = `${timeLeft}s`;

            if (timeLeft <= 0) {
                clearObstacleRound();
                obstacleFeedback.innerText = "time is up... try again";
                obstacleRetry.classList.remove("hidden");
            }
        }, 1000);
    }

    obstacleRetry.addEventListener("click", runRound);
    runRound();
}
// 🦊 FOX
const fox = {
    x: 100,
    y: canvas.height - 175,
    width: 64,
    height: 64,
    dx: 0,
    dy: 0,
    speed: 2.5,
    acceleration: 0.15,
    friction: 0.92,
    gravity: 0.5,
    jumpPower: -10,
    grounded: false,
    direction: "right"
};
function showText(message) {

    if (isShowingText) return;

    isShowingText = true;

    textBox.innerText = message;
    textBox.classList.remove("hidden");
    textBox.classList.add("show");
}
// 🎮 CONTROLS
const keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

initFinalRevealUI();
initSpeedControls();

// 🌱 UPDATE
function update() {

    if (songGateActive || heartGateActive || platformGateActive || emojiGateActive || sequenceGateActive || obstacleGateActive || physicalLocksActive || gameOverActive) {
        fox.dx = 0;
        return;
    }

    if (damageCooldownFrames > 0) {
        damageCooldownFrames -= 1;
    }

    // LEFT / RIGHT
    // Smooth movement
if (keys["ArrowRight"]) {
    fox.dx += fox.acceleration;
    fox.direction = "right";
} 
else if (keys["ArrowLeft"]) {
    fox.dx -= fox.acceleration;
    fox.direction = "left";
}

// Apply friction (slow down naturally)
fox.dx *= fox.friction;

// Limit max speed
if (fox.dx > fox.speed) fox.dx = fox.speed;
if (fox.dx < -fox.speed) fox.dx = -fox.speed;

    // JUMP
    if (keys["ArrowUp"] && fox.grounded) {
        fox.dy = fox.jumpPower;
        fox.grounded = false;
    }

    // GRAVITY
    fox.dy += fox.gravity;

    fox.x += fox.dx;
    fox.y += fox.dy;

    // GROUND
    if (fox.y + fox.height >= canvas.height - 50) {
        fox.y = canvas.height - 50 - fox.height;
        fox.dy = 0;
        fox.grounded = true;
    }

    // 🌍 WORLD BOUNDS (IMPORTANT)
    if (fox.x < 0) fox.x = 0;
    if (fox.x + fox.width > worldWidth) {
        fox.x = worldWidth - fox.width;
    }

    // 🎥 CAMERA FOLLOW
    cameraX = fox.x - canvas.width / 2;

    // Clamp camera
    if (cameraX < 0) cameraX = 0;
    if (cameraX > worldWidth - canvas.width) {
        cameraX = worldWidth - canvas.width;
    }
    let newIndex = -1;

// find the latest story point player has reached
for (let i = 0; i < story.length; i++) {
    if (fox.x > getStoryTriggerX(story[i].x)) {
        newIndex = i;
    } else {
        break;
    }
}
if (newIndex !== activeStoryIndex && newIndex !== -1) {

    activeStoryIndex = newIndex;
    activeChapterIndex = findChapterIndex(activeStoryIndex);

    const message = story[activeStoryIndex].text;

    textBox.innerText = message;
    textBox.classList.remove("hidden");
    textBox.classList.add("show");

    score += 10;

    updateHud();
}

updateCheckpoints();
checkHazardCollision();

if (!songGateSolved && fox.x >= SONG_GATE_TRIGGER_X) {
    lockForSongGate();
}

if (songGateSolved && !heartGateSolved && fox.x >= HEART_GATE_TRIGGER_X) {
    lockForHeartGate();
}

if (heartGateSolved && !platformGateSolved && fox.x >= PLATFORM_GATE_TRIGGER_X) {
    lockForPlatformGate();
}

if (platformGateSolved && !emojiGateSolved && fox.x >= EMOJI_GATE_TRIGGER_X) {
    lockForEmojiGate();
}

if (emojiGateSolved && !sequenceGateSolved && fox.x >= SEQUENCE_GATE_TRIGGER_X) {
    lockForSequenceGate();
}

if (sequenceGateSolved && !obstacleGateSolved && fox.x >= OBSTACLE_GATE_TRIGGER_X) {
    lockForObstacleGate();
}

if (!physicalLocksSolved && !physicalLocksActive) {
    const nextPhysicalLock = PHYSICAL_LOCKS[physicalLockIndex];
    const anyMainGateActive = songGateActive || heartGateActive || platformGateActive || emojiGateActive || sequenceGateActive || obstacleGateActive;

    if (nextPhysicalLock && fox.x >= nextPhysicalLock.triggerX && !anyMainGateActive) {
        openPhysicalLocks();
    }
}

if (obstacleGateSolved && physicalLocksSolved && !finalRevealUnlocked) {
    unlockFinalReveal();
}

if (finalRevealUnlocked && !endGiftPromptShown && fox.x + fox.width >= worldWidth - 2) {
    showEndGiftPrompt();
}
// 🌿 Allow next text only after movement
if (fox.dx !== 0) {
    isShowingText = false;
}
}
// 🌄 PARALLAX LAYERS

const skyBirds = Array.from({ length: 11 }, (_, idx) => ({
    baseX: idx * 240 + Math.random() * 180,
    y: 80 + Math.random() * 170,
    speed: 18 + Math.random() * 24,
    wingOffset: Math.random() * Math.PI * 2
}));

function drawHazards() {
    const groundY = canvas.height - 50;

    hazards.forEach((hazard) => {
        const x = hazard.x - cameraX;
        const spikes = Math.max(2, Math.floor(hazard.width / 14));

        for (let i = 0; i < spikes; i++) {
            const spikeX = x + i * 14;
            ctx.beginPath();
            ctx.moveTo(spikeX, groundY);
            ctx.lineTo(spikeX + 7, groundY - 22);
            ctx.lineTo(spikeX + 14, groundY);
            ctx.closePath();
            ctx.fillStyle = "#b76074";
            ctx.fill();
        }
    });
}

function drawParallax() {

    const time = performance.now() * 0.001;
    const groundY = canvas.height - 50;

    function drawMountainBand(baseY, amp, spacing, width, parallax, fillA, fillB) {
        const start = -spacing * 2;
        const end = canvas.width + spacing * 2;

        const grad = ctx.createLinearGradient(0, baseY - amp - 40, 0, groundY);
        grad.addColorStop(0, fillA);
        grad.addColorStop(1, fillB);
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(start, groundY);

        for (let x = start; x <= end + spacing; x += spacing) {
            const worldX = x + cameraX * parallax;
            const peak = baseY - (Math.sin(worldX * 0.004 + time * 0.1) * 0.5 + 0.5) * amp;
            ctx.lineTo(x, peak);
            ctx.lineTo(x + width * 0.5, baseY + amp * 0.22);
            ctx.lineTo(x + width, groundY);
        }

        ctx.lineTo(end, groundY);
        ctx.closePath();
        ctx.fill();
    }

    // Far mountain range.
    drawMountainBand(canvas.height - 250, 120, 240, 240, 0.14, "rgba(150, 194, 222, 0.26)", "rgba(47, 82, 104, 0.34)");
    // Mid mountain range.
    drawMountainBand(canvas.height - 210, 95, 200, 200, 0.24, "rgba(121, 168, 183, 0.28)", "rgba(32, 64, 77, 0.42)");

    // Distant pine silhouette line.
    ctx.fillStyle = "rgba(23, 60, 66, 0.8)";
    for (let i = -2; i < 24; i++) {
        const x = i * 120 - cameraX * 0.36;
        const h = 70 + ((i % 5) * 9);
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + 20, groundY - h);
        ctx.lineTo(x + 40, groundY);
        ctx.closePath();
        ctx.fill();
    }

    // Near tree layer with trunks and canopies.
    for (let i = -2; i < 22; i++) {
        const x = i * 140 - cameraX * 0.62;
        const trunkH = 64 + ((i % 4) * 10);
        const canopyR = 26 + ((i % 3) * 6);

        ctx.fillStyle = "rgba(55, 42, 37, 0.82)";
        ctx.fillRect(x + 14, groundY - trunkH, 10, trunkH + 6);

        ctx.fillStyle = "rgba(42, 105, 91, 0.9)";
        ctx.beginPath();
        ctx.arc(x + 20, groundY - trunkH - 14, canopyR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(61, 139, 118, 0.72)";
        ctx.beginPath();
        ctx.arc(x + 8, groundY - trunkH - 8, canopyR * 0.62, 0, Math.PI * 2);
        ctx.fill();
    }

    // Foreground shrub accents.
    ctx.fillStyle = "rgba(64, 132, 112, 0.7)";
    for (let i = -1; i < 28; i++) {
        const x = i * 96 - cameraX * 0.82;
        const r = 16 + ((i % 4) * 3);
        ctx.beginPath();
        ctx.arc(x, groundY - 4, r, Math.PI, Math.PI * 2);
        ctx.fill();
    }

    // Animated birds in sky.
    ctx.strokeStyle = "rgba(221, 246, 255, 0.75)";
    ctx.lineWidth = 1.6;
    skyBirds.forEach((bird) => {
        const loopWidth = canvas.width + 280;
        const x = ((bird.baseX - cameraX * 0.12 + time * bird.speed) % loopWidth + loopWidth) % loopWidth - 140;
        const flap = Math.sin(time * 6 + bird.wingOffset) * 4;

        ctx.beginPath();
        ctx.moveTo(x - 7, bird.y + flap * 0.35);
        ctx.quadraticCurveTo(x, bird.y - flap, x + 7, bird.y + flap * 0.35);
        ctx.stroke();
    });
}

// 🌿 DRAW BACKGROUND (simple layered feel)
function drawBackground() {
    const worldProgress = Math.max(0, Math.min(1, fox.x / (worldWidth - fox.width)));

    // Sunrise -> sunset palette interpolation as the player advances.
    const topR = Math.round(159 + (255 - 159) * worldProgress);
    const topG = Math.round(214 + (142 - 214) * worldProgress);
    const topB = Math.round(255 + (114 - 255) * worldProgress);

    const midR = Math.round(118 + (255 - 118) * worldProgress);
    const midG = Math.round(182 + (120 - 182) * worldProgress);
    const midB = Math.round(233 + (104 - 233) * worldProgress);

    const lowR = Math.round(58 + (92 - 58) * worldProgress);
    const lowG = Math.round(112 + (64 - 112) * worldProgress);
    const lowB = Math.round(126 + (76 - 126) * worldProgress);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgb(${topR}, ${topG}, ${topB})`);
    gradient.addColorStop(0.45, `rgb(${midR}, ${midG}, ${midB})`);
    gradient.addColorStop(1, `rgb(${lowR}, ${lowG}, ${lowB})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Horizon haze and sun glow for depth.
    const haze = ctx.createLinearGradient(0, canvas.height * 0.35, 0, canvas.height * 0.78);
    const hazeStrength = 0.16 + worldProgress * 0.1;
    haze.addColorStop(0, "rgba(255, 236, 209, 0)");
    haze.addColorStop(1, `rgba(255, 215, 178, ${hazeStrength.toFixed(3)})`);
    ctx.fillStyle = haze;
    ctx.fillRect(0, canvas.height * 0.34, canvas.width, canvas.height * 0.5);

    const sunX = canvas.width * (0.76 - worldProgress * 0.14);
    const sunY = canvas.height * (0.18 + worldProgress * 0.16);
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 140);
    sunGrad.addColorStop(0, "rgba(255, 236, 191, 0.72)");
    sunGrad.addColorStop(0.45, "rgba(255, 188, 142, 0.28)");
    sunGrad.addColorStop(1, "rgba(255, 188, 142, 0)");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
    ctx.fill();

    const groundGrad = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height);
    groundGrad.addColorStop(0, "#2d695d");
    groundGrad.addColorStop(1, "#1b3f39");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
}

// 🦊 DRAW FOX
function drawFox() {
    ctx.save();

    if (damageCooldownFrames > 0 && Math.floor(damageCooldownFrames / 8) % 2 === 0) {
        ctx.globalAlpha = 0.55;
    }

    if (fox.direction === "right") {
        // flip ONLY when moving right
        ctx.scale(-1, 1);
        ctx.drawImage(
            foxImage,
            -(fox.x - cameraX + fox.width),
            fox.y,
            fox.width,
            fox.height
        );
    } else {
        // normal (facing left)
        ctx.drawImage(
            foxImage,
            fox.x - cameraX,
            fox.y,
            fox.width,
            fox.height
        );
    }

    ctx.restore();
}

// ✨ PARTICLES
let particles = [];

for (let i = 0; i < 60; i++) {
    particles.push({
        x: Math.random() * worldWidth,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.3
    });
}

function drawParticles() {
    ctx.fillStyle = "rgba(255, 240, 180, 0.8)";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(255, 240, 180, 0.8)";

    particles.forEach((p) => {
        let screenX = p.x - cameraX;

        ctx.beginPath();
        ctx.arc(screenX, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // floating upward
        p.y -= p.speed;

        if (p.y < 0) {
            p.y = canvas.height;
            p.x = Math.random() * worldWidth;
        }
    });
    ctx.shadowBlur = 0;
}

// 🔁 LOOP
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawParallax();
    drawParticles();
    update();
    drawHazards();
    drawFox();
    requestAnimationFrame(loop);
}

loop();
