class CustomVideoPlayer extends HTMLElement {
  constructor() {
    super();
    this.qualities = [];
    this.loadTimeout = null;
    this.hasInteracted = false;
  }
  
  connectedCallback() {
    const src = this.getAttribute('src');
    const src1080 = this.getAttribute('src-1080');
    const src720 = this.getAttribute('src-720');
    const src480 = this.getAttribute('src-480');
    const src360 = this.getAttribute('src-360');
    const logo = this.getAttribute('logo');
    const poster = this.getAttribute('poster') || '';
    
    this.qualitySources = {
      'Auto': src,
      '1080p': src1080 || src,
      '720p': src720 || src,
      '480p': src480 || src,
      '360p': src360 || src
    };
    
    this.innerHTML = `
      <style>
        .cvp-container {
          position: relative;
          width: 100%;
          max-width: 800px;
          background: #000;
          border: 3px solid #3a3a3a;
          box-shadow: 5px 5px 0px rgba(0,0,0,0.2);
          margin: 15px 0;
        }
        
        .cvp-container video {
          width: 100%;
          display: block;
        }
        
        .cvp-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 48px;
          color: #fff;
          animation: spin 1s linear infinite;
          display: none;
          z-index: 10;
        }
        
        .cvp-container.cvp-buffering .cvp-loading {
          display: block;
        }
        
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        .cvp-error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.9);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 20;
        }
        
        .cvp-container.cvp-error .cvp-error-overlay {
          display: flex;
        }
        
        .cvp-error-content {
          text-align: center;
          color: #fff;
        }
        
        .cvp-error-content i {
          font-size: 48px;
          color: #ff6347;
          margin-bottom: 15px;
        }
        
        .cvp-error-content p {
          font-size: 16px;
          margin-bottom: 20px;
        }
        
        .cvp-retry-btn {
          background: #d4d4bc;
          border: 2px solid #3a3a3a;
          padding: 10px 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        
        .cvp-retry-btn:hover {
          background: #c4c4ac;
          transform: translateY(-2px);
        }
        
        .cvp-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 5;
        }
        
        .cvp-container:hover .cvp-controls,
        .cvp-container.cvp-paused .cvp-controls {
          opacity: 1;
        }
        
        .cvp-progress-container {
          height: 6px;
          background: rgba(255,255,255,0.3);
          cursor: pointer;
          position: relative;
        }
        
        .cvp-progress-buffered {
          position: absolute;
          height: 100%;
          background: rgba(255,255,255,0.5);
          width: 0%;
        }
        
        .cvp-progress-filled {
          position: absolute;
          height: 100%;
          background: #8b7355;
          width: 0%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        
        .cvp-progress-thumb {
          width: 12px;
          height: 12px;
          background: #fff;
          border-radius: 50%;
          transform: translateX(50%);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .cvp-progress-container:hover .cvp-progress-thumb {
          opacity: 1;
        }
        
        .cvp-controls-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
        }
        
        .cvp-logo {
          height: 32px;
          width: auto;
          margin-right: 8px;
        }
        
        .cvp-btn {
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 6px;
          font-size: 16px;
          transition: all 0.2s ease;
        }
        
        .cvp-btn:hover {
          transform: scale(1.15);
          color: #8b7355;
        }
        
        .cvp-volume-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .cvp-volume-slider-container {
          width: 0;
          overflow: hidden;
          transition: width 0.3s ease;
        }
        
        .cvp-volume-container:hover .cvp-volume-slider-container {
          width: 80px;
        }
        
        .cvp-volume-slider {
          width: 80px;
          height: 6px;
          background: rgba(255,255,255,0.3);
          cursor: pointer;
          position: relative;
        }
        
        .cvp-volume-filled {
          position: absolute;
          height: 100%;
          background: #8b7355;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        
        .cvp-volume-thumb {
          width: 12px;
          height: 12px;
          background: #fff;
          border-radius: 50%;
          transform: translateX(50%);
        }
        
        .cvp-time {
          color: #fff;
          font-size: 12px;
          white-space: nowrap;
        }
        
        .cvp-spacer {
          flex: 1;
        }
        
        .cvp-quality-container {
          position: relative;
        }
        
        .cvp-quality-menu {
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          background: rgba(0,0,0,0.95);
          border: 2px solid #3a3a3a;
          min-width: 100px;
          display: none;
          z-index: 100;
        }
        
        .cvp-quality-menu.active {
          display: block;
        }
        
        .cvp-quality-option {
          padding: 8px 12px;
          color: #fff;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }
        
        .cvp-quality-option:hover {
          background: rgba(139,115,85,0.8);
        }
        
        .cvp-quality-option.active {
          background: #8b7355;
          font-weight: bold;
        }
      </style>
      <div class="cvp-container cvp-paused">
        <video poster="${poster}" preload="none"></video>
        <i class="fas fa-spinner cvp-loading"></i>
        <div class="cvp-error-overlay">
          <div class="cvp-error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Failed to load video</p>
            <button class="cvp-retry-btn">Retry</button>
          </div>
        </div>
        <div class="cvp-controls">
          <div class="cvp-progress-container">
            <div class="cvp-progress-buffered"></div>
            <div class="cvp-progress-filled">
              <div class="cvp-progress-thumb"></div>
            </div>
          </div>
          <div class="cvp-controls-row">
            ${logo ? `<img src="${logo}" class="cvp-logo" alt="Logo">` : ''}
            <button class="cvp-btn cvp-play"><i class="fas fa-play"></i></button>
            <div class="cvp-volume-container">
              <button class="cvp-btn cvp-volume"><i class="fas fa-volume-up"></i></button>
              <div class="cvp-volume-slider-container">
                <div class="cvp-volume-slider">
                  <div class="cvp-volume-filled">
                    <div class="cvp-volume-thumb"></div>
                  </div>
                </div>
              </div>
            </div>
            <span class="cvp-time">0:00 / 0:00</span>
            <div class="cvp-spacer"></div>
            <div class="cvp-quality-container">
              <button class="cvp-btn cvp-quality"><i class="fas fa-cog"></i></button>
              <div class="cvp-quality-menu"></div>
            </div>
            <button class="cvp-btn cvp-fullscreen"><i class="fas fa-expand"></i></button>
          </div>
        </div>
      </div>
    `;
    
    this.setupPlayer();
  }
  
  setupPlayer() {
    const container = this.querySelector('.cvp-container');
    const video = this.querySelector('video');
    const playBtn = this.querySelector('.cvp-play');
    const volumeBtn = this.querySelector('.cvp-volume');
    const volumeSlider = this.querySelector('.cvp-volume-slider');
    const volumeFilled = this.querySelector('.cvp-volume-filled');
    const timeDisplay = this.querySelector('.cvp-time');
    const progressContainer = this.querySelector('.cvp-progress-container');
    const progressFilled = this.querySelector('.cvp-progress-filled');
    const progressBuffered = this.querySelector('.cvp-progress-buffered');
    const fullscreenBtn = this.querySelector('.cvp-fullscreen');
    const qualityBtn = this.querySelector('.cvp-quality');
    const qualityMenu = this.querySelector('.cvp-quality-menu');
    const errorOverlay = this.querySelector('.cvp-error-overlay');
    const retryBtn = this.querySelector('.cvp-retry-btn');
    
    // Don't auto-load the video source - wait for user interaction
    let videoLoaded = false;
    
    const loadVideo = () => {
      if (!videoLoaded) {
        video.src = this.qualitySources['Auto'];
        videoLoaded = true;
      }
    };
    
    const showError = () => {
      container.classList.remove('cvp-buffering');
      container.classList.add('cvp-error');
      errorOverlay.style.display = 'flex';
      clearTimeout(this.loadTimeout);
    };
    
    const hideError = () => {
      container.classList.remove('cvp-error');
      errorOverlay.style.display = 'none';
    };
    
    const startBuffering = () => {
      container.classList.add('cvp-buffering');
      // Set timeout for excessive buffering (30 seconds)
      clearTimeout(this.loadTimeout);
      this.loadTimeout = setTimeout(() => {
        if (container.classList.contains('cvp-buffering')) {
          console.warn('Video taking too long to load');
        }
      }, 30000);
    };
    
    const stopBuffering = () => {
      container.classList.remove('cvp-buffering');
      clearTimeout(this.loadTimeout);
    };
    
    // Video loading events
    video.addEventListener('loadstart', () => {
      startBuffering();
      hideError();
    });
    
    video.addEventListener('loadeddata', () => {
      stopBuffering();
    });
    
    video.addEventListener('canplay', () => {
      stopBuffering();
    });
    
    video.addEventListener('canplaythrough', () => {
      stopBuffering();
    });
    
    video.addEventListener('waiting', () => {
      startBuffering();
    });
    
    video.addEventListener('playing', () => {
      stopBuffering();
    });
    
    video.addEventListener('error', (e) => {
      console.error('Video error:', video.error);
      showError();
    });
    
    video.addEventListener('stalled', () => {
      console.warn('Video stalled');
      startBuffering();
    });
    
    video.addEventListener('suspend', () => {
      stopBuffering();
    });
    
    // Retry button
    retryBtn.addEventListener('click', () => {
      hideError();
      const currentSrc = video.src;
      video.src = '';
      setTimeout(() => {
        video.src = currentSrc;
        video.load();
      }, 100);
    });
    
    // Load video on first interaction with play button or video
    const ensureVideoLoaded = () => {
      if (!this.hasInteracted) {
        this.hasInteracted = true;
        loadVideo();
      }
    };
    
    playBtn.addEventListener('click', () => {
      ensureVideoLoaded();
      
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            container.classList.remove('cvp-paused');
          }).catch(err => {
            console.error('Play failed:', err);
            showError();
          });
        }
      } else {
        video.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        container.classList.add('cvp-paused');
      }
    });
    
    video.addEventListener('click', () => {
      ensureVideoLoaded();
      playBtn.click();
    });
    
    let isDraggingVolume = false;
    
    const updateVolume = (e) => {
      const rect = volumeSlider.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      video.volume = pos;
      volumeFilled.style.width = (pos * 100) + '%';
      updateVolumeIcon();
    };
    
    volumeSlider.addEventListener('mousedown', (e) => {
      isDraggingVolume = true;
      updateVolume(e);
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDraggingVolume) {
        updateVolume(e);
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDraggingVolume = false;
    });
    
    volumeBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      updateVolumeIcon();
    });
    
    function updateVolumeIcon() {
      const vol = video.muted ? 0 : video.volume;
      volumeFilled.style.width = (video.muted ? 0 : video.volume * 100) + '%';
      let icon = 'fa-volume-up';
      if (vol === 0) icon = 'fa-volume-mute';
      else if (vol < 0.5) icon = 'fa-volume-down';
      volumeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    }
    
    video.addEventListener('timeupdate', () => {
      const percent = (video.currentTime / video.duration) * 100;
      progressFilled.style.width = percent + '%';
      
      const current = formatTime(video.currentTime);
      const duration = formatTime(video.duration);
      timeDisplay.textContent = `${current} / ${duration}`;
    });
    
    video.addEventListener('progress', () => {
      if (video.buffered.length > 0) {
        const buffered = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
        progressBuffered.style.width = buffered + '%';
      }
    });
    
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * video.duration;
    });
    
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          console.error('Fullscreen failed:', err);
        });
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
      } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
      }
    });
    
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
      }
    });
    
    qualityBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      qualityMenu.classList.toggle('active');
    });
    
    // Only show qualities that have actual sources
    const availableQualities = ['Auto'];
    Object.keys(this.qualitySources).forEach(q => {
      if (q !== 'Auto' && this.qualitySources[q] !== this.qualitySources['Auto']) {
        availableQualities.push(q);
      }
    });
    
    availableQualities.forEach((q, i) => {
      const opt = document.createElement('div');
      opt.className = 'cvp-quality-option' + (i === 0 ? ' active' : '');
      opt.textContent = q;
      opt.addEventListener('click', () => {
        ensureVideoLoaded();
        
        const currentTime = video.currentTime;
        const wasPlaying = !video.paused;
        
        hideError();
        video.src = this.qualitySources[q];
        video.load();
        video.currentTime = currentTime;
        
        if (wasPlaying) {
          video.play().catch(err => {
            console.error('Play after quality change failed:', err);
          });
        }
        
        document.querySelectorAll('.cvp-quality-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        qualityMenu.classList.remove('active');
      });
      qualityMenu.appendChild(opt);
    });
    
    document.addEventListener('click', () => {
      qualityMenu.classList.remove('active');
    });
    
    function formatTime(seconds) {
      if (isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Initialize volume display
    updateVolumeIcon();
  }
  
  disconnectedCallback() {
    clearTimeout(this.loadTimeout);
  }
}

customElements.define('custom-video-player', CustomVideoPlayer);
