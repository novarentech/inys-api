// src/api/viewer/routes/viewer-stats.ts
export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/viewers/stats',
      handler: 'viewer-stats.stats',
      config: {
        auth: {
            required: false
        }
      },
    },
  ],
};
