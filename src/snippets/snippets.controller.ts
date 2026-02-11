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
  Req,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
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
  // GET /snippets/public?tag=react&page=1&limit=10
  @Get('public')
  @ApiOperation({ summary: 'Get all public snippets (Discovery) with Pagination' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag (e.g. react)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default 10)' })
  findAllPublic(
    @Query('tag') tag?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.snippetsService.findAllPublic(tag, page, limit);
  }

  // MY DASHBOARD (Protected)
  // GET /snippets?tag=react&page=1&limit=10
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get MY snippets (Public & Private) with Pagination' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default 10)' })
  findAllMyFeed(
    @GetUser() user: User,
    @Query('tag') tag?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.snippetsService.findAllByUser(user, tag, page, limit);
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

  // Get One
  // We use OptionalAuth to see if the user is logged in.
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific snippet' })
  @ApiParam({ name: 'id', description: 'The UUID of the snippet' })
  async findOne(@Param('id') id: string, @Req() req) {
    const snippet = await this.snippetsService.findOne(id);
    const user = req.user; // This comes from OptionalJwtAuthGuard (User | null)

    // Case 1: It's Public -> Allow everyone (Guest or User)
    if (snippet.visibility === SnippetVisibility.PUBLIC) {
      return snippet;
    }

    // Case 2: It's Private -> Check Ownership
    // If user exists AND user.id matches snippet.user.id, Allow access
    if (user && snippet.user && user.id === snippet.user.id) {
      return snippet;
    }

    // Case 3: Private and (User is null OR User is not owner) -> Block
    throw new ForbiddenException('This snippet is private.');
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