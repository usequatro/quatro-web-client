import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider as MaterialThemeProvider } from '@material-ui/core/styles';
import Div100vh from 'react-div-100vh';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider as ReactReduxProvider } from 'react-redux';

import UserLoginListener from './UserLoginListener';
import ErrorBoundary from './ErrorBoundary';
import RouterChangeTracker from './tracking/RouterChangeTracker';
import { MixpanelProvider } from './tracking/MixpanelContext';
import AppRouting from './AppRouting';
import GoogleCalendarInit from './gCalendar/GoogleCalendarInit';
import { NotificationContextProvider, NotificationSnackbar } from './Notification';
import muiTheme from './theme';
import createStore from '../store';

const store = createStore();

// In Safari, when saving the website to home.
const isAppFullScreenMode = () => 'standalone' in window.navigator && window.navigator.standalone;

const [Router, routerProps] = isAppFullScreenMode()
  ? [MemoryRouter, { initialEntries: ['/'], initialIndex: 0 }]
  : [BrowserRouter, {}];

const App = () => (
  <ReactReduxProvider store={store}>
    <MixpanelProvider>
      <MaterialThemeProvider theme={muiTheme}>
        <ErrorBoundary>
          <CssBaseline />
          <GoogleCalendarInit />
          <Router {...routerProps}>
            <UserLoginListener />
            <RouterChangeTracker />
            <Div100vh style={{ width: '100%', height: '100rvh' }}>
              <NotificationContextProvider>
                <AppRouting />
                <NotificationSnackbar />
              </NotificationContextProvider>
            </Div100vh>
          </Router>
        </ErrorBoundary>
      </MaterialThemeProvider>
    </MixpanelProvider>
  </ReactReduxProvider>
);

export default App;
