import {
  Badge,
  Col,
  Card,
  Row,
  Dropdown,
  Button,
  Spinner,
  Modal,
  Form,
  OverlayTrigger,
  Offcanvas,
  Pagination,
  Tooltip,DropdownButton
} from "react-bootstrap";
import { AiOutlineCheck } from "react-icons/ai";
import { toast } from "react-toastify";
import { useState, useEffect,useRef,useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLocations } from "../redux/reducers/locationsReducer";
import { getDepartments } from "../redux/reducers/departmentReducer";
import { getRoles } from "../redux/reducers/rolesReducer";
import { getDesignations } from "../redux/reducers/designationReducers";
import { baseUrl, avatarBrColors } from "../environment";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserById, getUserOrgByid } from "../redux/reducers/authReducer";
import ReactSwitch from "react-switch";
import {
  getUsers,
  getAllUsers,
  setExistUser,
  setUserAddform,
  setUserButtonLoading,
  createUser,
  setUserUpdateForm,
  getOrgUsers,
  updateUser,
  deleteUser,
  usersCsvUpload,
  setShowPasswordDialog,
  setSelectedOrgUser,
  setSelectedUser,
  userExistCheck,
  deleteParentUserCheck,
  setDataLoader,
  verifyMailonUpdate
} from "../redux/reducers/userReducer";
import {
  FaCloudUploadAlt,
  FaCloudDownloadAlt,
  FaEllipsisV,
  FaEdit,
  FaRegCopy,
  FaSearch,
  FaTrashAlt,
  FaUserTie,
  FaUserCog,
  FaArrowLeft,
} from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { GoDeviceMobile } from "react-icons/go";
import { BiX, BiLockAlt } from "react-icons/bi";
import { TbHierarchy2, TbListDetails } from "react-icons/tb";
import LoaderComponent from "../components/Loader";
import UsersTree from "./UsersTree";
import CryptoJS from "crypto-js";
import NoDataFound from "../assets/No_Data_File.png";
import UserIcon from "../assets/user-icon.png";
import profile from "../assets/profile.jpg";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getPermissionsByRole} from '../redux/reducers/rolesReducer'

function Users() {
  const dispatch = useDispatch();
  const [validated, setValidated] = useState(false);
  const [filterSearch, setFilter] = useState({
    name: "",
    offset: 0,
    limit: 20,
  });
  const orgId = useSelector((state) => state.auth.current_organization);
  const totalNoOfUsers = useSelector((state) => state.users.totalUsers);
  const createcheckUser = useSelector((state) => state.users.checkexistuser);
  const usersList = useSelector((state) => state.users.usersList);
  const [allUsers,setAllUsers]=useState([]);
  const [hasMore,setHasMore]=useState(false);
  const [emailVerification,setEmailVerification]=useState(false);
  // console.log("AllUsers", allUsers);
  const addUserForm = useSelector((state) => state.users.showAddForm);
  const locationsList = useSelector((state) => state.location.locationsList);
  const departmentsList = useSelector(
    (state) => state.department.departmentsList
  );

  const rolesList = useSelector((state) => state.roles.rolesList);
  const designationList = useSelector(
    (state) => state.designation.designationList
  );

  const updateUserForm = useSelector((state) => state.users.showUpdateForm);
  const [showUpload, setShowUploadModel] = useState(false);
  const loading = useSelector((state) => state.users.buttonLoading);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const [userCreateData, setCreateData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    login_type: "",
    password: "",
    color: avatarBrColors[Math.floor(Math.random() * avatarBrColors.length)],
    created_by: userDetails.id,
  });

  const [userOrgData, setUserOrgData] = useState({
    location_id: 0,
    department_id: 0,
    role_id: 0,
    reporting_manager: 0,
    designation_id: 0,
    org_id: parseInt(orgId),
  });

  const user_OrgData = useState(JSON.parse(localStorage.getItem("userOrgData")));
  const [showError, setShowError] = useState(false);
  const selectedOrgUser = useSelector((state) => state.users.selectedOrgUser);
  // console.log("selectedUser",selectedOrgUser)
  const selectedUser = useSelector((state) => state.users.selectedUser);
  const orgUsersList = useSelector((state) => state.users.orgUsersList);
  const token = useSelector((state) => state.auth.accessToken);
  const [showDeleteDialog, setDialog] = useState(false);
  const bulkDownloadUrl = `${baseUrl}download/users/${orgId}?token=${token}`;
  const [pageNumber, setPageNumber] = useState(1)

  const showPasswordDialog = useSelector(
    (state) => state.users.showPasswordDialog
  );

  const [password, setPassword] = useState("");
  const [isUserCopied, setUserCopied] = useState(false);
  const [isPasswordCopied, setPasswordCopied] = useState(false);
  const [uploadBody, setUploadBody] = useState({
    file: undefined,
    email: "",
  });

  const [noOfPages, setNoOfPages] = useState();
  const [pages, setPages] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(10);
  const [showTree, setShowTree] = useState(false);
  const [updateUserData, setUpdateUser] = useState();
  const [updateUserOrg, setUpdateUserOrg] = useState();
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
  const userData = useState(JSON.parse(localStorage.getItem("userData")));
  const [permissions,setPermissions] = useState();
  // const permissions = useState(JSON.parse(localStorage.getItem("permissions")));
  const [userPermissions, setUserPermissions] = useState();
  const [initialLoader,setInitialLoader]=useState(true);
  const [loader,setLoader]=useState(true);
  const [inifinityLoader,setInifinityLoader]=useState(false);
  const navigate = useNavigate();
  const [oldMail, setOldMail] = useState();
  // const [pageNumber,setPageNumber]=useState('')

  //to get Permissions for announcements
  useEffect(() => {
    dispatch(getPermissionsByRole(user_OrgData[0]?.role_id)).then((res)=>{
      setPermissions(res.payload)
      setUserPermissions(res.payload?.find((item) => item.table == "users"));
    })
  }, []);

  //to invoke Sweet Alert
  useEffect(() => {
    if (userPermissions?.view == false) {
      opensweetalert();
    }
  }, [userPermissions]);

  const opensweetalert = () => {
    Swal.fire({
      title: "Access Denied !",
      icon: "warning",
      showCancelButton: false,
      showConfirmButton: false,
    });
  };

  useEffect(() => {
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
    if (createcheckUser?.response?.message != "") {
      toast.error(createcheckUser?.response?.message);
      dispatch(setExistUser());
    }
  }, [createcheckUser]);

  useEffect(() => {
    dispatch(getUsers(""));
    if(initialLoader){
      setLoader(true);
    }
    let pageNumberCal=(pageNumber-1)*filterSearch.limit
    dispatch(getAllUsers({...filterSearch,offset:pageNumberCal})).then((res)=>{
      setLoader(false);setInitialLoader(false);setInifinityLoader(false);
      if(res.payload.length){
        setAllUsers((prev)=>[...prev,...res.payload])
        setHasMore(true)
      }
      else{
        setHasMore(false)
      }
    });
    dispatch(getDepartments(""));
    dispatch(getLocations(""));
    dispatch(getRoles(""));
    dispatch(getDesignations(""));
    dispatch(getOrgUsers());
  }, [pageNumber,filterSearch]);

  const handleSearch=(e)=>{
    setAllUsers([])
    setPageNumber(1)
    setFilter({ ...filterSearch, name: e.target.value });
  }

  useEffect(() => {
    let numberOfPages = Math.ceil(totalNoOfUsers / filterSearch.limit);
    setNoOfPages(numberOfPages);
    var pageList = [];
    for (let i = 1; i <= noOfPages; i++) {
      pageList.push(i);
    }
    setPages(pageList);
  }, [totalNoOfUsers, noOfPages]);

  useEffect(() => {
    if (currentPage <= 5 && noOfPages >= 10) {
      setStart(1);
      setEnd(10);
    } else if (currentPage > 5 && currentPage + 4 <= noOfPages) {
      setStart(currentPage - 5);
      setEnd(currentPage + 4);
    } else if (currentPage + 4 > noOfPages) {
      setStart(currentPage - 6);
      setEnd(noOfPages);
    }
  }, [currentPage, selectedUser]);
  useEffect(() => {
    if (usersList && allUsers) {
      dispatch(setDataLoader(false));
    }
  }, [allUsers, usersList]);

  const showAddForm = () => {
    dispatch(setUserAddform(!addUserForm));
    userCreateData.phone = "";
    setValidated(false);
  };
  const observer = useRef()
  const lastBookElementRef = useCallback(node => {
    if (initialLoader) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPageNumber(prevPageNumber => prevPageNumber + 1)
        setInifinityLoader(true)
      }
    })
    if (node) observer.current.observe(node)
  }, [hasMore,initialLoader])

  const addUser = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
    } else {
      event.preventDefault();
      dispatch(setUserButtonLoading(true));
      // setCreateData({ ...userCreateData, password: generatePassword() });
      let userObj = { ...userCreateData, password: generatePassword() };
      let body = {
        user: userObj,
        location_id: parseInt(userOrgData.location_id),
        department_id: parseInt(userOrgData.department_id),
        role_id: parseInt(userOrgData.role_id),
        reporting_manager: parseInt(userOrgData.reporting_manager),
        designation_id: parseInt(userOrgData.designation_id),
        org_id: parseInt(orgId),
      };
      dispatch(createUser(body)).then(() => {
        dispatch(getAllUsers(filterSearch)).then(res=>{
          setInitialLoader(true)
          setAllUsers([]);
          setPageNumber(1)
        });
        dispatch(getUsers(""));
        dispatch(getOrgUsers());
        setValidated(false);
      });
    }
  };

  const showUpdateFrom = (id, event) => {
    event.preventDefault();
    let orgData = {
      location_id: 0,
      department_id: 0,
      role_id: 0,
      reporting_manager: 0,
      designation_id: 0,
      org_id: orgId,
    };
    let userData = {
      name: "",
      lastname: "",
      email: "",
      phone: "",
      login_type: "",
      password: "",
      pin: "",
    };
    let userDetails = usersList?.find((item) => item.id === id);
    let userOrgDetails = orgUsersList?.find((item) => item.user_id === id);
    setOldMail(userDetails?.email);

    if (userOrgDetails !== undefined) {
      dispatch(setSelectedOrgUser(userOrgDetails));
      setUpdateUserOrg(userOrgDetails);
    } else {
      dispatch(setSelectedOrgUser(orgData));
      setUpdateUserOrg(userOrgDetails);
    }
    if (userDetails) {
      dispatch(setSelectedUser(userDetails));
      setUpdateUser(userDetails);
    } else {
      dispatch(setSelectedUser(userData));
      setUpdateUser(userData);
    }
    dispatch(setUserUpdateForm(!updateUserForm));
  };

  const userUpdate = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
    } else {
      event.preventDefault();
      setShowError(false);
      dispatch(setUserButtonLoading(true));
      if(selectedUser.email.toLowerCase() != oldMail.toLowerCase()){
        const payload = {
          email: selectedUser.email,
          userid: selectedUser.id
      }
      
      dispatch(verifyMailonUpdate(payload)).then((res)=>{
        setEmailVerification(true)
      })
    }
      const { location, ...data } = selectedUser;
      let payload = {
        user: data,
        userOrg: selectedOrgUser,
      };
      dispatch(updateUser(payload)).then(() => {
        dispatch(getAllUsers(filterSearch)).then(res=>{
          setInitialLoader(true)
          setAllUsers([]);
          setPageNumber(1)
        });
        dispatch(getOrgUsers());
        setValidated(false);
      });
    }
  };

  function generatePassword() {
    var pass = "";
    const secret = "Y3llY29tbG9naW5lbmNyeXB0aW9u";
    var str =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz0123456789@#";
    for (let i = 1; i <= 12; i++) {
      var char = Math.floor(Math.random() * str.length + 1);
      pass += str.charAt(char);
    }
    setPassword(pass);
    let password = CryptoJS.AES.encrypt(pass, secret).toString();
    return password;
  }

  const deleteDialog = async (user, event) => {
    event.preventDefault();
    dispatch(setSelectedUser(user));
    setDialog(!showDeleteDialog);
  };

  const userDelete = async () => {
    dispatch(setUserButtonLoading(true));
    let seledtedUserOrg = orgUsersList?.find(
      (item) => item.user_id === selectedUser?.user_id
    );
    dispatch(deleteParentUserCheck(seledtedUserOrg)).then((res) =>
      {
        dispatch(getAllUsers(filterSearch)).then(res=>{
          setInitialLoader(true)
          setAllUsers([]);
          setPageNumber(1)
        })
        dispatch(getOrgUsers());
        setDialog(!showDeleteDialog);
      }
    );
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    dispatch(setUserButtonLoading(true));
    await dispatch(usersCsvUpload(uploadBody)).then((res) => {
      if (res.payload.status) {
        dispatch(setUserButtonLoading(false));
        toast.success(res.payload.message);
        setShowUploadModel(!showUpload);
        dispatch(getAllUsers(filterSearch)).then(res=>{
          setInitialLoader(true)
          setAllUsers([]);
          setPageNumber(1)
        });
      } else {
        dispatch(setUserButtonLoading(false));
        toast.error(res.payload.message);
        dispatch(getUsers(""));
        dispatch(getAllUsers(filterSearch)).then(res=>{
          setInitialLoader(true)
          setAllUsers([]);
          setPageNumber(1)
        });
      }
    });
  };

  const fetchDesignation = (id) => {
    let userOrgDetails = orgUsersList?.find((item) => item.user_id === id);
    if (userOrgDetails) {
      let Designation = designationList?.find(
        (item) => item.id === userOrgDetails.designation_id
      );
      return Designation?.name;
    }
  };

  const gotoFirst = () => {
    setCurrentPage(1);
    setFilter({
      name: filterSearch.name,
      offset: 1,
      limit: filterSearch.limit,
    });
  };

  const gotoLast = () => {
    setCurrentPage(noOfPages);
    setFilter({
      name: filterSearch.name,
      offset: (noOfPages - 1) * filterSearch.limit,
      limit: filterSearch.limit,
    });
  };

  const previous = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setFilter({
        name: filterSearch.name,
        offset: filterSearch.offset - filterSearch.limit,
        limit: filterSearch.limit,
      });
    }
  };

  const nextPage = () => {
    if (currentPage <= noOfPages) {
      setCurrentPage(currentPage + 1);
      setFilter({
        name: filterSearch.name,
        offset: filterSearch.offset + filterSearch.limit,
        limit: filterSearch.limit,
      });
    }
  };

  function navigateToPage(i) {
    setCurrentPage(i);
    setFilter({
      name: filterSearch.name,
      offset: (i - 1) * filterSearch.limit,
      limit: filterSearch.limit,
    });
  }

  function setFilterName(value) {
    setFilter({
      name: value,
      offset: 1,
      limit: filterSearch.limit,
    });
  }

  return (
    <div>
      <div>
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
                  <h2 className="bs_title">Users</h2>
                </div>
              </div>
              <div className="col-md-8">
                <div className="aside_left d-flex align-items-center justify-content-end gap-2">
                  <div className="search-box">
                    <input
                      className="form-control text"
                      type="search"
                      name="users-search"
                      placeholder="Search here"
                      onChange={(e)=>handleSearch(e)}
                    />
                    <button type="button">
                      <FaSearch />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary disable-btn"
                    onClick={showAddForm}
                    disabled={userPermissions?.create == false}
                  >
                    Create User
                  </button>
                  <OverlayTrigger
                    overlay={
                      <Tooltip id="tooltip-disabled">
                        {showTree ? "List View" : "Tree View"}
                      </Tooltip>
                    }
                  >
                    <button
                      type="button"
                      className="btn btn-secondary master-btns d-flex align-items-center justify-content-center"
                      onClick={() => setShowTree(!showTree)}
                    >
                      {showTree ? (
                        <TbListDetails className="icons-btns-master" />
                      ) : (
                        <TbHierarchy2 className="icons-btns-master" />
                      )}
                    </button>
                  </OverlayTrigger>

                  <OverlayTrigger
                    overlay={
                      <Tooltip id="tooltip-disabled">{" Download CSV"}</Tooltip>
                    }
                  >
                    <span className="d-inline-block">
                      <a
                        href={bulkDownloadUrl}
                        className="btn btn-secondary  master-btns d-flex align-items-center justify-content-center"
                      >
                        <FaCloudDownloadAlt className="icons-btns-master" />
                      </a>
                    </span>
                  </OverlayTrigger>

                  <OverlayTrigger
                    overlay={
                      <Tooltip id="tooltip-disabled">{"Upload CSV"}</Tooltip>
                    }
                  >
                    <button
                      onClick={() => setShowUploadModel(!showUpload)}
                      type="button"
                      className="btn btn-secondary master-btns d-flex align-items-center justify-content-center"
                    >
                      <FaCloudUploadAlt className="icons-btns-master" />
                    </button>
                  </OverlayTrigger>
                </div>
              </div>
            </div>
          </div>
        </section>
        {loader ? (
          <LoaderComponent />
        ) : userPermissions?.view == true ? (
          <section>
            {showTree ? (
              <UsersTree />
            ) : (
              <>
                <div className="container-fluid">
                  <div className="row">
                    {Array.isArray(allUsers) && allUsers?.length > 0 ? (
                     
                      allUsers?.map((item, id) => {
                        // console.log("userss",item)
                        return (
                          <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12"
                            key={id}
                            ref={allUsers.length==id+1?lastBookElementRef:null}
                            
                          >
                            <Card className="mb-4 users-card master-global-card master-card">
                              <Card.Body>
                                <div className="hprofile d-flex align-items-start justify-content-flex-start">
                                  <div className="avatar d_aic_jcc text-dark">
                                    {item?.avatar != undefined || null ? (
                                      <img
                                        src={item?.avatar}
                                        alt="user-img"
                                        className="rounded-circle"
                                      />
                                    ) : (
                                      <p className="d_aic_jcc m-0">
                                        {item?.name?.charAt(0).toUpperCase() +
                                          item.lastname
                                            ?.charAt(0)
                                            .toUpperCase()}
                                      </p>
                                    )}

                                    {/* </div>
               </div> */}
                                    {/* <div className="d-flex align-items-center hprofile d_aic_jcFS">
                            <div className="users-img avatar d_aic_jcc">
                            {
                  item.avatar!=undefined||null?<img src={item.avatar} alt="user-img"/>:<span className="bg-dark text-white" >{item?.name?.charAt(0).toUpperCase()+item.lastname?.charAt(0).toUpperCase()}</span>
                         } */}

                                    {/* <img src={item.avatar?item.avatar:item.name?.slice(0,1).toUpperCase()+item.lastname?.slice(0,1).toUpperCase()} alt="profileimage" className="rounded-circle"/> */}
                                    {/* <span className="user-active"></span> */}
                                  </div>
                                  <div className="users-name">
                                    <OverlayTrigger
                                      overlay={
                                        <Tooltip id="tooltip-disabled">
                                          {item.name} {item.lastname}
                                        </Tooltip>
                                      }
                                    >
                                      <h3 className="mb-1 ttww">
                                        {item.name} {item.lastname}
                                      </h3>
                                    </OverlayTrigger>
                                    <h5 className="mb-0">
                                      {fetchDesignation(item.id)}
                                    </h5>
                                    <div className="content user-card d-flex align-items-start justify-content-between">
                                      <div className="user-card-details">
                                        <h6 className="mt-3">
                                          <span className="me-2">
                                            <HiOutlineMail />
                                          </span>
                                          {item.email === ""
                                            ? "N/A"
                                            : item.email}
                                        </h6>
                                        {/* <span className="user-tags-label-item-email editable">
                                    
                                  </span> */}
                                        <h6>
                                          <span className="me-2">
                                            <GoDeviceMobile />
                                          </span>
                                          +91{item.phone}
                                        </h6>

                                        {/* ----ui design administration comment------ */}
                                        {/* <div className="d-flex">
                                <div className="change-password d_aic_jcc gap-2 me-2">
                                  <FaUserTie className="user-role-icon"/>
                                  <p className="users-role m-0">Designing Team</p>
                                </div>
                                <div className="change-password d_aic_jcc gap-2">
                                  <FaUserCog className="user-role-icon"/>
                                  <p className="users-role m-0">Administrator</p>
                                </div>
                              </div> */}
                                        {/* -------ui design comment end */}

                                        {/* <div className="user-foter-details d-flex mt-2 p-0">
                                <Badge
                                  pill
                                  bg="light"
                                  text="dark"
                                  className="users-badge m-2"
                                >
                                  <FaUserTie /> {fetchDesignation(item.id)}
                                </Badge>
                                <Badge
                                  pill
                                  bg="light"
                                  text="dark"
                                  className="users-badge m-2"
                                >
                                  <FaUserCog/> {fetchDesignation(item.id)}
                                </Badge>
                              </div> */}
                                      </div>
                                    </div>
                                  </div>
                                  {/* ----reactswitch ui comment---- */}
                                  {/* <div className="approvals-modal mt-1"><ReactSwitch/></div> */}
                                  <div className="">
                              {["start"].map((direction) => (
                                <>
                                  <DropdownButton id="dropdown-menu-align-start" drop={direction} title={<FaEllipsisV className="faelli" />}>
                                    <div className="d_aic_jcc">
                                      <Dropdown.Item onClick={(event) => showUpdateFrom(item.user_id, event)} disabled={userPermissions?.update == false}>
                                        <FaEdit className="dropdown-btnicon" />
                                      </Dropdown.Item>
                                      {item.role_id != 1 && (item?.created_by != "undefined") & !null && (
                                              <Dropdown.Item onClick={(event) => deleteDialog(item, event)}
                                                disabled={userPermissions?.delete == false}>
                                                <FaTrashAlt className="dropdown-btnicon" />
                                              </Dropdown.Item>
                                      )}
                                    </div>
                                  </DropdownButton>
                                </>
                              ))}
                            </div>
                                  {/* <div className="users-dropdown ms-2">
                                    <Dropdown>
                                      <Dropdown.Toggle
                                        variant="success"
                                        id="dropdown-basic"
                                      >
                                        <FaEllipsisV id="dropdown-basic" />
                                      </Dropdown.Toggle>
                                      <Dropdown.Menu>
                                        <Dropdown.Item
                                          onClick={(event) =>
                                            showUpdateFrom(item.id, event)
                                          }
                                          disabled={
                                            userPermissions?.update == false
                                          }
                                        >
                                          <FaEdit className="dropdown-btnicon" />
                                          Edit
                                        </Dropdown.Item>
                                        {item.role_id != 1 &&
                                          (item?.created_by != "undefined") &
                                            !null && (
                                            <Dropdown.Item
                                              onClick={(event) =>
                                                deleteDialog(item, event)
                                              }
                                              disabled={
                                                userPermissions?.delete == false
                                              }
                                            >
                                              <FaTrashAlt className="dropdown-btnicon" />
                                              Delete
                                            </Dropdown.Item>
                                          )}
                                      </Dropdown.Menu>
                                    </Dropdown>
                                  </div> */}
                                </div>
                                {/* <Avatar size='medium' color={avatarBrColors[Math.floor(Math.random() * avatarBrColors.length)]}
                              initials={org.name.substring(0, 2).toUpperCase()} ></Avatar>
                            <span className="user-active"></span> */}

                                <div className="d-none">
                                  <div>
                                    <img
                                      className="users-dummy-img"
                                      src={UserIcon}
                                    />
                                  </div>
                                  <div>
                                    <Card.Title>
                                      <OverlayTrigger
                                        overlay={
                                          <Tooltip id="tooltip-disabled">
                                            {item.name} {item.lastname}
                                          </Tooltip>
                                        }
                                      >
                                        <span className="d-inline-block">
                                          <div
                                            className="editable"
                                            style={{ pointerEvents: "none" }}
                                          >
                                            {item.name} {item.lastname}
                                          </div>
                                        </span>
                                      </OverlayTrigger>
                                    </Card.Title>
                                    <Card.Text>
                                      <label className="user-tags-label">
                                        <HiOutlineMail />
                                      </label>
                                      &nbsp;
                                      <span className="user-tags-label-item-email">
                                        {item.email}
                                      </span>
                                    </Card.Text>
                                    <Card.Text>
                                      <label className="user-tags-label">
                                        <GoDeviceMobile />
                                      </label>
                                      &nbsp;
                                      <label className="user-tags-label-item">
                                        {item.phone}
                                      </label>
                                    </Card.Text>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </div>

                        );
                      })
                    ) : (
                      <Col md={12} className="text-center"><img src={NoDataFound} height="500px" /></Col>
                    )}
                     {inifinityLoader &&
                      <div className="infinity-loader"><LoaderComponent/></div>
                      }
                  </div>
                </div>
                {Array.isArray(allUsers) && allUsers?.length>0&&<></>}
                {/* <div className="row d-flex  d-flex align-items-center justify-content-center">
                  <div className="col-12  d-flex align-items-center justify-content-center gap_1rm">
                    <span>
                      {currentPage} of {noOfPages}
                    </span>
                    <Pagination className="p-0 m-0">
                      <Pagination.First onClick={gotoFirst} />
                      <Pagination.Prev
                        className={currentPage == 1 ? "disabled" : null}
                        onClick={previous}
                      />
                      {currentPage > 10 ? (
                        <Pagination.Item
                          onClick={() => navigateToPage(currentPage - 10)}
                        >
                          {currentPage - 10}
                        </Pagination.Item>
                      ) : (
                        <></>
                      )}
                      {currentPage > 10 ? (
                        <Pagination.Ellipsis disabled />
                      ) : (
                        <></>
                      )}
                      {pages &&
                        pages.slice(start - 1, end).map((item, key) => {
                          return (
                            <Pagination.Item
                              key={item}
                              className={currentPage == item ? "active" : null}
                              onClick={() => navigateToPage(item)}
                            >
                              {item}
                            </Pagination.Item>
                          );
                        })}
                      {noOfPages - currentPage > 10 ? (
                        <Pagination.Ellipsis disabled />
                      ) : (
                        <></>
                      )}
                      {noOfPages - currentPage > 10 ? (
                        <Pagination.Item
                          onClick={() => navigateToPage(currentPage + 10)}
                        >
                          {currentPage + 10}
                        </Pagination.Item>
                      ) : (
                        <></>
                      )}
                      <Pagination.Next
                        className={currentPage == noOfPages ? "disabled" : null}
                        onClick={nextPage}
                      />
                      <Pagination.Last onClick={gotoLast} />
                    </Pagination>
                  </div>
                </div> */}

              </>
            )}
          </section>
        ) : (
          <></>
        )}

        <Offcanvas
          show={addUserForm}
          onHide={showAddForm}
          backdrop="static"
          placement="end"
          className="offcanvas_forms"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="offcanvas-title">
              <h2>Create User</h2>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Form noValidate validated={validated} onSubmit={addUser}>
              <div className="offcanvas-scroll">
                <Form.Group
                  as={Col}
                  controlId="formGridEmail"
                  className="formGroup"
                >
                  <Form.Label className="star">
                    First Name <b>*</b>
                  </Form.Label>
                  <Form.Control
                    required
                    minLength={2}
                    maxLength={20}
                    onChange={(e) => {
                      setCreateData({
                        ...userCreateData,
                        name: e.target.value,
                      });
                    }}
                    type="text"
                  />
                  <Form.Control.Feedback type="invalid">
                    First Name should have minimum 2 letters
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group
                  as={Col}
                  controlId="formGridEmail"
                  className="formGroup"
                >
                  <Form.Label className="star">
                    Last Name <b>*</b>
                  </Form.Label>
                  <Form.Control
                    required
                    minLength={2}
                    maxLength={20}
                    onChange={(e) => {
                      setCreateData({
                        ...userCreateData,
                        lastname: e.target.value,
                      });
                    }}
                    type="text"
                  />
                  <Form.Control.Feedback type="invalid">
                    Last Name should have minimum 2 letters
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group
                  as={Col}
                  controlId="formGridEmail"
                  className="formGroup"
                >
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    required={userCreateData.email.length > 0 ? true : false}
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$"
                    onChange={(e) => {
                      setCreateData({
                        ...userCreateData,
                        email: e.target.value.toLowerCase(),
                      });
                    }}
                    type="email"
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter valid email format
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group
                  as={Col}
                  controlId="formGridEmail"
                  className="formGroup"
                >
                  <Form.Label className="star">
                    Phone no. <b>*</b>
                  </Form.Label>
                  <input
                    id="orgPhone"
                    type="tel"
                    pattern="[6789][0-9]{9}"
                    minLength={10}
                    maxLength={10}
                    onChange={(e) => {
                      setCreateData({
                        ...userCreateData,
                        phone: e.target.value,
                      });
                    }}
                    onBlur={() =>
                      dispatch(userExistCheck({ phone: userCreateData.phone }))
                    }
                    className="form-control"
                    required
                  ></input>
                  <Form.Control.Feedback type="invalid">
                    Invalid Phone Number
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group
                  as={Col}
                  controlId="formGridState"
                  id="formGridCheckbox"
                  className="formGroup"
                >
                  <Form.Label className="star">
                    Reporting Manager <b>*</b>
                  </Form.Label>
                  <Form.Select
                    required
                    onChange={(e) => {
                      setUserOrgData({
                        ...userOrgData,
                        reporting_manager: e.target.value,
                      });
                    }}
                    defaultValue="Choose..."
                  >
                    <option value="">Select Reporting Manager</option>
                    {usersList.length > 0 &&
                      usersList?.map((user) => {
                        return (
                          <option key={user.id} value={user.id}>
                            {user.name} {user.lastname}
                          </option>
                        );
                      })}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Select one Reporting Manager
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group
                  as={Col}
                  controlId="formGridState"
                  id="formGridCheckbox"
                  className="formGroup"
                >
                  <Form.Label className="star">
                    Designation <b>*</b>
                  </Form.Label>
                  <Form.Select
                    required
                    onChange={(e) => {
                      setUserOrgData({
                        ...userOrgData,
                        designation_id: e.target.value,
                      });
                    }}
                    defaultValue="Choose..."
                  >
                    <option value="">Select Designation</option>
                    {designationList?.map((designation) => {
                      if (designation.name !== "chairman") {
                        return (
                          <option key={designation.id} value={designation.id}>
                            {designation.name}
                          </option>
                        );
                      }
                    })}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Select one Designation
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group
                  as={Col}
                  controlId="formGridState"
                  id="formGridCheckbox"
                  className="formGroup"
                >
                  <Form.Label className="star">
                    Location <b>*</b>
                  </Form.Label>
                  <Form.Select
                    required
                    onChange={(e) => {
                      setUserOrgData({
                        ...userOrgData,
                        location_id: e.target.value,
                      });
                    }}
                    defaultValue="Choose..."
                  >
                    <option value="">Select Location</option>
                    {locationsList?.map((location) => {
                      return (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      );
                    })}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Select one Location
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group
                  as={Col}
                  controlId="formGridState"
                  id="formGridCheckbox"
                  className="formGroup"
                >
                  <Form.Label className="star">
                    Department <b>*</b>
                  </Form.Label>
                  <Form.Select
                    required
                    onChange={(e) => {
                      setUserOrgData({
                        ...userOrgData,
                        department_id: e.target.value,
                      });
                    }}
                    defaultValue="Choose..."
                  >
                    <option value="">Select Department</option>
                    {departmentsList &&
                      departmentsList?.map((dept) => {
                        return (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        );
                      })}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Select one Department
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group
                  as={Col}
                  controlId="formGridState"
                  id="formGridCheckbox"
                  className="formGroup"
                >
                  <Form.Label className="star">
                    Role <b>*</b>
                  </Form.Label>
                  <Form.Select
                    required
                    onChange={(e) => {
                      setUserOrgData({
                        ...userOrgData,
                        role_id: e.target.value,
                      });
                    }}
                    defaultValue="Choose..."
                  >
                    <option value="">Select Role</option>
                    {rolesList?.map((role) => {
                      return (
                        role.name != "owner" && (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        )
                      );
                    })}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Select one Role
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
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
                  <span> Create</span>
                )}
              </Button>
            </Form>
          </Offcanvas.Body>
        </Offcanvas>

        <Offcanvas
          show={updateUserForm}
          onHide={() => {dispatch(setUserUpdateForm(!updateUserForm));dispatch(setUserButtonLoading(false))}}
          backdrop="static"
          placement="end"
          className="organization-offcanvas"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Update User</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div className="container">
              <div className="row">
                {/* <viewing the user details closes hear  ----------------------------*/}

                <Form noValidate validated={validated} onSubmit={userUpdate}>
                  <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridEmail">
                      <Form.Label>
                        First Name <b>*</b>
                      </Form.Label>
                      <Form.Control
                        required
                        minLength={2}
                        maxLength={20}
                        onChange={(e) => {
                          dispatch(
                            setSelectedUser({
                              ...selectedUser,
                              name: e.target.value,
                            })
                          );
                        }}
                        value={selectedUser?.name}
                        type="text"
                      />
                      <Form.Control.Feedback type="invalid">
                        First Name should have minimum 2 letters
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridEmail">
                      <Form.Label>
                        Last Name <b>*</b>
                      </Form.Label>
                      <Form.Control
                        required
                        minLength={2}
                        maxLength={20}
                        onChange={(e) => {
                          dispatch(
                            setSelectedUser({
                              ...selectedUser,
                              lastname: e.target.value,
                            })
                          );
                        }}
                        value={selectedUser?.lastname}
                        type="text"
                      />
                      <Form.Control.Feedback type="invalid">
                        Last Name should have minimum 2 letters
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        required={selectedUser?.email.length > 0 ? true : false}
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$"
                        onChange={(e) => {
                          dispatch(
                            setSelectedUser({
                              ...selectedUser,
                              email: e.target.value,
                            })
                          );
                        }}
                        value={selectedUser?.email}
                        type="email"
                      />
                      <Form.Control.Feedback type="invalid">
                        Enter valid email format
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridEmail">
                      <Form.Label>
                        Phone no <b>*</b>
                      </Form.Label>
                      <input
                        id="orgPhone"
                        type="tel"
                        pattern="[6789][0-9]{9}"
                        minLength={10}
                        maxLength={10}
                        value={selectedUser?.phone}
                        onChange={(e) => {
                          dispatch(
                            setSelectedUser({
                              ...selectedUser,
                              phone: e.target.value,
                            })
                          );
                        }}
                        className="form-control"
                        required
                      ></input>
                      <Form.Control.Feedback type="invalid">
                        Invalid Phone Number
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>

                  {selectedOrgUser?.reporting_manager != null && (
                    <Row className="mb-3">
                      <Form.Group
                        as={Col}
                        controlId="formGridState"
                        id="formGridCheckbox"
                      >
                        <Form.Label>Reporting Manager</Form.Label>
                        <Form.Select
                          onChange={(e) => {
                            dispatch(
                              setSelectedOrgUser({
                                ...selectedOrgUser,
                                reporting_manager: e.target.value,
                              })
                            );
                          }}
                          value={selectedOrgUser?.reporting_manager}
                          defaultValue="Choose..."
                        >
                          <option>Select Reporting Manager</option>
                          {usersList?.map((user) => {
                            return (
                              <option key={user.id} value={user.id}>
                                {user.name} {user.lastname}
                              </option>
                            );
                          })}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          Select one Reporting Manager
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                  )}

                  <Row className="mb-3">
                    <Form.Group
                      as={Col}
                      controlId="formGridState"
                      id="formGridCheckbox"
                    >
                      <Form.Label>
                        Designation <b>*</b>
                      </Form.Label>
                      <Form.Select
                        onChange={(e) => {
                          dispatch(
                            setSelectedOrgUser({
                              ...selectedOrgUser,
                              designation_id: e.target.value,
                            })
                          );
                        }}
                        value={selectedOrgUser?.designation_id}
                        defaultValue="Choose..."
                      >
                        <option>Select Designation</option>

                        {designationList?.map((designation) => {
                          // console.log("desgination",designation)
                          if(((selectedOrgUser?.role_id!=1||2)&&(designation.name!="chairman"))){
                            return (
                              <option key={designation.id} value={designation.id}>
                                {designation.name}
                              </option>
                            );
                          }
                          
                        })}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Select one Designation
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group
                      as={Col}
                      controlId="formGridState"
                      id="formGridCheckbox"
                    >
                      <Form.Label>
                        Location <b>*</b>
                      </Form.Label>
                      <Form.Select
                        onChange={(e) => {
                          dispatch(
                            setSelectedOrgUser({
                              ...selectedOrgUser,
                              location_id: e.target.value,
                            })
                          );
                        }}
                        value={selectedOrgUser?.location_id}
                        defaultValue="Choose..."
                      >
                        <option>Select Location</option>
                        {locationsList?.map((location) => {
                          return (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          );
                        })}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Select one Location
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group
                      as={Col}
                      controlId="formGridState"
                      id="formGridCheckbox"
                    >
                      <Form.Label>
                        Department <b>*</b>
                      </Form.Label>
                      <Form.Select
                        onChange={(e) => {
                          dispatch(
                            setSelectedOrgUser({
                              ...selectedOrgUser,
                              department_id: e.target.value,
                            })
                          );
                        }}
                        value={selectedOrgUser?.department_id}
                        defaultValue="Choose..."
                      >
                        <option>Select Department</option>
                        {departmentsList &&
                          departmentsList?.map((dept) => {
                            return (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            );
                          })}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Select one Department
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group
                      as={Col}
                      controlId="formGridState"
                      id="formGridCheckbox"
                    >
                      <Form.Label>
                        Role <b>*</b>
                      </Form.Label>
                      <Form.Select
                        onChange={(e) => {
                          dispatch(
                            setSelectedOrgUser({
                              ...selectedOrgUser,
                              role_id: e.target.value,
                            })
                          );
                        }}
                        value={selectedOrgUser?.role_id}
                        defaultValue="Choose..."
                      >
                        <option>Select Role</option>
                        {rolesList?.map((role) => {
                          return (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          );
                        })}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Select one Role
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
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
                      <span>Update User</span>
                    )}
                  </Button>
                </Form>
              </div>
            </div>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Delete User Modal */}
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
              <h2 className="text-center">Delete User</h2>
          </Modal.Title> */}
          </Modal.Header>

          <Modal.Body className="text-center">
            <div className="d_aic_jcc icon_info mt-3 mb-4">
              <BiX className="i" />
            </div>
            <h3 className="text-center title mb-3">Delete User</h3>
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
              onClick={userDelete}
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

        {/* Upload Users Modal */}
        <Modal
          show={showUpload}
          onHide={() => setShowUploadModel(!showUpload)}
          centered
          backdrop="static"
          className="modal_forms"
        >
          <Form onSubmit={(e) => uploadFile(e)}>
            <Modal.Header closeButton>
              <Modal.Title className="modal-title">
                <h2>Users Bulk Upload</h2>
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Form.Group className="formGroup" controlId="formFile">
                <Form.Label>Select File to Upload</Form.Label>
                <Form.Control
                  type="file"
                  accept=".csv"
                  required
                  onChange={(e) =>
                    setUploadBody({ ...uploadBody, file: e.target.files[0] })
                  }
                />
              </Form.Group>

              <Form.Group className="formGroup" controlId="formFile">
                <Form.Label>Enter email to receive passwords</Form.Label>
                <Form.Control
                  type="email"
                  required
                  onChange={(e) =>
                    setUploadBody({ ...uploadBody, email: e.target.value })
                  }
                />
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button
                className="dark-btn"
                variant="secondary"
                onClick={() => setShowUploadModel(!showUpload)}
              >
                Close
              </Button>
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
                  <span> Upload</span>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

 {/* Email Verification Modal */}
        <Modal
        show={emailVerification}
        onHide={() => {
         setEmailVerification(false);
        }}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="modal_forms modal-sm"
      >
        <Modal.Body className="text-center">
          <div className="d_aic_jcc icon_info mt-3 mb-4">
            <AiOutlineCheck className="i" />
          </div>
          <h3 className="text-center title mb-3">
            Verification mail sent to {selectedUser?.email}
          </h3>
          <p>
            Please verify to get emails
          </p>
        </Modal.Body>
        <Modal.Footer className="modal-footer-jcc border-0">
          <Button
            className="dark-btn"
            variant="primary"
            onClick={() => setEmailVerification(false)}>
            Ok
          </Button>
          {/* <Button onClick={TodoDelete}  variant="primary" type="submit" disabled={loading}>
          {loading ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
          ) : (<span> Ok</span>)}
          </Button> */}
        </Modal.Footer>
      </Modal>

        {/* Generated Password Modal */}
        <Modal
          show={showPasswordDialog}
          onHide={() => dispatch(setShowPasswordDialog(false))}
          backdrop="static"
          keyboard={false}
          centered
          className="modal_forms modal-sm"
        >
          <Modal.Header closeButton>
            {/* <Modal.Title className="modal-title text-center">
              <h2 className="text-center">Generated Password</h2>
          </Modal.Title> */}
          </Modal.Header>

          <Modal.Body className="text-center">
            <div className="d_aic_jcc icon_info_sucess mt-3 mb-4">
              <BiLockAlt className="i" />
            </div>
            <h3 className="text-center title mb-3 text-danger">
              Generated Password
            </h3>
            <p>
              <b className="text-danger text-success">*</b> Don't share your
              password to anyone
            </p>

            <Form.Group className="formGroup d_aic_jcc gap_1rm mt-5">
              <Form.Label>Name :</Form.Label>
              <p className="m-0">
                {userCreateData.name} {userCreateData.lastname}
              </p>
            </Form.Group>

            <Form.Group className="formGroup d_aic_jcc gap_1rm">
              <Form.Label>Mobile :</Form.Label>
              <p className="m-0">{userCreateData.phone}</p>
              {isUserCopied ? (
                <span>Copied</span>
              ) : (
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-copy">Copy Mobile Number</Tooltip>
                  }
                >
                  <span className="d-inline-block">
                    <Button
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${userCreateData.phone}`
                        );
                        setUserCopied(true);
                        setTimeout(() => setUserCopied(false), 2000);
                      }}
                    >
                      <FaRegCopy />
                    </Button>
                  </span>
                </OverlayTrigger>
              )}
            </Form.Group>

            <Form.Group className="formGroup d_aic_jcc gap_1rm m-0">
              <Form.Label>Password :</Form.Label>
              <p className="m-0">{password}</p>
              {isPasswordCopied ? (
                <span>Copied</span>
              ) : (
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-copypasword">Copy Password</Tooltip>
                  }
                >
                  <span className="d-inline-block">
                    <Button
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(password);
                        setPasswordCopied(true);
                        setTimeout(() => setPasswordCopied(false), 2000);
                      }}
                    >
                      <FaRegCopy />
                    </Button>
                  </span>
                </OverlayTrigger>
              )}
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="modal-footer-jcc border-0">
            <Button
              className="dark-btn"
              variant="secondary"
              onClick={() => dispatch(setShowPasswordDialog(false))}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default Users;