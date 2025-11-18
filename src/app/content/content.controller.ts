import { Controller, Get, Query } from '@nestjs/common';
import { ContentService } from './content.service';
import { FindAllContentDto } from '../dto/content.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async findAllContent(@Query() findAllContentDto: FindAllContentDto): Promise<any> {
    const { type, page, limit } = findAllContentDto;
    return this.contentService.findAllContent(type, page, limit);
  }
}
