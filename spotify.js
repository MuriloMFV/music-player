// Spotify Web API + Web Playback SDK, usando Authorization Code com PKCE.
// O Client ID pode ficar no navegador; nunca adicione um Client Secret aqui.
(() => {
  "use strict";

  const CLIENT_ID = "378c79139eea40a8b583fffc7ae1dec1";
  const REDIRECT_URI = `${window.location.origin}${window.location.pathname}`;
  const SCOPES = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-read-playback-state",
    "user-modify-playback-state"
  ].join(" ");
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
  const localPlaylist = document.getElementById("playlist");
  const accountEl = document.getElementById("spotify-account");
  const MODE_KEY = "music_player_search_mode";

  let mode = "local";
  let debounceTimer = null;
  let searchController = null;
  let spotifyPlayer = null;
  let deviceId = null;
  let sdkPromise = null;
  let readyPromise = null;
  let currentSpotifyDuration = 0;
  let spotifyProfile = null;
  let spotifyVolume = 0.8;

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
      scope: data.scope || current?.scope || "",
      expires_at: Date.now() + (Number(data.expires_in || 3600) * 1000) - 60000
    };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    return token;
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    if (spotifyPlayer) spotifyPlayer.disconnect();
    spotifyPlayer = null;
    deviceId = null;
    sdkPromise = null;
    readyPromise = null;
    spotifyProfile = null;
    accountEl.hidden = true;
    accountEl.replaceChildren();
  }

  function hasPlaybackScopes(token) {
    const granted = new Set((token?.scope || "").split(" "));
    return ["streaming", "user-read-email", "user-read-private", "user-modify-playback-state"]
      .every(scope => granted.has(scope));
  }

  async function startLogin(pendingQuery = "") {
    if (!CLIENT_ID || CLIENT_ID === "SEU_CLIENT_ID_AQUI") {
      throw new Error("Adicione o Client ID do seu app Spotify em spotify.js.");
    }
    if (!window.isSecureContext) {
      throw new Error("Abra o projeto em localhost ou HTTPS para conectar ao Spotify.");
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
      scope: SCOPES,
      code_challenge_method: "S256",
      code_challenge: challenge,
      state
    }).toString();
    window.location.assign(authUrl.toString());
  }

  async function exchangeCode(code) {
    const verifier = localStorage.getItem(VERIFIER_KEY);
    if (!verifier) throw new Error("Sessão de login expirada. Conecte ao Spotify novamente.");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier
      })
    });
    const data = await response.json();
    if (!response.ok || !data.access_token) {
      throw new Error(data.error_description || "Não foi possível conectar ao Spotify.");
    }
    localStorage.removeItem(VERIFIER_KEY);
    localStorage.removeItem(STATE_KEY);
    return saveToken(data);
  }

  async function refreshToken(refreshTokenValue) {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: refreshTokenValue
      })
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
    if (token?.refresh_token) token = await refreshToken(token.refresh_token);
    return token?.access_token || null;
  }

  async function spotifyFetch(path, options = {}) {
    let token = await getAccessToken();
    if (!token) throw new Error("Conecte sua conta ao Spotify.");

    const request = () => fetch(`https://api.spotify.com/v1${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });

    let response = await request();
    if (response.status === 401) {
      const saved = readToken();
      token = saved?.refresh_token ? (await refreshToken(saved.refresh_token))?.access_token : null;
      if (!token) throw new Error("Sua sessão do Spotify expirou. Conecte novamente.");
      response = await request();
    }
    return response;
  }

  function setMode(nextMode) {
    mode = nextMode;
    const spotify = mode === "spotify";
    localStorage.setItem(MODE_KEY, mode);
    localModeBtn.classList.toggle("active", !spotify);
    spotifyModeBtn.classList.toggle("active", spotify);
    localModeBtn.setAttribute("aria-pressed", String(!spotify));
    spotifyModeBtn.setAttribute("aria-pressed", String(spotify));
    searchArea.hidden = !spotify;
    localPlaylist.hidden = spotify;
    searchInput.placeholder = spotify ? "Buscar música, artista ou álbum no Spotify" : "Buscar na sua biblioteca";
    statusEl.textContent = spotify ? "Spotify" : "";

    if (spotify) {
      renderSpotifyIntro();
      if (searchInput.value.trim()) queueSpotifySearch();
    } else {
      resultsEl.replaceChildren();
      searchInput.dispatchEvent(new Event("input"));
    }
  }

  function renderSpotifyIntro() {
    const token = readToken();
    if (token?.access_token && hasPlaybackScopes(token)) {
      resultsEl.innerHTML = '<div class="sp-message">Digite acima para buscar. As faixas tocarão neste player.</div>';
      loadProfile().then(renderAccount).catch(showError);
      return;
    }

    const reconnect = Boolean(token?.access_token);
    accountEl.hidden = true;
    resultsEl.innerHTML = `
      <div class="sp-connect-card">
        <div>
          <strong>${reconnect ? "Atualizar conexão" : "Conectar ao Spotify"}</strong>
          <span>Reprodução completa requer uma conta Spotify Premium.</span>
        </div>
        <button type="button" class="sp-connect-btn" id="spotify-connect-btn">${reconnect ? "Reconectar" : "Conectar"}</button>
      </div>`;
    document.getElementById("spotify-connect-btn")?.addEventListener("click", () => {
      startLogin(searchInput.value.trim()).catch(showError);
    });
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[char]);
  }

  function showError(error) {
    console.error("Spotify:", error);
    resultsEl.innerHTML = `<div class="sp-message sp-error">${escapeHtml(error.message || "Erro ao acessar o Spotify.")}</div>`;
  }

  async function loadProfile(force = false) {
    if (spotifyProfile && !force) return spotifyProfile;
    const response = await spotifyFetch("/me");
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || "Não foi possível carregar sua conta Spotify.");
    spotifyProfile = data;
    return spotifyProfile;
  }

  function renderAccount(profile) {
    const image = profile.images?.[0]?.url || "";
    const premium = profile.product === "premium";
    accountEl.hidden = false;
    accountEl.innerHTML = `
      <div class="sp-user">
        ${image ? `<img src="${escapeHtml(image)}" alt="">` : '<span class="sp-user-placeholder" aria-hidden="true">♫</span>'}
        <div>
          <strong>${escapeHtml(profile.display_name || "Conta Spotify")}</strong>
          <span class="sp-plan ${premium ? "premium" : "free"}">${premium ? "Premium · reprodução liberada" : "Free · reprodução externa"}</span>
        </div>
      </div>
      <button type="button" class="sp-disconnect-btn" id="spotify-disconnect-btn">Desconectar</button>`;
    document.getElementById("spotify-disconnect-btn")?.addEventListener("click", disconnectSpotify);
  }

  async function disconnectSpotify() {
    await adapter.pause().catch(() => {});
    clearToken();
    await window.musicPlayer.returnToLocal();
    renderSpotifyIntro();
  }

  async function searchSpotify(query) {
    if (!readToken()?.access_token) {
      localStorage.setItem(QUERY_KEY, query);
      renderSpotifyIntro();
      return;
    }
    const profile = await loadProfile();
    renderAccount(profile);
    searchController?.abort();
    searchController = new AbortController();
    resultsEl.innerHTML = '<div class="sp-message"><span class="sp-loader"></span> Buscando no Spotify…</div>';

    const response = await spotifyFetch(
      `/search?q=${encodeURIComponent(query)}&type=track&limit=8`,
      { signal: searchController.signal }
    );
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
      const spotifyUrl = track.external_urls?.spotify || "https://open.spotify.com";
      const canStream = spotifyProfile?.product === "premium";
      return `
        <article class="sp-track" data-index="${index}">
          <img class="sp-art" src="${escapeHtml(art)}" alt="Capa de ${escapeHtml(track.album?.name || track.name)}">
          <div class="sp-info">
            <strong class="sp-name">${escapeHtml(track.name)}</strong>
            <span class="sp-artist">${escapeHtml(artists)}</span>
            <span class="sp-album">${escapeHtml(track.album?.name || "")}${year ? ` · ${year}` : ""}</span>
          </div>
          <div class="sp-actions">
            <button type="button" class="sp-play-btn" ${canStream ? "" : "disabled"}>${canStream ? "▶ Tocar" : "Premium"}</button>
            <a class="sp-open-link" href="${escapeHtml(spotifyUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${escapeHtml(track.name)} no Spotify">Abrir</a>
          </div>
        </article>`;
    }).join("");

    resultsEl.querySelectorAll(".sp-track").forEach((element, index) => {
      const playButton = element.querySelector(".sp-play-btn");
      if (playButton.disabled) return;
      playButton.addEventListener("click", event => {
        playSpotifyTrack(tracks[index], event.currentTarget).catch(error => {
          event.currentTarget.disabled = false;
          if (error.name === "PlaybackCancelledError") {
            event.currentTarget.textContent = "▶ Tocar";
            return;
          }
          window.musicPlayer.reportPlaybackError(error.message);
          event.currentTarget.textContent = "Tentar novamente";
        });
      });
    });
  }

  function loadPlaybackSdk() {
    if (window.Spotify) return Promise.resolve();
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise((resolve, reject) => {
      const previousReady = window.onSpotifyWebPlaybackSDKReady;
      window.onSpotifyWebPlaybackSDKReady = () => {
        previousReady?.();
        resolve();
      };
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      script.onerror = () => reject(new Error("Não foi possível carregar o player do Spotify."));
      document.head.appendChild(script);
    });
    return sdkPromise;
  }

  async function ensureSpotifyPlayer() {
    if (deviceId && spotifyPlayer) return deviceId;
    const token = readToken();
    if (!token?.access_token || !hasPlaybackScopes(token)) {
      await startLogin(searchInput.value.trim());
      throw new Error("Conecte novamente para autorizar a reprodução.");
    }

    await loadPlaybackSdk();
    if (spotifyPlayer && readyPromise) return readyPromise;

    readyPromise = new Promise((resolve, reject) => {
      spotifyPlayer = new Spotify.Player({
        name: "Music Player — Web",
        volume: spotifyVolume,
        getOAuthToken: callback => getAccessToken().then(callback).catch(reject)
      });

      spotifyPlayer.addListener("ready", ({ device_id: id }) => {
        deviceId = id;
        resolve(id);
      });
      spotifyPlayer.addListener("not_ready", ({ device_id: id }) => {
        if (deviceId === id) deviceId = null;
        window.musicPlayer.reportPlaybackError("O player do Spotify ficou offline.");
      });
      spotifyPlayer.addListener("player_state_changed", state => {
        if (!state) return;
        currentSpotifyDuration = state.duration || 0;
        window.musicPlayer.updateSpotifyState(state);
      });
      spotifyPlayer.addListener("account_error", () => reject(new Error("A reprodução no navegador requer Spotify Premium.")));
      spotifyPlayer.addListener("authentication_error", () => {
        clearToken();
        window.musicPlayer.reportPlaybackError("A autenticação do Spotify expirou. Reconecte sua conta.");
        reject(new Error("A autenticação do Spotify expirou. Reconecte sua conta."));
      });
      spotifyPlayer.addListener("initialization_error", ({ message }) => reject(new Error(message)));
      spotifyPlayer.addListener("playback_error", ({ message }) => window.musicPlayer.reportPlaybackError(message));
      spotifyPlayer.connect().then(connected => {
        if (!connected) reject(new Error("Não foi possível iniciar o player do Spotify."));
      });
    });
    try {
      return await readyPromise;
    } catch (error) {
      spotifyPlayer?.disconnect();
      spotifyPlayer = null;
      deviceId = null;
      readyPromise = null;
      throw error;
    }
  }

  async function playSpotifyTrack(track, button) {
    resultsEl.querySelectorAll(".sp-play-btn:not(:disabled)").forEach(candidate => {
      candidate.textContent = "▶ Tocar";
      candidate.disabled = false;
    });
    button.disabled = true;
    button.textContent = "Conectando…";
    const playbackSession = await window.musicPlayer.activateSpotify(track);
    const id = await ensureSpotifyPlayer();
    await spotifyPlayer.activateElement();
    if (!window.musicPlayer.isCurrentSpotifySession(playbackSession)) {
      const error = new Error("Reprodução cancelada.");
      error.name = "PlaybackCancelledError";
      throw error;
    }
    const response = await spotifyFetch(`/me/player/play?device_id=${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ uris: [track.uri] })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (response.status === 403) throw new Error("A reprodução no navegador requer Spotify Premium.");
      throw new Error(data?.error?.message || "O Spotify não conseguiu iniciar esta faixa.");
    }
    if (!window.musicPlayer.isCurrentSpotifySession(playbackSession)) {
      if (!window.musicPlayer.isSpotifyActive()) await spotifyPlayer.pause().catch(() => {});
      return;
    }
    button.textContent = "Tocando";
  }

  const adapter = {
    async resume() {
      if (!spotifyPlayer) throw new Error("Selecione uma faixa do Spotify primeiro.");
      const state = await spotifyPlayer.getCurrentState();
      if (state?.paused) await spotifyPlayer.resume();
    },
    async pause() {
      if (!spotifyPlayer) return;
      const state = await spotifyPlayer.getCurrentState();
      if (state && !state.paused) await spotifyPlayer.pause();
    },
    async next() {
      if (!spotifyPlayer) throw new Error("Spotify ainda não está conectado.");
      await spotifyPlayer.nextTrack();
    },
    async previous() {
      if (!spotifyPlayer) throw new Error("Spotify ainda não está conectado.");
      await spotifyPlayer.previousTrack();
    },
    async seek(ratio) {
      if (!spotifyPlayer || !currentSpotifyDuration) return;
      await spotifyPlayer.seek(Math.round(currentSpotifyDuration * ratio));
    },
    async setVolume(value) {
      spotifyVolume = value;
      if (spotifyPlayer) await spotifyPlayer.setVolume(value);
    }
  };
  window.musicPlayer.setSpotifyAdapter(adapter);

  window.setInterval(async () => {
    if (!spotifyPlayer || !window.musicPlayer.isSpotifyActive()) return;
    const state = await spotifyPlayer.getCurrentState().catch(() => null);
    if (state) window.musicPlayer.updateSpotifyState(state);
  }, 1000);

  function queueSpotifySearch() {
    if (mode !== "spotify") return;
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();
    if (!query) {
      renderSpotifyIntro();
      return;
    }
    debounceTimer = setTimeout(() => {
      searchSpotify(query).catch(error => {
        if (error.name !== "AbortError") showError(error);
      });
    }, 400);
  }

  async function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const returnedState = params.get("state");
    const error = params.get("error");
    if (!code && !error) return false;

    history.replaceState({}, document.title, REDIRECT_URI);
    setMode("spotify");
    if (error) {
      showError(new Error("A conexão com o Spotify foi cancelada."));
      return true;
    }
    const expectedState = localStorage.getItem(STATE_KEY);
    if (!expectedState || returnedState !== expectedState) {
      showError(new Error("Não foi possível validar o retorno do Spotify."));
      return true;
    }

    try {
      await exchangeCode(code);
      renderAccount(await loadProfile(true));
      const pending = localStorage.getItem(QUERY_KEY) || "";
      localStorage.removeItem(QUERY_KEY);
      searchInput.value = pending;
      if (pending) await searchSpotify(pending);
      else renderSpotifyIntro();
    } catch (callbackError) {
      showError(callbackError);
    }
    return true;
  }

  localModeBtn.addEventListener("click", () => setMode("local"));
  spotifyModeBtn.addEventListener("click", () => setMode("spotify"));
  searchInput.addEventListener("input", queueSpotifySearch);
  handleCallback().then(handledCallback => {
    if (!handledCallback) setMode(localStorage.getItem(MODE_KEY) === "spotify" ? "spotify" : "local");
  });
})();
