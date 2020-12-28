import React, { createContext, useReducer, useRef, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';

import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

import createReducer from '../utils/createReducer';

const TYPE_ERROR = 'error';
const TYPE_WARNING = 'warning';
const TYPE_INFO = 'info';
const TYPE_SUCCESS = 'success';

const initialState = {
  isOpen: false,
  message: null,
  type: TYPE_ERROR,
};

const SET_NOTIFICATION = 'SET_NOTIFICATION';
const SET_IS_CLOSED = 'SET_IS_CLOSED';

const reducer = createReducer(initialState, {
  [SET_NOTIFICATION]: (state, { payload: { message, type } }) => ({
    ...state,
    isOpen: true,
    message,
    type,
  }),
  [SET_IS_CLOSED]: (state) => ({
    ...state,
    isOpen: false,
  }),
});

const NotificationContext = createContext(initialState);
export const useNotification = () => useContext(NotificationContext);

export function NotificationContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const closeTimeout = useRef();

  const closeNotification = useCallback(() => {
    clearTimeout(closeTimeout.current);
    dispatch({ type: SET_IS_CLOSED });
  }, [dispatch]);

  const showNotification = useCallback(
    (type, message) => {
      closeNotification();

      dispatch({ type: SET_NOTIFICATION, payload: { type, message } });

      if (type !== TYPE_ERROR && type !== TYPE_WARNING) {
        closeTimeout.current = setTimeout(() => {
          dispatch({ type: SET_IS_CLOSED });
        }, 2500);
      }
    },
    [dispatch, closeNotification],
  );

  const contextValue = {
    notifyError: useCallback((msg) => showNotification(TYPE_ERROR, msg), [showNotification]),
    notifyWarning: useCallback((msg) => showNotification(TYPE_WARNING, msg), [showNotification]),
    notifyInfo: useCallback((msg) => showNotification(TYPE_INFO, msg), [showNotification]),
    notifySuccess: useCallback((msg) => showNotification(TYPE_SUCCESS, msg), [showNotification]),
    closeNotification,
    state,
  };

  return (
    <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>
  );
}

NotificationContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function NotificationSnackbar() {
  const { state, closeNotification } = useContext(NotificationContext);
  const { isOpen, message, type } = state;

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isOpen}
      onClose={closeNotification}
    >
      <Alert elevation={6} variant="filled" onClose={closeNotification} severity={type}>
        {message}
      </Alert>
    </Snackbar>
  );
}
