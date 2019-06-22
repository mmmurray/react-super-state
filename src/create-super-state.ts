import React, { FC } from 'react'

type Reducer<S> = (state: Readonly<S>, payload?: any) => S

type ReducerPayloadType<S, R extends Function> = R extends (
  state: S,
  payload: infer P,
) => any
  ? P
  : never

type Context<S, A> = {
  actions: Readonly<A>
  state: Readonly<S>
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

type InternalState<S> = {
  states: S[]
  statePointer: number
}

type ActionOptions = {
  undoable?: boolean
}

type Options = {
  unstableUndo?: boolean
}

const undoReducer = /* istanbul ignore next */ (state: any): any => state
const redoReducer = /* istanbul ignore next */ (state: any): any => state

type Actions<S, R extends { [name: string]: Reducer<S> }> = {
  [N in keyof R]: (
    payload?: ReducerPayloadType<S, R[N]>,
    actionOptions?: ActionOptions,
  ) => void
}

type SuperStateHook<State, Actions> = {
  actions: Actions
  state: State
  undo?(): void
  redo?(): void
  canUndo?: boolean
  canRedo?: boolean
}

type SuperState<State, Actions> = {
  Provider: FC
  useSuperState(): SuperStateHook<State, Actions>
}

const createSuperState = <S, R extends { [name: string]: Reducer<S> }>(
  reducers: R,
  initialState: S,
  options: Options = {},
): SuperState<S, Actions<S, R>> => {
  const internalReducer = (
    { states, statePointer }: InternalState<S>,
    {
      reducer,
      payload,
      actionOptions,
    }: { reducer: Reducer<S>; payload?: any; actionOptions: ActionOptions },
  ): InternalState<S> => {
    if (reducer === undoReducer) {
      return statePointer > 0
        ? { states, statePointer: statePointer - 1 }
        : { states, statePointer }
    }

    if (reducer === redoReducer) {
      return statePointer < states.length - 1
        ? { states, statePointer: statePointer + 1 }
        : { states, statePointer }
    }

    const newState = reducer(states[statePointer], payload)

    if (actionOptions.undoable) {
      const newStates = [...states.slice(0, statePointer + 1), newState]

      return {
        states: newStates,
        statePointer: newStates.length - 1,
      }
    }

    return {
      states: [
        ...states.slice(0, statePointer),
        newState,
        ...states.slice(statePointer + 1),
      ],
      statePointer,
    }
  }

  const initialDefaultActions: Actions<S, R> = {} as any
  const defaultActions: Actions<S, R> = Object.keys(reducers).reduce<
    Actions<S, R>
  >(
    (acc: any, name): Actions<S, R> => ({
      ...acc,
      [name]: (): void => {},
    }),
    initialDefaultActions,
  )

  const context = React.createContext<Context<S, Actions<S, R>>>({
    actions: defaultActions,
    state: initialState,
    undo: /* istanbul ignore next */ (): void => {},
    redo: /* istanbul ignore next */ (): void => {},
    canUndo: false,
    canRedo: false,
  })

  const Provider: FC = ({ children }) => {
    const [{ states, statePointer }, dispatch] = React.useReducer(
      internalReducer,
      {
        states: [initialState],
        statePointer: 0,
      },
    )

    const initialActions: Actions<S, R> = {} as any
    const actions: Actions<S, R> = Object.keys(reducers).reduce<Actions<S, R>>(
      (acc: any, name): Actions<S, R> => ({
        ...acc,
        [name]: (payload?: any, actionOptions: ActionOptions = {}): void =>
          dispatch({
            reducer: reducers[name],
            payload,
            actionOptions,
          }),
      }),
      initialActions,
    )

    return React.createElement(
      context.Provider,
      {
        value: {
          actions,
          state: states[statePointer],
          undo: (): void =>
            dispatch({ reducer: undoReducer, actionOptions: {} }),
          redo: (): void =>
            dispatch({ reducer: redoReducer, actionOptions: {} }),
          canUndo: statePointer > 0,
          canRedo: statePointer < states.length - 1,
        },
      },
      children,
    )
  }

  const useSuperState = (): SuperStateHook<S, Actions<S, R>> => {
    const { actions, state, undo, redo, canUndo, canRedo } = React.useContext(
      context,
    )

    if (options.unstableUndo) {
      return { actions, state, undo, redo, canUndo, canRedo }
    }

    return { actions, state }
  }

  return { Provider, useSuperState }
}

export default createSuperState
