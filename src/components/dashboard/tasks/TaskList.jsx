import React, { forwardRef, Fragment  } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cond from 'lodash/cond';
import memoize from 'lodash/memoize';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from '@material-ui/core/Toolbar';
import Hidden from '@material-ui/core/Hidden';
import Fab from '@material-ui/core/Fab';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import AddIcon from '@material-ui/icons/Add';
import HomeRoundedIcon from '@material-ui/icons/HomeRounded';

import NOW_TASKS_LIMIT from '../../../constants/nowTasksLimit';
import * as dashboardTabs from '../../../constants/dashboardTabs';
import {
  selectNowTasks,
  selectBacklogTasks,
  selectScheduledTasks,
  selectBlockedTasks,
  selectHasMoveToBacklog,
} from '../../../modules/tasks';
import {
  selectDashboardActiveTab,
  setNewTaskDialogOpen,
  selectHighlightedTaskId,
  selectDashboadIsFetching,
} from '../../../modules/dashboard';
import Task from './Task';
import Sortable from './Sortable';
import TaskSiblingListDropArea, { DROP_AREA_HEIGHT } from './TaskSiblingListDropArea';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import useCreateTaskShortcut from './useCreateTaskShortcut';

import { CLOSED_DRAWER_WIDTH } from '../navigation/NavigationSidebar';

const emptyArray = [];

const selectorFunctionByPathname = {
  [dashboardTabs.NOW]: selectNowTasks,
  [dashboardTabs.BACKLOG]: selectBacklogTasks,
  [dashboardTabs.SCHEDULED]: selectScheduledTasks,
  [dashboardTabs.BLOCKED]: selectBlockedTasks,
  fallback: () => emptyArray,
};

const sectionTitlesByPath = {
  [dashboardTabs.NOW]: 'Top 4',
};

const iconsByPath = {
  [dashboardTabs.NOW]: HomeRoundedIcon,
};

const shouldShowPosition = memoize((tab) =>
  [dashboardTabs.NOW, dashboardTabs.BACKLOG].includes(tab),
);

const mapIds = memoize((tasks) => tasks.map(([id]) => id));

const useStyles = makeStyles((theme) => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    backgroundColor: theme.palette.common.white,
    color: theme.palette.primary.main,
    border: `solid 1px ${theme.palette.background.secondary}`,
    height: '4rem',
    width: '4rem',
  },
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '8vh',
    borderBottom: `solid 1px ${theme.palette.divider}`,
    outline: 'none'
  },
}));

const TaskList = forwardRef((_, ref) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const tab = useSelector(selectDashboardActiveTab);
  const highlighedTaskId = useSelector(selectHighlightedTaskId);
  const fetching = useSelector(selectDashboadIsFetching);
  const tasks = useSelector(selectorFunctionByPathname[tab] || selectorFunctionByPathname.fallback);
  const taskIds = mapIds(tasks);
  const showPosition = shouldShowPosition(tab);
  const positionOffset = tab === dashboardTabs.BACKLOG ? NOW_TASKS_LIMIT : 0;

  const hasMoveToBacklog = useSelector((state) =>
    tab === dashboardTabs.NOW ? selectHasMoveToBacklog(state) : false,
  );

  const sectionTitle = sectionTitlesByPath[tab] || 'Not found';
  const Icon = iconsByPath[tab] || Fragment;
  useCreateTaskShortcut();

  return (
    <Box flexGrow={1} ref={ref} display="flex" flexDirection="column">
      { tab === dashboardTabs.NOW && ( 
        <Box className={classes.titleContainer} component="div">
          <Icon className={classes.sectionTitleIcon} />
          <Typography variant="h5" component="h2">
            {sectionTitle}
          </Typography>
        </Box>
      )}
      {cond([
        [() => fetching, () => <LoadingState />],
        [() => taskIds.length === 0, () => <EmptyState tab={tab} />],
        [
          () => true,
          () => (
            <>
            <MenuList disablePadding>
              <Sortable
                id={`sortable-${tab}`}
                enabled={showPosition}
                dropAreaHeight={DROP_AREA_HEIGHT}
                itemIds={taskIds}
                indexOffset={positionOffset}
                renderItem={(id, index) => (
                  <Task
                    key={id}
                    id={id}
                    component={MenuItem}
                    highlighted={id === highlighedTaskId}
                    position={showPosition ? index + 1 + positionOffset : undefined}
                    // For performance, we indicate if the task should load blockers from the top
                    showBlockers={
                      tab === dashboardTabs.BLOCKED || tab === dashboardTabs.SCHEDULED
                    }
                  />
                )}
                renderDropAreaStart={
                  tab === dashboardTabs.BACKLOG
                    ? (isDraggingOver) => (
                        <TaskSiblingListDropArea
                          isDraggingOver={isDraggingOver}
                          title="Move to top 4"
                        />
                      )
                    : null
                }
                renderDropAreaEnd={
                  tab === dashboardTabs.NOW && hasMoveToBacklog
                    ? (isDraggingOver) => (
                        <TaskSiblingListDropArea
                          isDraggingOver={isDraggingOver}
                          title="Backlog"
                        />
                      )
                    : null
                }
              />
            </MenuList>
            </>
          ),
        ],
      ])()}

      {/* spacing for the mobile bottom toolbar */}
      <Hidden smUp>
        <Toolbar />
        <Toolbar />
      </Hidden>

      {/* uncomment for bringing back bottom nav on mobile */}
      {/* <Hidden xsDown> */}
      <Tooltip title="Create task (Space bar)" enterDelay={1000}>
        <Fab
          aria-label="Create task"
          color="default"
          className={classes.fab}
          onClick={() => dispatch(setNewTaskDialogOpen(true))}
        >
          <AddIcon fontSize="large" />
        </Fab>
      </Tooltip>
      {/* </Hidden> */}
    </Box>
  );
});

export default TaskList;
