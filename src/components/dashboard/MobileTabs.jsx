import React, { useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';

import { Paper, Box, Tab, Tabs } from '@material-ui/core';

import GoogleCalendar from '../gCalendar/GoogleCalendar';
import * as dashboardTabs from '../../constants/dashboardTabs';

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
      {value === index && <Box p={1}>{children}</Box>}
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
  root: {
    flexGrow: 1,
    width: '100%',
    height: '100vh',
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper>
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

export default MobileTabs;
