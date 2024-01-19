import { configureStore, combineReducers } from '@reduxjs/toolkit'
import auth from './reducers/authReducer'
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import department from './reducers/departmentReducer';
import locations from './reducers/locationsReducer';
import users from './reducers/userReducer'
import roles from './reducers/rolesReducer';
import designation from './reducers/designationReducers'
import organization from './reducers/organizationReducer'
import groups from './reducers/groupReducer'
import tasks from './reducers/taskReducer'
import checklist from './reducers/checklistReducer'
import comments from './reducers/commentsReducer'
import announcement from "./reducers/announcementsReducer"
import tickets from "./reducers/supportTicketReducer."
import todoReducer from './reducers/todoReducer';
import attachmentsReducer from './reducers/attachmentsReducer';
import dashboardReducer from './reducers/dashboardReducer';
import priorityconfig from './reducers/priorityConfigReducer';
import statusconfig from './reducers/statusConfigReducer'
import approvalsReducer from './reducers/approvalsReducer';
import reminderReducer from './reducers/reminderReducer';
import boardviewReducer from './reducers/boardviewReducer';
import rewardsReducer from './reducers/rewardsReducer';

const persistConfig = {
  key: 'persist',
  storage,
  whitelist: ['auth'] // which reducer want to store
};

const rootReducer = combineReducers({
  auth: auth,
  department: department,
  location: locations,
  users: users,
  roles: roles,
  designation: designation,
  organization: organization,
  groups: groups,
  tasks: tasks,
  checklist: checklist,
  comments: comments,
  announcement: announcement,
  tickets: tickets,
  todo: todoReducer,
  attachments: attachmentsReducer,
  dashboard: dashboardReducer,
  priority:priorityconfig,
  status:statusconfig,
  approval: approvalsReducer,
  reminder:reminderReducer,
  boardview:boardviewReducer,
  rewards:rewardsReducer
})

const pReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: pReducer,
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false, }),
})