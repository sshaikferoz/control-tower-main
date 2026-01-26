import React from 'react';
import PSCLogo from '@/assets/PSCLogo';

export const LoadingScreen = () => {
    return (
        <div className="loading-screen">
            {/* Ambient glow */}
            <div className="ambient-glow" />

            {/* Logo */}
            <div className="logo-container logo-rotate">
                <PSCLogo />
            </div>

            {/* Local CSS */}
            <style>{`
        .loading-screen {
          position: relative;
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #050b1a;
          overflow: hidden;
        }

        .ambient-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: rgba(30, 64, 175, 0.2);
          filter: blur(120px);
          border-radius: 50%;
        }

        .logo-rotate {
          position: relative;
          z-index: 10;
          width: 29px;
          height: 31px;
          animation: logo-rotate 2.4s linear infinite;
          transform-origin: center;
        }

        @keyframes logo-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
};
