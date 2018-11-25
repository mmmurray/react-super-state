# React Super State

[![Travis](https://img.shields.io/travis/mmmurray/react-super-state.svg)](https://travis-ci.org/mmmurray/react-super-state)
[![npm](https://img.shields.io/npm/v/react-super-state.svg)](https://www.npmjs.com/package/react-super-state)

A state management library using hooks.

### ⚠️ Note: This library is still in alpha, expect breaking changes.

## Usage

```js
import React from 'react'
import { render } from 'react-dom'
import { useSuperState, SuperStateProvider } from 'react-super-state'

const initialState = {
  count: 0,
}

const reducers = {
  increment: state => ({ ...state, count: state.count + 1 }),
}

const Counter = () => {
  const { state, dispatch } = useSuperState()

  return (
    <button onClick={() => dispatch(reducers.increment)}>
      Clicked {state.count} times
    </button>
  )
}

const App = () => (
  <SuperStateProvider initialState={initialState}>
    <Counter />
    <Counter />
    <Counter />
  </SuperStateProvider>
)

render(<App />, document.getElementById('root'))
```
