import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Snippet, SnippetVisibility } from './entities/snippet.entity';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { User } from '../users/entities/user.entity';

// A standard paginated response interface
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

@Injectable()
export class SnippetsService {
  constructor(
    @InjectRepository(Snippet)
    private readonly snippetRepository: Repository<Snippet>,
  ) {}

  // 1. Create with User
  async create(createSnippetDto: CreateSnippetDto, user: User): Promise<Snippet> {
    const snippet = this.snippetRepository.create({
      ...createSnippetDto,
      user,
    });
    return await this.snippetRepository.save(snippet);
  }

  // 2. Find Public Snippets (Paginated)
  // Supports filtering by ?tag=react&page=1&limit=10
  async findAllPublic(
    tag?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Snippet>> {
    const query = this.snippetRepository.createQueryBuilder('snippet')
      .leftJoinAndSelect('snippet.user', 'user')
      .where('snippet.visibility = :public', { public: SnippetVisibility.PUBLIC });

    if (tag) {
      // Search inside the comma-separated string (simple-array)
      query.andWhere('snippet.tags LIKE :tag', { tag: `%${tag}%` });
    }

    // Pagination Logic
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.orderBy('snippet.createdAt', 'DESC').getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  // 3. Find All MY Snippets (Paginated Dashboard Mode)
  // Returns my Private AND Public snippets, prioritized by Pinned status
  async findAllByUser(
    user: User,
    tag?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Snippet>> {
    const query = this.snippetRepository.createQueryBuilder('snippet')
      .leftJoinAndSelect('snippet.user', 'user')
      .where('snippet.user.id = :userId', { userId: user.id });

    if (tag) {
      query.andWhere('snippet.tags LIKE :tag', { tag: `%${tag}%` });
    }

    // Pagination Logic
    query.skip((page - 1) * limit).take(limit);

    // Sort by isPinned DESC (true first) and then by date
    const [data, total] = await query
      .orderBy('snippet.isPinned', 'DESC')
      .addOrderBy('snippet.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  // 4. Find One (Secure Access)
  async findOne(id: string): Promise<Snippet> {
    const snippet = await this.snippetRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!snippet) {
      throw new NotFoundException(`Snippet with ID "${id}" not found`);
    }

    // We return the snippet here, but the Controller will check
    // if the user has permission to see it (Is it Public? Is it Mine?)
    return snippet;
  }

  // 5. Update with Ownership Check
  async update(id: string, updateSnippetDto: UpdateSnippetDto, user: User): Promise<Snippet> {
    const snippet = await this.findOne(id);

    // The user object has an ID (from the token strategy)
    if (snippet.user.id !== user.id) {
      throw new ForbiddenException('You can only update your own snippets');
    }

    const updatedSnippet = this.snippetRepository.merge(snippet, updateSnippetDto);
    return await this.snippetRepository.save(updatedSnippet);
  }

  // 6. Delete with Ownership Check
  async remove(id: string, user: User): Promise<void> {
    const snippet = await this.findOne(id);

    if (snippet.user.id !== user.id) {
      throw new ForbiddenException('You can only delete your own snippets');
    }

    await this.snippetRepository.softDelete(id);
  }
}