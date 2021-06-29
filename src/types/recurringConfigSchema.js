import Joi from '@hapi/joi';

import * as DURATION_UNITS from '../constants/recurringDurationUnits';
import * as WEEKDAYS from '../constants/weekdays';

import { clampNumber } from './taskSchema';

export const recurringConfigSchema = Joi.object({
  userId: Joi.string(),

  mostRecentTaskId: Joi.string().required(),
  unit: Joi.valid(...Object.values(DURATION_UNITS)),
  amount: Joi.number(),
  lastRunDate: Joi.number().allow(null).default(null),
  activeWeekdays: Joi.object({
    [WEEKDAYS.MONDAY]: Joi.bool(),
    [WEEKDAYS.TUESDAY]: Joi.bool(),
    [WEEKDAYS.WEDNESDAY]: Joi.bool(),
    [WEEKDAYS.THURSDAY]: Joi.bool(),
    [WEEKDAYS.FRIDAY]: Joi.bool(),
    [WEEKDAYS.SATURDAY]: Joi.bool(),
    [WEEKDAYS.SUNDAY]: Joi.bool(),
  }).allow(null),

  referenceDate: Joi.number(),

  taskDetails: Joi.object({
    title: Joi.string(),
    scheduledTime: Joi.string().allow(null),
    description: Joi.string().allow('').default(''),
    subtasks: Joi.array()
      .items(
        Joi.object({
          subtaskId: Joi.string(),
          text: Joi.string(),
          completed: Joi.boolean(),
        }),
      )
      .default([]),
    effort: Joi.number().integer().custom(clampNumber(0, 3), 'clampNumber'),
    impact: Joi.number().integer().custom(clampNumber(0, 3), 'clampNumber'),
    dueOffsetDays: Joi.number().integer().allow(null),
    dueTime: Joi.string().allow(null),
  }),
});

/**
 * @param {Object} entity
 * @param {Object} [options]
 * @param {bool} [options.isUpdate]
 * @param {bool} [options.sync]
 * @return {Promise|Object}
 */
export const validateRecurringConfigSchema = (entity, { isUpdate = false, sync = false } = {}) =>
  recurringConfigSchema[sync ? 'validate' : 'validateAsync'](entity, {
    // when updating some values of the entity, we don't want to fill with defaults
    noDefaults: isUpdate,
    // We don't allow unknown when updating, but when fetching yes, they'll be stripped out
    allowUnknown: !isUpdate,
    stripUnknown: true,
  });
