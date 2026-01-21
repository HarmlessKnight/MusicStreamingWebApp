'use client';

import { useMemo, useState, useCallback } from 'react';
import RandomGradientBackground, { generateRandomColors } from '@/components/Gradients/RandomGradient';
import styles from './styles.module.css';
import MiniPlayer from '@/components/musicplayers/miniplayer/miniplayer';
import { getTracksByGenre } from '@/lib/jamendo';
import { redirect } from 'next/navigation';

type Song = {
  title: string;
  artist: string;
  url: string;
  cover: string;
};

export default function Streaming() {
  const Colors = useMemo(() => generateRandomColors(5), []);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSourceName, setCurrentSourceName] = useState("Tracks");

  const handleGenreClick = async (genre: string) => {
  try {
    const songs = await getTracksByGenre(genre.toUpperCase(), 15);
    setQueue(songs);
    setCurrentIndex(0);
    setCurrentSourceName(genre);
  } catch (error) {
    console.error("Failed to fetch songs for genre:", genre, error);
  }
};


  return (
    <div className={styles.container}>
      <RandomGradientBackground colors={Colors} />

      <div className={styles.top}>
       <button onClick = { () => redirect('/pick')}>Return</button>
      </div>

      <div className={styles['genres-title']}>GENRES</div>

      <div className={styles.leftside}>
        <div className={styles['genres-container']}>
          <div className={styles.genres}>
            {[
              'POP', 'ROCK', 'ELECTRONIC', 'HIP HOP', 'JAZZ', 'INDIE',
              'CLASSICAL', 'CHILLOUT', 'AMBIENT', 'FOLK', 'METAL', 'LATIN',
              'RNB', 'REGGAE', 'PUNK', 'COUNTRY', 'HOUSE', 'BLUES'
            ].map((genre) => (
              <div
                key={genre}
                className={styles.genrebutton}
                onClick={() => handleGenreClick(genre)}
              >
                {genre}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.middle}>
        Top Hits / Recommended / Trending
      </div>

      <div className={styles.bottom}>
       <MiniPlayer 
        playlist={queue}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        currentSourceName={currentSourceName}
        setCurrentSourceName={setCurrentSourceName}
        />

      </div>

      <div className={styles.rightside}>
        no clue what to put here lol
      </div>
    </div>
  );
}
