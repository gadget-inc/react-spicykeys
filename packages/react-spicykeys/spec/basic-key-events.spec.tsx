import { render, screen } from "@testing-library/react";
import { SpicyKeys } from "../lib/SpicyKeys";
import { rootRegistry } from "../lib/SpicyKeysContext";
import { KeyEventHelper } from "./KeyEventHelper";

describe("listening to key events", () => {
  beforeEach(() => {
    rootRegistry.reset();
    jest.clearAllTimers();
  });

  test("calls handlers registered globally are called when keydown/keyup events are dispatched on the body", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ enter: fn }} />);

    document.body.focus();
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("enter");
    expect(fn).toHaveBeenCalled();
  });

  test("calls handlers registered globally are called when keydown/keyup events events are dispatched on a dom node", () => {
    const fn = jest.fn();
    render(
      <>
        <SpicyKeys keys={{ enter: fn }} />
        <div data-testid="foobar" tabIndex={-1} />
      </>
    );

    const element = screen.getByTestId("foobar");
    element.focus();
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("enter", element);
    expect(fn).toHaveBeenCalled();
  });

  test("calls handlers registered globally are not called when keydown/keyup events for other keys are dispatched on the body", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ enter: fn }} />);

    document.body.focus();
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("space");
    expect(fn).not.toHaveBeenCalled();
  });

  test("calls handlers registered globally are not called when keydown/keyup events events are dispatched on a dom node", () => {
    const fn = jest.fn();
    render(
      <>
        <SpicyKeys keys={{ enter: fn }} />
        <div data-testid="foobar" tabIndex={-1} />
      </>
    );

    const element = screen.getByTestId("foobar");
    element.focus();
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("space", element);
    expect(fn).not.toHaveBeenCalled();
  });

  test("calls handlers registered globally when keypress events are dispatched on the body", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ a: fn }} />);

    document.body.focus();
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("a");
    expect(fn).toHaveBeenCalled();
  });

  test("calls handlers registered globally when keypress events are dispatched on a dom node", () => {
    const fn = jest.fn();
    render(
      <>
        <SpicyKeys keys={{ a: fn }} />
        <div data-testid="foobar" tabIndex={-1} />
      </>
    );

    const element = screen.getByTestId("foobar");
    element.focus();
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("a");
    expect(fn).toHaveBeenCalled();
  });

  test("calls the right handler when keypress events are dispatched for different keys", () => {
    const A = jest.fn();
    const B = jest.fn();
    const C = jest.fn();
    render(<SpicyKeys keys={{ a: A, b: B, c: C }} />);

    document.body.focus();
    expect(A).not.toHaveBeenCalled();
    expect(B).not.toHaveBeenCalled();
    expect(C).not.toHaveBeenCalled();
    KeyEventHelper.simulate("b");
    expect(A).not.toHaveBeenCalled();
    expect(B).toHaveBeenCalled();
    expect(C).not.toHaveBeenCalled();
    KeyEventHelper.simulate("a");
    expect(A).toHaveBeenCalledTimes(1);
    expect(B).toHaveBeenCalledTimes(1);
    expect(C).not.toHaveBeenCalled();
  });

  it("capslock key is ignored", function () {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ a: fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("a");
    expect(fn).toHaveBeenCalledTimes(1);
    KeyEventHelper.simulate("A"); // same `event.keyCode`, different `event.key`
    expect(fn).toHaveBeenCalledTimes(2);

    // shift a should not trigger the handler
    KeyEventHelper.simulate("A", undefined, ["shift"]);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("fires events for special characters", function () {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "*": fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("*");
    expect(fn).toHaveBeenCalled();
  });

  it("fires events for keys with no character", function () {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ left: fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("left");
    expect(fn).toHaveBeenCalled();
  });

  it("binding the plus key as a symbol should fire handlers", function () {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "+": fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("+");
    expect(fn).toHaveBeenCalled();

    KeyEventHelper.simulate([43, 187], undefined, ["shift"]);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('binding plus key as the "plus" literal should fire handlers', function () {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ plus: fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("+");
    expect(fn).toHaveBeenCalled();

    KeyEventHelper.simulate([43, 187], undefined, ["shift"]);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("binding to chords with the plus key should fire handlers", function () {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "alt++": fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("+", undefined, ["alt"]);
    expect(fn).toHaveBeenCalled();
  });

  it("binding to multi-modifier chords with the plus key should fire handlers", function () {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "alt+shift++": fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("+", undefined, ["shift", "alt"]);
    expect(fn).toHaveBeenCalled();
  });
});
