import * as firebase from 'firebase/app';

const TASKS = 'tasks';
const RECURRING_CONFIGS = 'recurringConfigs';
const logPrefix = '[api]';

const db = firebase.firestore();

const excludeId = (entity:TaskApiWithId):TaskApi => {
  const { id, ...rest } = entity;
  return { ...rest };
};

type WithId = {
  id: string,
};

type TaskApi = {
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
  recurringConfigId?: string | null,
};
export type TaskApiWithId = TaskApi & WithId;

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
    .then((querySnapshot) => {
      const tasks = parseTaskResults(querySnapshot);
      console.log(`${logPrefix} fetchNonCompletedTasks result`, tasks);
      return tasks;
    });
};

export const fetchCompletedTasks = (userId:string):Promise<TaskApiWithId[]> => {
  console.log(`${logPrefix} fetchCompletedTasks`, userId);
  return db.collection(TASKS)
    .where('userId', '==', userId)
    .where('trashed', '==', null)
    .where('completed', '>', 0)
    .get()
    .then((querySnapshot) => {
      const tasks = parseTaskResults(querySnapshot);
      console.log(`${logPrefix} fetchCompletedTasks result`, tasks);
      return tasks;
    });
};

export const updateTask = (taskId:string, updates:TaskApiWithId) => {
  console.log(`${logPrefix} updateTask`, taskId, updates);
  return db.collection(TASKS).doc(taskId).set(
    excludeId(updates),
    { merge: true },
  );
};

export const updateTaskBatch = (updatesByTaskId: {[id: string]: TaskApiWithId}) => {
  console.log(`${logPrefix} updateTaskBatch`, updatesByTaskId);
  const batch = db.batch();
  Object.keys(updatesByTaskId).forEach((taskId) => {
    const taskRef = db.collection(TASKS).doc(taskId);
    const updates = excludeId(updatesByTaskId[taskId]);
    batch.update(taskRef, updates);
  });
  return batch.commit();
};

type Weekdays = {
  mon: boolean,
  tue: boolean,
  wed: boolean,
  thu: boolean,
  fri: boolean,
  sat: boolean,
  sun: boolean,
};

type RecurringConfigApi = null | {
  unit: string,
  amount: number,
  activeWeekdays: Weekdays,
  userId: string,
  referenceDate: number,
};
export type RecurringConfigApiWithId = RecurringConfigApi & WithId;

export const fetchRecurringConfigs = (userId:string) => {
  console.log(`${logPrefix} fetchRecurringConfigs`, userId);
  return db.collection(RECURRING_CONFIGS)
    .where('userId', '==', userId)
    .get()
    .then((querySnapshot) => {
      const recurringConfigs = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as RecurringConfigApiWithId[];
      console.log(`${logPrefix} fetchRecurringConfigs result`, recurringConfigs);
      return recurringConfigs;
    });
};

export const createRecurringConfig = (recurringConfig:RecurringConfigApiWithId) => {
  console.log(`${logPrefix} createRecurringConfig`, recurringConfig);
  return db.collection(RECURRING_CONFIGS).add(excludeId(recurringConfig));
};

export const updateRecurringConfig = (id:string, updates:RecurringConfigApiWithId):Promise<{ id: string }> => {
  console.log(`${logPrefix} updateTask`, id, updates);
  return db.collection(RECURRING_CONFIGS).doc(id).set(
    excludeId(updates),
    { merge: true },
  )
    .then(() => ({ id })) // for convenience so it returns the same as add()
};

export const deleteRecurringConfig = (id:string) => db.collection(RECURRING_CONFIGS).doc(id).delete();

export type ApiClient = typeof module.exports.default;
