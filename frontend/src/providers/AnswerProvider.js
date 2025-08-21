// Provider interface for conversational responses
export class AnswerProvider {
  async generate(signals) {
    throw new Error('generate method must be implemented');
  }
}

// Rule-based implementation for MVH
export class RuleBasedProvider extends AnswerProvider {
  constructor() {
    super();
    this.bloomResponses = {
      'B1': {
        base: "I can sense that gentle stirring in you. Sometimes it whispers, sometimes it calls out more boldly.",
        signals: {
          'excitement': "There's a lightness dancing in your words. Something wants to unfold, doesn't it?",
          'uncertainty': "That's the beauty of this threshold moment — not knowing can be the beginning of knowing.",
          'restless': "Restlessness often carries seeds of something new wanting to grow."
        }
      },
      'B2': {
        base: "Feelings are such honest messengers. They don't lie about what's moving in your inner landscape.",
        signals: {
          'heavy': "Heavy feelings need space to breathe. You're brave for naming them here.",
          'confused': "Sometimes feelings swirl together like weather systems. That's okay — let them move.",
          'peaceful': "There's something beautiful about finding peace in the middle of everything."
        }
      },
      'B3': {
        base: "Beliefs can be such invisible architects, building the world we think we live in.",
        signals: {
          'should': "Ah, the voice of 'should.' What if we loosened its grip just a little?",
          'cant': "Sometimes 'I can't' is really 'I'm afraid.' And fear can be a wise teacher.",
          'must': "What if this 'must' could soften into a gentle invitation instead?"
        }
      },
      'B4': {
        base: "Every challenge carries medicine — even when it feels sharp, even when we can't see it yet.",
        signals: {
          'stuck': "Stuck energy often means something is ready to shift. You're at a threshold.",
          'overwhelmed': "When everything feels too much, sometimes the invitation is to find just one breath.",
          'frustrated': "Frustration can be creative energy looking for a new direction."
        }
      },
      'B5': {
        base: "Your inner wisdom is always speaking. Sometimes we just need to get quiet enough to hear.",
        signals: {
          'trust': "Yes, trust. It's like coming home to something that was never really gone.",
          'patience': "The wisdom of patience — letting things ripen in their own time.",
          'love': "Love as guidance... there's something so simple and revolutionary about that."
        }
      },
      'B6': {
        base: "Every moment holds an invitation. Not a demand, not a should — just a gentle opening.",
        signals: {
          'small': "Sometimes the smallest steps carry the deepest transformation.",
          'rest': "Rest as action. There's profound wisdom in knowing when to be still.",
          'create': "Something wants to come through you. What a beautiful invitation."
        }
      },
      'B7': {
        base: "Integration is like planting seeds in your heart. Something has already begun to shift.",
        signals: {
          'clarity': "This clarity feels earned. You've walked through something and emerged with new sight.",
          'peace': "There's a settled quality to this peace — like you've made friends with something inside.",
          'strength': "This strength has weight to it. It feels rooted in something real."
        }
      },
      'B8': {
        base: "There's a presence walking with you. Can you feel it? Patient, knowing, completely at home with who you are.",
        archetypes: {
          'listener': "The Listener — one who holds space without needing to fill it. That's the frequency you're carrying today.",
          'seeker': "The Seeker — always moving toward what calls, trusting the journey more than the destination.",
          'guardian': "The Guardian — protecting what matters, holding space for growth and healing.",
          'creator': "The Creator — bringing something new into being, trusting the process of emergence.",
          'sage': "The Sage — holding wisdom lightly, sharing insight without attachment to being right."
        }
      }
    };
  }

  async generate(signals) {
    const { petal, journalText, lastToneTags } = signals;
    const bloomData = this.bloomResponses[petal];
    
    if (!bloomData) {
      return { text: "I'm listening...", tags: [] };
    }

    // Analyze journal text for keywords and tone
    const detectedSignals = this.analyzeText(journalText);
    let responseText = bloomData.base;
    let tags = detectedSignals;

    // Check for specific signal responses
    for (const signal of detectedSignals) {
      if (bloomData.signals && bloomData.signals[signal]) {
        responseText = bloomData.signals[signal];
        break;
      }
    }

    // Special handling for Archetype Mirror (B8)
    let archetypeId = null;
    if (petal === 'B8') {
      archetypeId = this.selectArchetype(detectedSignals, lastToneTags);
      if (bloomData.archetypes && bloomData.archetypes[archetypeId]) {
        responseText = bloomData.archetypes[archetypeId];
      }
    }

    return {
      text: responseText,
      tags,
      archetypeId
    };
  }

  analyzeText(text) {
    if (!text) return [];
    
    const signals = [];
    const lowerText = text.toLowerCase();

    // Detect key emotional/mental patterns
    if (lowerText.includes('should') || lowerText.includes('supposed to')) signals.push('should');
    if (lowerText.includes("can't") || lowerText.includes('unable')) signals.push('cant');
    if (lowerText.includes('must') || lowerText.includes('have to')) signals.push('must');
    if (lowerText.includes('excited') || lowerText.includes('energy')) signals.push('excitement');
    if (lowerText.includes('unsure') || lowerText.includes('don\'t know')) signals.push('uncertainty');
    if (lowerText.includes('restless') || lowerText.includes('anxious')) signals.push('restless');
    if (lowerText.includes('heavy') || lowerText.includes('burden')) signals.push('heavy');
    if (lowerText.includes('confused') || lowerText.includes('mixed up')) signals.push('confused');
    if (lowerText.includes('peace') || lowerText.includes('calm')) signals.push('peaceful');
    if (lowerText.includes('stuck') || lowerText.includes('trapped')) signals.push('stuck');
    if (lowerText.includes('overwhelmed') || lowerText.includes('too much')) signals.push('overwhelmed');
    if (lowerText.includes('frustrated') || lowerText.includes('annoyed')) signals.push('frustrated');
    if (lowerText.includes('trust') || lowerText.includes('faith')) signals.push('trust');
    if (lowerText.includes('patient') || lowerText.includes('wait')) signals.push('patience');
    if (lowerText.includes('love') || lowerText.includes('heart')) signals.push('love');
    if (lowerText.includes('small') || lowerText.includes('little')) signals.push('small');
    if (lowerText.includes('rest') || lowerText.includes('tired')) signals.push('rest');
    if (lowerText.includes('create') || lowerText.includes('make')) signals.push('create');
    if (lowerText.includes('clear') || lowerText.includes('understand')) signals.push('clarity');
    if (lowerText.includes('strong') || lowerText.includes('power')) signals.push('strength');

    return signals;
  }

  selectArchetype(signals, lastToneTags = []) {
    // Simple archetype selection based on dominant themes
    const combinedSignals = [...signals, ...lastToneTags];
    
    if (combinedSignals.includes('peace') || combinedSignals.includes('patience')) return 'listener';
    if (combinedSignals.includes('excitement') || combinedSignals.includes('uncertainty')) return 'seeker';
    if (combinedSignals.includes('love') || combinedSignals.includes('trust')) return 'guardian';
    if (combinedSignals.includes('create') || combinedSignals.includes('strength')) return 'creator';
    if (combinedSignals.includes('clarity') || combinedSignals.includes('heavy')) return 'sage';
    
    // Default
    return 'listener';
  }
}