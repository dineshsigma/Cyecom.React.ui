import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { gql } from "@apollo/client";
import { client } from "../../environment";
import { toast } from "react-toastify";

const aliasUser = localStorage.getItem("alias-user");
// const createTaskMutation = gql ``
const createTaskMutation = gql`
  mutation createTask($object: tasks_insert_input!) {
    insert_tasks_one(object: $object) {
      id
    }
  }
`;
const createTaskMutation_individual = gql`
  mutation createTask($objects: [tasks_insert_input!]!) {
    insert_tasks(objects: $objects) {
      returning {
        id
      }
    }
  }
`;

const taskUpdateSocketMutation =gql`mutation taskUpdateBySocket($object:taskUpdateBySocket!){
  taskUpdateBySocket(arg1:$object){
    message
    status
  }
}`

const createReccurssiveTaskMutation = gql`
  mutation createTask($object: task_template_insert_input!) {
    insert_task_template_one(object: $object) {
      id
    }
  }
`;

const getTaskByIdMutation = gql`
  query getTask($id: Int!) {
    tasks(where: { id: { _eq: $id }, is_delete: { _eq: false } }) {
      name
      description
      assignee_type
      start_date
      due_date
      status
      priority
      task_type
      is_active
      checklistprogress
      remainder_interval
      parent
      create_individualTask
      assignee
      next_notification
      org_id
      id
      task_code
      createdby
      updated_by
      updated_on
      deleted_by
      deleted_on
      is_delete
      current_level
      approval_template_master_id
      internal_status
      internal_priority
      review_attempts
      pending_for_acceptance
      force_closers
    }
  }
`;

const getSubtasksList = gql`
  query getTasks($parent: Int!) {
    tasks(where: { parent: { _eq: $parent }, is_delete: { _eq: false } }) {
      name
      description
      assignee_type
      start_date
      due_date
      status
      priority
      task_type
      is_active
      checklistprogress
      remainder_interval
      parent
      create_individualTask
      assignee
      next_notification
      org_id
      id
      createdby
      updated_by
      updated_on
      deleted_by
      deleted_on
      is_delete
      internal_status
      internal_priority
    }
  }
`;

const getTasks = gql`
  query gettasks(
    $name: String!
    $status: String!
    $priority: String!
    $created_by: Int!
    $assignee: jsonb!
    $limit: Int!
    $offset: Int!
  ) {
    tasks(
      where: {
        _and: [
          { name: { _iregex: $name } }
          { status: { _iregex: $status } }
          { priority: { _iregex: $priority } }
          {
            parent: { _eq: 0 }
            task_type: { _eq: "Live" }
            status: { _neq: "closed" }
            assignee: { _neq: [] }
          }
        ]
        _or: [
          { assignee: { _contains: $assignee } }
          { createdby: { _eq: $created_by } }
        ]
      }
      order_by: { id: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      org_id
      task_code
      name
      description
      assignee_type
      start_date
      due_date
      status
      priority
      task_type
      is_active
      checklistprogress
      remainder_interval
      parent
      create_individualTask
      assignee
      next_notification
      createdby
      updated_by
      updated_on
      deleted_by
      deleted_on
      is_delete
      checklistprogress
      internal_priority
      internal_status
      force_closers
    }
  }
`;

const getDraftTasksQuery = gql`
  query getdrafttasks($name: String!) {
    tasks(
      where: {
        _or: [
          { name: { _iregex: $name } }
          { status: { _iregex: $name } }
          { priority: { _iregex: $name } }
        ]
        _and: { parent: { _eq: 0 }, task_type: { _in: ["Draft", "Schedule"] } }
      }
      order_by: { due_date: asc }
    ) {
      name
      description
      assignee_type
      start_date
      due_date
      status
      priority
      task_type
      is_active
      checklistprogress
      remainder_interval
      parent
      create_individualTask
      assignee
      next_notification
      org_id
      id
      createdby
      updated_by
      updated_on
      deleted_by
      deleted_on
      is_delete
      id
      schedule_time
    }
  }
`;

const updateTaskMutation = gql`
  mutation updateTask($object: [tasks_insert_input!]!) {
    insert_tasks(
      objects: $object
      on_conflict: {
        constraint: tasks_pkey
        update_columns: [
          name
          assignee
          description
          due_date
          start_date
          priority
          status
          remainder_interval
          updated_by
          updated_on
          deleted_by
          deleted_on
          is_delete
          task_type
          schedule_time
          approval_template
          current_level
          internal_status
          internal_priority
          force_closers
        ]
      }
    ) {
      affected_rows
    }
  }
`;

const deleteTaskMutation = gql`
  mutation deleteTasks($id: Int!) {
    delete_tasks(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

const getRecurring_Tasks = gql`
  query getTaskTemplates($name: String!) {
    task_template(
      where: {
        _and: [
          { name: { _iregex: $name } }
          { task_type: { _eq: "reccurssive" }, is_delete: { _eq: false } }
        ]
      }
      order_by: { id: desc }
    ) {
      id
      name
      org_id
      assignee
      assignee_type
      recurring_rule
      task_type
      due_date_duration
      description
      next_notification
      start_date
      due_date
      untill_date
      status
      priority
      next_trigger_time
      remainder_interval
      rule_text
      rule_set
      locations
      is_active
      created_by
      updated_by
      updated_on
      deleted_by
      deleted_on
      is_delete
      alias_user
      config
      internal_priority
      internal_status
    }
  }
`;

const getTaskLogs = gql`
  query get_tasklogs($task_id: Int!) {
    task_logs(where: { task_id: { _eq: $task_id } }) {
      id
      created_at
      json
      operation
      created_by
      ip_address
      context
    }
  }
`;

const updatePermissionMutation=gql`mutation updateTask($object:updateTaskInput!){
  updateTask(arg1:$object) {
      message
      status
  }
}`

const updateRecurringTaskMutation = gql`
  mutation updateTask($object: [task_template_insert_input!]!) {
    insert_task_template(
      objects: $object
      on_conflict: {
        constraint: Task_templates_pkey
        update_columns: [
          is_active
          is_delete
          deleted_by
          deleted_on
          internal_status
          internal_priority
          updated_by
          updated_on
          name
          description
          start_date
          untill_date
          status
          priority
          rule_text
          recurring_rule
          rule_set
          assignee
          next_trigger_time
          config
          next_notification
        ]
      }
    ) {
      affected_rows
    }
  }
`;

const getTaskFilterMutation = gql`
  mutation get_tasksFilter($object: task_filter_input!) {
    taskFilter(arg1: $object) {
      data
      response {
        message
        status
      }
    }
  }
`;

//task list query for tabs (status,priority,assignee,start_date,due_date)

//mutation query for filters draft task, schedule task

const getDraftTaskFilterQuery = gql`
  query getdrafttasks($name: String!,$userid:Int!, $task_type: [String!]!) {
    tasks(
      where: {
        _or: [
          { name: { _iregex: $name } }
          { status: { _iregex: $name } }
          { priority: { _iregex: $name } }
        ]
        _and: { parent: { _eq: 0 }, task_type: { _in: $task_type },createdby:{_eq:$userid}}
      }
      order_by: { id: desc }
    ) {
      name
      description
      assignee_type
      start_date
      due_date
      status
      priority
      task_type
      is_active
      checklistprogress
      remainder_interval
      parent
      create_individualTask
      assignee
      next_notification
      org_id
      id
      createdby
      updated_by
      updated_on
      deleted_by
      deleted_on
      is_delete
      id
      schedule_time
      internal_priority
      internal_status
    }
  }
`;

const getAllTeamIdsMutation = gql`
  mutation getTeamIds($object: get_team_ids_input!) {
    getTeamTasks(arg1: $object) {
      data
      response {
        message
        status
      }
    }
  }
`;

const getTasksPerUser = gql`
  query getTansferTaskList($userid: jsonb!) {
    tasks(
      where: {
        assignee: { _contains: $userid }
        _and: [
          { status: { _neq: "closed" } }
          { status: { _neq: "in-review" } }
        ]
      }
    ) {
      name
      assignee
      createdby
      org_id
      alias_user
      task_type
      task_code
      start_date
      schedule_time
      remainder_interval
      parent
      priority
      id
      assignee_type
      checklistprogress
      status
      created_at
      current_level
      deleted_by
      deleted_on
      description
      due_date
      internal_priority
      internal_status
      is_active
      is_delete
      last_self_remainder_time
      task_code
    }
  }
`;

const taskTransferMutation = gql`
  mutation taskTransfer($object: assigneeTransfer_input!) {
    assigneeTransfer(arg1: $object) {
      message
      status
    }
  }
`;

const getPendingTasks = gql`
  query ($userid: jsonb!, $orgid: Int!) {
    tasks(
      where: {
        pending_for_acceptance: { _contains: [$userid] }
        org_id: { _eq: $orgid }
        status: { _neq: "closed" }
      }
    ) {
      name
      alias_user
      approval_template
      assignee
      approval_template_master_id
      assignee_type
      category
      create_individualTask
      checklistprogress
      status
      created_at
      createdby
      current_level
      deleted_by
      deleted_on
      description
      due_date
      id
      internal_status
      internal_priority
      is_active
      is_delete
      last_escalation1
      last_escalation2
      last_escalation3
      last_self_remainder_time
      name
      next_notification
      org_id
      pending_for_acceptance
      parent
      priority
      rejected_users
      review_attempts
      schedule_time
      start_date
      task_code
      task_type
      updated_on
      updated_by
    }
  }
`;

const taskApprovalListQuery = gql`
  mutation ($object: myApprovedListInput!) {
    myApprovedList(arg1: $object) {
      message
      status
    }
  }
`;

const taskRejectListQuery = gql`
  mutation ($object: myRejectedListInput!) {
    myRejectedList(arg1: $object) {
      message
      status
    }
  }
`;

const acceptIncominTask = gql`
  mutation acceptTask($object: acceptTaskInput!) {
    acceptTask(arg1: $object) {
      data
      response {
        message
        status
      }
    }
  }
`;

const getTasks_WithClosedData = gql`
  query gettasks(
    $name: String!
    $status: String!
    $priority: String!
    $created_by: Int!
    $assignee: jsonb!
    $limit: Int!
    $offset: Int!
  ) {
    tasks(
      where: {
        _and: [
          { name: { _iregex: $name } }
          { status: { _iregex: $status } }
          { priority: { _iregex: $priority } }
          {
            parent: { _eq: 0 }
            task_type: { _eq: "Live" }
            assignee: { _neq: [] }
          }
        ]
        _or: [
          { assignee: { _contains: $assignee } }
          { createdby: { _eq: $created_by } }
        ]
      }
      order_by: { id: desc }
      limit: $limit
      offset: $offset
    ) {
      task_code
      name
      description
      assignee_type
      start_date
      due_date
      status
      priority
      task_type
      is_active
      checklistprogress
      remainder_interval
      parent
      create_individualTask
      assignee
      next_notification
      org_id
      id
      createdby
      updated_by
      updated_on
      deleted_by
      deleted_on
      is_delete
      checklistprogress
      internal_priority
      internal_status
      force_closers
    }
  }
`;

const reports = gql`
  mutation reportsFilter($object: reportsFilterInput!) {
    reportsFilter(arg1: $object) {
      data
      response {
        message
        status
      }
    }
  }
`;
const saveReportMutation=gql`mutation createReportTemplate($object:[report_templates_insert_input!]!){
    insert_report_templates(objects:$object){
       returning{
        id
      }
    }
  }`

const getTemplateReportsQuery=gql`query getReportTemplates{
    report_templates(where:{is_delete:{_eq:false}}){
      id
      org_id
      template
      template_name
      is_delete
    }
  }`


const createdTasksQuery=gql`query getCreatedByMeTasks($name: String!, $userid: Int!, $orgid: Int!) {
  tasks(
    where: {createdby: {_eq: $userid}, is_delete: {_eq: false}, org_id: {_eq: $orgid}, name: {_iregex: $name}},order_by:{created_at:desc}
  ) {
    name
    start_date
    updated_user
    updated_by
    task_type
    task_code
    status
    schedule_time
    review_attempts
    remainder_interval
    rejected_users
    priority
    pending_for_acceptance
    parent
    org_id
    next_notification
    locations
    last_self_remainder_time
    last_escalation3
    last_escalation2
    last_escalation1
    is_delete
    is_active
    internal_status
    internal_priority
    id
    force_closers
    due_date
    description
    deleted_on
    deleted_by
    current_level
    createdby
    created_at
    create_individualTask
    closed_date
    checklistprogress
    category
    assignee_type
    assignee
    approval_template_master_id
    approval_template
    alias_user
  }
  task_template(
    where: {created_by: {_eq: $userid}, is_delete: {_eq: false}, org_id: {_eq: $orgid}, name: {_iregex: $name}},order_by:{created_at:desc}
  ) {
    alias_user
    assignee
    assignee_type
    config
    created_at
    created_by
    deleted_by
    deleted_on
    description
    due_date
    due_date_duration
    id
    internal_priority
    internal_status
    is_active
    is_delete
    locations
    name
    next_notification
    next_trigger_time
    org_id
    priority
    recurring_rule
    remainder_interval
    rule_set
    rule_text
    start_date
    status
    task_type
    untill_date
    updated_by
    updated_on
  }
}
`

const updateSavedReportsMutation=gql`mutation update_report_templates($name: String!, $id: Int, $template: jsonb) {
    update_report_templates(
      where: {id: {_eq: $id}},
      _set: {
        template:$template ,
        template_name: $name
      }
    ) {
      affected_rows
      returning {
        org_id
        template
        template_name
      }
    }
  }`

const deleteReportsMutation=gql`mutation deleteReportTemplate($object:[report_templates_insert_input!]!) {
    insert_report_templates(objects: $object,
          on_conflict: {
            constraint: report_templates_pkey,
            update_columns: [is_delete]
          }
      ){
          affected_rows
      }
    }`

export const deleteSavedReports=createAsyncThunk('reports/deleteReports',async(payload,thunkAPI)=>{
    try{
        const response=client.mutate({
            mutation:deleteReportsMutation,
            variables:{
                object:payload
            }
        })
        console.log('deleteRes',response)
        return response
    }
    catch(e){
        console.log('deleteRes',e)
    }
})

export const updatePermissionCheck=createAsyncThunk('tasks/updateCheck',async(payload,thunkAPI)=>{
  try{
      const response=client.mutate({
          mutation:updatePermissionMutation,
          variables:{
              object:payload
          }
      })
      console.log('deleteRes',response)
      return response
  }
  catch(e){
      console.log('deleteRes',e)
  }
})

export const createdTasks=createAsyncThunk('tasks/createdTasks',async(payload,thunkAPI)=>{
  try {
    const response = await client.query({
        query: createdTasksQuery,
        variables: payload,
    });
    //   console.log("RESP_FILTERS", response.data.reportsFilter.data)
    //   console.log(response)
    return response;
} catch (e) {
    console.log("error---filters", e.message);
}
})

export const updateSavedReports = createAsyncThunk("reports/updateReports", async (payload, thunkAPI) => {
    console.log("UpadteReportpayload", payload)
    try {
        const response = await client.mutate({
            mutation: updateSavedReportsMutation,
            variables: payload,
        });
        //   console.log("RESP_FILTERS", response.data.reportsFilter.data)
        console.log(response)
        return response;
    } catch (e) {
        console.log("error---filters", e.message);
    }
}
);


export const saveReportTemplate = createAsyncThunk(
    "reports/saveReport",
    async (payload, thunkAPI) => {
        console.log("saveReportPayload", payload)
        try {
            const response = await client.mutate({
                mutation: saveReportMutation,
                variables: {
                    object: payload,
                },
            });
            //   console.log("RESP_FILTERS", response.data.reportsFilter.data)
            console.log(response)
            return response;
        } catch (e) {
            console.log("error---filters", e.message);
        }
    }
);


export const getSavedReportsTemplates = createAsyncThunk("reports/getSavedReports", async (payload, thunkAPI) => {
    try {
        const response = await client.query({
            query: getTemplateReportsQuery,
            variables: payload,
        });
        //   console.log("RESP_FILTERS", response.data.reportsFilter.data)
        //   console.log(response)
        return response;
    } catch (e) {
        console.log("error---filters", e.message);
    }
}
);

export const getReportFilter = createAsyncThunk(
  "tasks/accept",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(setLoader(true));
    try {
      const response = await client.mutate({
        mutation: reports,
        variables: {
          object: payload,
        },
      });
      //   console.log("RESP_FILTERS", response.data.reportsFilter.data);
      thunkAPI.dispatch(setLoader(false));
      return response.data.reportsFilter.data;
    } catch (e) {
      thunkAPI.dispatch(setLoader(false));
      console.log("error---filters", e.message);
    }
  }
);

export const Accept_Task = createAsyncThunk("tasks/accept", async (payload) => {
  console.log("acccc", payload);
  try {
    const response = await client.mutate({
      mutation: acceptIncominTask,
      variables: {
        object: payload,
      },
    });
    console.log("accept_res", response);
    return response;
  } catch (e) {
    console.log("error---task", e.message);
  }
});
export const getAcceptTasks = createAsyncThunk(
  "tasks/accepttasks",
  async (payload) => {
    try {
      const response = await client.query({
        query: getPendingTasks,
        variables: payload,
      });
      return response;
    } catch (e) {
      console.log("error", e);
    }
  }
);
export const taksTransfer = createAsyncThunk(
  "tasks/transfer",
  async (payload) => {
    console.log("Transferpayloaddddd", payload);
    try {
      const response = await client.mutate({
        mutation: taskTransferMutation,
        variables: {
          object: payload,
        },
      });
      if (response) {
        toast.success("Task Transferred Successfully");
      }
      return response;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const getAlltasks_perUser = createAsyncThunk(
  "tasks/getallperUser",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(setLoader(true));
    try {
      const response = await client.query({
        query: getTasksPerUser,
        variables: payload,
      });
      thunkAPI.dispatch(setLoader(false));
      // console.log(response.data, "rrrrrrrrr")
      return response.data.tasks;
    } catch (e) {
      console.log("error", e);
      thunkAPI.dispatch(setLoader(false));
    }
  }
);

const getMyApprovals = gql`
  mutation needtoApproveList($object: needtoApproveList!) {
    needtoApproveList(arg1: $object) {
      data
      response {
        message
        status
      }
    }
  }
`;

export const myApprovals = createAsyncThunk(
  "tasks/myApprovalsNeeded",
  async (payload) => {
    // console.log("myApprovals...................", payload)
    try {
      const response = await client.query({
        query: getMyApprovals,
        variables: {
          object: payload,
        },
      });
      // console.log('getTaskForApproval', response?.data?.needtoApproveList?.data)
      let myApprovals = response?.data?.needtoApproveList?.data;
      let combinedMyApprovals = [];
      myApprovals.forEach((element) => {
        element.map((item) => combinedMyApprovals.push(item));
      });
      // console.log(combinedMyApprovals, 'combinedMyApprovals')
      return combinedMyApprovals;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const getTaskById = createAsyncThunk(
  "tasks/getById",
  async (payload, thunkAPI) => {
    // console.log("getTaskById...................", payload)
    thunkAPI.dispatch(setTaskDetailLoader(true));
    try {
      const response = await client.query({
        query: getTaskByIdMutation,
        variables: {
          id: parseInt(payload.id),
        },
      });
      // console.log('getTaskById', response.data.tasks[0])
      thunkAPI.dispatch(setTaskDetailLoader(false));
      return response.data.tasks[0];
    } catch (e) {
      console.log("error", e);
      thunkAPI.dispatch(setTaskDetailLoader(false));
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async (payload, thunkAPI) => {
    let { data, field } = payload;
    var data_var;
    try {
      // var temp = payload;
      const userid = thunkAPI.getState().auth.user_id;
      var assignees = data.assignee;
      let temp = {
        ...data,
        assignee: assignees,
        updated_by: userid,
        updated_on: new Date(),
      };
      if (aliasUser) {
        temp.alias_user = parseInt(aliasUser);
      }

      const response = await client.query({
        query: updateTaskMutation,
        variables: {
          object: temp,
        },
      });

      if (response.data.insert_tasks) {
        data_var = {
          status: true,
          message: `${field} Updated Successfully`,
        };
        thunkAPI.dispatch(setTaskLoger(true));
        toast.success(data_var.message);
      } else {
        data_var = {
          status: true,
          message: "Something Went Wrong",
        };
        toast.error(data_var.message);
      }
      return data_var;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const draftTaskUpdate = createAsyncThunk(
  "tasks/updateDraftTask",
  async (payload, thunkAPI) => {
    let data = payload;
    var data_var;
    try {
      // var temp = payload;
      const userid = thunkAPI.getState().auth.user_id;
      var assignees = data.assignee;
      let temp = {
        ...data,
        assignee: assignees,
        updated_by: userid,
        updated_on: new Date(),
      };
      if (aliasUser) {
        temp.alias_user = parseInt(aliasUser);
      }

      const response = await client.query({
        query: updateTaskMutation,
        variables: {
          object: temp,
        },
      });

      if (response.data.insert_tasks) {
        data_var = {
          status: true,
          message: `Updated Successfully`,
        };
        toast.success(data_var.message);
      } else {
        data_var = {
          status: true,
          message: "Something Went Wrong",
        };
        toast.error(data_var.message);
      }
      return data_var;
    } catch (e) {
      console.log("error", e);
    }
  }
);




export const updateRecurringTask = createAsyncThunk(
  "tasks/updateRecurring",
  async (payload, thunkAPI) => {
    var data;
    try {
      // var temp = payload;
      const userid = thunkAPI.getState().auth.user_id;
      var assignees = payload.assignee;

      let temp = {
        ...payload,
        assignee: assignees,
        rule_set: `{${payload.rule_set?.join(",")}}`,
        updated_by: userid,
        updated_on: new Date(),
      };

      if (aliasUser) {
        temp.alias_user = parseInt(aliasUser);
      }

      const response = await client.query({
        query: updateRecurringTaskMutation,
        variables: {
          object: temp,
        },
      });

      if (response.data.insert_task_template) {
        data = {
          status: true,
          message: "Task Updated Successfully",
        };
        toast.success(data.message);
      } else {
        data = {
          status: false,
          message: "Something Went Wrong*",
        };
        toast.error(data.message);
      }
      return data;
    } catch (e) {
      console.log("error", e);
      data = {
        status: false,
        message: "Something Went Wrong**",
      };
      toast.error(data.message);
    }
  }
);

export const getSubtasks = createAsyncThunk(
  "tasks/subtasks",
  async (payload) => {
    // console.log("getTaskById...................", payload)
    try {
      const response = await client.query({
        query: getSubtasksList,
        variables: {
          parent: payload,
        },
      });
      return response.data.tasks;
    } catch (e) {
      console.log("error", e);
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async (payload, thunkAPI) => {
    let individual_task = payload.create_individualTask;
    let payload_data = payload;

    if (payload_data.assignee.length > 1) {
      payload_data.assignee_type = "group";
    } else {
      payload_data.assignee_type = "individual";
    }
    if (aliasUser) {
      payload_data.alias_user = parseInt(aliasUser);
    }

    let data = {};

    try {
      if (!individual_task) {
        // let data = payload
        // data.assignee = payload.assignee
        try {
          const response = await client.mutate({
            mutation: createTaskMutation,
            variables: {
              object: payload_data,
            },
          });

          data = {
            status: true,
            message: "created Task Successfully",
          };
          console.log("new taask response",response)
          // if(response.data.insert_tasks_one?.id){
          //   const socketResponse = await client.mutate({
          //     mutation: taskUpdateSocketMutation,
          //     variables: {
          //       object: {
          //         "taskid": response?.data?.insert_tasks_one?.id,
          //         "type": "CREATE"
          //       },
          //     },
          //   });
          //   console.log("socketResponse",socketResponse)
          // }
          
          toast.success(data.message);
          thunkAPI.dispatch(setButtonLoading(false));
          thunkAPI.dispatch(setTaskAddform(false));
        } catch (e) {
          console.log("error", e);
          data = {
            status: false,
            message: e.message,
          };

          thunkAPI.dispatch(setButtonLoading(false));
        }
        return data;
      } else {
        let payload_array = [];
        payload_data.assignee?.map((item_id) => {
          payload_array.push({ ...payload_data, assignee: [item_id] });
        });

        try {
          const response = client.mutate({
            mutation: createTaskMutation_individual,
            variables: {
              objects: payload_array,
            },
          });

          data = {
            status: true,
            message: "created Task Successfully",
          };

          toast.success(data.message);
          thunkAPI.dispatch(setButtonLoading(false));
          thunkAPI.dispatch(setTaskAddform(false));
        } catch (e) {
          console.log("error", e);
          data = {
            status: false,
            message: e.message,
          };

          thunkAPI.dispatch(setButtonLoading(false));
        }
        return data;
      }
    } catch (error) {
      console.log("error", error);
    }
  }
);

export const getAll_tasks = createAsyncThunk(
  "tasks/getall",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(setLoader(true));

    try {
      const response = await client.query({
        query: getTasks,
        variables: payload,
      });
      thunkAPI.dispatch(setLoader(false));
      console.log("tasks", response.data?.tasks);
      return response.data ? response.data.tasks : [];
    } catch (e) {
      console.log("error", e);
      thunkAPI.dispatch(setLoader(false));
    }
  }
);

export const getDraftTasks = createAsyncThunk(
  "tasks/draft",
  async (payload, thunkAPI) => {
     console.log("payload--", payload);
    thunkAPI.dispatch(setLoader(true));
    let finalBody;
    if( payload.type == "All" ){
      finalBody = {
        name: payload.name,
        task_type:
          payload.type ==  ["Draft", "Schedule"]
    
      }
    }else {
      finalBody = {
        name: payload.name,
        task_type: payload.type,
         userid :payload.userid
    
      }
    }
    try {
      const response = await client.query({
        query: getDraftTaskFilterQuery,
        variables: finalBody,
      });
      thunkAPI.dispatch(setLoader(false));
      // console.log(response.data.tasks)
      return response.data.tasks;
    } catch (e) {
      console.log("error", e);
      thunkAPI.dispatch(setLoader(false));
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (payload, thunkAPI) => {
    let data = {};
    const userid = thunkAPI.getState().auth.user_id;
    var assignees = payload.assignee;
    let temp = {
      ...payload,
      assignee: assignees,
      is_delete: true,
      deleted_by: userid,
      deleted_on: new Date(),
    };
    if (aliasUser) {
      temp.alias_user = parseInt(aliasUser);
    }
    try {
      const response = await client.query({
        query: updateTaskMutation,
        variables: {
          object: temp,
        },
      });
      data = {
        status: true,
        message: "Task Deleted Sucessfully",
      };
      toast.success(data.message);
      thunkAPI.dispatch(setButtonLoading(false));
      //console.log('response+++++++', data)
    } catch (e) {
      //console.log('error', e)
      data = {
        status: true,
        message: e.message,
      };
      toast.error(data.message);
      thunkAPI.dispatch(setButtonLoading(false));
    }
  }
);

export const deleteRecurringTask = createAsyncThunk(
  "tasks/deleteRecurring",
  async (payload, thunkAPI) => {
    let data = {};
    const userid = thunkAPI.getState().auth.user_id;
    let temp = {
      ...payload,
      assignee: payload.assignee,
      rule_set: `{${payload.rule_set.join(",")}}`,
      is_delete: true,
      deleted_by: userid,
      deleted_on: new Date(),
    };
    if (aliasUser) {
      temp.alias_user = parseInt(aliasUser);
    }
    try {
      const response = await client.query({
        query: updateRecurringTaskMutation,
        variables: {
          object: temp,
        },
      });
      data = {
        status: true,
        message: "Task Deleted Sucessfully",
      };
      toast.success(data.message);
      thunkAPI.dispatch(setButtonLoading(false));
      //console.log('response+++++++', data)
      return data;
    } catch (e) {
      console.log("error", e);
      data = {
        status: false,
        message: e.message,
      };
      toast.error(data.message);
      thunkAPI.dispatch(setButtonLoading(false));
      return data;
    }
  }
);

export const get_Recursivetasks = createAsyncThunk(
  "tasks/getRecursiveTasks",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(setLoader(true));
    try {
      const response = await client.query({
        query: getRecurring_Tasks,
        variables: { name: payload },
      });
      thunkAPI.dispatch(setLoader(false));
      return response.data.task_template;
    } catch (e) {
      console.log("error", e);
      thunkAPI.dispatch(setLoader(false));
    }
  }
);

export const createReccurssiveTask = createAsyncThunk(
  "templates/create",
  async (payload, thunkAPI) => {
    if (aliasUser) {
      payload.alias_user = parseInt(aliasUser);
    }

    let data = {};
    try {
      const response = await client.mutate({
        mutation: createReccurssiveTaskMutation,
        variables: {
          object: payload,
        },
      });
      data = {
        status: true,
        message: "Reccurssive task Added Sucessfully",
      };
      //console.log('response+++++++11', data)
      toast.success(data.message);
      thunkAPI.dispatch(setShowTemplateForm(false));
      thunkAPI.dispatch(setButtonLoading(false));
    } catch (e) {
      console.log("error", e);
      data = {
        status: false,
        message: e.message,
      };
      //console.log('response+++++++', data)
      toast.error(data.message);
      // thunkAPI.dispatch(setReccurssiveTaskButtonLoading(false))
    }
    return data;
  }
);

export const getTasksLogs = createAsyncThunk(
  "tasks/getTaskLogs",
  async (payload, thunkAPI) => {
    try {
      const response = await client.query({
        query: getTaskLogs,
        variables: { task_id: payload },
      });
      return response.data.task_logs;
    } catch (e) {
      console.log("error", e);
    }
  }
);

//get team isd

export const getAllTeamIds = createAsyncThunk(
  "users/getAllTeamIds",
  async (payload, thunkAPI) => {
    let data = {};
    try {
      const response = await client.mutate({
        mutation: getAllTeamIdsMutation,
        variables: { object: payload },
      });
      return response;
    } catch (e) {
      console.log("error", e);
      data = { status: true, message: e.message };
    }
    return data;
  }
);

export const getFilterTasks = createAsyncThunk(
  "tasks/getFilterTasks",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(setLoader(true));
    try {
      const response = await client.mutate({
        mutation: getTaskFilterMutation,
        variables: {
          object: payload,
        },
      });

      return response.data.taskFilter.data;
    } catch (e) {
      console.log("error", e);
    } finally {
      thunkAPI.dispatch(setLoader(false));
    }
  }
);
//filters query for taskApproval
export const taskApprovalFilterQuery = createAsyncThunk(
  "approvals/taskApproval",
  async (payload, thunkAPI, state) => {
    try {
      const response = await client.query({
        query: taskApprovalListQuery,
        variables: {
          object: payload,
        },
      });
      return response?.data?.myApprovedList?.message;
    } catch (error) {
      // console.log("error", error);
      return error;
    }
  }
);
//filters query for taskreject
export const taskRejectFilterQuery = createAsyncThunk(
  "approvals/taskreject",
  async (payload, thunkAPI, state) => {
    try {
      const response = await client.query({
        query: taskRejectListQuery,
        variables: {
          object: payload,
        },
      });
      return response?.data?.myRejectedList?.message;
    } catch (error) {
      console.log("error", error);
      return error;
    }
  }
);

//get task list with closed task also

export const getAll_tasksWithClosedTask = createAsyncThunk(
  "tasks/getallWithClosedTask",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(setLoader(true));
    try {
      const response = await client.query({
        query: getTasks_WithClosedData,
        variables: payload,
      });
      thunkAPI.dispatch(setLoader(false));
      return response.data.tasks;
    } catch (e) {
      console.log("error", e);
      thunkAPI.dispatch(setLoader(false));
    }
  }
);

export const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    showTask: false,
    showTemplateForm: false,
    buttonLoading: false,
    taskResponse: {},
    taskDetails: {},
    subTasksList: [],
    recursiveTaskList: {},
    tasks: [],
    draftTasks: {},
    deleteTaskResponse:"",
    draftTaskDetails: undefined,
    recurringTaskDetails: undefined,
    taskLogs: [],
    loader: false,
    teamIds: [],
    getFilterTasks: [],
    switchToCreate: false,
    updateReccuring: false,
    tasksperUser: {},
    transferTask: null,
    myApprovalTasks: [],
    taskToAccept: false,
    taskApprovalList: [],
    taskRejectList: [],
    TaskLoger: false,
    taskDetailLoader: false,
    reportFilters: [],
    taskCreated: "",
  },
  extraReducers: {
    [createTask.fulfilled]: (state, action) => {
      state.taskResponse = action.payload;
      state.taskCreated = Math.ceil(Math.random() * 100000000);
      return state;
    },

    [getSubtasks.fulfilled]: (state, action) => {
      state.subTasksList = action.payload;
      return state;
    },

        [getAll_tasks.fulfilled]: (state, action) => {
            state.tasks = action.payload;
            return state;
        },
        [getDraftTasks.fulfilled]: (state, action) => {
            state.draftTasks = action.payload;
            state.drafttaskpaylod = action;
            return state;
        },
        [deleteTask.fulfilled]: (state, action) => {
            state.deleteTaskResponse = Math.ceil(Math.random() * 100000000);
            return state;
        },
        [get_Recursivetasks.fulfilled]: (state, action) => {
            state.recursiveTaskList = action.payload;
            return state;
        },
        [createReccurssiveTask.fulfilled]: (state, action) => {
            state.taskResponse = action.payload;
            return state;
        },
        [getTasksLogs.fulfilled]: (state, action) => {
            // console.log("Reducer----logs",action.payload)
            state.taskLogs = action.payload;
            return state;
        },
        [getAllTeamIds.fulfilled]: (state, action) => {
            state.teamIds = action?.payload?.data?.getTeamTasks?.data;
            return state;
        },
        [getFilterTasks.fulfilled]: (state, action) => {
            state.tasks = action.payload;
            return state;
        },
        [getAcceptTasks.fulfilled]: (state, action) => {
            // console.log("AcceptTasks", action.payload.data.tasks)
            state.tasks = action.payload.data.tasks;
            return state;
        },
        [getAlltasks_perUser.fulfilled]: (state, action) => {
            state.tasksperUser = action.payload;
            return state;
        },
        [taksTransfer.fulfilled]: (state, action) => {
            console.log("sucessssTransfer", action)
            state.trasferTask = action.payload;
            return state
        },
        [myApprovals.fulfilled]: (state, action) => {
            state.myApprovalTasks = action.payload;
            return state;
        },
        [taskApprovalFilterQuery.fulfilled]: (state, action) => {
            state.myApprovalTasks = action.payload;
            return state;
        },
        [taskRejectFilterQuery.fulfilled]: (state, action) => {
            state.myApprovalTasks = action.payload;
            return state;
        },
        [getAll_tasksWithClosedTask.fulfilled]: (state, action) => {
            state.tasks = action.payload;
            return state;
        },
        [getReportFilter.fulfilled]: (state, action) => {
            state.reportFilters = action.payload;
            return state;
        }
    },
    reducers: {
        setUpdateReccuring: (state, action) => {
            state.updateReccuring = action.payload
            return state

        },
        setSwitchToCreate: (state, action) => {
            state.switchToCreate = action.payload
            return state
        },
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
        setShowTemplateForm: (state, action) => {
            state.showTemplateForm = action.payload
        },
        setDraftDetails: (state, action) => {
            state.draftTaskDetails = action.payload
        },
        setRecurringTaskDetails: (state, action) => {
            state.recurringTaskDetails = action.payload
        },
        setLoader: (state, action) => {
            state.loader = action.payload
            return state;
        },
        setTaskTransferList: (state, action) => {
            state.tasksperUser = action.payload;
            return state
        },
        setAccept_Task:(state,action)=>{
            state.taskToAccept=action.payload
            return state
        },
        setTaskLoger:(state,action)=>{
            state.TaskLoger=action.payload
            return state
        },
        setTaskDetailLoader: (state, action) => {
            state.taskDetailLoader = action.payload
            return state;
        },
        setReportData: (state, action) => {
            state.reportFilters = action.payload
            return state;
        }
       
    }
}
)

export const { setTaskAddform,setSwitchToCreate,setUpdateReccuring, setTemplateAddform, setButtonLoading, setShowTemplateForm, setLoader, setDraftDetails, setRecurringTaskDetails,setTaskTransferList,setAccept_Task,setTaskLoger,setTaskDetailLoader,setReportData} = taskSlice.actions

export default taskSlice.reducer;
