import { characterFromEvent } from "../lib/helpers";

describe("characterFromEvent", () => {
  test("should return the expanded name of the special keys", () => {
    expect(characterFromEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", which: 13 }))).toBe("enter");
    expect(characterFromEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", which: 32 }))).toBe("space");
  });
});
