import * as React from 'react'
import { fireEvent, render } from 'react-testing-library'
import createSuperState from '../src'

type State = {
  count: number
}

const initialState: State = {
  count: 0,
}

const reducers = {
  incrementWithUndo: (state: State) => ({ ...state, count: state.count + 1 }),
}

test('can undo and redo', () => {
  const { useSuperState, Provider } = createSuperState(reducers, initialState)

  const Counter = () => {
    const { actions, state, undo, redo, canUndo, canRedo } = useSuperState()

    return (
      <div>
        <button
          onClick={() => actions.incrementWithUndo()}
          data-testid="increment"
        >
          Clicked {state.count} time(s)
        </button>
        <button data-testid="undo" onClick={undo}>
          Can undo: {`${canUndo}`}
        </button>
        <button data-testid="redo" onClick={redo}>
          Can redo: {`${canRedo}`}
        </button>
      </div>
    )
  }

  const { getByText, getByTestId } = render(
    <Provider>
      <Counter />
    </Provider>,
  )

  const incrementButton = getByTestId('increment')
  const undoButton = getByTestId('undo')
  const redoButton = getByTestId('redo')

  getByText('Clicked 0 time(s)')
  expect(undoButton.textContent).toBe('Can undo: false')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(incrementButton)

  getByText('Clicked 1 time(s)')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(incrementButton)

  getByText('Clicked 2 time(s)')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(undoButton)

  getByText('Clicked 1 time(s)')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(undoButton)

  getByText('Clicked 0 time(s)')
  expect(undoButton.textContent).toBe('Can undo: false')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(undoButton)
  getByText('Clicked 0 time(s)')
  expect(undoButton.textContent).toBe('Can undo: false')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(redoButton)

  getByText('Clicked 1 time(s)')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(redoButton)

  getByText('Clicked 2 time(s)')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(redoButton)

  getByText('Clicked 2 time(s)')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')
})
