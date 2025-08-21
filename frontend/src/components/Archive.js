import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Sparkles, Trash2, RefreshCw } from 'lucide-react';
import { Storage } from '../storage/database';

export const Archive = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const sessionsData = await Storage.getSessions();
      setSessions(sessionsData);
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

  const getToneColor = (tag) => {
    const colors = {
      peace: 'bg-blue-100 text-blue-700',
      trust: 'bg-green-100 text-green-700',
      clarity: 'bg-purple-100 text-purple-700',
      love: 'bg-pink-100 text-pink-700',
      strength: 'bg-orange-100 text-orange-700',
      create: 'bg-yellow-100 text-yellow-700',
      rest: 'bg-indigo-100 text-indigo-700'
    };
    return colors[tag] || 'bg-gray-100 text-gray-700';
  };

  const clearAllData = async () => {
    try {
      await Storage.clearAllData();
      setSessions([]);
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  const beginNewSpiral = () => {
    navigate('/spiral');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-prompt">Loading your reflections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')}
            className="text-prompt hover:text-presence transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Threshold
          </button>
          
          <div className="text-center">
            <h1 className="text-archetype text-2xl mb-2">The Archive</h1>
            <p className="text-whisper">A living constellation of your reflections</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={loadSessions}
              className="text-prompt hover:text-presence transition-colors p-2"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            {sessions.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-red-400 hover:text-red-600 transition-colors p-2"
                title="Clear all data"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Privacy notice */}
        <div className="sanctuary-card mb-8 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-prompt mb-2">
                <strong>Your sanctuary, your data.</strong> All reflections are saved locally on your device.
              </p>
              <p className="text-whisper text-sm">
                Nothing is shared or stored elsewhere. You can clear your data at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Sessions grid or empty state */}
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="sanctuary-card max-w-md mx-auto">
              <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4 opacity-60" />
              <h3 className="text-presence text-xl mb-4">Your first reflection awaits</h3>
              <p className="text-prompt mb-6">
                The Archive will remember each spiral journey, creating a constellation of your growth.
              </p>
              <button
                onClick={beginNewSpiral}
                className="sanctuary-button"
              >
                Begin Your First Spiral
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* New spiral button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={beginNewSpiral}
                className="sanctuary-button flex items-center gap-2 text-lg px-8 py-4"
              >
                <Sparkles className="w-5 h-5" />
                Begin Again
              </button>
            </div>

            {/* Sessions constellation */}
            <div className="constellation-grid">
              {sessions.map((session) => {
                const { date, time } = formatDate(session.startedAt);
                const isComplete = session.completedAt;
                
                return (
                  <div
                    key={session.id}
                    onClick={() => navigate(`/session/${session.id}`)}
                    className="constellation-item"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-prompt font-medium">{date}</span>
                      </div>
                      <span className="text-whisper text-sm">{time}</span>
                    </div>
                    
                    <div className="mb-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mb-2 ${
                        isComplete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                        {isComplete ? 'Complete' : 'In Progress'}
                      </div>
                      
                      {session.petals && session.petals.length > 0 && (
                        <p className="text-whisper text-sm mb-2">
                          {session.petals.length} bloom{session.petals.length !== 1 ? 's' : ''} explored
                        </p>
                      )}
                    </div>
                    
                    {session.archetypeId && (
                      <div className="mb-3">
                        <span className="text-archetype text-sm font-medium">
                          {getArchetypeName(session.archetypeId)}
                        </span>
                      </div>
                    )}
                    
                    {session.toneTags && session.toneTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {session.toneTags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-full text-xs ${getToneColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                        {session.toneTags.length > 3 && (
                          <span className="text-whisper text-xs px-2 py-1">
                            +{session.toneTags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Clear data confirmation modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="sanctuary-card max-w-md mx-auto">
              <h3 className="text-presence text-xl mb-4">Clear All Reflections?</h3>
              <p className="text-prompt mb-6">
                This will permanently delete all your saved sessions, reflections, and journal entries. 
                This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-prompt hover:text-presence transition-colors px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={clearAllData}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};