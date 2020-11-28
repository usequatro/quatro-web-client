import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import useStyles from './sharedStyles';
import Ticks from './Ticks';
import Events from './Events';

const CalendarTaskList = ({hours, events}) => {
  const classes = useStyles();

  return (
    <>
      <Ticks hours={hours} />
      <Box className={classes.eventsContainer}>
        <Events events={events} />
      </Box>
    </>
  );
};

CalendarTaskList.propTypes = {
  hours: PropTypes.arrayOf(PropTypes.string).isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired
}
export default CalendarTaskList;