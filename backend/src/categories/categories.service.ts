import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  create(userId: string, name: string) {
    return this.prisma.category.create({
      data: {
        name,
        userId,
      },
    });
  }

  async remove(userId: string, categoryId: string) {
    return this.prisma.category.deleteMany({
      where: {
        id: categoryId,
        userId,
      },
    });
  }
}
