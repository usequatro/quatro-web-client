/**
 * File to interact with Firebase's Firestore database
 */

import { getFirestore } from '../firebase';

const TASKS = 'tasks';
const RECURRING_CONFIGS = 'recurringConfigs';
const logPrefix = '[api]';

const excludeId = (entity) => {
  const { id, ...rest } = entity;
  return { ...rest };
};

export const createTask = (task) => {
  console.log(`${logPrefix} createTask`, task); // eslint-disable-line no-console
  return getFirestore().collection(TASKS).add(excludeId(task));
};

// export const deleteTask = taskId => getFirestore().collection(TASKS).delete(taskId);

export const fetchTasks = (
  userId,
  fetchParams,
) => {
  console.log(`${logPrefix} fetchTasks`, userId, fetchParams); // eslint-disable-line no-console
  const {
    completed: [completedOperator = '==', completedValue = null] = [],
  } = fetchParams || {};

  return getFirestore().collection(TASKS)
    .where('userId', '==', userId)
    .where('trashed', '==', null)
    .where('completed', completedOperator, completedValue)
    .get()
    .then((querySnapshot) => {
      const tasks = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log(`${logPrefix} fetchTasks result`, tasks); // eslint-disable-line no-console
      return tasks;
    });
};

const parseTaskResults = (querySnapshot) => (
  querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }))
);

export const fetchNonCompletedTasks = (userId) => {
  console.log(`${logPrefix} fetchNonCompletedTasks`, userId); // eslint-disable-line no-console
  return getFirestore().collection(TASKS)
    .where('userId', '==', userId)
    .where('trashed', '==', null)
    .where('completed', '==', null)
    .get()
    .then((querySnapshot) => {
      const tasks = parseTaskResults(querySnapshot);
      console.log(`${logPrefix} fetchNonCompletedTasks result`, tasks); // eslint-disable-line no-console
      return tasks;
    });
};

export const fetchCompletedTasks = (userId) => {
  console.log(`${logPrefix} fetchCompletedTasks`, userId); // eslint-disable-line no-console
  return getFirestore().collection(TASKS)
    .where('userId', '==', userId)
    .where('trashed', '==', null)
    .where('completed', '>', 0)
    .get()
    .then((querySnapshot) => {
      const tasks = parseTaskResults(querySnapshot);
      console.log(`${logPrefix} fetchCompletedTasks result`, tasks); // eslint-disable-line no-console
      return tasks;
    });
};

export const updateTask = (taskId, updates) => {
  console.log(`${logPrefix} updateTask`, taskId, updates); // eslint-disable-line no-console
  return getFirestore().collection(TASKS).doc(taskId).set(
    excludeId(updates),
    { merge: true },
  );
};

export const updateTaskBatch = (updatesByTaskId) => {
  console.log(`${logPrefix} updateTaskBatch`, updatesByTaskId); // eslint-disable-line no-console
  const batch = getFirestore().batch();
  Object.keys(updatesByTaskId).forEach((taskId) => {
    const taskRef = getFirestore().collection(TASKS).doc(taskId);
    const updates = excludeId(updatesByTaskId[taskId]);
    batch.update(taskRef, updates);
  });
  return batch.commit();
};

export const fetchRecurringConfigs = (userId) => {
  console.log(`${logPrefix} fetchRecurringConfigs`, userId); // eslint-disable-line no-console
  return getFirestore().collection(RECURRING_CONFIGS)
    .where('userId', '==', userId)
    .get()
    .then((querySnapshot) => {
      const recurringConfigs = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log(`${logPrefix} fetchRecurringConfigs result`, recurringConfigs); // eslint-disable-line no-console
      return recurringConfigs;
    });
};

export const createRecurringConfig = (recurringConfig) => {
  console.log(`${logPrefix} createRecurringConfig`, recurringConfig); // eslint-disable-line no-console
  return getFirestore().collection(RECURRING_CONFIGS).add(excludeId(recurringConfig));
};

export const updateRecurringConfig = (id, updates) => {
  console.log(`${logPrefix} updateTask`, id, updates); // eslint-disable-line no-console
  return getFirestore().collection(RECURRING_CONFIGS).doc(id).set(
    excludeId(updates),
    { merge: true },
  )
    .then(() => ({ id })); // for convenience so it returns the same as add()
};

export const deleteRecurringConfig = (id) => {
  console.log(`${logPrefix} deleteRecurringConfig`, id); // eslint-disable-line no-console
  return getFirestore().collection(RECURRING_CONFIGS).doc(id).delete();
};
