import DatePicker from "react-datepicker";
import { Card, Tabs, Tab, Form, Spinner, Button, Modal, Dropdown, DropdownButton, Row, Col, FormGroup } from 'react-bootstrap';
import { MdDateRange, MdOutlineScheduleSend } from "react-icons/md";
import Multiselect from "multiselect-react-dropdown-colors";
import { RiDraftFill } from "react-icons/ri";
import { BiLabel, BiChat, BiLinkAlt, BiCommentCheck } from "react-icons/bi";
import { FaPlus, FaMinus, FaFlag, FaRegFlag, FaEllipsisV, FaFilter } from "react-icons/fa";
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLocations } from '../redux/reducers/locationsReducer'
import { getDepartments } from '../redux/reducers/departmentReducer'
import { getUsers, getExceptUsers, getOrgUsers } from '../redux/reducers/userReducer'
import { getGroups } from '../redux/reducers/groupReducer'
import Avatar from '../components/Avatar'
import { avatarBrColors } from '../environment'
import { setTemplateAddform } from '../redux/reducers/taskReducer'
import { setTaskAddform } from '../redux/reducers/taskReducer'
import { createTask, setButtonLoading, getAll_tasks, setDraftDetails, updateTask, getDraftTasks, draftTaskUpdate } from "../redux/reducers/taskReducer"
import moment from 'moment';
import { parseString } from 'rrule/dist/esm/parsestring';
import ReactQuill from 'react-quill';
import { toast } from 'react-toastify';
import NoGroupsFound from "../assets/not-founds.svg";
import { getpriorityConfig, getPriorityConfigList } from '../redux/reducers/priorityConfigReducer';
import { getStatusConfig, getAllTaksStatus } from '../redux/reducers/statusConfigReducer'
import { AiFillCheckCircle, AiOutlineConsoleSql } from "react-icons/ai";
import { useRef } from "react";
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import captialLetter from '../modules/CaptialLetter';
import Switch from "react-switch";
function CreateTaskComponent() {
    const dispatch = useDispatch()
    const statusRef = useRef([]);
    const [filterSearch, setFilter] = useState('')
    const loading = useSelector((state) => state.tasks.buttonLoading)
    const [modifiedChildPriorities, setModifiedChildPriorities] = useState();
    const [selectedPriorities, setSelectedPriorities] = useState([]);
    const [selectedPriorityColor,setSelectedPriorityColor]=useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [parentPriority, setParentPriority] = useState();
    const [dueDate, setDueDate] = useState(new Date());
    const [assignees, setAssignedUsres] = useState([]);
    const [selectedcheck, setselectedCheck] = useState([])
    const [userSearch, setUserSearch] = useState('')
    const [individual, setIndividual] = useState(false);
    const aliasUser = localStorage.getItem('alias-user')
    const [checked, setChecked] = useState(false);
    const [selectedButtons, setSelectedButtons] = useState([]);
    const orgId = useSelector((state) => state.auth.current_organization);
    const statusList = useSelector(
        (state) => state.status.tasksStatus
    );
    const getParentPriority_data = useSelector((state) => state.priority.priorityParentList);
    const priorityChildConfig_List = useSelector((state) => state.priority.priorityChildList);
    const getPriorityList = useSelector((state) => state.priority.priorityConfigList);
    const [DeafultPriority, setDeafultPriority] = useState();
    const [defaultStatus, setDeafultStatus] = useState()
    let priorityChildConfigList = useSelector(
        (state) => state.priority.priorityChildConfigList
    );
    let originalPriorityConfig = useSelector(
        (state) => state.priority.originalPriorityConfig
    );
    if (originalPriorityConfig?.length > 0) priorityChildConfigList = originalPriorityConfig;
    const statusConfigList = useSelector((state) => state.status.statusConfigList);
    let statusChildConfigList = useSelector(
        (state) => state.status.statusChildConfigList
    );
    let originalStatusConfig = useSelector(
        (state) => state.status.originalStatusConfig
    );
    if (originalStatusConfig?.length > 0) statusChildConfigList = originalStatusConfig;
    //get parent records for priority and default value of priority
    let getParentPrioritydata = getParentPriority_data?.filter((item, index) => { return item.parent_id == null })
    let getParentPriorityFiltereddata = getParentPrioritydata?.sort((a, b) => { return a.id - b.id });
    let getParentStatus = statusList?.parents;
    // console.log("getParentStatus",getParentStatus)
    let statusChildList = statusList?.org_childs?.length ? statusList?.org_childs : statusList?.base_childs;
    let childList=statusChildList ? [...statusChildList] : [];
    let filterChildList=childList?.sort((a, b) => {return a.id - b.id});
    // console.log("filterChildList",filterChildList)
    let getParentStatusdata = getParentStatus?.filter((item, index) => { return item.parent_id == null });
    let getParentStatusFiltereddata = getParentStatusdata?.sort((a, b) => { return a.id - b.id });

    const [createTask_obj, setCreateTask_obj] = useState({
        name: "",
        description: "",
        assignee_type: "",
        start_date: new Date(),
        due_date: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)).toISOString(),
        status: "",
        priority: DeafultPriority,
        task_type: "Live",
        is_active: true,
        create_individualTask: false,
        assignee: [],
    })

    const exceptedUsers = useSelector((state) => state.users.exceptedUsers)
    const locationsList = useSelector((state) => state.location.locationsList)
    const departmentsList = useSelector((state) => state.department.departmentsList)
    const usersList = useSelector((state) => state.users.usersList)
    const userDetails = useSelector((state) => state.auth.userDetails)
    const orgUsersList = useSelector((state) => state.users.orgUsersList)
    const groupsList = useSelector((state) => state.groups.groupsList)
    const showAddform = useSelector((state) => state.tasks.showTask)
    const [showScheduleModel, setScheduleModel] = useState(false)
    const [scheduleDate, setScheduleDate] = useState(new Date())
    const [showError, setShowError] = useState(false)
    const draftTaskDetails = useSelector((state) => state.tasks.draftTaskDetails)
    const [childPriorities, setChildPriorities] = useState();
    const [searchGroup, setSearchGroup] = useState('')
    const [searchDept, setSearchDept] = useState('')
    const [startDateError, setStartDateError] = useState(false)
    const [endLessError,setEndLessError]= useState(false)
    const [endDateError, setEndDateError] = useState(false)
    const [btnloading, setbtnloading] = useState({ createDraft: false, scheduleTask: false, createTask: false })
    const [searchLocation, setSearchLocation] = useState('')
    const [showChangeScheduleModel, setChangeScheduleModel] = useState(false);
    // const taskfilter = useSelector((state)=>state.tasks.draftTasks);
    const draftTaskpayloadDetails = useSelector((state) => state.tasks.drafttaskpaylod)
    const [needAcceptance, setNeedAcceptance] = useState(false)

    useEffect(() => {
        if (draftTaskDetails) {
            setDeafultPriority(draftTaskDetails?.priority);
        } else {
            let DefaultPriorityresponse = priorityChildConfig_List?.filter(
                (item, index) => {
                    return item?.parent_id == getParentPriorityFiltereddata[getParentPriorityFiltereddata.length - 1].id;
                }
            );
            if (DefaultPriorityresponse && DefaultPriorityresponse.length > 0) {
                setDeafultPriority(
                    DefaultPriorityresponse && DefaultPriorityresponse[0]?.name
                );
            }
        }
    }, [getParentPriorityFiltereddata]);

    useEffect(() => {
        let DefaultPriorityresponse = filterChildList?.filter((item, index) => { return item?.parent_id == getParentStatusFiltereddata[0]?.id });
        if (DefaultPriorityresponse && DefaultPriorityresponse.length > 0) {
            setDeafultStatus(DefaultPriorityresponse && DefaultPriorityresponse[0]?.name)
        }
    }, [getParentStatusFiltereddata])

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
      if(!draftTaskDetails){
        setSelectedPriorities([modifiedChilds[modifiedChilds.length-1]])
      }
      if(draftTaskDetails){
        let data=modifiedChilds.filter(item=>item.name.toLowerCase()== draftTaskDetails.internal_priority.toLowerCase());
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


    useEffect(() => {
        dispatch((getUsers(filterSearch)))
        dispatch((getDepartments(searchDept)))
        dispatch((getLocations(searchLocation)))
        dispatch(getGroups(searchGroup))
        dispatch(getOrgUsers())
        dispatch(getpriorityConfig())
        dispatch(getStatusConfig())
        if (draftTaskDetails) {
            setCreateTask_obj(draftTaskDetails)
            setScheduleDate(draftTaskDetails.schedule_time)
            setAssignedUsres([...draftTaskDetails.assignee])
        }

    }, [filterSearch, searchGroup, searchDept, searchLocation])

    useEffect(() => {
        dispatch(getPriorityConfigList(orgId))
        dispatch(getAllTaksStatus(orgId));
    }, [])
    
  

    useEffect(() => {
      default_Priority()
      default_Status()
    }, [priorityChildConfig_List])

    const default_Priority=()=>{
        if(draftTaskDetails){
            setCreateTask_obj((prev) => {
                return {
                  ...prev,
                  priority: draftTaskDetails?.priority
                };
              });
        }
       
    }
 
    const default_Status=()=>{
        if(!draftTaskDetails){
            if(getParentStatusFiltereddata?.length>0){
                let default_Priorityresponse = filterChildList?.filter(item =>item?.parent_id == getParentStatusFiltereddata?.[0].id);
               if(default_Priorityresponse.length>0){
                setCreateTask_obj((prev) => ({ ...prev, status: default_Priorityresponse[0]?.name }))
               }
            }
        }
        if(draftTaskDetails){
            setCreateTask_obj((prev) => {
                return {
                  ...prev,
                  status: draftTaskDetails?.status
                };
              });
        }
       
       
    }
   
    const addAssignee = (item, event) => {
        event.preventDefault();
        setAssignedUsres(assigneedUsers => [...assigneedUsers, item])
        if (checked1) {
            setselectedCheck([...selectedcheck, item]);
        }

    }
    const handleLevels = (user, key) => {
        if (selectedcheck.includes(user.id)) {
            setselectedCheck(selectedcheck.filter(id => id !== user.id));
        } else {
            setselectedCheck([...selectedcheck, user.id]);
        }
        setChecked1(false)
    }
    const modules = {
        toolbar: [
            ["bold", "italic", "underline", "link"],
        ]
    }
    const [checkstatus, setcheckstatus] = useState([]);
    const [showtoggleforUsers, setshowtoggleforUsers] = useState(true);
    const fetchAssignees = (id, key, checked1) => {
        let user = usersList?.find((user) => user.id === id);
        if (user) {
            return (
                <div className="mb-1 assignees-cards">
                    <div className='card-gt-body'>
                        <div className='d-flex justify-content-between align-items-center mt-2 mb-2' >
                            <div className='me-2'>
                                <Form.Check
                                    type="checkbox"
                                    id={`default-checkbox`}
                                    checked={checked1 || selectedcheck.includes(user.id)}
                                    value={user.id}
                                    onChange={(e) => {
                                        handleLevels(user, key);
                                    }}
                                />
                            </div>

                            <div className='d-flex align-item-center assignes-name gap-wd-capital w-100'>
                                <Avatar color={user.color} initials={`${user.name.substring(0, 1).toUpperCase()}${user.lastname.substring(0, 1).toUpperCase()}`} image={user.avatar} />
                                <h5 className='assidenedassignees' id={user}>{user.name} {user.lastname}</h5>
                            </div>
                            <div id={key} onClick={(event) => { removeAssignee(user.id, event) }} >
                                <Button className='icon-buttons-operatorbtn'><FaMinus/></Button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
    // //updated code for checking and unchecking members
    // const addGroupAssignees = (list, event, key) => {
    //     if (selectedButtons.includes(key)) {
    //         setSelectedButtons(selectedButtons.filter(id => id !== key));
    //         list?.map((item) => {
    //             const data = assignees.filter(elem => !list.includes(elem));
    //             setAssignedUsres(data)
    //         })
    //     } else {
    //         setSelectedButtons([...selectedButtons, key]);
    //         event.preventDefault();
    //         list?.map((item) => {
    //             if (!assignees.includes(item)) {
    //                 setAssignedUsres(assigneedUsers => [...assigneedUsers, item])
    //                 setChecked(key)
    //             }
    //         }
    //         )
    //     }

    // }
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
                    setAssignedUsres(assigneedUsers => [...assigneedUsers, item])
                    setChecked(key)
                }
            }
            )
        }

    }

    //updated code for checking and unchecking teams
    const addDepartmentAssignees = (id, event, key) => {
        if (selectedButtons.includes(key)) {
            let data = []
            orgUsersList?.map((user) => {
                if (user.department_id == id) {
                    setSelectedButtons(selectedButtons.filter(ele => ele != key));
                    for (let i = assignees.length - 1; i >= 0; i--) {
                        if (assignees[i] === user.user_id) {
                            assignees.splice(i, 1);
                        }
                    }
                }
            })
        } else {
            event.preventDefault();
            let usersIds = []
            orgUsersList?.map((user) => {
                if (user.department_id === id) {
                    !assignees.includes(user.user_id) && usersIds.push(user.user_id)
                }
            })
            let assigineData = usersIds?.map((item) => item)
            if (usersIds?.length > 0) {
                setSelectedButtons([...selectedButtons, key]);
                usersIds?.map((item) => setAssignedUsres(assigneedUsers => [...assigneedUsers, item]))
            }
            else {
                toast.error("No Assignees")
            }
        }
    }

    const addLocationAssignees = (id, key, event) => {
        if (selectedButtons.includes(key)) {
            let data = []
            orgUsersList?.map((user) => {
                if (user.location_id == id) {
                    setSelectedButtons(selectedButtons.filter(ele => ele != key));
                    for (let i = assignees.length - 1; i >= 0; i--) {
                        if (assignees[i] === user.user_id) {
                            assignees.splice(i, 1);
                        }
                    }
                }
            })
        }
        else {
            event.preventDefault();
            let usersIds = []
            orgUsersList?.map((user) => {
                if (user.location_id === id) {
                    !assignees.includes(user.user_id) && usersIds.push(user.user_id)
                }
            })
            if (usersIds.length > 0) {
                setSelectedButtons([...selectedButtons, key]);
                usersIds?.map((item) => setAssignedUsres(assigneedUsers => [...assigneedUsers, item]))
            }
            else {
                toast.error("No Assignees")
            }

        }
    }


    const fetchExceptUsers = () => {
        let payload = {
            array: assignees,
            name: userSearch,
        }
        dispatch(getExceptUsers(payload))
    }

    const removeAssignee = (id, event) => {
        event.preventDefault();
        setAssignedUsres((assignees) =>
            assignees.filter((item) => item !== id)
        );
        setselectedCheck((assignees) =>
            assignees.filter((item) => item !== id))
    }

    const getPriority = () => {
        let priorityCheck;
        if (draftTaskDetails) {
            if (createTask_obj.internal_priority) {
                priorityCheck = createTask_obj.internal_priority
            }
            if (!createTask_obj.internal_priority) {
                priorityCheck = DeafultPriority
            }

        } else {
            if (createTask_obj.priority) {
                priorityCheck = createTask_obj.priority
            }
            if (!createTask_obj.priority) {
                priorityCheck = DeafultPriority
            }
        }

        let priority = priorityChildConfig_List?.find((priority) => priority.name === priorityCheck);
        let parent;
        if (priority.parent_id != null) {
            parent = getParentPriority_data?.find((item) => item.id === priority.parent_id)
            parent = parent.name
        }
        else {
            parent = priorityCheck
        }
        return parent
    }

    // check status with parent name if matches send name else send parent name
    const getStatus = () => {
        let statusCheck;
        if (draftTaskDetails) {
            if (createTask_obj.internal_status) {
                statusCheck = createTask_obj.internal_status
            }
        }
        else {
            if (createTask_obj.status) {
                statusCheck = createTask_obj.status
            }
            if (!createTask_obj.status) {
                statusCheck = defaultStatus
            }
        }

        let status = filterChildList?.find((status) => status.name === statusCheck);
        let parent;
        if (status.parent_id != null) {
            parent = getParentStatus?.find((item) => item.id === status.parent_id)
            parent = parent.name
        }
        else {
            parent = statusCheck
        }
        return parent
    }

    const createTasks = (type) => {
        if (assignees.length > 0) {
            const startDate = (new Date(createTask_obj.start_date))
            const dueDate = (new Date(createTask_obj.due_date))
            let timeDifference = (startDate.getTime()-dueDate.getTime()) / 1000;
            let totalMinutes=timeDifference/60;
            let minutesDifference=Math.abs(Math.round(totalMinutes))
            if (
                startDate.getHours()==
                dueDate.getHours()&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()
              ) {
                setEndDateError(true)
                return
            }
            if(startDate.getMonth()>dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()){
                setEndLessError(true)
                setEndDateError(false)
                return
            }
            if((dueDate.getHours()-startDate.getHours()==1)&&minutesDifference<59&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()){
                setEndDateError(true)
                return
            }
            if(startDate.getHours()>dueDate.getHours()&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()){
                setStartDateError(true)
                return
            }
            if(startDate.getDate()>dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()){
                setEndLessError(true)
                return
            }
          
            switch (type) {
                case 'Draft': //It will check the type and set btnloading true
                    setbtnloading({ ...btnloading, createDraft: true })
                    break;
                case 'Schedule':
                    setbtnloading({ ...btnloading, scheduleTask: true })
                    break;
                case 'Live':
                    setbtnloading({ ...btnloading, createTask: true })
                    break;
                default:
                    setbtnloading({ ...btnloading, createTask: false })
            }
            let pending_Acceptance;
            let assignees_list
            if (needAcceptance) {
                pending_Acceptance = assignees
                assignees_list = []
            }
            if (!needAcceptance) {
                pending_Acceptance = []
                assignees_list = assignees

            }
            let priorityCheck;
            if (createTask_obj.priority) {
                priorityCheck = createTask_obj.priority
            }
            if (!createTask_obj.priority) {
                priorityCheck = DeafultPriority
            }
            let statusCheck;
            if (createTask_obj.status) {
                statusCheck = createTask_obj.status
            }
            if (!createTask_obj.status) {
                statusCheck = defaultStatus
            }
            const task_obj = {
                name: createTask_obj.name,
                description: createTask_obj.description,
                assignee_type: "",
                start_date: createTask_obj.start_date,
                due_date: createTask_obj.due_date,
                remainder_interval: 86400000,
                status: getStatus(),
                priority: getPriority(),
                task_type: type,
                is_active: true,
                assignee: assignees_list,
                pending_for_acceptance: pending_Acceptance,
                create_individualTask: individual,
                org_id: orgId,
                createdby: userDetails.id,
                checklistprogress: 0,
                updated_user: `${userDetails.name} ${userDetails.lastname}`,
                internal_priority: priorityCheck,
                internal_status: statusCheck,
                force_closers: selectedcheck
            }
            if (type === 'Schedule') {
                task_obj.schedule_time = scheduleDate
            }
            dispatch(createTask(task_obj)).then((res) => {
                dispatch(getAll_tasks({
                    name: '',
                    status: '',
                    priority: '',
                    assignee: [userDetails.id],
                    created_by: userDetails.id
                }))
                if (draftTaskpayloadDetails?.meta?.arg?.type == "All") {
                    dispatch(getDraftTasks({ "name": "", "type": ["Draft", "Schedule"] }))
                }
                else {
                    dispatch(getDraftTasks(draftTaskpayloadDetails?.meta?.arg))
                }

                //dispatch(getDraftTasks(''))
            })
        } else {
            toast.error('Select Assignees')
            // setbtnloading({...btnloading,createDraft:false})
        }
    }

    const createDraftTask = (event) => {
        // setbtnloading({...btnloading,createDraft:true}) commented because there is no use of this
        event.preventDefault()
        createTasks('Draft')
    }

    const createScheduleTask = (e) => {
        e.preventDefault()
        setScheduleModel(!showScheduleModel)
        createTasks('Schedule')
    }

    const updateScheduleTask = (e) => {
        if (assignees.length > 0) {
            e.preventDefault()
            const task_obj = {
                "name": createTask_obj.name,
                "description": createTask_obj.description,
                "assignee_type": createTask_obj.assignee_type,
                "start_date": createTask_obj.start_date,
                "due_date": createTask_obj.due_date,
                "status": getStatus(),
                "priority": getPriority(),
                "task_type": createTask_obj.task_type,
                "is_active": createTask_obj.is_active,
                "checklistprogress": 0,
                "remainder_interval": 86400000,
                "parent": 0,
                "create_individualTask": false,
                "assignee": assignees,
                "next_notification": null,
                "org_id": orgId,
                "id": createTask_obj.id,
                "createdby": userDetails.id,
                "deleted_by": null,
                "deleted_on": null,
                "is_delete": false,
                "schedule_time": scheduleDate,
                "internal_priority": createTask_obj.internal_priority,
                "internal_status": createTask_obj.internal_status,

            }
            dispatch(draftTaskUpdate(task_obj)).then((res) => {
                if (res.payload.status) {
                    if (draftTaskpayloadDetails?.meta?.arg?.type == "All") {
                        dispatch(getDraftTasks({ "name": "", type: ["Draft", "Schedule"] }))
                    } else {
                        dispatch(getDraftTasks(draftTaskpayloadDetails?.meta?.arg))
                    }

                    dispatch(setDraftDetails(undefined))
                    dispatch(setTaskAddform(!showAddform))
                    dispatch(setButtonLoading(false))
                    setChangeScheduleModel(false)
                } else {
                    dispatch(setButtonLoading(false))
                }

            })
        }
    }

    const updateDraftTask = (type) => {
        if (assignees.length > 0) {
            switch (type) {
                case 'update':  //checks the type and sets btnloading true
                    setbtnloading({ ...btnloading, createDraft: true })
                    break;
                case 'create':
                    setbtnloading({ ...btnloading, createTask: true })
                    break;
                default:
                    setbtnloading({ ...btnloading, createTask: false })
            }
            dispatch(setButtonLoading(true))
            const task_obj = {
                "name": createTask_obj.name,
                "description": createTask_obj.description,
                "assignee_type": createTask_obj.assignee_type,
                "start_date": createTask_obj.start_date,
                "due_date": createTask_obj.due_date,
                "status": getStatus(),
                "priority": getPriority(),
                "task_type": createTask_obj.task_type,
                "is_active": createTask_obj.is_active,
                "checklistprogress": 0,
                "remainder_interval": 86400000,
                "parent": 0,
                "create_individualTask": false,
                "assignee": assignees,
                "next_notification": null,
                "org_id": orgId,
                "id": createTask_obj.id,
                "createdby": userDetails.id,
                "deleted_by": null,
                "deleted_on": null,
                "is_delete": false,
                "schedule_time": null,
                "internal_priority": createTask_obj.internal_priority,
                "internal_status": createTask_obj.internal_status,
            }
            var payload = task_obj;
            let temp = { ...payload, task_type: type === 'create' ? 'Live' : 'Draft' }
            //draftTaskUpdate
            dispatch(draftTaskUpdate(temp)).then((res) => {
                dispatch(getDraftTasks({ "name": "", type: ["Draft", "Schedule"] }))
                dispatch(setDraftDetails(undefined))
                dispatch(setTaskAddform(!showAddform))
                dispatch(setButtonLoading(false))
            })
        } else {
            toast.error('Select Assignees')
        }
    }

    const enableChangeScheduleTime = (e) => {
        if (assignees.length > 0) {
            //setChangeScheduleModel(true)
            updateScheduleTask(e)
        }
        else {
            toast.error('Please select Assigee')
        }


    }

    const showButtons = () => {
        if (draftTaskDetails.task_type === 'Draft') {
            return (<>
                <Button variant="primary" onClick={(e) => {
                    createTask_obj.name.trim().length > 0 ? updateDraftTask('update') : setShowError(true)
                }} disabled={btnloading.createDraft} className='btn-primary'>
                    {btnloading.createDraft ? <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    /> : <span > Update Draft</span>}
                </Button>
                <Button variant="primary" onClick={(e) => {
                    createTask_obj.name.trim().length > 0 ? updateDraftTask('create') : setShowError(true)
                }} disabled={btnloading.createTask} className='btn-primary'>
                    {btnloading.createTask ? <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    /> : <span > Create Task</span>}
                </Button>
            </>)
        } else {
            return (
                <>
                    <Button variant="primary" onClick={(e) => {
                        createTask_obj.name.trim().length > 0 ? enableChangeScheduleTime(e) : setShowError(true)
                    }} disabled={loading} className='btn-primary'>
                        {loading ? <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        /> : <span >Update Schedule Task</span>}
                    </Button>
                    {/* <Button variant="primary" onClick={(e) => {
                        createTask_obj.name.trim().length > 0 ? updateDraftTask() : setShowError(true)
                    }} disabled={loading} className='btn-primary'>
                        {loading ? <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        /> : <span > Create Task</span>}
                    </Button> */}
                </>
            )
        }
    }

    useMemo(() => {
        fetchExceptUsers()
    }, [assignees, userSearch])




    const [checked1, setChecked1] = useState(false);

const handleMultiSelectPriority=(e,type)=>{
    setSelectedPriorities(e)
    if(type=="draft"){
        setCreateTask_obj((prev) => ({ ...prev,internal_priority: e[0]?.name.toLowerCase() }))
    }
    if(type=="create"){
        setCreateTask_obj((prev) => ({ ...prev, priority: e[0]?.name.toLowerCase() }))
    }
}
    const handleChange = val => {
        setChecked1(val)
        setselectedCheck(assignees)
        if (!val) {
            setselectedCheck([])
        }

    }
    //To check Group members
    const checkDep = (id, key) => {
        let usersIds = []
        orgUsersList?.map((user) => {
            if (user.department_id == id) {
                usersIds.push(user.user_id)
            }
            if (user.location_id == id) {
                usersIds.push(user.user_id)
            }
        })
        if (assignees.some((assignee) => usersIds?.includes(assignee))) {
            return true
        }
        else {
            selectedButtons.splice(selectedButtons.indexOf(key), 1)
            return false
        }
    }

    const locCheck = (id, key) => {
        let usersIds = []
        orgUsersList?.map((user) => {
            if (user.location_id == id) {
                usersIds.push(user.user_id)
            }
        })
        if (assignees.some((assignee) => usersIds?.includes(assignee))) {
            return true
        }
        else {
            selectedButtons.splice(selectedButtons.indexOf(key), 1)
            return false
        }
    }

    const teamCheck = (group, key) => {
        if (assignees.some((assignee) => group?.includes(assignee))) {
            return true
        }
        else {
            selectedButtons.splice(selectedButtons.indexOf(key), 1)
            return false
        }
    }
    //function to return group member count
    const departmentCount = (id, key, type) => {
        let usersIds = []
        orgUsersList?.map((user) => {
            if (type == "department") {
                if (user?.department_id == id) {
                    usersIds.push(user.user_id)
                }
            }
            if (type == "location") {
                if (user?.location_id == id) {
                    usersIds.push(user.user_id)
                }
            }

        })
        return usersIds.length
    }
    const selectAssisgnessToastMessage = () => {
        if (assignees.length > 0) {
            setScheduleModel(!showScheduleModel)

        } else {
            toast.error('please select Assigeee')
        }

    }

    
    return (
        <>
            {/*--------------------------------------------------------showAddform  Modal started  Hear--------------------------------------------*/}
            <Modal show={showAddform} keyboard={false} onHide={() => {
                dispatch(setTaskAddform(!showAddform))
                dispatch(setDraftDetails(undefined))
            }}
                dialogClassName="modal-90w" aria-labelledby="example-custom-modal-styling-title" centeredbackdrop="static"
                className="create-task-modal"
                centered
                scrollable={true}
                backdrop="static"
            >
                    <Modal.Header closeButton>
                        <Modal.Title id="example-custom-modal-styling-title">Create Task</Modal.Title>
                            {/* //{createTask_obj.name.length == 0 ? `Create Task` : `Update ${createTask_obj.task_type} Task`} */}
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col xl={7} lg={12}>

                                {/*--------------------------------------------------------Form Starts Hear--------------------------------------------*/}

                                <Form className="create-task-form p-3" onSubmit={createTasks}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className='d-flex icon_space star'> <BiLabel /> Task Title <b>*</b></Form.Label>
                                        <Form.Control required type="text" value={createTask_obj.name} onChange={(e) => { setCreateTask_obj({ ...createTask_obj, name: e.target.value }) }} />
                                        {showError && <p className="mb-1" style={{ color: 'red', fontSize: 10 }}> Please Enter Task Name</p>}
                                    </Form.Group>

                                    <Row>
                                        {draftTaskDetails ?
                                            <Col xl={6} lg={6}>
                                                <Form.Label className='d-flex icon_space'> <FaRegFlag />Priority</Form.Label>
                                                <div className="multidis mb-3">
                                                    <Multiselect
                                                    className="single-select"
                                                    singleSelect={true}
                                                    options={modifiedChildPriorities}
                                                    groupBy="parent"
                                                    displayValue="name"
                                                    placeholder={selectedPriorities.length>=1?"":"search"}
                                                    showCheckbox={true}
                                                    selectedValues={selectedPriorities}
                                                    onSelect={(e)=>handleMultiSelectPriority(e,"draft")}
                                                    onRemove={setSelectedPriorities}
                                                    selectedValueDecorator	={(da)=>{
                                                        return <div className="d-flex align-items-center"><span style={{backgroundColor:selectedPriorities[0].color,height:"10px",width:"10px",marginRight:"19px",borderRadius:"50%"}}></span><span>{da}</span></div>
                                                    }}
                                                    />
                                                </div>
                                                {/* <Form.Select aria-label="Default select example" value={createTask_obj.internal_priority} required onChange={(e) => { setCreateTask_obj({ ...createTask_obj, internal_priority: e.target.value }) }} >
                                                    {getParentPriorityFiltereddata?.map((priority, index) => {
                                                        return priority.parent_id == null ? <optgroup label={captialLetter(priority.name)}>
                                                            {
                                                                priorityChildConfig_List?.map((child, key) => {
                                                                    return priority.id == child?.parent_id ? <option value={child?.name} style={{ "color": child?.color }}>{captialLetter(child?.name)}</option> : ""
                                                                })
                                                            }
                                                        </optgroup> : ""
                                                    })}
                                                </Form.Select> */}
                                            </Col> :
                                            <Col xl={6} lg={6}>
                                                <Form.Label className='d-flex icon_space'> <FaRegFlag /> Priority</Form.Label>
                                                <div className="multidis mb-3">
                                                    <Multiselect
                                                    className="single-select"
                                                    options={modifiedChildPriorities}
                                                    singleSelect={true}
                                                    groupBy="parent"
                                                    displayValue="name"
                                                    showCheckbox={true}
                                                    placeholder={selectedPriorities.length>=1?"":"search"}
                                                    selectedValues={selectedPriorities}
                                                    onSelect={(e)=>handleMultiSelectPriority(e,"create")}
                                                    onRemove={setSelectedPriorities}
                                                    selectedValueDecorator	={(da)=>{
                                                        return <div className="d-flex align-items-center"><span style={{backgroundColor:selectedPriorities[0].color,height:"10px",width:"10px",marginRight:"19px",borderRadius:"50%"}}></span><span>{da}</span></div>
                                                    }} 
                                                        />
                                                </div>
                                                {/* <Form.Select aria-label="Default select example" value={createTask_obj.priority} required onChange={(e) => { setCreateTask_obj({ ...createTask_obj, priority: e.target.value }) }} >
                                                    {getParentPriorityFiltereddata?.map((priority, index) => {
                                                        return priority.parent_id == null ? <optgroup label={captialLetter(priority.name)}>
                                                            {
                                                                priorityChildConfig_List?.map((child, key) => {
                                                                    return priority.id == child?.parent_id ? <option value={child?.name} style={{ "color": child?.color }}>{captialLetter(child?.name)}</option> : ""
                                                                })
                                                            }
                                                        </optgroup> : ""
                                                    })}
                                                </Form.Select> */}
                                            </Col>}

                                        <Col xl={6} lg={6}>
                                            <Form.Label className='d-flex icon_space'> <BiCommentCheck /> Status </Form.Label>
                                            <Form.Select className="mb-3" aria-label="Default select example" required disabled={true} value={createTask_obj.status} onChange={(e) => { setCreateTask_obj({ ...createTask_obj, status: e.target.value }) }}>
                                                {getParentStatusFiltereddata?.map((status, index) => {
                                                    return status.parent_id == null ? <optgroup label={captialLetter(status.name)} >
                                                        {
                                                            filterChildList?.map((child, key) => {
                                                                return status.id == child?.parent_id ? <option value={child?.name} style={{ "color": child?.color }}>{child?.name.charAt(0).toUpperCase() + child.name?.slice(1)}</option> : ""
                                                            })
                                                        }
                                                    </optgroup> : ""
                                                })}
                                            </Form.Select>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col xl={6} lg={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className='d-flex icon_space'><MdDateRange /> <label> Start Date </label></Form.Label>
                                                <DatePicker className="form-control" minDate={new Date()} selected={new Date(createTask_obj.start_date)} onChange={(date) => setCreateTask_obj({ ...createTask_obj, start_date: new Date(date) })}
                                                    onFocus={() => { setStartDateError(false); setEndDateError(false);setEndLessError(false)}}
                                                    timeInputLabel="Time:" dateFormat="eee, MMM dd, yyyy, h:mm aa" showTimeInput />
                                                {startDateError && <span className="text-danger">start date hours should be less then due date hours</span>}

                                            </Form.Group>
                                        </Col>
                                        <Col xl={6} lg={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className='d-flex icon_space'><MdDateRange /><label> Due Date </label></Form.Label>
                                                <DatePicker className="form-control" selected={new Date(createTask_obj.due_date)} minDate={new Date(createTask_obj.start_date)} onChange={(date) => setCreateTask_obj({ ...createTask_obj, due_date: new Date(date).toISOString() })}
                                                    onFocus={() => { setStartDateError(false); setEndDateError(false);setEndLessError(false) }}
                                                    timeInputLabel="Time:"
                                                    dateFormat="eee, MMM dd, yyyy, h:mm aa"
                                                    showTimeInput />
                                               {endLessError && <span className="text-danger">Due date must be greater than start date</span>}
                                                {endDateError && <span className="text-danger">Need atleast 1 hour difference between dates</span>}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                        <Form.Label className='d-flex icon_space'>  <BiChat />   Task Description </Form.Label>
                                        <ReactQuill modules={modules} theme="snow" formats={[]} value={createTask_obj.description} onChange={(e) => { setCreateTask_obj({ ...createTask_obj, description: e }) }} />
                                        {/* <Form.Control as="textarea" value={createTask_obj.description} rows={4} onChange={(e) => { setCreateTask_obj({ ...createTask_obj, description: e.target.value }) }} /> */}
                                    </Form.Group>
                                    {/* <Form.Group className="mb-3" controlId="formBasicCheckbox">
                                        <Form.Check type="checkbox" label="Create Individual Task" value={individual} onChange={() => setIndividual(!individual)} />
                                    </Form.Group> */}
                                    {
                                        !needAcceptance &&
                                            <Form.Check type="checkbox" label="Create Individual Task" name="CreateIndividualTask" value={individual} onChange={() => setIndividual(!individual)} id={`default-checkbox1`}/>
                                    }

                                    {
                                        assignees.length > 1 && !individual ?
                                                 <Form.Check type="checkbox" label="Need Acceptance" name="CreateIndividualTask" value={individual} onChange={() => { setNeedAcceptance(!needAcceptance); setIndividual(false) }} id={`default-checkbox2`}/>: ""
                                    }

                                    {
                                        createTask_obj.task_type == 'Schedule' && <Form.Group className="mb-3 mt-3">
                                            <Form.Label>Schedule Date</Form.Label>
                                            <DatePicker required className="form-control" selected={new Date(scheduleDate)} onChange={(date) => setScheduleDate(date.toISOString())} minDate={new Date()} timeInputLabel="Time:"
                                                dateFormat="eee, MMM dd, yyyy, h:mm aa"
                                                showTimeInput />
                                        </Form.Group>
                                    }
                                </Form>
                                {/*--------------------------------------------------------Form closed Hear--------------------------------------------*/}
                            </Col>
                            {/*--------------------------------------------------------Assignees Starts Hear--------------------------------------------*/}
                            <Col xl={5} lg={12}>
                                <div className='mb-3'>
                                    <Card className="card-need-border">
                                        <Card.Header className="pb-0">
                                            <h6 className="m-0">Assignees</h6></Card.Header>
                                        <Card.Body className='assignes-card-body pt-2'>
                                            <Tabs
                                                defaultActiveKey="Users"
                                                transition={false}
                                                id="noanim-tab-example"
                                                className="mb-3 justify-content-between position-relative tabs_material"
                                            >
                                                {/*--------------------------------------------------------User  tabs Starts--------------------------------------------*/}
                                                <Tab eventKey="Users" title="Users" >
                                                    <input className="form-control creat-task-search mb-2" name="create-task-search" type="search" placeholder="Search" aria-label="Search" onChange={(e) => { setUserSearch(e.target.value) }} />
                                                    <div className='hctrl-200'>
                                                        {
                                                            exceptedUsers?.length > 0 ?
                                                                exceptedUsers?.map((item, key) => {
                                                                    return (
                                                                        <div className="mb-1 assignees-cards">
                                                                            <div className='card-gt-body'>
                                                                                <div className='d-flex justify-content-between mt-2 mb-2' id={key}>
                                                                                    <div className=' d-flex align-item-center gap-wd-capital'>
                                                                                        <Avatar color={item.color} initials={`${item.name.substring(0, 1).toUpperCase()}${item.lastname.substring(0, 1).toUpperCase()}`} image={item.avatar} />
                                                                                        <h5>{item.name} {item.lastname}</h5>
                                                                                    </div>
                                                                                    <div className='pl-1' id={key}>
                                                                                        <Button className='icon-buttons-operatorbtn' onClick={(event) => addAssignee(item.id, event)}><FaPlus /></Button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                                : <div className='not-found'> <img src={NoGroupsFound} alt='No group found' />No Users Found</div>
                                                        }
                                                    </div>
                                                </Tab>
                                                {/*--------------------------------------------------------User tab closed--------------------------------------------*/}

                                                {/*--------------------------------------------------------Groups tabs Starts Hear--------------------------------------------*/}
                                                <Tab eventKey="Groups" title="Teams" >
                                                    <input className="form-control creat-task-search mb-2" type="search" placeholder="Search" aria-label="Search" onChange={(e) => { setSearchGroup(e.target.value) }} name="assigness-search" />
                                                    <div className='hctrl-200'>
                                                        {
                                                            groupsList.length > 0 ?
                                                                groupsList?.map((item, key) => {
                                                                    return (
                                                                        <div className="assignees-cards">
                                                                            <div className='card-gt-body'>
                                                                                <div className='d-flex justify-content-between mt-2 mb-2' id={key}>
                                                                                    <div className=' d-flex align-item-center gap-wd-capital'>
                                                                                        <Avatar color={avatarBrColors[Math.floor(Math.random() * avatarBrColors.length)]}
                                                                                            initials={`${item.title.substring(0, 2).toUpperCase()}`} />
                                                                                        <div>
                                                                                            <h5 className='assigneesname'>{item.title}</h5>
                                                                                            <span className='group-mebers'>{item.group_members?.length} members</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className='' >
                                                                                        <Button id={key + "teams"} className='icon-buttons-operatorbtn' onClick={(event) => addGroupAssignees(item.group_members, event, key + "teams")} >
                                                                                            {selectedButtons.includes(key + "teams") && teamCheck(item.group_members, key + "teams") ? <AiFillCheckCircle /> : <FaPlus />}</Button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                                : <div className='not-found'> <img src={NoGroupsFound} alt='Nogroupfound' />No Groups Found</div>
                                                        }
                                                    </div>
                                                </Tab>
                                                {/*--------------------------------------------------------Groups tab closed --------------------------------------------*/}
                                                {/*--------------------------------------------------------Departments tabs Starts Hear--------------------------------------------*/}
                                                <Tab eventKey="Departments" title="Departments">
                                                    <input className="form-control creat-task-search mb-2" type="search" placeholder="Search" aria-label="Search" onChange={(e) => { setSearchDept(e.target.value) }} name="assigness-search" />
                                                    <div className='hctrl-200'>
                                                        {
                                                            departmentsList.length > 0 ?
                                                                departmentsList?.map((item, key) => {
                                                                    return (
                                                                        <div className="assignees-cards">
                                                                            <div className='card-gt-body'>
                                                                                <div className='d-flex justify-content-between mt-2 mb-2' id={key}>
                                                                                    <div className=' d-flex align-item-center gap-wd-capital'>
                                                                                        <Avatar color={avatarBrColors[Math.floor(Math.random() * avatarBrColors.length)]} initials={`${item.name.substring(0, 2).toUpperCase()}`} />
                                                                                        <div>
                                                                                            <h5>{item.name}</h5>
                                                                                            <span className="mt-2 group-mebers">{departmentCount(item.id, key + "dep", "department")} Members</span>
                                                                                        </div>


                                                                                    </div>
                                                                                    <Button id={key + "dep"} className='icon-buttons-operatorbtn' onClick={(event) => addDepartmentAssignees(item.id, event, key + "dep")}>
                                                                                        {selectedButtons.includes(key + "dep") && checkDep(item.id, key + "dep") ?
                                                                                            <AiFillCheckCircle />
                                                                                            : <FaPlus />
                                                                                        }</Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                                :  
                                                                 <div className="not-found no-assignees">
                                                                <div className='text-center '>No Assignees</div></div> 
                                                        }
                                                    </div>
                                                </Tab>
                                                {/*--------------------------------------------------------Departments tabs Closed--------------------------------------------*/}
                                                {/*--------------------------------------------------------Locations tabs Starts Hear--------------------------------------------*/}
                                                <Tab eventKey="Locations" title="Locations">
                                                    <input className="form-control creat-task-search mb-2" type="search" placeholder="Search" aria-label="Search" onChange={(e) => { setSearchLocation(e.target.value) }} name="assigness-search" />
                                                    <div className='hctrl-200'>
                                                        {
                                                            locationsList?.length > 0 ?
                                                                locationsList?.map((item, key) => {
                                                                    return (
                                                                        <div className="assignees-cards">
                                                                            <div className='card-gt-body '>
                                                                                <div className='d-flex justify-content-between mt-2 mb-2' id={key}>
                                                                                    <div className=' d-flex align-item-center gap-wd-capital'>
                                                                                        <Avatar color={avatarBrColors[Math.floor(Math.random() * avatarBrColors.length)]} initials={`${item.name.substring(0, 2).toUpperCase()}`} />
                                                                                        <div>

                                                                                            <h5>{item.name}</h5>
                                                                                            <span className="mt-2 group-mebers">{departmentCount(item.id, key + "loc", "location")} Members</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <Button id={key + "loc"} className='icon-buttons-operatorbtn' onClick={(event) => { addLocationAssignees(item.id, key + "loc", event) }}>
                                                                                        {selectedButtons.includes(key + "loc") && locCheck(item.id, key + "loc") ? <AiFillCheckCircle /> : <FaPlus />}
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                                :   <div className="not-found no-assignees">
                                                                <div className='text-center '>No Assignees</div></div>
                                                        }
                                                    </div>
                                                </Tab>
                                                {/*--------------------------------------------------------Locations tabs closed Hear--------------------------------------------*/}
                                            </Tabs>
                                        </Card.Body>
                                    </Card>
                                </div>
                                {/*--------------------------------------------------------Assigned Users Starts Hear--------------------------------------------*/}
                                <div className='mb-3'>
                                    <Card className="card-need-border">
                                        <Card.Header className="justify-content-between d-flex align-items-center pb-0">
                                            <h6 className="m-0">Assigneed Users</h6>
                                            {assignees.length > 0 && showtoggleforUsers && (<OverlayTrigger overlay={<Tooltip>Force Approve By Your Self</Tooltip>}>
                                             <Switch height={18} width={38} checked={checked1 || assignees.length == selectedcheck.length ? true : false} onChange={handleChange}/>
                                            </OverlayTrigger>)
                                            }
                                        </Card.Header>
                                        <div className="app" style={{ textAlign: "center" }}>

                                        </div>
                                        <Card.Body className="pt-0">
                                            <div className="hctrl-300 hctrl-200">
                                                {
                                                    assignees.length > 0 ?
                                                        assignees?.map((item, key) => {
                                                            return (
                                                                <div id={key}>
                                                                    {fetchAssignees(item, key, checked1)}
                                                                </div>
                                                            )
                                                        })
                                                        :
                                                        <div className="not-found no-assignees">
                                                        <div className='text-center '>No Assignees</div></div>
                                                }
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </div>
                                {/*--------------------------------------------------------Assigned Users closed Hear--------------------------------------------*/}
                            </Col>
                            {/*--------------------------------------------------------Assignees Closed  Hear--------------------------------------------*/}
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        {
                            draftTaskDetails ? showButtons() :
                                <>
                                    <div>
                                        <Button className="modal-btns me-3" variant="primary" onClick={(e) => { createTask_obj.name.trim().length > 0 ? createDraftTask(e) : setShowError(true) }} disabled={btnloading.createDraft}>
                                            {btnloading.createDraft ? <Spinner as="span" animation="border" size="sm" role="status" baria-hidden="true" />
                                                : <span ><RiDraftFill className='btn-wd-icon' /> Create Draft </span>}
                                        </Button>
                                        <Button className="modal-btns" variant="primary" onClick={(e) => { createTask_obj.name.trim().length > 0 ? selectAssisgnessToastMessage() : setShowError(true) }} disabled={btnloading.scheduleTask}>
                                            {/* <Button className="modal-btns" variant="primary" onClick={(e) => { createTask_obj.name.trim().length > 0 ?  createTask_obj?.assignee.length > 0 ? setScheduleModel(!showScheduleModel) : selectAssisgnessToastMessage() : setShowError(true) }} disabled={btnloading.scheduleTask}> */}
                                            {btnloading.scheduleTask ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                : <span > <MdOutlineScheduleSend className='btn-wd-icon' /> Schedule Task</span>}
                                        </Button>
                                    </div>
                                    <Button variant="primary" onClick={(e) => {
                                        createTask_obj.name.trim().length > 0 ? createTasks('Live')
                                            : setShowError(true)
                                    }} disabled={btnloading.createTask} className='btn-primary'>
                                        {btnloading.createTask ? <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        /> : <span > Create Manual Task</span>}
                                    </Button>
                                </>
                        }

                    </Modal.Footer>
            </Modal>
            {/*-------------------------------------------------------- showAddform Modal Closed  Hear--------------------------------------------*/}

            <Modal show={showScheduleModel} keyboard={false} onHide={() => setScheduleModel(!showScheduleModel)} backdrop="static" >
                <Form onSubmit={(e) => createScheduleTask(e)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create Schedule Task</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Schedule Date</Form.Label>
                            <DatePicker required className="form-control" selected={new Date(scheduleDate)} onChange={(date) => setScheduleDate(date.toISOString())} minDate={new Date()} timeInputLabel="Time:"
                                dateFormat="eee, MMM dd, yyyy, h:mm aa"
                                showTimeInput />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setScheduleModel(!showScheduleModel)}>
                            Close
                        </Button>
                        <Button variant="primary" type='submit'>
                            Schedule Changes
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showChangeScheduleModel} keyboard={false} onHide={() => setChangeScheduleModel(!showChangeScheduleModel)} backdrop="static">
                <Form onSubmit={(e) => updateScheduleTask(e)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Change Schedule Time</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Schedule Date</Form.Label>
                            <DatePicker required className="form-control" selected={new Date(scheduleDate)} onChange={(date) => setScheduleDate(date.toISOString())} minDate={new Date()} timeInputLabel="Time:"
                                dateFormat="MM/dd/yyyy h:mm aa"
                                showTimeInput />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setChangeScheduleModel(!showChangeScheduleModel)}>
                            Close
                        </Button>
                        <Button variant="primary" type='submit'>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Form>

            </Modal>
        </>
    )

}

export default CreateTaskComponent