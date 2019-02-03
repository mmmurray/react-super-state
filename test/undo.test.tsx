import * as React from 'react'
import { fireEvent, render } from 'react-testing-library'
import createSuperState from '../src'

type State = {
  value: string
  count: number
}

const initialState: State = {
  value: '',
  count: 0,
}

const reducers = {
  setValue: (state: State, value: string) => ({ ...state, value }),
  incrementCount: (state: State) => ({ ...state, count: state.count + 1 }),
}

const renderApp = () => {
  const { useSuperState, Provider } = createSuperState(reducers, initialState, {
    unstableUndo: true,
  })

  const App = () => {
    const { actions, state, undo, redo, canUndo, canRedo } = useSuperState()

    return (
      <div>
        <span data-testid="text">{state.value}</span>
        <input
          data-testid="input"
          value={state.value}
          onChange={({ target: { value } }) =>
            actions.setValue(value, { undoable: true })
          }
        />
        <button data-testid="undo" onClick={undo}>
          Can undo: {`${canUndo}`}
        </button>
        <button data-testid="redo" onClick={redo}>
          Can redo: {`${canRedo}`}
        </button>
        <span data-testid="count">{state.count}</span>
        <button onClick={actions.incrementCount}>increment</button>
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
    increment: () => fireEvent.click(getByText('increment')),
    getCount: () => Number(getByTestId('count').textContent),
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

test('can mix undoable and non-undoable actions', () => {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    getText,
    pressKey,
    increment,
    getCount,
  } = renderApp()

  expect(getCount()).toBe(0)
  expect(getText()).toBe('')
  expect(canUndo()).toBe(false)
  expect(canRedo()).toBe(false)

  increment()

  expect(getCount()).toBe(1)
  expect(getText()).toBe('')
  expect(canUndo()).toBe(false)
  expect(canRedo()).toBe(false)

  pressKey('a')

  expect(getCount()).toBe(1)
  expect(getText()).toBe('a')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(false)

  increment()

  expect(getCount()).toBe(2)
  expect(getText()).toBe('a')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(false)

  pressKey('b')

  expect(getCount()).toBe(2)
  expect(getText()).toBe('ab')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(false)

  undo()

  expect(getCount()).toBe(2)
  expect(getText()).toBe('a')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(true)

  increment()

  expect(getCount()).toBe(3)
  expect(getText()).toBe('a')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(true)

  pressKey('z')

  expect(getCount()).toBe(3)
  expect(getText()).toBe('az')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(false)

  undo()

  expect(getCount()).toBe(3)
  expect(getText()).toBe('a')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(true)

  increment()

  expect(getCount()).toBe(4)
  expect(getText()).toBe('a')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(true)

  redo()

  expect(getCount()).toBe(3)
  expect(getText()).toBe('az')
  expect(canUndo()).toBe(true)
  expect(canRedo()).toBe(false)
})

test('unstable undo is disabled by default', () => {
  const { useSuperState } = createSuperState(reducers, initialState)

  const Foo = () => {
    const p = useSuperState()

    return <pre>{JSON.stringify(Object.keys(p))}</pre>
  }

  const { container } = render(<Foo />)

  expect(JSON.parse(container.firstChild.textContent)).toStrictEqual([
    'actions',
    'state',
  ])
})
