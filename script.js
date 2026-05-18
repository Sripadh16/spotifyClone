console.log("Hello World!");
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
                  <img class = "invert" src = music.svg alt="" />
                  <div class="info">
                  <div>${song}</div>
                  </div>
                  <img class = "playbtn" src="play.svg" alt="Play Button" />`;
    songUl.appendChild(li);
  }

  //attack an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li"),
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
      play.src = "pause.svg";
    });
  });
};

async function getAlbums() {
      let a = await fetch("http://127.0.0.1:5500/songs/");
      let response = await a.text();
      //a temporary element to hold the HTML so we can "search" it
      let div = document.createElement("div");
      div.innerHTML = response;

      let anchors = div.getElementsByTagName("a");
      Array.from(anchors).forEach(async e => {
            if (e.href.includes("/songs/")) {
                  console.log(e.href.split("/songs/")[1]);
                  let folderName = e.href.split("/songs/")[1];
                  //get metadata for each album
                  let b = await fetch(`http://127.0.0.1:5500/songs/${folderName}/info.json`);
                  let response = await b.json();
                  console.log(response);
            }
      });     
}

async function main() {
  songs = await getSongs("songs/english");
  updateSongListUI(songs);
  playMusic(songs[0], true);

  //display all the albums on page
  getAlbums();

  //attach event listener to play prev and next
  play.addEventListener("click", () => {
    if (currSong.paused) {
      currSong.play();
      play.src = "pause.svg";
    } else {
      currSong.pause();
      play.src = "play.svg";
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
    play.src = "pause.svg";
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
    play.src = "pause.svg";
  });

  //event listener to volume control
  document.querySelector(".range").addEventListener("input", (e) => {
    currSong.volume = e.target.value / 100;
  });

  //attach an event listener to each card to change the song list
  Array.from(document.querySelectorAll(".card")).forEach((e) => {
    e.addEventListener("click", async () => {
      let folder = e.getAttribute("data-folder");
      songs = await getSongs(`songs/${folder}`);
      playMusic(songs[0]);
      updateSongListUI(songs);
      play.src = "pause.svg";
    });
  });
}
main();
