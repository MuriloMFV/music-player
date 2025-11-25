const tracks = [
  { 
    name: "Australian Crawl - No Not You Again (1981)", 
    album: "Sons of Beaches",
    src: "./tracks/Australian Crawl - Oh No Not You Again.mp3", 
    cover: "./covers/australian.jpg",
    disk: "./disks/cdplaceholder.png",
    background: "./background/fundo (1).jpg"
  },
  
  {
    name: "Black Eyed Peas - Meet Me Halfway (2009)",
    album: "The E.N.D.",
    src: "./tracks/Meet Me Halfway - Black Eyed Peas.mp3",
    cover: "./covers/Cover of Meet Me Halfway by Black Eyed Peas.jpg",
    disk: "./disks/black.jpg",
    background: "./background/undefined - Imgur.gif"
  },
  {
    name: "Bob Marley - Could You Be Loved (1980)",
    album: "Uprising",
    src: "./tracks/Could You Be Loved.mp3",
    cover: "./covers/bobmarley.jpg",
    disk: "./disks/bobmarley.jpg",
    background: "./background/fundo(4).jpg"
  },
  {
    name: "MF DOOM feat. Mr. Fantastik - Rapp Snitch Knishes (2004)",
    album: "Mm..Food",
    src: "./tracks/Rapp Snitch Knishes - MF DOOM (youtube).mp3",
    cover: "./covers/mfdoom.jpg",
    disk: "./disks/mfdoom.jpg",
    background: "./background/fundo(5).jpg"
  },
  {
    name: "Daft Punk (feat. Pharrell Williams and Nile Rodgers) - Get Lucky (2014)",
    album: "Random Access Memories",
    src: "./tracks/Get Lucky (feat. Pharrell Williams and Nile Rodgers) - Daft Punk.mp3",
    cover: "./covers/daftpunk.jpg",
    disk: "./disks/daftpunk.jpg",
    background: "./background/undefined - Imgur(2).gif"
  
  },
  {
    name: "Zé Ramalho - Chão de Giz (1977)",
    album: "Zé Ramalho",
    src: "./tracks/CHAO DE GIZ.mp3",
    cover: "./covers/zeramalho.jpg",
    disk: "./disks/zéramalho.jpg",
    background: "./background/fundo(6).jpg"
  },
  {
    name: "The Cranberries - Linger (1993)",
    album: "Everybody Else Is Doing It, So Why Can't We?",
    src: "./tracks/Cranberries - Linger .mp3",
    cover: "./covers/thecranrries.jpg",
    disk: "./disks/thecranberries.jpg",
    background: "./background/fundo(7).webp"
  },
  {
    name: "No Doubt - Just a Girl (1995)",
    album: "Tragic Kingdom",
    src: "./tracks/Just A Girl - No Doubt.mp3",
    cover: "./covers/nodoubt.jpg",
    disk: "./disks/nodoubt.jpg",
    background: "./background/fundo(8).jpg"
  },
  {
    name: "Sade - Kiss of Life (1988) ",
    album: "Love Deluxe",
    src: "./tracks/Kiss of Life - Sade.mp3",
    cover: "./covers/sade.jpg",
    disk: "./disks/sade.jpg",
    background: "./background/fundo(10).jpeg"
  },
  {
    name: "MGMT - Kids (2005)",
    album: "Oracular Spectacular",
    src: "./tracks/Kids - MGMT.mp3",
    cover: "./covers/mgmt.jpg",
    disk: "./disks/mgmt.jpg",
    background: "./background/undefined - Imgur(3).gif"
  
  },
  { 
    name: "Cidade Negra - Luta De Classes (1994)", 
    album: "Sobre Todas as Forças",
    src: "./tracks/Luta De Classes.mp3", 
    cover: "./covers/cidadenegra.jpg",
    disk: "./disks/cidadenegra.jpg",
    background: "./background/fundo (2).jpg"
  },
  {
    name: "Joy Division - Disorder (1979)",
    album: "Unknown Pleasures",
    src: "./tracks/Joy Division.mp3", 
    cover: "./covers/joydivision.jpg",
    disk: "./disks/joydivision.jpg",
    background: "./background/undefined - Imgur(5).gif"
  },
  {
    name: "Ziggy Marley and the Melody Makers - Tomorrow People (1988)",
    album: "Conscious Party",
    src: "./tracks/Tomorrow People.mp3", 
    cover: "./covers/ziggy.jpg",
    disk: "./disks/ziggymarley.jpg",
    background: "./background/undefined - Imgur(4).gif"
  },
  { 
    name: "Bread - Everything I Own (1972)", 
    album: "Baby I'm-a Want You",
    src: "./tracks/Track 03.mp3", 
    cover: "./covers/bread.jpg",
    disk: "./disks/bread.jpg",
    background: "./background/fundo (3).jpg"
  },
  {
    name: "Chico Science - Da Lama ao Caos (1994)",
    album: "Da Lama ao Caos",
    src: "./tracks/Da Lama ao Caos - Chico Science.mp3", 
    cover: "./covers/chico.jpg",
    disk: "./disks/chico.jpg",
    background: "./background/fundo (10).jpg"
  },
  {
    name: "Ween - Ocean Man (1997)",
    album: "The Mollusk",
    src: "./tracks/Ocean Man - Ween.mp3", 
    cover: "./covers/ocean.jpg",
    disk: "./disks/ween.jpg",
    background: "./background/undefined - Imgur(7).gif"
  },
  {
    name: "Sublime - Santeria (1996)",
    album: "Sublime",
    src: "./tracks/Santeria - Sublime.mp3", 
    cover: "./covers/sublime.jpg",
    disk: "./disks/sublime.jpg",
    background: "./background/fundo(11).jpg"
  },
  {
    name: "Simple Minds - Mandela Day (1989) ",
    album: "Street Fighting Years",
    src: "./tracks/Simple Minds.mp3", 
    cover: "./covers/mandela.jpg",
    disk: "./disks/simpleminds.jpg",
    background: "./background/fundo(9).jpg"
  },
  {
    name: "David Bowie - Starman (1973)",
    album: "The Rise and Fall of Ziggy Stardust and the Spiders from Mars",
    src: "./tracks/David Bowie.mp3", 
    cover: "./covers/bowie.jpg",
    disk: "./disks/bowie.webp",
    background: "./background/undefined - Imgur(6).gif"
  },
  {
    name: "Engenheiros de Hawaii - Infinita Highway (1987)",
    album: "Longe Demais das Capitais",
    src: "./tracks/Infinita Highway - Engenheiros Do Hawaii.mp3", 
    cover: "./covers/engenheiros.jpg",
    disk: "./disks/cdplaceholder.png",
    background: "./background/undefined - Imgur(8).gif"
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
    document.getElementById("cd-hover").src = tracks[index].disk;

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

function nextTrack() {
  currentTrack = (currentTrack + 1) % tracks.length;
  loadTrack(currentTrack);
  playTrack();
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

audio.addEventListener("ended", () => {
  nextTrack();
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

const searchInput = document.getElementById("search");

searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  const trackElements = document.querySelectorAll(".track");

  trackElements.forEach(trackEl => {
    const text = trackEl.textContent.toLowerCase();
    // se o nome da música inclui o texto digitado, mostra; senão, esconde
    trackEl.style.display = text.includes(filter) ? "block" : "none";
  });
});

const noResults = document.createElement("div");
noResults.textContent = "Nenhuma música encontrada";
noResults.style.display = "none";
noResults.classList.add("no-results");
playlist.appendChild(noResults);

searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  const trackElements = document.querySelectorAll(".track");
  let anyVisible = false;

  trackElements.forEach(trackEl => {
    const text = trackEl.textContent.toLowerCase();
    const visible = text.includes(filter);
    trackEl.style.display = visible ? "block" : "none";
    if (visible) anyVisible = true;
  });

  noResults.style.display = anyVisible ? "none" : "block";
});


// === MODAL DO CD ===
const modal = document.getElementById("cd-modal");
const modalImg = document.getElementById("cd-image");
const modalTitle = document.getElementById("cd-title");
const modalArtist = document.getElementById("cd-artist");
const modalAlbum = document.getElementById("cd-album");
const closeModal = document.querySelector(".close");

// curiosidades sobre músicas/artistas
const curiosidades = {
  "Australian Crawl": "‘No Not You Again’ foi inspirada em um encontro desconfortável do vocalista James Reyne com uma fã insistente.",
  "Black Eyed Peas": "‘Meet Me Halfway’ foi escrita para ser uma balada futurista, combinando elementos de pop e R&B com produção eletrônica.",
  "Bob Marley": "“Could You Be Loved” foi uma das músicas mais populares de Marley, escrita em uma turnê de avião com sua banda The Wailers.",
  "MF DOOM feat. Mr. Fantastik": "MF DOOM era conhecido por usar uma máscara inspirada no vilão Doutor Destino e letras cheias de trocadilhos e referências obscuras.",
  "Daft Punk (feat. Pharrell Williams and Nile Rodgers)": "“Get Lucky” foi um marco do disco Random Access Memories, com participação de Pharrell e Nile Rodgers — uma homenagem à era disco.",
  "No Doubt": "foi inspirada nas experiências pessoais de Gwen Stefani com pais rigorosos e nas frustrações de ser mulher em uma sociedade que impõe restrições. A letra surgiu quando a cantora foi impedida de sair de carro tarde da noite por ser mulher, uma situação que a fez refletir sobre a vulnerabilidade e o tratamento desigual que as mulheres enfrentam. O tom sarcástico da música critica estereótipos de fragilidade e impotência, tornando-a um hino feminista. ",
  "MGMT": "“Kids” foi escrita quando Andrew VanWyngarden e Ben Goldwasser ainda estavam na faculdade, refletindo sobre a inocência perdida da infância.",
  "Sade": "‘Kiss of Life’ é uma das canções mais sensuais do álbum ‘Love Deluxe’, conhecido pela suavidade da voz de Sade Adu.",
  "Zé Ramalho": "“Chão de Giz” foi escrita em um momento de ruptura amorosa, e é considerada uma das músicas mais poéticas da MPB.",
  "David Bowie": "“Starman” marcou o nascimento do personagem Ziggy Stardust, o alter ego alienígena de Bowie.",
  "Cidade Negra": "“Luta de Classes” traz uma mensagem forte sobre desigualdade social, unindo reggae e crítica social.",
  "Bread": "“Everything I Own” foi escrita por David Gates como uma homenagem ao seu pai, expressando amor e gratidão.",
  "Joy Division": "‘Disorder’ foi uma das primeiras músicas escritas pela banda, refletindo a ansiedade e alienação sentidas pelos membros na época.",
  "Ziggy Marley and the Melody Makers": "‘Tomorrow People’ fala sobre esperança e mudança, temas recorrentes nas músicas de Ziggy Marley.",
  "Chico Science": "‘Da Lama ao Caos’ é um marco do movimento manguebeat, misturando ritmos tradicionais brasileiros com rock e hip-hop.",
  "Ween": "‘Ocean Man’ ganhou popularidade após ser incluída na trilha sonora do filme ‘Bob Esponja: O Filme’.",
  "Sublime": "‘Santeria’ é uma das músicas mais conhecidas da banda, combinando reggae, ska e punk rock.",
  "Simple Minds": "‘Mandela Day’ foi escrita em homenagem a Nelson Mandela e sua luta contra o apartheid na África do Sul.",
  "The Cranberries": "“Linger” foi escrita por Dolores O’Riordan aos 17 anos e fala sobre a dor da primeira desilusão amorosa.",
  "Engenheiros de Hawaii": "“Infinita Highway” usa a estrada como metáfora para a jornada da vida, um dos maiores hits da banda."
};

// abre modal ao clicar na capa
document.getElementById("cover").addEventListener("click", () => {
  const track = tracks[currentTrack];
  modal.classList.add("show");

  modalImg.src = track.disk || track.cover;

  const [artist, song] = track.name.split(" - ");
  modalTitle.textContent = song?.trim() || track.name;
  modalAlbum.textContent = track.album ? `álbum: ${track.album}` : "Álbum desconhecido";
  modalArtist.textContent = curiosidades[artist?.trim()] || "Curiosidades não disponíveis para este artista.";
});

// fecha modal
closeModal.addEventListener("click", () => {
  modal.classList.remove("show");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("show");
});
