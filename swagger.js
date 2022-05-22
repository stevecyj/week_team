const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {},
    host: process.env.NODE_ENV ===  'production' ? 'safe-brushlands-13562.herokuapp.com' : `localhost:3005`,
    schemes: ['https'],
    securityDefinitions: {
        apiKeyAuth: {
            type: 'apiKey',
            in: 'headers',
            name: 'authorization',
            description: '請加入 API Token 需有前綴 Bearer '
        }
    },
    definitions: {}
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
