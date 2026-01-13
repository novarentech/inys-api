export default () => ({
  documentation: {
    enabled: true,
    config: {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'INYS',
        description: 'INYS API Documentation',
      },
      servers:[
        {
          url:"https://inys.novarentech.com/cms/api",
          description: "Production server"
        },
        {
          url:"http://127.0.0.1:3000/api",
          description: "Development server"
        }
      ],
      'x-strapi-config': {
        mutateDocumentation: (generatedDoc) => {
          // Only keep these tags
          const allowedTags = ['Applicant', 'Article', 'Landingpage'];
          
          // Filter tags
          generatedDoc.tags = generatedDoc.tags?.filter(
            tag => allowedTags.includes(tag.name)
          ) || [];
          
          // Filter and fix paths to only include allowed content types
          const filteredPaths = {};
          Object.keys(generatedDoc.paths || {}).forEach(path => {
            const isAllowed = allowedTags.some(tag => 
              path.includes(`/${tag.toLowerCase()}s`) || 
              path.includes(`/${tag.toLowerCase()}`)
            );
            
            if (isAllowed) {
              const pathObj = generatedDoc.paths[path];
              
              // Fix ID parameter type for all methods in this path
              Object.keys(pathObj).forEach(method => {
                if (pathObj[method].parameters) {
                  pathObj[method].parameters = pathObj[method].parameters.map(param => {
                    if (param.name === 'id' && param.in === 'path') {
                      return {
                        ...param,
                        schema: {
                          type: 'string', // Change from integer to string
                        },
                      };
                    }
                    return param;
                  });
                }
              });
              
              filteredPaths[path] = pathObj;
            }
          });
          generatedDoc.paths = filteredPaths;
          
          // Filter schemas
          if (generatedDoc.components?.schemas) {
            const filteredSchemas = {};
            
            Object.keys(generatedDoc.components.schemas).forEach(schemaName => {
              const schemaLower = schemaName.toLowerCase();
              const isAllowed = allowedTags.some(tag => 
                schemaLower.includes(tag.toLowerCase())
              );
              
              if (isAllowed) {
                filteredSchemas[schemaName] = generatedDoc.components.schemas[schemaName];
              }
            });
            
            generatedDoc.components.schemas = filteredSchemas;
          }
          
          return generatedDoc;
        },
      },
    },
  },
});