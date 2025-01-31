import spotifyService from './spotify-service.js';

// Initialize songs array for both local and Spotify tracks
let songs = [
    {
        name: 'First Song',
        artist: 'Artist 1',
        cover: 'https://placehold.co/400x400/1DB954/ffffff?text=First+Song',
        path: 'sound/first.mp3',
        isSpotify: false
    },
    {
        name: 'Second Song',
        artist: 'Artist 2',
        cover: 'https://placehold.co/400x400/1DB954/ffffff?text=Second+Song',
        path: 'sound/second.mp3',
        isSpotify: false
    },
    {
        name: 'Third Song',
        artist: 'Artist 3',
        cover: 'https://placehold.co/400x400/1DB954/ffffff?text=Third+Song',
        path: 'sound/third.mp3',
        isSpotify: false
    }
];

// Keep track of current song and playing state
let currentSong = 0;
let isPlaying = false;

// Add new state variable for added songs
let addedSongs = JSON.parse(localStorage.getItem('addedSongs')) || [];

// Play button functionality
document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.querySelector('.play-button');
    const rightNav = document.querySelector('.right-nav');
    const overlay = document.querySelector('.overlay');

    // Toggle playlist view
    playButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const icon = playButton.querySelector('i');

        if (rightNav.classList.contains('expanded')) {
            // Close playlist
            rightNav.classList.remove('expanded');
            overlay.classList.remove('show');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-music');
        } else {
            // Open playlist
            rightNav.classList.add('expanded');
            overlay.classList.add('show');
            icon.classList.remove('fa-music');
            icon.classList.add('fa-times');
        }
    });

    // Handle overlay click
    overlay.addEventListener('click', () => {
        rightNav.classList.remove('expanded');
        overlay.classList.remove('show');
        const icon = playButton.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-music');
    });

    // Global click handler for closing popups
    document.addEventListener('click', (e) => {
        // Close menu options if click is outside
        if (!e.target.closest('.song-menu')) {
            document.querySelectorAll('.menu-options.show').forEach((menu) => {
                menu.classList.remove('show');
            });
        }

        // Close playlist if click is outside
        if (
            rightNav.classList.contains('expanded') &&
            !rightNav.contains(e.target) &&
            !playButton.contains(e.target)
        ) {
            rightNav.classList.remove('expanded');
            overlay.classList.remove('show');
            const icon = playButton.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-music');
        }
    });

    // Prevent clicks inside right nav from closing it
    rightNav.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-option')) {
            e.stopPropagation();
        }
    });
});

const audio = new Audio();
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const cover = document.getElementById('cover');
const progressBar = document.querySelector('.progress-bar');
const progress = document.querySelector('.progress');
const currentTime = document.getElementById('current');
const duration = document.getElementById('duration');
const musicImg = document.querySelector('.music-img');
const playlistContainer = document.getElementById('playlist-container');
const navToggle = document.querySelector('.nav-toggle');
const leftNav = document.querySelector('.left-nav');
const container = document.querySelector('.container');
const navOverlay = document.querySelector('.nav-overlay');
let isDragging = false;
let dragStartX = 0;
let lastDragTime = 0;
let animationFrameId = null;

// Add theme switching functionality
const themeToggle = document.querySelector('.theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Set initial theme based on system preference
document.documentElement.setAttribute(
    'data-theme',
    prefersDarkScheme.matches ? 'dark' : 'light'
);
updateThemeIcon();

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
});

function updateThemeIcon() {
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    const isDark =
        document.documentElement.getAttribute('data-theme') === 'dark';

    themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    themeText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
}

// Sample music playlist
const playlist = [
    {
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        audio: 'sound/first.mp3',
        cover: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1'
    },
    {
        title: 'Hotel California',
        artist: 'Eagles',
        audio: 'sound/second.mp3',
        cover: 'https://images.unsplash.com/photo-1621619856624-42fd193a0661'
    },
    {
        title: "Sweet Child O' Mine",
        artist: "Guns N' Roses",
        audio: 'sound/third.mp3',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819'
    },
    {
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        audio: 'sound/fourth.mp3',
        cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea'
    },
    {
        title: 'Nothing Else Matters',
        artist: 'Metallica',
        audio: 'sound/first.mp3',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745'
    }
];

// Load saved durations from localStorage
const savedDurations = JSON.parse(localStorage.getItem('songDurations')) || {};
songs.forEach((song) => {
    if (savedDurations[song.path]) {
        song.duration = savedDurations[song.path];
    }
});

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let playlists = JSON.parse(localStorage.getItem('playlists')) || {
    'My Playlist': [] // Default playlist
};

function loadSong(index) {
    const song = songs[index];
    if (song) {
        audio.src = song.path;
        title.textContent = song.name;
        artist.textContent = song.artist;
        cover.src = song.cover;
        cover.onerror = () => {
            cover.src = `https://placehold.co/400x400/1DB954/ffffff?text=${encodeURIComponent(
                song.name
            )}`;
        };

        // Update duration only if not already set
        if (!song.duration) {
            audio.addEventListener(
                'loadedmetadata',
                () => {
                    const minutes = Math.floor(audio.duration / 60);
                    const seconds = Math.floor(audio.duration % 60);
                    const formattedDuration = `${minutes}:${seconds
                        .toString()
                        .padStart(2, '0')}`;

                    song.duration = formattedDuration;
                    savedDurations[song.path] = formattedDuration;
                    localStorage.setItem(
                        'songDurations',
                        JSON.stringify(savedDurations)
                    );

                    renderPlaylist();
                },
                { once: true }
            );
        }

        updatePlaylistActive();
        localStorage.setItem('currentSong', index);
    }
}

// Function to preload song durations
function preloadSongDurations() {
    songs.forEach((song) => {
        if (!song.duration) {
            const tempAudio = new Audio();
            tempAudio.src = song.path;

            tempAudio.addEventListener('loadedmetadata', () => {
                const minutes = Math.floor(tempAudio.duration / 60);
                const seconds = Math.floor(tempAudio.duration % 60);
                const formattedDuration = `${minutes}:${seconds
                    .toString()
                    .padStart(2, '0')}`;

                song.duration = formattedDuration;
                savedDurations[song.path] = formattedDuration;
                localStorage.setItem(
                    'songDurations',
                    JSON.stringify(savedDurations)
                );

                renderPlaylist();
                tempAudio.remove();
            });

            tempAudio.addEventListener('error', () => {
                console.error(`Error loading duration for: ${song.name}`);
                tempAudio.remove();
            });
        }
    });
}

// Call preloadSongDurations after songs are loaded
preloadSongDurations();

// Remove the standalone loadedmetadata event listener since we handle it in loadSong
audio.removeEventListener('loadedmetadata', () => {});

function playSong() {
    musicImg.classList.add('playing');
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        showToast('Error playing audio. Please try again.');
        pauseSong();
    });
    isPlaying = true;

    // Update playlist active state and frequency animation
    updatePlaylistActive();

    // Save playing state
    localStorage.setItem('isPlaying', true);
}

function pauseSong() {
    musicImg.classList.remove('playing');
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    audio.pause();
    isPlaying = false;

    // Update playlist active state and frequency animation
    updatePlaylistActive();

    // Save playing state
    localStorage.setItem('isPlaying', false);
}

function updatePlayButton(playing) {
    const playBtnIcon = playBtn.querySelector('i');
    if (playing) {
        playBtnIcon.classList.remove('fa-play');
        playBtnIcon.classList.add('fa-pause');
    } else {
        playBtnIcon.classList.remove('fa-pause');
        playBtnIcon.classList.add('fa-play');
    }
}

function prevSong() {
    if (audio.currentTime > 5) {
        // If more than 5 seconds have passed, restart current song
        audio.currentTime = 0;
        playSong();
    } else if (currentSong > 0) {
        // Only go to previous song if we're not at the first song
        currentSong--;
        loadSong(currentSong);
        playSong();
    } else {
        // If at first song and less than 5 seconds, just restart it
        audio.currentTime = 0;
        playSong();
    }
    updatePlaylistActive();
}

function nextSong() {
    if (currentSong === songs.length - 1) {
        showToast('End of playlist. Add more songs to continue playing!');
        return;
    }
    currentSong++;
    loadSong(currentSong);
    playSong();
}

function updateProgress() {
    if (!audio.duration || isNaN(audio.duration)) return;

    if (!isDragging) {
        const position = audio.currentTime / audio.duration;
        progress.style.width = `${position * 100}%`;
    }

    // Update time displays
    const currentTimeElement = document.getElementById('current');
    const durationElement = document.getElementById('duration');

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    currentTimeElement.textContent = formatTime(audio.currentTime);
    durationElement.textContent = formatTime(audio.duration);
}

function handleDrag(clientX) {
    if (!isDragging) return;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(() => {
        const rect = progressBar.getBoundingClientRect();
        const position = (clientX - rect.left) / rect.width;
        const boundedPosition = Math.min(Math.max(position, 0), 1);

        if (audio.duration && !isNaN(audio.duration)) {
            const newTime = boundedPosition * audio.duration;
            audio.currentTime = newTime;
            progress.style.width = `${boundedPosition * 100}%`;
        }
    });
}

function startDrag(clientX) {
    isDragging = true;
    dragStartX = clientX;
    document.body.style.userSelect = 'none';
    lastDragTime = Date.now();
}

function endDrag() {
    if (!isDragging) return;

    isDragging = false;
    document.body.style.userSelect = '';

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Mouse events
progressBar.addEventListener('mousedown', (e) => {
    startDrag(e.clientX);
    handleDrag(e.clientX);
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const now = Date.now();
        if (now - lastDragTime > 16) {
            // Throttle to ~60fps
            handleDrag(e.clientX);
            lastDragTime = now;
        }
    }
});

document.addEventListener('mouseup', endDrag);
document.addEventListener('mouseleave', endDrag);

// Touch events with improved handling
progressBar.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDrag(touch.clientX);
    handleDrag(touch.clientX);
});

document.addEventListener(
    'touchmove',
    (e) => {
        if (isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            const now = Date.now();
            if (now - lastDragTime > 16) {
                handleDrag(touch.clientX);
                lastDragTime = now;
            }
        }
    },
    { passive: false }
);

document.addEventListener('touchend', endDrag);
document.addEventListener('touchcancel', endDrag);

// Prevent text selection during drag
progressBar.addEventListener('selectstart', (e) => e.preventDefault());

// Keep the progress update functionality
audio.addEventListener('timeupdate', updateProgress);

function addToFavorites(song) {
    if (!song) return;

    const isFavorite = favorites.some(
        (fav) => fav.name === song.name && fav.artist === song.artist
    );

    if (!isFavorite) {
        // Add to favorites
        favorites.push(song);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        showToast('Added to Favorites');

        // Update heart icon in menu
        const heartIcon = document.querySelector('.menu-option i.fa-heart');
        if (heartIcon) {
            heartIcon.classList.add('favorite');
            heartIcon.parentElement.querySelector('span').textContent =
                'Remove from Favorites';
        }
    } else {
        // Remove from favorites
        favorites = favorites.filter(
            (fav) => !(fav.name === song.name && fav.artist === song.artist)
        );
        localStorage.setItem('favorites', JSON.stringify(favorites));
        showToast('Removed from Favorites');

        // Update heart icon in menu
        const heartIcon = document.querySelector('.menu-option i.fa-heart');
        if (heartIcon) {
            heartIcon.classList.remove('favorite');
            heartIcon.parentElement.querySelector('span').textContent =
                'Add to Favorites';
        }
    }

    // Update the playlist display
    renderPlaylist();
}

// Add toast notification function
function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create and show new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Add show class after a brief delay to trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Common function to handle modal closing
function closeModal(modal) {
    if (!modal) return;
    document.body.removeChild(modal);
}

function createModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = content;

    const closeBtn = modal.querySelector('.close-modal');
    const handleClose = (e) => {
        e.stopPropagation();
        closeModal(modal);
    };

    closeBtn.addEventListener('click', handleClose);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });

    document.body.appendChild(modal);
    return modal;
}

function showFavorites() {
    // Remove any existing modals first
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Favorites</h2>
                <button class="close-modal">×</button>
            </div>
            <div class="modal-body">
                ${
                    favorites.length === 0
                        ? '<p class="no-songs">No favorite songs yet</p>'
                        : favorites
                              .map(
                                  (song) => `
                        <div class="playlist-item ${
                            song.name === songs[currentSong]?.name &&
                            song.artist === songs[currentSong]?.artist
                                ? 'active'
                                : ''
                        } ${!isPlaying ? 'paused' : ''}" data-title="${
                                      song.name
                                  }">
                            <div class="playlist-item-content">
                                <img src="${song.cover}" alt="${
                                      song.name
                                  }" onerror="this.src='https://placehold.co/400x400/1DB954/ffffff?text=${encodeURIComponent(
                                      song.name
                                  )}'">
                                ${
                                    song.name === songs[currentSong]?.name &&
                                    song.artist === songs[currentSong]?.artist
                                        ? '<div class="frequency-bars"><span></span><span></span><span></span><span></span></div>'
                                        : ''
                                }
                                <div class="song-info">
                                    <h4>${song.name}</h4>
                                    <p>${song.artist}</p>
                                </div>
                                <span class="duration">${
                                    song.duration || '0:00'
                                }</span>
                                <div class="song-controls">
                                    <button class="play-btn-small">
                                        <i class="fas ${
                                            song.name ===
                                                songs[currentSong]?.name &&
                                            song.artist ===
                                                songs[currentSong]?.artist &&
                                            isPlaying
                                                ? 'fa-pause'
                                                : 'fa-play'
                                        }"></i>
                                    </button>
                                    <button class="remove-from-favorites">
                                        <i class="fas fa-heart-broken"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `
                              )
                              .join('')
                }
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners for play buttons
    modal.querySelectorAll('.play-btn-small').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const song = favorites[index];
            const songIndex = songs.findIndex(
                (s) => s.name === song.name && s.artist === song.artist
            );
            if (songIndex !== -1) {
                if (songIndex === currentSong && isPlaying) {
                    pauseSong();
                } else {
                    currentSong = songIndex;
                    loadSong(currentSong);
                    playSong();
                }
                showFavorites(); // Refresh to update play/pause icons
            }
        });
    });

    // Add event listeners for remove buttons with immediate deletion
    modal.querySelectorAll('.remove-from-favorites').forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const song = favorites[index];
            const songElement = btn.closest('.playlist-item');

            // Add fade-out animation
            songElement.style.transition = 'opacity 0.3s ease';
            songElement.style.opacity = '0';

            setTimeout(() => {
                // Remove from favorites array
                favorites = favorites.filter(
                    (fav) =>
                        !(fav.name === song.name && fav.artist === song.artist)
                );
                // Update localStorage
                localStorage.setItem('favorites', JSON.stringify(favorites));
                // Update heart icon in menu
                const heartIcon = document.querySelector(
                    '.menu-option i.fa-heart'
                );
                if (heartIcon) {
                    heartIcon.classList.remove('favorite');
                    heartIcon.parentElement.querySelector('span').textContent =
                        'Add to Favorites';
                }
                // Show feedback
                showToast('Removed from Favorites');
                // Update displays
                renderPlaylist();
                showFavorites(); // Refresh the modal
            }, 300);
        });
    });

    // Close button handler
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    };

    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    });

    // Add show class after a brief delay to trigger animation
    requestAnimationFrame(() => modal.classList.add('show'));
}

function renderPlaylist() {
    if (!playlistContainer) return;

    playlistContainer.innerHTML = songs
        .map((song, index) => {
            const isFavorite = favorites.some(
                (fav) => fav.name === song.name && fav.artist === song.artist
            );

            return `
            <div class="playlist-item ${
                index === currentSong ? 'active' : ''
            } ${index === currentSong && !isPlaying ? 'paused' : ''}" 
                data-index="${index}" 
                data-title="${song.name}">
                ${
                    index === currentSong
                        ? '<div class="frequency-bars"><span></span><span></span><span></span><span></span></div>'
                        : ''
                }
                <div class="playlist-item-content">
                    <img src="${song.cover}" alt="${
                song.name
            }" onerror="this.src='https://placehold.co/400x400/1DB954/ffffff?text=${encodeURIComponent(
                song.name
            )}'">
                    <div class="song-info">
                        <h4>${song.name} ${
                isFavorite
                    ? '<i class="fas fa-heart favorite-indicator"></i>'
                    : ''
            }</h4>
                        <p>${song.artist}</p>
                    </div>
                    <span class="duration">${song.duration || '0:00'}</span>
                    <div class="song-menu">
                        <i class="fas fa-ellipsis-v"></i>
                        <div class="menu-options">
                            <div class="menu-option favorite-option">
                                <i class="fas fa-heart ${
                                    isFavorite ? 'favorite' : ''
                                }"></i>
                                <span>${
                                    isFavorite
                                        ? 'Remove from Favorites'
                                        : 'Add to Favorites'
                                }</span>
                            </div>
                            <div class="menu-option">
                                <i class="fas fa-plus"></i>
                                <span>Add to Playlist</span>
                            </div>
                            <div class="menu-option">
                                <i class="fas fa-share"></i>
                                <span>Share</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        })
        .join('');

    // Add event listeners
    document.querySelectorAll('.playlist-item').forEach((item) => {
        const songContent = item.querySelector('.playlist-item-content');
        const menuBtn = item.querySelector('.song-menu');
        const index = parseInt(item.dataset.index);

        songContent.addEventListener('click', () => {
            currentSong = index;
            loadSong(currentSong);
            playSong();
        });

        // Menu button handler
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const menuOptions = menuBtn.querySelector('.menu-options');

            // Close other menus
            document.querySelectorAll('.menu-options.show').forEach((menu) => {
                if (menu !== menuOptions) menu.classList.remove('show');
            });

            menuOptions.classList.toggle('show');
        });

        // Menu options handlers
        const menuOptions = item.querySelectorAll('.menu-option');
        menuOptions.forEach((option) => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const song = songs[index];
                const icon = option.querySelector('i');

                if (icon.classList.contains('fa-heart')) {
                    addToFavorites(song);
                } else if (icon.classList.contains('fa-plus')) {
                    showPlaylistsModal(song);
                } else if (icon.classList.contains('fa-share')) {
                    showToast('Share feature coming soon!');
                }

                menuBtn.querySelector('.menu-options').classList.remove('show');
            });
        });
    });
}

function updatePlaylistActive() {
    document.querySelectorAll('.playlist-item').forEach((item, index) => {
        const isCurrentSong = index === currentSong;
        item.classList.toggle('active', isCurrentSong);
        item.classList.toggle('paused', isCurrentSong && !isPlaying);

        // Update frequency bars
        const frequencyBars = item.querySelector('.frequency-bars');
        if (isCurrentSong) {
            if (!frequencyBars) {
                const barsHtml =
                    '<div class="frequency-bars"><span></span><span></span><span></span><span></span></div>';
                item.insertAdjacentHTML('afterbegin', barsHtml);
            }
        } else if (frequencyBars) {
            frequencyBars.remove();
        }
    });
}

// Event listeners
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

audio.addEventListener('ended', () => {
    if (currentSong === songs.length - 1) {
        pauseSong();
        showToast('Playlist finished. Add more songs to continue playing!');
    } else {
        nextSong();
    }
    updatePlaylistActive();
});

// Add event listener for when the page is about to unload
window.addEventListener('beforeunload', () => {
    localStorage.setItem('audioCurrentTime', audio.currentTime);
    localStorage.setItem('isPlaying', isPlaying);
    localStorage.setItem('currentSong', currentSong);
});

// Load initial song
loadSong(currentSong);
renderPlaylist();

// Keep the menu item click handlers but remove the closeMenu call
document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
        document
            .querySelectorAll('.nav-item')
            .forEach((i) => i.classList.remove('active'));
        item.classList.add('active');

        const menuText = item.querySelector('span').textContent;
        if (menuText === 'Favorites') {
            showFavorites();
        } else if (menuText === 'Playlists') {
            showPlaylistsModal();
        } else if (menuText === 'Explore') {
            showExplore();
        }
    });
});

navToggle.addEventListener('click', () => {
    leftNav.classList.toggle('expanded');
    container.classList.toggle('nav-expanded');
    navOverlay.classList.toggle('show');
    navToggle.classList.toggle('expanded');
    // Also toggle the icon class for mobile
    navToggle.querySelector('i').classList.toggle('expanded');
});

// Close navigation when clicking overlay
navOverlay.addEventListener('click', () => {
    leftNav.classList.remove('expanded');
    container.classList.remove('nav-expanded');
    navOverlay.classList.remove('show');
    navToggle.classList.remove('expanded');
    navToggle.querySelector('i').classList.remove('expanded');
});

// Close navigation when clicking menu items on mobile
document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 1200) {
            leftNav.classList.remove('expanded');
            container.classList.remove('nav-expanded');
            navOverlay.classList.remove('show');
            navToggle.classList.remove('expanded');
            navToggle.querySelector('i').classList.remove('expanded');
        }

        document
            .querySelectorAll('.nav-item')
            .forEach((i) => i.classList.remove('active'));
        item.classList.add('active');

        const menuText = item.querySelector('span').textContent;
        if (menuText === 'Favorites') {
            showFavorites();
        } else if (menuText === 'Playlists') {
            showPlaylistsModal();
        } else if (menuText === 'Explore') {
            showExplore();
        }
    });
});

function showCreatePlaylistModal() {
    const modal = document.createElement('div');
    modal.className = 'modal show'; // Add show class immediately
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Create New Playlist</h2>
                <button class="close-modal">×</button>
            </div>
            <div class="modal-body">
                <div class="playlist-form">
                    <input type="text" id="playlist-name" placeholder="Enter playlist name">
                    <button class="create-playlist-btn">Create</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close-modal');
    const createBtn = modal.querySelector('.create-playlist-btn');
    const input = modal.querySelector('#playlist-name');

    closeBtn.onclick = () => modal.remove();

    createBtn.addEventListener('click', () => {
        const name = input.value.trim();
        if (name) {
            if (!playlists[name]) {
                playlists[name] = [];
                showToast('Playlist created');
                closeModal(modal);
            } else {
                showToast('Playlist already exists');
            }
        }
    });

    // Add click outside handler with direct removal
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };

    setTimeout(() => modal.classList.add('show'), 100);
}

function addToPlaylist(song, playlistName) {
    if (!playlists[playlistName].some((s) => s.title === song.title)) {
        playlists[playlistName].push(song);
        showToast(`Added to ${playlistName}`);
    } else {
        showToast('Song already in playlist');
    }
}

function showPlaylistsModal(song = null) {
    // Remove any existing modals first
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${song ? 'Add to Playlist' : 'My Playlists'}</h2>
                <button class="close-modal">×</button>
            </div>
            <div class="modal-body">
                ${
                    song
                        ? `
                    <div class="playlist-selection">
                        <h3>Select playlist:</h3>
                        ${Object.keys(playlists)
                            .map(
                                (name) => `
                            <div class="playlist-option" data-name="${name}">
                                <span>${name}</span>
                                <i class="fas fa-plus"></i>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                `
                        : `
                    <div class="playlists-list">
                        ${
                            Object.keys(playlists).length === 0
                                ? '<p class="no-playlists">No playlists created yet</p>'
                                : Object.keys(playlists)
                                      .map(
                                          (name) => `
                                <div class="playlist-card" data-name="${name}">
                                    <div class="playlist-card-header">
                                        <h3>${name}</h3>
                                        <span class="song-count">${playlists[name].length} songs</span>
                                    </div>
                                    <div class="playlist-card-actions">
                                        <button class="view-playlist" data-name="${name}">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="delete-playlist" data-name="${name}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `
                                      )
                                      .join('')
                        }
                    </div>
                `
                }
                <button class="new-playlist-btn">
                    <i class="fas fa-plus"></i> Create New Playlist
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Update close button event listener with direct removal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    };

    // Add click outside handler with direct removal
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };

    // Handle playlist selection for adding songs
    if (song) {
        modal.querySelectorAll('.playlist-option').forEach((option) => {
            option.addEventListener('click', () => {
                const playlistName = option.dataset.name;
                addToPlaylist(song, playlistName);
                closeModal(modal);
            });
        });
    } else {
        // Handle view playlist button clicks
        modal.querySelectorAll('.view-playlist').forEach((btn) => {
            btn.addEventListener('click', () => {
                const playlistName = btn.dataset.name;
                showPlaylistSongs(playlistName);
            });
        });

        // Handle delete playlist button clicks
        modal.querySelectorAll('.delete-playlist').forEach((btn) => {
            btn.addEventListener('click', () => {
                const playlistName = btn.dataset.name;
                if (
                    confirm(
                        `Are you sure you want to delete "${playlistName}"?`
                    )
                ) {
                    delete playlists[playlistName];
                    showToast(`Deleted playlist: ${playlistName}`);
                    showPlaylistsModal();
                }
            });
        });
    }

    // Handle create new playlist
    modal.querySelector('.new-playlist-btn').addEventListener('click', () => {
        closeModal(modal);
        showCreatePlaylistModal();
    });

    // Add show class after a brief delay to trigger animation
    requestAnimationFrame(() => modal.classList.add('show'));
}

function showPlaylistSongs(playlistName) {
    // Remove any existing modals first
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${playlistName}</h2>
                <button class="close-modal">×</button>
            </div>
            <div class="modal-body">
                ${
                    playlists[playlistName].length === 0
                        ? '<p class="no-songs">No songs in this playlist</p>'
                        : playlists[playlistName]
                              .map(
                                  (song) => `
                        <div class="playlist-item">
                            <img src="${song.cover}" alt="${song.name}">
                            <div class="song-info">
                                <h4>${song.name}</h4>
                                <p>${song.artist}</p>
                            </div>
                            <button class="remove-from-playlist" data-playlist="${playlistName}" data-title="${song.name}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `
                              )
                              .join('')
                }
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Update close button event listener
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    };

    // Add click outside handler
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    };

    // Handle remove from playlist
    modal.querySelectorAll('.remove-from-playlist').forEach((btn) => {
        btn.addEventListener('click', () => {
            const songTitle = btn.dataset.title;
            playlists[playlistName] = playlists[playlistName].filter(
                (s) => s.name !== songTitle
            );
            localStorage.setItem('playlists', JSON.stringify(playlists));
            showPlaylistSongs(playlistName); // Refresh the modal
            showToast('Removed from playlist');
        });
    });

    // Add show class after a brief delay to trigger animation
    requestAnimationFrame(() => modal.classList.add('show'));
}

function showExplore() {
    // Remove any existing modals first
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Explore</h2>
                <button class="close-modal">×</button>
            </div>
            <div class="modal-body">
                <div class="explore-section">
                    <h3>Featured Categories</h3>
                    <div class="category-grid">
                        <div class="category-card" data-category="Trending">
                            <i class="fas fa-fire"></i>
                            <h4>Trending</h4>
                        </div>
                        <div class="category-card" data-category="Rock">
                            <i class="fas fa-guitar"></i>
                            <h4>Rock</h4>
                        </div>
                        <div class="category-card" data-category="Pop">
                            <i class="fas fa-music"></i>
                            <h4>Pop</h4>
                        </div>
                        <div class="category-card" data-category="Hip-Hop">
                            <i class="fas fa-compact-disc"></i>
                            <h4>Hip-Hop</h4>
                        </div>
                    </div>
                </div>
                
                <div class="explore-section">
                    <h3>Mood Playlists</h3>
                    <div class="mood-grid">
                        <div class="mood-card" data-mood="Happy">
                            <i class="fas fa-sun"></i>
                            <h4>Happy</h4>
                        </div>
                        <div class="mood-card" data-mood="Chill">
                            <i class="fas fa-moon"></i>
                            <h4>Chill</h4>
                        </div>
                        <div class="mood-card" data-mood="Workout">
                            <i class="fas fa-running"></i>
                            <h4>Workout</h4>
                        </div>
                        <div class="mood-card" data-mood="Focus">
                            <i class="fas fa-book"></i>
                            <h4>Focus</h4>
                        </div>
                    </div>
                </div>
                
                <div class="explore-section">
                    <h3>Charts</h3>
                    <div class="charts-list">
                        <div class="chart-item">
                            <span class="chart-number">1</span>
                            <div class="chart-info">
                                <h4>Bohemian Rhapsody</h4>
                                <p>Queen</p>
                            </div>
                            <button class="play-btn-small">
                                <i class="fas fa-play"></i>
                            </button>
                        </div>
                        <div class="chart-item">
                            <span class="chart-number">2</span>
                            <div class="chart-info">
                                <h4>Hotel California</h4>
                                <p>Eagles</p>
                            </div>
                            <button class="play-btn-small">
                                <i class="fas fa-play"></i>
                            </button>
                        </div>
                        <div class="chart-item">
                            <span class="chart-number">3</span>
                            <div class="chart-info">
                                <h4>Sweet Child O' Mine</h4>
                                <p>Guns N' Roses</p>
                            </div>
                            <button class="play-btn-small">
                                <i class="fas fa-play"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Update close button event listener
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    };

    // Add click outside handler
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    };

    // Add click handlers for category cards
    modal.querySelectorAll('.category-card').forEach((card) => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            showToast(`${category} category coming soon!`);
        });
    });

    // Add click handlers for mood cards
    modal.querySelectorAll('.mood-card').forEach((card) => {
        card.addEventListener('click', () => {
            const mood = card.dataset.mood;
            showToast(`${mood} playlist coming soon!`);
        });
    });

    // Add click handlers for chart items
    modal.querySelectorAll('.chart-item').forEach((item, index) => {
        const trackData = {
            name: item.querySelector('.chart-info h4').textContent,
            artist: item.querySelector('.chart-info p').textContent,
            cover: playlist[index].cover,
            path: playlist[index].audio,
            isSpotify: false
        };

        // Add click handler for play button
        item.querySelector('.play-btn-small').addEventListener('click', (e) => {
            e.stopPropagation();

            // Add the song to addedSongs if not already present
            const songExists = addedSongs.some(
                (song) =>
                    song.name === trackData.name &&
                    song.artist === trackData.artist
            );

            if (!songExists) {
                addedSongs.push(trackData);
                localStorage.setItem('addedSongs', JSON.stringify(addedSongs));
                renderAddedSongs();
                showToast('Song added to your list');
            }

            // Update player UI
            title.textContent = trackData.name;
            artist.textContent = trackData.artist;
            cover.src = trackData.cover;

            // Play the song
            audio.src = trackData.path;
            playSong();

            // Close the modal
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        // Add click handler for the entire chart item
        item.addEventListener('click', () => {
            // Add the song to addedSongs if not already present
            const songExists = addedSongs.some(
                (song) =>
                    song.name === trackData.name &&
                    song.artist === trackData.artist
            );

            if (!songExists) {
                addedSongs.push(trackData);
                localStorage.setItem('addedSongs', JSON.stringify(addedSongs));
                renderAddedSongs();
                showToast('Song added to your list');
            }

            // Update player UI
            title.textContent = trackData.name;
            artist.textContent = trackData.artist;
            cover.src = trackData.cover;

            // Play the song
            audio.src = trackData.path;
            playSong();

            // Close the modal
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });
    });

    // Add show class after a brief delay to trigger animation
    requestAnimationFrame(() => modal.classList.add('show'));
}

// Spotify Integration
let isUsingSpotify = false;
const spotifyLoginBtn = document.getElementById('spotify-login');

// Initialize Spotify integration
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we're returning from Spotify auth
    if (window.location.hash) {
        const success = spotifyService.handleAuthCallback();
        if (success) {
            await initializeSpotify();
            updateSpotifyLoginButton();
        }
    }

    // Initialize Spotify player if already authenticated
    if (spotifyService.isAuthenticated) {
        await initializeSpotify();
        updateSpotifyLoginButton();
    }
    renderAddedSongs();
});

// Update Spotify login handler
spotifyLoginBtn.addEventListener('click', async () => {
    if (!spotifyService.isAuthenticated) {
        spotifyService.authenticate();
    } else {
        // Handle disconnect
        spotifyService.disconnect();
        isUsingSpotify = false;
        updateSpotifyLoginButton();
        // Reset player to local mode
        if (currentSong !== undefined) {
            loadSong(currentSong);
            if (isPlaying) playSong();
        }
    }
});

function updateSpotifyLoginButton() {
    if (spotifyService.isAuthenticated) {
        spotifyLoginBtn.innerHTML =
            '<i class="fab fa-spotify"></i><span>Disconnect Spotify</span>';
        spotifyLoginBtn.classList.add('active');
    } else {
        spotifyLoginBtn.innerHTML =
            '<i class="fab fa-spotify"></i><span>Connect Spotify</span>';
        spotifyLoginBtn.classList.remove('active');
        isUsingSpotify = false;
    }
}

async function initializeSpotify() {
    const player = await spotifyService.initializePlayer();
    isUsingSpotify = true;

    player.addListener('player_state_changed', (state) => {
        if (state) {
            updatePlayerState(state);
        }
    });

    // Update existing controls to handle both local and Spotify playback
    playBtn.addEventListener('click', async () => {
        if (isUsingSpotify) {
            const state = await spotifyService.getCurrentState();
            if (state?.paused) {
                await spotifyService.resume();
                updatePlayButton(true);
            } else {
                await spotifyService.pause();
                updatePlayButton(false);
            }
        } else {
            isPlaying ? pauseSong() : playSong();
        }
    });

    prevBtn.addEventListener('click', async () => {
        if (isUsingSpotify) {
            await spotifyService.previous();
        } else {
            prevSong();
        }
    });

    nextBtn.addEventListener('click', async () => {
        if (isUsingSpotify) {
            await spotifyService.next();
        } else {
            nextSong();
        }
    });
}

function updatePlayerState(state) {
    if (!state || !isUsingSpotify) return;

    const { current_track } = state.track_window;

    // Update UI
    title.textContent = current_track.name;
    artist.textContent = current_track.artists[0].name;
    cover.src = current_track.album.images[0].url;

    updatePlayButton(!state.paused);
}

// Enhance search functionality to include Spotify results
document
    .querySelector('.nav-item:nth-child(2)')
    .addEventListener('click', () => {
        showSearchModal();
    });

function showSearchModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Search Music</h2>
                <button class="close-modal">×</button>
            </div>
            <div class="modal-body">
                <div class="search-container">
                    <input type="text" id="search-input" placeholder="Search for songs, artists, or albums">
                    <button id="search-button">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                <div class="search-source">
                    <span>
                        <i class="${
                            spotifyService.isAuthenticated
                                ? 'fab fa-spotify'
                                : 'fas fa-music'
                        }"></i>
                        Searching in: ${
                            spotifyService.isAuthenticated
                                ? 'Spotify'
                                : 'Local Library'
                        }
                    </span>
                    ${
                        !spotifyService.isAuthenticated
                            ? '<button id="connect-spotify-search" class="spotify-connect-btn"><i class="fab fa-spotify"></i> Connect Spotify</button>'
                            : ''
                    }
                </div>
                <div id="search-results"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add Spotify connect button handler if not authenticated
    if (!spotifyService.isAuthenticated) {
        const connectBtn = modal.querySelector('#connect-spotify-search');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                spotifyService.authenticate();
            });
        }
    }

    const searchInput = modal.querySelector('#search-input');
    const searchButton = modal.querySelector('#search-button');
    const searchResults = modal.querySelector('#search-results');
    const closeBtn = modal.querySelector('.close-modal');

    let searchTimeout;

    const performSearch = async (query) => {
        if (!query || query.length === 0) {
            searchResults.innerHTML = '';
            return;
        }

        searchResults.innerHTML = '<p class="searching">Searching...</p>';

        try {
            // Check if user is authenticated with Spotify
            if (spotifyService.isAuthenticated) {
                console.log('Searching Spotify for:', query);
                const results = await spotifyService.search(query);
                console.log('Spotify search results:', results);

                if (results && results.tracks && results.tracks.items) {
                    displaySpotifyResults(results.tracks.items, searchResults);
                } else {
                    console.error('Invalid Spotify results format:', results);
                    searchResults.innerHTML =
                        '<p class="no-results">No results found on Spotify</p>';
                }
            } else {
                console.log('Searching local library:', query);
                // Search local songs
                const localResults = songs.filter(
                    (song) =>
                        song.name.toLowerCase().includes(query.toLowerCase()) ||
                        song.artist.toLowerCase().includes(query.toLowerCase())
                );

                if (localResults.length > 0) {
                    displayLocalResults(localResults, searchResults);
                } else {
                    searchResults.innerHTML =
                        '<p class="no-results">No local songs found. Connect to Spotify to search more songs.</p>';
                }
            }
        } catch (error) {
            console.error('Search failed:', error);
            searchResults.innerHTML = `
                <p class="error">Search failed: ${
                    error.message || 'Please try again'
                }</p>
                <button class="retry-search">Retry Search</button>
                ${
                    !spotifyService.isAuthenticated
                        ? '<p class="spotify-suggestion">Connect to Spotify to search millions of songs</p>'
                        : ''
                }
            `;

            // Add retry button functionality
            const retryBtn = searchResults.querySelector('.retry-search');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => performSearch(query));
            }
        }
    };

    // Debounced search on input
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const query = searchInput.value.trim();
        searchTimeout = setTimeout(() => performSearch(query), 500);
    });

    // Search button click
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        performSearch(query);
    });

    // Enter key search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            performSearch(query);
        }
    });

    closeBtn.onclick = () => {
        modal.remove();
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };

    // Add additional styles for Spotify elements
    const style = document.createElement('style');
    style.textContent = `
        .search-source {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        .spotify-connect-btn {
            background: #1DB954;
            border: none;
            border-radius: 20px;
            color: white;
            padding: 5px 15px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .spotify-connect-btn:hover {
            background: #1ed760;
        }
        .spotify-suggestion {
            text-align: center;
            color: var(--text-secondary);
            margin-top: 10px;
            font-size: 0.9rem;
        }
        .search-source i {
            margin-right: 5px;
        }
    `;
    document.head.appendChild(style);

    requestAnimationFrame(() => modal.classList.add('show'));
    searchInput.focus();
}

function displayLocalResults(results, container) {
    container.innerHTML = results
        .map(
            (song, index) => `
        <div class="search-result-item" data-index="${index}">
            <img src="${song.cover}" alt="${song.name}">
            <div class="search-result-info">
                <h4>${song.name}</h4>
                <p>${song.artist}</p>
            </div>
            <div class="track-controls">
                <button class="play-btn-small">
                    <i class="fas fa-play"></i>
                </button>
                <button class="like-song" title="Like Song">
                    <i class="far fa-heart"></i>
                </button>
            </div>
        </div>
    `
        )
        .join('');

    // Add event listeners for local results
    container.querySelectorAll('.search-result-item').forEach((item) => {
        const index = parseInt(item.dataset.index);

        // Play button handler
        item.querySelector('.play-btn-small').addEventListener('click', (e) => {
            e.stopPropagation();
            currentSong = index;
            loadSong(currentSong);
            playSong();

            // Close the modal
            const modal = document.querySelector('.modal');
            if (modal) modal.remove();
        });

        // Like button handler
        const likeBtn = item.querySelector('.like-song');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            likeBtn.querySelector('i').classList.toggle('far');
            likeBtn.querySelector('i').classList.toggle('fas');
            likeBtn.querySelector('i').style.color = likeBtn
                .querySelector('i')
                .classList.contains('fas')
                ? '#e91e63'
                : '';
        });
    });
}

function displaySpotifyResults(tracks, container) {
    if (!tracks || tracks.length === 0) {
        container.innerHTML = '<p class="no-results">No results found</p>';
        return;
    }

    // Convert Spotify tracks to our music list format
    const spotifyTracks = tracks.map((track) => ({
        name: track.name,
        artist: track.artists.map((artist) => artist.name).join(', '),
        cover: track.album.images[0]?.url || '',
        uri: track.uri,
        duration: track.duration_ms / 1000,
        isSpotify: true
    }));

    container.innerHTML = spotifyTracks
        .map(
            (track) => `
        <div class="search-result-item" 
            data-uri="${track.uri}"
            data-name="${track.name}"
            data-artist="${track.artist}"
            data-cover="${track.cover}">
            <img src="${track.cover}" alt="${track.name}" class="track-cover">
            <div class="search-result-info">
                <h4>${track.name}</h4>
                <p>${track.artist}</p>
            </div>
            <div class="track-controls">
                <button class="play-btn-small">
                    <i class="fas fa-play"></i>
                </button>
                <button class="add-to-playlist" title="Add to Playlist">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="like-song" title="Like Song">
                    <i class="far fa-heart"></i>
                </button>
            </div>
        </div>
    `
        )
        .join('');

    // Add event listeners for each track
    container.querySelectorAll('.search-result-item').forEach((item) => {
        const trackData = {
            name: item.dataset.name,
            artist: item.dataset.artist,
            cover: item.dataset.cover,
            uri: item.dataset.uri,
            isSpotify: true
        };

        // Play button click handler
        item.querySelector('.play-btn-small').addEventListener(
            'click',
            async (e) => {
                e.stopPropagation();
                try {
                    const trackData = {
                        name: item.dataset.name,
                        artist: item.dataset.artist,
                        cover: item.dataset.cover,
                        uri: item.dataset.uri,
                        isSpotify: true
                    };

                    // Add the song to addedSongs if not already present
                    const songExists = addedSongs.some(
                        (song) =>
                            song.name === trackData.name &&
                            song.artist === trackData.artist
                    );

                    if (!songExists) {
                        addedSongs.push(trackData);
                        localStorage.setItem(
                            'addedSongs',
                            JSON.stringify(addedSongs)
                        );
                        renderAddedSongs();
                        showToast('Song added to your list');
                    }

                    // Update player UI
                    title.textContent = trackData.name;
                    artist.textContent = trackData.artist;
                    cover.src = trackData.cover;

                    if (trackData.isSpotify) {
                        // If it's a Spotify track
                        isUsingSpotify = true;
                        try {
                            await spotifyService.play(trackData.uri);
                            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                            isPlaying = true;
                        } catch (error) {
                            showToast(
                                error.message ||
                                    'Failed to play track. Please try again.'
                            );
                            return;
                        }
                    } else {
                        // If it's a local track
                        isUsingSpotify = false;
                        audio.src = trackData.path;
                        playSong();
                    }

                    // Close the modal
                    const modal = document.querySelector('.modal');
                    if (modal) {
                        modal.classList.remove('show');
                        setTimeout(() => modal.remove(), 300);
                    }
                } catch (error) {
                    console.error('Failed to play track:', error);
                    showToast(
                        error.message ||
                            'Failed to play track. Please try again.'
                    );
                }
            }
        );

        // Add to playlist button click handler
        item.querySelector('.add-to-playlist').addEventListener(
            'click',
            (e) => {
                e.stopPropagation();
                // Check if track already exists in playlist
                if (!songs.some((song) => song.uri === trackData.uri)) {
                    songs.push(trackData);
                    updatePlaylist();
                    // Show feedback
                    const addBtn = e.currentTarget;
                    addBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        addBtn.innerHTML = '<i class="fas fa-plus"></i>';
                    }, 2000);
                }
            }
        );

        // Like button click handler
        const likeBtn = item.querySelector('.like-song');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const icon = likeBtn.querySelector('i');
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
            icon.style.color = icon.classList.contains('fas') ? '#e91e63' : '';
        });
    });

    // Add styles for Spotify results
    const style = document.createElement('style');
    style.textContent = `
        .search-result-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 8px;
            background: var(--background-secondary);
            transition: all 0.3s ease;
        }
        
        .search-result-item:hover {
            background: var(--background-hover);
        }
        
        .track-cover {
            width: 50px;
            height: 50px;
            border-radius: 4px;
            margin-right: 12px;
        }
        
        .search-result-info {
            flex-grow: 1;
        }
        
        .track-controls {
            display: flex;
            gap: 8px;
        }
        
        .track-controls button {
            background: none;
            border: none;
            color: var(--text-primary);
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .track-controls button:hover {
            background: var(--primary-color);
            color: white;
        }
        
        .search-result-info h4 {
            margin: 0;
            font-size: 1rem;
            color: var(--text-primary);
        }
        
        .search-result-info p {
            margin: 4px 0 0;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
    `;
    document.head.appendChild(style);
}

// Add new function to render added songs list
function renderAddedSongs() {
    const addedSongsContainer = document.getElementById(
        'added-songs-container'
    );
    if (!addedSongsContainer) return;

    addedSongsContainer.innerHTML = `
        <div class="added-songs-header">
            <h3>Added Songs</h3>
            <button id="clear-added-songs" class="clear-btn">
                <i class="fas fa-trash"></i> Clear All
            </button>
        </div>
        ${
            addedSongs.length === 0
                ? '<p class="no-songs">No songs added yet</p>'
                : addedSongs
                      .map(
                          (song, index) => `
                <div class="added-song-item" data-index="${index}">
                    <img src="${song.cover}" alt="${song.name}">
                    <div class="song-info">
                        <h4>${song.name}</h4>
                        <p>${song.artist}</p>
                    </div>
                    <div class="song-controls">
                        <button class="play-added-song">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="remove-added-song">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `
                      )
                      .join('')
        }
    `;

    // Add event listeners for the added songs
    const clearBtn = document.getElementById('clear-added-songs');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            addedSongs = [];
            localStorage.setItem('addedSongs', JSON.stringify(addedSongs));
            renderAddedSongs();
            showToast('All added songs cleared');
        });
    }

    document.querySelectorAll('.added-song-item').forEach((item) => {
        const index = parseInt(item.dataset.index);
        const song = addedSongs[index];

        // Play button handler
        item.querySelector('.play-added-song').addEventListener(
            'click',
            async () => {
                try {
                    // Update player UI first
                    title.textContent = song.name;
                    artist.textContent = song.artist;
                    cover.src = song.cover;

                    if (song.isSpotify) {
                        // If it's a Spotify track
                        isUsingSpotify = true;
                        try {
                            await spotifyService.play(song.uri);
                            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                            isPlaying = true;
                        } catch (error) {
                            showToast(
                                error.message ||
                                    'Failed to play song. Please try again.'
                            );
                            return;
                        }
                    } else {
                        // If it's a local track
                        isUsingSpotify = false;
                        audio.src = song.path;
                        playSong();
                    }

                    // Update play button icon
                    const playBtnIcon =
                        item.querySelector('.play-added-song i');
                    playBtnIcon.classList.remove('fa-play');
                    playBtnIcon.classList.add('fa-pause');

                    // Reset other play buttons
                    document
                        .querySelectorAll('.added-song-item')
                        .forEach((otherItem) => {
                            if (otherItem !== item) {
                                const otherPlayBtn =
                                    otherItem.querySelector(
                                        '.play-added-song i'
                                    );
                                otherPlayBtn.classList.remove('fa-pause');
                                otherPlayBtn.classList.add('fa-play');
                            }
                        });
                } catch (error) {
                    console.error('Failed to play song:', error);
                    showToast(
                        error.message ||
                            'Failed to play song. Please try again.'
                    );
                }
            }
        );

        // Remove button handler
        item.querySelector('.remove-added-song').addEventListener(
            'click',
            () => {
                addedSongs.splice(index, 1);
                localStorage.setItem('addedSongs', JSON.stringify(addedSongs));
                renderAddedSongs();
                showToast('Song removed from added songs');
            }
        );
    });
}

// Update theme toggle functionality
function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Show theme change notification with capitalized first letter
    const themeMessage = `Switched to ${
        newTheme.charAt(0).toUpperCase() + newTheme.slice(1)
    } Mode`;
    showToast(themeMessage);
}

// Add event listener for theme toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Set initial theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});

// Add event listener for the song menu in the music player
document.addEventListener('DOMContentLoaded', () => {
    const songMenu = document.querySelector('.controls .song-menu');
    const menuOptions = songMenu.querySelector('.menu-options');

    songMenu.addEventListener('click', (e) => {
        e.stopPropagation();

        // Close all other open menus first
        document.querySelectorAll('.menu-options.show').forEach((menu) => {
            if (menu !== menuOptions) {
                menu.classList.remove('show');
            }
        });

        // Toggle current menu
        menuOptions.classList.toggle('show');
    });

    // Add click events for menu options
    menuOptions.querySelectorAll('.menu-option').forEach((option) => {
        option.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const icon = this.querySelector('i');
            const currentSongData = {
                name: document.getElementById('title').textContent,
                artist: document.getElementById('artist').textContent,
                cover: document.getElementById('cover').src,
                path: audio.src,
                isSpotify: false
            };

            if (icon.classList.contains('fa-heart')) {
                const isFavorite = favorites.some(
                    (fav) =>
                        fav.title === currentSongData.name &&
                        fav.artist === currentSongData.artist
                );

                if (isFavorite) {
                    favorites = favorites.filter(
                        (fav) =>
                            fav.title !== currentSongData.name ||
                            fav.artist !== currentSongData.artist
                    );
                    showToast('Removed from Favorites');
                    icon.classList.remove('favorite');
                } else {
                    addToFavorites(currentSongData);
                    icon.classList.add('favorite');
                }
            } else if (icon.classList.contains('fa-plus')) {
                showPlaylistsModal(currentSongData);
            } else if (icon.classList.contains('fa-share')) {
                showToast('Share feature coming soon!');
            }

            // Close the menu
            menuOptions.classList.remove('show');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!songMenu.contains(e.target)) {
            menuOptions.classList.remove('show');
        }
    });
});
