import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import mysqlProvider from "./mysql.provider";

@Module({
    imports: [
        ConfigModule.forRoot({ load: [mysqlProvider] }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => config.get('mysql')
        })
    ]
})
export class DatabaseModule {}