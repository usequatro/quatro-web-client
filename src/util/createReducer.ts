import { Action } from 'redux'

function createReducer(initialState: any, handlers: {[actionType: string]: Function}) {
  return function reducer(state = initialState, action: Action) {
    if ({}.hasOwnProperty.call(handlers, action.type)) {
      return handlers[action.type](state, action);
    }
    return state;
  };
}

export default createReducer;
