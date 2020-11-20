import React, { useState, useEffect, useCallback, useReducer } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

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
import { connectCalendar, disconnectCalendar } from '../../utils/apiClient';

import {
  selectUserId,
} from '../../modules/session';

import {
  selectGoogleCalendars,
  selectGoogleConnectedCalendars,
  getEventsFromCalendars,
} from '../../modules/googleCalendar';

const colors = {
  magenta: '#EB40AC',
  orange: '#F08934',
  blackboard: '#3C717B'
};

const useStyles = makeStyles((theme) => ({
  container: {
    flexGrow: 1,
    padding: '1vh 3vw',
    width: '100%',
  },
  listItem: {
    width: '100%',
    paddingTop: 30,
    paddingBottom: 30,
    marginBottom:20,
    border: 'solid 1px rgba(0, 0, 0, 0.03)',
    flexDirection: 'column',
    borderRadius: '1em',
  },
  checkBoxContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  contentItemContainer: {
    flexDirection: 'row',
    width: '100%',
    borderBottom: `solid 1px ${theme.palette.divider}`,
    margin: '0.9em 0'
  },
  listItemLabel: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: '0.95em',
    margin: '0.9em 0'
  },
  radioMagenta: {
    color: colors.magenta,
    '&$checkedMagenta': {
      color: colors.magenta
    }
  },
  checkedMagenta: {
    color: colors.magenta
  },
  radioOrange: {
    color: colors.orange,
    '&$checkedOrange': {
      color: colors.orange
    }
  },
  checkedOrange: {
    color: colors.orange
  },
  radioBlackboard: {
    color: colors.blackboard,
    '&$checkedBlackboard': {
      color: colors.blackboard
    }
  },
  checkedBlackboard: {
    color: colors.blackboard
  },
}));

const ConnectCalendarButton = withStyles((theme) => ({
  root: {
    color: theme.palette.common.dark, 
    borderRadius: '2em',
  },
}))(Button);

const RenderItem = ({googleCalendar}) => {
  const classes = useStyles();
  const userId = useSelector(selectUserId);
  const calendarId = googleCalendar.id;
  const dispatch = useDispatch();
  const history = useHistory();
  const googleConnectedCalendars = useSelector(selectGoogleConnectedCalendars);

  const [isDisabled, setIsDisabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  
  const checkIfConnected = useCallback(
    () => {
      const calendars = googleConnectedCalendars.map(cc => {return cc[1]})
      const connected = calendars.filter(c => c.calendarId === calendarId)[0];
      if (connected) {
        setIsConnected(true);
        setName(connected.name)
        setColor(connected.color)
      }
    },
    [googleConnectedCalendars, calendarId],
  );

  useEffect(() => {
    checkIfConnected();
  }, [checkIfConnected, googleConnectedCalendars])

  useEffect(() => {
    if (name.length > 0 && color.length > 0) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [name, color])

  const connectGoogleCalendar = () => {
    const calendarObject = {
      calendarId: googleCalendar.id,
      name,
      color,
      userId
    }
    connectCalendar(calendarObject);
    setIsConnected(true);
    dispatch(getEventsFromCalendars([calendarObject]))
  }

  const disconnectGoogleCalendar = () => {
    disconnectCalendar(calendarId, userId);
    setName('');
    setColor('');
    setIsConnected(false);
  }

  const setGoogleCalendar = () => {
    if (isConnected) {
      disconnectGoogleCalendar()
    } else {
      connectGoogleCalendar()
    }
  }

  const toggleCalendar = () => {
    setGoogleCalendar(calendarId);
  };

  return (
    <form>
      <ListItem
        className={classes.listItem}
      >
      <Box className={classes.contentItemContainer}>
        <ListItemText
          classes={{
            primary: classes.listItemLabel, 
          }}
          primary={googleCalendar.summary}
        />
        <TextField
          InputLabelProps={{
            style: { color: '#7187B5'},
          }}
          disabled={isConnected}
          value={name}
          onChange={e => setName(e.target.value)}
          InputProps={{ disableUnderline: true,  }}
          id="standard-basic"
          label="Quatro Name..."
        />
      </Box>
      <Box className={classes.checkBoxContainer} display='flex' justifyContent='space-between'>
        <RadioGroup style={{flexDirection: 'row'}}>
          <FormControlLabel
            value="radioMagenta"
            checked={color === 'radioMagenta'}
            onClick={() => setColor('radioMagenta')}
            control={
              <Radio classes={{root: classes.radioMagenta,
                checked: classes.checkedMagenta}}
              />
            }
          />
          <FormControlLabel
            value="radioOrange" 
            checked={color === 'radioOrange'}
            onClick={() => setColor('radioOrange')}
            control={
              <Radio classes={{root: classes.radioOrange,
                checked: classes.checkedOrange}}
              />
            }
          />
          <FormControlLabel
            value="radioBlackboard"
            checked={color === 'radioBlackboard'}
            onClick={() => setColor('radioBlackboard')}
            control={
              <Radio classes={{root: classes.radioBlackboard,
                checked: classes.checkedBlackboard}}
              />
            }
          />
        </RadioGroup>
        <ConnectCalendarButton
          onClick={() => toggleCalendar()}
          variant="outlined"
          disabled={isDisabled && !isConnected}
        >
          {!isConnected ? 'Connect' : 'Disconnect'}
        </ConnectCalendarButton>
      </Box>
      </ListItem>
    </form>
  );
};

const GoogleCalendarList = () => {
  const classes = useStyles();
  const googleCalendars = useSelector(selectGoogleCalendars);

  return (
    <Box className={classes.container}>
      <List>
        {googleCalendars.map(gc => {
          return (
            <RenderItem 
              googleCalendar={gc}
              key={gc.etag} 
            />)
        })}
      </List>
    </Box>
  )
};

export default GoogleCalendarList;


RenderItem.propTypes = {
  googleCalendar: PropTypes.oneOfType([PropTypes.object]),
};

RenderItem.defaultProps = {
  googleCalendar: {},
};