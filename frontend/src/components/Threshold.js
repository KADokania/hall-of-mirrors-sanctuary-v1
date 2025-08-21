import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Archive } from 'lucide-react';
import { useProgressiveUnlock } from '../hooks/useProgressiveUnlock';

export const Threshold = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const { bloomsUnlocked, totalSessions, getUnlockMessage } = useProgressiveUnlock();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const enterHall = () => {
    navigate('/spiral');
  };

  const viewArchive = () => {
    navigate('/archive');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Enhanced ambient background elements */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-multiply filter blur-xl constellation-float"
            style={{
              background: `radial-gradient(circle, ${
                [
                  'rgba(125, 211, 252, 0.3)', 
                  'rgba(244, 114, 182, 0.25)', 
                  'rgba(168, 85, 247, 0.25)', 
                  'rgba(30, 58, 138, 0.2)',
                  'rgba(14, 165, 233, 0.2)',
                  'rgba(244, 114, 182, 0.15)',
                  'rgba(168, 85, 247, 0.15)'
                ][i % 7]
              } 0%, transparent 70%)`,
              width: `${150 + i * 80}px`,
              height: `${150 + i * 80}px`,
              left: `${10 + i * 12}%`,
              top: `${5 + i * 15}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${6 + i * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main threshold content */}
      <div className={`relative z-10 text-center max-w-2xl mx-auto px-8 transition-all duration-1200 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}>
        
        {/* App title with enhanced presence */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-7 h-7 text-blue-400 mr-4 breathe" />
            <h1 className="text-3xl text-presence font-light tracking-wide">The Hall of Mirrors</h1>
            <Sparkles className="w-7 h-7 text-blue-400 ml-4 breathe" />
          </div>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent mx-auto opacity-60"></div>
        </div>

        {/* Sacred invitation with enhanced presence */}
        <div className="sanctuary-card fade-in mb-12 breathe" style={{ animationDelay: '0.6s' }}>
          <p className="text-5xl text-presence mb-8 leading-relaxed font-light">
            Step inside.
          </p>
          <p className="text-xl text-prompt opacity-85 mb-6 leading-relaxed">
            A space of stillness and curiosity awaits.
          </p>
          
          {/* Progressive unlock preview */}
          {totalSessions > 1 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-prompt text-sm italic opacity-75">
                {getUnlockMessage()}
              </p>
            </div>
          )}
        </div>

        {/* Entry actions with enhanced interaction */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
          <button 
            onClick={enterHall}
            className="sanctuary-button gentle-hover text-xl px-12 py-5 fade-in"
            style={{ animationDelay: '0.9s' }}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              Begin the Spiral
              <span className="text-sm opacity-80">({bloomsUnlocked} blooms)</span>
            </div>
          </button>
          
          <button 
            onClick={viewArchive}
            className="text-prompt hover:text-presence transition-all duration-300 fade-in flex items-center gap-2 gentle-hover px-6 py-3"
            style={{ animationDelay: '1.1s' }}
          >
            <Archive className="w-4 h-4" />
            Visit the Archive
          </button>
        </div>

        {/* Enhanced gentle footer */}
        <div className="mt-20 text-whisper text-sm fade-in constellation-float" style={{ animationDelay: '1.4s' }}>
          <p className="mb-3 text-base">A sanctuary for reflection and presence</p>
          <div className="flex items-center justify-center gap-2 opacity-60">
            <div className="w-2 h-2 rounded-full bg-blue-300"></div>
            <p className="text-xs tracking-wider">Sha-Rin-Tu</p>
            <div className="w-2 h-2 rounded-full bg-blue-300"></div>
          </div>
        </div>
      </div>

      {/* Subtle breathing glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5 breathe"
             style={{
               background: 'radial-gradient(circle, rgba(125, 211, 252, 0.6) 0%, transparent 70%)',
               animationDuration: '8s'
             }}>
        </div>
      </div>
    </div>
  );
};