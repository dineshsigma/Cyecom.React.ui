import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { gql } from "@apollo/client";
import { client, baseUrl } from "../../environment";
import { toast } from "react-toastify";
import axios from "axios";

const getApprovals = gql`
query getAppovals($name:String!) {
  approval_template_master(where:{template_name:{_iregex:$name}}) {
      id
      category
      created_by
      task_type
      template_name
      org_id
      levels
      approval_category
      approval_type
      approval_templates {
        id
        user_id
        master_id
        level_in
        step_name
        force_approval
        created_at
        created_by
      }
    }
  }
`;

const createApproval = gql`
  mutation createApproval($objects: [createApprovalInput!]) {
    createApproval(arg1: $objects) {
      data
      response {
        message
        status
      }
    }
  }
`;

const approveTask = gql`
  mutation taskApproval($object: task_approval_input!) {
    taskApproval(arg1: $object) {
      message
      status
    }
  }
`;

const reqUsersApproval = gql`
  query ($masterId: Int!) {
    approval_template(where: { master_id: { _eq: $masterId } }) {
      user_id
      master_id
    }
  }
`;

const getApprovalUser = gql`
  mutation getApproveUsers($object: getApproveUsers!) {
    getApproveUsers(arg1: $object) {
      data
      response {
        message
        status
      }
    }
  }
`;

const approvalUsers = gql`
  mutation getApproverList($object: getApproverList!) {
    getApproverList(arg1: $object) {
      data
      response {
        message
        status
      }
    }
  }
`;

export const updateTaskApprovalMethod = createAsyncThunk(
  "approvals/updateApprovalMethod",
  async (payload, thunkAPI, state) => {
    // console.log("updateTaskApproval...................", payload);
    try {
      const response = await axios.post(
        `${baseUrl}tasks/taskStatusUpdate`,
        payload
      );
      // console.log(response, "APPROVAL RESP-----------");
      return response.data.status;
    } catch (e) {
      console.log(e, "ERROR");
      toast.error(e.message);
      return e;
    }
  }
);

export const getApprovalUserExist = createAsyncThunk(
  "approvals/getApprovalUserExist",
  async (payload) => {
    // console.log(payload, "PAYLOADDDDApproveSSSSSS");
    try {
      const response = await client.query({
        query: getApprovalUser,
        variables: {
          object: payload,
        },
      });
      // console.log(response, "RESPONSE------------");
      return response?.data?.getApproveUsers?.data;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const reqUsersToApproval = createAsyncThunk(
  "approvals/reqUsersToApproval",
  async (payload) => {
    // console.log(payload, "PAY4444444444444444444444444");
    try {
      const response = await client.query({
        query: reqUsersApproval,
        variables: payload,
      });
      // console.log(response, "RESPONSE------------4444444444444444444444");
      return response?.data?.approval_template;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const getApproversList = createAsyncThunk(
  "approvals/getApproversList",
  async (payload) => {
    // console.log(payload, "PAY5555555555");
    try {
      const response = await client.query({
        query: approvalUsers,
        variables: {
          object: payload,
        },
      });
      // console.log(response, "RESPONSE------------5555555555555");
      return response?.data?.getApproverList?.data;
    } catch (e) {
      console.log("error", e);
    }
  }
);

// export const getApproversList = async (payload) => {
//   console.log("getApproversList...................", payload)
//   try {
//     const response = await axios.post(`https://182b-183-83-216-63.ngrok-free.app/api/tasks/getApproverList`, payload);
//     console.log(response, 'getApproversList RESP-----------55555555555555555')
//   } catch (e) {
//     console.log(e, "ERROR")
//   }
// }

export const approveTaskMethod = createAsyncThunk(
  "approvals/approve",
  async (payload) => {
    // console.log(payload, "PAYLOADDDDApprove");
    try {
      const response = await client.query({
        query: approveTask,
        variables: {
          object: payload,
        },
      });
      // console.log(response, "RESPONSE------------");
      if (response?.data?.taskApproval?.message == "approved successfully") {
        // console.log(11111);
        let data = {
          status: true,
          message: "Approved Successfully",
        };
        // console.log("response+++++++11", data);
        toast.success(data.message);
        // setApprovalAddform(true)
      } else if (
        response?.data?.taskApproval?.message == "rejected successfully"
      ) {
        let data = {
          status: true,
          message: "Rejected Successfully",
        };
        toast.success(data.message);
      } else if (
        response?.data?.taskApproval?.message == "Force closed successfully"
      ) {
        let data = {
          status: true,
          message: "Force closed Successfully",
        };
        toast.success(data.message);
      }
      return response.data;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const getApprovalsData = createAsyncThunk(
  "approvals/getApprovals",
  async (payload, thunkAPI) => {
    try {
      const response = await client.mutate({
        mutation: getApprovals,
        variables: payload,
      });
      // console.log(response, "RESP--------------");
      return response?.data?.approval_template_master;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const createNewApproval = createAsyncThunk(
  "approvals/createTaskTemplete",
  async (payload) => {
    // console.log(payload, "PAYLOADDDD");
    try {
      const response = await client.query({
        query: createApproval,
        variables: {
          objects: payload,
        },
      });
      // console.log(response?.data?.createApproval?.response?.status, 'RESPONSE------------');
      // console.log(response?.data?.insert_approval_template?.affected_rows, 'RESPONSE------------');
      if (response?.data?.createApproval?.response?.status) {
        if (payload.method == "create") {
          let data = {
            status: true,
            message: "Created Approval Method Successfully",
          };
          // console.log("response+++++++11", data);
          toast.success(data.message);
          // setApprovalAddform(true)
        } else if (payload.method == "update") {
          let data = {
            status: true,
            message: "Updated Approval Method Successfully",
          };
          // console.log("response+++++++11", data);
          toast.success(data.message);
          // setApprovalAddform(true)
        }
      } else {
        let data = {
          status: false,
          message: "Approval Method Exists",
        };
        toast.error(data.message);
      }
      return response.data;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const approvalSlice = createSlice({
  name: "approval",
  initialState: {
    approvals: [],
    createApprovalForm: false,
    approvalUserTemplate: [],
    approvedTask: [],
    usersToApprove: [],
    approvedList: [],
    approvalMethodAdded: false,
  },
  // reducers: {
  //   setApprovalAddform: (state, action) => {
  //       console.log('222222');
  //       state.createApprovalForm = action.payload
  //       return state;
  //   },
  // },
  extraReducers: {
    [createNewApproval.fulfilled]: (state, action) => {
      state.createApprovalForm = !state.createApprovalForm;
      return state;
    },
    [getApprovalsData.fulfilled]: (state, action) => {
      state.approvals = action.payload;
      return state;
    },
    [getApprovalUserExist.fulfilled]: (state, action) => {
      state.approvalUserTemplate = action.payload;
      return state;
    },
    [approveTaskMethod.fulfilled]: (state, action) => {
      state.approvedTask = action.payload;
      return state;
    },
    [reqUsersToApproval.fulfilled]: (state, action) => {
      state.usersToApprove = action.payload;
      return state;
    },
    [getApproversList.fulfilled]: (state, action) => {
      state.approvedList = action.payload;
      return state;
    },
    [updateTaskApprovalMethod.fulfilled]: (state, action) => {
      state.approvalMethodAdded = action.payload;
      return state;
    },
  },
});
export const { setApprovalAddform } = approvalSlice.actions;

export default approvalSlice.reducer;
