import { ToastContainer } from "react-toastify";
import { FaTimes, FaFilter, FaSearch, FaPlus } from "react-icons/fa";
import { BiLinkExternal, BiTrashAlt } from "react-icons/bi";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "react-bootstrap/Dropdown";
import Table from "react-bootstrap/Table";
import Avatar from "../components/Avatar";
import { avatarBrColors } from "../environment";
import { getLocations } from "../redux/reducers/locationsReducer";
import { getDepartments } from "../redux/reducers/departmentReducer";
import { getUsers, getOrgUsers } from "../redux/reducers/userReducer";
import { getGroups } from "../redux/reducers/groupReducer";
import Badge from "react-bootstrap/Badge";
import {
  setTaskAddform,
  getAll_tasks,
  deleteTask,
  setButtonLoading,
  getAllTeamIds,
  getFilterTasks,
  myApprovals, taskApprovalFilterQuery, taskRejectFilterQuery
} from "../redux/reducers/taskReducer";
import Button from "react-bootstrap/Button";
import Popover from "react-bootstrap/Popover";
import moment from "moment";
import Select from "react-select";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { BsFlagFill } from "react-icons/bs";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useNavigate } from "react-router-dom";
import { MdDateRange } from "react-icons/md";
import NoDataFound from "../assets/No_Data_File.png";
import Form from "react-bootstrap/Form";
import LoaderComponent from "../components/Loader";
import AvatarStack from "../components/AvatarStack";
import { getpriorityConfig,getPriorityConfigList} from "../redux/reducers/priorityConfigReducer";
import { getStatusConfig,getAllTaksStatus } from "../redux/reducers/statusConfigReducer";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useRef } from "react";
import { MultiSelect } from "react-multi-select-component";
import DatePicker from "react-datepicker";
import { getUserById } from "../redux/reducers/authReducer";
import { getAllUsers } from "../redux/reducers/userReducer";
import StatusBadge from "../components/StatusBadge";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import Card from "react-bootstrap/Card";
import FormCheckLabel from "react-bootstrap/esm/FormCheckLabel";

function Taskslist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orgId = useSelector((state) => state.auth.current_organization);
  const myApprovalTasks = useSelector((state) => state.tasks.myApprovalTasks);
  // console.log("myApprovalTasks",myApprovalTasks)
  const userDetails = useSelector((state) => state.auth.userDetails);
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [myApprovalSearch,setMyApprovalSearch]=useState("")
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const [filterSearch, setFilter] = useState({
    name: "",
    status: "",
    priority: "",
    assignee: [userDetails.id],
    created_by: userDetails.id,
  });

  const [status, setStatus] = useState("in-progress");
  const loader = useSelector((state) => state.tasks.loader);
  const showAddform = useSelector((state) => state.tasks.showTask);
  const loading = useSelector((state) => state.tasks.buttonLoading);
  const usersList = useSelector((state) => state.users.usersList);
  const deleteResponse = useSelector((state) => state.tasks.deleteTaskResponse);
  const orgListData = useSelector(
    (state) => state.organization.organizationsList
  );
  const priorityChildConfig_List=useSelector((state)=>state.priority.priorityChildList);
  const statusList = useSelector(
    (state) => state.status.tasksStatus
  );
  // console.log("priorityChildConfig_List",priorityChildConfig_List)
  const tasks = useSelector((state) => state.tasks.tasks);
  const [showFilters, setShowFilter] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState({});
  let statusChildList = statusList?.org_childs?.length ? statusList?.org_childs : statusList?.base_childs;
  const getPriorityList = useSelector(
    (state) => state.priority.priorityConfigList
  );
  const statusConfigList = useSelector(
    (state) => state.status.statusConfigList
  );
  const allTeamIds = useSelector((state) => state.tasks.teamIds);
  const AllUsers = useSelector((state) => state.users.usersList);
  const tabtaskFilter = useSelector((state) => state.tasks.tasksTabFilter);
  const ref = useRef([]);
  const priorityref = useRef([]);
  const statusRef = useRef([]);
  const [meSelected, setMeSelected] = useState(false);
  const [teamSelected, setTeamSelected] = useState(false);
  const [fromUser, setFromUser] = useState();
  const [toUser, setToUser] = useState();
  const [approvalCheck,setApprovalCheck]=useState("pending")
  const [filterSearchType, setfilterSearchType] = useState({ "type": "" })
  const userId = useSelector((state) => state.auth.user_id);
  //taskApprovalList
  const getTaskApprovalList = useSelector((state) => state.tasks.taskApprovalList);
  const getTaskRejectList = useSelector((state) => state.tasks.taskRejectList)
  // console.log("getTaskApprovalList",getTaskApprovalList);
  // console.log("getTaskRejectList",getTaskRejectList);
  // console.log("userDetails",userDetails.id);

  // const [usersData, setUsersData] = useState([{id:1,name : "hari"},{id:2,name : "ravi"},{id:3,name : "ganesj"},{id:4,name : "hemanth"},{id:6,name : "kiran"}])

  const getUser = (user) => {
    // console.log(user,"uuuuu")
    //   const newUsers =  usersData.filter(u => u.id !== user.id)
    //   setUsersData(newUsers);
    setToUser(user);
  };

  useEffect(() => {
    if (tasks) {
      getMyapprovalTasks();
    }
  }, [tasks])
  useEffect(()=>{
    dispatch(getPriorityConfigList(orgId))
    dispatch(getAllTaksStatus(orgId));
},[])

  useEffect(()=>{
    if(approvalCheck=="pending"){
      getMyapprovalTasks()
    }
    if(approvalCheck=="rejected"){
      let payLoad = {
        name: myApprovalSearch,
      }
      dispatch(taskRejectFilterQuery(payLoad))
    }
    if(approvalCheck=="approval"){
      let payLoad = {
        name: myApprovalSearch,
      }
      dispatch(taskApprovalFilterQuery(payLoad))

    }

  },[myApprovalSearch])

  const getMyapprovalTasks = () => {
    let payLoad = {
      name: myApprovalSearch,
      //orgid: tasks?.[0]?.org_id
    }
    dispatch(myApprovals(payLoad));

  }

  let usersData = [
    { id: 1, name: "hari" },
    { id: 2, name: "ravi" },
    { id: 3, name: "ganesj" },
    { id: 4, name: "hemanth" },
    { id: 6, name: "kiran" },
  ];
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
  //apply filters set data
  const [checkpriority, setcheckpriority] = useState([]);
  const [checkstatus, setcheckstatus] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [createTask_obj, setCreateTask_obj] = useState({
    start_date: new Date().toISOString(),
    due_date: new Date().toISOString(),
  });
  const [testing, setTesting] = useState(false);
  const [deletedItem, setDeltedItem] = useState(false);

  const priorityhandleCheck = (event) => {
    var updatedList = [...event.target.value];
    if (event.target.value) {
      updatedList = [...checkpriority, event.target.value];
    } else {
      updatedList.splice(checkpriority.indexOf(event.target.value), 1);
    }
    setcheckpriority(updatedList);
  };

  const statushandleCheck = (event) => {
    var statusupdatedList = [...event.target.value];
    if (event.target.value) {
      statusupdatedList = [...checkstatus, event.target.value];
    } else {
      statusupdatedList.splice(checkstatus.indexOf(event.target.value), 1);
    }
    setcheckstatus(statusupdatedList);
  };

  useEffect(() => {
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
    dispatch(getUsers("")).then((resp) => {
      let users = [];
      resp.payload.map((item) => {
        users.push({
          label: `${item?.name} ${item?.lastname}`,
          value: item.id,
        });
      });
      setAllUsers(users);
    });
    dispatch(getDepartments(""));
    dispatch(getLocations(""));
    dispatch(getGroups(""));
    dispatch(getOrgUsers());
    dispatch(getpriorityConfig());
    dispatch(getStatusConfig());
    dispatch(getAllUsers(filterSearch));
    let payloadTeamIds = {
      input_id: userDetails.id,
    };
    dispatch(getAllTeamIds(payloadTeamIds)).then((res) => {
      let fetchuserDetails = [];
      res.payload.data.getTeamTasks.data.map((item) => { });
    });
  }, [deletedItem]);
  const updateStatus = (status, event) => {
    event.preventDefault();
    setStatus(status);
  };
  const get_tasks = () => {
    dispatch(getAll_tasks(filterSearch));
  };
  useEffect(() => {
    get_tasks();
  }, [filterSearch, deleteResponse]);
  const deleteDialog = async (item, event) => {
    event.preventDefault();
    setDeleteId(item);
    setDeleteModal(!deleteModal);
  };
  const Delete_Task = async () => {
    dispatch(setButtonLoading(true));
    dispatch(deleteTask(deleteId)).then((res) => {
      dispatch(getAll_tasks(filterSearch));
    });
    setDeltedItem(!deletedItem);
    setDeleteModal(!deleteModal);
  };
  const fetchUser = (id) => {
    let user = usersList?.find((item) => item.id === id);
    return `${user?.name} ${user?.lastname}`;
  };
  const getOrgCode = (orgData, orgId) => {
    let data = orgData?.filter((item) => {
      return item?.id === orgId;
    });
    return data[0]["uni_code"];
  };
  const fetchAvatarStack = (avatars) => {
    let avstarsFinal = [];
    avatars.map((item) => {
      let user = usersList?.find((i) => i.id === item);
      user && avstarsFinal.push(user);
    });
    return (
      avstarsFinal.length > 0 && (
        <AvatarStack limit={5} avatars={avstarsFinal} />
      )
    );
  };

  //clear AllFilters Button Function
  const clearAllFilters = () => {
    // unchecked the priority
    for (let i = 0; i < ref.current.length; i++) {
      ref.current[i].checked = false;
    }
    // unchecked the status
    for (let i = 0; i < statusRef.current.length; i++) {
      statusRef.current[i].checked = false;
    }
    //reset all the values
    setcheckpriority([]);
    setcheckstatus([]);
    setSelectedAssignees([]);
    setCreateTask_obj({
      start_date: new Date().toISOString(),
      due_date: new Date().toISOString(),
    });
    get_tasks(); //trigger getAlltask Api
  };
  //Apply  functions for selected filters
  const ApplyFilter = () => {
    let due = new Date(createTask_obj.due_date).getTime();
    let start = new Date(createTask_obj.start_date).getTime();
    // console.log("mdsbvhcjf", due, start, due - start === 0);
    let payload = {};
    if (due - start === 0) {
      payload = {
        name: "",
        assignee:
          selectedAssignees.length === 1
            ? `${selectedAssignees.map((obj) => obj.value)}`
            : "[]",
        team_tasks:
          selectedAssignees.length === 1 || selectedAssignees.length === 0
            ? []
            : selectedAssignees.map((obj) => obj.value),
        priority: checkpriority,
        status: checkstatus,
        start_date: "",
        due_date: "",
        limit: 16,
        offset: 0,
      };
    } else {
      payload = {
        name: "",
        assignee:
          selectedAssignees.length === 1
            ? `${selectedAssignees.map((obj) => obj.value)}`
            : "[]",
        team_tasks:
          selectedAssignees.length === 1 || selectedAssignees.length === 0
            ? []
            : selectedAssignees.map((obj) => obj.value),
        priority: checkpriority,
        status: checkstatus,
        start_date: createTask_obj.start_date,
        due_date: createTask_obj.due_date,
        limit: 16,
        offset: 0,
      };
    }

    // console.log("payload---------", payload);
    dispatch(getFilterTasks(payload));
    //current checked for priority as false
    for (let i = 0; i < ref.current.length; i++) {
      ref.current[i].checked = false;
    }
    //current checked for status as  false
    for (let i = 0; i < statusRef.current.length; i++) {
      statusRef.current[i].checked = false;
    }
    //reset all the values
    setcheckpriority([]);
    setcheckstatus([]);
    setSelectedAssignees([]);
    setCreateTask_obj({
      start_date: new Date().toISOString(),
      due_date: new Date().toISOString(),
    });
    get_tasks(); //
  };

  //me Selected Assigee Function
  const MeSelected = () => {
    setMeSelected(true);
    setTeamSelected(false);
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
    let teamArray = [];
    //all Teams Ids map with
    allTeamIds.map((user) => {
      let userdata = AllUsers.find((item) => user === item.id);
      teamArray.push({
        label: `${userdata?.name} ${userdata?.lastname}`,
        value: userdata.id,
      });
    });

    setSelectedAssignees(teamArray);
  };

  //filters task approval and reject button functionality

  let taskFilterHandler = e => {
    if (e.target.value == "approval") {
      setApprovalCheck("approval")
      let payLoad = {
        name: myApprovalSearch,
      }
      dispatch(taskApprovalFilterQuery(payLoad))
    }
    else if (e.target.value == "rejected") {
      setApprovalCheck("rejected")
      let payLoad = {
        name: myApprovalSearch
      }
      dispatch(taskRejectFilterQuery(payLoad))
    }
    else if (e.target.value == "pending") {
      // console.log("pendinggggg")
      setApprovalCheck("pending")
      let payLoad = {
        name: myApprovalSearch
      }
      dispatch(myApprovals(payLoad));


    }
  }



  // popover for filterstab start here
  const popover = (
    <Popover id="popover-basic" className="filters-popover">
      <Popover.Header as="h3" className="filters-popover-header m-2">
        FILTER BY
      </Popover.Header>
      {/* <hr style={{ "all": "initial", "display": "block", "border-bottom": "1px dotted black", "margin-left": "auto"}} /> */}
      <Popover.Body className="assignes-card-body">
        <Tabs
          defaultActiveKey="Priority"
          id="justify-tab-example"
          className="mb-3 filter-tab d-flex p-1 cust-tabed"
          fill
        >
          {/* ///------first tab for priority----------Tab1 starts here---- */}
          <Tab eventKey="Priority" title="Priority" className="filter-by">
            {/* get  priority list */}

            {Array.isArray(getPriorityList) && getPriorityList?.map((priority, key) => {
              return (
                <div className="d-flex align-items-center priorityTab">
                  <Form.Check
                    type="checkbox"
                    id={`default-checkbox`}
                    label={
                      priority?.name.charAt(0).toUpperCase() +
                      priority?.name.slice(1)
                    }
                    onChange={priorityhandleCheck}
                    value={priority.name}
                    ref={(priority) => {
                      ref.current[key] = priority;
                    }}
                    className="ms-2"
                  />
                </div>
              );
            })}
          </Tab>

          {/* ///------first tab for priority----------Tab1 ends here---- */}
          {/* ///------second tab for status----------Tab2 starts here---- */}
          <Tab eventKey="status" title="Status">
            {/* get status list */}
            {Array.isArray(statusConfigList)&& statusConfigList?.map((status, key) => {
              return (
                <div className="d-flex align-items-center priorityTab">
                  <Form.Check
                    type="checkbox"
                    id={`default-checkbox`}
                    label={
                      status?.name.charAt(0).toUpperCase() +
                      status?.name.slice(1)
                    }
                    onChange={statushandleCheck}
                    value={status.name}
                    ref={(status) => {
                      statusRef.current[key] = status;
                    }}
                    className="ms-3"
                  />
                </div>
              );
            })}
          </Tab>
          {/* ///------second tab for status----------Tab2 ends here---- */}
          {/* ///------third tab for Assigee----------Tab3 starts here---- */}
          <Tab eventKey="assignee" title="Assignee">
            <div className="d-flex align-items-center">
              <div className="d-flex align-items-center">
                <input
                  type="radio"
                  value="me"
                  name="assignee"
                  onClick={() => MeSelected(1)}
                />
                <label className="p-1">Me</label>
              </div>

              <div className="d-flex align-items-center pl-5">
                <input
                  type="radio"
                  value="myTeam"
                  name="assignee"
                  onClick={() => TeamSelected(2)}
                />
                <label className="p-1">My Team</label>
              </div>
            </div>
            <Form.Group className="mb-1">
              <MultiSelect
                value={selectedAssignees}
                onChange={setSelectedAssignees}
                options={allUsers}
                labelledBy="Select"
                type="checkbox"
              />
            </Form.Group>
          </Tab>

          {/* ///------third tab for Assigee----------Tab3 ends here---- */}
          {/* ///------fourth  tab for startDate,Duedate----------Tab4 starts here---- */}
          <Tab eventKey="date" title="Date">
            <Form.Group className="mb-3">
              <Form.Label className="d-flex icon_space">From</Form.Label>
              <DatePicker
                className="form-control"
                timeInputLabel="Time:"
                selected={new Date(createTask_obj.start_date)}
                onChange={(date) =>
                  setCreateTask_obj({
                    ...createTask_obj,
                    start_date: new Date(date).toISOString(),
                  })
                }
                // dateFormat="MM/dd/yyyy"
                dateFormat="MMMM dd yyyy, h:mm:ss a"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <DatePicker
                className="form-control"
                timeInputLabel="Time:"
                minDate={new Date(createTask_obj.start_date)}
                selected={new Date(createTask_obj.due_date)}
                onChange={(date) =>
                  setCreateTask_obj({
                    ...createTask_obj,
                    due_date: new Date(date).toISOString(),
                  })
                }
                dateFormat="MMMM dd yyyy, h:mm:ss a"
              />
            </Form.Group>
          </Tab>
          {/* ///------fourth  tab for startDate,Duedate----------Tab4 ends here---- */}
        </Tabs>
        {/* <hr style={{ "all": "initial", "display": "block", "border-bottom": "1px dotted #ADADAD" }} /> */}
        <div className="d-flex justify-content-between align-items-center filter-footer pt-3 mt-3">
          <a className="filter-button-clear" onClick={clearAllFilters}>
            CLEAR ALL
          </a>
          <button
            type="button"
            className="btn btn-primary filter-button-apply filter-button-clear"
            onClick={ApplyFilter}
          >
            Apply
          </button>
        </div>
      </Popover.Body>
    </Popover>
  );
  // console.log(myApprovalTasks, 'myApprovalTasksmyApprovalTasks');




  return (
    <div>
      {loader ? (
        <LoaderComponent />
      ) : (
        <>
          <section className="breadcum_section">
            <div className="container-fluid">
              <div className="row align-items-center justify-content-between">
                <div className="col-lg-3">
                  <h2 className="bs_title">My Approvals</h2>
                </div>
                {/* <div className="col-sm-3">
                  {" "}
                  {showFilters && (
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
                <div className="col-lg-6">
                  <div className="aside_left d-flex align-items-center justify-content-end gap_05rm">
                    <div className="search-box">
                      <input
                        className="form-control text"
                        type="text"
                        name="myApprovalSearch"
                        placeholder="Search here"
                        value={myApprovalSearch}
                        autoFocus
                        onChange={(e) => {
                          setMyApprovalSearch(
                          e.target.value.toLowerCase(),
                          );
                        }}
                      />
                      <button>
                        {" "}
                        <FaSearch />
                      </button>
                    </div>
                    <div className="draft-tasks">
                      <Form.Select
                        onChange={taskFilterHandler}
                        className="filter-task-type"
                      >
                        <option value="pending">Pending</option>
                        <option value="approval">Approved</option>
                        <option value="rejected">Rejected</option>
                      </Form.Select>
                    </div>
                    {/* <button
                      id="addTask"
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setTesting(!testing)}
                    >
                      TASK TRANSFER
                    </button> */}
                    {/* <OverlayTrigger
                      trigger="click"
                      placement="bottom-end"
                      overlay={popover}
                    >
                      <Button
                        id="showFilters"
                        variant="primary"
                        className="filter-btn"
                      >
                        <FaFilter />
                      </Button>
                    </OverlayTrigger> */}
                    {/* <button
                      id="addTask"
                      type="button"
                      className="btn btn-primary"
                      onClick={() => dispatch(setTaskAddform(!showAddform))}
                    >
                      Add Task
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
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

          {Array.isArray(myApprovalTasks)&&myApprovalTasks?.length > 0 ? (
            <section>
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-12">
                    <div className="table-responsive">
                      <table className="table table-style1">
                        <thead>
                          <tr>
                            <th>Code</th>
                            <th>Task Name</th>
                            <th>Created By</th>
                            <th>Assignees</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(myApprovalTasks)&&myApprovalTasks?.map((task, key) => {
                            return (
                              <tr className="card-table" id={key}>
                                <td>
                                  {getOrgCode(orgListData, task?.org_id)}-
                                  {task?.task_code}
                                </td>
                                <td className="card-table-task-name d-flex align-item-center gap-2">
                                  {priorityChildConfig_List?.map(
                                    (priority, prioritykey) => {
                                      return (
                                        task.internal_priority == priority?.name && (
                                          <h5 className="badge-icon-parent m-0 d_aic_jcc">
                                            <Badge bg="light" text="dark" className="p-0"><BsFlagFill color={priority?.color} /></Badge>
                                          </h5>
                                        )
                                      );
                                    }
                                  )}
                                  <OverlayTrigger
                                    overlay={
                                      <Tooltip id="tooltip-task-name">
                                        {" "}
                                        {task?.name?.charAt(0).toUpperCase() + task?.name?.slice(1)}
                                      </Tooltip>
                                    }
                                  >
                                    <div className="tn">{task?.name?.charAt(0).toUpperCase() + task?.name?.slice(1)}</div>
                                  </OverlayTrigger>
                                </td>
                                <td><div className="tn">{fetchUser(task?.createdby)}</div></td>
                                <td>
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

                                <td>
                                  <div className="tn">
                                    {/* {moment(new Date(task.due_date), "YYYYMMDD").fromNow()} */}
                                    {moment(task?.due_date).format("ddd, MMM DD, YYYY, h:mm A")}
                                  </div>
                                </td>

                                <td>
                                  {statusChildList?.map(
                                    (status, statuskey) => {
                                      return (
                                        task.internal_status === status?.name && (
                                          <StatusBadge status={status} />
                                        )
                                      );
                                    }
                                  )}
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
                                        navigate(`/taskdetails/${task?.id}`)
                                      }
                                    >
                                      <BiLinkExternal />
                                    </button>
                                    {/* <button
                                      id="taskDelete"
                                      className="btn-tl-actions"
                                      onClick={(event) =>
                                        deleteDialog(task, event)
                                      }
                                    >
                                      <BiTrashAlt />
                                    </button> */}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
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
      )}

      <Modal
        show={deleteModal}
        onHide={() => setDeleteModal(!deleteModal)}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
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
        show={testing}
        onHide={() => setTesting(!testing)}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        dialogClassName=""
        className="rounded-0 modal_forms modal-75w todo_card"
      >
        <div className="container-fluid">
          <div className="row">
            <div className="col-7 p-0">
              <Modal.Header closeButton>
                <Modal.Title>
                  <h2>Task TRANSFER</h2>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="task-transfer">
                <h6>Form User</h6>
                {toUser ? (
                  <div className="d-flex justify-content-between">
                    <div className="change-password_refer mb-3 p-2 d-flex gap-3 text-secondary task-transfer">
                      <div>avatar</div>
                      <p className="m-0">{toUser.name}</p>
                      <BiTrashAlt className="text-secondary" />
                    </div>
                  </div>
                ) : (
                  <div className=" d-flex justify-content-start text-secondary">
                    <p className="btn change-password_refer mt-2">
                      Select One of the user from the right side panel
                    </p>
                  </div>
                )}
                {/* <h6 className="mb-0 mt-3">To User</h6> */}
                <button type="button" className="avatarr mb-2">
                  <span className="avatarr_plus_icon text-secondary">
                    <FaPlus />
                  </span>
                </button>
                <h6>Form User</h6>
                <div className="d-flex justify-content-between">
                  <div className="change-password_refer mb-3 p-2 d-flex gap-2 text-secondary">
                    <div>avatar</div>
                    <p className="m-0">Sanjana Mandala</p>
                    <BiTrashAlt />
                  </div>
                </div>
                <h6 className="mb-2">To User</h6>
                <div className="d-flex justify-content-between">
                  <div className="change-password_refer mb-3 p-2 d-flex gap-2 text-secondary">
                    <div>avatar</div>
                    <p className="m-0">Sanjana Mandala</p>
                    <BiTrashAlt />
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer className="task_transfer_footer mx-3">
                <Button className="cancel_btn" variant="secondary">
                  CANCEL
                </Button>
                <Button variant="primary">NEXT</Button>
              </Modal.Footer>
            </div>
            <div className="col-5 task_transfer_card p-0">
              <Card className="border-0 p-2 task_transfer_card">
                <Card.Header className="bg-transparent">
                  <h6 className="m-0 mt-3 ">Select From Users</h6>
                </Card.Header>
                <Card.Body>
                  <div className="position-relative mb-2">
                    <input
                      className="form-control creat-task-search"
                      type="search"
                      placeholder="Search"
                      aria-label="Search"
                      name="myapprovals-search"
                    />
                    <span className="task_transfer_search_icon text-secondary">
                      <FaSearch />
                    </span>
                  </div>
                  <div className="hctrl-200">
                    <ul className="p-0 avatar-list-items">
                      {usersData?.map((item, id) => {
                        return (
                          <li className="d_aic_jcsb gap-3">
                            <h2>HP</h2>
                            <p className="m-0" key={id}>
                              {item.name}
                            </p>
                            <div className="Checklist-check task_transfer_checkbox m-1 rounded">
                              <input
                                value={item.id}
                                type="checkbox"
                                disabled={item.id == toUser?.id ? false : null}
                                name="myapprovals-checkbox"
                                checked
                                onClick={() => {
                                  getUser(item);
                                }}
                              />
                            </div>
                          </li>

                          // <div className="d-flex align-items-center justify-content-between my-3">
                          //   <div className="d-flex gap-3">
                          //     <div>HP</div>
                          //     <p className="m-0" key={id}> {item.name}</p>
                          //   </div>
                          //   <div className="Checklist-check task_transfer_checkbox m-1 rounded">
                          //     <input
                          //       value={item.id}
                          //       type="checkbox"
                          //       disabled={
                          //         item.id == toUser?.id ? false : null
                          //       }
                          //       name=""
                          //       onClick={() => {
                          //         getUser(item);
                          //       }}
                          //     />
                          //   </div>
                          // </div>
                        );
                      })}
                    </ul>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
        {/* <div className="container-fluid">
            <div className="row">
              <div className="col-lg-12 p-3 "> */}
        <div className="d-flex align-items-center justify-content-between task-transfer-bottom-footer px-3">
          <div className="d-flex gap-3 align-items-center">
            <div className="Checklist-check m-3 ms-4">
              <input type="checkbox" name="approvals-checkbox" className="rounded" checked/>
              <label className="ms-3 mt-1">All</label>
            </div>
          </div>
          {/* <StatusBadge status={status}/> */}
          <div className="d-flex gap-2 align-items-center">
            <Badge
              className="status-badges task-transfer-badge"
              pill
              bg="transparent"
            >
              Open-18
            </Badge>
            <Badge
              className="status-badges task-transfer-badge"
              pill
              bg="transparent"
            >
              In-Progress-32
            </Badge>
          </div>
        </div>
        <div className="table-responsivez px-3">
          <table className="table table-style1 task-transfer-table">
            <tbody>
              <tr className="card-table">
                <td>
                  <div className="Checklist-check">
                    <input type="checkbox" name="approvals-checkbox" className="" checked/>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="task-transfer-flag d_aic_jcc">
                      <h5>
                        <Badge bg="transparent" text="dark" className="p-0">
                          <BsFlagFill />
                        </Badge>
                      </h5>
                    </div>
                    <h6 className="m-0">Personal Todo</h6>
                  </div>
                </td>
                <td>
                  <Badge
                    className="status-badges task-transfer-badge"
                    pill
                    bg="transparent"
                  >
                    open
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Modal.Footer className="task_transfer_footer mx-3">
          <Button className="cancel_btn" variant="secondary">
            CANCEL
          </Button>
          <Button variant="primary">APPLY</Button>
        </Modal.Footer>
        {/* </div>
            </div>
          </div> */}
      </Modal>
    </div>
  );
}

export default Taskslist;
