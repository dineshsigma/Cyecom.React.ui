import { gql } from "@apollo/client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { client } from '../../environment'

const remindergetconfigQuery = gql`query MyQuery {
    remainders {
      days
      days_type
      email
      execution
      id
      in_app
      is_enable
      notification
      org_id
      priority
      timer
      status
      min_days
      type
    }
  }`

  const remindersfilterquery = gql`query MyQuery($status:String!,$priority:String!,$org_id:Int!) {
    remainders(where: {_and: {org_id: {_eq: $org_id}, priority: {_eq: $priority}, status: {_eq: $status}}}) {
      timer
      status
      priority
      org_id
      notification
      is_enable
      in_app
      id
      execution
      email
      days_type
      days
      min_days
      type
    }
  }
  `

  const createReminders = gql `mutation createReminders($objects:[remainders_insert_input!]!){
    insert_remainders(objects:$objects){
        returning{
        id
        }

    }       

}`

const updateRemainderMutation = gql`mutation updateReminders($object:[remainders_insert_input!]!) {
    insert_remainders(objects: $object
    ,
          on_conflict: {
            constraint: remainders_pkey,
            update_columns: [status,priority,days,days_type,email,execution,in_app,is_enable,notification,org_id,timer,type]
          }
      ){
          affected_rows
      }
    }`
    
  

  export const getRemindersConfig = createAsyncThunk('reminder/getAllreminders', async (payload,thunkAPI) => {
    thunkAPI.dispatch(setLoader(true))
    // const orgId = thunkAPI.getState().auth.current_organization;
    try {
        const response = await client.query({
            query: remindergetconfigQuery
        })
        thunkAPI.dispatch(setLoader(false))
        return response;
    } catch (e) {
        console.log('error', e)
        thunkAPI.dispatch(setLoader(false))
        return e;
    }
})


export const getRemindersfilterConfig = createAsyncThunk('reminder/getfilterreminders', async (payload,thunkAPI) => {
    // console.log("payload---",payload);
  // const orgId = thunkAPI.getState().auth.current_organization;
  try {
      const response = await client.query({
          query: remindersfilterquery,variables: {
           "status":payload.status,
           "priority":payload.priority,
           "org_id":payload.org_id

        }
      })
      return response;
  } catch (e) {
      console.log('error', e)
      return e;
  }
})

export const createRemindersConfig = createAsyncThunk('reminder/createreminders', async (payload,thunkAPI) => {
    // console.log("payload---",payload);
    let data = {}
  // const orgId = thunkAPI.getState().auth.current_organization;
  try {
    const response = await client.mutate({
        mutation: createReminders, variables: {
            objects: payload
        }
    });
      // console.log("createconfffffffff",response);
      // console.log("updatefffffffff",response);
      data = {
        status: true,
        message: 'Remainders Created  Sucessfully'
    }
    toast.success(data.message);
    //   return response;
  } catch (e) {
      console.log('error', e)
      return e;
  }
})

export const updateRemindersConfig = createAsyncThunk('reminder/updatereminders', async (payload,thunkAPI) => {
    // console.log("payload---",payload);
    let data = {}
  
  try {
    const response = await client.query({
        query: updateRemainderMutation, variables: {
            object: payload
        }
    })
      // console.log("updatefffffffff",response);
      data = {
        status: true,
        message: 'Remainders Updated  Sucessfully'
    }
    toast.success(data.message);
    //   return response;
  } catch (e) {
      console.log('error', e)
      return e;
  }
})



const ReminderConfigSlice = createSlice({
    name: "reminderconfig",
    initialState: {
        reminderConfigList: [],
        reminderConfigFilterList: [],
        insertreminderList :[],
        updatereminderList:[],
        loader:false
    },
    extraReducers: {
        [getRemindersConfig.fulfilled]: (state, action) => {
            state.reminderConfigList = action.payload;
            return state;
        },
        [getRemindersfilterConfig.fulfilled]: (state, action) => {
            state.reminderConfigFilterList = action.payload;
            return state;
        },
        [createRemindersConfig.fulfilled]: (state, action) => {
            state.insertreminderList = action.payload;
            return state;
        },
        [updateRemindersConfig.fulfilled]: (state, action) => {
            state.updatereminderList = action.payload;
            return state;
        },
    },
    reducers: {
      setLoader: (state, action) => {
        state.loader = action.payload
        return state;
    }
    }
})

export const { setLoader} = ReminderConfigSlice.actions
export default ReminderConfigSlice.reducer;




