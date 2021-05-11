import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider as MaterialThemeProvider } from '@material-ui/core/styles';
import Div100vh from 'react-div-100vh';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider as ReactReduxProvider } from 'react-redux';

import ErrorBoundary from './ErrorBoundary';
import RouterChangeTracker from './tracking/RouterChangeTracker';
import { MixpanelProvider } from './tracking/MixpanelContext';
import AppRouting from './AppRouting';
import { NotificationContextProvider, NotificationSnackbar } from './Notification';
import AuthManager from './AuthManager';
import muiTheme from './theme';
import createStore from '../store';
import LastActivityDateTracker from './tracking/LastActivityDateTracker';

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
          <Router {...routerProps}>
            <RouterChangeTracker />
            <LastActivityDateTracker />
            <Div100vh style={{ width: '100%', height: '100rvh' }}>
              <NotificationContextProvider>
                <AuthManager />
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
