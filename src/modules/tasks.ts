import sortBy from 'lodash/sortBy';
import omit from 'lodash/omit';
import uniq from 'lodash/uniq';
import mapValues from 'lodash/mapValues';
import keyBy from 'lodash/keyBy';
import difference from 'lodash/difference';
import findIndex from 'lodash/findIndex';
import uuid from 'uuid/v4';
import createReducer from '../util/createReducer';
import { trackTaskCreated, taskTaskCompleted } from '../util/tracking';
import isRequired from '../util/isRequired';
import NOW_TASKS_LIMIT from '../constants/nowTasksLimit';
import { TASK, FREE_TEXT } from '../constants/dependencyTypes';
import {
  showInfoNotification,
  showErrorNotification,
  showNetworkErrorNotification,
  hideNotification,
} from './notification';
import { RESET } from './reset';
import { selectUserId } from './session';
import * as dashboardTabs from '../constants/dashboardTabs';
import { DASHBOARD_TABS_TO_PATHS } from '../constants/paths';
import * as apiClient from './apiClient';

import { Task, TaskDependency, RecurringConfig } from '../types';
import invert from 'lodash/invert';

export const NAMESPACE = 'tasks';

type TaskUnfiltered = { [s: string]: any };
type Updates = { [s: string]: any };

const TASK_KEY_DEFAULTS = {
  effort: null,
  impact: null,
  description: '',
  due: null,
  scheduledStart: null,
  completed: null,
  trashed: null,
  dependencyIds: [],
  recurringConfigId: null,
};
const TASK_KEYS_FOR_REDUX = {
  id: true,
  title: true,
  effort: true,
  impact: true,
  description: true,
  created: true,
  due: true,
  scheduledStart: true,
  completed: true,
  score: true,
  trashed: true,
  userId: true,
  prioritizedAheadOf: true,
  dependencyIds: true,
  recurringConfigId: true,
};
const TASK_KEYS_FOR_API = {
  title: true,
  effort: true,
  impact: true,
  description: true,
  created: true,
  due: true,
  scheduledStart: true,
  completed: true,
  trashed: true,
  userId: true,
  blockedBy: true,
  prioritizedAheadOf: true,
  recurringConfigId: true,
};

// Utilities

const generateId = (prefix = '_') => `${prefix}${uuid()}`;
// const isTemporaryId = id => /^_/.test(id);

const filterTaskKeys = (task:TaskUnfiltered, keys:{[s:string]:boolean}):object => {
  const filteredTask = Object.entries(task).reduce((memo, [key, value]) => {
    if (!keys[key]) {
      console.warn(`[tasks] Unknown key "${key}" with value "${value}" in task ${task.id}`);
      return memo;
    }
    return { ...memo, [key]: value };
  }, {});
  return filteredTask;
};

const filterTaskForRedux = (task:TaskUnfiltered):Task => (
  filterTaskKeys(task, TASK_KEYS_FOR_REDUX) as Task
);
const filterTaskForApi = (task:TaskUnfiltered):apiClient.TaskApiWithId => (
  filterTaskKeys(task, TASK_KEYS_FOR_API) as apiClient.TaskApiWithId
);

const normalizeBase = (value:number, from:number, to:number) => (value * to) / from;
const convertMillisecondsToDays = (time:number) => time / (1000 * 60 * 60 * 24);
const getDaysDue = (due:number) => convertMillisecondsToDays(Math.max(due - Date.now(), 0));

const calculateScore = (impact:number|null, effort:number|null, due:number|null) => {
  if (!Number.isInteger(impact!) || !Number.isInteger(effort!)) {
    return 0;
  }
  const normalizedImpact = normalizeBase(impact!, 7, 10);
  const normalizedEffort = normalizeBase(effort!, 7, 10);

  const weightenedImpact = normalizedImpact ** 1.5;
  const weightenedEffort = normalizedEffort ** 1;

  // https://www.wolframalpha.com/input/?i=plot+2%2Fx
  const daysUntilFactor = due
    ? 1 + 2 / Math.min(getDaysDue(due), 10000)
    : 1;

  return (weightenedImpact / weightenedEffort) * daysUntilFactor;
};
const addScore = (task:Task|TaskUnfiltered):Task|TaskUnfiltered => ({
  ...task,
  score: calculateScore(task.impact, task.effort, task.due),
});

const toInt = (value:any, fallback:number|null):number|null => (
  !Number.isNaN(Number.parseInt(value, 10))
    ? Number.parseInt(value, 10)
    : fallback
);

// Action types

const SET_TASKS = `${NAMESPACE}/SET_TASKS`;
const ADD_TASK = `${NAMESPACE}/ADD_TASK`;
const REMOVE_TASK_FROM_ALL_IDS = `${NAMESPACE}/REMOVE_TASK_FROM_ALL_IDS`;
const UPDATE_TASK = `${NAMESPACE}/UPDATE_TASK`;
const UPDATE_TASK_BATCH = `${NAMESPACE}/UPDATE_TASK_BATCH`;
const RESET_TASKS = `${NAMESPACE}/RESET_TASKS`;
const UPDATE_TASK_DEPENDENCY = `${NAMESPACE}/UPDATE_TASK_DEPENDENCY`;
const REMOVE_TASK_DEPENDENCY = `${NAMESPACE}/REMOVE_TASK_DEPENDENCY`;
const CREATE_TASK_DEPENDENCY = `${NAMESPACE}/CREATE_TASK_DEPENDENCY`;
const SET_RECURRING_CONFIGS = `${NAMESPACE}/SET_RECURRING_CONFIGS`;
const UPDATE_RECURRING_CONFIG = `${NAMESPACE}/UPDATE_RECURRING_CONFIG`;
const REMOVE_RECURRING_CONFIG = `${NAMESPACE}/REMOVE_RECURRING_CONFIG`;

// Reducers

const INITIAL_STATE = {
  tasks: {
    byId: {},
    allIds: [],
  },
  taskDependencies: {
    byId: {},
    allIds: [],
  },
  recurringConfigs: {
    byId: {},
    allIds: [],
  },
};

type NormalizedEntities<Entity> = {
  allIds: string[],
  byId: { [s: string]: Entity },
};
type S = {
  tasks: NormalizedEntities<Task>,
  taskDependencies: NormalizedEntities<TaskDependency>,
  recurringConfigs: NormalizedEntities<RecurringConfig>,
};

export const reducer = createReducer(INITIAL_STATE, {
  [UPDATE_TASK]: (
    state:S,
    { payload: { taskId, updates } }:{payload:{taskId:string, updates:Updates}},
  ) => ({
    ...state,
    tasks: {
      ...state.tasks,
      byId: {
        ...state.tasks.byId,
        [taskId]: filterTaskForRedux(addScore({
          ...state.tasks.byId[taskId],
          ...updates,
        })),
      },
    },
  }),
  [UPDATE_TASK_BATCH]: (
    state:S,
    { payload: { updatesByTaskId } } : {payload:{updatesByTaskId:{[s:string]:Updates}}},
  ) => ({
    ...state,
    tasks: {
      ...state.tasks,
      byId: {
        ...state.tasks.byId,
        ...mapValues(updatesByTaskId, (updates, taskId) => (
          filterTaskKeys(addScore({
            ...state.tasks.byId[taskId],
            ...updates,
          }), TASK_KEYS_FOR_REDUX)
        )),
      },
    },
  }),
  [SET_TASKS]: (
    state:S,
    action: {payload:{tasks:NormalizedEntities<Task>, taskDependencies: NormalizedEntities<TaskDependency>}},
  ) => ({
    ...state,
    tasks: {
      allIds: uniq([
        ...state.tasks.allIds,
        ...action.payload.tasks.allIds,
      ]),
      byId: {
        ...state.tasks.byId,
        ...mapValues(action.payload.tasks.byId, (task) => (
          filterTaskKeys(addScore(task), TASK_KEYS_FOR_REDUX)
        )),
      },
    },
    taskDependencies: {
      allIds: [
        ...state.taskDependencies.allIds,
        ...action.payload.taskDependencies.allIds,
      ],
      byId: {
        ...state.taskDependencies.byId,
        ...action.payload.taskDependencies.byId,
      },
    },
  }),
  [ADD_TASK]: (state:S, action:{payload:{task:TaskUnfiltered}}) => ({
    ...state,
    tasks: {
      allIds: [...state.tasks.allIds, action.payload.task.id],
      byId: {
        ...state.tasks.byId,
        [action.payload.task.id]: filterTaskKeys(
          addScore(action.payload.task),
          TASK_KEYS_FOR_REDUX,
        ),
      },
    },
  }),
  [REMOVE_TASK_FROM_ALL_IDS]: (state:S, { payload: taskId }:{payload:string}) => ({
    ...state,
    tasks: {
      ...state.tasks,
      allIds: state.tasks.allIds.filter((id) => id !== taskId),
    },
  }),
  [RESET]: () => ({ ...INITIAL_STATE }),
  [RESET_TASKS]: () => ({ ...INITIAL_STATE }),
  [UPDATE_TASK_DEPENDENCY]: (
    state:S,
    { payload: { id, updates } }:{payload:{id:string, updates: Updates}},
  ) => ({
    ...state,
    taskDependencies: {
      ...state.taskDependencies,
      byId: {
        ...state.taskDependencies.byId,
        [id]: {
          ...state.taskDependencies.byId[id],
          ...updates,
        },
      },
    },
  }),
  [REMOVE_TASK_DEPENDENCY]: (
    state:S,
    { payload: { dependencyId, taskId } }:{payload:{dependencyId:string, taskId:string}},
  ) => ({
    ...state,
    tasks: {
      ...state.tasks,
      byId: {
        ...state.tasks.byId,
        [taskId]: {
          ...state.tasks.byId[taskId],
          dependencyIds: state.tasks.byId[taskId].dependencyIds.filter((id) => id !== dependencyId),
        },
      },
    },
    taskDependencies: {
      ...state.taskDependencies,
      allIds: state.taskDependencies.allIds.filter((id) => id !== dependencyId),
    },
  }),
  [CREATE_TASK_DEPENDENCY]: (
    state:S,
    { payload: dependency }:{payload:TaskDependency},
  ) => ({
    ...state,
    taskDependencies: {
      ...state.taskDependencies,
      allIds: [...state.taskDependencies.allIds, dependency.id],
      byId: {
        ...state.taskDependencies.byId,
        [dependency.id]: {
          ...dependency,
        },
      },
    },
    tasks: {
      ...state.tasks,
      byId: {
        ...state.tasks.byId,
        [dependency.taskId]: {
          ...state.tasks.byId[dependency.taskId],
          dependencyIds: [
            ...state.tasks.byId[dependency.taskId].dependencyIds,
            dependency.id,
          ],
        },
      },
    },
  }),
  [SET_RECURRING_CONFIGS]: (
    state : S,
    { payload } : { payload : NormalizedEntities<RecurringConfig> }
  ) => ({
    ...state,
    recurringConfigs: {
      allIds: uniq([
        ...state.recurringConfigs.allIds,
        ...payload.allIds,
      ]),
      byId: {
        ...state.recurringConfigs.byId,
        ...payload.byId,
      },
    },
  }),
  [UPDATE_RECURRING_CONFIG]: (
    state : S,
    { payload } : { payload : { id: string, updates: object } }
  ) => ({
    ...state,
    recurringConfigs: {
      allIds: uniq([
        ...state.recurringConfigs.allIds,
        payload.id,
      ]),
      byId: {
        ...state.recurringConfigs.byId,
        [payload.id]: {
          ...(state.recurringConfigs.byId[payload.id] || {}),
          ...payload.updates,
        },
      },
    },
  }),
  [REMOVE_RECURRING_CONFIG]: (
    state : S,
    { payload } : { payload : string }
  ) => ({
    ...state,
    recurringConfigs: {
      ...state.recurringConfigs,
      allIds: state.recurringConfigs.allIds.filter(id => id !== payload),
      byId: omit(state.recurringConfigs.byId, payload),
    },
  }),
});

type AS = { [NAMESPACE]: S };

// Selectors

export const selectTask = (state:AS, id:string) => state[NAMESPACE].tasks.byId[id];

const selectNonTrashedTasks = (state:AS) => (
  state[NAMESPACE].tasks.allIds
    .map((id) => state[NAMESPACE].tasks.byId[id])
    .filter((task) => task.trashed == null)
);

const selectTaskDependency = (state:AS, id:string) => state[NAMESPACE].taskDependencies.byId[id];

const isDependencyApplicable = (state:AS, dependency:TaskDependency):boolean => {
  if (dependency.type === TASK) {
    const dependencyTask = selectTask(state, dependency.config.taskId!);
    return dependencyTask && dependencyTask.completed == null;
  }
  return true;
};

const isNewUnsavedDependency = (dependency:TaskDependency):boolean => (
  dependency.type === TASK && dependency.config.taskId === null
);

export const selectTaskDependencies = (state:AS, ids = null) => (
  (ids || state[NAMESPACE].taskDependencies.allIds)
    .map((id) => selectTaskDependency(state, id))
    .filter((dependency) => (
      isDependencyApplicable(state, dependency)
    || isNewUnsavedDependency(dependency)
    ))
);

const selectIsTaskBlocked = (state:AS, taskId:string) => {
  const task = selectTask(state, taskId);
  const dependencies = task.dependencyIds.map((id) => selectTaskDependency(state, id));
  const nonCompletedDependencies = dependencies
    .filter((dependency) => isDependencyApplicable(state, dependency));
  return nonCompletedDependencies.length > 0;
};

const applyRelativePrioritization = (tasks: Task[]) => {
  const taskBaseToAheadOf:{[s:string]: string[]} = tasks.reduce((memo: {[s:string]: string[]}, task) => {
    if (task.prioritizedAheadOf) {
      return {
        ...memo,
        [task.prioritizedAheadOf]: [
          ...(memo[task.prioritizedAheadOf] || []),
          task.id,
        ],
      };
    }
    return memo;
  }, {});

  const topTaskIds = tasks.filter((task) => !task.prioritizedAheadOf).map((task) => task.id);

  let updatedTasksIds = topTaskIds;
  const maxIterations = 10;
  let iterations = 0;

  do {
    updatedTasksIds = updatedTasksIds.reduce((memo:string[], id:string) => {
      if (taskBaseToAheadOf[id]) {
        const tasksAhead = taskBaseToAheadOf[id];
        delete taskBaseToAheadOf[id];
        return [...memo, ...tasksAhead, id];
      }
      return [...memo, id];
    }, []);
    iterations += 1;
  } while (updatedTasksIds.length < tasks.length && iterations < maxIterations);

  const taskIdsMissing = difference(tasks.map((task) => task.id), updatedTasksIds);

  if (taskIdsMissing.length) {
    console.warn('Failed to prioritize all tasks.', taskIdsMissing);
  }

  const prioritizedTaskIds = taskIdsMissing.length
    ? [...updatedTasksIds, ...taskIdsMissing]
    : updatedTasksIds;

  const tasksById = keyBy(tasks, 'id');
  return prioritizedTaskIds
    .map((id) => tasksById[id]);
};

const selectNonCompletedTasks = (state:AS) => (
  selectNonTrashedTasks(state)
    .filter((task) => task.completed == null)
);

const selectUpcomingSortedTasks = (state:AS) => {
  const now = Date.now();
  const tasks = selectNonCompletedTasks(state)
    .filter((task) => task.scheduledStart == null || task.scheduledStart <= now)
    .filter((task) => !selectIsTaskBlocked(state, task.id));
  const tasksSortedByScore = sortBy(tasks, 'score').reverse();
  return applyRelativePrioritization(tasksSortedByScore);
};

export const selectNowTasks = (state:AS) => {
  const sortedTasks = selectUpcomingSortedTasks(state);
  return sortedTasks.slice(0, NOW_TASKS_LIMIT);
};
export const selectNextTasks = (state:AS) => {
  const sortedTasks = selectUpcomingSortedTasks(state);
  return sortedTasks.slice(NOW_TASKS_LIMIT);
};
export const selectBlockedTasks = (state:AS) => {
  const tasks = selectNonCompletedTasks(state);
  const blockedTasks = tasks.filter(({ id }) => selectIsTaskBlocked(state, id));
  return sortBy(blockedTasks, 'score').reverse();
};
export const selectScheduledTasks = (state:AS) => {
  const now = Date.now();
  const tasks = selectNonCompletedTasks(state)
    .filter((task) => task.scheduledStart != null && task.scheduledStart > now);
  return sortBy(tasks, 'scheduledStart');
};
export const selectCompletedTasks = (state:AS) => {
  const tasks = state[NAMESPACE].tasks.allIds
    .map((id) => state[NAMESPACE].tasks.byId[id])
    .filter((task) => task.completed != null);
  return sortBy(tasks, 'completed').reverse();
};
export const selectDependenciesBlockingGivenTask = (state:AS, blockedTaskId:string) => {
  const task = selectTask(state, blockedTaskId);
  const { dependencyIds } = task;

  const dependencies = (dependencyIds || []).map((id) => selectTaskDependency(state, id));

  const dependenciesAndTasks:Array<[TaskDependency, Task | null]> = dependencies.reduce((memo: any, dependency: TaskDependency) => {
    if (dependency.type === FREE_TEXT) {
      return [
        ...memo,
        [dependency, null],
      ];
    } if (dependency.type === TASK) {
      const dependencyTask = selectTask(state, dependency.config.taskId!);
      if (dependencyTask) {
        return [
          ...memo,
          [dependency, dependencyTask],
        ];
      }
      return memo;
    }
    throw new Error(`Dependency type not supported ${dependency.type}`);
  }, []);

  return dependenciesAndTasks;
};
export const selectUndeletedTask = (state:AS, id:string) => {
  const task = selectTask(state, id);
  return !task || task.trashed ? undefined : task;
};
export const selectTasksForDependencySelection = (state:AS, id:string) => (
  selectNonCompletedTasks(state)
    .filter((task) => task.id !== id)
);
const selectTasksPrioritizedAheadOf = (state:AS, id:string) => (
  selectNonCompletedTasks(state)
    .filter((task) => task.prioritizedAheadOf === id)
);

const containsTaskId = (tasks:Task[], id:string) => tasks.filter((task) => task.id === id).length > 0;

export const selectSectionForTask = (state:AS, taskId:string) => {
  switch (true) {
    case containsTaskId(selectNowTasks(state), taskId):
      return dashboardTabs.NOW;
    case containsTaskId(selectNextTasks(state), taskId):
      return dashboardTabs.NEXT;
    case containsTaskId(selectBlockedTasks(state), taskId):
      return dashboardTabs.BLOCKED;
    case containsTaskId(selectScheduledTasks(state), taskId):
      return dashboardTabs.SCHEDULED;
    default:
      return undefined;
  }
};

export const selectRecurringConfig = (state:AS, id:string) => state[NAMESPACE].recurringConfigs.byId[id];

// Actions

const normalizeTasks = (rawTasks:any[]) => {
  const tasksAllIds = rawTasks.map((task) => task.id);
  const tasksById = rawTasks.reduce((memo, { blockedBy, ...task }) => ({
    ...memo,
    [task.id]: {
      id: task.id,
      dependencyIds: [],
      ...task,
    },
  }), {});

  const tasks:NormalizedEntities<Task> = {
    allIds: tasksAllIds,
    byId: tasksById,
  };

  const taskDependencies:NormalizedEntities<TaskDependency> = {
    byId: {},
    allIds: [],
  };

  rawTasks.forEach(({ id, blockedBy }) => {
    (blockedBy || []).forEach((dependency:any) => {
      const dependencyId = generateId();
      const dependencyWithBackwardsRelationship:TaskDependency = {
        id: dependencyId,
        taskId: id,
        ...dependency,
      };

      taskDependencies.allIds.push(dependencyId);
      taskDependencies.byId[dependencyId] = dependencyWithBackwardsRelationship;

      tasksById[id].dependencyIds.push(dependencyId);
    });
  });

  return { tasks, taskDependencies };
};

const serializeTask = (state:AS, id:string) => {
  const normalizedTask = selectTask(state, id);
  const {
    dependencyIds,
    id: taskId,
    score,
    ...restData
  } = normalizedTask;

  const blockedBy = dependencyIds
    .map((dependencyId) => selectTaskDependency(state, dependencyId))
    .map((dependency) => omit(dependency, ['id', 'taskId']));

  const serializedTask = {
    ...restData,
    blockedBy,
  };

  return serializedTask;
};

export const setTasks = (tasks: apiClient.TaskApiWithId[]) => {
  const parsedTasks = tasks.map((task) => {
    const impact = toInt(task.impact, null);
    const effort = toInt(task.effort, null);
    return {
      ...task,
      blockedBy: (task.blockedBy || []).filter(Boolean),
      impact,
      effort,
      id: `${task.id}`,
    };
  });
  const normalizedEntities = normalizeTasks(parsedTasks);
  return {
    type: SET_TASKS,
    payload: { ...normalizedEntities },
  };
};

const normalizeRecurringConfigs = (recurringConfigs: RecurringConfig[]) => (
  recurringConfigs.reduce((memo, rc:RecurringConfig) => (rc === null ? memo : {
    allIds: [
      ...memo.allIds,
      rc.id,
    ],
    byId: {
      ...memo.byId,
      [rc.id]: rc,
    },
  }), { allIds: [], byId: {} } as NormalizedEntities<RecurringConfig> )
);

export const setRecurringConfigs = (recurringConfigs: RecurringConfig[]) => {
  const normalizedEntities = normalizeRecurringConfigs(recurringConfigs);
  return {
    type: SET_RECURRING_CONFIGS,
    payload: { ...normalizedEntities },
  };
};

export const updateTask = (taskId:string, updates:Updates) => (dispatch:Function) => {
  dispatch({
    type: UPDATE_TASK,
    payload: { taskId, updates },
  });
  return apiClient.updateTask(taskId, filterTaskForApi(updates));
};
export const updateTaskBatch = (updatesByTaskId:{[id:string]: Updates}) => (dispatch:Function) => {
  dispatch({
    type: UPDATE_TASK_BATCH,
    payload: { updatesByTaskId },
  });
  return apiClient.updateTaskBatch(
    mapValues(updatesByTaskId, (updates) => filterTaskForApi(updates)),
  );
};

export const setRelativePrioritization = (sourceTaskId:string, sourceIndex:number, destinationIndex:number) => (
  (dispatch:Function, getState:Function) => {
    const realDestinationIndex = sourceIndex < destinationIndex
      ? destinationIndex + 1
      : destinationIndex;

    const state = getState();
    const allTasks = selectUpcomingSortedTasks(state);

    if (realDestinationIndex >= allTasks.length || !allTasks[realDestinationIndex]) {
      dispatch(showErrorNotification('Operation not supported'));
      return;
    }

    const targetTaskId = allTasks[realDestinationIndex].id;

    if (targetTaskId === sourceTaskId) {
      return; // nothing to do on this case, the task is already where it needs to be.
    }

    // If there are other tasks depending on the one that is going to be moved,
    // we're going to associate them to the next one, so that they stay on the same spot.
    const tasksPrioritizedBefore = selectTasksPrioritizedAheadOf(state, sourceTaskId);
    const taskAfter = allTasks[sourceIndex + 1];

    const updatesByTaskId = {
      [sourceTaskId]: { prioritizedAheadOf: targetTaskId },
      ...tasksPrioritizedBefore.reduce((memo, task) => ({
        ...memo,
        [task.id]: { prioritizedAheadOf: taskAfter.id },
      }), {}),
    };

    dispatch(updateTaskBatch(updatesByTaskId));
  }
);

const updateRelativePrioritizationToNext = (taskId:string, offset:number) => (dispatch:Function, getState:Function) => {
  const state = getState();

  const tasksRelativelyPrioritized = selectTasksPrioritizedAheadOf(state, taskId);
  const allOriginalTasks = tasksRelativelyPrioritized.length
    ? selectUpcomingSortedTasks(state)
    : [];
  const taskIndex = findIndex(allOriginalTasks, (task) => task.id === taskId);
  const newTaskIndex = taskIndex + offset;
  const newTaskAfter = allOriginalTasks[newTaskIndex];

  tasksRelativelyPrioritized.forEach((task) => {
    dispatch(updateTask(task.id, {
      prioritizedAheadOf: newTaskAfter ? newTaskAfter.id : null,
    }));
  });

  // return undo.
  return () => () => {
    tasksRelativelyPrioritized.forEach((task:Task) => {
      dispatch(updateTask(task.id, {
        prioritizedAheadOf: task.prioritizedAheadOf,
      }));
    });
  };
};

export const moveToTrashTask = (taskId:string) => (dispatch:Function) => {
  // Relative prioritization: Any task that was set to go before this one should now go after next.
  dispatch(updateRelativePrioritizationToNext(taskId, +1));

  dispatch({
    type: REMOVE_TASK_FROM_ALL_IDS,
    payload: taskId,
  });

  const notificationUid = dispatch(showInfoNotification('Task deleted'));
  return dispatch(updateTask(taskId, { trashed: Date.now() }))
    .catch((error:Error) => {
      console.warn(error);
      dispatch(hideNotification(notificationUid));
      dispatch(showNetworkErrorNotification());
    });
};

export const removeTaskFromAllIds = (taskId:string) => ({
  type: REMOVE_TASK_FROM_ALL_IDS,
  payload: taskId,
});

export const undoCompletedTask = (taskId:string) => (dispatch:Function) => (
  dispatch(updateTask(taskId, { completed: null }))
);

export const completeTask = (taskId:string) => (dispatch:Function, getState:Function) => {
  const task = selectTask(getState(), taskId);

  // Relative prioritization: Any task that was set to go before this one should now go after next.
  const undoPrioritizationChange = dispatch(updateRelativePrioritizationToNext(taskId, +1));

  const notificationUid = dispatch(showInfoNotification('Task complete', {
    callbackButton: 'Undo',
    callbackFunction: () => () => {
      dispatch(undoCompletedTask(taskId));
      dispatch(undoPrioritizationChange());
    },
  }));

  return dispatch(updateTask(taskId, { completed: Date.now() }))
    .then(() => {
      taskTaskCompleted(task.title);
    })
    .catch((error:Error) => {
      console.warn(error);
      dispatch(hideNotification(notificationUid));
      dispatch(showNetworkErrorNotification());
    });
};

export const loadRecurringConfigs = (ids: string[]) => (dispatch:Function, getState:Function) => {
  const state = getState();
  const userId = selectUserId(state);
  if (!userId) {
    throw new Error('[loadRecurringConfigs] No userId');
  }
  return apiClient.fetchRecurringConfigs(userId)
    .then((recurringConfigs) => {
      const idsMap = invert(ids);
      const filteredRecurringConfigs = recurringConfigs.filter(({ id }) => !!idsMap[id])
      dispatch(setRecurringConfigs(filteredRecurringConfigs));
    });
};

export const loadTasks = (completed:boolean) => (dispatch:Function, getState:Function) => {
  const state = getState();
  const userId = selectUserId(state);
  if (!userId) {
    throw new Error('[loadTasks] No userId');
  }
  const fetcher = completed
    ? apiClient.fetchCompletedTasks
    : apiClient.fetchNonCompletedTasks;

  return fetcher(userId)
    .then((tasks) => {
      dispatch(setTasks(tasks));
      return tasks;
    });
};

export const resetTasks = () => ({ type: RESET_TASKS });

export const persistTask = (id:string) => (dispatch:Function, getState:Function) => {
  const state = getState();
  const serializedTask = serializeTask(state, id);
  return apiClient.updateTask(
    id,
    filterTaskForApi(serializedTask),
  );
};

export const updateTaskDependency = (id:string, updates:Updates) => (dispatch:Function, getState:Function) => {
  dispatch({
    type: UPDATE_TASK_DEPENDENCY,
    payload: {
      id,
      updates,
    },
  });
  const state = getState();
  const dependency = selectTaskDependency(state, id);
  return dispatch(persistTask(dependency.taskId));
};

export const removeTaskDependency = (id:string) => (dispatch:Function, getState:Function) => {
  const state = getState();
  const dependency = selectTaskDependency(state, id);

  dispatch({
    type: REMOVE_TASK_DEPENDENCY,
    payload: {
      taskId: dependency.taskId,
      dependencyId: id,
    },
  });

  return dispatch(persistTask(dependency.taskId));
};

// create doesn't save to the API at the moment because for adding it needs to be modified
export const createTaskDependency = (dependency:TaskDependency) => ({
  type: CREATE_TASK_DEPENDENCY,
  payload: dependency,
});

export const navigateToTabForTask = (taskId:string, history:{push:Function}) => (dispatch:Function, getState:Function) => {
  const tab = selectSectionForTask(getState(), taskId);
  if (tab && DASHBOARD_TABS_TO_PATHS[tab]) {
    history.push(DASHBOARD_TABS_TO_PATHS[tab]);
  }
};

export const addTask = (newTask:TaskUnfiltered, dependencies:TaskDependency[], history:{push:Function}) => (dispatch:Function, getState:Function) => {
  const {
    temporaryId = isRequired(),
    title = isRequired(),
    effort = isRequired(),
    impact = isRequired(),
    description = isRequired(),
    ...restAttributes
  } = newTask;

  const state = getState();

  const task = {
    ...TASK_KEY_DEFAULTS,
    ...restAttributes,
    id: temporaryId,
    title,
    effort,
    impact,
    description,
    completed: null,
    created: Date.now(),
    userId: selectUserId(state),
    dependencyIds: dependencies.map(({ id }) => id),
  };

  dispatch({
    type: ADD_TASK,
    payload: {
      task: filterTaskKeys(task, TASK_KEYS_FOR_REDUX),
    },
  });
  dependencies.map((dependency) => dispatch(createTaskDependency(dependency)));

  dispatch(navigateToTabForTask(temporaryId, history));

  const taskWithoutId = omit(task, ['id']);
  return apiClient.createTask(filterTaskForApi(taskWithoutId))
    .then(({ id: finalId } : { id: string }) => {
      dispatch(removeTaskFromAllIds(temporaryId));
      dispatch({
        type: ADD_TASK,
        payload: {
          task: {
            ...task,
            id: finalId,
          },
        },
      });
      dependencies.forEach((dependency) => {
        dispatch(updateTaskDependency(dependency.id, {
          ...dependency,
          taskId: finalId,
        }));
      });

      trackTaskCreated(task.title);
    })
    .catch((error:Error) => {
      console.warn(error);
      dispatch(showNetworkErrorNotification());
      dispatch(removeTaskFromAllIds(temporaryId));
    });
};

export const clearRelativePrioritization = (taskId:string) => updateTask(taskId, {
  prioritizedAheadOf: null,
});

export const updateTaskRecurringConfig = (taskId: string, updates: apiClient.RecurringConfigApiWithId) => (dispatch:Function, getState:Function) => {
  const state = getState();
  const task = selectTask(state, taskId);

  const isNew = task.recurringConfigId == null;
  const recurringConfigId = task.recurringConfigId == null ? `_${uuid()}` : task.recurringConfigId;

  dispatch({
    type: UPDATE_RECURRING_CONFIG,
    payload: {
      id: recurringConfigId,
      updates,
    },
  });

  const saveRecurringConfig = isNew
    ? ():Promise<{ id: string }> => apiClient.createRecurringConfig({
      ...updates,
      userId: selectUserId(state),
    })
    : ():Promise<{ id: string }> => apiClient.updateRecurringConfig(recurringConfigId, updates);

  saveRecurringConfig()
    .then(({ id: finalRecurringConfigId } : { id: string }) => {
      if (task.recurringConfigId !== finalRecurringConfigId) {
        const temporaryId = recurringConfigId;
        dispatch({
          type: UPDATE_RECURRING_CONFIG,
          payload: {
            id: finalRecurringConfigId,
            updates,
          },
        });
        dispatch(updateTask(taskId, { recurringConfigId: finalRecurringConfigId }));
        dispatch({
          type: REMOVE_RECURRING_CONFIG,
          payload: temporaryId,
        });
      }
    });
};

export const removeTaskRecurringConfig = (taskId: string) => (dispatch:Function, getState:Function) => {
  const state = getState();
  const task = selectTask(state, taskId);
  const recurringConfigId = task.recurringConfigId;

  if (recurringConfigId == null) {
    throw new Error("Tried to remove recurring config but task isn't recurring");
  }

  dispatch({
    type: REMOVE_RECURRING_CONFIG,
    payload: recurringConfigId,
  });
  dispatch(updateTask(taskId, { recurringConfigId: null }));

  apiClient.deleteRecurringConfig(recurringConfigId);
};
