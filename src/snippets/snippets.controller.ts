import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { SnippetVisibility } from './entities/snippet.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('snippets')
@Controller('snippets')
export class SnippetsController {
  constructor(private readonly snippetsService: SnippetsService) {}

  // PUBLIC FEED (No Guard needed)
  // GET /snippets/public?tag=react
  @Get('public')
  @ApiOperation({ summary: 'Get all public snippets (Discovery)' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag (e.g. react)' })
  findAllPublic(@Query('tag') tag?: string) {
    return this.snippetsService.findAllPublic(tag);
  }

  // MY DASHBOARD (Protected)
  // GET /snippets?tag=react
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get MY snippets (Public & Private)' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  findAllMyFeed(@GetUser() user: User, @Query('tag') tag?: string) {
    return this.snippetsService.findAllByUser(user, tag);
  }

  // Create (Protected)
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new code snippet' })
  @ApiResponse({ status: 201, description: 'Created.' })
  create(@Body() createSnippetDto: CreateSnippetDto, @GetUser() user: User) {
    return this.snippetsService.create(createSnippetDto, user);
  }

  // Get One (Smart Access Control)
  // We allow public access, but we need to check manually if it's private
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific snippet' })
  @ApiParam({ name: 'id', description: 'The UUID of the snippet' })
  async findOne(@Param('id') id: string) {
    // This endpoint is technically "Public" (no @UseGuards),
    // but the logic inside ensures you can't see private snippets
    // unless we implement "Optional Auth".
    // FOR NOW: We enforce that you can only see PUBLIC snippets here
    // unless you use a different authenticated endpoint.

    // Simplification for this phase:
    // If you are calling this public endpoint, you only see it if it is PUBLIC.
    const snippet = await this.snippetsService.findOne(id);
    if (snippet.visibility === SnippetVisibility.PRIVATE) {
      throw new ForbiddenException('This snippet is private.');
    }
    return snippet;
  }

  // 5. Update (Protected)
  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a snippet (Owner only)' })
  update(
    @Param('id') id: string,
    @Body() updateSnippetDto: UpdateSnippetDto,
    @GetUser() user: User,
  ) {
    return this.snippetsService.update(id, updateSnippetDto, user);
  }

  // 6. Delete (Protected)
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a snippet (Owner only)' })
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.snippetsService.remove(id, user);
  }
}