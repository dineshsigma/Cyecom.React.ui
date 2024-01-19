import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gql } from '@apollo/client'
import { client } from '../../environment'
import { toast } from 'react-toastify';
import axios from 'axios';

const createRoleMutation = gql`mutation insert_role($object: roles_insert_input!) {
    insert_roles_one(object: $object) {
        id
        }
  }`;

const createPermission = gql`mutation insert_permission($object: [permissions_insert_input!]!) {
    insert_permissions(objects: $object) {
         affected_rows
        }
  }`

const taskPermissionMutation=gql`mutation insertTaskPermissions($object:task_permissions_insert_input!) {   
    insert_task_permissions_one(object:$object){ 
     id
   }
}`

const getAllRolesQuery = gql`query getRoles($name: String!,$org_id:Int!) {
    roles(where:{_or:[{org_id: {_eq: $org_id}},{org_id: {_eq: 0}}],_and:{name: {_iregex: $name},is_delete:{_eq:false}}}) {
      id
      org_id
      name
      created_at
      description
  is_delete
  is_editable
    }
  
  }`;


const getPermissonsByIdQuery = gql`query getpermissions($role_id:Int!) {
    permissions(where:{role_id:{_eq:$role_id}}) {
      create
      view
      update
      delete
      id
      org_id
      table
      role_id
      role_access
      updated_by
      updated_on
      roleByRoleId{
        name
        is_editable
        description
        created_at
        org_id
        id
      }
    }
  
  }`

const getTaskPermission = gql`query getpermissions($role_id:Int!) {
    task_permissions(where:{role_id:{_eq:$role_id}}) {
      id
      org_id
      role_id
      delete
      update_access
     department_access
     location_access
     assignee_access
      roleByRoleId{
        name
        is_editable
        description
        created_at
        org_id
        id
      }
    }
  
  }`

const updatePermissonsQuery = gql`mutation update_permission($object: [permissions_insert_input!]!) {
    insert_permissions(objects:$object,
        on_conflict: {
          constraint: permissions_pkey,
          update_columns: [create,delete,update,view,role_access,updated_by,updated_on]
        }
    ) {
      affected_rows
    }
  }`

const updateTaskPermissionMutation=gql`mutation update_taskPermission($object: [task_permissions_insert_input!]!) {
    insert_task_permissions(objects:$object,
        on_conflict: {
          constraint: task_permissions_pkey,
          update_columns: [assignee_access,department_access,location_access,delete,update_access]
        }
    ) {
      affected_rows
    }
  }`

const updateRoleMutation = gql`mutation update_roles($object: [roles_insert_input!]!) {
    insert_roles(objects:$object,
        on_conflict: {
          constraint: roles_pkey,
          update_columns: [name,description]
        }
    ) {
      affected_rows
    }
  }`;
const getAccessDropDown=gql`query getRoleAccess{
    getRoleAccess{
      message
      status
    }}`

const deleteRoleMutation = gql`mutation update_roles($object: [roles_insert_input!]!) {
    insert_roles(objects:$object,
        on_conflict: {
          constraint: roles_pkey,
          update_columns: [is_delete]
        }
    ) {
      affected_rows
    }
  }`;

const roleDeleteCheckMutation = gql`mutation deleteRoleCheck($object:roleDeleteCheck!) {
    roleDelCheck(arg1:$object) {
      data
      response{
        message
        status
      }
    }
  }`  

export const createRoles = createAsyncThunk('roles/create', async (payloadData, thunkAPI) => {
    thunkAPI.dispatch(setRoleButtonLoading(true))
    let {permissionData,payload}=payloadData
    const orgID = thunkAPI.getState().auth.current_organization
    let data = {}
    try {
        const roleResponse = await client.mutate({
            mutation: createRoleMutation, variables: {
                object: payload.role
            }
        });
        let permissionResponse
        if (roleResponse.data.insert_roles_one) {
            let permissionsTemp = []
            payload.permissions.map((item) => {
                let temp = item
                temp.role_id = roleResponse.data.insert_roles_one.id
                temp.org_id = orgID
                permissionsTemp.push(temp)
            })
            permissionResponse = await client.mutate({
                mutation: createPermission, variables: {
                    object: permissionsTemp
                }
            });

            
        }
        if(permissionResponse.data){
            let permisionpayload={
              department_access:permissionData.department_access,
              location_access: permissionData.location_access,
              assignee_access: permissionData.assignee_access,
              delete:permissionData.delete,
              update_access:permissionData.update_access,
              role_id: roleResponse.data.insert_roles_one.id,
              org_id: orgID
            }
            let taskPermissionResponse = await client.mutate({
                mutation: taskPermissionMutation, variables: {
                    object: permisionpayload
                }
            });        
        }
        if (permissionResponse.data && roleResponse.data) {
            data = {
                status: true,
                message: 'Role Added Sucessfully'
            }
            toast.success(data.message);
            thunkAPI.dispatch(setRoleAddform(false))
            thunkAPI.dispatch(setRoleButtonLoading(false))
        }else{
            data = {
                status: false,
                message: 'Something Went Worng'
            }
            toast.error(data.message);
            thunkAPI.dispatch(setRoleButtonLoading(false))
        }
        return data

    } catch (e) {
        //console.log('error', e)
        data = {
            status: false,
            message: e.message
        }
        //console.log('response+++++++', data)
        toast.error(data.message);
        thunkAPI.dispatch(setRoleButtonLoading(false))
    }
    return data
})

export const updateRolePermissions = createAsyncThunk('roles/updateRolePermissions', async (payload, thunkAPI) => {
    //console.log("Update Location Payload ...................", payload)
    let data = {}
    try {
        const roleUpdateResponse = await client.mutate({
            mutation: updateRoleMutation, variables: {
                object: payload.role
            }
        });
        const permissionUpdateResponse = await client.mutate({
            mutation: updatePermissonsQuery, variables: {
                object: payload.permissions
            }
        });
        const taskPermissionUpdate=await client.mutate({
            mutation: updateTaskPermissionMutation, variables: {
                object: payload.taskPermission
            }
        });

        if (roleUpdateResponse.data && permissionUpdateResponse.data) {
            data = {
                status: true,
                message: 'Role Updated Sucessfully'
            }
            toast.success(data.message);
            thunkAPI.dispatch(setRoleAddform(false))
            thunkAPI.dispatch(setRoleButtonLoading(false))
        }else{
            data = {
                status: false,
                message: 'Something Went Worng'
            }
            toast.error(data.message);
            thunkAPI.dispatch(setRoleButtonLoading(false))
        }
        return data
    } catch (e) {
        //console.log('error', e)
        data = {
            status: true,
            message: e.message
        }
        //console.log('response+++++++', data)
        toast.error(data.message);
    }
    return data
})

export const getRoles = createAsyncThunk('roles/getRoles', async (payload, thunkAPI) => {
    // thunkAPI.dispatch(setLoader(true))
    //console.log("getRoles...................", payload)
    const orgID = thunkAPI.getState().auth.current_organization
    try {
        const response = await client.query({
            query: getAllRolesQuery, variables: {
                "name": `${payload}`,
                "org_id": parseInt(orgID)
            }
        })
        //console.log('getRoles', response.data.roles)
        thunkAPI.dispatch(setLoader(false))
        return response?.data?.roles
    } catch (e) {
        console.log('error', e)
        thunkAPI.dispatch(setLoader(false))
    }
})
export const getTaskPermisionByRole = createAsyncThunk('roles/getTaskPermissionsByRole', async (payload, thunkAPI) => {
    // console.log("getRoles...................", payload)
    try {
        const response = await client.query({
            query: getTaskPermission, variables: {
                "role_id": payload
            }

        })
        return response
    } catch (e) {
        console.log('error', e)
    }
})

export const getPermissionsByRole = createAsyncThunk('roles/getPermissionsByRole', async (payload, thunkAPI) => {
    // console.log("getRoles...................", payload)
    try {
        const response = await client.query({
            query: getPermissonsByIdQuery, variables: {
                "role_id": parseInt(payload)
            }
        })
        return response?.data?.permissions
    } catch (e) {
        console.log('error', e)
    }
})

export const getMasterPermissionsByRole = createAsyncThunk('roles/getMasterPermissionsByRole', async (payload, thunkAPI) => {
    try {
        const response = await client.query({
            query: getPermissonsByIdQuery, variables: {
                "role_id": parseInt(payload)
            }

        })

        return response?.data?.permissions
    } catch (e) {
        console.log('error', e)
    }
})

export const updateRole = createAsyncThunk('roles/updateRole', async (payload, thunkAPI) => {
    //console.log("Update Location Payload ...................", payload)
    let data = {}
    try {
        const response = await client.mutate({
            mutation: updateRoleMutation, variables: {
                object: payload
            }
        });
        data = {
            status: true,
            message: 'Role Updated Sucessfully'
        }
        //console.log('response+++++++', data)
        toast.success(data.message);
        thunkAPI.dispatch(setRoleUpdateForm(false))
        thunkAPI.dispatch(setRoleButtonLoading(false))
    } catch (e) {
        console.log('error', e)
        data = {
            status: true,
            message: e.message
        }
        //console.log('response+++++++', data)
        toast.error(data.message);
        thunkAPI.dispatch(setRoleButtonLoading(false))
    }
    return data
})

export const getRoleAccessDropDown=createAsyncThunk('roles/acceesDropDown',async(payload)=>{
    try{
        const response=await client.query({
            query:getAccessDropDown
        })
        return response.data.getRoleAccess.message

    }
    catch(e){
        console.log("Error",e.message)

    }
})

export const deleteRole = createAsyncThunk('roles/delete', async (payload, thunkAPI) => {
    let data = {}
   
    try {
        const response = await client.mutate({
            mutation: deleteRoleMutation, variables: {
                "object": {
                    "created_at":payload.created_at,
                    "description":payload.description,
                    "is_delete":true,
                    "id":payload.id,
                    "name":payload.name,
                    "org_id":payload.org_id,
                    "is_editable":payload.is_editable

                }
            }
        })
        data = {
            status: true,
            message: 'Role Deleted Sucessfully'
        }
        
        toast.success(data.message);
        thunkAPI.dispatch(setRoleButtonLoading(false))
    } catch (e) {
         console.log('error', e.message)
        data = {
            status: true,
            message: 'Role Not Deleted'
        }
        toast.error(data.message);
        thunkAPI.dispatch(setRoleButtonLoading(false))
    }
    return data
})

export const roledeleteCheck = createAsyncThunk('roles/deletecheck', async (payload, thunkAPI) => {
    let data = {}
    try {
        const response = await client.mutate({
            mutation: roleDeleteCheckMutation, variables: {
                    "object": {
                      "id":payload.id
                    }
                  }
        })
        data = {
            status: true,
            message: response.data.roleDelCheck.data
        }
        if(Object.keys(response?.data?.roleDelCheck?.data).length === 0){
            thunkAPI.dispatch(deleteRole(payload))
        }
        else{
            toast.error(data.message);
            thunkAPI.dispatch(setRoleButtonLoading(false))
            
        }
    } catch (e) {
          console.log('error', e.message)
        data = {
            status: true,
            message: 'Role Not Deleted'
        }
        toast.error(data.message);
        thunkAPI.dispatch(setRoleButtonLoading(false))
        
    }
    return data
})




export const roleSlice = createSlice({
    name: 'roles',
    initialState: {
        rolesList: [],
        rolesResponse: {},
        showAddForm: false,
        showUpdateForm: false,
        buttonLoading: false,
        rolePermissons: {},
        selectedRole: undefined,
        cloneData:'',
        loader:false,
        permissionData:[],
        accessDropDownList:[],
        orgPermissions:null,
        locPermissions:null,
        teamsPermssions:null,
        designationPermissions:null,
        userPermissions:null,
        departmentPermissions:null
    },
    extraReducers: {
        [createRoles.fulfilled]: (state, action) => {
            state.rolesResponse = action.payload;
            //console.log('2222222222222222222222222222222222222')
            return state;
        },
        [getRoles.fulfilled]: (state, action) => {
            //console.log("dsfsdfsdfsdfdsfds.......", state, action);
            state.rolesList = action.payload;
            return state;
        },
        [getPermissionsByRole.fulfilled]: (state, action) => {
            //console.log("dsfsdfsdfsdfdsfds.......", state, action);
            state.rolePermissons = action.payload;
            if(localStorage.permissions == undefined){
                localStorage.setItem('permissions', JSON.stringify(action.payload))
            }
            return state;
        },
        [updateRole.fulfilled]: (state, action) => {
            state.rolesResponse = action.payload;
            //console.log('2222222222222222222222222222222222222')
            return state;
        },
        [deleteRole.fulfilled]: (state, action) => {
            state.rolesResponse = action.payload;
            //console.log('2222222222222222222222222222222222222')
            return state;
        },
        [getRoleAccessDropDown.fulfilled]:(state,action)=>{
            state.accessDropDownList=action.payload
            return state
        },
        [getMasterPermissionsByRole.fulfilled]:(state,action)=>{
            state.orgPermissions=action.payload.filter(item=>item.table=="organization")[0]
            state.locPermissions=action.payload.filter(item=>item.table=="locations")[0]
            state.teamsPermssions=action.payload.filter(item=>item.table=="groups")[0]
            state.designationPermissions=action.payload.filter(item=>item.table=="designations")[0]
            state.departmentPermissions=action.payload.filter(item=>item.table=="departments")[0]
            state.userPermissions=action.payload.filter(item=>item.table=="users")[0]

        }
        
    },
    reducers: {
        setRoleAddform: (state, action) => {
            state.showAddForm = action.payload
            return state;
        },
        setRoleUpdateForm: (state, action) => {
            state.showUpdateForm = action.payload
            return state;
        },
        setRoleButtonLoading: (state, action) => {
            state.buttonLoading = action.payload
            return state;
        },
        setSelectedRole: (state, action) => {
            state.selectedRole = action.payload
            return state;
        },
        setCloneData:(state,action)=>{
            state.cloneData=action.payload
            return state
        },
        setLoader: (state, action) => {
            state.loader = action.payload
            return state;
        },
        setPermissionData:(state,action)=>{
            state.permissionData=action.payload
            return state
        }
    }
}
)

export const { setRoleAddform, setRoleUpdateForm,setCloneData,setPermissionData, setRoleButtonLoading, setSelectedRole, setLoader} = roleSlice.actions

export default roleSlice.reducer