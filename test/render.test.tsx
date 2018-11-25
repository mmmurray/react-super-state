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
}

test('render', () => {
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

  const button = getByText('The count is 0')

  fireEvent.click(button)

  getByText('The count is 1')
})
