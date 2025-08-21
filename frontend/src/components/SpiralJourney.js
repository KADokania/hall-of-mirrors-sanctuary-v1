import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { BLOOMS_DATA } from '../data/blooms';
import { Storage } from '../storage/database';
import { RuleBasedProvider } from '../providers/AnswerProvider';

export const SpiralJourney = () => {
  const { bloomId } = useParams();
  const navigate = useNavigate();
  
  const [currentBloomIndex, setCurrentBloomIndex] = useState(0);
  const [journalText, setJournalText] = useState('');
  const [mirrorResponse, setMirrorResponse] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMirror, setShowMirror] = useState(false);
  
  const answerProvider = new RuleBasedProvider();
  const currentBloom = BLOOMS_DATA[currentBloomIndex];

  useEffect(() => {
    initializeSession();
    if (bloomId) {
      const index = BLOOMS_DATA.findIndex(bloom => bloom.id === bloomId);
      if (index !== -1) setCurrentBloomIndex(index);
    }
  }, [bloomId]);

  const initializeSession = async () => {
    try {
      const sessionId = await Storage.saveSession({
        startedAt: new Date().toISOString(),
        toneTags: [],
        petals: []
      });
      setSessionData({ id: sessionId, toneTags: [] });
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
        sessionId: sessionData.id,
        petal: currentBloom.id,
        content: journalText,
        createdAt: new Date().toISOString()
      });

      // Generate mirror response
      const signals = {
        petal: currentBloom.id,
        journalText,
        lastToneTags: sessionData.toneTags
      };
      
      const response = await answerProvider.generate(signals);
      
      // Save reflection
      await Storage.saveReflection({
        sessionId: sessionData.id,
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
      
      await Storage.updateSession(sessionData.id, updates);
      setSessionData({ ...sessionData, ...updates });

      setMirrorResponse(response.text);
      setShowMirror(true);
      
    } catch (error) {
      console.error('Failed to process journal entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextBloom = () => {
    if (currentBloomIndex < BLOOMS_DATA.length - 1) {
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
      await Storage.updateSession(sessionData.id, {
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

  const isLastBloom = currentBloomIndex === BLOOMS_DATA.length - 1;

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
              Bloom {currentBloomIndex + 1} of {BLOOMS_DATA.length}
            </div>
            <div className="flex gap-1">
              {BLOOMS_DATA.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentBloomIndex 
                      ? 'bg-blue-400' 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Bloom prompt */}
          <div className="sanctuary-card fade-in">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-purple-400" />
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
              <div className="sanctuary-card fade-in bg-gradient-to-br from-blue-50 to-purple-50">
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
                    onClick={isLastBloom ? completeSession : goToNextBloom}
                    className="sanctuary-button flex items-center gap-2"
                  >
                    {isLastBloom ? 'Complete Journey' : 'Continue'}
                    {!isLastBloom && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};