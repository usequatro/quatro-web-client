import Joi from '@hapi/joi';

export const userExternalConfigSchema = Joi.object({
  gapiCalendarOfflineAccess: Joi.boolean().default(false),
  defaultCalendarId: Joi.string().allow(null).default(null),
  timeZone: Joi.string().allow(null).default(null),
  emailDailyDigestEnabled: Joi.bool(),
  lastActivityDate: Joi.number(),
});

/**
 * @param {Object} entity
 * @param {Object} [options]
 * @param {bool} [options.isUpdate]
 * @param {bool} [options.sync]
 * @return {Promise|Object}
 */
export const validateExternalConfigSchema = (entity, { isUpdate = false, sync = false } = {}) =>
  userExternalConfigSchema[sync ? 'validate' : 'validateAsync'](entity, {
    noDefaults: isUpdate,
    // We don't allow unknown when updating, but when fetching yes, they'll be stripped out
    allowUnknown: !isUpdate,
    stripUnknown: true,
  });
