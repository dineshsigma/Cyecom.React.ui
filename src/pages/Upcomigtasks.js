import { ToastContainer } from "react-toastify";
import { FaEdit, FaSearch } from "react-icons/fa";
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
  deleteTask,
  setButtonLoading,
  getDraftTasks,
  setDraftDetails,
} from "../redux/reducers/taskReducer";
import AvatarStack from "../components/AvatarStack";
import {Button,Col} from "react-bootstrap";
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
import LoaderComponent from "../components/Loader";
import { getpriorityConfig } from "../redux/reducers/priorityConfigReducer";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import Form from "react-bootstrap/Form";
import captialLetter from "../modules/CaptialLetter";

function Upcomigtasks() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const [filterSearch, setFilter] = useState("");
  const [dueData, setDuedate] = useState();
  const [priority, setPriority] = useState("low");
  const [status, setStatus] = useState("in-progress");
  const showAddform = useSelector((state) => state.tasks.showTask);
  const loading = useSelector((state) => state.tasks.buttonLoading);
  const usersList = useSelector((state) => state.users.usersList);
  const deleteResponse = useSelector((state) => state.tasks.deleteTaskResponse);
  const tasks = useSelector((state) => state.tasks.draftTasks);
  const [showFilters, setShowFilter] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState({});
  const loader = useSelector((state) => state.tasks.loader);
  const statusList = [
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In-Progress" },
    { value: "in-review", label: "In-Review" },
    { value: "closed", label: "Closed" },
  ];
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
  const [filterSearchType, setfilterSearchType] = useState({
    name: "",
    type: ["", "Schedule"],
    userid:userData[0]?.id
  });
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
  const fetchCommentAvatar = (id) => {
    if (usersList && usersList.length > 0) {
      let user = usersList?.find((item) => item.id === id);
      if (user) {
        return (
          <Avatar
            className="avatar-img"
            color={user.color}
            initials={`${user.name.substring(0, 1).toUpperCase()}${user.lastname
              .substring(0, 1)
              .toUpperCase()}`}
            name={user.name}
            lastname={user.lastname}
            image={user.avatar}

          />
        );
      }
    }
  };
  useEffect(() => {
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
    dispatch(getUsers(filterSearch));
    dispatch(getDepartments(""));
    dispatch(getLocations(""));
    dispatch(getGroups(""));
    dispatch(getOrgUsers());
  }, [filterSearch, status, filterSearchType]);

  const updateStatus = (status, event) => {
    event.preventDefault();
    setStatus(status);
  };

  const get_tasks = () => {
    dispatch(getDraftTasks(filterSearchType));
  };

  useEffect(() => {
    get_tasks();
    dispatch(getpriorityConfig());
  }, [filterSearch, deleteResponse, filterSearchType]);

  const deleteDialog = async (item, event) => {
    event.preventDefault();
    //console.log('Delete Location', id)
    setDeleteId(item);
    setDeleteModal(!deleteModal);
  };

  const Delete_Task = async () => {
    dispatch(setButtonLoading(true));
    await dispatch(deleteTask(deleteId));
    setDeleteModal(!deleteModal);
    dispatch(getDraftTasks(filterSearchType));
  };

  const editDraftTask = (item) => {
    // console.log('selected task', item)
    dispatch(setTaskAddform(!showAddform));
    dispatch(setDraftDetails(item));
  };

  return (
    <div>
      <section className="breadcum_section draft-tasks">
        <div className="container-fluid">
          <div className="row align-items-center justify-ontent-between">
            <div className="col-md-3">
              {/* <h2 className="bs_title">Draft Tasks</h2> */}
              <h2 className="bs_title">
               Upcoming
              </h2>
            </div>
            <div className="col-md-9">
              <div className="aside_left d-flex align-items-center justify-content-end gap_05rm">
                <div className="search-box">
                  <input
                    className="form-control text"
                    type="text"
                    name="draft-search"
                    placeholder="Search here"
                    autoFocus
                    onChange={(e) => {
                      setfilterSearchType({
                        ...filterSearchType,
                        name: e.target.value,
                      });
                    }}
                    //onChange={(e) => { setFilter(e.target.value) }}
                  />
                  <button>
                    {" "}
                    <FaSearch />
                  </button>
                </div>
                <div>
                  {/* <Form.Select
                    onChange={(e) => {
                      setfilterSearchType({
                        ...filterSearchType,
                        type: e.target.value,
                      });
                    }}
                    className="filter-task-type"
                  >
                    <option value={"All"}>All</option>
                    <option value="Draft">Draft Task</option>
                    <option value="Schedule">Schedule Task</option>
                  </Form.Select> */}
                </div>
                {/* <Button variant="primary" className="filter-btn" onClick={() => setShowFilter(!showFilters)}><FaFilter /></Button> */}
                <button
                  id="createTask"
                  type="button"
                  className="btn btn-primary"
                  onClick={() => dispatch(setTaskAddform(!showAddform))}
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showFilters && (
        <section className="mb-5 mt-3">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-3">
                <div className="aside_left">
                  <p>Select Stauts</p>
                  <Select
                    isMulti
                    name="colors"
                    options={statusList}
                    className="basic-multi-select"
                    classNamePrefix="select Status"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {loader ? (
        <LoaderComponent />
      ) : tasks?.length > 0 ? (
        <section>
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="table-responsive">
                  <table className="table table-style1">
                    <thead>
                      <tr>
                        <th>Task Name</th>
                        <th>Assignees</th>
                        <th>Start Date</th>
                        <th>Due Date</th>
                        <th>Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks?.map((task, key) => {
                        return (
                          <tr className="card-table" id={key}>
                            <td className="card-table-task-name d-flex align-item-center gap-2">
                              <div>
                                {priorityChildConfigList?.map(
                                  (priority, prioritykey) => {
                                    <h5 className="badge-icon-parent m-0 d_aic_jcc">
                                      <Badge
                                        bg="transparent"
                                        text="dark"
                                        className="p-0"
                                      >
                                        <BsFlagFill color={priority.color} />
                                      </Badge>
                                    </h5>;
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
                              </div>
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
                            <td>
                              {task.assignee.length > 0 ? fetchAvatarStack(task.assignee) : "No Assigees"}
                            </td>
                            <td>
                              <div className="tn">
                                {/* {moment(new Date(task.due_date), "YYYYMMDD").fromNow()} */}
                                {moment(new Date(task.start_date)).format(
                                  "ddd, MMM DD, YYYY, h:mm A"
                                )}
                              </div>
                            </td>

                            <td>
                              <div className="tn">
                                {/* {moment(new Date(task.due_date), "YYYYMMDD").fromNow()} */}
                                {moment(new Date(task.due_date)).format(
                                  "ddd, MMM DD, YYYY, h:mm A"
                                )}
                              </div>
                            </td>

                            {/* <td>
                                                        {task.status === 'open' &&        <Badge className='status-badges' pill bg="success">Open</Badge>}
                                                        {task.status === 'in-progress' && <Badge className='status-badges' pill bg="info">In-Progress</Badge>}
                                                        {task.status === 'in-review' &&   <Badge className='status-badges' pill bg="warning">In-Review</Badge>}
                                                        {task.status === 'closed' &&      <Badge className='status-badges' pill bg="danger">Closed</Badge>}
                                                    </td> */}

                            <td>
                              {task.task_type === "Draft" && (
                                <Badge
                                  className="status-badges"
                                  pill
                                  bg="success"
                                >
                                  Draft
                                </Badge>
                              )}
                              {task.task_type === "Schedule" && (
                                <Badge className="status-badges" pill bg="info">
                                  Schedule
                                </Badge>
                              )}
                            </td>

                            <td>
                              <div className="tb-actions d-flex align-item-center justify-content-start">
                                <button
                                  id="editDraftBtn"
                                  className="btn-tl-actions"
                                  onClick={() => editDraftTask(task)}
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  id="deleteDraftBtn"
                                  className="btn-tl-actions"
                                  onClick={(event) => deleteDialog(task, event)}
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
        <Col md={12} className="text-center"><img src={NoDataFound} height="500px" /></Col>
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
            id="closeBtn"
            variant="secondary"
            onClick={() => setDeleteModal(!deleteModal)}
          >
            Close
          </Button>
          <Button
            id="confirmDeleteBtn"
            variant="primary"
            onClick={Delete_Task}
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
    </div>
  );
}

export default Upcomigtasks;
