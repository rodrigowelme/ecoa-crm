import { Module } from '@nestjs/common';
import { StagesModule } from './modules/stages/stages.module.js';
import { SellersModule } from './modules/sellers/sellers.module.js';
import { DealsModule } from './modules/deals/deals.module.js';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    StagesModule,
    SellersModule,
    DealsModule,
  ],
})
export class AppModule {}
