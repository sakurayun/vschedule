import '../adapters/controllers/api/v1/performers';
import '../adapters/controllers/api/v1/organizations';
import '../adapters/controllers/api/v1/media';
import '../adapters/controllers/api/v1/streams';
import '../adapters/controllers/websub/youtube';
import './setup';

import api from '@ril/api-spec';
import express, { Application, NextFunction, Request, Response } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import swaggerUi from 'swagger-ui-express';

import { ILogger } from '../app/services/Logger';
import { TYPES } from '../types';
import { appErrorHandler } from './services/AppErrorHandler';
import { domainErrorHandler } from './services/DomainErrorHandler';

/**
 * Create app by given container
 * @param container Inversify container
 */
export const createApp = (container: Container): Application => {
  const server = new InversifyExpressServer(container);

  server.setConfig((app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(api));
    app.use(
      '/api',
      OpenApiValidator.middleware({
        apiSpec: require.resolve('@ril/api-spec'),
        validateApiSpec: true,
        validateRequests: true,
        validateResponses: true,
      }),
    );
  });

  server.setErrorConfig((app) => {
    app.use(domainErrorHandler);
    app.use(appErrorHandler);
    app.use(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, _req: Request, res: Response, _next: NextFunction) => {
        const logger = container.get<ILogger>(TYPES.Logger);
        logger.error(`Fallback handler has called: ${err.message}`);

        res.status(err.status ?? 500).json({
          message: err.message,
          errors: err.errors,
        });
      },
    );
  });

  return server.build();
};
