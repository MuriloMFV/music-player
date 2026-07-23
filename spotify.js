// =============================================
// SPOTIFY FRONTEND ONLY (PKCE)
// =============================================

const SPOTIFY_CLIENT_ID = "378c79139eea40a8b583fffc7ae1dec1";
const REDIRECT_URI = window.location.origin + window.location.pathname;

let spotifyToken = null;

// ─── HELPERS PKCE ─────────────────────────────

function generateRandomString(length) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(x => possible[x % possible.length])
    .join("");
}

async function sha256(plain) {
  const data = new TextEncoder().encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

function base64encode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// ─── LOGIN ────────────────────────────────────

async function loginSpotify() {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  localStorage.setItem("code_verifier", codeVerifier);

  const url = new URL("https://accounts.spotify.com/authorize");
  url.search = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: codeChallenge
  });

  window.location.href = url.toString();
}

// ─── TROCA CODE POR TOKEN ─────────────────────

async function fetchAccessToken(code) {
  const codeVerifier = localStorage.getItem("code_verifier");

  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const data = await res.json();

  if (data.access_token) {
    spotifyToken = data.access_token;
    localStorage.setItem("spotify_token", spotifyToken);
  }
}

// ─── GERENCIA TOKEN ───────────────────────────

async function getSpotifyToken() {
  if (spotifyToken) return spotifyToken;

  const saved = localStorage.getItem("spotify_token");
  if (saved) {
    spotifyToken = saved;
    return spotifyToken;
  }

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (code) {
    await fetchAccessToken(code);

    // limpa URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return spotifyToken;
  }

  await loginSpotify();
}

// ─── BUSCA ────────────────────────────────────

async function searchSpotify(query) {
  const token = await getSpotifyToken();

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  return data.tracks.items;
}

// ─── UI ───────────────────────────────────────

function renderSpotifyResults(tracks) {
  const container = document.getElementById("spotify-results");
  container.innerHTML = "";

  tracks.forEach(track => {
    const hasPreview = !!track.preview_url;
    const artists = track.artists.map(a => a.name).join(", ");
    const albumArt = track.album.images[0]?.url;

    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${albumArt}" width="50">
      <div>${track.name} - ${artists}</div>
      <button ${!hasPreview ? "disabled" : ""}>
        ${hasPreview ? "▶" : "X"}
      </button>
    `;

    if (hasPreview) {
      div.querySelector("button").onclick = () => {
        const audio = document.getElementById("audio");
        audio.src = track.preview_url;
        audio.play();
      };
    }

    container.appendChild(div);
  });
}

// ─── INIT ─────────────────────────────────────

let debounce;

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("spotify-search-input");

  input.addEventListener("input", () => {
    clearTimeout(debounce);

    const q = input.value.trim();
    if (!q) return;

    debounce = setTimeout(async () => {
      const tracks = await searchSpotify(q);
      renderSpotifyResults(tracks);
    }, 500);
  });
});