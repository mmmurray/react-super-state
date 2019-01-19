import * as React from 'react'
import { fireEvent, render } from 'react-testing-library'
import createSuperState from '../src'

type State = {
  value: string
}

const initialState: State = {
  value: '',
}

const reducers = {
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
    undoButton: getByTestId('undo'),
    redoButton: getByTestId('redo'),
  }
}

test('can undo and redo', () => {
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

  fireEvent.click(undoButton)

  expect(getText()).toBe('')
  expect(undoButton.textContent).toBe('Can undo: false')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(undoButton)
  expect(getText()).toBe('')
  expect(undoButton.textContent).toBe('Can undo: false')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(redoButton)

  expect(getText()).toBe('a')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: true')

  fireEvent.click(redoButton)

  expect(getText()).toBe('ab')
  expect(undoButton.textContent).toBe('Can undo: true')
  expect(redoButton.textContent).toBe('Can redo: false')

  fireEvent.click(redoButton)

  expect(getText()).toBe('ab')
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
