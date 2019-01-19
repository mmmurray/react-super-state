import * as React from 'react'
import { fireEvent, render } from 'react-testing-library'
import createSuperState from '../src'

type State = {
  count: number
  letter: string
  value: string
}

const initialState: State = {
  count: 0,
  letter: 'a',
  value: '',
}

const reducers = {
  incrementWithUndo: (state: State) => ({ ...state, count: state.count + 1 }),
  setLetter: (state: State, letter: string) => ({ ...state, letter }),
  setValue: (state: State, value: string) => ({ ...state, value }),
}

const renderApp = () => {
  const { useSuperState, Provider } = createSuperState(reducers, initialState)

  const App = () => {
    const { actions, state, undo, redo, canUndo, canRedo } = useSuperState()

    return (
      <div>
        <span data-testid="text">{state.value}</span>
        <input
          data-testid="input"
          value={state.value}
          onChange={({ target: { value } }) => actions.setValue(value)}
        />
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

  const getText = () => getByTestId('text').textContent

  return {
    keyPress: (key: string) => {
      const input = getByTestId('input') as HTMLInputElement
      fireEvent.change(input, {
        target: { value: input.value + key },
      })
    },
    getText,
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
  const { undoButton, redoButton, getText, keyPress } = renderApp()

  expect(getText()).toBe('')
  expect(undoButton.textContent).toBe('Can undo: false')
  expect(redoButton.textContent).toBe('Can redo: false')

  keyPress('a')

  expect(getText()).toBe('a')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')

  keyPress('b')

  expect(getText()).toBe('ab')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(undoButton)

  expect(getText()).toBe('a')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: true')

  keyPress('z')

  expect(getText()).toBe('az')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(undoButton)

  expect(getText()).toBe('a')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(redoButton)

  expect(getText()).toBe('az')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')
})
