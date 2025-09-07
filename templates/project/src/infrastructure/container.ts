import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES, ILogger, IEventBus, ICache } from './types';

// Domain
import { UserDomainService } from '../domain/user/services/user-domain.service';

// Application
import { UserApplicationService } from '../application/services/user-application.service';
import { CreateUserUseCase } from '../application/use-cases/user/create-user.use-case';
import { GetUserUseCase } from '../application/use-cases/user/get-user.use-case';
import { UpdateUserUseCase } from '../application/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '../application/use-cases/user/delete-user.use-case';

// Infrastructure
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { IUserRepository } from '../domain/user/repositories/user.repository.interface';
import { WinstonLogger } from '../infrastructure/logger/winston.logger';
import { InMemoryEventBus } from '../infrastructure/messaging/in-memory-event-bus';
import { InMemoryCache } from '../infrastructure/cache/in-memory-cache';

// Presentation
import { UserController } from '../presentation/http/controllers/user.controller';

const container = new Container();

// Infrastructure
container.bind<ILogger>(TYPES.Logger).to(WinstonLogger).inSingletonScope();
container.bind<IEventBus>(TYPES.EventBus).to(InMemoryEventBus).inSingletonScope();
container.bind<ICache>(TYPES.Cache).to(InMemoryCache).inSingletonScope();

// Repositories
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);

// Domain Services
container.bind<UserDomainService>(TYPES.UserDomainService).to(UserDomainService);

// Application Services
container.bind<UserApplicationService>(TYPES.UserApplicationService).to(UserApplicationService);

// Use Cases
container.bind<CreateUserUseCase>(TYPES.CreateUserUseCase).to(CreateUserUseCase);
container.bind<GetUserUseCase>(TYPES.GetUserUseCase).to(GetUserUseCase);
container.bind<UpdateUserUseCase>(TYPES.UpdateUserUseCase).to(UpdateUserUseCase);
container.bind<DeleteUserUseCase>(TYPES.DeleteUserUseCase).to(DeleteUserUseCase);

// Controllers
container.bind<UserController>(TYPES.UserController).to(UserController);

export { container };