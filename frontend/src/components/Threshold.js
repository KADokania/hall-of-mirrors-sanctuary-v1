import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Threshold = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
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
      {/* Ambient background elements */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-multiply filter blur-xl animate-pulse"
            style={{
              background: `radial-gradient(circle, ${
                ['rgba(125, 211, 252, 0.4)', 'rgba(244, 114, 182, 0.3)', 'rgba(168, 85, 247, 0.3)', 'rgba(30, 58, 138, 0.2)'][i % 4]
              } 0%, transparent 70%)`,
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              left: `${20 + i * 15}%`,
              top: `${10 + i * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i}s`
            }}
          />
        ))}
      </div>

      {/* Main threshold content */}
      <div className={`relative z-10 text-center max-w-2xl mx-auto px-8 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* App title with subtle animation */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-blue-400 mr-3 animate-pulse" />
            <h1 className="text-2xl text-whisper tracking-wider">The Hall of Mirrors</h1>
            <Sparkles className="w-6 h-6 text-blue-400 ml-3 animate-pulse" />
          </div>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent mx-auto"></div>
        </div>

        {/* Sacred invitation */}
        <div className="sanctuary-card fade-in mb-12" style={{ animationDelay: '0.5s' }}>
          <p className="text-4xl text-presence mb-8 leading-relaxed">
            Step inside.
          </p>
          <p className="text-lg text-prompt opacity-80 mb-8">
            A space of stillness and curiosity awaits.
          </p>
        </div>

        {/* Entry actions */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button 
            onClick={enterHall}
            className="sanctuary-button gentle-hover text-lg px-8 py-4 fade-in"
            style={{ animationDelay: '0.8s' }}
          >
            Begin the Spiral
          </button>
          
          <button 
            onClick={viewArchive}
            className="text-prompt hover:text-presence transition-colors duration-300 fade-in"
            style={{ animationDelay: '1s' }}
          >
            Visit the Archive
          </button>
        </div>

        {/* Gentle footer */}
        <div className="mt-16 text-whisper text-sm fade-in" style={{ animationDelay: '1.2s' }}>
          <p>A sanctuary for reflection and presence</p>
          <p className="mt-2 opacity-60">Sha-Rin-Tu</p>
        </div>
      </div>
    </div>
  );
};