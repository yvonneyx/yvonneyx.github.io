// This is the JSON way to define React Router rules in a Rekit app.
// Learn more from: http://rekit.js.org/docs/routing.html

import {
  Layout,
  UserMngPage,
  ExamenMngPage,
  DptMngPage,
  CoorMngPage,
  PatientMngPage,
  InfirMngPage,
  VsMngPage,
} from './';

export default {
  path: 'admin',
  component: Layout,
  childRoutes: [
    { path: 'gestion-des-utilisateurs', component: UserMngPage, isIndex: true, protected: true, role: 'admin' },
    { path: 'gestion-des-examens', component: ExamenMngPage, protected: true, role: 'admin' },
    { path: 'gestion-des-departements', component: DptMngPage, protected: true, role: 'admin' },
    { path: 'gestion-des-coordinateurs/:userId?', component: CoorMngPage, protected: true, role: 'admin' },
    { path: 'gestion-des-infirmieres/:userId?', component: InfirMngPage, protected: true, role: 'admin' },
    { path: 'gestion-des-patients', component: PatientMngPage, protected: true, role: 'admin' },
    { path: 'gestion-des-visites', component: VsMngPage, protected: true, role: 'admin' },
  ],
};
