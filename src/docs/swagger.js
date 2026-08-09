import swaggerJSDoc from 'swagger-jsdoc';
import mongooseToSwagger from 'mongoose-to-swagger';
import { User } from '../modules/auth/user.schema.js';
import config from '../config/app.config.js';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Vaulta API',
        version: '1.0.0',
        description: 'Dynamic Swagger from Mongoose schema',
    },
    servers: [
        {
            url: config.swagger.swagger_url,
        },
    ],
    components: {
        schemas: {
            User: mongooseToSwagger(User),
        },
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [{bearerAuth: []}],
};

const options = {
    swaggerDefinition,
    apis: ['./src/modules/**/*.js']
};

export default swaggerJSDoc(options);
