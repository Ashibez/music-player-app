# Music Player App

A modern, responsive web-based music player application built with HTML, CSS, and JavaScript, featuring Spotify API integration.

## Features

-   🎵 Play/pause, skip, and control music playback
-   🎸 Spotify API integration for extended music library
-   📱 Responsive design that works on desktop and mobile
-   🎨 Modern and intuitive user interface
-   📂 Local music file support
-   🎯 Easy-to-use controls
-   📱 Mobile-friendly interface with touch support

## Technologies Used

-   HTML5
-   CSS3
-   JavaScript
-   Python (Server)
-   Spotify Web API

## Getting Started

1. Clone the repository:

    ```bash
    git clone https://github.com/Ashibez/music-player-app.git
    ```

2. Navigate to the project directory:

    ```bash
    cd music-player-app
    ```

3. Configure Spotify API:

    - Create a Spotify Developer account at https://developer.spotify.com
    - Create a new application in the Spotify Developer Dashboard
    - Copy your Client ID and Client Secret
    - Add them to your `config.js` file:
        ```javascript
        const config = {
            clientId: 'your_client_id',
            clientSecret: 'your_client_secret'
        };
        ```

4. Start the Python server:

    ```bash
    python server.py
    ```

5. Open your browser and visit:
    ```
    http://localhost:3000
    ```

## Usage

-   Click on a song to play it
-   Use the play/pause button to control playback
-   Click the next/previous buttons to change songs
-   Use the menu options for additional features
-   Search and play music from Spotify's vast library
-   Create and manage playlists with both local and Spotify tracks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
