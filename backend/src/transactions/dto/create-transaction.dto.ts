import { IsNumber, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsString()
  @MinLength(1)
  description: string;

  @IsUUID()
  categoryId: string;
}
