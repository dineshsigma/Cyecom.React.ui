import { ToastContainer } from "react-toastify";
import {
  FaTimes,
  FaFilter,
  FaSearch,
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaChevronUp,
  FaChevronDown,
  FaArrowLeft,
} from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { BiLinkExternal, BiTrashAlt } from "react-icons/bi";
import { BsFlagFill } from "react-icons/bs";
import { MdDateRange } from "react-icons/md";
import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dropdown,
  Table,
  Card,
  Badge,
  Button,
  Popover,
  Modal,
  Spinner,
  Tooltip,
  Form,
  Tab,
  Tabs,
  Accordion,
  useAccordionButton,
  OverlayTrigger,
  ModalHeader,
  ModalFooter,
} from "react-bootstrap";
import Avatar from "../components/Avatar";
import { avatarBrColors } from "../environment";
import { getLocations } from "../redux/reducers/locationsReducer";
import { getDepartments } from "../redux/reducers/departmentReducer";
import {
  getUsers,
  getOrgUsers,
  getExceptUsers,
} from "../redux/reducers/userReducer";
import { getGroups } from "../redux/reducers/groupReducer";
import {
  setTaskAddform,
  getAll_tasks,
  deleteTask,
  setButtonLoading,
  getAllTeamIds,
  getFilterTasks,
} from "../redux/reducers/taskReducer";
import moment from "moment";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import NoDataFound from "../assets/No_Data_File.png";
import LoaderComponent from "../components/Loader";
import AvatarStack from "../components/AvatarStack";
import { getpriorityConfig } from "../redux/reducers/priorityConfigReducer";
import { getStatusConfig } from "../redux/reducers/statusConfigReducer";
import { MultiSelect } from "react-multi-select-component";
import DatePicker from "react-datepicker";
import { getUserById } from "../redux/reducers/authReducer";
import { getAllUsers } from "../redux/reducers/userReducer";
import StatusBadge from "../components/StatusBadge";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import Switch from "react-switch";
import {
  getApprovalsData,
  createNewApproval,
  setApprovalAddform,
} from "../redux/reducers/approvalsReducer";
import NoGroupsFound from "../assets/not-founds.svg";
import { toast } from "react-toastify";
import captialLetter from "../modules/CaptialLetter";

function Approvals() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userDetails = useSelector((state) => state.auth.userDetails);
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const [filterSearch, setFilter] = useState({
    name: "",
    status: "",
    priority: "",
    assignee: [userDetails.id],
    created_by: userDetails.id,
  });
  const [approrvalSearch,setApprorvalSearch]=useState("")
  const [status, setStatus] = useState("in-progress");
  const loader = useSelector((state) => state.tasks.loader);
  const showAddform = useSelector((state) => state.tasks.showTask);
  const loading = useSelector((state) => state.tasks.buttonLoading);
  const usersList = useSelector((state) => state.users.usersList);
  const deleteResponse = useSelector((state) => state.tasks.deleteTaskResponse);
  const tasks = useSelector((state) => state.tasks.tasks);
  const [showFilters, setShowFilter] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState({});
  const statusList = [
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In-Progress" },
    { value: "in-review", label: "In-Review" },
    { value: "closed", label: "Closed" },
  ];
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

  //Approvals Data starts here
  const exceptedUsers = useSelector((state) => state.users.exceptedUsers);
  const org_id = useSelector((state) => state.auth.current_organization);
  const createApprovalForm = useSelector(
    (state) => state.approval.createApprovalForm
  );
  const approvals = useSelector((state) => state.approval.approvals);
  const [modifiedApprovals, setModifiedApprovals] = useState([]);
  const [title, setTitle] = useState("");
  const [createApproval, setCreateApproval] = useState(false);
  const [toogleVisibility, setToogleVisibility] = useState({});
  const [selectedUsers1, setSelectedUsers1] = useState([]);
  const [selectedUsers2, setSelectedUsers2] = useState([]);
  const [selectedUsers3, setSelectedUsers3] = useState([]);
  const [selectedUsers4, setSelectedUsers4] = useState([]);
  const [selectedUsers5, setSelectedUsers5] = useState([]);
  const [checked, setChecked] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [assignees, setAssignedUsres] = useState([]);
  const [level1Show, setLevel1Show] = useState(true);
  const [level2Show, setLevel2Show] = useState(false);
  const [level3Show, setLevel3Show] = useState(false);
  const [level4Show, setLevel4Show] = useState(false);
  const [level5Show, setLevel5Show] = useState(false);
  const [levelOneUser, setLevelOneUser] = useState([]);
  const [levelTwoUser, setLevelTwoUser] = useState([]);
  const [levelThreeUser, setLevelThreeUser] = useState([]);
  const [levelFourUser, setLevelFourUser] = useState([]);
  const [levelFiveUser, setLevelFiveUser] = useState([]);
  const [plusButton, setPlusButton] = useState(false);
  const [approvalCategory, setApprovalCategory] = useState("");
  const [updateApproval, setUpdateApproval] = useState(false);
  const [categorySelectedParallel, setCategorySelectedParallel] =
    useState(false);
  const [categorySelectedSeries, setCategorySelectedSeries] = useState(false);
  const [editApprovalId, setEditApprovalId] = useState();
  const [editLevelIds, setEditLevelIds] = useState([]);
  const [titleshowError, setTitleShowError] = useState(false);
  const [categoryshowError, setcategoryShowError] = useState(false);
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

  useEffect(() => {
    fetchExceptUsers();
  }, [assignees, userSearch, levelOneUser]);

  useEffect(() => {
    dispatch(getApprovalsData({"name":approrvalSearch}));
    setCreateApproval(false);
    setUpdateApproval(false);
    setTitle("");
    setApprovalCategory("");
    setToogleVisibility({});
    setCategorySelectedSeries(false);
    setCategorySelectedParallel(false);
    setLevelOneUser([]);
    setLevelTwoUser([]);
    setLevelThreeUser([]);
    setLevelFourUser([]);
    setLevelFiveUser([]);
    setLevel1Show(true);
    setLevel2Show(false);
    setLevel3Show(false);
    setLevel4Show(false);
    setLevel5Show(false);
    setPlusButton(false);
  }, [createApprovalForm, approvals?.length,approrvalSearch]);

  const fetchExceptUsers = () => {
    let payload = {
      array: assignees,
      name: userSearch,
    };
    dispatch(getExceptUsers(payload));
  };

  const togglePlus = () => {
    setPlusButton(!plusButton);
  };

  const level1Enable = () => {
    setLevel1Show(!level1Show);
    togglePlus();
  };

  const level2Enable = () => {
    setLevel2Show(!level2Show);
    togglePlus();
  };

  const level3Enable = () => {
    setLevel3Show(!level3Show);
    togglePlus();
  };

  const level4Enable = () => {
    setLevel4Show(!level4Show);
    togglePlus();
  };

  const level5Enable = () => {
    setLevel5Show(!level5Show);
    togglePlus();
  };

  //Remove Assignee Function
  const removeAssignee = (id, event) => {
    event.preventDefault();
    // console.log(event, "EVENT", id, levelOneUser, levelTwoUser);
    if (id == levelOneUser) {
      setLevelOneUser([]);
    } else if (id == levelTwoUser) {
      setLevelTwoUser([]);
    } else if (id == levelThreeUser) {
      setLevelThreeUser([]);
    } else if (id == levelFourUser) {
      setLevelFourUser([]);
    } else if (id == levelFiveUser) {
      setLevelFiveUser([]);
    }
    togglePlus();
    setAssignedUsres((assignees) => assignees.filter((item) => item !== id));
  };

  //Add Assignee Function
  const addAssignee = (item, event) => {
    // console.log('HERE', item, levelOneUser, levelTwoUser);
    event.preventDefault();
    // setAssignedUsres((assigneedUsers) => [...assigneedUsers, item]);
    if (levelOneUser.length == 0) {
      setLevelOneUser(item);
    } else if (levelTwoUser.length == 0) {
      setLevelTwoUser(item);
    } else if (levelThreeUser.length == 0) {
      setLevelThreeUser(item);
    } else if (levelFourUser.length == 0) {
      setLevelFourUser(item);
    } else if (levelFiveUser.length == 0) {
      setLevelFiveUser(item);
    }
    togglePlus();
    setAssignedUsres((assigneedUsers) => [...assigneedUsers, item]);
  };

  useEffect(() => {
    if (approvals.length > 0) {
      const newData = approvals.map((obj) => ({
        ...obj,
        users: obj.approval_templates.map((template) => template.user_id),
      }));
      setModifiedApprovals(newData);
    }
  }, [approvals]);

  const fetchAssignees = (id, key) => {
    let user = usersList?.find((user) => user.id === id);
    if (user) {
      return (
        <div className="card mb-1 assignees-cards">
          <div className="card-gt-body">
            <div className="d-flex justify-content-between">
              <div className="change-password_refer m-0 p-2 d-flex align-items-center gap-2 text-secondary">
                <Avatar
                  color={user.color}
                  initials={`${user.name
                    .substring(0, 1)
                    .toUpperCase()}${user.lastname
                    .substring(0, 1)
                    .toUpperCase()}`
                  }
                  image={user.avatar}
                />
                <div>
                  <p className="assidenedassignees m-0" id={user}>
                    {user.name} {user.lastname}
                  </p>
                  <p className="m-0">{user.location}</p>
                </div>
                <div
                  className=""
                  id={key}
                  onClick={(event) => {
                    removeAssignee(user.id, event);
                  }}
                >
                  <button type="button" className="approval-delete-btn m-0">
                    <BiTrashAlt />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  //Toggel Visibility
  const toggleVisibility = (index, val) => {
    // console.log(index, val);
    setToogleVisibility({
      ...toogleVisibility,
      [index]: !toogleVisibility[index],
    });
  };

  //Create Approval Method Function
  const createApprovalMethod = () => {
    if (title != "" && approvalCategory != "") {
      let checksCount = 0;
      if (level1Show) {
        checksCount++;
      }
      if (level2Show) {
        checksCount++;
      }
      if (level3Show) {
        checksCount++;
      }
      if (level4Show) {
        checksCount++;
      }
      if (level5Show) {
        checksCount++;
      }
      let usersCount = 0;
      if (levelOneUser > 0) {
        usersCount++;
      }
      if (levelTwoUser > 0) {
        usersCount++;
      }
      if (levelThreeUser > 0) {
        usersCount++;
      }
      if (levelFourUser > 0) {
        usersCount++;
      }
      if (levelFiveUser > 0) {
        usersCount++;
      }

      if (usersCount == checksCount) {
        let levelsReq = [];
        if (level1Show && levelOneUser > 0) {
          levelsReq.push(levelOneUser);
        }
        if (level2Show && levelTwoUser > 0) {
          levelsReq.push(levelTwoUser);
        }
        if (level3Show && levelThreeUser > 0) {
          levelsReq.push(levelThreeUser);
        }
        if (level4Show && levelFourUser > 0) {
          levelsReq.push(levelFourUser);
        }
        if (level5Show && levelFiveUser > 0) {
          levelsReq.push(levelFiveUser);
        }
        // console.log(levelsReq, '----------------levelReqq', levelsReq?.length);

        let levels = [];
        if (Object.keys(selectedUsers1).length > 0) {
          levels.push(Array(selectedUsers1));
        }
        if (Object.keys(selectedUsers2).length > 0) {
          levels.push(Array(selectedUsers2));
        }
        if (Object.keys(selectedUsers3).length > 0) {
          levels.push(Array(selectedUsers3));
        }
        if (Object.keys(selectedUsers4).length > 0) {
          levels.push(Array(selectedUsers4));
        }
        if (Object.keys(selectedUsers5).length > 0) {
          levels.push(Array(selectedUsers5));
        }
        //Function to get selected Ids
        function toGetIds(value) {
          let ids = [];
          value.forEach((item) => {
            ids.push(item.value);
          });
          return ids;
        }
        let payLoad = [];
        let master_data = {
          template_name: title,
          task_type: "Live",
          approval_type: "mutliple",
          approval_category: approvalCategory,
          category: "",
          org_id: parseInt(org_id),
          levels: levelsReq.length,
          task_type: "Live",
          created_by: userDetails.id,
        };
        if (updateApproval) {
          levelsReq.forEach((item, index) => {
            let object = {
              force_approval: toogleVisibility[index] || false,
              level_in: index + 1,
              step_name: `${title}-level-${index + 1}`,
              user_id: item,
              id: editLevelIds[index] || 0,
            };
            payLoad.push(object);
          });
          master_data = { ...master_data, id: editApprovalId };
          let finalPayLoad = {
            master_data: master_data,
            levels: payLoad,
            method: "update",
          };

          // console.log(finalPayLoad, "UUUUUUUUUUUU---------------------------PAYLOAD");
          dispatch(createNewApproval(finalPayLoad));
        } else {
          levelsReq.forEach((item, index) => {
            let object = {
              force_approval: toogleVisibility[index] || false,
              level_in: index + 1,
              step_name: `${title}-level-${index + 1}`,
              user_id: item,
              id: 0,
            };
            payLoad.push(object);
          });
          master_data = { ...master_data, id: 0 };
          let finalPayLoad = {
            master_data: master_data,
            levels: payLoad,
            method: "create",
          };
          // console.log(finalPayLoad, "---------------------------PAYLOAD");
          dispatch(createNewApproval(finalPayLoad)).then((res) => {
            setAssignedUsres([]);
          });
        }
      } else {
        toast.error("Assign any user for selected level");
      }
    } else if (title == "") {
      setTitleShowError(true);
      //toast.error("Title and Approval category can't be empty");
    } else {
      setcategoryShowError(true);
      //toast.error("Title and Approval category can't be empty");
    }
  };

  //Edit Approval Function
  const editApproval = (value) => {
    setUpdateApproval(true);
    setEditApprovalId(value.id);
    setTitle(value.template_name);
    if (value.approval_category == "parallel") {
      setCategorySelectedParallel(true);
    } else {
      setCategorySelectedSeries(true);
    }
    setApprovalCategory(value.approval_category);
    setPlusButton(true);
    let LevelIds = [];
    value.approval_templates.forEach((item) => {
      if (item.level_in == 1) {
        setLevelOneUser(item.user_id);
        LevelIds.push(item.id);
        setAssignedUsres((assigneedUsers) => [...assigneedUsers, item.user_id]);
        if (item.force_approval) {
          toogleVisibility[0] = true;
        }
      } else if (item.level_in == 2) {
        LevelIds.push(item.id);
        setLevel2Show(true);
        setLevelTwoUser(item.user_id);
        setAssignedUsres((assigneedUsers) => [...assigneedUsers, item.user_id]);
        if (item.force_approval) {
          toogleVisibility[1] = true;
        }
      } else if (item.level_in == 3) {
        LevelIds.push(item.id);
        setLevel3Show(true);
        setLevelThreeUser(item.user_id);
        setAssignedUsres((assigneedUsers) => [...assigneedUsers, item.user_id]);
        if (item.force_approval) {
          toogleVisibility[2] = true;
        }
      } else if (item.level_in == 4) {
        LevelIds.push(item.id);
        setLevel4Show(true);
        setLevelFourUser(item.user_id);
        setAssignedUsres((assigneedUsers) => [...assigneedUsers, item.user_id]);
        if (item.force_approval) {
          toogleVisibility[3] = true;
        }
      } else if (item.level_in == 5) {
        LevelIds.push(item.id);
        setLevel5Show(true);
        setLevelFiveUser(item.user_id);
        setAssignedUsres((assigneedUsers) => [...assigneedUsers, item.user_id]);
        if (item.force_approval) {
          toogleVisibility[4] = true;
        }
      }
    });
    setEditLevelIds(LevelIds);
  };

  //Close Modal
  const closeModal = () => {
    setCreateApproval(false);
    setUpdateApproval(false);
    setTitle("");
    setApprovalCategory("");
    setToogleVisibility({});
    setCategorySelectedSeries(false);
    setCategorySelectedParallel(false);
    setLevelOneUser([]);
    setLevelTwoUser([]);
    setLevelThreeUser([]);
    setLevelFourUser([]);
    setLevelFiveUser([]);
    setLevel1Show(true);
    setLevel2Show(false);
    setLevel3Show(false);
    setLevel4Show(false);
    setLevel5Show(false);
    setPlusButton(false);
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
    dispatch(getOrganizations(available_organizations));
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
      res.payload.data.getTeamTasks.data.map((item) => {});
    });
  }, []);
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
    await dispatch(deleteTask(deleteId));
    setDeleteModal(!deleteModal);
  };
  const fetchUser = (id) => {
    let user = usersList?.find((item) => item.id === id);
    // let fullName = "";
    // for(const key in user){
    //   if(key === "name" || key === "lastname") {
    //     const firstLetter = user?.[key][0].toUpperCase();
    //     const remainingLetters = user?.[key].slice(1).toLowerCase();
    //     fullName += firstLetter + remainingLetters + " ";
    //   }
    // }
    // return fullName
    return `${captialLetter(user?.name)} ${captialLetter(user?.lastname)}`;
  };
  const fetchAvatarStack = (avatars) => {
    let avstarsFinal = [];
    avatars.map((item) => {
      let user = usersList?.find((i) => i.id === item);
      user && avstarsFinal.push(user);
    });
    // console.log(avstarsFinal, 'AVVVVVV');
    return (
      avstarsFinal.length > 0 && (
        <AvatarStack limit={5} avatars={avstarsFinal} />
      )
    );
  };

  const fetchLevels = (levels) => {
    let levelAvatars = [];
    for (let i = 1; i <= levels; i++) {
      let objectAvt = {
        name: "Level",
        lastname: `${i}`,
      };
      levelAvatars.push(objectAvt);
    }
    // console.log(levelAvatars, 'levelAvatarslevelAvatars');
    return (
      levelAvatars.length > 0 && (
        <AvatarStack limit={levels} avatars={levelAvatars} />
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
    let payload = {};
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
  // popover for filterstab start here
  const popover = (
    <Popover id="popover-basic" className="filters-popover">
      <Popover.Header as="h3">FILTER BY</Popover.Header>
      <hr
        style={{
          all: "initial",
          display: "block",
          "border-bottom": "1px dotted black",
          "margin-left": "auto",
        }}
      />
      <Popover.Body>
        <Tabs
          defaultActiveKey="Priority"
          id="justify-tab-example"
          className="mb-3 filter-tab d-flex"
          fill
        >
          {/* ///------first tab for priority----------Tab1 starts here---- */}
          <Tab eventKey="Priority" title="Priority" className="filter-by">
            {/* get  priority list */}
            {getPriorityList.map((priority, key) => {
              return (
                <div className="d-flex align-items-center priorityTab">
                  <Form.Check
                    type="checkbox"
                    id={`default-checkbox`}
                    label={priority.name}
                    onChange={priorityhandleCheck}
                    value={priority.name}
                    ref={(priority) => {
                      ref.current[key] = priority;
                    }}
                  />
                </div>
              );
            })}
          </Tab>

          {/* ///------first tab for priority----------Tab1 ends here---- */}
          {/* ///------second tab for status----------Tab2 starts here---- */}
          <Tab eventKey="status" title="Status" className="filter-by">
            {/* get status list */}
            {statusConfigList.map((status, key) => {
              return (
                <div className="d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    id={`default-checkbox`}
                    label={status.name}
                    onChange={statushandleCheck}
                    value={status.name}
                    ref={(status) => {
                      statusRef.current[key] = status;
                    }}
                  />
                </div>
              );
            })}
          </Tab>
          {/* ///------second tab for status----------Tab2 ends here---- */}
          {/* ///------third tab for Assigee----------Tab3 starts here---- */}
          {/* <Tab eventKey="assignee" title="Assignee">
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
                  className=""
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
          </Tab> */}

          {/* ///------third tab for Assigee----------Tab3 ends here---- */}
          {/* ///------fourth  tab for startDate,Duedate----------Tab4 starts here---- */}
          <Tab eventKey="date" title="Date">
            <Form.Group className="mb-3">
              <Form.Label className="d-flex icon_space">
                {" "}
                <label> From </label>
              </Form.Label>
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
                dateFormat="MM/dd/yyyy"
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
                dateFormat="MM/dd/yyyy"
              />
            </Form.Group>
          </Tab>
          {/* ///------fourth  tab for startDate,Duedate----------Tab4 ends here---- */}
        </Tabs>
        <hr
          style={{
            all: "initial",
            display: "block",
            "border-bottom": "1px dotted #ADADAD",
          }}
        />
        <div className="d-flex justify-content-between align-items-center filter-footer">
          <a className="filter-button-clear" onClick={() => clearAllFilters()}>
            CLEAR ALL
          </a>
          <button
            type="button"
            className="btn btn-primary filter-button-apply"
            onClick={ApplyFilter}
          >
            Apply
          </button>
        </div>
      </Popover.Body>
    </Popover>
  );

  // console.log(approvals, 'APPROVALS00000000000000000000000000000', usersList, modifiedApprovals);
  return (
    <div>
      {loader ? (
        <LoaderComponent />
      ) : (
        <>
          <section className="breadcum_section">
            <div className="container-fluid">
              <div className="row align-items-center justify-content-between">
                <div className="col-xl-6 col-lg-6 ">
                  <div className="d-flex align-items-center gap-3 masterback-btn">
                    <Button
                      className="primary_btn white_btn d-flex align-items-center justify-content-center"
                      variant="light"
                      size="md"
                      onClick={() => navigate("/master")}
                    >
                      <FaArrowLeft />
                    </Button>
                    <h2 className="bs_title">Approval Workflow</h2>
                  </div>
                </div>
                <div className="col-6 text-end">
                  <div className="aside_left d-flex align-items-center justify-content-end gap-2">
                    <div className="search-box">
                      <input
                        className="form-control text"
                        type="text"
                        name="approvals-search"
                        placeholder="Search here"
                        value={approrvalSearch}
                        autoFocus
                        onChange={(e) => {
                          setApprorvalSearch (e.target.value );
                        }}
                      />
                      <button>
                        <FaSearch />
                      </button>
                    </div>
                    {/* <Button id='showFilters' variant="primary" className="filter-btn" onClick={() => setShowFilter(!showFilters)}><FaFilter /></Button>  */}
                    <button
                      id="addTask"
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setCreateApproval(true)}
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Approvals Table */}
          {modifiedApprovals?.length > 0 ? (
            <section className="mb-3 approvals-section">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-12">
                    <div className="table-responsive">
                      <table className="table table-style1">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Created By</th>
                            <th>Levels</th>
                            <th>Assignees</th>
                            <th>Approval Type</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modifiedApprovals?.map((approval, key) => {
                            return (
                              <tr className="card-table" id={key}>
                                <td className="card-table-task-name d-flex align-item-center ">
                                  <OverlayTrigger
                                    overlay={
                                      <Tooltip id="tooltip-task-name">
                                        {" "}
                                        {/* {approval?.template_name?.charAt(0).toUpperCase() + approval?.template_name?.slice(1)} */}
                                        {captialLetter(approval?.template_name)}
                                      </Tooltip>
                                    }
                                  >
                                    <div className="tn name_alignment">
                                      {/* {approval?.template_name?.charAt(0).toUpperCase() + approval?.template_name?.slice(1)} */}
                                      {captialLetter(approval?.template_name)}
                                    </div>
                                  </OverlayTrigger>
                                </td>
                                <td>{fetchUser(approval?.created_by)}</td>
                                {/* <td>{"no Assignee"}</td> */}

                                <td className="levels-avatar">
                                  {approval?.levels > 0
                                    ? fetchLevels(approval?.levels)
                                    : "No Assigees"}
                                </td>

                                <td>
                                  {approval.users.length > 0
                                    ? fetchAvatarStack(approval.users)
                                    : "No Assigees"}
                                </td>

                                <td>{approval.approval_category}</td>

                                <td>
                                  <div className="tn">
                                    {/* {moment(new Date(task.due_date), "YYYYMMDD").fromNow()} */}
                                    {moment(
                                      approval?.approval_templates[0]
                                        ?.created_at
                                    ).format("ddd, MMM DD, YYYY, h:mm A")}
                                  </div>
                                </td>

                                <td>
                                  <div className="tb-actions d-flex align-item-center justify-content-start">
                                    <button
                                      id="approvalDetails"
                                      className="btn-tl-actions"
                                      onClick={() => editApproval(approval)}
                                    >
                                      <BiLinkExternal />
                                    </button>
                                    {/* <button
                                      id="approvalDelete"
                                      className="btn-tl-actions"
                                      onClick={(event) =>
                                        deleteDialog(approval, event)
                                      }
                                    >
                                      <BiTrashAlt />
                                    </button> */}
                                    {/* <ReactSwitch checked={true} /> */}
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
              <img src={NoDataFound} height="500px" alt="NoDataFound" />
            </div>
          )}
        </>
      )}
      <Modal
        scrollable={true}
        show={createApproval || updateApproval}
        onHide={() => closeModal()}
        centered
        dialogClassName=""
        className="modal_forms approvals-modal modal-75w"
      >
        <ModalHeader>
          <div className="row">
            <div className="col-8">
              <div className="header d-flex align-items-center justify-content-between">
                <h2 className="header m-0">Approvals</h2>
                <button
                  type="button"
                  className="btn px-1"
                  onClick={() => closeModal()}
                >
                  <MdClose className="fs-4" />
                </button>
              </div>
            </div>
            <div className="col-4">
              <h2 className="users-heading">Select User</h2>
            </div>
          </div>
        </ModalHeader>

        <Modal.Body className="p-3 pt-0">
          <div className="row">
            <div className="col-8">
              {/* <div className="header d-flex align-items-center justify-content-between">
                      <h2 className="header">Approvals</h2>
                      <button type="button" className="btn" onClick={() => closeModal()}><MdClose className="fs-2"/></button>
                    </div> */}
              <Form className="approval-add-form">
                <Form.Group className="approvalTitle" controlId="approvalTitle">
                  <Form.Control
                    required
                    rows={1}
                    placeholder="Enter Title*"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    type="text"
                    className="mt-3"
                  />
                  {title.length == 0 && titleshowError && (
                    <p style={{ color: "red", "font-size": "10px" }}>
                      {" "}
                      Please Enter Title
                    </p>
                  )}
                  <Form.Select
                    className="mt-2 mb-3"
                    onChange={(e) => {
                      setApprovalCategory(e.target.value);
                    }}
                    disabled={updateApproval}
                  >
                    <option value="">Select Approval Category</option>
                    <option
                      value="parallel"
                      selected={categorySelectedParallel}
                    >
                      Parallel
                    </option>
                    <option value="series" selected={categorySelectedSeries}>
                      Series
                    </option>
                  </Form.Select>
                  {approvalCategory.length == 0 && categoryshowError && (
                    <p style={{ color: "red", "font-size": "10px" }}>
                      {" "}
                      Please Select category
                    </p>
                  )}
                </Form.Group>
              </Form>
              {/* <h5><span className="me-2"><FaArrowRight/></span>Sales</h5> */}
              <h5 className="approval-head  mt-3 mb-1 ttww">
                Detailed Approval Level’s Info
              </h5>
              <p className="mb-2">
                Please select sub level of configuration setting below
              </p>
              <div className="approval-levels">
                <div className="d-flex align-items-center justify-content-between p-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className=" Checklist-check task_transfer_checkbox m-1 rounded-circle">
                      <input
                        value=""
                        type="checkbox"
                        disabled=""
                        name="level1show"
                        onChange={() => level1Enable()}
                        checked={level1Show}
                      />
                    </div>
                    <h6 className="m-0 star">
                      Level-1 <b>*</b>
                    </h6>
                  </div>
                  <button type="button" onClick={() => level1Enable()}>
                    {level1Show ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                {level1Show ? (
                  <div className="approvals-level-avatar p-3">
                    {levelOneUser.length == 0 && <p>Add user</p>}
                    <div className="d-flex justify-content-between align-items-center">
                      <div>{fetchAssignees(levelOneUser, 1)}</div>
                      <div>
                        {level1Show && levelOneUser > 0 && (
                          <div className="force-approval d-flex flex-column align-items-center gap-1">
                            <Switch
                              height={18}
                              width={38}
                              checked={toogleVisibility[0] ? true : false}
                              onChange={() => {
                                return checked
                                  ? toggleVisibility(0, false)
                                  : toggleVisibility(0, true);
                              }}
                            />
                            <p>Force Approval</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="approval-levels">
                <div className="d-flex align-items-center justify-content-between p-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className=" Checklist-check task_transfer_checkbox m-1 rounded-circle">
                      <input
                        value=""
                        type="checkbox"
                        disabled={level1Show && levelOneUser.length == 0}
                        name="level2Show"
                        onChange={() => level2Enable()}
                        checked={level2Show}
                      />
                    </div>
                    <h6 className="m-0">Level-2</h6>
                  </div>
                  <button type="button" onClick={() => level2Enable()}>
                    {level2Show ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                {level2Show ? (
                  <div className="approvals-level-avatar p-3">
                    {levelTwoUser.length == 0 && <p>Add user</p>}
                    <div className="d-flex justify-content-between align-items-center">
                      <div>{fetchAssignees(levelTwoUser, 1)}</div>
                      <div>
                        {level2Show && levelTwoUser > 0 && (
                          <div className="force-approval d-flex flex-column align-items-center gap-1">
                            <Switch
                              height={18}
                              width={38}
                              checked={toogleVisibility[1] ? true : false}
                              onChange={() => {
                                return checked
                                  ? toggleVisibility(1, false)
                                  : toggleVisibility(1, true);
                              }}
                            />
                            <p>Force Approval</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="approval-levels">
                <div className="d-flex align-items-center justify-content-between p-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className=" Checklist-check task_transfer_checkbox m-1 rounded-circle">
                      <input
                        value=""
                        type="checkbox"
                        disabled={!level1Show || !level2Show}
                        name="level3Show"
                        onChange={() => level3Enable()}
                        checked={level3Show}
                      />
                    </div>
                    <h6 className="m-0">Level-3</h6>
                  </div>
                  <button type="button" onClick={() => level3Enable()}>
                    {level3Show ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                {level3Show ? (
                  <div className="approvals-level-avatar p-3">
                    {levelThreeUser.length == 0 && <p>Add user</p>}
                    <div className="d-flex justify-content-between align-items-center">
                      <div>{fetchAssignees(levelThreeUser, 1)}</div>
                      <div>
                        {level3Show && levelThreeUser > 0 && (
                          <div className="force-approval d-flex flex-column align-items-center gap-1">
                            <Switch
                              height={18}
                              width={38}
                              checked={toogleVisibility[2] ? true : false}
                              onChange={() => {
                                return checked
                                  ? toggleVisibility(2, false)
                                  : toggleVisibility(2, true);
                              }}
                            />
                            <p>Force Approval</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="approval-levels">
                <div className="d-flex align-items-center justify-content-between p-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className=" Checklist-check task_transfer_checkbox m-1 rounded-circle">
                      <input
                        value=""
                        type="checkbox"
                        disabled={!level1Show || !level2Show || !level3Show}
                        name="level4Show"
                        onChange={() => level4Enable()}
                        checked={level4Show}
                      />
                    </div>
                    <h6 className="m-0">Level-4</h6>
                  </div>
                  <button type="button" onClick={() => level4Enable()}>
                    {level4Show ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                {level4Show ? (
                  <div className="approvals-level-avatar p-3">
                    {levelFourUser.length == 0 && <p>Add user</p>}
                    <div className="d-flex justify-content-between align-items-center">
                      <div>{fetchAssignees(levelFourUser, 1)}</div>
                      <div>
                        {level4Show && levelFourUser > 0 && (
                          <div className="force-approval d-flex flex-column align-items-center gap-1">
                            <Switch
                              height={18}
                              width={38}
                              checked={toogleVisibility[3] ? true : false}
                              onChange={() => {
                                return checked
                                  ? toggleVisibility(3, false)
                                  : toggleVisibility(3, true);
                              }}
                            />
                            <p>Force Approval</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="approval-levels">
                <div className="d-flex align-items-center justify-content-between p-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className=" Checklist-check task_transfer_checkbox m-1 rounded-circle">
                      <input
                        value=""
                        type="checkbox"
                        disabled={
                          !level1Show ||
                          !level2Show ||
                          !level3Show ||
                          !level4Show
                        }
                        name="level5Show"
                        onChange={() => level5Enable()}
                        checked={level5Show}
                      />
                    </div>
                    <h6 className="m-0">Level-5</h6>
                  </div>
                  <button type="button" onClick={() => level5Enable()}>
                    {level5Show ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                {level5Show ? (
                  <div className="approvals-level-avatar p-3">
                    {levelFiveUser.length == 0 && <p>Add user</p>}
                    <div className="d-flex justify-content-between align-items-center">
                      <div>{fetchAssignees(levelFiveUser, 1)}</div>
                      <div>
                        {level5Show && levelFiveUser > 0 && (
                          <div className="force-approval d-flex flex-column align-items-center gap-1">
                            <Switch
                              height={18}
                              width={38}
                              checked={toogleVisibility[4] ? true : false}
                              onChange={() => {
                                return checked
                                  ? toggleVisibility(4, false)
                                  : toggleVisibility(4, true);
                              }}
                            />
                            <p>Force Approval</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="col-4 task_transfer_card">
              {/* <h2 className="users-heading">Select User</h2> */}
              {true ? (
                <div className="p-2 approval-select-assignee">
                  <div className="assignes-card-body">
                    <div className="position-relative mb-2">
                      <input
                        className="form-control creat-task-search"
                        type="search"
                        placeholder="Search"
                        aria-label="Search"
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                        }}
                        name="approvals-search"
                      />
                      <span className="task_transfer_search_icon text-secondary">
                        <FaSearch />
                      </span>
                    </div>
                    <ul className="p-0 avatar-list-items position-relative">
                      {exceptedUsers?.length > 0 ? (
                        exceptedUsers?.map((item, key) => {
                          return (
                            <li
                              className="d-flex align-items-center justify-content-between my-2 disable_tooltip"
                              id={key}
                            >
                              <Avatar
                                color={item.color}
                                initials={`${item.name
                                  .substring(0, 1)
                                  .toUpperCase()}${item.lastname
                                  .substring(0, 1)
                                  .toUpperCase()}`}
                                image={item.avatar}
                                className="avatar1"
                              />
                              <div className="name-location">
                                <h5 className="ttww text-start m-0 ms-2   ">
                                  {item.name} {item.lastname}
                                </h5>
                                <p className="text-start m-0 ms-2">
                                  {item.location}
                                </p>
                              </div>
                              <div id={key}>
                                <Button
                                  className="icon-buttons-operatorbtn" onClick={(event) =>addAssignee(item.id, event)} disabled={plusButton}>
                                  <FaPlus />
                                </Button>
                              </div>
                            </li>
                          );
                        })
                      ) : (
                      <div className="not-found"><img src={NoGroupsFound} alt="No group found" />No Users Found</div>)}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Modal.Body>
        <ModalFooter>
          <div className="approvals-footer d-flex justify-content-end gap-2">
            <Button variant="primary" onClick={() => closeModal()}>
              Cancel
            </Button>
            {createApproval ? (
              <Button variant="primary" onClick={() => createApprovalMethod()}>Add Approval Method</Button>
            ) : (
              <Button variant="primary" onClick={() => createApprovalMethod()}>Update Approval Method</Button>
            )}
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default Approvals;
