import { NavLink } from "react-router-dom";
import { MdMessage, MdTaskAlt, MdOutlineDashboard, MdOutlineNotificationsNone } from "react-icons/md";
import { BiTask, BiAnalyse, BiSearch, BiCog, BiHelpCircle } from "react-icons/bi";
import { TbLogout } from "react-icons/tb";
import { FaBars, FaBell, FaTasks, FaRegUser, FaUserShield } from "react-icons/fa";
import { TfiLoop, TfiAnnouncement } from "react-icons/tfi";
import { CgList } from "react-icons/cg";
import { AiOutlineClose } from 'react-icons/ai';
import { useDispatch, useSelector } from "react-redux";
import { getUserOrgByid, logOut,versionCheck } from '../../redux/reducers/authReducer';
import { useNavigate } from "react-router-dom";
import { FaFirstdraft } from "react-icons/fa";
import { MdApproval,MdUpcoming } from "react-icons/md";

import { AnimatePresence, motion } from "framer-motion";
import SidebarMenu from "./SidebarMenu";
import logo from "../../assets/CyecomShort.png";
import logoLg from "../../assets/CyecomLg.png";
import { changeCurrentOrg, setToggleMenu } from '../../redux/reducers/authReducer';
import Tooltip from 'react-bootstrap/Tooltip';
import {fcmUpdate} from '../../redux/reducers/userReducer'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { useEffect } from "react";
import { getMasterPermissionsByRole, getPermissionsByRole, getRoles } from '../../redux/reducers/rolesReducer'
import { useState } from "react";
import packageJson from "../../../package.json"


const SideBar = ({ children }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isOpen = useSelector((state) => state.auth.toggleSideMenu);
  const userDetails=useSelector((state) => state.auth.userDetails);
  const userOrgData=useSelector((state) => state.auth.userOrgDetails);
  const toggle = () => dispatch(setToggleMenu(!isOpen))
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orgList = useSelector((state) => state.organization.organizationsList)
  const current_organization = useSelector((state) => state.auth.current_organization)
  const [masterPermisson, setMasterPermission] = useState(false)
  // const userOrgData = localStorage.getItem('userOrgData')?JSON.parse(localStorage.getItem('userOrgData')):null
  // const userOrgDat = useState(localStorage.getItem("userOrgData")?JSON.parse(localStorage.getItem("userOrgData")):null);
  const userOrgDat = useSelector((state) => state.auth.userOrgDetails);
  const userData=useSelector((state) => state.auth.userDetails);
  // const userData = useState(localStorage.getItem("userData")?JSON.parse(localStorage.getItem("userData")):null);
  // const userDetails = useSelector((state) => state.auth.userDetails)
  const accessToken=useState(localStorage.getItem("token"))
  
  
  
  const userLogout = (event) => {
    dispatch(logOut())
    navigate('/')
  }

  useEffect(()=>{
    if(!userOrgDat||!userData||!accessToken){
      console.log("userOrgDat",userOrgDat)
      console.log("userOrgDat",userOrgDat)
      console.log("accessToken",accessToken)
      // userLogout()
    }
  },[userOrgDat,userData,accessToken])

  const showAnimation = {
    hidden: {
      width: 0,
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    },
    show: {
      opacity: 1,
      width: "auto",
      transition: {
        duration: 0.5,
      },
    },
  };

  const routes = [
    {
      path: "/",
      name: "Dashboard",
      icon: <MdOutlineDashboard />
    },

    {
      path: "/file-manager",
      name: "Tasks",
      icon: <FaTasks />,

      subRoutes: [
        {
          path: "/taskslist",
          name: "All ",
          icon: <CgList />,
        },
        {
          path: "/recurringtasklist",
          name: "Recurring",
          icon: <TfiLoop />,
        },
        {
          path: "/drafttasks",
          name: "Draft Tasks",
          icon: <FaFirstdraft />,
        },

        {
          path: "/myapprovals",
          name: "My Approvals",
          icon: <MdApproval />,
        },
        {
          path: "/upcomingtasks",
          name: "UpComing",
          icon: <MdUpcoming />,
        },
        {
          path: "/createdby",
          name: "Created Tasks",
          icon: <FaFirstdraft />,
        },
      ],
    },
    {
      path: "/personaltodo",
      name: "Personal Todo",
      icon: <MdTaskAlt />
    },
    {
      path: "/announcements",
      name: "Announcements",
      icon: <TfiAnnouncement />
    },
    {
      path: "/help",
      name: "Help",
      icon: <BiHelpCircle />
    },
    {
      path: "/profile",
      name: "Profile",
      icon: <FaRegUser />
    },
    {
      path: "/master",
      name: "Master",
      icon: <FaUserShield />
    },
  ]

  useEffect(() => {
    dispatch(getRoles("")).then((res) => {
      let role = res?.payload?.find((item) => item.id == userOrgData?.role_id)
      localStorage.setItem('role', role?.name)
      setMasterPermission(true)
      // if (role?.name === 'owner' || role?.name === 'admin') {
      //   setMasterPermission(true)
      // }
    })

    let newToken = localStorage.getItem('fcmToken')
    let fcmBody ={
      user_id : userDetails?.id,
      device_type : 'web',
      fcm_token : newToken
    }
    dispatch(fcmUpdate(fcmBody))

  }, [routes,userOrgData])

// Window resize below 425px to append the class to the main-container class
useEffect(() => {
  dispatch(getMasterPermissionsByRole(userOrgDat?.[0]?.role_id))
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  window.addEventListener('resize', handleResize);

  return () => window.removeEventListener('resize', handleResize);
}, []);

const getUserPermissions=()=>{
  dispatch(getUserOrgByid(userData?.[0].id));
    dispatch(getMasterPermissionsByRole(userOrgDat?.[0]?.role_id))
}
// useEffect(() => {
//   dispatch(versionCheck(packageJson.version)).then((res) => {
//     if(!res.payload.status) {
//       window.location.reload();
//     }
//   })
// },[])

  return (
    <div className={windowWidth <= 426 ? "main-container resizemain-container" : "main-container"}
    >
      <motion.div
        animate={{
          width: isOpen ? "235px" : "64px",
          transition: {
            duration: 0.5,
            type: "spring",
            damping: 10,
          },
        }}
        className={isOpen ?'sidebar-0':"sidebar"}
      >
        <div className="testing-sidebar">
        <div class="mobile-nav__close"> <AiOutlineClose onClick={toggle}/> </div>
        <div className="top_section">
          {isOpen ?
            <div className="logo-lg" onClick={() => navigate('/')}><img className="img-fluid" src={logoLg} /></div> :
            <div className="logo_img" onClick={() => navigate('/')}><img className="img-fluid" src={logo} /></div>}
        </div>

        <section className="routes">
          {/* {routes.slice(0, routes.lenth -1)} */}
          {routes.slice(0, routes.length - 1)?.map((route,index) => {
            if (route.subRoutes) {
              return (
                <SidebarMenu
                  key={index}
                  setIsOpen={() => dispatch(setToggleMenu(true))}
                  route={route}
                  showAnimation={showAnimation}
                  isOpen={isOpen}
                />
              );
            }

            return (
                <NavLink
                  to={route.path}
                  key={index}
                  className="link"
                  activeclassname="side-active"
                >
                  <div className="icon_svg">{route.icon}</div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        variants={showAnimation}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className="link_text"
                      >
                        {route.name}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </NavLink>
            );
          })}

          {
            masterPermisson && <NavLink
              to={routes[routes.length - 1].path}
              className="link"
              activeclassname="side-active"
              onClick={getUserPermissions}
            >
              <div className="icon_svg">{routes[routes.length - 1].icon}</div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    variants={showAnimation}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    className="link_text"
                  >
                    {routes[routes.length - 1].name}
                  </motion.div>
                )}
              </AnimatePresence>
            </NavLink>
          }

          <div className="slidebottom-nav d-flex align-items-center justify-content-start" onClick={userLogout}>
            <div className="icon_svg">
              <TbLogout />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  variants={showAnimation}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="link_text"
                >Logout
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
        </div>

      </motion.div>

      <main>
        {children}
      </main>
    </div>
  );
};

export default SideBar;
