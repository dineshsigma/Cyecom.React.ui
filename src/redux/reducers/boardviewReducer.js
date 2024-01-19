import { gql } from "@apollo/client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { client } from '../../environment'


const taskMutation = gql`query getUserBoardViewTasks{
  getUserBoardViewTasks{
    data
    response{
      message
      status
    }
    }
}`;

  const statusUpdateMutation = gql`mutation update_task($id:Int!,$object:tasks_set_input!) {
    update_tasks(
      where: {id: {_eq:$id}},
      _set: $object
    ) {
      affected_rows
      returning {
        id
      }
    }
  }`;

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
    },
     org_childs:  status(where: {org_id: {_eq: $org_id},parent_id:{_is_null:false},is_delete: {_eq: false}}) {
      id
      name
      org_id
      parent_id
    },
  }`
  

export const getTasksforBoard = createAsyncThunk('comment/create', async(payload, thunkAPI)=>{
    try{
        const response = await client.query({
            query: taskMutation, variables: {
                object: payload
            }
        });
        console.log("boardView-res",response)
        return response.data.getUserBoardViewTasks.data;
    }catch(e){
        console.log('response+++++++', e)
    }
})

export const updateStatus = createAsyncThunk('comment/create', async(payload, thunkAPI)=>{
    let data = {
        "internal_status" : payload.internal_status
    }
    try{
        const response = await client.mutate({
            mutation: statusUpdateMutation, variables: {
                object: data, id : payload.id, 
            }
        });
        // console.log(response,data,"resssspo")
        return response.data;
    }catch(e){
        console.log('response+++++++', e)
    }
})

// export const getAllTaksStatus = createAsyncThunk('comment/status', async(payload, thunkAPI)=>{
   
//     try{
//         const response = await client.query({
//             query: getAllStatus, variables: {
//                 org_id : payload
//             }
//         });
//         console.log(response.data,"resssspo")
//         return response.data;
//     }catch(e){
//         console.log('response+++++++', e)
//     }
// })


const boardSlice = createSlice({
    name : "board",
    initialState : {
        alltasks : [],
        updateStatusResponse : {},
        // tasksStatus : {}
    },
    extraReducers:{
        [getTasksforBoard.fulfilled] : (state,action) => {
            state.alltasks = action.payload;
            return state;
        },
        [updateStatus.fulfilled] : (state,action) => {
            state.updateStatusResponse = action.payload;
            return state;
        },
        // [getAllTaksStatus.fulfilled] : (state,action) => {
        //     state.tasksStatus = action.payload;
        //     return state;
        // },
       
    }
})
export default boardSlice.reducer;