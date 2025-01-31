import { AudioPlayer } from './components/AudioPlayer.js';
import { PlaylistManager } from './components/PlaylistManager.js';
import { UIManager } from './components/UIManager.js';
import { ThemeManager } from './components/ThemeManager.js';

class MusicApp {
    constructor() {
        this.audioPlayer = new AudioPlayer();
        this.playlistManager = new PlaylistManager();
        this.uiManager = new UIManager();
        this.themeManager = new ThemeManager();
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.loadInitialSong();
        this.uiManager.renderPlaylist(
            this.playlistManager.getSongs(),
            this.audioPlayer.currentSong,
            this.audioPlayer.isPlaying,
            this.playlistManager.getFavorites()
        );
    }

    setupEventListeners() {
        // Play/Pause
        this.uiManager.elements.playBtn.addEventListener('click', () => {
            if (this.audioPlayer.isPlaying) {
                this.pauseSong();
            } else {
                this.playSong();
            }
        });

        // Navigation
        this.uiManager.elements.prevBtn.addEventListener('click', () =>
            this.prevSong()
        );
        this.uiManager.elements.nextBtn.addEventListener('click', () =>
            this.nextSong()
        );

        // Progress bar
        this.uiManager.elements.progressBar.addEventListener('click', (e) => {
            const width = this.uiManager.elements.progressBar.clientWidth;
            const clickX = e.offsetX;
            const duration = this.audioPlayer.getDuration();
            if (duration) {
                this.audioPlayer.setCurrentTime((clickX / width) * duration);
            }
        });

        // Theme toggle
        this.uiManager.elements.themeToggle.addEventListener('click', () => {
            const newTheme = this.themeManager.toggleTheme();
            this.uiManager.showToast(
                `Switched to ${
                    newTheme.charAt(0).toUpperCase() + newTheme.slice(1)
                } Mode`
            );
        });

        // Audio events
        this.audioPlayer.handleTimeUpdate(() => {
            this.uiManager.updateProgress(
                this.audioPlayer.getCurrentTime(),
                this.audioPlayer.getDuration()
            );
        });

        this.audioPlayer.handleSongEnd(() => {
            if (
                this.audioPlayer.currentSong ===
                this.playlistManager.getSongs().length - 1
            ) {
                this.pauseSong();
                this.uiManager.showToast(
                    'Playlist finished. Add more songs to continue playing!'
                );
            } else {
                this.nextSong();
            }
        });

        // Save state before unload
        window.addEventListener('beforeunload', () => {
            localStorage.setItem(
                'audioCurrentTime',
                this.audioPlayer.getCurrentTime()
            );
            localStorage.setItem('isPlaying', this.audioPlayer.isPlaying);
            localStorage.setItem('currentSong', this.audioPlayer.currentSong);
        });
    }

    loadInitialSong() {
        const currentSong = this.playlistManager.getSong(
            this.audioPlayer.currentSong
        );
        if (currentSong) {
            this.audioPlayer.setSource(currentSong.path);
            this.uiManager.updateSongInfo(currentSong);
            this.uiManager.updatePlaylistActive(
                this.audioPlayer.currentSong,
                this.audioPlayer.isPlaying
            );
        }
    }

    async playSong() {
        try {
            await this.audioPlayer.play();
            this.audioPlayer.isPlaying = true;
            this.uiManager.updatePlayButton(true);
            localStorage.setItem('isPlaying', true);
        } catch (error) {
            this.uiManager.showToast('Error playing audio. Please try again.');
            this.pauseSong();
        }
    }

    pauseSong() {
        this.audioPlayer.pause();
        this.audioPlayer.isPlaying = false;
        this.uiManager.updatePlayButton(false);
        localStorage.setItem('isPlaying', false);
    }

    prevSong() {
        if (this.audioPlayer.getCurrentTime() > 5) {
            this.audioPlayer.setCurrentTime(0);
            this.playSong();
        } else if (this.audioPlayer.currentSong > 0) {
            this.audioPlayer.currentSong--;
            this.loadSong(this.audioPlayer.currentSong);
            this.playSong();
        } else {
            this.audioPlayer.setCurrentTime(0);
            this.playSong();
        }
    }

    nextSong() {
        if (
            this.audioPlayer.currentSong ===
            this.playlistManager.getSongs().length - 1
        ) {
            this.uiManager.showToast(
                'End of playlist. Add more songs to continue playing!'
            );
            return;
        }
        this.audioPlayer.currentSong++;
        this.loadSong(this.audioPlayer.currentSong);
        this.playSong();
    }

    loadSong(index) {
        const song = this.playlistManager.getSong(index);
        if (song) {
            this.audioPlayer.setSource(song.path);
            this.uiManager.updateSongInfo(song);
            this.uiManager.updatePlaylistActive(
                index,
                this.audioPlayer.isPlaying
            );
            localStorage.setItem('currentSong', index);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MusicApp();
});

const songs = [
    {
        title: 'First Song',
        artist: 'Artist One',
        duration: '3:45',
        file: './sound/first.mp3',
        cover: 'https://picsum.photos/200/200?random=1'
    },
    {
        title: 'Second Song',
        artist: 'Artist Two',
        duration: '4:30',
        file: './sound/second.mp3',
        cover: 'https://picsum.photos/200/200?random=2'
    },
    {
        title: 'Third Song',
        artist: 'Artist Three',
        duration: '3:15',
        file: './sound/third.mp3',
        cover: 'https://picsum.photos/200/200?random=3'
    },
    {
        title: 'Fourth Song',
        artist: 'Artist Four',
        duration: '5:00',
        file: './sound/fourth.mp3',
        cover: 'https://picsum.photos/200/200?random=4'
    }
];
