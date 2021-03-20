import Joi from '@hapi/joi';
import * as blockerTypes from '../constants/blockerTypes';

export const taskSchema = Joi.object({
  // these can't be empty
  userId: Joi.string(),
  title: Joi.string(),
  effort: Joi.number(),
  impact: Joi.number(),
  created: Joi.number(),

  // these can be empty
  due: Joi.number().allow(null).default(null),
  scheduledStart: Joi.number().allow(null).default(null),
  description: Joi.string().allow('').default(''),

  // these can be empty and we add defaults
  completed: Joi.number().allow(null).default(null),
  prioritizedAheadOf: Joi.string().allow(null).default(null),
  blockedBy: Joi.array()
    .items(
      Joi.alternatives().try(
        // another task blocker
        Joi.object({
          config: Joi.object({
            taskId: Joi.string(),
          }),
          type: Joi.valid(blockerTypes.TASK),
        }),
        // free text blocker
        Joi.object({
          config: Joi.object({
            value: Joi.string(),
          }),
          type: Joi.valid(blockerTypes.FREE_TEXT),
        }),
      ),
    )
    .default([]),
  recurringConfigId: Joi.string().allow(null).default(null),

  calendarBlockStart: Joi.number().allow(null),
  calendarBlockEnd: Joi.number().allow(null),
  calendarBlockCalendarId: Joi.string().allow(null),
  calendarBlockProviderCalendarId: Joi.string().allow(null),

  // these below are managed by the backend of Firebase Functions
  calendarBlockProvider: Joi.string().allow(null),
  calendarBlockProviderEventId: Joi.string().allow(null),
});

/**
 * @param {Object} entity
 * @param {Object} [options]
 * @param {bool} [options.isUpdate]
 * @param {bool} [options.sync]
 * @return {Promise|Object}
 */
export const validateTaskSchema = (entity, { isUpdate = false, sync = false } = {}) =>
  taskSchema[sync ? 'validate' : 'validateAsync'](entity, {
    noDefaults: isUpdate,
    // We don't allow unknown when updating, but when fetching yes, they'll be stripped out
    allowUnknown: !isUpdate,
    stripUnknown: true,
  });
