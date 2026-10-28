import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.seller.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }
}
