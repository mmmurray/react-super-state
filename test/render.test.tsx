import { fireEvent, render } from '@testing-library/react'
import React, { FC } from 'react'
import createSuperState from '../src'

type State = {
  count: number
}

const initialState: State = {
  count: 0,
}

const reducers = {
  increment: (state: State): State => ({ ...state, count: state.count + 1 }),
  add: (state: State, value: { amount: number }): State => ({
    ...state,
    count: state.count + value.amount,
  }),
}

test('can use super state', (): void => {
  const { useSuperState, Provider } = createSuperState(reducers, initialState)

  const Counter: FC = () => {
    const { actions, state } = useSuperState()

    return (
      <div>
        <button onClick={(): void => actions.increment()}>
          Clicked {state.count} time(s)
        </button>
      </div>
    )
  }

  const { getByText } = render(
    <Provider>
      <Counter />
    </Provider>,
  )

  const button = getByText('Clicked 0 time(s)')

  fireEvent.click(button)

  getByText('Clicked 1 time(s)')
})

test('state is initial and immutable when not wrapped in a provider', (): void => {
  const { useSuperState } = createSuperState(reducers, initialState)

  const Counter: FC = () => {
    const { actions, state } = useSuperState()

    return (
      <div>
        <button onClick={(): void => actions.increment()}>
          Clicked {state.count} time(s)
        </button>
      </div>
    )
  }

  const { getByText } = render(<Counter />)

  const button = getByText('Clicked 0 time(s)')

  fireEvent.click(button)

  getByText('Clicked 0 time(s)')
})

test('can pass value to reducer', (): void => {
  const { useSuperState, Provider } = createSuperState(reducers, initialState)

  const Counter: FC = () => {
    const { actions, state } = useSuperState()
    return (
      <div>
        <button onClick={(): void => actions.add({ amount: 22 })}>
          Clicked {state.count} time(s)
        </button>
      </div>
    )
  }

  const { getByText } = render(
    <Provider>
      <Counter />
    </Provider>,
  )

  const button = getByText('Clicked 0 time(s)')

  fireEvent.click(button)

  getByText('Clicked 22 time(s)')
})
