import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

export const InfoTooltip = ({ title, content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const handleToggle = () => {
    if (!isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      setPosition({
        top: rect.bottom + scrollY + 8,
        left: rect.left + scrollX - 100 // Offset to center better
      });
    }
    setIsVisible(!isVisible);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isVisible &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className="inline-flex items-center gap-1 text-whisper hover:text-prompt transition-all duration-300 gentle-hover"
        title={`Learn about ${title}`}
      >
        {children}
        <Info className="w-3 h-3 opacity-60 hover:opacity-100 transition-opacity" />
      </button>

      {isVisible && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black bg-opacity-10 backdrop-blur-sm"></div>
          
          {/* Tooltip card */}
          <div
            ref={tooltipRef}
            className="fixed z-50 sanctuary-card max-w-sm breathe fade-in"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="relative">
              {/* Gentle glow accent */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-3xl blur opacity-20"></div>
              
              <div className="relative bg-white rounded-2xl p-6 border border-blue-100">
                <h4 className="text-archetype text-sm font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                  {title}
                </h4>
                
                <p className="text-prompt text-sm leading-relaxed">
                  {content}
                </p>
                
                {/* Subtle breathing line */}
                <div className="mt-4 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent breathe"></div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export const ToneConstellationInfo = ({ children }) => (
  <InfoTooltip
    title="Tone Constellation"
    content="These are the qualities the Mirror senses in your words — like colors shining through your session. Over time, they form a constellation in your Archive so you can see which tones often return."
  >
    {children}
  </InfoTooltip>
);

export const ArchetypeInfo = ({ children }) => (
  <InfoTooltip
    title="Archetype Mirror"
    content="The Archetype is a living presence reflected back to you. If you see an Archetype, it means that quality is strong in you. If you see "Emerging," it means this Archetype is just beginning to rise — an invitation to notice and nurture it."
  >
    {children}
  </InfoTooltip>
);