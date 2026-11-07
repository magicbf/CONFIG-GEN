(function () {
  "use strict";

  const STORE_KEY = "cs2-config-gen:v1";
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(kid));
    return n;
  };

  const LEGAL = {
    safe: { label: "Matchmaking safe", short: "Safe", hint: "Works on Valve servers and everywhere else." },
    restricted: { label: "Blocked on Valve servers", short: "Restricted", hint: "Puts more than one movement or attack action on one key. Valve ignores these binds on official servers and may kick you. Use on community servers or offline, and check your league's rules." },
    local: { label: "Practice only", short: "Practice", hint: "Needs sv_cheats, so it only works offline or on a server you control." },
  };

  // ---------- state ----------
  function defaultState() {
    const s = { mmSafe: true, binds: {}, buys: {}, settings: {}, custom: [] };
    for (const b of BINDS) {
      s.binds[b.id] = {
        on: b.on,
        keys: b.slots.map((sl) => sl.key),
        params: Object.fromEntries((b.params || []).map((p) => [p.id, p.value])),
      };
    }
    for (const p of BUY_PRESETS) s.buys[p.id] = { on: p.on, key: p.key, items: p.items.slice(), name: p.name };
    for (const g of SETTINGS) for (const it of g.items) s.settings[it.id] = { on: it.on, value: it.value };
    return s;
  }

  function loadState() {
    const base = defaultState();
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return base;
      const saved = JSON.parse(raw);
      base.mmSafe = saved.mmSafe !== false;
      for (const id in base.binds) if (saved.binds && saved.binds[id]) {
        const sb = saved.binds[id], bb = base.binds[id];
        bb.on = !!sb.on;
        if (Array.isArray(sb.keys) && sb.keys.length === bb.keys.length) bb.keys = sb.keys.map(String);
        Object.assign(bb.params, sb.params || {});
      }
      for (const id in base.buys) if (saved.buys && saved.buys[id]) Object.assign(base.buys[id], saved.buys[id]);
      for (const id in base.settings) if (saved.settings && saved.settings[id]) Object.assign(base.settings[id], saved.settings[id]);
      if (Array.isArray(saved.custom)) base.custom = saved.custom.filter((c) => c && typeof c === "object");
      return base;
    } catch (e) { return base; }
  }

  let state = loadState();
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ } }

  const bindDef = Object.fromEntries(BINDS.map((b) => [b.id, b]));
  const buyLabel = Object.fromEntries(BUY_ITEMS.flatMap((g) => g.items));

  function isActive(id) {
    const b = bindDef[id];
    return state.binds[id].on && !(state.mmSafe && b.legal === "restricted");
  }

  // ---------- assignments: every key that ends up bound ----------
  function assignments() {
    const list = [];
    for (const b of BINDS) {
      if (!isActive(b.id)) continue;
      const st = state.binds[b.id];
      b.slots.forEach((sl, i) => {
        const key = normKey(st.keys[i]);
        if (key) list.push({ key, cmd: sl.cmd(st.params), what: b.slots.length > 1 ? `${sl.label} (${b.name})` : b.name, legal: b.legal, src: b.id });
      });
    }
    for (const p of BUY_PRESETS) {
      const st = state.buys[p.id];
      const key = normKey(st.key);
      if (st.on && key && st.items.length) list.push({ key, cmd: st.items.map((i) => "buy " + i).join("; "), what: st.name || p.name, legal: "safe", src: p.id });
    }
    state.custom.forEach((c, i) => {
      const key = normKey(c.key);
      const cmd = String(c.cmd || "").replace(/"/g, "").trim();
      if (c.on !== false && key && cmd) list.push({ key, cmd, what: "Custom: " + cmd, legal: "safe", src: "custom" + i });
    });
    return list;
  }

  function normKey(k) { return String(k || "").trim().toLowerCase().replace(/"/g, ""); }

  // ---------- cfg generation ----------
  function buildCfg() {
    const out = [];
    const a = assignments();
    out.push("// autoexec.cfg — made with CS2 Config Generator");
    out.push("// Put this file in: Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/cfg/");
    out.push("// Steam > CS2 > Properties > Launch options: +exec autoexec");
    out.push("");

    const setLines = [];
    for (const g of SETTINGS) for (const it of g.items) {
      const st = state.settings[it.id];
      if (st.on) setLines.push(`${it.id} "${it.type === "bool" ? (st.value === "1" ? "1" : "0") : num(st.value)}"`);
    }
    if (setLines.length) out.push("// ---- Settings ----", ...setLines, "");

    const aliasLines = [];
    for (const b of BINDS) if (isActive(b.id) && b.aliases) {
      const st = state.binds[b.id];
      if (st.keys.some((k) => normKey(k))) aliasLines.push(...b.aliases(st.params));
    }
    if (aliasLines.length) out.push("// ---- Aliases ----", ...aliasLines, "");

    if (a.length) {
      out.push("// ---- Binds ----");
      let lastSrc = null;
      for (const x of a) {
        if (x.src !== lastSrc && !x.src.startsWith("custom")) out.push(`// ${x.what.replace(/^.*\((.*)\)$/, "$1")}${x.legal === "restricted" ? "  [blocked on Valve servers]" : x.legal === "local" ? "  [practice only]" : ""}`);
        else if (x.src.startsWith("custom") && !(lastSrc || "").startsWith("custom")) out.push("// Custom");
        lastSrc = x.src;
        out.push(`bind "${x.key}" "${x.cmd}"`);
      }
      out.push("");
    }
    out.push('echo "autoexec.cfg loaded"');
    return out.join("\n");
  }

  function buildPracticeCfg() {
    return ["// practice.cfg — offline / own server only. Load with: exec practice", ...PRACTICE_CFG].join("\n");
  }

  // ---------- conflicts ----------
  function keyMap() {
    const m = {};
    for (const x of assignments()) (m[x.key] = m[x.key] || []).push(x);
    return m;
  }

  // ---------- keyboard map ----------
  const KB_ROWS = [
    [["escape", "Esc"], [null, "", 0.6], ["f1", "F1"], ["f2", "F2"], ["f3", "F3"], ["f4", "F4"], [null, "", 0.4], ["f5", "F5"], ["f6", "F6"], ["f7", "F7"], ["f8", "F8"], [null, "", 0.4], ["f9", "F9"], ["f10", "F10"], ["f11", "F11"], ["f12", "F12"]],
    [["`", "`"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["0", "0"], ["-", "-"], ["=", "="], ["backspace", "Back", 2]],
    [["tab", "Tab", 1.5], ["q", "Q"], ["w", "W"], ["e", "E"], ["r", "R"], ["t", "T"], ["y", "Y"], ["u", "U"], ["i", "I"], ["o", "O"], ["p", "P"], ["[", "["], ["]", "]"], ["\\", "\\", 1.5]],
    [["capslock", "Caps", 1.75], ["a", "A"], ["s", "S"], ["d", "D"], ["f", "F"], ["g", "G"], ["h", "H"], ["j", "J"], ["k", "K"], ["l", "L"], ["semicolon", ";"], ["'", "'"], ["enter", "Enter", 2.25]],
    [["shift", "Shift", 2.25], ["z", "Z"], ["x", "X"], ["c", "C"], ["v", "V"], ["b", "B"], ["n", "N"], ["m", "M"], [",", ","], [".", "."], ["/", "/"], ["rshift", "Shift", 2.75]],
    [["ctrl", "Ctrl", 1.5], [null, "", 1], ["alt", "Alt", 1.5], ["space", "Space", 6], ["ralt", "Alt", 1.5], [null, "", 1], ["rctrl", "Ctrl", 1.5]],
  ];
  const NUMPAD = [
    ["kp_slash", "/", 1, 1, 2], ["kp_multiply", "*", 1, 2, 2], ["kp_minus", "-", 1, 3, 2], ["numlock", "Num", 1, 0, 2],
    ["kp_home", "7", 1, 0, 3], ["kp_uparrow", "8", 1, 1, 3], ["kp_pgup", "9", 1, 2, 3], ["kp_plus", "+", 2, 3, 3],
    ["kp_leftarrow", "4", 1, 0, 4], ["kp_5", "5", 1, 1, 4], ["kp_rightarrow", "6", 1, 2, 4],
    ["kp_end", "1", 1, 0, 5], ["kp_downarrow", "2", 1, 1, 5], ["kp_pgdn", "3", 1, 2, 5], ["kp_enter", "Ent", 2, 3, 5],
    ["kp_ins", "0", 1, 0, 6, 2], ["kp_del", ".", 1, 2, 6],
  ];
  const MOUSE_KEYS = ["mouse1", "mouse2", "mouse3", "mwheelup", "mwheeldown", "mouse4", "mouse5"];

  let selectedKey = null;

  function keyClass(key, map) {
    const list = map[key];
    if (!list) return DEFAULT_KEYS[key] ? "k k-default" : "k";
    let cls = "k k-bound";
    if (list.length > 1) cls += " k-conflict";
    else if (list[0].legal === "restricted") cls += " k-restricted";
    else if (list[0].legal === "local") cls += " k-local";
    if (selectedKey === key) cls += " k-selected";
    return cls;
  }

  function keyButton(key, label, map, style) {
    if (!key) return el("span", { class: "k-gap", style, "aria-hidden": "true" });
    const list = map[key];
    const title = list ? list.map((x) => x.what).join(", ") : DEFAULT_KEYS[key] ? `CS2 default: ${DEFAULT_KEYS[key]}` : "Unbound";
    return el("button", {
      type: "button", class: keyClass(key, map), style,
      title: `${key}: ${title}`, "aria-label": `${label || key}: ${title}`,
      onclick: () => { selectedKey = selectedKey === key ? null : key; renderMap(); },
    }, el("span", { class: "k-label", text: label }));
  }

  function renderMap() {
    const map = keyMap();
    const kb = el("div", { class: "kb-main" });
    for (const row of KB_ROWS) {
      kb.append(el("div", { class: "kb-row" }, row.map(([key, label, w = 1]) => keyButton(key, label, map, `--w:${w}`))));
    }
    const np = el("div", { class: "kb-num" });
    for (const [key, label, h, col, row, w = 1] of NUMPAD) {
      np.append(keyButton(key, label, map, `grid-column:${col + 1} / span ${w};grid-row:${row - 1} / span ${h}`));
    }
    const mouse = el("div", { class: "mouse", "aria-label": "Mouse" },
      el("div", { class: "mouse-top" },
        keyButton("mouse1", "M1", map, ""),
        el("div", { class: "mouse-wheel" }, keyButton("mwheelup", "▲", map, ""), keyButton("mouse3", "M3", map, ""), keyButton("mwheeldown", "▼", map, "")),
        keyButton("mouse2", "M2", map, "")),
      el("div", { class: "mouse-side" }, keyButton("mouse5", "M5", map, ""), keyButton("mouse4", "M4", map, "")),
    );
    const board = $("#kb");
    board.replaceChildren(el("div", { class: "kb-wrap" }, kb, np, mouse));

    // info line
    const info = $("#kb-info");
    const offMap = Object.keys(map).filter((k) => !document.querySelector(`#kb [title^="${CSS.escape(k)}:"]`));
    if (selectedKey) {
      const list = map[selectedKey];
      info.replaceChildren(
        el("strong", { text: selectedKey }), " ",
        list ? list.map((x) => `${x.what} → ${x.cmd}`).join("  |  ") : DEFAULT_KEYS[selectedKey] ? `CS2 default: ${DEFAULT_KEYS[selectedKey]}. Nothing in your config changes it.` : "Nothing bound here.",
      );
    } else {
      const conflicts = Object.entries(map).filter(([, l]) => l.length > 1);
      const total = Object.keys(map).length;
      info.replaceChildren(
        `${total} key${total === 1 ? "" : "s"} bound. `,
        conflicts.length ? el("span", { class: "warn", text: `${conflicts.length} key${conflicts.length === 1 ? " has" : "s have"} more than one bind: ${conflicts.map(([k]) => k).join(", ")}. The last one in the file wins.` }) : "No key clashes.",
        offMap.length ? ` Also bound off the map: ${offMap.join(", ")}.` : "",
        " Select a key to see what it does.",
      );
    }
  }

  // ---------- key capture ----------
  const CODE_MAP = {
    Space: "space", Tab: "tab", CapsLock: "capslock", ShiftLeft: "shift", ShiftRight: "rshift",
    ControlLeft: "ctrl", ControlRight: "rctrl", AltLeft: "alt", AltRight: "ralt", Enter: "enter",
    Backspace: "backspace", Backquote: "`", Minus: "-", Equal: "=", BracketLeft: "[", BracketRight: "]",
    Semicolon: "semicolon", Quote: "'", Comma: ",", Period: ".", Slash: "/", Backslash: "\\",
    Insert: "ins", Delete: "del", Home: "home", End: "end", PageUp: "pgup", PageDown: "pgdn",
    ArrowUp: "uparrow", ArrowDown: "downarrow", ArrowLeft: "leftarrow", ArrowRight: "rightarrow",
    Numpad0: "kp_ins", Numpad1: "kp_end", Numpad2: "kp_downarrow", Numpad3: "kp_pgdn", Numpad4: "kp_leftarrow",
    Numpad5: "kp_5", Numpad6: "kp_rightarrow", Numpad7: "kp_home", Numpad8: "kp_uparrow", Numpad9: "kp_pgup",
    NumpadDecimal: "kp_del", NumpadAdd: "kp_plus", NumpadSubtract: "kp_minus", NumpadMultiply: "kp_multiply",
    NumpadDivide: "kp_slash", NumpadEnter: "kp_enter", NumLock: "numlock", Pause: "pause",
  };
  function codeToKey(code) {
    if (CODE_MAP[code]) return CODE_MAP[code];
    let m;
    if ((m = code.match(/^Key([A-Z])$/))) return m[1].toLowerCase();
    if ((m = code.match(/^Digit(\d)$/))) return m[1];
    if ((m = code.match(/^F(\d{1,2})$/))) return "f" + m[1];
    return null;
  }

  function capture(onKey) {
    const overlay = $("#capture");
    overlay.hidden = false;
    $("#capture-msg").textContent = "Press a key, click a mouse button or scroll. Esc cancels.";
    let armed = false;
    setTimeout(() => (armed = true), 150);
    const done = (key) => {
      overlay.hidden = true;
      window.removeEventListener("keydown", kd, true);
      overlay.removeEventListener("mousedown", md, true);
      overlay.removeEventListener("wheel", wh, true);
      overlay.removeEventListener("contextmenu", cm, true);
      if (key) onKey(key);
    };
    const kd = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (e.code === "Escape") return done(null);
      const k = codeToKey(e.code);
      if (k) done(k); else $("#capture-msg").textContent = `That key (${e.code}) can't be captured. Type its CS2 name in the box instead.`;
    };
    const md = (e) => { e.preventDefault(); if (!armed) return; done(["mouse1", "mouse3", "mouse2", "mouse4", "mouse5"][e.button] || null); };
    const wh = (e) => { e.preventDefault(); if (!armed) return; done(e.deltaY < 0 ? "mwheelup" : "mwheeldown"); };
    const cm = (e) => e.preventDefault();
    window.addEventListener("keydown", kd, true);
    overlay.addEventListener("mousedown", md, true);
    overlay.addEventListener("wheel", wh, { capture: true, passive: false });
    overlay.addEventListener("contextmenu", cm, true);
  }

  function keyField(value, onChange, label) {
    const input = el("input", {
      class: "key-input", value: value || "", placeholder: "unbound", spellcheck: "false", autocomplete: "off",
      "aria-label": `Key for ${label}`,
      onchange: (e) => onChange(normKey(e.target.value)),
    });
    const warn = el("span", { class: "key-note" });
    const setWarn = (k) => { warn.textContent = k && DEFAULT_KEYS[k] ? `replaces ${DEFAULT_KEYS[k]}` : ""; };
    setWarn(normKey(value));
    return el("span", { class: "key-field" },
      input,
      el("button", { type: "button", class: "btn-mini", title: "Press the key you want", onclick: () => capture((k) => { input.value = k; setWarn(k); onChange(k); }) }, "Set key"),
      el("button", { type: "button", class: "btn-mini btn-ghost", title: "Unbind", "aria-label": `Clear key for ${label}`, onclick: () => { input.value = ""; setWarn(""); onChange(""); } }, "Clear"),
      warn,
    );
  }

  // ---------- library ----------
  let filter = "all";

  function badge(legal) {
    return el("span", { class: `badge badge-${legal}`, title: LEGAL[legal].hint, text: LEGAL[legal].label });
  }

  function bindCard(b) {
    const st = state.binds[b.id];
    const blocked = state.mmSafe && b.legal === "restricted";
    const card = el("article", { class: `card${st.on && !blocked ? " is-on" : ""}${blocked ? " is-blocked" : ""}`, id: "bind-" + b.id });
    const toggle = el("input", {
      type: "checkbox", id: "t-" + b.id, checked: st.on, disabled: blocked,
      onchange: (e) => { st.on = e.target.checked; changed(); },
    });
    card.append(
      el("header", { class: "card-head" },
        el("label", { class: "switch", for: "t-" + b.id }, toggle, el("span", { class: "switch-ui", "aria-hidden": "true" }), el("span", { class: "card-name", text: b.name })),
        badge(b.legal)),
      el("p", { class: "card-desc", text: b.desc }),
    );
    if (blocked) card.append(el("p", { class: "card-blocked", text: "Turn off matchmaking-safe mode at the top to use this bind." }));
    const slots = el("div", { class: "slots" });
    b.slots.forEach((sl, i) => {
      slots.append(el("div", { class: "slot" },
        el("span", { class: "slot-label", text: sl.label }),
        keyField(st.keys[i], (k) => { st.keys[i] = k; changed(); }, sl.label),
        el("code", { class: "slot-cmd", text: sl.cmd(st.params) })));
    });
    card.append(slots);
    if (b.params) {
      card.append(el("div", { class: "params" }, b.params.map((p) => el("label", { class: "param" },
        el("span", { text: p.label }),
        el("input", { type: p.type || "text", step: p.step, value: st.params[p.id], onchange: (e) => { st.params[p.id] = e.target.value; changed(); } })))));
    }
    return card;
  }

  function buyCard(p) {
    const st = state.buys[p.id];
    const card = el("article", { class: `card card-buy${st.on ? " is-on" : ""}` });
    const preview = () => (st.items.length ? st.items.map((i) => "buy " + i).join("; ") : "Pick at least one item.");
    const prev = el("code", { class: "slot-cmd", text: preview() });
    card.append(
      el("header", { class: "card-head" },
        el("label", { class: "switch", for: "t-" + p.id },
          el("input", { type: "checkbox", id: "t-" + p.id, checked: st.on, onchange: (e) => { st.on = e.target.checked; changed(); } }),
          el("span", { class: "switch-ui", "aria-hidden": "true" }),
          el("input", { class: "card-name name-input", value: st.name, "aria-label": "Buy bind name", onchange: (e) => { st.name = e.target.value.trim() || p.name; changed(); } })),
        badge("safe")),
      el("div", { class: "slot" }, el("span", { class: "slot-label", text: "Key" }), keyField(st.key, (k) => { st.key = k; changed(); }, st.name), prev),
    );
    const groups = el("div", { class: "buy-groups" });
    for (const g of BUY_ITEMS) {
      groups.append(el("fieldset", { class: "buy-group" }, el("legend", { text: g.group }),
        g.items.map(([id, label]) => el("label", { class: "chip" },
          el("input", { type: "checkbox", checked: st.items.includes(id), onchange: (e) => {
            st.items = e.target.checked ? [...st.items, id] : st.items.filter((x) => x !== id);
            prev.textContent = preview(); changed(false);
          } }),
          el("span", { text: label })))));
    }
    card.append(el("details", { class: "buy-details" }, el("summary", { text: `Items: ${st.items.map((i) => buyLabel[i] || i).join(", ") || "none"}` }), groups));
    return card;
  }

  function customSection() {
    const wrap = el("div", { class: "custom" });
    state.custom.forEach((c, i) => {
      wrap.append(el("div", { class: "slot custom-row" },
        keyField(c.key, (k) => { c.key = k; changed(); }, "custom bind " + (i + 1)),
        el("input", { class: "cmd-input", value: c.cmd || "", placeholder: "console command, e.g. +lookatweapon", "aria-label": "Command", spellcheck: "false",
          onchange: (e) => { c.cmd = e.target.value; changed(); } }),
        el("button", { type: "button", class: "btn-mini btn-ghost", onclick: () => { state.custom.splice(i, 1); changed(); } }, "Remove")));
    });
    wrap.append(el("button", { type: "button", class: "btn", onclick: () => { state.custom.push({ key: "", cmd: "", on: true }); changed(); } }, "Add a custom bind"));
    return wrap;
  }

  function settingsSection() {
    const wrap = el("div", { class: "settings" });
    for (const g of SETTINGS) {
      wrap.append(el("fieldset", { class: "set-group" }, el("legend", { text: g.group }), g.items.map((it) => {
        const st = state.settings[it.id];
        const input = it.type === "bool"
          ? el("select", { "aria-label": it.label, onchange: (e) => { st.value = e.target.value; changed(); } },
              el("option", { value: "1", selected: st.value === "1", text: "On" }), el("option", { value: "0", selected: st.value !== "1", text: "Off" }))
          : el("input", { type: "number", step: it.step, value: st.value, "aria-label": it.label, onchange: (e) => { st.value = e.target.value; changed(); } });
        return el("div", { class: "set-row" },
          el("label", { class: "switch" },
            el("input", { type: "checkbox", checked: st.on, onchange: (e) => { st.on = e.target.checked; changed(); } }),
            el("span", { class: "switch-ui", "aria-hidden": "true" }),
            el("span", {}, el("span", { class: "set-label", text: it.label }), el("code", { class: "set-var", text: it.id }), it.desc ? el("small", { text: it.desc }) : null)),
          input);
      })));
    }
    return wrap;
  }

  function renderLibrary() {
    const lib = $("#library");
    lib.replaceChildren();
    const show = (id) => filter === "all" || filter === id;
    for (const c of CATEGORIES) {
      if (!show(c.id)) continue;
      const sec = el("section", { class: "lib-section", id: "cat-" + c.id }, el("h2", { text: c.name }));
      if (c.id === "buy") {
        sec.append(el("p", { class: "sec-note", text: "Each key buys a whole loadout in one press, even with the buy menu closed. Listing both teams' guns (AK-47 and M4A4) is fine: you only get the one your side can buy. Weapons must be in your loadout to be bought." }));
        sec.append(el("div", { class: "cards" }, BUY_PRESETS.map(buyCard)));
      } else {
        if (c.id === "movement") sec.append(el("p", { class: "sec-note", text: "Since August 2024, Valve ignores binds that put more than one movement or attack action on one key, and can kick you for them on official servers. Snap Tap style keyboard features are banned there too, so they aren't offered here." }));
        if (c.id === "practice") sec.append(el("p", { class: "sec-note", text: "Start a practice match (Play > Practice > Offline with bots) or a private server, then load practice settings." }));
        sec.append(el("div", { class: "cards" }, BINDS.filter((b) => b.cat === c.id).map(bindCard)));
      }
      lib.append(sec);
    }
    if (show("custom")) lib.append(el("section", { class: "lib-section", id: "cat-custom" }, el("h2", { text: "Your own binds" }),
      el("p", { class: "sec-note", text: "Any console command. Don't use double quotes; write an alias in the command box instead if you need them." }), customSection()));
    if (show("settings")) lib.append(el("section", { class: "lib-section", id: "cat-settings" }, el("h2", { text: "Settings" }),
      el("p", { class: "sec-note", text: "Switched-on settings are written to the top of your autoexec." }), settingsSection()));
  }

  function renderFilters() {
    const f = $("#filters");
    const items = [["all", "Everything"], ...CATEGORIES.map((c) => [c.id, c.name]), ["custom", "Your own"], ["settings", "Settings"]];
    f.replaceChildren(...items.map(([id, name]) => el("button", {
      type: "button", class: "filter" + (filter === id ? " is-active" : ""), "aria-pressed": String(filter === id),
      onclick: () => { filter = id; renderFilters(); renderLibrary(); },
    }, name)));
  }

  // ---------- output ----------
  function highlight(line) {
    const span = el("span", { class: "ln" });
    if (line.startsWith("//")) span.classList.add("c-comment");
    else if (line.startsWith("bind ")) span.classList.add("c-bind");
    else if (line.startsWith("alias ")) span.classList.add("c-alias");
    else if (line.startsWith("echo ")) span.classList.add("c-echo");
    else if (line) span.classList.add("c-var");
    span.textContent = line || " ";
    return span;
  }

  function renderOutput() {
    const cfg = buildCfg();
    $("#cfg").replaceChildren(...cfg.split("\n").map(highlight));
    const lines = cfg.split("\n").filter((l) => l.startsWith("bind ")).length;
    $("#cfg-meta").textContent = `${lines} bind${lines === 1 ? "" : "s"}`;
    $("#dl-practice").hidden = !state.binds.pracexec.on;
  }

  function changed(rerenderLib = true) {
    save();
    if (rerenderLib) renderLibrary();
    renderMap();
    renderOutput();
  }

  function download(name, text) {
    const blob = new Blob([text.replace(/\n/g, "\r\n") + "\r\n"], { type: "text/plain" });
    const a = el("a", { href: URL.createObjectURL(blob), download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2200);
  }

  // ---------- init ----------
  function init() {
    const mm = $("#mmsafe");
    mm.checked = state.mmSafe;
    mm.addEventListener("change", () => { state.mmSafe = mm.checked; changed(); });
    $("#copy").addEventListener("click", async () => {
      const text = buildCfg();
      try { await navigator.clipboard.writeText(text); toast("Copied autoexec.cfg"); }
      catch (e) {
        const ta = el("textarea", {}, text); document.body.append(ta); ta.select();
        try { document.execCommand("copy"); toast("Copied autoexec.cfg"); } catch (e2) { toast("Copy failed. Select the text and copy it yourself."); }
        ta.remove();
      }
    });
    $("#dl").addEventListener("click", () => { download("autoexec.cfg", buildCfg()); toast("Downloaded autoexec.cfg"); });
    $("#dl-practice").addEventListener("click", () => { download("practice.cfg", buildPracticeCfg()); toast("Downloaded practice.cfg"); });
    $("#reset").addEventListener("click", () => {
      if (!confirm("Reset every bind and setting to the defaults?")) return;
      state = defaultState(); mm.checked = true; selectedKey = null; changed();
      toast("Reset to defaults");
    });
    renderFilters();
    renderLibrary();
    renderMap();
    renderOutput();
  }

  init();
})();
