import React from 'react';

interface RETESPStoryProps {
  size?: number;
}

export const RETESPStory: React.FC<RETESPStoryProps> = ({ size = 64 }) => {
  const logoSize = size * 0.5;

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#44ef52',
        border: '3px solid #f44444',
        boxShadow: '0 0 20px rgba(68, 239, 91, 0.5)',
      }}
    >
      <div
        className="flex items-center justify-center relative"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: size * 0.4,
          backgroundColor: '#161B22',
          border: '2px solid #caef44',
        }}
      >
        {/* Logo no centro */}
        <div className="flex items-center justify-center">
          <img
            src="/assets/logo.png"
            alt="RETESP Logo"
            style={{
              width: logoSize,
              height: logoSize,
              objectFit: 'contain',
            }}
            onError={(e) => {
              // Fallback se a imagem não carregar
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const span = document.createElement('span');
                span.textContent = '⚽';
                span.style.fontSize = `${logoSize}px`;
                span.style.color = '#ef5e44';
                span.style.fontWeight = 'bold';
                parent.appendChild(span);
              }
            }}
          />
        </div>
        
        {/* Badge verde na ponta direita inferior com ⚽ */}
        <div
          className="absolute flex items-center justify-center font-bold text-white"
          style={{
            bottom: -2,
            right: -2,
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: size * 0.175,
            backgroundColor: '#10B981',
            border: '2px solid #44f44d',
            fontSize: size * 0.2,
          }}
        >
          ⚽
        </div>
      </div>
    </div>
  );
};

export default RETESPStory;
