import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaNetworkWired,
  FaMapMarkerAlt,
  FaUserAlt,
  FaUnlock,
  FaUsers,
  FaUserTie,
  FaRegBuilding,
  FaRegIdBadge,
  FaRegUser,
  FaBuilding,
  FaGift,
  FaChartBar,
} from "react-icons/fa";
import { Row, Col, NavLink } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { SiGoogledomains } from "react-icons/si";
import { MdNotificationsActive } from "react-icons/md";
import { getMasterPermissionsByRole, getPermissionsByRole } from "../redux/reducers/rolesReducer";
import profile from "../assets/profile.jpg";
import { useSelector, useDispatch } from "react-redux";
import { FiLoader, FiCheckCircle } from "react-icons/fi";
import Form from "react-bootstrap/Form";
import { MdPriorityHigh } from "react-icons/md";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { useEffect, useState } from "react";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import captialLetter from "../modules/CaptialLetter";
import { Route, Routes, Link, BrowserRouter as Router } from "react-router-dom";
import Organizations from "../pages/Organizations";
import Popover from "react-bootstrap/Popover";
import LoaderComponent from "../components/Loader";
const Master = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.auth.userDetails);
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const [openNewTab, setOpenNewTab] = useState(false);
  const userOrgData = useState(localStorage.getItem("userOrgData")&&JSON.parse(localStorage.getItem("userOrgData")));
  // const [permissions, setPermissions] = useState();
  // const [orgPermissions, setOrgPermissions] = useState();
  // const [locPermissions, setLocPermissions] = useState();
  // const [depPermissions, setDepPermissions] = useState();
  // const [designationPermissions, setDesignationPermissions] = useState();
  // const [usersPermissions, setUsersPermissions] = useState();
   // const [teamsPermissions, setTeamsPermissions] = useState();
  const depPermissions=useSelector((state)=>state.roles.departmentPermissions);
  const locPermissions=useSelector((state)=>state.roles.locPermissions);
  const designationPermissions=useSelector((state)=>state.roles.designationPermissions);
  const usersPermissions=useSelector((state)=>state.roles.userPermissions);
  const teamsPermissions=useSelector((state)=>state.roles.teamsPermssions);
  const orgPermissions=useSelector((state)=>state.roles.orgPermissions);

  useEffect(() => {
    // dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
    dispatch(getMasterPermissionsByRole(userOrgData[0]?.role_id))
    // .then((res) => {
    //   setPermissions(res.payload);
    // });
  }, []);

  //to Set Persmissions for each card
  // useEffect(() => {
  //   let permission = permissions?.[0];
  //   setOrgPermissions(
  //     permissions?.find((item) => item.table == "organization")
  //   );
  //   setLocPermissions(permissions?.find((item) => item.table == "locations"));
  //   setDepPermissions(permissions?.find((item) => item.table == "departments"));
  //   setDesignationPermissions(
  //     permissions?.find((item) => item.table == "designations")
  //   );
  //   setUsersPermissions(permissions?.find((item) => item.table == "users"));
  //   setTeamsPermissions(permissions?.find((item) => item.table == "groups"));
  // }, [permissions]);

  // const popover = (
  //   <Popover id="popover-basic" className="filters-popover p-3 access-popover">
  //     <Popover.Header as="h3" className="filters-popover-header">
  //       Access Denied !
  //     </Popover.Header>
  //     <Popover.Body className="assignes-card-body">
  //       Please contact your Admin.
  //     </Popover.Body>
  //   </Popover>
  // );

  return (
    <section className="settings-card-section">
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col-xl-10 col-lg-12 col-md-12 text-center">
            <div className="savatar-card">
              <div className="savatar-card-image tn">
                {userDetails.avatar != undefined || null ? (
                  <img
                    src={userDetails.avatar}
                    alt="user-img"
                    className="rounded-circle"
                  />
                ) : (
                  <div className=" raise-icon first-letters">
                    {userDetails?.name?.charAt(0).toUpperCase() +
                      userDetails.lastname?.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* <img src={userDetails?.avatar?userDetails.avatar:profile} /> */}
              </div>
              {/* <h3>{userDetails?.name.charAt(0).toUpperCase() + userDetails?.name.slice(1) } {userDetails.lastname}</h3> */}
              <h3>
                {captialLetter(userDetails?.name)}{" "}
                {captialLetter(userDetails?.lastname)}
              </h3>
              {(userOrgData?.[0]?.role_id == 1 ||
                userOrgData?.[0]?.role_id == 2) && (
                <p>
                  Hey you can Manage your <b>Organization</b> over here...!{" "}
                </p>
              )}
            </div>
          </div>
          {!teamsPermissions?<LoaderComponent/>:
          <div className="col-xl-10 col-lg-12 col-md-12">
            <div className="setting_card">
              {userOrgData?.[0]?.role_id == 1 && (<></>  )}
                {/* //   <OverlayTrigger
                //   rootClose
                //   trigger="click"
                //   placement="top"
                //   overlay={orgPermissions?.view ? <></> : popover}
                // > */}
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 100, hide: 400 }}
                  overlay={
                    orgPermissions?.view ? (
                      <></>
                    ) : (
                      <Tooltip>Access denied</Tooltip>
                    )
                  }
                >
                  <a
                    href={
                      openNewTab && (userOrgData?.[0]?.role_id == 1 ||
                        userOrgData?.[0]?.role_id == 2)
                        ? "/master/organizations"
                        : "javascript:void(0)"
                    }
                    onContextMenu={() => setOpenNewTab(true)}
                    onClick={
                      (userOrgData?.[0]?.role_id == 1 ||
                        userOrgData?.[0]?.role_id == 2)
                        ? () => navigate("/master/organizations")
                        : () => null
                    }
                    className={!(userOrgData?.[0]?.role_id == 1 ||
                      userOrgData?.[0]?.role_id == 2) ? "disabled-card" : ""}
                  >
                    <div className="icon">
                      <FaRegBuilding />
                    </div>
                    <h6>
                      <span>Organizations</span>
                    </h6>
                  </a>
                </OverlayTrigger>
            
              {/* </OverlayTrigger> */}

              {/* <OverlayTrigger
                rootClose
                trigger="click"
                placement="top"
                overlay={locPermissions?.view ? <></> : popover}
              > */}
              <OverlayTrigger
                placement="top"
                delay={{ show: 100, hide: 400 }}
                overlay={
                  locPermissions?.view ? (
                    <></>
                  ) : (
                    <Tooltip>Access denied</Tooltip>
                  )
                }
              >
                <a
                  href={
                    openNewTab && locPermissions?.view
                      ? "/master/locations"
                      : "javascript:void(0)"
                  }
                  onContextMenu={() => setOpenNewTab(true)}
                  onClick={
                    locPermissions?.view
                      ? () => navigate("/master/locations")
                      : null
                  }
                  className={!locPermissions?.view ? "disabled-card" : ""}
                >
                  <div className="icon">
                    <FaMapMarkerAlt />
                  </div>
                  <h6>
                    <span>Locations</span>
                  </h6>
                </a>
              </OverlayTrigger>
              {/* <OverlayTrigger
                rootClose
                trigger="click"
                placement="top"
                overlay={depPermissions?.view ? <></> : popover}
              > */}
              <OverlayTrigger
                placement="top"
                delay={{ show: 100, hide: 400 }}
                overlay={
                  depPermissions?.view ? (
                    <></>
                  ) : (
                    <Tooltip>Access denied</Tooltip>
                  )
                }
              >
                <a
                  href={
                    openNewTab && depPermissions?.view
                      ? "/master/departments"
                      : "javascript:void(0)"
                  }
                  onContextMenu={() => setOpenNewTab(true)}
                  onClick={
                    depPermissions?.view
                      ? () => navigate("/master/departments")
                      : null
                  }
                  className={!depPermissions?.view ? "disabled-card" : ""}
                >
                  <div className="icon">
                    <FaNetworkWired />
                  </div>
                  <h6>
                    <span>Departments</span>
                  </h6>
                </a>
              </OverlayTrigger>
              {/* <OverlayTrigger
                rootClose
                trigger="click"
                placement="top"
                overlay={designationPermissions?.view ? <></> : popover}
              > */}
              <OverlayTrigger
                placement="top"
                delay={{ show: 100, hide: 400 }}
                overlay={
                  designationPermissions?.view ? (
                    <></>
                  ) : (
                    <Tooltip>Access denied</Tooltip>
                  )
                }
              >
                <a
                  href={
                    openNewTab && designationPermissions?.view
                      ? "/master/designations"
                      : "javascript:void(0)"
                  }
                  onContextMenu={() => setOpenNewTab(true)}
                  onClick={
                    designationPermissions?.view
                      ? () => navigate("/master/designations")
                      : null
                  }
                  className={
                    !designationPermissions?.view ? "disabled-card" : ""
                  }
                >
                  <div className="icon">
                    <FaRegIdBadge />
                  </div>
                  <h6>
                    <span>Designations</span>
                  </h6>
                </a>
              </OverlayTrigger>

              {/* <OverlayTrigger
                rootClose
                trigger="click"
                placement="top"
                overlay={usersPermissions?.view ? <></> : popover}
              > */}
              <OverlayTrigger
                placement="top"
                delay={{ show: 100, hide: 400 }}
                overlay={
                  usersPermissions?.view ? (
                    <></>
                  ) : (
                    <Tooltip>Access denied</Tooltip>
                  )
                }
              >
                <a
                  href={
                    openNewTab && usersPermissions?.view
                      ? "/master/users"
                      : "javascript:void(0)"
                  }
                  onContextMenu={() => setOpenNewTab(true)}
                  onClick={
                    usersPermissions?.view
                      ? () => navigate("/master/users")
                      : null
                  }
                  className={!usersPermissions?.view ? "disabled-card" : ""}
                >
                  <div className="icon">
                    <FaRegUser />
                  </div>
                  <h6>
                    <span>Users</span>
                  </h6>
                </a>
              </OverlayTrigger>
              {/* <OverlayTrigger
                rootClose
                trigger="click"
                placement="top"
                overlay={teamsPermissions?.view ? <></> : popover}
              > */}
              <OverlayTrigger
                placement="top"
                delay={{ show: 100, hide: 400 }}
                overlay={
                  teamsPermissions?.view ? (
                    <></>
                  ) : (
                    <Tooltip>Access denied</Tooltip>
                  )
                }
              >
                <a
                  href={
                    openNewTab && teamsPermissions?.view
                      ? "/master/teams"
                      : "javascript:void(0)"
                  }
                  onContextMenu={() => setOpenNewTab(true)}
                  onClick={
                    teamsPermissions?.view
                      ? () => navigate("/master/teams")
                      : null
                  }
                  className={!teamsPermissions?.view ? "disabled-card" : ""}
                >
                  <div className="icon">
                    <FaUsers />
                  </div>
                  <h6>
                    <span>Teams</span>
                  </h6>
                </a>
              </OverlayTrigger>
             
              <OverlayTrigger
                placement="top"
                delay={{ show: 100, hide: 400 }}
                overlay={
                  (userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)? (<></>) : (
                    <Tooltip>Access denied</Tooltip>
                  )
                }
              >
                <a
                  href={openNewTab && (userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)? "/master/priority" : "javascript:void(0)"}
                  onContextMenu={ (userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)?() => setOpenNewTab(true):null}
                  onClick={(userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)?() => navigate("/master/priority"):null}
                  className={!(userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)?"disabled-card" : ""}
                >
                  <div className="icon">
                    <MdPriorityHigh />
                  </div>
                  <h6>
                    <span>Priority</span>
                  </h6>
                </a>
            </OverlayTrigger>

              <OverlayTrigger
                placement="top"
                delay={{ show: 100, hide: 400 }}
                overlay={
                  (userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)? (<></>) : (
                    <Tooltip>Access denied</Tooltip>
                  )
                }
              >
                <a
                  href={openNewTab&& (userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2) ? "/master/status" : "javascript:void(0)"}
                  onContextMenu={ (userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)?() => setOpenNewTab(true):null}
                  onClick={ (userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)?() => navigate("/master/status"):null}
                  className={!(userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)?"disabled-card" : ""}
                >
                  <div className="icon">
                    <FiLoader />
                  </div>
                  <h6>
                    <span>Status</span>
                  </h6>
                </a>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                delay={{ show: 100, hide: 400 }}
                overlay={
                  (userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)? (<></>) : (
                    <Tooltip>Access denied</Tooltip>
                  )
                }
              >
                <a
                  href={openNewTab &&(userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)? "/master/roles" : "javascript:void(0)"}
                  onContextMenu={(userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)?() => setOpenNewTab(true):null}
                  onClick={(userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)?() => navigate("/master/roles"):null}
                  className={!(userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)?"disabled-card" : ""}
                >
                  <div className="icon">
                    <SiGoogledomains />
                  </div>
                  <h6>
                    <span>Roles</span>
                  </h6>
                </a>
                </OverlayTrigger>
             
             <OverlayTrigger
                placement="top"
                delay={{ show: 100, hide: 400 }}
                overlay={
                  (userOrgData?.[0]?.role_id == 1 ||
                    userOrgData?.[0]?.role_id == 2)? (
                    <></>
                  ) : (
                    <Tooltip>Access denied</Tooltip>
                  )
                }
              >
                <a
                  href={openNewTab ? "/master/approvals" : "javascript:void(0)"}
                  onContextMenu={(userOrgData?.[0]?.role_id == 1 ||
                    userOrgData?.[0]?.role_id == 2)?() => setOpenNewTab(true):null}
                  onClick={(userOrgData?.[0]?.role_id == 1 ||
                    userOrgData?.[0]?.role_id == 2)?() => navigate("/master/approvals"):null}
                  className={!(userOrgData?.[0]?.role_id == 1 ||
                      userOrgData?.[0]?.role_id == 2)?"disabled-card" : ""}
                >
                  <div className="icon">
                    <FiCheckCircle />
                  </div>
                  <h6>
                    <span>Approvals</span>
                    {/* Approvals */}
                  </h6>
                </a>
          </OverlayTrigger>


         <OverlayTrigger
                placement="top"
                delay={{ show: 100, hide: 400 }}
                overlay={
                  (userOrgData?.[0]?.role_id == 1 ||
                    userOrgData?.[0]?.role_id == 2)? (
                    <></>
                  ) : (
                    <Tooltip>Access denied</Tooltip>
                  )
                }
              >
              <a
                href={openNewTab ? "/master/reminder" : "javascript:void(0)"}
                onContextMenu={() => setOpenNewTab(true)}
                onClick={(userOrgData?.[0]?.role_id == 1 ||
                  userOrgData?.[0]?.role_id == 2)?() => navigate("/master/reminder"):null}
                className={!(userOrgData?.[0]?.role_id == 1 ||
                  userOrgData?.[0]?.role_id == 2)?"disabled-card" : ""}
               >
                <div className="icon">
                  <MdNotificationsActive />
                </div>
                <h6>
                  <span>Reminders</span>
                  {/* Approvals */}
                </h6>
              </a>
              </OverlayTrigger>
              {/* <OverlayTrigger
                rootClose
                trigger="click"
                placement="top"
                overlay={depPermissions?.view ? <></> : popover}
              > */}
              <OverlayTrigger
               placement="top"
                delay={{ show: 100, hide: 400 }}
                overlay={
                  depPermissions?.view ? (
                    <></>
                  ) : (
                    <Tooltip>Access denied</Tooltip>
                  )
                }>
                <a
                  href={
                     openNewTab && (userOrgData?.[0]?.role_id == 1 ||
                      userOrgData?.[0]?.role_id == 2)
                      ? "/master/rewards"
                      : "javascript:void(0)"
                  }
                  onContextMenu={(userOrgData?.[0]?.role_id == 1 ||
                    userOrgData?.[0]?.role_id == 2)?() => setOpenNewTab(true):null}
                   onClick={(userOrgData?.[0]?.role_id == 1 ||
                    userOrgData?.[0]?.role_id == 2)?() => navigate("/master/rewards"):null}
                  className={!(userOrgData?.[0]?.role_id == 1 ||
                    userOrgData?.[0]?.role_id == 2)? "disabled-card" : ""}
                >
                  <div className="icon">
                    <FaGift />
                  </div>
                  <h6>
                    <span>Rewards</span>
                  </h6>
                </a>
              </OverlayTrigger>
            

            
                  <a
                    href={
                      openNewTab ? "/master/reports": "javascript:void(0)"
                    }
                    onContextMenu={() => setOpenNewTab(true)}
                    onClick={() => navigate("/master/reports")}
                  >
                    <div className="icon">
                      <FaChartBar />
                    </div>
                    <h6>
                      <span>Reports</span>
                    </h6>
                  </a>
            </div>
          </div>}
        </div>
      </div>
    </section>
  );
};

export default Master;
