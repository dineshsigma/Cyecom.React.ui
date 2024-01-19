import { Card, Container, Button, Navbar, Modal, Offcanvas, Tabs, Tab,InputGroup } from "react-bootstrap";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { avatarBrColors } from "../environment";
import { changeCurrentOrg, setToggleMenu } from "../redux/reducers/authReducer";
import { getUserNotificatinos, readNotifications, } from "../redux/reducers/userReducer";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTodayAnnouncements } from "../redux/reducers/announcementsReducer";
import { getUserById, logOut, setShowExpired } from "../redux/reducers/authReducer";
import moment from "moment";
import Avatar from "./Avatar";
import { getDesignations } from "../redux/reducers/designationReducers";

import { FaBars, FaCaretDown } from "react-icons/fa";
import { BiBell, BiInfoCircle } from "react-icons/bi";
import { AiOutlineSetting } from "react-icons/ai";
import { HiOutlineSpeakerphone } from "react-icons/hi";

import birthdayicon from "../assets/Birthday.svg";
import userprofile from "../assets/user-profile.png";
import announcemnetsimg from "../assets/announcemnets.jfif";
import profile from "../assets/profile.jpg";
import captialLetter from '../modules/CaptialLetter';
import { FiCalendar } from "react-icons/fi";
import {TbCalendarStats} from "react-icons/tb"
import { getPermissionsByRole } from "../redux/reducers/rolesReducer";
const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  // const permissions = useState(JSON.parse(localStorage.getItem("permissions")));
  // const [annPermissions, setAnnPermissions] = useState();
  const [permissions,setPermissions] = useState();
  const [annPermissions, setAnnPermissions] = useState();
  const [showSwapOrg, setSwapOrg] = useState(false);
  const [showNotification, setNotifications] = useState(false);
  const [showAnnouncements, setAnnouncements] = useState(false);
  const orgList = useSelector((state) => state.organization.organizationsList);
  const userOrgList = useSelector((state) => state.auth.userOrgDetails);
  const showExpired = useSelector((state) => state.auth.showExpired);
  const current_organization = useSelector(
    (state) => state.auth.current_organization
  );
 let userOrgDetails;
  useEffect(() => {
    if (userOrgList == undefined) {
      // dispatch(logOut());
      navigate("/");
    } else {
     userOrgDetails = userOrgList?.find(
        (item) => item.org_id == current_organization
      )
    }
  }, [userOrgList])
  // console.log("userOrgList",userOrgList)
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [organizationsdata, setorganizations] = useState({ data: available_organizations, name: '' })
  const userDetails = useSelector((state) => state.auth.userDetails);
  const [designationDetails, setDesignationDetails] = useState({});
  const orgDetails = orgList?.find((item) => item.id == current_organization);
  const notificationList = useSelector((state) => state.users.notificationList);
  const announcementsList = useSelector((state) => state.announcement.todayAnnouncements);
  const isOpen = useSelector((state) => state.auth.toggleSideMenu);
  const [unreadIds, setUnreadIds] = useState(0);
  const [readIds, setReadIds] = useState(0);
  const [expandDesc,setExpandDesc]=useState(false)
  const [announceId,setAnnounceId]=useState("");
  const [userCurrentOrg, setUserCurrentOrg] = useState();
  const user_OrgData = useState(localStorage?.getItem("userOrgData")&&JSON.parse(localStorage?.getItem("userOrgData")))

  //to get Permissions for announcements
  // useEffect(() => {
  //   setAnnPermissions(
  //     permissions?.[0]?.find((item) => item.table == "announcement")
  //   );
  // }, []);

  useEffect(() => {
    dispatch(getTodayAnnouncements());
    dispatch(getOrganizations(organizationsdata))
    dispatch(getUserNotificatinos()).then((res) => {
      setUnreadIds(notificationList?.filter((item) => !item.read).length);
      setReadIds(notificationList?.filter((item) => item.read).length);
    });
    //userDetails && dispatch(getUserById(userDetails.id))
    let modalPop = userOrgList?.find((item) => item.org_id == current_organization);
    setUserCurrentOrg(modalPop);
    dispatch(getDesignations("")).then((res) => {
      let designation = res.payload?.find(
        (i) => i.id == userOrgDetails?.designation_id
      );
      designation && setDesignationDetails(designation);
    });
  }, [userOrgList, showNotification]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    dispatch(getPermissionsByRole(user_OrgData?.[0]?.role_id)).then((res)=>{
      setPermissions(res.payload)
      setAnnPermissions(res.payload?.find((item) => item.table == "announcement"));
    })
  }, []);

  useEffect(() => {
    if (innerWidth <= 768) dispatch(setToggleMenu(false));
    if (innerWidth > 768) dispatch(setToggleMenu(true));
  }, [innerWidth]);

  const handleResize = () => {
    setInnerWidth(window.innerWidth);
  };

  const toggle = () => {
    dispatch(setToggleMenu(!isOpen));
  };

  const changeOrganization = (id) => {
    dispatch(changeCurrentOrg(id)).then((res) => {
      navigate("/");
      window.location.reload();

      dispatch(getOrganizations(organizationsdata))
    });
  };

  const userLogout = (event) => {
    event.preventDefault();
    dispatch(logOut());
    navigate("/");
  };


  const updateNotifications = (e) => {
    e.preventDefault();
    // setUnreadIds(notificationList?.filter((item) => !item.read).length);
    setNotifications(!showNotification);
  };

  const closeCanvas = () => {
    var updateIds = [];
    notificationList?.map(item => {
      if (!item.read) {
        updateIds.push(item.id);
      }
    });
    setNotifications(!showNotification);
    dispatch(readNotifications(updateIds)).then((noti) => {
      dispatch(getUserNotificatinos()).then((res) => {
        setUnreadIds(res?.payload?.filter((item) => !item.read).length);
        setReadIds(res?.payload?.filter((item) => item.read).length);
      });
    });
  };

  const navigateToTaskDeatils=(id)=>{
    navigate(`/taskdetails/${id}`);
    setNotifications(false);
    closeCanvas();
  }

  const navigateAnnouncements=()=>{
    navigate("/announcements");
    setNotifications(false);
    closeCanvas();
  }
  // console.log("announcementsList", announcementsList)

  return (
    <div className="top-navbar">
      <Navbar className="nav-fix">
        <Container fluid>
          <Navbar.Brand>
            <div className="bars">
              <FaBars onClick={toggle} />
            </div>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse className="justify-content-end gap_1rm navbar_menu">
            {orgDetails?.billing_status == "WARNING" && (
              <div className="onHold_text">Your Account will Expire Soon</div>
            )}
            {orgDetails?.billing_status == "ONHOLD" && (
              <div className="onHold_text">Your Billing Status is ONHOLD</div>
            )}
            {/* {!userDetails?.is_email_valid && (
              <div className="verify-mail">
                <BiInfoCircle className="icon" />
                <span>
                  Please verify your mail to receive notifications in mail
                </span>
              </div>
            )} */}
            <button
              type="button"
              id="showNotification"
              variant="light"
              className="d_aic_jcc"
              onClick={(e) => updateNotifications(e)}
            >
              <BiBell className="icon" />
              {unreadIds > 0 && (
                <span className="notifi-indicator pulsate"></span>
              )}
              {/* <span className="notifi-indicator pulsate"></span> */}
            </button>

            <button
              type="button"
              id="showAnnouncements"
              variant="light"
              className={
                annPermissions?.view == false
                  ? "d_aic_jcc disabled-action"
                  : "d_aic_jcc"
              }
              onClick={() => setAnnouncements(!showAnnouncements)}
              disabled={annPermissions?.view == false}
            >
              <HiOutlineSpeakerphone className="icon" />
              {announcementsList?.length > 0 &&
                annPermissions?.view != false && (
                  <span className="notifi-indicator pulsate"></span>
                )}
            </button>

            <button
              type="button"
              id="showSwapOrg"
              title="Organization"
              className="d-flex align-items-center org-avatar"
              onClick={() => orgList?.length > 1 && setSwapOrg(!showSwapOrg)}
            >
              {orgDetails && (
                <Avatar
                  className="nav-avatar"
                  color="--br-danger"
                  initials={orgDetails.name.substring(0, 2).toUpperCase()}
                />
              )}
              {orgList?.length > 1 && <FaCaretDown />}
            </button>

            <div
              className="hprofile d_aic_jcFS"
              onClick={() => navigate("/profile-new")}
            >
              <div className="avatar d_aic_jcc tn">
                {userDetails?.avatar ? (
                  <img
                    src={userDetails?.avatar}
                    alt="user-img"
                    className="rounded-circle"
                  />
                ) : (
                  <div className="raise-icon">
                    {userDetails?.name?.charAt(0).toUpperCase() +
                      userDetails?.lastname?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="hpname d_aic_jcFS">
                <div className="title">
                  {userDetails?.name?.charAt(0).toUpperCase() +
                    userDetails?.name?.slice(1)}{" "}
                  {userDetails?.lastname?.charAt(0).toUpperCase() +
                    userDetails?.lastname?.slice(1)}{" "}
                </div>
                <span>{captialLetter(designationDetails?.name)}</span>
              </div>
            </div>

            {/* <a className="switcher-icon d_aic_jcc" title="Change Organization" onClick={() => orgList?.length > 1 && setSwapOrg(!showSwapOrg)}>
              <AiOutlineSetting className="gear_icon"/>
            </a>  */}

            {/* <Button variant="light" className="navbar-btn" onClick={() => setNotifications(!showNotification)}><FaBell /></Button> */}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Offcanvas
        className="Offcanvas_cust"
        show={showAnnouncements}
        onHide={() => setAnnouncements(!showAnnouncements)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Announcements</Offcanvas.Title>
        </Offcanvas.Header>
        <hr />
        <Offcanvas.Body>
          {announcementsList?.length > 0
            ? announcementsList?.map((item, key) => {
                return (
                  <div
                    key={key}
                    // onClick={() => {
                    //   navigate("/announcements");
                    //   setAnnouncements(!showAnnouncements);
                    // }}
                  >
                    {
                      <Card className=" announcemnts-cards mt-3 p-2">
                        {/* <div className="an-date">
                        <label>Date </label>
                        <p> &nbsp;{moment(item.start_date).format("ddd, MMM DD, YYYY, h:mm A")}</p>
                      </div> */}
                        <Card.Body className="d-flex align-items-center gap-2">
                          <div className="fs-1">{item.image}</div>
                          <div className="p-2 overflow-auto">
                            <h4 className="an-card-title">
                              {captialLetter(item?.title)}
                            </h4>
                            <h6 className="an-card-text mb-3">
                              <div
                                key={item.id}
                                className={
                                  item.description.length > 150 && !expandDesc
                                    ? "overFlowDesc"
                                    : item.id == announceId
                                    ? ""
                                    : item.description.length > 150 &&
                                      "overFlowDesc"
                                }
                              >
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: item.description,
                                  }}
                                />
                              </div>
                              {item.description.length > 150 &&
                              item.id != announceId ? (
                                <a
                                  className="mt-3 text-decoration-underline"
                                  onClick={() => {
                                    setExpandDesc(true);
                                    setAnnounceId(item.id);
                                  }}
                                >
                                  Read More..
                                </a>
                              ) : (
                                item.id == announceId &&
                                item.description.length > 150 &&
                                expandDesc && (
                                  <a
                                    className="mt-3 text-danger text-decoration-underline"
                                    onClick={() => {
                                      setExpandDesc(false);
                                      setAnnounceId("");
                                    }}
                                  >
                                    Read Less..
                                  </a>
                                )
                              )}
                            </h6>
                            <div className=" mt-2 change-password_refer an-post-by">
                              {orgDetails && (
                                <Avatar
                                  className="nav-avatar"
                                  color="--br-danger"
                                  initials={orgDetails.name
                                    .substring(0, 2)
                                    .toUpperCase()}
                                />
                              )}{" "}
                              {/* <img
                              className="d-flex align-items-center justify-content-center text-center"
                              src={birthdayicon}
                            /> */}
                              &nbsp;
                              <h5>
                                <span>post by</span>
                                {item.user.name} {item.user.lastname}
                              </h5>{" "}
                              &nbsp;
                            </div>
                          </div>
                        </Card.Body>
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <p style={{ "font-size": "12px" }}>
                              <span className="me-1">
                                <TbCalendarStats style={{ color: "green" }} />
                              </span>
                              {moment(item.start_date).format(
                                "ddd, MMM DD, YYYY, h:mm A"
                              )}
                            </p>
                          </div>
                          <div>
                            <p style={{ "font-size": "12px" }}>
                              <span className="me-1">
                                <TbCalendarStats style={{ color: "red" }} />
                              </span>
                              {moment(item.end_date).format(
                                "ddd, MMM DD, YYYY, h:mm A"
                              )}
                            </p>
                          </div>
                        </div>
                      </Card>
                    }
                  </div>
                );
              })
            : "No Announcements Found"}
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas
        className="Offcanvas_cust"
        show={showSwapOrg}
        onHide={() => setSwapOrg(!showSwapOrg)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Organizations</Offcanvas.Title>
        </Offcanvas.Header>
        <hr />
        <Offcanvas.Body>
          <Container>
            <div className="row">
              <div className="col-12 p-0">
                <div className="org-checkbox-container">
                  {orgList?.length > 0 &&
                    orgList?.map((org, key) => {
                      return (
                        <div className="row" key={key}>
                          {org.is_active && (
                            <div className="col-12">
                              <div className="checkbox ml-0 p-0">
                                <label className="checkbox-wrapper mt-2">
                                  <input
                                    onChange={() => changeOrganization(org.id)}
                                    type="checkbox"
                                    className="checkbox-input"
                                    checked={current_organization == org.id}
                                    name="current_organization"
                                  />
                                  <span className="checkbox-tile">
                                    <div className="org-list">
                                      <div className="alias-img">
                                        <Avatar
                                          size="medium"
                                          color={
                                            avatarBrColors[
                                              Math.floor(
                                                Math.random() *
                                                  avatarBrColors.length
                                              )
                                            ]
                                          }
                                          initials={org.name
                                            .substring(0, 2)
                                            .toUpperCase()}
                                        />
                                        {/* <Avatar
                                                        color={item.color}
                                                        initials={`${item.name.substring(0, 2).toUpperCase()}`} /> */}
                                      </div>
                                      <div className="alias-content">
                                        <h6 className="m-0">{org.name}</h6>
                                      </div>
                                    </div>

                                    {/* <Avatar color={avatarBrColors[Math.floor(Math.random() * avatarBrColors.length)]}
                              initials={org.name.substring(0, 2).toUpperCase()} /> */}
                                  </span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </Container>
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas
        className="Offcanvas_cust"
        show={showNotification}
        onHide={() => closeCanvas()}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Notifications</Offcanvas.Title>
        </Offcanvas.Header>
        <hr />
        <Offcanvas.Body>
          <Tabs
            defaultActiveKey="new"
            id="fill-tab-example"
            className="mb-3 notification"
            fill
          >
            <Tab eventKey="new" title={`New (${unreadIds})`}>
              <div className="row">
                {notificationList?.length > 0 ? (
                  notificationList?.map((item, key) => {
                    return (
                      !item.read && (
                        <div
                          className="col-md-12 mb-2"
                          key={key}
                          onClick={() => item.type=="announcements"?navigateAnnouncements():item.type=="task"?navigateToTaskDeatils(item.target_id):""}
                        >
                          <Card>
                            <Card.Body>
                              <p className="mb-1">{item.message}</p>
                              <p>{moment(item.created_at).format("LLL")}</p>
                            </Card.Body>
                          </Card>
                        </div>
                      )
                    );
                  })
                ) : (
                  <div className="col-md-12 mb-2"> No Notifications</div>
                )}
              </div>
            </Tab>
            <Tab eventKey="cleared" title={`Cleared (${readIds})`}>
              {notificationList?.length > 0 ? (
                notificationList?.map((item, key) => {
                  return (
                    item.read && (
                      <div
                        className="col-md-12 mb-2"
                        key={key}
                        onClick={() => item.type=="announcements"?navigateAnnouncements():item.type=="task"?navigateToTaskDeatils(item.target_id):""}
                      >
                        <Card>
                          <Card.Body>
                            <span
                              dangerouslySetInnerHTML={{ __html: item.message }}
                            />
                            <Card.Text className="nc-date">
                              {moment(item.created_at).format(
                                "ddd, MMM DD, YYYY, h:mm A"
                              )}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </div>
                    )
                  );
                })
              ) : (
                <div className="col-md-12 mb-2"> No Notifications</div>
              )}
            </Tab>
          </Tabs>
        </Offcanvas.Body>
      </Offcanvas>

      {orgDetails && orgDetails?.is_delete ? (
        <Modal show={true} backdrop="static" keyboard={false} centered>
          <Modal.Header>
            <Modal.Title>Session Expired</Modal.Title>
          </Modal.Header>
          <Modal.Body>Your Session has been Expired</Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={(e) => userLogout(e)}>
              Logout
            </Button>
          </Modal.Footer>
        </Modal>
      ) : (
        <></>
      )}

      {(orgDetails && !orgDetails?.is_active) ||
      orgDetails?.billing_status == "ONHOLD" ? (
        <Modal show={true} backdrop="static" keyboard={false} centered>
          <Modal.Header>
            <Modal.Title>Session Expired</Modal.Title>
          </Modal.Header>
          <Modal.Body>Your Billing Status is overdue !</Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={(e) => userLogout(e)}>
              Logout
            </Button>
          </Modal.Footer>
        </Modal>
      ) : (
        <></>
      )}

      {/* {(!userCurrentOrg?.is_active && userCurrentOrg?.role_id != 1) ? (
        <Modal show={true} backdrop="static" keyboard={false} centered>
          <Modal.Header>

          </Modal.Header>
          <Modal.Body>You are disabled by your Admin !</Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={(e) => userLogout(e)}>
              Logout
            </Button>
          </Modal.Footer>
        </Modal>
      ) : (
        <></>
      )} */}

    
      {/*<Modal show={userCurrentOrg?.is_delete && userCurrentOrg?.role_id != 1} backdrop="static" keyboard={false} centered>
        <Modal.Header>
          {/* <Modal.Title>Session Expired</Modal.Title> 
        </Modal.Header>
        <Modal.Body>You are removed by your Admin !</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={(e) => userLogout(e)}>
            Logout
          </Button>
        </Modal.Footer>
    </Modal>*/}

      <Modal show={showExpired} backdrop="static" keyboard={false} centered>
        <Modal.Header>
          {/* <Modal.Title>Session Expired</Modal.Title> */}
        </Modal.Header>
        <Modal.Body>Session Expired... !</Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={(e) => {
              userLogout(e);
              dispatch(setShowExpired(false));
            }}
          >
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Header;
