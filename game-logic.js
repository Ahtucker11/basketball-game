(function (global) {
  function createDefaultSave() {
    return {
      coins: 0,
      owned: { hats: ['none'], balls: ['default'], shirts: ['blue'], pants: ['blue'] },
      equipped: { hat: 'none', ball: 'default', shirt: 'blue', pants: 'blue' },
      settings: { sound: true, showTouchControls: true, seenHelp: false },
      stats: {
        wins: 0,
        losses: 0,
        gamesStarted: 0,
        gamesCompleted: 0,
        gamesPlayed: 0,
        totalPoints: 0,
        bestStreak: 0,
        totalCoinsEarned: 0,
      },
    };
  }

  function validOwned(list, fallback) {
    return Array.isArray(list) && list.length ? [...new Set(list)] : [...fallback];
  }

  function readNumber(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  function normalizeSave(raw) {
    const source = raw || {};
    const defaults = createDefaultSave();
    const legacyStats = source.stats || {};
    const completedGames = readNumber(legacyStats.gamesCompleted, readNumber(legacyStats.gamesPlayed, 0));
    return {
      coins: Math.max(0, readNumber(source.coins, defaults.coins)),
      owned: {
        hats: validOwned(source.owned && source.owned.hats, defaults.owned.hats),
        balls: validOwned(source.owned && source.owned.balls, defaults.owned.balls),
        shirts: validOwned(source.owned && source.owned.shirts, defaults.owned.shirts),
        pants: validOwned(source.owned && source.owned.pants, defaults.owned.pants),
      },
      equipped: {
        hat: (source.equipped && source.equipped.hat) || defaults.equipped.hat,
        ball: (source.equipped && source.equipped.ball) || defaults.equipped.ball,
        shirt: (source.equipped && source.equipped.shirt) || defaults.equipped.shirt,
        pants: (source.equipped && source.equipped.pants) || defaults.equipped.pants,
      },
      settings: {
        sound: !source.settings || source.settings.sound !== false,
        showTouchControls: !source.settings || source.settings.showTouchControls !== false,
        seenHelp: !!(source.settings && source.settings.seenHelp),
      },
      stats: {
        wins: Math.max(0, readNumber(legacyStats.wins, 0)),
        losses: Math.max(0, readNumber(legacyStats.losses, 0)),
        gamesStarted: Math.max(0, readNumber(legacyStats.gamesStarted, completedGames)),
        gamesCompleted: Math.max(0, completedGames),
        gamesPlayed: Math.max(0, completedGames),
        totalPoints: Math.max(0, readNumber(legacyStats.totalPoints, 0)),
        bestStreak: Math.max(0, readNumber(legacyStats.bestStreak, 0)),
        totalCoinsEarned: Math.max(0, readNumber(legacyStats.totalCoinsEarned, readNumber(source.coins, 0))),
      },
    };
  }

  function getPointValueForShotX(sx, hoopSide, zones) {
    if (hoopSide === 'right') {
      if (sx > zones.twoRight) return 1;
      if (sx > zones.threeRight) return 2;
      return 3;
    }
    if (sx < zones.twoLeft) return 1;
    if (sx < zones.threeLeft) return 2;
    return 3;
  }

  const api = {
    createDefaultSave,
    validOwned,
    readNumber,
    normalizeSave,
    getPointValueForShotX,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.GameLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
