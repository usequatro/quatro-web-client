import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import get from 'lodash/get';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

import { COMPLETED } from '../../../constants/dashboardTabs';
import { fetchListCompletedTasks, COMPLETED_TASKS_PAGE_SIZE } from '../../../utils/apiClient';
import { useNotification } from '../../Notification';
import { selectUserId } from '../../../modules/session';
import { undoCompleteTask } from '../../../modules/tasks';
import TaskView from './TaskView';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import useCreateTaskShortcut from './useCreateTaskShortcut';

const SCROLL_OFFSET = 30;

const INITIAL = 'initial';
const FETCHING = 'fetching';
const FETCHED = 'fetched';
const ERROR = 'error';

const CompletedTaskList = () => {
  const { notifyError } = useNotification();
  const userId = useSelector(selectUserId);
  const dispatch = useDispatch();

  const [status, setStatus] = useState(INITIAL);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [endReached, setEndReached] = useState(false);

  useEffect(() => {
    if (status !== INITIAL) {
      return;
    }
    setStatus(FETCHING);
    fetchListCompletedTasks(userId)
      .then((results) => {
        setCompletedTasks(results);
        setEndReached(results.length < COMPLETED_TASKS_PAGE_SIZE);
        setStatus(FETCHED);
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console
        notifyError('Error loading completed tasks');
        setStatus(ERROR);
      });
  }, [notifyError, status, userId]);

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
    const completedTaskPair = completedTasks.find(([ctid]) => ctid === id);
    if (!completedTaskPair) {
      notifyError('Error updating task: not found');
      return;
    }

    // Ask as incomplete, so it shows on the UI
    setCompletedTasks(
      completedTasks.map(([ctid, task]) => (ctid === id ? { ...task, completed: null } : task)),
    );

    // add the task, and dispatch the update that will be tracked
    dispatch(undoCompleteTask(id, completedTaskPair[1]));

    // Mark as not completed so UI updates
    setCompletedTasks(
      completedTasks.map(([ctid, ctask]) =>
        ctid === id ? [ctid, { ...ctask, completed: null }] : [ctid, ctask],
      ),
    );
    // Remove task.
    setTimeout(() => {
      setCompletedTasks(completedTasks.filter(([ctid]) => ctid !== id));
    }, 500);
  };

  useCreateTaskShortcut();

  return (
    <Box flexGrow={1} display="flex" flexDirection="column">
      {cond([
        [() => status === ERROR, () => null],
        [() => status === FETCHING && completedTasks.length === 0, () => <LoadingState />],
        [() => completedTasks.length === 0, () => <EmptyState tab={COMPLETED} />],
        [
          () => true,
          () => (
            <>
              {completedTasks.map(([id, task]) => (
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
                  completed={task.completed}
                  onComplete={handleUncompleteTask}
                />
              ))}

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
