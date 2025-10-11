const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Laboratory Management API',
      version: '1.0.0',
      description: 'API documentation for Laboratory Management System',
    },
    servers: [
      { url: 'http://localhost:5000' }  // ✅ thêm server để Swagger gửi request đúng
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    // ✅ Mặc định áp dụng bearerAuth cho toàn bộ API
    security: [{
      bearerAuth: []
    }]
  },

  // ✅ Thêm tất cả router bạn muốn Swagger quét
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = { swaggerUi, swaggerSpec };
