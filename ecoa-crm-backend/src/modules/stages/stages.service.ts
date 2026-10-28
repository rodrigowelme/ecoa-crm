import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class StagesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.stage.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        order: true,
        type: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }
}
