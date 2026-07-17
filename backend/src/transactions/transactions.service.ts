import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveCategoryId(
    userId: string,
    dto: Pick<CreateTransactionDto, 'categoryId' | 'categoryName'>,
  ) {
    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: dto.categoryId,
          userId,
        },
      });

      if (!category) {
        throw new ForbiddenException('Category not found');
      }

      return category.id;
    }

    const categoryName = dto.categoryName?.trim();

    if (!categoryName) {
      throw new ForbiddenException('Category not found');
    }

    const category = await this.prisma.category.findFirst({
      where: {
        userId,
        name: {
          equals: categoryName,
          mode: 'insensitive',
        },
      },
    });

    if (category) {
      return category.id;
    }

    const createdCategory = await this.prisma.category.create({
      data: {
        name: categoryName,
        userId,
      },
    });

    return createdCategory.id;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const categoryId = await this.resolveCategoryId(userId, dto);

    return this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        type: dto.type,
        transactionDate: dto.transactionDate
          ? new Date(dto.transactionDate)
          : undefined,

        user: {
          connect: {
            id: userId,
          },
        },

        category: {
          connect: {
            id: categoryId,
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

  findOne(userId: string, id: string) {
    return this.prisma.transaction.findFirst({
      where: {
        userId,
        id,
      },
      include: {
        category: true,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const categoryId =
      dto.categoryId || dto.categoryName
        ? await this.resolveCategoryId(userId, dto)
        : undefined;

    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) {
      throw new ForbiddenException('Transaction not found');
    }

    return this.prisma.transaction.update({
      where: {
        id,
      },
      data: {
        amount: dto.amount,
        description: dto.description,
        categoryId,
        type: dto.type,
      },
    });
  }

  async remove(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) {
      throw new ForbiddenException('Transaction not found');
    }

    return this.prisma.transaction.delete({
      where: {
        id,
      },
    });
  }
}
