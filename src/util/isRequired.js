const isRequired = (param) => {
  if (param === undefined) {
    throw new Error('missing required parameter');
  }
};

export default isRequired;
