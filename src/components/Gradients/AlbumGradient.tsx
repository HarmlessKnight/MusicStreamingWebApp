'use client';

import React, { useEffect, useState } from "react";



type AlbumGradientProps = {
  coverUrl: string; // album cover URL
};


// Alternative color extraction function using canvas
const extractColorsFromImage = (imageUrl: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Scale down for performance
        const scale = 0.1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Sample colors from different regions
        const colors: string[] = [];
        const samples = [
          { x: 0.2, y: 0.2 }, // top-left
          { x: 0.8, y: 0.2 }, // top-right
          { x: 0.5, y: 0.5 }, // center
          { x: 0.2, y: 0.8 }, // bottom-left
          { x: 0.8, y: 0.8 }, // bottom-right
        ];
        
        samples.forEach(({ x, y }) => {
          const pixelX = Math.floor(x * canvas.width);
          const pixelY = Math.floor(y * canvas.height);
          const index = (pixelY * canvas.width + pixelX) * 4;
          
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          colors.push(hex);
        });
        
        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

// Custom animated mesh gradient component
const CustomMeshGradient: React.FC<{ colors: string[] }> = ({ colors }) => {
  const [animationStep, setAnimationStep] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 360);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  const gradientStyle = {
    background: `
      radial-gradient(circle at ${20 + Math.sin(animationStep * 0.01) * 10}% ${30 + Math.cos(animationStep * 0.015) * 15}%, ${colors[0] || '#000000'} 0%, transparent 40%),
      radial-gradient(circle at ${80 + Math.sin(animationStep * 0.012) * 8}% ${20 + Math.cos(animationStep * 0.018) * 12}%, ${colors[1] || '#333333'} 0%, transparent 45%),
      radial-gradient(circle at ${60 + Math.sin(animationStep * 0.008) * 15}% ${70 + Math.cos(animationStep * 0.011) * 10}%, ${colors[2] || colors[0] || '#000000'} 0%, transparent 35%),
      radial-gradient(circle at ${25 + Math.sin(animationStep * 0.014) * 12}% ${80 + Math.cos(animationStep * 0.009) * 8}%, ${colors[3] || colors[1] || '#333333'} 0%, transparent 50%),
      radial-gradient(circle at ${75 + Math.sin(animationStep * 0.016) * 6}% ${60 + Math.cos(animationStep * 0.013) * 14}%, ${colors[4] || colors[0] || '#000000'} 0%, transparent 40%)
    `,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.8,
    transition: 'opacity 0.5s ease-in-out',
    filter: 'blur(20px)',
  };
  
  return <div style={gradientStyle} />;
};

const AlbumGradient: React.FC<AlbumGradientProps> = ({ coverUrl }) => {
  const [colors, setColors] = useState<string[]>(["#000000", "#333333"]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!coverUrl) {
      setColors(["#000000", "#333333"]);
      return;
    }

    setIsLoading(true);

    // Try using node-vibrant first, fall back to canvas method
    const tryVibrant = async () => {
      try {
        // Try to dynamically import node-vibrant
        const Vibrant = await import('node-vibrant');

        const palette = await (Vibrant as any).from(coverUrl).getPalette();
        
        const extractedColors: string[] = [];
        const colorOrder = ['Vibrant', 'DarkVibrant', 'LightVibrant', 'Muted', 'DarkMuted', 'LightMuted'];
        
        colorOrder.forEach(key => {
          const swatch = palette[key as keyof typeof palette];
          if (swatch && swatch.hex) {
            extractedColors.push(swatch.hex);
          }
        });

        if (extractedColors.length >= 2) {
          return extractedColors.slice(0, 5);
        }
        throw new Error('Not enough colors extracted');
      } catch (error) {
        // Fall back to canvas method
        return await extractColorsFromImage(coverUrl);
      }
    };

    tryVibrant()
      .then((extractedColors) => {
        setColors(extractedColors.length >= 2 ? extractedColors : ["#000000", "#333333"]);
      })
      .catch((err) => {
        console.error("Color extraction error:", err);
        setColors(["#000000", "#333333"]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [coverUrl]);

  return (
    <div 
      style={{ 
        position: "absolute", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "100%", 
        zIndex: 0,
        overflow: "hidden"
      }}
    >
      {/* Custom Animated Mesh Gradient */}
      {!isLoading && <CustomMeshGradient colors={colors} />}

      {/* Loading state */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(45deg, #000000, #333333)",
            zIndex: 0,
          }}
        />
      )}

      {/* Optional frosted blur overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default AlbumGradient;