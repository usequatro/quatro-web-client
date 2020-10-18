import { getStorage } from '../firebase';

const getRandomHash = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z0-9]+/g, '')
    .substr(1, 6);

/**
 * @param {File} file
 * @param {string} userId
 * @return {Promise} - resolves with the public download URL
 */
export default async function uploadUserFile(file, userId) {
  const saferFilename = file.name.replace(/[^a-z0-9-_.]+/gi, '_');
  const filename = `${getRandomHash()}-${saferFilename}`;

  const storage = getStorage();
  const rootRef = storage.ref();
  const fileRef = rootRef.child(`user/${userId}/${filename}`);

  await fileRef.put(file);

  const url = await fileRef.getDownloadURL();
  return { url, name: fileRef.name };
}
