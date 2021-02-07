import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import isValid from 'date-fns/isValid';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import isThisYear from 'date-fns/isThisYear';
import addDays from 'date-fns/addDays';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { CLOSED_DRAWER_WIDTH } from '../navigation-sidebar/NavigationSidebar';
import useDelayedState from '../../hooks/useDelayedState';

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
  calendarToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    maxWidth: '100vw',
  },
  formattedDate: {
    flexGrow: 1,
    textAlign: 'center',
  },
}));

const CalendarNavBar = ({ timestamp, fetching, onChange }) => {
  const classes = useStyles();

  // Introduce a delay before the spinner shows
  const showSpinner = useDelayedState(fetching, 500) && fetching;

  const longFormat = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const formattedDate = useMemo(() => {
    if (!isValid(timestamp)) {
      return '';
    }
    const fullDate = longFormat
      ? format(timestamp, 'PPPP')
      : format(timestamp, 'ccc, MMM do, yyyy');
    return isThisYear(timestamp) ? fullDate.replace(/,\s[0-9]{4}/, '') : fullDate;
  }, [timestamp, longFormat]);

  return (
    <AppBar position="static" color="inherit" className={classes.sectionTitleAppBar} elevation={0}>
      <Toolbar className={classes.calendarToolbar}>
        <Box display="flex" flexDirection="row" alignItems="center" width="50%">
          <IconButton
            variant="text"
            onClick={() => onChange(addDays(timestamp, -1).getTime())}
            edge="start"
            aria-label="Previous day"
          >
            {'<'}
          </IconButton>

          <Typography className={classes.formattedDate}>{formattedDate}</Typography>

          <IconButton
            variant="text"
            onClick={() => onChange(addDays(timestamp, 1).getTime())}
            edge="end"
            aria-label="Next day"
          >
            {'>'}
          </IconButton>
        </Box>

        {showSpinner && (
          <Box display="flex" justifyContent="center">
            <Tooltip title="Loading..." arrow>
              <CircularProgress thickness={3} size="1.5rem" color="inherit" />
            </Tooltip>
          </Box>
        )}

        <Box display="flex">
          <Box mr={1}>
            <Button
              variant="outlined"
              disabled={isToday(timestamp)}
              onClick={() => onChange(Date.now())}
            >
              Today
            </Button>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

CalendarNavBar.propTypes = {
  timestamp: PropTypes.number.isRequired,
  fetching: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CalendarNavBar;
