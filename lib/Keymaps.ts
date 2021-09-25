/** Which DOM event we might be handling */
export enum Action {
  Keypress = "keypress",
  Keyup = "keyup",
  Keydown = "keydown",
}

/**
 * mapping of special keycodes to their corresponding keys
 * everything in this dictionary cannot use keypress events so it has to be here to map to the correct keycodes for keyup/keydown events
 */
export const MAP: { [keycode: number]: string } = {
  8: "backspace",
  9: "tab",
  13: "enter",
  16: "shift",
  17: "ctrl",
  18: "alt",
  20: "capslock",
  27: "esc",
  32: "space",
  33: "pageup",
  34: "pagedown",
  35: "end",
  36: "home",
  37: "left",
  38: "up",
  39: "right",
  40: "down",
  45: "ins",
  46: "del",
  91: "meta",
  93: "meta",
  224: "meta",
};

/**
 * mapping for special characters so they can support
 * this dictionary is only used in case you want to bind a keyup or keydown event to one of these keys
 */
export const KEYCODE_MAP: { [keycode: number]: string } = {
  106: "*",
  107: "+",
  109: "-",
  110: ".",
  111: "/",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'",
};

/**
 * this is a mapping of keys that require shift on a US keypad back to the non shift equivalents
 * this is so you can use keyup events with these keys
 * note that this will only work reliably on US keyboards
 */
export const SHIFT_MAP: { [shiftKey: string]: string } = {
  "~": "`",
  "!": "1",
  "@": "2",
  "#": "3",
  $: "4",
  "%": "5",
  "^": "6",
  "&": "7",
  "*": "8",
  "(": "9",
  ")": "0",
  _: "-",
  "+": "=",
  ":": ";",
  '"': "'",
  "<": ",",
  ">": ".",
  "?": "/",
  "|": "\\",
};

// this is a list of special strings you can use to map to modifier keys when you specify your keyboard shortcuts
export const SPECIAL_ALIASES: { [key: string]: string } = {
  option: "alt",
  command: "meta",
  return: "enter",
  escape: "esc",
  plus: "+",
  mod: /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "meta" : "ctrl",
};

// loop through the f keys, f1 to f19 and add them to the map
for (var i = 1; i < 20; ++i) {
  MAP[111 + i] = "f" + i;
}

// loop through to map numbers on the numeric keypad
for (i = 0; i <= 9; ++i) {
  // This needs to use a string cause otherwise since 0 is falsey, we would never fire for numpad 0 pressed as part of a keydown event.
  MAP[i + 96] = i.toString();
}

// Stores the flipped version of _MAP from above needed to check if we should use keypress or not when no action is specified
export const REVERSE_MAP: { [char: string]: number } = {};

for (const key of Object.keys(MAP) as any as number[]) {
  // pull out the numeric keypad from here cause keypress should be able to detect the keys from the character
  if (key > 95 && key < 112) {
    continue;
  }

  if (MAP.hasOwnProperty(key)) {
    REVERSE_MAP[MAP[key]] = key;
  }
}
