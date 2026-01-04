// Игровые переменные
let gameState = {
    level: 1,
    xp: 0,
    xpNeeded: 100,
    health: 100,
    mood: 80,
    energy: 90,
    coins: 150,
    inventory: [],
    rewardsUnlocked: [1],
    lastActionTime: Date.now(),
    moodText: "😊 Счастлива",
    moodImage: "default"
};

// Элементы DOM
const levelEl = document.getElementById('level');
const xpEl = document.getElementById('xp');
const healthEl = document.getElementById('health');
const moodEl = document.getElementById('mood');
const energyEl = document.getElementById('energy');
const coinsEl = document.getElementById('coins');
const levelFillEl = document.getElementById('level-fill');
const healthFillEl = document.getElementById('health-fill');
const moodFillEl = document.getElementById('mood-fill');
const energyFillEl = document.getElementById('energy-fill');
const carryImage = document.getElementById('carry-image');
const characterMood = document.getElementById('character-mood');
const gameLog = document.getElementById('game-log');
const inventoryEl = document.getElementById('inventory-items');

// Инициализация игры
function initGame() {
    loadGame();
    updateDisplay();
    startGameLoop();
    addLog("Игра загружена! Позаботься о Кэри.");
}

// Основной игровой цикл
function startGameLoop() {
    setInterval(() => {
        // Постепенное уменьшение показателей
        gameState.health = Math.max(0, gameState.health - 0.1);
        gameState.mood = Math.max(0, gameState.mood - 0.05);
        gameState.energy = Math.max(0, gameState.energy - 0.07);
        
        // Автоматическое восстановление энергии при низких значениях
        if (gameState.energy < 20) {
            gameState.energy += 0.1;
        }
        
        updateMood();
        updateDisplay();
        
        // Проверка на уровень
        checkLevelUp();
        
        // Сохраняем игру каждые 30 секунд
        if (Date.now() - gameState.lastActionTime > 30000) {
            saveGame();
            gameState.lastActionTime = Date.now();
        }
    }, 10000); // Обновление каждые 10 секунд
}

// Обновление отображения
function updateDisplay() {
    levelEl.textContent = gameState.level;
    xpEl.textContent = `${Math.floor(gameState.xp)}/${gameState.xpNeeded}`;
    healthEl.textContent = Math.floor(gameState.health);
    moodEl.textContent = Math.floor(gameState.mood);
    energyEl.textContent = Math.floor(gameState.energy);
    coinsEl.textContent = Math.floor(gameState.coins);
    
    levelFillEl.style.width = `${(gameState.xp / gameState.xpNeeded) * 100}%`;
    healthFillEl.style.width = `${gameState.health}%`;
    moodFillEl.style.width = `${gameState.mood}%`;
    energyFillEl.style.width = `${gameState.energy}%`;
    
    characterMood.textContent = gameState.moodText;
    
    // Обновление изображения в зависимости от настроения
    let imageName = "carry-default.png";
    if (gameState.mood > 80) imageName = "carry-happy.png";
    else if (gameState.mood < 40) imageName = "carry-sad.png";
    else if (gameState.health < 40) imageName = "carry-sick.png";
    else if (gameState.energy < 30) imageName = "carry-tired.png";
    
    carryImage.src = `images/${imageName}`;
    
    // Обновление инвентаря
    updateInventory();
    
    // Обновление наград
    updateRewards();
}

// Обновление настроения
function updateMood() {
    if (gameState.mood >= 80) {
        gameState.moodText = "😊 Счастлива";
    } else if (gameState.mood >= 60) {
        gameState.moodText = "🙂 Довольна";
    } else if (gameState.mood >= 40) {
        gameState.moodText = "😐 Нормально";
    } else if (gameState.mood >= 20) {
        gameState.moodText = "😟 Грустно";
    } else {
        gameState.moodText = "😭 Плачет";
    }
}

// Действия игрока
function feed() {
    if (gameState.coins >= 5) {
        gameState.coins -= 5;
        gameState.health = Math.min(100, gameState.health + 15);
        gameState.mood = Math.min(100, gameState.mood + 5);
        gameState.energy = Math.min(100, gameState.energy + 5);
        gameState.xp += 5;
        addLog("Вы покормили Кэри. +15 здоровья, +5 настроения");
        animateAction();
    } else {
        addLog("Недостаточно коинов для еды!");
    }
    updateDisplay();
}

function play() {
    if (gameState.energy >= 3) {
        gameState.energy -= 3;
        gameState.mood = Math.min(100, gameState.mood + 20);
        gameState.health = Math.min(100, gameState.health + 5);
        gameState.xp += 8;
        addLog("Вы поиграли с Кэри. +20 настроения, -3 энергии");
        animateAction();
    } else {
        addLog("У Кэри недостаточно энергии для игр!");
    }
    updateDisplay();
}

function sleep() {
    gameState.energy = Math.min(100, gameState.energy + 40);
    gameState.health = Math.min(100, gameState.health + 10);
    gameState.mood = Math.min(100, gameState.mood + 5);
    gameState.xp += 10;
    addLog("Кэри поспала. +40 энергии, +10 здоровья");
    animateAction();
    updateDisplay();
}

function study() {
    if (gameState.energy >= 10) {
        gameState.energy -= 10;
        gameState.xp += 15;
        gameState.mood = Math.max(0, gameState.mood - 5);
        addLog("Кэри поучилась. +15 опыта, -10 энергии");
        animateAction();
    } else {
        addLog("Слишком устала для учебы!");
    }
    updateDisplay();
}

function beauty() {
    if (gameState.coins >= 7) {
        gameState.coins -= 7;
        gameState.mood = Math.min(100, gameState.mood + 25);
        gameState.xp += 12;
        addLog("Кэри сделала уход за собой. +25 настроения, -7 коинов");
        animateAction();
    } else {
        addLog("Недостаточно коинов для процедур красоты!");
    }
    updateDisplay();
}

// Покупка в магазине
function buyItem(item, price) {
    if (gameState.coins >= price) {
        gameState.coins -= price;
        gameState.inventory.push(item);
        gameState.mood = Math.min(100, gameState.mood + 30);
        gameState.xp += 20;
        addLog(`Вы купили ${item} за ${price} коинов. Кэри в восторге!`);
        animateAction();
        updateDisplay();
    } else {
        addLog(`Недостаточно коинов для покупки ${item}! Нужно ${price} коинов.`);
    }
}

// Подключение Telegram бота
function connectTelegram() {
    // В реальной игре здесь будет интеграция с Telegram API
    addLog("Подключение к Telegram боту...");
    addLog("Перейдите к @CariversGameBot и нажмите /start");
    
    // Имитация подключения
    setTimeout(() => {
        gameState.coins += 50;
        addLog("Бот подключен! Получено 50 коинов за подключение.");
        addLog("Ежедневно заходите через бота для получения бонусов!");
        updateDisplay();
    }, 1500);
}

// Проверка повышения уровня
function checkLevelUp() {
    if (gameState.xp >= gameState.xpNeeded) {
        gameState.level++;
        gameState.xp = gameState.xp - gameState.xpNeeded;
        gameState.xpNeeded = Math.floor(gameState.xpNeeded * 1.5);
        
        // Награда за уровень
        let rewardCoins = gameState.level * 50;
        gameState.coins += rewardCoins;
        
        // Разблокировка новой награды
        if (!gameState.rewardsUnlocked.includes(gameState.level)) {
            gameState.rewardsUnlocked.push(gameState.level);
        }
        
        addLog(`🎉 Поздравляем! Кэри достигла ${gameState.level} уровня!`);
        addLog(`🎁 Получено ${rewardCoins} коинов в награду!`);
        
        // Специальные награды за определенные уровни
        if (gameState.level === 3) {
            addLog("📚 Доступен гайд 'Уход за кожей' в разделе наград!");
        } else if (gameState.level === 5) {
            addLog("💄 Доступен гайд 'Макияж для начинающих'!");
        } else if (gameState.level === 8) {
            addLog("👗 Доступен гайд 'Стиль и гардероб'!");
        } else if (gameState.level === 10) {
            addLog("🌟 ДОСТИЖЕНИЕ: Максимальный уровень! Открыт VIP гайд!");
        }
        
        animateLevelUp();
    }
}

// Анимация действия
function animateAction() {
    const character = document.getElementById('carry-character');
    character.classList.add('pulse');
    setTimeout(() => {
        character.classList.remove('pulse');
    }, 500);
}

// Анимация повышения уровня
function animateLevelUp() {
    const character = document.getElementById('carry-character');
    character.classList.add('pulse');
    
    // Создаем эффект конфетти
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.background = ['#ff5d8f', '#ffafcc', '#a2d2ff', '#cdb4db'][Math.floor(Math.random() * 4)];
            confetti.style.borderRadius = '50%';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = '0';
            confetti.style.zIndex = '1000';
            character.appendChild(confetti);
            
            // Анимация падения
            setTimeout(() => {
                confetti.style.transition = 'all 1s';
                confetti.style.top = '100%';
                confetti.style.opacity = '0';
                
                setTimeout(() => {
                    confetti.remove();
                }, 1000);
            }, 10);
        }, i * 100);
    }
    
    setTimeout(() => {
        character.classList.remove('pulse');
    }, 2000);
}

// Обновление инвентаря
function updateInventory() {
    if (gameState.inventory.length === 0) {
        inventoryEl.innerHTML = '<p>Пока пусто...</p>';
        return;
    }
    
    inventoryEl.innerHTML = gameState.inventory
        .map(item => `<div class="shop-item"><i class="fas fa-check-circle"></i> ${item}</div>`)
        .join('');
}

// Обновление наград
function updateRewards() {
    const rewardItems = document.querySelectorAll('.reward-item');
    rewardItems.forEach((item, index) => {
        const level = index + 1;
        if (gameState.rewardsUnlocked.includes(level)) {
            item.classList.add('unlocked');
        } else {
            item.classList.remove('unlocked');
        }
    });
}

// Добавление записи в лог
function addLog(message) {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry fade-in';
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    gameLog.appendChild(logEntry);
    
    // Автопрокрутка к новым сообщениям
    gameLog.scrollTop = gameLog.scrollHeight;
}

// Сохранение игры
function saveGame() {
    localStorage.setItem('carivers_save', JSON.stringify(gameState));
}

// Загрузка игры
function loadGame() {
    const saved = localStorage.getItem('carivers_save');
    if (saved) {
        gameState = JSON.parse(saved);
        addLog("Игра загружена из сохранения.");
    }
}

// Модальные окна
function showInstructions() {
    document.getElementById('instructions-modal').style.display = 'block';
}

function showAbout() {
    alert("Carivers - игра-тамагочи про девочку Кэри.\n\nЗаботьтесь о Кэри, повышайте уровень и получайте эксклюзивные beauty-гайды!\n\nИгра создана
