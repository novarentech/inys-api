export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 3000),
  url: env('PUBLIC_URL', 'http://localhost:3000')+'/cms',
  app: {
    keys: env.array('APP_KEYS'),
  },
});
