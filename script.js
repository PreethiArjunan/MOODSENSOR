function playMood(mood) {
    const audio = document.getElementById('moodAudio');

    let song = '';
    switch(mood) {
        case 'happy':
            song = 'songs/happy.mp3';
            break;
        case 'sad':
            song = 'songs/sad.mp3';
            break;
        case 'angry':
            song = 'songs/angry.mp3';
            break;
        case 'chill':
            song = 'songs/chill.mp3';
            break;
        case 'love':
            song = 'songs/love.mp3';
            break;
    }

    audio.src = song;
    audio.play();
}