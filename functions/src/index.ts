// Command to deploy: firebase deploy --only functions

// import * as functions from 'firebase-functions';
// import admin from 'firebase-admin';

// import addKeyToAllTasks from './migrations/addKeyToAllTasks';
// import renameKeyInAllTasks from './migrations/renameKeyInAllTasks';
// import deleteKeyForAllTasks from './migrations/deleteKeyForAllTasks';

// admin.initializeApp(functions.config().firebase);

// export const migrate = functions.https.onRequest(async (request, response) => {
  // const db = admin.firestore();
  // await addKeyToAllTasks(db, 'prioritizedAheadOf', null);
  // response.send("Done!");

  // const db = admin.firestore();
  // await deleteKeyForAllTasks(db, 'blockers');
  // response.send("Done!");

  //   const db = admin.firestore();
  //   await renameKeyInAllTasks(db, 'thrased', 'trashed', null);
  //   response.send("Done!");
// });
