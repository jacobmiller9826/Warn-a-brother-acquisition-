let audioPlaying = false;
const audioToggle = document.getElementById('audio-toggle');
const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
audio.loop = true;

audioToggle.addEventListener("click", () => {
    if(audioPlaying){
        audio.pause();
        audioPlaying = false;
        audioToggle.textContent = "🔊";
    } else {
        audio.play();
        audioPlaying = true;
        audioToggle.textContent = "🔇";
    }
});
