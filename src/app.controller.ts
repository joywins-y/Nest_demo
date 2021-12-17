import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './app_dto/login.dto';

// @ApiTags('App')
// @Controller("app") // 定义控制器
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @Get() // 请求方法
//   getHello(): string { // 该方法会被GET请求调用
//     return this.appService.getHello();
//   }
// }

@ApiTags('验证')
@Controller('auth')
export class AuthController {
  @UseGuards(AuthGuard('local'))
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  async login(@Body() user: LoginDto, @Req() req) {
    return req.user;
  }
}
