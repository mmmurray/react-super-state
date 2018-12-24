# React Super State

[![Travis](https://img.shields.io/travis/mmmurray/react-super-state.svg)](https://travis-ci.org/mmmurray/react-super-state)
[![npm](https://img.shields.io/npm/v/react-super-state.svg)](https://www.npmjs.com/package/react-super-state)

A state management library using hooks.

### ⚠️ Note: This library is still in alpha, expect breaking changes.

## Usage

[![Edit 01lyjy810p](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/01lyjy810p)

```js
import React from 'react'
import { render } from 'react-dom'
import createSuperState from 'react-super-state'

const initialState = {
  value: 0,
}

const reducers = {
  add: (state, payload) => ({
    ...state,
    value: state.value + payload.amount,
  }),
}

const { useSuperState, Provider } = createSuperState(reducers, initialState)

const Display = () => {
  const { state } = useSuperState()

  return <span>Value is: {state.value}</span>
}

const Add = ({ amount }) => {
  const { actions } = useSuperState()

  return <button onClick={() => actions.add({ amount })}>Add {amount}</button>
}

const App = () => (
  <Provider>
    <Display />
    <Add amount={1} />
    <Add amount={10} />
  </Provider>
)

render(<App />, document.getElementById('root'))
```

To create a new state provider and custom hook, call `createSuperState` giving it a map of reducer functions and the initial state. A reducer function is passed two arguments, the first is the current state, and the second is a payload object which should contain enough information to transform the current state into a new state. Each reducer function should return an entirely new state object which will replace the previous state.

The object returned from `createSuperState` contains a `Provider` and a `useSuperState` custom hook. Any component that uses `useSuperState` must at some level be rendered inside of the `Provider` component. The `useSuperState` hook also returns an object with two properties. One is `state` which holds the current state and the other is `actions` which is a map of functions for updating the state. There is one action per reducer and each action takes one argument which is the payload for that reducer.

## Best Practices

- Create a singleton module that exports the result of calling `createSuperState` so that it can be imported anywhere in the codebase.
- It is strongly advised to avoid mutating the state object that is passed to the reducer functions and returned from `useSuperState`.

## TypeScript

React Super State includes full TypeScript definitions. Type information is infered from the initial state object and the reducer function arguments so that the `state` and `actions` objects returned from `useSuperState` are fully typed to provide an fully type safe API.

In addition TypeScript will return a read only state from `useSuperState` to prevent accidental mutation.
