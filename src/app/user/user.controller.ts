import { Controller, Post, Body, Get, Query, Delete, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, GetUserDto, DeleteUserDto } from '../dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto.username, createUserDto.favoriteGenres, createUserDto.dislikedGenres);
  }

  @Get()
  async getUser(@Query() getUserDto: GetUserDto) {
    return this.userService.getUser(getUserDto.username);
  }

  @Delete(':username')
  async deleteUser(@Param() deleteUserDto: DeleteUserDto) {
    return this.userService.deleteUser(deleteUserDto.username);
  }
}
