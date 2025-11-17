import swaggerJSDoc from "swagger-jsdoc";
import path from "path";

export const SwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "UniAct Graduation Project API Documentation",
      version: "1.0.0",
      description: "Auto-generated OpenAPI documentation for all endpoints",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
  },
  apis: [path.join(__dirname, "../Routes/*.ts")], 
};

export const SwaggerSpec = swaggerJSDoc(SwaggerOptions);
