import type { StrapiApp } from '@strapi/strapi/admin';
import favicon from "./extensions/favicon.png";
import { ChartPie, User, Pencil } from '@strapi/icons'
import ViewerWidget from './widgets/ViewerWidget';
import ApplicantManager from './pages/ApplicantManager';
import ProfileWidget from './widgets/ProfileWidget';
import ProfileEditPage from './pages/ProfileEditPage';

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
        return ViewerWidget
      },
    });

    app.widgets.register({
      id: 'profile-info',
      icon: User,
      title: {
        id: 'profile.info.title',
        defaultMessage: 'My Profile',
      },
      component: async () => {
        return ProfileWidget;
      },
    });

    app.addMenuLink({
      to: '/plugins/applicant-manager',
      icon: User,
      intlLabel: {
        id: 'applicant-manager.link',
        defaultMessage: 'Applicants',
      },
      Component: async () => {
        return ApplicantManager
      },
      permissions: [{ action: 'admin::users.create' }],
    });

    // app.addMenuLink({
    //   to: '/plugins/profile-edit',
    //   icon: Pencil,
    //   intlLabel: {
    //     id: 'profile-edit.link',
    //     defaultMessage: 'Edit Profile',
    //   },
    //   Component: async () => {
    //     return ProfileEditPage
    //   },
    //   permissions: [],
    // });
  },
};
