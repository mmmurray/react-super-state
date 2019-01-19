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

const undoReducer = (state: any) => state
const redoReducer = (state: any) => state

const createSuperState = <S, R extends { [name: string]: Reducer<S> }>(
  reducers: R,
  initialState: S,
) => {
  const internalReducer = (
    { states, statePointer }: InternalState<S>,
    { reducer, payload }: { reducer: Reducer<S>; payload?: any },
  ) => {
    if (reducer === undoReducer) {
      if (statePointer > 0) {
        return {
          states,
          statePointer: statePointer - 1,
        }
      }
      return { states, statePointer }
    }

    if (reducer === redoReducer) {
      return {
        states,
        statePointer: statePointer + 1,
      }
    }

    return {
      states: [...states, reducer(states[statePointer], payload)],
      statePointer: statePointer + 1,
    }
  }

  type Actions = {
    [N in keyof R]: (payload?: ReducerPayloadType<S, R[N]>) => void
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
        [name]: (payload?: any) =>
          dispatch({
            reducer: reducers[name],
            payload,
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
          undo: () => dispatch({ reducer: undoReducer }),
          redo: () => {},
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
