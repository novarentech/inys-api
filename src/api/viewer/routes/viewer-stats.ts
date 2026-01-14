// src/api/viewer/routes/viewer-stats.ts
export default {
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
