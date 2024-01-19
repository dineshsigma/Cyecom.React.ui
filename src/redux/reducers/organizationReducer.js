import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gql } from '@apollo/client'
import { client, baseUrl } from '../../environment'
import { toast } from 'react-toastify';
import axios from 'axios';

const createOrganizationMutation = gql`mutation add_organization($object:AddMoreOrganizationsInput!) {
    addOrganization(arg1:$object)
    {
      message
      status
    }
}`;

// const getOrganizationsQuery = gql`query getLocations($name:String!){ location (where:{name:{_iregex:$name}}){
//     parent
//     org_id
//     name
//     level
//     is_primary
//     id
//     color
//     }  
// }`;

const updateOrganizationMutation = gql`mutation updateOrganization($object:[organization_insert_input!]!) {
    insert_organization(objects: $object
    ,
          on_conflict: {
            constraint: organization_pkey,
            update_columns: [address,domain_name, district,state,contact_no,business_type,is_active,segment_type, pincode]                          
          
          }
      ){
          affected_rows
      }
    }`;

const deleteOrganizationMutation = gql`mutation delete_location($id: Int!) {
    delete_location(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }`;

const getOrganizationsByIds = gql`query exceptOrganization($name:String!,$array:[Int!]!) {
        organization(where:{id: {_in: $array},name:{_iregex:$name}},order_by: {name: asc}) {
        name
        email
        address
        district
        domain_name
        state
        time_zone
        segment_type
        pincode
        logo
        language
        is_active
        is_delete
        contact_no
        business_type
        billing_status
        id
        uni_code
    }
    }`

const sendOtpQuery = gql`mutation epotps($object:emailAndPhoneOtps!) {   
    epOtps(arg1:$object)
   { 
   
  message
     status
     }
}`

const existUsercheck = gql`mutation orgUserDuplicateCheck($object:orgUserDuplicateCheck!) {
    orgUserDuplicateCheck(arg1:$object) {
      data
      response{
        message
        status
      }
    }
  }`

const configartion = gql`query getConfiguration {
    configuration {
      id
      busssiness_type
      segment_type
    }
  }`  

export const createOrganization = createAsyncThunk('organizations/create', async (payload, thunkAPI) => {
    let data = {}
    try {
        const response = await client.mutate({
            mutation: createOrganizationMutation, variables: {
                object: payload
            }
        });
        if (response.data.addOrganization.status) {
            toast.success(response.data.addOrganization.message);
            thunkAPI.dispatch(setOrganizationAddform(false))
            thunkAPI.dispatch(setOrganizationButtonLoading(false))
        } else {
            toast.error(response.data.addOrganization.message);
        }
        return response.data.addOrganization

    } catch (e) {
    
        data = {
            status: false,
            message: e.message
        }
        toast.error(data.message);
        thunkAPI.dispatch(setOrganizationButtonLoading(false))
    }
    return data
})

export const getOrganizations = createAsyncThunk('organizations/getOrganizations', async (payload,thunkAPI) => { 
    thunkAPI.dispatch(setLoader(true))
    const {data,name}=payload //destructring payload 
    try {
        const response = await client.query({
            query: getOrganizationsByIds, variables: {
                "array": data,
                "name":name
            }
        })
        thunkAPI.dispatch(setLoader(false))
        return response.data.organization
    } catch (e) {
        thunkAPI.dispatch(setLoader(false))
    }
})



export const getCheckExistUser = createAsyncThunk('organizations/checkexistUser', async (payload) => {
    let data={}
    try {
        const response = await client.mutate({
            mutation: existUsercheck, variables: {
            object: payload
            }
        })
        // data={
        //     message:response.data.orgUserDuplicateCheck
        // }
        return response.data.orgUserDuplicateCheck
       
    } catch (e) {
      
    }
 
})

export const update_Organization = createAsyncThunk('organizations/updateOrganization', async (payload, thunkAPI) => {
    let data = {}
    try {
        const response = await client.mutate({
            mutation: updateOrganizationMutation, variables: {
                object: payload
            }
        });
        data = {
            status: true,
            message: 'Organization Updated Sucessfully'
        }
        toast.success(data.message);
        thunkAPI.dispatch(setOrganizationUpdateForm(false))
        thunkAPI.dispatch(setOrganizationButtonLoading(false))
    } catch (e) {
      
        data = {
            status: true,
            message: e.message
        }
        toast.error(data.message);
        thunkAPI.dispatch(setOrganizationButtonLoading(false))
    }
    return data
})

export const activateDeactivate =  createAsyncThunk('activateDeactivate/updateOrganization', async (payload, thunkAPI) => {
    let data = {}
    let temp = { ...payload, is_active: !payload.is_active }
    try {
        const response = await client.mutate({
            mutation: updateOrganizationMutation, variables: {
                object: temp
            }
        });
        data = {
            status: true,
            message: 'Organization Updated Sucessfully'
        }
        toast.success(data.message);
        thunkAPI.dispatch(setOrganizationUpdateForm(false))
        thunkAPI.dispatch(setOrganizationButtonLoading(false))
    } catch (e) {
        data = {
            status: true,
            message: e.message
        }
        toast.error(data.message);
        thunkAPI.dispatch(setOrganizationButtonLoading(false))
    }
    return data

})

export const deleteOrganization = createAsyncThunk('organizations/delete', async (payload, thunkAPI) => {
    let data = {}
    try {
        const response = await client.mutate({
            mutation: deleteOrganizationMutation, variables: {
                "id": `${payload}`
            }
        })
        data = {
            status: true,
            message: 'Organization Deleted Sucessfully'
        }
        toast.success(data.message);
        thunkAPI.dispatch(setOrganizationButtonLoading(false))
    } catch (e) {
        data = {
            status: true,
            message: 'Organization Deleted Sucessfully'
        }
        toast.error(data.message);
        thunkAPI.dispatch(setOrganizationButtonLoading(false))
    }
    return data
})

export const sendCreateOrgOtp = createAsyncThunk('organizations/sendotp', async (payload) => {
    try {
        const response = await client.mutate({
            mutation: sendOtpQuery, variables: {
                object: payload
            }
        })
        return response.data.epOtps
    } catch (e) {
        //toast.error('Something went wrong');
        let data = {
            status: false,
            message : 'Something went wrong'
        }
        return data
    }
})


export const getConfigurationQuery = createAsyncThunk('organizations/getConfigartion', async (payload,thunkAPI) => {
    try {
        const response = await client.query({
            query: configartion
        })
        return response.data.configuration
    } catch (e) {
    }
})

export const organizationSlice = createSlice({
    name: 'organization',
    initialState: {
        organizationsList: [],
        organizationResponse: {},
        showAddForm: false,
        showUpdateForm: false,
        buttonLoading: false,
        plan_details: {},
        createOrgObj: undefined,
        createUserObj: {},
        checkExistUser:{},
        loader:false,
        configation:[]
    },
    extraReducers: {
        [createOrganization.fulfilled]: (state, action) => {
            state.organizationResponse = action.payload;
            return state;
        },
        [getOrganizations.fulfilled]: (state, action) => {
            state.organizationsList = action.payload;
            return state;
        },
        [update_Organization.fulfilled]: (state, action) => {
            state.organizationResponse = action.payload;
            return state;
        },
        [deleteOrganization.fulfilled]: (state, action) => {
            state.organizationResponse = action.payload;
            return state;
        },
        [deleteOrganization.fulfilled]: (state, action) => {
            state.organizationResponse = action.payload;
            return state;
        },
        [getCheckExistUser.fulfilled]:(state,action)=>{
            state.checkExistUser=action.payload
            return state
        },
        [getConfigurationQuery.fulfilled]:(state,action)=>{
            state.configation=action.payload
            return state
        }

    },
    reducers: {
        setcheckExistUser:(state,action)=>{
            state.checkExistUser=action.payload
            return state
        },
        setOrganizationAddform: (state, action) => {
            state.showAddForm = action.payload
            return state;
        },
        setOrganizationUpdateForm: (state, action) => {
            state.showUpdateForm = action.payload
            return state;
        },
        setOrganizationButtonLoading: (state, action) => {
            state.buttonLoading = action.payload
            return state;
        },
        setPlanDetails: (state, action) => {
            console.log(action.payload)
            state.plan_details = action.payload
        },
        setUserObj: (state, action) => {
            console.log(action.payload)
            state.createUserObj = action.payload
        },
        setOrgCreateObj: (state, action) => {
            console.log(action.payload)
            state.createOrgObj = action.payload
        },
        setLoader: (state, action) => {
            state.loader = action.payload
            return state
        }
    }
}
)

export const { setOrganizationAddform, setOrganizationUpdateForm, setOrganizationButtonLoading, setPlanDetails, setUserObj, setOrgCreateObj,setcheckExistUser,setLoader} = organizationSlice.actions

export default organizationSlice.reducer