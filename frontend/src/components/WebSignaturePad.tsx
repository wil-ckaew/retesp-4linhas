// frontend/src/components/WebSignaturePad.tsx
"use client";
import { useRef, useEffect, useState } from 'react';

interface WebSignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
}

export default function WebSignaturePad({ onSave, onClear }: WebSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Coordenadas
    const getCoords = (e: any) => {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    // Handlers
    const start = (e: any) => {
      e.preventDefault();
      const { x, y } = getCoords(e);
      isDrawing.current = true;
      lastX.current = x;
      lastY.current = y;
      setHasDrawn(true);
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
    };

    const move = (e: any) => {
      if (!isDrawing.current) return;
      e.preventDefault();
      const { x, y } = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(lastX.current, lastY.current);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX.current = x;
      lastY.current = y;
    };

    const end = (e: any) => {
      e.preventDefault();
      isDrawing.current = false;
    };

    // Touch
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end, { passive: false });
    canvas.addEventListener('touchcancel', end, { passive: false });

    // Mouse
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseleave', end);

    return () => {
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', move);
      canvas.removeEventListener('touchend', end);
      canvas.removeEventListener('touchcancel', end);
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mouseup', end);
      canvas.removeEventListener('mouseleave', end);
    };
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    if (onClear) onClear();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isEmpty = !imageData.data.some((channel, i) => i % 4 !== 3 && channel !== 0);

    if (isEmpty || !hasDrawn) {
      alert('⚠️ Por favor, assine no espaço antes de confirmar');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-64 touch-none cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium"
        >
          🗑️ Limpar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
        >
          ✅ Confirmar Assinatura
        </button>
      </div>
    </div>
  );
}
