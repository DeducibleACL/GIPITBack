import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Opciones de configuración de Swagger
const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API de Gestión de Usuarios y Management',
        version: '1.0.0',
        description: 'Documentación de la API con App Router',
      },
      servers: [
        {
          url: 'http://localhost:3000/api', // URL base de tu API
        },
      ],
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              avatar: { type: 'string', nullable: true },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
          Company: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              logo: { type: 'string', nullable: true },
              description: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            }
          },
          Management: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              description: { type: 'string' },
              company_id: { type: 'integer' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
          UserManagement: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              user_id: { type: 'integer' },
              management_id: { type: 'integer' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    apis: ['./app/api/**/*.ts'],
  };
  
  const swaggerSpec = swaggerJsdoc(options);
  
  export { swaggerUi, swaggerSpec };