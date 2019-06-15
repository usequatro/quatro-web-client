import * as firebase from 'firebase';

const db = firebase.firestore();

export const createTask = task => db.collection('tasks').add(task);

export const deleteTask = taskId => db.collection('tasks').delete(taskId);
