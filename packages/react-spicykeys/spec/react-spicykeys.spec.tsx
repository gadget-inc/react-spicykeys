import { fireEvent, render, screen } from "@testing-library/react";
import { SpicyKeys } from "../lib/SpicyKeys";
import { AEvent, BEvent, SpaceEvent } from "./events";

describe("listening to key events", () => {
  test("calls handlers registered globally are called when keydown/keyup events are dispatched on the body", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ enter: fn }} />);

    document.body.focus();
    expect(fn).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, { key: "Enter", code: "Enter", which: 13 });
    fireEvent.keyUp(document.body, { key: "Enter", code: "Enter", which: 13 });
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
    fireEvent.keyDown(element, { key: "Enter", code: "Enter", which: 13 });
    fireEvent.keyUp(element, { key: "Enter", code: "Enter", which: 13 });
    expect(fn).toHaveBeenCalled();
  });

  test("calls handlers registered globally are not called when keydown/keyup events for other keys are dispatched on the body", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ enter: fn }} />);

    document.body.focus();
    expect(fn).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, SpaceEvent);
    fireEvent.keyUp(document.body, SpaceEvent);
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
    fireEvent.keyDown(element, SpaceEvent);
    fireEvent.keyUp(element, SpaceEvent);
    expect(fn).not.toHaveBeenCalled();
  });

  test("calls handlers registered globally when keypress events are dispatched on the body", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ a: fn }} />);

    document.body.focus();
    expect(fn).not.toHaveBeenCalled();
    fireEvent.keyPress(document.body, AEvent);
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
    fireEvent.keyPress(document.body, AEvent);
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
    fireEvent.keyPress(document.body, BEvent);
    expect(A).not.toHaveBeenCalled();
    expect(B).toHaveBeenCalled();
    expect(C).not.toHaveBeenCalled();
    fireEvent.keyPress(document.body, AEvent);
    expect(A).toHaveBeenCalledTimes(1);
    expect(B).toHaveBeenCalledTimes(1);
    expect(C).not.toHaveBeenCalled();
  });
});
