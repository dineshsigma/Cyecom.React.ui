import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gql } from '@apollo/client'
import { client, baseUrl } from '../../environment'
import { toast } from 'react-toastify';
import axios from 'axios';


const aliasUser = localStorage.getItem('alias-user')

const createLocationMutation = gql`mutation addLocation($object:locations_insert_input!){
    insert_locations_one(object:$object){
        id
    }
}`;

const getLocationsQuery = gql`mutation getAccesBaseLocations($object:getAccesBasedLocationData!) {
    getAccesBaseLocations(arg1:$object) {
       data
      response{
        message
        status
      }
      }
  }`


const getLocationsTreeQuery = gql`query getLocations{ locations (where:{_and:{is_delete:{_eq:false}}},order_by: {created_at: asc} ){
    parent
    org_id
    name
    level
    is_primary
    id
    created_at
    color
    is_delete
    created_by
    updated_by 
    updated_on 
    updated_by 
    deleted_on 
    deleted_by
    }  
}`;



const updateLocationMutation = gql`mutation update_location($object:[locations_insert_input!]!) {
    insert_locations(objects: $object
    ,
          on_conflict: {
            constraint: locations_pkey,
            update_columns: [name,parent,updated_by,updated_on,deleted_on,deleted_by,is_delete]
          }
      ){
          affected_rows
      }
    }`;
const deleteLocationMutation = gql`mutation delete_location($id: Int!) {
    delete_locations(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }`;


const locationCSVDownload = gql`mutation locationDownload($object:locationCsvDownload!) {
    locationCsv(arg1:$object) {
      status
      message
    }
  }`

const deletelocationParentMutation = gql`mutation deletelocCheck($object:locDeleteCheck!) { 
    locDelCheck(arg1:$object) { 
        data response{ 
            message status 
        } 
    } 
}`

export const createLocation = createAsyncThunk('locations/create', async (payload, thunkAPI) => {
    //console.log("Create Location Payload ...................", payload)
    let data = {}
    if (aliasUser) {
        payload.alias_user = parseInt(aliasUser)
    }
    try {
        const response = await client.mutate({
            mutation: createLocationMutation, variables: {
                object: payload
            }
        });
        data = {
            status: true,
            message: 'Location Added Sucessfully'
        }
        //console.log('response+++++++11', data)
        toast.success(data.message);
        thunkAPI.dispatch(setLocationAddform(false))
        thunkAPI.dispatch(setLocationButtonLoading(false))

    } catch (e) {
        //console.log('error', e)
        data = {
            status: false,
            message: e.message
        }
        //console.log('response+++++++', data)
        toast.error(data.message);
        thunkAPI.dispatch(setLocationButtonLoading(false))
    }
    return data
})

export const getLocations = createAsyncThunk('locations/getLocations', async (payload,thunkAPI) => {
    thunkAPI.dispatch(setLoader(true))
    try {
        const response = await client.mutate({
            mutation: getLocationsQuery, variables:{
            object:{
                "name": `${payload}`,
                limit: 300,
                offset: 0
            }
            }       
        })
        thunkAPI.dispatch(setLoader(false))
        return response.data.getAccesBaseLocations.data
    } catch (e) {
        console.log('error', e)
        thunkAPI.dispatch(setLoader(false))
    }
})

export const getLocationsPageData = createAsyncThunk('locations/getLocationsPageData', async (payload,thunkAPI) => {
    thunkAPI.dispatch(setLoader(true))
    try {
        const response = await client.mutate({
            mutation: getLocationsQuery,
            variables:{object:payload}       
        })
        //console.log('getLocations', response.data.location)
        thunkAPI.dispatch(setLoader(false))
        console.log("locations",response)
        return response.data.getAccesBaseLocations.data
    } catch (e) {
        console.log('error', e)
        thunkAPI.dispatch(setLoader(false))
    }
})

export const updateLocation = createAsyncThunk('locations/updateLocation', async (payload, thunkAPI) => {
    const userid = thunkAPI.getState().auth.user_id
    var temp = payload
    temp.updated_by = userid
    temp.updated_on = new Date()
    if (aliasUser) {
        temp.alias_user = parseInt(aliasUser)
    }
    let data = {}
    try {
        const response = await client.mutate({
            mutation: updateLocationMutation, variables: {
                object: temp
            }
        });
        data = {
            status: true,
            message: 'Location Updated Sucessfully'
        }
        //console.log('response+++++++', data)
        toast.success(data.message);
        thunkAPI.dispatch(setLocationUpdateForm(false))
        thunkAPI.dispatch(setLocationButtonLoading(false))
    } catch (e) {
        //console.log('error', e)
        data = {
            status: true,
            message: e.message
        }
        //console.log('response+++++++', data)
        toast.error(data.message);
        thunkAPI.dispatch(setLocationButtonLoading(false))
    }
    return data
})

export const deleteLocation = createAsyncThunk('locations/delete', async (payload, thunkAPI) => {
    // console.log("deleteLocation...................", payload)
    const userid = thunkAPI.getState().auth.user_id
    // console.log("deleteLocation...................", userid)
    let temp = payload
    let deleteObj = { ...temp, is_delete: true, deleted_by: userid, deleted_on: new Date() }
    if (aliasUser) {
        deleteObj.alias_user = parseInt(aliasUser)
    }

    let data = {}
    try {
        const response = await client.mutate({
            mutation: updateLocationMutation, variables: {
                object: deleteObj
            }
        });
        data = {
            status: true,
            message: 'Location Deleted Sucessfully'
        }
        //console.log('response+++++++', data)
        toast.success(data.message);
        thunkAPI.dispatch(setLocationButtonLoading(false))
    } catch (e) {
        //console.log('error', e)
        data = {
            status: true,
            message: 'Location Deleted Sucessfully'
        }
        toast.error(data.message);
        thunkAPI.dispatch(setLocationButtonLoading(false))
    }
    return data
})

export const locationsCsvUpload = createAsyncThunk('locations/bulkUpload', async (payload, thunkAPI, state) => {
    const orgId = thunkAPI.getState().auth.current_organization
    console.log(payload)
    console.log(orgId)
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
            let data = await axios.post(`${baseUrl}uploadCsv/location/${orgId}`, uploadBody, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return data
        })
        // console.log('response', awsResponse)
        if (awsResponse.data.status) {
          toast.success(awsResponse.data.message);
        } else {
          toast.error(awsResponse.data.message);
        }
        thunkAPI.dispatch(setLocationButtonLoading(false));
        return awsResponse
    }
    catch (e) {
        console.log(e)
        toast.error(e.message);
        thunkAPI.dispatch(setLocationButtonLoading(false))
        return e
    }
})

export const downloadCSVLocation = createAsyncThunk('locations/delete', async (payload, thunkAPI) => {
    try {
        const response = await client.query({
            query: locationCSVDownload, variables: {
                object: {
                    "org_id": 93
                }
            }
        })
        console.log('getLocations', response)
        return response
    } catch (e) {
        //console.log('error', e)
    }
})

export const getLocationTreeData = createAsyncThunk('locations/getLocationTree', async (payload) => {
    try {
        const response = await client.query({
            query: getLocationsTreeQuery
        })
        //console.log('getLocations', response.data.location)
        let locations = []
        response?.data?.locations.map((item) => {
            item.parentId = item.parent ? item.parent.toString() : ''
            delete item.parent

            locations.push(item)
        })
        return locations
    } catch (e) {
        //console.log('error', e)
    }
})


export const deleteParentLocationCheck = createAsyncThunk('locations/deleteParentCheck', async (payload, thunkAPI) => {
    let data = {}
    try {
        const response = await client.mutate({
            mutation: deletelocationParentMutation, variables: {
                object: {
                    "id":payload.id
                }
            }
        });
        data = {
            status: true,
            message: response.data.locDelCheck.data
        }
        if(Object.keys(response?.data?.locDelCheck?.data).length === 0){
            thunkAPI.dispatch(deleteLocation(payload))
            //thunkAPI.dispatch(setLocationButtonLoading(false))
        }
        else{
            toast.error(data.message);
            thunkAPI.dispatch(setLocationButtonLoading(false))

        }

       
        // toast.success(data.message);
        // thunkAPI.dispatch(setLocationButtonLoading(false))
    } catch (e) {
        
        data = {
            status: true,
            message: 'Location Deleted Sucessfully'
        }
        toast.error(data.message);
        thunkAPI.dispatch(setLocationButtonLoading(false))
    }
    return data
})


export const locationSlice = createSlice({
    name: 'location',
    initialState: {
        locationsList: [],
        locationResponse: {},
        showAddForm: false,
        showUpdateForm: false,
        buttonLoading: false,
        locationTreeData: undefined,
        selectedLocation: undefined,
        deleteParentCheckResponse :{},
        loader:false
    },
    extraReducers: {
        [createLocation.fulfilled]: (state, action) => {
            state.locationResponse = action.payload;
            return state;
        },
        [getLocations.fulfilled]: (state, action) => {
            state.locationsList = action.payload;
            return state;
        },
        [getLocationTreeData.fulfilled]: (state, action) => {
            state.locationTreeData = action.payload;
            return state;
        },
        [updateLocation.fulfilled]: (state, action) => {
            state.locationResponse = action.payload;
            return state;
        },
        [deleteLocation.fulfilled]: (state, action) => {
            state.locationResponse = action.payload;
            //console.log('2222222222222222222222222222222222222')
            return state;
        },
        [deleteParentLocationCheck.fulfilled]: (state, action) => {
            state.deleteParentCheckResponse = action.payload;
            
            return state;
        },
    },
    reducers: {
        setLocationAddform: (state, action) => {
            state.showAddForm = action.payload
            return state;
        },
        setLocationUpdateForm: (state, action) => {
            state.showUpdateForm = action.payload
            return state;
        },
        setLocationButtonLoading: (state, action) => {
            state.buttonLoading = action.payload
            return state;
        },
        setSelectedLocationDetails: (state, action) => {
            state.selectedLocation = action.payload
            return state;
        },
        setLoader:(state,action)=>{
            state.loader=action.payload
            return state
        }
    }
}
)

export const { setLocationAddform, setLocationUpdateForm, setLocationButtonLoading, setSelectedLocationDetails,setLoader} = locationSlice.actions

export default locationSlice.reducer