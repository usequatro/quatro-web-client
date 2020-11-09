import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import {
  selectGoogleCalendars,
} from '../../modules/googleCalendar';

const colors = {
  magenta: '#EB40AC',
  orange: '#F08934',
  blackboard: '#3C717B'
};

const useStyles = makeStyles(() => ({
  container: {
    flexGrow: 1,
    padding: 90,
    width: '100%',
  },
  listItem: {
    width: '100%',
    paddingTop: 30,
    paddingBottom: 30,
    border: 'solid 1px rgba(0, 0, 0, 0.03)',
    flexDirection: 'column',
  },
  listItemLabel: {
    color: 'rgba(0, 0, 0, 0.4)',
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
  }
}));

const RenderItem = ({googleCalendar}) => {
  const classes = useStyles();
  const [isActive, setActive] = useState("false");

  const toogleCalendar = (googleCalendarId) => {
    console.log('googleCalendarId',googleCalendarId, !isActive)
    setActive(!isActive);
  };
  return (
    <form>
      <ListItem
        className={classes.listItem}
      >
        <ListItemText
          primary={`Google Calendar Name: ${googleCalendar.summary}`}
          className={classes.listItemLabel}
        />
        <TextField id="standard-basic" label="Quatro Name..." />
        <RadioGroup style={{flexDirection: 'row'}}>
          <FormControlLabel
            value="female" 
            control={
              <Radio classes={{root: classes.radioMagenta,
                checked: classes.checkedMagenta}}
              />
            }
          />
          <FormControlLabel
            value="female2" 
            control={
              <Radio classes={{root: classes.radioOrange,
                checked: classes.checkedOrange}}
              />
            }
          />
          <FormControlLabel
            value="female1" 
            control={
              <Radio classes={{root: classes.radioBlackboard,
                checked: classes.checkedBlackboard}}
              />
            }
          />
        </RadioGroup>
        <Button onClick={() => toogleCalendar(googleCalendar.id)} variant="contained">{isActive ? 'Connect' : 'Disconnect'}</Button>
      </ListItem>
    </form>
  );
};

const GoogleCalendarList = () => {
  const classes = useStyles();
  const googleCalendars = useSelector(selectGoogleCalendars);
  console.log('GoogleCalendarList', googleCalendars)
  
  return (
    <Box className={classes.container}>
      <List>
        {googleCalendars.map(gc => {
          return (<RenderItem googleCalendar={gc} key={gc.etag} />)
        })}
      </List>
    </Box>
  )
};


export default GoogleCalendarList;

