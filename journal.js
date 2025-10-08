// ==================== CONFIGURATION ====================
const customEmojis = {
    sus: 'https://assets.vivwebz.net/vivwebz/sus.webp',
    pumpkin_cat: 'https://assets.vivwebz.net/vivwebz/pumpkin-cat.png',
    halloween_bat: 'https://assets.vivwebz.net/vivwebz/halloween-bat.gif',
    ghost_stars: 'https://assets.vivwebz.net/vivwebz/ghost-stars.gif'
};

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

const seasons = {
    0: { text: "Winter", icon: "fa-snowflake" },
    1: { text: "Winter", icon: "fa-snowflake" },
    2: { text: "Spring", icon: "fa-seedling" },
    3: { text: "Spring", icon: "fa-seedling" },
    4: { text: "Spring", icon: "fa-seedling" },
    5: { text: "Summer", icon: "fa-sun" },
    6: { text: "Summer", icon: "fa-sun" },
    7: { text: "Summer", icon: "fa-sun" },
    8: { text: "Fall", icon: "fa-leaf" },
    9: { text: "Fall", icon: "fa-leaf" },
    10: { text: "Fall", icon: "fa-leaf" },
    11: { text: "Winter", icon: "fa-snowflake" }
};

// ==================== STATE ====================
let currentMonth = (() => {
    if (!entries || entries.length === 0) return new Date().getMonth();
    const latest = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return new Date(latest.date).getMonth();
})();

let currentYear = (() => {
    if (!entries || entries.length === 0) return new Date().getFullYear();
    const latest = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return new Date(latest.date).getFullYear();
})();

let currentMusicPlayer = null;
let currentAudio = null;
let currentPage = 1;
const entriesPerPage = 5;
const musicPlayers = {};

// ==================== SNOW ANIMATION ====================
const canvas = document.getElementById('snowCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '9999';

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const snowflakes = [];
const maxSnowflakes = 60;
const accumulation = {};
let meltCounter = 0;

const snowflakeImg = new Image();
snowflakeImg.src = 'https://assets.vivwebz.net/vivwebz/snowfalkees.png';

class Snowflake {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = window.scrollY - 20;
        this.size = Math.random() * 5 + 5;
        this.speed = Math.random() * 0.15 + 0.08;
        this.drift = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.4 + 0.6;
    }
    
    update() {
        const previousY = this.y;
        this.y += this.speed;
        this.x += this.drift;
        
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        
        const container = document.querySelector('.container');
        if (container) {
            const containerRect = container.getBoundingClientRect();
            const containerTopWorld = (containerRect.top + window.scrollY) - 4;
            const containerLeft = containerRect.left;
            const containerRight = containerRect.right;
            
            const isOverContainer = this.x >= containerLeft && this.x <= containerRight;
            
            if (isOverContainer) {
                const accIndex = Math.floor(this.x);
                const currentHeight = accumulation[accIndex] || 0;
                const snowTopWorld = containerTopWorld - currentHeight;
                
                if ((previousY + this.size/2) < snowTopWorld && (this.y + this.size/2) >= snowTopWorld) {
                    const maxHeight = 30;
                    if (currentHeight < maxHeight) {
                        const baseAdd = 0.8;
                        accumulation[accIndex] = currentHeight + baseAdd;
                    }
                    return false;
                }
            }
        }
        
        if ((this.y - window.scrollY) > canvas.height) {
            return false;
        }
        return true;
    }
    
    draw() {
        ctx.globalAlpha = this.opacity;
        if (snowflakeImg.complete) {
            const drawY = this.y - window.scrollY;
            const container = document.querySelector('.container');
            if (container) {
                const rect = container.getBoundingClientRect();
                const containerLeft = rect.left;
                const containerRight = rect.right;
                const containerTopWorld = (rect.top + window.scrollY) - 4;
                const accIndex = Math.floor(this.x);
                const currentHeight = accumulation[accIndex] || 0;
                const snowTopWorld = containerTopWorld - currentHeight;
                const snowTopScreen = snowTopWorld - window.scrollY;
                const overContainer = this.x >= containerLeft && this.x <= containerRight;
                if (overContainer && (drawY + this.size/2) > snowTopScreen) {
                    ctx.globalAlpha = 1.0;
                    return;
                }
            }
            ctx.drawImage(snowflakeImg, this.x - this.size/2, drawY - this.size/2, this.size, this.size);
        } else {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            const drawY = this.y - window.scrollY;
            const container = document.querySelector('.container');
            if (container) {
                const rect = container.getBoundingClientRect();
                const containerLeft = rect.left;
                const containerRight = rect.right;
                const containerTopWorld = (rect.top + window.scrollY) - 4;
                const accIndex = Math.floor(this.x);
                const currentHeight = accumulation[accIndex] || 0;
                const snowTopWorld = containerTopWorld - currentHeight;
                const snowTopScreen = snowTopWorld - window.scrollY;
                const overContainer = this.x >= containerLeft && this.x <= containerRight;
                if (overContainer && (drawY + this.size/2) > snowTopScreen) {
                    ctx.globalAlpha = 1.0;
                    return;
                }
            }
            ctx.arc(this.x, drawY, this.size/2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    }
}

function drawAccumulatedSnow() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const containerTopWorld = (containerRect.top + window.scrollY) - 4;
    const containerLeft = containerRect.left;
    const containerRight = containerRect.right;
    
    ctx.fillStyle = '#FFFFFF';
    
    for (let x = Math.floor(containerLeft); x <= Math.ceil(containerRight); x++) {
        const height = accumulation[x] || 0;
        if (height > 0) {
            const chunkSize = 2;
            const numChunks = Math.ceil(height / chunkSize);
            
            for (let i = 0; i < numChunks; i++) {
                const yWorld = containerTopWorld - (i * chunkSize) - chunkSize;
                const yScreen = yWorld - window.scrollY;
                ctx.fillRect(x - 1, yScreen, chunkSize, chunkSize);
            }
        }
    }
}

function meltSnow() {
    meltCounter++;
    if (meltCounter % 180 === 0) {
        const keys = Object.keys(accumulation);
        if (keys.length > 0) {
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            if (accumulation[randomKey] > 0) {
                accumulation[randomKey] -= 0.2;
                if (accumulation[randomKey] <= 0) {
                    delete accumulation[randomKey];
                }
            }
        }
    }
}

function animateSnow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (snowflakes.length < maxSnowflakes && Math.random() > 0.92) {
        snowflakes.push(new Snowflake());
    }
    
    drawAccumulatedSnow();
    
    for (let i = snowflakes.length - 1; i >= 0; i--) {
        if (!snowflakes[i].update()) {
            snowflakes.splice(i, 1);
        } else {
            snowflakes[i].draw();
        }
    }
    
    meltSnow();
    
    requestAnimationFrame(animateSnow);
}

// ==================== TEXT RENDERING ====================
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderTextInline(rawText, entryId) {
    const tokenRegex = /(\[img\s+[^\]]+\])|(\[music\s+[^\]]+\])|:([a-z0-9_]+):/gi;
    let result = '';
    let last = 0;
    let musicIndex = 0;
    let m;
    while ((m = tokenRegex.exec(rawText)) !== null) {
        result += escapeHtml(rawText.slice(last, m.index));
        const [full, imgTok, musicTok, emojiName] = m;
        if (imgTok) {
            const urlMatch = /\[img\s+([^\]]+)\]/i.exec(imgTok);
            const url = urlMatch ? urlMatch[1].trim() : '';
            const safeUrl = url;
            result += `<img src="${safeUrl}" class="entry-inline-image" alt="image">`;
        } else if (musicTok) {
            const parts = /\[music\s+([^\]\s]+)(?:\s+([^\]]+))?\]/i.exec(musicTok);
            const audioUrl = parts && parts[1] ? parts[1].trim() : '';
            const coverUrl = parts && parts[2] ? parts[2].trim() : '';
            const diskId = `${entryId}-m${musicIndex++}`;
            const cover = coverUrl || 'https://assets.vivwebz.net/vivwebz/vinyl.png';
            result += `<img src="${cover}" class="music-player" id="music-player-${diskId}" data-entry-id="${entryId}" data-audio-url="${audioUrl}" onclick="toggleMusicInline('${diskId}', this)">`;
        } else if (emojiName) {
            const name = emojiName.toLowerCase();
            const url = customEmojis[name];
            if (url) {
                result += `<span class="emoji-wrapper"><img src="${url}" class="custom-emoji" alt="${name}"><div class="tooltip">${name}</div></span>`;
            } else {
                result += escapeHtml(full);
            }
        }
        last = m.index + full.length;
    }
    result += escapeHtml(rawText.slice(last));
    return result;
}

// ==================== MUSIC PLAYER ====================
function initMusicPlayer(playerKey) {
    if (!musicPlayers[playerKey]) {
        musicPlayers[playerKey] = {
            rotation: 0,
            velocity: 0,
            targetVelocity: 0,
            animating: false,
            animationFrame: null
        };
    }
    return musicPlayers[playerKey];
}

function animateRotation(playerKey, element) {
    const player = musicPlayers[playerKey];

    const now = performance.now();
    if (!player.lastTime) player.lastTime = now;
    const deltaTime = (now - player.lastTime) / 4.167; // Normalize to 240fps
    player.lastTime = now;

    const velocityDiff = player.targetVelocity - player.velocity;
    player.velocity += velocityDiff * 0.02 * deltaTime;

    player.rotation += player.velocity * deltaTime;

    element.style.transform = `rotate(${player.rotation}deg)`;

    if (currentAudio && currentMusicPlayer === element) {
        const playbackRate = 0.1 + (player.velocity / 8) * 0.9;
        currentAudio.playbackRate = Math.max(0.1, Math.min(1.0, playbackRate));

        const volumeFactor = Math.min(1.0, player.velocity / 4);
        currentAudio.volume = Math.max(0, volumeFactor);
    }

    if (Math.abs(velocityDiff) > 0.005 || Math.abs(player.velocity) > 0.005) {
        player.animationFrame = requestAnimationFrame(() => animateRotation(playerKey, element));
    } else {
        player.animating = false;
        player.velocity = player.targetVelocity;
        player.lastTime = null;

        if (currentAudio && currentMusicPlayer === element) {
            if (player.targetVelocity > 0) {
                currentAudio.playbackRate = 1.0;
                currentAudio.volume = 1.0;
            } else {
                currentAudio.pause();
                currentAudio.playbackRate = 1.0;
                currentAudio.volume = 1.0;
            }
        }
    }
}

function toggleMusicInline(playerKey, imgElement) {
    const player = initMusicPlayer(playerKey);
    
    if (currentMusicPlayer === imgElement && currentAudio) {
        if (currentAudio.paused) {
            player.targetVelocity = 8;
            currentAudio.playbackRate = 0.1 + (player.velocity / 8) * 0.9;
            currentAudio.play();

            if (!player.animating) {
                player.animating = true;
                animateRotation(playerKey, imgElement);
            }
            
        } else {
            player.targetVelocity = 0;

            if (!player.animating) {
                player.animating = true;
                animateRotation(playerKey, imgElement);
            }
        }
    } else {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
            if (currentMusicPlayer) {
                const oldKey = Object.keys(musicPlayers).find(k => document.getElementById(`music-player-${k}`) === currentMusicPlayer);
                const oldPlayer = oldKey ? musicPlayers[oldKey] : null;
                if (oldPlayer) {
                    oldPlayer.targetVelocity = 0;
                    if (!oldPlayer.animating) {
                        oldPlayer.animating = true;
                        animateRotation(oldKey, currentMusicPlayer);
                    }
                }
            }
        }
        
        const audioUrl = imgElement.getAttribute('data-audio-url');
        currentAudio = new Audio(audioUrl);
        currentAudio.loop = true;
        currentAudio.playbackRate = 0.1 + (player.velocity / 8) * 0.9;
        currentAudio.play();
        
        currentMusicPlayer = imgElement;
        
        player.targetVelocity = 8;
        if (!player.animating) {
            player.animating = true;
            animateRotation(playerKey, imgElement);
        }
    }
}

// ==================== ENTRY RENDERING ====================
function renderEntries() {
    const container = document.getElementById('entriesContainer');
    
    const existingEntries = container.querySelectorAll('.entry');
    existingEntries.forEach(entry => {
        entry.classList.add('page-exit');
    });
    
    setTimeout(() => {
        container.innerHTML = '';
        
        const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const totalPages = Math.ceil(sortedEntries.length / entriesPerPage);
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = startIndex + entriesPerPage;
        const pageEntries = sortedEntries.slice(startIndex, endIndex);
        
        pageEntries.forEach((entry, index) => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'entry page-enter';
            entryDiv.style.animationDelay = `${index * 0.05}s`;
            entryDiv.dataset.date = entry.date;
            entryDiv.dataset.id = entry.id;
            
            const dateObj = new Date(entry.date);
            const dateStr = dateObj.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            let bodyHTML = '<div class="entry-body">';
            
            bodyHTML += '<div class="entry-content">';
            bodyHTML += `<div class="entry-text">${renderTextInline(entry.text, entry.id)}</div>`;
            
            bodyHTML += '</div></div>';
            
            entryDiv.innerHTML = `
                <div class="entry-header">
                    <div class="entry-header-left">
                        <div class="entry-title"><i class="fas fa-pen"></i> ${entry.title}</div>
                        <div class="entry-date"><i class="fas fa-clock"></i> ${dateStr}</div>
                    </div>
                    <div class="entry-post-number"><i class="fas fa-hashtag"></i> ${entry.id}<div class="tooltip">Post ID</div></div>
                </div>
                ${bodyHTML}
            `;
            
            container.appendChild(entryDiv);
            
            const inlinePlayers = entryDiv.querySelectorAll('.music-player[id^="music-player-"]');
            inlinePlayers.forEach(el => {
                const key = el.id.replace('music-player-','');
                const state = musicPlayers[key];
                if (state && state.rotation) {
                    el.style.transform = `rotate(${state.rotation}deg)`;
                    if (state.targetVelocity !== 0) {
                        animateRotation(key, el);
                    }
                }
            });
        });
        
        updatePagination(totalPages);
    }, existingEntries.length > 0 ? 250 : 0);
}

function updatePagination(totalPages) {
    document.getElementById('pageInfo').innerHTML = `<i class="fas fa-file-alt"></i> Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function changePage(direction) {
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalPages = Math.ceil(sortedEntries.length / entriesPerPage);
    
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    renderEntries();
}

// ==================== CALENDAR ====================
function renderCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const prevLastDay = new Date(currentYear, currentMonth, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const lastDate = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    document.getElementById('monthYear').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const season = seasons[currentMonth];
    document.getElementById('seasonIndicator').innerHTML = `<i class="fas ${season.icon}"></i> ${season.text}`;
    
    const today = new Date();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = prevLastDate - i;
        calendarDays.appendChild(day);
    }
    
    for (let i = 1; i <= lastDate; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;
        
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        const entriesOnDate = entries.filter(e => e.date === dateStr);
        
        if (entriesOnDate.length > 0) {
            day.classList.add('has-entry');
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = `<i class="fas fa-book"></i> ${entriesOnDate.length} ${entriesOnDate.length === 1 ? 'entry' : 'entries'}`;
            day.appendChild(tooltip);
            
            day.onclick = () => scrollToDate(dateStr);
        }
        
        if (today.getDate() === i && today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
            day.classList.add('today');
            const t = document.createElement('div');
            t.className = 'tooltip';
            t.textContent = 'Today';
            day.appendChild(t);
        }
        
        calendarDays.appendChild(day);
    }
    
    const remainingDays = 42 - (firstDayOfWeek + lastDate);
    for (let i = 1; i <= remainingDays; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = i;
        calendarDays.appendChild(day);
    }
}

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function scrollToDate(dateStr) {
    const entryWithDate = entries.find(e => e.date === dateStr);
    if (!entryWithDate) return;
    
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const entryIndex = sortedEntries.findIndex(e => e.id === entryWithDate.id);
    const targetPage = Math.floor(entryIndex / entriesPerPage) + 1;
    
    if (targetPage !== currentPage) {
        currentPage = targetPage;
        renderEntries();
        
        setTimeout(() => {
            highlightEntry(entryWithDate.id);
        }, 500);
    } else {
        highlightEntry(entryWithDate.id);
    }
}

function highlightEntry(entryId) {
    const entryElement = document.querySelector(`[data-id="${entryId}"]`);
    if (entryElement) {
        entryElement.style.background = '#fffacd';
        entryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            entryElement.style.background = '';
        }, 2000);
    }
}

// ==================== INITIALIZATION ====================
renderEntries();
renderCalendar();
animateSnow();

