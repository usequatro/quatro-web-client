const COLLECTION = 'tasks';

const LIMIT = 1000;

export default (db: any, key: string) => {
  return db.collection(COLLECTION).get().then(async (querySnapshot: any) => {
    // ⚠️ Need to improve this, here we're currently retrieving ALL tasks.
    const tasks = querySnapshot.docs.map((doc: any) => ([doc.id, doc.data()]));

    let updatedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < tasks.length; i++) {
      const id = tasks[i][0];
      const data = tasks[i][1];
      if (typeof data[key] !== 'undefined') {
        const { [key]: value, ...dataWithoutKey } = data;
        console.log(`deleteKeyForAllTasks: updating task id=${id}`);
        await db.collection(COLLECTION).doc(id).set(dataWithoutKey);
        updatedCount++;

        if (updatedCount >= LIMIT) {
          break;
        }
      } else {
        skippedCount++;
      }
    }

    console.log(`deleteKeyForAllTasks: updatedCount=${updatedCount} skippedCount=${skippedCount}`);
  });
};
