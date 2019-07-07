const COLLECTION = 'tasks';

export default (db: any, oldKey: string, newKey: any) => {
  return db.collection(COLLECTION).get().then(async (querySnapshot: any) => {
    const tasks = querySnapshot.docs.map((doc: any) => ([doc.id, doc.data()]));

    for (let i = 0; i < tasks.length; i++) {
      const id = tasks[i][0];
      const data = tasks[i][1];
      const value = data[oldKey];
      const newData = {
        ...data,
        [newKey]: value,
      };
      await db.collection(COLLECTION).doc(id).set(newData);
    }
  });
};
