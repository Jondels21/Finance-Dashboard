import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: {
    category: {
      findFirst: jest.Mock;
      create: jest.Mock;
    };
    transaction: {
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      category: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('reuses an existing category by name when creating a transaction', async () => {
    prisma.category.findFirst.mockResolvedValue({ id: 'category-1' });
    prisma.transaction.create.mockResolvedValue({ id: 'transaction-1' });

    await service.create('user-1', {
      amount: 12.5,
      categoryName: 'groceries',
    });

    expect(prisma.category.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        name: {
          equals: 'groceries',
          mode: 'insensitive',
        },
      },
    });
    expect(prisma.category.create).not.toHaveBeenCalled();
    expect(prisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          category: {
            connect: {
              id: 'category-1',
            },
          },
        }),
      }),
    );
  });

  it('creates a missing category by name when creating a transaction', async () => {
    prisma.category.findFirst.mockResolvedValue(null);
    prisma.category.create.mockResolvedValue({ id: 'category-2' });
    prisma.transaction.create.mockResolvedValue({ id: 'transaction-1' });

    await service.create('user-1', {
      amount: 20,
      categoryName: '  Dining  ',
    });

    expect(prisma.category.create).toHaveBeenCalledWith({
      data: {
        name: 'Dining',
        userId: 'user-1',
      },
    });
    expect(prisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          category: {
            connect: {
              id: 'category-2',
            },
          },
        }),
      }),
    );
  });
});
