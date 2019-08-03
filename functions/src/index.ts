// // Command to deploy: firebase deploy --only functions

import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

// import addKeyToAllTasks from './migrations/addKeyToAllTasks';
// import renameKeyInAllTasks from './migrations/renameKeyInAllTasks';
// import deleteKeyForAllTasks from './migrations/deleteKeyForAllTasks';
import transformValueForAllTasks from './migrations/transformValueForAllTasks';

admin.initializeApp(functions.config().firebase);

export const migrate = functions.https.onRequest(async (request, response) => {
  const db = admin.firestore();

  // await addKeyToAllTasks(db, 'prioritizedAheadOf', null);

  // await deleteKeyForAllTasks(db, 'blockers');

  // await renameKeyInAllTasks(db, 'thrased', 'trashed', null);

  await transformValueForAllTasks(db, 'blockedBy', (oldValue) => {
    if (!oldValue || !oldValue.length) {
      return [];
    }
    return oldValue.map((blockedById: string) => ({
      type: 'task',
      config: {
        taskId: blockedById,
      },
    }))
  });

  response.send("Done!");
});
