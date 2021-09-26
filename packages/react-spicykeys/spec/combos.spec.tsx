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

  test("doesn't call handlers for the plain old key when a chord involving it is pressed", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ z: fn }} />);

    document.body.focus();
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("z", undefined, ["ctrl"]);
    expect(fn).not.toHaveBeenCalled();
  });

  test("calls handlers when a key chord with multiple modifiers is pressed", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "meta+shift+z": fn }} />);

    document.body.focus();
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("z", undefined, ["meta", "shift"]);
    expect(fn).toHaveBeenCalled();
  });

  it("calls handlers regardless of if the numpad number or the above keys number is pressed", function () {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "ctrl+0": fn }} />);

    document.body.focus();
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate([96, 96], undefined, ["ctrl"]);
    expect(fn).toHaveBeenCalled();
  });
});
