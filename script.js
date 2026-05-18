console.log("Hello World!");
let songsUl;
let currSong = new Audio();
async function getSongs(){
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();

    //a temporary element to hold the HTML so we can "search" it
    let div = document.createElement("div");
    div.innerHTML = response;

    
    let links = div.getElementsByTagName("a");
    let songs = [];

    
    for (let i = 0; i < links.length; i++) {
        const element = links[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(element.href.split("songs/")[1]));
        }
    }
    return songs;
}

const playMusic = (track, pause = false) =>{
    currSong.src = "/songs/" + track
    if (!pause) {
        currSong.play()
    }
    document.querySelector(".songInfo").innerHTML = track;
    document.querySelector(".songTime").innerHTML = "0:00 / 0:00";
}

async function main(){
    songs = await getSongs();
    playMusic(songs[0],true);
    
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    for (const song of songs) {
        let li = document.createElement("li");
        li.innerHTML = `
            <img class = "invert" src = music.svg alt="" />
            <div class="info">
            <div>${song}</div>
            </div>
            <img class = "playbtn" src="play.svg" alt="Play Button" />`
            songUl.appendChild(li);
    }
    //attack an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            play.src = "pause.svg"
        })
    })

    //attach event listener to play prev and next
    play.addEventListener("click", ()=>{
        if(currSong.paused){
            currSong.play()
            play.src = "pause.svg"
        }else{
            currSong.pause()
            play.src = "play.svg"
        }
    })

    //listen for time update event
    currSong.addEventListener("timeupdate",()=>{
        let current = Math.floor(currSong.currentTime);
        let total = Math.floor(currSong.duration);

        
        let currentMinutes = Math.floor(current / 60);
        let currentSeconds = current % 60 < 10 ? "0" + (current % 60) : current % 60;
        let currentFormatted = `${currentMinutes}:${currentSeconds}`;

        
        let totalFormatted = "0:00"; 
        if (!isNaN(total)) {
            let totalMinutes = Math.floor(total / 60);
            let totalSeconds = total % 60 < 10 ? "0" + (total % 60) : total % 60;
            totalFormatted = `${totalMinutes}:${totalSeconds}`;
        }

        
        document.querySelector(".songTime").innerHTML = `${currentFormatted}  /  ${totalFormatted}`;

        
        if (!isNaN(total) && total > 0) {
            document.querySelector(".circle").style.left = `${(current / total) * 100}%`;
        } else {
            document.querySelector(".circle").style.left = "0%";
        }
    })

    //event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        document.querySelector(".circle").style.left = `${(e.offsetX / e.target.getBoundingClientRect().width) * 100}%`;
        currSong.currentTime = (e.offsetX / e.target.getBoundingClientRect().width) * currSong.duration;
    })

    //event listener to hamburger menu
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0";
    })

    //event listener to close button
    document.querySelector(".left > .close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-100%";
    })

    //event listener to previous button
    document.querySelector("#previous").addEventListener("click",()=>{
 
        let currIndex = songs.indexOf(decodeURIComponent(currSong.src.split("/songs/")[1]));
        if (currIndex === 0) {
            playMusic(songs[songs.length - 1]);
        } else {
            playMusic(songs[currIndex - 1]);
        }
        play.src = "pause.svg"
    })

    //event listener to next button
    document.querySelector("#next").addEventListener("click",()=>{

        let currIndex = songs.indexOf(decodeURIComponent(currSong.src.split("/songs/")[1])) ;
        if (currIndex === songs.length - 1) {
            playMusic(songs[0]);
        } else {
            playMusic(songs[currIndex + 1]);
        }
        play.src = "pause.svg"
    })

    //event listener to volume control
    document.querySelector(".range").addEventListener("input",(e)=>{
        currSong.volume = e.target.value / 100;
    })
};  
 
main();