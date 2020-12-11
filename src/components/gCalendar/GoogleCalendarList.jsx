import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { makeStyles, withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { connectCalendar, disconnectCalendar, saveCalendar } from '../../utils/apiClient';
import { colors, useCheckboxStyles } from './sharedStyles';
import ConnectButton from './ConnectButton';

import { selectUserId } from '../../modules/session';

import {
  selectGoogleAPIClient,
  selectGoogleCalendars,
  selectGoogleConnectedCalendars,
  getEventsFromCalendars,
} from '../../modules/googleCalendar';

const useStyles = makeStyles((theme) => ({
  container: {
    flexGrow: 1,
    width: '100%',
  },

  listItem: {
    width: '100%',
    paddingTop: 30,
    paddingBottom: 30,
    marginBottom: 20,
    border: 'solid 1px rgba(0, 0, 0, 0.03)',
    flexDirection: 'column',
    borderRadius: '1em',
  },

  checkBoxContainer: {
    flexDirection: 'row',
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },

  checkBox: {
    flexDirection: 'row',
    [theme.breakpoints.down('xs')]: {
      marginBottom: '20px',
    },
  },

  contentItemContainer: {
    flexDirection: 'row',
    width: '100%',
    borderBottom: `solid 1px ${theme.palette.divider}`,
  },

  listItemLabel: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: '0.70em',
    margin: '0.9em 0',
  },

  calendarButton: {
    margin: '0.9em',
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      justifyContent: 'center',
    },
  },
}));

const ConnectCalendarButton = withStyles((theme) => ({
  root: {
    color: theme.palette.common.dark,
    borderRadius: '2em',
    margin: '0.9em 0.9em 0 0',
  },
}))(Button);

const RenderItem = ({ googleCalendar }) => {
  const classes = useStyles();
  const checkboxClasses = useCheckboxStyles();
  const userId = useSelector(selectUserId);
  const calendarId = googleCalendar.id;
  const dispatch = useDispatch();
  const googleConnectedCalendars = useSelector(selectGoogleConnectedCalendars);

  const [isDisabled, setIsDisabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [name, setName] = useState('Calendar Name...');
  const [color, setColor] = useState('');
  const [required, setRequired] = useState('');

  const checkIfConnected = useCallback(() => {
    const calendars = googleConnectedCalendars.map((cc) => {
      return cc[1];
    });

    const connected = calendars.filter((c) => c.calendarId === calendarId)[0];

    if (connected) {
      setIsConnected(true);
      setName(connected.name);
      setColor(connected.color);
      setRequired('');
    }
  }, [googleConnectedCalendars, calendarId]);

  const connectGoogleCalendar = () => {
    const calendarObject = {
      calendarId: googleCalendar.id,
      name,
      color,
      userId,
    };
    connectCalendar(calendarObject);
    setIsConnected(true);
    dispatch(getEventsFromCalendars([calendarObject]));
  };

  const saveGoogleCalendar = () => {
    const calendarObject = {
      calendarId: googleCalendar.id,
      name,
      color,
      userId,
    };
    saveCalendar(calendarObject);
    dispatch(getEventsFromCalendars([calendarObject]));
  };

  const disconnectGoogleCalendar = () => {
    disconnectCalendar(calendarId, userId);
    setName('');
    setColor('');
    setIsConnected(false);
  };

  const setLabelName = () => {
    if (!isConnected) {
      setName('');
      setRequired('Required');
    }
  };

  const setGoogleCalendar = () => {
    if (isConnected) {
      disconnectGoogleCalendar();
      setName('Calendar Name...');
    } else {
      connectGoogleCalendar();
      setRequired('');
    }
  };

  const toggleEdit = () => {
    setIsDisabled(!isDisabled);
    saveGoogleCalendar();
  };

  const toggleCalendar = () => {
    setGoogleCalendar(calendarId);
  };

  useEffect(() => {
    checkIfConnected();
  }, [checkIfConnected, googleConnectedCalendars]);

  useEffect(() => {
    if (isConnected) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [isConnected]);

  return (
    <form>
      <ListItem className={classes.listItem}>
        <Box className={classes.contentItemContainer}>
          <ListItemText
            classes={{
              primary: classes.listItemLabel,
            }}
            primary={googleCalendar.summary}
          />
          <TextField
            InputLabelProps={{
              style: { color: '#7187B5' },
            }}
            disabled={!isDisabled}
            value={name}
            onClick={setLabelName}
            onChange={(e) => {
              setName(e.target.value);
              setRequired('');
            }}
            InputProps={{ disableUnderline: true }}
            id="standard-required"
            label={required}
          />
        </Box>
        <Box className={classes.checkBoxContainer} display="flex" justifyContent="space-between">
          <RadioGroup className={classes.checkBox}>
            {Object.keys(colors).map((key) => {
              return (
                <FormControlLabel
                  key={key}
                  value={colors[key]}
                  checked={color === key}
                  disabled={!isDisabled}
                  onClick={() => setColor(key)}
                  control={
                    <Radio
                      classes={{
                        root: checkboxClasses[key],
                        checked: checkboxClasses[`checked${key}`],
                      }}
                    />
                  }
                />
              );
            })}
          </RadioGroup>
          <Box>
            {isConnected && (
              <ConnectCalendarButton onClick={() => toggleEdit()} variant="outlined">
                {!isDisabled ? 'Edit' : 'Save'}
              </ConnectCalendarButton>
            )}
            <ConnectCalendarButton
              onClick={() => toggleCalendar()}
              variant="outlined"
              disabled={isDisabled && !isConnected}
            >
              {!isConnected ? 'Connect' : 'Disconnect'}
            </ConnectCalendarButton>
          </Box>
        </Box>
      </ListItem>
    </form>
  );
};

const GoogleCalendarList = () => {
  const classes = useStyles();
  const googleAPIClient = useSelector(selectGoogleAPIClient);
  const googleCalendars = useSelector(selectGoogleCalendars);

  const logOutGoogle = () => {
    googleAPIClient.auth2.getAuthInstance().signOut();
  };

  return (
    <Box className={classes.container}>
      <List>
        {googleCalendars &&
          googleCalendars.map((gc) => {
            return <RenderItem googleCalendar={gc} key={gc.etag} />;
          })}
      </List>
      {googleCalendars && googleCalendars.length > 0 && (
        <Box className={classes.calendarButton}>
          <ConnectButton onClick={() => logOutGoogle()} variant="contained">
            Disconnect Google Calendar
          </ConnectButton>
        </Box>
      )}
    </Box>
  );
};

export default GoogleCalendarList;

RenderItem.propTypes = {
  googleCalendar: PropTypes.oneOfType([PropTypes.object]),
};

RenderItem.defaultProps = {
  googleCalendar: {},
};
