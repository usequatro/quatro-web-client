/**
 * File to interact with Firebase's Firestore database
 */
import { formatQuerySnapshotChanges } from './firestoreRealtimeHelpers';
import { getFirestore } from '../firebase';
import { validateTaskSchema } from '../types/taskSchema';
import { validateRecurringConfigSchema } from '../types/recurringConfigSchema';

const TASKS = 'tasks';
const RECURRING_CONFIGS = 'recurringConfigs';

/**
 * @param {Array<Array>} entities - [[id, task], ...]
 * @param {Function} validator
 * @return {Promise<Array>}
 */
const validateEntitiesFilteringOutInvalidOnes = (entities, validator) =>
  Promise.allSettled(
    entities.map(([id, entity]) =>
      validator(entity)
        .then((validEntity) => [id, validEntity])
        .catch((error) => {
          console.error(error, id, entity); // eslint-disable-line no-console
          throw error;
        }),
    ),
  ).then((values) =>
    // Unwrap the result of Promise.allSettled
    values.filter(({ status }) => status === 'fulfilled').map(({ value }) => value),
  );

/**
 * @param {Object} task
 * @return {Promise<firebase.firestore.DocumentReference>}
 */
export const fetchCreateTask = async (task) => {
  const validatedTask = await validateTaskSchema(task);
  return getFirestore().collection(TASKS).add(validatedTask);
};

/**
 * Attaches a listener for task list events.
 *
 * @param {string} userId
 * @param {Function} onNext
 * @param {Function} onError
 * @return {Function} An unsubscribe function that can be called to cancel the snapshot listener.
 */
export const listenListTasks = (userId, onNext, onError) =>
  getFirestore()
    .collection(TASKS)
    .where('userId', '==', userId)
    .where('completed', '==', null)
    .onSnapshot(
      { includeMetadataChanges: true },
      (querySnapshot) => {
        onNext(formatQuerySnapshotChanges(querySnapshot, validateTaskSchema));
      },
      (error) => {
        onError(error);
      },
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
    .then((results) => validateEntitiesFilteringOutInvalidOnes(results, validateTaskSchema));
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
 * @param {string} id
 * @return {Promise<void>}
 */
export const fetchDeleteTask = (id) => getFirestore().collection(TASKS).doc(id).delete();

/**
 * Attaches a listener for recurring config list events.
 *
 * @param {string} userId
 * @param {Function} onNext
 * @param {Function} onError
 * @return {Function} An unsubscribe function that can be called to cancel the snapshot listener.
 */
export const listenListRecurringConfigs = (userId, onNext, onError) =>
  getFirestore()
    .collection(RECURRING_CONFIGS)
    .where('userId', '==', userId)
    .onSnapshot(
      { includeMetadataChanges: true },
      (querySnapshot) => {
        onNext(formatQuerySnapshotChanges(querySnapshot, validateRecurringConfigSchema));
      },
      (error) => {
        onError(error);
      },
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
