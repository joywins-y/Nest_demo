import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

  @ApiOperation({ summary: '微信登录跳转' })
  @Get('wechatLogin')
  async wechatLogin(@Headers() header, @Res() res) {
    const APPID = process.env.APPID;
    const redirectUri = urlencode(
      'http://lms.siyuanren.com/web/login_front.html',
    );
    res.redirect(
      `https://open.weixin.qq.com/connect/qrconnect?appid=${APPID}&redirect_uri=${header.refere}&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect`,
    );
  }

  @ApiOperation({ summary: '微信登录' })
  @ApiBody({ type: WechatLoginDto, required: true })
  @Post('wechat')
  async loginWithWechat(@Body('code') code: string) {
    return this.authService.loginWithWechat(code);
  }
}
