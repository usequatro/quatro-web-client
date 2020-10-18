/**
 * File to interact with Firebase's Firestore database
 */
import { getFirestore } from '../firebase';
import { validateTaskSchema } from '../types/taskSchema';
import { validateRecurringConfigSchema } from '../types/recurringConfigSchema';

const TASKS = 'tasks';
const RECURRING_CONFIGS = 'recurringConfigs';

/**
 * @param {Object} task
 * @return {Promise<firebase.firestore.DocumentReference>}
 */
export const fetchCreateTask = async (task) => {
  const validatedTask = await validateTaskSchema(task);
  return getFirestore().collection(TASKS).add(validatedTask);
};

/**
 * @param {string} userId
 * @return {Promise<Array<Object>>}
 */
export const fetchListTasks = (userId) =>
  getFirestore()
    .collection(TASKS)
    .where('userId', '==', userId)
    .where('trashed', '==', null)
    .where('completed', '==', null)
    .get()
    .then((querySnapshot) => querySnapshot.docs.map((doc) => [doc.id, doc.data()]))
    .then((results) =>
      Promise.all(
        results.map(async ([id, entity]) => {
          const validEntity = await validateTaskSchema(entity);
          return [id, validEntity];
        }),
      ),
    );

export const COMPLETED_TASKS_PAGE_SIZE = 15;

/**
 * @param {string} userId
 * @param {string} lastTaskId
 * @return {Promise<Array<Object>>}
 */
export const fetchListCompletedTasks = async (userId, lastTaskId = null) => {
  let query = getFirestore()
    .collection(TASKS)
    .where('userId', '==', userId)
    .where('trashed', '==', null)
    .where('completed', '>', 0)
    .limit(COMPLETED_TASKS_PAGE_SIZE)
    .orderBy('completed', 'desc');

  if (lastTaskId) {
    const lastTaskSnap = await getFirestore().collection(TASKS).doc(lastTaskId).get();
    query = query.startAfter(lastTaskSnap);
  }

  return query
    .get()
    .then((querySnapshot) => querySnapshot.docs.map((doc) => [doc.id, doc.data()]))
    .then((results) =>
      Promise.all(
        results.map(async ([id, entity]) => {
          const validEntity = await validateTaskSchema(entity);
          return [id, validEntity];
        }),
      ),
    );
};

/**
 * @param {string} taskId
 * @param {Object} updates
 * @return {Promise<void>}
 */
export const fetchUpdateTask = async (taskId, updates) => {
  const validatedUpdates = await validateTaskSchema(updates, { isUpdate: true });
  return getFirestore().collection(TASKS).doc(taskId).set(validatedUpdates, { merge: true });
};

/**
 * @param {Object} updatesByTaskId
 * @return {Promise<void>}
 */
export const fetchUpdateTaskBatch = async (updatesByTaskId) => {
  const batch = getFirestore().batch();

  const validatedUpdates = await Promise.all(
    Object.entries(updatesByTaskId).map(async ([id, updates]) => {
      // Null means deletion, let it go through
      if (updates === null) {
        return [id, updates];
      }
      const validatedUpdate = await validateTaskSchema(updates, { isUpdate: true });
      return [id, validatedUpdate];
    }),
  );

  validatedUpdates.forEach(([id, updates]) => {
    const ref = getFirestore().collection(TASKS).doc(id);
    if (updates !== null) {
      batch.update(ref, updates);
    } else {
      batch.delete(ref);
    }
  });
  return batch.commit();
};

/**
 * @param {Object} updatesByRecurringConfigId
 * @return {Promise<void>}
 */
export const fetchUpdateRecurringConfigBatch = async (updatesByRecurringConfigId) => {
  const batch = getFirestore().batch();

  const validatedUpdates = await Promise.all(
    Object.entries(updatesByRecurringConfigId).map(async ([id, updates]) => {
      // Null means deletion, let it go through
      if (updates === null) {
        return [id, updates];
      }
      const validatedUpdate = await validateRecurringConfigSchema(updates, { isUpdate: true });
      return [id, validatedUpdate];
    }),
  );

  validatedUpdates.forEach(([id, updates]) => {
    const ref = getFirestore().collection(RECURRING_CONFIGS).doc(id);
    if (updates !== null) {
      batch.update(ref, updates);
    } else {
      batch.delete(ref);
    }
  });
  return batch.commit();
};

/**
 * @param {userId} taskId
 * @return {Promise<Array<Object>>}
 */
export const fetchListRecurringConfigs = (userId) =>
  getFirestore()
    .collection(RECURRING_CONFIGS)
    .where('userId', '==', userId)
    .get()
    .then((querySnapshot) => querySnapshot.docs.map((doc) => [doc.id, doc.data()]))
    .then((results) =>
      Promise.all(
        results.map(async ([id, entity]) => {
          const validEntity = await validateRecurringConfigSchema(entity);
          return [id, validEntity];
        }),
      ),
    );

/**
 * @param {Object} recurringConfig
 * @return {Promise<firebase.firestore.DocumentReference>}
 */
export const fetchCreateRecurringConfig = async (recurringConfig) => {
  const validEntity = await validateRecurringConfigSchema(recurringConfig);
  return getFirestore().collection(RECURRING_CONFIGS).add(validEntity);
};

/**
 * @param {string} id
 * @param {Object} updates
 * @return {Promise<void>}
 */
export const fetchUpdateRecurringConfig = async (id, updates) => {
  const validEntity = await validateRecurringConfigSchema(updates, { isUpdate: true });
  return getFirestore().collection(RECURRING_CONFIGS).doc(id).set(validEntity, { merge: true });
};

/**
 * @param {string} id
 * @return {Promise<void>}
 */
export const fetchDeleteRecurringConfig = (id) =>
  getFirestore().collection(RECURRING_CONFIGS).doc(id).delete();
