import Joi from '@hapi/joi';

import * as DURATION_UNITS from '../constants/recurringDurationUnits';
import * as WEEKDAYS from '../constants/weekdays';

export const recurringConfigSchema = Joi.object({
  mostRecentTaskId: Joi.string().required(),
  userId: Joi.string(),
  unit: Joi.valid(...Object.values(DURATION_UNITS)),
  amount: Joi.number(),
  lastRunDate: Joi.number().allow(null),
  activeWeekdays: Joi.object({
    [WEEKDAYS.MONDAY]: Joi.bool(),
    [WEEKDAYS.TUESDAY]: Joi.bool(),
    [WEEKDAYS.WEDNESDAY]: Joi.bool(),
    [WEEKDAYS.THURSDAY]: Joi.bool(),
    [WEEKDAYS.FRIDAY]: Joi.bool(),
    [WEEKDAYS.SATURDAY]: Joi.bool(),
    [WEEKDAYS.SUNDAY]: Joi.bool(),
  }).allow(null),
});

/**
 * @param {Object} entity
 * @param {Object} [options]
 * @param {bool} [options.isUpdate]
 */
export const validateRecurringConfigSchema = (entity, { isUpdate = false } = {}) =>
  recurringConfigSchema.validateAsync(entity, {
    // when updating some values of the entity, we don't want to fill with defaults
    noDefaults: isUpdate,
    // We don't allow unknown when updating, but when fetching yes, they'll be stripped out
    allowUnknown: !isUpdate,
    stripUnknown: true,
  });
