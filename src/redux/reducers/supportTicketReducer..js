import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gql } from '@apollo/client'
import { client } from '../../environment'
import { toast } from 'react-toastify';

// const createTaskMutation = gql ``
const createTicketMutation = gql`mutation insert_ticket($object: ticket_insert_input!) {

    insert_ticket_one(object: $object) {
        id
        
        }
  
  }`;

  const getTicketQuery = gql`query MyQuery($title:String!) {
    ticket(where: {title: {_iregex: $title}},order_by:{id:desc}) {
      id
      title
      status
      user_id
      comment
      type
      date
      assignee
      org_id
      created_at
    }
  }`;

//   const updateTicketMutation = gql`mutation update_ticket($object:[ticket_insert_input!]!) {
//     insert_ticket(objects: $object
//     ,
//           on_conflict: {
//             constraint: ticket_pkey,
//             update_columns: [title,type,comment,status]
//           }
//       ){
//           affected_rows
//       }
//     }`;

    const deleteTicketMutation = gql`mutation deleteTicket($id: Int!) {
        delete_ticket(where: {id: {_eq: $id}}) {
          affected_rows
        }
      }`;
    
    const getTickets_byid =  gql`query getCommentsByTicketId($ticket_id:Int!){ticket_comment(where:{ticket_id:{_eq:$ticket_id}},order_by:{id:desc}) { id created_at comment ticket_id user_id user_type }}`;

    const getCommentsMutation =  gql`mutation insert_ticket_comment_one($object:ticket_comment_insert_input!) {
        insert_ticket_comment_one(object: $object) {
          id
          comment
          ticket_id
          user_id 
          user_type
        }
        }
      `;

const updateTicketMutation=gql`mutation updateTicket($object:[ticket_insert_input!]!) {
    insert_ticket(objects: $object
    ,
          on_conflict: {
            constraint: ticket_pkey,
            update_columns: [title,type,status,priority]
          }
      ){
          affected_rows
      }
    }`


export const update_Ticket=createAsyncThunk('tickets/update',async(payload)=>{
    const {data,status}=payload
    try{
        const response=await client.mutate({
            mutation:updateTicketMutation,variables:{
                object:data
            }
        })
        if(response.data){
            toast.success(`${status} Updated Successfully`)
            return response
        }

    }
    catch(e){

    }
})

export const getAll_tickets = createAsyncThunk('tickets/getall', async (payload, thunkAPI) => {
    thunkAPI.dispatch((setLoader(true)))
     let name = {
        title:payload
     }
        try {
            const response = await client.query({
                query: getTicketQuery, variables: name
            })
            thunkAPI.dispatch((setLoader(false)))
            return response.data.ticket
        } catch (e) {
            thunkAPI.dispatch((setLoader(false)))
        }
    })
    export const create_tickets = createAsyncThunk('tickets/create', async (payload, thunkAPI) => {
        let data = {}
           try {
               const response = await client.mutate({
                mutation: createTicketMutation, variables: {
                    object: payload
                }
               })
               data = {
                status: true,
                res:response.data.insert_ticket_one,
                message: 'Ticket Created Sucessfully'
            }
            thunkAPI.dispatch(setButtonLoading(false))
            toast.success(data.message);
               return data
           } catch (e) {
           }
           thunkAPI.dispatch(setButtonLoading(false))
           toast.success(data.message);
       })

       export const deleteTicket = createAsyncThunk('tickets/delete', async (payload, thunkAPI) => {
        let data = {}
           try {
               const response = await client.mutate({
                mutation: deleteTicketMutation, variables: {
                        "id": `${payload}`
                }
               })
               data = {
                status: true,
                message: 'Ticket deleted Sucessfully'
            }
               toast.success(data.message);
               thunkAPI.dispatch(setButtonLoading(false))
               return response.data
           } catch (e) {
            data = {
                status: true,
                message: e.message
            }
            toast.error(data.message);
            thunkAPI.dispatch(setButtonLoading(false))
           }
       })
       export const getAll_ticketsComments_byid = createAsyncThunk('tickets/getticketsbyid', async (payload, thunkAPI) => {
        thunkAPI.dispatch(setLoader(true))
           try {
               const response = await client.query({
                   query: getTickets_byid, variables: payload
               })
               thunkAPI.dispatch(setLoader(false))
               return response.data.ticket_comment
           } catch (e) {
            thunkAPI.dispatch(setLoader(false))
           }
       })

       export const create_Comment = createAsyncThunk('tickets/comment', async (payload, thunkAPI) => {
        thunkAPI.dispatch(setLoader(true))
           try {
               const response = await client.mutate({
                mutation: getCommentsMutation, variables: {
                    "object" : payload
                }
               })
               thunkAPI.dispatch(setLoader(false))
               return response.data
           } catch (e) {
            thunkAPI.dispatch(setLoader(false))
           }
       })

export const taskSlice = createSlice({
    name: 'tickets',
    initialState: {
        showTask : false,
        showTemplateForm : false,
        buttonLoading: false,
        taskResponse : {},
        tickets : [],
        deleteTicketResponse : {},
        createTicketResponse : {},
        getTicketsByid : [],
        createCommentResponse : {},
        buttonLoading : false,
        updateTicketData:"",
        createDiasble:false,
        loader:false

    },
    extraReducers: {
        [getAll_tickets.fulfilled]: (state, action) => {
            state.tickets = action.payload;
            return state;
        },
        [create_tickets.fulfilled]: (state, action) => {
            state.createTicketResponse = action.payload;
            return state;
        },
        [deleteTicket.fulfilled]: (state, action) => {
            state.deleteTicketResponse = action.payload;
            return state;
        },
        [getAll_ticketsComments_byid.fulfilled]: (state, action) => {
            state.getTicketsByid = action.payload;
            return state;
        },
        [create_Comment.fulfilled]: (state, action) => {
            state.createCommentResponse = action.payload;
            return state;
        },
        [update_Ticket.fulfilled]: (state, action) => {
            state.updateTicketData = action.payload;
            return state;
        },
       
    },
    reducers: {
        setTaskAddform: (state, action) => {
            state.showTask = action.payload
            return state;
        },
        setTemplateAddform: (state, action) => {
            state.showTemplateForm = action.payload
            return state;
        },
        setButtonLoading : (state, action)=>{
            state.buttonLoading = action.payload
            return state;
        },

        setDisableTaskComponent:(state,action)=>{
            state.createDiasble=action.payload
            return state
        },
        setLoader:(state,action)=>{
            state.loader=action.payload
            return state
        }
    }
}
)

export const { setTaskAddform , setTemplateAddform,setButtonLoading,setDisableTaskComponent,setLoader} = taskSlice.actions

export default taskSlice.reducer