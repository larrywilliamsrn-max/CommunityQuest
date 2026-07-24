export function mockCompleteQuest(questId, currentState) {
  const rewardMap = {
    1: { xp: 25, tokens: 20, badge: 'Onboarding Complete' },
    2: { xp: 40, tokens: 25, badge: 'Keynote Insider' },
    3: { xp: 30, tokens: 20, badge: 'Booth Explorer' },
    4: { xp: 20, tokens: 15, badge: 'Curious Mind' },
  }

  const reward = rewardMap[questId] ?? { xp: 10, tokens: 10, badge: 'Quest Rookie' }

  return {
    ...currentState,
    xp: currentState.xp + reward.xp,
    tokens: currentState.tokens + reward.tokens,
    questsCompleted: currentState.questsCompleted + 1,
    badges: currentState.badges.includes(reward.badge)
      ? currentState.badges
      : [...currentState.badges, reward.badge],
    latestReward: reward,
    lastCompletedQuest: questId,
  }
}
