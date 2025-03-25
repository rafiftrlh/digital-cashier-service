import { Controller, Post, Req, Res, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { SessionAuthGuard } from './guards/session-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    const { username, password } = req.body;
    const user = await this.authService.validateUser(username, password);

    req.session.user = { id: user.id, username: user.username, role: user.role };

    return res.json({ message: 'Login successful', user: req.session.user });
  }

  @UseGuards(SessionAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    return req.session.user;
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid'); // Hapus session cookie
      return res.json({ message: 'Logout successful' });
    });
  }
}
