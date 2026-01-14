import type { StrapiApp } from '@strapi/strapi/admin';
import favicon from "./extensions/favicon.png";
import ViewerWidget from './widgets/ViewerWidget';
import {ChartPie} from '@strapi/icons'

export default {
  config: {
    head: {
      favicon: favicon,
    },
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
  register(app: StrapiApp) {
    if (!('widgets' in app)) return;

    app.widgets.register({
      id: 'viewer-stats',
      icon: ChartPie,
      title: {
        id: 'viewer.stats.title',
        defaultMessage: 'Visitors',
      },
      component: async () => {
        return ViewerWidget;
      },
    });
  },
};
