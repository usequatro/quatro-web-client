import Joi from '@hapi/joi';

export const calendarSchema = Joi.object({
  userId: Joi.string(),
  providerCalendarId: Joi.string(),
  providerUserId: Joi.string(),
  providerUserEmail: Joi.string(),
  provider: Joi.valid('google'),
  color: Joi.string(),
  name: Joi.string(),
  systemNotifications: Joi.object({
    enabled: Joi.bool(),
    minutesInAdvance: Joi.number(),
  }).default({}),
  watcherChannelId: Joi.string().allow(null),
  // The resourceId property is a stable, version-independent ID for the resource
  watcherResourceId: Joi.string().allow(null),
  watcherExpiration: Joi.number().allow(null),
  watcherLastUpdated: Joi.number().allow(null),
});

/**
 * @param {Object} entity
 * @param {Object} [options]
 * @param {bool} [options.isUpdate]
 * @param {bool} [options.sync]
 * @return {Promise|Object}
 */
export const validateCalendarSchema = (entity, { isUpdate = false, sync = false } = {}) => {
  const options = {
    // when updating some values of the entity, we don't want to fill with defaults
    noDefaults: isUpdate,
    // We don't allow unknown when updating, but when fetching yes, they'll be stripped out
    allowUnknown: !isUpdate,
    stripUnknown: true,
  };
  return sync
    ? calendarSchema.validate(entity, options)
    : calendarSchema.validateAsync(entity, options);
};
