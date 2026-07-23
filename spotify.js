// =============================================
// SPOTIFY INTEGRATION — Preview de 30s (FRONT ONLY)
// =============================================
// ⚠️ IMPORTANTE:
// 1. Crie um app em: https://developer.spotify.com/dashboard
// 2. Coloque seu CLIENT ID abaixo
// 3. Configure o Redirect URI no Spotify (EX: http://localhost:5500)
// =============================================

// 🔑 CONFIG
const SPOTIFY_CLIENT_ID = "378c79139eea40a8b583fffc7ae1dec1";
const REDIRECT_URI = window.location.origin + window.location.pathname;

// 🔐 TOKEN
let spotifyToken = null;
let tokenExpiry  = 0;

// ─── LOGIN SPOTIFY ───────────────────────────────────────────────────────────

function loginSpotify() {
  const scopes = ""; // não precisa de permissões

  const url = `https://accounts.spotify.com/authorize?` +
    `client_id=${SPOTIFY_CLIENT_ID}` +
    `&response_type=token` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${scopes}`;

  window.location.href = url;
}

// ─── CAPTURA TOKEN DA URL ────────────────────────────────────────────────────

function getTokenFromUrl() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);

  const accessToken = params.get("access_token");
  const expiresIn   = params.get("expires_in");

  if (accessToken) {
    spotifyToken = accessToken;
    tokenExpiry  = Date.now() + expiresIn * 1000;

    // limpa URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// ─── GERENCIA TOKEN ──────────────────────────────────────────────────────────

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpiry) return spotifyToken;

  getTokenFromUrl();

  if (spotifyToken) return spotifyToken;

  // se não tiver token → login
  loginSpotify();
}

// ─── BUSCA DE MÚSICAS ─────────────────────────────────────────────────────────

async function searchSpotify(query) {
  const token = await getSpotifyToken();

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8&market=BR`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error("Erro na busca do Spotify");

  const data = await res.json();
  return data.tracks.items;
}

// ─── UI: RESULTADOS ──────────────────────────────────────────────────────────

function renderSpotifyResults(tracks) {
  const container = document.getElementById("spotify-results");
  container.innerHTML = "";

  if (!tracks.length) {
    container.innerHTML = `<div class="sp-empty">Nenhum resultado encontrado</div>`;
    return;
  }

  tracks.forEach(track => {
    const hasPreview = !!track.preview_url;
    const artists    = track.artists.map(a => a.name).join(", ");
    const albumArt   = track.album.images[1]?.url || track.album.images[0]?.url || "";

    const div = document.createElement("div");
    div.className = `sp-track ${hasPreview ? "" : "sp-no-preview"}`;
    div.innerHTML = `
      <img class="sp-art" src="${albumArt}" alt="capa">
      <div class="sp-info">
        <span class="sp-name">${track.name}</span>
        <span class="sp-artist">${artists}</span>
        <span class="sp-album">${track.album.name} · ${track.album.release_date?.slice(0,4)}</span>
      </div>
      <button class="sp-play-btn ${hasPreview ? "" : "sp-disabled"}"
              title="${hasPreview ? "Tocar prévia de 30s" : "Prévia indisponível"}">
        ${hasPreview ? "▶ 30s" : "—"}
      </button>
    `;

    if (hasPreview) {
      div.querySelector(".sp-play-btn").addEventListener("click", () => {
        loadSpotifyPreview(track, albumArt);
      });
    }

    container.appendChild(div);
  });
}

// ─── PLAYER ──────────────────────────────────────────────────────────────────

function loadSpotifyPreview(track, albumArt) {
  const artists = track.artists.map(a => a.name).join(", ");

  const audio   = document.getElementById("audio");
  const display = document.getElementById("display");
  const cover   = document.getElementById("cover").querySelector("img");
  const bgImg   = document.getElementById("bg-img");
  const cdHover = document.getElementById("cd-hover");

  audio.src = track.preview_url;
  audio.play();

  display.textContent = `${artists} — ${track.name} (prévia Spotify)`;

  cover.style.opacity = 0;
  bgImg.style.opacity = 0;

  setTimeout(() => {
    cover.src = albumArt;
    bgImg.src = albumArt;
    cdHover.src = albumArt;

    cover.onload = () => cover.style.opacity = 1;
    bgImg.onload = () => bgImg.style.opacity  = 1;
  }, 400);

  document.querySelectorAll(".track").forEach(el => el.classList.remove("active"));
  toggleSpotifyPanel(false);
}

// ─── PAINEL ──────────────────────────────────────────────────────────────────

function toggleSpotifyPanel(force) {
  const panel = document.getElementById("spotify-panel");
  const isOpen = panel.classList.contains("sp-open");
  const shouldOpen = force !== undefined ? force : !isOpen;

  panel.classList.toggle("sp-open", shouldOpen);

  if (shouldOpen) {
    document.getElementById("spotify-search-input").focus();
  } else {
    document.getElementById("spotify-results").innerHTML = "";
    document.getElementById("spotify-search-input").value = "";
  }
}

// ─── BUSCA (DEBOUNCE) ────────────────────────────────────────────────────────

let debounceTimer;

function initSpotifyUI() {
  const input = document.getElementById("spotify-search-input");

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();

    if (!q) {
      document.getElementById("spotify-results").innerHTML = "";
      return;
    }

    document.getElementById("spotify-results").innerHTML =
      `<div class="sp-loading">Buscando...</div>`;

    debounceTimer = setTimeout(async () => {
      try {
        const tracks = await searchSpotify(q);
        renderSpotifyResults(tracks);
      } catch (err) {
        document.getElementById("spotify-results").innerHTML =
          `<div class="sp-empty">Erro: ${err.message}</div>`;
      }
    }, 500);
  });

  document.addEventListener("click", e => {
    const panel  = document.getElementById("spotify-panel");
    const button = document.getElementById("spotify-toggle-btn");

    if (!panel.contains(e.target) && e.target !== button) {
      toggleSpotifyPanel(false);
    }
  });
}

// ─── INIT ────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  getTokenFromUrl();
  initSpotifyUI();
});