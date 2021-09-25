import { render, screen } from "@testing-library/react";
import { SpicyKeys } from "../lib/SpicyKeys";
import { KeyEventHelper } from "./KeyEventHelper";

describe("listening to key events", () => {
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
});
