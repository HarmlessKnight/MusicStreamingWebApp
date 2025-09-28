'use client';
import React, { useState, useEffect } from "react";
import MusicPlayer from "@/components/music_player_card";
import { JamendoPlaylist, getTracks, getPlayablePlaylists } from "@/lib/jamendo";
import styles from "./styles.module.css";
import AlbumGradient from "@/components/Gradients/AlbumGradient";

type Song = {
  title: string;
  artist: string;
  url: string;
  cover: string;
};

export default function Home() {
  const [playlists, setPlaylists] = useState<JamendoPlaylist[]>([]);
  const [currentSourceName, setCurrentSourceName] = useState("Tracks");
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const currentCover = currentPlaylist[currentIndex]?.cover || "/default-cover.png";

  useEffect(() => {
    const loadInitialTracks = async () => {
      setIsLoadingTracks(true);
      try {
        const tracks = await getTracks(20);
        const songs = tracks
          .map(t => ({
            title: t.name || "Unknown Title",
            artist: t.artist_name || "Unknown Artist",
            url: t.audio || "",
            cover: t.album_image || "/default-cover.png",
          }))
          .filter(song => song.url.trim() !== "");
        setCurrentPlaylist(songs);
        setCurrentIndex(0);
        setCurrentSourceName(songs.length > 0 ? "Sit back and enjoy" : "No tracks");
      } finally {
        setIsLoadingTracks(false);
      }
    };
    loadInitialTracks();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <AlbumGradient coverUrl={currentCover} />
      <div className={styles.blurOverlay} />
      {isLoadingTracks ? (
        <div className={styles.loadingContainer}>
          <h2 className={styles.heading}>Loading tracks…</h2>
        </div>
      ) : (
        <div className={styles.playerWrapper}>
          <MusicPlayer
            playlist={currentPlaylist}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            currentSourceName={currentSourceName}
            setCurrentSourceName={setCurrentSourceName}
          />
        </div>
      )}
    </div>
  );
}
