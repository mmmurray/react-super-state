import * as React from 'React'

type Reducer<T> = (state: T, action: any) => T
type Map<T> = { [s: string]: T }
type Action = undefined | Map<any>
type Dispatch<T> = (reducer: Reducer<T>, action?: Action) => void

type SuperStateProviderProps<T> = {
  reducers: Map<Reducer<T>>
  initialState: T
  children: any
}

type Context = { dispatch: Dispatch<any>; state: any }
const context = React.createContext<Context>({
  dispatch: () => null,
  state: {},
})

function SuperStateProvider<T>({
  initialState,
  children,
}: SuperStateProviderProps<T>) {
  const internalReducer = (
    state: T,
    { reducer, action }: { reducer: Reducer<T>; action: Action },
  ) => reducer(state, action)

  const [state, internalDispatch] = React.useReducer(
    internalReducer,
    initialState,
  )

  const dispatch: Dispatch<T> = (reducer: Reducer<T>, action?: Action) =>
    internalDispatch({ reducer, action })

  return (
    <context.Provider value={{ dispatch, state }}>{children}</context.Provider>
  )
}

const useSuperState = (): { dispatch: Dispatch<any>; state: any } =>
  React.useContext(context)

export { useSuperState, SuperStateProvider }
