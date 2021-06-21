export = ExpressJoiSwagger;
/**
 * ExpressJoiSwagger class is used to initialize the beginning stages of the
 * Swagger API spec, and returns a function that wraps around an Express router,
 * providing validation and auto Swagger documentation
 */
declare class ExpressJoiSwagger {
    /**
     * @param {Object} options
     * @param {Object} options.swaggerDefinition
     * @param {Object} options.onValidateError
     * @param {Object} options.joiOpts
     * @param {string} options.swaggerRoutePath
     */
    constructor({ swaggerDefinition, onValidateError, joiOpts, swaggerRoutePath, }: {
        swaggerDefinition: any;
        onValidateError: any;
        joiOpts: any;
        swaggerRoutePath: string;
    });
    swaggerDefinition: any;
    onValidateError: any;
    joiOpts: any;
    swaggerRoutePath: string;
    /**
     * Return overridden Express router
     * @param {Object} expressRouter
     * @param {Object} namespace
     * @param {?Array<string>} tags
     * @return {Object}
     */
    wrapRouter(expressRouter: any, namespace?: any, tags?: Array<string> | null): any;
    /**
     * Performs a deep merge to assign new properties to the existing swagger definition
     * @param {Object} assignedSwaggerDefinition
     */
    assignDefinition(assignedSwaggerDefinition: any): void;
    /**
     * Wrapper method around express router handlers
     * This method will execute Joi validation against the route handler's validation schema,
     * Then build a swagger definition for the route
     * @param  {{ method: string, namespace: string, tags: string }} properties
     * @param  {Object} expressRouter
     * @param  {...*}   args
     * @return {void}
     */
    _requestHandler({ method, namespace, tags }: {
        method: string;
        namespace: string;
        tags: string;
    }, expressRouter: any, ...args: any[]): void;
    /**
     * Initiate express app.listen() and build the master swagger definition
     * @param {Object} expressRouter
     * @param {...any} args
     * @return {Object}
     */
    _listen(expressRouter: any, ...args: any[]): any;
    /**
     * Build the master swagger definition.
     * @param {Object} expressRouter
     */
    _buildSwaggerDefinition(expressRouter: any): void;
}
