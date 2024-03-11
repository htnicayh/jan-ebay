import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RedisModule, RedisModuleOptions } from "@liaoliaots/nestjs-redis";
import redisProvider from "./redis.provider";

@Module({
    imports: [
        ConfigModule.forRoot({ load: [redisProvider], isGlobal: true }),
        RedisModule.forRootAsync({
            inject: [ConfigService],
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => configService.get('redis'),
        })
    ]
})
export class RedisConnectionModule {}