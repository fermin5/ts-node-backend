const swaggerDefinition = {
    openapi: "3.0.0",
  
    info: {
      title: "Node-bac DOCS",
      version: "1.0.0",
      description: "",
    },
    servers: [
      {
        url: "http://localhost:3000/"
      }
    ],
    host: "localhost:3000",
    basePath: '/api',
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        scheme: 'bearer',
        in: 'header'
      }
    }
  };
  
  export default swaggerDefinition;
  