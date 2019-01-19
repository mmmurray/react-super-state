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

  const { getByTestId } = render(
    <Provider>
      <App />
    </Provider>,
  )

  const getText = () => getByTestId('text').textContent

  return {
    pressKey: (key: string) => {
      const input = getByTestId('input') as HTMLInputElement
      fireEvent.change(input, {
        target: { value: input.value + key },
      })
    },
    getText,
    undo: () => fireEvent.click(getByTestId('undo')),
    redo: () => fireEvent.click(getByTestId('redo')),
    canUndo: () => getByTestId('undo').textContent === 'Can undo: true',
    canRedo: () => getByTestId('redo').textContent === 'Can redo: true',
  }
}

test('can undo and redo', () => {
  const { canUndo, canRedo, getText, pressKey, undo, redo } = renderApp()

  expect(getText()).toBe('')
  expect(canUndo()).toBe(false)
  expect(canRedo()).toBe(false)

  pressKey('a')

  expect(getText()).toBe('a')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(false)

  pressKey('b')

  expect(getText()).toBe('ab')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(false)

  undo()

  expect(getText()).toBe('a')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(true)

  undo()

  expect(getText()).toBe('')
  expect(canUndo()).toBe(false)
  expect(canRedo()).toBe(true)

  undo()

  expect(getText()).toBe('')
  expect(canUndo()).toBe(false)
  expect(canRedo()).toBe(true)

  redo()

  expect(getText()).toBe('a')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(true)

  redo()

  expect(getText()).toBe('ab')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(false)

  redo()

  expect(getText()).toBe('ab')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(false)
})

test('can fork history', () => {
  const { undo, redo, canUndo, canRedo, getText, pressKey } = renderApp()

  expect(getText()).toBe('')
  expect(canUndo()).toBe(false)
  expect(canRedo()).toBe(false)

  pressKey('a')

  expect(getText()).toBe('a')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(false)

  pressKey('b')

  expect(getText()).toBe('ab')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(false)

  undo()

  expect(getText()).toBe('a')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(true)

  pressKey('z')

  expect(getText()).toBe('az')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(false)

  undo()

  expect(getText()).toBe('a')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(true)

  redo()

  expect(getText()).toBe('az')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(false)
})
