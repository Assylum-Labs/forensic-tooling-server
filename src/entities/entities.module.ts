import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Entity } from './models/entity.model';
import { EntitySeeder } from '../database/seeders/entity.seeder';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Entity]),
  ],
  providers: [EntitySeeder, EntitiesService],
  exports: [EntitySeeder],
  controllers: [EntitiesController],
})
export class EntitiesModule {}