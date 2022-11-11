import { PrismaClient } from '@prisma/client';
import { Container } from 'inversify';

import { ResubscriptionScheduleRepository } from '../adapters/dal/JobRepositoryInMemory';
import { MediaAttachmentRepositoryPrismaImpl } from '../adapters/dal/MediaAttachmentRepository';
import { OrganizationRepository } from '../adapters/dal/OrganizationRepository';
import { PerformerRepository } from '../adapters/dal/PerformerRepository';
import { StreamRepository } from '../adapters/dal/StreamRepository';
import { IAppConfig } from '../app/services/AppConfig/AppConfig';
import { ILogger } from '../app/services/Logger';
import { IStorage } from '../app/services/Storage';
import { IYoutubeApiService } from '../app/services/YoutubeApiService';
import { IYoutubeWebsubService } from '../app/services/YoutubeWebsubService';
import { IMediaAttachmentRepository } from '../domain/repositories/MediaAttachmentRepository';
import { IOrganizationRepository } from '../domain/repositories/OrganizationRepository';
import { IPerformerRepository } from '../domain/repositories/PerformerRepository';
import { IResubscriptionScheduleRepository } from '../domain/repositories/ResubscriptionScheduleRepository';
import { IStreamRepository } from '../domain/repositories/StreamRepository';
import { TYPES } from '../types';
import { TokenAuthenticator } from './middlewares/TokenAuthenticator';
import { AppConfigEnvironment } from './services/AppConfigEnvironment';
import { loggerCloudLogging } from './services/LoggerCloudLogging';
import { loggerConsole } from './services/LoggerConsole';
import { Storage } from './services/Storage';
import { YoutubeApiService } from './services/YouTubeApiService';
import { YoutubeWebsubParser } from './services/YoutubeWebsubParser';
import { YoutubeWebsubService } from './services/YoutubeWebsubService';

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
  .to(PerformerRepository);

container
  .bind<IOrganizationRepository>(TYPES.OrganizationRepository)
  .to(OrganizationRepository);

container.bind<IStreamRepository>(TYPES.StreamRepository).to(StreamRepository);

container
  .bind<IMediaAttachmentRepository>(TYPES.MediaAttachmentRepository)
  .to(MediaAttachmentRepositoryPrismaImpl);

container
  .bind<IResubscriptionScheduleRepository>(
    TYPES.ResubscriptionScheduleRepository,
  )
  .to(ResubscriptionScheduleRepository);

container
  .bind<IYoutubeApiService>(TYPES.YoutubeApiService)
  .to(YoutubeApiService);

container
  .bind<IYoutubeWebsubService>(TYPES.YoutubeWebsubService)
  .to(YoutubeWebsubService);

container.bind(TYPES.YoutubeWebsubParser).to(YoutubeWebsubParser);

container.bind<IStorage>(TYPES.Storage).to(Storage);

container
  .bind<TokenAuthenticator>(TYPES.TokenAuthenticator)
  .to(TokenAuthenticator);

export { container };
