import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gql } from '@apollo/client'
import { client, baseUrl } from '../../environment'
import { toast } from 'react-toastify';
import axios from 'axios';
import { fcmUpdate } from './userReducer'


const loginMutation = gql`mutation login($object:LoginInput!) {
    login(arg1:$object) {
      response {
        message
        status
      }
      data{
        accessToken
        available_organizations
        current_organization
        user_id
      }
    }
  }
`;

const getUserByIdMutation = gql`query getUser($id:Int!){
  users(where:{id:{_eq:$id}}) {
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
}`;

const orgReg = gql`mutation orgRegistration($object:FirsttimeOrganizationRegistrationInput!) {
  org_registration(arg1:$object ) {
    message
    status
  }
}`


const getUserByOrgIdQuery = gql`query getUserOrgByid($user_id:Int!){
  user_org(where: {user_id: {_eq: $user_id}}) {
    id
    department_id
    location_id
    role_id
    reporting_manager
    org_id
    designation_id
    is_active
    active_time
    user_id
    is_delete
  }
}`;


const changeOrgMutation = gql`mutation changeorganization($object:change_org_insert_input!) {   
  changeOrganization(arg1:$object){
   data{
     accessToken
     current_organization
   }
 }
}`

const verifyUserQuery = gql`query getuser($input:String!){
  users(where:{_or:[{phone: {_eq: $input}},{email: {_eq: $input}}]}) {
   name
    lastname
    created_at
    email
    phone
    is_delete
    id
    password
    pin
    login_type
  }
}`

const forgotPasswordMutation = gql`mutation forgetPassword($object:forgetPassInput!) {
  forgetPassword(arg1:$object) {
   data
   response{
    message
    status
   }
  }
}`

const verifyForgotPassword = gql`mutation setPassword($object:setPassInput!) {
  setPassword(arg1:$object) {
    message
    status
    
  }
}`

export const login = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  // console.log('login payload', payload)
  thunkAPI.dispatch(setAuthBtnLoading(true))
  let data = {}
  try {

    const response = await client.mutate({
      mutation: loginMutation, variables: {
        object: payload
      }
    });

    if (response.data.login.data.accessToken) {
      data = {
        success: true,
        message: 'Login Successful'
      }
      // console.log(response)
      await thunkAPI.dispatch(getUserById(response.data.login.data.user_id))
      await thunkAPI.dispatch(getUserOrgByid(response.data.login.data.user_id))
      thunkAPI.dispatch(setAuthBtnLoading(false))
      toast.success(data.message);
      return response.data.login.data;
    } else {
      data = {
        success: false,
        message: 'Something Went Worng'
      }
      toast.error(response.data.login.response.message);
      localStorage.clear()
    }

  } catch (error) {

    console.log(error)
    data = {
      success: false,
      message: 'Network Error'
    }
    toast.error(data.message);
    localStorage.clear()
  }

  return data

})

export const organizationRegistartion = createAsyncThunk('organizations/create', async (payload, thunkAPI) => {
  //console.log("Create Organization Payload ...................", payload)
  let data = {}
  try {
    const response = await client.mutate({
      mutation: orgReg, variables: {
        object: payload
      }
    });
    data = {
      status: response.data.org_registration.status,
      message: response.data.org_registration.message
    }

    return data

  } catch (e) {
    //console.log('error', e)
    data = {
      status: false,
      message: e.message
    }
    // console.log('response+++++++', data)
    //toast.error(data.message);
  }
  return data
})


export const getUserById = createAsyncThunk('users/byId', async (payload, thunkAPI) => {
  try {
    const response = await client.mutate({
      mutation: getUserByIdMutation, variables: {
        "id": `${payload}`
      }
    })
    return response.data.users[0]

  } catch (e) {
    console.log('error', e)
    if(e.message=="Could not verify JWT: JWTExpired"){
      thunkAPI.dispatch(setShowExpired(true))
    }
  }

})

export const getUserOrgByid = createAsyncThunk('users/byOrgId', async (payload, thunkAPI) => {
  // console.log("user++++++++++++++++++++++++", payload)
  try {
    const response = await client.mutate({
      mutation: getUserByOrgIdQuery, variables: {
        "user_id": `${payload}`
      }
    })
    return response.data.user_org
  } catch (e) {
    console.log('error', e)
    if(e.message=="Could not verify JWT: JWTExpired"){
      thunkAPI.dispatch(setShowExpired(true))
    }
  }
})


export const changeCurrentOrg = createAsyncThunk('users/changeOrg', async (payload, thunkAPI) => {
  try {
    const response = await client.mutate({
      mutation: changeOrgMutation, variables: {
        object: {
          "org_id": payload
        }
      }
    })
    return response.data.changeOrganization.data
  } catch (e) {
    console.log('error', e)
  }
})


export const validateUser = createAsyncThunk('users/verifyUser', async (payload, thunkAPI) => {
  try {
    const response = await client.mutate({
      mutation: verifyUserQuery, variables: {
        "input": `${payload}`
      }
    })

    return response.data.users[0]

  } catch (e) {
    console.log('error', e)
  }
})

export const forgotPasswordValidation = createAsyncThunk('forgotPassword/verifyUser', async (payload, thunkAPI) => {
  try {
    const response = await client.mutate({
      mutation: forgotPasswordMutation, variables: { "object": { "phone": payload } }
    })
    return response.data.forgetPassword
  } catch (e) {
    console.log('error', e)
    let data = {
      status : false,
      message : 'Network Error'
    }
    return data
  }
})

export const setPasswordValidation = createAsyncThunk('setPassword/verifyUser', async (payload, thunkAPI) => {
  try {
    const response = await client.mutate({
      mutation: verifyForgotPassword, variables: { "object": payload }
    })

    return response.data.setPassword

  } catch (e) {
    console.log('error', e)
  }
})

export const versionCheck = createAsyncThunk(
  "appversion/versionCheck",
  async (payload, thunkAPI, state) => {
    let versionNo = {
      version : payload
    }
    try {
      const response = await axios.post(`${baseUrl}auth/buildCodeVerification`, versionNo);
         return response.data;
    } catch (e) {
      console.log(e, "ERROR");
      toast.error(e.message);
      return e;
    }
  }
);


export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: "",
    available_organizations: [],
    current_organization: '',
    toggleSideMenu: false,
    user_id: '',
    userDetails: {},
    authBtnLoading: false,
    userOrgDetails: [],
    versionCheckResponse: {}
  },
  extraReducers: {
    [login.fulfilled]: (state, action) => {
      if (action.payload.accessToken) {
        state.accessToken = action.payload.accessToken;
        state.current_organization = action.payload.current_organization;
        state.user_id = action.payload.user_id;
        state.available_organizations = action.payload.available_organizations;
        localStorage.setItem('token', action.payload.accessToken)
      }
      return state;
    },
    [getUserById.fulfilled]: (state, action) => {
      state.userDetails = action.payload;
      localStorage.setItem('userData', JSON.stringify(action.payload))
      return state;
    },
    [changeCurrentOrg.fulfilled]: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.current_organization = action.payload.current_organization;
      localStorage.setItem('token', action?.payload?.accessToken)
      return state;
    },
    [getUserOrgByid.fulfilled]: (state, action) => {
      state.userOrgDetails = action.payload;
      if(action?.payload&&action?.payload[0]){
        localStorage.setItem('userOrgData', JSON.stringify(action?.payload[0]))
      }
      return state;
    },
    [versionCheck.fulfilled]: (state, action) => {
      state.versionCheckResponse = action.payload;
      return state;
    },
  },
  reducers: {
    logOut: (state) => {
      state.accessToken = ""
      state.userDetails = {}
      state.userOrgDetails = {}
      state.user_id = ''
      state.available_organizations = []
      state.current_organization = ''
      state.notificationList = []
      localStorage.clear()
      return state;
    },
    setAuthBtnLoading: (state, action) => {
      state.authBtnLoading = action.payload
    },
    setToggleMenu: (state, action) => {
      state.toggleSideMenu = action.payload
    },
    setShowExpired:(state,action)=>{
      state.showExpired=action.payload
      return state
    }

  }
}
)

export const { logOut, setAuthBtnLoading, setToggleMenu,setShowExpired } = authSlice.actions

export default authSlice.reducer