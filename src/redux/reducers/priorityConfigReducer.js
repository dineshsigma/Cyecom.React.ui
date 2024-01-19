import { gql } from "@apollo/client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { client } from '../../environment'
const priorityconfigMutation = gql`query getPriorities($org_id:Int!){ 
    priorities(where:{_or:[{org_id: {_eq: $org_id}},{org_id: {_eq: 0}}],is_delete:{_eq:false}},,order_by: {id: asc}){ id name org_id parent_id color } }`;

const createpriorityconfigMutation = gql`mutation createTask($objects:[priorities_insert_input!]!){
     insert_priorities(objects:$objects){
        returning{
            id
            }
        } 
        }`;

const priorityConfigQuery=gql`query getPriorities($org_id: Int!) {
  
    parents:  priorities(where: {org_id: {_eq:0},parent_id:{_is_null:true},is_delete: {_eq: false}}) {
      id
      name
      org_id
      parent_id
    },
   base_childs:  priorities(where: {org_id: {_eq: 0},parent_id:{_is_null:false},is_delete: {_eq: false}}) {
      id
      name
      org_id
      parent_id
      color
    },
     org_childs:  priorities(where: {org_id: {_eq: $org_id},parent_id:{_is_null:false},is_delete: {_eq: false}}) {
      id
      name
      org_id
      parent_id
      color
    },  
  }`

const statusPriorityUpadteDelCheck=gql`mutation statusPriorityDelCheck($object:statusPriorityDelCheckInput!) {
    statusPriorityDelCheck(arg1:$object) {
    response {
      message
      status
    }
  }
}`

const updatepriorityconfigMutation = gql`mutation updateTask($object: [priorities_insert_input!]!) { insert_priorities(objects: $object, on_conflict: { constraint: priorities_pkey, update_columns: [name, color] }){ affected_rows } } `
const deletepriorityconfigMutation = gql`mutation update_user($object: [priorities_insert_input!]!) { insert_priorities(objects: $object, on_conflict: { constraint: priorities_pkey, update_columns: [is_delete] }){ affected_rows } } `

const getColorQuery=gql`query getColors {
    config {
      id
      type
      value
      org_id
      value_type
    }
  }`


  export const getColors = createAsyncThunk('priority/getColors', async (payload) => {
    try {
        const response = await client.query({
            query: getColorQuery, variables: {
                object:payload
            }
        })
        return response.data
    } catch (e) {
    }
})

export const priorityStatusCheck = createAsyncThunk('priorityStatus/updateDeleteStatus', async (payload) => {
    console.log("reddddddddddddddddddddd",payload)
    try {
        const response = await client.mutate({
            mutation: statusPriorityUpadteDelCheck, variables:
            {object:payload}
        })
        return response.data
    } catch (e) {
        console.error(e)
    }
})

let orgId;
export const getpriorityConfig = createAsyncThunk('priority/getPriority', async (payload, thunkAPI) => {
    thunkAPI.dispatch(setLoader(true))
    orgId = thunkAPI.getState().auth.current_organization;
    try {
        const response = await client.query({
            query: priorityconfigMutation, variables: {
                "org_id": orgId
            }
        })
        thunkAPI.dispatch(setLoader(false))
        return response.data.priorities
    } catch (e) {
        thunkAPI.dispatch(setLoader(false))
        return e;
    }
})

export const getPriorityConfigList = createAsyncThunk('priority/list', async (payload, thunkAPI) => {
    try {
        const response = await client.query({
            query: priorityConfigQuery, variables: {
                org_id: payload
            }
        });
        return response.data;
    } catch (e) {
    }
})
export const createpriorityConfig = createAsyncThunk('priority/createPriority', async (payload) => {
    let data = {}
    try {
        const response = await client.query({
            query: createpriorityconfigMutation, variables: {
                "objects": payload
            }
        })
        data = {
            status: true,
            message: 'Priority  Added Sucessfully'
        }
        toast.success(data.message);

        return response;

    } catch (e) {
        data = {
            status: false,
            message: "error"
        }
        toast.success(data.message);
        return e;
    }
})



export const updatepriorityConfig = createAsyncThunk('priority/updatePriority', async (payload) => {
    let data = {}
    try {
        const response = await client.query({
            query: updatepriorityconfigMutation, variables: {
                "object": payload
            }
        })

        data = {
            status: true,
            message: 'Priority Config Updated Sucessfully'
        }
        toast.success(data.message);
        return data.message

    } catch (e) {
        return e;
    }
})

export const deletepriorityConfig = createAsyncThunk('priority/deletePriority', async (payload) => {
    let data = {}
    try {
        const response = await client.query({
            query: deletepriorityconfigMutation, variables: {
                "object": payload
            }
        });

        data = {
            status: true,
            message: 'Priority Deleted Sucessfully'
        }
        toast.success(data.message);
        return response;
    } catch (e) {
        return e;
    }
})
const priorityConfigSlice = createSlice({
    name: "priorityconfig",
    initialState: {
        priorityConfigList: [],
        originalPriorityConfig:[],
        priorityChildConfigList:[],
        priorityResponse: {},
        updatepriorityResponse: {},
        loader: false,
        priorityParentList:[],
        priorityChildList:[],
        colors:[]
    },
    extraReducers: {
        [getpriorityConfig.fulfilled]: (state, action) => {
            state.priorityConfigList = action.payload;
            state.priorityChildConfigList=action.payload.filter((item, index) => { return item?.parent_id != null })
            state.originalPriorityConfig=action.payload.filter((item, index) => { return item.org_id == orgId })
            return state;
        },
        [createpriorityConfig.fulfilled]: (state, action) => {
            state.priorityResponse = action.payload;
            return state;
        },
        [updatepriorityConfig.fulfilled]: (state, action) => {
            state.priorityResponse = action.payload;
            return state;
        },
        [deletepriorityConfig.fulfilled]: (state, action) => {
            state.priorityResponse = action.payload;
            return state;
        },
        [getPriorityConfigList.fulfilled]:(state,action)=>{
            state.priorityParentList=action.payload.parents
            if(action.payload.org_childs.length>0){
                state.priorityChildList=action.payload.org_childs
            }
            else{
                state.priorityChildList=action.payload.base_childs
            }
            return state
        },
        [getColors.fulfilled]:(state,action)=>{
            state.colors=action.payload.config
            return state
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


