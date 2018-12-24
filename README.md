# React Super State

[![Travis](https://img.shields.io/travis/mmmurray/react-super-state.svg)](https://travis-ci.org/mmmurray/react-super-state)
[![npm](https://img.shields.io/npm/v/react-super-state.svg)](https://www.npmjs.com/package/react-super-state)

A state management library using hooks.

### ⚠️ Note: This library is still in alpha, expect breaking changes.

## Usage

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
  <SuperStateProvider>
    <Display />
    <Add amount={1} />
    <Add amount={10} />
  </SuperStateProvider>
)

render(<App />, document.getElementById('root'))
```
