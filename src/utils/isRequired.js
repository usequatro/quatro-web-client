/**
 * Utility to ensure parameters are not undefined
 * @param {string} name
 * @throws Error
 */
const isRequired = (name) => {
  throw new Error(`missing required parameter ${name}`);
};

export default isRequired;
