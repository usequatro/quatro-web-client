/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';

import { Paper, Box, Tab, Tabs } from '@material-ui/core';

import GoogleCalendar from '../gCalendar/GoogleCalendar';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const idProps = (index) => {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
};

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100vh',
  },
  root: {
    flexGrow: 1,
    width: '100%',
  },

  indicator: {
    backgroundColor: theme.palette.background.default,
  },

  tabsContainer: {
    borderBottom: `solid 1px ${theme.palette.divider}`,
  },
}));

const TabStyle = withStyles((theme) => ({
  root: {
    padding: '1rem 0',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: '1.2rem',
    '&$selected': {
      color: theme.palette.background.default,
      fontWeight: theme.typography.fontWeightMedium,
    },
  },
  selected: {},
}))((props) => <Tab {...props} />);

const MobileTabs = ({ renderTask, activeTab }) => {
  const classes = useStyles();
  const [value, setValue] = useState(0);

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper className={classes.container}>
      <Tabs
        className={classes.tabsContainer}
        variant="fullWidth"
        value={value}
        onChange={handleChange}
        aria-label="tabs"
        classes={{
          indicator: classes.indicator,
        }}
      >
        <TabStyle label={activeTab} {...idProps(0)} />
        <TabStyle label="Calendar" {...idProps(1)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        {renderTask()}
      </TabPanel>
      <TabPanel value={value} index={1}>
        <GoogleCalendar />
      </TabPanel>
    </Paper>
  );
};

MobileTabs.propTypes = {
  renderTask: PropTypes.func.isRequired,
  activeTab: PropTypes.string.isRequired,
};

export default MobileTabs;
