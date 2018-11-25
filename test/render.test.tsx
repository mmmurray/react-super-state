import * as React from 'react'
import { fireEvent, render } from 'react-testing-library'
import { useSuperState, SuperStateProvider } from '../src'

type State = {
  count: number
}

const initialState = {
  count: 0,
}

const reducers = {
  increment: (state: State) => ({ ...state, count: state.count + 1 }),
  add: (state: State, value: { amount: number }) => ({
    ...state,
    count: state.count + value.amount,
  }),
}

test('can use super state', () => {
  const Counter = () => {
    const { dispatch, state } = useSuperState()
    return (
      <div>
        <button onClick={() => dispatch(reducers.increment)}>
          Clicked {state.count} time(s)
        </button>
      </div>
    )
  }

  const { getByText } = render(
    <SuperStateProvider initialState={initialState} reducers={reducers}>
      <Counter />
    </SuperStateProvider>,
  )

  const button = getByText('Clicked 0 time(s)')

  fireEvent.click(button)

  getByText('Clicked 1 time(s)')
})

test('state is empty when not wrapped in a provider', () => {
  const Counter = () => {
    const { dispatch, state } = useSuperState()
    return (
      <div>
        <button onClick={() => dispatch(reducers.increment)}>
          Clicked {state.count} time(s)
        </button>
      </div>
    )
  }

  const { getByText } = render(<Counter />)

  const button = getByText('Clicked time(s)')

  fireEvent.click(button)

  getByText('Clicked 1 time(s)')
})

test('can pass value to reducer', () => {
  const Counter = () => {
    const { dispatch, state } = useSuperState()
    return (
      <div>
        <button onClick={() => dispatch(reducers.add, { amount: 22 })}>
          Clicked {state.count} time(s)
        </button>
      </div>
    )
  }

  const { getByText } = render(
    <SuperStateProvider initialState={initialState} reducers={reducers}>
      <Counter />
    </SuperStateProvider>,
  )

  const button = getByText('Clicked 0 time(s)')

  fireEvent.click(button)

  getByText('Clicked 22 time(s)')
})
