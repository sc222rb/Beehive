import swaggerJsdoc from 'swagger-jsdoc'
/**
 * Swagger options.
 *
 * @type {object}
 */
export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Beehive API',
      version: '1.0.0',
      description: 'Beehive platform REST API'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['src/routes/api/v1/*.js']
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

export default swaggerSpec
