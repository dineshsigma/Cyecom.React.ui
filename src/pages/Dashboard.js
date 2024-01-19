import { useDispatch, useSelector } from "react-redux";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { useEffect } from "react";
import { useState } from "react";
import { baseUrl } from "../environment";
import { ErrorBoundary } from "react-error-boundary";
import axios from "axios";
import blush from "../assets/blush.png";
import rocket from "../assets/rocket.png";
import celebration from "../assets/celebration.png";
import manlaptop from "../assets/manlaptop.png";
import ClassReward from "../assets/class-reward.svg";
import RankingIcons2 from "../assets/ranking-icons2.svg";
import PieChart from "../components/PieChart";
import Announcements from "../components/Announcements";
import Todos from "../components/Todos";
import TaskOverview from "../components/TaskOverview";
import TeamMembers from "../components/TeamMembers";
import Assets from "../components/Assets";
import OverAllProcess from "../components/OverAllProcess";
import DepartmentCarousel from "../components/DepartmentCarousel";
import { setTaskAddform } from "../redux/reducers/taskReducer";
import {
  getStatusFilterTasks,
  getGroups,
  getHighTasks,
  getRewardsList
} from "../redux/reducers/dashboardReducer";
import { Container,Row,Col } from "react-bootstrap";
import { getUsers, getOrgUsers } from "../redux/reducers/userReducer";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import { FaPlus, FaArrowRight } from 'react-icons/fa';
import { Card } from "react-bootstrap";
import { getPermissionsByRole } from "../redux/reducers/rolesReducer";
import { useNavigate } from "react-router-dom";



const Dashboard = () => {
  const navigate = useNavigate();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const org_id = useSelector((state) => state.auth.current_organization);
  const statusFilters = useSelector((state) => state.dashboard.statusFilters);
  const [token, setToken] = useState("");
  const showAddform = useSelector((state) => state.tasks.showTask);
  const dispatch = useDispatch();
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const userDetails = useSelector((state) => state.auth.userDetails);
  const userData = useState(localStorage?.getItem("userData")&&JSON.parse(localStorage?.getItem("userData")));
  const [percentage, setPercentage] = useState(0);
  const userOrgRoleId = useState(localStorage?.getItem('userOrgData')&&JSON.parse(localStorage?.getItem('userOrgData')));
  const userOrgList = useSelector((state) => state.auth.userOrgDetails);
  const rankingData = useSelector((state) => state.dashboard.rankingData);
  const [rankpoints, setRankPoints] = useState([])
  useEffect(()=>{
    let payload = {
    assignee:[],
    date: "",
    from_date: "",
    to_date: "",
    locations:[],
  };
  dispatch(getStatusFilterTasks(payload))
  },[])

  useEffect(() => {
    // dispatch(getStatusFilterTasks());
    dispatch(getGroups());
    dispatch(getHighTasks());
    dispatch(getUsers(""));
    dispatch(getOrganizations(available_organizations));
    dispatch(getUserOrgByid(userData?.[0]?.id));
    dispatch(getRewardsList()).then((rankingResponse) => {
      let response = rankingResponse?.payload?.filter((item, index) => {
        return item.user_id == userOrgList[0].user_id
      });
      setRankPoints(response)

    })
  }, []);
  const fetchRank = () => {
    let userInfo;
    if(userOrgList?.length>0){
       userInfo = rankingData?.find(user => user.user_id == userOrgList[0]?.user_id);
    }
    let data = rankingData?.map(function (item) {
      return item.points
    })
    let ranks = data?.indexOf(userInfo?.points) + 1
    if (ranks < 9 && ranks != 0) {
      return '0' + ranks
    }
    else if(ranks==0){
      return "-"
    }
    else {
      return ranks
    }
  }
  //to get role permissions
  useEffect(() => {
    if (userOrgRoleId) {
      dispatch(getPermissionsByRole(userOrgRoleId?.[0].role_id))
    }
  }, [userOrgRoleId])

  //for percentage of work done
  useEffect(() => {
    if (statusFilters?.length > 0) {
      let total = 0;
      let closed = 0;
      statusFilters?.forEach((item) => {
        total += parseInt(item.count);
        if (item.status == "closed") {
          closed += parseInt(item.count);
        }
      });
      setPercentage(Math.round((closed * 100) / total));
    }
  }, [statusFilters]);

  const fetchToken = () => {
    axios
      .get(
        `https://b929-183-83-216-63.ngrok.io/dev/api/auth/dashboard-guest-token?dashboardid=6035d652-5933-4f2f-97da-4ac6d9a4c70d&org_id=${org_id}`
      )
      .then((res) => {
        setToken(res.data.token);
        embedDashboard({
          id: "6035d652-5933-4f2f-97da-4ac6d9a4c70d", // given by the Superset embedding UI
          supersetDomain: "https://cyeproreports.azurewebsites.net",
          mountPoint: document.getElementById("report"), // any html element that can contain an iframe
          fetchGuestToken: () => res.data.token,
          dashboardUiConfig: {}, // hideTitle: true dashboard UI config: hideTitle, hideTab, hideChartControls (optional)
          debug: true,
        });
      });
  };


  return (
    <Container fluid>
      <h2 className="dashboard-head">Dashboard</h2>
      {/* -------------Dashboard Main heading pink banner and Congratulation card-------*/}
      <Row className="mt-4">
        {/* <div className="col-xl-8 col-md-12 col-sm-12 d-flex align-items-stretch">
          <Card className="milestones border-0">
            <div className="container-fluid">
              <div className="row d-flex align-items-center justify-content-between">
                <div className="col-2 position-relative">
                  <img className="rocket-image" src={rocket} alt="Rocketphoto" />
                </div>
                <div className="col-7 py-5">
                  <h3 className="mile-head">
                    There are new Milestones for today{" "}
                    <span>
                      <img src={blush} alt="Blushimage" />
                    </span>
                  </h3>
                  <p className="sub-text-mile m-0">YOU CAN DO A NEW TASK</p>
                </div>
                <div className="col-3 d-flex justify-content-end">
                  <button
                    className="create-task-button d_aic_jcc"
                    onClick={() => dispatch(setTaskAddform(!showAddform))}
                  >
                    <span>
                      <FaPlus />
                    </span>{" "}
                    Create Task
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div> */}
        <Col xl={8} md={12} className="d-flex align-items-stretch">
          <Card className="milestones border-0">
            <Card.Body className="d_aic_jcc">
              <div className="rocket-image">
                <img src={rocket} alt="Rocketphoto" />
              </div>
              <div className="content">
                <h3 className="mile-head">
                  There are new Milestones for today{" "}
                  <span>
                    <img src={blush} alt="Blushimage" />
                  </span>
                </h3>
                <p className="sub-text-mile m-0">YOU CAN DO A NEW TASK</p>
              </div>
              <button className="create-task-button d_aic_jcsb" onClick={() => dispatch(setTaskAddform(!showAddform))}><span><FaPlus /></span>Create Task</button>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4} md={12} className="pt-3 pt-md-3 pt-sm-3 pt-xl-0 d-flex align-items-stretch">
          <Card className="dashboard-card congrats-card p-0">
            <Card.Body className="d-flex justify-content-between p-0">
              <div className="content">
                <h4 className="mb-0">
                  Congratulations {userDetails?.name?.toUpperCase()}!
                  <span>
                    <img src={celebration} alt="Celebrationimage" />
                  </span>
                </h4>
                {percentage != "undefined" || "null" ? (
                  <>
                    {/* <h6 className="mb-4">
                      You have successfully done {percentage}% of Tasks.
                      Check your new Tasks <br />
                    </h6>
                    <a className="task-list-button" href="/taskslist">
                      Check Task List
                    </a> */}
                    <div className="d_aic_jcFS">
                      <div className="rankingcard_dash rankingcard_dash_disable_hover ps-0 pe-0">
                        <div className="iconimg">
                          <img src={ClassReward} alt="ClassReward" />
                        </div>
                        <h4>Rewards</h4>
                        <h6 className="d_aic_jcFS">{rankpoints?.length>0&&parseInt(rankpoints[0]?.points)>0?rankpoints[0]?.points:"0"}<span>PTS</span></h6>
                      </div>
                      <div className="rankingcard_dash">
                        <a onClick={() => navigate("/rankinglist")}>
                          <div className="iconimg">
                            <img src={RankingIcons2} alt="RankingIcons2" />
                          </div>
                          <h4>Ranking</h4>
                          <h6 className="d_aic_jcsb">{fetchRank()} <span>Go here <FaArrowRight className="icon" /></span> </h6>
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  "Please Create Your First Task"
                )}
              </div>
              <div className="man-img d-flex align-items-end justify-content-end">
                <img src={manlaptop} alt="Manlaptopimage" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        {/* -------- Departments Carousel -------- */}
        <Col xl={8} md={12}>
          <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <DepartmentCarousel />
          </ErrorBoundary>
        </Col>
        {/* -------- Over All Process Pie Chart -------- */}
        <Col xl={4} md={12} className="pt-xl-0 pt-lg-3 pt-md-3 pt-sm-3 pt-3 d-flex align-items-stretch">
          <PieChart />
        </Col>
      </Row>
      <Row className="mt-4">
        {/* -------- Task Over View Line Chart -------- */}
        <Col xl={6} md={12} className="d-flex align-items-stretch">
          <TaskOverview />
        </Col>
        {/* -------- Announcements Component-------- */}
        <Col xl={3} md={6} sm={12} className="pt-xl-0  pt-md-3 pt-sm-3 pt-3 d-flex align-items-stretch">
          <Announcements />
        </Col>
        {/* -------- Todos Component-------- */}
        <Col xl={3} md={6} sm={12} className="pt-xl-0 pt-md-3 pt-sm-3 pt-3 d-flex align-items-stretch">
          <Todos />
        </Col>
      </Row>
      <Row className="d-flex align-items-stretch mt-4">
        {/* -------- Team Members Component -------- */}
        <Col xl={3} md={6} sm={12} className="pt-xl-0  order-2 pt-md-3 pt-sm-3 pt-3 d-flex align-items-stretch">
          <TeamMembers />
        </Col>
        {/* -------- Over All Process Component -------- */}
        <Col xl={6} md={12} className="pt-xl-0 pt-lg-0 pt-md-3 pt-sm-3 pt-3 order-1 d-flex align-items-stretch">
          <OverAllProcess />
        </Col>
        {/* -------- Assets Component -------- */}
        <Col xl={3} md={6} sm={12} className="pt-xl-0  pt-md-3 pt-sm-3 pt-3 order-3 d-flex align-items-stretch">
          <Assets />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
