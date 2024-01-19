import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gql } from '@apollo/client'
import { client } from '../../environment'
import { toast } from 'react-toastify';

// const createTaskMutation = gql ``
const createAnnouncementMutation = gql`mutation insert_announcement($object: announcement_insert_input!) {

    insert_announcement_one(object: $object) {
        id
        
        }
  
  }
  `;
const getAnnouncementsQuery = gql`query getAnnouncement($description: String!) {
    announcement(where: {description: {_iregex: $description}},order_by:{id:desc}) {
      id
     description
     start_date
     end_date
     org_id
     created_by
     is_active
     created_at
     image
     title
     user{
        name
        lastname
    }
    }
  }
  `;

const deleteAnnouncementsMutation = gql`mutation deleteAnnoucements($id: Int!) {
    delete_announcement(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }  
  `;

const updateAnnouncementsMutation = gql`mutation updateannouncement($object:[announcement_insert_input!]!) {
    insert_announcement(objects: $object
    ,
          on_conflict: {
            constraint: announcement_pkey,
            update_columns: [description,start_date,end_date,title,image]
          }
      ){
          affected_rows
      }
    }  
  `;

const getTodayAnnouncementsQuery = gql` query getAnnouncments($date:timestamptz!) {
    announcement(where:{_and: {start_date: {_lte: $date},end_date: {_gte: $date}}},order_by:{id:desc}){
        id
        description
        start_date
        end_date
        org_id
        created_by
        is_active
        created_at
        image
        title
        user{
            name
            lastname
        }
    
    }

}`


export const createAnnouncement = createAsyncThunk('announcements/create', async (payload, thunkAPI) => {
    // console.log("Create Announcements Payload ...................", payload)
    let data = {}
    try {
        const response = await client.mutate({
            mutation: createAnnouncementMutation, variables: {
                object: payload
            }
        });
        data = {
            status: true,
            message: 'created Announcement Successfully'
        }
        toast.success(data.message);
        thunkAPI.dispatch(setButtonLoading(false))
        // thunkAPI.dispatch(setUserAddform(false))

    } catch (e) {
        console.log('error', e)
        data = {
            status: false,
            message: e.message
        }
        toast.error(data.message);
        thunkAPI.dispatch(setButtonLoading(false))
        //console.log('response+++++++', data)

    }

    return data
})

export const getAllAnnouncements = createAsyncThunk('announcements/getall', async (payload, thunkAPI) => {
    thunkAPI.dispatch(setLoader(true))
    try {

        const response = await client.query({
            query: getAnnouncementsQuery, variables: {
                description: `${payload}`
            }
        })
        thunkAPI.dispatch(setLoader(false))
        return response?.data?.announcement
    } catch (e) {
        thunkAPI.dispatch(setLoader(false))
        console.log('error', e)
    }
})

export const deleteAnnouncements = createAsyncThunk('announcements/delete', async (payload, thunkAPI) => {
    let id = {
        id: payload
    }
    let data = {}
    try {
        const response = await client.query({
            query: deleteAnnouncementsMutation, variables: id
        })
        data = {
            status: true,
            message: 'Announcement deleted Sucessfully'
        }
        toast.success(data.message);
        thunkAPI.dispatch(setButtonLoading(false))
        return response
    } catch (e) {
        data = {
            status: true,
            message: e.message
        }
        toast.error(data.message);
        thunkAPI.dispatch(setButtonLoading(false))
        console.log('error', e)
    }

})


export const updateAnnouncements = createAsyncThunk('announcements/update', async (payload, thunkAPI) => {
    delete payload.user
    let data = {}
    try {
        const response = await client.query({
            query: updateAnnouncementsMutation, variables: {
                object: payload
            }
        })
        data = {
            status: true,
            message: 'Announcement updated Sucessfully'
        }
        toast.success(data.message);
        thunkAPI.dispatch(setButtonLoading(false))
        return response
    } catch (e) {
        data = {
            status: true,
            message: e.message
        }
        toast.error(data.message);
        thunkAPI.dispatch(setButtonLoading(false))
        console.log('error', e)
    }
})

export const getTodayAnnouncements = createAsyncThunk('announcements/getToday', async (payload, thunkAPI) => {
    try {
        const response = await client.query({
            query: getTodayAnnouncementsQuery, variables: {
                "date": new Date()
            }
        })
        // console.log(response.data.announcement)
        return response?.data?.announcement
    } catch (e) {
        console.log('error', e)
    }
})

export const taskSlice = createSlice({
    name: 'announcement',
    initialState: {
        showTask: false,
        showTemplateForm: false,
        buttonLoading: false,
        loader: false,
        addAnnounceResponse: {},
        announcements: [],
        deleteResponse: {},
        updateResponse: {},
        todayAnnouncements: []
    },
    extraReducers: {
        [createAnnouncement.fulfilled]: (state, action) => {
            state.addAnnounceResponse = action.payload;
            return state;
        },
        [getAllAnnouncements.fulfilled]: (state, action) => {
            state.announcements = action.payload;
            return state;
        },
        [deleteAnnouncements.fulfilled]: (state, action) => {
            state.deleteResponse = action.payload;
            return state;
        },
        [updateAnnouncements.fulfilled]: (state, action) => {
            state.updateResponse = action.payload;
            return state;
        },
        [getTodayAnnouncements.fulfilled]: (state, action) => {
            state.todayAnnouncements = action.payload;
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
        setButtonLoading: (state, action) => {
            state.buttonLoading = action.payload
            return state;
        },
        setLoader: (state, action) => {
            state.loader = action.payload
            return state;
        },
    }
}
)

export const { setTaskAddform, setLoader, setTemplateAddform, setButtonLoading } = taskSlice.actions

export default taskSlice.reducer