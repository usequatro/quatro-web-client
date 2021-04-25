/**
 * File to interact with Firebase's Firestore database
 */
import { formatQuerySnapshotChanges } from './firestoreRealtimeHelpers';
import firebase from '../firebase';
import { validateTaskSchema } from '../types/taskSchema';
import { validateRecurringConfigSchema } from '../types/recurringConfigSchema';
import { validateCalendarSchema } from '../types/calendarSchema';
import { validateExternalConfigSchema } from '../types/userExternalConfigSchema';
import debugConsole from './debugConsole';
import isRequired from './isRequired';
import * as SOURCES from '../constants/taskSources';

const TASKS = 'tasks';
const CALENDARS = 'calendars';
const RECURRING_CONFIGS = 'recurringConfigs';
const USER_EXTERNAL_CONFIGS = 'userExternalConfigs';

const db = firebase.firestore();
if (process.env.REACT_APP_FIREBASE_EMULATOR && window.location.hostname === 'localhost') {
  debugConsole.log('Firebase', 'Using emulator for firestore()');
  db.useEmulator('localhost', 8080);
}

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
 * @param {string} userId
 * @param {Object} task
 * @return {Promise<firebase.firestore.DocumentReference>}
 */
export const fetchCreateTask = async (userId = isRequired('userId'), task) => {
  const validatedTask = await validateTaskSchema({
    ...task,
    userId,
    created: Date.now(),
    source: SOURCES.USER,
  });
  debugConsole.log('Firestore', 'Creating task', validatedTask);
  return db.collection(TASKS).add(validatedTask);
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
  db
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
  let query = db
    .collection(TASKS)
    .where('userId', '==', userId)
    .where('completed', '>', 0)
    .limit(COMPLETED_TASKS_PAGE_SIZE)
    .orderBy('completed', 'desc');

  if (lastTaskId) {
    const lastTaskSnap = await db.collection(TASKS).doc(lastTaskId).get();
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
  debugConsole.log('Firestore', 'Updating task', taskId, validatedUpdates);
  return db.collection(TASKS).doc(taskId).update(validatedUpdates);
};

/**
 * @param {string} id
 * @return {Promise<void>}
 */
export const fetchDeleteTask = (id) => {
  debugConsole.log('Firestore', 'Deleting task', id);
  return db.collection(TASKS).doc(id).delete();
};

/**
 * Attaches a listener for recurring config list events.
 *
 * @param {string} userId
 * @param {Function} onNext
 * @param {Function} onError
 * @return {Function} An unsubscribe function that can be called to cancel the snapshot listener.
 */
export const listenListRecurringConfigs = (userId, onNext, onError) =>
  db
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
  debugConsole.log('Firestore', 'Creating recurring config', validEntity);
  return db.collection(RECURRING_CONFIGS).add(validEntity);
};

/**
 * @param {string} id
 * @param {Object} updates
 * @return {Promise<void>}
 */
export const fetchUpdateRecurringConfig = async (id, updates) => {
  const validEntity = await validateRecurringConfigSchema(updates, { isUpdate: true });
  debugConsole.log('Firestore', 'Updating recurring config', id, validEntity);
  return db.collection(RECURRING_CONFIGS).doc(id).set(validEntity, { merge: true });
};

/**
 * @param {string} id
 * @return {Promise<void>}
 */
export const fetchDeleteRecurringConfig = (id) => {
  debugConsole.log('Firestore', 'Deleting recurring config', id);
  return db.collection(RECURRING_CONFIGS).doc(id).delete();
};

/**
 * Attaches a listener for calendar list events.
 *
 * @param {string} userId
 * @param {Function} onNext
 * @param {Function} onError
 * @return {Function} An unsubscribe function that can be called to cancel the snapshot listener.
 */
export const listenToListCalendars = (userId, onNext, onError) =>
  db
    .collection(CALENDARS)
    .where('userId', '==', userId)
    .onSnapshot(
      { includeMetadataChanges: true },
      (querySnapshot) => {
        onNext(formatQuerySnapshotChanges(querySnapshot, validateCalendarSchema));
      },
      (error) => {
        onError(error);
      },
    );

/**
 * @param {Object} calendar
 * @return {Promise<firebase.firestore.DocumentReference>}
 */
export const fetchCreateCalendar = async (calendar) => {
  const validEntity = await validateCalendarSchema(calendar);
  debugConsole.log('Firestore', 'Creating calendar', validEntity);
  return db.collection(CALENDARS).add(validEntity);
};

/**
 * @param {string} id
 * @param {Object} updates
 * @return {Promise<void>}
 */
export const fetchUpdateCalendar = async (id, updates) => {
  const { value: validatedUpdates } = validateCalendarSchema(updates, {
    isUpdate: true,
    sync: true,
  });
  debugConsole.log('Firestore', 'Updating calendar', id, validatedUpdates);
  return db.collection(CALENDARS).doc(id).set(validatedUpdates, { merge: true });
};

/**
 * @param {string} id
 * @return {Promise<void>}
 */
export const fetchDeleteCalendar = (id) => {
  debugConsole.log('Firestore', 'Deleting calendar', id);
  return db.collection(CALENDARS).doc(id).delete();
};

/**
 * @param {string} userId
 * @param {Function} onNext
 * @param {Function} onError
 * @return {Function} An unsubscribe function that can be called to cancel the snapshot listener.
 */
export const listenToUserExternalConfigDocument = (userId, onNext, onError) =>
  db
    .collection(USER_EXTERNAL_CONFIGS)
    .doc(userId)
    .onSnapshot(
      async (doc) => {
        const { value, error } = validateExternalConfigSchema(doc.data(), {
          sync: true,
          isUpdate: false,
        });
        if (error) {
          onError(error);
        } else {
          onNext(value);
        }
      },
      (error) => {
        onError(error);
      },
    );

/**
 * Updates the external config for the currently logged-in user
 * @param {Object} updates
 * @return {Promise<void>}
 */
export const fetchUpdateUserExternalConfig = async (updates) => {
  const id = firebase.auth().currentUser.uid;
  if (!id) {
    throw new Error(`Can't update user external config without logged in user`);
  }
  const validEntity = await validateExternalConfigSchema(updates, { isUpdate: true });
  debugConsole.log('Firestore', 'Updating user external config', id, validEntity);
  return db.collection(USER_EXTERNAL_CONFIGS).doc(id).set(validEntity, { merge: true });
};

window.fetchUpdateUserExternalConfig = fetchUpdateUserExternalConfig;
