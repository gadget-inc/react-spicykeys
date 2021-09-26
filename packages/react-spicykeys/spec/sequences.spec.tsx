import { render } from "@testing-library/react";
import { SpicyKeys } from "../lib/SpicyKeys";
import { rootRegistry } from "../lib/SpicyKeysContext";
import { KeyEventHelper } from "./KeyEventHelper";

jest.useFakeTimers();

describe("listening to sequences", () => {
  beforeEach(() => {
    rootRegistry.reset();
    jest.clearAllTimers();
  });

  test("calls handlers registered globally using key sequences", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "g i": fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("g");
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("i");
    expect(fn).toHaveBeenCalledTimes(1);

    jest.runAllTimers();
    KeyEventHelper.simulate("g");
    KeyEventHelper.simulate("i");
    expect(fn).toHaveBeenCalledTimes(2);

    jest.runAllTimers();
    KeyEventHelper.simulate("f");
    expect(fn).toHaveBeenCalledTimes(2);

    KeyEventHelper.simulate("g");
    KeyEventHelper.simulate("i");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test("calls handlers registered globally using key sequences with mixed key types", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "g o enter": fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("g");
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("o");
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("enter");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("calls handlers registered globally using key sequences that start with modifier keys", () => {
    const first = jest.fn();
    render(<SpicyKeys keys={{ "option enter": first }} />);

    expect(first).not.toHaveBeenCalled();
    KeyEventHelper.simulate([0, 18], undefined, ["alt"]);
    expect(first).not.toHaveBeenCalled();
    KeyEventHelper.simulate([0, 13]);
    expect(first).toHaveBeenCalledTimes(1);

    const second = jest.fn();
    render(<SpicyKeys keys={{ "command enter": second }} />);

    expect(second).not.toHaveBeenCalled();
    KeyEventHelper.simulate([0, 91], undefined, ["meta"]);
    expect(second).not.toHaveBeenCalled();
    KeyEventHelper.simulate([0, 13]);
    expect(second).toHaveBeenCalledTimes(1);

    const third = jest.fn();
    render(<SpicyKeys keys={{ "escape enter": third }} />);

    expect(third).not.toHaveBeenCalled();
    KeyEventHelper.simulate([0, 27]);
    expect(third).not.toHaveBeenCalled();
    KeyEventHelper.simulate([0, 13]);
    expect(third).toHaveBeenCalledTimes(1);
  });

  test("handlers registered for individual keys within a sequence shouldnt fire if the sequence has already started", () => {
    const sequence = jest.fn();
    const solo = jest.fn();
    render(<SpicyKeys keys={{ "c a t": sequence, a: solo }} />);

    expect(sequence).not.toHaveBeenCalled();
    expect(solo).not.toHaveBeenCalled();
    KeyEventHelper.simulate("c");
    KeyEventHelper.simulate("a");
    expect(solo).not.toHaveBeenCalled();
    KeyEventHelper.simulate("t");
    expect(sequence).toHaveBeenCalledTimes(1);
    expect(solo).not.toHaveBeenCalled();
  });

  test("extra spaces within a sequence string should be ignored", () => {
    const sequence = jest.fn();
    render(<SpicyKeys keys={{ "c  a   t": sequence }} />);

    expect(sequence).not.toHaveBeenCalled();
    KeyEventHelper.simulate("c");
    KeyEventHelper.simulate("a");
    expect(sequence).not.toHaveBeenCalled();
    KeyEventHelper.simulate("t");
    expect(sequence).toHaveBeenCalled();
  });

  test("sequence handlers registered at the same time as modifier handlers both get called", () => {
    const sequence = jest.fn();
    const modifier = jest.fn();
    render(<SpicyKeys keys={{ "ctrl+a": modifier, "ctrl b": sequence }} />);

    expect(sequence).not.toHaveBeenCalled();
    expect(modifier).not.toHaveBeenCalled();

    // hit the sequence
    KeyEventHelper.simulate([0, 17], undefined, ["ctrl"]);
    KeyEventHelper.simulate("b");
    expect(modifier).not.toHaveBeenCalled();
    expect(sequence).toHaveBeenCalledTimes(1);

    // hit the modifier
    KeyEventHelper.simulate("a", undefined, ["ctrl"]);
    expect(sequence).toHaveBeenCalledTimes(1);
    expect(modifier).toHaveBeenCalledTimes(1);
  });

  test("sequences with a common prefix can both be called", () => {
    const A = jest.fn();
    const B = jest.fn();
    render(<SpicyKeys keys={{ "g o a": A, "g o b": B }} />);

    expect(A).not.toHaveBeenCalled();
    expect(B).not.toHaveBeenCalled();
    KeyEventHelper.simulate("g");
    KeyEventHelper.simulate("o");
    KeyEventHelper.simulate("a");
    expect(A).toHaveBeenCalledTimes(1);
    expect(B).not.toHaveBeenCalled();

    // KeyEventHelper.simulate("g");
    // KeyEventHelper.simulate("o");
    // KeyEventHelper.simulate("b");
    // expect(A).toHaveBeenCalledTimes(1);
    // expect(B).toHaveBeenCalledTimes(1);
  });

  test("sequences with a repeated common prefix can both be called", () => {
    const A = jest.fn();
    const B = jest.fn();
    render(<SpicyKeys keys={{ "g g a": A, "g g b": B }} />);

    expect(A).not.toHaveBeenCalled();
    expect(B).not.toHaveBeenCalled();
    KeyEventHelper.simulate("g");
    KeyEventHelper.simulate("g");
    KeyEventHelper.simulate("a");
    expect(A).toHaveBeenCalledTimes(1);
    expect(B).not.toHaveBeenCalled();

    KeyEventHelper.simulate("g");
    KeyEventHelper.simulate("g");
    KeyEventHelper.simulate("b");
    expect(A).toHaveBeenCalledTimes(1);
    expect(B).toHaveBeenCalledTimes(1);
  });

  test("sequences should not fire subsequences", () => {
    const short = jest.fn();
    const long = jest.fn();
    render(<SpicyKeys keys={{ "b c": short, "a b c": long }} />);

    expect(short).not.toHaveBeenCalled();
    expect(long).not.toHaveBeenCalled();
    KeyEventHelper.simulate("a");
    KeyEventHelper.simulate("b");
    KeyEventHelper.simulate("c");
    expect(long).toHaveBeenCalledTimes(1);
    expect(short).not.toHaveBeenCalled();
  });

  test("sequences should not fire subsequences when containing modifiers", () => {
    const short = jest.fn();
    const long = jest.fn();
    render(<SpicyKeys keys={{ "a b": short, "a option c": long }} />);

    expect(short).not.toHaveBeenCalled();
    expect(long).not.toHaveBeenCalled();
    KeyEventHelper.simulate("a");
    KeyEventHelper.simulate([0, 18], undefined, ["alt"]);
    KeyEventHelper.simulate("c");
    expect(long).toHaveBeenCalledTimes(1);
    expect(short).not.toHaveBeenCalled();
  });

  test("sequences which have been started can be broken and not invoked", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "h a t": fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("h");
    KeyEventHelper.simulate("a");
    KeyEventHelper.simulate("p");
    expect(fn).not.toHaveBeenCalled();

    KeyEventHelper.simulate("h");
    KeyEventHelper.simulate("a");
    KeyEventHelper.simulate("t");
    expect(fn).toHaveBeenCalled();
  });

  test("sequences containing combos at the end can be invoked", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "a ctrl+b": fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("a");
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("b", undefined, ["ctrl"]);
    expect(fn).toHaveBeenCalled();
  });

  test("sequences containing combos in the middle can be invoked", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "a ctrl+b c": fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("a");
    KeyEventHelper.simulate("b", undefined, ["ctrl"]);
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("c");
    expect(fn).toHaveBeenCalled();
  });

  test("sequences containing combos at the start can be invoked", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "ctrl+a b c": fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("a", undefined, ["ctrl"]);
    KeyEventHelper.simulate("b");
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("c");
    expect(fn).toHaveBeenCalled();
  });

  test("sequences containing multiple combos can be invoked", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "ctrl+a ctrl+b ctrl+c": fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("a", undefined, ["ctrl"]);
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("b", undefined, ["ctrl"]);
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("c", undefined, ["ctrl"]);
    expect(fn).toHaveBeenCalled();
  });

  test("sequences starting with the spacebar should work", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "space a b": fn }} />);

    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("space");
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("a");
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("b");
    expect(fn).toHaveBeenCalled();
  });

  test("konami code", () => {
    const fn = jest.fn();
    render(<SpicyKeys keys={{ "up down up down left right left right b a enter": fn }} />);

    KeyEventHelper.simulate("up");
    KeyEventHelper.simulate("down");
    KeyEventHelper.simulate("up");
    KeyEventHelper.simulate("down");
    KeyEventHelper.simulate("left");
    KeyEventHelper.simulate("right");
    KeyEventHelper.simulate("left");
    KeyEventHelper.simulate("right");
    KeyEventHelper.simulate("b");
    KeyEventHelper.simulate("a");
    expect(fn).not.toHaveBeenCalled();
    KeyEventHelper.simulate("enter");
    expect(fn).toHaveBeenCalled();
  });

  test("sequences allow some time between keypresses", () => {
    const sequence = jest.fn();
    render(<SpicyKeys keys={{ "c a t": sequence }} />);

    expect(sequence).not.toHaveBeenCalled();
    KeyEventHelper.simulate("c");
    jest.advanceTimersByTime(600);
    KeyEventHelper.simulate("a");
    jest.advanceTimersByTime(700);
    KeyEventHelper.simulate("t");
    expect(sequence).toHaveBeenCalledTimes(1);
  });

  test("if too much time elapses between sequence keypresses the sequence is reset", () => {
    const sequence = jest.fn();
    render(<SpicyKeys keys={{ "c a t": sequence }} />);

    expect(sequence).not.toHaveBeenCalled();
    KeyEventHelper.simulate("c");
    jest.advanceTimersByTime(600);
    KeyEventHelper.simulate("a");
    jest.advanceTimersByTime(1100);
    KeyEventHelper.simulate("t");
    expect(sequence).not.toHaveBeenCalled();

    // whole sequence needs to be run again to invoke the handler
    KeyEventHelper.simulate("c");
    jest.advanceTimersByTime(200);
    KeyEventHelper.simulate("a");
    jest.advanceTimersByTime(200);
    KeyEventHelper.simulate("t");
    expect(sequence).toHaveBeenCalled();
  });
});
