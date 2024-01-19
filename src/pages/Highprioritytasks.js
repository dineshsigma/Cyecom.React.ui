import { ToastContainer } from "react-toastify";
import { FaTimes, FaFilter, FaSearch, FaPlus } from "react-icons/fa";
import { BiLinkExternal, BiTrashAlt, BiX } from "react-icons/bi";
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

function HighPriorityTaskslist() {
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
  const highPriorityTasks = useSelector(
    (state) => state.dashboard.highPriorityTasks
  );
  // console.log("highPriorityTasks",highPriorityTasks)
  const priorityChildConfig_List=useSelector((state)=>state.priority.priorityChildList);
  const statusList = useSelector(
    (state) => state.status.tasksStatus
  );
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const [filterSearch, setFilter] = useState({
    name: "",
    status: "",
    priority: "",
    assignee: [userDetails.id],
    created_by: userDetails.id,
  });
  const loader = useSelector((state) => state.tasks.loader);

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
  const [userSearch, setUserSearch] = useState('')
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
    dispatch(getAllUsers(filterSearch));
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
    dispatch(getHighTasks())

  }, [filterSearch, deleteResponse]);

 
  const deleteDialog = async (item, event) => {
    event.preventDefault();
    setDeleteId(item);
    setDeleteModal(!deleteModal);
  };
 
 
  const Delete_Task = async () => {
    dispatch(setButtonLoading(true));
    dispatch(deleteTask(deleteId)).then((res) => {
        dispatch(getHighTasks())
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

  



  return (
    <div>
      <>
        <section className="breadcum_section tasklist-section">
          <div className="container-fluid">
            <div className="row align-items-center justify-content-between">
              <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2">
                <h2 className="bs_title">Hight Priority Tasks</h2>
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
                          value={filterSearch?.name}
                          autoFocus
                          onChange={(e) => {
                            setFilter({
                              ...filterSearch,
                              name: e.target.value,
                            });
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


        {loader ? <LoaderComponent /> : highPriorityTasks?.length > 0 ? (
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
                        {highPriorityTasks?.map((task, index) => {
                          return (
                            <tr className="card-table" id={index}>
                              <td onClick={(event) => navigate(`/taskdetails/${task.id}`)}>
                                {getOrgCode(orgListData, task.org_id)}-
                                {task.task_code}
                              </td>
                              <td className="card-table-task-name d-flex align-item-center gap-2" onClick={(event) => navigate(`/taskdetails/${task.id}`)}>
                                {priorityChildConfig_List?.map(
                                  (priority, prioritykey) => {
                                    return (
                                      task.internal_priority === priority.name && (
                                        <h5 className="badge-icon-parent m-0 d_aic_jcc">
                                          <Badge bg="transparent" text="dark" className="p-0">
                                            <BsFlagFill color={priority.color} />
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
                                  <div className="tn">{captialLetter(task?.name)}</div>
                                </OverlayTrigger>
                              </td>
                              <td onClick={(event) => navigate(`/taskdetails/${task.id}`)}>{fetchUser(task.createdby)}</td>
                              <td onClick={(event) => navigate(`/taskdetails/${task.id}`)}>
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

                              <td onClick={(event) => navigate(`/taskdetails/${task.id}`)}>
                                <div className="tn">
                                  {/* {moment(new Date(task.due_date), "YYYYMMDD").fromNow()} */}
                                  {moment(task.due_date).format("ddd, MMM DD, YYYY, h:mm A")}
                                </div>
                              </td>

                              <td onClick={(event) => navigate(`/taskdetails/${task.id}`)}>
                                {statusChildList?.map(
                                  (status, statuskey) => {
                                    return (
                                      task.internal_status
                                      === status.name && (
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
                                      navigate(`/taskdetails/${task.id}`)
                                    }
                                  >
                                    <BiLinkExternal />
                                  </button>
                                  <button
                                    id="taskDelete"
                                    className="btn-tl-actions"
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

export default HighPriorityTaskslist;