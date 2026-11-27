import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function FuturisticHandsBridge({ isLight }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = '/assets/hands-reaching.png';

    img.onload = () => {
      const w = img.naturalWidth || 576;
      const h = img.naturalHeight || 1024;
      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      const marginX = w * 0.06;
      const marginY = h * 0.06;

      for (let y = 0; y < h; y++) {
        // Vertical edge feather
        let fy = 1;
        if (y < marginY) fy = y / marginY;
        else if (y > h - marginY) fy = (h - y) / marginY;

        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const lum = Math.max(r, g, b);
          if (lum <= 14) {
            data[idx + 3] = 0;
            continue;
          }

          // Horizontal edge feather
          let fx = 1;
          if (x < marginX) fx = x / marginX;
          else if (x > w - marginX) fx = (w - x) / marginX;

          const edgeFade = Math.min(1, fx) * Math.min(1, fy);
          const norm = (lum - 14) / 241;
          const alphaNorm = Math.min(1, Math.pow(norm, 0.72)) * edgeFade;

          // Un-premultiply dark background so orange glow stays vibrant
          const inv = alphaNorm > 0.05 ? Math.min(2.2, 1 / Math.pow(alphaNorm, 0.45)) : 1;
          data[idx] = Math.min(255, Math.round(r * inv));
          data[idx + 1] = Math.min(255, Math.round(g * inv));
          data[idx + 2] = Math.min(255, Math.round(b * inv));
          data[idx + 3] = Math.round(alphaNorm * 255);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setReady(true);
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-110px)] min-h-[500px] max-h-[780px] flex items-center justify-center select-none pointer-events-none overflow-visible bg-transparent">
      {/* Soft Central Energy Glow Behind Fingertips */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.08, 0.95] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 121, 0, 0.24) 0%, rgba(255, 70, 0, 0.06) 55%, transparent 80%)',
          filter: 'blur(28px)',
        }}
      />

      {/* True Alpha-Transparent Animated Hands Canvas (Enlarged to bridge tabs & form) */}
      <motion.div
        animate={{ y: [0, -6, 0], scale: [1.34, 1.36, 1.34] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative w-full h-full flex items-center justify-center transition-opacity duration-500 ${
          ready ? (isLight ? 'opacity-90' : 'opacity-100') : 'opacity-0'
        }`}
      >
        <canvas
          ref={canvasRef}
          className="w-auto h-full max-w-none object-contain"
        />
      </motion.div>
    </div>
  );
}
