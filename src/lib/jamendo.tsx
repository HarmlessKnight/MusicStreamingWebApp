const JAMENDO_CLIENT_ID = "d26b98ea";
const BASE_URL = "https://api.jamendo.com/v3.0";

export type JamendoTrack = {
  id: string;
  name: string;
  artist_name: string;
  audio: string;
  album_image: string;
  duration: number;
};

export type JamendoAlbum = {
  id: string;
  name: string;
  artist_name: string;
  image: string;
  releasedate: string;
};

export type JamendoPlaylist = {
  id: number;
  name: string;
  creationdate: string;
  user_id: string;
  user_name: string;
  zip: string;
  shorturl: string;
  shareurl: string;
};

export type JamendoPlaylistTrack = JamendoTrack;

export type JamendoArtist = {
  id: string;
  name: string;
  image: string;
  popularity: number;
};

export type JamendoRadio = {
  id: string;
  name: string;
  description: string;
  stream: string;
};


type Song = {
  title: string;
  artist: string;
  url: string;
  cover: string;
};

export const mapToSong = (track: JamendoTrack): Song => ({
  title: track.name,
  artist: track.artist_name,
  url: track.audio,
  cover: track.album_image,
});


// ------------------ HELPERS ------------------
function buildUrl(endpoint: string, params: Record<string, string | number | boolean> = {}) {
  const query = new URLSearchParams({
    client_id: JAMENDO_CLIENT_ID,
    format: "json",
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  });
  return `${BASE_URL}/${endpoint}?${query.toString()}`;
}

async function fetchFromJamendo<T>(endpoint: string, params: Record<string, any> = {}): Promise<T[]> {
  const url = buildUrl(endpoint, params);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jamendo API error: ${res.status}`);
  const data = await res.json();
  return data.results as T[];
}

// ------------------ TRACKS ------------------
export async function getTracks(
  limit = 10,
  offset = 0
): Promise<JamendoTrack[]> {
  const data = await fetchFromJamendo<JamendoTrack>("tracks/", {
    limit,
    offset,
    tags: "pop",                   // genre filter
    type: "single albumtrack",     // include singles and album tracks
    featured: 1,                   // only editor-selected tracks
    groupby: "artist_id",          // one track per artist
    boost: "popularity_total",     // influence by popularity
  });

  console.log("getPopChartTracks returned:", data);
  return data;
}




export async function getTrackById(id: number): Promise<JamendoTrack[]> {
  const data = await fetchFromJamendo<JamendoTrack>("tracks/", { id });
  console.log("getTrackById returned:", data);
  return data;
}

// ------------------ ALBUMS ------------------
export async function getAlbums(limit = 10, offset = 0, order = "popularity_total_desc"): Promise<JamendoAlbum[]> {
  const data = await fetchFromJamendo<JamendoAlbum>("albums/", { limit, offset, order });
  console.log("getAlbums returned:", data);
  return data;
}

export async function getAlbumById(id: number): Promise<JamendoAlbum[]> {
  const data = await fetchFromJamendo<JamendoAlbum>("albums/", { id });
  console.log("getAlbumById returned:", data);
  return data;
}

// ------------------ PLAYLISTS ------------------
export async function getPlaylists(limit = 1, offset = 0, order = "creationdate_asc"): Promise<JamendoPlaylist[]> {
  const data = await fetchFromJamendo<JamendoPlaylist>("playlists/", { limit, offset, order });
  console.log("getPlaylists returned:", data);
  return data;
}

export async function getPlayablePlaylists(limit = 1): Promise<JamendoPlaylist[]> {
  const playlists = await getPlaylists(limit);

  const playablePlaylists: JamendoPlaylist[] = [];

  for (const playlist of playlists) {
    try {
      const tracks = await getPlaylistTracks(playlist.id, 1);
      const hasPlayableTrack = tracks.some(track => track.audio && track.audio.trim() !== '');
      if (hasPlayableTrack) {
        playablePlaylists.push(playlist);
      }
    } catch (err) {
      console.error("Error fetching tracks for playlist", playlist.id, err);
    }
  }

  console.log("Playable playlists:", playablePlaylists);
  return playablePlaylists;
}

export async function getPlaylistById(id: number): Promise<JamendoPlaylist[]> {
  const data = await fetchFromJamendo<JamendoPlaylist>("playlists/", { id });
  console.log("getPlaylistById returned:", data);
  return data;
}

export async function searchPlaylistsByName(name: string, limit = 10): Promise<JamendoPlaylist[]> {
  const data = await fetchFromJamendo<JamendoPlaylist>("playlists/", { namesearch: name, limit });
  console.log("searchPlaylistsByName returned:", data);
  return data;
}

export async function getPlaylistNameById(playlistId: number): Promise<string | null> {
  try {
    const playlists = await fetchFromJamendo<JamendoPlaylist>("playlists/", { id: playlistId });
    console.log("getPlaylistNameById returned:", playlists);
    if (playlists.length > 0) {
      return playlists[0].name;
    }
    return null;
  } catch (error) {
    console.error("Error fetching playlist name:", error);
    return null;
  }
}

// ------------------ PLAYLIST TRACKS ------------------
export async function getPlaylistTracks(playlistId: number, limit = 50): Promise<JamendoPlaylistTrack[]> {
  const data = await fetchFromJamendo<JamendoPlaylistTrack>("playlists/tracks/", { id: playlistId, limit });
  console.log("getPlaylistTracks returned:", data);
  return data;
}

// ------------------ ARTISTS ------------------
export async function getArtists(limit = 10, offset = 0, order = "popularity_total_desc"): Promise<JamendoArtist[]> {
  const data = await fetchFromJamendo<JamendoArtist>("artists/", { limit, offset, order });
  console.log("getArtists returned:", data);
  return data;
}

export async function getArtistById(id: number): Promise<JamendoArtist[]> {
  const data = await fetchFromJamendo<JamendoArtist>("artists/", { id });
  console.log("getArtistById returned:", data);
  return data;
}

// ------------------ RADIOS ------------------
export async function getRadios(limit = 10): Promise<JamendoRadio[]> {
  const data = await fetchFromJamendo<JamendoRadio>("radios/", { limit });
  console.log("getRadios returned:", data);
  return data;
}
