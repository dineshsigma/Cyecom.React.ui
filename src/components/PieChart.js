import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  FaCheckCircle,
  FaClipboardList,
  FaRegClock,
  FaFilter,
} from "react-icons/fa";
import { getLocations } from "../redux/reducers/locationsReducer";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getStatusConfig } from "../redux/reducers/statusConfigReducer";
import {
  Button,
  Modal,
  Tabs,
  Tab,
  Form,
  Col,
  Row,
  Card,
  Spinner
} from "react-bootstrap";
import { MultiSelect } from "react-multi-select-component";
import {
  getUsers,
  getOrgUsers,
  getTaskUserData,
} from "../redux/reducers/userReducer";
import { getAllUsers, getExceptUsers } from "../redux/reducers/userReducer";
import { getAllTeamIds } from "../redux/reducers/taskReducer";
import DatePicker from "react-datepicker";
import { getStatusFilterTasks } from "../redux/reducers/dashboardReducer";
import { getDepartments } from '../redux/reducers/departmentReducer';
import { getGroups } from '../redux/reducers/groupReducer'
import { logOut } from "../redux/reducers/authReducer";


ChartJS.register(ArcElement, Tooltip);

const PieChart = () => {
  const userDetails = useSelector((state) => state.auth.userDetails);
  const allTeamIds = useSelector((state) => state.tasks.teamIds);
  const AllUsers = useSelector((state) => state.users.usersList);
  const orgUsersList = useSelector((state) => state.users.orgUsersList)
  const userOrgList = useSelector((state) => state.auth.userOrgDetails);
  const current_organization = useSelector((state) => state.auth.current_organization);
  const groupsList = useSelector((state) => state.groups.groupsList);
  // const userOrgDetails = userOrgList?.find((item) => item.org_id == current_organization);
  const departmentsList = useSelector((state) => state.department.departmentsList);
  const [searchDept, setSearchDept] = useState('')
  const [openfilter, setOpenFilter] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const statusFilters = useSelector((state) => state.dashboard.statusFilters);
  const [statusFiltersObj, setStatusFiltersObj] = useState();
  const [locaionDetails, setLocaionDetails] = useState({});
  const [percentage, setPercentage] = useState(0);
  const statusConfigList = useSelector(
    (state) => state.status.statusConfigList
  );
  const options = {
    cutout: "64%",
    maintainAspectRatio: false,
    responsive: true,
  };
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [locationData,setLocationData]=useState([])
  const [selectedLocations,setSelectedLocations]=useState([]);
  const locationsList = useSelector((state) => state.location.locationsList);
  const [meSelected, setMeSelected] = useState(false);
  const [teamSelected, setTeamSelected] = useState(false);
  const [showMe,setShowMe]=useState(false);
  const [selectedMe,setSelectedMe]=useState("");
  const [location,setLocation]=useState("");
  const [teamsList,setTeamsList]=useState([]);
  const [departmentCheck,setDepartmentCheck]=useState(false);
  const [filterLoader,setFilterLoader]=useState(false);
  // const [filterSearch, setFilter] = useState({
  //   name: "",
  //   status: "",
  //   priority: "",
  //   assignee: [userDetails.id],
  //   created_by: userDetails.id,
  // });
  const [fiterDate, SetFilterDate] = useState("empty");
  const [startDate, setStartDate] = useState(new Date().toISOString());
  const [endDate, setEndDate] = useState(new Date().toISOString());
  const [filter_Search, set_Filter] = useState({
    name: "",
    offset: 0,
    limit: 20,
  });

  let userOrgDetails
 
  useEffect(() => {
    if (userOrgList == undefined) {
      // userLogout()
    } else {
      userOrgDetails = userOrgList?.find(
        (item) => item.org_id == current_organization
      )
    }
     userOrgDetails = userOrgList?.find((item) => item?.org_id == current_organization);
  },[userOrgList])
 
  const userLogout = () => {
    dispatch(logOut());
    navigate("/");
  };

  useEffect(()=>{
    let payload = {
    assignee:[],
    date: "",
    from_date: "",
    to_date: "",
    locations:[],
  };
  dispatch(getStatusFilterTasks(payload))
  dispatch((getDepartments(searchDept)))
  dispatch(getGroups(''))
  dispatch(getOrgUsers())
  },[])

 
  useEffect(() => {
    dispatch(getStatusConfig());
    dispatch(getLocations("")).then((res) => {
      let location = res?.payload?.find(
          (i) => i.id == userOrgDetails?.location_id
      );
      location && setLocaionDetails(location);
  });;
    dispatch(getAllUsers(filter_Search)).then(res=>{
      let users = [];
      res.payload?.map((item) => {
        users.push({
          label: `${item?.name} ${item?.lastname}`,
          value: item.user_id,
        });
      });
      setAllUsers(users);
    });
    let payloadTeamIds = {
      input_id: userDetails.id,
    };
    dispatch(getAllTeamIds(payloadTeamIds)).then((res) => {
      let fetchuserDetails = [];
      res?.payload?.data?.getTeamTasks?.data?.map((item) => {});
    });
    // dispatch(getUsers("")).then((resp) => {
    //   let users = [];
    //   resp.payload?.map((item) => {
    //     users.push({
    //       label: `${item?.name} ${item?.lastname}`,
    //       value: item.id,
    //     });
    //   });
    //   setAllUsers(users);
    // });
    let statusFiltersObj = statusFilters?.reduce(
      (obj, item) => ((obj[item.status] = item.count), obj),
      {}
    );
    if (statusFiltersObj?.["in-progress"] != undefined) {
      statusFiltersObj.inprogress = statusFiltersObj["in-progress"];
      delete statusFiltersObj["in-progress"];
    }
    // Rename 'in-review' to 'inreview'
    if (statusFiltersObj?.['in-review']) {
      statusFiltersObj.inreview = statusFiltersObj["in-review"];
      delete statusFiltersObj["in-review"];
    }
    if (statusFiltersObj?.['open']) {
      statusFiltersObj.inopen = statusFiltersObj["open"];
      delete statusFiltersObj["open"];
    }

    let total = 0;
    for (let key in statusFiltersObj) {
      total += parseInt(statusFiltersObj[key]);
    }
    if (total) {
      statusFiltersObj.total = total;
    }

    // if(statusFiltersObj?.total){
    //   statusFiltersObj.total = total.toString();
    // }
    setStatusFiltersObj(statusFiltersObj);
    if (statusFiltersObj && statusFiltersObj.total !== 0) {
      let total_val = (statusFiltersObj.closed / statusFiltersObj.total);
      let cal_total = total_val * 100;
      cal_total = Math.round(cal_total * 100) / 100;
    
      if (Math.round(cal_total) > 0||Math.round(cal_total) ==0) {
        setPercentage(Math.round(cal_total));
      }
    }

    if(statusFiltersObj?.closed==0&&statusFiltersObj['in-review']==0&&statusFiltersObj?.inprogress==0&&statusFiltersObj?.open==0)
      {
      setPercentage(0)
    }
// let total_val = statusFiltersObj?.total !== 0 ? (statusFiltersObj?.closed / statusFiltersObj?.total) : 0;
// let cal_total = total_val * 100;
// Rounding the percentage to two decimal places
// cal_total = Math.round(cal_total * 100) / 100;

// Now cal_total contains the percentage (rounded to two decimal places)

    // let total_val= (statusFiltersObj?.closed/statusFiltersObj?.total)
    // let cal_total=total_val*100;
    // console.log("cal_total",cal_total)
    // console.log("total_val",total_val)
    // let percentValue = Math.round(
    //   (statusFiltersObj?.closed * 100) / statusFiltersObj?.total
    // ).toString();
    // if (cal_total > 0) {
    //   setPercentage(cal_total);
    // }
  }, [statusFilters]);

  useEffect(()=>{
    let filters=[];
    locationsList?.map((item)=>{
      filters.push({label:item.name,value:item.id})
    })
    setLocationData(filters)
  },[locationsList])
  // const datapoints = [percentage];
  let inProgress=statusConfigList?.find((item, index) => {
    return (
      item?.name == "in-progress" &&
      item?.org_id == 0 &&
      item?.parent_id == null
    );
  })
  let inreview= statusConfigList?.find((item, index) => {
    return (
      item?.name == "in-review" &&
      item?.org_id == 0 &&
      item?.parent_id == null
    );
  })
  let inopen= statusConfigList?.find((item, index) => {
    return (
      item?.name == "open" &&
      item?.org_id == 0 &&
      item?.parent_id == null
    );
  })
  const data = {
    // labels: ['#286aff', '#ff5fbf', '#f9c33e'],
    
    datasets: [
      {
        // label: '# of Votes',
        data: [
          statusFiltersObj?.inopen,
          statusFiltersObj?.inprogress,
          statusFiltersObj?.inreview,
          statusFiltersObj?.closed,
        ],
       
        // data: datapoints,
        backgroundColor: ["#929292","#ffa048", "#4da5f8", "#78d700"],
        borderColor: ["#929292", "#ffa048","#4da5f8", "#78d700"],
        borderWidth: 1,
        total: percentage,
      },
    ],
    total: 90,
  };
  const textCenter = {
    id: "textCenter",
    beforeDatasetsDraw(chart, args, pluginOptions) {
      const { ctx, data } = chart;
      const xCoor = chart.getDatasetMeta(0).data[0].x;
      const yCoor = chart.getDatasetMeta(0).data[0].y;
      ctx.save();
      ctx.font = "bold 13px Roboto";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(data?.datasets[0]?.total + "%", xCoor, yCoor - 5);
      ctx.font = "10px Roboto";
      ctx.fillStyle = "#000000";
      ctx.fillText("Completed", xCoor, yCoor + 10);
    },
  };

  //me Selected Assigee Function
  const MeSelected = () => {
    setMeSelected(true);
    setTeamSelected(false);
    setShowMe(true)
    setSelectedMe("Me")
    // setSelectedAssignees([
    //   {
    //     label: `${userDetails?.name} ${userDetails?.lastname}`,
    //     value: userDetails.id,
    //   },
    // ]);
    // selectedAssignees?.map(item=>{
    //   if((item.label!=userDetails?.name&&item.value!=userDetails.id)){
    //     setSelectedAssignees([
    //       {
    //         label: `${userDetails?.name} ${userDetails?.lastname}`,
    //         value: userDetails.id,
    //       },
    //     ]);
    //   }
    // })

  };
  //My team Selected Assigee Function
  const TeamSelected = () => {
    setMeSelected(false);
    setShowMe(false);
    setTeamSelected(true);
    setSelectedMe("Team")
    setDepartmentCheck(true)
    let teamArray = [];
    //all Teams Ids map with
    allTeamIds?.map((user) => {
      let userdata = AllUsers.find((item) => user === item.id);
      teamArray.push({
        label: `${userdata?.name} ${userdata?.lastname}`,
        value: userdata.id,
      });
    });
    // setTeamsList(teamArray);
  };

  const MyTeamLocation=()=>{
    // let locArray = [];
    // locationData
  }
  // const handleClosePopover = () => {
  //   setShowPopover(false);
  // };

  const MyLocation=()=>{
    setLocation("MyLocation")
    setSelectedLocations([
      {
        label: `${locaionDetails?.name}`,
        value: locaionDetails.id,
      },
    ]);
  
  }
  const getDepartmentsData=()=>{
    let dep=[]
    let dep_list=groupsList.map((item)=>{
      dep.push({label:`${item.title}`,value:`${item.id}`})
    })
    return dep
  }
  //Apply Filter
  const ApplyFilter = () => {
    setFilterLoader(true)
  let assignees;
  if(!departmentCheck){
    assignees=selectedAssignees?.map(obj=>obj.value)
  }
  if(departmentCheck){
    let department_list=teamsList?.map(obj=>obj.value);
    let usersIds = []
    let assignee_list=[]
    department_list.forEach((item)=>{
      groupsList.map((groupData)=>{
        if(item==groupData.id){
          usersIds.push(groupData.group_members)
        }
      })
    })
    usersIds.flat().map((item)=>{
      if(!assignee_list.includes(item)){
        assignee_list.push(item)
      }
    })
    assignees= assignee_list
  }
  
  let locations=selectedLocations?.map(obj=>obj.value)
    let assigneeList = [];
    let payload = {
      assignee: assignees,
      date: fiterDate,
      from_date: startDate,
      to_date: endDate,
      locations:locations,
    };
    dispatch(getStatusFilterTasks(payload)).then((res)=>{
       setOpenFilter(false)
       setFilterLoader(false)
    });
  
  }

  // console.log(statusFiltersObj, 'AAA');
  return (
    <Card className="pie-card dashboard-card">
      <div className="pie-header">
        <h4 className="m-0">Over All Process</h4>
        <div className="d_aic_jcc gap-3">
          <Button
            id="showFilters"
            variant="primary"
            className="rounded-circle filter-btn"
            onClick={() => setOpenFilter(true)}
          >
            <FaFilter className="piechart-filter-icon"/>
          </Button>
          <button onClick={() => navigate("/taskslist")}>
            <p>SEE ALL</p>
          </button>
        </div>
      </div>
      <Row>
        <Col sm={6} xs={12}>
          <div className="pie-content">
            <ul className="m-0">
              <li>
                <FaClipboardList className="notes-icon" />
                {statusFiltersObj?.total > 0 ? statusFiltersObj?.total : "0"} Total Tasks
              </li>
              <li>
                <FaRegClock
                  className="clock-icon"
                  style={{color: "#929292"}}
                  // style={{
                  //   color: statusConfigList?.find((item, index) => {
                  //     return (
                  //       item?.name == "open" &&
                  //       item?.org_id == 0 &&
                  //       item?.parent_id == null
                  //     );
                  //   })?.color,
                  // }}
                />
                {statusFiltersObj?.inopen > 0 ? statusFiltersObj?.inopen : "0"} Open
              </li>
              <li>
                <FaRegClock
                  className="clock-icon"
                  style={{
                    color: statusConfigList?.find((item, index) => {
                      return (
                        item?.name == "in-progress" &&
                        item?.org_id == 0 &&
                        item?.parent_id == null
                      );
                    })?.color,
                  }}
                />
                {statusFiltersObj?.inprogress > 0 ? statusFiltersObj?.inprogress : "0"} In Progress
              </li>
             
              <li>
                <FaRegClock
                  className="clock-icon"
                  style={{
                    color: statusConfigList?.find((item, index) => {
                      return (
                        item?.name == "in-review" &&
                        item?.org_id == 0 &&
                        item?.parent_id == null
                      );
                    })?.color,
                  }}
                />
                {statusFiltersObj?.inreview > 0 ? statusFiltersObj?.inreview : "0"} In Review
              </li>
              <li>
                <FaCheckCircle
                  className="right-icon"
                  style={{color:"#78d700"}}
                  // style={{
                  //   color: statusConfigList?.find((item, index) => {
                  //     return (
                  //       item?.name == "closed" &&
                  //       item?.org_id == 0 &&
                  //       item?.parent_id == null
                  //     );
                  //   })?.color,
                  // }}
                />
                {statusFiltersObj?.closed > 0 ? statusFiltersObj?.closed : "0"} Closed
              </li>
            </ul>
          </div>
        </Col>
        <Col sm={6} xs={12}>
          <div className="circle-process">
            <Doughnut
              data={data}
              // width={"100%"}
              // className="donut-chart"
              options={options}
              plugins={[textCenter]}
            />
          </div>
        </Col>
      </Row>
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={openfilter}
        onHide={() => setOpenFilter(false)}
        className="modal-50w"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter" className="text-dark"><FaFilter className="piechart-filter-icon"/>Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body className="assignes-card-body">
          <Tabs
            defaultActiveKey="assignee"
            id="fill-tab-example"
            className="tabs_material bg-white mb-3"
            fill={true}
          >
            {/*------first tab for Assigee----------Tab1 starts here---- */}
            <Tab eventKey="assignee" title="Assignee">
              <div className="d-flex align-items-center gap-2 my-2">
              <Form.Check
                  type="radio"
                  label="Assignees"
                  name="assignee"
                  checked={selectedMe == "Me"}
                  onClick={() => MeSelected(1)}
                  id={`default-checkbox1`}
                />
                {/* <input
                  type="radio"
                  value="me"
                  name="assignee"
                  checked={selectedMe == "Me"}
                  onClick={() => MeSelected(1)}
                />
                <label>Assignees</label> */} 
                <Form.Check
                  type="radio"
                  label="My Teams"
                  name="assignee"
                  checked={selectedMe == "Team"}
                  onClick={() => TeamSelected(2)}
                  id={`default-checkbox2`}
                />
                {/* <input
                  type="radio"
                  value="myTeam"
                  name="assignee"
                  checked={selectedMe == "Team"}
                  onClick={() => TeamSelected(2)}
                />
                <label>My Teams</label> */}
              </div>
              <Form.Group className="">
                {/* <MultiSelect
                  value={selectedAssignees}
                  onChange={setSelectedAssignees}
                  options={allUsers}
                  labelledBy="Select"
                  type="checkbox"
                /> */}
                  <MultiSelect
                  value={showMe?selectedAssignees:teamsList}
                  onChange={showMe?setSelectedAssignees:setTeamsList}
                  options={showMe?allUsers:teamSelected?getDepartmentsData:allUsers}
                  labelledBy="Select"
                  type="checkbox"
                />
              </Form.Group>
            </Tab>
            {/*------first tab for Assigee----------Tab1 ends here---- */}
            {/*------second  tab for startDate,Duedate----------Tab2 starts here---- */}
            <Tab eventKey="date" title="Date" className="date-tab">
              <div className="d_aic_jcsb gap-2 my-2">
                <Form.Check
                  type="radio"
                  label="Start"
                  name="filterDate"
                  checked={fiterDate == "startdate"}
                  onChange={() => SetFilterDate("startdate")}
                  id={`default-checkbox3`}
                />
                <Form.Check
                  type="radio"
                  label="Due"
                  name="filterDate"
                  checked={fiterDate == "duedate"}
                  id={`default-checkbox4`}
                  onChange={() => SetFilterDate("duedate")}
                />
                <Form.Check
                  type="radio"
                  label="None"
                  name="filterDate"
                  checked={fiterDate == "empty"}
                  id={`default-checkbox5`}
                  onChange={() => SetFilterDate("empty")}
                />
              </div>
              <Form.Group className="my-2">
                <Form.Label>From</Form.Label>
                <DatePicker
                  className="form-control"
                  timeInputLabel="Time:"
                  dateFormat="eee, MMM dd, yyyy, h:mm aa"
                  showTimeInput
                  selected={new Date(startDate)}
                  onChange={(date) =>
                    setStartDate(new Date(date).toISOString())
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>To</Form.Label>
                <DatePicker
                className="form-control"
                timeInputLabel="Time:"
                dateFormat="eee, MMM dd, yyyy, h:mm aa"
                showTimeInput
                selected={new Date(endDate)}
                onChange={(date) =>
                  setEndDate(new Date(date).toISOString())
                }
              />
              </Form.Group>
            </Tab>
            {/*------second  tab for startDate,Duedate----------Tab2 ends here---- */}

            {/*------third tab for Locations----------Tab3 starts here---- */}
            <Tab eventKey="Locations" title="Locations">
              <div className="d-flex align-items-center gap-2 my-2">
                {/* <input type="radio" value="mylocation" name="location"
                checked={location == "MyLocation"}/> */}
                <label>Select Location</label>
                {/* <input
                  type="radio"
                  value="myTeamlocation"
                  name="location"
                  checked={location == "MyTeamLocation"}
                  onClick={()=>setLocation("MyTeamLocation")}
                />
                */}
              </div>
              <Form.Group className="">
                <MultiSelect
                value={selectedLocations}
                onChange={setSelectedLocations}
                options={locationData}
                labelledBy="Select"
                type="checkbox"
              />
              </Form.Group>
            </Tab>

            {/*------third tab for Locations----------Tab3 ends here---- */}
          </Tabs>
        </Modal.Body>
        <Modal.Footer className="justify-content-end gap-1">
          <Button onClick={() => setOpenFilter(false)} className="dark-btn">
            Close
          </Button>
          <Button onClick={() => ApplyFilter()} disabled={filterLoader}>{filterLoader?<Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            />:"Apply"}</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default PieChart;