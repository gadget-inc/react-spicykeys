import { render } from "@testing-library/react";
import { Modifier } from "../lib/helpers";
import { SpicyKeys } from "../lib/SpicyKeys";
import { rootRegistry } from "../lib/SpicyKeysContext";
import { KeyEventHelper } from "./KeyEventHelper";

describe("strange keycodes call the right event type", function () {
  beforeEach(() => {
    rootRegistry.reset();
    jest.clearAllTimers();
  });

  const keys: Record<string, [string, number, Modifier[] | undefined][]> = {
    keypress: [
      ["a", 65, []],
      ["A", 65, ["shift"]],
      ["7", 55, []],
      ["?", 191, []],
      ["*", 56, []],
      ["+", 187, []],
      ["$", 52, []],
      ["[", 219, []],
      [".", 190, []],
    ],
    keydown: [
      ["shift+'", 222, ["shift"]],
      ["shift+a", 65, ["shift"]],
      ["shift+5", 53, ["shift"]],
      ["command+shift+p", 80, ["meta", "shift"]],
      ["space", 32, []],
      ["left", 37, []],
    ],
  };

  for (const [eventType, caseList] of Object.entries(keys)) {
    for (const [key, keyCode, modifiers] of caseList) {
      test(`key ${key} should use the ${eventType} event when calling handlers`, () => {
        const fn = jest.fn();
        render(<SpicyKeys keys={{ [key]: fn }} />);

        document.body.focus();
        expect(fn).not.toHaveBeenCalled();
        KeyEventHelper.simulate([key.charCodeAt(0), keyCode], undefined, modifiers);
        expect(fn).toHaveBeenCalled();
        expect(fn.mock.calls[0][0].type).toBe(eventType);
      });
    }
  }
});
