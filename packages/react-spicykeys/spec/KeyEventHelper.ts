import { fireEvent } from "@testing-library/dom";
import keycode from "keycode";
import { Modifier } from "../lib/helpers";
import { EventType } from "../lib/Keymaps";

// simulated keyboard event class for testing
// modified from https://github.com/ccampbell/mousetrap/blob/2f9a476ba6158ba69763e4fcf914966cc72ef433/tests/libs/key-event.js
export class KeyEventHelper {
  keyCode: number;
  charCode: number;
  ctrlKey = false;
  metaKey = false;
  altKey = false;
  shiftKey = false;

  constructor(data: { keyCode?: number; charCode?: number; modifiers?: Modifier[] }, readonly type: EventType = EventType.Keypress) {
    this.keyCode = data.keyCode ?? 0;
    this.charCode = data.charCode ?? 0;

    const modifiers = data.modifiers ?? [];
    for (const _ of modifiers) {
      (this as any)[modifiers + "Key"] = true;
    }
  }

  toNative(): KeyboardEvent {
    const event: any = document.createEvent("Events");

    if (event.initEvent) {
      event.initEvent(this.type, true, true);
    }

    event.keyCode = this.keyCode;
    event.which = this.charCode || this.keyCode;
    event.shiftKey = this.shiftKey;
    event.metaKey = this.metaKey;
    event.altKey = this.altKey;
    event.ctrlKey = this.ctrlKey;

    return event;
  }

  fire(element: HTMLElement) {
    fireEvent(element, this.toNative());
  }

  // simulates complete key event as if the user pressed the key in the browser
  // triggers a keydown, then a keypress, then a keyup
  static simulate(
    key: string,
    element: HTMLElement = document.body,
    modifiers: Modifier[] = [],
    repeat = 1,
    options: { shadowHost?: any } = {}
  ) {
    // Re-target the element so that `event.target` becomes the shadow host. See:
    // https://developers.google.com/web/fundamentals/web-components/shadowdom#events
    // This is a bit of a lie because true events would re-target the event target both for
    // closed and open shadow trees. `KeyEvent` is not a true event and will fire the event
    // directly from the shadow host for closed shadow trees. For open trees, this would make
    // the tests fail as the actual event that will be eventually dispatched would have an
    // incorrect `Event.composedPath()` starting with the shadow host instead of the
    // initial event target.
    if (options.shadowHost && options.shadowHost.shadowRoot === null) {
      // closed shadow dom
      element = options.shadowHost;
    }
    let charCode;
    if (key.length === 1) {
      charCode = key.charCodeAt(0);
    } else {
      charCode = 0;
    }

    const keyCode = keycode(key);

    const modifierToKeyCode = {
      shift: 16,
      ctrl: 17,
      alt: 18,
      meta: 91,
    };

    // if the key is a modifier then take it out of the regular
    // keypress/keydown
    if (keyCode == 16 || keyCode == 17 || keyCode == 18 || keyCode == 91) {
      repeat = 0;
    }

    const modifiersToInclude: Modifier[] = [];
    const keyEvents = [];

    // modifiers would go down first
    for (var i = 0; i < modifiers.length; i++) {
      modifiersToInclude.push(modifiers[i]);
      keyEvents.push(
        new KeyEventHelper(
          {
            charCode: 0,
            keyCode: modifierToKeyCode[modifiers[i]],
            modifiers: modifiersToInclude,
          },
          EventType.Keydown
        )
      );
    }

    // @todo factor in duration for these
    while (repeat > 0) {
      keyEvents.push(
        new KeyEventHelper(
          {
            charCode: 0,
            keyCode: keyCode,
            modifiers: modifiersToInclude,
          },
          EventType.Keydown
        )
      );

      keyEvents.push(
        new KeyEventHelper(
          {
            charCode: charCode,
            keyCode: charCode,
            modifiers: modifiersToInclude,
          },
          EventType.Keypress
        )
      );

      repeat--;
    }

    keyEvents.push(
      new KeyEventHelper(
        {
          charCode: 0,
          keyCode: keyCode,
          modifiers: modifiersToInclude,
        },
        EventType.Keyup
      )
    );

    // now lift up the modifier keys
    for (i = 0; i < modifiersToInclude.length; i++) {
      var modifierKeyCode = modifierToKeyCode[modifiersToInclude[i]];
      modifiersToInclude.splice(i, 1);
      keyEvents.push(
        new KeyEventHelper(
          {
            charCode: 0,
            keyCode: modifierKeyCode,
            modifiers: modifiersToInclude,
          },
          EventType.Keyup
        )
      );
    }

    for (i = 0; i < keyEvents.length; i++) {
      // console.log('firing', keyEvents[i].type, keyEvents[i].keyCode, keyEvents[i].charCode);
      keyEvents[i].fire(element);
    }
  }
}

export const EnterEvent = { key: "Enter", code: "Enter", which: keycode("enter") };
export const SpaceEvent = { key: "Space", code: "Space", which: keycode("space") };
export const AEvent = { key: "a", code: "KeyA", which: keycode("a") };
export const BEvent = { key: "b", code: "KeyB", which: keycode("b") };
export const ZEvent = { key: "z", code: "KeyZ", which: keycode("z") };
export const CtrlEvent = { key: "Control", code: "ControlLeft", which: keycode("ctrl") };
