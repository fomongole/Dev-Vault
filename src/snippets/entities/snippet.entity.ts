import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SnippetLanguage } from '../enums/snippet-language.enum';
import { User } from '../../users/entities/user.entity';

export enum SnippetVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity('snippets')
export class Snippet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  code: string;

  @Column({
    type: 'enum',
    enum: SnippetLanguage,
    default: SnippetLanguage.TYPESCRIPT,
  })
  language: SnippetLanguage;

  @Column({
    type: 'enum',
    enum: SnippetVisibility,
    default: SnippetVisibility.PRIVATE,
  })
  visibility: SnippetVisibility;

  @Column({ default: false })
  isPinned: boolean;

  // Tags (Stored as "tag1,tag2" in DB, returned as array in JSON)
  @Column({
    type: 'simple-array',
    nullable: true,
  })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.snippets, {
    eager: true, // When we fetch a snippet, we also get the user info automatically
    onDelete: 'CASCADE', // If user is deleted, their snippets are deleted
  })
  user: User;
}