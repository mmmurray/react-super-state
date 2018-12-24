import * as React from 'react'

type Reducer<S> = (state: Readonly<S>, payload?: any) => S
type ReducerPayloadType<S, R extends Function> = R extends (
  state: S,
  payload: infer P,
) => any
  ? P
  : never

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

  const context = React.createContext<{
    actions: Readonly<Actions>
    state: Readonly<S>
  }>({
    actions: defaultActions,
    state: initialState,
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
      <context.Provider value={{ actions, state }}>{children}</context.Provider>
    )
  }

  const useSuperState = () => React.useContext(context)

  return { Provider, useSuperState }
}

export default createSuperState
