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
      'x-strapi-config': {
        mutateDocumentation: (generatedDoc) => {
          // Only keep these tags
          const allowedTags = ['Applicant', 'Article', 'Landingpage'];
          
          // Filter tags
          generatedDoc.tags = generatedDoc.tags?.filter(
            tag => allowedTags.includes(tag.name)
          ) || [];
          
          // Filter paths to only include allowed content types
          const filteredPaths = {};
          Object.keys(generatedDoc.paths || {}).forEach(path => {
            const isAllowed = allowedTags.some(tag => 
              path.includes(`/${tag.toLowerCase()}s`) || 
              path.includes(`/${tag.toLowerCase()}`)
            );
            if (isAllowed) {
              filteredPaths[path] = generatedDoc.paths[path];
            }
          });
          generatedDoc.paths = filteredPaths;
          
          return generatedDoc;
        },
      },
    },
  },
});