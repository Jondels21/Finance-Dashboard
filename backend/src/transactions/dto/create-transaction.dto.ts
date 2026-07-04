import {
  IsNumber,
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';

import { TransactionTypeEnum as TransactionType } from '../enums/transaction-type.enum';

export class CreateTransactionDto {
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}
