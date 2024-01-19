import Container from "react-bootstrap/Container";
import "bootstrap/dist/css/bootstrap.css";
import DatePicker from "react-datepicker";
import { BsFlagFill } from "react-icons/bs";
import {Card,Row,Col,Button,Form,Badge,Spinner,OverlayTrigger,Tooltip} from "react-bootstrap";
// import Multiselect from "multiselect-react-dropdown-colors";
import Multiselect from "multiselect-react-dropdown-disabled";
import StatusBadge from "../components/StatusBadge";
import { MdDateRange } from "react-icons/md";
import { BiLinkExternal, BiTrashAlt } from "react-icons/bi";
import { useRef } from "react";
import LoaderComponent from "../components/Loader";
import { modules } from "../environment";
import {FaEdit,FaPlus,FaSortUp,FaMinus,FaSortDown,FaTrashAlt,FaFile,FaRegEye,} from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { TiTick } from "react-icons/ti";
import { GoIssueOpened } from "react-icons/go";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Avatar from "../components/Avatar";
import { useDispatch, useSelector } from "react-redux";
import {getTaskById,getAll_tasks,} from "../redux/reducers/taskReducer";
import { useState } from "react";
import {createChecklist,getChecklist,updateChecklist,deleteChecklist,} from "../redux/reducers/checklistReducer";
import {createComment,getComments,deleteComment,} from "../redux/reducers/commentsReducer";
import { getUsers, getExceptUsers } from "../redux/reducers/userReducer";
import {updateTask,getSubtasks,createTask,deleteTask,getTasksLogs,Accept_Task,setTaskLoger,updatePermissionCheck} from "../redux/reducers/taskReducer";
import { attachmentUpload } from "../redux/reducers/attachmentsReducer";
import moment from "moment";
import {getAttachment,downloadAttachment,deleteAttachment,} from "../redux/reducers/attachmentsReducer";
import ReactQuill from "react-quill";
import { getpriorityConfig,getPriorityConfigList } from '../redux/reducers/priorityConfigReducer';
import { getStatusConfig, getAllTaksStatus } from "../redux/reducers/statusConfigReducer";
import {getApprovalsData,approveTaskMethod,getApprovalUserExist,updateTaskApprovalMethod,reqUsersToApproval,getApproversList,} from "../redux/reducers/approvalsReducer";
import StatusConfig from "./StatusConfig";
import captialLetter from "../modules/CaptialLetter";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import { Prev } from "react-bootstrap/esm/PageItem";
import { getPermissionsByRole, getTaskPermisionByRole } from "../redux/reducers/rolesReducer";
import { toast } from "react-toastify";

function TaskDetails() {
  const taskId = useParams("id");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputElement = useRef(null);
  const subTasks = useSelector((state) => state.tasks.subTasksList);
  const checklists = useSelector((state) => state.checklist.checklistList);
  const commentsList = useSelector((state) => state.comments.commentsList);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const loader = useSelector((state) => state.tasks.taskDetailLoader);
  const getParentPriority_data=useSelector((state)=>state.priority.priorityParentList);
  const priorityChildConfig_List=useSelector((state)=>state.priority.priorityChildList);
  const [modifiedChildPriorities, setModifiedChildPriorities] = useState();
  const [childPriorities, setChildPriorities] = useState();
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [parentPriority, setParentPriority] = useState();
  const [DeafultPriority,setDeafultPriority]=useState()
  const [defaultStatus,setDeafultStatus]=useState()
  const currentOrganization = useSelector(
    (state) => state.auth.current_organization
  );
  const [showDesc, setShowDesc] = useState(true);
  const [showAddSubTask, setShowAddSubTask] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [showLogs, setShowLogs] = useState(true);
  const [taskDetails, setTaskDetails] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const usersList = useSelector((state) => state.users.usersList);
  const exceptedUsers = useSelector((state) => state.users.exceptedUsers);
  const [parentStatus, setParentStatus] = useState();
  const [searchUser, setSearchUser] = useState("");
  const [modifiedChildStatus, setModifiedChildStatus] = useState();
  const [updateAssign, setUpdateAssign] = useState(false);
  const orgId = useSelector((state) => state.auth.current_organization);
  const [approvalError, setMessageApprovalError]=useState(false)
  const [checklistObj, setChecklistObj] = useState({
    is_done: false,
    title: "",
    task_id: parseInt(taskId.id),
    user_id: userDetails.id,
    created_by: userDetails.id,
  });
  const [prevDescription, setPrevDescription] = useState();
  const [commentObj, setCommentObj] = useState({
    comment: "",
    task_id: parseInt(taskId.id),
    user_id: userDetails.id,
    created_by: userDetails.id,
    type:"general"
  });
  const user_Id=userDetails.id
  const [showAddChecklist, setAddChecklist] = useState(false);
  const [showUpdateAssignees, setUpdateAssignees] = useState(false);
  const [taskAssignees, setTaskAssignees] = useState([]);
  const [force_closers, setforce_closers] = useState([]);
  const [tempTaskDetails, setTempTaskDetails] = useState({});
  const [showTitleEdit, setTitleEdit] = useState(false);
  const [showDescEdit, setDescEdit] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedSubPriority,setSelectedSubPirority]=useState([]);
  const getPriorityList = useSelector(
    (state) => state.priority.priorityConfigList
  );
  let priorityChildConfigList = useSelector(
    (state) => state.priority.priorityChildConfigList
  );
  let originalPriorityConfig = useSelector(
    (state) => state.priority.originalPriorityConfig
  );
  if (originalPriorityConfig?.length > 0) priorityChildConfigList = originalPriorityConfig;
  const statusConfigList = useSelector(
    (state) => state.status.statusConfigList
  );
  const statusList = useSelector(
    (state) => state.status.tasksStatus
  );
  let statusChildConfigList = useSelector(
    (state) => state.status.statusChildConfigList
  );
  let originalStatusConfig = useSelector(
    (state) => state.status.originalStatusConfig
  );
  if (originalStatusConfig?.length > 0) statusChildConfigList = originalStatusConfig;

  let getParentPrioritydata = getParentPriority_data?.filter((item, index) => { return item.parent_id == null })
  let getParentPriorityFiltereddata = getParentPrioritydata?.sort((a, b) => { return a.id - b.id });
  let getParentStatus = statusList?.parents;
  let statusChildList = statusList?.org_childs?.length ? statusList?.org_childs : statusList?.base_childs;
  let getParentStatusdata = getParentStatus?.filter((item, index) => { return item.parent_id == null });
  let getParentStatusFiltereddata = getParentStatusdata?.sort((a, b) => { return a.id - b.id });

  const [subtaskObj, setSubtaskObj] = useState({
    name: "",
    description: "",
    assignee_type: "",
    start_date: new Date(),
    due_date: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)).toISOString(),
    status: defaultStatus,
    priority:DeafultPriority,
    task_type: "Live",
    is_active: true,
    create_individualTask: false,
    assignee: "",
    parent: parseInt(taskId.id),
    org_id: currentOrganization,
    createdby: userDetails.id,
    remainder_interval: 1800000,
    next_notification: "2022-10-28T11:59:17.546Z",
  });
  const getPriorityD = () => {
    let priorityCheck;
        if(subtaskObj.priority){
            priorityCheck=subtaskObj.priority
        }
        if(!subtaskObj.priority){
            priorityCheck=DeafultPriority
        }
    let priority = priorityChildConfig_List?.find((priority) => priority.name === priorityCheck);
    let parent;
    if (priority.parent_id != null) {
        parent = getParentPriority_data?.find((item) => item.id === priority.parent_id)
        parent = parent.name
    }
    else {
        parent = subtaskObj.priority
    }
    return parent
}

// check status with parent name if matches send name else send parent name
const getStatusD = () => {
  let statusCheck;
  if(subtaskObj.status){
    statusCheck=subtaskObj.status
  }
  if(!subtaskObj.status){
    statusCheck=defaultStatus
  }
    let status = statusChildList?.find((status) => status.name ===statusCheck);
    let parent;
    if (status.parent_id != null) {
        parent = getParentStatus?.find((item) => item.id === status.parent_id)
        parent = parent.name
    }
    else {
        parent = subtaskObj.status
    }
    return parent
}
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ChecklistTitleEdit, setChecklistTitleEdit] = useState(false);
  const [ChecklistTitle, setCheckListTitle] = useState("");
  const [checklistItem, setChecklistItem] = useState({});

  const [file, setFile] = useState();
  const [showAttachment, setShowAttchment] = useState(false);
  const [attachmentLoading, setAttchmentLoading] = useState(false);
  const attachmentsList = useSelector(
    (state) => state.attachments.attachmentList
  );
  const taskLogs = useSelector((state) => state.tasks.taskLogs);

  // Approvals DATA
  const approvals = useSelector((state) => state.approval.approvals);
  const approvalUserExits = useSelector(
    (state) => state.approval.approvalUserTemplate
  );
  const usersToApprove = useSelector((state) => state.approval.usersToApprove);
  const approvedList = useSelector((state) => state.approval.approvedList);
  const approved = useSelector((state) => state.approval.approvedTask);
  const approvalMethodAdded = useSelector(
    (state) => state.approval.approvalMethodAdded
  );
  const [message, setMessage] = useState("");
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [statusInreview, setStatusInreview] = useState();
  const [approvingUsersData, setApprovingUsersData] = useState([]);
  const [approvedOrRejected, setApprovedOrRejected] = useState();
  const [pending, setPending] = useState(false);
  const [handleChildColor,setHandleChildColor]=useState(true);
  const [statusHandleColor,setStatusHandleColor]=useState(true)
  const [reomoveAssigne, setRemoveAssigne] = useState(false);
  const [removeforceApproval, setremoveforceApproval] = useState(false);
  const [selfApproveError,setSelfApproveError]=useState(false)
  const [forceApprove, setForceApprove] = useState(false);
  const TaskLoger = useSelector((state) => state.tasks.TaskLoger);
  const userOrgList = useSelector((state) => state.auth.userOrgDetails);
  const [taskClosed,setTaskClosed]=useState(false)
  const [approveLoader,setApproveLoader]=useState(false)
  const [rejectLoader,setRejectLoader]=useState(false)
  const [forcecloseLoader,setForceCloseLoader]=useState(false);
  const [priorityColor,setPriorityColor]=useState();
  const [endDateError,setEndDateError]=useState(false)
  const[startDateError,setStartDateError]=useState(false);
  const [subTaskStatus,setSubTaskStatus]=useState([]);
  const [taskUpdatePermission,setTaskUpdatePermission]=useState([]);
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const orgListData = useSelector(
    (state) => state.organization.organizationsList
  );
  const [filterSearch, setFilter] = useState({
    name: "",
    status: "",
    priority: "",
    assignee: [userDetails.id],
    created_by: userDetails.id,
  });
  
  useEffect(()=>{
    dispatch(getPriorityConfigList(orgId))
    dispatch(getTaskPermisionByRole(userOrgList[0].role_id)).then((taskres)=>{
      setTaskUpdatePermission(JSON.parse(taskres.payload.data.task_permissions[0]?.update_access))
    })
},[])
    
useEffect(()=>{
  let DefaultPriorityresponse = priorityChildConfig_List?.filter((item, index) => { return item?.parent_id == getParentPriorityFiltereddata[0]?.id});
  if(DefaultPriorityresponse&&DefaultPriorityresponse.length>0){
  setDeafultPriority(DefaultPriorityresponse&&DefaultPriorityresponse[0]?.name)
  }
},[getParentPriorityFiltereddata]) 

useEffect(() => {
    if (childPriorities?.length > 0 && parentPriority?.length > 0) {
      // Function to find the parent name based on parent_id
      function findParentName(parentId) {
        const parent = parentPriority?.find(
          (parent) => parent?.value == parentId
        );
        return parent ? parent.label : null;
      }
  
      // Modify the childs array by adding the "parent" key-value pair
      const modifiedChilds = childPriorities?.map((child) => ({
        ...child,
        parent: findParentName(child?.parent_id),
      }));
      modifiedChilds?.sort((a, b) => {
        return a.parent_id - b.parent_id;
      });
      modifiedChilds.forEach(
        (item) =>
          (item.name = item.name?.charAt(0).toUpperCase() + item.name?.slice(1))
      );
      setModifiedChildPriorities(modifiedChilds);
      setSelectedSubPirority([modifiedChilds[modifiedChilds.length-1]])
      let data=modifiedChilds.filter(item=>item.name.toLowerCase()==taskDetails.internal_priority.toLowerCase());
      setSelectedPriorities(data);
      setTaskDetails((Prev)=>({...Prev,internal_priority:data[0]?.name.toLowerCase()}))

    }
}, [childPriorities, parentPriority]);

useEffect(() => {
  if (statusChildList?.length > 0 && parentStatus?.length > 0) {
    // Function to find the parent name based on parent_id
    function findParentName(parentId) {
      const parent = parentStatus?.find(
        (parent) => parent?.value == parentId
      );
      return parent ? parent.label : null;
    }

    // Modify the childs array by adding the "parent" key-value pair
    const modifiedChilds = statusChildList?.map((child) => ({
      ...child,
      parent: findParentName(child?.parent_id),
    }));
    modifiedChilds?.sort((a, b) => {
      return a.parent_id - b.parent_id;
    });
    modifiedChilds.forEach(
      (item) =>
        (item.name = item.name?.charAt(0).toUpperCase() + item.name?.slice(1))
    );
    let apply_disable=modifiedChilds.map(item=>{
      if(item.name.toLowerCase()=="completed"){
        return {...item,disable:true}
      }
      else{
        return {...item}
      }
    });
    setModifiedChildStatus(apply_disable);
    setSubTaskStatus([modifiedChilds[0]])
    let data=modifiedChilds.filter(item=>item.name.toLowerCase()==taskDetails.internal_status.toLowerCase());
    setSelectedStatuses(data);
    setTaskDetails((Prev)=>({...Prev,internal_status:data[0]?.name.toLowerCase()}))
  }
}, [statusChildList, parentStatus]);


const multiSelectPriorityData=()=>{
  dispatch(getAllTaksStatus(orgId)).then((resp) => {
    let status = [];
    resp.payload?.parents?.map((item) => {
      status.push({
        label: `${
          item?.name?.charAt(0).toUpperCase() + item?.name?.slice(1)
        }`,
        value: item.id,
      });
    });
    setParentStatus(status);
  });
  dispatch(getPriorityConfigList(orgId)).then((resp) => {
    let childPriority = resp.payload?.org_childs?.length
      ? resp.payload?.org_childs
      : resp.payload?.base_childs;
    setChildPriorities(childPriority);
    let priority = [];
    resp.payload?.parents?.map((item) => {
      priority.push({
        label: `${
          item?.name?.charAt(0).toUpperCase() + item?.name?.slice(1)
        }`,
        value: item.id,
      });
    });
    setParentPriority(priority);
  });
}

useEffect(()=>{
  let DefaultPriorityresponse = statusChildList?.filter((item, index) => { return item?.parent_id == getParentStatusFiltereddata[0]?.id});
  if(DefaultPriorityresponse&&DefaultPriorityresponse.length>0){
    setDeafultStatus(DefaultPriorityresponse&&DefaultPriorityresponse[0]?.name)
  }
},[getParentStatusFiltereddata])

  useEffect(() => {
    let filteredData = approvals?.filter((obj, index, arr) => {
      return arr.findIndex((item) => item.scenario === obj.scenario) === index;
    });
    setFilteredApprovals(filteredData);
  }, [approvals]);

  useEffect(() => {
    if (TaskLoger) {
      dispatch(getTasksLogs(parseInt(taskId.id))).then((res) => {
        dispatch(setTaskLoger(false));
      });
    }
  }, [TaskLoger]);

  // useEffect(() => {
  //   let payLoad2 = {
  //     task_id: taskDetails.id,
  //     user_id: userDetails.id
  //   }
  //
  //   dispatch(getApprovalUserExist(payLoad2));
  //   statusCheck();
  // }, [taskDetails])

  // useEffect(() => {
  //   let statusObj = statusConfigList.find((item) => item.name === 'in-review');
  //
  //   let payLoad3 = {
  //     task_id:taskDetails.id,
  //     approval_template_master_id: taskDetails?.approval_template,
  //     status: "in-review"
  //   }
  //
  //   // dispatch(updateTaskApprovalMethod(payLoad3));
  // }, [taskDetails.approval_template])

  const approveTask = (type) => {
    if(!message&&type=="Approve"||message?.length<5&&type=="Approve"){
      setMessageApprovalError(true)
      return
    }
    let payLoad = {
      approve_type: "approve",
      approved_by: userDetails.id,
      comment: message,
      task_id: parseInt(taskId.id),
    };
    let approve_obj={
      comment: message,
      task_id: parseInt(taskId.id),
      user_id:userDetails.id,
      created_by: userDetails.id,
      type:"Approved"
    }
    setApproveLoader(true)
    dispatch(approveTaskMethod(payLoad)).then((res)=>{
      if(type !== "ForceClose" &&type !== "self") {
        dispatch(createComment({commentData:approve_obj,field:""})).then((res) => {
          if (res.payload.status) {
            setCommentObj({ ...commentObj, comment: "" });
            dispatch(getComments(parseInt(taskId.id)));
            setMessage()
            setApproveLoader(false)
          }
        });
      }
      setSelfApproveError(false)
    });
  };

  const rejectTask = (type) => {
    if(!message&&type=="Reject"||!message?.length>5&&type=="Reject"){
      setMessageApprovalError(true)
      return
    }
    let payLoad = {
      approve_type: "reject",
      approved_by: userDetails.id,
      comment: message,
      task_id: parseInt(taskId.id),
    };
    let approve_obj={
      comment: message,
      task_id: parseInt(taskId.id),
      user_id:userDetails.id,
      created_by: userDetails.id,
      type:"Rejected"
    }
    setRejectLoader(true)
    dispatch(approveTaskMethod(payLoad)).then((res)=>{
      if(type=="Reject") {
        dispatch(createComment({commentData:approve_obj,field:""})).then((res) => {
          if (res.payload.status) {
            setCommentObj({ ...commentObj, comment: "" });
            dispatch(getComments(parseInt(taskId.id)));
            setMessage()
            setRejectLoader(false)
          }
        });
      }
      setSelfApproveError(false)
      setRejectLoader(false)
    });
  };

  const forceApproveTask = () => {
    let payLoad = {
      approve_type: "force",
      approved_by: userDetails.id,
      comment: message,
      task_id: parseInt(taskId.id),
    };
    setForceCloseLoader(true)
    dispatch(approveTaskMethod(payLoad)).then((res)=>{
      setForceCloseLoader(false)
    });
  };

  useEffect(() => {
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
    dispatch(getTaskById(taskId))
      .then((response) => {
        dispatch(getChecklist(parseInt(taskId?.id)));
        dispatch(getComments(parseInt(taskId?.id)));
        dispatch(getSubtasks(parseInt(taskId?.id)));
        multiSelectPriorityData()
        setTimeout(()=>{
          dispatch(getTasksLogs(parseInt(taskId?.id)));
        },2000)
        dispatch(getUsers(""));
        setTempTaskDetails(response?.payload);
        setTaskDetails(response?.payload);
        setStartDate(new Date(response?.payload?.start_date));
        setTitle(response?.payload?.name);
        setDescription(
          response?.payload?.description?.length > 0
            ? response?.payload?.description
            : "No Description Found"
        );
        setPrevDescription(
          response?.payload?.description?.length > 0
            ? response?.payload?.description
            : "No Description Found"
        );
        setDueDate(new Date(response?.payload?.due_date));
        setTaskAssignees(response?.payload?.assignee);
        setforce_closers(response?.payload?.force_closers);
        fetchExceptUsers();
        dispatch(getAttachment(taskId?.id));
        dispatch(getpriorityConfig());
        dispatch(getStatusConfig());
        dispatch(getAllTaksStatus(currentOrganization));
        // statusCheck();
        let payLoad2 = {
          task_id: parseInt(taskId?.id),
          user_id: userDetails?.id,
        };
        dispatch(getApprovalUserExist(payLoad2));
      })
      .then(() => {
        reqUsersApproval();
        approvedUsers();
      });

    if (showDescEdit) {
      inputElement.current.focus(); //Auto focuses the description
    }
    dispatch(getApprovalsData({name:""}));
  }, [taskId, showDescEdit, approved, approvalMethodAdded]);

  //When we have status and need to modify internal status
  // useEffect(() => {
  //    t getStatus = (taskDetails) => {
  //     let statusObj =
  //       Array.isArray(statusConfigList) &&
  //       statusConfigList?.find(
  //         (statuslist) => statuslist?.name === taskDetails?.status
  //       );
  //     let parent;
  //     if (statusObj && statusObj?.parent_id == null) {
  //       parent =
  //         Array.isArray(statusConfigList) &&
  //         statusConfigList?.find((item) => item?.parent_id === statusObj?.id);
  //       parent = parent?.name;
  //     } else {
  //       parent = "closed";
  //     }
  //     return parent;
  //   };
  //   // taskDetails.internal_status = data?.data?.internal_status;
  //   taskDetails.internal_status = getStatus(taskDetails);
  //   statusCheck();
  //   // data.data.status=getStatus(data);
  // }, [taskDetails?.status]);

  useEffect(() => {
    statusCheck();
    reqUsersApproval();
    approvedUsers();
    if (taskDetails?.pending_for_acceptance?.includes(userDetails.id)) {
      setPending(true);
      // setTitleEdit(!showTitleEdit)
    }
    if(taskDetails?.status=="closed"){
      setTaskClosed(true)
    }
    if(taskDetails.status=="in-review"){
      setStatusInreview(true);
    }
   
  }, [taskDetails, userDetails]);

  const reqUsersApproval = () => {
    if (taskDetails?.approval_template_master_id > 0) {
      let payLoad4 = {
        masterId: taskDetails?.approval_template_master_id,
      };
      dispatch(reqUsersToApproval(payLoad4));
    }
  };

  const approvedUsers = () => {
    if (taskDetails?.approval_template_master_id > 0) {
      let payLoad5 = {
        // masterid: taskDetails?.approval_template_master_id,
        task_id: parseInt(taskId.id),
      };
      dispatch(getApproversList(payLoad5));
    }
  };

  useEffect(() => {
    if (usersToApprove?.length > 0 && taskDetails?.review_attempts) {
      let approvedStatusObj =
        approvedList &&
        approvedList[0]?.approvedListUser?.find(
          (value) => value?.current_user_id === userDetails.id
        );
        setApprovedOrRejected(approvedStatusObj)
    }
  }, [approvedList, taskDetails, usersToApprove]);

  useEffect(() => {
    if (usersToApprove?.length > 0 && taskDetails?.review_attempts) {
      let approvingUsers = [];
      usersToApprove.forEach((item, index) => {
        let approvedStatusObj =
          approvedList &&
          approvedList[0]?.approvedListUser?.find(
            (value) => value.action_type && value?.current_level === index + 1
          );
        if (approvedStatusObj && approvedStatusObj.current_user_id != null) {
          approvingUsers.push({
            ...item,
            user_id: approvedStatusObj.current_user_id,
            action_type: approvedStatusObj.action_type,
            approve_message: approvedStatusObj.comment,
          });
        } else {
          approvingUsers.push(item);
        }
      });
      setApprovingUsersData(approvingUsers);
    }
  }, [approvedList, taskDetails]);

  const statusCheck = () => {
    let statusObj =
      Array.isArray(statusConfigList) &&
      statusConfigList?.find((item) => item.name === taskDetails.status);
    if (statusObj?.name == "in-review") {
      setStatusInreview(true);
    } else {
      setStatusInreview(false);
    }
  };

  const acceptTaskHandle = () => {
    dispatch(
      Accept_Task({
        taskid: parseInt(taskDetails?.id),
        type: "accept",
        userid: parseInt(userDetails.id),
      })
    );
    dispatch(getAll_tasks(filterSearch)).then((res) => {
      navigate(`/taskslist`);
    });
  };
  const selectedApprovalMethod = (value) => {
    let payLoad3 = {
      task_id: taskDetails?.id,
      approval_template_master_id: value,
      status: "in-review",
    };
    let payload={ field: "approval",taskid: parseInt(taskDetails?.id)}
    dispatch(updatePermissionCheck(payload)).then((res)=>{
      if(res.payload.data.updateTask.status){
        dispatch(updateTaskApprovalMethod(payLoad3));
      }
      else{
        toast.error(res.payload.data.updateTask.message)
      }
    })
   
  };

const handleSubTaskStatus=(e)=>{
  setSubTaskStatus(e)
  setSubtaskObj({...subtaskObj,status:e[0]?.name.toLowerCase()})
}

const handleSubTaskPiority=(e)=>{
  setSelectedSubPirority(e)
  setSubtaskObj({...subtaskObj,priority:e[0]?.name.toLowerCase()})
}
  //To hit the API to maintain Review Attempts
  // useEffect(() => {
  //   if(taskDetails.approval_template_master_id && approvedList.length && taskDetails.status == 'in-review'){
  //     // selectedApprovalMethod(taskDetails.approval_template_master_id)
  //   }
  // }, [taskDetails.status])

  useEffect(() => {
    if (updateAssign) {
      let data = { data: taskDetails, field: "Assignee" };
      updateTaskDetails(data);
      setUpdateAssign(false);
    }
    if (reomoveAssigne) {
      let data = { data: taskDetails, field: "Assignee Removed" };
      updateTaskDetails(data);
      setRemoveAssigne(false);
    }
    if (forceApprove) {
      let data = { ...taskDetails, force_closers: force_closers };
      let updateClosure = { data: data, field: "Forced Approved" };
      updateTaskDetails(updateClosure);
      setForceApprove(false);
    }
  }, [taskDetails, force_closers]);


  const updateTaskDetails = (data) => {
    if (
      JSON.stringify(tempTaskDetails) !== JSON.stringify(data) &&
      data != undefined
    ) {
      data.internal_status = data.status;
      data.internal_priority = data.priority;

      const getPriority = (data) => {
        let priorityObj = priorityChildConfig_List?.find(
          (prioritylist) => prioritylist.name.toLowerCase() === data?.data?.internal_priority.toLowerCase()
        );
        let parent;
        if (priorityObj && priorityObj?.parent_id != null) {
          parent = getParentPriority_data?.find(
            (item) => item.id === priorityObj.parent_id
          );
          parent = parent.name;
        } else {
          parent = taskDetails.internal_priority;
        }
        return parent;
      };

      const getStatus = (data) => {
        let statusObj = statusChildList?.find(
          (statuslist) => statuslist.name.toLowerCase() === data?.data?.internal_status.toLowerCase()
        );
        let parent;
        if (statusObj && statusObj.parent_id != null) {
          parent = getParentStatus?.find(
            (item) => item.id === statusObj.parent_id
          );
          parent = parent.name;
        } else {
          parent = "closed";
        }
        return parent;
      };
      taskDetails.internal_status = data?.data?.internal_status;
      taskDetails.status = getStatus(data);
      data.data.status = getStatus(data);
      taskDetails.internal_priority = data?.data?.internal_priority;
      taskDetails.priority = getPriority(data);
      data.data.priority = getPriority(data);
      dispatch(updateTask(data)).then(() => {
        dispatch(getTaskById(taskId)).then((response) => {
          setTempTaskDetails(response?.payload);
          setHandleChildColor(true)
          setStatusHandleColor(true)
          setTaskDetails(response?.payload);
          setStartDate(new Date(response?.payload.start_date));
          setDueDate(new Date(response?.payload.due_date));
          setTaskAssignees(response?.payload?.assignee);
          setTitle(response?.payload?.name);
          setDescription(
            response?.payload.description?.length > 0
              ? response?.payload?.description
              : "No Description Found"
          );
          setTimeout(()=>{
            dispatch(getTasksLogs(parseInt(taskId?.id)))
          },2000)
          setDescEdit(false);
          fetchExceptUsers();
        });
      });
      if (
        taskDetails?.status == "in-review" &&
        taskDetails?.approval_template_master_id > 0
      ) {
        selectedApprovalMethod(taskDetails?.approval_template_master_id);
      }
    }
  };

  const fetchExceptUsers = () => {
    let payload = {
      array: taskAssignees,
      name: searchUser,
    };
    dispatch(getExceptUsers(payload));
  };

  const addChecklist = (e) => {
    e.preventDefault();
    if (checklistObj.title === "") {
      setAddChecklist(!showAddChecklist);
    } else {
      dispatch(createChecklist(checklistObj)).then((res) => {
        if (res.payload.status) {
          setAddChecklist(!showAddChecklist);
          dispatch(getChecklist(parseInt(taskId.id)));
        }
      });
    }
  };

  const addComment = (e,type) => {
    e.preventDefault();
    let message;
    if(type=="comment"){
      message="Comment Added Successfully"
    }
    dispatch(createComment({commentData:commentObj,field:message})).then((res) => {
      if (res.payload.status) {
        setCommentObj({ ...commentObj, comment: "" });
        dispatch(getComments(parseInt(taskId.id)));
        setTimeout(()=>{
          dispatch(getTasksLogs(parseInt(taskId.id)));
        },2000)
       
      }
    });
  };

  const handleTaskComment = (e) => {
    let regex = /<\/?\w+>/g;
    if (e.replace(regex, "") != "") {
      setCommentObj({ ...commentObj, comment: e });
    } else {
      setCommentObj({ ...commentObj, comment: "" });
    }
  };
  const checkUpdate = (item, event) => {
    event.preventDefault();
    var selectedChecklist = item;
    selectedChecklist = { ...selectedChecklist, is_done: !item.is_done };
    dispatch(updateChecklist(selectedChecklist)).then((res) => {
      if (res.payload.status) {
        dispatch(getChecklist(parseInt(taskId.id)));
      }
    });
  };

  const updateCheckListTitle = (item) => {
    if (
      checklistItem.title !== ChecklistTitle &&
      ChecklistTitle.trim().length > 0
    ) {
      setChecklistItem(item);
      let payload = item;
      payload = { ...item, title: ChecklistTitle };
      dispatch(updateChecklist(payload)).then(() => {
        dispatch(getChecklist(parseInt(taskId.id)));
        setChecklistTitleEdit(!ChecklistTitleEdit);
      });
    } else {
      setChecklistTitleEdit(!ChecklistTitleEdit);
    }
  };

  const editCheckListTitle = (item) => {
    setChecklistItem(item);
    setCheckListTitle(item.title);
    setChecklistTitleEdit(!ChecklistTitleEdit);
  };

  const checklistDelete = (item) => {
    dispatch(deleteChecklist(item)).then((res) => {
      dispatch(getChecklist(parseInt(taskId.id)));
    });
  };

  const handleRejectTask = () => {
    let reject_obj = {
      taskid: parseInt(taskDetails?.id),
      type: "reject",
      userid: parseInt(userDetails?.id),
    };
    dispatch(Accept_Task(reject_obj));
    navigate(`/taskslist`);
  };
  const commentDelete = (item) => {
    dispatch(deleteComment(item)).then((res) => {
      dispatch(getComments(parseInt(taskId?.id)));
      setTimeout(()=>{
        dispatch(getTasksLogs(parseInt(taskId.id)));
      },2000)
    });
  };

  const createSubTask = (e) => {
    e.preventDefault();
           const startDate = (new Date(subtaskObj.start_date))
            const dueDate = (new Date(subtaskObj.due_date))
            let timeDifference = (startDate.getTime()-dueDate.getTime()) / 1000;
            let totalMinutes=timeDifference/60;
            let minutesDifference=Math.abs(Math.round(totalMinutes))
            if (
                startDate.getHours()==
                dueDate.getHours()&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()
              ) {
                setEndDateError(true)
                return
            }
            if((dueDate.getHours()-startDate.getHours()==1)&&minutesDifference<59&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()){
                setEndDateError(true)
                return
            }
            if(startDate.getHours()>dueDate.getHours()&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()){
                setStartDateError(true)
                return
            }
    let priorityCheck;
    if(subtaskObj.priority){
        priorityCheck=subtaskObj.priority
    }
    if(!subtaskObj.priority){
        priorityCheck=DeafultPriority
    }
    let statusCheck;
    if(subtaskObj.status){
      statusCheck=subtaskObj.status
    }
    if(!subtaskObj.status){
      statusCheck=defaultStatus
    }
  const sub_taskOBJ={
  name: subtaskObj.name,
  description: subtaskObj.description,
  assignee_type: subtaskObj.assignee_type,
  start_date: subtaskObj.start_date,
  due_date:subtaskObj.due_date ,
  status: getStatusD(),
  priority: getPriorityD(),
  task_type: "Live",
  is_active: true,
  create_individualTask: false,
  assignee: subtaskObj.assignee,
  parent: parseInt(taskId.id),
  org_id: currentOrganization,
  createdby: userDetails.id,
  remainder_interval: 1800000,
  checklistprogress: 0,
  next_notification: "2022-10-28T11:59:17.546Z",
  updated_user: `${userDetails.name} ${userDetails.lastname}`,
  internal_priority: priorityCheck,
  internal_status: statusCheck}
    dispatch(createTask(sub_taskOBJ)).then((res) => {
      if (res?.payload?.status) {
        setShowAddSubTask(!showAddSubTask);
        dispatch(getSubtasks(parseInt(taskId.id)));
        setSubtaskObj({...subtaskObj, start_date: new Date(),
        due_date: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)).toISOString()})    
      }
    });
  };

  const fetchAvatar = (id) => {
    if (usersList?.length > 0) {
      let user = usersList?.find((item) => item.id === id);

      if (user) {
        return (
          <Avatar  image={user.avatar}
            initials={`${user?.name
              .substring(0, 1)
              .toUpperCase()}${user?.lastname.substring(0, 1).toUpperCase()}`}
            color="--br-danger"
          />
        );
      } else {
        return <Avatar initials="NA" color="--br-danger" />;
      }
    }
  };

  const fetchCommentAvatar = (comment) => {
    if (usersList?.length > 0) {
      let selectedUser = usersList?.find((user) => user.id === comment.user_id);
      if (selectedUser) {
        return (
          <div className="d-flex align-items-center gap-2">
            <div>
                <Avatar initials={`${selectedUser.name
                  .substring(0, 1)
                  .toUpperCase()}${selectedUser.lastname
                  .substring(0, 1)
                  .toUpperCase()}`}
                color="--br-danger"
              />
            </div>
            <div className="w-100">
              <h6 className="m-0">{selectedUser?.name} {selectedUser?.lastname}</h6>
              { comment.type!="Approved"&&comment.type!="Rejected"?<p className="fs-10 m-0">commented on {moment(comment.created_at, "YYYY-MM-DDTHH:mm:ss.SSSSSSZ").format("ddd, MMM DD, YYYY, h:mm A")}</p>:<p className="fs-10">{comment.type} on {moment(comment.created_at, "YYYY-MM-DDTHH:mm:ss.SSSSSSZ").format("ddd, MMM DD, YYYY, h:mm A")}</p>}
            </div>
            {
              comment.type!="Approved"&&comment.type!="Rejected"&&
              <div>
              <button
              className="icon-buttons"
              onClick={() => commentDelete(comment)}
              disabled={statusInreview || pending||taskClosed||(!comment.created_by==user_Id)}
            >
              <FaTrashAlt />
            </button></div>
            }
          </div>
        );
      } else {
        return (
          <div className="row mt-2 mb-2">
            <div className="col-1">
              <Avatar initials="NA" color="--br-danger" />
            </div>
            <div className="col-9">
              <h6>NO Name</h6>
            </div>
            <div className="col-1">
              <button
                className="icon-buttons"
                onClick={() => commentDelete(comment.id)}
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
        );
      }
    } else {
      <div className="row mt-2 mb-2">
        <div className="col-1">
          <Avatar initials="NA" color="--br-danger" />
        </div>
        <div className="col-9">
          <h6>NO Name</h6>
        </div>
        <div className="col-1">
          <button
            className="icon-buttons"
            onClick={() => commentDelete(comment.id)}
          >
            <FaTrashAlt />
          </button>
        </div>
      </div>;
    }
  };

  const [checked1, setChecked1] = useState(false);
  const [selectedcheck, setselectedCheck] = useState([]);
  const [showtoggleforUsers, setshowtoggleforUsers] = useState(true);

  const handleChange = (val) => {
    setChecked1(val);
    setforce_closers(taskAssignees);
    if (!val) {
      setforce_closers([]);
    }
    //setForceApprove(true)
  };

  //setforce_closers
  const handleLevels = (user, key) => {
    if (force_closers?.includes(user.id)) {
      setforce_closers(force_closers?.filter((id) => id !== user.id));
    } else {
      if (force_closers == null) {
        setforce_closers([user?.id]);
      } else {
        setforce_closers([...force_closers, user?.id]);
      }
    }
    setChecked1(false);
    //setremoveforceApproval(true);
  };

  //  useEffect (()=>{
  //     let data = { ...taskDetails, force_closers: force_closers }
  //     let updateClosure={data:data,field:"Forced Approved"}
  //     // setTaskDetails(updateClosure);
  //     updateTaskDetails(updateClosure);

  //   },[force_closers])

  const fetchAssignees = (id, key) => {
    let user = usersList?.find((user) => user.id === id);
    if (user) {
      return (
        <div className="assignes-cards-body assignees-cards mt-3">
          <div className="card-gt-body">
            <div className="d-flex align-items-center">
                {/* <Form.Check
                  type="checkbox"
                  id={`default-checkbox`}
                  checked={checked1 || force_closers?.includes(user.id)}
                  value={user.id}
                  onClick={(event) => {
                    handleLevels(user, key);
                    setForceApprove(true)

                  }}
                  disabled={true}
                /> */}
              <div className="d-flex align-item-center gap-wd-capital">
                <Avatar
                  color={user.color}
                  initials={`${user.name
                    .substring(0, 1)
                    .toUpperCase()}${user.lastname
                    .substring(0, 1)
                    .toUpperCase()}`}
                    image={user.avatar}
                />

                <h5 id={user}>
                  {user?.name} {user?.lastname}
                </h5>
              </div>
              <div>
                <button className="icon-buttons-operatorbtn btn-primary" type="button"  onClick={(event) => {removeAssignee(user.id, event);setRemoveAssigne(true);}}disabled={taskAssignees.length==1||statusInreview || pending || taskClosed}>
                  <FaMinus/>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
  const handleStatusChange=(e)=>{
    if(e[0]?.name.toLowerCase()!="completed"){
      setSelectedStatuses(e)
      taskHandleChange(e[0]?.name.toLowerCase(), "status")
      setTaskDetails((Prev)=>({...Prev,internal_status:e[0]?.name.toLowerCase()}))
    }
   
  }

  const handleSelectedPriority=(e)=>{
    setSelectedPriorities(e)
    setTaskDetails((Prev)=>({...Prev,internal_priority:e[0]?.name.toLowerCase()}))
    taskHandleChange(e[0]?.name.toLowerCase(), "priority")
  }

  const fetchUserToApprove = (id) => {
    let user = usersList?.find((user) => user.id === id);
    if (user) {
      return (
        <div className="assignes-cards-body assignees-cards">
          <div className="card-gt-body">
            <Avatar
              color={user.color}
              initials={`${user.name
                .substring(0, 1)
                .toUpperCase()}${user.lastname.substring(0, 1).toUpperCase()}`}
            />
          </div>
        </div>
      );
    }
  };

  const removeAssignee = (id, event) => {
    event.preventDefault();
    setTaskAssignees((taskAssignees) =>
      taskAssignees?.filter((item) => item !== id)
    );
    setforce_closers((taskAssignees) =>
      taskAssignees?.filter((item) => item !== id)
    );
  };

  const addAssignee = (item) => {
    
      let payload={ field: "assignee",taskid: parseInt(taskDetails?.id)}
      dispatch(updatePermissionCheck(payload)).then((res)=>{
        if(res.payload.data.updateTask.status){
          setTaskDetails({ ...taskDetails, assignee: taskAssignees });
          setUpdateAssign(true);
          setTaskAssignees((assigneedUsers) => [...assigneedUsers, item]);
        }
        else{
          toast.error(res.payload.data.updateTask.message)
        }
      })
   
    if (checked1) {
      setforce_closers([...force_closers, item]);
    }
  };

  useMemo(() => {
    fetchExceptUsers();
    setTaskDetails({ ...taskDetails, assignee: taskAssignees });
  }, [taskAssignees, searchUser]);

  // useMemo(() => {
  //   ;
  // }, [taskDetails]);

  const updateTaskName = (event) => {
    event.preventDefault();
    if (title?.trim().length > 0) {
      setTaskDetails({ ...taskDetails, name: title });
      let data = {
        ...taskDetails,
        name: title,
      };
      
      let updateData = { data: data, field: "title" };
      let payload={ field: "title",taskid: parseInt(taskDetails?.id)}
      dispatch(updatePermissionCheck(payload)).then((res)=>{
        if(res.payload.data.updateTask.status){
          updateTaskDetails(updateData);
          setTitleEdit(!showTitleEdit);
        }
        else{
          toast.error(res.payload.data.updateTask.message);
          setTitleEdit(!showTitleEdit);
        }
      })
     
      
    } else {
      setTitle(taskDetails?.name);
      setTitleEdit(!showTitleEdit);
    }
  }; 
  //Regex to remove spaces and to check content
  const handleDescriptionChange = (e) => {
    let regex = /<\/?\w+>/g;
    if (e.replace(regex, "") != "" && e.replace(regex, "").trim() != "") {
      setDescription(e);
    } else {
      setDescription("No Description Found");
    }
    let data = { ...taskDetails, description: description };
    setTaskDetails(data);
  };
  const [dateError, setDateError] = useState(false);
  // Added Function to resolve double toast message and to display updated data name in toast messages
  const taskHandleChange = (date, event) => {
    if (event === "duedate") {
      let startDate=new Date(taskDetails?.start_date)
      let dueDate=new Date(date)
       let timeDifference = (startDate.getTime()-dueDate.getTime()) / 1000;
     let totalMinutes=timeDifference/60;
     let minutesDifference=Math.abs(Math.round(totalMinutes))
     if (
         startDate.getHours()==
         dueDate.getHours()&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()
       ) {
        setDateError(true)
         return
     }
     if((dueDate.getHours()-startDate.getHours()==1)&&minutesDifference<59&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()){
      setDateError(true)
         return
     }
     if(startDate.getHours()>dueDate.getHours()&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()){
      setDateError(true)
         return
     }
      // if (
      //   startDate.getHours()<
      //   dueDate.getHours()&& startDate.getMinutes()<dueDate.getMinutes()
      // ) {
        let data = {
          ...taskDetails,
          due_date: new Date(date).toISOString(),
        };
        let updateData = { data: data, field: "DueDate" };
        let payload={ field: "duedate",taskid: parseInt(taskDetails?.id)}
         dispatch(updatePermissionCheck(payload)).then((res)=>{
        if(res.payload.data.updateTask.status){
        setTaskDetails(data);
        setDateError(false);
        updateTaskDetails(updateData);
          }
        else{
          toast.error(res.payload.data.updateTask.message)
        }})
        // setTaskDetails(data);
        // setDateError(false);
        // updateTaskDetails(updateData);
      // } else {
        // let data = {
        //   ...taskDetails,
        //   due_date: new Date(date).toISOString(),
        // };
        // setDateError(true);
      // }
    }
    if (event === "startdate") {
      if (
        new Date(date).toISOString() <=
        new Date(taskDetails?.due_date).toISOString()
      ) {
        let data = {
          ...taskDetails,
          start_date: new Date(date).toISOString(),
        };
        let updateData = { data: data, field: "startDate" };


        // setTaskDetails({...data, due_date: new Date(date.getTime() + (24 * 60 * 60 * 1000)).toISOString()})
        let payload={ field: "startdate",taskid: parseInt(taskDetails?.id)}
        dispatch(updatePermissionCheck(payload)).then((res)=>{
          console.log("ress",res)
         if(res.payload.data.updateTask.status){
         setTaskDetails(data);
        updateTaskDetails(updateData);
        setDateError(false);
         }
       else{
         toast.error(res.payload.data.updateTask.message)
       }})
        // setTaskDetails(data);
        // updateTaskDetails(updateData);
        // setDateError(false);
      } else {
        let data = {
          ...taskDetails,
          start_date: new Date(date).toISOString(),
        };
        let updateData = { data: data, field: "startDate" };
        // setTaskDetails({...data, due_date: new Date(date.getTime() + (24 * 60 * 60 * 1000)).toISOString()})
        //setTaskDetails(data)
        setDateError(true);
      }
    }
    if (event === "priority") {
      let data = { ...taskDetails, internal_priority: date};
      setTaskDetails(data);
      let updateData = { data: data, field: " Priority" };
      updateTaskDetails(updateData);
    }
    if (event === "status") {
      let data = {
        ...taskDetails,
        internal_status: date,
      };
      setTaskDetails(data);
      let updateData = { data: data, field: "Status" };
      updateTaskDetails(updateData);
    }
  };
  const updateTaskDesc = (e) => {
    if (e.index != 0 || prevDescription != "No Description Found") {
      let data = { ...taskDetails, description: description };
      let updateData = { data: data, field: "Description" };
      setDescription(description);
      setTaskDetails(data);
      updateTaskDetails(updateData);
    } else {
      setDescEdit(false);
    }
  };

  const deleteSubTask = (item, e) => {
    e.preventDefault();
    dispatch(deleteTask(item)).then(() => {
      dispatch(getSubtasks(parseInt(taskId.id)));
    });
  };

  const addAttachment = (e) => {
    setAttchmentLoading(true);
    e.preventDefault();
    const attachmentObj = {
      file_name: file?.name,
      file_type: file?.type,
      folder_path: `org/${currentOrganization}/tasks/${taskId.id}`,
      task_id: taskId?.id,
      user_id: userDetails?.id,
      org_id: currentOrganization,
      file: file,
    };
    dispatch(attachmentUpload(attachmentObj)).then((res) => {
      if (res.payload.status) {
        dispatch(getAttachment(taskId?.id));
        setShowAttchment(false);
      }
      setAttchmentLoading(false);
    });
  };

  const colorSet=(color)=>{
    setPriorityColor(color)
  }
  const downloadFile = (file) => {
    let body = {
      file_name: file?.file_name,
      folder_path: file?.folder_path,
    };
    dispatch(downloadAttachment(body)).then((res) => {
      window.open(res?.payload);
    });
  };

  const fetchActivityLog = (log) => {
    if (log.operation === "CREATE") {
      return (
        <Card.Body className="p-0">
          <p className="activity-log">
            {log?.json.updated_user} Created a new task {log?.json.name}
          </p>
        </Card.Body>
      );
    }
    if( log?.operation=="COMMENT-CREATE"){
      return(
        <Card.Body className="p-0 ">
        <p className="activity-log mt-2">
        {log?.context.message}
        </p>
      </Card.Body> 
      )
    }
    if( log?.operation=="COMMENT-DELETE"){
      return(
        <Card.Body className="p-0 ">
        <p className="activity-log mt-2">
        {log?.context.message}
        </p>
      </Card.Body>
      )
    }
    if (log?.operation === "UPDATE") {
      if( log.context.field_name=="assignee"){
        return(
          <Card.Body className="p-0 ">
          <p className="activity-log mt-2">
          {log.json[0].updated_user} {" "} {log.context.to}
          </p>
        </Card.Body>
        )
      }
     
      if (
        log?.context.field_name === "internal_status" ||
        log?.context.field_name === "internal_priority" ||
        log.context.field_name === "due_date" ||
        log.context.field_name === "start_date" ||
        log.context.field_name === "description"
      ) {
        return (
          <div className="d_aic_jcsb mt-2 activity-log">            
            <p className="m-0">
                {log.json[0].updated_user} Updated{" "}
                {log.context.field_name === "internal_priority"
                  ? "Priority"
                  : log.context.field_name === "internal_status"
                  ? "Status"
                  : log.context.field_name === "start_date"
                  ? "Start Date"
                  : log.context.field_name === "due_date"
                  ? "Due Date"
                  : log.context.field_name === "description"
                  ? "Description"
                  : ""}{" "}
                from{" "}
                {log.context.field_name === "start_date" ||
                log.context.field_name === "due_date" ? (
                  moment(log.context.from, "MM/DD/YYYY").format(
                    "ddd, MMM DD, YYYY, h:mm A"
                  )
                ) : log.context.field_name === "description" ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        log.context.from.length < 5
                          ? log.context.from.slice(0, 10) + ".."
                          : log.context.from,
                    }}
                  />
                ) : (
                  log.context.from
                )}{" "}
                to{" "}
                {log.context.field_name === "start_date" ||
                log.context.field_name === "due_date" ? (
                  moment(log.context.to, "MM/DD/YYYY").format(
                    "ddd, MMM DD, YYYY, h:mm A"
                  )
                ) : log.context.field_name === "description" ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        log.context.to.length < 5
                          ? log.context.to.slice(0, 10) + ".."
                          : log.context.to,
                    }}
                  />
                ) : (
                  log.context.to
                )}
              </p>
              <p className="m-0">{moment(log.created_at).format("ddd, MMM DD, YYYY, h:mm A")}</p>
          </div>
        );
      }
    }
  };
  const getColors=(internalStatus,type)=>{
     if(type=="status"){
      let filterData=statusChildList?.findIndex(item=>item.name.toLowerCase()==internalStatus)
      if(filterData||filterData==0) {
        return statusChildList[filterData]?.color
      }
     }
     if(type=="priority"){
      let filterData=priorityChildConfig_List?.findIndex(item=>item.name.toLowerCase()==internalStatus)
      if(filterData||filterData==0) {
        return priorityChildConfig_List[filterData]?.color    
       }
     }
  }
  const getOrgCode = (orgData, orgId) => {
    let data = orgData?.filter((item) => {
      return item?.id === orgId;
    });
    return data?.length == 0 ? "" : data && data[0]["uni_code"];
  };

  const redirectTask = (taskId, e) => {
    e.preventDefault();
    navigate(`/taskdetails/${taskId}`);
  };

  const attachmentDelete = (id) => {
    dispatch(deleteAttachment(id)).then((res) => {
      dispatch(getAttachment(taskId.id));
    });
  };

  return (
    <div>
      {loader ? (
        <LoaderComponent />
      ) : (
        <section className="taskdetail_page mt-4">
          <Container fluid>
            <h5 className="mb-3">
              {getOrgCode(orgListData, taskDetails?.org_id)}-{" "}
              {taskDetails?.task_code}
            </h5>
            <Row>
              <Col xl={7} lg={7} md={12}>
                {/*--------------------------------------Task Desc Card Starts Hear ------------------------------------------------> */}
                <Card className="task-desc-card no-border-card p-0">
                  <Card.Header className="p-3">
                    <div className="d_aic_jcsb mb-3">
                    {showTitleEdit? (
                      <Form.Control
                        className="task-details-title"
                        value={title}
                        onChange={(event) => {
                          setTitle(event.target.value);
                        }}
                        onBlur={(e) => updateTaskName(e)}
                        type="text"
                        placeholder="Task Title"
                        disabled={taskDetails.pending_for_acceptance?.includes(
                          userDetails.id
                        )||taskClosed}
                      />
                    ) : (
                      <h4 className="m-0" onClick={() => setTitleEdit(true)}>
                        {title}
                      </h4>
                    )}
                      <button
                        type="button"
                        className="task-description-btn"
                        onClick={() => setShowDesc((prev) => !prev)}
                        disabled={statusInreview}
                      >
                        {showDesc ? (
                          <FaSortDown className="task-description-dropdown-icon" />
                        ) : (
                          <FaSortUp />
                        )}
                      </button>
                    </div>
                    <h6>Task Description</h6>

                  </Card.Header>
                  {/* --------------------edit description starts hear--------------------- */}
                  {showDesc&&pending ? (
                    <Card.Body className="my-2 ps-3 pe-3">
                    <span
                      dangerouslySetInnerHTML={{ __html: description }}
                      className="flex-fill p-2"
                    ></span>
                    </Card.Body>
                  ) : (
                    showDesc && (
                      <Card.Body>

                        <div className="my-2 ps-2 pe-3 descQuill">
                          {showDescEdit ? (
                            <ReactQuill
                              theme="snow" modules={modules}
                              ref={inputElement} //auto focuses the description
                              value={
                                description.length > 0 &&
                                description != "No Description Found"
                                  ? description
                                  : ""
                              }
                              placeholder="Enter Description"
                              onChange={handleDescriptionChange}
                              formats={[]}
                              onBlur={(e) => updateTaskDesc(e)}
                            />
                          ) : (
                            <div className="d-flex">
                              <div
                                className="flex-fill p-2"
                                onClick={
                                  !statusInreview
                                    ? () => setDescEdit(true)
                                    : null
                                }
                                dangerouslySetInnerHTML={{
                                  __html: description,
                                }}
                              ></div>
                              <button
                                className="btn-todo-actions"
                                onClick={() => setDescEdit(true)}
                                disabled={statusInreview || pending||taskClosed}
                              >
                                <FaEdit />
                              </button>
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    )
                  )}
                  {/* --------------------edit description closed hear--------------------- */}

                  <Card.Footer className="status-card-footer pb-3">
                    <Row>
                      <Col xl={12}>
                        <Row>
                          <Col xl={4} lg={6}>
                            <Form.Group className="mb-2">
                              <Form.Label className="d-flex align-items-center gap-2">
                                <MdDateRange className="fs-6"/> Start Date
                              </Form.Label>
                              <DatePicker
                                className="form-control"
                                selected={
                                  taskDetails?.start_date
                                    ? new Date(taskDetails?.start_date)
                                    : new Date()
                                }
                                minDate={new Date(taskDetails?.start_date)}
                                onChange={(date, event) =>
                                  taskHandleChange(date, "startdate")
                                }
                                timeInputLabel="Time:"
                                dateFormat="eee, MMM dd, yyyy, h:mm aa"
                                showTimeInput
                                disabled={statusInreview || pending||taskClosed}
                              />
                            </Form.Group>
                           
                          </Col>
                          <Col xl={4} lg={6}>
                            <Form.Group className="mb-2">
                              <Form.Label className="d-flex align-items-center gap-2">
                                <MdDateRange className="fs-6"/>
                                Due Date
                              </Form.Label>
                              <DatePicker
                                selected={
                                  taskDetails?.due_date
                                    ? new Date(taskDetails?.due_date)
                                    : new Date()
                                }
                                minDate={new Date(taskDetails?.start_date)}
                                onChange={(date, event) =>
                                  taskHandleChange(date, "duedate")
                                }
                                className="form-control"
                                dateFormat="eee, MMM dd, yyyy, h:mm aa"
                                showTimeInput
                                disabled={statusInreview || pending || taskClosed}
                              />
                            </Form.Group>
                            {dateError && (
                              <p
                                className="mb-1"
                                style={{ color: "red", fontSize: 10 }}
                              >
                                Need atleast 1 hour difference between dates
                              </p>
                            )}
                            {/* {dateError && <p className="mb-1" style={{ color: 'red', fontSize: 10 }}>startDate must be lesser than Due Date</p>} */}
                          </Col>
                        </Row>
                      </Col>
                      <Col>
                        <Row>
                          <Col xl={4} lg={6}>
                            <Form.Label>Priority</Form.Label>
                            <div className="multidis">
                            <Multiselect
                             className="single-select"
                            options={modifiedChildPriorities}
                            singleSelect={true}
                            groupBy="parent"
                            displayValue="name"
                            disable={taskDetails.status=="in-review" ||pending|| taskDetails.status=="closed" ? true:false}
                            showCheckbox={true}
                            selectedValues={selectedPriorities}
                            placeholder={selectedPriorities.length>=1?"":"search"}
                            onSelect={(e)=>handleSelectedPriority(e)}
                            onRemove={setSelectedPriorities}
                            selectedValueDecorator	={(da)=>{
                             return <div className="d-flex align-items-center"><span className="color-config" style={{backgroundColor:selectedPriorities[0].color,height:"10px",width:"10px",marginRight:"19px",borderRadius:"50%"}}></span><span>{da}</span></div>
                           
                            }}/>
                            </div>
                            {/* <Form.Select
                              required
                              value={taskDetails?.internal_priority}
                              onChange={(date, event) =>
                                taskHandleChange(date, "priority")
                              }
                              disabled={statusInreview || pending || taskClosed}
                              style={{color:handleChildColor?getColors(taskDetails?.internal_priority,"priority"):""}}
                              onClick={()=>setHandleChildColor(false)}
                              onBlur={()=>setHandleChildColor(true)}
                              className="form-control"
                            >
                              {Array.isArray(getParentPriorityFiltereddata) &&
                                getParentPriorityFiltereddata?.map(priority => {
                                  return priority?.parent_id == null ? (
                                    <optgroup
                                      label={captialLetter(priority?.name)}
                                    >
                                      {priorityChildConfig_List?.map(child => {
                                        return priority.id ==
                                          child?.parent_id ? (
                                            
                                          <option
                                            value={child?.name}
                                            style={{ color: child?.color }} 
                                          >
                                           
                                            {captialLetter(child?.name)}
                                          </option>

                                        ) : (
                                          ""
                                        );
                                      })}
                                    </optgroup>
                                  ) : (
                                    <p></p>
                                  );
                                })}
                            </Form.Select> */}
                          </Col>
                          <Col xl={4} lg={6}>
                            <Form.Group className="mb-2">
                              <Form.Label>Status</Form.Label>
                              {/* <span>{taskDetails?.internal_status}</span> */}
                              <div className="multidis lidisable">                             
                               <Multiselect
                                     className="single-select"
                                      options={modifiedChildStatus}
                                      groupBy="parent"
                                      displayValue="name"
                                      singleSelect={true}
                                      showCheckbox={true}
                                      selectedValues={selectedStatuses}
                                      disable={taskDetails.status=="in-review" ||pending|| taskDetails.status=="closed" ? true:false}
                                      placeholder={selectedStatuses.length>=1?"":"search"}
                                      onSelect={(e)=>handleStatusChange(e)}
                                      onRemove={setSelectedStatuses}
                                      selectedValueDecorator	={(da)=>{
                                        return <div className="d-flex align-items-center"><span style={{backgroundColor:selectedStatuses[0].color,height:"10px",width:"10px",marginRight:"19px",borderRadius:"50%"}}></span><span>{da}</span></div>
                                       }} 
                                    />
                                    </div>

                              {/* <Form.Select
                                aria-label="Default select example"
                                value={taskDetails?.internal_status}
                                disabled={statusInreview || pending || taskClosed}
                                onChange={(date, event) =>
                                  taskHandleChange(date, "status")
                                }
                                style={{color:statusHandleColor?getColors(taskDetails?.internal_status,"status"):""}}
                                onClick={()=>setStatusHandleColor(false)}
                                onBlur={()=>setStatusHandleColor(true)}
                                
                              >
                                {Array.isArray(getParentStatus) &&
                                  getParentStatus?.map(status => {
                                    return status.parent_id == null ? (
                                      <optgroup
                                        label={captialLetter(status?.name)}
                                      >
                                        {statusChildList?.map(child => {
                                          return status.id ==
                                            child?.parent_id ? (
                                            <option
                                              value={child?.name}
                                              disabled={
                                                status?.name == "closed"
                                              }
                                              style={{ color: child?.color }}
                                            >
                                              {captialLetter(child?.name)}
                                            </option>
                                          ) : (
                                            ""
                                          );
                                        })}
                                      </optgroup>
                                    ) : (
                                      <p></p>
                                    );
                                  })}
                              </Form.Select> */}
                            </Form.Group>
                          </Col>
                          <Col xl={4} lg={12}>
                            {taskDetails?.status == "in-review" ? (
                              <>
                                <Form.Group className="mb-2">
                                  <Form.Label>Approval Workflow</Form.Label>
                                  <Form.Select
                                    aria-label="Default select example"
                                    value={
                                      taskDetails?.approval_template_master_id
                                    }
                                    disabled={
                                      pending ||taskClosed||
                                      taskDetails?.approval_template_master_id
                                    }
                                    onChange={(event) => {
                                      selectedApprovalMethod(
                                        event.target.value
                                      );
                                    }}
                                  >
                                    <option slected defaultValue={"self"}>
                                      Self
                                    </option>
                                    {approvals?.map((item) => {
                                      return (
                                        <option key={item?.id} value={item?.id}>
                                          {item?.template_name}
                                        </option>
                                      );
                                    })}
                                  </Form.Select>
                                </Form.Group>
                              </>
                            ) : (
                              <p></p>
                            )}
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Card.Footer>
                </Card>
                {/*--------------------------------------Task Desc Card Ends Hear ------------------------------------------------> */}
                {/*--------------------------------------Sub Task  Card Starts Hear ------------------------------------------------> */}

                {taskDetails?.parent === 0 && (
                  <Card className="sub-task mb-3">
                    <Form
                      className="subtask-form "
                      onSubmit={(e) => createSubTask(e)}
                    >
                      <Card.Header>
                        <div>
                          <h6>Sub Task</h6>
                          {showAddSubTask ? (
                            <div className="d-flex">
                              <Button
                                variant="outline-secondary"
                                onClick={() =>
                                  setShowAddSubTask(!showAddSubTask)
                                }
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                variant="outline-primary"
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="task-description-btn"
                              onClick={() => setShowAddSubTask(!showAddSubTask)}
                              disabled={statusInreview || pending || taskClosed}
                            >
                              <FaPlus className="task-description-plus-icon" />
                            </button>
                          )}
                        </div>
                      </Card.Header>
                      <Card.Body className="assignees-card p-0 pe-2 overflow-visible">
                        {
                          showAddSubTask && (
                            // ------------------------------------------- Sub task starts ends hear--------------------------
                            <Container fluid>
                              <Row className="mt-3">
                                <Col xl={4}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>SubTask Title *</Form.Label>
                                    <Form.Control
                                      required
                                      type="text"
                                      onChange={(e) =>
                                        setSubtaskObj({
                                          ...subtaskObj,
                                          name: e.target.value,
                                        })
                                      }
                                    />
                                  </Form.Group>
                                </Col>
                                <Col xl={4}>
                                  <Form.Label>Priority</Form.Label>
                                  <div className="multidis position-relative">
                                    <Multiselect
                                      className="single-select"
                                      options={modifiedChildPriorities}
                                      singleSelect={true}
                                      groupBy="parent"
                                      displayValue="name"
                                      showCheckbox={true}
                                      selectedValues={selectedSubPriority}
                                      placeholder={selectedSubPriority.length>=1?"":"search"}
                                      onSelect={(e)=>handleSubTaskPiority(e)}
                                      onRemove={setSelectedSubPirority}
                                      selectedValueDecorator	={(da)=>{
                                        return <div className="d-flex align-items-center"><span style={{backgroundColor:selectedSubPriority[0].color,height:"10px",width:"10px",marginRight:"19px",borderRadius:"50%"}}></span><span>{da}</span></div>
                                       }} 
                                    />
                                  </div>

                                  {/* <Form.Select
                                    required
                                    aria-label="Default select example"
                                    // value={subtaskObj?.priority}
                                    onChange={(e) =>
                                      setSubtaskObj({
                                        ...subtaskObj,
                                        priority: e.target.value,
                                      })
                                    }
                                  >
                                    {Array.isArray(getParentPriorityFiltereddata) &&
                                      getParentPriorityFiltereddata?.map(
                                        (priority) => {
                                          return priority.parent_id == null ? (
                                            <optgroup label={priority.name}>
                                              {priorityChildConfig_List?.map(
                                                (child) => {
                                                  return priority.id ==
                                                    child?.parent_id ? (
                                                    <option value={child?.name} style={{ "color": child?.color }}>{captialLetter(child?.name)}
                                                    </option>
                                                  ) : (
                                                    ""
                                                  );
                                                }
                                              )}
                                            </optgroup>
                                          ) : (
                                            <p></p>
                                          );
                                        }
                                      )}
                                  </Form.Select> */}
                                </Col>
                                <Col xl={4}>
                                  <Form.Label>Status</Form.Label>
                                  <div className="multidis lidisable">
                                    <Multiselect
                                        className="single-select"
                                        options={modifiedChildStatus}
                                        singleSelect={true}
                                        groupBy="parent"
                                        displayValue="name"
                                        showCheckbox={true}
                                        selectedValues={subTaskStatus}
                                        placeholder={subTaskStatus.length>=1?"":"search"}
                                        onSelect={(e)=>handleSubTaskStatus(e)}
                                        onRemove={setSubTaskStatus}
                                        selectedValueDecorator	={(da)=>{
                                          return <div className="d-flex align-items-center"><span style={{backgroundColor:subTaskStatus[0].color,height:"10px",width:"10px",marginRight:"19px",borderRadius:"50%"}}></span><span>{da}</span></div>
                                        }} 
                                      />
                                  </div>
                                  {/* <Form.Select
                                    required
                                    aria-label="Default select example"
                                    // value={subtaskObj?.status} 
                                    onChange={(e) =>
                                      setSubtaskObj({
                                        ...subtaskObj,
                                        status: e.target.value,
                                      })
                                    }
                                  >
                                    {getParentStatus?.map((status) => {
                                      return status.parent_id == null ? (
                                        <optgroup label={captialLetter(status.name)} >
                                          {statusChildList?.map(
                                            (child) => {
                                              return status.id ==
                                                child?.parent_id ? (
                                                <option  value={child?.name} style={{ "color": child?.color }}>
                                                  {child?.name
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    child?.name?.slice(1)}
                                                </option>
                                              ) : (
                                                ""
                                              );
                                            }
                                          )}
                                        </optgroup>
                                      ) : (
                                        <p></p>
                                      );
                                    })}
                                  </Form.Select> */}
                                </Col>
                              </Row>
                              <Row>
                                <Col xl={4}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>
                                      <MdDateRange /> Start Date
                                    </Form.Label>
                                    <DatePicker
                                      selected={
                                        new Date(subtaskObj?.start_date)
                                      }
                                      minDate={new Date()}
                                      onChange={(date) =>
                                        setSubtaskObj({
                                          ...subtaskObj,
                                          start_date: new Date(
                                            date
                                          ).toISOString(),
                                          due_date: new Date(
                                            date.getTime() + 24 * 60 * 60 * 1000
                                          ).toISOString(),
                                        })
                                      }
                                      className="form-control"
                                      dateFormat="eee, MMM dd, yyyy, h:mm aa"
                                      showTimeInput
                                    />
                                  </Form.Group>
                                </Col>
                                <Col xl={4}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>
                                      <MdDateRange /> Due Date
                                    </Form.Label>
                                    <DatePicker
                                      selected={new Date(subtaskObj?.due_date)}
                                      minDate={new Date(subtaskObj?.start_date)}
                                      onChange={(date) =>
                                        setSubtaskObj({
                                          ...subtaskObj,
                                          due_date: new Date(
                                            date
                                          ).toISOString(),
                                        })
                                      }
                                      onFocus={()=>setEndDateError(false)}
                                      className="form-control"
                                      dateFormat="eee, MMM dd, yyyy, h:mm aa"
                                      showTimeInput
                                    />
                                    {endDateError && <span className="text-danger">Need atleast 1 hour difference between dates</span>}
                                  </Form.Group>
                                </Col>
                                <Col xl={4}>
                                  <Form.Label>Assignees</Form.Label>
                                  <Form.Select
                                    aria-label="Default select example"
                                    required
                                    onChange={(event) =>
                                      setSubtaskObj({
                                        ...subtaskObj,
                                        assignee: [
                                          parseInt(event.target.value),
                                        ],
                                      })
                                    }
                                  >
                                    <option value="">Select Assignees</option>
                                    {usersList?.length > 0 &&
                                      usersList?.map((item) => (
                                        <option value={item?.id}>
                                          {item?.name} {item?.lastname}
                                        </option>
                                      ))}
                                  </Form.Select>
                                </Col>
                              </Row>
                            </Container>
                          )

                          // ------------------------------------------- Sub task form ends hear--------------------------
                        }
                        <ul className="p-0 m-0">
                        {!showAddSubTask && subTasks?.length > 0
                          ? subTasks?.map((item) => (
                              <li className="d_aic_jcsb mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="table-style1">
                                {/* {item.priority === "high" && (
                                        <h5 className="badge-icon-parent m-0 d_aic_jcc">
                                          <Badge bg="light" text="dark" className="p-0">
                                            <FaFlag color="red" />
                                          </Badge>
                                        </h5>
                                      )}
                                      {item?.priority === "medium" && (
                                        <h5 className="badge-icon-parent m-0 d_aic_jcc">
                                          <Badge bg="light" text="dark" className="p-0">
                                            <FaFlag color="orange" />
                                          </Badge>
                                        </h5>
                                      )}
                                      {item?.priority === "low" && (
                                        <h5>
                                          <Badge bg="light" text="dark">
                                            <FaFlag color="green" />
                                          </Badge>
                                        </h5>
                                      )} */}
                              {priorityChildConfig_List?.map(                                  
                                  (priority) => {
                                    return (
                                      item.internal_priority?.toLowerCase() ===
                                        priority.name.toLowerCase() &&
                                      (
                                        <h5 className="badge-icon-parent m-0 d_aic_jcc">
                                          <Badge
                                            bg="transparent"
                                            text="dark"
                                            className="p-0"
                                          >
                                            <BsFlagFill
                                              color={priority.color}
                                            />
                                          </Badge>
                                        </h5>
                                      )
                                    );
                                  }
                                )}
                                  </div>
                                  <div className="title">
                                        <h6 className="ttww m-0">{item.name} </h6>
                                        <p className="m-0">{moment(new Date(item.due_date),"YYYYMMDD").fromNow()}</p>
                                  </div>
                                </div>
                                <div>{item?.assignee?.length > 0 && fetchAvatar(item?.assignee[0])}</div>
                                   <div>
                                   {statusChildConfigList?.map((status) => {
                                  return (
                                    item.internal_status === status.name && (
                                      <StatusBadge status={status} />
                                    )
                                  );
                                })}
                                    {/* {item?.status === "open" && (<Badge className="status-badges" pill bg="success">Open</Badge>)}
                                    {item?.status === "in-progress" && (<Badge className="status-badges" pill bg="info">In-Progress</Badge>)}
                                    {item?.status === "in-review" && (<Badge className="status-badges" pill bg="warning">In-Review</Badge>)}
                                    {item?.status === "closed" && (<Badge className="status-badges" pill bg="danger">Closed</Badge>)} */}
                                  </div>

                                  <div className="st-actions d-flex align-item-center justify-content-end">
                                    <button className="btn-st-actions" onClick={(event) => redirectTask(item?.id, event)}>
                                      <BiLinkExternal />
                                    </button>
                                    <button className="btn-st-actions" onClick={(e) => deleteSubTask(item, e)}>
                                      <BiTrashAlt />
                                    </button>
                                  </div>

                              </li>
                              ))
                          : !showAddSubTask && "No Subtasks Found"}
                          </ul>


                              {/* {!showAddSubTask && subTasks?.length > 0
                                ? subTasks?.map((item) => (
                              <div className=" sbt_card mb-3">
                                <div className="row p-3 align-items-center">
                                  <div className="col-4 col-sm-4 col-lg-4 d-flex gap-2 table-style1">

                                    <label>
                                      {item.priority === "high" && (
                                        <h5 className="badge-icon-parent m-0 d_aic_jcc">
                                          <Badge bg="light" text="dark" className="p-0">
                                            <FaFlag color="red" />
                                          </Badge>
                                        </h5>
                                      )}
                                      {item?.priority === "medium" && (
                                        <h5 className="badge-icon-parent m-0 d_aic_jcc">
                                          <Badge bg="light" text="dark" className="p-0">
                                            <FaFlag color="orange" />
                                          </Badge>
                                        </h5>
                                      )}
                                      {item?.priority === "low" && (
                                        <h5>
                                          <Badge bg="light" text="dark">
                                            <FaFlag color="green" />
                                          </Badge>
                                        </h5>
                                      )}
                                    </label>

                                    <div>
                                      <h5 className="mb-1">{item.name} </h5>
                                      <label>
                                        {moment(
                                          new Date(item.due_date),
                                          "YYYYMMDD"
                                        ).fromNow()}
                                      </label>
                                    </div>
                                  </div>

                                  <div className="col-2">
                                    {item?.assignee?.length > 0 &&
                                      fetchAvatar(item?.assignee[0])}
                                  </div>

                                  <div className="col-2 d-flex align-item-center">
                                    {item?.status === "open" && (
                                      <Badge
                                        className="status-badges"
                                        pill
                                        bg="success"
                                      >
                                        Open
                                      </Badge>
                                    )}
                                    {item?.status === "in-progress" && (
                                      <Badge
                                        className="status-badges"
                                        pill
                                        bg="info"
                                      >
                                        In-Progress
                                      </Badge>
                                    )}
                                    {item?.status === "in-review" && (
                                      <Badge
                                        className="status-badges"
                                        pill
                                        bg="warning"
                                      >
                                        In-Review
                                      </Badge>
                                    )}
                                    {item?.status === "closed" && (
                                      <Badge
                                        className="status-badges"
                                        pill
                                        bg="danger"
                                      >
                                        Closed
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="col-3 col-sm-4 float-right-css">
                                    <div className="st-actions d-flex align-item-center justify-content-end">
                                      <button
                                        className="btn-st-actions"
                                        onClick={(event) =>
                                          redirectTask(item?.id, event)
                                        }
                                      >
                                        <BiLinkExternal />
                                      </button>
                                      <button
                                        className="btn-st-actions"
                                        onClick={(e) => deleteSubTask(item, e)}
                                      >
                                        <BiTrashAlt />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          : !showAddSubTask && "No Subtasks Found"} */}
                      </Card.Body>
                    </Form>
                  </Card>
                )}

                {/*--------------------------------------Sub Task  Card Ends Hear ------------------------------------------------> */}
                {/*--------------------------------------Comment  Card Starts Hear ------------------------------------------------> */}

                <Card>
                  <Card.Header>
                    <div>
                      <h6>Comments</h6>
                      <button
                        type="button"
                        className="task-description-btn"
                        onClick={() => setShowComments(!showComments)}
                      >
                        {!pending && showComments ? (
                          <FaSortDown className="task-description-dropdown-icon" />
                        ) : (
                          <FaSortUp />
                        )}
                      </button>
                    </div>
                  </Card.Header>
                  {!pending && showComments && (
                    <Card.Body>
                      <div className="assignees-card pe-2 comment">
                          {commentsList?.length > 0 ? commentsList?.map((item) => {
                                return (
                                    <Card className="mb-1 p-0">
                                      <Card.Body className="p-2">
                                      {fetchCommentAvatar(item)}
                                        <div className="mt-1" dangerouslySetInnerHTML={{__html: item.comment,}}/>
                                      </Card.Body>
                                    </Card>
                                );}): "No One Commented Yet"}

{/* {commentsList?.length > 0 ? commentsList?.map((item) => {
   return (
    <div>{fetchCommentAvatar(item)}</div>
    <Card.Body className="content ml-2 p-1">
    <div className="comments-text" dangerouslySetInnerHTML={{__html: item.comment,}}/>
    </Card.Body>

    );}): "No One Commented Yet"} */}
                      </div>
                      <Form onSubmit={(e) => addComment(e,'comment')}>
                        <Form.Group
                          className="mb-3 mt-3"
                          controlId="exampleForm.ControlTextarea1"
                        >
                          {/* <Form.Label>Comments</Form.Label> */}
                          <ReactQuill
                            theme="snow" modules={modules}
                            value={commentObj.comment}
                            formats={[]}
                            onChange={handleTaskComment}
                            required
                            placeholder="Enter Comment"
                          />
                          {/* <Form.Control as="textarea" rows={4} value={commentObj.comment} onChange={(e) => setCommentObj({ ...commentObj, comment: e.target.value })} required /> */}
                        </Form.Group>

                        <Button
                          disabled={
                            commentObj?.comment?.trim().length === 0 ||
                            statusInreview||pending||taskClosed
                          }
                          className="text-buttons modal-btns"
                          type="submit"
                        >
                          Add Comments
                        </Button>
                      </Form>
                    </Card.Body>
                  )}
                </Card>

                {/*--------------------------------------Comment Card Ends Hear ------------------------------------------------> */}

                {/*--------------------------------------Activity Logs   Card Starts Hear ------------------------------------------------> */}

                <Card>
                  <Card.Header>
                    <div>
                      <h6>Activity Logs</h6>
                      <button
                        type="button"
                        className="task-description-btn"
                        onClick={() => setShowLogs(!showLogs)}
                        disabled={pending || taskClosed}
                      >
                        {showLogs ? (
                          <FaSortDown className="task-description-dropdown-icon" />
                        ) : (
                          <FaSortUp />
                        )}
                      </button>
                    </div>
                  </Card.Header>
                  {showLogs && (
                    <Card.Body>
                      <div className="assignees-card pe-2">{taskLogs?.map((item) => fetchActivityLog(item))}</div>
                    </Card.Body>
                  )}
                </Card>

                {/*--------------------------------------Activity Logs  Card Ends Hear ------------------------------------------------> */}
              </Col>
              <Col xl={5} lg={5} md={12}>
                {/*****************SELF Approval Card starts here **********/}
                  { taskDetails?.status == "in-review" &&
                    taskDetails?.createdby == userDetails?.id &&
                    !taskDetails.approval_template_master_id && 
                    <Card>
                    <div>
                      <Card.Header>
                          <h6>Approvals Self</h6>
                      </Card.Header>
                      <Card.Body>
                        {/* <Form.Control
                          rows={1}
                          placeholder="Enter Message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onFocus={()=>setSelfApproveError(false)}
                          type="text"
                          as="textarea"
                          className="mb-2"
                          required
                        />
                        {selfApproveError&&<span className="text-danger mb-2">Message Cannot be empty</span>} */}
                        <div className="approval-buttons mt-3 border-bottom-0">
                          <button
                            className="approve-button me-3"
                            onClick={() => approveTask("self")
                           }
                           disabled={approveLoader}
                          >
                           {approveLoader?<Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            /> :  "Approve"}
                          </button>
                          <button
                            className="approve-button reject-button me-3"
                            onClick={() => rejectTask("self")}
                            disabled={rejectLoader}
                          >
                            {rejectLoader?<Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            />:"Reject"}
                          </button>
                          {/* {approvalUserExits?.[0]?.force_approval && (<button className="approve-button force-button" onClick={() => forceApproveTask()}>Force Close</button>)} */}
                        </div>
                      </Card.Body>
                    </div>
                </Card> }
                  
                {/*****************Approvals Card starts here **********/}
                {approvalUserExits?.length > 0 &&
                    taskDetails?.status != "closed" &&!approvedOrRejected &&
                  <Card>
                    {!approvedOrRejected ? (
                      <div>
                        <Card.Header><h6>Approvals</h6></Card.Header>
                        <Card.Body>
                          <Form.Control
                            rows={1}
                            placeholder="Enter Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            type="text"
                            as="textarea"
                            className="my-4"
                            required
                            onFocus={()=>setMessageApprovalError(false)}
                          />
                          {approvalError&&<span className="text-danger mt-2 mb-4">Enter atleast 5 characters</span>}
                          <div className="approval-buttons pb-3">
                            <button
                              className="approve-button me-3"
                              onClick={() => approveTask("Approve")}
                              disabled={approveLoader}
                            >
                             {approveLoader?<Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            />:"Approve"} 
                            </button>
                            <button
                              className="approve-button reject-button me-3"
                              onClick={() => rejectTask("Reject")}
                              disabled={rejectLoader}
                            >
                              {rejectLoader?<Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            />:"Reject"}
                            </button>
                            {approvalUserExits?.[0]?.force_approval && (
                              <button
                                className="approve-button force-button"
                                onClick={() => forceApproveTask()}
                                disabled={forcecloseLoader}
                              >
                                {forcecloseLoader?<Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            />:"Force Close"}
                              </button>
                            )}
                          </div>
                        </Card.Body>
                      </div>
                    ) : (
                    null
                    )}
                     </Card>}
                     {approvingUsersData?.length > 0&&
                    <Card>
                    {approvingUsersData?.length > 0 ? (
                      <div>
                       {/* <Card.Body> */}
                        <h6 className="my-3">Approvals</h6>
                        <div className="d-flex approval-edit-avatar">
                          {approvingUsersData?.length > 0
                            ? approvingUsersData?.map((item, key) => {
                                return (
                                  <div
                                    key={key}
                                    className="me-3 position-relative"
                                  >
                                    {fetchUserToApprove(item.user_id)}
                                    {item.action_type == "approve" && (
                                                                        // <OverlayTrigger
                                    //   overlay={
                                    //     item?.approve_message ? (
                                    //       <Tooltip id="tooltip-task-name">
                                    //         {item?.approve_message}
                                    //       </Tooltip>
                                    //     ) : (
                                    //       <></>
                                    //     )
                                    //   }
                                    // >
                                    // </OverlayTrigger>
                                      <>

                                        <span className="approve-icon">
                                          <TiTick />
                                        </span>
                                    
                                      </>
                                    )}
                                    {item?.action_type == "reject" && (
                                      <OverlayTrigger
                                        overlay={
                                          item?.approve_message ? (
                                            <Tooltip id="tooltip-task-name">
                                              {item?.approve_message}
                                            </Tooltip>
                                          ) : (
                                            <></>
                                          )
                                        }
                                      >
                                        <span className="approve-icon reject-icon">
                                          <RxCross2 />
                                        </span>
                                      </OverlayTrigger>
                                    )}
                                    {item?.action_type == "force" && (
                                      <OverlayTrigger
                                        overlay={
                                          item?.approve_message ? (
                                            <Tooltip id="tooltip-task-name">
                                              {item?.approve_message}
                                            </Tooltip>
                                          ) : (
                                            <></>
                                          )
                                        }
                                      >
                                        <span className="approve-icon force-icon">
                                          <GoIssueOpened />
                                        </span>
                                      </OverlayTrigger>
                                    )}
                                  </div>
                                );
                              })
                            : "No User Found"}
                        </div>
                      {/* </Card.Body> */}
                      </div>
                    ) : (
                    null
                    )}
                  </Card>
                  }
                {/* ---------------------incoming task start------------------- */}
                {pending ? (
                  <Card className=" mb-3 no-border-card">
                    <Card.Header>
                      <div className="d-flex justify-content-between ">
                        <h6>Incoming Tasks</h6>
                      </div>
                    </Card.Header>
                    <Card.Body className="content">
                      <div className="d-flex align-items-center incoming-task mt-3">
                        <button
                          className="accept-btn"
                          onClick={acceptTaskHandle}
                        >
                          Accept
                        </button>
                        <button
                          className="reject-btn ms-3"
                          onClick={handleRejectTask}
                        >
                          Reject
                        </button>
                      </div>
                    </Card.Body>
                  </Card>
                ) : (
                  ""
                )}
                {/* ---------------------incoming task end------------------- */}
                {/*--------------------------------------Checklist Card Starts Hear ------------------------------------------------> */}
                <Card className=" mb-3">
                  <Card.Header>
                    <div>
                      <h6>Checklist</h6>
                      <button
                        type="button"
                        className="task-description-btn"
                        onClick={(e) => setAddChecklist(!showAddChecklist)}
                        disabled={statusInreview || pending || taskClosed}
                      >
                        {/* <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            /> :  */}
                        <FaPlus className="task-description-plus-icon" />
                      </button>
                    </div>
                    {showAddChecklist && (
                      <div className="mt-2" onBlur={(e) => addChecklist(e)}>
                        {/* <div className="col-1 Checklist-check">
                      <input
                        type="checkbox"
                        defaultChecked={checklistObj.is_done}
                        onChange={() => setChecklistObj({ ...checklistObj, is_done: !checklistObj.is_done })}
                        
                      />
                    </div> */}
                        <Form.Control
                          onChange={(e) =>
                            setChecklistObj({
                              ...checklistObj,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                  </Card.Header>
                  <Card.Body>
                    <div className="assignees-card">
                        {checklists?.length > 0
                          ? checklists?.map((item, key) => {
                              return (
                                <div className="d_aic_jcc gap-2">
                                  <div className="ms-1 Checklist-check">
                                    <input
                                      id={key}
                                      type="checkbox"
                                      checked={item.is_done}
                                      onChange={(e) => {
                                        checkUpdate(item, e);
                                      }}
                                    />
                                  </div>
                                  {/* <div className=""> */}
                                  {ChecklistTitleEdit &&
                                  item.id === checklistItem?.id ? (
                                    <Form.Control
                                      required
                                      type="text"
                                      onChange={(event) => {
                                        setCheckListTitle(event.target.value);
                                      }}
                                      onBlur={() => updateCheckListTitle(item)}
                                      className="form-control"
                                      value={ChecklistTitle}
                                    />
                                  ) : (
                                    <p
                                      onClick={() => editCheckListTitle(item)}
                                      className="checklist-para m-0"
                                    >
                                      {item.title}
                                    </p>
                                  )}
                                  {/* </div> */}
                                  <div>
                                    <button
                                      className="icon-buttons m-0 p-0"
                                      onClick={() => checklistDelete(item)}
                                      disabled={statusInreview || pending || taskClosed}
                                    >
                                      <FaTrashAlt />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          : !showAddChecklist && "No Checklist Found"}
                    </div>
                  </Card.Body>
                </Card>

                {/*--------------------------------------Checklist Card Ends Hear ------------------------------------------------> */}
                {/*--------------------------------------Assignees Card Starts Hear ------------------------------------------------> */}
                {showUpdateAssignees && (
                  <Card>
                    <Card.Header>
                      <div>
                        <h6>Users</h6>
                        <button type="button" className="task-description-btn" onClick={(e) => {setUpdateAssignees(!showUpdateAssignees);fetchExceptUsers();}} disabled={pending || taskClosed}>
                        {/* <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                          /> :  */}
                          <FaMinus className="task-description-plus-icon"/>
                        </button>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <input
                        className="form-control my-2"
                        type="search"
                        name="taskdetails-search"
                        placeholder="Search"
                        aria-label="Search"
                        onChange={(e) => {
                          setSearchUser(e.target.value);
                        }}
                      />
                      <div className="assignees-card">
                        {exceptedUsers?.length > 0
                          ? exceptedUsers?.map((item, key) => {
                              return (
                                <div className="assignees-cards">
                                  <div className="card-gt-body">
                                    <div className="d_aic_jcsb mt-2" key={key}>
                                      <div className="d-flex align-item-center gap-wd-capital">
                                        <Avatar
                                          color={item.color}
                                          initials={`${item.name
                                            .substring(0, 1)
                                            .toUpperCase()}${item.lastname
                                            .substring(0, 1)
                                            .toUpperCase()}`}
                                            image ={item.avatar}
                                        />
                                        <h5>{item?.name} {item?.lastname}</h5>
                                      </div>
                                      <Button className="icon-buttons-operatorbtn" disabled={statusInreview||taskClosed||pending}>
                                        <FaPlus onClick={() => addAssignee(item.id)}/>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          : "No Users Found"}
                      </div>
                    </Card.Body>
                  </Card>
                )}
                <Card>
                  <Card.Header>
                    <div>
                      <h6>Assignees</h6>
                      {/* {taskAssignees.length > 0 && showtoggleforUsers && <ReactSwitch
                    //  checked={checked1}
                    checked={checked1 || taskAssignees?.length == force_closers?.length ? true : false}
                    onChange={handleChange}

                  />
                  } */}
                      <button
                        type="button"
                        className="task-description-btn"
                        onClick={(e) => {
                          setUpdateAssignees(!showUpdateAssignees);
                          fetchExceptUsers();
                        }}
                        disabled={statusInreview || pending || taskClosed}
                      >
                        {/* <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        /> :  */}
                        <FaPlus className="task-description-plus-icon" />
                      </button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div className="assignees-card">
                    {taskAssignees?.length > 0
                      ? taskAssignees?.map((item, key) => {
                          return (
                            <div key={key}>{fetchAssignees(item, key)}</div>
                          );
                        })
                      : "No Assignees"}
                      </div>
                  </Card.Body>
                </Card>
                {/*-------------------------------------------------------Assignees Card Ends Hear ------------------------------------------------> */}
                {/*-------------------------------------------------------Attachments Card Starts Hear ------------------------------------------------> */}

                <Card>
                  <Card.Header>
                    <div>
                      <h6>Attachments</h6>
                      <button
                        type="button"
                        className="task-description-btn"
                        onClick={() => setShowAttchment(!showAttachment)}
                        disabled={statusInreview || pending || taskClosed}
                      >
                        {/* <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                          /> :  */}
                        <FaPlus className="task-description-plus-icon" />
                      </button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div className="assignees-card comments-section">
                        {showAttachment && (
                          <div>
                            <Form onSubmit={(e) => addAttachment(e)}>
                              <Form.Group controlId="formFile" className="mb-3">
                                <Form.Control
                                  placeholder="Select File to Upload"
                                  type="file"
                                  required
                                  onChange={(e) => setFile(e.target.files[0])}
                                />
                              </Form.Group>
                              <Button
                                variant="primary"
                                type="submit"
                                disabled={attachmentLoading}
                              >
                                {attachmentLoading ? (
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <span> Add</span>
                                )}
                              </Button>
                            </Form>
                          </div>
                        )}
                        {/*----------------------------------------------------Pdf  Ends Hear ------------------------------------------------> */}
                        {attachmentsList?.length > 0
                          ? attachmentsList?.map((item) => {
                              return (
                                <div className="gap-2 d_aic_jcsb ticket-attachments border-0">
                                  <FaFile className="Attachment-icon" />

                                  <h4 className=" m-0">{item.file_name}</h4>
                                  <div className="d_aic_jcc gap-2">
                                    <button
                                      className="icon-buttons-download"
                                      onClick={() => downloadFile(item)}
                                    >
                                      <FaRegEye />
                                    </button>
                                    <button
                                      className="icon-buttons"
                                      onClick={() => attachmentDelete(item.id)}
                                      disabled={statusInreview || pending || taskClosed}
                                    >
                                      <FaTrashAlt />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          : "No Attachments Found"}
                      {/*----------------------------------------------------Docs Ends Hear ------------------------------------------------> */}
                    </div>
                  </Card.Body>
                </Card>

                {/*----------------------------------------------------Attachments Card Ends Hear ------------------------------------------------> */}
                {/*----------------------------------------------------Reminders Starts Ends Hear ------------------------------------------------> */}

                {/* <Card className="Reminders-card no-border-card mb-3">
              <Card.Header>
                <Card.Title><h6>Reminders</h6> </Card.Title>
              </Card.Header>
              <Card.Body className="content">
                <div className=" mt-2 mb-2">
                  <div className="row reminder-box m-2">
                    <div className="col-lg-2 col-sm-4  p-0">
                      <span>
                        <input
                          className="reminder-radio"
                          checked={taskDetails.remainder_interval === ms("15m")}
                          onChange={(event) => {
                            setTaskDetails({
                              ...taskDetails,
                              remainder_interval: ms("15m"),
                            });
                          }}
                          type="radio"
                          name="fulfillment"
                          value={ms("15m".toString())}
                          id="fulfillment_15m"
                          disabled={statusInreview}
                        />
                        <label for="fulfillment_15m">15 Mins</label>
                      </span>
                    </div>
                    <div className="col-lg-2 col-sm-4  p-0">
                      <span>
                        <input
                          className="reminder-radio"
                          checked={taskDetails.remainder_interval === ms("30m")}
                          onChange={(event) => {
                            setTaskDetails({
                              ...taskDetails,
                              remainder_interval: ms("30m"),
                            });
                          }}
                          type="radio"
                          name="fulfillment"
                          value={ms("30m".toString())}
                          id="fulfillment_30m"
                          disabled={statusInreview}
                        />
                        <label for="fulfillment_30m">30 Mins</label>
                      </span>
                    </div>
                    <div className="col-lg-2 col-sm-4  p-0">
                      <span>
                        <input
                          checked={taskDetails.remainder_interval === ms("1h")}
                          onChange={(event) => {
                            setTaskDetails({
                              ...taskDetails,
                              remainder_interval: ms("1h"),
                            });
                          }}
                          className="reminder-radio"
                          type="radio"
                          name="fulfillment"
                          value={ms("1h".toString())}
                          id="fulfillment_1h"
                          disabled={statusInreview}
                        />
                        <label for="fulfillment_1h">1 Hrs </label>
                      </span>
                    </div>
                    <div className="col-lg-2 col-sm-4  p-0">
                      <span>
                        <input
                          checked={taskDetails.remainder_interval === ms("6h")}
                          onChange={(event) => {
                            setTaskDetails({
                              ...taskDetails,
                              remainder_interval: ms("6h"),
                            });
                          }}
                          className="reminder-radio"
                          type="radio"
                          name="fulfillment"
                          value={ms("6h".toString())}
                          id="fulfillment_6h"
                          disabled={statusInreview}
                        />
                        <label for="fulfillment_6h">6 Hrs </label>
                      </span>
                    </div>
                    <div className="col-lg-2 col-sm-4  p-0">
                      <span>
                        <input
                          checked={taskDetails.remainder_interval === ms("12h")}
                          onChange={(event) => {
                            setTaskDetails({
                              ...taskDetails,
                              remainder_interval: ms("12h"),
                            });
                          }}
                          type="radio"
                          className="reminder-radio"
                          name="fulfillment"
                          value={ms("12h".toString())}
                          id="fulfillment_12h"
                          disabled={statusInreview}
                        />
                        <label for="fulfillment_12h">12 Hrs </label>
                      </span>
                    </div>
                    <div className="col-lg-2 col-sm-4  p-0">
                      <span>
                        <input
                          checked={taskDetails.remainder_interval === ms("1d")}
                          onChange={(event) => {
                            setTaskDetails({
                              ...taskDetails,
                              remainder_interval: ms("1d"),
                            });
                          }}
                          className="reminder-radio"
                          type="radio"
                          name="fulfillment"
                          value={ms("1d".toString())}
                          id="fulfillment_1d"
                          disabled={statusInreview}
                        />
                        <label for="fulfillment_1d">1 Day </label>
                      </span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card> */}

                {/*----------------------------------------------------Reminders Card Ends Hear ------------------------------------------------> */}
                {/*----------------------------------------------------Assignee Force Approval card starts here ------------------------------------------------> */}
                {!pending&&taskDetails.status!="closed"&&taskDetails?.force_closers?.includes(userDetails?.id) && (
                  <Card>
                    <Card.Header>
                      <div>
                        <h6>Assignee Force Approval</h6>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <p className="mt-3">You can Force Close this Task</p>
                      <button
                        className="assignee-force-close"
                        onClick={() => approveTask("ForceClose")}
                      >
                        Force Close
                      </button>
                    </Card.Body>
                  </Card>
                )}
                {/*-------------------------------------------------Assignne Force Approval Card Ends Here---------------------------------------------------> */}
              </Col>
            </Row>
          </Container>
        </section>
      )}
    </div>
  );
}

export default TaskDetails;
