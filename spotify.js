// =============================================
// SPOTIFY INTEGRATION — Preview de 30s
// =============================================
// 1. Crie um app em https://developer.spotify.com/dashboard
// 2. Copie seu Client ID e Client Secret abaixo
// 3. Adicione <script src="spotify.js"></script> no seu HTML (antes do </body>)

const SPOTIFY_CLIENT_ID     = "378c79139eea40a8b583fffc7ae1dec1";
const SPOTIFY_CLIENT_SECRET = "da2f01d91e2f46b8be3e9eec77793053";

let spotifyToken = null;
let tokenExpiry  = 0;

// ─── Autenticação (Client Credentials) ───────────────────────────────────────

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpiry) return spotifyToken;

  const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type":  "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("Falha ao obter token do Spotify");

  const data = await res.json();
  spotifyToken = data.access_token;
  tokenExpiry  = Date.now() + data.expires_in * 1000 - 60000; // renova 1 min antes
  return spotifyToken;
}

// ─── Busca de músicas ─────────────────────────────────────────────────────────

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

// ─── UI: renderiza resultados ─────────────────────────────────────────────────

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

// ─── Carrega preview no player principal ──────────────────────────────────────

function loadSpotifyPreview(track, albumArt) {
  const artists = track.artists.map(a => a.name).join(", ");

  // Reutiliza os elementos do player existente
  const audio   = document.getElementById("audio");
  const display = document.getElementById("display");
  const cover   = document.getElementById("cover").querySelector("img");
  const bgImg   = document.getElementById("bg-img");
  const cdHover = document.getElementById("cd-hover");

  // Atualiza áudio
  audio.src = track.preview_url;
  audio.play();

  // Atualiza display
  display.textContent = `${artists} — ${track.name} (prévia Spotify)`;

  // Troca capa com fade
  cover.style.opacity = 0;
  bgImg.style.opacity = 0;

  setTimeout(() => {
    cover.src = albumArt;
    bgImg.src = albumArt; // usa a capa como background também
    cdHover.src = albumArt;

    cover.onload = () => cover.style.opacity = 1;
    bgImg.onload = () => bgImg.style.opacity  = 1;
  }, 400);

  // Desmarca item ativo da playlist local
  document.querySelectorAll(".track").forEach(el => el.classList.remove("active"));

  // Fecha o painel de busca
  toggleSpotifyPanel(false);
}

// ─── Toggle do painel ─────────────────────────────────────────────────────────

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

// ─── Evento de busca com debounce ─────────────────────────────────────────────

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
      `<div class="sp-loading">Buscando<span class="sp-dots">...</span></div>`;

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

  // Fechar ao clicar fora
  document.addEventListener("click", e => {
    const panel  = document.getElementById("spotify-panel");
    const button = document.getElementById("spotify-toggle-btn");
    if (!panel.contains(e.target) && e.target !== button) {
      toggleSpotifyPanel(false);
    }
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", initSpotifyUI);