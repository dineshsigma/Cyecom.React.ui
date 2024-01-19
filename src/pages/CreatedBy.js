import { ToastContainer } from "react-toastify";
import { FaTimes, FaFilter, FaSearch, FaPlus, FaEdit } from "react-icons/fa";
import { BiLinkExternal, BiPause, BiPlay, BiTrashAlt, BiX } from "react-icons/bi";
import { AiOutlineCheck } from "react-icons/ai"
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Dropdown from "react-bootstrap/Dropdown";
import Table from "react-bootstrap/Table";
import Avatar from "../components/Avatar";
import { avatarBrColors } from "../environment";
import { getLocations } from "../redux/reducers/locationsReducer";
import { getDepartments } from "../redux/reducers/departmentReducer";
import { getUsers, getOrgUsers, getTaskUserData } from "../redux/reducers/userReducer";
import { getGroups } from "../redux/reducers/groupReducer";
import Badge from "react-bootstrap/Badge";
import captialLetter from '../modules/CaptialLetter';
import { getHighTasks } from "../redux/reducers/dashboardReducer";
import { createdTasks, deleteRecurringTask, get_Recursivetasks, setRecurringTaskDetails, setTemplateAddform, setUpdateReccuring, updateRecurringTask } from "../redux/reducers/taskReducer";
import {
  setTaskAddform,
  getAll_tasks,
  deleteTask,
  setButtonLoading,
  getAllTeamIds,
  getFilterTasks,
  setTaskTransferList,
  getAcceptTasks, getAlltasks_perUser, taksTransfer, setAccept_Task, getAll_tasksWithClosedTask
} from "../redux/reducers/taskReducer";
//setAccept_Task
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
// import { updateRecurringStatus } from "./ReccuringTaskList";
import { getpriorityConfig,getPriorityConfigList } from "../redux/reducers/priorityConfigReducer";
import { getStatusConfig,getAllTaksStatus} from "../redux/reducers/statusConfigReducer";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useRef } from "react";
import { MultiSelect } from "react-multi-select-component";
import DatePicker from "react-datepicker";
import { getUserById } from "../redux/reducers/authReducer";
import { getAllUsers, getExceptUsers } from "../redux/reducers/userReducer";
import StatusBadge from "../components/StatusBadge";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import Card from "react-bootstrap/Card";
import FormCheckLabel from "react-bootstrap/esm/FormCheckLabel";
import UserDetails from "./UserDetails";
import { TfiLoop } from "react-icons/tfi";

function CreatedBy() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const orgId = useSelector((state) => state.auth.current_organization);
  const userDetails = useSelector((state) => state.auth.userDetails);

  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
//   const highPriorityTasks = useSelector(
//     (state) => state.dashboard.highPriorityTasks
//   );
   const [highPriorityTasks,setHighPriorityTasks]=useState([])
  // console.log("highPriorityTasks",highPriorityTasks)
  const priorityChildConfig_List=useSelector((state)=>state.priority.priorityChildList);
  const statusList = useSelector(
    (state) => state.status.tasksStatus
  );
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const [taskFilterSearch,setTaskFilterSearch]=useState({userid:parseInt(userDetails.id),orgid:orgId,name:''});

  const [filterSearch, setFilter] = useState({
    name: "",
    status: "",
    priority: "",
    assignee: [userDetails.id],
    created_by: userDetails.id,
  });

  const [getAlluserSearch, setGetAlluserSearch] = useState({
    name: "",
    offset: 0,
    limit: 100,
  });
//   const loader = useSelector((state) => state.tasks.loader);
const [loader,setLoader]=useState(true)
  const loading = useSelector((state) => state.tasks.buttonLoading);
  const usersList = useSelector((state) => state.users.usersList);
  const taskCreateData = useSelector((state) => state.users.userTaskData);
  const [userCurrentOrg, setUserCurrentOrg] = useState();
  const deleteResponse = useSelector((state) => state.tasks.deleteTaskResponse);
  const userOrgList = useSelector((state) => state.auth.userOrgDetails);
  const [fromUserError, setFromUserError] = useState("");
  const [toUserError, setToUserError] = useState("");
  const current_organization = useSelector(
    (state) => state.auth.current_organization
  );
  // !userCurrentOrg?.is_active && userCurrentOrg?.role_id != 1
  const orgListData = useSelector(
    (state) => state.organization.organizationsList
  );
  const tasks = useSelector((state) => state.tasks.tasks);
  const orgUsersList = useSelector((state) => state.users.orgUsersList);
  const [showFilters, setShowFilter] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [assignees, setAssignedUsres] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [tasksData,setTasksData]=useState([]);
  const [recurringTasks,setRecurTaskDetails]=useState([])
  const payload = {
    array: assignees,
    name: userSearch,
  }
  const exceptedUsers = useSelector((state) => state.users.exceptedUsers)
  const [deleteId, setDeleteId] = useState({});
  // console.log("deleteId",deleteId)
  const getPriorityList = useSelector(
    (state) => state.priority.priorityConfigList
  );
  const statusConfigList = useSelector(
    (state) => state.status.statusConfigList
  );
  const AllUsers = useSelector((state) => state.users.usersList);
  const ref = useRef([]);
  let statusChildList = statusList?.org_childs?.length ? statusList?.org_childs : statusList?.base_childs;


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
  const [allUsers, setAllUsers] = useState([]);
  const [deletedItem, setDeltedItem] = useState(false);


 

  useEffect(() => {
    dispatch(getOrganizations(organizationsdata));
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
    dispatch(getDepartments(""));
    dispatch(getLocations(""));
    dispatch(getGroups(""));
    dispatch(getOrgUsers());
    dispatch(getpriorityConfig());
    dispatch(getStatusConfig());
    dispatch(getAllUsers(getAlluserSearch));
    let payloadTeamIds = {
      input_id: userDetails.id,
    };
    dispatch(getExceptUsers(payload))
    dispatch(getAllTeamIds(payloadTeamIds)).then((res) => {
      let fetchuserDetails = [];
      res.payload.data.getTeamTasks.data?.map((item) => { });
    });
    let modalPop = userOrgList?.find((item) => item.org_id == current_organization);
    setUserCurrentOrg(modalPop);


  }, [deletedItem, tasks]);

  useEffect(()=>{
    dispatch(getPriorityConfigList(orgId))
    dispatch(getAllTaksStatus(orgId));
},[])

 
  const updateStatus = (status, event) => {
    event.preventDefault();
  };
  const get_tasks = () => {
    dispatch(getAll_tasks(filterSearch));
  };

  useEffect(() => {
    get_tasks();
    setLoader(true)
    dispatch(createdTasks(taskFilterSearch)).then((res)=>{
      setRecurTaskDetails(res.payload.data.task_template)
        setTasksData(res.payload.data.tasks)
        setLoader(false)
    })
    // dispatch(getHighTasks())

  }, [taskFilterSearch, deleteResponse]);

  const deleteDialog = async (item, event) => {
    event.preventDefault();
    setDeleteId(item);
    setDeleteModal(!deleteModal);
  };
 
 
  const Delete_Task = async () => {
    dispatch(setButtonLoading(true));
    dispatch(deleteTask(deleteId)).then((res) => {
        setLoader(true)
        dispatch(createdTasks({userid:parseInt(userDetails.id),orgid:orgId})).then((res)=>{
          setRecurTaskDetails(res.payload.data.task_template)
            setTasksData(res.payload.data.tasks)
            setLoader(false)
        })
        // dispatch(getHighTasks())
    });
    setDeltedItem(!deletedItem);
    setDeleteModal(!deleteModal);
  };
  
  const fetchUser = (id) => {
    let user = taskCreateData?.find((item) => item.id === id);
    return `${captialLetter(user?.name)} ${captialLetter(user?.lastname)}`;
  };

  const getOrgCode = (orgData, orgId) => {
    let data = orgData?.filter((item) => {
      return item?.id === orgId;
    })
    return data?.length == 0 ? "" : data[0]["uni_code"];
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

  const TableData=(props)=>{
    const [tasks,setTasks]=useState(props.tasks);
    // useEffect(()=>{
    //    setLoader(true)
    //    filteringData().then((res)=>{
    //       console.log(res)
    //       // setTasks(res)
    //       setLoader(false)
    //     })
    // },[props.searchValue])

    const filteringData=async ()=>{
      let cloneTasks=props.tasks
      let filterTasks=await cloneTasks.filter(item=>item.name.toLowerCase().includes(props.searchValue.toLowerCase()))
      return filterTasks
    }
    return (
      <>
        {loader ? (
          <LoaderComponent />
        ) :tasks?.length > 0 ? (
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
                          <th>Created By</th>
                          <th>Assignees</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks?.map((task, index) => {
                          return (
                            <tr className="card-table" id={index}>
                              <td
                                onClick={(event) =>
                                  props.navigate
                                    ? navigate("/recurringtasklist")
                                    : navigate(`/taskdetails/${task.id}`)
                                }
                              >
                                {getOrgCode(orgListData, task.org_id)}-
                                {task.task_code}
                              </td>
                              <td
                                className="card-table-task-name d-flex align-item-center gap-2"
                                onClick={(event) =>
                                  props.navigate
                                    ? navigate("/recurringtasklist")
                                    : navigate(`/taskdetails/${task.id}`)
                                }
                              >
                                {priorityChildConfig_List?.map(
                                  (priority, prioritykey) => {
                                    return (
                                      task.internal_priority ===
                                        priority.name && (
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
                                <OverlayTrigger
                                  overlay={
                                    <Tooltip id="tooltip-task-name">
                                      {" "}
                                      {captialLetter(task?.name)}
                                    </Tooltip>
                                  }
                                >
                                  <div className="tn">
                                    {captialLetter(task?.name)}
                                  </div>
                                </OverlayTrigger>
                              </td>
                              <td
                                onClick={(event) =>
                                  props.navigate
                                    ? navigate("/recurringtasklist")
                                    : navigate(`/taskdetails/${task.id}`)
                                }
                              >
                                {fetchUser(task.createdby || task.created_by)}
                              </td>
                              <td
                                onClick={(event) =>
                                  props.navigate
                                    ? navigate("/recurringtasklist")
                                    : navigate(`/taskdetails/${task.id}`)
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
                                  props.navigate
                                    ? navigate("/recurringtasklist")
                                    : navigate(`/taskdetails/${task.id}`)
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
                                  props.navigate
                                    ? navigate("/recurringtasklist")
                                    : navigate(`/taskdetails/${task.id}`)
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
                                      props.navigate
                                        ? navigate("/recurringtasklist")
                                        : navigate(`/taskdetails/${task.id}`)
                                    }
                                  >
                                    <BiLinkExternal />
                                  </button>
                                  {!props.navigate && (
                                    <button
                                      id="taskDelete"
                                      className="btn-tl-actions"
                                      onClick={(event) =>
                                        deleteDialog(task, event)
                                      }
                                    >
                                      <BiTrashAlt />
                                    </button>
                                  )}
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
    );
  }

const RecuuringTaskTab=({recurrringTasksList,priorityChildConfig_List,taskFilterSearch,setRecurTaskDetails})=>{
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected, setSelectedTask] = useState(undefined);
  const showTemplateForm = useSelector((state) => state.tasks.showTemplateForm);
  const dispatch=useDispatch();
  const updateRecurringStatus = (item) => {
    let temp = { ...item, is_active: !item.is_active };
    if (temp.is_active) {
      var updatedList = [];
      temp.rule_set?.map((item) => {
        if (new Date(item).toISOString() > new Date().toISOString()) {
          updatedList.push(item);
        } else {
          if (new Date(item).getDate() == new Date().getDate()) {
            if (new Date(item).getTime() > new Date().getTime()) {
              updatedList.push(item);
            }
          }
        }
      });
      temp = {
        ...temp,
        next_trigger_time: updatedList[0]
          ? new Date(updatedList[0]).toISOString()
          : null,
        rule_set: updatedList.slice(1, updatedList.length - 1),
      };
    }
    dispatch(updateRecurringTask(temp)).then((res) => {
      dispatch(createdTasks(taskFilterSearch)).then((res)=>{
        setRecurTaskDetails(res.payload.data.task_template)
        setTasksData(res.payload.data.tasks)
        setLoader(false)
    })
    });
  };

  const editTask = (item) => {
    dispatch(setTemplateAddform(!showTemplateForm));
    dispatch(setRecurringTaskDetails(item));
    dispatch(setUpdateReccuring(true));
  };

  const openDeleteModel = (item) => {
    setDeleteModal(true);
    setSelectedTask(item);
  };
  const deleteRecueTask = () => {
    // setLoading(true);
    console.log("calinggggggggg")
    dispatch(deleteRecurringTask(selected)).then((res) => {
      if (res.payload.status) {
        dispatch(createdTasks(taskFilterSearch)).then((res)=>{
          setRecurTaskDetails(res.payload.data.task_template)
          setTasksData(res.payload.data.tasks)
          setLoader(false)
      })
        setDeleteModal(false);
        // setLoading(false);
      } else {
        // setLoading(false);
      }
    });
  };

  return <><div className="container-fluid">
    <div style={{backgroundColor:"#f0f0f0"}}>
   {recurrringTasksList?.length > 0 ? (
    recurrringTasksList?.map((item, key) => {
      return (
        <div className="row" key={key} style={{padding:"6px 6px 0px 6px",paddingBottom:key==recurrringTasksList.length-1?"6px":"0px"}} >
          <div className="col-md-12 col-lg-12">
            <div className="card-grid-item">
              <div className="card-gt-body d-flex align-items-start gap-2">
                <div className="task-transfer-flag d-flex align-items-center justify-content-center table-style1">
                  {priorityChildConfig_List?.map(priority => {
                    return (
                      item.internal_priority === priority.name && (
                        <h5 className="badge-icon-parent m-0 d_aic_jcc">
                          <Badge
                            bg="transparent"
                            text="dark"
                            className="p-0"
                          >
                            <BsFlagFill color={priority.color} />
                          </Badge>
                        </h5>
                      )
                    );
                  })}
                </div>
                <div className="content">
                  <h4>
                    {item.name?.charAt(0).toUpperCase() +
                      item?.name?.slice(1)}
                  </h4>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: item.description,
                    }}
                  ></p>
                  <div className="loop-time">
                    <TfiLoop /> &nbsp;&nbsp;{item.rule_text}
                  </div>
                </div>
                {item.is_active ? (
                  <>
                    {/* <button className="status-badges bg-transparent recurring-switch d-flex flex-row me-2" onClick={() => createManualTask(item)}><TbSwitch2 className="me-2"/> Switch</button> */}
                    <button
                      id="btnPlay"
                      onClick={() => updateRecurringStatus(item)}
                      className="btn-play-action"
                    >
                      <BiPause className="icon-btn-size" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      id="btnPause"
                      onClick={() => updateRecurringStatus(item)}
                      className="btn-pause-action"
                    >
                      <BiPlay className="icon-btn-size" />
                    </button>
                  </>
                )}
                <button
                  id="btnEditRecurring"
                  onClick={() => editTask(item)}
                  className="btn-todo-actions"
                >
                  <FaEdit />
                </button>
                <button
                  id="btnDeleteRecurring"
                  onClick={() => openDeleteModel(item)}
                  className="btn-todo-actions"
                >
                  <BiTrashAlt />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    })
  ) : (
    <div className="col-md-12 center text-center">
      <img src={NoDataFound} height="500px" alt="NoDataFound" />
    </div>
  )}
  </div>
</div>
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
          id="btnClose"
          variant="secondary"
          onClick={() => setDeleteModal(!deleteModal)}
        >
          Close
        </Button>
        <Button
          id="btnDelete"
          variant="primary"
          onClick={deleteRecueTask}
          disabled={loading}
        >
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
    </>

}

  return (
    <div>
      <>
        <section className="breadcum_section tasklist-section">
          <div className="container-fluid">
            <div className="row align-items-center justify-content-between">
              <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2">
                <h2 className="bs_title">Created Tasks</h2>
              </div>

              <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10">
                <div className="aside_left d-flex align-items-center justify-content-end gap_05rm">
                  <>
                    <div className="search-box">
                      <input
                        className="form-control text"
                        type="text"
                        name="highpriority-search"
                        placeholder="Search here"
                        value={taskFilterSearch?.name}
                        autoFocus
                        onChange={(e) => {
                          setTaskFilterSearch({...taskFilterSearch,name:e.target.value});
                        }}
                      />
                      <button>
                        {" "}
                        <FaSearch />
                      </button>
                    </div>
                  </>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="createdby-pg">
          <div className="rounded px-3 py-4 bg-white Offcanvas_cust">
            <Tabs
              defaultActiveKey="tasks"
              id="uncontrolled-tab-example"
              className="mb-4 gap-3 ps-3 position-relative notification"
              onSelect={()=>setTaskFilterSearch({...taskFilterSearch,name:''})}
            >
              <Tab eventKey="tasks" title="Tasks">
                <TableData tasks={tasksData} navigate={false}/>
              </Tab>
              <Tab eventKey="recurring" title="Recurring" >
                <RecuuringTaskTab recurrringTasksList={recurringTasks} priorityChildConfig_List={priorityChildConfig_List} taskFilterSearch={taskFilterSearch} setRecurTaskDetails={setRecurTaskDetails}/>
                {/* <TableData tasks={recurringTasks} navigate={true} /> */}
              </Tab>
            </Tabs>
          </div>
        </section>
      </>

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
    </div>
  );
}

export default CreatedBy;