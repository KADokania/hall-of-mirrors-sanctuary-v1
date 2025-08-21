import { useState, useEffect } from 'react';
import { Storage } from '../storage/database';

export const useProgressiveUnlock = () => {
  const [bloomsUnlocked, setBlomsUnlocked] = useState(3);
  const [totalSessions, setTotalSessions] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    calculateProgressiveUnlock();
  }, []);

  const calculateProgressiveUnlock = async () => {
    try {
      setIsLoading(true);
      
      // Get all completed sessions from storage
      const allSessions = await Storage.getSessions();
      const completedSessions = allSessions.filter(session => session.completedAt);
      const sessionCount = completedSessions.length;

      // Progressive unlocking logic
      let unlocked = 3; // First time: 3 blooms (Opening Reflection, Feelings, Beliefs)
      
      if (sessionCount >= 1) {
        unlocked = 5; // After 1 complete session: add Challenges, Guidance
      }
      if (sessionCount >= 2) {
        unlocked = 8; // After 2 complete sessions: full spiral (Invitation, Integration, Archetype)
      }

      setBlomsUnlocked(unlocked);
      setTotalSessions(sessionCount + 1); // Current session number
      
    } catch (error) {
      console.error('Error calculating progressive unlock:', error);
      // Default to safe values
      setBlomsUnlocked(3);
      setTotalSessions(1);
    } finally {
      setIsLoading(false);
    }
  };

  const getUnlockMessage = () => {
    if (totalSessions === 1) {
      return "Welcome to your first spiral. Three blooms await your reflection.";
    } else if (totalSessions === 2) {
      return "Your journey deepens. Five blooms are now open to you.";
    } else if (totalSessions >= 3) {
      return "The full spiral unfolds. All eight blooms welcome your presence.";
    }
    return "";
  };

  const getNextUnlockHint = () => {
    if (bloomsUnlocked === 3) {
      return "Complete this spiral to unlock Challenges and Guidance in your next journey.";
    } else if (bloomsUnlocked === 5) {
      return "One more complete spiral will open Invitation, Integration, and the Archetype Mirror.";
    }
    return "You have access to the full spiral journey.";
  };

  return {
    bloomsUnlocked,
    totalSessions,
    isLoading,
    getUnlockMessage,
    getNextUnlockHint,
    refreshUnlock: calculateProgressiveUnlock
  };
};