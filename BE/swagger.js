const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const loadYamlFile = (filePath) => {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContents);
  } catch (e) {
    console.error('Error loading YAML file:', e);
    return {};
  }
};

const mergeYamlFiles = (files) => {
  let merged = {
    openapi: '3.0.0',
    info: {
      title: 'Laboratory Management API',
      version: '1.0.0',
      description: 'API documentation for Laboratory Management System',
    },
    servers: [
      { 
        url: 'http://localhost:5000',
        description: 'Local Development Server'
      },
      { 
        url: 'https://deloy-project.vercel.app',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {}
    },
    security: [{
      bearerAuth: []
    }],
    paths: {},
    tags: []
  };

  files.forEach(file => {
    const yamlData = loadYamlFile(file);

    if (yamlData.paths) {
      Object.assign(merged.paths, yamlData.paths);
    }

    if (yamlData.components && yamlData.components.schemas) {
      Object.assign(merged.components.schemas, yamlData.components.schemas);
    }

    if (yamlData.tags) {
      merged.tags = [...merged.tags, ...yamlData.tags];
    }
  });

  return merged;
};

const docsDir = path.join(__dirname, 'docs');
const yamlFiles = [];

if (fs.existsSync(docsDir)) {
  const files = fs.readdirSync(docsDir);
  files.forEach(file => {
    if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      yamlFiles.push(path.join(docsDir, file));
    }
  });
}

let swaggerSpec;
if (yamlFiles.length > 0) {
  swaggerSpec = mergeYamlFiles(yamlFiles);
} else {

  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Laboratory Management API',
        version: '1.0.0',
        description: 'API documentation for Laboratory Management System',
      },
      servers: [
        { url: 'http://localhost:5000' }
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
      security: [{
        bearerAuth: []
      }]
    },
    apis: ['./routes/*.js'],
  };
  swaggerSpec = swaggerJsdoc(options);
}

module.exports = { swaggerUi, swaggerSpec };
