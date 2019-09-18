import * as firebase from 'firebase/app';

const TASKS = 'tasks';
const logPrefix = '[api]';

const db = firebase.firestore();

const excludeId = (entity:TaskApiWithId|TaskApiUpdatesWithId):TaskApi|TaskApiUpdates => {
  const { id, ...rest } = entity;
  return { ...rest };
};

type TaskApi = {
  title: string,
  effort: number,
  impact: number,
  description: string,
  created: number,
  due: number | null,
  scheduledStart: number | null,
  completed: number | null,
  trashed: number | null,
  userId: string,
  blockedBy: [string],
  prioritizedAheadOf: string | null,
};
type WithId = {
  id: string,
};
type TaskApiWithId = TaskApi & WithId;
type TaskApiUpdates = {
  title?: string,
  effort?: number,
  impact?: number,
  description?: string,
  created?: number,
  due?: number | null,
  scheduledStart?: number | null,
  completed?: number | null,
  trashed?: number | null,
  userId?: string,
  blockedBy?: [string],
  prioritizedAheadOf?: string | null,
};
type TaskApiUpdatesWithId = TaskApiUpdates & WithId;

export const createTask = (task:TaskApiWithId) => {
  console.log(`${logPrefix} createTask`, task);
  return db.collection(TASKS).add(excludeId(task));
};

// export const deleteTask = taskId => db.collection(TASKS).delete(taskId);

export const fetchTasks = (
  userId:string,
  fetchParams:any,
):Promise<TaskApiWithId[]> => {
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
      const tasks = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as TaskApiWithId[];
      console.log(`${logPrefix} fetchTasks result`, tasks);
      return tasks;
    });
};

const parseTaskResults = (querySnapshot : firebase.firestore.QuerySnapshot) => (
  querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as TaskApiWithId[]
);

export const fetchNonCompletedTasks = (userId:string):Promise<TaskApiWithId[]> => {
  console.log(`${logPrefix} fetchNonCompletedTasks`, userId);
  return db.collection(TASKS)
    .where('userId', '==', userId)
    .where('trashed', '==', null)
    .where('completed', '==', null)
    .get()
    .then((querySnapshot) => parseTaskResults(querySnapshot));
};

export const fetchCompletedTasks = (userId:string):Promise<TaskApiWithId[]> => {
  console.log(`${logPrefix} fetchCompletedTasks`, userId);
  return db.collection(TASKS)
    .where('userId', '==', userId)
    .where('trashed', '==', null)
    .where('completed', '>', 0)
    .get()
    .then((querySnapshot) => parseTaskResults(querySnapshot));
};

export const updateTask = (taskId:string, updates:TaskApiUpdatesWithId) => {
  console.log(`${logPrefix} updateTask`, taskId, updates);
  return db.collection(TASKS).doc(taskId).set(
    excludeId(updates),
    { merge: true },
  );
};

export const updateTaskBatch = (updatesByTaskId: {[id: string]: TaskApiUpdatesWithId}) => {
  console.log(`${logPrefix} updateTaskBatch`, updatesByTaskId);
  const batch = db.batch();
  Object.keys(updatesByTaskId).forEach((taskId) => {
    const taskRef = db.collection(TASKS).doc(taskId);
    const updates = excludeId(updatesByTaskId[taskId]);
    batch.update(taskRef, updates);
  });
  return batch.commit();
};

export type ApiClient = typeof module.exports.default;
