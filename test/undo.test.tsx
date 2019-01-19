import * as React from 'react'
import { fireEvent, render } from 'react-testing-library'
import createSuperState from '../src'

type State = {
  count: number
  letter: string
}

const initialState: State = {
  count: 0,
  letter: 'a',
}

const reducers = {
  incrementWithUndo: (state: State) => ({ ...state, count: state.count + 1 }),
  setLetter: (state: State, letter: string) => ({ ...state, letter }),
}

const renderApp = () => {
  const { useSuperState, Provider } = createSuperState(reducers, initialState)

  const App = () => {
    const { actions, state, undo, redo, canUndo, canRedo } = useSuperState()

    return (
      <div>
        <button onClick={() => actions.setLetter('a')}>Set to a</button>
        <button onClick={() => actions.setLetter('b')}>Set to b</button>
        <button onClick={() => actions.setLetter('c')}>Set to c</button>
        <button onClick={() => actions.setLetter('d')}>Set to d</button>
        <span data-testid="letter">{state.letter}</span>
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
      <App />
    </Provider>,
  )

  return {
    setToB: getByText('Set to b'),
    setToC: getByText('Set to c'),
    setToD: getByText('Set to d'),
    letter: getByTestId('letter'),
    undoButton: getByTestId('undo'),
    redoButton: getByTestId('redo'),
  }
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

  expect(incrementButton.textContent).toBe('Clicked 0 time(s)')
  expect(undoButton.textContent).toBe('Can undo: false')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(incrementButton)

  expect(incrementButton.textContent).toBe('Clicked 1 time(s)')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(incrementButton)

  expect(incrementButton.textContent).toBe('Clicked 2 time(s)')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(undoButton)

  expect(incrementButton.textContent).toBe('Clicked 1 time(s)')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(undoButton)

  expect(incrementButton.textContent).toBe('Clicked 0 time(s)')
  expect(undoButton.textContent).toBe('Can undo: false')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(undoButton)
  expect(incrementButton.textContent).toBe('Clicked 0 time(s)')
  expect(undoButton.textContent).toBe('Can undo: false')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(redoButton)

  expect(incrementButton.textContent).toBe('Clicked 1 time(s)')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(redoButton)

  expect(incrementButton.textContent).toBe('Clicked 2 time(s)')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(redoButton)

  expect(incrementButton.textContent).toBe('Clicked 2 time(s)')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')
})

test('can fork history', () => {
  const { setToB, setToC, setToD, letter, undoButton, redoButton } = renderApp()

  expect(letter.textContent).toBe('a')
  expect(undoButton.textContent).toBe('Can undo: false')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(setToB)

  expect(letter.textContent).toBe('b')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(setToC)

  expect(letter.textContent).toBe('c')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(undoButton)

  expect(letter.textContent).toBe('b')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(setToD)

  expect(letter.textContent).toBe('d')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(undoButton)

  expect(letter.textContent).toBe('b')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(redoButton)

  expect(letter.textContent).toBe('d')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')
})
