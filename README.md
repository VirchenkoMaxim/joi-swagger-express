# IMPORTANT NOTE

This package is NOT ready for prime time yet. It is experimental. Please use at your own risk!!

# ExpressJoiSwagger

This is a simple, non-intrusive middleware for automatically defining Swagger API definitions for an Express.js webserver. With this package, you'll virtually eliminate the age-old excuse of not having enough time to write an API reference for your services! Some of the features include:

- Automatic Swagger Reference generation
- Joi-based request validation
- Non-intrusive design. Plays nicely with other Express plugins
- Optional request listener for serving out JSON payload of the auto-generated Swagger reference

## Install

Yarn or NPM:

```bash
yarn add joi-swagger-express
```

```bash
npm i joi-swagger-express
```

## Usage

### Basic Example

The goal is to automatically retrieve your auto-generated API references via `http://<your-server-url>/api/docs` (note: this path is configurable). Here's a basic example of how to setup your Express.js server with JoiSwaggerExpress:

```javascript
const ExpressJoiSwagger = require('joi-swagger-express');
const express = require('express');
const Joi = require('joi');

const app = express();

// Instantiate ExpressJoiSwagger
const joiSwagger = new ExpressJoiSwagger( {
  openapi: '3.0.0',
  info: {
    title: 'Express API',
    version: '1.0.0',
    description: 'The REST API test service',
  },
  servers: [
    {
      url: 'http://localhost:8000',
      description: 'Test server',
    },
  ]}),
  onValidateError: (errors, req, res, next) => {
    // global handler for validation errors
    res.status(400).send(errors);
  },
});

// Wrap joiSwagger around the root-level app or router, then
// define your routes, using Joi for request payload validation:
joiSwagger.wrapRouter(app).get(
  '/users',
  {
    summary: 'GetUsers',
    description: 'Retrieves a paginated list of users',
    validate: {
      query: {
        limit: Joi.number()
          .default(20)
          .optional()
          .description('Total records returned, for pagination purposes.'),
        offset: Joi.number()
          .default(0)
          .optional()
          .description('Offset for pagination.'),
      },
    },
  },
  (req, res) => {
    res.json(['Greg', 'Edward', 'Nick', 'Richard']);
  },
);

// Wrap joiSwagger around the root-level app before executing the listener
joiSwagger
  .wrapRouter(app)
  .listen(8000, () => console.log('Express server listening on port 8000'));
```

### Defining Arbitrary Swagger Definitions

```javascript
joiSwagger.assignDefinition({
  User: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      firstName: { type: 'string' },
    },
  },
});
```

### Defining Route-level Responses

```
joiSwagger.wrapRouter(app).get('/users/:userId', {
  summary: 'GetUserById',
  description: 'Retrieve a user by ID',
  responses: {
    200: {
      description: 'User Record',
      schema: {
        $ref: '#/definitions/User'
      }
    }
  }
},
(req, res) => {
  // ...
```

### Examples Folder

More in-depth examples in the Examples folder

## Caveats

### Caveat: Express nested routers _ARE NOT CLEANLY SUPPORTED_

You can still use Express nested routers (i.e. `express.Router()`), but you will need to redundantly specify the namespace in the `wrapRouter()` method. Here's an example:

_server.js:_ Here, we're using the `/api` namespace to load a nested router:

```javascript
const express = require('express');
const joiSwagger = require('./joiSwagger');
const app = express();

app.use('/api', require('./routes/foo'));

joiSwagger
  .wrapRouter(app)
  .listen(8000, () => console.log('listening on port 8000'));
```

_routes/foo.js:_ Notice how we need to re-specify `/api` one more time inside of `wrapRouter()`:

```javascript
const Joi = require('joi');
const joiSwagger = require('../joiSwagger');

// '/api' namespace added here as a second argument
const router = joiSwagger.wrapRouter(require('express').Router(), '/api', [
  'Users',
]);

router.get(
  '/foo',
  {
    summary: 'GetFoo',
    description: 'Gets a list of foos',
    validate: {
      query: {
        limit: Joi.number()
          .min(20)
          .optional()
          .description('Total number of results, for pagination purposes.'),
      },
    },
  },
  (req, res) => {
    res.send('BLAH');
  },
);

module.exports = router.expressRouter;
```
