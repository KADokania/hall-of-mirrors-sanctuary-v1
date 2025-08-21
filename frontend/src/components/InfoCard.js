import React from 'react';
import { Info } from 'lucide-react';

export const InfoCard = ({ title, content, isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div className="sanctuary-info-card mt-4 fade-in">
      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-2xl backdrop-blur-sm">
        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-archetype text-sm font-medium mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            {title}
          </h4>
          <div className="sanctuary-info-content">
            <p className="text-prompt text-sm leading-relaxed">
              {content}
            </p>
          </div>
        </div>
      </div>
      
      {/* Gentle breathing line */}
      <div className="mt-3 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent breathe"></div>
    </div>
  );
};

export const ToneConstellationCard = ({ isVisible = true }) => (
  <InfoCard
    title="Tone Constellation"
    content="These are the qualities the Mirror senses in your words — like colors shining through your session. Over time, they form a constellation in your Archive so you can see which tones often return."
    isVisible={isVisible}
  />
);

export const ArchetypeCard = ({ isVisible = true }) => (
  <InfoCard
    title="Archetype Mirror"
    content='The Archetype is a living presence reflected back to you. If you see an Archetype, it means that quality is strong in you. If you see "Emerging," it means this Archetype is just beginning to rise — an invitation to notice and nurture it.'
    isVisible={isVisible}
  />
);