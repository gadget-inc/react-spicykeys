import { fireEvent, render, screen } from "@testing-library/react";
import { SpicyKeys } from "../lib/SpicyKeys";

test("calls handlers registered globally when events are dispatched on the body", () => {
  const fn = jest.fn();
  render(
    <>
      <SpicyKeys keys={{ enter: fn }} />
      <div data-testid="foobar" tabIndex={-1} />
    </>
  );

  document.body.focus();
  expect(fn).not.toHaveBeenCalled();
  fireEvent.keyPress(document.body, { key: "Enter", code: "Enter", which: 13 });
  expect(fn).toHaveBeenCalled();
});

test("calls handlers registered globally when events are dispatched on a dom node", () => {
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
  fireEvent.keyPress(element, { key: "Enter", code: "Enter", which: 13 });
  expect(fn).toHaveBeenCalled();
});
