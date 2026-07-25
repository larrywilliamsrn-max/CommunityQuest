export const participantProfile = {
  name: 'Amina Okafor',
  level: 'Explorer',
  xp: 240,
  nextLevelXp: 320,
  tokens: 240,
  questsCompleted: 8,
  totalQuests: 12,
  position: 14,
  recommendedQuest: 'Visit AI Booth',
  reward: '+30 XP',
  badges: ['Keynote Insider', 'Community Spark'],
}

export const questCards = [
  {
    id: 1,
    title: 'Register',
    status: 'Completed',
    reward: '+25 XP',
    detail: 'You are already in the event roster.',
  },
  {
    id: 2,
    title: 'Attend Keynote',
    status: 'Completed',
    reward: '+40 XP',
    detail: 'The opening talk is now part of your streak.',
  },
  {
    id: 3,
    title: 'Visit AI Booth',
    status: 'In Progress',
    reward: '+30 XP',
    detail: 'Scan the booth QR to unlock the next clue.',
  },
  {
    id: 4,
    title: 'Ask a Question',
    status: 'Queued',
    reward: '+20 XP',
    detail: 'Use the community lounge to earn a new badge.',
  },
]

export const leaderboard = [
  { name: 'Mina', xp: 980, tokens: 420, completed: 11 },
  { name: 'Theo', xp: 890, tokens: 360, completed: 10 },
  { name: 'Ava', xp: 740, tokens: 320, completed: 9 },
]
