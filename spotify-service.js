import config from './config.js';

class SpotifyService {
    constructor() {
        this.accessToken = localStorage.getItem('spotify_access_token');
        this.player = null;
    }

    get isAuthenticated() {
        return !!this.accessToken;
    }

    async authenticate() {
        // Generate a random state value
        const state = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('spotify_auth_state', state);

        // Redirect to Spotify login
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${
            config.SPOTIFY_CLIENT_ID
        }&response_type=token&redirect_uri=${encodeURIComponent(
            config.SPOTIFY_REDIRECT_URI
        )}&state=${state}&scope=${encodeURIComponent(config.SCOPES)}`;
        window.location.href = authUrl;
    }

    handleAuthCallback() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const state = params.get('state');
        const storedState = localStorage.getItem('spotify_auth_state');

        if (accessToken && state === storedState) {
            this.accessToken = accessToken;
            localStorage.setItem('spotify_access_token', accessToken);
            window.location.hash = '';
            return true;
        }
        return false;
    }

    async initializePlayer() {
        if (!this.isAuthenticated) return;

        // Load Spotify Web Playback SDK
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        document.body.appendChild(script);

        return new Promise((resolve) => {
            window.onSpotifyWebPlaybackSDKReady = () => {
                this.player = new Spotify.Player({
                    name: 'Web Music Player',
                    getOAuthToken: (cb) => cb(this.accessToken)
                });

                this.player.connect().then((success) => {
                    if (success) {
                        console.log(
                            'Spotify Web Playback SDK connected successfully'
                        );
                    }
                });

                resolve(this.player);
            };
        });
    }

    async search(query, type = 'track', limit = 20) {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                query
            )}&type=${type}&limit=${limit}`,
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                }
            }
        );
        return await response.json();
    }

    async getUserPlaylists() {
        const response = await fetch(
            'https://api.spotify.com/v1/me/playlists',
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                }
            }
        );
        return await response.json();
    }

    async getPlaylistTracks(playlistId) {
        const response = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                }
            }
        );
        return await response.json();
    }

    async play(uri) {
        if (!this.isAuthenticated) {
            throw new Error('Please connect to Spotify first');
        }

        try {
            // First check if user has Spotify Premium
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                }
            });
            const userData = await response.json();

            if (userData.product !== 'premium') {
                throw new Error(
                    'Spotify Premium is required to play tracks. Please upgrade your account.'
                );
            }

            // Check for available devices
            const devices = await this.getDevices();
            let deviceId = null;

            if (devices.length === 0) {
                // If no devices available, try to connect Web Playback SDK
                if (this.player) {
                    await this.player.connect();
                    // Wait longer for device to be ready
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    const updatedDevices = await this.getDevices();
                    const sdkDevice = updatedDevices.find(
                        (d) => d.is_active && d.type === 'Computer'
                    );
                    if (sdkDevice) {
                        deviceId = sdkDevice.id;
                    }
                }

                if (!deviceId) {
                    throw new Error(
                        'No active Spotify device found. Please open Spotify on your device or refresh the page.'
                    );
                }
            } else {
                // Try to find an active device first
                const activeDevice = devices.find((device) => device.is_active);
                if (activeDevice) {
                    deviceId = activeDevice.id;
                } else {
                    // If no active device, try to activate the first available one
                    deviceId = devices[0].id;
                    // Activate the device
                    await fetch(`https://api.spotify.com/v1/me/player`, {
                        method: 'PUT',
                        headers: {
                            Authorization: `Bearer ${this.accessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            device_ids: [deviceId],
                            play: false
                        })
                    });
                    // Wait for device activation
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }

            // Start playback on the selected device
            const playResponse = await fetch(
                `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uris: [uri]
                    })
                }
            );

            if (!playResponse.ok) {
                const errorData = await playResponse.json();
                throw new Error(
                    errorData.error?.message || 'Failed to start playback'
                );
            }

            return true;
        } catch (error) {
            console.error('Failed to play track:', error);
            if (error.message.includes('Premium')) {
                throw new Error('Spotify Premium is required to play tracks');
            } else if (error.message.includes('No active')) {
                throw new Error(
                    'Please open Spotify on your device or refresh the page'
                );
            } else {
                throw error;
            }
        }
    }

    async getDevices() {
        const response = await fetch(
            'https://api.spotify.com/v1/me/player/devices',
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                }
            }
        );
        const data = await response.json();
        return data.devices || [];
    }

    async pause() {
        if (!this.player) return;
        await this.player.pause();
    }

    async resume() {
        if (!this.player) return;
        await this.player.resume();
    }

    async next() {
        if (!this.player) return;
        await this.player.nextTrack();
    }

    async previous() {
        if (!this.player) return;
        await this.player.previousTrack();
    }

    async getCurrentState() {
        if (!this.player) return null;
        return await this.player.getCurrentState();
    }

    disconnect() {
        this.accessToken = null;
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_auth_state');
        if (this.player) {
            this.player.disconnect();
            this.player = null;
        }
        isUsingSpotify = false;
        return true;
    }
}

export default new SpotifyService();
