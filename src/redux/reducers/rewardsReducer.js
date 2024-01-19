import { gql } from "@apollo/client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { client } from '../../environment'

const rewardsgetconfigQuery = gql`query MyQuery {
    rewards_configuration {
      assignee_type
      assigneed_to_rewards
      category
      created_by_rewards
      id
      is_enable
      org_id
      priority
      reviewed_by_rewards
      
    }
  }
  `

  const createRewards =gql`mutation createRewards($objects: [rewards_configuration_insert_input!]!) {
    insert_rewards_configuration(objects: $objects) {
      returning {
        id
      }
    }
  }`

  const updateRewardsMutation = gql`mutation updateRewards($object: [rewards_configuration_insert_input!]!) {
    insert_rewards_configuration(objects: $object, on_conflict: {constraint: rewards_configuration_pkey, update_columns: [category, is_enable, org_id, priority, assignee_type, created_by_rewards, assigneed_to_rewards, reviewed_by_rewards]}) {
      affected_rows
    }
  }`

  export const getRewardsConfig = createAsyncThunk('reminder/getAllrewards', async (payload,thunkAPI) => {
    thunkAPI.dispatch(setLoader(true))
    try {
        const response = await client.query({
            query: rewardsgetconfigQuery
        })
        // console.log("response",response);
        thunkAPI.dispatch(setLoader(false))
        return response.data.rewards_configuration;
    } catch (e) {
        console.log('error', e)
        thunkAPI.dispatch(setLoader(false))
        return e;
    }
}) 

export const createRewardsConfig = createAsyncThunk('reminder/createrewards', async (payload,thunkAPI) => {
    // console.log("payload---",payload);
    let data = {}
  // const orgId = thunkAPI.getState().auth.current_organization;
  try {
    const response = await client.mutate({
        mutation: createRewards, variables: {
            objects: payload
        }
    });
      console.log("createconfffffffff",response);
      console.log("updatefffffffff",response);
      data = {
        status: true,
        message: 'Rewards Created  Sucessfully'
    }
    toast.success(data.message);
    //   return response;
  } catch (e) {
      console.log('error', e)
      return e;
  }
})

export const updateRewardsConfig = createAsyncThunk('reminder/updaterewards', async (payload,thunkAPI) => {
    // console.log("payload---",payload);
    let data = {}
  
  try {
    const response = await client.query({
        query: updateRewardsMutation, variables: {
            object: payload
        }
    })
      console.log("updatefffffffff",response);
      data = {
        status: true,
        message: 'Rewards Updated  Sucessfully'
    }
    toast.success(data.message);
    //   return response;
  } catch (e) {
      console.log('error', e)
      return e;
  }
})


const RewardsConfigSlice = createSlice({
    name: "rewardsconfig",
    initialState: {
        loader:false,
        getrewardsList:[],
        insertrewardsList :[],
        updaterewardsList:[],
    },
    extraReducers: {
        [getRewardsConfig.fulfilled]: (state, action) => {
            state.getrewardsList = action.payload;
            return state;
        },
        [createRewardsConfig.fulfilled]: (state, action) => {
            state.insertrewardsList = action.payload;
            return state;
        },
        [updateRewardsConfig.fulfilled]: (state, action) => {
            state.updaterewardsList = action.payload;
            return state;
        },
    },
    reducers: {
      setLoader: (state, action) => {
        state.loader = action.payload
        return state;
    }
    }
})

export const { setLoader} = RewardsConfigSlice.actions
export default RewardsConfigSlice.reducer;