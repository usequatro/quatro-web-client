import * as firebase from 'firebase';

const TASKS = 'tasks';

const db = firebase.firestore();

export const createTask = task => db.collection(TASKS).add(task);

export const deleteTask = taskId => db.collection(TASKS).delete(taskId);

export const fetchTasks = () => db.collection(TASKS).get()
  .then((querySnapshot) => {
    const tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return tasks;
  });

export const updateTask = (taskId, updates) => db.collection(TASKS).doc(taskId).set({
  ...updates,
}, { merge: true });
