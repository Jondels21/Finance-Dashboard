import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: string, dto: CreateTransactionDto) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: dto.categoryId,
        userId,
      },
    });

    if (!category) {
      throw new ForbiddenException('Category not found');
    }

    return this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        transactionDate: new Date(),

        user: {
          connect: {
            id: userId,
          },
        },

        category: {
          connect: {
            id: dto.categoryId,
          },
        },
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
      },
      include: {
        category: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
