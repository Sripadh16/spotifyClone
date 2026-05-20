
let songsUl;
let currSong = new Audio();
let currFolder;
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();

  //a temporary element to hold the HTML so we can "search" it
  let div = document.createElement("div");
  div.innerHTML = response;

  let links = div.getElementsByTagName("a");
  let songs = [];

  for (let i = 0; i < links.length; i++) {
    const element = links[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
    }
  }
  return songs;
}

const playMusic = (track, pause = false) => {
  currSong.src = `/${currFolder}/${track}`;
  if (!pause) {
    currSong.play();
  }
  document.querySelector(".songInfo").innerHTML = track;
  document.querySelector(".songTime").innerHTML = "0:00 / 0:00";
};

const updateSongListUI = (songs) => {
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";

  for (const song of songs) {
    let li = document.createElement("li");
    li.innerHTML = `
                  <img class = "invert" src = "icons/music.svg" alt="" />
                  <div class="info">
                  <div>${song}</div>
                  </div>
                  <img class = "playbtn" src="icons/play.svg" alt="Play Button" />`;
    songUl.appendChild(li);
  }

  //attack an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li"),
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
      play.src = "icons/pause.svg";
    });
  });
};

async function getAlbums() {
  let a = await fetch("http://127.0.0.1:5500/songs/");
  let response = await a.text();
  //a temporary element to hold the HTML so we can "search" it
  let div = document.createElement("div");
  div.innerHTML = response;

  let cardContainer = document.querySelector(".card-container");
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);
  for (index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
  
      let folderName = e.href.split("/songs/")[1];
      //get metadata for each album
      let b = await fetch(
        `http://127.0.0.1:5500/songs/${folderName}/info.json`,
      );
      let response = await b.json();

      //create a card for each album 
      cardContainer.innerHTML += `<div data-folder="${folderName}" class="card bg-grey">
              <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="black"
                >
                  <path
                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                  />
                </svg>
              </div>
              <img
                src="${response.coverImage}"
                alt="${response.title}"
              />
              <h3>${response.title}</h3>
              <p>${response.description}</p>
            </div>`;
    }
  }

  //attach an event listener to each card to change the song list
  Array.from(document.querySelectorAll(".card")).forEach((e) => {
    e.addEventListener("click", async () => {
      let folder = e.getAttribute("data-folder");
      songs = await getSongs(`songs/${folder}`);
      playMusic(songs[0]);
      updateSongListUI(songs);
      play.src = "icons/pause.svg";
    });
  });

}

async function main() {
  songs = await getSongs("songs/hindi");
  updateSongListUI(songs);
  playMusic(songs[0], true);

  //display all the albums on page
  getAlbums();

  //attach event listener to play prev and next
  play.addEventListener("click", () => {
    if (currSong.paused) {
      currSong.play();
      play.src = "icons/pause.svg";
    } else {
      currSong.pause();
      play.src = "icons/play.svg";
    }
  });

  //listen for time update event
  currSong.addEventListener("timeupdate", () => {
    let current = Math.floor(currSong.currentTime);
    let total = Math.floor(currSong.duration);

    let currentMinutes = Math.floor(current / 60);
    let currentSeconds =
      current % 60 < 10 ? "0" + (current % 60) : current % 60;
    let currentFormatted = `${currentMinutes}:${currentSeconds}`;

    let totalFormatted = "0:00";
    if (!isNaN(total)) {
      let totalMinutes = Math.floor(total / 60);
      let totalSeconds = total % 60 < 10 ? "0" + (total % 60) : total % 60;
      totalFormatted = `${totalMinutes}:${totalSeconds}`;
    }

    document.querySelector(".songTime").innerHTML =
      `${currentFormatted}   /   ${totalFormatted}`;

    if (!isNaN(total) && total > 0) {
      document.querySelector(".circle").style.left =
        `${(current / total) * 100}%`;
    } else {
      document.querySelector(".circle").style.left = "0%";
    }
  });

  //event listener to seek bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    document.querySelector(".circle").style.left =
      `${(e.offsetX / e.target.getBoundingClientRect().width) * 100}%`;
    currSong.currentTime =
      (e.offsetX / e.target.getBoundingClientRect().width) * currSong.duration;
  });

  //event listener to hamburger menu
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //event listener to close button
  document.querySelector(".left > .close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  //event listener to previous button
  document.querySelector("#previous").addEventListener("click", () => {
    let currIndex = songs.indexOf(
      decodeURIComponent(currSong.src.split(`/${currFolder}/`)[1]),
    );
    if (currIndex === 0) {
      playMusic(songs[songs.length - 1]);
    } else {
      playMusic(songs[currIndex - 1]);
    }
    play.src = "icons/pause.svg";
  });

  //event listener to next button
  document.querySelector("#next").addEventListener("click", () => {
    let currIndex = songs.indexOf(
      decodeURIComponent(currSong.src.split(`/${currFolder}/`)[1]),
    );
    if (currIndex === songs.length - 1) {
      playMusic(songs[0]);
    } else {
      playMusic(songs[currIndex + 1]);
    }
    play.src = "icons/pause.svg";
  });

  //event listener to volume control
  document.querySelector(".range").addEventListener("input", (e) => {
    currSong.volume = e.target.value / 100;
    if(currSong.volume === 0){
      document.querySelector(".volume img").src = "icons/mute.svg";
    }else{
      document.querySelector(".volume img").src = "icons/volume.svg";
    }
  });

  //event listener to volume icon to mute/unmute
  document.querySelector(".volume img").addEventListener("click", e =>{
    if(currSong.volume === 0){
      currSong.volume = 0.4;
      document.querySelector(".range input").value = 40;
      document.querySelector(".volume img").src = "icons/volume.svg";
      
    }else{
      currSong.volume = 0;
      document.querySelector(".range input").value = 0;
      document.querySelector(".volume img").src = "icons/mute.svg";
    }
  })
}
main();
