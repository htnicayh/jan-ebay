import { registerAs } from "@nestjs/config";

export default registerAs('redis', () => ({
    config: {
        url: process.env.REDIS_URL
    }
}))