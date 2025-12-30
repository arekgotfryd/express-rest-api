import swaggerJsdoc from 'swagger-jsdoc'
import { env } from '../../env.ts'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express REST API',
      version: '1.0.0',
      description: 'A REST API built with Express, TypeScript, and Sequelize',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            firstName: {
              type: 'string',
              nullable: true,
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              nullable: true,
              description: 'User last name',
            },
            organizationId: {
              type: 'string',
              format: 'uuid',
              description: 'Organization ID',
            },
          },
        },
        Organization: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Organization ID',
            },
            name: {
              type: 'string',
              description: 'Organization name',
            },
            industry: {
              type: 'string',
              description: 'Industry type',
            },
            dateFounded: {
              type: 'string',
              format: 'date',
              description: 'Date founded',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Order ID',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            organizationId: {
              type: 'string',
              format: 'uuid',
              description: 'Organization ID',
            },
            totalAmount: {
              type: 'integer',
              description: 'Total order amount',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number',
            },
            limit: {
              type: 'integer',
              description: 'Items per page',
            },
            totalCount: {
              type: 'integer',
              description: 'Total number of items',
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
            },
            hasNextPage: {
              type: 'boolean',
              description: 'Whether there is a next page',
            },
            hasPreviousPage: {
              type: 'boolean',
              description: 'Whether there is a previous page',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
