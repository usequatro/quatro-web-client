import * as firebase from 'firebase/app';
import omit from 'lodash/omit';

const TASKS = 'tasks';
const logPrefix = '[api]';

const db = firebase.firestore();

const excludeId = entity => omit(entity, ['id']);

export const createTask = (task) => {
  console.log(`${logPrefix} createTask`, task);
  return db.collection(TASKS).add(excludeId(task));
};

// export const deleteTask = taskId => db.collection(TASKS).delete(taskId);

export const fetchTasks = (
  userId,
  fetchParams,
) => {
  console.log(`${logPrefix} fetchTasks`, userId, fetchParams);
  const {
    completed: [completedOperator = '==', completedValue = null] = [],
  } = fetchParams || {};

  return db.collection(TASKS)
    .where('userId', '==', userId)
    .where('trashed', '==', null)
    .where('completed', completedOperator, completedValue)
    .get()
    .then((querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log(`${logPrefix} fetchTasks result`, tasks);
      return tasks;
    });
};

export const updateTask = (taskId, updates) => {
  console.log(`${logPrefix} updateTask`, taskId, updates);
  return db.collection(TASKS).doc(taskId).set(
    excludeId(updates),
    { merge: true },
  );
};

export const updateTaskBatch = (updatesByTaskId) => {
  console.log(`${logPrefix} updateTaskBatch`, updatesByTaskId);
  const batch = db.batch();
  Object.keys(updatesByTaskId).forEach((taskId) => {
    const taskRef = db.collection(TASKS).doc(taskId);
    const updates = excludeId(updatesByTaskId[taskId]);
    batch.update(taskRef, updates);
  });
  return batch.commit();
};
