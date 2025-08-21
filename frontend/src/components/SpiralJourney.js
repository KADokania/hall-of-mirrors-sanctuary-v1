import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Heart, Lock } from 'lucide-react';
import { BLOOMS_DATA } from '../data/blooms';
import { Storage } from '../storage/database';
import { LLMProvider } from '../providers/LLMProvider';
import { useProgressiveUnlock } from '../hooks/useProgressiveUnlock';

export const SpiralJourney = () => {
  const { bloomId } = useParams();
  const navigate = useNavigate();
  
  const [currentBloomIndex, setCurrentBloomIndex] = useState(0);
  const [journalText, setJournalText] = useState('');
  const [mirrorResponse, setMirrorResponse] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMirror, setShowMirror] = useState(false);
  
  const { bloomsUnlocked, totalSessions, isLoading: unlockLoading, getUnlockMessage, getNextUnlockHint } = useProgressiveUnlock();
  const llmProvider = new LLMProvider();
  const currentBloom = BLOOMS_DATA[currentBloomIndex];

  useEffect(() => {
    if (!unlockLoading) {
      initializeSession();
      if (bloomId) {
        const index = BLOOMS_DATA.findIndex(bloom => bloom.id === bloomId);
        if (index !== -1 && index < bloomsUnlocked) {
          setCurrentBloomIndex(index);
        }
      }
    }
  }, [bloomId, unlockLoading, bloomsUnlocked]);

  const initializeSession = async () => {
    try {
      const sessionData = await llmProvider.createSession(totalSessions);
      const sessionId = await Storage.saveSession({
        uuid: sessionData.id,  // Store the backend UUID separately
        startedAt: new Date().toISOString(),
        blooms_unlocked: sessionData.blooms_unlocked,
        total_sessions: sessionData.total_sessions,
        toneTags: [],
        petals: []
      });
      
      setSessionData({ 
        id: sessionData.id,  // Backend UUID for LLM calls
        dbId: sessionId,     // IndexedDB auto-increment ID for local storage
        toneTags: [],
        blooms_unlocked: sessionData.blooms_unlocked
      });
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  };

  const handleJournalSubmit = async () => {
    if (!journalText.trim() || !sessionData) return;
    
    setIsLoading(true);
    
    try {
      // Save journal entry
      await Storage.saveJournalEntry({
        sessionId: sessionData.dbId,
        petal: currentBloom.id,
        content: journalText,
        createdAt: new Date().toISOString()
      });

      // Generate LLM-powered mirror response
      const response = await llmProvider.generateMirrorResponse(
        sessionData.id,
        currentBloom.id,
        journalText,
        sessionData.toneTags
      );
      
      // Save reflection
      await Storage.saveReflection({
        sessionId: sessionData.dbId,
        petal: currentBloom.id,
        text: response.text,
        tone: response.tags || [],
        createdAt: new Date().toISOString()
      });

      // Update session with tags and archetype
      const updatedTags = [...new Set([...sessionData.toneTags, ...(response.tags || [])])];
      const updates = { 
        toneTags: updatedTags,
        petals: [...(sessionData.petals || []), currentBloom.id]
      };
      
      if (response.archetypeId) {
        updates.archetypeId = response.archetypeId;
      }
      
      await Storage.updateSession(sessionData.dbId, updates);
      setSessionData({ ...sessionData, ...updates });

      setMirrorResponse(response.text);
      setShowMirror(true);
      
    } catch (error) {
      console.error('Failed to process journal entry:', error);
      // Fallback response
      setMirrorResponse("I'm listening... sometimes the deepest reflections emerge in the spaces between words.");
      setShowMirror(true);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextBloom = () => {
    if (currentBloomIndex < Math.min(BLOOMS_DATA.length - 1, bloomsUnlocked - 1)) {
      const nextIndex = currentBloomIndex + 1;
      setCurrentBloomIndex(nextIndex);
      setJournalText('');
      setMirrorResponse('');
      setShowMirror(false);
      navigate(`/spiral/${BLOOMS_DATA[nextIndex].id}`);
    } else {
      completeSession();
    }
  };

  const completeSession = async () => {
    if (sessionData) {
      await Storage.updateSession(sessionData.dbId, {
        completedAt: new Date().toISOString()
      });
    }
    navigate('/archive');
  };

  const goToPreviousBloom = () => {
    if (currentBloomIndex > 0) {
      const prevIndex = currentBloomIndex - 1;
      setCurrentBloomIndex(prevIndex);
      setJournalText('');
      setMirrorResponse('');
      setShowMirror(false);
      navigate(`/spiral/${BLOOMS_DATA[prevIndex].id}`);
    }
  };

  const isLastAvailableBloom = currentBloomIndex >= bloomsUnlocked - 1;
  const isBloomLocked = currentBloomIndex >= bloomsUnlocked;

  if (unlockLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-prompt">Preparing your sanctuary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')}
            className="text-prompt hover:text-presence transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Threshold
          </button>
          
          <div className="text-center">
            <div className="text-whisper text-sm mb-1">
              Bloom {currentBloomIndex + 1} of {bloomsUnlocked}
            </div>
            <div className="flex gap-1">
              {BLOOMS_DATA.map((_, index) => (
                <div
                  key={index}
                  className={`progress-dot ${
                    index <= currentBloomIndex 
                      ? 'active' 
                      : index < bloomsUnlocked
                      ? 'inactive'
                      : 'progress-dot inactive opacity-30'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="w-24"></div>
        </div>

        {/* Progressive unlock notification */}
        {totalSessions <= 3 && (
          <div className="unlock-notification fade-in mb-8">
            <p className="mb-2">{getUnlockMessage()}</p>
            <p className="text-sm opacity-90">{getNextUnlockHint()}</p>
          </div>
        )}

        {isBloomLocked ? (
          // Locked bloom state
          <div className="sanctuary-card text-center max-w-md mx-auto fade-in">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-presence text-xl mb-4">This bloom awaits your return</h3>
            <p className="text-prompt mb-6">
              Complete your current spiral journey to unlock deeper reflections in future sessions.
            </p>
            <button
              onClick={() => completeSession()}
              className="sanctuary-button"
            >
              Complete This Journey
            </button>
          </div>
        ) : (
          // Active bloom content
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Bloom prompt */}
            <div className="sanctuary-card fade-in">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-purple-400 breathe" />
                <h2 className="text-archetype text-xl">{currentBloom.title}</h2>
              </div>
              
              <div className="text-prompt text-lg leading-relaxed whitespace-pre-line mb-6">
                {currentBloom.prompt}
              </div>
              
              <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
            </div>

            {/* Journal & Mirror */}
            <div className="space-y-6">
              
              {/* Journal input */}
              <div className="sanctuary-card slide-up">
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder={currentBloom.placeholder}
                  className="sanctuary-input"
                  rows={6}
                  disabled={isLoading}
                />
                
                <div className="flex justify-between items-center mt-4">
                  <div className="text-whisper text-sm">
                    {journalText.length > 0 && `${journalText.length} characters`}
                  </div>
                  <button
                    onClick={handleJournalSubmit}
                    disabled={!journalText.trim() || isLoading || showMirror}
                    className="sanctuary-button flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Reflecting...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        Share with Mirror
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mirror response */}
              {showMirror && (
                <div className="mirror-response fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                    <span className="text-whisper text-sm">The Mirror reflects...</span>
                  </div>
                  
                  <p className="text-prompt text-lg leading-relaxed mb-6 italic">
                    {mirrorResponse}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    {currentBloomIndex > 0 && (
                      <button
                        onClick={goToPreviousBloom}
                        className="text-prompt hover:text-presence transition-colors flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </button>
                    )}
                    
                    <div className="flex-1"></div>
                    
                    <button
                      onClick={isLastAvailableBloom ? completeSession : goToNextBloom}
                      className="sanctuary-button flex items-center gap-2"
                    >
                      {isLastAvailableBloom ? 'Complete Journey' : 'Continue'}
                      {!isLastAvailableBloom && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};