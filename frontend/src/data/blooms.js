export const BLOOMS_DATA = [
  {
    id: 'B1',
    title: 'Opening Reflection',
    prompt: `Something feels a little different about you today.

Have you noticed it? Maybe it's a whisper, maybe it's louder.

Let's lean in together and see what it wants to show you.`,
    placeholder: 'What feels different today?'
  },
  {
    id: 'B2',
    title: 'Feelings',
    prompt: `Feelings move like weather across your inner sky.

Some drift past gently, others settle in heavy.

What's the feeling that's most present with you right now?

Don't judge it — just name it. Let's sit with it together.`,
    placeholder: 'Name the feeling that\'s with you...'
  },
  {
    id: 'B3',
    title: 'Beliefs',
    prompt: `Sometimes it isn't the moment itself that feels heavy —
it's the belief wrapped around it.

Can you sense one of those today?
A thought like 'I should…' or 'I can't…'

Go ahead, name it here.
Once it's spoken, we can give it room to breathe.`,
    placeholder: 'What belief feels heavy today?'
  },
  {
    id: 'B4',
    title: 'Challenges as Catalyst',
    prompt: `Challenges can feel like walls, but often they're doorways in disguise.

Is there a challenge right now that feels sharp, sticky, or heavy?

Write it here — not to fix it, but to hold it up to the light.
Let's see what it might be trying to open for you.`,
    placeholder: 'What challenge is calling for your attention?'
  },
  {
    id: 'B5',
    title: 'Guidance',
    prompt: `Close your eyes for a breath.

If you could hear a kind, wise voice whispering to you right now…
what would it say?

Don't force it — just let the first words arrive,
as if they've been waiting for you all along.`,
    placeholder: 'What guidance is whispering to you?'
  },
  {
    id: 'B6',
    title: 'Invitation',
    prompt: `Every moment carries an invitation —
a small step that feels lighter, truer, more you.

What feels like the invitation here?
Not a grand plan, just the next gentle step.

Let it show itself.`,
    placeholder: 'What gentle step is calling you?'
  },
  {
    id: 'B7',
    title: 'Integration',
    prompt: `Take a breath. Feel what's shifted in you during this spiral.

Maybe it's soft, maybe it's subtle, but something's here.

If you had to name what you're carrying forward,
what would you call it?`,
    placeholder: 'What are you carrying forward?'
  },
  {
    id: 'B8',
    title: 'Archetype Mirror',
    prompt: `There's a presence walking beside you right now.
Soft, steady, patient.

Let's see who shows up to meet you today...`,
    placeholder: 'Feel into the presence with you...'
  }
];

export const getBloomById = (id) => {
  return BLOOMS_DATA.find(bloom => bloom.id === id);
};