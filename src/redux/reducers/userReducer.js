import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { gql } from "@apollo/client";
import { client, baseUrl } from "../../environment";
import { toast } from "react-toastify";
import axios from "axios";
import { getUserOrgByid, getUserById } from "../reducers/authReducer";
import { create } from "@mui/material/styles/createTransitions";

const createUserMutation = gql`
  mutation createUser($object: AddUserInput!) {
    addUser(arg1: $object) {
      message
      status
    }
  }
`;

const getUsersTreeData = gql`
  query GetUserOrg($org_id: Int!) {
    user_org(
      where: { org_id: { _eq: $org_id }, is_delete: { _eq: false },is_active:{_eq:true} }
      order_by: { user: { created_at: asc } }
    ) {
      is_active
      is_delete
      deleted_by
      department_id
      designation_id
      id
      location_id
      org_id
      reporting_manager
      role_id
      updated_by
      user_id
      alias_user
      active_time
      deleted_on
      updated_on
      user {
        phone
        name
        lastname
        email
        phone
      }
      designation {
        name
      }
      department {
        name
      }
      user {
        avatar
      }
    }
  }
`;

const getUsersQuery = gql`
  query getUsers($name: String!, $orgId: Int!) {
    user_org(
      where: {
        _and: {
          user: {
            _or: [
              { name: { _iregex: $name } }
              { lastname: { _iregex: $name } }
            ]
          }
        }
        org_id: { _eq: $orgId }
        is_delete: { _eq: false }
        is_active:{_eq:true}
      }
    ) {
      id
      user_id
      org_id
      active_time
      department_id
      designation_id
      location_id
      role_id
      reporting_manager
      is_active
      location {
        name
      }
      user {
        id
        name
        lastname
        email
        phone
        is_delete
        password
        login_type
        created_at
        created_by
        deleted_by
        deleted_on
        is_active
        updated_by
        updated_on
        color
        avatar
      }
    }
  }
`;

const getTaskUser = gql`
  query getUsers($orgId: Int!) {
    user_org(where: { org_id: { _eq: $orgId } }) {
      id
      user_id
      org_id
      active_time
      department_id
      designation_id
      location_id
      role_id
      reporting_manager
      is_active
      is_delete
      user {
        id
        name
        lastname
        email
        phone
        is_delete
        password
        login_type
        created_at
        created_by
        deleted_by
        deleted_on
        is_active
        updated_by
        updated_on
        color
      }
    }
  }
`;

// const getAllUsersQuery = gql`
//   query getUsers($name: String!, $orgId: Int!, $limit: Int!, $offset: Int!) {
//     user_org(
//       limit: $limit
//       offset: $offset
//       where: {
//         _and: {
//           user: {
//             _or: [
//               { name: { _iregex: $name } }
//               { lastname: { _iregex: $name } }
//             ]
//           }
//         }
//         org_id: { _eq: $orgId }
//         is_delete: { _eq: false }
//       }
//     ) {
//       id
//       user_id
//       org_id
//       active_time
//       department_id
//       designation_id
//       location_id
//       role_id
//       reporting_manager
//       is_active

//       user {
//         id
//         name
//         lastname
//         email
//         phone
//         is_delete
//         password
//         login_type
//         created_at
//         created_by
//         deleted_by
//         deleted_on
//         is_active
//         updated_by
//         updated_on
//         color
//         avatar
//       }
//     }
//     user_org_aggregate(
//       where: {
//         _and: {
//           user: {
//             _or: [
//               { name: { _iregex: $name } }
//               { lastname: { _iregex: $name } }
//             ]
//           }
//         }
//         org_id: { _eq: $orgId }
//         is_delete: { _eq: false }
//       }
//     ) {
//       aggregate {
//         count
//       }
//     }
//   }
// `;

const getAllUsersQuery = gql`
  mutation getAccestBaseUsers($object: getAccesBasedUserData!) {
    getAccestBaseUsers(arg1: $object) {
      data
      response {
        message
        status
      }
    }
  }
`;

const updateUserMutation = gql`
  mutation update_user($object: [users_insert_input!]!) {
    insert_users(
      objects: $object
      on_conflict: {
        constraint: users_pkey
        update_columns: [
          name
          lastname
          email
          phone
          updated_by
          updated_on
          is_delete
          deleted_by
          deleted_on
          avatar
        ]
      }
    ) {
      affected_rows
    }
  }
`;

const updateUerOrg = gql`
  mutation update_user($object: [user_org_insert_input!]!) {
    insert_user_org(
      objects: $object
      on_conflict: {
        constraint: user_org_pkey
        update_columns: [
          location_id
          department_id
          role_id
          reporting_manager
          designation_id
          alias_user
          updated_by
          updated_on
        ]
      }
    ) {
      affected_rows
    }
  }
`;

const deleteUserMutation = gql`
  mutation deleteUser($id: Int!) {
    delete_users(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

const exceptUsersMutation = gql`
  query exceptUsers($array: [Int!]!, $name: String!, $orgId: Int!) {
    user_org(
      where: {
        user: {
          id: { _nin: $array }
          _or: [{ name: { _iregex: $name } }, { lastname: { _iregex: $name } }]
          _and: { is_delete: { _eq: false } }
        }
        is_delete: { _eq: false }
        is_active:{_eq:true}
        org_id: { _eq: $orgId }
      }
    ) {
      id
      org_id
      location {
        name
      }
      user {
        id
        name
        lastname
        email
        phone
        is_delete
        color
        login_type
        avatar
      }
    }
  }
`;

const userOrgList = gql`
  query getAllUsers {
    user_org {
      user_id
      org_id
      department_id
      location_id
      role_id
      reporting_manager
      active_time
      designation_id
      id
      is_active
      alias_user
    }
  }
`;

const getNoticationsById = gql`
  query getNotificationByid {
    notification(order_by: { created_at: desc }) {
      id
      title
      message
      user_id
      read
      target_id
      created_at
      type
    }
  }
`;

const readNotificationsQuery = gql`
  mutation update_notifications($id: [Int!]!) {
    update_notification(where: { id: { _in: $id } }, _set: { read: true }) {
      affected_rows
    }
  }
`;

const resetPasswordMutation = gql`
  mutation resetPassword($object: resetPassInput!) {
    resetPassword(arg1: $object) {
      message
      status
    }
  }
`;

const getFCMMutation = gql`
  query get_fcmtokens {
    fcmtoken {
      fcm_token
      id
      user_id
    }
  }
`;

const addFcmTokenMutation = gql`
  mutation insert_fcmtoken($object: fcmtoken_insert_input!) {
    insert_fcmtoken_one(object: $object) {
      id
    }
  }
`;

const updateFcmTokenMutaion = gql`
  mutation updateFcmtoken($object: [fcmtoken_insert_input!]!) {
    insert_fcmtoken(
      objects: $object
      on_conflict: { constraint: fcmtoken_pkey, update_columns: [fcm_token] }
    ) {
      affected_rows
    }
  }
`;

// const updateFcmMutation = gql`
//   mutation updateFCMToken($object: [fcmtoken_insert_input!]!) {
//     insert_fcmtoken(
//       objects: $object
//       on_conflict: {
//         constraint: fcmtoken_pkey
//         update_columns: [user_id, device_type]
//       }
//     ) {
//       affected_rows
//     }
//   }
// `;

const updateFcmMutation = gql`mutation updateFCMToken($user_id: Int!, $fcm_token: String!, $device_type: String!) {
  insert_fcmtoken(
    objects: [
      { user_id: $user_id, fcm_token: $fcm_token, device_type: $device_type }
    ],
    on_conflict: {
      constraint: fcmtoken_user_id_device_type_key,
      update_columns: [fcm_token]
    }
  ) {
    affected_rows
  }
}`;

const getAliasUser = gql`
  query get_aliasUser($id: Int!) {
    user_org(where: { user_id: { _eq: $id } }) {
      alias_user
    }
  }
`;

const getAliasUsersAdminQuery = gql`
  query get_aliasUser($id: jsonb) {
    user_org(where: { alias_user: { _contains: $id } }) {
      user_id
    }
  }
`;

const deleteUserQuery = gql`
  mutation update_user_org(
    $id: Int!
    $is_delete: Boolean
    $deleted_by: Int!
    $deleted_on: timestamptz!
  ) {
    update_user_org_by_pk(
      pk_columns: { id: $id }
      _set: {
        is_delete: $is_delete
        deleted_by: $deleted_by
        deleted_on: $deleted_on
      }
    ) {
      is_delete
    }
  }
`;

const changeAliasUserMutation = gql`
  mutation changeAsAlias($object: change_alias_user_input!) {
    changeAliasUser(arg1: $object) {
      data {
        accessToken
        alias_user_id
        user_id
        current_organization
      }
      response {
        message
        status
      }
    }
  }
`;

const getTeamUserIds = gql`
  mutation getTeamIds($object: get_team_ids_input!) {
    getTeamTasks(arg1: $object) {
      data
      response {
        message
        status
      }
    }
  }
`;

const createuserExistCheck = gql`
  mutation createUserDuplicateCheck($object: createUserDuplicateCheck!) {
    createUserDuplicateCheck(arg1: $object) {
      data
      response {
        message
        status
      }
    }
  }
`;

const deleteUserparentCheckMutation = gql`
  mutation deleteUserCheck($object: userDeleteCheck!) {
    userDelCheck(arg1: $object) {
      data
      response {
        message
        status
      }
    }
  }
`;

const verifyMailMutation = gql`
  mutation verifyAuthentication($object: verifyEmailLink!) {
    verifyAuthentication(arg1: $object) {
      message
      status
    }
  }
`;

export const verifyMailonUpdate = createAsyncThunk(
  "user/verifyMail",
  async (payload) => {
    try {
      const response = await client.mutate({
        mutation: verifyMailMutation,
        variables: {
          object: payload,
        },
      });
      // console.log(response, "RESPONSE");
      // return response;
    } catch (e) {
      console.log(e);
    }
  }
);

export const userExistCheck = createAsyncThunk(
  "user/existusercheck",
  async (payload) => {
    try {
      const response = await client.mutate({
        mutation: createuserExistCheck,
        variables: {
          object: payload,
        },
      });
      // console.log("user-reducer", response.data.createUserDuplicateCheck)
      return response.data.createUserDuplicateCheck;
    } catch (e) {
      console.log(e);
    }
  }
);

export const fcmUpdate = createAsyncThunk(
  "users/fcmUpdate",
  async (payload, thunkAPI) => {
    console.log("fcm update++++++++++++++++++++", payload)
    try {
      const response = await client.query({
        query: updateFcmMutation,
        variables:payload,

      });
      return response;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const createUser = createAsyncThunk(
  "users/create",
  async (payload, thunkAPI) => {
    // console.log("Create User Payload ...................", payload)
    let data = {};
    try {
      const response = await client.mutate({
        mutation: createUserMutation,
        variables: {
          object: payload,
        },
      });
      // console.log('create user response', response.data.addUser)
      if (response.data.addUser.status) {
        toast.success(response.data.addUser.message);
        thunkAPI.dispatch(setUserAddform(false));
        thunkAPI.dispatch(setUserButtonLoading(false));
        thunkAPI.dispatch(setShowPasswordDialog(true));
      } else {
        toast.error(response.data.addUser.message);
        thunkAPI.dispatch(setUserButtonLoading(false));
      }
      return response.data;
    } catch (e) {
      console.log("error", e);
      data = {
        status: false,
        message: e.message,
      };
      //console.log('response+++++++', data)
      toast.error(data.message);
      thunkAPI.dispatch(setUserButtonLoading(false));
    }
    return data;
  }
);

export const getTaskUserData = createAsyncThunk(
  "users/getTask",
  async (payload, thunkAPI) => {
    //console.log("getUsers...................", payload)
    const orgID = thunkAPI.getState().auth.current_organization;
    try {
      const response = await client.query({
        query: getTaskUser,
        variables: {
          orgId: orgID,
        },
      });
      var data = [];
      response.data?.user_org.filter((item) => data.push(item.user));
      return data;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const getUsers = createAsyncThunk(
  "users/getUsers",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(setDataLoader(true));
    //console.log("getUsers...................", payload)
    const orgID = thunkAPI.getState().auth.current_organization;
    try {
      const response = await client.query({
        query: getUsersQuery,
        variables: {
          name: `${payload}`,
          orgId: orgID,
        },
      });
      var data = [];
      // thunkAPI.dispatch(setDataLoader(false))
      response.data?.user_org.filter((item) =>
        data.push({ ...item.user, location: item.location.name })
      );
      return data;
    } catch (e) {
      thunkAPI.dispatch(setDataLoader(false));
      console.log("error", e);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "users/getAllUsers",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(setDataLoader(true));
   
    //console.log("getUsers...................", payload)
    const orgID = thunkAPI.getState().auth.current_organization;
    try {
      const response = await client.mutate({
        mutation: getAllUsersQuery,
        variables: {
          object: {
            name: `${payload.name}`,
            offset: payload.offset,
            limit: payload.limit,
          },
        },
      });
      return response.data.getAccestBaseUsers.data;
      // var totalUsers = response.data?.user_org_aggregate.aggregate.count;
      // var data = [];
      // var reqData = {};
      // response.data?.user_org.map((item) => (item.user.role_id = item.role_id));
      // response.data?.user_org.filter((item) => data.push(item.user));
      // reqData.users = data;
      // reqData.totalUsers = totalUsers;
      console.log("userResponse", response);
      return response;
      // thunkAPI.dispatch(setDataLoader(false))
      // return reqData;
    } catch (e) {
      console.log("error", e);
      thunkAPI.dispatch(setDataLoader(false));
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (payload, thunkAPI) => {
    //console.log("Update Location Payload ...................", payload)
    let data = {};
    const userid = thunkAPI.getState().auth.user_id;
    let userTemp = {
      ...payload.user,
      updated_by: userid,
      updated_on: new Date(),
    };
    let userOrgTemp = {
      ...payload.userOrg,
      updated_by: userid,
      updated_on: new Date(),
    };
    try {
      const userResponse = await client.mutate({
        mutation: updateUserMutation,
        variables: {
          object: userTemp,
        },
      });
      const userOrgResponse = await client.mutate({
        mutation: updateUerOrg,
        variables: {
          object: userOrgTemp,
        },
      });
      data = {
        status: true,
        message: "User Updated Sucessfully",
      };
      //console.log('response+++++++', data)
      toast.success(data.message);
      thunkAPI.dispatch(setUserUpdateForm(false));
      thunkAPI.dispatch(setUserButtonLoading(false));
    } catch (e) {
      //console.log('error', e)
      data = {
        status: true,
        message: e.message,
      };
      //console.log('response+++++++', data)
      toast.error(data.message);
      thunkAPI.dispatch(setUserButtonLoading(false));
    }
    return data;
  }
);

export const swichProfiles = createAsyncThunk(
  "user/swichProfiles",
  async (payload, thunkAPI) => {
    const userid = thunkAPI.getState().auth.user_id;
    const userData = localStorage.getItem("userData");
    payload.type === "switch" && localStorage.setItem("alias-user", userid);
    localStorage.setItem("alias-user-data", userData);
    try {
      const response = await client.mutate({
        mutation: changeAliasUserMutation,
        variables: {
          object: { user_id: payload.id },
        },
      });
      if (response.data.changeAliasUser.response.status) {
        // console.log("getusers", response.data.changeAliasUser);
        await thunkAPI.dispatch(
          getUserById(response.data.changeAliasUser.data.user_id)
        );
        await thunkAPI.dispatch(
          getUserOrgByid(response.data.changeAliasUser.data.user_id)
        );
        toast.success(response.data.changeAliasUser.response.message);
        //window.location.reload()
        return response.data.changeAliasUser.response;
      } else {
        localStorage.removeItem("alias-user");
        localStorage.removeItem("alias-user-data");
        toast.error(response.data.changeAliasUser.response.message);
        return response.data.changeAliasUser.response;
      }
    } catch (e) {
      console.log("error", e);
      localStorage.removeItem("alias-user");
      localStorage.removeItem("alias-user-data");
    }
  }
);

export const backToProfile = createAsyncThunk(
  "user/swichProfiles",
  async (payload, thunkAPI) => {
    //const userid = thunkAPI.getState().auth.user_id
    // payload.type === 'switch' && localStorage.setItem('alias-user', userid)
    try {
      const response = await client.mutate({
        mutation: changeAliasUserMutation,
        variables: {
          object: { user_id: payload.id },
        },
      });
      if (response.data.changeAliasUser.response.status) {
        // console.log("getusers", response.data.changeAliasUser);
        await thunkAPI.dispatch(
          getUserById(response.data.changeAliasUser.data.user_id)
        );
        await thunkAPI.dispatch(
          getUserOrgByid(response.data.changeAliasUser.data.user_id)
        );
        toast.success(response.data.changeAliasUser.response.message);
        //window.location.reload()
        localStorage.removeItem("alias-user");
        localStorage.removeItem("alias-user-data");
        return response.data.changeAliasUser.response;
      } else {
        toast.error(response.data.changeAliasUser.response.message);
        return response.data.changeAliasUser.response;
      }
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "users/updateUserProfile",
  async (payload, thunkAPI) => {
    let data = {};
    const userid = thunkAPI.getState().auth.user_id;
    let userTemp = { ...payload, updated_by: userid, updated_on: new Date() };
    try {
      const userResponse = await client.mutate({
        mutation: updateUserMutation,
        variables: {
          object: userTemp,
        },
      });
      data = {
        status: true,
        message: "Profile Updated Sucessfully",
      };
      //console.log('response+++++++', data)
      toast.success(data.message);
    } catch (e) {
      //console.log('error', e)
      data = {
        status: true,
        message: e.message,
      };
      //console.log('response+++++++', data)
      toast.error(data.message);
    }
    return data;
  }
);

export const profileUpload = createAsyncThunk(
  "profile/bulkUpload",
  async (payload, thunkAPI, state) => {
    const orgId = thunkAPI.getState().auth.current_organization;
    var data;
    const token = localStorage.getItem("token");
    let body = {
      table_id: payload.user_id,
      filename: payload.file_name,
      org_id: orgId,
      folder_type: "Profile",
      table_name: "profile",
    };

    try {
      const response = await axios.post(
        `${baseUrl}configuration/getFileUploadUrl/${orgId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response",response)

      let awsResponse = await axios.put(response.data.data, payload.file, {
        headers: {
          "Content-Type": payload.file_type,
        },
      });
      console.log("awsResponse",awsResponse)
      if (awsResponse) {
        data = {
          baseurl: response.data.baseurl,
          status: true,
          message: "Profile uploaded successfully!",
        };
        return data;
      } else {
        data = {
          status: false,
          message: "Something went Wrong",
        };
        toast.error(data.message);
        return data;
      }
    } catch (e) {
      toast.error(e.message);
      return e;
    }
  }
);

export const getAliasUserAdmins = createAsyncThunk(
  "users/getAliasUserAdmins",
  async (payload, thunkAPI) => {
    try {
      const response = await client.query({
        query: getAliasUsersAdminQuery,
        variables: {
          id: payload,
        },
      });
      let data = [];
      response.data.user_org.map((item) => {
        data.push(item.user_id);
      });
      return data;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (payload, thunkAPI) => {
    let data = {};
    // console.log("deleteUser...................", payload);
    const userid = thunkAPI.getState().auth.user_id;
    try {
      const userResponse = await client.mutate({
        mutation: deleteUserQuery,
        variables: {
          id: payload.id,
          is_delete: true,
          deleted_by: userid,
          deleted_on: new Date(),
        },
      });
      data = {
        status: true,
        message: "User Deleted Sucessfully",
      };
      //console.log('response+++++++', data)
      toast.success(data.message);
      thunkAPI.dispatch(setUserButtonLoading(false));
    } catch (e) {
      console.log("error", e);
      data = {
        status: true,
        message: "User Deleted Sucessfully",
      };
      toast.error(data.message);
      thunkAPI.dispatch(setUserButtonLoading(false));
    }
    return data;
  }
);

export const getExceptUsers = createAsyncThunk(
  "users/exceptUsers",
  async (payload, thunkAPI) => {
    const orgID = thunkAPI.getState().auth.current_organization;
    payload.orgId = orgID;
    try {
      const response = await client.query({
        query: exceptUsersMutation,
        variables: payload,
      });
      // console.log('getExceptUsers', response.data.users)
      var data = [];
      //console.log('response.data', response)
      response.data?.user_org.filter((item) =>
        data.push({ ...item.user, location: item.location.name })
      );
      return data;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const getOrgUsers = createAsyncThunk(
  "users/getOrgUsers",
  async (payload) => {
    try {
      const response = await client.query({
        query: userOrgList,
      });
      // console.log('getOrgUsers', response.data.user_org)
      return response?.data?.user_org;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const getUserNotificatinos = createAsyncThunk(
  "users/getNotificaitions",
  async (payload) => {
    //console.log("getUsers...................", payload)
    try {
      const response = await client.query({
        query: getNoticationsById,
        variables: {
          user_id: payload,
        },
      });
      //console.log('getUsersNotifications', response.data.notification)
      return response?.data?.notification;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const usersCsvUpload = createAsyncThunk(
  "users/bulkUpload",
  async (payload, thunkAPI, state) => {
    const orgId = thunkAPI.getState().auth.current_organization;
    const token = localStorage.getItem("token");
    let body = {
      filename: payload.file.name,
      folder_type: "csv",
    };

    try {
      const response = await axios.post(
        `${baseUrl}configuration/getFileUploadUrl/${orgId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const awsResponse = await axios
        .put(response.data.data, payload.file, {
          headers: {
            "Content-Type": payload.file.type,
          },
        })
        .then(async (res) => {
          let uploadBody = {
            filename: payload.file.name,
            folderpath: response.data.folderpath,
            email: payload.email,
          };
          // console.log('uploadBodyuploadBodyuploadBody', uploadBody)
          let data = await axios.post(
            `${baseUrl}uploadCsv/users/${orgId}`,
            uploadBody,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return data.data;
        });
      //toast.success(awsResponse.message);
      thunkAPI.dispatch(setUserButtonLoading(false));
      return awsResponse;
    } catch (e) {
      console.log(e);
      //toast.error(e.message);
      thunkAPI.dispatch(setUserButtonLoading(false));
      return e;
    }
  }
);

export const readNotifications = createAsyncThunk(
  "users/bulkUpload",
  async (payload, thunkAPI, state) => {
    // console.log('readnotificationpayloadreadnotificationpayloadreadnotificationpayload', payload)
    try {
      const response = await client.mutate({
        mutation: readNotificationsQuery,
        variables: {
          id: payload,
        },
      });
      // console.log('read notifications', response)
      return response;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "users/resetpassword",
  async (payload, thunkAPI, state) => {
    try {
      const response = await client.mutate({
        mutation: resetPasswordMutation,
        variables: {
          object: payload,
        },
      });

      // console.log('read notifications', response)
      return response.data.resetPassword;
    } catch (e) {
      let data = {
        status: false,
        message: "Network Error",
      };
      console.log("error", e);
      return data;
    }
  }
);

// export const getFCMTokens = createAsyncThunk('users/getFcms', async (payload, thunkAPI, state) => {
//     const userid = thunkAPI.getState().auth.user_id
//     try {
//         const response = await client.mutate({
//             mutation: getFCMMutation
//         })

//         console.log('fcm Tokens', response.data.fcmtoken)
//         let newToken = localStorage.getItem('fcmToken')
//         if (newToken != null) {
//             if (response.data.fcmtoken.length > 0) {
//                 var currentTokenBody = response.data.fcmtoken[0]
//                 // console.log('new fcm token', newToken)
//                 // console.log('user fcm tokens', currentTokenBody.fcm_token)
//                 if (currentTokenBody.fcm_token.length > 0) {
//                     if (!currentTokenBody.fcm_token.includes(newToken)) {
//                         console.log('updating fcm token')
//                         let fcmArray = currentTokenBody.fcm_token
//                         fcmArray.push(newToken)
//                         let body = { ...currentTokenBody, fcm_token: fcmArray, updated_at: new Date() }
//                         thunkAPI.dispatch(updateFcmToken(body))
//                     } else {
//                         console.log('fcm token already exists')
//                     }
//                 }

//             } else {
//                 console.log('creating fcm token')
//                 let body = {
//                     fcm_token: [newToken],
//                     updated_at: new Date(),
//                     user_id: userid
//                 }
//                 // console.log('create fcmtoken body', body)
//                 thunkAPI.dispatch(addFcmToken(body))
//             }
//         }

//         return response.data.fcmtoken
//     } catch (e) {
//         console.log('error', e)
//     }
// })

export const addFcmToken = createAsyncThunk(
  "users/createFcm",
  async (payload, thunkAPI, state) => {
    try {
      const response = await client.mutate({
        mutation: addFcmTokenMutation,
        variables: {
          object: payload,
        },
      });

      // console.log('added fcm Token', response.data)
      return response.data.fcmtoken;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const updateFcmToken = createAsyncThunk(
  "users/createFcm",
  async (payload, thunkAPI, state) => {
    try {
      const response = await client.mutate({
        mutation: updateFcmTokenMutaion,
        variables: {
          object: payload,
        },
      });

      // console.log('updated fcm Token', response.data)
      return response.data;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const getAliasUsers = createAsyncThunk(
  "users/getAlias",
  async (payload, thunkAPI, state) => {
    const userid = thunkAPI.getState().auth.user_id;
    try {
      const response = await client.mutate({
        mutation: getAliasUser,
        variables: {
          id: userid,
        },
      });
      // console.log('Alias users list', response.data.user_org[0].alias_user)
      return response.data.user_org[0].alias_user;
    } catch (error) {
      console.log("error", error);
    }
  }
);

export const updateAliasUser = createAsyncThunk(
  "users/updateAlias",
  async (payload, thunkAPI, state) => {
    var data;
    try {
      const userOrgResponse = await client.mutate({
        mutation: updateUerOrg,
        variables: {
          object: payload,
        },
      });
      if (userOrgResponse.data.insert_user_org) {
        data = {
          status: true,
          message: "User Updated Sucessfully",
        };
      } else {
        data = {
          status: false,
          message: "Something went wrong",
        };
      }

      return data;
    } catch (error) {
      console.log("error", error);
      data = {
        status: false,
        message: "Something went wrong",
      };
      return data;
    }
  }
);

export const getMyTemsIds = createAsyncThunk(
  "users/getTeamsIds",
  async (payload, thunkAPI, state) => {
    const userDetails = thunkAPI.getState().auth.userDetails;
    try {
      const response = await client.query({
        query: getTeamUserIds,
        variables: {
          object: {
            input_id: userDetails.id,
          },
        },
      });
      //console.log('getteamIds++++++++++++++++++++++++++++++++++++++++++++++++++++++++++', response.data.getTeamTasks.data)
      return response.data.getTeamTasks.data;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const getUsersTree = createAsyncThunk(
  "users/getUsersTree",
  async (payload, thunkAPI) => {
    //console.log("getUsers...................", payload)
    thunkAPI.dispatch(setUserTreeLoader(true));
    const orgID = thunkAPI.getState().auth.current_organization;
    try {
      const response = await client.query({
        query: getUsersTreeData,
        variables: {
          org_id: orgID,
        },
      });
      var usersTreeList = [];
      response.data.user_org.map((item) => {
        // item.parentId = item.reporting_manager == 0 ? '' : item.reporting_manager.toString()
        usersTreeList.push({
          designation: item.designation.name,
          name: `${item.user.name} ${item.user.lastname}`,
          id: item.user_id,
          parentId:
            item.reporting_manager == 0
              ? ""
              : item.reporting_manager?.toString(),
          image: item.user.avatar,
        });
      });
      if (usersTreeList.length > 0) {
        thunkAPI.dispatch(setUserTreeLoader(false));
      }
      // console.log(
      //   "usersTreeListusersTreeListusersTreeListusersTreeListusersTreeList",
      //   usersTreeList
      // );
      return usersTreeList;
    } catch (e) {
      thunkAPI.dispatch(setUserTreeLoader(false));
      console.log("error", e);
    }
  }
);

export const deleteParentUserCheck = createAsyncThunk(
  "users/deleteparentuser",
  async (payload, thunkAPI) => {
    let data = {};
    const userid = thunkAPI.getState().auth.user_id;
    try {
      const userResponse = await client.mutate({
        mutation: deleteUserparentCheckMutation,
        variables: {
          object: {
            id: payload.user_id,
          },
        },
      });
      data = {
        status: true,
        message: userResponse?.data?.userDelCheck?.data,
      };
      if (Object.keys(userResponse?.data?.userDelCheck?.data).length === 0) {
        thunkAPI.dispatch(deleteUser(payload));
      } else {
        toast.error(data.message);
        thunkAPI.dispatch(setUserButtonLoading(false));
      }

      // toast.success(data.message);
      // thunkAPI.dispatch(setUserButtonLoading(false))
    } catch (e) {
      console.log("error", e);
      data = {
        status: true,
        message: "User Deleted Sucessfully",
      };
      toast.error(data.message);
      thunkAPI.dispatch(setUserButtonLoading(false));
    }
    return data;
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState: {
    usersList: [],
    allUsers: [],
    userResponse: {},
    exceptedUsers: [],
    orgUsersList: [],
    showAddForm: false,
    showUpdateForm: false,
    buttonLoading: false,
    notificationList: [],
    aliasUsers: [],
    switchUsers: [],
    showPasswordDialog: false,
    totalUsers: 0,
    myTeamIds: [],
    usersTreeData: undefined,
    getAllUsers: [],
    selectedUser: undefined,
    selectedOrgUser: undefined,
    checkexistuser: {},
    userTaskData: [],
    loader: false,
    userTreeLoader: false,
  },
  extraReducers: {
    [createUser.fulfilled]: (state, action) => {
      state.userResponse = action.payload;
      return state;
    },
    [getAllUsers.fulfilled]: (state, action) => {
      state.allUsers = action.payload;
      state.totalUsers = action.payload?.length;
      return state;
    },
    [userExistCheck.fulfilled]: (state, action) => {
      state.checkexistuser = action.payload;
      return state;
    },
    [getUsers.fulfilled]: (state, action) => {
      state.usersList = action.payload;
      return state;
    },
    [updateUser.fulfilled]: (state, action) => {
      state.userResponse = action.payload;
      return state;
    },
    [deleteUser.fulfilled]: (state, action) => {
      state.userResponse = action.payload;
      return state;
    },
    [getExceptUsers.fulfilled]: (state, action) => {
      state.exceptedUsers = action.payload;
      return state;
    },
    [getOrgUsers.fulfilled]: (state, action) => {
      state.orgUsersList = action.payload;
      return state;
    },
    [getUserNotificatinos.fulfilled]: (state, action) => {
      state.notificationList = action.payload;
      return state;
    },
    [getAliasUsers.fulfilled]: (state, action) => {
      state.aliasUsers = action.payload;
      return state;
    },
    [getAliasUserAdmins.fulfilled]: (state, action) => {
      state.switchUsers = action.payload;
      return state;
    },
    [getMyTemsIds.fulfilled]: (state, action) => {
      state.myTeamIds = action.payload;
      return state;
    },
    [getUsersTree.fulfilled]: (state, action) => {
      state.usersTreeData = action.payload;
      return state;
    },
    [getTaskUserData.fulfilled]: (state, action) => {
      state.userTaskData = action.payload;
      return state;
    },
  },
  reducers: {
    setUserAddform: (state, action) => {
      state.showAddForm = action.payload;
      return state;
    },
    setUserUpdateForm: (state, action) => {
      state.showUpdateForm = action.payload;
      return state;
    },
    setUserButtonLoading: (state, action) => {
      state.buttonLoading = action.payload;
      return state;
    },
    setShowPasswordDialog: (state, action) => {
      state.showPasswordDialog = action.payload;
      return state;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      return state;
    },
    setSelectedOrgUser: (state, action) => {
      state.selectedOrgUser = action.payload;
      return state;
    },
    setExistUser: (state, action) => {
      state.checkexistuser = "";
      return state;
    },
    setDataLoader: (state, action) => {
      state.loader = action.payload;
      return state;
    },
    setUserTreeLoader: (state, action) => {
      state.userTreeLoader = action.payload;
      return state;
    },
  },
});

export const {
  setUserAddform,
  setExistUser,
  setUserUpdateForm,
  setUserButtonLoading,
  setDataLoader,
  setShowPasswordDialog,
  setUserTreeLoader,
  setSelectedUser,
  setSelectedOrgUser,
} = userSlice.actions;

export default userSlice.reducer;
