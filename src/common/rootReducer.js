import { combineReducers } from 'redux';
// import { routerReducer } from 'react-router-redux';
import { connectRouter } from 'connected-react-router'
import history from './history';
import homeReducer from '../features/home/redux/reducer';
import commonReducer from '../features/common/redux/reducer';
import adminReducer from '../features/admin/redux/reducer';
import coordinateurReducer from '../features/coordinateur/redux/reducer';
import infirmiereReducer from '../features/infirmiere/redux/reducer';

// NOTE 1: DO NOT CHANGE the 'reducerMap' name and the declaration pattern.
// This is used for Rekit cmds to register new features, remove features, etc.
// NOTE 2: always use the camel case of the feature folder name as the store branch name
// So that it's easy for others to understand it and Rekit could manage them.

const reducerMap = {
  router: connectRouter(history),
  home: homeReducer,
  common: commonReducer,
  admin: adminReducer,
  coordinateur: coordinateurReducer,
  infirmiere: infirmiereReducer,
};

export default combineReducers(reducerMap);
