import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import captialLetter from "../modules/CaptialLetter";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { Form, Container, Row, Col, Table } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { MultiSelect } from "react-multi-select-component";
import DatePicker from "react-datepicker";
import { cloneDeep } from "@apollo/client/utilities";
import { getAllTaksStatus } from "../redux/reducers/statusConfigReducer";
import { getPriorityConfigList } from "../redux/reducers/priorityConfigReducer";
import { getLocations } from "../redux/reducers/locationsReducer";
import { getDepartments } from "../redux/reducers/departmentReducer";
import Switch from "react-switch";
import {getUsers,getExceptUsers,getOrgUsers,getTaskUserData,} from "../redux/reducers/userReducer";
import {getReportFilter,exportDataDownload,deleteSavedReports,saveReportTemplate,getSavedReportsTemplates,updateSavedReports,setReportData} from "../redux/reducers/taskReducer";
import { FaArrowLeft,FaPlus,FaFileExport,FaTrashAlt, FaFilter} from "react-icons/fa";
import { MdDateRange } from "react-icons/md";
import LoaderComponent from "../components/Loader";
import Badge from "react-bootstrap/Badge";
import { BsFlagFill } from "react-icons/bs";
import { Tooltip, Button, Card } from "react-bootstrap";
import moment from "moment";
import AvatarStack from "../components/AvatarStack";
import StatusBadge from "../components/StatusBadge";
import NoDataFound from "../assets/No_Data_File.png";
import exportFromJSON from "export-from-json";
import Multiselect from "multiselect-react-dropdown-colors";
import { toast } from "react-toastify";
import { getGroups } from "../redux/reducers/groupReducer";
import { Modal} from "react-bootstrap";

const Reports = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orgId = useSelector((state) => state.auth.current_organization);
  const reportFilters = useSelector((state) => state.tasks.reportFilters);
  const statusList = useSelector((state) => state.status.tasksStatus);
  const orgListData = useSelector(
    (state) => state.organization.organizationsList
  );
  const loader = useSelector((state) => state.tasks.loader);
  const priorityChildConfig_List = useSelector(
    (state) => state.priority.priorityChildList
  );
  const taskCreateData = useSelector((state) => state.users.userTaskData);
  const usersList = useSelector((state) => state.users.usersList);
  let statusChildList = statusList?.org_childs?.length
    ? statusList?.org_childs
    : statusList?.base_childs;
  const [parentStatus, setParentStatus] = useState();
  const [parentPriority, setParentPriority] = useState();
  const [locations, setLocations] = useState();
  const [departments, setDepartments] = useState();
  const [reportDeleteLoader,setReportDeleteLoader]=useState(false)
  const [teams, setTeams] = useState();
  const [users, setUsers] = useState();
  const [queryObj, setQueryObj] = useState([
    {
      checkbox: true,
      type: "AND",
      field: "",
      operator: "=",
      value: [],
    },
  ]);
  const fields = [
    "status",
    "priority",
    "location",
    "department",
    "users",
    "startdate",
    "duedate",
    "teams",
    "closeddate"
  ];
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const dateFields = ["This Week", "This Month", "Date Range"];
  const [dateStructure, setDateStructue] = useState("This Week");
  const [dateStructure2, setDateStructue2] = useState("This Week");
  const [dateStructure3, setDateStructue3] = useState("This Week");
  const [startdateStart, setStartdateStart] = useState();
  const [startdateEnd, setStartdateEnd] = useState();
  const [duedateStart, setDuedateStart] = useState();
  const [duedateEnd, setDuedateEnd] = useState();
  const [closeddateStart, setCloseddateStart] = useState();
  const [closeddateEnd, setCloseddateEnd] = useState();
  const [operator, setOperator] = useState("AND");
  const [childPriorities, setChildPriorities] = useState();
  const [modifiedChildStatus, setModifiedChildStatus] = useState();
  const [modifiedChildPriorities, setModifiedChildPriorities] = useState();
  const [checked, setChecked] = useState(false);
  const [showSaveReport,setShowSaveReport]=useState(false);
  const [saveReportTitle, setSaveReportTitle] = useState("");
  const [reportTitleError,setReportTitleError]=useState(false);
  const [reportUpdateId,setReportUpdateId]=useState("");
  const [savedReportsData, setSavedReportsData] = useState([]);
  const [dateDitected, setDateDitected] = useState(false);
  const [template, setTemplate] = useState("");
  const [stateUpdated, setStateUpdated] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState([]);
  const [reportDeleteModal,setReportDeleteModal]=useState(false)

  //To initiate all the values for multiselect
  useEffect(() => {
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

    dispatch(getLocations("")).then((resp) => {
      let locationList = [];
      resp.payload?.map((item) => {
        locationList.push({
          label: `${
            item?.name?.charAt(0).toUpperCase() + item?.name?.slice(1)
          }`,
          value: item.id,
        });
      });
      setLocations(locationList);
    });

    dispatch(getDepartments("")).then((resp) => {
      let deptList = [];
      resp.payload?.map((item) => {
        deptList.push({
          label: `${
            item?.name?.charAt(0).toUpperCase() + item?.name?.slice(1)
          }`,
          value: item.id,
        });
      });
      setDepartments(deptList);
    });

    dispatch(getUsers("")).then((resp) => {
      let usersList = [];
      resp.payload?.map((item) => {
        usersList.push({
          label: `${
            item?.name?.charAt(0).toUpperCase() + item?.name?.slice(1)
          }`,
          value: item.id,
        });
      });
      setUsers(usersList);
    });
    dispatch(getTaskUserData(""));
    dispatch(getGroups("")).then((resp) => {
      let teamsList = [];
      resp.payload?.map((item) => {
        teamsList.push({
          label: `${
            item?.title?.charAt(0).toUpperCase() + item?.title?.slice(1)
          }`,
          value: item.id,
        });
      });
      setTeams(teamsList);
    });
  }, []);

  //To set Status Values
  useEffect(() => {
    const newObject = cloneDeep(queryObj);
    const statusFinal = selectedStatuses?.map((item) => item.name);
    newObject?.map((item) => {
      if (item.field == "status") {
        item.value = statusFinal;
      }
    });
    setQueryObj(newObject);
  }, [selectedStatuses]);

  //To set Priority Values
  useEffect(() => {
    const newObject = cloneDeep(queryObj);
    const priorityFinal = selectedPriorities.map((item) => item.name);
    newObject.map((item) => {
      if (item.field == "priority") {
        item.value = priorityFinal;
      }
    });
    setQueryObj(newObject);
  }, [selectedPriorities]);

  //Toset Location Values
  useEffect(() => {
    const newObject = cloneDeep(queryObj);
    const locationFinal = selectedLocations.map((item) => item.value);
    newObject.map((item) => {
      if (item.field == "location") {
        item.value = locationFinal;
      }
    });
    setQueryObj(newObject);
  }, [selectedLocations]);

  //Toset Department Values
  useEffect(() => {
    const newObject = cloneDeep(queryObj);
    const departmentsFinal = selectedDepartments.map((item) => item.value);
    newObject.map((item) => {
      if (item.field == "department") {
        item.value = departmentsFinal;
      }
    });
    setQueryObj(newObject);
  }, [selectedDepartments]);

  //Toset User Values
  useEffect(() => {
    const newObject = cloneDeep(queryObj);
    const usersFinal = selectedUsers.map((item) => item.value);
    newObject.map((item) => {
      if (item.field == "users") {
        item.value = usersFinal;
      }
    });
    setQueryObj(newObject);
  }, [selectedUsers]);

  //Toset Teams Values
  useEffect(() => {
    const newObject = cloneDeep(queryObj);
    const teamsFinal = selectedTeams.map((item) => item.value);
    newObject.map((item) => {
      if (item.field == "teams") {
        item.value = teamsFinal;
      }
    });
    setQueryObj(newObject);
  }, [selectedTeams]);

  //To autosubmit query after selecting template
  useEffect(() => {
    if(selectedTemplate.length>0){
      submitQuery('Run');
    }
  }, [stateUpdated])

  //To modify templates as per multiselect options
  useEffect(()=>{
    dispatch(getSavedReportsTemplates("")).then((ress)=>{
      const transformedArray = ress.payload.data.report_templates.map(item => ({
        name: item.template_name,
        value: item
      }));
      setSavedReportsData(transformedArray)
    })
  },[])

  //This week
  function getStartAndEndOfWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      from: startOfWeek,
      to: endOfWeek,
    };
  }

  //This Month
  function getStartAndEndOfMonthTillToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const startOfMonth = new Date(year, month, 1);
    startOfMonth.setHours(0, 0, 0, 0);

    today.setHours(23, 59, 59, 999); // Set today's time to end of the day

    return {
      from: startOfMonth,
      to: today,
    };
  }

  //Toset Start Date
  useEffect(() => {
    if (dateStructure == "This Week") {
      const { from, to } = getStartAndEndOfWeek();
      // console.log("Start of the week:", from.toISOString());
      // console.log("End of the week:", to.toISOString());
      setStartdateStart(from);
      setStartdateEnd(to);
    } else if ((dateStructure == "This Month"&&!selectedTemplate.length>=1)) {
      const { from, to } = getStartAndEndOfMonthTillToday();
      // console.log("Start of the month:", from.toISOString());
      // console.log("Today:", to.toISOString());
      setStartdateStart(from);
      setStartdateEnd(to);
    } else if(dateStructure == "Date Range" && !dateDitected){
      setStartdateStart("");
      setStartdateEnd("");
    }
  }, [dateStructure]);

  //Toset Due Date
  useEffect(() => {
    if ((dateStructure2 == "This Week"&&!selectedTemplate.length>=1)) {
      const { from, to } = getStartAndEndOfWeek();
      // console.log("Start of the week:", from.toISOString());
      // console.log("End of the week:", to.toISOString());
      setDuedateStart(from);
      setDuedateEnd(to);
    } else if ((dateStructure2 == "This Month"&&!selectedTemplate.length>=1)) {
      const { from, to } = getStartAndEndOfMonthTillToday();
      // console.log("Start of the month:", from.toISOString());
      // console.log("Today:", to.toISOString());
      setDuedateStart(from);
      setDuedateEnd(to);
    }else if((dateStructure2 == "Date Range" && !dateDitected&&!selectedTemplate.length>=1)){
      setDuedateStart("");
      setDuedateEnd("");
    }
  }, [dateStructure2]);

  //Toset Closed Date
  useEffect(() => {
    if ((dateStructure3 == "This Week"&&!selectedTemplate.length>=1)) {
      const { from, to } = getStartAndEndOfWeek();
      // console.log("Start of the week:", from.toISOString());
      // console.log("End of the week:", to.toISOString());
      setCloseddateStart(from);
      setCloseddateEnd(to);
    } else if ((dateStructure3 == "This Month"&&!selectedTemplate.length>=1)) {
      const { from, to } = getStartAndEndOfMonthTillToday();
      // console.log("Start of the month:", from.toISOString());
      // console.log("Today:", to.toISOString());
      setCloseddateStart(from);
      setCloseddateEnd(to);
    }else if(dateStructure3 == "Date Range" && !dateDitected&&!selectedTemplate.length>=1){
      setCloseddateStart("");
      setCloseddateEnd("");
    }
  }, [dateStructure3]);

  const checkboxClick = (e, index) => {
    const newObject = cloneDeep(queryObj);
    newObject[index].checkbox = !newObject[index].checkbox;
    setQueryObj(newObject);
  };

  const slectedOperator = (e, index) => {
    // console.log(e.target.value, queryObj, index);
    const newObject = cloneDeep(queryObj);
    newObject[index].type = e.target.value;
    // console.log(newObject, "Q1");
    setQueryObj(newObject);
  };

  useEffect(() => {
    const allFields = queryObj.map((item) => item.field);
    setSelectedFields(allFields);
  }, [queryObj]);

  const slectedField = (e, index) => {
    const newObject = cloneDeep(queryObj);
    newObject[index].field = e.target.value;
    setQueryObj(newObject);
  };
const setReportValue=(e)=>{
  if(e.length>1){
    let data=[]
    let remove_previous_val=e.pop()
    data.push(remove_previous_val)
    setSelectedTemplate(data)
    setSelectedReport(data[0]?.name)
  }
  else{
    setSelectedTemplate(e)
    setSelectedReport(e[0]?.name)
  }
 
}
  //Selected Report Template
  const setSelectedReport = (e) => {
    setTemplate(e);
    let data = {
      assignees: [],
      closeddate: { to_date: '', from_date: '' },
      department: [],
      duedate: { to_date: '', from_date: '' },
      location: [],
      operator: "AND",
      priority: [],
      startdate: { to_date: '', from_date: '' },
      status: [],
      teams: []
    }
    let filterReportData;
    if (e != "default") {
      filterReportData = savedReportsData?.filter(item => item?.name == e);
      setSaveReportTitle(filterReportData[0]?.name);
      setReportUpdateId(filterReportData[0]?.value.id)
    }
    if (e == "default") {
      filterReportData = [{ template: data }]
    }
    // console.log("filterReportData", filterReportData)
    setOperator(filterReportData[0]?.value?.template?.operator);
    const newQuery = [];
    const newArray = [];
   
    const newSelectedReportFilter = {
      ...filterReportData[0]?.value?.template,
      "users": filterReportData[0]?.value?.template["assignees"]
    };




    // Delete the old "assignees" key from the new object
    delete newSelectedReportFilter["assignees"];
    for (const key in newSelectedReportFilter) {
      if (
        (Array.isArray(newSelectedReportFilter[key]) &&
          newSelectedReportFilter[key].length > 0)
      ) {
        newArray.push({ [key]: newSelectedReportFilter[key] });
      } else if (newSelectedReportFilter[key]?.to_date && newSelectedReportFilter[key]?.from_date) {
        newArray.push({ [key]: newSelectedReportFilter[key] });
      }
    }
    newArray?.forEach((item) => {
      // console.log(Object.values(item), 'values');
      let queryReq = {
        checkbox: true,
        type: "AND",
        field: Object.keys(item)?.[0],
        operator: "=",
        value: Object.keys(item)?.[0]?.includes('date') ? [] : Object.values(item)?.[0],
      };
      let statuses = [];
      let priorities = [];
      let departmentsNew = [];
      let teamsNew = [];
      let locationsNew = [];
      let usersNew = [];
      if (Object.keys(item)?.[0] == "status") {
        let obj = {};
        Object.values(item)?.[0]?.forEach((item) => {
          obj = { "name": item?.charAt(0).toUpperCase() + item?.slice(1) };
          statuses.push(obj);
        })
        setSelectedStatuses(statuses)
      }
      else if (Object.keys(item)?.[0] == "priority") {
        let obj = {};
        Object.values(item)?.[0]?.forEach((item) => {
          obj = { "name": item?.charAt(0).toUpperCase() + item?.slice(1) };
          priorities.push(obj);
        })
        setSelectedPriorities(priorities)
      }
      else if (Object.keys(item)?.[0] == "department") {
        let obj = {};
        Object.values(item)?.[0]?.forEach((item) => {
          obj = {
            "label": departments?.find(dep => dep?.value == item)?.label,
            "value": item
          };
          departmentsNew.push(obj);
        })
        setSelectedDepartments(departmentsNew)
      }
      else if (Object.keys(item)?.[0] == "teams") {
        let obj = {};
        Object.values(item.teams).filter(item=>teams.map(item=>item.value).includes(item)).forEach((item) => {
          obj = {
            "label": teams?.find(dep => dep?.value == item)?.label,
            "value": item
          };
          teamsNew.push(obj);
        })
        setSelectedTeams(teamsNew)
      }
      else if (Object.keys(item)?.[0] == "location") {
        let filterLocations=Object.values(item)[0].filter(item=>Object.values(locations).map(item=>item.value).includes(item))
        let obj = {};
        filterLocations.forEach((item) => {
          obj = {
            "label": locations?.find(dep => dep?.value == item)?.label,
            "value": item
          };
          locationsNew.push(obj);
        })
        setSelectedLocations(locationsNew)
      }
      else if (Object.keys(item)?.[0] == "users") {
        let obj = {};
        Object.values(item)?.[0]?.forEach((item) => {
          obj = {
            "label": users?.find(dep => dep?.value == item)?.label,
            "value": item
          };
          usersNew.push(obj);
        })
        setSelectedUsers(usersNew);
      } else if (Object.keys(item)?.[0].includes("date")) {
        if (Object.keys(item)?.[0] == 'startdate') {
          setDateDitected(true);
          if (Object.values(item)?.[0].duration == 'Date Range'||Object.values(item)?.[0].duration == 'This Month') {
            let from_date_split=Object.values(item)?.[0]?.from_date.split('.');
            let to_date_split=Object.values(item)?.[0]?.to_date.split('.');
            console.log(`new Date(moment(from_date_split[0], "YYYY-MM-DDTHH:mm:ss.SSSSSSZ").format("ddd, MMM DD, YYYY, h:mm A"))`,new Date(moment(from_date_split[0], "YYYY-MM-DDTHH:mm:ss.SSSSSSZ").format("ddd, MMM DD, YYYY, h:mm A")))
            setStartdateStart(new Date(moment(from_date_split[0], "YYYY-MM-DDTHH:mm:ss.SSSSSSZ").format("ddd, MMM DD, YYYY, h:mm A")));
            setStartdateEnd(new Date(moment(to_date_split[0], "YYYY-MM-DDTHH:mm:ss.SSSSSSZ").format("ddd, MMM DD, YYYY, h:mm A")));
            console.log("datasRtcuredeee1",Object.values(item)?.[0]?.duration)
            setDateStructue(Object.values(item)?.[0]?.duration);
          } else {
            console.log("datasRtcuredeee2",Object.values(item)?.[0]?.duration)
            setDateStructue(Object.values(item)?.[0]?.duration);
          }
        } else if (Object.keys(item)?.[0] == 'duedate') {
          setDateDitected(true);
          if (Object.values(item)?.[0].duration == 'Date Range'||Object.values(item)?.[0].duration == 'This Month') {
            let from_date_split=Object.values(item)?.[0]?.from_date.split('.');
            let to_date_split=Object.values(item)?.[0]?.to_date.split('.');
            setDuedateStart(new Date(moment(from_date_split[0], "YYYY-MM-DDTHH:mm:ss.SSSSSSZ").format("ddd, MMM DD, YYYY, h:mm A")));
            setDuedateEnd(new Date(moment(to_date_split[0], "YYYY-MM-DDTHH:mm:ss.SSSSSSZ").format("ddd, MMM DD, YYYY, h:mm A")));
            setDateStructue2(Object.values(item)?.[0]?.duration);
          } else {
            setDateStructue2(Object.values(item)?.[0].duration);
          }
        } else if (Object.keys(item)?.[0] == 'closeddate') {
          setDateDitected(true);
          if (Object.values(item)?.[0]?.duration == 'Date Range') {
            setCloseddateStart(new Date(Object.values(item)?.[0]?.from_date));
            setCloseddateEnd(new Date(Object.values(item)?.[0]?.to_date));
            setDateStructue3(Object.values(item)?.[0]?.duration);
          } else {
            setDateStructue3(Object.values(item)?.[0]?.duration);
          }
        }
      }
      newQuery.push(queryReq);
    })
    setQueryObj(newQuery);
    if(selectedTemplate?.length>0){
      setStateUpdated(!stateUpdated);
    }
  }

  const slectedValues = (e, index) => {
    const newObject = cloneDeep(queryObj);
    e.forEach((element) => {
      const indexObj = newObject[index]?.value.findIndex(
        (item) => item.label == element?.label && item?.value == element?.value
      );
      if (indexObj != -1) {
        newObject[index]?.value.splice(indexObj, 1);
      } else {
        newObject[index]?.value.push(element);
      }
    });

    // Create a temporary object to keep track of unique objects
    const uniqueObjects = {};

    // Use filter to remove duplicates based on the "label" property
    const filteredData = newObject[index]?.value?.filter((item) => {
      if (!uniqueObjects[item?.label]) {
        uniqueObjects[item?.label] = true;
        return true;
      }
      return false;
    });
    newObject[index].value = filteredData;
    setQueryObj(newObject);
  };
  // to Add Query
  const addQuery = () => {
    const newObject = cloneDeep(queryObj);
    let newFields = {
      checkbox: true,
      type: "AND",
      field: "",
      operator: "=",
      value: [],
    };
    newObject.push(newFields);
    setQueryObj(newObject);
  };

  //To Submit the query on every change
  // useEffect(() => {
  //   if (queryObj.filter((item) => item.field == "").length != queryObj.length) {
  //     submitQuery();
  //   }
  // }, [queryObj.length]);

  // to remove Query
  function removeQuery(index) {
    const newObject = cloneDeep(queryObj);
    newObject[index].value = [];
    if (newObject[index].field == "status") {
      setSelectedStatuses([]);
    } else if (newObject[index].field == "priority") {
      setSelectedPriorities([]);
    } else if (newObject[index].field == "users") {
      setSelectedUsers([]);
    } else if (newObject[index].field == "location") {
      setSelectedLocations([]);
    } else if (newObject[index].field == "department") {
      setSelectedDepartments([]);
    } else if (newObject[index].field == "teams") {
      setSelectedTeams([]);
    }
    const removedArray = newObject.splice(index, 1);
    setQueryObj(newObject);
  }

  const toLowerCase = (values) => {
    // console.log(values, "VVV");
    let newValues = [];
    values.forEach((item) => {
      if (typeof item == "string") {
        newValues.push(item.toLowerCase());
      } else {
        newValues.push(item);
      }
    });
    // console.log(newValues, 'V22222');
    return newValues;
  };

  //To clear All Selected Data
  const clearSelectedData=()=>{
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedLocations([]);
    setSelectedDepartments([]);
    setSelectedTeams([]);
    setSelectedUsers([]);
    setTemplate("")
    setReportUpdateId();
    setSaveReportTitle(); 
    setSelectedTemplate([]);
    setQueryObj([
      {
        checkbox: true,
        type: "AND",
        field: "",
        operator: "=",
        value: [],
      },
    ]);
    dispatch(setReportData([]));
    dispatch(getSavedReportsTemplates("")).then((ress)=>{
      const transformedArray = ress.payload.data.report_templates.map(item => ({
        name: item.template_name,
        value: item
      }));
      setSavedReportsData(transformedArray)
    })
  }
  //To submit Query
  const submitQuery = (type) => {
    // console.log(queryObj, 'QUERYOBJ++++++++++++++++++++');
    const finalQuery = queryObj.filter((item) => item.checkbox == true);
    finalQuery.forEach((item) => (item.value = toLowerCase(item.value)));
    // console.log(finalQuery, 'FFFFF');
    let payLoad = {
      assignees: finalQuery.filter((item) => item.field == "users").length
        ? finalQuery.filter((item) => item.field == "users")?.[0].value
        : [],
      operator: operator,
      department: finalQuery.filter((item) => item.field == "department").length
        ? finalQuery.filter((item) => item.field == "department")?.[0].value
        : [],
      priority: finalQuery.filter((item) => item.field == "priority").length
        ? finalQuery.filter((item) => item.field == "priority")?.[0].value
        : [],
      status: finalQuery.filter((item) => item.field == "status").length
        ? finalQuery.filter((item) => item.field == "status")?.[0].value
        : [],
      location: finalQuery.filter((item) => item.field == "location").length
        ? finalQuery.filter((item) => item.field == "location")?.[0].value
        : [],
      teams: finalQuery.filter((item) => item.field == "teams").length
        ? finalQuery.filter((item) => item.field == "teams")?.[0].value
        : [],
      startdate: {
        from_date:
          finalQuery.filter((item) => item.field == "startdate").length &&
          startdateStart.length != 0
            ? startdateStart.toISOString()
            : "",
        to_date:
          finalQuery.filter((item) => item.field == "startdate").length &&
          startdateEnd.length != 0
            ? startdateEnd.toISOString()
            : "",
        duration:
          finalQuery.filter((item) => item.field == "startdate").length &&
          startdateEnd.length != 0
            ? dateStructure
            : "empty",
      },
      duedate: {
        from_date:
          finalQuery.filter((item) => item.field == "duedate").length &&
          duedateStart.length != 0
            ? duedateStart.toISOString()
            : "",
        to_date:
          finalQuery.filter((item) => item.field == "duedate").length &&
          duedateEnd.length != 0
            ? duedateEnd.toISOString()
            : "",
        duration:
          finalQuery.filter((item) => item.field == "duedate").length &&
          duedateEnd.length != 0
            ? dateStructure2
            : "empty",
      },
      closeddate: {
        from_date:
          finalQuery.filter((item) => item.field == "closeddate").length &&
          closeddateStart.length != 0
            ? closeddateStart.toISOString()
            : "",
        to_date:
          finalQuery.filter((item) => item.field == "closeddate").length &&
          closeddateEnd.length != 0
            ? closeddateEnd.toISOString()
            : "",
        duration:
          finalQuery.filter((item) => item.field == "closeddate").length &&
          closeddateEnd.length != 0
            ? dateStructure3
            : "empty",
      },
    };
    if(type=="Save Report"){
      let checkReportDuplicateTitle=savedReportsData.filter(item=>item.name.toLowerCase()==saveReportTitle.toLowerCase());
      if(!saveReportTitle.trim()){
        setReportTitleError(true)
      }
      if(checkReportDuplicateTitle.length>0){
        return toast.error("Name Already Exists")
      }
      let reportData=JSON.stringify(payLoad)
      let saveReportPayload={template_name:saveReportTitle.trim(),template:payLoad,org_id:orgId,is_delete:false}
      dispatch(saveReportTemplate(saveReportPayload)).then((res)=>{
        setShowSaveReport(false)
        toast.success("Report Template Saved Successfully")
        setSaveReportTitle("")
        // window.location.reload()
        dispatch(getSavedReportsTemplates("")).then((ress)=>{
          const transformedArray = ress.payload.data.report_templates.map(item => ({
            name: item.template_name,
            value: item
          }));
          setSavedReportsData(transformedArray)
          clearSelectedData();
        })
      })
    }
    if(type=="Delete Report"){
      let deleteReportPayload={id:reportUpdateId,template_name:saveReportTitle,template:payLoad,is_delete:true,org_id:orgId}
      setReportDeleteLoader(true)
      dispatch(deleteSavedReports(deleteReportPayload)).then((res)=>{
        toast.success("Report Deleted Successfully");
        setReportDeleteLoader(false);
        setReportDeleteModal(false);
        setSelectedTemplate([]);
        setTemplate("")
        setReportUpdateId("")
        clearSelectedData();
        // window.location.reload();
      })
  
    }
  if(type=="Update Report"){
    let saveReportPayload={id:reportUpdateId,name:saveReportTitle,template:payLoad}
    dispatch(updateSavedReports(saveReportPayload)).then((res)=>{
      setSaveReportTitle();
      setReportUpdateId();
      toast.success("Report Updated Successfully");
    })
    setTimeout(() => {
      window.location.reload();
    }, 3000)
  }
   if(type=="Run"){
    dispatch(getReportFilter(payLoad));
   }
  };

  //Get Assignee Names
  const getAssigneeNames = (assignees) => {
    let assignee = "";
    assignees.forEach((item) => (assignee = assignee + fetchUser(item) + ","));
    let finalAssignee = assignee.substring(0, assignee.length - 1);
    return finalAssignee;
  };

  //To Export Data
  const exportData = () => {
    if (reportFilters.length > 0) {
      const exportFile = [];
      reportFilters.forEach((item) => {
        let obj = {
          "Task code": item?.task_code
            ? getOrgCode(orgListData, item?.org_id) + "-" + item?.task_code
            : "",
          Name: item?.name ? item?.name : "",
          Assignees: item?.assignee ? getAssigneeNames(item?.assignee) : "",
          Status: item?.internal_status ? item?.internal_status : "",
          Priority: item?.internal_priority ? item?.internal_priority : "",
          "Assignee type": item?.assignee_type ? item?.assignee_type : "",
          "Created at": item?.created_at ? item?.created_at : "",
          "Created by": item?.createdby ? fetchUser(item?.createdby) : "",
          "Start date": item?.start_date ? item?.start_date : "",
          "Due date": item?.due_date ? item?.due_date : "",
          "Updated on": item?.updated_on ? item?.updated_on : "",
          "Updated user": item?.updated_user ? item?.updated_user : "",
          "Closed date": item?.closed_date ? item?.closed_date : "NA",
        };
        exportFile.push(obj);
      });
      // console.log(exportFile, '===exportFile');
      // console.log(reportFilters, '---REPORTSSSSSS');
      const data = exportFile;
      const fileName = "ReportFilters";
      const exportType = exportFromJSON.types.csv;
      exportFromJSON({ data, fileName, exportType });
      toast.success("File Downloaded Successfully");
    } else {
      toast.error("No Data to Export");
    }
  };

  //get Org Code
  const getOrgCode = (orgData, orgId) => {
    let data = orgData?.filter((item) => {
      return item?.id === orgId;
    });
    if (data?.length > 0) return data?.length == 0 ? "" : data[0]["uni_code"];
  };

  const fetchUser = (id) => {
    let user = taskCreateData?.find((item) => item.id === id);
    return `${captialLetter(user?.name)} ${captialLetter(user?.lastname)}`;
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

  // const objectArray = [
  //   { key: "Option 1", cat: "Group 1" },
  //   { key: "Option 2", cat: "Group 1" },
  //   { key: "Option 3", cat: "Group 1" },
  //   { key: "Option 4", cat: "Group 2" },
  //   { key: "Option 5", cat: "Group 2" },
  //   { key: "Option 6", cat: "Group 2" },
  //   { key: "Option 7", cat: "Group 2" },
  // ];
  //To arrange status childs
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

      setModifiedChildStatus(modifiedChilds);
    }
  }, [statusChildList, parentStatus]);

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
    }
  }, [childPriorities, parentPriority]);

  //To enable RUN button
  const buttonEnable = () => {
    const final = queryObj?.filter((item) => item?.value?.length > 0);
    const date = queryObj?.filter(
      (item) =>
        item.field == "startdate" ||
        item?.field == "duedate" ||
        item?.field == "closeddate"
    );
    return final?.length == 0 && date?.length == 0;
  };

  const closeReportOptions=(e)=>{
    setSelectedTemplate([]);
    window.location.reload()
  }
  const switchOperator = () => {
    if (operator == "AND") {
      setOperator("OR");
    } else {
      setOperator("AND");
    }
  };

  // useEffect(()=>{ 
  //   if(selectedTemplate?.length>1){
  //     let data=[]
  //     let remove_Status=selectedTemplate.pop()
  //     data.push(remove_Status)
  //     setSelectedTemplate(data)
  //     setSelectedReport(data[0]?.name)
  //   }
  //   if(selectedTemplate?.length==1){
  //   let data=selectedTemplate
  //   setSelectedReport(data[0]?.name)
  //   }
  //   setStateUpdated(!stateUpdated);
  // },[])

  // console.log(dateStructure, dateStructure2, 'DATE');
  // console.log(reportFilters, "==============reportFilters");
  return (
    <>
      <section className="breadcum_section">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between">
            <div className="col-xl-5 col-lg-5 col-md-5">
              <div className="d-flex align-items-center gap-3 masterback-btn">
                <Button
                  className="primary_btn white_btn d-flex align-items-center justify-content-center"
                  variant="light"
                  size="md"
                  onClick={() => navigate("/master")}
                >
                  <FaArrowLeft />
                </Button>
                <h2 className="bs_title">Reports</h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="reports">
        <Container fluid>
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header className="reports_header d_aic_jcsb border-bottom gap-2 p-1 px-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="filter-icon">
                      <FaFilter className="piechart-filter-icon" />
                    </div>
                    <div className="d_aic_jcFS gap-2 m-1">
                      <Switch
                        height={23}
                        width={50}
                        checked={operator == "OR" ? true : false}
                        onChange={() => switchOperator()}
                        offColor="#e9ecef"
                        onColor="#e9ecef"
                        offHandleColor="#008800"
                        onHandleColor="#008800"
                        handleDiameter={22}
                        // borderRadius={15}
                        // activeBoxShadow="0px 0px 1px 2px green"
                        uncheckedIcon={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              height: "100%",
                              fontSize: 9,
                              paddingLeft: 3,
                              paddingRight: 3,
                              paddingTop: 2,
                              color: "#000",
                            }}
                          >
                            OR
                          </div>
                        }
                        checkedIcon={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              height: "100%",
                              fontSize: 9,
                              paddingLeft: 3,
                              paddingRight: 3,
                              paddingTop: 2,
                              color: "#000",
                            }}
                          >
                            AND
                          </div>
                        }
                        uncheckedHandleIcon={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              height: "100%",
                              fontSize: 9,
                              paddingLeft: 4,
                              paddingRight: 4,
                              paddingTop: 2,
                              color: "#fff",
                            }}
                          >
                            AND
                          </div>
                        }
                        checkedHandleIcon={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              height: "100%",
                              fontSize: 9,
                              paddingLeft: 3,
                              paddingRight: 3,
                              paddingTop: 2,
                              color: "#fff",
                            }}
                          >
                            OR
                          </div>
                        }
                      />
                    </div>
                  </div>
                  <div className="cardin_wctrls">
                    <Multiselect
                      options={savedReportsData}
                      placeholder={
                        selectedTemplate.length >= 1 ? "" : "Choose Template"
                      }
                      displayValue="name"
                      showCheckbox={false}
                      selectedValues={selectedTemplate}
                      onSelect={(e)=>setReportValue(e)}
                      onRemove={(e) => closeReportOptions(e)}
                      closeOnSelect={true}
                    />
                  </div>
                  {/* <select
                      className="dd-class"
                      aria-label="Select Body"
                      placeholder="Any Body"
                      onChange={(e) => setSelectedReport(e)}
                    >
                      <option value="default"  selected>
                        Choose Template
                      </option>
                      {savedReportsData?.length > 0
                        ? savedReportsData?.map((data, index) => {
                            return (
                              <option key={index} value={data?.template_name}>
                                {data?.template_name}
                              </option>
                            );
                          })
                        : "No saved reports"}
                    </select> */}
                </Card.Header>

                <Card.Body className="p-3 py-2">
                  <Row>
                    <Col md={2} sm={2} xs={2}>
                      <h6>Field*</h6>
                    </Col>
                    <Col md={10} sm={10} xs={10}>
                      <h6>Value</h6>
                    </Col>
                  </Row>
                  {queryObj.length &&
                    queryObj.map((item, index) => {
                      return (
                        <>
                          <Row className="reports_inputs_cust light-gary mb-2">
                            <Col md={2} sm={2} xs={12}>
                              <div key={index} className="d_aic_jcFS gap-2">
                                <Form.Check
                                  type="checkbox"
                                  id={`default-checkbox`}
                                  checked={item.checkbox}
                                  onChange={(e) => checkboxClick(e, index)}
                                />
                                <Form.Select
                                  aria-label="Default select example"
                                  value={item.field}
                                  required
                                  onChange={(e) => slectedField(e, index)}
                                  className="select_dd"
                                >
                                  <option>Select</option>
                                  {fields.length &&
                                    fields.map((item) => {
                                      return (
                                        <option
                                          value={item}
                                          disabled={selectedFields.includes(
                                            item
                                          )}
                                        >
                                          {item?.charAt(0).toUpperCase() +
                                            item?.slice(1)}
                                        </option>
                                      );
                                    })}
                                </Form.Select>
                              </div>
                            </Col>
                            <Col md={10} sm={10} xs={12}>
                              <div className="input_wctrls">
                                <div className="cardin_wctrls">
                                  {item.field == "" ? (
                                    <Form.Select
                                      aria-label="Default select example"
                                      disabled={true}
                                      className="select_dd"
                                    >
                                      <option value="AND">Select</option>
                                    </Form.Select>
                                  ) : (
                                    <></>
                                  )}
                                  {item.field == "status" && (
                                    <Multiselect
                                      className="red"
                                      options={modifiedChildStatus}
                                      groupBy="parent"
                                      displayValue="name"
                                      showCheckbox={true}
                                      selectedValues={selectedStatuses}
                                      onSelect={setSelectedStatuses}
                                      onRemove={setSelectedStatuses}
                                    />
                                  )}
                                  {item.field == "priority" && (
                                    <Multiselect
                                      options={modifiedChildPriorities}
                                      groupBy="parent"
                                      displayValue="name"
                                      showCheckbox={true}
                                      selectedValues={selectedPriorities}
                                      onSelect={setSelectedPriorities}
                                      onRemove={setSelectedPriorities}
                                    />
                                  )}

                                  {item.field == "location" && (
                                    <Multiselect
                                      options={locations}
                                      // groupBy=""
                                      displayValue="label"
                                      showCheckbox={true}
                                      selectedValues={selectedLocations}
                                      onSelect={setSelectedLocations}
                                      onRemove={setSelectedLocations}
                                    />
                                  )}
                                  {item.field == "department" && (
                                    <Multiselect
                                      options={departments}
                                      // groupBy=""
                                      displayValue="label"
                                      showCheckbox={true}
                                      selectedValues={selectedDepartments}
                                      onSelect={setSelectedDepartments}
                                      onRemove={setSelectedDepartments}
                                    />
                                  )}
                                  {item.field == "users" && (
                                    <Multiselect
                                      options={users}
                                      // groupBy=""
                                      displayValue="label"
                                      showCheckbox={true}
                                      selectedValues={selectedUsers}
                                      onSelect={setSelectedUsers}
                                      onRemove={setSelectedUsers}
                                    />
                                  )}
                                  {item.field == "teams" && (
                                    <Multiselect
                                      options={teams}
                                      // groupBy=""
                                      displayValue="label"
                                      showCheckbox={true}
                                      selectedValues={selectedTeams}
                                      onSelect={setSelectedTeams}
                                      onRemove={setSelectedTeams}
                                    />
                                  )}
                                  {item.field == "startdate" && (
                                    <Row className="d_aic_jcFS">
                                      <Col md={5} xs={12}>
                                        {/* Radio Buttons */}
                                        <div className="d_aic_jcFS gap-3">
                                          <Form.Check
                                            type="radio"
                                            id={`default-checkbox1`}
                                            name={"startdate"}
                                            label={"This Week"}
                                            checked={
                                              dateStructure == "This Week"
                                            }
                                            onClick={() =>
                                              setDateStructue("This Week")
                                            }
                                          />
                                          <Form.Check
                                            type="radio"
                                            id={`default-checkbox2`}
                                            name={"startdate"}
                                            label={"This Month"}
                                            checked={
                                              dateStructure == "This Month"
                                            }
                                            onClick={() =>
                                              setDateStructue("This Month")
                                            }
                                          />
                                          <Form.Check
                                            type="radio"
                                            id={`default-checkbox3`}
                                            name={"startdate"}
                                            label={"Date Range"}
                                            checked={
                                              dateStructure == "Date Range"
                                            }
                                            onClick={() =>
                                              setDateStructue("Date Range")
                                            }
                                          />
                                        </div>
                                      </Col>

                                      <Col md={7} xs={12}>
                                        {/* Datepickers */}
                                        <Row className="d_aic_jcFS">
                                          <Col md={6} xs={12}>
                                            <div className="d_aic_jcFS gap-2">
                                              <h6 className="m-0">From</h6>
                                              <div className="position-relative w-100">
                                                <DatePicker
                                                  className="form-control"
                                                  dateFormat="eee, MMM dd, yyyy, h:mm aa"
                                                  selected={startdateStart}
                                                  onChange={(date) =>
                                                    setStartdateStart(
                                                      new Date(date)
                                                    )
                                                  }
                                                />
                                                <MdDateRange className="calender-icon" />
                                              </div>
                                            </div>
                                          </Col>

                                          <Col md={6} xs={12}>
                                            <div className="d_aic_jcc gap-2">
                                              <h6 className="m-0">To</h6>
                                              <div className="position-relative w-100">
                                                <DatePicker
                                                  className="form-control"
                                                  dateFormat="eee, MMM dd, yyyy, h:mm aa"
                                                  selected={startdateEnd}
                                                  onChange={(date) =>
                                                    setStartdateEnd(
                                                      new Date(date)
                                                    )
                                                  }
                                                />
                                                <MdDateRange className="calender-icon" />
                                              </div>
                                            </div>
                                          </Col>
                                        </Row>
                                      </Col>
                                    </Row>
                                  )}
                                  {item.field == "duedate" && (
                                    <Row className="d_aic_jcFS">
                                      <Col md={5} xs={12}>
                                        {/* Radio Buttons */}
                                        <div className="d_aic_jcFS gap-3">
                                          <Form.Check
                                            type="radio"
                                            id={`default-checkbox1`}
                                            name={"duedate"}
                                            label={"This Week"}
                                            checked={
                                              dateStructure2 == "This Week"
                                            }
                                            onClick={() =>
                                              setDateStructue2("This Week")
                                            }
                                          />
                                          <Form.Check
                                            type="radio"
                                            id={`default-checkbox2`}
                                            name={"duedate"}
                                            label={"This Month"}
                                            checked={
                                              dateStructure2 == "This Month"
                                            }
                                            onClick={() =>
                                              setDateStructue2("This Month")
                                            }
                                          />
                                          <Form.Check
                                            type="radio"
                                            id={`default-checkbox3`}
                                            name={"duedate"}
                                            label={"Date Range"}
                                            checked={
                                              dateStructure2 == "Date Range"
                                            }
                                            onClick={() =>
                                              setDateStructue2("Date Range")
                                            }
                                          />
                                        </div>
                                      </Col>

                                      <Col md={7} xs={12}>
                                        {/* Datepickers */}
                                        <Row className="d_aic_jcFS">
                                          <Col md={6} xs={12}>
                                            <div className="d_aic_jcFS gap-2 position-relative">
                                              <h6 className="m-0">From</h6>
                                              <div className="position-relative w-100">
                                                <DatePicker
                                                  className="form-control"
                                                  dateFormat="eee, MMM dd, yyyy, h:mm aa"
                                                  selected={duedateStart}
                                                  onChange={(date) =>
                                                    setDuedateStart(
                                                      new Date(date)
                                                    )
                                                  }
                                                />
                                                <MdDateRange className="calender-icon" />
                                              </div>
                                            </div>
                                          </Col>

                                          <Col md={6} xs={12}>
                                            <div className="d_aic_jcFS gap-2">
                                              <h6 className="m-0">To</h6>
                                              <div className="position-relative w-100">
                                                <DatePicker
                                                  className="form-control"
                                                  dateFormat="eee, MMM dd, yyyy, h:mm aa"
                                                  selected={duedateEnd}
                                                  onChange={(date) =>
                                                    setDuedateEnd(
                                                      new Date(date)
                                                    )
                                                  }
                                                />
                                                <MdDateRange className="calender-icon" />
                                              </div>
                                            </div>
                                          </Col>
                                        </Row>
                                      </Col>
                                    </Row>
                                  )}
                                  {item.field == "closeddate" && (
                                    <Row className="d_aic_jcFS">
                                      <Col md={5} xs={12}>
                                        {/* Radio Buttons */}
                                        <div className="d_aic_jcFS gap-3">
                                          <Form.Check
                                            type="radio"
                                            id={`default-checkbox1`}
                                            name={"closeddate"}
                                            label={"This Week"}
                                            checked={
                                              dateStructure3 == "This Week"
                                            }
                                            onClick={() =>
                                              setDateStructue3("This Week")
                                            }
                                          />
                                          <Form.Check
                                            type="radio"
                                            id={`default-checkbox2`}
                                            name={"closeddate"}
                                            label={"This Month"}
                                            checked={
                                              dateStructure3 == "This Month"
                                            }
                                            onClick={() =>
                                              setDateStructue3("This Month")
                                            }
                                          />
                                          <Form.Check
                                            type="radio"
                                            id={`default-checkbox3`}
                                            name={"closeddate"}
                                            label={"Date Range"}
                                            checked={
                                              dateStructure3 == "Date Range"
                                            }
                                            onClick={() =>
                                              setDateStructue3("Date Range")
                                            }
                                          />
                                        </div>
                                      </Col>

                                      <Col md={7} xs={12}>
                                        {/* Datepickers */}
                                        <Row className="d_aic_jcFS">
                                          <Col md={6} xs={12}>
                                            <div className="d_aic_jcFS gap-2">
                                              <h6 className="m-0">From</h6>
                                              <div className="position-relative w-100">
                                                <DatePicker
                                                  className="form-control"
                                                  dateFormat="eee, MMM dd, yyyy, h:mm aa"
                                                  selected={closeddateStart}
                                                  onChange={(date) =>
                                                    setCloseddateStart(
                                                      new Date(date)
                                                    )
                                                  }
                                                />
                                                <MdDateRange className="calender-icon" />
                                              </div>
                                            </div>
                                          </Col>

                                          <Col md={6} xs={12}>
                                            <div className="d_aic_jcFS gap-2">
                                              <h6 className="m-0">To</h6>
                                              <div className="position-relative w-100">
                                                <DatePicker
                                                  className="form-control "
                                                  dateFormat="eee, MMM dd, yyyy, h:mm aa"
                                                  selected={closeddateEnd}
                                                  onChange={(date) =>
                                                    setCloseddateEnd(
                                                      new Date(date)
                                                    )
                                                  }
                                                />
                                                <MdDateRange className="calender-icon" />
                                              </div>
                                            </div>
                                          </Col>
                                        </Row>
                                      </Col>
                                    </Row>
                                  )}
                                </div>

                                <div className="btn_wctrl">
                                  {index != queryObj.length - 1 && (
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-hi"
                                      onClick={() => removeQuery(index)}
                                    >
                                      <FaTrashAlt />
                                    </button>
                                  )}
                                  {index == queryObj.length - 1 && (
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-hi"
                                      onClick={addQuery}
                                    >
                                      <FaPlus />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </>
                      );
                    })}
                  <Row className="border-top_dashed mt-3 pt-1">
                    <Col className="d_aic_jce gap-2 mt-1 flex-row">
                      {reportUpdateId && (
                        <button
                          className="btn btn-primary"
                          onClick={() => setReportDeleteModal(true)}
                        >
                          Delete Report
                        </button>
                      )}
                      <button
                        className="btn btn-primary"
                        onClick={
                          template == ""
                            ? () => setShowSaveReport(true)
                            : () => submitQuery("Update Report")
                        }
                        disabled={buttonEnable()}
                      >
                        {template == "" ? "Save Report" : "Update Report"}
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => submitQuery("Run")}
                        disabled={buttonEnable()}
                      >
                        Run
                      </button>

                      <button
                        className="btn btn-primary btn-sucess "
                        onClick={exportData}
                      >
                        <FaFileExport /> EXPORT
                      </button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {loader ? (
        <LoaderComponent />
      ) : // <p>Loading</p>
      reportFilters?.length > 0 ? (
        <Container fluid>
          <Row>
            <Col lg={12} md={12} sm={12}>
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
                      {/* <th>Actions</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {reportFilters?.map((task, index) => {
                      return (
                        <tr className="card-table" id={index} key={index}>
                          <td
                            onClick={(event) =>
                              // navigate(`/taskdetails/${task.id}`)
                              window.open(`/taskdetails/${task.id}`, "_blank")
                            }
                          >
                            {getOrgCode(orgListData, task.org_id)}-
                            {task.task_code}
                          </td>
                          <td>
                            <div
                              className="card-table-task-name d-flex align-item-center gap-2"
                              onClick={(event) =>
                                // navigate(`/taskdetails/${task.id}`)
                                window.open(`/taskdetails/${task.id}`, "_blank")
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
                                <div className="tn ttww">
                                  {captialLetter(task?.name)}
                                </div>
                              </OverlayTrigger>
                            </div>
                          </td>

                          <td
                            onClick={(event) =>
                              // navigate(`/taskdetails/${task.id}`)
                              window.open(`/taskdetails/${task.id}`, "_blank")
                            }
                          >
                            {fetchUser(task.createdby)}
                            {/* {getAvatar(task?.createdby) != undefined || null ? <img src={getAvatar(task?.createdby)} alt="user-img" className="rounded-circle"/> : fetchUser(task.createdby).slice(0, 2)} */}
                          </td>
                          <td
                            onClick={(event) =>
                              // navigate(`/taskdetails/${task.id}`)
                              window.open(`/taskdetails/${task.id}`, "_blank")
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
                              // navigate(`/taskdetails/${task.id}`)
                              window.open(`/taskdetails/${task.id}`, "_blank")
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
                              // navigate(`/taskdetails/${task.id}`)
                              window.open(`/taskdetails/${task.id}`, "_blank")
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

                          {/* <td>
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
                              </td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
        </Container>
      ) : (
        <div className="col-md-12 center text-center">
          <img src={NoDataFound} height="500px" alt="" />
        </div>
      )}
      <Modal show={showSaveReport} backdrop="static" keyboard={false} centered>
        <Modal.Header>
          {/* <Modal.Title>Session Expired</Modal.Title> */}
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="formGroup" controlId="announcementTitle">
              <Form.Label className="star">
                Please Enter Report Title <b>*</b>
              </Form.Label>
              <Form.Control
                required
                type="text"
                value={saveReportTitle}
                placeholder="Add Title"
                onChange={(e) => {
                  setSaveReportTitle(e.target.value);
                  setReportTitleError(false);
                }}
              />
            </Form.Group>
            {reportTitleError && (
              <span className="text-danger">
                Name Cannot be empty or spaces
              </span>
            )}
            <div className="modal-footer w-100">
              <Button
                className="dark-btn"
                variant="secondary"
                onClick={() => setShowSaveReport(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => submitQuery("Save Report")}
                disabled={saveReportTitle?.trim().length == 0}
              >
                <span>Save</span>
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal
        show={reportDeleteModal}
        onHide={() => setReportDeleteModal(!reportDeleteModal)}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        scrollable={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>Report will be Deleted Permanently</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setReportDeleteModal(!reportDeleteModal);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => submitQuery("Delete Report")}
            disabled={reportDeleteLoader}
          >
            {reportDeleteLoader ? (
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
};

export default Reports;
