import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import { markTaskIncomplete } from '../../../modules/tasks';
import TaskView from './TaskView';
import EmptyState from './EmptyState';
import TimerIcon from '../../icons/TimerIcon';
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
  [(completed) => isThisWeek(completed, { weekStartsOn: 1 }), () => 'thisWeek'],
  [() => true, () => 'rest'],
]);

const millisToMinutes = (millis) => millis / (1000 * 60);

/**
 * Component to visually update the completed checkbox at user's interaction, while actually
 * triggering the change to Firestore a bit later so user can undo it
 */
const CompletedPropBuffer = ({ children, id, onCompleteTask }) => {
  const [visualCompleted, setVisualCompleted] = useState(true);
  const cancelCompletion = useRef();

  const handleMarkIncomplete = useCallback(() => {
    setVisualCompleted(false);

    const timeout = setTimeout(() => {
      onCompleteTask(id);
    }, 1000);

    cancelCompletion.current = () => {
      clearTimeout(timeout);
      setVisualCompleted(true);
    };
  }, [id, onCompleteTask]);
  const handleMarkComplete = useCallback(() => {
    if (cancelCompletion.current) {
      cancelCompletion.current();
    }
  }, []);

  return children(visualCompleted, handleMarkIncomplete, handleMarkComplete);
};

const CompletedTaskList = () => {
  const { notifyError } = useNotification();
  const userId = useSelector(selectUserId);
  const dispatch = useDispatch();
  const classes = useTaskListStyles();

  const [status, setStatus] = useState(INITIAL);
  const [endReached, setEndReached] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);

  const taskListContainerRef = useRef();

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
    const node = taskListContainerRef.current;
    const handleScroll = () => {
      if (endReached || status === FETCHING) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const bottomReached = rect.height + node.scrollTop > node.scrollHeight - SCROLL_OFFSET;

      if (!bottomReached) {
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
    if (node) {
      node.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (node) {
        node.removeEventListener('scroll', handleScroll);
      }
    };
  }, [completedTasks, status, endReached, notifyError, userId]);

  const handleMarkIncompleteTask = useCallback(
    (id) => {
      // add the task, and dispatch the update that will be tracked
      dispatch(markTaskIncomplete(id));
      // Remove task from list
      setCompletedTasks((tasks) => tasks.filter(([ctid]) => ctid !== id));
    },
    [setCompletedTasks, dispatch],
  );

  const [listWidth, setListWidth] = useState(0);
  useEffect(() => {
    const rect = taskListContainerRef.current.getBoundingClientRect();
    setListWidth(rect.width);
  }, []);

  useCreateTaskShortcut();

  const renderTask = (id, task) => (
    <CompletedPropBuffer key={id} id={id} onCompleteTask={handleMarkIncompleteTask}>
      {(bufferedCompletedValue, onMarkTaskIncomplete, onCompleteTask) => (
        <TaskView
          id={id}
          title={task.title}
          description={task.description}
          scheduledStart={task.scheduledStart}
          snoozedUntil={null}
          due={task.due}
          effort={task.effort}
          calendarBlockDuration={
            task.calendarBlockEnd && task.calendarBlockStart
              ? millisToMinutes(task.calendarBlockEnd - task.calendarBlockStart)
              : undefined
          }
          prioritizedAheadOf={undefined}
          showBlockers={false}
          hasRecurringConfig={false}
          completed={bufferedCompletedValue}
          showCompletedAnimation={false}
          onMarkTaskIncomplete={onMarkTaskIncomplete}
          onCompleteTask={onCompleteTask}
          parentContainerWidth={listWidth}
        />
      )}
    </CompletedPropBuffer>
  );

  return (
    <Box className={classes.taskListContainer} ref={taskListContainerRef}>
      {cond([
        [() => status === ERROR, () => null],
        [() => status === FETCHING && completedTasks.length === 0, () => <LoaderScreen />],
        [() => completedTasks.length === 0, () => <EmptyState Image={TimerIcon} text="" />],
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
