import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gql } from '@apollo/client'
import { client, baseUrl } from '../../environment'
import { toast } from 'react-toastify';
import axios from 'axios';

const aliasUser = localStorage.getItem('alias-user')
const createDepartmentMutation = gql`mutation addDepartment($object:department_insert_input!){
    insert_department_one(object:$object){
        id
    }
}`;

const getDepartmentsQuery = gql`query getDepartments($name:String!){ department(where:{_and:[{name:{_iregex:$name}},{is_delete:{_eq:false}}]},order_by: {name: asc}){
    id
    name
    parent
    created_by
    updated_by 
    updated_on 
    updated_by 
    deleted_on 
    deleted_by
    is_delete
    is_primary
    }  
}`;

const updateDepartmentMutation = gql`mutation update_department($object:[department_insert_input!]!) {
    insert_department(objects: $object
    ,
          on_conflict: {
            constraint: department_pkey,
            update_columns: [name,parent,updated_by,updated_on,deleted_on,deleted_by,is_delete]
          }
      ){
          affected_rows
      }
}`;

const deleteDepartmentMutation = gql`mutation deleteDepartment($id: Int!) {
    delete_department(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }`;

// delete query --need to check department parent 
const deleteParentCheckMutation = gql`mutation deleteDepCheck($object:depDeleteCheck!) { 
    depDelCheck(arg1:$object) { 
        data response{ 
            message status 
        } 
    } 
}`




export const createDepartment = createAsyncThunk('department/create', async (payload, thunkAPI) => {
    //console.log("Create Department Payload ...................", payload)
    //console.log('11111111111')

    let data = {}
    try {
        const response = await client.mutate({
            mutation: createDepartmentMutation, variables: {
                object: payload
            }
        });
        data = {
            status: true,
            message: 'Department Added Sucessfully'
        }
        //console.log('response+++++++11',response, data)
        toast.success(data.message);
        thunkAPI.dispatch(setAddform(false))
        thunkAPI.dispatch(setButtonLoading(false))


    } catch (e) {
        //console.log('error', e)
        data = {
            status: false,
            message: e.message
        }
        //console.log('response+++++++', data)
        toast.error(data.message);
        thunkAPI.dispatch(setButtonLoading(false))
    }
    return data
})

export const getDepartments = createAsyncThunk('department/getDepartments', async (payload,thunkAPI) => {
    thunkAPI.dispatch(setLoader(true))
    try {
        const response = await client.query({
            query: getDepartmentsQuery, variables: {
                "name": `${payload}`
            }
        })
        //console.log('Departments list33333333333333333333333',response.data.department)
        thunkAPI.dispatch(setLoader(false))
        return response.data.department
    } catch (e) {
        //console.log('error', e)
        thunkAPI.dispatch(setLoader(false))
    }
})

export const updateDepartment = createAsyncThunk('department/updateDepartment', async (payload, thunkAPI) => {
    //console.log("Update Department Payload ...................", payload)
    const userid = thunkAPI.getState().auth.user_id
    let data = {}
    let temp = { ...payload, updated_by: userid, updated_on: new Date() }
    try {
        const response = await client.mutate({
            mutation: updateDepartmentMutation, variables: {
                object: temp
            }
        });
        data = {
            status: true,
            message: 'Department Updated Sucessfully'
        }
        //console.log('response+++++++', data)
        toast.success(data.message);
        thunkAPI.dispatch(setUpdateForm(false))
        thunkAPI.dispatch(setButtonLoading(false))

    } catch (e) {
        //console.log('error', e)
        data = {
            status: true,
            message: e.message
        }
        //console.log('response+++++++', data)
        toast.error(data.message);
        thunkAPI.dispatch(setButtonLoading(false))
    }
    return data
})

export const deleteDepartment = createAsyncThunk('department/delete', async (payload, thunkAPI) => {
    let data = {}
    //console.log("deleteDepartment...................", payload)
    const userid = thunkAPI.getState().auth.user_id
    let temp = { ...payload, is_delete: true, deleted_by: userid, deleted_on: new Date() }
    try {
        const response = await client.mutate({
            mutation: updateDepartmentMutation, variables: {
                object: temp
            }
        });
        data = {
            status: true,
            message: 'Department Deleted Sucessfully'
        }
        //console.log('response+++++++', data)
        toast.success(data.message);
        thunkAPI.dispatch(setUpdateForm(false))
        thunkAPI.dispatch(setButtonLoading(false))

    } catch (e) {
        //console.log('error', e)
        data = {
            status: true,
            message: e.message
        }
        toast.error(data.message);
        thunkAPI.dispatch(setButtonLoading(false))
    }
    return data
})

export const departmentsCsvUpload = createAsyncThunk('departments/bulkUpload', async (payload, thunkAPI, state) => {
    const orgId = thunkAPI.getState().auth.current_organization
    
    const token = localStorage.getItem('token');
    let body = {
        filename: payload.name,
        folder_type: 'csv',
    }

    try {
        const response = await axios.post(`${baseUrl}configuration/getFileUploadUrl/${orgId}`, body, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const awsResponse = await axios.put(response.data.data, payload, {
            headers: {
                'Content-Type': payload.type,
            },
        }).then(async (res) => {
            let uploadBody = {
                filename: payload.name,
                folderpath: response.data.folderpath,
            }
            let data = await axios.post(`${baseUrl}uploadCsv/department/${orgId}`, uploadBody, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return data
        })
        if(awsResponse.data.status){
            toast.success(awsResponse.data.message);
        }else{
            toast.error(awsResponse.data.message);
        }
        thunkAPI.dispatch(setButtonLoading(false))
        return awsResponse
    }
    catch (e) {
        console.log(e)
        toast.error(e.message);
        thunkAPI.dispatch(setButtonLoading(false))
    }

})

export const deleteParentDepartmentCheck = createAsyncThunk('department/parentDepcheck/delete', async (payload, thunkAPI) => {
    let data = {}
    try {
        const response = await client.mutate({
            mutation: deleteParentCheckMutation, variables: {
                object: {
                    "id":payload.id
                }
            }
        });
        data = {
            status: true,
            message: response.data.depDelCheck.data
        }
        if(Object.keys(response?.data?.depDelCheck?.data).length === 0){
            thunkAPI.dispatch(deleteDepartment(payload)).then((response)=>{
                // console.log("deleteresponse",response);
            })
        }
        else{
            toast.error(data.message);
            thunkAPI.dispatch(setUpdateForm(false))
            thunkAPI.dispatch(setButtonLoading(false))

        }
    } catch (e) {
        //console.log('error', e)
        data = {
            status: true,
            message: e.message
        }
        toast.error(data.message);
        thunkAPI.dispatch(setButtonLoading(false))
    }
    return data
})




export const departmentSlice = createSlice({
    name: 'department',
    initialState: {
        departmentsList: [],
        updatedepartmentResponse: {},
        createDepRes: {},
        showAddForm: false,
        showUpdateForm: false,
        buttonLoading: false,
        deletedepParentResponse :{},
        loader:false
    },
    extraReducers: {
        [createDepartment.fulfilled]: (state, action) => {
            state.createDepRes = action.payload;
            //console.log('2222222222222222222222222222222222222',state, action.payload)
            return state;
        },
        [getDepartments.fulfilled]: (state, action) => {
            // //console.log("dsfsdfsdfsdfdsfds.......", state, action);
            state.departmentsList = action.payload;
            return state;
        },
        [updateDepartment.fulfilled]: (state, action) => {
            //console.log('11111111111111')
            state.updatedepartmentResponse = action.payload;
            //console.log('update department return ', action.payload, state.departmentResponse)
            //console.log('2222222222')
            return state;
        },
        [deleteDepartment.fulfilled]: (state, action) => {
            state.updatedepartmentResponse = action.payload;
            //console.log('2222222222222222222222222222222222222')
            return state;
        },
        [deleteParentDepartmentCheck.fulfilled]: (state, action) => {
            state.deletedepParentResponse = action.payload;
            return state;
        },
    },
    reducers: {
        setAddform: (state, action) => {
            state.showAddForm = action.payload
            return state;
        },
        setUpdateForm: (state, action) => {
            state.showUpdateForm = action.payload
            return state;
        },
        setButtonLoading: (state, action) => {
            state.buttonLoading = action.payload
            return state;
        },
        setLoader: (state, action) => {
            state.loader = action.payload
            return state;
        }
    }
}
)

export const { setAddform, setUpdateForm, setButtonLoading,setLoader} = departmentSlice.actions

export default departmentSlice.reducer