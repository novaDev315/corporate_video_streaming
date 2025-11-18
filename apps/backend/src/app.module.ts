import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { VideosModule } from './modules/videos/videos.module';
import { StreamsModule } from './modules/streams/streams.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { TranscriptionModule } from './modules/transcription/transcription.module';
import { UploadModule } from './modules/upload/upload.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { AccessLinksModule } from './modules/access-links/access-links.module';
import { AuditModule } from './modules/audit/audit.module';
import { SubtitlesModule } from './modules/subtitles/subtitles.module';
import { DownloadsModule } from './modules/downloads/downloads.module';
import { EditingModule } from './modules/editing/editing.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
      }),
      inject: [ConfigService],
    }),

    // Redis & Bull Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    OrganizationsModule,
    VideosModule,
    StreamsModule,
    AnalyticsModule,
    TranscriptionModule,
    UploadModule,
    PlaylistsModule,
    CommentsModule,
    ChaptersModule,
    QuizzesModule,
    AccessLinksModule,
    AuditModule,
    SubtitlesModule,
    DownloadsModule,
    EditingModule,
  ],
})
export class AppModule {}
