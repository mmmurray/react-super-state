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

function createSuperState<S, R extends { [name: string]: Reducer<S> }>(
  reducers: R,
  initialState: S,
) {
  const internalReducer = (
    state: S,
    { reducer, payload }: { reducer: Reducer<S>; payload: any },
  ) => reducer(state, payload)

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
    const [state, dispatch] = React.useReducer(internalReducer, initialState)

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

    return (
      <context.Provider
        value={{
          actions,
          state,
          undo: () => {},
          redo: () => {},
          canUndo: false,
          canRedo: false,
        }}
      >
        {children}
      </context.Provider>
    )
  }

  const useSuperState = () => React.useContext(context)

  return { Provider, useSuperState }
}

export default createSuperState
