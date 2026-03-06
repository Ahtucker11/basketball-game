(function (global) {
  function createDefaultSave() {
    return {
      coins: 0,
      owned: { hats: ['none'], balls: ['default'], shirts: ['blue'], pants: ['blue'] },
      equipped: { hat: 'none', ball: 'default', shirt: 'blue', pants: 'blue' },
      settings: { sound: true, music: true, showTouchControls: true, seenHelp: false },
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
        music: !source.settings || source.settings.music !== false,
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

  function cloneSave(save) {
    return normalizeSave(save);
  }

  function recordGameStart(save) {
    const next = cloneSave(save);
    next.stats.gamesStarted++;
    next.stats.gamesPlayed = next.stats.gamesCompleted;
    return next;
  }

  function recordGameResult(save, result) {
    const next = cloneSave(save);
    next.stats.gamesCompleted++;
    next.stats.gamesPlayed = next.stats.gamesCompleted;
    if (result === 'player') next.stats.wins++;
    else if (result === 'cpu') next.stats.losses++;
    return next;
  }

  function getEquipKeyForCategory(category) {
    if (category === 'hats') return 'hat';
    if (category === 'balls') return 'ball';
    if (category === 'shirts') return 'shirt';
    return 'pants';
  }

  function applyShopAction(save, category, item) {
    const next = cloneSave(save);
    const eqKey = getEquipKeyForCategory(category);
    const ownedList = next.owned[category] || [];
    const itemId = item.id;
    const price = readNumber(item.price, 0);
    const isOwned = ownedList.includes(itemId);
    const isEquipped = next.equipped[eqKey] === itemId;

    if (isEquipped) return { save: next, action: 'noop', changed: false };
    if (isOwned) {
      next.equipped[eqKey] = itemId;
      return { save: next, action: 'equip', changed: true };
    }
    if (next.coins < price) return { save: next, action: 'insufficient_funds', changed: false };

    next.coins -= price;
    next.owned[category] = [...ownedList, itemId];
    next.equipped[eqKey] = itemId;
    return { save: next, action: 'purchase', changed: true };
  }

  function applyScoringEvent(config) {
    const nextSave = cloneSave(config.save);
    const scorer = config.scorer;
    const points = getPointValueForShotX(
      config.shotX,
      scorer === 'player' ? 'right' : 'left',
      config.zones
    );
    const scores = {
      player: readNumber(config.scores && config.scores.player, 0),
      cpu: readNumber(config.scores && config.scores.cpu, 0),
    };
    const streaks = {
      player: readNumber(config.streaks && config.streaks.player, 0),
      cpu: readNumber(config.streaks && config.streaks.cpu, 0),
    };
    const onFire = {
      player: !!(config.onFire && config.onFire.player),
      cpu: !!(config.onFire && config.onFire.cpu),
    };
    let onFireActivated = false;
    let fireBonus = 0;
    let totalCoins = 0;

    if (scorer === 'player') {
      scores.player += points;
      streaks.player++;
      streaks.cpu = 0;
      onFire.cpu = false;
      if (streaks.player >= 3 && !onFire.player) {
        onFire.player = true;
        onFireActivated = true;
      }
      fireBonus = onFire.player ? 1 : 0;
      totalCoins = points + fireBonus;
      nextSave.coins += totalCoins;
      nextSave.stats.totalCoinsEarned += totalCoins;
      nextSave.stats.totalPoints += points;
      nextSave.stats.bestStreak = Math.max(nextSave.stats.bestStreak, streaks.player);
    } else {
      scores.cpu += points;
      streaks.cpu++;
      streaks.player = 0;
      onFire.player = false;
      if (streaks.cpu >= 3 && !onFire.cpu) {
        onFire.cpu = true;
        onFireActivated = true;
      }
    }

    let winner = null;
    if (scores.player >= readNumber(config.winScore, 0)) winner = 'player';
    else if (scores.cpu >= readNumber(config.winScore, 0)) winner = 'cpu';

    return {
      save: nextSave,
      scores,
      streaks,
      onFire,
      points,
      fireBonus,
      totalCoins,
      winner,
      onFireActivated,
      nextBallOwner: scorer === 'player' ? 'cpu' : 'player',
      scoreFlash: scorer === 'player' ? `+${points}!` : `CPU +${points}!`,
    };
  }

  function getReleaseResult(power, maxPower) {
    const safeMax = Math.max(1, readNumber(maxPower, 100));
    const clamped = Math.max(0, Math.min(safeMax, readNumber(power, 0)));
    const normalized = clamped / safeMax;
    const perfect = normalized >= 0.58 && normalized <= 0.74;
    return {
      normalized,
      perfect,
      adjustedPower: perfect ? Math.max(clamped, safeMax * 0.68) : clamped,
    };
  }

  function isStealWindow(dx, dy, reachX = 46, reachY = 42) {
    return Math.abs(dx) <= reachX && Math.abs(dy) <= reachY;
  }

  const api = {
    createDefaultSave,
    validOwned,
    readNumber,
    normalizeSave,
    getPointValueForShotX,
    recordGameStart,
    recordGameResult,
    getEquipKeyForCategory,
    applyShopAction,
    applyScoringEvent,
    getReleaseResult,
    isStealWindow,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.GameLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
