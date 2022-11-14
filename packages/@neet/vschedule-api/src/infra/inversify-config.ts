import { PrismaClient } from '@prisma/client';
import { Container } from 'inversify';

import { OrganizationQueryServicePrisma } from '../adapters/query-services/organization-query-service-prisma';
import { PerformerQueryService } from '../adapters/query-services/performer-query-service-prisma';
import { StreamQueryServicePrisma } from '../adapters/query-services/stream-query-service-prisma';
import { MediaAttachmentRepositoryPrismaImpl } from '../adapters/repositories/media-attachment-repository-prisma';
import { OrganizationRepositoryPrisma } from '../adapters/repositories/organization-repository-prisma';
import { PerformerRepositoryPrisma } from '../adapters/repositories/performer-repository-prisma';
import { ResubscriptionTaskRepositoryCloudTasks } from '../adapters/repositories/resubscription-task-repository-cloud-tasks';
import { StreamRepositoryPrisma } from '../adapters/repositories/stream-repository-prisma';
import { TokenRepositoryPrisma } from '../adapters/repositories/token-repository-prisma';
import { UserRepositoryPrisma } from '../adapters/repositories/user-repository-prisma';
import {
  IOrganizationQueryService,
  IPerformerQueryService,
  IStreamQueryService,
} from '../app/query-services';
import { IAppConfig } from '../app/services/app-config/app-config';
import { ILogger } from '../app/services/logger';
import { IStorage } from '../app/services/storage';
import { IYoutubeApiService } from '../app/services/youtube-api-service';
import { IYoutubeWebsubService } from '../app/services/youtube-websub-service';
import {
  IMediaAttachmentRepository,
  IOrganizationRepository,
  IPerformerRepository,
  IResubscriptionTaskRepository,
  IStreamRepository,
  ITokenRepository,
  IUserRepository,
} from '../domain';
import { TYPES } from '../types';
import { Authenticate } from './middlewares/authenticate';
import { Authenticated } from './middlewares/authenticated';
import { AppConfigEnvironment } from './services/app-config-environment';
import { loggerCloudLogging } from './services/logger-cloud-logging';
import { loggerConsole } from './services/logger-console';
import { StorageCloudStorage } from './services/storage-cloud-storage';
import { YoutubeApiService } from './services/youtube-api-service';
import { YoutubeWebsubParser } from './services/youtube-websub-parser';
import { YoutubeWebsubService } from './services/youtube-websub-service';

const container = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
});

const prisma = new PrismaClient({
  log: [
    { level: 'info', emit: 'event' },
    { level: 'query', emit: 'event' },
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prisma);
container.bind<IAppConfig>(TYPES.AppConfig).to(AppConfigEnvironment);

const config = container.get<IAppConfig>(TYPES.AppConfig);

container
  .bind<ILogger>(TYPES.Logger)
  .toConstantValue(loggerConsole)
  .when(() => config.logger.type === 'console');

container
  .bind<ILogger>(TYPES.Logger)
  .toConstantValue(loggerCloudLogging)
  .when(() => config.logger.type === 'cloud-logging');

const logger = container.get<ILogger>(TYPES.Logger);

prisma.$on('query', (e) => logger.debug(e.query, e.params, e.duration));
prisma.$on('info', (e) => logger.info(e.message));
prisma.$on('warn', (e) => logger.warning(e.message));
prisma.$on('error', (e) => logger.error(e.message));

container
  .bind<IPerformerRepository>(TYPES.PerformerRepository)
  .to(PerformerRepositoryPrisma);

container
  .bind<IOrganizationRepository>(TYPES.OrganizationRepository)
  .to(OrganizationRepositoryPrisma);

container
  .bind<IStreamRepository>(TYPES.StreamRepository)
  .to(StreamRepositoryPrisma);

container
  .bind<IMediaAttachmentRepository>(TYPES.MediaAttachmentRepository)
  .to(MediaAttachmentRepositoryPrismaImpl);

container
  .bind<IResubscriptionTaskRepository>(TYPES.ResubscriptionTaskRepository)
  .to(ResubscriptionTaskRepositoryCloudTasks);

container
  .bind<ITokenRepository>(TYPES.TokenRepository)
  .to(TokenRepositoryPrisma);

container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepositoryPrisma);

container
  .bind<IYoutubeApiService>(TYPES.YoutubeApiService)
  .to(YoutubeApiService);

container
  .bind<IYoutubeWebsubService>(TYPES.YoutubeWebsubService)
  .to(YoutubeWebsubService);

container
  .bind<IOrganizationQueryService>(TYPES.OrganizationQueryService)
  .to(OrganizationQueryServicePrisma);

container
  .bind<IStreamQueryService>(TYPES.StreamQueryService)
  .to(StreamQueryServicePrisma);

container
  .bind<IPerformerQueryService>(TYPES.PerformerQueryService)
  .to(PerformerQueryService);

container.bind(TYPES.YoutubeWebsubParser).to(YoutubeWebsubParser);

container.bind<IStorage>(TYPES.Storage).to(StorageCloudStorage);

container.bind(TYPES.Authenticate).to(Authenticate);
container.bind(TYPES.Authenticated).to(Authenticated);

export { container };
