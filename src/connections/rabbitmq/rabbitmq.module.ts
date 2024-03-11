import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Module({
    providers: [
        {
            provide: 'RABBITMQ_CONNECTION',
            useFactory: async (configService: ConfigService) => configService.get<string>('rabbitmq'),
            inject: [ConfigService]
        }
    ]
})
export class RabbitMQModule {}