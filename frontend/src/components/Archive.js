import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Sparkles, Trash2, RefreshCw, Star, Heart } from 'lucide-react';
import { Storage } from '../storage/database';
import { useProgressiveUnlock } from '../hooks/useProgressiveUnlock';
import { ToneConstellationCard, ArchetypeCard } from './InfoCard';

export const Archive = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { bloomsUnlocked, refreshUnlock } = useProgressiveUnlock();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const sessionsData = await Storage.getSessions();
      setSessions(sessionsData);
      await refreshUnlock(); // Refresh unlock status when archive loads
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      dayName: date.toLocaleDateString('en-US', { 
        weekday: 'long' 
      })
    };
  };

  const getArchetypeName = (archetypeId) => {
    const archetypes = {
      listener: 'The Listener',
      seeker: 'The Seeker', 
      guardian: 'The Guardian',
      creator: 'The Creator',
      sage: 'The Sage'
    };
    return archetypes[archetypeId] || 'The Companion';
  };

  const getToneColor = (tag, isBackground = false) => {
    const colors = {
      peace: isBackground ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-100 text-blue-700',
      trust: isBackground ? 'bg-green-50 text-green-600 border-green-200' : 'bg-green-100 text-green-700',
      clarity: isBackground ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-purple-100 text-purple-700',
      love: isBackground ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-pink-100 text-pink-700',
      strength: isBackground ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-orange-100 text-orange-700',
      creative: isBackground ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-yellow-100 text-yellow-700',
      gentle: isBackground ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-indigo-100 text-indigo-700',
      restless: isBackground ? 'bg-red-50 text-red-600 border-red-200' : 'bg-red-100 text-red-700',
      heavy: isBackground ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-gray-100 text-gray-700'
    };
    return colors[tag] || (isBackground ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-gray-100 text-gray-700');
  };

  const clearAllData = async () => {
    try {
      await Storage.clearAllData();
      setSessions([]);
      setShowClearConfirm(false);
      await refreshUnlock();
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  const beginNewSpiral = () => {
    navigate('/spiral');
  };

  const getSessionGlow = (session) => {
    // Add subtle glow based on archetype or tone
    if (session.archetypeId) {
      const glows = {
        listener: 'shadow-blue-200',
        seeker: 'shadow-purple-200',
        guardian: 'shadow-green-200',
        creator: 'shadow-orange-200',
        sage: 'shadow-indigo-200'
      };
      return glows[session.archetypeId] || '';
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-prompt">Gathering your constellation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Enhanced header */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => navigate('/')}
            className="text-prompt hover:text-presence transition-colors flex items-center gap-2 gentle-hover"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Threshold
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Star className="w-6 h-6 text-blue-400 breathe" />
              <h1 className="text-archetype text-3xl font-light">The Archive</h1>
              <Star className="w-6 h-6 text-blue-400 breathe" />
            </div>
            <p className="text-whisper">A living constellation of your reflections</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={loadSessions}
              className="text-prompt hover:text-presence transition-colors p-3 gentle-hover rounded-full"
              title="Refresh constellation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            {sessions.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-red-400 hover:text-red-600 transition-colors p-3 gentle-hover rounded-full"
                title="Clear all reflections"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Enhanced privacy notice */}
        <div className="sanctuary-card mb-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 fade-in">
          <div className="flex items-start gap-4">
            <Heart className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0 breathe" />
            <div>
              <p className="text-prompt mb-3 text-lg">
                <strong>Your sanctuary, your data.</strong> All reflections are held safely within your device.
              </p>
              <p className="text-whisper">
                Nothing journeys beyond this sacred space. You hold the keys to your constellation.
              </p>
            </div>
          </div>
        </div>

        {/* Sessions constellation or empty state */}
        {sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="sanctuary-card max-w-lg mx-auto constellation-float">
              <div className="mb-8">
                <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-6 opacity-60 breathe" />
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent mx-auto mb-6"></div>
              </div>
              
              <h3 className="text-presence text-2xl mb-6 font-light">Your first reflection awaits</h3>
              <p className="text-prompt mb-8 leading-relaxed">
                The Archive will remember each spiral journey, weaving them into a constellation 
                of your unfolding story.
              </p>
              <button
                onClick={beginNewSpiral}
                className="sanctuary-button text-lg px-8 py-4"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  Begin Your First Spiral
                </div>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* New spiral invitation */}
            <div className="text-center mb-12">
              <button
                onClick={beginNewSpiral}
                className="sanctuary-button gentle-hover text-xl px-12 py-5 constellation-float"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  Begin Again
                  <span className="text-sm opacity-80">({bloomsUnlocked} blooms available)</span>
                </div>
              </button>
              
              <p className="text-whisper mt-4 text-sm">
                Each return deepens the spiral
              </p>
            </div>

            {/* Enhanced sessions constellation */}
            <div className="constellation-grid">
              {sessions.map((session, index) => {
                const { date, time, dayName } = formatDate(session.startedAt);
                const isComplete = session.completedAt;
                
                return (
                  <div
                    key={session.id}
                    onClick={() => navigate(`/session/${session.id}`)}
                    className={`constellation-item ${getSessionGlow(session)} fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Header with enhanced date display */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <div>
                          <span className="text-presence font-medium block">{date}</span>
                          <span className="text-whisper text-xs">{dayName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-whisper text-sm">{time}</span>
                      </div>
                    </div>
                    
                    {/* Status and progress */}
                    <div className="mb-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                        isComplete 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-green-400' : 'bg-yellow-400'} ${!isComplete && 'animate-pulse'}`}></div>
                        {isComplete ? 'Complete Journey' : 'In Progress'}
                      </div>
                      
                      {session.petals && session.petals.length > 0 && (
                        <p className="text-whisper text-sm mb-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {session.petals.length} bloom{session.petals.length !== 1 ? 's' : ''} explored
                        </p>
                      )}
                    </div>
                    
                    {/* Archetype presence */}
                    {session.archetypeId && (
                      <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <span className="text-archetype text-sm font-medium flex items-center gap-2">
                            <Star className="w-3 h-3" />
                            {getArchetypeName(session.archetypeId)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Tone constellation preview */}
                    {session.toneTags && session.toneTags.length > 0 && (
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span className="text-whisper text-xs font-medium">Tone Constellation</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {session.toneTags.slice(0, 4).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className={`px-3 py-1 rounded-full text-xs font-medium border gentle-hover ${getToneColor(tag, true)}`}
                            >
                              {tag}
                            </span>
                          ))}
                          {session.toneTags.length > 4 && (
                            <span className="text-whisper text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-200">
                              +{session.toneTags.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Enhanced clear data confirmation modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="sanctuary-card max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-presence text-xl mb-2">Clear All Reflections?</h3>
              </div>
              
              <p className="text-prompt mb-8 text-center leading-relaxed">
                This will permanently release all your saved sessions, reflections, and journal entries 
                back to the silence. This action cannot be undone.
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-prompt hover:text-presence transition-colors px-6 py-3 rounded-lg gentle-hover"
                >
                  Keep Constellation
                </button>
                <button
                  onClick={clearAllData}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors gentle-hover"
                >
                  Release All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};