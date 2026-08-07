// Spotify Web API — frontend only com Authorization Code + PKCE.
// Coloque apenas o Client ID abaixo. Não use Client Secret no navegador.
(() => {
  "use strict";

  const CLIENT_ID = "378c79139eea40a8b583fffc7ae1dec1";
  const REDIRECT_URI = `${window.location.origin}${window.location.pathname}`;
  const TOKEN_KEY = "music_player_spotify_token";
  const VERIFIER_KEY = "music_player_spotify_verifier";
  const STATE_KEY = "music_player_spotify_state";
  const QUERY_KEY = "music_player_spotify_pending_query";

  const localModeBtn = document.getElementById("local-mode-btn");
  const spotifyModeBtn = document.getElementById("spotify-mode-btn");
  const searchInput = document.getElementById("search");
  const searchArea = document.getElementById("spotify-search-area");
  const resultsEl = document.getElementById("spotify-results");
  const statusEl = document.getElementById("search-status");

  let mode = "local";
  let debounceTimer = null;

  function randomString(length = 64) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values, value => chars[value % chars.length]).join("");
  }

  async function sha256(value) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  }

  function base64UrlEncode(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  function readToken() {
    try {
      return JSON.parse(localStorage.getItem(TOKEN_KEY) || "null");
    } catch {
      return null;
    }
  }

  function saveToken(data) {
    const current = readToken();
    const token = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || current?.refresh_token || null,
      expires_at: Date.now() + (Number(data.expires_in || 3600) * 1000) - 60000
    };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    return token;
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  async function startLogin(pendingQuery = "") {
    if (!CLIENT_ID || CLIENT_ID === "SEU_CLIENT_ID_AQUI") {
      throw new Error("Adicione seu Client ID no spotify.js.");
    }

    const verifier = randomString(64);
    const challenge = base64UrlEncode(await sha256(verifier));
    const state = randomString(24);

    localStorage.setItem(VERIFIER_KEY, verifier);
    localStorage.setItem(STATE_KEY, state);
    if (pendingQuery) localStorage.setItem(QUERY_KEY, pendingQuery);

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.search = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      code_challenge_method: "S256",
      code_challenge: challenge,
      state
    }).toString();

    window.location.assign(authUrl.toString());
  }

  async function exchangeCode(code) {
    const verifier = localStorage.getItem(VERIFIER_KEY);
    if (!verifier) throw new Error("Sessão de login expirada. Conecte ao Spotify novamente.");

    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    const data = await response.json();
    if (!response.ok || !data.access_token) {
      throw new Error(data.error_description || "Não foi possível conectar ao Spotify.");
    }

    localStorage.removeItem(VERIFIER_KEY);
    localStorage.removeItem(STATE_KEY);
    return saveToken(data);
  }

  async function refreshToken(refreshToken) {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    const data = await response.json();
    if (!response.ok || !data.access_token) {
      clearToken();
      return null;
    }
    return saveToken(data);
  }

  async function getAccessToken() {
    let token = readToken();
    if (token?.access_token && Date.now() < token.expires_at) return token.access_token;

    if (token?.refresh_token) {
      token = await refreshToken(token.refresh_token);
      if (token?.access_token) return token.access_token;
    }

    return null;
  }

  function setMode(nextMode) {
    mode = nextMode;
    const spotify = mode === "spotify";

    localModeBtn.classList.toggle("active", !spotify);
    spotifyModeBtn.classList.toggle("active", spotify);
    localModeBtn.setAttribute("aria-pressed", String(!spotify));
    spotifyModeBtn.setAttribute("aria-pressed", String(spotify));
    searchArea.hidden = !spotify;
    searchInput.placeholder = spotify ? "Buscar música, artista ou álbum no Spotify" : "Buscar na sua biblioteca";
    statusEl.textContent = spotify ? "Spotify" : "";

    if (!spotify) {
      resultsEl.innerHTML = "";
      // Dispara o filtro local novamente para restaurar a playlist.
      searchInput.dispatchEvent(new Event("input"));
    } else {
      renderSpotifyIntro();
      if (searchInput.value.trim()) queueSpotifySearch();
    }
  }

  function renderSpotifyIntro() {
    const token = readToken();
    if (token?.access_token) {
      resultsEl.innerHTML = '<div class="sp-message">Digite acima para buscar no Spotify.</div>';
      return;
    }

    resultsEl.innerHTML = `
      <div class="sp-connect-card">
        <div>
          <strong>Spotify</strong>
          <span>Conecte sua conta para pesquisar faixas.</span>
        </div>
        <button type="button" class="sp-connect-btn" id="spotify-connect-btn">Conectar</button>
      </div>`;

    document.getElementById("spotify-connect-btn")?.addEventListener("click", () => {
      startLogin(searchInput.value.trim()).catch(showError);
    });
  }

  function escapeHtml(value = "") {
    return value.replace(/[&<>'"]/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[char]);
  }

  function showError(error) {
    console.error("Spotify:", error);
    resultsEl.innerHTML = `<div class="sp-message sp-error">${escapeHtml(error.message || "Erro ao acessar o Spotify.")}</div>`;
  }

  async function searchSpotify(query) {
    let token = await getAccessToken();
    if (!token) {
      localStorage.setItem(QUERY_KEY, query);
      renderSpotifyIntro();
      return;
    }

    resultsEl.innerHTML = '<div class="sp-message"><span class="sp-loader"></span> Buscando no Spotify…</div>';

    let response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8&market=BR`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 401) {
      clearToken();
      token = await getAccessToken();
      if (!token) {
        renderSpotifyIntro();
        return;
      }
      response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8&market=BR`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || "A busca do Spotify falhou.");
    renderResults(data.tracks?.items || []);
  }

  function renderResults(tracks) {
    if (!tracks.length) {
      resultsEl.innerHTML = '<div class="sp-message">Nenhum resultado encontrado.</div>';
      return;
    }

    resultsEl.innerHTML = tracks.map((track, index) => {
      const artists = track.artists?.map(artist => artist.name).join(", ") || "Artista desconhecido";
      const art = track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || "";
      const year = track.album?.release_date?.slice(0, 4) || "";
      const preview = Boolean(track.preview_url);

      return `
        <article class="sp-track" data-index="${index}">
          <img class="sp-art" src="${escapeHtml(art)}" alt="Capa de ${escapeHtml(track.album?.name || track.name)}">
          <div class="sp-info">
            <strong class="sp-name">${escapeHtml(track.name)}</strong>
            <span class="sp-artist">${escapeHtml(artists)}</span>
            <span class="sp-album">${escapeHtml(track.album?.name || "")}${year ? ` · ${year}` : ""}</span>
          </div>
          <button type="button" class="sp-play-btn" ${preview ? "" : "disabled"}>
            ${preview ? "▶ Prévia" : "Sem prévia"}
          </button>
        </article>`;
    }).join("");

    resultsEl.querySelectorAll(".sp-track").forEach((element, index) => {
      const button = element.querySelector(".sp-play-btn");
      if (tracks[index].preview_url) button.addEventListener("click", () => playPreview(tracks[index]));
    });
  }

  function playPreview(track) {
    const audio = document.getElementById("audio");
    const display = document.getElementById("display");
    const cover = document.querySelector("#cover > img:first-child");
    const bg = document.getElementById("bg-img");
    const cd = document.getElementById("cd-hover");
    const art = track.album?.images?.[0]?.url || "";
    const artists = track.artists?.map(artist => artist.name).join(", ") || "Spotify";

    window.spotifyPreviewActive = true;
    audio.src = track.preview_url;
    display.textContent = `${artists} — ${track.name}`;

    document.querySelectorAll(".track.active").forEach(el => el.classList.remove("active"));

    cover.style.opacity = "0";
    bg.style.opacity = "0";
    setTimeout(() => {
      if (art) {
        cover.src = art;
        bg.src = art;
        cd.src = art;
      }
      cover.style.opacity = "1";
      bg.style.opacity = "1";
    }, 250);

    audio.play().catch(() => {});
    searchArea.hidden = true;
  }

  function queueSpotifySearch() {
    if (mode !== "spotify") return;
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();

    if (!query) {
      renderSpotifyIntro();
      return;
    }

    debounceTimer = setTimeout(() => searchSpotify(query).catch(showError), 450);
  }

  async function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const returnedState = params.get("state");
    const error = params.get("error");

    if (error) {
      history.replaceState({}, document.title, REDIRECT_URI);
      setMode("spotify");
      showError(new Error("A conexão com o Spotify foi cancelada."));
      return;
    }

    if (!code) return;

    const expectedState = localStorage.getItem(STATE_KEY);
    if (!expectedState || returnedState !== expectedState) {
      history.replaceState({}, document.title, REDIRECT_URI);
      setMode("spotify");
      showError(new Error("Não foi possível validar o retorno do Spotify."));
      return;
    }

    try {
      await exchangeCode(code);
      history.replaceState({}, document.title, REDIRECT_URI);
      setMode("spotify");
      const pending = localStorage.getItem(QUERY_KEY) || "";
      localStorage.removeItem(QUERY_KEY);
      if (pending) {
        searchInput.value = pending;
        await searchSpotify(pending);
      } else {
        renderSpotifyIntro();
      }
    } catch (error) {
      history.replaceState({}, document.title, REDIRECT_URI);
      setMode("spotify");
      showError(error);
    }
  }

  localModeBtn.addEventListener("click", () => setMode("local"));
  spotifyModeBtn.addEventListener("click", () => setMode("spotify"));
  searchInput.addEventListener("input", queueSpotifySearch);

  handleCallback();
})();
