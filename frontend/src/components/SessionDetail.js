import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Sparkles, BookOpen, Heart } from 'lucide-react';
import { Storage } from '../storage/database';
import { BLOOMS_DATA } from '../data/blooms';
import { ToneConstellationInfo, ArchetypeInfo } from './InfoTooltip';

export const SessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [reflections, setReflections] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setIsLoading(true);
      
      // Try to get session by IndexedDB ID (auto-increment)
      let sessionData = await Storage.getSession(parseInt(sessionId));
      
      // If not found by ID, try to find by UUID (for backwards compatibility)
      if (!sessionData) {
        const allSessions = await Storage.getSessions();
        sessionData = allSessions.find(s => s.uuid === sessionId || s.id === sessionId);
      }
      
      if (sessionData) {
        const [reflectionsData, journalData] = await Promise.all([
          Storage.getReflectionsBySession(sessionData.id), // Use the IndexedDB ID for relations
          Storage.getJournalEntriesBySession(sessionData.id)
        ]);
        
        setSession(sessionData);
        setReflections(reflectionsData);
        setJournalEntries(journalData);
      }
      
    } catch (error) {
      console.error('Failed to load session data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  const getBloomTitle = (petalId) => {
    const bloom = BLOOMS_DATA.find(b => b.id === petalId);
    return bloom ? bloom.title : petalId;
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
      peace: 'bg-blue-100 text-blue-700 border-blue-200',
      trust: 'bg-green-100 text-green-700 border-green-200',
      clarity: 'bg-purple-100 text-purple-700 border-purple-200',
      love: 'bg-pink-100 text-pink-700 border-pink-200',
      strength: 'bg-orange-100 text-orange-700 border-orange-200',
      create: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      rest: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    return colors[tag] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Combine and sort entries by petal order
  const getCombinedEntries = () => {
    const combined = [];
    
    BLOOMS_DATA.forEach(bloom => {
      const journalEntry = journalEntries.find(entry => entry.petal === bloom.id);
      const reflection = reflections.find(ref => ref.petal === bloom.id);
      
      if (journalEntry || reflection) {
        combined.push({
          bloom,
          journalEntry,
          reflection
        });
      }
    });
    
    return combined;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-prompt">Loading your reflection...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="sanctuary-card text-center max-w-md">
          <p className="text-prompt mb-4">Session not found</p>
          <button
            onClick={() => navigate('/archive')}
            className="sanctuary-button"
          >
            Return to Archive
          </button>
        </div>
      </div>
    );
  }

  const combinedEntries = getCombinedEntries();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/archive')}
            className="text-prompt hover:text-presence transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Archive
          </button>
          
          <div className="text-center">
            <h1 className="text-archetype text-xl mb-1">Reflection Session</h1>
            <p className="text-whisper text-sm">{formatDate(session.startedAt)}</p>
          </div>
          
          <div className="w-24"></div> {/* Spacer */}
        </div>

        {/* Session overview */}
        <div className="sanctuary-card mb-8 fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="text-center">
              <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-whisper text-sm">Duration</p>
              <p className="text-presence">
                {session.completedAt ? (
                  `${Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / (1000 * 60))} minutes`
                ) : (
                  'In progress'
                )}
              </p>
            </div>
            
            <div className="text-center">
              <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-whisper text-sm">Blooms Explored</p>
              <p className="text-presence">
                {combinedEntries.length} of {BLOOMS_DATA.length}
              </p>
            </div>
            
            <div className="text-center">
              <BookOpen className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <ArchetypeInfo>
                <p className="text-whisper text-sm">Archetype</p>
              </ArchetypeInfo>
              <p className="text-presence">
                {session.archetypeId ? getArchetypeName(session.archetypeId) : 'Emerging'}
              </p>
            </div>
          </div>
          
          {/* Tone constellation */}
          {session.toneTags && session.toneTags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="mb-3">
                <ToneConstellationInfo>
                  <span className="text-whisper text-sm">Tone Constellation</span>
                </ToneConstellationInfo>
              </div>
              <div className="flex flex-wrap gap-2">
                {session.toneTags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm border gentle-hover ${getToneColor(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Journey entries */}
        <div className="space-y-8">
          {combinedEntries.map((entry, index) => (
            <div key={entry.bloom.id} className="slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              
              {/* Bloom header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-medium">
                  {index + 1}
                </div>
                <h3 className="text-archetype text-lg">{entry.bloom.title}</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Journal entry */}
                {entry.journalEntry && (
                  <div className="sanctuary-card bg-gradient-to-br from-cream-base to-cream-warm">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <span className="text-whisper text-sm">Your reflection</span>
                    </div>
                    <p className="text-prompt leading-relaxed">
                      {entry.journalEntry.content}
                    </p>
                  </div>
                )}

                {/* Mirror response */}
                {entry.reflection && (
                  <div className="sanctuary-card bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-4 h-4 text-purple-400" />
                      <span className="text-whisper text-sm">Mirror's reflection</span>
                    </div>
                    <p className="text-prompt leading-relaxed italic">
                      {entry.reflection.text}
                    </p>
                    
                    {entry.reflection.tone && entry.reflection.tone.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-purple-200">
                        <div className="mb-2">
                          <ToneConstellationInfo>
                            <span className="text-whisper text-xs">Reflection Tones</span>
                          </ToneConstellationInfo>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {entry.reflection.tone.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className={`px-2 py-1 rounded-full text-xs gentle-hover ${getToneColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <button
            onClick={() => navigate('/spiral')}
            className="sanctuary-button flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            Begin a New Spiral
          </button>
        </div>
      </div>
    </div>
  );
};