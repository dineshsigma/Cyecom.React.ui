import { gql } from "@apollo/client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { client } from '../../environment'

const statusConfigMutation = gql`query getStatus($org_id:Int!){ 
    status(where:{_or:[{org_id: {_eq: $org_id}},{org_id: {_eq: 0}}],is_delete:{_eq:false}},order_by: {id: asc}){ id 
        name 
        org_id 
        parent_id
        color
        } 
    }`;

const createStatusConfigMutation = gql`mutation createStatus($objects:[status_insert_input!]!){ 
    insert_status(objects:$objects){ 
        returning{
            id
            }
        } 
    }`;

const updateStatusConfigMutation = gql`mutation update_status($object:[status_insert_input!]!) { 
    insert_status(objects: $object , 
    on_conflict: { 
        constraint: status_pkey, 
        update_columns: [name,color] 
        } 
        )
        { 
            affected_rows 
            } 
        }`




const deleteStatusConfigMutation = gql`mutation update_status($object:[status_insert_input!]!) { 
    insert_status(objects: $object , 
    on_conflict: { 
        constraint: status_pkey, 
        update_columns: [is_delete] 
        } 
        )
        { 
            affected_rows 
            } 
        }`
const getAllStatus = gql`query getStatus($org_id: Int!) {
            parents:  status(where: {org_id: {_eq:0},parent_id:{_is_null:true},is_delete: {_eq: false}}) {
              id
              name
              org_id
              parent_id
            },
           base_childs:  status(where: {org_id: {_eq: 0},parent_id:{_is_null:false},is_delete: {_eq: false}}) {
              id
              name
              org_id
              parent_id
              color
            },
             org_childs:  status(where: {org_id: {_eq: $org_id},parent_id:{_is_null:false},is_delete: {_eq: false}}) {
              id
              name
              org_id
              parent_id
              color
            },
          }`
let orgId;
export const getStatusConfig = createAsyncThunk('status/getStatus', async (payload, thunkAPI) => {
    thunkAPI.dispatch(setLoader(true))
    orgId = thunkAPI.getState().auth.current_organization;
    try {
        const response = await client.query({
            query: statusConfigMutation, variables: {
                "org_id": orgId
            }
        })
        thunkAPI.dispatch(setLoader(false))
        return response?.data?.status
    } catch (e) {
        console.log('error', e)
        thunkAPI.dispatch(setLoader(false))
        return e;
    }
})

export const createStatusConfig = createAsyncThunk('status/createStatus', async (payload) => {
    let data = {}
    try {
        const response = await client.query({
            query: createStatusConfigMutation, variables: {
                "objects": payload
            }
        })
        data = {
            status: true,
            message: 'Status  Added Sucessfully'
        }
        toast.success(data.message);
        return response;

    } catch (e) {
        console.log('error', e)
        data = {
            status: false,
            message: "error"
        }
        toast.success(data.message);
        return e;
    }
})

export const updateStatusConfig = createAsyncThunk('status/updatestatus', async (payload) => {
    let data = {}
    try {
        const response = await client.query({
            query: updateStatusConfigMutation, variables: {
                "object": payload
            }
        })
        data = {
            status: true,
            message: 'Status  Updated Sucessfully'
        }
        toast.success(data.message);
        return data.message

    } catch (e) {
        console.log('error', e)
        return e;
    }
})


export const deleteStatusConfig = createAsyncThunk('status/deleteStatus', async (payload) => {
    let data = {}
    try {
        const response = await client.query({
            query: deleteStatusConfigMutation, variables: {
                "object": payload
            }
        })
        data = {
            status: true,
            message: 'Status Deleted Sucessfully'
        }
        toast.success(data.message);
        return response;
    } catch (e) {
        console.log('error', e);
        return e;
    }
})

export const getAllTaksStatus = createAsyncThunk('comment/status', async (payload, thunkAPI) => {

    try {
        const response = await client.query({
            query: getAllStatus, variables: {
                org_id: payload
            }
        });
        return response?.data;
    } catch (e) {
        console.log('response+++++++', e)
    }
})


const priorityConfigSlice = createSlice({
    name: "statusconfig",
    initialState: {
        statusConfigList: [],
        statusChildConfigList: [],
        originalStatusConfig: [],
        statusresponse: {},
        loader: false,
        tasksStatus : {}
    },
    extraReducers: {
        [getStatusConfig.fulfilled]: (state, action) => {
            state.statusConfigList = action.payload;
            state.statusChildConfigList = action?.payload?.filter((item, index) => { return item?.parent_id != null })
            state.originalStatusConfig = action?.payload?.filter((item, index) => { return item.org_id == orgId })
            return state;
        },
        [createStatusConfig.fulfilled]: (state, action) => {
            state.statusresponse = action.payload;
            return state;
        },
        [updateStatusConfig.fulfilled]: (state, action) => {
            state.priorityResponse = action.payload;
            return state;
        },
        [deleteStatusConfig.fulfilled]: (state, action) => {
            state.priorityResponse = action.payload;
            return state;
        },
        [getAllTaksStatus.fulfilled]: (state, action) => {
            state.tasksStatus = action.payload;
            return state;
        }
    },
    reducers: {
        setLoader: (state, action) => {
            state.loader = action.payload
            return state;
        }
    }
})

export const { setLoader } = priorityConfigSlice.actions
export default priorityConfigSlice.reducer;


