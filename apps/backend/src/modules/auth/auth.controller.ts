import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser, RegisterUser } from '@sdd/auth';
import type { LoginUserIn, RegisterUserIn } from '@sdd/auth';
import { Public } from '../../shared';
import { BcryptCryptoProvider } from './crypto.provider';
import { signUserToken } from './jwt.util';
import { PrismaUserRepository } from './user.prisma';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly cryptoProvider: BcryptCryptoProvider,
    private readonly configService: ConfigService,
  ) {}

  @Get('/')
  getAuth() {
    return { message: 'Auth endpoint' };
  }

  @Public()
  @Post('register')
  async register(@Body() input: RegisterUserIn): Promise<void> {
    const registerUser = new RegisterUser(
      this.cryptoProvider,
      this.userRepository,
    );

    await registerUser.execute({
      name: input?.name,
      email: input?.email,
      password: input?.password,
    });
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() input: LoginUserIn) {
    const loginUser = new LoginUser(this.cryptoProvider, this.userRepository);

    const user = await loginUser.execute({
      email: input?.email,
      password: input?.password,
    });
    const token = signUserToken(
      user,
      this.configService.getOrThrow<string>('JWT_SECRET'),
    );

    return { token, user };
  }
}
