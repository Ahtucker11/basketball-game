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
