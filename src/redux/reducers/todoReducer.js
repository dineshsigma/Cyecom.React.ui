import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gql } from '@apollo/client'
import { client } from '../../environment'
import { toast } from 'react-toastify';

const createTodoMutation = gql`mutation insert_personaltodo($object:personaltodo_insert_input!) {

    insert_personaltodo_one(object: $object) {
        id
        
        }
  
  }`;


 // order_by: {id: desc}
const getTodosQuery = gql`query {
     personaltodo(order_by: {is_done: desc,id:desc}) {
     id
     title
     user_id
     org_id
     is_done
     createdDate
     edit
     alias_user
    }
}`;

const updateTodoMutation = gql`mutation update_personaltodo($object:[personaltodo_insert_input!]!) {
    insert_personaltodo(objects: $object
    ,
          on_conflict: {
            constraint: personaltodo_pkey,
            update_columns: [title,is_done,edit]
          }
      ){
          affected_rows
      }
    }`;

const deleteTodoMutation = gql`mutation deletePersonalTodo($id: Int!) {
    delete_personaltodo(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }`;

export const createTodo = createAsyncThunk('todos/create', async (payload, thunkAPI) => {
    let data = {}
    try {
        const response = await client.mutate({
            mutation: createTodoMutation, variables: {
                object: payload
            }
        });
        data = {
            status: true,
            message: 'Personal Todo Added Sucessfully'
        }
        // console.log('response+++++++11', data)
        toast.success(data.message);
        thunkAPI.dispatch(setTodoAddform(false))
        thunkAPI.dispatch(setTodoButtonLoading(false))

    } catch (e) {
        //console.log('error', e)
        data = {
            status: false,
            message: e.message
        }
        //console.log('response+++++++', data)
        toast.error(data.message);
        thunkAPI.dispatch(setTodoButtonLoading(false))
    }
    return data
})

export const getTodos = createAsyncThunk('todos/getTodos', async (payload,thunkAPI) => {
    thunkAPI.dispatch((setLoader(true)))
    // console.log("todos",payload)
    try {
        const response = await client.query({
            query: getTodosQuery, variables: {
                "date": new Date()
            }
        })
        thunkAPI.dispatch((setLoader(false)))
        return response.data.personaltodo
    } catch (e) {
        //console.log('error', e)
        thunkAPI.dispatch((setLoader(false)))
    }
})

export const updateTodo = createAsyncThunk('todos/updateTodo', async (payload, thunkAPI) => {
    let data = {}
    try {
        const response = await client.mutate({
            mutation: updateTodoMutation, variables: {
                object: payload
            }
        });
        data = {
            status: true,
            message: 'Todo Updated Sucessfully'
        }
        // console.log('response+++++++', response)
        toast.success(data.message, { autoClose: 1000 });
        thunkAPI.dispatch(setTodoUpdateForm(false))
        thunkAPI.dispatch(setTodoButtonLoading(false))
    } catch (e) {
        console.log('error', e)
        data = {
            status: true,
            message: e.message
        }
        //console.log('response+++++++', data)
        toast.error(data.message);
        thunkAPI.dispatch(setTodoButtonLoading(false))
    }
    return data
})

export const deleteTodo = createAsyncThunk('todos/delete', async (payload, thunkAPI) => {
    // console.log("delete payload", payload)
    let data = {}
    try {
        const response = await client.mutate({
            mutation: deleteTodoMutation, variables: {
                "id": `${payload}`
            }
        })
        data = {
            status: true,
            message: 'Todo Deleted Sucessfully'
        }
        // console.log('delete', response)
        // console.log('response+++++++', data)
        toast.success(data.message);
        thunkAPI.dispatch(setTodoDeleteform(false))
        thunkAPI.dispatch(setTodoButtonLoading(false))
    } catch (e) {
        //console.log('error', e)
        data = {
            status: true,
            message: 'Todo Deleted Sucessfully'
        }
        toast.error(data.message);
        thunkAPI.dispatch(setTodoButtonLoading(false))
    }
    return data
})


export const todoSlice = createSlice({
    name: 'todo',
    initialState: {
        todoList: [],
        todoResponse: {},
        showAddForm: false,
        showDeleteForm: false,
        showUpdateForm: false,
        buttonLoading: false,
        is_done: false,
        is_edit: false,
        loader:false
    },
    extraReducers: {
        [createTodo.fulfilled]: (state, action) => {
            state.todoResponse = action.payload;
            //console.log('2222222222222222222222222222222222222')
            return state;
        },
        [getTodos.fulfilled]: (state, action) => {
            //console.log("dsfsdfsdfsdfdsfds.......", state, action);
            state.todoList = action.payload;
            return state;
        },
        [updateTodo.fulfilled]: (state, action) => {
            state.todoResponse = action.payload;
            //console.log('2222222222222222222222222222222222222')
            return state;
        },
        [deleteTodo.fulfilled]: (state, action) => {
            state.todoResponse = action.payload;
            //console.log('2222222222222222222222222222222222222')
            return state;
        },
    },
    reducers: {
        setTodoAddform: (state, action) => {
            state.showAddForm = action.payload
            return state;
        },
        setTodoDeleteform: (state, action) => {
            state.showDeleteForm = action.payload
            return state;
        },
        setTodoUpdateForm: (state, action) => {
            state.showUpdateForm = action.payload
            return state;
        },
        setTodoButtonLoading: (state, action) => {
            state.buttonLoading = action.payload
            return state;
        },
        setStatus: (state, action) => {
            state.is_done = action.payload
            return state;
        },
        setLoader:(state,action)=>{
            state.loader= action.payload
            return state;
        }
    }
}
)

export const { setTodoAddform, setTodoDeleteform, setTodoUpdateForm, setTodoButtonLoading, setStatus,setLoader} = todoSlice.actions

export default todoSlice.reducer