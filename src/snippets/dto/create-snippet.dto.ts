import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { SnippetLanguage } from '../enums/snippet-language.enum';
import { ApiProperty } from '@nestjs/swagger';
import { SnippetVisibility } from '../entities/snippet.entity';

export class CreateSnippetDto {
  @ApiProperty({
    example: 'Quick Sort Algorithm',
    description: 'The title of the snippet',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Title is too long (max 100 chars)' })
  title: string;

  @ApiProperty({
    example: 'function sort(arr) { ... }',
    description: 'The actual code content',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    enum: SnippetLanguage,
    example: SnippetLanguage.JAVASCRIPT,
    description: 'Programming language of the snippet',
  })
  @IsEnum(SnippetLanguage, {
    message: 'Language not supported. Check documentation for valid list.',
  })
  language: SnippetLanguage;

  @ApiProperty({
    enum: SnippetVisibility,
    example: SnippetVisibility.PRIVATE,
    description: 'Public snippets are visible to everyone.',
    required: false,
  })
  @IsEnum(SnippetVisibility)
  @IsOptional()
  visibility?: SnippetVisibility;

  @ApiProperty({
    example: false,
    description: 'Pin the snippet to the top of the dashboard',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @ApiProperty({
    example: ['algorithm', 'sort', 'javascript'],
    description: 'Tags to help search for this snippet',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true }) // Ensures every item in the array is a string
  @IsOptional()
  tags?: string[];
}