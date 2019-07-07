import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

// import addKeyToAllTasks from './migrations/addKeyToAllTasks';
import renameKeyInAllTasks from './migrations/renameKeyInAllTasks';

admin.initializeApp(functions.config().firebase);

export const migrate = functions.https.onRequest(async (request, response) => {
  const db = admin.firestore();
  await renameKeyInAllTasks(db, 'thrased', 'trashed');
  response.send("Done!");
});
