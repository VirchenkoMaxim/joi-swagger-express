export = EJSError;
/**
 * ExpressJoiSwagger Error class. Extends from the base Error class.
 * This class is used to identify exclusive errors for this library.
 */
declare class EJSError extends Error {
    /**
     * Instantiate an ExpressJoiSwagger Error instance.
     * @param {string} message
     * @param {?string} method
     * @param {?string} routePath
     */
    constructor(message: string, method?: string | null, routePath?: string | null);
}
