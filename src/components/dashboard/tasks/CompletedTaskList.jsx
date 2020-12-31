import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import get from 'lodash/get';
import cond from 'lodash/cond';
import isToday from 'date-fns/isToday';
import isYesterday from 'date-fns/isYesterday';
import isThisWeek from 'date-fns/isThisWeek';

import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

import TaskListHeader from './TaskListHeader';
import { fetchListCompletedTasks, COMPLETED_TASKS_PAGE_SIZE } from '../../../utils/apiClient';
import { useNotification } from '../../Notification';
import { selectUserId } from '../../../modules/session';
import { undoCompleteTask } from '../../../modules/tasks';
import TaskView from './TaskView';
import EmptyState, { IMAGE_COMPLETED } from './EmptyState';
import LoaderScreen from '../../ui/LoaderScreen';
import useCreateTaskShortcut from './useCreateTaskShortcut';
import { useStyles as useTaskListStyles } from './TaskList';

const SCROLL_OFFSET = 30;

const INITIAL = 'initial';
const FETCHING = 'fetching';
const FETCHED = 'fetched';
const ERROR = 'error';

const getSection = cond([
  [(completed) => isToday(completed), () => 'today'],
  [(completed) => isYesterday(completed), () => 'yesterday'],
  [(completed) => isThisWeek(completed), () => 'thisWeek'],
  [() => true, () => 'rest'],
]);

const CompletedTaskList = () => {
  const { notifyError } = useNotification();
  const userId = useSelector(selectUserId);
  const dispatch = useDispatch();
  const classes = useTaskListStyles();

  const [status, setStatus] = useState(INITIAL);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [endReached, setEndReached] = useState(false);

  const { todayTasks, yesterdayTasks, thisWeekTasks, restTasks } = useMemo(
    () => ({
      todayTasks: completedTasks.filter(([, task]) => getSection(task.completed) === 'today'),
      yesterdayTasks: completedTasks.filter(
        ([, task]) => getSection(task.completed) === 'yesterday',
      ),
      thisWeekTasks: completedTasks.filter(([, task]) => getSection(task.completed) === 'thisWeek'),
      restTasks: completedTasks.filter(([, task]) => getSection(task.completed) === 'rest'),
    }),
    [completedTasks],
  );

  useEffect(() => {
    let unsubscribed = false;
    setStatus(FETCHING);
    fetchListCompletedTasks(userId)
      .then((results) => {
        if (unsubscribed) {
          return;
        }
        setCompletedTasks(results);
        setEndReached(results.length < COMPLETED_TASKS_PAGE_SIZE);
        setStatus(FETCHED);
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console
        notifyError('Error loading completed tasks');
        setStatus(ERROR);
      });
    return () => {
      unsubscribed = true;
    };
  }, [notifyError, userId]);

  useEffect(() => {
    const handleScroll = () => {
      if (endReached || status === FETCHING) {
        return;
      }

      const bottom =
        window.innerHeight + window.pageYOffset >= document.body.scrollHeight - SCROLL_OFFSET;

      if (!bottom) {
        return;
      }

      const lastTaskId = get(completedTasks[completedTasks.length - 1], '0');
      if (!lastTaskId) {
        console.warn('No lastTaskId', completedTasks); // eslint-disable-line no-console
        return;
      }

      setStatus(FETCHING);
      fetchListCompletedTasks(userId, lastTaskId)
        .then((results) => {
          if (results.length) {
            setCompletedTasks([...completedTasks, ...results]);
          }
          setEndReached(results.length < COMPLETED_TASKS_PAGE_SIZE);
          setStatus(FETCHED);
        })
        .catch((error) => {
          console.error(error); // eslint-disable-line no-console
          notifyError('Error loading completed tasks');
          setStatus(FETCHED);
        });
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [completedTasks, status, endReached, notifyError, userId]);

  const handleUncompleteTask = (id) => {
    // @TODO: handle clicking fast on a task uncompleted, should undo the uncompletion

    const completedTaskPair = completedTasks.find(([ctid]) => ctid === id);
    if (!completedTaskPair) {
      notifyError('Error updating task: not found');
      return;
    }

    // add the task, and dispatch the update that will be tracked
    dispatch(undoCompleteTask(id));

    // Mark as not completed so UI updates
    setCompletedTasks(
      completedTasks.map(([ctid, ctask]) =>
        ctid === id ? [ctid, { ...ctask, overrideCompletedCheckbox: true }] : [ctid, ctask],
      ),
    );
    // Remove task.
    setTimeout(() => {
      setCompletedTasks(completedTasks.filter(([ctid]) => ctid !== id));
    }, 750);
  };

  useCreateTaskShortcut();

  const renderTask = (id, task) => (
    <TaskView
      id={id}
      key={id}
      title={task.title}
      description={task.description}
      scheduledStart={task.scheduledStart}
      due={task.due}
      prioritizedAheadOf={undefined}
      showBlockers={false}
      hasRecurringConfig={false}
      completed={task.overrideCompletedCheckbox ? undefined : task.completed}
      onComplete={handleUncompleteTask}
    />
  );

  return (
    <Box className={classes.taskListContainer}>
      {cond([
        [() => status === ERROR, () => null],
        [() => status === FETCHING && completedTasks.length === 0, () => <LoaderScreen />],
        [() => completedTasks.length === 0, () => <EmptyState image={IMAGE_COMPLETED} text="" />],
        [
          () => true,
          () => (
            <>
              {todayTasks.length > 0 && (
                <>
                  <TaskListHeader>Today</TaskListHeader>
                  {todayTasks.map(([id, task]) => renderTask(id, task))}
                </>
              )}

              {yesterdayTasks.length > 0 && (
                <>
                  <TaskListHeader>Yesterday</TaskListHeader>
                  {yesterdayTasks.map(([id, task]) => renderTask(id, task))}
                </>
              )}

              {thisWeekTasks.length > 0 && (
                <>
                  <TaskListHeader>This week</TaskListHeader>
                  {thisWeekTasks.map(([id, task]) => renderTask(id, task))}
                </>
              )}

              {restTasks.length > 0 && (
                <>
                  <TaskListHeader>Previous</TaskListHeader>
                  {restTasks.map(([id, task]) => renderTask(id, task))}
                </>
              )}

              {/* next page loader */}
              {status === FETCHING && completedTasks.length > 0 && (
                <Box py={4} width="100%" display="flex" justifyContent="center" alignItems="center">
                  <CircularProgress color="primary" size={60} />
                </Box>
              )}
            </>
          ),
        ],
      ])()}
    </Box>
  );
};

export default CompletedTaskList;
