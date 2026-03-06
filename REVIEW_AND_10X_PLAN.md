# Basketball Fun Review + 10x Plan

## What the repo actually is

- The whole game lives in `index.html`.
- It is a zero-dependency browser game built with canvas, inline CSS, inline JavaScript, and `localStorage`.
- Core loop: menu -> countdown -> match -> game over -> shop/stats -> replay.

## What is already good

- Immediate pickup-and-play arcade loop
- Clear cosmetics/shop progression
- Nice visual juice for a one-file prototype: particles, crowd, confetti, streaks, countdown
- Simple deployment footprint

## What holds the experience back

1. The game is desktop-first and awkward on touch devices.
2. There is no audio feedback, so shots, dunks, scores, and menus land softly.
3. There is no pause/settings/help layer, so the game feels less polished and less approachable.
4. A few progression/stats details are misleading:
   - "Total Coins Earned" is actually current wallet balance
   - `gamesPlayed` increments on start instead of completion
5. Possession/reset logic has a few rough edges that make the prototype feel less trustworthy than it should.
6. Longer-term technical debt is concentrated in the single-file structure and frame-based simulation.

## 10x plan

### Ship now in this pass

- [x] Make the game adapt better to real screens
  - responsive canvas sizing
  - touch-friendly controls for phones/tablets
- [x] Add feel and feedback
  - lightweight synth SFX
  - sound toggle
  - stronger pause/menu affordances
- [x] Improve onboarding
  - dedicated help/how-to-play screen
  - clearer control tips and scoring explanation
- [x] Fix progression trust issues
  - track lifetime coins earned separately
  - split games started vs completed
  - improve post-game/stat labels
- [x] Smooth out rough gameplay edges
  - more complete possession resets
  - safer loose-ball pickup behavior

### Next technical phase

- [x] Convert gameplay to a fixed timestep so speed and difficulty do not vary with FPS
- [x] Split the single-file script into state/update/render files
- [x] Add a minimal automated smoke test harness for scoring and save normalization

### Phase 2 shipped

- Rendering still uses `requestAnimationFrame`
- Gameplay updates now run through a fixed 60 Hz accumulator
- Large frame gaps are clamped so tab switches or lag spikes do not fast-forward the entire match

### Phase 3 shipped

- The game is no longer trapped in one inline script
- Browser code is now split into:
  - `game-logic.js`
  - `game-core.js`
  - `gameplay.js`
  - `render.js`
  - `main.js`
- Shared pure logic now has a small Node smoke test in `smoke-tests.js`

### Phase 4 shipped

- Match progression rules now live in shared pure logic:
  - game start stat updates
  - game result stat updates
- Shop purchase/equip behavior now lives in shared pure logic
- Smoke tests now cover:
  - save normalization
  - scoring tiers
  - game start / game result stat transitions
  - shop purchase, equip, noop, and insufficient-funds paths

## Execution goal for this pass

Keep the repo simple and browser-native, but make the game feel like a much more finished arcade product without introducing a heavy framework or build step.
