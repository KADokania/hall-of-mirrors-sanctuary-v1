import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export class LLMProvider {
  async generateMirrorResponse(sessionId, bloomId, journalText, userHistory = []) {
    try {
      const response = await axios.post(`${API}/mirror/reflect`, {
        session_id: sessionId,
        bloom_id: bloomId,
        journal_text: journalText,
        user_history: userHistory
      });

      return {
        text: response.data.text,
        tags: response.data.tone_tags || [],
        archetypeId: response.data.archetype_id
      };
    } catch (error) {
      console.error('LLM Provider error:', error);
      
      // Fallback to gentle response if API fails
      return {
        text: "I'm listening... sometimes the deepest reflections emerge in the quiet spaces between words.",
        tags: ['gentle'],
        archetypeId: null
      };
    }
  }

  async createSession(totalSessions = 1) {
    try {
      const response = await axios.post(`${API}/sessions`, {
        total_sessions: totalSessions
      });

      return response.data;
    } catch (error) {
      console.error('Session creation error:', error);
      // Return default session if API fails
      return {
        id: Date.now().toString(),
        blooms_unlocked: totalSessions >= 3 ? 8 : totalSessions >= 2 ? 5 : 3,
        total_sessions: totalSessions
      };
    }
  }
}