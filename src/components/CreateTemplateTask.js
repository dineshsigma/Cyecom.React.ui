import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import DatePicker from "react-datepicker";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Card from "react-bootstrap/Card";
import Multiselect from "multiselect-react-dropdown-colors";
import { FaPlus, FaMinus } from "react-icons/fa";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLocations } from "../redux/reducers/locationsReducer";
import { getDepartments } from "../redux/reducers/departmentReducer";
import {
  getUsers,
  getExceptUsers,
  getOrgUsers,
} from "../redux/reducers/userReducer";
import { getGroups } from "../redux/reducers/groupReducer";
import Avatar from "../components/Avatar";
import { avatarBrColors } from "../environment";
import {
  setTemplateAddform,
  createTask,
  deleteRecurringTask,
  createReccurssiveTask,
  get_Recursivetasks,
  setRecurringTaskDetails,
  updateRecurringTask,
  setButtonLoading,
  setUpdateReccuring,
  setSwitchToCreate,
} from "../redux/reducers/taskReducer";
import { RRule } from "rrule";
import Select from "react-select";
import { MultiSelect } from "react-multi-select-component";
import ms from "ms";
import { MdDateRange } from "react-icons/md";
import { toast } from "react-toastify";
import { getStatusConfig, getAllTaksStatus } from "../redux/reducers/statusConfigReducer";
import { getpriorityConfig, getPriorityConfigList } from "../redux/reducers/priorityConfigReducer";
import NoGroupsFound from "../assets/not-founds.svg";
import { FaRegFlag } from "react-icons/fa";
import { BiLabel, BiChat, BiLinkAlt, BiCommentCheck } from "react-icons/bi";
import captialLetter from "../modules/CaptialLetter";
import { AiFillCheckCircle } from "react-icons/ai";
import ReactQuill from "react-quill";
import { modules } from "../environment";
function CreateTemplateTask() {
  const dispatch = useDispatch();
  const [filterSearch, setFilter] = useState("");
  const loading = useSelector((state) => state.tasks.buttonLoading);
  const [startDate, setStartDate] = useState(new Date());
  const [untilDate, setUntilDate] = useState(new Date().getTime() + (48 * 60 * 60 * 1000));
  const [dueDate,setDueDate]=useState(new Date().getTime() + 24 * 60 * 60 * 1000);
  const [assignees, setAssignedUsres] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [individual, setIndividual] = useState(false);
  const [selectedButtons, setSelectedButtons] = useState([]);
  const [checked, setChecked] = useState(false);
  const switchToCreate = useSelector((state) => state.tasks.switchToCreate);
  const exceptedUsers = useSelector((state) => state.users.exceptedUsers);
  const orgId = useSelector((state) => state.auth.current_organization);
  const locationsList = useSelector((state) => state.location.locationsList);
  const getParentPriority_data = useSelector((state) => state.priority.priorityParentList);
  const priorityChildConfig_List = useSelector((state) => state.priority.priorityChildList);
  const statusList = useSelector(
    (state) => state.status.tasksStatus
  );
  const departmentsList = useSelector(
    (state) => state.department.departmentsList
  );
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
  // let statusChildConfigList = useSelector(
  //   (state) => state.status.statusChildConfigList
  // );
  // let originalStatusConfig = useSelector(
  //   (state) => state.status.originalStatusConfig
  // );
  // if (originalStatusConfig?.length > 0) statusChildConfigList = originalStatusConfig;

  //default values for status and priority
  let getParentPrioritydata = getParentPriority_data?.filter((item, index) => { return item.parent_id == null })
  let getParentPriorityFiltereddata = getParentPrioritydata?.sort((a, b) => { return a.id - b.id });
  // let getParentPrioritydata = getPriorityList?.filter((item, index) => { return item.parent_id == null })
  // getParentPrioritydata = getParentPrioritydata?.sort((a, b) => { return b.id - a.id });
  // let DefaultPriorityresponse = getPriorityList?.filter((item, index) => { return item?.parent_id == getParentPrioritydata[0]?.id && item?.org_id ===orgId});
  ////get parent records for status and default value of status
  let getParentStatus = statusList?.parents;
  let statusChildList = statusList?.org_childs?.length ? statusList?.org_childs : statusList?.base_childs;
  let getParentStatusdata = getParentStatus?.filter((item, index) => { return item.parent_id == null });
  let getParentStatusFiltereddata = getParentStatusdata?.sort((a, b) => { return a.id - b.id });

  // let getParentStatusdata = statusConfigList?.filter((item, index) => { return item.parent_id == null });
  // getParentStatusdata = getParentStatusdata?.sort((a, b) => { return a.id - b.id });
  // let DefaultStatusresponse = statusConfigList?.filter((item, index) => { return item?.parent_id == getParentStatusdata[0]?.id && item?.org_id == 0 });


  const usersList = useSelector((state) => state.users.usersList);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const orgUsersList = useSelector((state) => state.users.orgUsersList);
  const groupsList = useSelector((state) => state.groups.groupsList);
  const showAddform = useSelector((state) => state.tasks.showTemplateForm);
  const selectedTask = useSelector((state) => state.tasks.recurringTaskDetails);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState();
  const [showError, setShowError] = useState(false);
  const [status, setStatus] = useState();
  const [frequency, setfrequency] = useState();
  const [FrequencyError, setFrequencyError] = useState(false);
  const [weekStart, setWeekStart] = useState("");
  const [weekDays, setWeekDays] = useState([]);
  const [weekDaysError, setWeekDaysError] = useState(false);
  const [taskNameError, setTaskNameError] = useState("");
  const [monthDays, setMonthDays] = useState([]);
  const updateRecurring = useSelector((state) => state.tasks.updateReccuring);
  const [dependencyvalue, setDependency] = useState(false);
  const [searchGroup, setSearchGroup] = useState("");
  const [searchDept, setSearchDept] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [dateError, setDateError] = useState(false)
  const [endDateErrroMessage, setEndDateErrroMessage] = useState("")
  const [DeafultPriority, setDeafultPriority] = useState()
  const [switchToManualBtn, setSwitchToManualBtn] = useState(false);
  const [untilErrorMessage,setUntilErrorMessage]=useState('');
  const [untilDateError,setUntilDateError]=useState(false);
  const [dueDateError,setDueDateError]=useState(false);
  const [dueDateErrorMessage,setDueDateErrorMessage]=useState('')
  const [childPriorities, setChildPriorities] = useState();
  const [modifiedChildPriorities, setModifiedChildPriorities] = useState();
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [parentPriority, setParentPriority] = useState();

  const weekDayOptions = [
    {
      value: RRule.SU,
      label: "Sun",
    },
    {
      value: RRule.MO,
      label: "Mon",
    },
    {
      value: RRule.TU,
      label: "Tue",
    },
    {
      value: RRule.WE,
      label: "Wed",
    },
    {
      value: RRule.TH,
      label: "Thu",
    },
    {
      value: RRule.FR,
      label: "Fri",
    },
    {
      value: RRule.SA,
      label: "Sat",
    },
  ];
  const byMonthOptions = [
    {
      value: 1,
      label: "Jan",
    },
    {
      value: 2,
      label: "Feb",
    },
    {
      value: 3,
      label: "Mar",
    },
    {
      value: 4,
      label: "Apr",
    },
    {
      value: 5,
      label: "May",
    },
    {
      value: 6,
      label: "Jun",
    },
    {
      value: 7,
      label: "Jul",
    },
    {
      value: 8,
      label: "Aug",
    },
    {
      value: 9,
      label: "Sep",
    },
    {
      value: 10,
      label: "Oct",
    },
    {
      value: 11,
      label: "Nov",
    },
    {
      value: 12,
      label: "Dec",
    },
  ];

  useEffect(() => {
    dispatch(getUsers(filterSearch));
    dispatch(getDepartments(searchDept));
    dispatch(getLocations(searchLocation));
    dispatch(getGroups(searchGroup));
    dispatch(getOrgUsers());
    dispatch(getpriorityConfig());
    dispatch(getPriorityConfigList(orgId))
    dispatch(getAllTaksStatus(orgId));
    dispatch(getStatusConfig());
    fetchExceptUsers();
    if (selectedTask) {
      setTaskDesc(selectedTask.description);
      setTaskName(selectedTask.name);
      setStartDate(selectedTask.start_date);
      setDueDate(selectedTask.due_date)
      setUntilDate(selectedTask.untill_date);
      setPriority(selectedTask.internal_priority);
      setStatus(selectedTask.internal_status);
      setAssignedUsres(selectedTask.assignee);
      setfrequency(selectedTask.config?.frequency);
      let byWeekend = [];
      selectedTask?.config.byweekday?.map((item) => {
        let value = weekDayOptions?.find((week) => week.label === item.label);
        byWeekend.push(value);
      });
      setWeekDays(byWeekend);
      setMonthDays(selectedTask.config?.bymonth);
    }
  }, [filterSearch, searchGroup, searchDept, searchLocation, dependencyvalue]);

  const addAssignee = (item, event) => {
    event.preventDefault();
    setAssignedUsres((assigneedUsers) => [...assigneedUsers, item]);
  };


  //To arrange child priorities
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
    if(!selectedTask){
      setSelectedPriorities([modifiedChilds[modifiedChilds.length-1]])
    }
    if(selectedTask){
      let data=modifiedChilds.filter(item=>item.name.toLowerCase()== selectedTask.internal_priority.toLowerCase());
      setSelectedPriorities(data)
    }
  }
}, [childPriorities, parentPriority]);


useEffect(() => {
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
},[])

useEffect(()=>{ 
  if(selectedPriorities?.length>1){
    let data=[]
    let remove_Status=selectedPriorities.pop()
    data.push(remove_Status)
    setSelectedPriorities(data)
    setPriority(data[0]?.name.toLowerCase())
    // setCreateTask_obj((prev) => ({ ...prev, priority: data[0]?.name.toLowerCase() }))
  }
  if(selectedPriorities?.length==1){
  let data=selectedPriorities
  setPriority(data[0]?.name.toLowerCase())
  // setCreateTask_obj((prev) => ({ ...prev, priority: data[0]?.name.toLowerCase() }))
  }
},[selectedPriorities])

  useEffect(() => {
    let DefaultPriorityresponse = priorityChildConfig_List?.filter((item, index) => { return item?.parent_id == getParentPriorityFiltereddata[getParentPriorityFiltereddata.length-1]?.id });
    if (DefaultPriorityresponse && DefaultPriorityresponse.length > 0) {
      setDeafultPriority(DefaultPriorityresponse && DefaultPriorityresponse[0]?.name)
    }
  }, [getParentPriorityFiltereddata])
  useEffect(() => {
    let DefaultPriorityresponse = statusChildList?.filter((item, index) => { return item?.parent_id == getParentStatusFiltereddata[0]?.id });
    if (DefaultPriorityresponse && DefaultPriorityresponse.length > 0) {
      if (!priority && !selectedTask) {
        setStatus(DefaultPriorityresponse && DefaultPriorityresponse[0]?.name)
      }
      if (priority) {
        setStatus(status)
      }
    }

  }, [getParentStatusFiltereddata])

  useEffect(() => {
    if (weekDays.length > 0) {
      setWeekDaysError(false);
    }
  }, [weekDays]);
  const addfrequency = (event) => {
    let list = [];
    if (event.length > 0) {
      event?.map((item) => list.push(item.value));
    }
    setWeekDays((weekDays) => [...weekDays, list]);
  };

  const onModalHide = () => {
    dispatch(setTemplateAddform(!showAddform));
    dispatch(setRecurringTaskDetails(undefined));
    dispatch(setSwitchToCreate(false));
    dispatch(setUpdateReccuring(false));
    setSwitchToManualBtn(false);
    dispatch(setButtonLoading(false));
  };
  const fetchAssignees = (id) => {
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
              <div>
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

  //updated code for checking and unchecking members
  const addGroupAssignees = (list, event, key) => {
    if (selectedButtons.includes(key)) {
      let indexesToRemove = [];
      for (let i = 0; i < assignees.length; i++) {
        if (list.includes(assignees[i])) {
          indexesToRemove.push(i);
        }
      }
      for (let i = indexesToRemove.length - 1; i >= 0; i--) {
        assignees.splice(indexesToRemove[i], 1);
      }
      setAssignedUsres([...assignees]);
    } else {
      setSelectedButtons([...selectedButtons, key]);
      event.preventDefault();
      list?.map((item) => {
        if (!assignees.includes(item)) {
          setAssignedUsres((assigneedUsers) => [...assigneedUsers, item]);
          setChecked(key);
        }
      });
    }
  };
  const teamCheck = (group, key) => {
    if (assignees.some((assignee) => group?.includes(assignee))) {
      return true;
    } else {
      selectedButtons.splice(selectedButtons.indexOf(key), 1);
      return false;
    }
  };

  //updated code for checking and unchecking departments
  const addDepartmentAssignees = (id, event, key) => {
    if (selectedButtons.includes(key)) {
      let data = [];
      orgUsersList?.map((user) => {
        if (user.department_id == id) {
          setSelectedButtons(selectedButtons.filter((ele) => ele != key));
          for (let i = assignees.length - 1; i >= 0; i--) {
            if (assignees[i] === user.user_id) {
              assignees.splice(i, 1);
            }
          }
        }
      });
    } else {
      event.preventDefault();
      let usersIds = [];
      orgUsersList?.map((user) => {
        if (user.department_id === id) {
          !assignees.includes(user.user_id) && usersIds.push(user.user_id);
        }
      });
      let assigineData = usersIds?.map((item) => item);
      if (usersIds?.length > 0) {
        setSelectedButtons([...selectedButtons, key]);
        usersIds?.map((item) =>
          setAssignedUsres((assigneedUsers) => [...assigneedUsers, item])
        );
      } else {
        toast.error("No Assignees");
      }
    }
  };

  //function to return group member count
  const departmentCount = (id, key, type) => {
    let usersIds = [];
    orgUsersList?.map((user) => {
      if (type == "department") {
        if (user?.department_id == id) {
          usersIds.push(user.user_id);
        }
      }
      if (type == "location") {
        if (user?.location_id == id) {
          usersIds.push(user.user_id);
        }
      }
    });
    return usersIds.length;
  };

  //To check Department members
  const checkDep = (id, key) => {
    let usersIds = [];
    orgUsersList?.map((user) => {
      if (user.department_id == id) {
        usersIds.push(user.user_id);
      }
      if (user.location_id == id) {
        usersIds.push(user.user_id);
      }
    });
    if (assignees.some((assignee) => usersIds?.includes(assignee))) {
      return true;
    } else {
      selectedButtons.splice(selectedButtons.indexOf(key), 1);
      return false;
    }
  };

  //switching reccuring task to manual task
  const createSwitchTask = (e) => {
    e.preventDefault();
    const start_Date = new Date(startDate)
    const end_Date = new Date(dueDate)
    const until_date=new Date(untilDate)
    if (
      (
        start_Date.getFullYear() === end_Date.getFullYear() &&
        start_Date.getMonth() === end_Date.getMonth() &&
        start_Date.getDate() === end_Date.getDate()
      ) ||   (
        start_Date.getFullYear() === end_Date.getFullYear() &&
        start_Date.getMonth() > end_Date.getMonth()
      )||
      (
        end_Date.getFullYear() === until_date.getFullYear() &&
        end_Date.getMonth() === until_date.getMonth() &&
        end_Date.getDate() === until_date.getDate()
      )||
      !taskName||
      assignees.length === 0 ||
      !frequency && frequency != 0||
      weekDays.length === 0 && frequency != 3
    ) {
      if (!taskName) {
        setShowError(true);
      }
      if (assignees.length === 0) {
        toast.error("Select Assignees");
      }
      if (!frequency && frequency != 0) {
        setFrequencyError(true);
      }
      if (start_Date.getFullYear() === end_Date.getFullYear() &&
        start_Date.getMonth() === end_Date.getMonth() &&
        start_Date.getDate() === end_Date.getDate()) {
        setDateError(true)
        setEndDateErrroMessage("End date must be greater than start date")
      }
      if(  (
        start_Date.getFullYear() === end_Date.getFullYear() &&
        start_Date.getMonth() > end_Date.getMonth()
      )){
        setDateError(true)
        setEndDateErrroMessage("End date must be greater than start date")
      }
      if(
        end_Date.getFullYear() === until_date.getFullYear() &&
        end_Date.getMonth() === until_date.getMonth() &&
        end_Date.getDate() === until_date.getDate()
      ){
        setUntilDateError(true)
        setUntilErrorMessage("Until date must be greater than due date")
      }
      if (weekDays.length === 0 && frequency !== 3) {
        setWeekDaysError(true);
      }
      return;
    }
    setSwitchToManualBtn(true);
    e.preventDefault();
    var rule = generateRule();
    var rule_text = rule.toText();
    var ruleSet = rule.all();
    var rruleString = rule.toString();
    let payload_data = {
      name: taskName.trimEnd(),
      description: taskDesc,
      assignee_type: "",
      // start_date: startDate,
      start_date: new Date(startDate).toISOString(),
      //untill_date: untilDate,
      untill_date: new Date(untilDate).toISOString(),
      status: getStatus(),
      priority: getPriority(),
      next_trigger_time: ruleSet[0],
      rule_text: rule_text,
      task_type: "reccurssive",
      locations: `{}`,
      rule_set: `{${ruleSet.slice(1, ruleSet.length - 1).join(",")}}`,
      is_active: true,
      due_date_duration: ms("2d"),
      remainder_interval: 86400000, // shuld do dynamic
      assignee: assignees,
      next_notification: ruleSet[0],
      is_delete: false,
      org_id: orgId,
      recurring_rule: rruleString,
      created_by: userDetails.id,
      config: {
        frequency: frequency,
        dtstart: new Date(startDate).toISOString(),
        until: untilDate,
        byweekday: weekDays,
        bymonth: monthDays,
      },
      internal_priority: priority,
      internal_status: status,
    };
    const task_obj = {
      name: payload_data.name,
      description: payload_data.description,
      assignee_type: "",
      start_date: payload_data.start_date,
      due_date: payload_data.untill_date,
      remainder_interval: 86400000,
      status: getStatus(),
      priority: getPriority(),
      task_type: "Live",
      is_active: true,
      assignee: assignees,
      create_individualTask: individual,
      org_id: orgId,
      createdby: userDetails.id,
      checklistprogress: 0,
      updated_user: `${userDetails.name} ${userDetails.lastname}`,
      internal_priority: payload_data.internal_priority,
      internal_status: payload_data.internal_status,
    };
    dispatch(createTask(task_obj)).then((res) => {
      // dispatch(deleteRecurringTask(selectedTask)).then((res) => {})
      dispatch(get_Recursivetasks(""));
      dispatch(setTemplateAddform(!showAddform));
      dispatch(setButtonLoading(false));
      dispatch(setRecurringTaskDetails(undefined));
      dispatch(setSwitchToCreate(false));
      dispatch(setUpdateReccuring(false));
      setSwitchToManualBtn(false);
    });
    if (assignees.length > 0) {
      dispatch(get_Recursivetasks(""));
      setSwitchToManualBtn(false);
    } else {
      toast.error("Please Select Assignees");
      setSwitchToManualBtn(false);
    }

  };

  const addLocationAssignees = (id, key, event) => {
    if (selectedButtons.includes(key)) {
      let data = [];
      orgUsersList?.map((user) => {
        if (user.location_id == id) {
          setSelectedButtons(selectedButtons.filter((ele) => ele != key));
          for (let i = assignees.length - 1; i >= 0; i--) {
            if (assignees[i] === user.user_id) {
              assignees.splice(i, 1);
            }
          }
        }
      });
    } else {
      event.preventDefault();
      let usersIds = [];
      orgUsersList?.map((user) => {
        if (user.location_id === id) {
          !assignees.includes(user.user_id) && usersIds.push(user.user_id);
        }
      });
      if (usersIds.length > 0) {
        setSelectedButtons([...selectedButtons, key]);
        usersIds?.map((item) =>
          setAssignedUsres((assigneedUsers) => [...assigneedUsers, item])
        );
      } else {
        toast.error("No Assignees");
      }
    }
  };

  const locCheck = (id, key) => {
    let usersIds = [];
    orgUsersList?.map((user) => {
      if (user.location_id == id) {
        usersIds.push(user.user_id);
      }
    });
    if (assignees.some((assignee) => usersIds?.includes(assignee))) {
      return true;
    } else {
      selectedButtons.splice(selectedButtons.indexOf(key), 1);
      return false;
    }
  };

  const fetchExceptUsers = () => {
    let payload = {
      array: assignees,
      name: userSearch,
    };
    dispatch(getExceptUsers(payload));
  };
  
  useEffect(()=>{
    fetchExceptUsers()
  },[userSearch])

  const removeAssignee = (id, event) => {
    event.preventDefault();
    setAssignedUsres((assignees) => assignees.filter((item) => item !== id));
  };

  const generateRule = () => {
    const weekDaysId = [];
    const months = [];
    weekDays?.map((item) => weekDaysId?.push(item.value));
    monthDays?.map((item) => months?.push(item.value));

    const rule = new RRule({
      freq: frequency,
      dtstart: new Date(startDate),
      until: new Date(untilDate),
      count: 30,
      byweekday: weekDaysId,
      bymonth: months,
    });
    return rule;
  };

  const getPriority = () => {
    let priorityObj = priorityChildConfig_List?.find(
      (prioritylist) => prioritylist.name === priority
    );
    let parent;
    if (priorityObj?.parent_id != null) {
      parent = getParentPriority_data?.find(
        (item) => item.id === priorityObj.parent_id
      );
      parent = parent.name;
    } else {
      parent = priority;
    }

    return parent;
  };

  const getStatus = () => {
    let statusObj = statusChildList?.find((statuslist) => statuslist.name === status);
    let parent;
    if (statusObj?.parent_id != null) {
      parent = statusConfigList?.find(
        (item) => item.id === statusObj?.parent_id
      );
      parent = parent?.name;
    } else {
      parent = status;
    }
    return parent;
  };
  const createNewTask = (e) => {
    e.preventDefault();
    const start_Date = new Date(startDate)
    const end_Date = new Date(dueDate)
    const until_date=new Date(untilDate)
    if (
      (
        start_Date.getFullYear() === end_Date.getFullYear() &&
        start_Date.getMonth() === end_Date.getMonth() &&
        start_Date.getDate() === end_Date.getDate()
      ) ||
       (start_Date.getFullYear() === end_Date.getFullYear()&&
        start_Date.getMonth() === end_Date.getMonth() &&
        start_Date.getDate() >end_Date.getDate())||(
          start_Date.getFullYear() === end_Date.getFullYear() &&
          start_Date.getMonth() > end_Date.getMonth()
        )||
      (
        end_Date.getFullYear() === until_date.getFullYear() &&
        end_Date.getMonth() === until_date.getMonth() &&
        end_Date.getDate() === until_date.getDate()
      )||
      !taskName||
      assignees.length === 0 ||
      !frequency && frequency != 0||
      weekDays.length === 0 && frequency != 3
    ) {
      if (!taskName) {
        setShowError(true);
      }

      if (assignees.length === 0) {
        toast.error("Select Assignees");
      }

      if (!frequency && frequency != 0) {
        setFrequencyError(true);
      }
      if (start_Date.getFullYear() === end_Date.getFullYear() &&
        start_Date.getMonth() === end_Date.getMonth() &&
        start_Date.getDate() === end_Date.getDate()) {
        setDateError(true)
        setEndDateErrroMessage("due date must be greater than start date")
      }
      if(  (
        start_Date.getFullYear() === end_Date.getFullYear() &&
        start_Date.getMonth() > end_Date.getMonth()
      )){
        setDateError(true)
        setEndDateErrroMessage("End date must be greater than start date")
      }
      if(
        end_Date.getFullYear() === until_date.getFullYear() &&
        end_Date.getMonth() === until_date.getMonth() &&
        end_Date.getDate() === until_date.getDate()
      ){
        setUntilDateError(true)
        setUntilErrorMessage("Until date must be greater than due date")
      }
      if((start_Date.getFullYear() === end_Date.getFullYear()&&
      start_Date.getMonth() === end_Date.getMonth() &&
      start_Date.getDate() >end_Date.getDate())){
        setDateError(true)
        setEndDateErrroMessage("due date must be greater than start date")
      }

      if (weekDays.length === 0 && frequency !== 3) {
        setWeekDaysError(true);
      }
      return;
    }

    dispatch(setButtonLoading(true));
    e.preventDefault();
    var rule = generateRule();
    var rule_text = rule.toText();
    var ruleSet = rule.all();
    var rruleString = rule.toString();
    let payload_data = {
      name: taskName,
      description: taskDesc,
      assignee_type: "",
      // start_date: startDate,
      start_date: new Date(startDate).toISOString(),
      due_date:new Date(dueDate).toISOString(),
      //untill_date: untilDate,
      untill_date: new Date(untilDate).toISOString(),
      status: getStatus(),
      priority: getPriority(),
      next_trigger_time: ruleSet[0],
      rule_text: rule_text,
      task_type: "reccurssive",
      locations: `{}`,
      rule_set: `{${ruleSet.slice(1, ruleSet.length - 1).join(",")}}`,
      is_active: true,
      due_date_duration: new Date(dueDate).getTime()-new Date(startDate).getTime(),
      remainder_interval: 86400000, // shuld do dynamic
      assignee: assignees,
      next_notification: ruleSet[0],
      is_delete: false,
      org_id: orgId,
      recurring_rule: rruleString,
      created_by: userDetails.id,
      config: {
        frequency: frequency,
        dtstart: new Date(startDate).toISOString(),
        until: untilDate,
        byweekday: weekDays,
        bymonth: monthDays,
      },
      internal_priority: priority,
      internal_status: status,
    };

    if (assignees.length > 0) {
      dispatch(createReccurssiveTask(payload_data)).then((res) => {
        dispatch(get_Recursivetasks(""));
        dispatch(setButtonLoading(false));
      });
    } else {
      toast.error("Please Select Assignees");
      dispatch(setButtonLoading(false));
    }
  };

  const updateTask = (e) => {
  
    e.preventDefault();
    const start_Date = new Date(startDate)
    const end_Date = new Date(dueDate)
    const until_date=new Date(untilDate)
    if (
      (
        start_Date.getFullYear() === end_Date.getFullYear() &&
        start_Date.getMonth() === end_Date.getMonth() &&
        start_Date.getDate() === end_Date.getDate()
      ) || 
      (
        end_Date.getFullYear() === until_date.getFullYear() &&
        end_Date.getMonth() === until_date.getMonth() &&
        end_Date.getDate() === until_date.getDate()
      )||
      !taskName||
      assignees.length === 0 ||
      !frequency && frequency != 0||
      weekDays.length === 0 && frequency != 3
    ) {
      if (!taskName) {
        setShowError(true);
      }

      if (assignees.length === 0) {
        toast.error("Select Assignees");
      }

      if (!frequency && frequency != 0) {
        setFrequencyError(true);
      }
      if (start_Date.getFullYear() === end_Date.getFullYear() &&
        start_Date.getMonth() === end_Date.getMonth() &&
        start_Date.getDate() === end_Date.getDate()) {
        setDateError(true)
        setEndDateErrroMessage("End date must be greater than start date")
      }
      if(
        end_Date.getFullYear() === until_date.getFullYear() &&
        end_Date.getMonth() === until_date.getMonth() &&
        end_Date.getDate() === until_date.getDate()
      ){
        setUntilDateError(true)
        setUntilErrorMessage("Until date must be greater than due date")
      }

      if (weekDays.length === 0 && frequency !== 3) {
        setWeekDaysError(true);
      }
      return;
    }
    dispatch(setButtonLoading(true));
    var rule = generateRule();
    var rule_text = rule.toText();
    var ruleSet = rule.all();
    var rruleString = rule.toString();

    var updatedBody = {
      ...selectedTask,
      name: taskName,
      description: taskDesc,
      start_date: new Date(startDate).toISOString(),
      due_date:new Date(dueDate).toISOString(),
      untill_date: new Date(untilDate).toISOString(),
      status: getStatus(),
      priority: getPriority(),
      rule_text: rule_text,
      recurring_rule: rruleString,
      rule_set: ruleSet.slice(1, ruleSet.length - 1),
      assignee: assignees,
      next_trigger_time: ruleSet[0],
      config: {
        frequency: frequency,
        dtstart: new Date(startDate).toISOString(),
        until: new Date(untilDate).toISOString(),
        byweekday: weekDays,
        bymonth: monthDays,
      },
      next_notification: ruleSet[0],
      internal_priority: priority,
      internal_status: status,
    };
    if (assignees.length > 0) {
      dispatch(updateRecurringTask(updatedBody)).then((res) => {
        if (res.payload.status) {
          dispatch(get_Recursivetasks(""));
          dispatch(setTemplateAddform(!showAddform));
          dispatch(setButtonLoading(false));
          dispatch(setUpdateReccuring(false));
          dispatch(setRecurringTaskDetails(undefined));
          dispatch(setSwitchToCreate(false));
        } else {
          dispatch(setButtonLoading(false));
        }
      });
    } else {
      toast.error("Please Select Assignees");
      dispatch(setButtonLoading(false));
    }
  };

  useMemo(() => {
    fetchExceptUsers();
  }, [assignees]);

  const handleDateChnage = (date) => {
    setStartDate(date);
  
  };
  const handleEndDateChnage=(date)=>{
    setDueDate(date)
    setDateError(false)
    setDueDateError(false);
    setUntilDate(date.getTime() + 24 * 60 * 60 * 1000);
  }

  return (
    <div>
      <Modal
        show={showAddform}
        keyboard={false}
        onHide={onModalHide}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
        centered
        backdrop="static"
        className="create-task-modal"
      >
        <Form
          onSubmit={(e) => {
            selectedTask ? updateTask(e) : createNewTask(e);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title id="example-custom-modal-styling-title">
              {updateRecurring
                ? "recurring task update"
                : switchToCreate
                ? "create Task"
                : "RECURRING TASK"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-xl-7 col-lg-12 modal_forms">
                {/* <Form.Group className="mb-1">
                                        <Form.Label>Template Name</Form.Label>
                                        <Form.Control type="text" onChange={(e) => setTemplateName(e.target.value)} />
                                    </Form.Group> */}
                <Form className="create-task-form p-3">
                  <Form.Group className="mb-3">
                    <Form.Label className="star">
                      Task Name <b>*</b>
                    </Form.Label>
                    <Form.Control
                      required
                      value={taskName.trimStart()}
                      onChange={(e) => {
                        setTaskName(e.target.value);
                      }}
                      onFocus={() => setShowError(false)}
                      type="text"
                      autoFocus
                    />
                    {showError && (
                      <span className="mt-4 text-danger">
                        Please Enter Title
                      </span>
                    )}
                  </Form.Group>

                  <div className="row">
                    <div className="col-6">
                      <Form.Group className="mb-3">
                        <Form.Label className="d-flex icon_space">
                          {" "}
                          <FaRegFlag /> Priority{" "}
                        </Form.Label>
                        <div className="multidis">
                          <Multiselect
                            className="single-select"
                            options={modifiedChildPriorities}
                            singleSelect={true}
                            groupBy="parent"
                            displayValue="name"
                            showCheckbox={true}
                            placeholder={
                              selectedPriorities.length >= 1 ? "" : "search"
                            }
                            selectedValues={selectedPriorities}
                            onSelect={setSelectedPriorities}
                            onRemove={setSelectedPriorities}
                            selectedValueDecorator={(da) => {
                              return (
                                <div className="d-flex align-items-center">
                                  <span
                                    style={{
                                      backgroundColor:
                                        selectedPriorities[0].color,
                                      height: "10px",
                                      width: "10px",
                                      marginRight: "19px",
                                      borderRadius: "50%",
                                    }}
                                  ></span>
                                  <span>{da}</span>
                                </div>
                              );
                            }}
                          />
                        </div>
                      </Form.Group>
                    </div>
                    <div className="col-6">
                      {/* <Form.Group className="mb-3">
                        <Form.Label className="d-flex icon_space">
                          {" "}
                          <BiCommentCheck /> Status{" "}
                        </Form.Label>
                        <Form.Select
                          required
                          disabled={updateRecurring ? false : true}
                          onChange={(e) => {
                            setStatus(e.target.value);
                          }}
                          value={status}
                          aria-label="Default select example"
                        >
                          {getParentStatus?.map((status, index) => {
                            return status.parent_id == null ? (
                              <optgroup label={captialLetter(status.name)}>
                                {statusChildList?.map((child, key) => {
                                  return status.id == child?.parent_id ? (
                                    <option
                                      value={child?.name}
                                      style={{ color: child?.color }}
                                    >
                                      {child?.name?.charAt(0).toUpperCase() +
                                        child?.name?.slice(1)}
                                    </option>
                                  ) : (
                                    ""
                                  );
                                })}
                              </optgroup>
                            ) : (
                              ""
                            );
                          })}
                        </Form.Select>
                      </Form.Group> */}
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <MdDateRange /> Until Date
                        </Form.Label>
                        <DatePicker
                          className="form-control"
                          selected={new Date(untilDate)}
                          minDate={new Date(dueDate)}
                          onChange={(date) => setUntilDate(date)}
                          timeInputLabel="Time:"
                          dateFormat="eee, MMM dd, yyyy, h:mm aa"
                          showTimeInput
                          onFocus={() => {
                            setDateError(false);
                            setUntilDateError(false);
                          }}
                        />
                        {untilDateError && (
                          <span className="text-danger">
                            {untilErrorMessage}
                          </span>
                        )}
                      </Form.Group>
                    </div>
                  </div>

                  <div className="row">
                    <Form.Group className="mb-3">
                      <Form.Label className="star">
                        Frequency<b>*</b>
                      </Form.Label>
                      <div className="weekstart-form d-flex">
                        <Form.Check
                          onChange={(e) => {
                            setfrequency(RRule.YEARLY);
                            setFrequencyError(false);
                          }}
                          required
                          checked={frequency == RRule.YEARLY}
                          inline
                          label="Yearly"
                          name="frequency"
                          type="radio"
                          value="0"
                          id="Yearly"
                        />
                        <Form.Check
                          onChange={(e) => {
                            setfrequency(RRule.MONTHLY);
                            setFrequencyError(false);
                          }}
                          inline
                          checked={frequency == RRule.MONTHLY}
                          required
                          label="Montly"
                          name="frequency"
                          type="radio"
                          value="1"
                          id="Montly"
                        />
                        <Form.Check
                          onChange={(e) => {
                            setfrequency(RRule.WEEKLY);
                            setFrequencyError(false);
                          }}
                          checked={frequency == RRule.WEEKLY}
                          inline
                          required
                          label="Weekly"
                          name="frequency"
                          type="radio"
                          value="2"
                          id="Weekly"
                        />
                        <Form.Check
                          onChange={(e) => {
                            setfrequency(RRule.DAILY);
                            setFrequencyError(false);
                          }}
                          inline
                          checked={frequency == RRule.DAILY}
                          required
                          label="Daily"
                          name="frequency"
                          type="radio"
                          value="3"
                          id="Daily"
                        />
                      </div>
                      {FrequencyError && (
                        <span className="mt-3 text-danger">
                          Please Select Frequency
                        </span>
                      )}
                    </Form.Group>
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <MdDateRange /> Start Date
                        </Form.Label>
                        <DatePicker
                          className="form-control"
                          selected={new Date(startDate)}
                          minDate={new Date()}
                          onChange={handleDateChnage}
                          timeInputLabel="Time:"
                          dateFormat="eee, MMM dd, yyyy, h:mm aa"
                          showTimeInput
                        />
                      </Form.Group>
                    </div>
                    <div className="col-6">
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <MdDateRange /> Due Date
                        </Form.Label>
                        <DatePicker
                          className="form-control"
                          selected={new Date(dueDate)}
                          minDate={new Date()}
                          onChange={handleEndDateChnage}
                          timeInputLabel="Time:"
                          dateFormat="eee, MMM dd, yyyy, h:mm aa"
                          showTimeInput
                        />
                        {dateError && (
                          <span className="text-danger">
                            {endDateErrroMessage}
                          </span>
                        )}
                        {dueDateError && (
                          <span className="text-danger">
                            {dueDateErrorMessage}
                          </span>
                        )}
                      </Form.Group>
                    </div>
                  </div>
                  {switchToCreate ? (
                    ""
                  ) : (
                    <div className="row mb-2">
                      <div className="col-12 col-sm-6">
                        <Form.Group className="mb-1">
                          <Form.Label>Week Days</Form.Label>
                          <MultiSelect
                            options={weekDayOptions}
                            value={weekDays}
                            onChange={setWeekDays}
                            labelledBy="Select"
                          />
                          {weekDaysError && (
                            <span className="mt-3 text-danger">
                              Please Select weekDays
                            </span>
                          )}
                        </Form.Group>
                      </div>
                      {frequency <= 1 && (
                        <div className="col-sm-6 col-12 mb-2">
                          <Form.Group className="mb-1">
                            <Form.Label>By Months</Form.Label>
                            <MultiSelect
                              options={byMonthOptions}
                              value={monthDays}
                              onChange={setMonthDays}
                              labelledBy="Select"
                            />
                          </Form.Group>
                        </div>
                      )}
                    </div>
                  )}
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                  >
                    <Form.Label>Task Description</Form.Label>
                    <ReactQuill
                      modules={modules}
                      formats={[]}
                      theme="snow"
                      rows={2}
                      value={taskDesc}
                      as="textarea"
                      onChange={(e) => setTaskDesc(e)}
                    />
                    {/* <Form.Control
                      value={taskDesc}
                      as="textarea"
                      rows={2}
                      onChange={(e) => setTaskDesc(e.target.value)}
                    /> */}
                  </Form.Group>
                </Form>
              </div>
              <div className="col-xl-5 col-lg-12">
                <div className="mb-3">
                  <Card className="card-need-border">
                    <Card.Header className="pb-0">
                      <h6 className="m-0">Assignees</h6>
                    </Card.Header>
                    <Card.Body className="assignes-card-body pt-2">
                      <Tabs
                        defaultActiveKey="Users"
                        transition={false}
                        id="noanim-tab-example"
                        className="mb-3  tabs_material"
                      >
                        <Tab eventKey="Users" title="Users">
                          <input
                            className="form-control mb-2"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            onChange={(e) => {
                              setUserSearch(e.target.value);
                            }}
                            name="assigness-search"
                          />
                          <div className="hctrl-200">
                            {exceptedUsers.length > 0 ? (
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
                                            color={item.color}
                                            initials={`${item.name
                                              .substring(0, 1)
                                              .toUpperCase()}${item.lastname
                                              .substring(0, 1)
                                              .toUpperCase()}`}
                                            image={item.avatar}
                                          />
                                          <h5 className="assigneesname">
                                            {item.name} {item.lastname}
                                          </h5>
                                        </div>
                                        <div>
                                          <Button
                                            className="icon-buttons-operatorbtn"
                                            onClick={(event) =>
                                              addAssignee(item.id, event)
                                            }
                                          >
                                            <FaPlus />
                                          </Button>{" "}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  // <div className="card mb-3">
                                  //     <div className='card-gt-body'>
                                  //         <div className='row mt-2 mb-2' id={key}>
                                  //             <div className='col-2'>
                                  //                 <Avatar color={avatarBrColors[Math.floor(Math.random() * avatarBrColors.length)]}
                                  //                     initials={`${item.name.substring(0, 2).toUpperCase()}`} />
                                  //             </div>
                                  //             <div className='col-8'>

                                  //                 <h5>{item.name} {item.lastname}</h5>
                                  //             </div>
                                  //             <div className='col-2'>
                                  //                 <FaPlus onClick={(event) => addAssignee(item.id, event)} />
                                  //             </div>
                                  //         </div>
                                  //     </div>
                                  // </div>
                                );
                              })
                            ) : (
                              <div className="not-found">
                                <img src={NoGroupsFound} alt="No group found" />
                                No Users Found
                              </div>
                            )}
                          </div>
                        </Tab>
                        <Tab eventKey="Groups" title="Teams">
                          <input
                            className="form-control mb-2"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            onChange={(e) => {
                              setSearchGroup(e.target.value);
                            }}
                            name="assigness-search"
                          />
                          <div className="hctrl-200">
                            {groupsList.length > 0 ? (
                              groupsList?.map((item, key) => {
                                return (
                                  <div className="card assignees-cards">
                                    <div className="card-gt-body">
                                      <div
                                        className="d-flex justify-content-between mt-2 mb-2"
                                        id={key}
                                      >
                                        <div className="d-flex align-item-center gap-wd-capital">
                                          <Avatar
                                            color={
                                              avatarBrColors[
                                                Math.floor(
                                                  Math.random() *
                                                    avatarBrColors.length
                                                )
                                              ]
                                            }
                                            initials={`${item.title
                                              .substring(0, 2)
                                              .toUpperCase()}`}
                                          />
                                          <div>
                                            <h5 className="assigneesname">
                                              {item.title}
                                            </h5>
                                            <span className="group-mebers">
                                              {item.group_members?.length}{" "}
                                              members
                                            </span>
                                          </div>
                                        </div>
                                        <div>
                                          <Button
                                            id={key + "teams"}
                                            className="icon-buttons-operatorbtn"
                                            onClick={(event) =>
                                              addGroupAssignees(
                                                item.group_members,
                                                event,
                                                key + "teams"
                                              )
                                            }
                                          >
                                            {selectedButtons.includes(
                                              key + "teams"
                                            ) &&
                                            teamCheck(
                                              item.group_members,
                                              key + "teams"
                                            ) ? (
                                              <AiFillCheckCircle />
                                            ) : (
                                              <FaPlus />
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    {/* <hr ></hr> */}
                                  </div>

                                  // <div className="card mb-3">
                                  //     <div className='card-gt-body'>
                                  //         <div className='row mt-2 mb-2' id={key}>
                                  //             <div className='col-2'>
                                  //                 <Avatar color={avatarBrColors[Math.floor(Math.random() * avatarBrColors.length)]}
                                  //                     initials={`${item.title.substring(0, 2).toUpperCase()}`} />
                                  //             </div>
                                  //             <div className='col-8'>

                                  //                 <h5>{item.title}</h5>
                                  //             </div>
                                  //             <div className='col-2' onClick={(event) => addGroupAssignees(item.group_members, event)} >
                                  //                 <FaPlus />
                                  //             </div>
                                  //         </div>
                                  //     </div>
                                  // </div>
                                );
                              })
                            ) : (
                              <div className="not-found">No Groups Found</div>
                            )}
                          </div>
                        </Tab>
                        <Tab eventKey="Departments" title="Departments">
                          <input
                            className="form-control mb-2"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            onChange={(e) => {
                              setSearchDept(e.target.value);
                            }}
                            name="assigness-search"
                          />
                          <div className="hctrl-200">
                            {departmentsList.length > 0 ? (
                              departmentsList?.map((item, key) => {
                                return (
                                  <div className="card assignees-cards">
                                    <div className="card-gt-body">
                                      <div
                                        className="d-flex justify-content-between mt-2 mb-2"
                                        id={key}
                                      >
                                        <div className="d-flex align-item-center gap-wd-capital">
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
                                              .substring(0, 2)
                                              .toUpperCase()}`}
                                          />
                                          <div>
                                            <h5>{item.name}</h5>
                                            <span className="mt-2 group-mebers">
                                              {departmentCount(
                                                item.id,
                                                key + "dep",
                                                "department"
                                              )}{" "}
                                              Members
                                            </span>
                                          </div>
                                        </div>
                                        <div>
                                          <Button
                                            id={key + "dep"}
                                            className="icon-buttons-operatorbtn"
                                            onClick={(event) =>
                                              addDepartmentAssignees(
                                                item.id,
                                                event,
                                                key + "dep"
                                              )
                                            }
                                          >
                                            {selectedButtons.includes(
                                              key + "dep"
                                            ) &&
                                            checkDep(item.id, key + "dep") ? (
                                              <AiFillCheckCircle />
                                            ) : (
                                              <FaPlus />
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    {/* <hr ></hr> */}
                                  </div>

                                  // <div className="card mb-3">
                                  //     <div className='card-gt-body'>
                                  //         <div className='row mt-2 mb-2' id={key}>
                                  //             <div className='col-2'>
                                  //                 <Avatar color={avatarBrColors[Math.floor(Math.random() * avatarBrColors.length)]}
                                  //                     initials={`${item.name.substring(0, 2).toUpperCase()}`} />
                                  //             </div>
                                  //             <div className='col-8'>

                                  //                 <h5>{item.name}</h5>
                                  //             </div>
                                  //             <div className='col-2' onClick={(event) => addDepartmentAssignees(item.id, event)} >
                                  //                 <FaPlus />
                                  //             </div>
                                  //         </div>
                                  //     </div>
                                  // </div>
                                );
                              })
                            ) : (
                              <div className="not-found">
                                No Departments Found
                              </div>
                            )}
                          </div>
                        </Tab>
                        <Tab eventKey="Locations" title="Locations">
                          <input
                            className="form-control mb-2"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            onChange={(e) => {
                              setSearchLocation(e.target.value);
                            }}
                            name="assigness-search"
                          />
                          <div className="hctrl-200">
                            {locationsList?.length > 0 ? (
                              locationsList?.map((item, key) => {
                                return (
                                  <div className="card assignees-cards">
                                    <div className="card-gt-body">
                                      <div
                                        className="d-flex justify-content-between mt-2 mb-2"
                                        id={key}
                                      >
                                        <div className="d-flex align-item-center gap-wd-capital">
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
                                              .substring(0, 2)
                                              .toUpperCase()}`}
                                          />
                                          <div>
                                            <h5>{item.name}</h5>
                                            <span className="mt-2 group-mebers">
                                              {departmentCount(
                                                item.id,
                                                key + "loc",
                                                "location"
                                              )}{" "}
                                              Members
                                            </span>
                                          </div>
                                        </div>
                                        <div>
                                          <Button
                                            id={key + "loc"}
                                            className="icon-buttons-operatorbtn"
                                            onClick={(event) => {
                                              addLocationAssignees(
                                                item.id,
                                                key + "loc",
                                                event
                                              );
                                            }}
                                          >
                                            {selectedButtons.includes(
                                              key + "loc"
                                            ) &&
                                            locCheck(item.id, key + "loc") ? (
                                              <AiFillCheckCircle />
                                            ) : (
                                              <FaPlus />
                                            )}
                                          </Button>{" "}
                                        </div>
                                      </div>
                                    </div>
                                    {/* <hr ></hr> */}
                                  </div>

                                  // <div className="card mb-3">
                                  //     <div className='card-gt-body'>
                                  //         <div className='row mt-2 mb-2' id={key}>
                                  //             <div className='col-2'>
                                  //                 <Avatar color={avatarBrColors[Math.floor(Math.random() * avatarBrColors.length)]}
                                  //                     initials={`${item.name.substring(0, 2).toUpperCase()}`} />
                                  //             </div>
                                  //             <div className='col-8'>

                                  //                 <h5>{item.name}</h5>
                                  //             </div>
                                  //             <div className='col-2' onClick={(event) => addLocationAssignees(item.id, event)}>
                                  //                 <FaPlus />
                                  //             </div>
                                  //         </div>
                                  //     </div>
                                  // </div>
                                );
                              })
                            ) : (
                              <div className="not-found">
                                No Locations Found
                              </div>
                            )}
                          </div>
                        </Tab>
                      </Tabs>
                    </Card.Body>
                  </Card>
                </div>
                <div className="mb-3">
                  <Card className="card-need-border">
                    <Card.Header className="pb-0">
                      <h6 className="m-0">Assigneed Users</h6>
                    </Card.Header>
                    <Card.Body className="hctrl-300 hctrl-200 pt-2">
                      {assignees.length > 0 ? (
                        assignees?.map((item, key) => {
                          return <div id={key}>{fetchAssignees(item)}</div>;
                        })
                      ) : (
                        <div className="not-found no-assignees">
                          <div className="text-center ">No Assignees</div>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {updateRecurring ? (
              <>
                {" "}
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    <span> Update Task</span>
                  )}
                </Button>{" "}
                <Button
                  variant="primary"
                  disabled={switchToManualBtn}
                  onClick={(e) => {
                    createSwitchTask(e);
                  }}
                >
                  {switchToManualBtn ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    <span> Switch to manual Task</span>
                  )}
                </Button>
              </>
            ) : (
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <span>Create Task</span>
                )}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default CreateTemplateTask;
