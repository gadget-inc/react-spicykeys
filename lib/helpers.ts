import { Action, KEYCODE_MAP, MAP, REVERSE_MAP, SHIFT_MAP, SPECIAL_ALIASES } from "./Keymaps";

export const characterFromEvent = (event: KeyboardEvent) => {
  // for keypress events we should return the character as is
  if (event.type == "keypress") {
    let character = String.fromCharCode(event.which);

    // if the shift key is not pressed then it is safe to assume that we want the character to be lowercase. this means if you accidentally have caps lock on then your key bindings will continue to work
    //
    // the only side effect that might not be desired is if you bind something like 'A' cause you want to trigger an event when capital A is pressed caps lock will no longer trigger the event.  shift+a will though.
    if (!event.shiftKey) {
      character = character.toLowerCase();
    }

    return character;
  }

  // for non keypress events the special maps are needed
  if (MAP[event.which]) {
    return MAP[event.which];
  }

  if (KEYCODE_MAP[event.which]) {
    return KEYCODE_MAP[event.which];
  }

  // if it is not in the special map with keydown and keyup events the character seems to always come in as an uppercase character whether you are pressing shift or not. we make sure it is always lowercase for comparisons
  return String.fromCharCode(event.which).toLowerCase();
};

export type Modifier = "shift" | "alt" | "ctrl" | "meta";

export const eventModifiers = (event: KeyboardEvent) => {
  const modifiers: Modifier[] = [];

  if (event.shiftKey) {
    modifiers.push("shift");
  }

  if (event.altKey) {
    modifiers.push("alt");
  }

  if (event.ctrlKey) {
    modifiers.push("ctrl");
  }

  if (event.metaKey) {
    modifiers.push("meta");
  }

  return modifiers;
};

export const isModifier = (key: string): key is Modifier => {
  return key == "shift" || key == "ctrl" || key == "alt" || key == "meta";
};

export const modifiersMatch = (modifiers1: Modifier[], modifiers2: Modifier[]) => {
  return modifiers1.sort().join(",") === modifiers2.sort().join(",");
};

/**
 * Converts from a string key combination to an array
 *
 * @param  combination like "command+shift+l"
 */
export const keysFromString = (combination: string): string[] => {
  if (combination === "+") {
    return ["+"];
  }

  combination = combination.replace(/\+{2}/g, "+plus");
  return combination.split("+");
};

export interface KeyInfo {
  key: string;
  modifiers: Modifier[];
  action: Action;
}

/**
 * Gets info for a specific key combination
 */
export const getKeyInfo = (combination: string, action?: Action): KeyInfo => {
  const modifiers: Modifier[] = [];

  // take the keys from this pattern and figure out what the actual pattern is all about
  const keys = keysFromString(combination);
  let lastKey: string = keys[0];

  for (let key of keys) {
    // normalize key names
    if (SPECIAL_ALIASES[key]) {
      key = SPECIAL_ALIASES[key];
    }

    // if this is not a keypress event then we should be smart about using shift keys this will only work for US keyboards however
    if (action && action != Action.Keypress && SHIFT_MAP[key]) {
      key = SHIFT_MAP[key];
      modifiers.push("shift");
    }

    // if this key is a modifier then add it to the list of modifiers
    if (isModifier(key)) {
      modifiers.push(key);
    }

    lastKey = key;
  }

  // if no action was picked in we should try to pick the one that we think would work best for this key
  if (!action) {
    action = REVERSE_MAP[lastKey] ? Action.Keydown : Action.Keypress;
  }

  // modifier keys don't work as expected with keypress, switch to keydown
  if (action == Action.Keypress && modifiers.length) {
    action = Action.Keydown;
  }

  return {
    key: lastKey,
    modifiers: modifiers,
    action: action,
  };
};

export const belongsTo = (element: ParentNode | null, ancestor: ParentNode): boolean => {
  if (element === null || element === window.document) {
    return false;
  }

  if (element === ancestor) {
    return true;
  }

  return belongsTo(element.parentNode, ancestor);
};
