import { FaFilter, FaSearch, FaPlus } from "react-icons/fa";
import { BiLinkExternal, BiTrashAlt } from "react-icons/bi";
import { AiOutlineCheck } from "react-icons/ai";
import { MdClose } from "react-icons/md";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Avatar from "../components/Avatar";
import { getLocations } from "../redux/reducers/locationsReducer";
import { getDepartments } from "../redux/reducers/departmentReducer";
import { HiViewBoards } from "react-icons/hi";
import { getTaskPermisionByRole} from '../redux/reducers/rolesReducer'
import { getUsers, getOrgUsers, getTaskUserData } from "../redux/reducers/userReducer";
import { getGroups } from "../redux/reducers/groupReducer";
import Badge from "react-bootstrap/Badge";
import captialLetter from "../modules/CaptialLetter";
import {
  deleteTask,
  setButtonLoading,
  getAllTeamIds,
  getFilterTasks,
  setTaskTransferList,
  getAcceptTasks,
  getAlltasks_perUser,
  taksTransfer,
  setAccept_Task,
  getAll_tasksWithClosedTask,
  getSubtasks,
} from "../redux/reducers/taskReducer";
//setAccept_Task
import Button from "react-bootstrap/Button";
import Popover from "react-bootstrap/Popover";
import moment from "moment";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { BsFlagFill } from "react-icons/bs";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useNavigate } from "react-router-dom";
import NoDataFound from "../assets/No_Data_File.png";
import Form from "react-bootstrap/Form";
import LoaderComponent from "../components/Loader";
import AvatarStack from "../components/AvatarStack";
import {
  getpriorityConfig,
  getPriorityConfigList,
} from "../redux/reducers/priorityConfigReducer";
import {
  getStatusConfig,
  getAllTaksStatus,
} from "../redux/reducers/statusConfigReducer";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useRef } from "react";
import { MultiSelect } from "react-multi-select-component";
import DatePicker from "react-datepicker";
import { getAllUsers, getExceptUsers } from "../redux/reducers/userReducer";
import StatusBadge from "../components/StatusBadge";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import { Container, Row, Col, ModalFooter } from "react-bootstrap";

function Taskslist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const available_organizations = useSelector((state) => state.auth.available_organizations);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const locationsList = useSelector((state) => state.location.locationsList);
  const [organizationsdata, setorganizations] = useState({ data: available_organizations, name: "" });
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const taskToAccept = useSelector((state) => state.tasks.taskToAccept);
  const [isAccept, setIsAccept] = useState(false);
  const [status, setStatus] = useState("in-progress");
  const priorityChildConfig_List = useSelector((state) => state.priority.priorityChildList);
  const [teamsList, setTeamsList] = useState([]);
  const loader = useSelector((state) => state.tasks.loader);
  const taskCreated = useSelector((state) => state.tasks.taskCreated);
  const loading = useSelector((state) => state.tasks.buttonLoading);
  const usersList = useSelector((state) => state.users.usersList);
  const taskCreateData = useSelector((state) => state.users.userTaskData);
  const [userCurrentOrg, setUserCurrentOrg] = useState();
  const deleteResponse = useSelector((state) => state.tasks.deleteTaskResponse);
  const userOrgList = useSelector((state) => state.auth.userOrgDetails);
  const [fromUserError, setFromUserError] = useState("");
  const [toUserError, setToUserError] = useState("");
  const [countmodal, setCountModal] = useState(false);
  const current_organization = useSelector((state) => state.auth.current_organization);
  const orgListData = useSelector((state) => state.organization.organizationsList);
  const [deleteModal, setDeleteModal] = useState(false);
  const [assignees, setAssignedUsres] = useState([]);
  const [transferCount, setTransferCount] = useState(0);
  const [showTransferCount, setShowTransferCount] = useState(false);
  const [transferedUser, setTransferedUser] = useState();
  const [infinityCheck,setInfinityCheck] = useState(true)
  const [userSearch, setUserSearch] = useState("");
  const exceptedUsers = useSelector((state) => state.users.exceptedUsers);
  const [filterCheckData, setFilterCheckData] = useState([]);
  const transferList = useSelector((state) => state.tasks.tasksperUser);
  const userOrgData = useState(localStorage.getItem("userOrgData")&&JSON.parse(localStorage.getItem("userOrgData")));
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [from, setFrom] = useState(false);
  const [transferTaks, setTransferTasks] = useState([]);
  const [deleteId, setDeleteId] = useState({});
  const departmentsList = useSelector((state) => state.department.departmentsList);
  // console.log("departmentsList", departmentsList);
  const statusList = useSelector((state) => state.status.tasksStatus);
  const getPriorityList = useSelector((state) => state.priority.priorityConfigList);
  let priorityChildConfigList = useSelector((state) => state.priority.priorityChildConfigList);
  let originalPriorityConfig = useSelector((state) => state.priority.originalPriorityConfig);
  const statusConfigList = useSelector((state) => state.status.statusConfigList);
  let statusChildConfigList = useSelector((state) => state.status.statusChildConfigList);
  let originalStatusConfig = useSelector((state) => state.status.originalStatusConfig);
  const allTeamIds = useSelector((state) => state.tasks.teamIds);
  const AllUsers = useSelector((state) => state.users.usersList);
  const [showMe, setShowMe] = useState(false);
  const ref = useRef([]);
  const groupsList = useSelector((state) => state.groups.groupsList);
  const statusRef = useRef([]);
  // const permissions = useState(localStorage.getItem("permissions")&&JSON.parse(localStorage.getItem("permissions")));
  const [taskPermission, setTaskPermission] = useState([]);
  //apply filters set data
  const [checkpriority, setcheckpriority] = useState([]);
  const [childPriority, setChildPriority] = useState([]);
  const [checkstatus, setcheckstatus] = useState([]);
  const [childStatus, setChildStatus] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [filterDepartmentList, setFilterDepartmentList] = useState([]);
  const [filterLocationList, setFilterLocationList] = useState([]);
  const [selectedMe, setSelectedMe] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState(false);
  const [createTask_obj, setCreateTask_obj] = useState({
    start_date: new Date().toISOString(),
    due_date: new Date().toISOString(),
  });
  const [testing, setTesting] = useState(false);
  const [deletedItem, setDeltedItem] = useState(false);
  let priorityCount = 0;
  let statusCount = 0;
  const [prioritycount, setPriorityCount] = useState(0);
  const [statuscount, setStatusCount] = useState(0);
  const [taskDeletePermission,setTaskDeletePermission] = useState();
  const [meSelected, setMeSelected] = useState(false);
  const [teamSelected, setTeamSelected] = useState(false);
  const [fromUser, setFromUser] = useState();
  const [toUser, setToUser] = useState();
  const [filterLoader, setFilterLoader] = useState(false);
  const [noTaks, setNoTasks] = useState(false);
  const [btnloading, setBtnLoading] = useState(false);
  const [closedTaskList, setClosedTaskList] = useState(false);
  const orgId = useSelector((state) => state.auth.current_organization);
  const [subTaskCount, setSubTaskCount] = useState([{ id: 0, count: 0 }]);
  const [fiterDate, setFilterDate] = useState("empty");
  const [initialRender, setInitialRender] = useState(true);
  const tasks = useSelector((state) => state.tasks.tasks);
  const [newTasks, setNewTasks] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const observer = useRef();
  const [hide, setHide] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [filterSearch, setFilterSearch] = useState({
    name: "",
    date: "empty",
    assignee: "[]",
    team_tasks: [],
    is_closed: false,
    priority: [],
    status: [],
    from_date: "",
    to_date: "",
    limit: 20,
    offset: 0,
    department: [],
    location: [],
  });

  const payload = {
    array: assignees,
    name: userSearch,
  };

  if (originalPriorityConfig?.length > 0) priorityChildConfigList = originalPriorityConfig;

  if (originalStatusConfig?.length > 0) statusChildConfigList = originalStatusConfig;

  let statusChildList = statusList?.org_childs?.length
    ? statusList?.org_childs
    : statusList?.base_childs;

  const lastTaskElementRef = useCallback((node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && tasks.length >= filterSearch.limit) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });
      if (node) observer.current.observe(node);
    },

    [loading, hasMore, tasks]
  );


  useEffect(() => {
    if (!isAccept)
      dispatch(getFilterTasks(filterSearch))
        .then((res) => {
          handlePopoverContentClick();
          setFilterLoader(false);
        })
        .finally(() => {
          setInitialRender(false);
          setInfinityCheck(false);
        });
  }, [isAccept, filterSearch]);

  useEffect(() => {
    const ids = tasks.map((task) => task.id);
    const isExist = newTasks.some((task) => ids.includes(task.id));
    if (!isExist) {
      setNewTasks((prevTasks) => [...prevTasks, ...tasks]);
      setHasMore(tasks.length > 0);
    }
  }, [tasks]);

   useEffect(() => {
    setFilterSearch((prev) => ({ ...prev, offset: (pageNumber - 1) * prev.limit }))
  }, [pageNumber]);

  useEffect(() => {
    clearAllFilters();
  }, [deleteResponse, taskCreated]);

  const handleBackButton = () => {
    setInitialRender(true);
    dispatch(setAccept_Task(false));
    dispatch(getFilterTasks(filterSearch)).finally(() =>
      setInitialRender(false)
    );
    setIsAccept(false);
    setNewTasks([]);
    pageNumber(1);
  };

  const getUser = (user) => {
    setToUser(user);
  };
  
  useEffect(() => {
    return () => {
      dispatch(setAccept_Task(false));
    };
  }, []);

  const getFromUser = (selecteduser) => {
    if (!selectedUsers.includes(selecteduser.id)) {
      setSelectedUsers([selecteduser.id]);
      setFromUser(selecteduser);
      const data = exceptedUsers.filter((item) => item.id !== selecteduser.id);
      setFilterCheckData(data);
      if (!toUser?.id) {
        setFrom(true);
      }
    }
    if (selectedUsers.includes(selecteduser.id)) {
      setSelectedUsers(
        selectedUsers.filter((item) => item !== selecteduser.id)
      );
      setFromUser();
    }
  };

  // useEffect(() => {
  //   let permissionData = [...permissions];
  //   let taskPermission = permissionData[0]?.find(
  //     (item) => item.table == "tasks"
  //   );
  //   setTaskPermission(taskPermission);
  // }, [permissions]);

  const acceptTasks = () => {
    setInitialRender(true);
    dispatch(
      getAcceptTasks({
        userid: parseInt(userDetails.id),
        orgid: newTasks?.[0]?.org_id,
      })
    )
      .then((res) => {
        dispatch(setAccept_Task(true));
      })
      .finally(() => {
        setInitialRender(false);
      });
  };
  const getToUser = (item) => {
    const filterFromUser = exceptedUsers.filter(
      (item) => item.id !== fromUser?.id
    );
    const data = filterFromUser.filter((ele) => ele.id != item.id);
    setToUser(item);
    setFilterCheckData(data);
    fromUser?.id ? setFrom(true) : setFrom(false);
  };
  const filterSubTaskCount = (taskID) => {
    const filterCount = subTaskCount?.filter((item) => item?.id == taskID);
    if (!filterCount.length > 0) return "Loading...";
    return filterCount[0]?.count;
  };

  const fetchCommentAvatar = (id) => {
    if (usersList && usersList.length > 0) {
      let user = usersList?.find((item) => item.id === id);
      if (user) {
        return (
          <Avatar
            id={user.id}
            color={user.color}
            className="avatar-img"
            initials={`${user.name.substring(0, 1).toUpperCase()}${user.lastname
              .substring(0, 1)
              .toUpperCase()}`}
          />
        );
      }
    }
  };

  const priorityhandleCheck = (event, label) => {
    if (event.target.checked) {
      let updatedList = [...checkpriority, event.target.value];
      setcheckpriority(updatedList);
      let childList = [...childPriority, label];
      setChildPriority(childList);
    }
    if (!event.target.checked) {
      let updatedList = [...checkpriority];
      let updated_List = updatedList.splice(
        checkpriority.indexOf(event.target.value),
        1
      );
      setcheckpriority(updatedList);
      let childList = [...childPriority];
      childList.splice(childPriority.indexOf(label), 1);
      setChildPriority(childList);
    }
    for (var i = 0; i < ref.current.length; i++) {
      if (ref.current[i] != null) {
        if (ref.current[i].checked) {
          priorityCount++;
        }
      }
    }
    setPriorityCount(priorityCount);
  };
  const getTeamsData = () => {
    let dep = [];
    let dep_list = groupsList.map((item) => {
      dep.push({ label: `${item.title}`, value: `${item.id}` });
    });
    return dep;
  };

  const statushandleCheck = (event, label) => {
    if (event.target.checked) {
      let statusupdatedList = [...checkstatus, event.target.value];
      setcheckstatus(statusupdatedList);
      let childList = [...childStatus, label];
      setChildStatus(childList);
    }
    if (!event.target.checked) {
      let updatedList = [...checkstatus];
      updatedList.splice(checkstatus.indexOf(event.target.value), 1);
      setcheckstatus(updatedList);
      let childList = [...childStatus];
      childList.splice(childStatus.indexOf(label), 1);
      setChildStatus(childList);
    }

    for (var i = 0; i < statusRef.current.length; i++) {
      if (statusRef.current[i] != null) {
        if (statusRef.current[i].checked) {
          statusCount++;
        }
      }
    }
    setStatusCount(statusCount);
  };

  useEffect(() => {
    dispatch(getOrganizations(organizationsdata));
    dispatch(getGroups(""));
    dispatch(getUserOrgByid(userData?.[0].id));
    dispatch(getUsers("")).then((resp) => {
      let users = [];
      resp.payload?.map((item) => {
        users.push({
          label: `${item?.name} ${item?.lastname}`,
          value: item.id,
        });
      });
      setAllUsers(users);
    });
    dispatch(getTaskUserData(""));
    dispatch(getLocations(""));
    dispatch(getDepartments("")).then((res) => {
      // getDepartmentsData()
    });
    dispatch(getLocations(""));
    dispatch(getGroups(""));
    dispatch(getOrgUsers());
    dispatch(getpriorityConfig());
    dispatch(getStatusConfig());
    dispatch(getAllUsers(filterSearch));
    let payloadTeamIds = {
      input_id: userDetails.id,
    };
    dispatch(getExceptUsers(payload)).then((res) => {
      handleFilterData();
    });
    dispatch(getAllTeamIds(payloadTeamIds)).then((res) => {
      let fetchuserDetails = [];
      res?.payload?.data?.getTeamTasks?.data?.map((item) => {});
    });
    let modalPop = userOrgList?.find(
      (item) => item.org_id == current_organization
    );
    setUserCurrentOrg(modalPop);
    // setClosedTaskList(false)
  }, [deletedItem, taskToAccept]);

  const handleFilterData = () => {
    setFilterCheckData(exceptedUsers);
  };

  useEffect(() => {
    dispatch(getPriorityConfigList(orgId));
    dispatch(getAllTaksStatus(orgId));
  }, []);

  const get_ExceptUsers = () => {
    dispatch(getExceptUsers(payload)).then((res) => {
      handleFilterData();
    });
  };
  const updateStatus = (status, event) => {
    event.preventDefault();
    setStatus(status);
  };

  const get_tasks = () => {
    dispatch(getFilterTasks(filterSearch)).then((res) => {
      setInitialRender(false);

      let count_obj = [];
      const subTaskPromises = [];

      res?.payload?.forEach((task) => {
        const filterSubCount = subTaskCount.some((item) => item.id === task.id);

        if (!filterSubCount) {
          const subTaskPromise = dispatch(getSubtasks(parseInt(task.id))).then(
            (response) => {
              count_obj.push({ id: task.id, count: response.payload.length });
            }
          );
          subTaskPromises.push(subTaskPromise);
        }
      });

      Promise.all(subTaskPromises).then(() => {
        setSubTaskCount(count_obj);
        setClosedTaskList(false);
      });
    });
  };

  const getDepartmentsData = () => {
    let dep = [];
    let dep_list = departmentsList?.map((item) => {
      dep.push({ label: `${item.name}`, value: `${item.id}` });
    });
    return dep;
  };

  const getLocationData = () => {
    let dep = [];
    let dep_list = locationsList?.map((item) => {
      dep.push({ label: `${item.name}`, value: `${item.id}` });
    });
    return dep;
  };
  // const get_tasks = () => {
  //   dispatch(getAll_tasks(filterSearch)).then((res)=>{
  //     let count_obj=[]
  //     res?.payload.map((task)=>{
  //       const filterSubCount=subTaskCount.some((item)=>item.id==task.id)
  //       if(!filterSubCount){
  //         dispatch(getSubtasks(parseInt(task.id))).then((response)=>{
  //           count_obj.push({id:task.id,count:response.payload.length})
  //         })
  //       }
  //     })

  //   });
  //   setClosedTaskList(false);
  // };

  useEffect(() => {
    if (!transferList?.length > 0 && noTaks) {
      toast.error("No Tasks To Transfer");
    }
  }, [transferList]);

  useEffect(() => {
    if (userCurrentOrg?.role_id === 1 || userCurrentOrg?.role_id === 2) {
      setFromUser();
    }
    if (userCurrentOrg?.role_id === 3) {
      setFromUser(userDetails);
      setFrom(true);
      setEmployeeFilter(true);
      const data = exceptedUsers?.filter((item) => item.id != fromUser?.id);
      setFilterCheckData(data);
      // setSelectedUsers([userDetails.id])
      // const data=exceptedUsers.filter(item=>item.id!==userDetails.id)
      setFilterCheckData(data);
    }
  }, [userCurrentOrg, userDetails, exceptedUsers]);

  const handleSubmitTransfer = () => {
    if (toUser?.id && fromUser?.id) {
      let obj_transfer = {
        new_user_id: toUser?.id,
        old_user_id: fromUser?.id,
        tasks: transferTaks,
      };
      if (!transferTaks?.length > 0) {
        toast.error("Select Tasks To Transfer");
      }
      if (transferTaks.length > 0) {
        setBtnLoading(true);
        dispatch(taksTransfer(obj_transfer)).then((res) => {
          dispatch(getFilterTasks(filterSearch)).then((res) => {});
          setTransferTasks([]);
          setTesting(false);
          setBtnLoading(false);
          dispatch(setTaskTransferList(null));
          setFromUser();
          setTransferedUser(toUser);
          setToUser();
          setFrom(false);
          setTransferCount(transferTaks.length);
          setShowTransferCount(true);
        });
        setNoTasks(false);
      }
    }
    // if(!toUser?.id){
    //   toast.error("Select To User")
    // }
    // if(!fromUser?.id){
    //   toast.error("Select From User")
    // }
    // if(toUser?.id&&fromUser?.id){
    //   toast.error("Select From and To users")
    // }
  };
  const deleteDialog = async (item, event) => {
    event.preventDefault();
    setDeleteId(item);
    setDeleteModal(!deleteModal);
  };
  const onTransferHide = () => {
    setTesting(!testing);
    setToUser();
    dispatch(setTaskTransferList(null));
    if (!employeeFilter) {
      setFromUser();
      setFromUserError("");
      setFrom(false);
    }
    setTransferTasks([]);
    setToUserError("");
    setNoTasks(false);
    setBtnLoading(false);
  };
  const handleEmployee = () => {
    setFromUser(userDetails);
  };
  const Delete_Task = async () => {
    dispatch(setButtonLoading(true));
    dispatch(deleteTask(deleteId)).then((res) => {
      dispatch(setAccept_Task(false));
    });
    setDeltedItem(!deletedItem);
    setDeleteModal(!deleteModal);
  };

  useEffect(() => {
    dispatch(getTaskPermisionByRole(userOrgList[0].role_id)).then((taskres)=>{
      setTaskDeletePermission(taskres.payload.data.task_permissions[0].delete)
    })
    },[]);

  // useEffect(()=>{
  //     tasks?.length>0&&tasks?.map((taskId,index)=>{
  //       getSubTaskCount(taskId?.id)
  //     })

  // },[tasks])

  const getSubTaskCount = (taskId) => {
    dispatch(getSubtasks(parseInt(taskId)));
  };
  const handlePopoverContentClick = () => {
    setShowPopover(false);
  };
  const fetchUser = (id) => {
    let user = taskCreateData?.find((item) => item.id === id);
    return `${captialLetter(user?.name)} ${captialLetter(user?.lastname)}`;
  };
  const getAvatar = (user_id) => {
    let usernames = usersList?.find((i) => i.id == user_id);
    return usernames?.avatar;
  };
  const getOrgCode = (orgData, orgId) => {
    let data = orgData?.filter((item) => {
      return item?.id === orgId;
    });
    if (data?.length > 0) return data?.length == 0 ? "" : data[0]["uni_code"];
  };
  const fetchAvatarStack = (avatars) => {
    let avstarsFinal = [];
    avatars?.map((item) => {
      let user = usersList?.find((i) => i.id === item);
      user && avstarsFinal.push(user);
    });
    return (
      avstarsFinal?.length > 0 && (
        <AvatarStack limit={5} avatars={avstarsFinal} />
      )
    );
  };

  const handleClosePopover = () => {
    setShowPopover(false);
  };

  const handleTogglePopover = () => {
    setShowPopover(!showPopover);
  };

  const handleShowPopover = () => {
    setShowPopover(true);
  };

  //clear AllFilters Button Function
  const clearAllFilters = () => {
     // unchecked the priority
     for (let i = 0; i < ref.current.length; i++) {
      if (ref.current[i] != null) {
        ref.current[i].checked = false;
      }
    }
    // unchecked the status
    for (let i = 0; i < statusRef.current.length; i++) {
      if (statusRef.current[i] != null) {
        statusRef.current[i].checked = false;
      }
    }
    
    setFilterSearch({
      name: "",
      date: "empty",
      assignee: "[]",
      team_tasks: [],
      is_closed: false,
      priority: [],
      status: [],
      from_date: "",
      to_date: "",
      limit: 20,
      offset: 0,
      department: [],
      location: [],
    });
    setNewTasks([]);
    setPageNumber(1);
    setInitialRender(true);
    //reset all the values
    setStatusCount(0);
    setPriorityCount(0);
    setHide(true);
    setcheckpriority([]);
    setcheckstatus([]);
    setChildPriority([]);
    setChildStatus([]);
    setSelectedAssignees([]);
    setSelectedMe("");
    setFilterDate("empty");
    setCreateTask_obj({
      start_date: new Date().toISOString(),
      due_date: new Date().toISOString(),
    });
    setShowPopover(false);
  };

  //Apply  functions for selected filters
  const ApplyFilter = () => {
    setFilterLoader(true);
    setInitialRender(true);
    let due = new Date(createTask_obj.due_date).getTime();
    let start = new Date(createTask_obj.start_date).getTime();
    let teamAssignees = [];
    if (selectedAssignees.length > 0) {
      let department_list = teamsList?.map((obj) => obj.value);
      let usersIds = [];
      let assignee_list = [];
      department_list.forEach((item) => {
        groupsList.map((groupData) => {
          if (item == groupData.id) {
            usersIds.push(groupData.group_members);
          }
        });
      });
      usersIds.flat().map((item) => {
        if (!assignee_list.includes(item)) {
          assignee_list.push(item);
        }
      });
      teamAssignees = assignee_list;
    }
    let departmentIds = filterDepartmentList.map((item) =>
      parseInt(item?.value)
    );
    let locationIds = filterLocationList.map((item) => parseInt(item?.value))
    let filterAssignees= selectedAssignees.length>=1&&selectedAssignees?.map((obj) => obj.value)
    let payload = {};
    if (due - start === 0) {
      payload = {
        name: "",
        date: fiterDate,
        assignee:filterAssignees.length>0?`[${filterAssignees}]`:"[]",
        team_tasks: teamAssignees,
        priority: checkpriority,
        status: checkstatus,
        from_date: createTask_obj.start_date,
        to_date: createTask_obj.due_date,
        limit: filterSearch.limit,
        offset: filterSearch.offset,
        is_closed: false,
        department: departmentIds,
        location: locationIds,
      };
      setFilterSearch(payload);
    } else {
      payload = {
        name: "",
        date: fiterDate,
        assignee:filterAssignees.length>0?`[${filterAssignees}]`:"[]",
        team_tasks: teamAssignees,
        priority: checkpriority,
        status: checkstatus,
        from_date: createTask_obj.start_date,
        to_date: createTask_obj.due_date,
        limit: filterSearch.limit,
        offset: filterSearch.offset,
        is_closed: false,
        department: departmentIds,
        location: locationIds,
      };
      setFilterSearch(payload);
    }
  };

  //me Selected Assigee Function
  const MeSelected = () => {
    setMeSelected(true);
    setTeamSelected(false);
    setTeamsList([]);
    setShowMe(true);
    setSelectedMe("Me");
    setSelectedAssignees([
      {
        label: `${userDetails?.name} ${userDetails?.lastname}`,
        value: userDetails.id,
      },
    ]);
  };
  //My team Selected Assigee Function
  const TeamSelected = () => {
    setMeSelected(false);
    setTeamSelected(true);
    setShowMe(false);
    setSelectedMe("Team");
    let teamArray = [];
    //all Teams Ids map with
    allTeamIds?.map((user) => {
      let userdata = AllUsers.find((item) => user === item.id);
      teamArray.push({
        label: `${userdata?.name} ${userdata?.lastname}`,
        value: userdata.id,
      });
    });

    setSelectedAssignees(teamArray);
  };

  // To return the label with colot dot and name
  const label = (child) => {
    return (
      <div className="label-div">
        <div style={{ background: child.color }} className="label-dot"></div>
        <div className="label-name">{captialLetter(child.name)}</div>
      </div>
    );
  };

  // popover for filterstab start here
  const popover = (
    <Popover
      id="popover-basic"
      className="filters-popover"
      show={showPopover}
      onHide={handleClosePopover}
    >
      <Popover.Header
        as="h3"
        className="filters-popover-header m-2"
        closeButton
      >
        FILTER BY
      </Popover.Header>
      {/* <hr style={{ "all": "initial", "display": "block", "border-bottom": "1px dotted black", "margin-left": "auto"}} /> */}
      <Popover.Body className="assignes-card-body">
        <Tabs
          defaultActiveKey="Priority"
          id="justify-tab-example"
          className="filter_tabs"
          fill={true}
          justify={true}
        >
          {/* ///------first tab for priority----------Tab1 starts here---- */}
          <Tab eventKey="Priority" title="Priority">
            {/* get  priority list */}
            {Array.isArray(getPriorityList) &&
              getPriorityList?.map((priority,index) => {
                return priority.parent_id == null ? (
                  <div key={index}>
                    <h6 className="my-2 label-head">
                      {captialLetter(priority.name)}
                    </h6>
                    {priorityChildConfig_List?.map((child, key) => {
                      return priority.id == child?.parent_id ? (
                        <div className="ms-3 me-2">
                          <Form.Check
                            // style={{ color: child?.color }}
                            type="checkbox"
                            id={`default-checkbox${key}`}
                            label={label(child)}
                            checked={childPriority.includes(child?.name)}
                            onChange={(event) =>
                              priorityhandleCheck(event, child?.name)
                            }
                            value={child?.name}
                            ref={(child) => {
                              ref.current[key] = child;
                            }}
                            className="p-0 d-flex align-items-center gap-2 form-css"
                          />
                        </div>
                      ) : (
                        ""
                      );
                    })}
                  </div>
                ) : (
                  ""
                );
              })}
          </Tab>

          {/* ///------first tab for priority----------Tab1 ends here---- */}
          {/* ///------second tab for status----------Tab2 starts here---- */}
          <Tab eventKey="status" title="Status">
            {/* get status list */}
            {Array.isArray(statusConfigList) &&
              statusConfigList?.map((status, index) => {
                return status.parent_id == null ? (
                  <div>
                    <h6 className="my-2 label-head">
                      {captialLetter(status.name)}
                    </h6>
                    {statusChildList?.map((child, key) => {
                      return status.id == child?.parent_id ? (
                        <div className="ms-3 me-2">
                          <Form.Check
                            // style={{ color: child?.color }}
                            type="checkbox"
                            id={`default-checkbox ${key}`}
                            label={label(child)}
                            checked={childStatus.includes(child?.name)}
                            onChange={(event) =>
                              statushandleCheck(event, child?.name)
                            }
                            value={child?.name}
                            ref={(status) => {
                              statusRef.current[key] = status;
                            }}
                            className="p-0 d-flex align-items-center gap-2 form-css"
                          />
                        </div>
                      ) : (
                        ""
                      );
                    })}
                  </div>
                ) : (
                  ""
                );
              })}
          </Tab>
          {/* ///------second tab for status----------Tab2 ends here---- */}
          {/* ///------third tab for Assigee----------Tab3 starts here---- */}
          <Tab eventKey="assignee" title="Assignee">
            <div className="d-flex align-items-center gap-2 my-2">
              <Form.Check
                type="radio"
                label="Assigees"
                id={`default-radio1`}
                name="assignee"
                checked={selectedMe == "Me"}
                onClick={() => MeSelected(1)}
              />
              {/* <input
                  type="radio"
                  value="me"
                  name="assignee"
                  checked={selectedMe=="Me"}
                  onClick={() => MeSelected(1)}
                /> */}
              {/* <label>Assigees</label> */}
              <Form.Check
                type="radio"
                label="My Teams"
                id={`default-radio2`}
                name="assignee"
                checked={selectedMe == "Team"}
                onClick={() => TeamSelected(2)}
              />
              {/* <input
                  type="radio"
                  value="myTeam"
                  name="assignee"
                  checked={selectedMe=="Team"}
                  onClick={() => TeamSelected(2)}
                />
                <label>My Teams</label> */}
            </div>
            <Form.Group className="">
              <MultiSelect
                value={showMe ? selectedAssignees : teamsList}
                onChange={showMe ? setSelectedAssignees : setTeamsList}
                options={showMe ? allUsers : getTeamsData}
                labelledBy="Select"
                type="checkbox"
              />
            </Form.Group>
          </Tab>

          {/* ///------third tab for Assigee----------Tab3 ends here---- */}
          {/* ///------fourth  tab for startDate,Duedate----------Tab4 starts here---- */}
          <Tab eventKey="date" title="Date" className="date-tab">
            <div className="d_aic_jcsb gap-2 my-2">
              <Form.Check
                type="radio"
                label="Start"
                name="filterDate"
                id={`default-radio3`}
                checked={fiterDate == "startdate"}
                onChange={() => setFilterDate("startdate")}
              />
              <Form.Check
                type="radio"
                label="Due"
                id={`default-radio4`}
                name="filterDate"
                checked={fiterDate == "duedate"}
                onChange={() => setFilterDate("duedate")}
              />

              <Form.Check
                type="radio"
                label="None"
                id={`default-radio5`}
                name="filterDate"
                checked={fiterDate == "empty"}
                onChange={() => setFilterDate("empty")}
              />
            </div>
            <Form.Group className="my-2">
              <Form.Label>From</Form.Label>
              <DatePicker
                className="form-control"
                timeInputLabel="Time:"
                selected={new Date(createTask_obj.start_date)}
                // showTimeInput
                onChange={(date) => {
                  const selectedDate = new Date(date);
                  selectedDate.setHours(0, 0, 0, 0);
                  setCreateTask_obj({
                    ...createTask_obj,
                    start_date: selectedDate.toISOString(),
                  })
                }}
                // dateFormat="MM/dd/yyyy"
                dateFormat="eee, MMM dd, yyyy, h:mm aa"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>To</Form.Label>
              <DatePicker
                className="form-control"
                timeInputLabel="Time:"
                minDate={new Date(createTask_obj.start_date)}
                selected={new Date(createTask_obj.due_date)}
                onChange={(date) => {
                  const selectedDate = new Date(date);
                  selectedDate.setHours(23, 59, 0, 0);
                  setCreateTask_obj({
                    ...createTask_obj,
                    due_date: selectedDate.toISOString(),
                  })
                }}
                dateFormat="eee, MMM dd, yyyy, h:mm aa"
              />
            </Form.Group>
          </Tab>
          <Tab eventKey="department" title="Departments" className="date-tab">
            <Form.Group className="">
              <MultiSelect
                value={filterDepartmentList}
                onChange={setFilterDepartmentList}
                options={getDepartmentsData}
                labelledBy="Select"
                type="checkbox"
              />
            </Form.Group>
          </Tab>
          <Tab eventKey="locations" title="locations" className="date-tab">
            <Form.Group className="">
              <MultiSelect
                value={filterLocationList}
                onChange={setFilterLocationList}
                options={getLocationData}
                labelledBy="Select"
                type="checkbox"
              />
            </Form.Group>
          </Tab>
          {/* ///------fourth  tab for startDate,Duedate----------Tab4 ends here---- */}
        </Tabs>
        {/* <hr style={{ "all": "initial", "display": "block", "border-bottom": "1px dotted #ADADAD" }} /> */}
        <div className="d_aic_jcsb filter-footer pt-2 mt-3">
          <a
            className="filter-button-clear"
            onClick={() => {
              clearAllFilters();
              // setFilterApplied(false);
              setNewTasks([]);
              setPageNumber(1);
            }}
          >
            CLEAR ALL
          </a>

          <button
            type="button"
            className="btn btn-primary filter-button-apply filter-button-clear"
            onClick={() => {
              ApplyFilter();
              // setFilterApplied(true);
              setNewTasks([]);
              setPageNumber(1);
            }}
            disabled={
              (!checkpriority.length > 0 &&
                !checkstatus.length > 0 &&
                !selectedAssignees.length > 0&&! filterLocationList.length>0&&!filterDepartmentList.length>0) &&
               createTask_obj.start_date == createTask_obj.due_date || 
                filterLoader
            }
          >
            {filterLoader ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Apply"
            )}
          </button>
        </div>
      </Popover.Body>
    </Popover>
  );
  const addTaskTransfer = (item) => {
    if (!transferTaks.includes(item.id)) {
      setTransferTasks([...transferTaks, item.id]);
    }
    if (transferTaks.includes(item.id)) {
      const filterTasks = transferTaks.filter((task) => task != item?.id);
      setTransferTasks(filterTasks);
    }
  };
  const deleteTouser = (user, usertype) => {
    if (usertype == "to") {
      let filterFromUser = exceptedUsers.filter(
        (item) => item.id != fromUser?.id
      );
      // let added_filter = filterFromUser
      // added_filter.unshift(user)
      setFilterCheckData(filterFromUser);
      setToUser();
      setFrom(true);
    }
    // setDisableDropdown(!disableDropdown)
    // setSelectedUsers([])
    if (usertype == "from") {
      let filterToUser = exceptedUsers.filter((item) => item.id != toUser?.id);
      //   let added_filter = filterCheckData
      //  added_filter.unshift(user)
      setFilterCheckData(filterToUser);
      setFromUser();
      setFrom(false);
      // let added_filter = filteredUserData

      // // added_filter.unshift(user)
      // setFilteredUserData(added_filter)
      // setActivateTouserDropdown(!activateTouserDropdown)
    }
  };

  const handleTaskTransfer = () => {
    setTesting(!testing);
    if (!employeeFilter) {
      setFilterCheckData(exceptedUsers);
    }
    if (employeeFilter) {
      const data = exceptedUsers?.filter((item) => item.id != fromUser?.id);
      setFilterCheckData(data);
    }
  };
  const filterUsers = (search) => {
    const filter_users = exceptedUsers.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    const filterFromUser = filter_users.filter(
      (item) => item.id != fromUser?.id
    );
    const filterToUser = filterFromUser.filter((item) => item.id != toUser?.id);
    setFilterCheckData(filterToUser);
  };

  const toastTranferHandle = () => {
    toast.error("No Tasks To Transfer");
    setNoTasks(false);
  };
  const getuserTasks = () => {
    if (fromUser && toUser) {
      setBtnLoading(true);
      dispatch(getAlltasks_perUser({ userid: parseInt(fromUser?.id) })).then(
        (res) => {
          setBtnLoading(false);
        }
      );
      setFromUserError("");
      setToUserError("");
      setNoTasks(true);
    }
    if (!fromUser && !toUser) {
      setFromUserError("Select From user");
      setToUserError("Select To User");
    } else if (!fromUser) {
      setFromUserError("Select From user");
    } else if (!toUser) {
      setToUserError("Select To User");
    }
  };

  const getProgresscount = (transferList, type) => {
    if (type == "progress") {
      const progressCount = transferList.filter(
        (item) => item.status == "in-progress"
      );
      return progressCount.length;
    }
    if (type == "open") {
      const progressCount = transferList.filter(
        (item) => item.status == "open"
      );
      return progressCount.length;
    }
  };

  const handleTranferAll = (item) => {
    const data = item?.map((item) => item.id);
    if (transferTaks.length != data.length) {
      const filterData = data.filter(
        (item) => item != transferTaks.includes(item)
      );
      setTransferTasks(filterData);
    }

    //   if(!item.every(item=>item.id==transferTaks.includes(item.id))){
    //     let filterTransferData=data.filter(item=>item!=transferTaks.includes(item))
    //     setTransferTasks(filterTransferData)
    // }
    else {
      setTransferTasks([]);
    }
  };

  const handleFromUser = (selecteduser) => {
    setFrom(true);
    const data = exceptedUsers.filter((item) => item.id != fromUser?.id);
    setFilterCheckData(data);
  };

  const handleClosedTaskList = () => {
    setInitialRender(true);
    if (!closedTaskList) {
      let payload = { ...filterSearch, is_closed: true };
      setFilterSearch(payload);
    } else {
      let payload = { ...filterSearch, is_closed: false };
      setFilterSearch(payload);
    }
  };

  const transferDone = () => {
    setTransferCount(0);
    setShowTransferCount(false);
    setTransferedUser();
    window.location.reload();
  }
 
  return (
    <div>
      <>
        <section className="breadcum_section tasklist-section">
          <Container fluid>
            <Row className=" align-items-center justify-content-between">
              <Col sm={2}>
                <h2 className="bs_title">Tasks</h2>
              </Col>

              {/* <div className="col-sm-3">
                  {" "}
                  {true && (
                    <div className="row">
                      
                  
                      <div className="col-6">
                        {" "}
                        <div className="aside_left">
                          <Form.Select
                            onChange={(e) => {
                              setFilter({
                                ...filterSearch,
                                status: e.target.value,
                              });
                            }}
                          >
                            <option value="">Slect Statuss</option>
                            <option value="open">Open</option>
                            <option value="in-progress">In-Progess</option>
                            <option value="in-review">In-Review</option>
                            <option value="closed">Closed</option>
                          </Form.Select>
                        </div>
                      </div>
                      <div className="col-6">
                        {" "}
                        <div className="aside_left">
                          <Form.Select
                            onChange={(e) => {
                              setFilter({
                                ...filterSearch,
                                priority: e.target.value,
                              });
                            }}
                          >
                            <option value="">Select Priority</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </Form.Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div> */}
              <Col md={10} xs={12}>
                <div className="aside_left d-flex align-items-center flex-wrap justify-content-end gap_05rm">
                  {!taskToAccept ? (
                    <>
                      <div className="search-box">
                        <input
                          className="form-control text"
                          type="text"
                          name=""
                          placeholder="Search here"
                          value={filterSearch?.name}
                          autoFocus
                          onChange={(e) => {
                            setInitialRender(true);
                            setFilterSearch({
                              ...filterSearch,
                              name: e.target.value,
                            });
                            setNewTasks([]);
                            setPageNumber(1);
                          }}
                        />
                        <button>
                          {" "}
                          <FaSearch />
                        </button>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate("/boardview")}
                      >
                        BoardView
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate("/boarddata")}
                      >
                        <HiViewBoards />
                      </button>
                      <div className="Checklist-check d-flex align-items-center justify-content-center">
                        <OverlayTrigger
                          overlay={
                            <Tooltip id="tooltip-task-name">
                              {" "}
                              {closedTaskList
                                ? " Closed tasks"
                                : "Show Closed Task"}
                            </Tooltip>
                          }
                        >
                          <input
                            type="checkbox"
                            name=""
                            checked={closedTaskList}
                            onClick={() => {
                              handleClosedTaskList();
                              setClosedTaskList((prev) => !prev);
                              setPageNumber(1);
                              setNewTasks([]);
                            }}
                            id="myCheckbox"
                          />
                        </OverlayTrigger>
                        <label htmlFor="myCheckbox" className="content">
                          Closed tasks
                        </label>
                      </div>
                      {(userOrgData?.[0]?.role_id == 1 ||
                        userOrgData?.[0]?.role_id == 2) && (
                        <button
                          id="addTask"
                          type="button"
                          className="btn btn-primary"
                          onClick={handleTaskTransfer}
                        >
                          Task Transfer
                        </button>
                      )}

                      <button
                        id="addTask"
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          acceptTasks();
                          setNewTasks([]);
                          setPageNumber(1);
                          setIsAccept(true);
                        }}
                      >
                        Tasks To Accept
                      </button>

                      <OverlayTrigger
                        rootClose
                        trigger="click"
                        placement="bottom-end"
                        overlay={popover}
                        show={showPopover}
                        onHide={() => setShowPopover(false)}
                      >
                        <Button
                          id="showFilters"
                          variant="primary"
                          className="rounded-circle"
                          onClick={handleTogglePopover}
                        >
                          <span className="fa-fil m-0 d_aic_jcc">
                            {prioritycount + statuscount}
                          </span>

                          <FaFilter />
                        </Button>
                      </OverlayTrigger>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleBackButton}
                    >
                      Back
                    </button>
                  )}
                  {/* <button
                      id="addTask"
                      type="button"
                      className="btn btn-primary"
                      onClick={() => dispatch(setTaskAddform(!showAddform))}
                    >
                      Add Task
                    </button> */}
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* {showFilters && <section className='mb-5 mt-3'>
                        <div className='container'>
                            <div className='row'>
                                <div className='col-md-3'>
                                    <div className='aside_left'>
                                        <Form.Select onChange={(e) => { setFilter({ ...filterSearch, status: e.target.value }) }}>
                                            <option value=''>Select Status</option>
                                            <option value="open">Open</option>
                                            <option value="in-progress">In-Progess</option>
                                            <option value="in-review">In-Review</option>
                                            <option value="closed">Closed</option>
                                        </Form.Select>
                                    </div>
                                </div>
                                <div className='col-md-3'>
                                    <div className='aside_left'>
                                        <Form.Select onChange={(e) => { setFilter({ ...filterSearch, priority: e.target.value }) }}>
                                            <option value=''>Select Priority</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </Form.Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>} */}
          {initialRender ? (
            <LoaderComponent />
          ) : newTasks?.length > 0 ? (
        <section className="taskslist">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12">
                  <div className="table-responsive">
                    <table className="table table-style1">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Task Name</th>
                          {/* <th>Sub Task</th> */}
                          <th>Created By</th>
                          <th>Assignees</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newTasks?.map((task, index) => {
                          return (
                            <tr
                              ref={
                                newTasks.length === index + 1
                                  ? lastTaskElementRef
                                  : null
                              }
                              className="card-table"
                              key={index}
                            >
                              <td
                                onClick={(event) =>
                                  navigate(`/taskdetails/${task.id}`)
                                }
                              >
                                {getOrgCode(orgListData, task.org_id)}-
                                {task.task_code}
                              </td>
                              <td>
                                <div
                                  className="card-table-task-name d-flex align-item-center gap-2"
                                  onClick={(event) =>
                                    navigate(`/taskdetails/${task.id}`)
                                  }
                                >
                                  {priorityChildConfig_List?.map(
                                    (priority, index) => {
                                      return (
                                        task.internal_priority?.toLowerCase() ===
                                          priority.name.toLowerCase() && (
                                          <h5
                                            key={index}
                                            className="badge-icon-parent m-0 d_aic_jcc"
                                          >
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
                                  <OverlayTrigger
                                    overlay={
                                      <Tooltip id="tooltip-task-name">
                                        {" "}
                                        {captialLetter(task?.name)}
                                      </Tooltip>
                                    }
                                  >
                                    <div className="tn ttww task_name">
                                      {captialLetter(task?.name)}
                                    </div>
                                  </OverlayTrigger>
                                </div>
                              </td>

                              {/* <td>
                                <a className="d-flex align-items-center" onClick={() => setCountModal(true)}>
                                <div className="change-password py-2 px-2">{filterSubTaskCount(task?.id)}
                                </div>
                                </a>
                              </td> */}

                              <td
                                onClick={(event) =>
                                  navigate(`/taskdetails/${task.id}`)
                                }
                              >
                                {fetchUser(task.createdby)}
                                {/* {getAvatar(task?.createdby) != undefined || null ? <img src={getAvatar(task?.createdby)} alt="user-img" className="rounded-circle"/> : fetchUser(task.createdby).slice(0, 2)} */}
                              </td>
                              <td
                                onClick={(event) =>
                                  navigate(`/taskdetails/${task.id}`)
                                }
                              >
                                {task.assignee.length > 0
                                  ? fetchAvatarStack(task.assignee)
                                  : "No Assigees"}
                                {/* <div className='tn_assignees'>
                                      {task.assignee?.map((data) => {
                                        return (
                                          fetchCommentAvatar(data)
                                        )
                                      })}
                                     </div> */}
                              </td>

                              <td
                                onClick={(event) =>
                                  navigate(`/taskdetails/${task.id}`)
                                }
                              >
                                <div className="tn">
                                  {/* {moment(new Date(task.due_date), "YYYYMMDD").fromNow()} */}
                                  {moment(task.due_date).format(
                                    "ddd, MMM DD, YYYY, h:mm A"
                                  )}
                                </div>
                              </td>

                              <td
                                onClick={(event) =>
                                  navigate(`/taskdetails/${task.id}`)
                                }
                              >
                                {statusChildList?.map((status, statuskey) => {
                                  return (
                                    task.internal_status === status.name && (
                                      <StatusBadge status={status} />
                                    )
                                  );
                                })}
                                {/* {task.status === 'open' && <Badge className='status-badges' pill bg="success">Open</Badge>}
                                                                    {task.status === 'in-progress' && <Badge className='status-badges' pill bg="info">In-Progress</Badge>}
                                                                    {task.status === 'in-review' && <Badge className='status-badges' pill bg="warning">In-Review</Badge>}
                                                                    {task.status === 'closed' && <Badge className='status-badges' pill bg="danger">Closed</Badge>} */}
                              </td>

                              <td>
                                <div className="tb-actions d-flex align-item-center justify-content-start">
                                  <button
                                    id="taskDetails"
                                    className="btn-tl-actions"
                                    onClick={(event) =>
                                      navigate(`/taskdetails/${task.id}`)
                                    }
                                  >
                                    <BiLinkExternal />
                                  </button>
                                  <button
                                    id="taskDelete"
                                    className="btn-tl-actions"
                                    disabled={!taskDeletePermission}
                                    onClick={(event) =>
                                      deleteDialog(task, event)
                                    }
                                  >
                                    <BiTrashAlt />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {loader && (
                          <tr>
                            <td>Loading...</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
        </section>
          ) : (
            <div className="col-md-12 center text-center">
              <img src={NoDataFound} height="500px" alt="" />
            </div>
          )}
      </>

      <Modal
        show={deleteModal}
        onHide={() => setDeleteModal(!deleteModal)}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        scrollable={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>Task will be Deleted Permanently</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteModal(!deleteModal)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={Delete_Task} disabled={loading}>
            {loading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <span> Delete</span>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        scrollable={true}
        show={testing}
        onHide={onTransferHide}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="rounded-0 modal_forms modal-75w approvals-modal task-transfer-modal"
      >
        {Array.isArray(transferList) && transferList.length > 0 ? (
          ""
        ) : (
          <>
            <Modal.Header>
              <Row>
                <Col xl={8} lg={8}>
                  <div className="header d-flex align-items-center justify-content-between">
                    <h2 className="header m-0">TASK TRANSFER</h2>
                    <button
                      type="button"
                      className="btn p-0"
                      onClick={onTransferHide}
                    >
                      <MdClose className="fs-4" />
                    </button>
                  </div>
                </Col>
                <Col xl={4} lg={4}>
                  <h2 className="users-heading">
                    {from ? "Select To Users" : "Select From Users"}
                  </h2>
                </Col>
              </Row>
            </Modal.Header>
            <Modal.Body className="p-3 pt-0">
              <Container fluid>
                <Row className="approvals-size">
                  <Col xl={8} lg={8}>
                    <div className="d-flex flex-column align-content-between">
                      <div className="height_cal_modal">
                        <h6 className="m-0">From User</h6>
                        {fromUser ? (
                          <div className="assignees-cards my-2">
                            <div className="card-gt-body">
                              <div className="d-flex justify-content-between">
                                <div className="change-password_refer m-0 p-2 d-flex align-items-center gap-2 text-secondary">
                                  <Avatar
                                    color={fromUser?.color}
                                    initials={`${fromUser?.name
                                      .substring(0, 1)
                                      .toUpperCase()}${fromUser?.lastname
                                      .substring(0, 1)
                                      .toUpperCase()}`}
                                  />
                                  <p className="assidenedassignees m-0">
                                    {fromUser.name}
                                  </p>
                                  {userCurrentOrg?.role_id === 3 ? (
                                    ""
                                  ) : (
                                    <button
                                      type="button"
                                      className="approval-delete-btn m-0"
                                      onClick={() =>
                                        deleteTouser(fromUser, "from")
                                      }
                                    >
                                      <BiTrashAlt />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className=" d-flex justify-content-start text-secondary my-2">
                              <span
                                className="btn change-password_refer"
                                onClick={() => setFrom(false)}
                              >
                                Select one of the user from the right side panel
                              </span>
                            </div>
                            <span className="text-danger">{fromUserError}</span>
                          </>
                        )}
                        <h6 className="mt-3">To User</h6>
                        {!toUser ? (
                          <>
                            <button type="button" className="avatarr mb-2">
                              <span className="avatarr_plus_icon">
                                <FaPlus
                                  onClick={() => handleFromUser(selectedUsers)}
                                  //
                                  // setDisableDropdown(!disableDropdown)
                                  // setActivateTouserDropdown(true)}}
                                />
                              </span>
                            </button>
                            <span className="text-danger">{toUserError}</span>
                          </>
                        ) : (
                          <div className="assignees-cards mt-2 mb-4">
                            <div className="card-gt-body">
                              <div className="d-flex justify-content-between">
                                <div className="change-password_refer m-0 p-2 d-flex align-items-center gap-2 text-secondary">
                                  <Avatar
                                    color={toUser?.color}
                                    initials={`${toUser?.name
                                      .substring(0, 1)
                                      .toUpperCase()}${toUser?.lastname
                                      .substring(0, 1)
                                      .toUpperCase()}`}
                                  />
                                  <p className="assidenedassignees m-0">
                                    {toUser?.name}
                                  </p>
                                  <button
                                    type="button"
                                    className="approval-delete-btn m-0"
                                    onClick={() => deleteTouser(toUser, "to")}
                                  >
                                    <BiTrashAlt />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <ModalFooter className="m-0 w-100">
                          <div className="px-0 approvals-footer d_aic_jce gap-2">
                            <Button
                              className="cancel_btn"
                              variant="secondary"
                              onClick={onTransferHide}
                            >
                              CANCEL
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => {
                                getuserTasks();
                              }}
                            >
                              {" "}
                              {btnloading ? (
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                />
                              ) : (
                                <span>NEXT</span>
                              )}
                            </Button>
                          </div>
                        </ModalFooter>
                      </div>
                    </div>
                  </Col>
                  <Col xl={4} lg={4}>
                    <div className="task_transfer_card">
                      <div className="assignes-card-body">
                        <div className="position-relative mb-2">
                          <input
                            className="form-control creat-task-search"
                            type="text"
                            placeholder="Search"
                            name=""
                            aria-label="Search"
                            onChange={(e) => filterUsers(e.target.value)}
                          />
                          <span className="task_transfer_search_icon text-secondary">
                            <FaSearch />
                          </span>
                        </div>
                        {/* {userCurrentOrg?.role_id === 1 || userCurrentOrg?.role_id === 2 ?"":""} */}
                        <>
                          <ul className="p-0 avatar-list-items position-relative hctrl-200 task-list-scroll">
                            {filterCheckData?.map((item, id) => {
                              return (
                                <li className="d-flex align-items-center justify-content-between my-2">
                                  <Avatar
                                    color={item.color}
                                    initials={`${item.name
                                      .substring(0, 1)
                                      .toUpperCase()}${item.lastname
                                      .substring(0, 1)
                                      .toUpperCase()}`}
                                    image={item.avatar}
                                  />
                                  <h5 className="ttww text-start m-0 ms-2">
                                    {item.name.slice(0, 7)} {item.lastname}
                                  </h5>
                                  {/* <input
                    value={item.id}
                    type="checkbox"
                    checked={false}
                    name=""
                    onClick={() => {
                      from ? getToUser(item) : getFromUser(item);
                    }}
                  /> */}
                                  <Button
                                    className="icon-buttons-operatorbtn"
                                    onClick={() => {
                                      from
                                        ? getToUser(item)
                                        : getFromUser(item);
                                    }}
                                  >
                                    <FaPlus />
                                  </Button>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Container>
            </Modal.Body>
          </>
        )}
        {Array.isArray(transferList) && transferList?.length > 0 ? (
          <>
            <Modal.Header
              closeButton
              className="position-relative d-flex align-items-center justify-content-between"
            >
              <Modal.Title>
                <h2>Task TRANSFER-{transferList?.length}</h2>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Container fluid>
                <Row>
                  <Col lg={12}>
                    <div className="d-flex align-items-center justify-content-between">
                      <Form>
                        <Form.Check
                          type={"Checkbox"}
                          id={`Checkbox`}
                          label={
                            transferTaks.length == transferList.length
                              ? "De Select All"
                              : "Select All"
                          }
                          checked={transferTaks.length == transferList.length}
                          onClick={() => handleTranferAll(transferList)}
                          className="ms-3 m-0"
                        />
                      </Form>
                      <div className="d-flex gap-2 align-items-center">
                        <h5 className="badge-icon-parent m-0 d_aic_jcc">
                          <Badge
                            className="status-badges task-transfer-badge"
                            pill
                            bg="transparent"
                          >
                            Open-{getProgresscount(transferList, "open")}
                          </Badge>
                        </h5>
                        <h5 className="badge-icon-parent m-0 d_aic_jcc">
                          <Badge
                            className="status-badges task-transfer-badge"
                            pill
                            bg="transparent"
                          >
                            In-Progress-
                            {getProgresscount(transferList, "progress")}
                          </Badge>
                        </h5>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-style1">
                        <tbody>
                          {Array.isArray(transferList) &&
                            transferList?.map((item, key) => {
                              return (
                                <tr className="card-table">
                                  <td className="card-table-task-name">
                                    <div className="d_aic_jcsb gap-2">
                                      <div className="d-flex align-items-center gap-3">
                                        <Form.Check
                                          type={"checkbox"}
                                          key={item.id}
                                          checked={
                                            transferTaks.includes(item.id)
                                              ? true
                                              : false
                                          }
                                          onClick={() => addTaskTransfer(item)}
                                        ></Form.Check>
                                        <div>
                                          {/* <Badge
                                          bg="transparent"
                                          text="dark"
                                          className="p-0"
                                        > */}
                                          {/* <BsFlagFill /> */}
                                          {priorityChildConfig_List?.map(
                                            (priority, prioritykey) => {
                                              return (
                                                item?.internal_priority?.toLowerCase() ===
                                                  priority?.name?.toLowerCase() && (
                                                  <h5 className="badge-icon-parent m-0 d_aic_jcc">
                                                    <Badge
                                                      bg="transparent"
                                                      text="dark"
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
                                          {/* </Badge> */}
                                        </div>
                                      </div>
                                      <h6 className="m-0 ttww">{item.name}</h6>
                                      {statusChildList?.map(
                                        (status, statuskey) => {
                                          return (
                                            item.internal_status ===
                                              status.name && (
                                              <StatusBadge status={status} />
                                            )
                                          );
                                        }
                                      )}
                                    </div>

                                    {/* <Badge
                          className="status-badges task-transfer-badge"
                          pill
                          bg="transparent"
                        >
                          {item.status}
                        </Badge> */}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </Col>
                </Row>
              </Container>
            </Modal.Body>
            <Modal.Footer className="task_transfer_footer">
              <Button
                className="cancel_btn"
                variant="secondary"
                onClick={onTransferHide}
              >
                CANCEL
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitTransfer}
                disabled={btnloading}
              >
                {btnloading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <span> APPLY </span>
                )}
              </Button>
            </Modal.Footer>
          </>
        ) : (
          ""
        )}
      </Modal>
      <Modal
        show={showTransferCount}
        onHide={() => {
          setShowTransferCount(false);
        }}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="modal_forms modal-sm"
      >
        {/* <Modal.Header closeButton>
                      <Modal.Title className="modal-title text-center">
              <h2 className="text-center">Delete PersonalTodo</h2>
          </Modal.Title>
                    </Modal.Header> */}

        <Modal.Body className="text-center">
          <div className="d_aic_jcc icon_info mt-3 mb-4">
            <AiOutlineCheck className="i" />
          </div>
          <h3 className="text-center title mb-3">
            Successfully Transferred Task
          </h3>
          <p>
            {transferCount} Task has been assigned to {transferedUser?.name}
          </p>
        </Modal.Body>
        <Modal.Footer className="modal-footer-jcc border-0">
          <Button
            className="dark-btn"
            variant="primary"
            onClick={() => transferDone()}
          >
            Ok
          </Button>
          {/* <Button onClick={TodoDelete}  variant="primary" type="submit" disabled={loading}>
          {loading ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
          ) : (<span> Ok</span>)}
          </Button> */}
        </Modal.Footer>
      </Modal>
      <Modal
        show={countmodal}
        onHide={() => setCountModal(false)}
        centered
        className="modal_forms"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h2>Show Count</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>Content</Modal.Body>

        <Modal.Footer>
          <Button className="dark-btn" variant="secondary">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Taskslist;
//noTaks&&!transferList?.length>0?toastTranferHandle
