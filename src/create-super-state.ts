import * as React from 'react'

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

const undoReducer = (state: any) => state
const redoReducer = (state: any) => state

const createSuperState = <S, R extends { [name: string]: Reducer<S> }>(
  reducers: R,
  initialState: S,
) => {
  const internalReducer = (
    { states, statePointer }: InternalState<S>,
    {
      reducer,
      payload,
      actionOptions,
    }: { reducer: Reducer<S>; payload?: any; actionOptions: ActionOptions },
  ) => {
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

  type Actions = {
    [N in keyof R]: (
      payload?: ReducerPayloadType<S, R[N]>,
      actionOptions?: ActionOptions,
    ) => void
  }

  const defaultActions: Actions = Object.keys(reducers).reduce<Actions>(
    (acc: any, name) => ({
      ...acc,
      [name]: (payload?: any) => {},
    }),
    {} as Actions,
  )

  const context = React.createContext<Context<S, Actions>>({
    actions: defaultActions,
    state: initialState,
    undo: () => {},
    redo: () => {},
    canUndo: false,
    canRedo: false,
  })

  const Provider: React.SFC<{}> = ({ children }) => {
    const [{ states, statePointer }, dispatch] = React.useReducer(
      internalReducer,
      {
        states: [initialState],
        statePointer: 0,
      },
    )

    const actions: Actions = Object.keys(reducers).reduce<Actions>(
      (acc: any, name) => ({
        ...acc,
        [name]: (payload?: any, actionOptions: ActionOptions = {}) =>
          dispatch({
            reducer: reducers[name],
            payload,
            actionOptions,
          }),
      }),
      {} as Actions,
    )

    return React.createElement(
      context.Provider,
      {
        value: {
          actions,
          state: states[statePointer],
          undo: () => dispatch({ reducer: undoReducer, actionOptions: {} }),
          redo: () => dispatch({ reducer: redoReducer, actionOptions: {} }),
          canUndo: statePointer > 0,
          canRedo: statePointer < states.length - 1,
        },
      },
      children,
    )
  }

  const useSuperState = () => React.useContext(context)

  return { Provider, useSuperState }
}

export default createSuperState
