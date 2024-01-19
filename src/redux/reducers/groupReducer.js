import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gql } from '@apollo/client'
import { client } from '../../environment'
import { toast } from 'react-toastify';

const createGroupMutation = gql`mutation addGroups($object:groups_insert_input!){
    insert_groups_one(object:$object){
        id
    }
}`;

const getGroupsQuery = gql`query getGroups($title: String!) {
    groups(where:{_and:[{title:{_iregex:$title}},{is_delete:{_eq:false}}]},order_by: {title: asc} ) {
      id
      org_id
      title
      created_at
      created_by
      description
      group_members
      updated_by 
      updated_on 
      updated_by 
      deleted_on 
      deleted_by
      is_delete
    }
  }`;

const updateGroupMutation = gql`mutation updateGroup($object:[groups_insert_input!]!) {
    insert_groups(objects: $object
    ,
          on_conflict: {
            constraint: groups_pkey,
            update_columns: [title,group_members,description,updated_by,updated_on,deleted_on,deleted_by,is_delete]
          }
      ){
          affected_rows
      }
    }`;
const deleteGroupMutation = gql `mutation deleteGroup($id: Int!) {
    delete_groups(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }`;   

const getGroupsStatusCountMutation = gql`mutation getStatusCountFilter($object:group_status_count_list!) {
    getTaskStatusCountList(arg1:$object)
    {
     data
      response{
        message
        status
      }
    }
  }`

export const createGroup = createAsyncThunk('groups/create', async (payload, thunkAPI) => {
    //console.log("Create Group Payload ...................", payload)
    let data = {}
    try {
        const response = await client.mutate({
            mutation: createGroupMutation, variables: {
                object: payload
            }
        });
        data = {
            status: true,
            message: 'Team Added Sucessfully'
        }
        //console.log('response+++++++11', data)
        toast.success(data.message);
        thunkAPI.dispatch(setGroupAddform(false))
        thunkAPI.dispatch(setGroupButtonLoading(false))

    } catch (e) {
        //console.log('error', e)
        data = {
            status: false,
            message: e.message
        }
        //console.log('response+++++++', data)
        toast.error(data.message);
        thunkAPI.dispatch(setGroupButtonLoading(false))
    }
    return data
})

export const getGroups = createAsyncThunk('groups/getGroups', async (payload) => {
    try {
        const response = await client.query({
            query: getGroupsQuery, variables: {
                "title": `${payload}`
            }
        })
        //console.log('getGroups', response.data.groups)
        return response.data.groups
    } catch (e) {
        //console.log('error', e)
    }
})

export const updateGroup = createAsyncThunk('groups/updateGroup', async (payload , thunkAPI) => {
    //console.log("Update Group Payload ...................", payload)
    const userid = thunkAPI.getState().auth.user_id
    let data = {}
    let temp = { ...payload, updated_by:userid, updated_on: new Date() }
    try {
        const response = await client.mutate({
            mutation: updateGroupMutation, variables: {
                object: temp
            }
        });
        data = {
            status: true,
            message: 'Team Updated Sucessfully'
        }
        //console.log('response+++++++', data)
        toast.success(data.message);
        thunkAPI.dispatch(setGroupUpdateForm(false))
        thunkAPI.dispatch(setGroupButtonLoading(false))
    } catch (e) {
        //console.log('error', e)
        data = {
            status: true,
            message: e.message
        }
        //console.log('response+++++++', data)
        toast.error(data.message);
        thunkAPI.dispatch(setGroupButtonLoading(false))
    }
    return data
})

export const deleteGroup = createAsyncThunk('groups/delete', async (payload, thunkAPI) => {
    let data = {}
    //console.log("deleteGroup...................", payload)
    const userid = thunkAPI.getState().auth.user_id
    let temp = { ...payload, is_delete:true, deleted_by:userid, deleted_on: new Date() }
    try {
        const response = await client.mutate({
            mutation: updateGroupMutation, variables: {
                object: temp
            }
        });
        data = {
            status: true,
            message: 'Team Deleted Sucessfully'
        }
        //console.log('response+++++++', data)
        toast.success(data.message);
        thunkAPI.dispatch(setGroupButtonLoading(false))
    } catch (e) {
        //console.log('error', e)
        data = {
            status: true,
            message: 'Team Deleted Sucessfully'
        }
        toast.error(data.message);
        thunkAPI.dispatch(setGroupButtonLoading(false))
    }
    return data
})

//get group Status Count 

export const getGroupStatusCount = createAsyncThunk('groups/statuscount',async (payload,thunkAPI) =>{
    thunkAPI.dispatch(setLoader(true))
    // console.log("response--------",payload);
    try{
        const response = await client.query({
            query: getGroupsStatusCountMutation, variables: {
                "object":payload
            }
        })
        thunkAPI.dispatch(setLoader(false))
        return response.data.getTaskStatusCountList.data
    }
    catch(error){
        console.log("error",error)
        thunkAPI.dispatch(setLoader(false))
    }
})


export const groupSlice = createSlice({
    name: 'groups',
    initialState: {
        groupsList: [],
        groupResponse: {},
        showAddForm : false,
        showUpdateForm: false,
        buttonLoading : false,
        loader : false
    },
    extraReducers: {
        [createGroup.fulfilled]: (state, action) => {
            state.groupResponse = action.payload;
            //console.log('2222222222222222222222222222222222222')
            return state;
        },
        [getGroups.fulfilled]: (state, action) => {
            //console.log("dsfsdfsdfsdfdsfds.......", state, action);
            state.groupsList = action.payload;
            return state;
        },
        [updateGroup.fulfilled]: (state, action) => {
            state.groupResponse = action.payload;
            //console.log('2222222222222222222222222222222222222')
            return state;
        },
        [deleteGroup.fulfilled]: (state, action) => {
            state.groupResponse = action.payload;
            //console.log('2222222222222222222222222222222222222')
            return state;
        },
        [getGroupStatusCount.fulfilled]: (state, action) => {
            state.groupStatusResponse = action.payload;
            
            return state;
        },
    },
    reducers: {
        setGroupAddform: (state,action) => {
            state.showAddForm = action.payload
            return state;
        },
        setGroupUpdateForm : (state,action) => {
            state.showUpdateForm = action.payload
            return state;
        },
        setGroupButtonLoading : (state, action)=>{
            state.buttonLoading = action.payload
            return state;
        },
        setLoader : (state,action)=>{
            state.loader = action.payload
            return state;
        }
    }
}
)

export const { setGroupAddform, setGroupUpdateForm, setGroupButtonLoading, setLoader} = groupSlice.actions

export default groupSlice.reducer