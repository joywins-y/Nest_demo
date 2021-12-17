import { BadRequestException, HttpService, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private httpService: HttpService,
  ) {}

  // 生成token
  createToken(user: Partial<User>) {
    return this.jwtService.sign(user);
  }

  async login(user: Partial<User>) {
    const token = this.createToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });
    return { token };
  }

  async loginWithWechat(code) {
    if(!code){
      throw new BadRequestException('请输入微信授权码');
    }
    await this.getAccessToken(code);
    // 查找用户是否存在
    const user = await this.getUserByOpenid();
    if (!user) {
      // 获取微信用户信息，注册新用户
      const userInfo: WechatUserInfo = await this.getUserInfo();
      return this.userService.registerByWechat(userInfo);
    }
    return this.login(user);
  }

  // 获取access_token
  async getAccessToken(code) {
    const { APPID, APPSECRET } = process.env;
    if (!APPSECRET) {
      throw new BadRequestException('[getAccessToken]必须有appSecret');
    }
    if (
      !this.accessTokenInfo ||
      (this.accessTokenInfo && this.isExpires(this.accessTokenInfo))
    ) {
      // 使用httpService请求accessToken数据
      const res: AxiosResponse<WechatError & AccessConfig, any> =
        await lastValueFrom(
          this.httpService.get(
            `${this.apiServer}/sns/oauth2/access_token?appid=${APPID}&secret=${APPSECRET}&code=${code}&grant_type=authorization_code`,
          ),
        );
      if (res.data.errcode) {
        throw new BadRequestException(
          `[getAccessToken] errcode:${res.data.errcode}, errmsg:${res.data.errmsg}`,
        );
      }
      this.accessTokenInfo = {
        accessToken: res.data.access_token,
        expiresIn: res.data.expires_in,
        getTime: Date.now(),
        openid: res.data.openid,
      };
    }
    return this.accessTokenInfo.accessToken;
  }
}
