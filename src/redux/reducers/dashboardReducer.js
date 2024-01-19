import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { gql } from "@apollo/client";
import { client } from "../../environment";
import { toast } from "react-toastify";
import axios from 'axios';
import { baseUrl } from '../../environment'

const taskOverView = gql`
  mutation getStatusCountFilter($object: pastWeekStatusCount!) {
    lastWeekStatusCounts(arg1: $object) {
      data
      response {
        message
        status
      }
    }
  }
`;

const statusFilterMutation = gql`
  mutation statusFilter {
    statusCounts {
      data
      response {
        message
        status
      }
    }
  }
`;

const filteredStatusCount = gql`
  mutation statusCountFilter($object: statusCountFilterInput!) {
    statusCountFilter(arg1: $object) {
      data
      response {
        status
        message
      }
    }
  }
`;

const getGroupsMutation = gql`
query getGroupDropdown{
  getGroupsDropdown{
    data
    response{
      message
      status
    }
    }
}
`;

const getGroupsByOrgMutation = gql`
  mutation teamTasksCloseFilter($object: teamTasksClosedFilter!) {
    teamTaskClosedFilter(arg1: $object) {
      data
      response {
        message
        status
      }
    }
  }
`;



// const getHighPriorityTasks =gql`
//   query getOverduePriorityTasks {
//     tasks(
//       where: {priority: {_eq: "high"}, assignee: {_neq: []},status:{_neq:"closed"},
//         is_delete:{_eq:false},parent:{_eq:0}}
//       order_by: {due_date: asc}) {
//       id
//       name
//       created_at
//       due_date
//       priority
//       alias_user
//       assignee
//       checklistprogress
//       create_individualTask
//       createdby
//       current_level
//       deleted_by
//       next_notification
//       status
//       start_date
//       schedule_time
//       remainder_interval
//       internal_priority
//       internal_status
//       updated_user
//       updated_on
//       updated_by
//       task_type
//       parent
//       org_id
//       last_self_remainder_time
//       is_delete
//       is_active
//       description
//       deleted_on
//       deleted_by
//       task_code
//     }
//   }
// `;


const getHighPriorityTasks=gql`query getHighPriorityTasks{
  getHighPriorityTasks{
    data
    response{
      message
      status
    }
    }
}`
const getDeparmentQuery = gql`query getDepTaskCountFilter{
  getDepTaskCountFilter{
    data
    response{
      message
      status
    }
    }
}`

const getRankingQuery = gql`query getUserTotalRwards {
  getUserTotalRewards {
    data
    response {
      message
      status
    }
  }
}`

const getGraphOverview=gql`query getStatusGrph{
  statusGraph{
    data
    response{
      message
      status
    }
  }
}`

export const getDeparmentTaskFilter = createAsyncThunk('departments/filterDepartments', async (payload) => {
  try {
    const response = await client.query({
      query: getDeparmentQuery, variables: {
        object: payload
      }
    })
    if (response) {
      return response
    }

  }
  catch (e) {
  }
})

export const getTasksOverview = createAsyncThunk(
  "dashboards/getStatusCountFilter",
  async (payload, thunkAPI) => {
    try {
      const response = await client.mutate({
        mutation: taskOverView,
        variables: {
          object: {
            "type": "self"
          },
        },
      });
      // return response?.data?.tasks;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const getHighTasks = createAsyncThunk(
  "dashboards/getOverduePriorityTasks",
  async (payload, thunkAPI) => {
    try {
      const response = await client.query({
        query: getHighPriorityTasks,
        variables: {},
      });
      return response?.data?.getHighPriorityTasks.data      ;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const getGroupsByOrgId = createAsyncThunk(
  "dashboards/teamTasksCloseFilter",
  async (payload) => {
    try {
      const response = await client.query({
        query: getGroupsByOrgMutation,
        variables: {
          object: {
            group_id: payload.object.group_id,
          },
        },
      });
      return response.data;
    } catch (e) {
      //console.log('error', e)
    }
  }
);

export const getGroups = createAsyncThunk(
  "dashboards/getGroups",
  async (payload, thunkAPI) => {
    try {
      const response = await client.query({
        query: getGroupsMutation,
        variables: {},
      });
      return response.data.getGroupsDropdown.data      ;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const getStatusFilterTasks = createAsyncThunk(
  "dashboards/statusFilter",
  async (payload, thunkAPI) => {
    try {
      const response = await client.mutate({
        mutation: filteredStatusCount,
        variables: {
            object:payload
        },
      });
      return response.data.statusCountFilter.data;
      // return response.data.statusCounts.data;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const getTaskOverviewGraph = createAsyncThunk(
  "dashboards/getTaskoverview",
  async (payload, thunkAPI) => {
    // console.log("gettaskoverviewpayload",payload);

    try {
      const response =await client.query({query:getGraphOverview,variables:payload})
      return response.data.statusGraph.data
      
    }
    catch (error) {
      console.log("error");
    }

  }
);


//get RewardsList 

export const getRewardsList = createAsyncThunk(
  "dashboards/RewardsFilter",
  async (payload, thunkAPI) => {

    try {
      const response = await client.mutate({
        mutation: getRankingQuery,
        variables: {},
      });
      let res = response?.data?.getUserTotalRewards?.data?.sort((a,b)=>{return b.points - a.points});
     // console.log("res",res);
      return response?.data?.getUserTotalRewards?.data;
    } catch (e) {
      console.log("error", e);
    }
  }
);


export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    statusFilters: [],
    groupsDropDown: [],
    teamMembersbyId: [],
    highPriorityTasks: [],
    departmentsData: [],
    rankingData: []
  },
  extraReducers: {
    [getStatusFilterTasks.fulfilled]: (state, action) => {
      state.statusFilters = action.payload;
      return state;
    },
    [getGroups.fulfilled]: (state, action) => {
      state.groupsDropDown = action.payload;
      return state;
    },
    [getGroupsByOrgId.fulfilled]: (state, action) => {
      state.teamMembersbyId = action.payload;
      return state;
    },
    [getHighTasks.fulfilled]: (state, action) => {
      state.highPriorityTasks = action.payload;
      return state;
    },
    [getTaskOverviewGraph.fulfilled]: (state, action) => {
      state.getTasksOverView = action.payload;
      return state;
    },
    [getDeparmentTaskFilter.fulfilled]: (state, action) => {
      state.departmentsData = action?.payload?.data?.getDepTaskCountFilter?.data
      return state
    },
    [getRewardsList.fulfilled]: (state, action) => {
      state.rankingData = action.payload
      return state
    },
  },
});

export default dashboardSlice.reducer;
