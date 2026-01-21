// Diggle Diggle Game - Main JavaScript
// 디글디글 게임 메인 로직

// ===== Game State =====
const GameState = {
    currentScreen: 'intro',
    playerName: '',
    stage: 1,
    score: 0,
    lives: 4,
    maxLives: 4,
    goldenPouches: 0,
    maxPouches: 7,
    ammo: 30,
    enemiesDefeated: 0,
    resourcesCollected: 0,
    stagesCleared: 0,
    isFrozen: false,
    isPaused: false,
    gameRunning: false
};

// ===== Game Configuration =====
const Config = {
    canvasWidth: 800,
    canvasHeight: 600,
    playerSpeed: 7,
    bulletSpeed: 12,
    enemyBaseSpeed: 0.575,      // 적 기본 속도 15% 증가 (0.5 * 1.15)
    stageSpeedIncrease: 0.115,  // 스테이지당 속도 증가량도 15% 증가
    stageHealthMultiplier: 1,
    freezeDuration: 5000,
    bossStages: [5, 10, 15, 20],
    stage1EnemyCount: 2,
    enemyIncreasePerStage: 1,
    invincibilityDuration: 120,
    itemSpeedBoost: 0.02        // 먹이 먹을 때마다 적 속도 증가량
};

// ===== Rankings Data =====
let rankings = [
    { rank: 1, name: 'DiggMaster', score: 15000, stage: 12 },
    { rank: 2, name: 'MoleKing', score: 12500, stage: 10 },
    { rank: 3, name: 'Tunneler', score: 10000, stage: 8 },
    { rank: 4, name: 'GoldHunter', score: 8500, stage: 7 },
    { rank: 5, name: 'RootFinder', score: 7000, stage: 6 },
    { rank: 6, name: 'DigulFan', score: 5500, stage: 5 },
    { rank: 7, name: 'Burrower', score: 4000, stage: 4 },
    { rank: 8, name: 'SoilDiver', score: 3000, stage: 3 },
    { rank: 9, name: 'NewMole', score: 1500, stage: 2 },
    { rank: 10, name: 'Beginner', score: 500, stage: 1 }
];

// ===== Game Objects =====
let player = null;
let enemies = [];
let items = [];
let bullets = [];
let particles = [];
let bgDots = [];
let bgStones = [];
let bgRoots = [];
let bgLeaves = [];
let bgSeeds = [];
let bgWormTunnels = [];

// ===== Canvas & Context =====
let canvas, ctx;

// ===== DOM Elements =====
const screens = {};
const elements = {};

// ===== Initialize on DOM Load =====
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    initializeCanvas();
    createLogoAnimation();
    createIntroMole();
    setupEventListeners();
    populateRankings();
    initializeLives();
    initializePouches();
});

function initializeElements() {
    screens.intro = document.getElementById('intro-screen');
    screens.character = document.getElementById('character-intro');
    screens.ranking = document.getElementById('ranking-screen');
    screens.game = document.getElementById('game-screen');
    screens.complete = document.getElementById('stage-complete');
    screens.gameover = document.getElementById('game-over');
    screens.boss = document.getElementById('boss-screen');

    elements.logoText = document.getElementById('logo-text');
    elements.introMole = document.getElementById('intro-mole');
    elements.digulHero = document.getElementById('digul-hero');
    elements.rankingList = document.getElementById('ranking-list');
    elements.playerName = document.getElementById('player-name');
    elements.playerPassword = document.getElementById('player-password');
    elements.stageNumber = document.getElementById('stage-number');
    elements.scoreValue = document.getElementById('score-value');
    elements.ammoCount = document.getElementById('ammo-count');
    elements.livesContainer = document.getElementById('lives-container');
    elements.goldenPouches = document.getElementById('golden-pouches');
    elements.freezeOverlay = document.getElementById('freeze-overlay');
    elements.enemiesDefeated = document.getElementById('enemies-defeated');
    elements.resourcesCollected = document.getElementById('resources-collected');
    elements.stageScore = document.getElementById('stage-score');
    elements.finalScore = document.getElementById('final-score');
    elements.stagesCleared = document.getElementById('stages-cleared');
    elements.btnInstall = document.getElementById('btn-install');
}

function initializeCanvas() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const targetRatio = 800 / 600;
    const windowRatio = window.innerWidth / window.innerHeight;

    if (windowRatio > targetRatio) {
        canvas.style.height = '100vh';
        canvas.style.width = 'auto';
    } else {
        canvas.style.width = '100vw';
        canvas.style.height = 'auto';
    }

    canvas.width = 800;
    canvas.height = 600;
    Config.canvasWidth = 800;
    Config.canvasHeight = 600;
}

function createLogoAnimation() {
    const logoText = elements.logoText;
    const letters = 'Diggle Diggle';
    logoText.innerHTML = '';

    letters.split('').forEach((letter, i) => {
        if (letter === ' ') {
            const space = document.createElement('span');
            space.className = 'logo-space';
            space.style.width = '20px';
            space.style.display = 'inline-block';
            logoText.appendChild(space);
        } else {
            const span = document.createElement('span');
            span.className = 'logo-letter';
            span.textContent = letter;
            span.style.animationDelay = (i * 0.08) + 's';
            logoText.appendChild(span);
        }
    });
}

function createIntroMole() {
    const moleContainer = elements.introMole;
    if (!moleContainer) return;

    const moleSvg = '<div class="mole-sprite intro-digging"><svg viewBox="0 0 100 120" width="180" height="216"><ellipse cx="50" cy="112" rx="28" ry="4" fill="rgba(0,0,0,0.1)"/><circle cx="50" cy="85" r="28" fill="#8B6914"/><circle cx="50" cy="84" r="26" fill="#A68B26"/><ellipse cx="50" cy="92" rx="15" ry="18" fill="#F5E6CC"/><ellipse cx="40" cy="108" rx="7" ry="4" fill="#8B6914"/><ellipse cx="60" cy="108" rx="7" ry="4" fill="#8B6914"/><ellipse cx="22" cy="82" rx="10" ry="7" fill="#A68B26" transform="rotate(-15, 22, 82)"/><ellipse cx="78" cy="82" rx="10" ry="7" fill="#A68B26" transform="rotate(15, 78, 82)"/><circle cx="50" cy="38" r="35" fill="#8B6914"/><circle cx="50" cy="37" r="33" fill="#A68B26"/><ellipse cx="50" cy="48" rx="26" ry="22" fill="#F5E6CC"/><circle cx="40" cy="45" r="3" fill="#222"/><circle cx="60" cy="45" r="3" fill="#222"/><ellipse cx="50" cy="55" rx="7" ry="5" fill="#FFAAAA"/><path d="M 45 62 Q 47.5 66 50 62 Q 52.5 66 55 62" stroke="#8B6914" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="28" cy="52" r="4.5" fill="#FFCCCC" opacity="0.6"/><circle cx="72" cy="52" r="4.5" fill="#FFCCCC" opacity="0.6"/><circle cx="22" cy="22" r="7" fill="#8B6914"/><circle cx="78" cy="22" r="7" fill="#8B6914"/></svg></div><div class="dirt-particles-anim"></div>';

    moleContainer.innerHTML = moleSvg;
    if (elements.digulHero) elements.digulHero.innerHTML = moleSvg;

    if (!document.getElementById('mole-intro-styles')) {
        const style = document.createElement('style');
        style.id = 'mole-intro-styles';
        style.textContent = '.mole-sprite.intro-digging { animation: digBounce 0.5s ease-in-out infinite; } @keyframes digBounce { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-10px) rotate(5deg); } } .dirt-particles-anim { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 100px; height: 30px; background: radial-gradient(ellipse, #5C4023 0%, transparent 70%); animation: dirtSpray 0.3s ease-out infinite; } @keyframes dirtSpray { 0% { opacity: 0.8; transform: translateX(-50%) scale(1); } 100% { opacity: 0; transform: translateX(-50%) scale(1.5) translateY(-20px); } }';
        document.head.appendChild(style);
    }
}

function setupEventListeners() {
    document.getElementById('btn-start').addEventListener('click', showCharacterIntro);
    document.getElementById('btn-continue').addEventListener('click', showRankingScreen);
    document.getElementById('btn-play').addEventListener('click', startGame);
    document.getElementById('btn-next')?.addEventListener('click', nextStage);
    document.getElementById('btn-retry')?.addEventListener('click', retryGame);
    document.getElementById('btn-home')?.addEventListener('click', goHome);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (elements.btnInstall) elements.btnInstall.classList.remove('hidden');
    });

    elements.btnInstall?.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                deferredPrompt = null;
                elements.btnInstall.classList.add('hidden');
            });
        }
    });
}
let deferredPrompt;

function showScreen(screenId) {
    Object.values(screens).forEach(screen => { if (screen) screen.classList.remove('active'); });
    if (screens[screenId]) {
        screens[screenId].classList.add('active');
        GameState.currentScreen = screenId;
    }
}
function showCharacterIntro() { showScreen('character'); }
function showRankingScreen() { showScreen('ranking'); }

function populateRankings() {
    const list = elements.rankingList;
    if (!list) return;
    list.innerHTML = '';
    rankings.forEach((entry, index) => {
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
        const item = document.createElement('div');
        item.className = 'ranking-item';
        item.innerHTML = '<span class="rank ' + rankClass + '">' + entry.rank + '</span><span class="name">' + entry.name + '</span><span class="score">' + entry.score.toLocaleString() + '</span><span class="stage">' + entry.stage + '</span>';
        list.appendChild(item);
    });
}

function initializeLives() {
    const container = elements.livesContainer;
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < GameState.maxLives; i++) {
        const potion = document.createElement('div');
        potion.className = 'life-potion' + (i < GameState.lives ? ' active' : ' used');
        container.appendChild(potion);
    }
}

function initializePouches() {
    const container = elements.goldenPouches;
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < GameState.maxPouches; i++) {
        const slot = document.createElement('div');
        slot.className = 'pouch-slot' + (i < GameState.goldenPouches ? ' filled' : '');
        container.appendChild(slot);
    }
}

function updateUI() {
    if (elements.stageNumber) elements.stageNumber.textContent = GameState.stage;
    if (elements.scoreValue) elements.scoreValue.textContent = GameState.score.toLocaleString();
    if (elements.ammoCount) elements.ammoCount.textContent = GameState.ammo;
    initializeLives();
    initializePouches();
}

function startGame() {
    const name = elements.playerName?.value.trim();
    if (!name) {
        elements.playerName?.focus();
        elements.playerName?.classList.add('shake');
        setTimeout(() => elements.playerName?.classList.remove('shake'), 500);
        return;
    }
    GameState.playerName = name;
    resetGameState();
    showScreen('game');
    initializeGame();
}

function resetGameState() {
    GameState.stage = 1;
    GameState.score = 0;
    GameState.lives = 4;
    GameState.goldenPouches = 0;
    GameState.ammo = 30;
    GameState.enemiesDefeated = 0;
    GameState.resourcesCollected = 0;
    GameState.stagesCleared = 0;
    GameState.isFrozen = false;
    GameState.gameRunning = true;
}

let tunnelTrail = [];

function initializeGame() {
    player = {
        x: Config.canvasWidth / 2,
        y: Config.canvasHeight / 2,
        width: 60,
        height: 80,
        speed: Config.playerSpeed,
        direction: 'right',
        isDigging: false,
        isInvincible: false,
        invincibilityTimer: 0,
        blinkTimer: 0,
        digAnimTimer: 0,
        vx: 0,
        vy: 0
    };
    enemies = [];
    items = [];
    bullets = [];
    particles = [];
    tunnelTrail = [];
    generateBackgroundElements();
    spawnStageContent();
    updateUI();
    if (!GameState.gameRunning) return;
    requestAnimationFrame(gameLoop);
}

function spawnStageContent() {
    const stage = GameState.stage;
    const enemyCount = Config.stage1EnemyCount + Math.floor((stage - 1) * Config.enemyIncreasePerStage);
    const itemCount = 8 + stage;
    for (let i = 0; i < enemyCount; i++) spawnEnemy('wildcat');
    if (Config.bossStages.includes(stage)) spawnEnemy('boar');
    for (let i = 0; i < itemCount; i++) spawnItem();
    const pouchCount = Math.min(3, 7 - GameState.goldenPouches);
    for (let i = 0; i < pouchCount; i++) spawnGoldenPouch();
}

function spawnEnemy(type) {
    const stage = GameState.stage;
    const health = type === 'boar' ? 8 + stage * 2 : Math.max(1, Math.floor(stage / 2));
    const speed = type === 'boar' ? 1.0 : Config.enemyBaseSpeed + ((stage - 1) * Config.stageSpeedIncrease);
    enemies.push({
        x: Math.random() * (Config.canvasWidth - 100) + 50,
        y: Math.random() * (Config.canvasHeight - 200) + 100,
        width: type === 'boar' ? 100 : 50,
        height: type === 'boar' ? 80 : 60,
        type: type,
        health: health,
        maxHealth: health,
        speed: speed,
        direction: Math.random() > 0.5 ? 1 : -1,
        isFrozen: false,
        frozenTimer: 0
    });
}

function spawnItem() {
    const types = ['gold', 'root', 'acorn', 'mushroom', 'ammo'];
    const type = types[Math.floor(Math.random() * types.length)];
    items.push({
        x: Math.random() * (Config.canvasWidth - 60) + 30,
        y: Math.random() * (Config.canvasHeight - 150) + 80,
        width: 30,
        height: 30,
        type: type,
        collected: false
    });
}

function spawnGoldenPouch() {
    items.push({
        x: Math.random() * (Config.canvasWidth - 60) + 30,
        y: Math.random() * (Config.canvasHeight - 150) + 80,
        width: 40,
        height: 40,
        type: 'golden-pouch',
        collected: false
    });
}

const keys = {};

function handleKeyDown(e) {
    keys[e.code] = true;
    if (GameState.currentScreen === 'game' && GameState.gameRunning) {
        if (e.code === 'Space') { e.preventDefault(); shootBullet(); }
        if (e.code === 'KeyZ') { player.isDigging = true; }
    }
}

function handleKeyUp(e) {
    keys[e.code] = false;
    if (e.code === 'KeyZ') { if (player) player.isDigging = false; }
}

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    if (touchStartY > window.innerHeight * 0.7) player.isDigging = true;
    if (touchStartY < window.innerHeight * 0.3) shootBullet();
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const threshold = 30;
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys['ArrowUp'] = false;
    keys['ArrowDown'] = false;
    if (Math.abs(dx) > threshold) {
        if (dx > 0) keys['ArrowRight'] = true;
        else keys['ArrowLeft'] = true;
    }
    if (Math.abs(dy) > threshold) {
        if (dy > 0) keys['ArrowDown'] = true;
        else keys['ArrowUp'] = true;
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    player.isDigging = false;
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys['ArrowUp'] = false;
    keys['ArrowDown'] = false;
}

function shootBullet() {
    if (GameState.ammo <= 0) return;
    GameState.ammo--;
    updateUI();
    const dirX = player.direction === 'right' ? 1 : -1;
    bullets.push({
        x: player.x + (dirX > 0 ? player.width : 0),
        y: player.y + player.height / 2,
        radius: 8,
        speed: Config.bulletSpeed,
        dirX: dirX,
        dirY: 0
    });
}

function gameLoop(timestamp) {
    if (!GameState.gameRunning) return;
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    updatePlayer();
    updateEnemies();
    updateBullets();
    checkCollisions();
    checkGameConditions();
}

function updatePlayer() {
    if (!player) return;
    if (player.isInvincible) {
        player.invincibilityTimer--;
        player.blinkTimer++;
        if (player.invincibilityTimer <= 0) player.isInvincible = false;
    }
    player.digAnimTimer++;
    player.vx = 0; player.vy = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) { player.vx = -player.speed; player.direction = 'left'; }
    if (keys['ArrowRight'] || keys['KeyD']) { player.vx = player.speed; player.direction = 'right'; }
    if (keys['ArrowUp'] || keys['KeyW']) { player.vy = -player.speed; }
    if (keys['ArrowDown'] || keys['KeyS']) { player.vy = player.speed; }
    const prevX = player.x; const prevY = player.y;
    player.x += player.vx; player.y += player.vy;
    player.x = Math.max(0, Math.min(Config.canvasWidth - player.width, player.x));
    player.y = Math.max(80, Math.min(Config.canvasHeight - player.height - 50, player.y));
    const isMoving = player.vx !== 0 || player.vy !== 0;
    if (isMoving) {
        if (player.digAnimTimer % 3 === 0) {
            tunnelTrail.push({ x: prevX + player.width / 2, y: prevY + player.height / 2, size: 35, alpha: 0.6 });
        }
        if (player.digAnimTimer % 4 === 0) {
            for (let i = 0; i < 3; i++) {
                particles.push({
                    x: player.x + player.width / 2 + (Math.random() - 0.5) * 30,
                    y: player.y + player.height - 10,
                    vx: (Math.random() - 0.5) * 3 - player.vx * 0.3,
                    vy: -Math.random() * 2 - 1,
                    size: 3 + Math.random() * 4,
                    life: 20 + Math.random() * 15,
                    color: Math.random() > 0.5 ? '#6B4423' : '#8B5A3A'
                });
            }
        }
    }
    tunnelTrail = tunnelTrail.filter(t => { t.alpha -= 0.008; return t.alpha > 0; });
    particles = particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--; return p.life > 0;
    });
}

function updateEnemies() {
    enemies.forEach(enemy => {
        if (enemy.isFrozen) {
            enemy.frozenTimer--;
            if (enemy.frozenTimer <= 0) enemy.isFrozen = false;
            return;
        }
        if (player) {
            const dx = player.x - enemy.x; const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) { enemy.x += (dx / dist) * enemy.speed; enemy.y += (dy / dist) * enemy.speed; }
        }
    });
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.x += bullet.dirX * bullet.speed;
        bullet.y += bullet.dirY * bullet.speed;
        return bullet.x > 0 && bullet.x < Config.canvasWidth && bullet.y > 0 && bullet.y < Config.canvasHeight;
    });
}

function checkCollisions() {
    items = items.filter(item => {
        if (item.collected) return false;
        if (isColliding(player, item)) { collectItem(item); return false; }
        return true;
    });
    bullets.forEach((bullet, bi) => {
        enemies.forEach(enemy => {
            if (isCollidingCircleRect(bullet, enemy)) {
                enemy.health--; bullets.splice(bi, 1);
                if (enemy.health <= 0) {
                    const index = enemies.indexOf(enemy);
                    if (index > -1) {
                        enemies.splice(index, 1); GameState.enemiesDefeated++;
                        GameState.score += enemy.type === 'boar' ? 500 : 100; updateUI();
                    }
                }
            }
        });
    });
    if (!GameState.isFrozen && !player.isInvincible) {
        enemies.forEach(enemy => { if (!enemy.isFrozen && isColliding(player, enemy)) playerHit(); });
    }
}

function isColliding(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function isCollidingCircleRect(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const dx = circle.x - closestX; const dy = circle.y - closestY;
    return (dx * dx + dy * dy) < (circle.radius * circle.radius);
}

function collectItem(item) {
    GameState.resourcesCollected++;
    switch (item.type) {
        case 'gold': GameState.score += 50; break;
        case 'root': GameState.score += 30; break;
        case 'acorn': GameState.score += 20; break;
        case 'mushroom': GameState.score += 40; break;
        case 'ammo': GameState.ammo = Math.min(99, GameState.ammo + 10); break;
        case 'golden-pouch':
            GameState.goldenPouches++; GameState.score += 100;
            if (GameState.goldenPouches >= 7) activateFreeze();
            break;
    }
    enemies.forEach(enemy => { enemy.speed += Config.itemSpeedBoost; });
    updateUI();
}

function playerHit() {
    GameState.lives--; updateUI();
    player.isInvincible = true;
    player.invincibilityTimer = Config.invincibilityDuration;
    player.blinkTimer = 0;
    player.x = Config.canvasWidth / 2; player.y = Config.canvasHeight / 2;
    if (GameState.lives <= 0) gameOver();
}

function activateFreeze() {
    GameState.isFrozen = true; GameState.goldenPouches = 0;
    elements.freezeOverlay?.classList.remove('hidden');
    enemies.forEach(enemy => { enemy.isFrozen = true; enemy.frozenTimer = 300; });
    setTimeout(() => { GameState.isFrozen = false; elements.freezeOverlay?.classList.add('hidden'); }, Config.freezeDuration);
    updateUI();
}

function checkGameConditions() { if (enemies.length === 0 && GameState.gameRunning) stageComplete(); }

function stageComplete() {
    GameState.gameRunning = false; GameState.stagesCleared++;
    if (elements.enemiesDefeated) elements.enemiesDefeated.textContent = GameState.enemiesDefeated;
    if (elements.resourcesCollected) elements.resourcesCollected.textContent = GameState.resourcesCollected;
    if (elements.stageScore) elements.stageScore.textContent = GameState.score.toLocaleString();
    showScreen('complete');
}

function nextStage() {
    GameState.stage++; GameState.enemiesDefeated = 0; GameState.resourcesCollected = 0;
    GameState.ammo = Math.min(99, GameState.ammo + 15); GameState.gameRunning = true;
    showScreen('game'); initializeGame();
}

function gameOver() {
    GameState.gameRunning = false;
    if (elements.finalScore) elements.finalScore.textContent = GameState.score.toLocaleString();
    if (elements.stagesCleared) elements.stagesCleared.textContent = GameState.stagesCleared;
    updateRankings(); showScreen('gameover');
}

function updateRankings() {
    const newEntry = { name: GameState.playerName, score: GameState.score, stage: GameState.stagesCleared };
    rankings.push(newEntry); rankings.sort((a, b) => b.score - a.score);
    rankings = rankings.slice(0, 10); rankings.forEach((r, i) => r.rank = i + 1);
}

function retryGame() { resetGameState(); showScreen('game'); initializeGame(); }
function goHome() { showScreen('intro'); }

function render() {
    ctx.clearRect(0, 0, Config.canvasWidth, Config.canvasHeight);
    drawBackground(); drawTunnelTrail(); drawItems(); drawEnemies(); drawBullets(); drawPlayer(); drawParticles();
}

function drawTunnelTrail() {
    tunnelTrail.forEach(t => {
        ctx.save(); ctx.globalAlpha = t.alpha; ctx.fillStyle = '#2A1810'; ctx.beginPath();
        ctx.ellipse(t.x, t.y, t.size, t.size * 0.7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1A0A05'; ctx.beginPath();
        ctx.ellipse(t.x, t.y, t.size * 0.7, t.size * 0.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save(); ctx.globalAlpha = p.life / 35; ctx.fillStyle = p.color; ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    });
}

function generateBackgroundElements() {
    const w = Config.canvasWidth; const h = Config.canvasHeight; const forestHeight = h * 0.12;
    bgDots = []; for (let i = 0; i < 100; i++) {
        bgDots.push({
            x: Math.random() * w, y: forestHeight + Math.random() * (h - forestHeight),
            size: 2 + Math.random() * 6, alpha: 0.1 + Math.random() * 0.15,
            color: 'rgba(' + (30 + Math.random() * 40) + ',' + (20 + Math.random() * 30) + ',' + (10 + Math.random() * 20) + ',1)'
        });
    }
    bgStones = [{ x: 120, y: 200, size: 18 }, { x: 350, y: 320, size: 25 }, { x: 600, y: 180, size: 15 }, { x: 80, y: 450, size: 22 }, { x: 500, y: 500, size: 20 }, { x: 750, y: 350, size: 16 }, { x: 200, y: 550, size: 12 }, { x: 650, y: 480, size: 14 }, { x: 420, y: 250, size: 10 }];
    bgRoots = []; for (let i = 0; i < 4; i++) {
        const segments = []; let rx = (w / 5) * (i + 1) + (Math.random() - 0.5) * 100;
        let curX = rx, curY = 0; const rootLength = forestHeight + 100 + Math.random() * 150;
        const segCount = 6; for (let s = 0; s < segCount; s++) {
            const nextX = curX + (Math.random() - 0.5) * 40; const nextY = curY + rootLength / segCount;
            segments.push({ cx: curX + (Math.random() - 0.5) * 20, cy: curY + (rootLength / segCount) * 0.5, x: nextX, y: nextY });
            curX = nextX; curY = nextY;
        }
        bgRoots.push({ rx: rx, segments: segments });
    }
    bgLeaves = []; const leafColors = ['#8B4513', '#A0522D', '#CD853F', '#6B8E23', '#556B2F'];
    for (let i = 0; i < 15; i++) {
        bgLeaves.push({ x: Math.random() * w, y: 20 + Math.random() * (forestHeight - 10), size: 8 + Math.random() * 12, angle: Math.random() * Math.PI, color: leafColors[Math.floor(Math.random() * leafColors.length)] });
    }
    bgSeeds = [{ x: 150, y: 80 }, { x: 400, y: 60 }, { x: 700, y: 90 }, { x: 50, y: 70 }];
    bgWormTunnels = []; for (let i = 0; i < 5; i++) {
        bgWormTunnels.push({ x: Math.random() * w, y: forestHeight + 50 + Math.random() * (h - forestHeight - 100), c1x: 50, c1y: 30, c2x: 80, c2y: -20, targetX: 120 + Math.random() * 50, targetY: Math.random() * 40 - 20 });
    }
}

function drawBackground() {
    const w = Config.canvasWidth; const h = Config.canvasHeight; const forestHeight = h * 0.12;
    const soilGradient = ctx.createLinearGradient(0, forestHeight, 0, h);
    soilGradient.addColorStop(0, '#5A4030'); soilGradient.addColorStop(0.15, '#4A3525'); soilGradient.addColorStop(0.4, '#3D2918'); soilGradient.addColorStop(0.7, '#2E1E12'); soilGradient.addColorStop(1, '#1A0F08');
    ctx.fillStyle = soilGradient; ctx.fillRect(0, forestHeight - 10, w, h - forestHeight + 10);
    bgDots.forEach(dot => { ctx.globalAlpha = dot.alpha; ctx.fillStyle = dot.color; ctx.beginPath(); ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;
    bgStones.forEach(stone => {
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(stone.x + 3, stone.y + 3, stone.size, stone.size * 0.7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6D4C41'; ctx.beginPath(); ctx.ellipse(stone.x, stone.y, stone.size, stone.size * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = '#3E2723'; ctx.lineCap = 'round';
    bgRoots.forEach(root => { ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(root.rx, 0); root.segments.forEach(seg => { ctx.quadraticCurveTo(seg.cx, seg.cy, seg.x, seg.y); }); ctx.stroke(); });
    bgLeaves.forEach(leaf => {
        ctx.save(); ctx.translate(leaf.x, leaf.y); ctx.rotate(leaf.angle); ctx.fillStyle = leaf.color; ctx.beginPath(); ctx.ellipse(0, 0, leaf.size, leaf.size * 0.4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(-leaf.size, 0); ctx.lineTo(leaf.size, 0); ctx.stroke(); ctx.restore();
    });
    bgSeeds.forEach(seed => {
        ctx.fillStyle = '#5D4037'; ctx.beginPath(); ctx.ellipse(seed.x, seed.y, 6, 8, 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3E2723'; ctx.beginPath(); ctx.ellipse(seed.x, seed.y - 6, 7, 4, 0, Math.PI, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = 'rgba(30,20,10,0.15)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    bgWormTunnels.forEach(wt => { ctx.beginPath(); ctx.moveTo(wt.x, wt.y); ctx.bezierCurveTo(wt.x + wt.c1x, wt.y + wt.c1y, wt.x + wt.c2x, wt.y + wt.c2y, wt.x + wt.targetX, wt.y + wt.targetY); ctx.stroke(); });
    ctx.strokeStyle = 'rgba(90,70,50,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([10, 5]); ctx.beginPath(); ctx.moveTo(0, forestHeight); ctx.lineTo(w, forestHeight); ctx.stroke(); ctx.setLineDash([]);
}

function drawPlayer() {
    if (!player) return;
    if (player.isInvincible && Math.floor(player.blinkTimer / 6) % 2 === 0) return;
    const { x, y, width, height, direction } = player;
    ctx.save(); if (player.isInvincible) ctx.globalAlpha = 0.7;
    ctx.translate(x + width / 2, y + height / 2); if (direction === 'left') ctx.scale(-1, 1);
    ctx.translate(-width / 2, -height / 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(width / 2, height * 0.95, width * 0.45, height * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    const isMoving = player.vx !== 0 || player.vy !== 0;
    const digPhase = Math.sin(player.digAnimTimer * 0.4) * (isMoving ? 1 : 0);
    ctx.fillStyle = '#8B6914'; ctx.beginPath(); ctx.ellipse(width / 2, height * 0.72, width * 0.38, height * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#A68B26'; ctx.beginPath(); ctx.ellipse(width / 2, height * 0.7, width * 0.35, height * 0.26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8B6914'; ctx.beginPath(); ctx.ellipse(width / 2 - 12, height * 0.95, 8, 5, 0, 0, Math.PI * 2); ctx.ellipse(width / 2 + 12, height * 0.95, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F5E6CC'; ctx.beginPath(); ctx.ellipse(width / 2, height * 0.78, width * 0.18, height * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    const armY = height * 0.7; const armXOffset = width * 0.35; ctx.fillStyle = '#A68B26';
    ctx.save(); ctx.translate(width / 2 - armXOffset, armY + digPhase * 5); ctx.rotate(-0.2); ctx.beginPath(); ctx.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(width / 2 + armXOffset, armY - digPhase * 5); ctx.rotate(0.2); ctx.beginPath(); ctx.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#8B6914'; ctx.beginPath(); ctx.ellipse(width / 2, height * 0.35, width * 0.42, height * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#A68B26'; ctx.beginPath(); ctx.ellipse(width / 2, height * 0.34, width * 0.4, height * 0.33, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F5E6CC'; ctx.beginPath(); ctx.ellipse(width / 2, height * 0.45, width * 0.3, height * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(width * 0.4, height * 0.42, 3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(width * 0.6, height * 0.42, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFAAAA'; ctx.beginPath(); ctx.ellipse(width / 2, height * 0.52, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8B6914'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(width / 2 - 4, height * 0.6, 4, 0, Math.PI, false); ctx.stroke(); ctx.beginPath(); ctx.arc(width / 2 + 4, height * 0.6, 4, 0, Math.PI, false); ctx.stroke();
    ctx.fillStyle = 'rgba(255,170,170,0.5)'; ctx.beginPath(); ctx.arc(width * 0.28, height * 0.5, 5, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(width * 0.72, height * 0.5, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8B6914'; ctx.beginPath(); ctx.arc(width * 0.22, height * 0.18, 9, 0, Math.PI * 2); ctx.arc(width * 0.78, height * 0.18, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4CAF50'; ctx.beginPath(); ctx.ellipse(width * 0.98, height * 0.48, 14, 10, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#388E3C'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(width * 0.92, height * 0.48); ctx.lineTo(width * 1.04, height * 0.48); ctx.stroke();
    ctx.fillStyle = '#2E7D32'; ctx.beginPath(); ctx.roundRect(width * 1.0, height * 0.46, 12, 5, 1); ctx.fill(); ctx.restore();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const { x, y, width, height, type, health, maxHealth, isFrozen } = enemy;
        ctx.save(); if (isFrozen) { ctx.globalAlpha = 0.7; ctx.filter = 'hue-rotate(180deg)'; }
        if (type === 'wildcat') {
            ctx.fillStyle = '#D2691E'; ctx.beginPath(); ctx.ellipse(x + width / 2, y + height * 0.6, width * 0.4, height * 0.35, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + width / 2, y + height * 0.3, width * 0.3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + width * 0.25, y + height * 0.1); ctx.lineTo(x + width * 0.35, y + height * 0.25); ctx.lineTo(x + width * 0.15, y + height * 0.25); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + width * 0.75, y + height * 0.1); ctx.lineTo(x + width * 0.85, y + height * 0.25); ctx.lineTo(x + width * 0.65, y + height * 0.25); ctx.fill();
            ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.ellipse(x + width * 0.4, y + height * 0.28, 4, 5, 0, 0, Math.PI * 2); ctx.ellipse(x + width * 0.6, y + height * 0.28, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x + width * 0.4, y + height * 0.28, 2, 3, 0, 0, Math.PI * 2); ctx.ellipse(x + width * 0.6, y + height * 0.28, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
        } else if (type === 'boar') {
            ctx.fillStyle = '#4A4A4A'; ctx.beginPath(); ctx.ellipse(x + width / 2, y + height * 0.6, width * 0.45, height * 0.35, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(x + width / 2, y + height * 0.35, width * 0.35, height * 0.3, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#6A6A6A'; ctx.beginPath(); ctx.ellipse(x + width / 2, y + height * 0.45, width * 0.15, height * 0.12, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#F5F5F5'; ctx.beginPath(); ctx.moveTo(x + width * 0.35, y + height * 0.5); ctx.lineTo(x + width * 0.25, y + height * 0.35); ctx.lineTo(x + width * 0.4, y + height * 0.45); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + width * 0.65, y + height * 0.5); ctx.lineTo(x + width * 0.75, y + height * 0.35); ctx.lineTo(x + width * 0.6, y + height * 0.45); ctx.fill();
            ctx.fillStyle = '#E74C3C'; ctx.beginPath(); ctx.arc(x + width * 0.35, y + height * 0.3, 5, 0, Math.PI * 2); ctx.arc(x + width * 0.65, y + height * 0.3, 5, 0, Math.PI * 2); ctx.fill();
        }
        const healthPercent = health / maxHealth; ctx.fillStyle = '#333'; ctx.fillRect(x, y - 10, width, 6);
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#E74C3C';
        ctx.fillRect(x, y - 10, width * healthPercent, 6); ctx.restore();
    });
}

function drawItems() {
    items.forEach(item => {
        const { x, y, width, height, type } = item; ctx.save();
        switch (type) {
            case 'gold': ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#B8860B'; ctx.font = 'bold 14px Outfit'; ctx.fillText('$', x + width / 2 - 4, y + height / 2 + 5); break;
            case 'root': ctx.fillStyle = '#E67E22'; ctx.beginPath(); ctx.moveTo(x, y + height); ctx.quadraticCurveTo(x + width / 2, y, x + width, y + height); ctx.quadraticCurveTo(x + width / 2, y + height / 2, x, y + height); ctx.fill(); break;
            case 'acorn': ctx.fillStyle = '#8B4513'; ctx.beginPath(); ctx.ellipse(x + width / 2, y + height * 0.6, width * 0.4, height * 0.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#654321'; ctx.beginPath(); ctx.ellipse(x + width / 2, y + height * 0.3, width * 0.45, height * 0.25, 0, 0, Math.PI); ctx.fill(); break;
            case 'mushroom': ctx.fillStyle = '#E74C3C'; ctx.beginPath(); ctx.ellipse(x + width / 2, y + height * 0.35, width * 0.45, height * 0.3, 0, 0, Math.PI); ctx.fill(); ctx.fillStyle = '#F5DEB3'; ctx.fillRect(x + width * 0.35, y + height * 0.35, width * 0.3, height * 0.5); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + width * 0.4, y + height * 0.25, 3, 0, Math.PI * 2); ctx.arc(x + width * 0.6, y + height * 0.2, 3, 0, Math.PI * 2); ctx.fill(); break;
            case 'ammo': ctx.fillStyle = '#8B4513'; ctx.beginPath(); ctx.ellipse(x + width / 2, y + height / 2, width * 0.45, height * 0.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.font = '16px Arial'; ctx.fillText('🌰', x + 2, y + height - 5); break;
            case 'golden-pouch': ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 15; ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.ellipse(x + width / 2, y + height * 0.6, width * 0.4, height * 0.35, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#B8860B'; ctx.beginPath(); ctx.moveTo(x + width * 0.3, y + height * 0.35); ctx.lineTo(x + width * 0.5, y + height * 0.2); ctx.lineTo(x + width * 0.7, y + height * 0.35); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; break;
        }
        ctx.restore();
    });
}

function drawBullets() {
    ctx.fillStyle = '#8B4513'; bullets.forEach(bullet => {
        ctx.beginPath(); ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#654321'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bullet.x - 4, bullet.y); ctx.lineTo(bullet.x + 4, bullet.y); ctx.stroke();
    });
}

const shakeStyle = document.createElement('style'); shakeStyle.textContent = '.shake { animation: shake 0.5s ease-in-out; } @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }'; document.head.appendChild(shakeStyle);
