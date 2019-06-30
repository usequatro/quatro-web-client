import * as firebase from 'firebase';
import omit from 'lodash/omit';

const TASKS = 'tasks';

const db = firebase.firestore();

const excludeId = entity => omit(entity, ['id']);

export const createTask = task => db.collection(TASKS).add(excludeId(task));

// export const deleteTask = taskId => db.collection(TASKS).delete(taskId);

export const fetchTasks = userId => db.collection(TASKS)
  .where('userId', '==', userId)
  .get()
  .then((querySnapshot) => {
    const tasks = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
    return tasks;
  });

export const updateTask = (taskId, updates) => db.collection(TASKS).doc(taskId).set(
  excludeId(updates),
  { merge: true },
);
