import { gql } from "@apollo/client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { client, baseUrl } from '../../environment'
import axios from 'axios';

const createAttachmentMutation = gql`mutation insert_attachments($object: attachments_insert_input!) {insert_attachments_one(object: $object) {id}}`;

const TicketAttacmentMutation=gql`mutation insert_attachments($object: ticketAttachments_insert_input!) {insert_ticketAttachments_one(object: $object) {id}}`

const getAttachmentQuery = gql`query getAttachments($task_id:Int!) {
    attachments(where:{task_id:{_eq:$task_id}}){
      id
      user_id
      file_name
      folder_path 
      org_id 
      task_id
    }
  }`;
const updateAttachmentMutation = gql`mutation updateChecklist($object:[checklist_insert_input!]!) {
    insert_checklist(objects: $object,
        on_conflict: {
            constraint: checklist_pkey,
            update_columns: [title,is_done,updated_by,updated_on,deleted_by,deleted_on,is_delete]
        }
      )
      {affected_rows}}`;

const deleteAttachmentMutation = gql`mutation deleteAttachments($id: Int!) {delete_attachments(where: {id: {_eq: $id}}) {affected_rows}}`;

const getTicketQuery=gql`query getTicketAttachments($ticket_id:Int!) {
    ticketAttachments(where: {ticket_id: {_eq:$ticket_id},is_delete:{_eq:false}}) {
      id
      comment_id
      file_name
      file_type
      folder_path
      is_delete
      created_by
      created_at
      org_id
      ticket_id
      user_id
      deleted_on
      alias_user
    }}`

const deleteTicketAttachementMutation=gql`mutation updateAttachments($object:[ticketAttachments_insert_input!]!) {
    insert_ticketAttachments(objects: $object,
        on_conflict: {
        constraint: ticketAttachments_pkey,
        update_columns: [is_delete]
        }){
        affected_rows
      }
    }`

    const getCommentAttachemntQuery=gql`query getTicketAttachments($ticket_id:Int!,$comment_id:Int!) {
        ticketAttachments(where:{ticket_id: {_eq:$ticket_id},comment_id:{_eq:$comment_id},is_delete:{_eq:false}}) {
          id
          comment_id
          file_name
          file_type
          file_size
          folder_path
          is_delete
          created_by
          created_at
          org_id
          ticket_id
          user_id
          deleted_on
          alias_user
        }}`
    

export const deleteTicketAttachement=createAsyncThunk('attachements/deleteTicket',async(payload)=>{
    try{
        const response=await client.mutate({
            mutation:deleteTicketAttachementMutation,variables:
            {
                object:payload
            }
        })
        if(response){
            toast.success("Attachement Deleted Successfully")
            return response
        }
    }
    catch(e){
    }
})

export const getTicketAttachement=createAsyncThunk('attachemnts/tickets',async(payload)=>{
    try{
        const response=await client.query({
            query:getTicketQuery,variables:
                payload
            
        })
        if(response){
            return response
        }
    }
    catch(e){}
})


export const getCommentsAttachement=createAsyncThunk('attachemnts/comments',async(payload)=>{
    try{
        const response=await client.query({
            query:getCommentAttachemntQuery,variables:
                payload
            
        })
        if(response){
            return response
        }
    }
    catch(e){}
})

export const downloadAttachment = createAsyncThunk('locations/bulkUpload', async (payload, thunkAPI, state) => {
    try {
        const response = await axios.post(`${baseUrl}configuration/getAttachmentSignedUrl`, payload)
        return response.data.data
    }
    catch (e) {
        toast.error(e.message);
        return e
    }
})

export const attachmentUpload = createAsyncThunk('locations/bulkUpload', async (payload, thunkAPI, state) => {
    const orgId = thunkAPI.getState().auth.current_organization
    var data
    const token = localStorage.getItem('token');
    let body = {
        table_id: payload.task_id,
        filename: payload.file_name,
        org_id: orgId,
        folder_type: 'Attachments',
        table_name: 'tasks',
    }

    try {
        const response = await axios.post(`${baseUrl}configuration/getFileUploadUrl/${orgId}`, body, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const awsResponse = await axios.put(response.data.data, payload.file, {
            headers: {
                'Content-Type': payload.file_type,
            },
        }).then(async (res) => {
            let uploadBody = {
                file_name: payload.file_name,
                folder_path: payload.folder_path,
                file_type: payload.file_type,
                org_id: orgId,
                task_id: payload.task_id,
                user_id: payload.user_id,
                created_by : payload.user_id
            }

            const createResponse = await client.mutate({
                mutation: createAttachmentMutation, variables: {
                    object: uploadBody
                }
            });
            return createResponse
        })
        // toast.success(awsResponse.message);
        if (awsResponse.data) {
            data = {
                status: true,
                message: 'Attachment Created Sucessfully'
            }
            toast.success(data.message)
            return data
        } else {
            data = {
                status: false,
                message: 'Something went Wrong'
            }
            toast.error(data.message)
            return data
        }
    }
    catch (e) {
        toast.error(e.message);
        return e
    }
})

export const attachmentTicketUpload = createAsyncThunk('locations/bulkUpload', async (payload, thunkAPI, state) => {
    const orgId = thunkAPI.getState().auth.current_organization
    var data
    const token = localStorage.getItem('token');
    let body = {
        table_id: payload.ticket_id,
        filename: payload.file_name,
        org_id: orgId,
        folder_type: 'TicketAttachments',
        table_name: 'tickets',
    }

    try {
        const response = await axios.post(`${baseUrl}configuration/getFileUploadUrl/${orgId}`, body, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const awsResponse = await axios.put(response.data.data, payload.file, {
            headers: {
                'Content-Type': payload.file_type,
            },
        }).then(async (res) => {
            let uploadBody = {
                file_name: payload.file_name,
                folder_path: payload.folder_path,
                file_type: payload.file_type,
                file_size:payload.file_size?.toString(),
                org_id: orgId,
                ticket_id: payload. ticket_id,
                user_id: payload.user_id,
                created_by : payload.user_id,
                comment_id:payload.comment_id
            }

            const createResponse = await client.mutate({
                mutation: TicketAttacmentMutation, variables: {
                    object: uploadBody
                }
            });
            return createResponse
        })
        if (awsResponse.data) {
            data = {
                status: true,
                message: 'Attachment Created Sucessfully'
            }
            toast.success(data.message)
            return data
        } else {
            data = {
                status: false,
                message: 'Something went Wrong'
            }
            toast.error(data.message)
            return data
        }
    }
    catch (e) {
        toast.error(e.message);
        return e
    }
})
export const createAttachment = createAsyncThunk('attachment/create', async (payload, thunkAPI) => {
    let data = {}
    try {
        const response = await client.mutate({
            mutation: createAttachmentMutation, variables: {
                object: payload
            }
        });
        data = {
            status: true,
            message: 'Create Attachment Successfully'
        }
        toast.success(data.message)
    } catch (e) {
        data = {
            status: false,
            message: e.message
        }
        toast.error(data.message);
    }
    return data;
})
export const getAttachment = createAsyncThunk('attachment/getAttachment', async (payload) => {
    try {
        const response = await client.query({
            query: getAttachmentQuery, variables: {
                "task_id": `${payload}`
            }
        })
        return response.data.attachments
    } catch (e) {
    }
})
export const updateAttachment = createAsyncThunk('attachment/updateAttachment', async (payload, thunkAPI) => {
    const userid = thunkAPI.getState().auth.user_id
    let data = {}
    let temp = { ...payload, updated_by: userid, updated_on: new Date() }
    try {
        const response = await client.mutate({
            mutation: updateAttachmentMutation, variables: {
                object: temp
            }
        });
        data = {
            status: true,
            message: 'Attachment Updated Sucessfully'
        }
        toast.success(data.message);
    } catch (e) {
        data = {
            status: false,
            message: e.message
        }
    }
    return data
})
export const deleteAttachment = createAsyncThunk('attachment/delete', async (payload, thunkAPI) => {
    let data = {}
    try {
        const response = await client.mutate({
            mutation: deleteAttachmentMutation, variables: {
                id: payload
            }
        });
        data = {
            status: true,
            message: 'Attachment Deleted Sucessfully'
        }
        toast.success(data.message);
    } catch (e) {
        data = {
            status: true,
            message: 'Attachment Not Deleted '
        }
        toast.error(data.message);
    }
    return data
})
const attachmentSlice = createSlice({
    name: "attachment",
    initialState: {
        attachmentResponse: {},
        attachmentList: [],
        ticketAttachementData:null,
        commentAttachementData:null
    },
    extraReducers: {
        [createAttachment.fulfilled]: (state, action) => {
            state.attachmentResponse = action.payload;
            return state;
        },
        [getAttachment.fulfilled]: (state, action) => {
            state.attachmentList = action.payload;
            return state;
        },
        [updateAttachment.fulfilled]: (state, action) => {
            state.attachmentResponse = action.payload;
            return state;
        },
        [deleteAttachment.fulfilled]: (state, action) => {
            state.attachmentResponse = action.payload;
            return state;
        },
        [getTicketAttachement.fulfilled]:(state,action)=>{
            state.ticketAttachementData=action.payload;
            return state
        },
        [getCommentsAttachement.fulfilled]:(state,action)=>{
            state.commentAttachementData=action.payload;
            return state
        },
        
    }
})
export default attachmentSlice.reducer;