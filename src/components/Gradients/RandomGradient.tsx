'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';

export const generateRandomColors = (count: number): string[] =>
  Array.from({ length: count }, () =>
    `hsl(${Math.floor(Math.random() * 360)}, ${60 + Math.random() * 40}%, ${50 + Math.random() * 20}%)`
  );


const CustomMeshGradient: React.FC<{ colors: string[] }> = ({ colors }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      setStep(prev => (prev + 1) % 360);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const gradientStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    filter: 'blur(20px)',
    opacity: 0.8,
    background: `
      radial-gradient(circle at ${20 + Math.sin(step * 0.01) * 10}% ${30 + Math.cos(step * 0.015) * 15}%, ${colors[0]} 0%, transparent 40%),
      radial-gradient(circle at ${80 + Math.sin(step * 0.012) * 8}% ${20 + Math.cos(step * 0.018) * 12}%, ${colors[1]} 0%, transparent 45%),
      radial-gradient(circle at ${60 + Math.sin(step * 0.008) * 15}% ${70 + Math.cos(step * 0.011) * 10}%, ${colors[2]} 0%, transparent 35%),
      radial-gradient(circle at ${25 + Math.sin(step * 0.014) * 12}% ${80 + Math.cos(step * 0.009) * 8}%, ${colors[3]} 0%, transparent 50%),
      radial-gradient(circle at ${75 + Math.sin(step * 0.016) * 6}% ${60 + Math.cos(step * 0.013) * 14}%, ${colors[4]} 0%, transparent 40%)
    `,
  };

  return <div style={gradientStyle} />;
};



const RandomGradientBackground: React.FC<{ colors?: string[] }> = ({ colors }) => {
  
  const internalColors = useMemo(() => colors ?? generateRandomColors(5), []);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CustomMeshGradient colors={internalColors} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
        }}
      />
    </div>
  );
};

export default RandomGradientBackground;
