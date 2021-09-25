import { belongsTo, characterFromEvent, eventModifiers, getKeyInfo, isModifier, Modifier, modifiersMatch } from "./helpers";
import { Action } from "./Keymaps";

export type SpicyKeysCallback = (event: KeyboardEvent, combo?: string) => void;

type Handler = {
  callback: SpicyKeysCallback;
  modifiers: Modifier[];
  action: string;
  seq?: string;
  level?: number;
  combo?: string;
};

export class HandlerMap {
  protected root?: HTMLElement;
  private ignoreNextKeyup: false | string = false;
  private ignoreNextKeypress: boolean = false;
  private handlers: { [character: string]: Handler[] } = {};
  private sequenceLevels: { [sequence: string]: number } = {};
  private nextExpectedAction: false | Action = false;

  constructor(root?: HTMLElement) {
    if (!root && typeof window != "undefined") {
      root = window.document.body;
    }
    if (root) {
      this.setRoot(root);
    }
  }

  /** Sets the root level HTML element we're going to listen for keyevents on */
  setRoot(root: HTMLElement) {
    if (this.root) {
      this.root.removeEventListener("keypress", this.eventHandler);
      this.root.removeEventListener("keydown", this.eventHandler);
      this.root.removeEventListener("keyup", this.eventHandler);
    }

    this.root = root;
    this.root.addEventListener("keypress", this.eventHandler);
    this.root.addEventListener("keydown", this.eventHandler);
    this.root.addEventListener("keyup", this.eventHandler);
  }

  /** Event handler entrypoint called by the raw DOM event handlers */
  eventHandler = (event: KeyboardEvent) => {
    // normalize e.which for key events
    // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
    if (typeof event.which !== "number") {
      (event as any).which = event.keyCode;
    }

    const character = characterFromEvent(event);

    // no character found then stop
    if (!character) {
      return;
    }

    // need to use === for the character check because the character can be 0
    if (event.type == "keyup" && this.ignoreNextKeyup === character) {
      this.ignoreNextKeyup = false;
      return;
    }

    this.handleKey(character, eventModifiers(event), event);
  };

  private handleKey(character: string, modifiers: Modifier[], event: KeyboardEvent) {
    const handlers = this.getMatches(character, modifiers, event);
    let doNotReset: Record<string, number> = {};
    let processedSequenceCallback = false;

    // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
    let maxLevel = 0;
    for (const handler of handlers) {
      if (handler.seq) {
        maxLevel = Math.max(maxLevel, handler.level!);
      }
    }

    // loop through matching callbacks for this key event
    for (const handler of handlers) {
      // fire for all sequence callbacks
      // this is because if for example you have multiple sequences bound such as "g i" and "g t" they both need to fire the callback for matching g cause otherwise you can only ever match the first one
      if (handler.seq) {
        // only fire callbacks for the maxLevel to prevent subsequences from also firing
        // for example 'a option b' should not cause 'option b' to fire even though 'option b' is part of the other sequence
        // any sequences that do not match here will be discarded below by the _resetSequences call
        if (handler.level != maxLevel) {
          continue;
        }

        processedSequenceCallback = true;

        // keep a list of which sequences were matches for later
        doNotReset[handler.seq] = 1;
        this.fireCallback(handler, event);
        continue;
      }

      // if there were no sequence matches but we are still here that means this is a regular match so we should fire that
      if (!processedSequenceCallback) {
        this.fireCallback(handler, event);
      }
    }

    // if the key you pressed matches the type of sequence without being a modifier (ie "keyup" or "keypress") then we should reset all sequences that were not matched by this event
    // this is so, for example, if you have the sequence "h a t" and you type "h e a r t" it does not match.  in this case the "e" will cause the sequence to reset
    // modifier keys are ignored because you can have a sequence that contains modifiers such as "enter ctrl+space" and in most cases the modifier key will be pressed before the next key
    // also if you have a sequence such as "ctrl+b a" then pressing the "b" key will trigger a "keypress" and a "keydown"
    // the "keydown" is expected when there is a modifier, but the "keypress" ends up matching the _nextExpectedAction since it occurs after and that causes the sequence to reset
    // we ignore keypresses in a sequence that directly follow a keydown for the same character
    const ignoreThisKeypress = event.type == Action.Keypress && !!this.ignoreNextKeypress;
    if (event.type == this.nextExpectedAction && !isModifier(character) && !ignoreThisKeypress) {
      this.resetSequences(doNotReset);
    }

    this.ignoreNextKeypress = processedSequenceCallback && event.type == "keydown";
  }

  /**
   * finds all registered handlers that match based on the keycode, modifiers, and action
   */
  private getMatches(
    character: string,
    modifiers: Modifier[],
    event: KeyboardEvent,
    sequenceName?: string,
    combination?: string,
    level?: number
  ) {
    const matches = [];
    const action = event.type;

    if (!this.handlers[character]) {
      return [];
    }

    // if a modifier key is coming up on its own we should allow it
    if (action == Action.Keyup && isModifier(character)) {
      modifiers = [character];
    }

    for (const [index, handler] of this.handlers[character].entries()) {
      // if a sequence name is not specified, but this is a sequence at the wrong level then move onto the next match
      if (!sequenceName && handler.seq && this.sequenceLevels[handler.seq] != handler.level) {
        continue;
      }
      // if the action we are looking for doesn't match the action we got then we should keep going
      if (action != handler.action) {
        continue;
      }

      // if this is a keypress event and the meta key and control key are not pressed that means that we need to only look at the character, otherwise check the modifiers as well
      // chrome will not fire a keypress if meta or control is down, safari will fire a keypress if meta or meta+shift is down, firefox will fire a keypress if meta or control is down
      if ((action == Action.Keypress && !event.metaKey && !event.ctrlKey) || modifiersMatch(modifiers, handler.modifiers)) {
        // when you bind a combination or sequence a second time it should overwrite the first one.  if a sequenceName or combination is specified in this call it does just that
        var deleteCombo = !sequenceName && handler.combo == combination;
        var deleteSequence = sequenceName && handler.seq == sequenceName && handler.level == level;
        if (deleteCombo || deleteSequence) {
          this.handlers[character].splice(index, 1);
        }

        matches.push(handler);
      }
    }

    return matches;
  }

  /**
   * binds a single keyboard combination
   */
  bindSingle(combination: string, callback: SpicyKeysCallback, action?: Action, sequenceName?: string, level?: number) {
    // make sure multiple spaces in a row become a single space
    combination = combination.replace(/\s+/g, " ");
    const sequence = combination.split(" ");

    // if this pattern is a sequence of keys then run through this method to reprocess each pattern one key at a time
    if (sequence.length > 1) {
      throw new Error("sequences not yet implemented");
      // _bindSequence(combination, sequence, callback, action);
      return;
    }

    const info = getKeyInfo(combination, action);
    let list = this.handlers[info.key];
    if (!list) {
      list = [];
      this.handlers[info.key] = list;
    }

    // remove an existing match if there is one
    this.getMatches(info.key, info.modifiers, { type: info.action } as KeyboardEvent, sequenceName, combination, level);

    const handler: Handler = {
      callback: callback,
      modifiers: info.modifiers,
      action: info.action,
      seq: sequenceName,
      level: level,
      combo: combination,
    };
    // add this call back to the array if it is a sequence put it at the beginning if not put it at the end
    // this is important because the way these are processed expects the sequence ones to come first
    if (sequenceName) {
      list.unshift(handler);
    } else {
      list.push(handler);
    }
  }

  unbind(combination: string, callback: SpicyKeysCallback) {}

  private resetSequences(doNotReset: Record<string, number> = {}) {
    let activeSequences = false;

    for (const key in this.sequenceLevels) {
      if (doNotReset[key]) {
        activeSequences = true;
        continue;
      }
      this.sequenceLevels[key] = 0;
    }

    if (!activeSequences) {
      this.nextExpectedAction = false;
    }
  }

  private fireCallback(handler: Handler, event: KeyboardEvent) {
    // if this event should not happen stop here
    if (this.shouldStopCallback(event, (event.target || event.srcElement) as Element, handler.combo, handler.seq)) {
      return;
    }

    handler.callback(event, handler.combo);
  }

  private shouldStopCallback(event: KeyboardEvent, element: Element, combo?: string, sequence?: string) {
    if (!this.root) {
      return true;
    }

    if (belongsTo(element, this.root)) {
      return false;
    }

    // Events originating from a shadow DOM are re-targetted and `e.target` is the shadow host,
    // not the initial event target in the shadow tree. Note that not all events cross the
    // shadow boundary.
    // For shadow trees with `mode: 'open'`, the initial event target is the first element in
    // the event’s composed path. For shadow trees with `mode: 'closed'`, the initial event
    // target cannot be obtained.
    if ("composedPath" in event && typeof event.composedPath === "function") {
      // For open shadow trees, update `element` so that the following check works.
      var initialEventTarget = event.composedPath()[0];
      if (initialEventTarget !== event.target) {
        element = initialEventTarget as Element;
      }
    }

    // stop for input, select, and textarea
    return element.tagName == "INPUT" || element.tagName == "SELECT" || element.tagName == "TEXTAREA" || (element as any).isContentEditable;
  }
}
