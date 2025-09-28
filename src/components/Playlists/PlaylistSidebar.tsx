"use client";
import React from "react";
import { JamendoPlaylist } from "@/lib/jamendo";

type PlaylistSidebarProps = {
  playlists: JamendoPlaylist[];
  onSelect: (playlistId: number, playlistName: string) => void;
  currentSourceName: string;
  isLoading?: boolean;
};

const PlaylistSidebar: React.FC<PlaylistSidebarProps> = ({ 
  playlists, 
  onSelect, 
  currentSourceName, 
  isLoading = false 
}) => {
  const sidebarStyles = {
    container: {
      width: "250px",
      borderRight: "1px solid #e5e5e5",
      padding: "1rem",
      overflowY: "auto" as const,
      backgroundColor: "#f8f9fa",
      height: "100vh",
      boxShadow: "2px 0 4px rgba(0,0,0,0.1)",
    },
    header: {
      margin: "0 0 1rem 0",
      color: "#333",
      fontSize: "1.2rem",
      fontWeight: "600" as const,
    },
    list: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    listItem: {
      marginBottom: "0.5rem",
    },
    button: {
      width: "100%",
      textAlign: "left" as const,
      border: "none",
      padding: "0.75rem 1rem",
      cursor: "pointer",
      borderRadius: "8px",
      fontSize: "0.9rem",
      fontWeight: "500" as const,
      transition: "all 0.2s ease",
      backgroundColor: "transparent",
      color: "#555",
      display: "block",
      wordWrap: "break-word" as const,
    },
    activeButton: {
      backgroundColor: "#007bff",
      color: "white",
      boxShadow: "0 2px 4px rgba(0,123,255,0.3)",
    },
    hoverButton: {
      backgroundColor: "#e9ecef",
    },
    loadingContainer: {
      padding: "2rem 1rem",
      textAlign: "center" as const,
      color: "#666",
    },
    emptyContainer: {
      padding: "2rem 1rem",
      textAlign: "center" as const,
      color: "#999",
      fontStyle: "italic" as const,
    },
  };

  const handleButtonClick = (playlist: JamendoPlaylist) => {
    const playlistId = typeof playlist.id === 'string' ? parseInt(playlist.id, 10) : playlist.id;
    if (!isNaN(playlistId)) {
      onSelect(playlistId, playlist.name);
    }
  };

  if (isLoading) {
    return (
      <div style={sidebarStyles.container}>
        <h3 style={sidebarStyles.header}>Playlists</h3>
        <div style={sidebarStyles.loadingContainer}>
          <div>Loading playlists...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={sidebarStyles.container}>
      <h3 style={sidebarStyles.header}>Playlists</h3>
      
      {playlists.length === 0 ? (
        <div style={sidebarStyles.emptyContainer}>
          No playlists available
        </div>
      ) : (
        <ul style={sidebarStyles.list}>
          {playlists.map((playlist) => {
            const isActive = playlist.name === currentSourceName;
            
            return (
              <li key={playlist.id} style={sidebarStyles.listItem}>
                <button
                  style={{
                    ...sidebarStyles.button,
                    ...(isActive ? sidebarStyles.activeButton : {}),
                  }}
                  onClick={() => handleButtonClick(playlist)}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      Object.assign(e.currentTarget.style, sidebarStyles.hoverButton);
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                  title={playlist.name} 
                >
                  {playlist.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PlaylistSidebar;