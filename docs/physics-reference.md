# Physics reference and implementation boundaries

Measurements were checked against primary projects that interface with or simulate Rocket League:

- [RLBot useful game values](https://wiki.rlbot.org/v5/botmaking/useful-game-values/): arena and goal dimensions, pad layout, gravity, speeds, masses, boost and steering curvature.
- [RLBot jumping physics](https://wiki.rlbot.org/v4/botmaking/jumping-physics/): approximately 292 uu jump impulse, up to 0.2 seconds of hold bonus and local forward acceleration in the air.
- [RLGym common values](https://github.com/RLGym/rlgym/blob/main/rlgym/rocket_league/common_values.py): 2044 uu ceiling, tick rate, pad timings and physical constants.
- [Official DFH Stadium imagery](https://www.rocketleague.com/news/celebrate-10-years-of-aerials-and-epic-saves-in-rocket-league-season-19): visual inspiration for enclosed stands, roof structure, goals and field scale.
- [Rapier vehicle controller](https://rapier.rs/docs/user_guides/javascript/vehicle_controller/): actual chassis/suspension implementation API.

The engine uses meters; 100 Rocket League uu map to one meter. RLBot reports a 2048 uu ceiling, while RLGym reports 2044; this project uses 2044.

Matching measured constants does not recreate the original physics engine. Differences include:

- Four Rapier wheel raycasts, tuned suspension and an arcade angular correction to follow surface normals; these do not reproduce the original suspension solver or inertia tensor.
- Analytic circular wall fillets and polygon corners, rather than the original arena collision mesh. Goal interiors currently use straight box walls and roofs.
- Rapier collision impulses and friction, rather than the original game's additional ball-hit response curves.
- Approximate directional flip, air torque and grip. No flip cancellation, wavedash tuning, demolition system or exact car-specific hitboxes.
- Server snapshot smoothing without client-side prediction or rollback. WAN latency requires further testing and tuning.

Future accuracy work should capture repeatable acceleration, steering, jump, wall-entry and ball-contact trajectories, compare them to measured reference trajectories, and tune one variable at a time. A visually similar arena alone does not establish physics parity.
