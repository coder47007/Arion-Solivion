
import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let bars: number[] = Array(60).fill(0);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / bars.length;

      // Update bars
      bars = bars.map((h) => {
        let target = isPlaying ? Math.random() * height * 0.8 : 5;
        // Smooth transition
        return h + (target - h) * 0.1;
      });

      // Draw
      bars.forEach((h, i) => {
        const x = i * barWidth;
        const y = (height - h) / 2; // Center vertically
        
        // Tropical Sunset Gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, '#facc15'); // Sunny Yellow
        gradient.addColorStop(0.5, '#fb923c'); // Orange
        gradient.addColorStop(1, '#f472b6'); // Pink

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, h);
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={100} 
      className="w-full h-full opacity-80 mix-blend-screen pointer-events-none"
    />
  );
};

export default Visualizer;
