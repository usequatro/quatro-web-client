import React from 'react';
import PropTypes from 'prop-types';

import isValid from 'date-fns/isValid';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import addDays from 'date-fns/addDays';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';

import { CLOSED_DRAWER_WIDTH } from '../navigation/NavigationSidebar';

const useStyles = makeStyles((theme) => ({
  sectionTitleAppBar: {
    display: 'flex',
    justifyContent: 'stretch',
    alignItems: 'stretch',
    left: 0,
    right: 0,
    width: 'auto',
    borderBottom: `solid 1px ${theme.palette.divider}`,
    [theme.breakpoints.up('sm')]: {
      left: `${CLOSED_DRAWER_WIDTH}px`,
    },
  },
  sectionTitleAppBarToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

const CalendarNavBar = ({ date, onChange }) => {
  const classes = useStyles();

  return (
    <AppBar position="static" color="inherit" className={classes.sectionTitleAppBar} elevation={0}>
      <Toolbar className={classes.sectionTitleAppBarToolbar}>
        <Typography>{isValid(date) ? format(date, 'PPPP') : ''}</Typography>
        <Box display="flex">
          <Box mr={1}>
            <Button
              variant="outlined"
              disabled={isToday(date)}
              onClick={() => onChange(new Date())}
            >
              Today
            </Button>
          </Box>
          <ButtonGroup>
            <Button onClick={() => onChange(addDays(date, -1))}>{'<'}</Button>
            <Button onClick={() => onChange(addDays(date, 1))}>{'>'}</Button>
          </ButtonGroup>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

CalendarNavBar.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CalendarNavBar;
