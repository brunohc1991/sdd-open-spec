import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { DeleteUser, SaveUser, User } from '@sdd/auth';
import type { SaveUserIn } from '@sdd/auth';
import { NotFoundError, PageResult } from '@sdd/shared';
import { BcryptCryptoProvider } from './crypto.provider';
import { PrismaUserRepository } from './user.prisma';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

interface UserResponse {
  id: string;
  name: string;
  email: string;
}

function toPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toUserResponse(user: User): UserResponse {
  return { id: user.id, name: user.name, email: user.email };
}

@Controller('users')
export class UserController {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly cryptoProvider: BcryptCryptoProvider,
  ) {}

  @Get()
  async findPage(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ): Promise<PageResult<UserResponse>> {
    const result = await this.userRepository.findPage({
      page: toPositiveInt(page, DEFAULT_PAGE),
      perPage: toPositiveInt(perPage, DEFAULT_PER_PAGE),
    });

    return { ...result, items: result.items.map(toUserResponse) };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('user.not_found');
    }

    return toUserResponse(user);
  }

  @Post()
  async create(@Body() input: SaveUserIn): Promise<void> {
    const saveUser = new SaveUser(this.cryptoProvider, this.userRepository);

    await saveUser.execute({
      name: input?.name,
      email: input?.email,
      password: input?.password,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() input: SaveUserIn,
  ): Promise<void> {
    const saveUser = new SaveUser(this.cryptoProvider, this.userRepository);

    await saveUser.execute({
      id,
      name: input?.name,
      email: input?.email,
      password: input?.password,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const deleteUser = new DeleteUser(this.userRepository);

    await deleteUser.execute({ id });
  }
}
