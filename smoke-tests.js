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
assert.equal(save.settings.showTouchControls, true);
assert.equal(save.stats.gamesCompleted, 5);
assert.equal(save.stats.gamesPlayed, 5);
assert.equal(save.stats.gamesStarted, 5);
assert.equal(save.stats.totalCoinsEarned, 7);

assert.equal(
  GameLogic.getPointValueForShotX(850, 'right', { twoRight: 710, threeRight: 620, twoLeft: 190, threeLeft: 280 }),
  1
);
assert.equal(
  GameLogic.getPointValueForShotX(680, 'right', { twoRight: 710, threeRight: 620, twoLeft: 190, threeLeft: 280 }),
  2
);
assert.equal(
  GameLogic.getPointValueForShotX(500, 'right', { twoRight: 710, threeRight: 620, twoLeft: 190, threeLeft: 280 }),
  3
);
assert.equal(
  GameLogic.getPointValueForShotX(120, 'left', { twoRight: 710, threeRight: 620, twoLeft: 190, threeLeft: 280 }),
  1
);
assert.equal(
  GameLogic.getPointValueForShotX(240, 'left', { twoRight: 710, threeRight: 620, twoLeft: 190, threeLeft: 280 }),
  2
);
assert.equal(
  GameLogic.getPointValueForShotX(360, 'left', { twoRight: 710, threeRight: 620, twoLeft: 190, threeLeft: 280 }),
  3
);

console.log('smoke tests passed');
