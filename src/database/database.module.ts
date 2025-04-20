import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { User } from 'src/users/models/user.model';
// import { ApiKey } from 'src/auth/models/api-key.model';
// import { Wallet } from 'src/kms/models/wallet.model';
// import { TeeSession } from 'src/kms/models/tee-session.model';
// import { KeyBackup } from 'src/kms/models/key-backup.model';

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
        database: configService.get('DB_NAME', 'solana_headless'),
        autoLoadModels: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: () => configService.get('NODE_ENV') !== 'production',
        models: [
        //   User,
        //   ApiKey,
        //   Wallet,
        //   TeeSession,
        //   KeyBackup
        ],
        sync: {
          alter: true,           // This is important for updating existing tables
          force: false           // Keep false to avoid dropping tables
        },
        // ssl: configService.get('DB_SSL', false)
        //   ? {
        //       require: true,
        //       rejectUnauthorized: false,
        //     }
        //   : false,
      }),
    }),
  ],
})
export class DatabaseModule {}