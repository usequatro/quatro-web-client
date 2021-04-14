import React, { createContext, useReducer, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';

import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { makeStyles } from '@material-ui/core/styles';

import { createSlice } from '@reduxjs/toolkit';

import isRequired from '../utils/isRequired';

const TYPE_ERROR = 'error';
const TYPE_WARNING = 'warning';
const TYPE_INFO = 'info';
const TYPE_SUCCESS = 'success';

const AUTO_HIDE_DURATION = 3000;

const initialState = {
  isOpen: false,
  type: TYPE_ERROR,
  message: null,
  title: null,
  icon: null,
  buttons: [],
  ButtonListComponent: null,
  // isOpen: true,
  // type: TYPE_INFO,
  // message: 'Task Completed',
  // title: null,
  // icon: '🔥',
  // buttons: [{ children: 'Undo' }],
};

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotification: (
      state,
      { payload: { message, type, title, icon, buttons, ButtonListComponent } },
    ) => {
      state.isOpen = true;
      state.type = type || isRequired('type');
      state.message = message || isRequired('message');
      state.title = title || null;
      state.icon = icon || null;
      state.buttons = buttons || [];
      state.ButtonListComponent = ButtonListComponent || null;
    },
    setIsClosed: (state) => {
      state.isOpen = false;
    },
  },
});
/* eslint-enable no-param-reassign */

const NotificationContext = createContext(initialState);
export const useNotification = () => useContext(NotificationContext);

export function NotificationContextProvider({ children }) {
  const [state, dispatch] = useReducer(slice.reducer, initialState);

  const closeNotification = useCallback(() => {
    dispatch(slice.actions.setIsClosed());
  }, [dispatch]);

  const showNotification = useCallback(
    (type, data) => {
      closeNotification();

      const message = typeof data === 'string' ? data : data.message;
      const title = typeof data === 'string' ? null : data.title;
      const icon = typeof data === 'string' ? null : data.icon;
      const buttons = typeof data === 'string' ? null : data.buttons;
      const ButtonListComponent = typeof data === 'string' ? null : data.ButtonListComponent;

      dispatch(
        slice.actions.setNotification({
          type,
          title,
          icon,
          buttons,
          ButtonListComponent,
          message,
        }),
      );

      return closeNotification;
    },
    [dispatch, closeNotification],
  );

  const contextValue = {
    notifyError: useCallback((data) => showNotification(TYPE_ERROR, data), [showNotification]),
    notifyWarning: useCallback((data) => showNotification(TYPE_WARNING, data), [showNotification]),
    notifyInfo: useCallback((data) => showNotification(TYPE_INFO, data), [showNotification]),
    notifySuccess: useCallback((data) => showNotification(TYPE_SUCCESS, data), [showNotification]),
    closeNotification,
    state,
  };

  if (process.env.REACT_APP_DEVELOPMENT) {
    window.notification = contextValue;
  }

  return (
    <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>
  );
}

NotificationContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useStyles = makeStyles((theme) => ({
  snackbar: {
    marginBottom: theme.spacing(2),
  },
  noBackground: {
    backgroundColor: theme.palette.background.paper,
  },
}));

const DefaultButtonListComponent = ({ buttons, renderButton }) => (
  <>{(buttons || []).map((button, index) => renderButton(button, index))}</>
);
DefaultButtonListComponent.propTypes = {
  renderButton: PropTypes.func.isRequired,
  buttons: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export function NotificationSnackbar() {
  const { state, closeNotification } = useContext(NotificationContext);
  const { isOpen, message, type, title, icon, buttons, ButtonListComponent } = state;

  const ActionRenderer = ButtonListComponent || DefaultButtonListComponent;

  const classes = useStyles();

  return (
    <Snackbar
      className={classes.snackbar}
      anchorOrigin={{
        vertical: type === TYPE_ERROR || type === TYPE_WARNING ? 'top' : 'bottom',
        horizontal: 'center',
      }}
      open={isOpen}
      onClose={closeNotification}
      autoHideDuration={type === TYPE_ERROR || type === TYPE_WARNING ? null : AUTO_HIDE_DURATION}
    >
      <Alert
        elevation={8}
        variant="standard"
        onClose={closeNotification}
        severity={type}
        classes={{
          standardInfo: classes.noBackground,
          standardSuccess: classes.noBackground,
        }}
        icon={
          !icon
            ? undefined
            : {
                string: <Icon style={{ lineHeight: 1 }}>{icon}</Icon>,
                object: icon,
              }[typeof icon]
        }
        action={
          <ActionRenderer
            buttons={buttons}
            renderButton={(button) => (
              <Button
                key={JSON.stringify(button)}
                size="small"
                color="inherit"
                variant="outlined"
                {...button}
                onClick={(event) => {
                  if (button.onClick) {
                    button.onClick(event);
                  }
                  closeNotification();
                }}
              />
            )}
          />
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
}
