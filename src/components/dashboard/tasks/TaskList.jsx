import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import cond from 'lodash/cond';
import memoize from 'lodash/memoize';

import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';

import AddIcon from '@material-ui/icons/Add';

import NOW_TASKS_LIMIT from '../../../constants/nowTasksLimit';
import * as dashboardTabs from '../../../constants/dashboardTabs';
import {
  selectNowTasks,
  selectBacklogTasks,
  selectScheduledTasks,
  selectBlockedTasks,
  selectHasMoveToBacklog,
} from '../../../modules/tasks';
import { selectHighlightedTaskId, selectDashboadIsLoading } from '../../../modules/dashboard';
import useNewTaskDialogRouterControl from '../../hooks/useNewTaskDialogRouterControl';
import Task from './Task';
import Sortable from './Sortable';
import TaskSiblingListDropArea, { DROP_AREA_HEIGHT } from './TaskSiblingListDropArea';
import LoaderScreen from '../../ui/LoaderScreen';
import EmptyState from './EmptyState';
import useCreateTaskShortcut from './useCreateTaskShortcut';
import BalanceIcon from '../../icons/BalanceIcon';
import BreakfastIcon from '../../icons/BreakfastIcon';
import BeachIcon from '../../icons/BeachIcon';
import RunawayIcon from '../../icons/RunawayIcon';

const emptyArray = [];

const withMapIds = (fn) => (...args) => {
  const tasks = fn(...args);
  return tasks.map(([id]) => id);
};

const selectorFunctionByPathname = {
  [dashboardTabs.NOW]: withMapIds(selectNowTasks),
  [dashboardTabs.BACKLOG]: withMapIds(selectBacklogTasks),
  [dashboardTabs.SCHEDULED]: withMapIds(selectScheduledTasks),
  [dashboardTabs.BLOCKED]: withMapIds(selectBlockedTasks),
  fallback: () => emptyArray,
};

const shouldShowPosition = memoize((tab) =>
  [dashboardTabs.NOW, dashboardTabs.BACKLOG].includes(tab),
);

const emptyStateElementTypes = {
  [dashboardTabs.NOW]: BalanceIcon,
  [dashboardTabs.BACKLOG]: BreakfastIcon,
  [dashboardTabs.SCHEDULED]: BeachIcon,
  [dashboardTabs.BLOCKED]: RunawayIcon,
};
const emptyStateTexts = {
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
};

export const useStyles = makeStyles((theme) => ({
  taskListContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    paddingBottom: theme.spacing(15),
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    height: '4rem',
    width: '4rem',
    zIndex: theme.zIndex.speedDial,
  },
}));

const TaskList = ({ tab }) => {
  const classes = useStyles();

  const highlighedTaskId = useSelector(selectHighlightedTaskId);
  const loading = useSelector(selectDashboadIsLoading);
  const taskIds = useSelector(
    selectorFunctionByPathname[tab] || selectorFunctionByPathname.fallback,
  );
  const showPosition = shouldShowPosition(tab);
  const positionOffset = tab === dashboardTabs.BACKLOG ? NOW_TASKS_LIMIT : 0;

  const hasMoveToBacklog = useSelector((state) =>
    tab === dashboardTabs.NOW ? selectHasMoveToBacklog(state) : false,
  );

  const [, showNewTaskDialog] = useNewTaskDialogRouterControl();
  useCreateTaskShortcut();

  const scrollContainerRef = useRef();

  const [listWidth, setListWidth] = useState(0);
  useEffect(() => {
    const rect = scrollContainerRef.current.getBoundingClientRect();
    setListWidth(rect.width);
  }, []);

  return (
    <Box ref={scrollContainerRef} className={classes.taskListContainer}>
      {cond([
        [() => loading, () => <LoaderScreen />],
        [
          () => taskIds.length === 0,
          () => <EmptyState Image={emptyStateElementTypes[tab]} text={emptyStateTexts[tab]} />,
        ],
        [
          () => true,
          () => (
            <List disablePadding>
              <Sortable
                dashboardTab={tab}
                draggingEnabled
                droppingEnabled={showPosition}
                dropAreaHeight={DROP_AREA_HEIGHT}
                itemIds={taskIds}
                indexOffset={positionOffset}
                scrollContainerRef={scrollContainerRef}
                renderItem={(id, index) => (
                  <Task
                    key={id}
                    id={id}
                    highlighted={id === highlighedTaskId}
                    position={showPosition ? index + 1 + positionOffset : undefined}
                    // For performance, we indicate if the task should load blockers from the top
                    showBlockers={tab === dashboardTabs.BLOCKED || tab === dashboardTabs.SCHEDULED}
                    editable
                    parentContainerWidth={listWidth}
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
                        <TaskSiblingListDropArea isDraggingOver={isDraggingOver} title="Backlog" />
                      )
                    : null
                }
              />
            </List>
          ),
        ],
      ])()}

      <Tooltip title="Create task (Space bar)" enterDelay={500} arrow>
        <Fab
          aria-label="Create task"
          color="secondary"
          className={classes.fab}
          onClick={showNewTaskDialog}
        >
          <AddIcon fontSize="large" />
        </Fab>
      </Tooltip>
    </Box>
  );
};

TaskList.propTypes = {
  tab: PropTypes.oneOf(Object.values(dashboardTabs)).isRequired,
};

export default TaskList;
