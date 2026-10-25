# Pocket League

An original, Spline-free browser car-football game built with **Three.js, Rapier and an authoritative Node/WebSocket match server**. Includes a full-size enclosed arena, a practice bot and private 1v1 rooms.

This is a playable starting point, not a reproduction of Rocket League's proprietary engine, assets or production quality.

## Run locally

Requires Node.js 22 or newer.

```sh
npm ci
npm run build
npm start
```

Open **http://localhost:3001**. Both players open the same server, choose **Host a match** / **Join friend**, and share the six-character code. No Spline account, API key or third-party signaling service is required.

For development, run these in two terminals:

```sh
npm run dev:server
npm run dev
```

Open http://localhost:5173. Vite proxies `/ws` to the match server. The dev server binds to loopback; use `npm run dev -- --host 0.0.0.0` when deliberately exposing it to your LAN.

## Controls

| Control | Action |
|---|---|
| WASD / arrows | Drive; pitch and yaw while airborne |
| Shift | Boost |
| Space | Jump; hold for additional height |
| Direction + second Space press | Directional dodge / flip |
| Q / E | Air roll |
| Ctrl | Powerslide |
| C | Toggle ball camera |
| R | Recover when overturned, slow and near the ground |
| Esc | Pause practice; release controls in online play |

Touch buttons provide basic drive, jump and boost controls. Keyboard is recommended for aerials. The graphics selector trades shadows and bloom for performance. Fonts are bundled; the game does not depend on a font CDN.

## Game and physics

- 81.92 × 102.4 meter field, 20.44 meter playable ceiling, clipped corners and 2.56 meter curved floor/wall joins.
- 17.8551 × 6.42775 meter goal openings with 8.8 meter goal depth.
- Shared arena geometry for rendering and collision.
- Rapier dynamic car chassis with four raycast suspension wheels; ball/chassis masses of 30/180.
- 120 Hz fixed simulation, gravity of 6.5 m/s², speed-dependent steering, throttle target of 14.1 m/s and total speed target of 23 m/s.
- Variable-height jumps, double jumps, directional flips, airborne pitch/yaw/roll and forward-facing boost.
- 28 small boost pads and six large pads, 4/10 second cooldowns, no passive boost regeneration.
- Five-minute matches, live ball at zero, sudden-death overtime and mutual rematch votes.

The v2 measurements and gameplay rules have been carried over from the earlier prototype. Spline-specific HTML/bridge code has been replaced rather than retained as an unused dependency. See [docs/physics-reference.md](docs/physics-reference.md) for sources and differences.

## Multiplayer

The server owns physics, score, timer and pad state. Clients send sanitized controls at 30 Hz and receive snapshots at 40 Hz; rendering smooths positions and orientations. Match simulation runs on the server even when either client loses focus. Controls expire after 300 ms without input. Disconnections release the room and free its physics world.

Private rooms are anonymous and ephemeral. This version has **no client prediction / reconciliation, public matchmaking, accounts, ranked play or host migration**. Latency will affect responsiveness; test from the intended hosting region and networks. A client cannot directly submit its position, score or boost reserve.

## Deploy

The included `render.yaml` describes a single Node web service serving both `dist/` and `/ws`. Import this repository into a Node host supporting persistent WebSockets, use `npm ci && npm run build` as the build command and `npm start` as the start command. The server respects `PORT` and exposes `/health`.

The frontend and server should share an origin; HTTPS automatically selects WSS. No secrets are needed. `ALLOWED_ORIGINS` can explicitly allow additional comma-separated origins. `MAX_ROOMS` defaults to 32; the deployment template sets 16. One server process owns its in-memory rooms; horizontal scaling requires a shared room directory and routing strategy.

Hosting has not been provisioned by this code change. Free hosting availability, sleeping services and resource limits depend on the provider; it does not guarantee permanently free or low-latency multiplayer. GitHub Pages alone can host a practice frontend but cannot run this WebSocket server.

## Verify

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Physics tests cover suspension, acceleration, boost, jumping, floor/goal collision, ramp entry and a six-minute stability run. Server tests connect two **real WebSocket clients**, verify guest controls and stale-input handling, room capacity, disconnect cleanup and malformed input. Browser tests cover real WebGL rendering, practice input and two-page room flow. Set `CHROMIUM_PATH` to use an existing compatible Chromium binary.

## Layout

```text
client/       Three.js scene, camera, HUD, controls and audio
shared/       Arena mesh, Rapier simulation, constants and math
server/       Static HTTP server, room lifecycle and WebSocket protocol
tests/        Physics, real WebSocket and browser checks
docs/         Reference measurements and known limits
```

The initial bundle includes Rapier's WebAssembly through its compatibility package and is comparatively large. Production art, asset compression, adaptive quality and network prediction are follow-up work. Procedural cars and stadium assets are original placeholders for a later detailed asset pass; exact Rocket League graphics or handling are not claimed.

## Graphics and frame pacing update

Open **Settings** from the menu or in a match. Presets: **Smooth, Balanced, HD, HDR, Ultra**. Frame targets are independent: **30, 45, 60, 90, 120 FPS or Unlimited**. Resolution (50–150%), shadows, bloom, crowd, adaptive resolution, music/effects volume and an FPS counter can be changed and persist locally.

For Intel Iris integrated graphics, start with **Smooth + 60 FPS**, 60% resolution, shadows/bloom/crowd off, and adaptive resolution on. This is a target, not a verified hardware guarantee. Adaptive resolution lowers resolution when measured rendered FPS is below the selected target, down to 50%; higher FPS also requires a compatible display and enough CPU/GPU capacity. The counter measures delivered animation-frame draws, not GPU timing.

Static stadium meshes are batched by material. Bloom/exposure and reflective paint were reduced to retain the car's color and silhouette. Rendering is paced independently of the 120 Hz simulation, and local catch-up now handles up to 150 ms instead of slowing the simulation at every frame over 50 ms. Camera and vehicle smoothing are more responsive. Long stalls still require dropping elapsed time to avoid unbounded catch-up.

Quiet original procedural electronic racing music plays during active matches, with separate volume from engine and effects. Contact-force events drive crash feedback; Rapier continues to compute collision impulses and vehicle recoil. No copyrighted Rocket League music or car assets are included. Exact Rocket League physics, production art and client prediction remain out of scope for this revision.

## Teams, bots and recovery

Choose **1v1, 2v2 or 3v3** before hosting. Seats alternate Blue/Orange, so four humans fill a 2v2 room and six fill a 3v3 room. A full room starts automatically. The host can also choose **Start with bots** when the number of empty seats is within the selected bot limit (0–5). Slots and teams are server controlled, and late joins are rejected once a match starts. A disconnect currently ends the room; reconnect and mid-match replacement remain follow-up work.

Practice supports **0–5 bots** plus the player. Selecting 2v2 presets three bots; 3v3 presets five. The bot selector can also create asymmetric practice games. Teammate bots select striker/support roles according to distance to the ball.

**Reset Car** on the HUD or **R** requests a reset to your team's half with zero velocity, cleared forces and a reset jump state. It works for upright cars stuck against scenery as well as flipped cars. A three-second server-enforced cooldown prevents repeated resets. Safe spawn candidates avoid the ball and other vehicles; the match score, timer and boost reserve are preserved.

This revision uses a lower GT coupe silhouette, integrated rear lip, less reflective glass, muted automotive colors and subtler turf contrast. The models remain original procedural assets, not photoreal scanned cars. Car-to-car crash rotation is briefly preserved instead of being overwritten immediately by steering correction. Floor/ramp contacts retain steering support. Exact Rocket League handling is not claimed.

## Mobile controls, fullscreen and installation

Phone UI uses dynamic viewport sizing, notch/home-indicator safe areas and a compact landscape HUD. Portrait gameplay shows rotation guidance and releases driving input; practice simulation pauses until landscape is restored. Menus and settings remain scrollable on short screens.

In **Settings → Phone controls**, choose **steering wheel**, **joystick**, **directional buttons** or **phone tilt**. Wheel and tilt use separate gas/brake pedals; the joystick controls both throttle and steering. **Jump, boost and slide remain independent multi-touch buttons**. Size and opacity are adjustable. Touches are cancelled on blur, resize and pointer cancellation to avoid stuck inputs.

Tilt requires a compatible orientation sensor and HTTPS (or localhost). Tap **Enable Tilt**, grant sensor permission if requested, then **Center Tilt** while holding the phone normally. Both landscape directions are mapped. If permission is denied or sensor data never arrives, steering arrows remain available. Simulated sensor tests do not replace testing real iOS/Android hardware.

The production build generates a versioned service worker and installable manifest with PNG icons. Eligible browsers show an install promotion; its Install button opens the browser's confirmation. iPhone users receive **Share → Add to Home Screen** instructions instead of a nonexistent one-click API. A **Fullscreen** button requests fullscreen and landscape locking when supported; browser/OS restrictions may reject either. The app also works in a normal browser tab.

After one successful online load/cache installation, **practice works offline**. Online rooms always need the match server. Service worker updates wait for the old app to close and do not force-reload a live match. Installation and production service workers require HTTPS outside localhost. Hosting must serve `manifest.webmanifest`, `/icons/` and `/sw.js` from the app origin; the supplied Node server does this.
