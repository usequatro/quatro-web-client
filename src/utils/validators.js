import Joi from '@hapi/joi';
import isValid from 'date-fns/isValid';

const timestampSchema = Joi.number().custom((value, helpers) =>
  isValid(value) ? value : helpers.error('invalid date'),
);

// eslint-disable-next-line
export const validateTimestamp = (value) => {
  const { error } = timestampSchema.validate(value);
  if (error) {
    throw new Error(error);
  }
};
