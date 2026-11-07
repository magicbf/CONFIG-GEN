# CS2 Config Generator

A static web page that builds a Counter-Strike 2 `autoexec.cfg`. Pick binds from the library, set keys by pressing them, see every bound key on a keyboard and mouse map (clashes show in red), then download or copy the file.

Open `index.html` in a browser. There's no build step and no server. Your choices are saved in the browser's local storage.

## What's in it

- **Movement:** bunny hop on the mouse wheel, crouch on the wheel, walk on a side button, LMB walk + shoot, jump-throw, run + jump-throw, crouch-jump
- **Weapons and utility:** one key per grenade, quick Zeus, drop bomb, switch weapon hand, hold to show team equipment
- **Buy binds:** 8 editable loadouts on the numpad (full rifle, AWP, force, SMG, pistol round, grenade pack, armour + kit, eco), with a chip picker for every buyable item
- **Comms:** voice on/off, mute enemy team, mute everyone except friends, editable quick chat messages
- **HUD:** hold to zoom out radar, full radar with the scoreboard, hold for a lineup crosshair, FPS counter, clean HUD, recoil crosshair
- **Audio:** volume up/down, hold to lower game volume
- **Demos:** demo controls, pause, 1x/4x speed, slow motion
- **Practice server:** a separate `practice.cfg` (infinite ammo and money, buy anywhere, grenade trajectories, impacts), noclip, re-throw last grenade, give all grenades, place a bot
- **Settings:** sensitivity, auto weapon switch, the E-opens-buy-menu fix, radar, viewmodel, and music volumes
- **Your own binds:** any key, any console command

## Which binds are allowed

Every bind has a label:

| Label | Meaning |
| --- | --- |
| Matchmaking safe | Works on Valve servers and everywhere else. |
| Blocked on Valve servers | Puts more than one movement or attack action on one key. Since the 19 August 2024 update, Valve ignores these binds on official servers and may kick you for them. They still work on community servers and offline. Check your league's or platform's rules before using them there. |
| Practice only | Needs `sv_cheats`, so it only works offline or on a server you control. |

Matchmaking-safe mode (on by default) leaves the blocked binds out of the file. Snap Tap and null binds aren't offered at all.

## Install the config

1. Put `autoexec.cfg` (and `practice.cfg`, if you use it) in `Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/cfg/`.
2. In Steam, open Counter-Strike 2 > Properties and add `+exec autoexec` to Launch options.
3. To reload while the game is running, type `exec autoexec` in the console.
