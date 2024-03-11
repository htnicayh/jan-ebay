import { registerAs } from "@nestjs/config";

export default registerAs('rabbitmq', () => require('amqplib').connect(process.env.RABBITMQ_URL))