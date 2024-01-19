import { toast } from "react-toastify";
import {
  Modal,
  Card,
  ProgressBar,
  Spinner,
  Button,
  Form,
  Dropdown,
  Row,
  Col,DropdownButton
} from "react-bootstrap";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { avatarBrColors } from "../environment";
import {
  setGroupAddform,
  setGroupButtonLoading,
  createGroup,
  getGroups,
  deleteGroup,
  setGroupUpdateForm,
  updateGroup,
  getGroupStatusCount,
} from "../redux/reducers/groupReducer";
import { getUsers, getExceptUsers } from "../redux/reducers/userReducer";
import {
  FaSearch,
  FaPlusCircle,
  FaTasks,
  FaPlus,
  FaMinus,
  FaEllipsisV,
  FaArrowLeft,FaEdit,FaTrashAlt
} from "react-icons/fa";
import { BiX, BiPlus, BiMinus } from "react-icons/bi";
import moment from "moment";
import Avatar from "../components/Avatar";
import AvatarStack from "../components/AvatarStack";
import NoGroupsFound from "../assets/not-founds.svg";
import NoDataFound from "../assets/No_Data_File.png";
import LoaderComponent from "../components/Loader";
import { BiLabel, BiChat, BiLinkAlt, BiCommentCheck } from "react-icons/bi";
import ReactQuill from "react-quill";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getPermissionsByRole} from '../redux/reducers/rolesReducer';


function Groups() {
  const dispatch = useDispatch();
  const orgId = useSelector((state) => state.auth.current_organization);
  const userId = useSelector((state) => state.auth.user_id);
  const [filterSearch, setFilter] = useState({
    limit: 50,
    offset: 0,
    title: "",
  });
  const addGroupForm = useSelector((state) => state.groups.showAddForm);
  const editGroupForm = useSelector((state) => state.groups.showUpdateForm);
  const exceptedUsers = useSelector((state) => state.users.exceptedUsers);
  const usersList = useSelector((state) => state.users.usersList);
  const groupsList = useSelector((state) => state.groups.groupsList);
  const loader = useSelector((state) => state.groups.loader);
  const getgroupsStatus = useSelector(
    (state) => state.groups.groupStatusResponse
  );
  const [assigneedUsers, setAssignees] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const loading = useSelector((state) => state.groups.buttonLoading);
  const [groupId, setGroupId] = useState({});
  const [showDeleteDialog, setDialog] = useState(false);
  const [groupDetails, setGroupDetails] = useState({});
  const [searchUser, setSearchUser] = useState("");
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
  const currentOrganization = useSelector(
    (state) => state.auth.current_organization
  );
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  // const [userSearch, setSearchUser] = useState('')
  // const permissions = useState(JSON.parse(localStorage.getItem("permissions")));
  const user_OrgData = useState(localStorage.getItem("userOrgData")&&JSON.parse(localStorage.getItem("userOrgData")));
  const [permissions,setPermissions] = useState();
  const [teamsPermissions, setTeamsPermissions] = useState();
  const navigate = useNavigate();

  //to get Permissions
  useEffect(() => {
    dispatch(getPermissionsByRole(user_OrgData[0]?.role_id)).then((res)=>{
      setPermissions(res.payload)
      setTeamsPermissions(res.payload?.find((item) => item.table == "groups"));
    })
  }, []);

  //to invoke Sweet Alert
  useEffect(() => {
    if (teamsPermissions?.view == false) {
      opensweetalert();
    }
  }, [teamsPermissions]);

  const opensweetalert = () => {
    Swal.fire({
      title: "Access Denied !",
      icon: "warning",
      showCancelButton: false,
      showConfirmButton: false,
    });
  };

  useEffect(() => {
    fetchExceptUsers();
    dispatch(getUsers(searchUser));
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
    // dispatch(getGroups(filterSearch));
    dispatch(getGroupStatusCount(filterSearch));
  }, [filterSearch]);

  useEffect(() => {
    fetchExceptUsers();
  }, [searchUser]);

  useEffect(() => {
    fetchExceptUsers();
  }, [assigneedUsers]);

  const fetchExceptUsers = () => {
    let userIds = [];
    if (assigneedUsers?.length > 0) {
      assigneedUsers?.map((item) => {
        userIds.push(item.id);
      });
    }
    let payload = {
      array: userIds,
      name: searchUser,
    };
    dispatch(getExceptUsers(payload));
  };

  const addAssignee = (item, event) => {
    event.preventDefault();
    setAssignees((assigneedUsers) => [...assigneedUsers, item]);
  };

  const removeAssignee = (id, event) => {
    event.preventDefault();
    setAssignees((assigneedUsers) =>
      assigneedUsers.filter((item) => item.id !== id)
    );
  };

  const addGroup = (event) => {
    event.preventDefault();
    dispatch(setGroupButtonLoading(!loading));
    let userIds = [];
    if (assigneedUsers?.length > 0) {
      assigneedUsers?.map((item) => {
        userIds.push(item.id);
      });
    }
    if (userIds?.length > 0) {
      let payload = {
        title: groupName,
        description: description,
        group_members: userIds,
        org_id: orgId,
        created_by: userId,
      };
      dispatch(createGroup(payload)).then(() => {
        dispatch(getGroupStatusCount(filterSearch));
      });
    } else {
      toast.error("Please Select Assignees");
      dispatch(setGroupButtonLoading(false));
    }
  };

  const deleteDialog = async (item, event) => {
    event.preventDefault();
    setGroupId(item);
    setDialog(!showDeleteDialog);
  };

  const groupDelete = async () => {
    dispatch(setGroupButtonLoading(true));
    await dispatch(deleteGroup(groupId));
    dispatch(getGroupStatusCount(filterSearch));
    setDialog(!showDeleteDialog);
  };

  const editDialog = async (group, event) => {
    event.preventDefault();
    let team = [];
    for (let i = 0; i < group.group_members.length; i++) {
      let user = usersList?.find((item) => item.id === group.group_members[i]);
      team.push(user);
    }

    fetchExceptUsers();
    setGroupDetails(group);
    dispatch(setGroupUpdateForm(!editGroupForm));
    setAssignees(team);
  };

  const openAddGroupDialog = (event) => {
    event.preventDefault();
    dispatch(setGroupAddform(!addGroupForm));
    setAssignees([]);
  };

  const groupUpdate = (event) => {
    // dispatch(setGroupButtonLoading(!loading))
    let userIds = [];
    if (assigneedUsers?.length > 0) {
      assigneedUsers?.map((item) => {
        userIds.push(item.id);
      });
    }
    var temp = { ...groupDetails, group_members: userIds };
    event.preventDefault();
    dispatch(updateGroup(temp)).then(() => {
      dispatch(getGroupStatusCount(filterSearch));
    });
  };

  const fetchUser = (id, key) => {
    let user = usersList?.find((user) => user.id === id);
    if (user) {
      return (
        <div className="mb-1 assignees-cards">
          <div className="card-gt-body">
            <div className="d_aic_jcsb my-2">
              <div className="d-flex assignes-name">
                <Avatar
                  color={user.color}
                  initials={`${user.name
                    .substring(0, 1)
                    .toUpperCase()}${user.lastname
                    .substring(0, 1)
                    .toUpperCase()}`}
                    image={user.avatar}
                />
                <h5 className="assigneesname" id={user}>
                  {user.name} {user.lastname}
                </h5>
              </div>
              <div id={key}>
                <Button
                  className="icon-buttons-operatorbtn"
                  onClick={(event) => {
                    removeAssignee(user.id, event);
                  }}
                >
                  <FaMinus />
                </Button>{" "}
              </div>
            </div>
          </div>
          {/* <hr ></hr> */}
        </div>
      );
    }
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
          />
        );
      }
    } else {
    }
  };

  const fetchAvatarStack = (avatars) => {
    let avstarsFinal = [];
    avatars.map((item) => {
      let user = usersList?.find((i) => i.id === item);
      user && avstarsFinal.push(user);
    });
    return <AvatarStack limit={5} avatars={avstarsFinal} />;
  };

  const getTasksData = (groupsStatusArray) => {
    let tasksData = {
      totalCount: 0,
      completeCount: 0,
      progress: 0,
    };
    groupsStatusArray?.map(
      (item) =>
        (tasksData.totalCount = tasksData.totalCount + parseInt(item.count))
    );
    groupsStatusArray?.map((item) => {
      if (item.status === "closed") {
        tasksData.completeCount =
          tasksData.completeCount + parseInt(item.count);
      }
    });
    tasksData.progress = (tasksData.completeCount / tasksData.totalCount) * 100;
    return tasksData;
  };

  return (
    <div>
      <>
        <section className="breadcum_section">
          <div className="container-fluid">
            <div className="row d-flex align-items-center justify-content-between">
              <div className="col-md-4">
                <div className="d-flex align-items-center gap-3 masterback-btn">
                  <Button
                    className="primary_btn white_btn d-flex align-items-center justify-content-center"
                    variant="light"
                    size="md"
                    onClick={() => navigate("/master")}
                  >
                    <FaArrowLeft />
                  </Button>
                  <h2 className="bs_title">Teams</h2>
                </div>
              </div>
              <div className="col-md-8">
                <div className="aside_left d-flex align-items-center justify-content-end gap_05rm">
                  <div className="search-box">
                    <input
                      className="form-control text"
                      type="text"
                      name="groups-search"
                      placeholder="Search here"
                      autoFocus
                      onChange={(e) => {
                        setFilter({ ...filterSearch, title: e.target.value });
                      }}
                    />
                    <button>
                      <FaSearch />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary disable-btn"
                    onClick={(event) => openAddGroupDialog(event)}
                    disabled={teamsPermissions?.create == false}
                  >
                    Create Teams
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="teams">
          <div className="container-fluid">
            <div className="row">
              {loader ? (
                <LoaderComponent />
              ) : teamsPermissions?.view == true ? (
                getgroupsStatus?.length > 0 ? (
                  getgroupsStatus?.map((item) => {
                    return (
                      <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 col-12">
                             <Card className="master-card master-global-card mb-4">
                            <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                              <h3 className="m-0 ttww">{item.group.title}</h3>
                              <div>
                              {["start"].map((direction) => (
                                <>
                                  <DropdownButton id="dropdown-menu-align-start" drop={direction} title={<FaEllipsisV className="faelli" />}>
                                    <div className="d_aic_jcc">
                                      <Dropdown.Item id="dropdown-edit" onClick={(event) => editDialog(item.group, event)} disabled={teamsPermissions?.update == false}>
                                        <FaEdit className="dropdown-btnicon"/>
                                      </Dropdown.Item>
                                      <Dropdown.Item id="dropdown-delete" onClick={(event) => deleteDialog(item.group, event)} disabled={teamsPermissions?.delete == false}>
                                        <FaTrashAlt className="dropdown-btnicon"/>
                                      </Dropdown.Item>
                                    </div>
                                  </DropdownButton>
                                </>
                              ))}
                            </div>
                            </div>
                            <div className="tn_assignees">
                              {item.group.group_members.length > 0 ? (
                                item.group.group_members.length &&
                                fetchAvatarStack(item.group.group_members)
                              ) : (
                                <Dropdown>
                                  <Dropdown.Toggle
                                    variant="success"
                                    id="dropdown-basic"
                                  >
                                    <FaPlusCircle id="dropdown-basic" />
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item
                                      id="dropdown-edit"
                                      onClick={(event) =>
                                        editDialog(item.group, event)
                                      }
                                    >
                                      Edit
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      id="dropdown-delete"
                                      onClick={(event) =>
                                        deleteDialog(item.group, event)
                                      }
                                    >
                                      Delete
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              )}
                            </div>
                          <ProgressBar
                            className="groups-progress mt-2"
                            now={getTasksData(item.counts).progress}
                          />
                          <div className="groups-bottom-text mt-2 d-flex justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                              <FaTasks className="fa-task" />
                              <h6 className="m-0">
                                {getTasksData(item.counts).completeCount}/
                                {getTasksData(item.counts).totalCount}
                              </h6>
                            </div>
                            <h6 className="m-0">
                              {item.group.updated_on
                                ? moment(item.group.updated_on).fromNow()
                                : moment(item.group.created_at).fromNow()}
                            </h6>
                          </div>
                          </Card.Body>
                          </Card>
                        </div>
                    );
                  })
                ) : (
                  <div className="col-md-12 center text-center">
                    <img src={NoDataFound} height="500px" alt="NoDataFound" />
                  </div>
                )
              ) : (
                <></>
              )}
            </div>
          </div>
        </section>
      </>
      <Modal
        show={addGroupForm}
        onHide={() => dispatch(setGroupAddform(!addGroupForm))}
        backdrop="static"
        keyboard={false}
        aria-labelledby="example-custom-modal-styling-title"
        centered
        className="modal_forms"
      >
        <Form onSubmit={addGroup}>
          <Modal.Header closeButton>
            <Modal.Title className="modal-title">
              <h2>Create Teams</h2>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row>
              <Col className="col-12 col-sm-12">
                <Form.Group className="formGroup">
                  <Form.Label className="star">
                    Team Name <b>*</b>
                  </Form.Label>
                  <Form.Control
                    required
                    id="groupName"
                    type="text"
                    onChange={(e) => {
                      setGroupName(
                        e.target.value.trim().replace(/\s+/g, " ").toLowerCase()
                      );
                    }}
                  />
                </Form.Group>
              </Col>
              {/* <Col className="col-12 col-sm-6">
                <Form.Group className="formGroup">
                  <Form.Label className="star">Group Description <b>*</b></Form.Label>
                  <Form.Control required id="groupDesc" as="textarea" rows={1} onChange={(e) => {setDescription(e.target.value);}}/> 
                </Form.Group>
              </Col> */}
            </Row>
            <Row>
              <Form.Group className="formGroup">
                <Form.Label className="star">
                  {" "}
                  <BiChat /> Group Description{" "}
                </Form.Label>
                <ReactQuill
                  theme="snow"
                  required
                  id="groupDesc"
                  as="textarea"
                  onChange={(e) => {
                    setDescription(e);
                  }}
                />
              </Form.Group>
            </Row>

            <Row>
              <Col className="col-12 col-sm-12">
                <Card className="mb-3">
                  <Card.Header className="d_aic_jcsb gap-5">Users
                    <input
                      className="form-control m-0"
                      type="search"
                      placeholder="Search"
                      aria-label="Search"
                      onChange={(e) => {
                        setSearchUser(e.target.value);
                      }}
                      name="groups-search"
                    />
                  </Card.Header>

                  <Card.Body className="p-0 userlist_modalcard">
                    <div className="hctrl-200">
                      {exceptedUsers?.length > 0 ? (
                        exceptedUsers?.map((item, key) => {
                          return (
                            <div className="assignees-cards">
                              <div className="card-gt-body">
                                <div
                                  className="d-flex justify-content-between my-2"
                                  id={key}
                                >
                                  <div className="d-flex align-item-center gap-wd-capital">
                                    <Avatar
                                      className="avatar_i"
                                      initials={`${item.name
                                        .substring(0, 1)
                                        .toUpperCase()}${item.lastname
                                        .substring(0, 1)
                                        .toUpperCase()}`}
                                      image={item.avatar}
                                    />
                                    <h5 className="m-0" id={key}>
                                      {item.name} {item.lastname}
                                    </h5>
                                  </div>
                                  <div>
                                    <Button id={key} className="icon-buttons-operatorbtn" onClick={(event) => {addAssignee(item, event);}}>
                                      <FaPlus />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="not-found">
                          <img src={NoGroupsFound} alt="NoGroupFound"/>
                          No Users Found
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col className="col-12 col-sm-12">
                <Card className="">
                  <Card.Header>Team Members</Card.Header>
                  <Card.Body className="p-0 userlist_modalcard">
                    <div className="hctrl-200">
                      {assigneedUsers?.length > 0 ? (
                        assigneedUsers?.map((item, key) => {
                          return <div>{fetchUser(item.id, key)}</div>;
                        })
                      ) : (
                        <div className="text-center no-assignees not-found">
                          <img
                            src={NoGroupsFound}
                            alt="NoGroupFound" width="20%"
                          />
                          No Assignees add yet!
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 
               (<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>) : (<span> Create</span>)
              }
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={editGroupForm}
        onHide={() => dispatch(setGroupUpdateForm(!editGroupForm))}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
        centered
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            {" "}
            Update Team
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="row">
            <div className="col-lg-7 col-md-7">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Team Name <b className="text-danger">*</b>
                  </Form.Label>
                  <Form.Control
                    required
                    id="updateGroupTitle"
                    type="text"
                    onChange={(e) => {
                      setGroupDetails({
                        ...groupDetails,
                        title: e.target.value
                          .trim()
                          .replace(/\s+/g, " ")
                          .toLowerCase(),
                      });
                    }}
                    value={groupDetails.title}
                  />
                </Form.Group>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextarea1"
                >
                  <Form.Label>
                    Group Description <b className="text-danger">*</b>
                  </Form.Label>
                  <ReactQuill
                    theme="snow"
                    required
                    id="updateGroupDesc"
                    as="textarea"
                    rows={2}
                    onChange={(e) => {
                      setGroupDetails({
                        ...groupDetails,
                        description: e,
                      });
                    }}
                    value={groupDetails.description}
                  />
                </Form.Group>
              </Form>
            </div>
            <div className="col-lg-5 col-md-5">
              <Card className="mb-3">
                <Card.Header>Assignees</Card.Header>
                <Card.Body>
                  <input
                    className="form-control creat-task-search mb-2"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    onChange={(e) => {
                      setSearchUser(e.target.value);
                    }}
                    name="groups-search"
                  />
                  <div className="hctrl-200">
                    {exceptedUsers?.length > 0
                      ? exceptedUsers?.map((item, key) => {
                          return (
                            <div className="card mb-1 assignees-cards">
                              <div className="card-gt-body">
                                <div className="d-flex justify-content-between mt-2 mb-2">
                                  <div className="d-flex assignes-name">
                                    <Avatar
                                      color={
                                        avatarBrColors[
                                          Math.floor(
                                            Math.random() *
                                              avatarBrColors.length
                                          )
                                        ]
                                      }
                                      initials={`${item.name
                                        .substring(0, 1)
                                        .toUpperCase()}${item.lastname
                                        .substring(0, 1)
                                        .toUpperCase()}`}
                                        image={item.avatar}
                                    />
                                    <h5 className="assigneesname" id={key}>
                                      {item.name} {item.lastname}
                                    </h5>
                                  </div>
                                  <div className="col-2" id={key}>
                                    <Button className="icon-buttons-operatorbtn" onClick={(event) => {addAssignee(item, event);}}>
                                      <FaPlus />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      : "No Users Found"}
                  </div>
                </Card.Body>
              </Card>

              <div className="mb-3">
                <Card>
                  <Card.Header>Assigneed Users</Card.Header>
                  <Card.Body>
                    <div className="hctrl-200">
                      {assigneedUsers?.length > 0
                        ? assigneedUsers?.map((item, key) => {
                            return (
                              <div className="card mb-1 assignees-cards">
                                <div className="card-gt-body">
                                  <div className="d-flex justify-content-between mt-2 mb-2">
                                    <div className=" d-flex assignes-name">
                                      <Avatar
                                        color={
                                          avatarBrColors[
                                            Math.floor(
                                              Math.random() *
                                                avatarBrColors.length
                                            )
                                          ]
                                        }
                                        initials={`${item.name
                                          .substring(0, 1)
                                          .toUpperCase()}${item.lastname
                                          .substring(0, 1)
                                          .toUpperCase()}`}
                                          image={item.avatar}
                                      />
                                      <h5 className="assigneesname" id={key}>
                                        {item.name} {item.lastname}
                                      </h5>
                                    </div>
                                    <div className="col-2" id={key}>
                                      <Button className="icon-buttons-operatorbtn" onClick={(event) => {removeAssignee(item.id, event);}}>
                                        <FaMinus />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        : "No Assignees"}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" disabled={loading}>
            {loading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <span onClick={groupUpdate}> Update</span>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteDialog}
        onHide={() => setDialog(!showDeleteDialog)}
        backdrop="static"
        aria-labelledby="contained-modal-title-vcenter"
        keyboard={false}
        centered
        className="modal_forms modal-sm"
      >
        <Modal.Header closeButton>
          {/* <Modal.Title className="modal-title text-center">
              <h2 className="text-center">Delete Group</h2>
          </Modal.Title> */}
        </Modal.Header>

        <Modal.Body className="text-center">
          <div className="d_aic_jcc icon_info mt-3 mb-4">
            <BiX className="i" />
          </div>
          <h3 className="text-center title mb-3">Delete Group</h3>
          <p>Are you sure you want to Delete Permanently</p>
        </Modal.Body>

        <Modal.Footer className="modal-footer-jcc border-0">
          <Button
            className="dark-btn"
            variant="secondary"
            onClick={() => setDialog(!showDeleteDialog)}
          >
            Cancel
          </Button>
          <Button
            onClick={groupDelete}
            variant="primary"
            type="submit"
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
              <span> Ok</span>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Groups;
