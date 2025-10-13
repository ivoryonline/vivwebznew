// State
let currentAudio = null;
let currentAlbum = null;
let currentSongItem = null;
let currentSongIcon = null;
let diskRotation = 0;
let diskVelocity = 0;
let targetVelocity = 0;
let isAnimating = false;
let animationFrame = null;
let lastTime = null;

// Initialize gallery
function initGallery() {
    const grid = document.getElementById('albumGrid');
    grid.innerHTML = '';
    
    albums.forEach((album, index) => {
        const item = document.createElement('div');
        item.className = 'album-item';
        item.style.animationDelay = `${index * 0.1}s`;
        
        item.innerHTML = `
            <img src="${album.cover}" alt="${album.title}" class="album-cover">
            <div class="tooltip">${album.title}</div>
        `;
        
        item.addEventListener('click', () => openAlbum(album));
        grid.appendChild(item);
    });
}

// Open album player
function openAlbum(album) {
    currentAlbum = album;
    
    const galleryView = document.getElementById('galleryView');
    const playerView = document.getElementById('playerView');
    
    galleryView.classList.add('fade-out');
    
    setTimeout(() => {
        galleryView.style.display = 'none';
        playerView.classList.add('active');
        
        setTimeout(() => {
            playerView.classList.add('fade-in');
            loadAlbum(album);
        }, 50);
    }, 600);
}

// Load album into player
function loadAlbum(album) {
    document.getElementById('albumTitle').textContent = album.title;
    
    const songList = document.getElementById('songList');
    songList.innerHTML = '';
    
    album.songs.forEach((song, index) => {
        const item = document.createElement('div');
        item.className = 'song-item';
        item.dataset.songUrl = song.url;
        item.innerHTML = `
            <img src="${song.icon}" alt="${song.title}" class="song-icon">
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <i class="fas fa-play song-play-icon"></i>
        `;
        
        item.addEventListener('click', () => toggleSong(song, item));
        songList.appendChild(item);
    });
}

// Toggle song playback
function toggleSong(song, itemElement) {
    const playIcon = itemElement.querySelector('.song-play-icon');
    const songIcon = itemElement.querySelector('.song-icon');
    const defaultDisk = document.getElementById('playerDiskDefault');
    const customDisk = document.getElementById('playerDiskCustom');
    
    // If clicking the same song that's currently loaded
    if (currentAudio && currentSongItem === itemElement) {
        if (currentAudio.paused) {
            // Resume playback
            currentAudio.play().catch(e => console.log('Play error:', e));
            targetVelocity = 8;
            playIcon.className = 'fas fa-pause song-play-icon';
            itemElement.classList.add('active');
            songIcon.classList.add('spinning');
            
            if (!isAnimating) {
                isAnimating = true;
                animateDisk();
            }
        } else {
            // Pause playback
            currentAudio.pause();
            targetVelocity = 0;
            playIcon.className = 'fas fa-play song-play-icon';
            itemElement.classList.remove('active');
            
            if (!isAnimating) {
                isAnimating = true;
                animateDisk();
            }
        }
    } else {
        // Stop current song if playing
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        
        // Reset all song items and their icons
        const allItems = document.querySelectorAll('.song-item');
        allItems.forEach(item => {
            item.classList.remove('active');
            item.querySelector('.song-play-icon').className = 'fas fa-play song-play-icon';
            const icon = item.querySelector('.song-icon');
            icon.classList.remove('spinning');
            icon.style.transform = 'rotate(0deg)';
        });
        
        // Update disk image with crossfade
        currentSongIcon = song.icon;
        customDisk.src = song.icon;
        
        if (song.icon !== 'https://assets.vivwebz.net/vivwebz/vinyl.png') {
            customDisk.classList.add('visible');
            defaultDisk.classList.add('hidden');
        } else {
            customDisk.classList.remove('visible');
            defaultDisk.classList.remove('hidden');
        }
        
        // Create and play new audio
        currentAudio = new Audio(song.url);
        currentAudio.loop = true;
        currentAudio.volume = document.getElementById('volumeSlider').value / 100;
        currentAudio.playbackRate = 1.0;
        
        // Set up event listeners for smooth playback
        currentAudio.addEventListener('canplaythrough', () => {
            console.log('Audio ready to play');
        });
        
        currentAudio.addEventListener('waiting', () => {
            console.log('Audio buffering...');
        });
        
        currentAudio.addEventListener('playing', () => {
            console.log('Audio playing');
        });
        
        // Play the audio
        currentAudio.play().then(() => {
            currentSongItem = itemElement;
            targetVelocity = 8;
            playIcon.className = 'fas fa-pause song-play-icon';
            itemElement.classList.add('active');
            songIcon.classList.add('spinning');
            
            if (!isAnimating) {
                isAnimating = true;
                animateDisk();
            }
        }).catch(e => {
            console.log('Play error:', e);
        });
    }
}

// Animate disk rotation
function animateDisk() {
    const defaultDisk = document.getElementById('playerDiskDefault');
    const customDisk = document.getElementById('playerDiskCustom');
    const now = performance.now();
    
    if (!lastTime) lastTime = now;
    const deltaTime = (now - lastTime) / 4.167;
    lastTime = now;
    
    const velocityDiff = targetVelocity - diskVelocity;
    diskVelocity += velocityDiff * 0.02 * deltaTime;
    
    diskRotation += diskVelocity * deltaTime;
    
    // Apply rotation to both disks
    defaultDisk.style.transform = `rotate(${diskRotation}deg)`;
    customDisk.style.transform = `rotate(${diskRotation}deg)`;
    
    // Sync rotation to song list icon only if it's marked as spinning
    if (currentSongItem) {
        const songIcon = currentSongItem.querySelector('.song-icon');
        if (songIcon && songIcon.classList.contains('spinning')) {
            songIcon.style.transform = `rotate(${diskRotation}deg)`;
        }
    }
    
    if (Math.abs(velocityDiff) > 0.005 || Math.abs(diskVelocity) > 0.005) {
        animationFrame = requestAnimationFrame(animateDisk);
    } else {
        isAnimating = false;
        diskVelocity = targetVelocity;
        lastTime = null;
    }
}

// Volume control
document.getElementById('volumeSlider').addEventListener('input', (e) => {
    const value = e.target.value;
    document.getElementById('volumeValue').textContent = `${value}%`;
    
    if (currentAudio) {
        currentAudio.volume = value / 100;
    }
});

// Back button
document.getElementById('backButton').addEventListener('click', () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    
    currentSongItem = null;
    currentSongIcon = null;
    targetVelocity = 0;
    diskVelocity = 0;
    diskRotation = 0;
    
    // Reset disk images
    const defaultDisk = document.getElementById('playerDiskDefault');
    const customDisk = document.getElementById('playerDiskCustom');
    defaultDisk.classList.remove('hidden');
    customDisk.classList.remove('visible');
    defaultDisk.style.transform = 'rotate(0deg)';
    customDisk.style.transform = 'rotate(0deg)';
    
    const galleryView = document.getElementById('galleryView');
    const playerView = document.getElementById('playerView');
    
    playerView.classList.remove('fade-in');
    
    setTimeout(() => {
        playerView.classList.remove('active');
        galleryView.style.display = 'flex';
        
        setTimeout(() => {
            galleryView.classList.remove('fade-out');
        }, 50);
    }, 600);
});

// Initialize
initGallery();
