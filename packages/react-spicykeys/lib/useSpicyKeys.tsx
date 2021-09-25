import { useEffect } from "react";
import { ActionHandlerMap, ActionKeyCombinationMap, SpicyKeysCallback } from "./HandlerRegistry";
import { useSpicyKeysRegistry } from "./SpicyKeysContext";

/**
 * A map from key combination strings to to callback functions to invoke when that key combination is pressed
 * @example
 * ```typescript
 * {
 *    'ctrl+s': () => console.log("ctrl and s keys pressed together"),
 *    'cmd+space': () => console.log("command key and space key pressed together"),
 * }
 * ```
 */
export interface CallbackMap {
  [keyCombination: string]: SpicyKeysCallback;
}

/**
 * Register global key event handlers.
 *
 * @param callbacks An object with string keys of key combinations like `ctrl+s` and callback values to invoke when that key combination is pressed
 * @example
 * ```tsx
 *  useSpicyKeys({
 *    "ctrl+s": () => console.log("ctrl+s pressed"),
 *    "mod+v": () => console.log("ctrl+v or mod+v pressed"),
 * })
 * ```
 */
export function useSpicyKeys(callbacks: CallbackMap): void;
/**
 * Register global key event handlers, separating the action to invoke from the key combination(s) that invoke it.
 *
 * @param actions An object with string keys of action names and callback values to invoke when that action is triggered
 * @param keyMap An object with string keys of action names and array of string values of key combinations that trigger that action
 *
 * @example
 * ```
 *  useSpicyKeys({
 *    SAVE: () => console.log("save action triggered"),
 *    PASTE: () => console.log("paste action triggered"),
 *  }, {
 *    SAVE: ["ctrl+s", "ctrl+shift+s"],
 *    PASTE: ["ctrl+v"],
 *  })
 * ```
 */
export function useSpicyKeys(actions: ActionHandlerMap, keyMap: ActionKeyCombinationMap): void;
export function useSpicyKeys(callbacksOrActions: CallbackMap | ActionHandlerMap, keyMap?: ActionKeyCombinationMap): void {
  // work with the shorthand and longhand style of passing just key combinations or actions
  let actionHandlers: ActionHandlerMap;
  let keyCombos: ActionKeyCombinationMap;
  if (keyMap) {
    keyCombos = keyMap;
    actionHandlers = callbacksOrActions as ActionHandlerMap;
  } else {
    keyCombos = {};
    actionHandlers = {};
    for (const [combo, callback] of Object.entries(callbacksOrActions as CallbackMap)) {
      const name = `internal-anonymous-${combo}`;
      keyCombos[name] = [combo];
      actionHandlers[name] = callback;
    }
  }

  const registry = useSpicyKeysRegistry();

  useEffect(() => {
    registry.register(keyCombos, actionHandlers);
    return () => {
      registry.unregister(keyCombos, actionHandlers);
    };
  }, [callbacksOrActions, keyMap]);
}
