import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';

import HomeRoundedIcon from '@material-ui/icons/HomeRounded';
import HorizontalSplitRoundedIcon from '@material-ui/icons/HorizontalSplitRounded';
import CalendarTodayRoundedIcon from '@material-ui/icons/CalendarTodayRounded';
import BlockRoundedIcon from '@material-ui/icons/BlockRounded';
import AddIcon from '@material-ui/icons/Add';

import LabeledIconButton from '../../ui/LabeledIconButton';
import { selectDashboardActiveTab, setNewTaskDialogOpen } from '../../../modules/dashboard';
import * as paths from '../../../constants/paths';
import * as dashboardTabs from '../../../constants/dashboardTabs';

const useStyles = makeStyles((theme) => ({
  bottomToolbar: {
    backgroundColor: theme.palette.background.secondary,
    display: 'flex',
    justifyContent: 'space-evenly',
    padding: `${theme.spacing(1)}px 0`,
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
  },
  addButtonRoot: {
    borderRadius: '100%',
    backgroundColor: `${theme.palette.common.white} !important`,
    color: theme.palette.primary.main,
    border: `solid 1px ${theme.palette.background.secondary}`,
    top: '-1.5rem',
    padding: '0.75rem',
  },
}));

const BottomToolbar = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const activeTab = useSelector(selectDashboardActiveTab);

  return (
    <Toolbar className={classes.bottomToolbar}>
      <Slide in direction="up">
        <LabeledIconButton
          label="Top 4"
          icon={<HomeRoundedIcon />}
          active={activeTab === dashboardTabs.NOW}
          component={NavLink}
          to={paths.NOW}
        />
      </Slide>
      <Slide in direction="up">
        <LabeledIconButton
          label="Backlog"
          icon={<HorizontalSplitRoundedIcon />}
          active={activeTab === dashboardTabs.BACKLOG}
          component={NavLink}
          to={paths.BACKLOG}
        />
      </Slide>
      <Slide in direction="up">
        <Tooltip title="Create task (Space bar)" enterDelay={1000}>
          <IconButton
            aria-label="Create task"
            classes={{ root: classes.addButtonRoot }}
            onClick={() => dispatch(setNewTaskDialogOpen(true))}
          >
            <AddIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Slide>
      <Slide in direction="up">
        <LabeledIconButton
          label="Scheduled"
          icon={<CalendarTodayRoundedIcon />}
          active={activeTab === dashboardTabs.SCHEDULED}
          component={NavLink}
          to={paths.SCHEDULED}
        />
      </Slide>
      <Slide in direction="up">
        <LabeledIconButton
          label="Blocked"
          icon={<BlockRoundedIcon />}
          active={activeTab === dashboardTabs.BLOCKED}
          component={NavLink}
          to={paths.BLOCKED}
        />
      </Slide>
    </Toolbar>
  );
};

export default BottomToolbar;
