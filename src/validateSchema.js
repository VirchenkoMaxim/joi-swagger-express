// @ts-check
const Joi = require('joi');
const { pick } = require('./utils');

/**
 * Validate an Express request object against a Joi validation schema
 * @param {Object} req
 * @param {Object} schema
 * @param {Object} joiOpts
 * @param {Function} callback
 */
module.exports = function validateSchema(req, schema, joiOpts, callback) {
  const validSchema = pick(schema, ['params', 'query', 'body', 'files']);
  const objectToValidate = pick(req, Object.keys(validSchema));

  Joi.validate(objectToValidate, validSchema, joiOpts, (errors, result) => {
    if (errors) {
      return callback(
        errors.details.map((e) => e.message),
        result,
      );
    }

    callback(null, result);
  });
};
