import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import * as dashboardTabs from '../../../constants/dashboardTabs';

const emptyStateImages = {
  [dashboardTabs.SCHEDULED]: '/empty-states/empty-state-scheduled.png',
  [dashboardTabs.NOW]: '/empty-states/empty-state-top-4.png',
  [dashboardTabs.BLOCKED]: '/empty-states/empty-state-blocked.png',
  [dashboardTabs.BACKLOG]: '/empty-states/empty-state-backlog.png',
  [dashboardTabs.COMPLETED]: '/empty-states/empty-state-completed.png',
  [dashboardTabs.GOOGLE_CALENDAR]: '/empty-states/empty-state-top-4.png',
};

const emptyStateCopy = {
  [dashboardTabs.SCHEDULED]: [
    'All clear!',
    'You don’t have any scheduled meetings, follow-ups, reminders, or tasks.',
  ],
  [dashboardTabs.NOW]: ['Great job!', 'Your task list and headspace are clear.'],
  [dashboardTabs.BLOCKED]: [
    'The runway is clear!',
    "You don't have any dependencies blocking your tasks.",
  ],
  [dashboardTabs.BACKLOG]: [
    'Nice!',
    "You have an empty backlog. Keep your focus on what's important.",
  ],
  [dashboardTabs.GOOGLE_CALENDAR]: [
    'There are only so many hours in the day.',
    'Make sure you aren`t committing more than you have.'],
};

const useStyles = makeStyles(() => ({
  emptyStateContainer: {
    flexGrow: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContent: {
    width: '25rem',
    maxWidth: '95vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyStateImage: {
    width: '80%',
  },
}));

const EmptyState = ({ tab }) => {
  const classes = useStyles();

  const [currentTab, setCurrentTab] = useState(tab);

  useEffect(() => {
    const timeout = setTimeout(() => setCurrentTab(tab), 100);
    return () => clearTimeout(timeout);
  }, [tab]);

  return (
    <Box className={classes.emptyStateContainer}>
      <Fade in={tab === currentTab}>
        <div className={classes.emptyStateContent}>
          <img
            alt="Empty task list"
            className={classes.emptyStateImage}
            src={emptyStateImages[currentTab] || emptyStateImages[dashboardTabs.NOW]}
          />

          {(emptyStateCopy[currentTab] || []).map((text) => (
            <Typography gutterBottom key={text} align="center" color="secondary">
              {text}
            </Typography>
          ))}
        </div>
      </Fade>
    </Box>
  );
};

EmptyState.propTypes = {
  tab: PropTypes.oneOf(Object.values(dashboardTabs)).isRequired,
};

export default EmptyState;
