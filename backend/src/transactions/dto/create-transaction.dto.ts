import {
  IsNumber,
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  MinLength,
  IsDateString,
  ValidateIf,
} from 'class-validator';

import { TransactionTypeEnum as TransactionType } from '../enums/transaction-type.enum';

export class CreateTransactionDto {
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @ValidateIf((transaction: CreateTransactionDto) => !transaction.categoryName)
  @IsUUID()
  categoryId?: string;

  @ValidateIf((transaction: CreateTransactionDto) => !transaction.categoryId)
  @IsString()
  @MinLength(1)
  categoryName?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsDateString()
  transactionDate?: string;
}
