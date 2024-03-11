import { registerAs } from "@nestjs/config";

export default registerAs('mysql', () => ({
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    entities: [__dirname + '/**/*.entity.{ts|js}'],
    synchronize: false,
    logging: true
}))