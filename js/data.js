// CS2 bind library.
// legal: "safe"       -> fine on Valve matchmaking (Premier / Competitive) and everywhere else
//        "restricted" -> more than one movement/attack action on one key. Since the
//                        19 Aug 2024 update Valve ignores these binds / may kick you on official
//                        servers. Use only on community servers or offline, and check your league rules.
//        "local"      -> needs sv_cheats or server control: offline practice / your own server only.
//
// Each bind: slots (one key each) -> cmd(params). aliases(params) are written before the binds.
// CS2 binds can't contain nested quotes, so anything that needs quotes goes through an alias.

window.CATEGORIES = [
  { id: "movement", name: "Movement" },
  { id: "utility", name: "Weapons & utility" },
  { id: "buy", name: "Buy binds" },
  { id: "comms", name: "Comms" },
  { id: "hud", name: "HUD & info" },
  { id: "audio", name: "Audio" },
  { id: "demo", name: "Demos" },
  { id: "practice", name: "Practice server" },
];

window.BINDS = [
  // ---------------- Movement ----------------
  {
    id: "bhop", cat: "movement", legal: "safe", on: true,
    name: "Bunny hop on mouse wheel",
    desc: "Scrolling sends many jump inputs, so timing the landing frame becomes easy. One input per wheel tick is a single action, so this one is allowed in matchmaking.",
    slots: [
      { label: "Wheel down", key: "mwheeldown", cmd: () => "+jump" },
      { label: "Wheel up", key: "mwheelup", cmd: () => "+jump" },
    ],
  },
  {
    id: "walkshoot", cat: "movement", legal: "restricted", on: false,
    name: "LMB walk + shoot",
    desc: "Holding fire also holds walk, so you slow down while spraying and taps are more accurate on the move. Combines attack and movement on one key.",
    aliases: () => [
      'alias "+walkshoot" "+attack; +sprint"',
      'alias "-walkshoot" "-attack; -sprint"',
    ],
    slots: [{ label: "Fire", key: "mouse1", cmd: () => "+walkshoot" }],
  },
  {
    id: "jumpthrow", cat: "movement", legal: "restricted", on: false,
    name: "Jump-throw",
    desc: "Releases the grenade on the jump tick for pixel-perfect lineups. Since 2024 a normal jump + release is sub-tick consistent, so you rarely need this.",
    aliases: () => [
      'alias "+jumpthrow" "+jump; -attack; -attack2"',
      'alias "-jumpthrow" "-jump"',
    ],
    slots: [{ label: "Jump-throw", key: "", cmd: () => "+jumpthrow" }],
  },
  {
    id: "runjumpthrow", cat: "movement", legal: "restricted", on: false,
    name: "Run + jump-throw",
    desc: "Runs forward and jump-throws in one press, for long-range smokes that need a run-up.",
    aliases: () => [
      'alias "+runthrow" "+forward; +jump; -attack; -attack2"',
      'alias "-runthrow" "-jump; -forward"',
    ],
    slots: [{ label: "Run-throw", key: "", cmd: () => "+runthrow" }],
  },
  {
    id: "crouchjump", cat: "movement", legal: "restricted", on: false,
    name: "Crouch-jump",
    desc: "Jumps and ducks together so you reach boost spots and crates that need a crouch-jump.",
    aliases: () => [
      'alias "+cjump" "+jump; +duck"',
      'alias "-cjump" "-jump; -duck"',
    ],
    slots: [{ label: "Crouch-jump", key: "", cmd: () => "+cjump" }],
  },
  {
    id: "duckwheel", cat: "movement", legal: "safe", on: false,
    name: "Crouch on mouse wheel",
    desc: "Fast duck taps from the wheel, useful for peeking over boxes and faking sounds. Pick this or the wheel-up bunny hop, not both.",
    slots: [{ label: "Wheel up", key: "mwheelup", cmd: () => "+duck" }],
  },
  {
    id: "holdwalk", cat: "movement", legal: "safe", on: false,
    name: "Walk on a side mouse button",
    desc: "A second walk key on the thumb button, so your left pinky stays free for crouch.",
    slots: [{ label: "Walk", key: "mouse5", cmd: () => "+sprint" }],
  },

  // ---------------- Weapons & utility ----------------
  {
    id: "nades", cat: "utility", legal: "safe", on: true,
    name: "One key per grenade",
    desc: "Pulls a specific grenade instead of cycling through them with 4. The single biggest time-saver in execs.",
    slots: [
      { label: "Smoke", key: "c", cmd: () => "slot8" },
      { label: "Flash", key: "mouse4", cmd: () => "slot7" },
      { label: "HE", key: "v", cmd: () => "slot6" },
      { label: "Molotov / incendiary", key: "x", cmd: () => "slot10" },
      { label: "Decoy", key: "", cmd: () => "slot9" },
    ],
  },
  {
    id: "zeus", cat: "utility", legal: "safe", on: false,
    name: "Quick Zeus",
    desc: "Pulls the taser straight away instead of scrolling past it.",
    slots: [{ label: "Zeus", key: "", cmd: () => "slot11" }],
  },
  {
    id: "dropbomb", cat: "utility", legal: "safe", on: false,
    name: "Drop the bomb",
    desc: "Switches to the C4 and drops it in one press. Handy for passing the bomb to your entry. If you aren't carrying the bomb it drops the gun in your hands, so only press it when you are.",
    aliases: () => ['alias "dropc4" "slot5; drop"'],
    slots: [{ label: "Drop C4", key: "j", cmd: () => "dropc4" }],
  },
  {
    id: "switchhands", cat: "utility", legal: "safe", on: false,
    name: "Switch weapon hand",
    desc: "Flips your viewmodel left/right, so the gun doesn't block the angle you hold. Works mid-round.",
    slots: [{ label: "Switch hands", key: "h", cmd: () => "switchhands" }],
  },
  {
    id: "teamequip", cat: "utility", legal: "safe", on: true,
    name: "Hold to show team equipment",
    desc: "Shows teammates' utility and health above their heads while held, so you can plan who throws what.",
    slots: [{ label: "Show equipment", key: "capslock", cmd: () => "+cl_show_team_equipment" }],
  },

  // ---------------- Comms ----------------
  {
    id: "voicetoggle", cat: "comms", legal: "safe", on: true,
    name: "Voice chat on/off",
    desc: "Silences all incoming voice in one press during a clutch, and turns it back on after.",
    slots: [{ label: "Toggle voice", key: "p", cmd: () => "toggle voice_enable 0 1" }],
  },
  {
    id: "muteenemy", cat: "comms", legal: "safe", on: false,
    name: "Mute enemy team",
    desc: "Toggles the enemy team's voice and text chat, which stops trash talk before it tilts you.",
    slots: [{ label: "Toggle", key: "o", cmd: () => "toggle cl_mute_enemy_team 0 1" }],
  },
  {
    id: "mutestrangers", cat: "comms", legal: "safe", on: false,
    name: "Mute everyone except friends",
    desc: "Only friends and party members can be heard, a fast fix for a toxic lobby.",
    slots: [{ label: "Toggle", key: "l", cmd: () => "toggle cl_mute_all_but_friends_and_party 0 1" }],
  },
  {
    id: "quickchat", cat: "comms", legal: "safe", on: false,
    name: "Quick chat messages",
    desc: "One-key messages for the start and end of the match. Edit the text to taste.",
    params: [
      { id: "m1", label: "Message 1", value: "gl hf" },
      { id: "m2", label: "Message 2", value: "gg wp" },
      { id: "m3", label: "Team message", value: "saving, no buy" },
    ],
    aliases: (p) => [
      `alias "qmsg1" "say ${clean(p.m1)}"`,
      `alias "qmsg2" "say ${clean(p.m2)}"`,
      `alias "qmsg3" "say_team ${clean(p.m3)}"`,
    ],
    slots: [
      { label: "Message 1", key: "f4", cmd: () => "qmsg1" },
      { label: "Message 2", key: "f5", cmd: () => "qmsg2" },
      { label: "Team message", key: "", cmd: () => "qmsg3" },
    ],
  },

  // ---------------- HUD & info ----------------
  {
    id: "radarzoom", cat: "hud", legal: "safe", on: true,
    name: "Hold to zoom out radar",
    desc: "Keeps a close radar for detail and shows the whole map while held.",
    params: [
      { id: "normal", label: "Normal scale", value: "0.7", type: "number", step: "0.05" },
      { id: "zoomed", label: "Zoomed-out scale", value: "0.3", type: "number", step: "0.05" },
    ],
    aliases: (p) => [
      `alias "+radarzoom" "cl_radar_scale ${num(p.zoomed)}"`,
      `alias "-radarzoom" "cl_radar_scale ${num(p.normal)}"`,
    ],
    slots: [{ label: "Hold", key: "alt", cmd: () => "+radarzoom" }],
  },
  {
    id: "scoreradar", cat: "hud", legal: "safe", on: false,
    name: "Full radar with scoreboard",
    desc: "Holding Tab also zooms the radar all the way out, so one glance shows economy and positions.",
    params: [
      { id: "normal", label: "Normal scale", value: "0.7", type: "number", step: "0.05" },
      { id: "zoomed", label: "Zoomed-out scale", value: "0.25", type: "number", step: "0.05" },
    ],
    aliases: (p) => [
      `alias "+scoreradar" "+showscores; cl_radar_scale ${num(p.zoomed)}"`,
      `alias "-scoreradar" "-showscores; cl_radar_scale ${num(p.normal)}"`,
    ],
    slots: [{ label: "Scoreboard", key: "tab", cmd: () => "+scoreradar" }],
  },
  {
    id: "lineupcross", cat: "hud", legal: "safe", on: false,
    name: "Hold for lineup crosshair",
    desc: "Stretches your crosshair across the screen while held, so lining up smokes against map edges is much easier.",
    params: [{ id: "size", label: "Your normal size", value: "2", type: "number", step: "0.5" }],
    aliases: (p) => [
      'alias "+lineup" "cl_crosshairsize 1000"',
      `alias "-lineup" "cl_crosshairsize ${num(p.size)}"`,
    ],
    slots: [{ label: "Hold", key: "n", cmd: () => "+lineup" }],
  },
  {
    id: "fps", cat: "hud", legal: "safe", on: false,
    name: "FPS counter on/off",
    desc: "Shows frame rate in the corner when you're checking performance.",
    slots: [{ label: "Toggle", key: "f9", cmd: () => "toggle cl_showfps 0 1" }],
  },
  {
    id: "cleanhud", cat: "hud", legal: "safe", on: false,
    name: "Clean HUD",
    desc: "Hides everything except the kill feed. Good for clips and screenshots.",
    slots: [{ label: "Toggle", key: "f10", cmd: () => "toggle cl_draw_only_deathnotices 0 1" }],
  },
  {
    id: "recoilcross", cat: "hud", legal: "safe", on: false,
    name: "Recoil-following crosshair",
    desc: "Toggles a crosshair that follows the spray pattern, which helps when you're learning spray control.",
    slots: [{ label: "Toggle", key: "", cmd: () => "toggle cl_crosshair_recoil 0 1" }],
  },

  // ---------------- Audio ----------------
  {
    id: "volume", cat: "audio", legal: "safe", on: true,
    name: "Volume up / down",
    desc: "Changes master volume in 10% steps without opening settings.",
    slots: [
      { label: "Volume up", key: "kp_plus", cmd: () => "incrementvar volume 0 1 0.1" },
      { label: "Volume down", key: "kp_minus", cmd: () => "incrementvar volume 0 1 -0.1" },
    ],
  },
  {
    id: "volumeduck", cat: "audio", legal: "safe", on: false,
    name: "Hold to lower game volume",
    desc: "Drops game volume while held so you can hear a teammate's call over a firefight.",
    params: [
      { id: "normal", label: "Normal volume", value: "0.5", type: "number", step: "0.05" },
      { id: "low", label: "Lowered volume", value: "0.1", type: "number", step: "0.05" },
    ],
    aliases: (p) => [
      `alias "+quiet" "volume ${num(p.low)}"`,
      `alias "-quiet" "volume ${num(p.normal)}"`,
    ],
    slots: [{ label: "Hold", key: "", cmd: () => "+quiet" }],
  },

  // ---------------- Demos ----------------
  {
    id: "demo", cat: "demo", legal: "safe", on: false,
    name: "Demo review keys",
    desc: "Open the demo controls, pause and fast-forward while you watch your own games back. These only do something in a demo.",
    slots: [
      { label: "Demo controls", key: "f6", cmd: () => "demoui" },
      { label: "Pause / play", key: "f7", cmd: () => "demo_togglepause" },
      { label: "Speed 1x / 4x", key: "f8", cmd: () => "toggle demo_timescale 1 4" },
      { label: "Slow motion 0.25x", key: "", cmd: () => "demo_timescale 0.25" },
    ],
  },

  // ---------------- Practice ----------------
  {
    id: "pracexec", cat: "practice", legal: "local", on: false,
    name: "Load practice settings",
    desc: "Runs practice.cfg (included in your download): infinite ammo and money, buy anywhere, 60-minute rounds, grenade trajectories and impacts, no bots.",
    slots: [{ label: "Load practice", key: "f3", cmd: () => "exec practice" }],
  },
  {
    id: "noclip", cat: "practice", legal: "local", on: false,
    name: "Noclip",
    desc: "Fly through walls to get to lineup spots fast.",
    slots: [{ label: "Noclip", key: "f1", cmd: () => "noclip" }],
  },
  {
    id: "rethrow", cat: "practice", legal: "local", on: false,
    name: "Re-throw last grenade",
    desc: "Throws your last grenade again from the same spot, so you can watch where it lands from the other side.",
    slots: [{ label: "Re-throw", key: "f2", cmd: () => "sv_rethrow_last_grenade" }],
  },
  {
    id: "givenades", cat: "practice", legal: "local", on: false,
    name: "Give all grenades",
    desc: "Fills your utility slots for lineup practice.",
    aliases: () => ['alias "givenades" "give weapon_smokegrenade; give weapon_flashbang; give weapon_hegrenade; give weapon_molotov; give weapon_decoy"'],
    slots: [{ label: "Give", key: "", cmd: () => "givenades" }],
  },
  {
    id: "botplace", cat: "practice", legal: "local", on: false,
    name: "Place a bot where you aim",
    desc: "Drops a bot at your crosshair, for practising pre-aims and checking flash coverage.",
    slots: [{ label: "Place bot", key: "", cmd: () => "bot_place" }],
  },
];

// Buy binds: items use the console names of the CS2 buy command.
// Buying both sides' rifle (ak47 + m4a1) is fine: you only get the one your team can buy.
window.BUY_ITEMS = [
  { group: "Rifles", items: [["ak47", "AK-47"], ["m4a1", "M4A4"], ["m4a1_silencer", "M4A1-S"], ["galilar", "Galil AR"], ["famas", "FAMAS"], ["sg556", "SG 553"], ["aug", "AUG"]] },
  { group: "Snipers", items: [["awp", "AWP"], ["ssg08", "SSG 08"]] },
  { group: "SMGs", items: [["mac10", "MAC-10"], ["mp9", "MP9"], ["mp7", "MP7"], ["ump45", "UMP-45"], ["p90", "P90"]] },
  { group: "Pistols", items: [["deagle", "Desert Eagle"], ["p250", "P250"], ["tec9", "Tec-9"], ["fiveseven", "Five-SeveN"], ["cz75a", "CZ75-Auto"], ["elite", "Dual Berettas"]] },
  { group: "Gear", items: [["vesthelm", "Kevlar + helmet"], ["vest", "Kevlar"], ["defuser", "Defuse kit"], ["taser", "Zeus"]] },
  { group: "Grenades", items: [["smokegrenade", "Smoke"], ["flashbang", "Flash"], ["hegrenade", "HE"], ["molotov", "Molotov (T)"], ["incgrenade", "Incendiary (CT)"], ["decoy", "Decoy"]] },
];

window.BUY_PRESETS = [
  { id: "buy_rifle", name: "Full rifle buy", key: "kp_end", on: true, items: ["ak47", "m4a1", "vesthelm", "defuser", "smokegrenade", "flashbang", "molotov", "incgrenade"] },
  { id: "buy_awp", name: "AWP buy", key: "kp_downarrow", on: true, items: ["awp", "vesthelm", "defuser", "flashbang", "smokegrenade"] },
  { id: "buy_force", name: "Force buy", key: "kp_pgdn", on: true, items: ["galilar", "famas", "vest"] },
  { id: "buy_smg", name: "SMG buy", key: "kp_leftarrow", on: false, items: ["mac10", "mp9", "vesthelm"] },
  { id: "buy_pistol", name: "Pistol round", key: "kp_5", on: true, items: ["vest", "flashbang"] },
  { id: "buy_nades", name: "Grenade pack", key: "kp_rightarrow", on: true, items: ["smokegrenade", "flashbang", "hegrenade", "molotov", "incgrenade"] },
  { id: "buy_armor", name: "Armour + kit", key: "kp_home", on: true, items: ["vesthelm", "defuser"] },
  { id: "buy_eco", name: "Eco upgrade pistol", key: "", on: false, items: ["p250"] },
];

// Settings written as plain console variables.
window.SETTINGS = [
  { group: "Mouse", items: [
    { id: "sensitivity", label: "Sensitivity", value: "1.25", type: "number", step: "0.01", on: false, desc: "Your in-game sensitivity." },
    { id: "zoom_sensitivity_ratio", label: "Scoped sensitivity ratio", value: "1.0", type: "number", step: "0.01", on: false, desc: "Relative sensitivity while scoped." },
  ]},
  { group: "Gameplay", items: [
    { id: "cl_autowepswitch", label: "Auto-switch to picked-up weapons", value: "0", type: "bool", on: true, desc: "Off stops you switching to a gun you walk over mid-fight." },
    { id: "cl_use_opens_buy_menu", label: "E opens buy menu in buy zone", value: "0", type: "bool", on: true, desc: "Off stops the buy menu opening when you try to pick up or defuse." },
    { id: "cl_crosshair_recoil", label: "Crosshair follows recoil", value: "0", type: "bool", on: false, desc: "Shows where the spray will land." },
    { id: "fps_max", label: "FPS limit", value: "0", type: "number", step: "1", on: false, desc: "0 removes the cap. Capping slightly below your average gives steadier frame times." },
  ]},
  { group: "Radar", items: [
    { id: "cl_radar_always_centered", label: "Keep radar centred on you", value: "0", type: "bool", on: true, desc: "Off shows more of the map ahead of you near map edges." },
    { id: "cl_radar_scale", label: "Radar zoom", value: "0.7", type: "number", step: "0.05", on: true, desc: "Lower shows more map." },
    { id: "cl_hud_radar_scale", label: "Radar size on screen", value: "1.15", type: "number", step: "0.05", on: true, desc: "Bigger radar is easier to read." },
    { id: "cl_radar_square_with_scoreboard", label: "Square radar with scoreboard", value: "1", type: "bool", on: true, desc: "Shows the whole map when Tab is held." },
  ]},
  { group: "Viewmodel", items: [
    { id: "viewmodel_fov", label: "Viewmodel FOV", value: "68", type: "number", step: "1", on: false, desc: "54 to 68. Higher pushes the gun away from the centre." },
    { id: "viewmodel_offset_x", label: "Offset X", value: "2.5", type: "number", step: "0.5", on: false, desc: "-2.5 to 2.5." },
    { id: "viewmodel_offset_y", label: "Offset Y", value: "0", type: "number", step: "0.5", on: false, desc: "-2 to 2." },
    { id: "viewmodel_offset_z", label: "Offset Z", value: "-1.5", type: "number", step: "0.5", on: false, desc: "-2 to 2." },
  ]},
  { group: "Sound", items: [
    { id: "snd_menumusic_volume", label: "Menu music", value: "0", type: "number", step: "0.05", on: true, desc: "" },
    { id: "snd_roundstart_volume", label: "Round start music", value: "0", type: "number", step: "0.05", on: true, desc: "Quieter start means you hear the first footsteps." },
    { id: "snd_roundend_volume", label: "Round end music", value: "0", type: "number", step: "0.05", on: true, desc: "" },
    { id: "snd_mvp_volume", label: "MVP music", value: "0", type: "number", step: "0.05", on: true, desc: "" },
    { id: "snd_deathcamera_volume", label: "Death camera music", value: "0", type: "number", step: "0.05", on: true, desc: "" },
    { id: "snd_mapobjective_volume", label: "Bomb / hostage music", value: "0", type: "number", step: "0.05", on: true, desc: "The beep still plays; only the music goes." },
    { id: "snd_tensecondwarning_volume", label: "10-second warning", value: "0.3", type: "number", step: "0.05", on: true, desc: "Keep this audible: it tells you when to stop the defuse fake." },
  ]},
];

window.PRACTICE_CFG = [
  "sv_cheats 1",
  "mp_limitteams 0",
  "mp_autoteambalance 0",
  "mp_freezetime 0",
  "mp_roundtime 60",
  "mp_roundtime_defuse 60",
  "mp_buy_anywhere 1",
  "mp_buytime 9999",
  "mp_maxmoney 60000",
  "mp_startmoney 60000",
  "mp_respawn_on_death_ct 1",
  "mp_respawn_on_death_t 1",
  "sv_infinite_ammo 1",
  "ammo_grenade_limit_total 5",
  "sv_grenade_trajectory_prac_pipreview 1",
  "sv_showimpacts 1",
  "sv_showimpacts_time 10",
  "bot_kick",
  "mp_warmup_end",
  "mp_restartgame 1",
  'echo "Practice settings loaded"',
];

// CS2 default binds, used to warn when you replace one.
window.DEFAULT_KEYS = {
  w: "Move forward", a: "Move left", s: "Move back", d: "Move right",
  space: "Jump", ctrl: "Crouch", shift: "Walk", e: "Use", r: "Reload",
  q: "Last weapon", g: "Drop weapon", b: "Buy menu", tab: "Scoreboard",
  1: "Primary", 2: "Secondary", 3: "Knife", 4: "Grenades", 5: "Bomb",
  f: "Inspect", t: "Spray", y: "All chat", u: "Team chat", z: "Chat wheel",
  mouse1: "Fire", mouse2: "Scope / alt fire", mouse3: "Ping", "`": "Console",
  mwheelup: "Previous weapon", mwheeldown: "Next weapon",
};

function clean(s) { return String(s || "").replace(/["';]/g, "").trim(); }
function num(s) { const n = parseFloat(s); return Number.isFinite(n) ? String(n) : "0"; }
