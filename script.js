class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressSlider = document.getElementById('progressSlider');
        this.progress = document.getElementById('progress');
        this.currentTimeSpan = document.getElementById('currentTime');
        this.durationSpan = document.getElementById('duration');
        this.lyricsContainer = document.getElementById('lyricsContainer');
        
        this.isPlaying = false;
        this.currentTrack = 0;
        this.repeatMode = 1; // автоматический повтор всех треков
        
        // Демо треки с оригинальными текстами
        this.tracks = [
            {
                title: "Migraine",
                artist: "Twenty One Pilots",
                cover: "/img/photo.jpg",
                src: "audio/mind-maze.mp3",
                lyrics: [
                    { time: 0, text: "Am I the only one I know" },
                    { time: 4.5, text: "Waging my wars behind my face and above my throat?" },
                    { time: 10, text: "Shadows will scream that I'm alone-lone-lone" },
                    { time: 27, text: "I-I-I-I-I've got a migraine" },
                    { time: 30, text: "And my pain will range from up, down, and sideways" },
                    { time: 32.5, text: "Thank God it's Friday 'cause Fridays will always be better than Sundays" },
                    { time: 34, text: "'Cause Sundays are my suicide days" },
                    { time: 37.5, text: "I don't know why they always seem so dismal" },
                    { time: 41, text: "Thunderstorms, clouds, snow, and a slight drizzle" },
                    { time: 43.5, text: "Whether it's the weather or the letters by my bed" },
                    { time: 95, text: "Sometimes death seems better than the migraine in my head" },
                    { time: 98, text: "Let it be said what the headache represents" },
                    { time: 412, text: "It's me defending in suspense, it's me suspended in a defenseless test" },
                    { time: 451, text: "Being tested by a ruthless examiner" },
                    { time: 491, text: "That's represented best by my depressing thoughts" },
                    { time: 521, text: "I do not have writer's block, my writer just hates the clock" }
                ]
            }, 
            {
                title: "Silent Screams",
                artist: "Digital Pilots",
                cover: "https://via.placeholder.com/300x300/7c3aed/ffffff?text=DP",
                src: "audio/silent-screams.mp3",
                lyrics: [
                    { time: 0, text: "In the quiet of the night" },
                    { time: 4, text: "When the world has gone to sleep" },
                    { time: 8, text: "I can hear the silent screams" },
                    { time: 12, text: "From the secrets that we keep" },
                    { time: 16, text: "Nobody knows the pain inside" },
                    { time: 20, text: "Behind this mask I wear" },
                    { time: 24, text: "But these silent screams won't hide" },
                    { time: 28, text: "The truth that's always there" },
                    { time: 32, text: "Silent screams in the dark" },
                    { time: 36, text: "Echo through my soul" },
                    { time: 40, text: "Silent screams leave their mark" },
                    { time: 44, text: "But they won't take control" }
                ]
            },
            {
                title: "Neon Dreams",
                artist: "Digital Pilots",
                cover: "https://via.placeholder.com/300x300/06b6d4/ffffff?text=DP",
                src: "audio/neon-dreams.mp3",
                lyrics: [
                    { time: 0, text: "City lights are calling out" },
                    { time: 3, text: "Through the neon-colored night" },
                    { time: 6, text: "Dreams are what it's all about" },
                    { time: 9, text: "In this artificial light" },
                    { time: 12, text: "Running through electric streets" },
                    { time: 15, text: "Chasing visions in my head" },
                    { time: 18, text: "Where reality and fantasy meet" },
                    { time: 21, text: "In these neon dreams instead" },
                    { time: 24, text: "Neon dreams, neon dreams" },
                    { time: 27, text: "Nothing's quite what it seems" },
                    { time: 30, text: "Neon dreams, neon dreams" },
                    { time: 33, text: "Living in electric schemes" }
                ]
            }
        ];
        
        this.init();
    }
    
    init() {
        this.loadTrack(this.currentTrack);
        this.bindEvents();
        this.audio.volume = 0.7; // устанавливаем громкость по умолчанию
    }
    
    bindEvents() {
        // Кнопки управления
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        
        // Прогресс бар
        this.progressSlider.addEventListener('input', () => this.seek());
        this.progressSlider.addEventListener('change', () => this.seek());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateDuration();
            this.updateProgress();
        });
        this.audio.addEventListener('loadeddata', () => {
            this.updateDuration();
            this.updateProgress();
        });
        this.audio.addEventListener('canplay', () => {
            this.updateDuration();
            this.updateProgress();
        });
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        
    }
    
    loadTrack(index) {
        const track = this.tracks[index];
        if (!track) return;
        
        document.getElementById('trackTitle').textContent = track.title;
        document.getElementById('artistName').textContent = track.artist;
        document.getElementById('albumImage').src = track.cover;
        
        // Сбрасываем прогресс
        this.progress.style.width = '0%';
        this.progressSlider.value = 0;
        this.currentTimeSpan.textContent = '0:00';
        this.durationSpan.textContent = '0:00';
        
        // Попробуем загрузить локальный файл, если не получится - используем fallback
        this.audio.src = track.src;
        this.audio.onerror = () => {
            console.log(`Не удалось загрузить ${track.src}, используем демо звук`);
            this.audio.src = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";
        };
        
        this.loadLyrics(track.lyrics);
    }
    
    loadLyrics(lyrics) {
        this.lyricsContainer.innerHTML = '';
        lyrics.forEach((line, index) => {
            const div = document.createElement('div');
            div.className = 'lyrics-line';
            div.dataset.time = line.time;
            div.textContent = line.text;
            this.lyricsContainer.appendChild(div);
        });
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            document.body.classList.add('playing');
        }).catch(error => {
            console.log('Ошибка воспроизведения:', error);
        });
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        document.body.classList.remove('playing');
    }
    
    previousTrack() {
        this.currentTrack = this.currentTrack > 0 ? this.currentTrack - 1 : this.tracks.length - 1;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    nextTrack() {
        this.currentTrack = this.currentTrack < this.tracks.length - 1 ? this.currentTrack + 1 : 0;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    seek() {
        if (this.audio.duration && !isNaN(this.audio.duration)) {
            const seekTime = (this.progressSlider.value / 100) * this.audio.duration;
            if (!isNaN(seekTime)) {
                this.audio.currentTime = seekTime;
            }
        }
    }
    
    updateProgress() {
        if (this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0) {
            const currentTime = this.audio.currentTime || 0;
            const progressPercent = (currentTime / this.audio.duration) * 100;
            
            if (!isNaN(progressPercent)) {
                this.progress.style.width = Math.min(100, Math.max(0, progressPercent)) + '%';
                this.progressSlider.value = Math.min(100, Math.max(0, progressPercent));
            }
            
            this.currentTimeSpan.textContent = this.formatTime(currentTime);
            
            // Обновляем синхронизированный текст
            this.updateSyncedLyrics();
        }
    }
    
    updateDuration() {
        const duration = this.audio.duration;
        if (duration && !isNaN(duration) && duration > 0) {
            this.durationSpan.textContent = this.formatTime(duration);
        } else {
            this.durationSpan.textContent = '0:00';
        }
    }
    
    
    updateSyncedLyrics() {
        const currentTime = this.audio.currentTime;
        const lines = this.lyricsContainer.querySelectorAll('.lyrics-line');
        
        lines.forEach((line, index) => {
            const lineTime = parseFloat(line.dataset.time);
            const nextLineTime = lines[index + 1] ? parseFloat(lines[index + 1].dataset.time) : Infinity;
            
            line.classList.remove('active', 'past', 'upcoming');
            
            if (currentTime >= lineTime && currentTime < nextLineTime) {
                line.classList.add('active');
                line.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (currentTime >= lineTime) {
                line.classList.add('past');
            } else {
                line.classList.add('upcoming');
            }
        });
    }
    
    handleTrackEnd() {
        if (this.repeatMode === 2) {
            // Повторить текущий трек
            this.audio.currentTime = 0;
            this.play();
        } else if (this.repeatMode === 1 || this.currentTrack < this.tracks.length - 1) {
            // Следующий трек или повторить все
            this.nextTrack();
        } else {
            // Остановить воспроизведение
            this.pause();
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Инициализация плеера при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});

// Дополнительные эффекты
document.addEventListener('DOMContentLoaded', () => {
    // Эффект свечения для активных элементов
    const buttons = document.querySelectorAll('.control-btn, .karaoke-toggle');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.boxShadow = '0 0 20px rgba(29, 185, 84, 0.3)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.boxShadow = 'none';
        });
    });
    
    // Анимация загрузки
    const playerContainer = document.querySelector('.player-container');
    playerContainer.style.opacity = '0';
    playerContainer.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        playerContainer.style.transition = 'all 0.8s ease';
        playerContainer.style.opacity = '1';
        playerContainer.style.transform = 'translateY(0)';
    }, 100);
});
