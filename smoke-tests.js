const assert = require('assert');
const GameLogic = require('./game-logic.js');

const save = GameLogic.normalizeSave({
  coins: 7,
  owned: { hats: ['cap', 'cap'], balls: [], shirts: ['blue'], pants: ['blue'] },
  equipped: { hat: 'cap' },
  settings: { sound: false },
  stats: { wins: 3, gamesPlayed: 5, totalPoints: 22, bestStreak: 4 },
});

assert.equal(save.coins, 7);
assert.deepEqual(save.owned.hats, ['cap']);
assert.deepEqual(save.owned.balls, ['default']);
assert.equal(save.settings.sound, false);
assert.equal(save.settings.music, true);
assert.equal(save.settings.showTouchControls, true);
assert.equal(save.stats.gamesCompleted, 5);
assert.equal(save.stats.gamesPlayed, 5);
assert.equal(save.stats.gamesStarted, 5);
assert.equal(save.stats.totalCoinsEarned, 7);

const started = GameLogic.recordGameStart(save);
assert.equal(started.stats.gamesStarted, 6);
assert.equal(started.stats.gamesCompleted, 5);
assert.equal(started.stats.gamesPlayed, 5);

const playerWin = GameLogic.recordGameResult(started, 'player');
assert.equal(playerWin.stats.gamesCompleted, 6);
assert.equal(playerWin.stats.gamesPlayed, 6);
assert.equal(playerWin.stats.wins, 4);
assert.equal(playerWin.stats.losses, 0);

const cpuWin = GameLogic.recordGameResult(save, 'cpu');
assert.equal(cpuWin.stats.gamesCompleted, 6);
assert.equal(cpuWin.stats.losses, 1);
assert.equal(cpuWin.stats.wins, 3);

const scoreZones = { twoRight: 710, threeRight: 620, twoLeft: 190, threeLeft: 280 };

assert.equal(
  GameLogic.getPointValueForShotX(850, 'right', scoreZones),
  1
);
assert.equal(
  GameLogic.getPointValueForShotX(680, 'right', scoreZones),
  2
);
assert.equal(
  GameLogic.getPointValueForShotX(500, 'right', scoreZones),
  3
);
assert.equal(
  GameLogic.getPointValueForShotX(120, 'left', scoreZones),
  1
);
assert.equal(
  GameLogic.getPointValueForShotX(240, 'left', scoreZones),
  2
);
assert.equal(
  GameLogic.getPointValueForShotX(360, 'left', scoreZones),
  3
);

const scoringBase = GameLogic.normalizeSave({});
const playerFire = GameLogic.applyScoringEvent({
  save: scoringBase,
  scorer: 'player',
  shotX: 500,
  zones: scoreZones,
  scores: { player: 0, cpu: 0 },
  streaks: { player: 2, cpu: 1 },
  onFire: { player: false, cpu: true },
  winScore: 5,
});
assert.equal(playerFire.points, 3);
assert.equal(playerFire.scores.player, 3);
assert.equal(playerFire.streaks.player, 3);
assert.equal(playerFire.streaks.cpu, 0);
assert.equal(playerFire.onFire.player, true);
assert.equal(playerFire.onFire.cpu, false);
assert.equal(playerFire.onFireActivated, true);
assert.equal(playerFire.fireBonus, 1);
assert.equal(playerFire.totalCoins, 4);
assert.equal(playerFire.save.coins, 4);
assert.equal(playerFire.save.stats.totalPoints, 3);
assert.equal(playerFire.save.stats.totalCoinsEarned, 4);
assert.equal(playerFire.save.stats.bestStreak, 3);
assert.equal(playerFire.nextBallOwner, 'cpu');
assert.equal(playerFire.winner, null);
assert.equal(playerFire.scoreFlash, '+3!');

const playerWinScore = GameLogic.applyScoringEvent({
  save: playerFire.save,
  scorer: 'player',
  shotX: 850,
  zones: scoreZones,
  scores: playerFire.scores,
  streaks: playerFire.streaks,
  onFire: playerFire.onFire,
  winScore: 4,
});
assert.equal(playerWinScore.points, 1);
assert.equal(playerWinScore.fireBonus, 1);
assert.equal(playerWinScore.totalCoins, 2);
assert.equal(playerWinScore.scores.player, 4);
assert.equal(playerWinScore.streaks.player, 4);
assert.equal(playerWinScore.save.coins, 6);
assert.equal(playerWinScore.save.stats.totalPoints, 4);
assert.equal(playerWinScore.save.stats.bestStreak, 4);
assert.equal(playerWinScore.winner, 'player');

const cpuFire = GameLogic.applyScoringEvent({
  save: scoringBase,
  scorer: 'cpu',
  shotX: 240,
  zones: scoreZones,
  scores: { player: 2, cpu: 1 },
  streaks: { player: 2, cpu: 2 },
  onFire: { player: true, cpu: false },
  winScore: 3,
});
assert.equal(cpuFire.points, 2);
assert.equal(cpuFire.scores.cpu, 3);
assert.equal(cpuFire.streaks.cpu, 3);
assert.equal(cpuFire.streaks.player, 0);
assert.equal(cpuFire.onFire.cpu, true);
assert.equal(cpuFire.onFire.player, false);
assert.equal(cpuFire.onFireActivated, true);
assert.equal(cpuFire.totalCoins, 0);
assert.equal(cpuFire.save.coins, 0);
assert.equal(cpuFire.winner, 'cpu');
assert.equal(cpuFire.nextBallOwner, 'player');
assert.equal(cpuFire.scoreFlash, 'CPU +2!');

const perfectRelease = GameLogic.getReleaseResult(66, 100);
assert.equal(perfectRelease.perfect, true);
assert.equal(perfectRelease.adjustedPower >= 68, true);
const imperfectRelease = GameLogic.getReleaseResult(20, 100);
assert.equal(imperfectRelease.perfect, false);
assert.equal(GameLogic.isStealWindow(20, 18), true);
assert.equal(GameLogic.isStealWindow(70, 18), false);

const shopBase = GameLogic.normalizeSave({
  coins: 10,
  owned: { hats: ['none'], balls: ['default'], shirts: ['blue'], pants: ['blue'] },
  equipped: { hat: 'none', ball: 'default', shirt: 'blue', pants: 'blue' },
});

const boughtHat = GameLogic.applyShopAction(shopBase, 'hats', { id: 'cap', price: 5 });
assert.equal(boughtHat.action, 'purchase');
assert.equal(boughtHat.changed, true);
assert.equal(boughtHat.save.coins, 5);
assert.deepEqual(boughtHat.save.owned.hats, ['none', 'cap']);
assert.equal(boughtHat.save.equipped.hat, 'cap');

const equippedOwnedHat = GameLogic.applyShopAction(boughtHat.save, 'hats', { id: 'none', price: 0 });
assert.equal(equippedOwnedHat.action, 'equip');
assert.equal(equippedOwnedHat.changed, true);
assert.equal(equippedOwnedHat.save.coins, 5);
assert.equal(equippedOwnedHat.save.equipped.hat, 'none');

const noOpEquip = GameLogic.applyShopAction(equippedOwnedHat.save, 'hats', { id: 'none', price: 0 });
assert.equal(noOpEquip.action, 'noop');
assert.equal(noOpEquip.changed, false);

const blockedPurchase = GameLogic.applyShopAction(shopBase, 'balls', { id: 'rainbow', price: 25 });
assert.equal(blockedPurchase.action, 'insufficient_funds');
assert.equal(blockedPurchase.changed, false);
assert.equal(blockedPurchase.save.coins, 10);

console.log('smoke tests passed');
