const tracks = [
  { 
    name: "Australian Crawl - No Not You Again (1981)", 
    src: "./tracks/Australian Crawl - Oh No Not You Again.mp3", 
    cover: "./covers/australian.jpg",
    background: "./background/fundo (1).jpg"
  },
  
  {
    name: "Black Eyed Peas - Meet Me Halfway (2009)",
    src: "./tracks/Meet Me Halfway - Black Eyed Peas.mp3",
    cover: "./covers/Cover of Meet Me Halfway by Black Eyed Peas.jpg",
    background: "./background/undefined - Imgur.gif"
  },
  {
    name: "Bob Marley - Could You Be Loved (1980)",
    src: "./tracks/Could You Be Loved.mp3",
    cover: "./covers/bobmarley.jpeg",
    background: "./background/fundo(4).jpg"
  },
  {
    name: "MF DOOM feat. Mr. Fantastik - Rapp Snitch Knishes (2004)",
    src: "./tracks/Rapp Snitch Knishes - MF DOOM (youtube).mp3",
    cover: "./covers/mfdoom.jpeg",
    background: "./background/fundo(5).jpg"
  },
  {
    name: "Daft Punk (feat. Pharrell Williams and Nile Rodgers) - Get Lucky (2014)",
    src: "./tracks/Get Lucky (feat. Pharrell Williams and Nile Rodgers) - Daft Punk.mp3",
    cover: "./covers/Cover of Get Lucky (feat. Pharrell Williams and Nile Rodgers) by Daft Punk, Pharrell Williams, Nile Rodgers.jpg",
    background: "./background/undefined - Imgur(2).gif"
  
  },
  {
    name: "Zé Ramalho - Chão de Giz (1977)",
    src: "./tracks/CHAO DE GIZ.mp3",
    cover: "./covers/zc3a9.jpg",
    background: "./background/fundo(6).jpg"
  },
  {
    name: "The Cranberries - Linger (1993)",
    src: "./tracks/Cranberries - Linger .mp3",
    cover: "./covers/thecranberries.webp",
    background: "./background/fundo(7).webp"
  },
  {
    name: "No Doubt - Just a Girl (1995)",
    src: "./tracks/Just A Girl - No Doubt.mp3",
    cover: "./covers/Cover of Don't Speak by No Doubt.jpg",
    background: "./background/fundo(8).jpg"
  },
  {
    name: "Sade - Kiss of Life (1988) ",
    src: "./tracks/Kiss of Life - Sade.mp3",
    cover: "./covers/Cover of Kiss of Life by Sade.jpg",
    background: "./background/fundo(10).jpeg"
  },
  {
    name: "MGMT - Kids (2005)",
    src: "./tracks/Kids - MGMT.mp3",
    cover: "./covers/mgmt.jpg",
    background: "./background/undefined - Imgur(3).gif"
  
  },
  { 
    name: "Cidade Negra - Luta De Classes (1994)", 
    src: "./tracks/Luta De Classes.mp3", 
    cover: "./covers/cidade-negra.jpg",
    background: "./background/fundo (2).jpg"
  },
  { 
    name: "Bread - Everything I Own (1972)", 
    src: "./tracks/Track 03.mp3", 
    cover: "./covers/bread-baby-im-a-want-you.jpg",
    background: "./background/fundo (3).jpg"
  }
  
 
];

const audio = document.getElementById("audio");
const display = document.getElementById("display");
const playlist = document.getElementById("playlist");
const cover = document.getElementById("cover").querySelector("img");
const progressContainer = document.getElementById("progress-container");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const bgImg = document.getElementById("bg-img");

let currentTrack = 0;

function loadTrack(index) {
  audio.src = tracks[index].src;
  display.textContent = tracks[index].name;

  // fade transition
  bgImg.style.opacity = 0;
  cover.style.opacity = 0;

  setTimeout(() => {
    bgImg.src = tracks[index].background;
    cover.src = tracks[index].cover;

    bgImg.onload = () => bgImg.style.opacity = 1;
    cover.onload = () => cover.style.opacity = 1;
  }, 400);

  document.querySelectorAll(".track").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".track")[index].classList.add("active");
}

function playTrack() {
  audio.play();
}

function pauseTrack() {
  audio.pause();
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
}

audio.addEventListener("timeupdate", () => {
  const { currentTime, duration } = audio;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;

  currentTimeEl.textContent = formatTime(currentTime);
  if (!isNaN(duration)) {
    durationEl.textContent = formatTime(duration);
  }
});

progressContainer.addEventListener("click", (e) => {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
});

document.getElementById("play").addEventListener("click", playTrack);
document.getElementById("pause").addEventListener("click", pauseTrack);

document.getElementById("prev").addEventListener("click", () => {
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrack);
  playTrack();
});

document.getElementById("next").addEventListener("click", () => {
  currentTrack = (currentTrack + 1) % tracks.length;
  loadTrack(currentTrack);
  playTrack();
});

tracks.forEach((track, index) => {
  const div = document.createElement("div");
  div.textContent = track.name;
  div.classList.add("track");
  div.addEventListener("click", () => {
    currentTrack = index;
    loadTrack(index);
    playTrack();
  });
  playlist.appendChild(div);
});

loadTrack(currentTrack);
