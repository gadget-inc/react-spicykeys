# react-spicykeys

Add keyboard event handlers to your React application. Features:

- handle keyboard events close to the logic that cares about them in individual components
- ignore parent keyboard events in certain inner component trees
- support for individual keypresses (like `space`), key chords (like `ctrl+s`), and key sequences (like `g v G`)
- full React 18 & Concurrent Mode support
- Comes with full, accurate TypeScript types.

## Installation

Install the package from NPM or Yarn:

```
npm install react-spicykeys
```

or

```
yarn add react-spicykeys
```

`react-spicykeys` has TypeScript types right in the package.

## Usage

You can add keyhandlers that work regardless of where the user's current focus is with the `useSpicyKeys` hook or the `SpicyKeys` component. Both accept either a list of

### Approach Notes

- one set of DOM handlers for all events

### See Also

- [react-hotkeys](https://github.com/greena13/react-hotkeys) which is a more robust but unmaintained and not React 18 friendly hotkeys library
- [mousetrap](https://craig.is/killing/mice) which is a great raw-DOM key handling library with no React specialness

### Credits

Thanks to the authors of [react-hotkeys](https://github.com/greena13/react-hotkeys) and [mousetrap](https://craig.is/killing/mice) for their hard work. `react-spicykeys` is based on a lot of their ideas and code.
