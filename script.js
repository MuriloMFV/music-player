const tracks = window.musicLibrary;

const audio = document.getElementById("audio");
const display = document.getElementById("display");
const playlist = document.getElementById("playlist");
const cover = document.getElementById("cover").querySelector("img");
const progressContainer = document.getElementById("progress-container");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const bgImg = document.getElementById("bg-img");
const sourceEl = document.getElementById("player-source");
const playbackMessageEl = document.getElementById("playback-message");
const playToggle = document.getElementById("play-toggle");
const muteToggle = document.getElementById("mute-toggle");
const volumeInput = document.getElementById("volume");
const volumeValue = document.getElementById("volume-value");
const playerEl = document.querySelector(".player");
const PLAYER_STATE_KEY = "music_player_local_state";

function readPlayerState() {
  try {
    return JSON.parse(localStorage.getItem(PLAYER_STATE_KEY) || "null") || {};
  } catch {
    return {};
  }
}

const savedPlayerState = readPlayerState();

let currentTrack = Math.min(Math.max(Number(savedPlayerState.trackIndex) || 0, 0), tracks.length - 1);
let source = "local";
let spotifyAdapter = null;
let artworkTimer = null;
let playbackVersion = 0;
let isPlaying = false;
let isLoading = false;
let pendingLocalPosition = Number(savedPlayerState.position) || 0;
let lastSavedSecond = -1;
let volume = Number.isFinite(Number(savedPlayerState.volume)) ? Number(savedPlayerState.volume) : 0.8;
let volumeBeforeMute = volume || 0.8;

function setArtwork({ cover: coverSrc, background, disk }) {
  clearTimeout(artworkTimer);
  bgImg.style.opacity = 0;
  cover.style.opacity = 0;

  artworkTimer = setTimeout(() => {
    if (background) bgImg.src = background;
    if (coverSrc) cover.src = coverSrc;
    if (disk) document.getElementById("cd-hover").src = disk;
    bgImg.style.opacity = 1;
    cover.style.opacity = 1;
  }, 250);
}

function setPlaybackMessage(message = "", isError = false) {
  playbackMessageEl.textContent = message;
  playbackMessageEl.classList.toggle("error", isError);
}

function handlePlaybackFailure(error) {
  const message = error?.message || "Não foi possível iniciar a reprodução.";
  updatePlayToggle(true);
  setPlaybackMessage(message, true);
}

function updatePlayToggle(paused = true, loading = false) {
  isPlaying = !paused;
  isLoading = loading;
  playToggle.textContent = loading ? "…" : paused ? "▶" : "⏸";
  playToggle.setAttribute("aria-label", loading ? "Carregando música" : paused ? "Reproduzir" : "Pausar");
  playToggle.setAttribute("aria-pressed", String(!paused));
  playToggle.classList.toggle("loading", loading);
  playerEl.classList.toggle("is-playing", !paused && !loading);
}

function savePlayerState() {
  localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify({
    trackIndex: currentTrack,
    position: source === "local" && Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
    volume
  }));
}

function renderVolume() {
  const percent = Math.round(volume * 100);
  volumeInput.value = String(volume);
  volumeValue.textContent = `${percent}%`;
  muteToggle.textContent = volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊";
  muteToggle.setAttribute("aria-label", volume === 0 ? "Restaurar volume" : "Silenciar");
  volumeInput.style.setProperty("--volume", `${percent}%`);
}

function setVolume(nextVolume, persist = true) {
  volume = Math.min(1, Math.max(0, Number(nextVolume) || 0));
  audio.volume = volume;
  if (volume > 0) volumeBeforeMute = volume;
  spotifyAdapter?.setVolume(volume).catch(() => {});
  renderVolume();
  if (persist) savePlayerState();
}

async function activateLocalPlayer() {
  playbackVersion += 1;
  if (source === "spotify" && spotifyAdapter) {
    await spotifyAdapter.pause().catch(() => {});
  }
  source = "local";
  sourceEl.textContent = "Biblioteca";
  sourceEl.classList.remove("spotify");
  playerEl.classList.remove("spotify-active");
  updatePlayToggle(true);
  setPlaybackMessage("");
}

async function loadTrack(index, autoplay = false) {
  await activateLocalPlayer();
  currentTrack = index;
  audio.src = tracks[index].src;
  display.textContent = tracks[index].name;
  setArtwork(tracks[index]);

  document.querySelectorAll(".track").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".track")[index]?.classList.add("active");
  progress.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  savePlayerState();
  if (autoplay) await audio.play();
}

function playTrack() {
  if (source === "spotify" && spotifyAdapter) {
    spotifyAdapter.resume().catch(error => setPlaybackMessage(error.message, true));
    return;
  }
  audio.play().catch(() => handlePlaybackFailure(new Error("O navegador bloqueou a reprodução.")));
}

function pauseTrack() {
  if (source === "spotify" && spotifyAdapter) {
    spotifyAdapter.pause().catch(error => setPlaybackMessage(error.message, true));
    return;
  }
  audio.pause();
}

function togglePlayback() {
  if (isLoading) return;
  if (isPlaying) pauseTrack();
  else playTrack();
}

function nextTrack() {
  if (source === "spotify" && spotifyAdapter) {
    spotifyAdapter.next().catch(error => setPlaybackMessage(error.message, true));
    return;
  }
  currentTrack = (currentTrack + 1) % tracks.length;
  loadTrack(currentTrack, true).catch(handlePlaybackFailure);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
}

audio.addEventListener("timeupdate", () => {
  if (source !== "local") return;
  const { currentTime, duration } = audio;
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  progress.style.width = `${progressPercent}%`;

  currentTimeEl.textContent = formatTime(currentTime);
  if (!isNaN(duration)) {
    durationEl.textContent = formatTime(duration);
  }
  const currentSecond = Math.floor(currentTime);
  if (currentSecond % 5 === 0 && currentSecond !== lastSavedSecond) {
    lastSavedSecond = currentSecond;
    savePlayerState();
  }
});

audio.addEventListener("loadstart", () => {
  if (source !== "local") return;
  updatePlayToggle(true, true);
  setPlaybackMessage("Carregando faixa…");
});

audio.addEventListener("loadedmetadata", () => {
  if (source !== "local") return;
  if (pendingLocalPosition > 0 && pendingLocalPosition < audio.duration - 1) {
    audio.currentTime = pendingLocalPosition;
  }
  pendingLocalPosition = 0;
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("canplay", () => {
  if (source !== "local" || !audio.paused) return;
  updatePlayToggle(true);
  setPlaybackMessage("Pronto para tocar");
});

audio.addEventListener("playing", () => {
  if (source !== "local") return;
  updatePlayToggle(false);
  setPlaybackMessage("Tocando da biblioteca");
});

audio.addEventListener("pause", () => {
  if (source !== "local" || audio.ended) return;
  updatePlayToggle(true);
  setPlaybackMessage("Pausado");
  savePlayerState();
});

audio.addEventListener("waiting", () => {
  if (source !== "local") return;
  updatePlayToggle(true, true);
  setPlaybackMessage("Carregando áudio…");
});

audio.addEventListener("error", () => {
  if (source !== "local") return;
  updatePlayToggle(true);
  setPlaybackMessage("Não foi possível carregar esta faixa.", true);
});

audio.addEventListener("ended", () => {
  nextTrack();
});


progressContainer.addEventListener("click", (e) => {
  const width = progressContainer.clientWidth;
  const ratio = Math.min(1, Math.max(0, e.offsetX / width));
  if (source === "spotify" && spotifyAdapter) {
    spotifyAdapter.seek(ratio).catch(error => setPlaybackMessage(error.message, true));
    return;
  }
  if (Number.isFinite(audio.duration)) audio.currentTime = ratio * audio.duration;
});

playToggle.addEventListener("click", togglePlayback);
volumeInput.addEventListener("input", event => setVolume(event.target.value));
muteToggle.addEventListener("click", () => setVolume(volume === 0 ? volumeBeforeMute : 0));

document.getElementById("prev").addEventListener("click", () => {
  if (source === "spotify" && spotifyAdapter) {
    spotifyAdapter.previous().catch(error => setPlaybackMessage(error.message, true));
    return;
  }
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrack, true).catch(handlePlaybackFailure);
});

document.getElementById("next").addEventListener("click", nextTrack);



tracks.forEach((track, index) => {
  const div = document.createElement("div");
  div.textContent = track.name;
  div.classList.add("track");
  div.addEventListener("click", () => {
    loadTrack(index, true).catch(handlePlaybackFailure);
  });
  playlist.appendChild(div);
});

setVolume(volume, false);
loadTrack(currentTrack).catch(() => {});
window.addEventListener("pagehide", savePlayerState);

const searchInput = document.getElementById("search");

const noResults = document.createElement("div");
noResults.textContent = "Nenhuma música encontrada";
noResults.style.display = "none";
noResults.classList.add("no-results");
playlist.appendChild(noResults);

searchInput.addEventListener("input", () => {
  if (document.getElementById("spotify-mode-btn").classList.contains("active")) return;
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

window.musicPlayer = {
  setSpotifyAdapter(adapter) {
    spotifyAdapter = adapter;
    spotifyAdapter.setVolume(volume).catch(() => {});
  },
  async activateSpotify(track) {
    const version = ++playbackVersion;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    source = "spotify";
    sourceEl.textContent = "Spotify";
    sourceEl.classList.add("spotify");
    playerEl.classList.add("spotify-active");
    document.querySelectorAll(".track.active").forEach(el => el.classList.remove("active"));
    const artists = track.artists?.map(artist => artist.name).join(", ") || "Spotify";
    display.textContent = `${artists} — ${track.name}`;
    const art = track.album?.images?.[0]?.url || "";
    setArtwork({ cover: art, background: art, disk: art });
    updatePlayToggle(true, true);
    setPlaybackMessage("Conectando ao Spotify…");
    return version;
  },
  updateSpotifyState(state) {
    if (source !== "spotify") return;
    const track = state.track_window?.current_track;
    if (track) {
      const artists = track.artists?.map(artist => artist.name).join(", ") || "Spotify";
      display.textContent = `${artists} — ${track.name}`;
    }
    const duration = state.duration || 0;
    const position = state.position || 0;
    progress.style.width = `${duration ? (position / duration) * 100 : 0}%`;
    currentTimeEl.textContent = formatTime(position / 1000);
    durationEl.textContent = formatTime(duration / 1000);
    updatePlayToggle(state.paused, false);
    setPlaybackMessage(state.paused ? "Pausado" : "Tocando via Spotify");
  },
  setPlaybackMessage,
  reportPlaybackError(message) {
    handlePlaybackFailure(new Error(message));
  },
  isSpotifyActive() {
    return source === "spotify";
  },
  isCurrentSpotifySession(version) {
    return source === "spotify" && playbackVersion === version;
  },
  async returnToLocal() {
    pendingLocalPosition = 0;
    await loadTrack(currentTrack, false);
  }
};


// MODAL DO CD
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
  if (window.musicPlayer?.isSpotifyActive()) return;
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
