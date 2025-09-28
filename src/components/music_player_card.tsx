'use client';
import React, { useRef, useState, useEffect } from "react";
import styles from "./MusicPlayer.module.css";
import '@fortawesome/fontawesome-free/css/all.css';

type Song = {
  title: string;
  artist: string;
  url: string;
  cover: string;
};

const MusicPlayer: React.FC<{
  playlist: Song[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  currentSourceName: string;
  setCurrentSourceName: React.Dispatch<React.SetStateAction<string>>;
}> = ({ playlist, currentIndex, setCurrentIndex, currentSourceName }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState<number>(50);
 
  const [timeData, setTimeData] = useState({
    currentTime: 0,
    duration: 0,
    remainingTime: 0
  });

  
  const { currentTime, duration, remainingTime } = timeData;

  const togglePlay = async () => {
    if (!audioRef.current || playlist.length === 0 || !current?.url || current.url.trim() === '') return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (volumeRef.current) {
      const percentage = volume;
      volumeRef.current.style.background = `linear-gradient(to right, whitesmoke ${percentage}%, #b9b9b983 ${percentage}%)`;
    }
  }, [volume]);

  //autoplay
  useEffect(() => {
    if (!audioRef.current || playlist.length === 0 || !playlist[currentIndex]) return;
    
    const currentTrack = playlist[currentIndex];
    if (!currentTrack.url || currentTrack.url.trim() === '') return;
    
    // Reset time data when changing tracks
    setTimeData({
      currentTime: 0,
      duration: 0,
      remainingTime: 0
    });
    setIsLoading(true);
    
    // Load the new audio source
    audioRef.current.load();
    
    // Auto-play any track that loads (not just the first one)
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.error('Auto-play failed:', error);
            setIsPlaying(false);
          })
          .finally(() => setIsLoading(false));
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [playlist, currentIndex]); 

  // Handle play state changes
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handleLoadStart = () => setIsLoading(true);
    
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  const playNext = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((i) => (i + 1) % playlist.length);
  };

  const playPrev = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((i) => (i - 1 + playlist.length) % playlist.length);
  };

  // Updated handleTimeUpdate to use timeData
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const current = audio.currentTime;
      const total = audio.duration || 0;
      const remaining = total - current;

      // Single atomic state update
      setTimeData({
        currentTime: current,
        duration: total,
        remainingTime: remaining
      });
    }
  };

  const updateVolumeSliderBackground = (value: number) => {
    if (volumeRef.current) {
      volumeRef.current.style.background = `linear-gradient(to right, whitesmoke 0%, whitesmoke ${value}%, #b9b9b983 ${value}%, #b9b9b983 100%)`;
    }
  };

  useEffect(() => {
    updateVolumeSliderBackground(volume);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }

    updateVolumeSliderBackground(newVolume);
  };

  // Updated handleLoadedMetadata to use timeData
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const total = audioRef.current.duration;
      setTimeData(prev => ({
        ...prev,
        duration: total,
        remainingTime: total - prev.currentTime
      }));
      setIsLoading(false);
    }
  };

  const handleCanPlayThrough = () => {
    setIsLoading(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    playNext();
  };

  // Updated handleSeek to use timeData
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audioRef.current.currentTime = newTime;
    
    // Update timeData with new current time
    setTimeData(prev => ({
      ...prev,
      currentTime: newTime,
      remainingTime: prev.duration - newTime
    }));
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (!playlist.length) {
    return (
      <div className={styles.container}>
        <div className={styles.musicCard}>
          <div className={styles.loadingState}>
            <h2>Loading tracks...</h2>
          </div>
        </div>
      </div>
    );
  }

  const current = playlist[currentIndex];
  if (!current) {
    return (
      <div className={styles.container}>
        <div className={styles.musicCard}>
          <div className={styles.loadingState}>
            <h2>Loading track...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Check if current track has a valid URL
  const hasValidUrl = current.url && current.url.trim() !== '' && current.url !== 'null' && current.url !== 'undefined';
  
  if (!hasValidUrl) {
    return (
      <div className={styles.container}>
        <div className={styles.musicCard}>
          <div className={styles.loadingState}>
            <h2>No playable track available</h2>
            <p>This track doesn't have a valid audio URL</p>
            <p>Track: {current.title || 'Unknown'}</p>
            <p>URL: {current.url || 'No URL'}</p>
            <button onClick={() => {
              console.log('Full current track object:', current);
            }}>
              Log track details to console
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.musicCard}>
      <p className={styles.playlistName}>{currentSourceName}</p>

      <div className={styles.albumCoverContainer}>
        <img 
          src={current.cover || '/default-cover.png'} 
          alt={`${current.title} - ${current.artist}`} 
          className={styles.albumCover}
          onError={(e) => {
            e.currentTarget.src = '/default-cover.png';
          }}
        />
      </div>

      <h2 className={styles.songTitle}>{current.title}</h2>
      <p className={styles.artistName}>{current.artist}</p>

      <div className={styles.progressContainer} onClick={handleSeek}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} 
        />
      </div>
       
      <div className={styles.timeInfo}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(remainingTime)}</span>
      </div>

      <div className={styles.controls}>
        <button 
          className={`${styles.controlButton} ${styles.prevButton}`} 
          onClick={playPrev}
          disabled={playlist.length <= 1}
          style={{ color: 'white' }}
        >
          <i className="fa-solid fa-backward"></i>
        </button>

        <button 
          className={`${styles.controlButton} ${styles.playButton}`} 
          onClick={togglePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <i className="fa-solid fa-spinner fa-spin"></i>
          ) : isPlaying ? (
            <i className="fa-solid fa-pause"></i>
          ) : (
            <i className="fa-solid fa-play"></i>
          )}
        </button>

        <button 
          className={`${styles.controlButton} ${styles.nextButton}`} 
          onClick={playNext}
          disabled={playlist.length <= 1}
        >
          <i className="fa-solid fa-forward"></i>
        </button>
      </div>

      <div className={styles.volumeContainer}>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={handleVolumeChange}
          className={styles.volumeSlider}
          ref={volumeRef}
        />
        <i className="fa-solid fa-volume-high"></i>
      </div>

      <audio
        ref={audioRef}
        src={current.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlayThrough={handleCanPlayThrough}
        onEnded={handleEnded}
        preload="metadata"
      />
    </div>
  );
};

export default MusicPlayer;