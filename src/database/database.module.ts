import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EntitiesModule } from '../entities/entities.module';
import { EntitySeeder } from './seeders/entity.seeder';
import { Entity } from '../entities/models/entity.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'solana_forensics'),
        autoLoadModels: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: () => configService.get('NODE_ENV') !== 'production',
        models: [Entity],
        sync: {
          alter: true,
          force: false
        },
      }),
    }),
    EntitiesModule,
  ],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private entitySeeder: EntitySeeder) {}

  async onModuleInit() {
    // Seed the database when the module initializes
    await this.entitySeeder.seed();
  }
}