import { fireEvent, render } from "@testing-library/react";
import { SpicyKeys } from "../lib/SpicyKeys";
import { CtrlEvent, KeyEventHelper, ZEvent } from "./KeyEventHelper";

describe("listening to key combinations", () => {
  test("doesn't call handlers when the first modifier key of a combo is pressed", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "ctrl+z": fn }} />);

    document.body.focus();
    expect(fn).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, CtrlEvent);
    fireEvent.keyUp(document.body, CtrlEvent);
    expect(fn).not.toHaveBeenCalled();
  });

  test("doesn't call handlers when the not-modifier key of a combo is pressed", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "ctrl+z": fn }} />);

    document.body.focus();
    expect(fn).not.toHaveBeenCalled();
    fireEvent.keyPress(document.body, ZEvent);
    expect(fn).not.toHaveBeenCalled();
  });

  test("calls handlers when a key chord is pressed", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "ctrl+z": fn }} />);

    document.body.focus();
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("z", undefined, ["ctrl"]);
    expect(fn).toHaveBeenCalled();
  });
});
