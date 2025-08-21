import Dexie from 'dexie';

export class HallDatabase extends Dexie {
  constructor() {
    super('HallOfMirrorsDB');
    
    this.version(1).stores({
      sessions: '++id, startedAt, completedAt, toneTags, archetypeId',
      reflections: '++id, sessionId, petal, text, tone, createdAt',
      journalEntries: '++id, sessionId, petal, content, createdAt'
    });
  }
}

export const db = new HallDatabase();

// Storage abstraction layer
export class Storage {
  static async saveSession(session) {
    return await db.sessions.add(session);
  }

  static async updateSession(id, updates) {
    return await db.sessions.update(id, updates);
  }

  static async getSession(id) {
    return await db.sessions.get(id);
  }

  static async getSessions() {
    return await db.sessions.orderBy('startedAt').reverse().toArray();
  }

  static async saveReflection(reflection) {
    return await db.reflections.add(reflection);
  }

  static async getReflectionsBySession(sessionId) {
    return await db.reflections.where('sessionId').equals(sessionId).toArray();
  }

  static async saveJournalEntry(entry) {
    return await db.journalEntries.add(entry);
  }

  static async getJournalEntriesBySession(sessionId) {
    return await db.journalEntries.where('sessionId').equals(sessionId).toArray();
  }

  static async clearAllData() {
    await db.sessions.clear();
    await db.reflections.clear();
    await db.journalEntries.clear();
  }
}