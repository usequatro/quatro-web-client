import * as firebase from 'firebase';
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

export const fetchTasks = (userId) => {
  console.log(`${logPrefix} fetchTasks`, userId);
  return db.collection(TASKS)
    .where('userId', '==', userId)
    .get()
    .then((querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
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
