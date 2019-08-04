const isRequired = (name) => {
  throw new Error(`missing required parameter ${name}`);
};

export default isRequired;
