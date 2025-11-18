import { Controller, Post, Body, Param, Delete, Get, Query } from '@nestjs/common';
import { MyListService } from './mylist.service';
import { MyListItem } from '../schemas/mylist-item.schema';
import { CreateMyListItemDto, GetMyListDto, DeleteMyListItemDto } from '../dto/mylist-item.dto';

@Controller('mylist')
export class MyListController {
  constructor(private readonly myListService: MyListService) {}

  @Post()
  async addItem(@Body() createMyListItemDto: CreateMyListItemDto): Promise<MyListItem> {
    return this.myListService.addItem(createMyListItemDto.username, createMyListItemDto.contentId);
  }

  @Delete(':username/:contentId')
  async removeItem(@Param() deleteMyListItemDto: DeleteMyListItemDto): Promise<any> {
    return this.myListService.removeItem(deleteMyListItemDto.username, deleteMyListItemDto.contentId);
  }

  @Get()
  async getMyList(@Query() getMyListDto: GetMyListDto): Promise<any> {
    // Provide default values for page and limit as they are optional in DTO
    const page = getMyListDto.page !== undefined ? Number(getMyListDto.page) : 1;
    const limit = getMyListDto.limit !== undefined ? Number(getMyListDto.limit) : 10;
    return this.myListService.getPaginatedItems(getMyListDto.username, page, limit);
  }
}
