// @ts-check
const express = require('express');
const merge = require('lodash.merge');
const validateSchema = require('./validateSchema');
const buildRouteDefinition = require('./buildRouteDefinition');
const swaggerUi = require('swagger-ui-express');

/**
 * ExpressJoiSwagger class is used to initialize the beginning stages of the
 * Swagger API spec, and returns a function that wraps around an Express router,
 * providing validation and auto Swagger documentation
 */
class ExpressJoiSwagger {
  /**
   * @param {Object} options
   * @param {Object} options.swaggerDefinition
   * @param {Object} options.onValidateError
   * @param {Object} options.joiOpts
   * @param {string} options.swaggerRoutePath
   */
  constructor({
    swaggerDefinition,
    onValidateError,
    joiOpts,
    swaggerRoutePath,
  }) {
    this.swaggerDefinition = Object.assign({}, swaggerDefinition, {
      paths: {},
    });

    this.onValidateError = onValidateError;

    this.joiOpts = joiOpts || {};

    this.swaggerRoutePath = swaggerRoutePath || '/api/docs';
  }

  /**
   * Return overridden Express router
   * @param {Object} expressRouter
   * @param {Object} namespace
   * @param {?Array<string>} tags
   * @return {Object}
   */
  wrapRouter(expressRouter, namespace = null, tags = null) {
    return Object.assign(express(), expressRouter, {
      expressRouter,
      ...[
        { key: 'use', method: 'all' },
        { key: 'all' },
        { key: 'get' },
        { key: 'post' },
        { key: 'put' },
        { key: 'delete' },
        { key: 'options' },
        { key: 'patch' },
      ].reduce(
        (obj, { key, method }) => ({
          ...obj,
          [key]: this._requestHandler.bind(
            this,
            { method: method || key, namespace, tags },
            expressRouter,
          ),
        }),
        {},
      ),
      listen: this._listen.bind(this, expressRouter),
    });
  }

  /**
   * Performs a deep merge to assign new properties to the existing swagger definition
   * @param {Object} assignedSwaggerDefinition
   */
  assignDefinition(assignedSwaggerDefinition) {
    this.swaggerDefinition = merge(this.swaggerDefinition, {
      definitions: assignedSwaggerDefinition,
    });
  }

  /**
   * Wrapper method around express router handlers
   * This method will execute Joi validation against the route handler's validation schema,
   * Then build a swagger definition for the route
   * @param  {{ method: string, namespace: string, tags: string }} properties
   * @param  {Object} expressRouter
   * @param  {...*}   args
   * @return {void}
   */
  _requestHandler({ method, namespace, tags }, expressRouter, ...args) {
    const routeOptsDefined = typeof args[1] === 'object';
    const routeOpts = routeOptsDefined ? args[1] : {}; // check for user-defined options
    const routerArgs = args.filter(
      (a, i) => i === 0 || typeof a === 'function',
    );
    const joiOpts = Object.assign({}, routeOpts.joiOpts || {}, this.joiOpts);
    const onValidateError = routeOpts.onValidateError || this.onValidateError;

    routeOpts.namespace = namespace;
    routeOpts.tags = routeOpts.tags || tags;

    // Build a swagger definition for this path
    if (routeOptsDefined) {
      buildRouteDefinition(method, args[0], routeOpts, this.swaggerDefinition);
    }

    // If validation schema is present, add a middleware in the route chain to perform validation
    if (routeOpts.validate) {
      routerArgs.splice(1, 0, (req, res, next) => {
        // Execute validation
        validateSchema(
          req,
          routeOpts.validate,
          joiOpts,
          (errors, validatedData) => {
            // If errors are present, check if there is a user-defined request error handler
            if (errors) {
              if (onValidateError) {
                return onValidateError(errors, req, res, next);
              }

              // As a fallback, send a 400 with an array of errors
              return res.status(400).send(errors);
            }

            // Attach the validated request parameters to the request object
            req.validated = validatedData;

            next();
          },
        );
      });
    }

    return expressRouter[method](...routerArgs);
  }

  /**
   * Initiate express app.listen() and build the master swagger definition
   * @param {Object} expressRouter
   * @param {...any} args
   * @return {Object}
   */
  _listen(expressRouter, ...args) {
    this._buildSwaggerDefinition(expressRouter);

    return expressRouter.listen(...args);
  }

  /**
   * Build the master swagger definition.
   * @param {Object} expressRouter
   */
  _buildSwaggerDefinition(expressRouter) {
    // Perform a deep clone
    const def = JSON.parse(JSON.stringify(this.swaggerDefinition));

    // Do some clean up
    delete def.defaultResponses;
    delete def.responseStructures;

    expressRouter.use(
      this.swaggerRoutePath,
      swaggerUi.serve,
      swaggerUi.setup(def),
    );
  }
}

module.exports = ExpressJoiSwagger;
