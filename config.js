const config = {
    SPOTIFY_CLIENT_ID: '390e579ed2144529aadf98484fdac58d', // You'll need to replace this with your actual client ID
    SPOTIFY_REDIRECT_URI: 'http://localhost:3000', // Updated to use localhost
    SCOPES: [
        'user-read-private',
        'user-read-email',
        'user-library-read',
        'user-library-modify',
        'playlist-read-private',
        'playlist-modify-public',
        'playlist-modify-private',
        'streaming',
        'user-read-playback-state',
        'user-modify-playback-state'
    ].join(' ')
};

export default config;
