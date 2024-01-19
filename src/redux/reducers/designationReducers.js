import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gql } from '@apollo/client'
import { client, baseUrl } from '../../environment'
import { toast } from 'react-toastify';
import axios from 'axios';


const createDesignationMutation = gql`mutation addDesignation($object:designation_insert_input!){
    insert_designation_one(object:$object){
        id
    }
}`;



const getDesignationsQuery = gql`query getDesignations($name:String!){ designation(where:{_and:[{name:{_iregex:$name}},{is_delete:{_eq:false}}]},order_by: {name: asc} ){
    id
    org_id
    name
    level
    id
    created_at
    color
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

const updateDesignationMutation = gql`mutation updateDesignation($object:[designation_insert_input!]!) {
    insert_designation(objects: $object
    ,
          on_conflict: {
            constraint: designation_pkey,
            update_columns: [name,level,updated_by,updated_on,deleted_on,deleted_by,is_delete]
          }
      ){
          affected_rows
      }
}`;




const deleteDesignationMutation = gql`mutation deleteDesignation($id: Int!) {
    delete_designation(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }`;

const deleteDesiginationParentCheck = gql`mutation deleteDesigCheck($object:desigDeleteCheck!) { 
    desigDelCheck(arg1:$object) { 
        data response{ 
            message status 
        } 
    } 
}`


export const createDesignation = createAsyncThunk('designation/create', async (payload, thunkAPI) => {
    //console.log("Create Department Payload ...................", payload)
    //console.log('11111111111')

    let data = {}
    try {
        const response = await client.mutate({
            mutation: createDesignationMutation, variables: {
                object: payload
            }
        });
        data = {
            status: true,
            message: 'Designation Added Sucessfully'
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

export const getDesignations = createAsyncThunk('designation/getDesignations', async (payload,thunkAPI) => {
    thunkAPI.dispatch(setLoader(true))
    //console.log("getDepartments...................", payload)
    try {
        const response = await client.query({
            query: getDesignationsQuery, variables: {
                "name": `${payload}`
            }
        })
        //console.log('skjgshfgdsfhgdsfhdsfgdsf', response.data)
        thunkAPI.dispatch(setLoader(false))
        return response.data.designation
    } catch (e) {
        //console.log('error', e)
        thunkAPI.dispatch(setLoader(false))
    }
})

export const updateDesignation = createAsyncThunk('department/updateDepartment', async (payload, thunkAPI) => {
    //console.log("Update Designatiom Payload ...................", payload.name)
    const userid = thunkAPI.getState().auth.user_id
    let data = {}
    let temp = { ...payload, updated_by: userid, updated_on: new Date() }
    try {
        const response = await client.mutate({
            mutation: updateDesignationMutation, variables: {
                object: temp
            }
        });
        data = {
            status: true,
            message: 'Designation Updated Sucessfully'
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

export const deleteDesignation = createAsyncThunk('designation/delete', async (payload, thunkAPI) => {
    let data = {}
    //console.log("deleteDesignation...................", payload)
    const userid = thunkAPI.getState().auth.user_id
    let temp = { ...payload, is_delete: true, deleted_by: userid, deleted_on: new Date() }
    try {
        const response = await client.mutate({
            mutation: updateDesignationMutation, variables: {
                object: temp
            }
        });
        data = {
            status: true,
            message: 'Designation Deleted Sucessfully'
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

export const designationsCsvUpload = createAsyncThunk('designations/bulkUpload', async (payload, thunkAPI, state) => {
    const orgId = thunkAPI.getState().auth.current_organization
    // console.log(payload)
    // console.log(orgId)
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
            let data = await axios.post(`${baseUrl}uploadCsv/designation/${orgId}`, uploadBody, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return data
        })
        // console.log('response', awsResponse)
        thunkAPI.dispatch(setButtonLoading(false))
        if (awsResponse.data.status) {
          toast.success(awsResponse.data.message);
        } else {
          toast.error(awsResponse.data.message);
        }
        return awsResponse
    }
    catch (e) {
        console.log(e)
        toast.error(e.message);
        thunkAPI.dispatch(setButtonLoading(false))
    }

})

export const deleteParentDesignationCheck = createAsyncThunk('designation/deleteparentCheck', async (payload, thunkAPI) => {
    let data = {}
    try {
        const response = await client.mutate({
            mutation: deleteDesiginationParentCheck, variables: {
                object: {
                    "id":payload.id
                }
            }
        });
        data = {
            status: true,
            message: response.data.desigDelCheck.data
        }
        if(Object.keys(response?.data?.desigDelCheck?.data).length === 0){
            thunkAPI.dispatch(deleteDesignation(payload))

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


export const designationSlice = createSlice({
    name: 'designation',
    initialState: {
        designationList: [],
        updateOrganizationResponse: {},
        createOrgRes: {},
        showAddForm: false,
        showUpdateForm: false,
        buttonLoading: false,
        loader:false

    },
    extraReducers: {
        [createDesignation.fulfilled]: (state, action) => {
            state.createOrgRes = action.payload;
            //console.log('2222222222222222222222222222222222222',state, action.payload)
            return state;
        },
        [getDesignations.fulfilled]: (state, action) => {
            //console.log("dsfsdfsdfsdfdsfds.......", state, action);
            state.designationList = action.payload;
            return state;
        },
        [updateDesignation.fulfilled]: (state, action) => {
            //console.log('11111111111111')
            state.updateOrganizationResponse = action.payload;
            //console.log('update department return ', action.payload, state.updateOrganizationResponse)
            //console.log('2222222222')
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
        setLoader:(state,action)=>{
            state.loader = action.payload
            return state;
        }
    }
}
)

export const { setAddform, setUpdateForm, setButtonLoading,setLoader } = designationSlice.actions

export default designationSlice.reducer