import Button from "react-bootstrap/Button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TfiLoop } from "react-icons/tfi";
import Badge from "react-bootstrap/Badge";
import {
  setTemplateAddform,
  get_Recursivetasks,
  updateRecurringTask,
  deleteRecurringTask,
  setRecurringTaskDetails,
  setUpdateReccuring,
} from "../redux/reducers/taskReducer";
import NoDataFound from "../assets/No_Data_File.png";
import { BsFlagFill } from "react-icons/bs";
import { BiPause, BiTrashAlt, BiPlay } from "react-icons/bi";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { FaEdit, FaSearch } from "react-icons/fa";
import { TbSwitch2 } from "react-icons/tb";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import LoaderComponent from "../components/Loader";
import { getpriorityConfig } from "../redux/reducers/priorityConfigReducer";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import { setSwitchToCreate } from "../redux/reducers/taskReducer";
function RecurringTaskList() {
  const dispatch = useDispatch();
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const orgId = useSelector((state) => state.auth.current_organization);
  const showTemplateForm = useSelector((state) => state.tasks.showTemplateForm);
  const recurrringTasksList = useSelector(
    (state) => state.tasks.recursiveTaskList
  );
  const switchToCreate = useSelector((state) => state.tasks.switchToCreate);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelectedTask] = useState(undefined);
  const [filter, setFilter] = useState("");
  const loader = useSelector((state) => state.tasks.loader);
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
  
  const [getRecursivePayload, setGetRecursivePayload] = useState({
    task_type: "reccurssive",
    org_id: orgId,
  });

  useEffect(() => {
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
    dispatch(get_Recursivetasks(filter));
    dispatch(getpriorityConfig());
  }, [filter]);

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
      dispatch(get_Recursivetasks(filter));
    });
  };

  const openDeleteModel = (item) => {
    setDeleteModal(true);
    setSelectedTask(item);
  };

  const deleteTask = () => {
    setLoading(true);
    dispatch(deleteRecurringTask(selected)).then((res) => {
      if (res.payload.status) {
        dispatch(get_Recursivetasks(filter));
        setDeleteModal(false);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  };

  const editTask = (item) => {
    dispatch(setTemplateAddform(!showTemplateForm));
    dispatch(setRecurringTaskDetails(item));
    dispatch(setUpdateReccuring(true));
  };

  const createManualTask = (item) => {
    dispatch(setTemplateAddform(!showTemplateForm));
    dispatch(setRecurringTaskDetails(item));
    dispatch(setUpdateReccuring(false));
  };

  // console.log("recurrringTasksList", recurrringTasksList);
  return (
    <>
      {/* <div className='row m-4'>
                <div className='text-start mt-2 col-6'>
                    <h4 className='title'>Reccuring Task</h4>
                </div>
                <div className="col-6 mt-2 text-end">
                    <Button variant="primary" size="md" onClick={() => dispatch(setTemplateAddform(!showTemplateForm))}>
                        Create Reccuring Task
                    </Button>
                </div>
            </div> */}
      <section className="breadcum_section">
        <div className="container-fluid ">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-3">
              <h2 className="bs_title">Recurring Tasks</h2>
            </div>
            {/* <div className='col-md-3'>
                            <div className='aside_left'>
                                <form className="form-inline d-flex">
                                    <input id='searchRecurringTasks' className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" onChange={(e) => setFilter(e.target.value)} />
                                </form>
                            </div>
                        </div> */}

            <div className="col-md-9">
              <div className="aside_left d_aic_jce gap_05rm">
                <div className="search-box">
                  <input
                    className="form-control text"
                    type="text"
                    name="recurringTasklist-search"
                    placeholder="Search here"
                    autoFocus
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  <button>
                    <FaSearch />
                  </button>
                </div>
                <Button
                  id="createRecuringTask"
                  variant="primary"
                  size="md"
                  onClick={() =>
                    dispatch(setTemplateAddform(!showTemplateForm))
                  }
                >
                  Create Recurring Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
      <div className="container-fluid">
          {loader ? (
            <LoaderComponent />
          ) : recurrringTasksList?.length > 0 ? (
            recurrringTasksList?.map((item, key) => {
              return (
                <div className="row mb-1" key={key}>
                  <div className="col-md-12 col-lg-12">
                    <div className="card-grid-item">
                      <div className="card-gt-body d-flex align-items-start gap-2">
                        <div className="task-transfer-flag d-flex align-items-center justify-content-center table-style1">
                          {priorityChildConfigList?.map(priority => {
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
      </section>

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
            onClick={deleteTask}
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
  );
}
export default RecurringTaskList;
