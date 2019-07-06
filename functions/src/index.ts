// import * as functions from 'firebase-functions';
// import admin from 'firebase-admin';

// import addKeyToAllTasks from './migrations/addKeyToAllTasks';

// admin.initializeApp(functions.config().firebase);

// export const migrate = functions.https.onRequest(async (request, response) => {
//   const db = admin.firestore();
//   await addKeyToAllTasks(db, 'thrased', null);
//   response.send("Done!");
// });
