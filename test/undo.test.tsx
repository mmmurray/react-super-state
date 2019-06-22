import { fireEvent, render } from '@testing-library/react'
import React, { FC } from 'react'
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
  setValue: (state: State, value: string): State => ({ ...state, value }),
  incrementCount: (state: State): State => ({
    ...state,
    count: state.count + 1,
  }),
}

type RenderedApp = {
  pressKey(key: string): void
  getText(): string
  undo(): void
  redo(): void
  canUndo(): boolean
  canRedo(): boolean
  increment(): void
  getCount(): number
}

const renderApp = (): RenderedApp => {
  const { useSuperState, Provider } = createSuperState(reducers, initialState, {
    unstableUndo: true,
  })

  const App: FC = () => {
    const { actions, state, undo, redo, canUndo, canRedo } = useSuperState()

    return (
      <div>
        <span data-testid="text">{state.value}</span>
        <input
          data-testid="input"
          value={state.value}
          onChange={({ target: { value } }): void =>
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

  const getText = (): string => getByTestId('text').textContent

  return {
    pressKey: (key: string): void => {
      const input = getByTestId('input') as HTMLInputElement
      fireEvent.change(input, {
        target: { value: input.value + key },
      })
    },
    getText,
    undo: (): void => {
      fireEvent.click(getByTestId('undo'))
    },
    redo: (): void => {
      fireEvent.click(getByTestId('redo'))
    },
    canUndo: (): boolean =>
      getByTestId('undo').textContent === 'Can undo: true',
    canRedo: (): boolean =>
      getByTestId('redo').textContent === 'Can redo: true',
    increment: (): void => {
      fireEvent.click(getByText('increment'))
    },
    getCount: (): number => Number(getByTestId('count').textContent),
  }
}

test('can undo and redo', (): void => {
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

test('can fork history', (): void => {
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

test('can mix undoable and non-undoable actions', (): void => {
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

test('unstable undo is disabled by default', (): void => {
  const { useSuperState } = createSuperState(reducers, initialState)

  const Foo: FC = () => {
    const p = useSuperState()

    return <pre>{JSON.stringify(Object.keys(p))}</pre>
  }

  const { container } = render(<Foo />)

  expect(JSON.parse(container.firstChild.textContent)).toStrictEqual([
    'actions',
    'state',
  ])
})
