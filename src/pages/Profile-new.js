import { Button, Card, Col, Form, InputGroup, Offcanvas, Modal, Nav, Row, Spinner, Tab, Tabs,Container} from "react-bootstrap";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiUnlock } from "react-icons/fi";
import { BiPencil, BiUserCircle } from "react-icons/bi";
import { AiOutlineCheck } from "react-icons/ai";
import { getLocations } from "../redux/reducers/locationsReducer";
import { getDepartments } from "../redux/reducers/departmentReducer";
import { getRoles } from "../redux/reducers/rolesReducer";
import { getDesignations } from "../redux/reducers/designationReducers";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"
import { getUsers, getAliasUsers, updateAliasUser, getMyTemsIds, verifyMailonUpdate } from "../redux/reducers/userReducer";
import { resetPassword, getExceptUsers, getOrgUsers, updateUserProfile, profileUpload, getAliasUserAdmins, swichProfiles, backToProfile } from "../redux/reducers/userReducer";
import { getUserById, setPasswordValidation } from "../redux/reducers/authReducer";
import { toast } from "react-toastify";
import { useMemo } from "react";
import Swal from "sweetalert2";
import profile from "../assets/profile.jpg";
import Avatar from "../components/Avatar";
import { getUserOrgByid } from "../redux/reducers/authReducer";

export default function ProfileNew() {
    const [emailerror, setemailerror] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const dispatch = useDispatch();
    const userDetails = useSelector((state) => state.auth.userDetails);
    const [user, setUser] = useState({});
    const [nameError, setNameError] = useState(false)
    const orgUsersList = useSelector((state) => state.users.orgUsersList);
    const [locaionDetails, setLocaionDetails] = useState({});
    const [departmentDetails, setDepartmentDetails] = useState({});
    const [designationDetails, setDesignationDetails] = useState({});
    const [reportingManagerDetails, setReportingManagerDetails] = useState(undefined);
    const [role, setRole] = useState({});
    const [lastNameError, setLastNameError] = useState(false)
    const [mobileError, setMobileError] = useState(false)
    const [orgDetails, setOrgDetails] = useState({});
    const userOrgList = useSelector((state) => state.auth.userOrgDetails);
    const usersList = useSelector((state) => state.users.usersList);
    const current_organization = useSelector((state) => state.auth.current_organization);
    const userOrgDetails = userOrgList?.find((item) => item.org_id == current_organization);
    const designationList = useSelector((state) => state.designation.designationList);
    const available_organizations = useSelector((state) => state.auth.available_organizations);
    const [organizationsdata, setorganizations] = useState({ data: available_organizations, name: '' })
    const [changePasswordObj, setChangePasswordObj] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const exceptedUsers = useSelector((state) => state.users.exceptedUsers);
    const switchUsers = useSelector((state) => state.users.switchUsers);
    const aliasUsers = useSelector((state) => state.users.aliasUsers);
    const [loading, setLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [emailVerification,setEmailVerification]=useState(false);
    const [showAddAlias, setShowAddAlias] = useState(false);
    const [showSwitchUser, setShowSwitchUser] = useState(false);
    const [exceptedUsersPayload, setExceptedUsersPayload] = useState({
        array: [],
        name: "",
    });
    const [seledtedUser, setSelectedUser] = useState([]);
    const [nameErrorMessage, setNameErrorMessage] = useState("");
    const [switchUser, setSwithUser] = useState();
    const [showEdit, setShowEdit] = useState(false);
    const alaisUser = localStorage.getItem("alias-user");
    const [showChangePassword, setChangePassword] = useState(false);
    const roleName = localStorage.getItem('role')
    const myTeamIds = useSelector((state) => state.users.myTeamIds)
    const [existingPassType, setExistingPassType] = useState(false)
    const [newPassType, setNewPassType] = useState(false)
    const [image, setImage] = useState(null);
    const hiddenFileInput = useRef(null);
    const [lastNameErrorMessage, setLastNameErrorMessage] = useState("")
    const currentOrganization = useSelector(
        (state) => state.auth.current_organization
    );

    // console.log(localStorage.getItem('userData'));
    // console.log(localStorage.getItem('userOrgData'))
    const userData = useState(localStorage.getItem('userOrgData')&&JSON.parse(localStorage.getItem('userOrgData')));
    const [oldMail, setOldMail] = useState();
    useEffect(() => {
        dispatch(getUserOrgByid(userData?.[0].user_id));
    }, [])

    useEffect(() => {
        setUser(userDetails);
        dispatch(getUserById(userDetails?.id))
        dispatch(getMyTemsIds())
        dispatch(getAliasUserAdmins(userDetails?.id));
        dispatch(getOrgUsers());
        //dispatch(getUserOrgByid(userData?.[0].id));
        dispatch(getUsers("")).then((res) => {
            // console.log("userresponse", res)
            // console.log("userOrgDetails", userOrgDetails)
            let user = res.payload?.find(
                (i) => i.id == userOrgDetails?.reporting_manager
            );
            user && setReportingManagerDetails(user);
        });
        dispatch(getDepartments("")).then((res) => {
            // console.log("deptresponse", res)
            // console.log("userOrgDetails", userOrgDetails)
            let department = res?.payload?.find(
                (i) => i.id == userOrgDetails?.department_id
            );
            department && setDepartmentDetails(department);
        });

        dispatch(getOrganizations(organizationsdata)).then((res) => {
            // console.log("orgresponse", res)
            // console.log("userOrgDetails", userOrgDetails)
            let org = res.payload?.find((i) => i.id == current_organization);
            org && setOrgDetails(org);
        });
        dispatch(getLocations("")).then((res) => {
            // console.log("locresponse", res)
            // console.log("userOrgDetails", userOrgDetails)
            let location = res?.payload?.find(
                (i) => i.id == userOrgDetails?.location_id
            );
            location && setLocaionDetails(location);
        });
        dispatch(getRoles("")).then((res) => {
            // console.log("rolresponse", res)
            // console.log("userOrgDetails", userOrgDetails)
            let selectedRole = res.payload?.find(
                (i) => i.id == userOrgDetails?.role_id
            );
            selectedRole && setRole(selectedRole);
        });
        dispatch(getDesignations("")).then((res) => {
            // console.log("desresponse", res);
            // console.log("userOrgDetails", userOrgDetails)
            let designation = res.payload?.find(
                (i) => i.id == userOrgDetails?.designation_id
            );
            designation && setDesignationDetails(designation);
        });

        getSelectedAlias();
    }, [userOrgDetails]);

    const getSelectedAlias = () => {
        dispatch(getAliasUsers()).then((res) => {
            //setExceptedUsersPayload({ ...exceptedUsersPayload, array: res.payload })
            res?.payload && setSelectedUser(res.payload);
        });
    };

    const updatePassword = (e) => {
        setLoading(true);
        e.preventDefault();
        const form = e.currentTarget;
        // console.log(showPasswordError);
        //showPasswordError,setShowPasswordError
        if (showPasswordError) {
            setShowPasswordError(true);
            setLoading(false);
            //setPasswordError('')
            return;
        }
        if (changePasswordObj?.newPassword === changePasswordObj?.confirmPassword) {
            let body = {
                oldpassword: changePasswordObj.currentPassword,
                newpassword: changePasswordObj.confirmPassword,
            };
            dispatch(resetPassword(body)).then((res) => {
                if (res.payload.status) {
                    toast.success(res.payload.message);
                    setLoading(false);
                    setChangePasswordObj({});
                    setPasswordError('')
                    form.reset();
                    setChangePassword(false);
                } else {
                    toast.error(res.payload.message);
                    setLoading(false);
                }
            });
        } else {
            setShowError(true);
            setLoading(false);
        }
    };

    const onCancelChange = () => {
        setShowEdit(false)
        setUser(userDetails)
    }

    const updateSelectedUser = (id) => {
        if (seledtedUser?.includes(id)) {
            setSelectedUser((assignees) => assignees.filter((item) => item !== id));
        } else {
            setSelectedUser([...seledtedUser, id]);
        }
    };

    const fetchExceptUsers = () => {
        let payload = {
            array: exceptedUsersPayload.array,
            name: exceptedUsersPayload.name,
        };
        dispatch(getExceptUsers(payload));
    };

    const opensweetalert = () => {
        Swal.fire({
            title: 'Are you sure?',

            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(

                    'Please contact Administrator.',

                )
            }
        })
    }
    const fecthAliasLength=(aliasUsers)=>{
        let userLength=[]
        aliasUsers?.forEach((alias_item)=>{
            let user = usersList?.find((item) => item.id == alias_item);
            if(user){
                userLength.push(user)
            }
               
        })
       return userLength.length
    }
    const fetchUser = (id) => {
        let user = usersList?.find((item) => item.id == id);
        if (user) {
            return (
              <li>
                <div className="alias-list">
                  <div className="alias-img">
                    {/* <img src={profile} className="alias-avatar" /> */}
                    <Avatar
                      color={user.color}
                      initials={`${user.name
                        .substring(0, 1)
                        .toUpperCase()}${user.lastname
                        .substring(0, 1)
                        .toUpperCase()}`}
                      image={user.avatar}
                      className="avatar1"
                    />
                  </div>
                  <div className="alias-content">
                    <h5>
                      {user.name} {user.lastname}
                      <span>{fetchDesignation(user.id)}</span>
                    </h5>
                  </div>
                </div>
              </li>
            );
        }
    };

    const fetchSwithUsers = (id) => {
        let user = usersList?.find((item) => item.id == id);
        if (user) {
            return (
              <Col
                lg={12}
                className="p-0 pt-1"
                onClick={() => setSwithUser(user.id)}
              >
                <label className="switch-user-sidecard">
                  <div
                    className={
                      switchUser == user.id ? "inner-div org-list" : "org-list"
                    }
                  >
                    <div className="alias-img">
                      {/*  */}
                      <Avatar
                        color={user.color}
                        initials={`${user.name.substring(0, 2).toUpperCase()}`}
                      />
                    </div>
                    <div className="alias-content">
                      <h5>
                        {user.name} {user.lastname}
                        <span>{fetchDesignation(user.id)}</span>
                      </h5>
                    </div>
                  </div>
                </label>
              </Col>
            );
        }
    };

    const fetchDesignation = (id) => {
        let userOrg = orgUsersList?.find((item) => item.user_id == id);
        if (userOrg) {
            let designation = designationList?.find(
                (i) => i.id == userOrg.designation_id
            );
            if (designation) {
                return designation.name;
            } else {
                return "N/A";
            }
        }
    };

    useMemo(() => {
        fetchExceptUsers();
    }, [exceptedUsersPayload]);

    const aliasUserUpdate = () => {
        setLoading(true);
        let currentUser = orgUsersList?.find(
            (item) => item.user_id == userDetails.id
        );
        let currentUserTemp = { ...currentUser, alias_user: seledtedUser };
        dispatch(updateAliasUser(currentUserTemp)).then((res) => {
            if (res.payload.status) {
                setLoading(false);
                setShowAddAlias(false);
                getSelectedAlias();
            } else {
                setLoading(false);
            }
        });
    };

    const handleemailupdateChange = (e) => {
        let email_regex = /[.]+\w{2,5}$/
        if (!e.target.value.includes('@') || !email_regex.test(e.target.value)) {
            setemailerror('Invalid Email')
        }
        if (e.target.value.includes('@') && email_regex.test(e.target.value)) {
            setemailerror('')
        }
        setUser({
            ...user,
            email: e.target.value
                .trim()
                .replace(/\s+/g, " ")
                .toLowerCase(),
        });
    }

    const updateUser = () => {
        const regex_length = /^\d{1,10}$/
        const namePattern = /[!@#$%^&*(),.?":{}|<>]/
        if (!regex_length.test(user.phone) || namePattern.test(user.name) || namePattern.test(user.lastname) || !(user.name.length > 2) || !user.name || !(user?.lastname?.length > 2) || !user?.lastname) {
            // console.log("Calling")
            if (!regex_length.test(user.phone)) {
                setMobileError(true)
            }
            if (namePattern.test(user.name)) {
                setNameError(true)
                setNameErrorMessage("FirstName Doesn't Contain Special Characters")
            }
            if (namePattern.test(user.lastname)) {
                setLastNameError(true)
                setLastNameErrorMessage("LastName Doesn't Contain Special Characters")
            }
            if (!(user.name.length > 2) || !user.name) {
                setNameError(true)
                setNameErrorMessage("FirstName must contain at least 3 words")
            }
            if (!(user?.lastname?.length > 2) || !user?.lastname) {
                setLastNameError(true)
                setLastNameErrorMessage("LastName must contain at least 3 words")
            }
            return
        }
        if(user.email.toLowerCase() != oldMail.toLowerCase()){
            const payload = {
                email: user.email,
                userid: user.id
            }
            dispatch(verifyMailonUpdate(payload)).then((res)=>{
                setEmailVerification(true);
            });
        }
        if (user.email.includes('@') && /[.]+\w{2,5}$/.test(user.email)) {
            setLoading(true);
            if (image) {
                const profileObject = {
                    file_name: image.name,
                    file_type: image.type,
                    folder_path: `org/${currentOrganization}/profile/${userDetails.id}`,
                    user_id: userDetails.id,
                    org_id: currentOrganization,
                    file: image,
                };
                dispatch(profileUpload(profileObject)).then((res) => {
                    if (res.payload.status) {
                        dispatch(updateUserProfile({ ...user, avatar: `${res.payload.baseurl}${profileObject.folder_path}/${profileObject.file_name}` })).then((res) => {
                            if (res.payload.status) {
                                dispatch(getUserById(user.id));
                                setShowEdit(false);
                                setLoading(false);
                                // console.log("called1");
                            } else {
                                // console.log("called2");
                                setLoading(false);
                            }
                        });
                    }
                }).then(() => { setLoading(false) })
            } else {
                dispatch(updateUserProfile(user)).then((res) => {
                    if (res.payload.status) {
                        dispatch(getUserById(user.id));
                        setShowEdit(false);
                        setLoading(false);
                    } else {
                        setLoading(false);
                    }
                }).then(() => { setLoading(false) })
            }
            if (!user.email.includes('@')) {
                setemailerror('Invalid Email')
            }
        }
        dispatch(getUserById(user.id)).then(
            // window.location.reload()
        );
    };

    const profileSwitch = (type) => {
        let data;
        if (type === "switch") {
            data = { type: "switch", id: switchUser };
            dispatch(swichProfiles(data)).then((res) => {
                if (res.payload.status) {
                    window.location.reload();
                    setShowSwitchUser(false);
                }
            });
        } else {
            data = { type: "switchBack", id: parseInt(alaisUser) };
            dispatch(backToProfile(data)).then((res) => {
                if (res.payload.status) {
                    window.location.reload();
                    setShowSwitchUser(false);
                }
            });
        }
    };


    const handleImageChange = (event) => {
        const file = event.target.files[0];
        const imgname = event.target.files[0].name;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const maxSize = Math.max(img.width, img.height);
                canvas.width = maxSize;
                canvas.height = maxSize;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(
                    img,
                    (maxSize - img.width) / 2,
                    (maxSize - img.height) / 2
                );
                canvas.toBlob(
                    (blob) => {
                        const file = new File([blob], imgname, {
                            type: "image/png",
                            lastModified: Date.now(),
                        });

                        setImage(file);
                    },
                    "image/jpeg",
                    0.8
                );
            };
        };
    };

    const handleClick = (event) => {
        hiddenFileInput.current.click();
    };

    function capitalizeFirstLetterOfWords(str) {
        return str?.replace(/\b\w/g, function (match) {
            return match.toUpperCase();
        });
    }

    const [showPasswordError, setShowPasswordError] = useState(false)

    const handlePasswordValidation = (e) => {
        const isNonWhiteSpace = /^\S*$/;
        const isContainsUppercase = /^(?=.*[A-Z]).*$/;
        const isContainsLowercase = /^(?=.*[a-z]).*$/;
        const isContainsNumber = /^(?=.*[0-9]).*$/;
        const isContainsSymbol =
            /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
        const isValidLength = /^.{8,}$/;
        if (!isNonWhiteSpace.test(e.target.value)) {
            setPasswordError('Password must not contain Whitespaces.')
            setShowPasswordError(true)
            // return "Password must not contain Whitespaces.";
        }
        else if (!isContainsUppercase.test(e.target.value)) {
            // return "Password must have at least one Uppercase Character.";
            setPasswordError('Password must have at least one Uppercase Character.')
            setShowPasswordError(true)
        }
        else if (!isContainsLowercase.test(e.target.value)) {
            //return "Password must have at least one Lowercase Character.";
            setPasswordError('Password must have at least one Lowercase Character.')
            setShowPasswordError(true)
        }
        else if (!isContainsNumber.test(e.target.value)) {
            setPasswordError('Password must contain at least one Digit.')
            setShowPasswordError(true)
            // return "Password must contain at least one Digit.";
        }
        else if (!isContainsSymbol.test(e.target.value)) {
            setPasswordError('Password must contain at least one Special Symbol.')
            setShowPasswordError(true)
            // return "Password must contain at least one Special Symbol.";
        }
        else if (!isValidLength.test(e.target.value)) {
            setPasswordError("Password must be 8 Characters Long.")
            setShowPasswordError(true)
            // return "Password must be 10-16 Characters Long.";
        }
        else {
            setPasswordError('')
            setShowPasswordError(false)
        }

        setChangePasswordObj({
            ...changePasswordObj,
            newPassword: e.target.value,
        })
    }
    return (
        <div>
            <section className="breadcum_section">
                <Container fluid>
                    <Row className="align-items-center">
                        <Col lg={12}>
                            <h2 className="bs_title">Profile</h2>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* side profile card with img  starts hear */}
            <section className="profile-container">
                <Container fluid>
                    <Row>
                        <Col xl={3} lg={12} md={12}>
                            <Container fluid>
                                <Row className="bg-white py-4 p-0 rounded">
                                    <Col xl={12} lg={6} md={6} sm={6} xs={12}>
                                        <div className="profile-cards mt-4">
                                            <div className="profile-image justify-content-center d-flex">
                                                {image ? (
                                                    <img src={URL.createObjectURL(image)} alt="upload" className="img-display-after" />
                                                ) : (
                                                    userDetails?.avatar ? <img src={userDetails?.avatar} alt="user-img" className="img-display-before" /> : <span className="img-display-after bg-dark text-white rounded-circle p-5 fs-1" >{userDetails?.name?.charAt(0).toUpperCase() + userDetails?.lastname?.charAt(0).toUpperCase()}</span>
                                                )}
                                                <input
                                                    id="image-upload-input"
                                                    type="file"
                                                    accept=".jpg, .jpeg, .png"
                                                    onChange={handleImageChange}
                                                    ref={hiddenFileInput}
                                                    style={{ display: "none" }}
                                                    name="image-upload"
                                                />
                                                {showEdit &&
                                                    <button className="upload-icon-profile" onClick={handleClick}><BiPencil /></button>}
                                            </div>
                                        </div>
                                        <div className="profile-psnl-info py-4">
                                            <h5 className="text-center mb-1">
                                                {userDetails?.name} {userDetails?.lastname}
                                            </h5>
                                            <h6 className="text-center ttww">{designationDetails?.name}</h6>
                                        </div>
                                    </Col>
                                    <Col xl={12} lg={6} md={6} sm={6} xs={12}>
                                        <div className="profile-psnl-sides line ps-4 mt-4">
                                            <div className="profile-sideheads">Email</div>
                                            <h6 className="mt-2 text-break ttww">{userDetails?.email}</h6>
                                            <div className="profile-sideheads">Contact No</div>
                                            <h6 className="mt-2 ttww">+91 {userDetails?.phone}</h6>
                                        </div>
                                        <div className="profile-psnl-sides">
                                            {
                                                alaisUser && <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => profileSwitch("switchBack")}
                                                >
                                                    Back to profile
                                                </button>
                                            }
                                            {
                                                !alaisUser && switchUsers?.length > 0 && <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => setShowSwitchUser(true)}
                                                >
                                                    Switch User
                                                </button>
                                            }
                                        </div>
                                    </Col>
                                </Row>
                            </Container>
                            <div className="bg-white py-4 p-0 rounded d-none">
                                <Container fluid>
                                    <Col xl={12} lg={12} md={6} sm={6}>
                                        <div className="profile-cards mt-4">
                                            <div className="profile-image justify-content-center d-flex">
                                                {image ? (
                                                    <img src={URL.createObjectURL(image)} alt="upload" className="img-display-after" />
                                                ) : (
                                                    userDetails?.avatar ? <img src={userDetails?.avatar} alt="user-img" className="img-display-before" /> : <span className="img-display-after bg-dark text-white rounded-circle p-5 fs-1" >{userDetails?.name?.charAt(0).toUpperCase() + userDetails?.lastname?.charAt(0).toUpperCase()}</span>
                                                )}
                                                <input
                                                    id="image-upload-input"
                                                    type="file"
                                                    accept=".jpg, .jpeg, .png"
                                                    onChange={handleImageChange}
                                                    ref={hiddenFileInput}
                                                    style={{ display: "none" }}
                                                />
                                                {showEdit && <button
                                                    className="upload-icon-profile"
                                                    onClick={handleClick}>
                                                    {/* // onClick={() => inputFile.current.click()}> */}
                                                    <BiPencil />
                                                </button>}
                                            </div>
                                        </div>
                                        {/* </div> */}
                                        <div className="profile-psnl-info my-4">
                                            <h5 className="text-center mb-1">
                                                {userDetails?.name} {userDetails?.lastname}
                                            </h5>
                                            <h6 className="text-center">{designationDetails?.name}</h6>
                                        </div>
                                        <hr />
                                    </Col>
                                    <Col xl={12} lg={12} md={6}>
                                        <div className="profile-psnl-sides line ps-4 mt-4">
                                            <div className="profile-sideheads">Email</div>
                                            <h6 className="mt-2 text-break">{userDetails?.email}</h6>

                                            <div className="profile-sideheads">Contact No</div>
                                            <h6 className="mt-2">+91 {userDetails?.phone}</h6>
                                        </div>
                                        <div className="profile-psnl-sides">
                                            {
                                                alaisUser && <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => profileSwitch("switchBack")}
                                                >
                                                    Back to profile
                                                </button>
                                            }
                                            {
                                                !alaisUser && switchUsers?.length > 0 && <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => setShowSwitchUser(true)}
                                                >
                                                    Switch User
                                                </button>
                                            }

                                        </div>
                                    </Col>
                                </Container>
                                {/* </div> */}
                            </div>
                        </Col>
                        <Col xl={9} lg={12} md={12} className="pt-xl-0 pt-lg-3">
                            <div className="user-tabs">
                                <Tabs defaultActiveKey="userInfo" id="uncontrolled-tab-example" className="mb-3 profile-tabs cust-tabbed-menu">
                                    <Tab eventKey="userInfo" title="User Info">
                                        <Card className="no-border-card">
                                            <Card.Body className="profile-content">
                                                <Container fluid>
                                                    <Row>
                                                        <Col xl={6} lg={12} md={12} className="me-2 ms-4  ms-md-0 basic-details-div">
                                                            <Row className="align-items-center">
                                                                <Col xl={4} lg={4} md={6}>
                                                                    <h4 className="profile-label">
                                                                        <BiUserCircle /> Profile
                                                                    </h4>
                                                                </Col>
                                                                <Col xl={8} lg={8} md={6} className="d-flex justify-content-end">
                                                                    {!alaisUser && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn change-password_refer p-2 px-3"
                                                                            onClick={() => { return setChangePassword(true),setPasswordError('')}}
                                                                        >
                                                                            <FiUnlock /> &nbsp; change password
                                                                        </button>
                                                                    )}
                                                                </Col>
                                                            </Row>
                                                            <Row className="mt-4">
                                                                <h4 className="profile-heading">Basic Details</h4>
                                                            </Row>
                                                            <Row className="mt-2">
                                                                <Col xl={7} lg={7} md={7}>
                                                                    <div className="profile-sideheads">User ID</div>
                                                                    <h6 className="profile-details">#{user?.id}</h6>
                                                                </Col>
                                                                <Col xl={5} lg={5} md={5}>
                                                                    <div className="profile-sideheads">Role</div>
                                                                    <h6 className="profile-details">{capitalizeFirstLetterOfWords(role?.name)}</h6>
                                                                </Col>
                                                            </Row>
                                                            <Row className="mt-2">
                                                                <Col xl={7} lg={7} md={7}>
                                                                    <div className="profile-sideheads">
                                                                        First Name
                                                                    </div>
                                                                    {showEdit ? (
                                                                        <>
                                                                            <Form.Control
                                                                                required
                                                                                onChange={(e) => {
                                                                                    setUser({
                                                                                        ...user,
                                                                                        name: e.target.value
                                                                                            .trim()
                                                                                            .replace(/\s+/g, " ")
                                                                                            .toLowerCase(),
                                                                                    });
                                                                                }}
                                                                                onFocus={() => setNameError(false)}
                                                                                value={user.name}
                                                                                type="text"
                                                                            />
                                                                            {nameError && <span className="text-danger">{nameErrorMessage}</span>}
                                                                        </>
                                                                    ) : (
                                                                        <h6 className="profile-details">{capitalizeFirstLetterOfWords(user?.name)}</h6>
                                                                    )}
                                                                </Col>
                                                                <Col xl={5} lg={5} md={5}>
                                                                    <div className="profile-sideheads">Last Name</div>
                                                                    {showEdit ? (
                                                                        <>
                                                                            <Form.Control
                                                                                required
                                                                                onChange={(e) => {
                                                                                    setUser({
                                                                                        ...user,
                                                                                        lastname: e.target.value
                                                                                            .trim()
                                                                                            .replace(/\s+/g, " ")
                                                                                            .toLowerCase(),
                                                                                    });
                                                                                }}
                                                                                onFocus={() => setLastNameError(false)}
                                                                                value={user?.lastname}
                                                                                type="text"
                                                                            />
                                                                            {lastNameError && <span className="text-danger">{lastNameErrorMessage}</span>}
                                                                        </>
                                                                    ) : (
                                                                        // <h6 className="profile-details">{user.lastname}</h6>
                                                                        <h6 className="profile-details">{capitalizeFirstLetterOfWords(user?.lastname)}</h6>
                                                                    )}
                                                                </Col>
                                                            </Row>
                                                            <Row className="mt-2">
                                                                <Col lg={7} md={7} sm={7} xs={7}>
                                                                    <div className="profile-sideheads">Email ID</div>
                                                                    {showEdit ? (
                                                                        <>
                                                                            <Form.Control
                                                                                type="email"
                                                                                value={user.email}
                                                                                required
                                                                                onChange={handleemailupdateChange}

                                                                            />
                                                                            <p className="text-danger">{emailerror}</p>
                                                                        </>
                                                                    ) : (
                                                                        <h6 className="profile-details">{user?.email}</h6>
                                                                    )}
                                                                </Col>
                                                                <Col lg={5} md={5} sm={5} xs={5}>
                                                                    <div className="profile-sideheads">
                                                                        Contact No
                                                                    </div>
                                                                    {showEdit ? (
                                                                        <>
                                                                            <Form.Control
                                                                                required
                                                                                onChange={(e) => {
                                                                                    const regex = /\d*[\b]*/; // only allow numbers or backspace (\b)
                                                                                    const inputValue = e.target.value;
                                                                                    if (inputValue.length > 10 || inputValue.length < 10) {
                                                                                        setMobileError(true)
                                                                                    }
                                                                                    if (inputValue.length == 10) {
                                                                                        setMobileError(false)
                                                                                    }
                                                                                    if (regex.test(inputValue)) {
                                                                                        setUser({
                                                                                            ...user,
                                                                                            phone: e.target.value
                                                                                                .trim()
                                                                                                .replace(/\s+/g, " ")
                                                                                                .toLowerCase(),
                                                                                        });
                                                                                    }

                                                                                }}
                                                                                onFocus={() => setMobileError(false)}
                                                                                value={user.phone}
                                                                                type="tel"
                                                                                // pattern="[0-9]{1,10}"
                                                                                maxlength="10"
                                                                            />
                                                                            {mobileError && <span className="text-danger">Invalid Mobile Number</span>}
                                                                        </>
                                                                    ) : (
                                                                        <h6 className="profile-details">+91 {user?.phone}</h6>
                                                                    )}
                                                                </Col>
                                                            </Row>
                                                            <div className="mt-2">
                                                                {showEdit ? (
                                                                    <>
                                                                        <Button
                                                                            className="dark-btn btn btn-secondary"
                                                                            onClick={onCancelChange}
                                                                        >
                                                                            Cancel
                                                                        </Button>{" "}
                                                                        <Button
                                                                            variant="primary"
                                                                            type="submit"
                                                                            disabled={loading}
                                                                            onClick={updateUser}
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
                                                                                <span> Update</span>
                                                                            )}
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    !alaisUser && (
                                                                        <div className="profile-buttons">
                                                                            <button
                                                                                onClick={() => {setShowEdit(true); setOldMail(user.email)}}
                                                                                type="button"
                                                                                className="btn btn-primary"
                                                                            >
                                                                                Edit Profile
                                                                            </button>
                                                                            <button
                                                                                onClick={opensweetalert}
                                                                                type="button"
                                                                                className="btn btn-primary"
                                                                            >
                                                                                Delete Account
                                                                            </button>
                                                                            {/* <Modal show={showDelete} backdrop="static" keyboard={false} centered>
                                                                    <Modal.Header closeButton>
                                                                        <Modal.Title>Are you sure ?</Modal.Title>
                                                                    </Modal.Header>

                                                                    <Modal.Footer>
                                                                        <Button variant="secondary" onClick={() => setShowDelete(false)}>No</Button>
                                                                        <Button variant="primary" onClick={() => setShowYes(true)} >Yes</Button>
                                                                    </Modal.Footer>
                                                                </Modal>


                                                                <Modal show={showyes} backdrop="static" keyboard={false} centered>
                                                                    <Modal.Header closeButton>
                                                                        <Modal.Title>Please contact Administrator</Modal.Title>
                                                                    </Modal.Header>

                                                                    <Modal.Footer>
                                                                      
                                                                        <Button variant="primary" onClick={() => profileDelete()}>OK</Button>
                                                                    </Modal.Footer>
                                                                </Modal> */}



                                                                        </div>



                                                                )
                                                            )}
                                                        </div>
                                                    </Col>
                                                    <Col xl={5} lg={12}>
                                                        <div className="p-xl-5 pe-xl-0  p-lg-0 work-details">
                                                        <Row className="mt-3">
                                                            <h4 className='profile-heading'>Professional Details</h4>
                                                        </Row>
                                                        <Row className="mt-2">
                                                            <Col xl={7} lg={7} md={7}>
                                                                <div className="profile-sideheads">
                                                                    Organization Name
                                                                </div>
                                                                {/* <h6 className="profile-details">{orgDetails?.name?.charAt(0).toUpperCase() +  orgDetails?.name?.slice(1)}</h6> */}
                                                                <h6 className="profile-details">{capitalizeFirstLetterOfWords(orgDetails?.name)}</h6>
                                                            </Col>
                                                            <Col xl={5} lg={5} md={5}>
                                                                <div className="profile-sideheads">Role</div>
                                                                <h6 className="profile-details">{role?.name?.charAt(0).toUpperCase() + role?.name?.slice(1)}</h6>
                                                            </Col>
                                                        </Row>
                                                        <Row className="mt-2">
                                                            <Col xl={7} lg={7} md={7}>
                                                                <div className="profile-sideheads">
                                                                    Department
                                                                </div>
                                                                <h6 className="profile-details">{departmentDetails?.name?.charAt(0).toUpperCase() + departmentDetails?.name?.slice(1)}</h6>
                                                            </Col>
                                                            <Col xl={5} lg={5} md={5}>
                                                                <div className="profile-sideheads">
                                                                    Designation
                                                                </div>
                                                                <h6 className="profile-details">{designationDetails?.name?.charAt(0).toUpperCase() + designationDetails?.name?.slice(1)}</h6>
                                                            </Col >
                                                        </Row>
                                                        {/* <div className="row mt-2">
                                                            {reportingManagerDetails && (
                                                                <div className="col-xl-7 col-lg-7 col-md-7">
                                                                    <label className="profile-sideheads">
                                                                        Organization Name
                                                                    </label>
                                                                    {/* <h6 className="profile-details">{orgDetails?.name?.charAt(0).toUpperCase() +  orgDetails?.name?.slice(1)}</h6> */}
                                                                    {/* <h6 className="profile-details">{capitalizeFirstLetterOfWords(orgDetails?.name)}</h6>
                                                                </div>
                                                                <div className="col-6 col-sm-12 col-lg-6">
                                                                    <label className="profile-sideheads">Role</label>
                                                                    <h6 className="profile-details">{role?.name?.charAt(0).toUpperCase() + role?.name?.slice(1)}</h6>
                                                                </div>
                                                            </div>  */}
                                                           
                                                            <Row className="mt-2">
                                                                {reportingManagerDetails && (
                                                                    <Col xl={7} lg={7} md={7}>
                                                                        <div className="profile-sideheads">
                                                                            Reporting Manager
                                                                        </div>
                                                                        <h6 className="profile-details">{reportingManagerDetails?.name} {reportingManagerDetails?.lastname}</h6>
                                                                    </Col>
                                                                )}
                                                                <Col xl={5} lg={5} md={5}>
                                                                    <div className="profile-sideheads">Location</div>
                                                                    <h6 className="profile-details">{locaionDetails?.name?.charAt(0).toUpperCase() + locaionDetails?.name?.slice(1)}</h6>
                                                                </Col>
                                                            </Row>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Container>
                                            </Card.Body>
                                        </Card>
                                    </Tab>

                                    {(roleName === 'owner' || roleName === 'admin') && (
                                        <Tab eventKey="aliasUser" title="Alias Profile">
                                            <Card className="no-border-card">
                                                <Card.Body>
                                                    <Row>
                                                        <Col>
                                                            <div className="d-flex align-items-center justify-content-between"> 
                                                                <h4 className="profile-label">
                                                                <BiUserCircle />
                                                                Alias Profile
                                                            </h4>
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary"
                                                                onClick={() => setShowAddAlias(true)}
                                                            >
                                                                Update Alias Users
                                                            </button>
                                                            </div>
                                                        </Col>
                                                        <h4 className="profile-sideheads black mb-3">
                                                            List Of Users ({fecthAliasLength(aliasUsers)})
                                                        </h4>
                                                        <ul className="alias-user-lists">
                                                            {aliasUsers?.length > 0
                                                                ? aliasUsers?.map((item) => {
                                                                    return fetchUser(item);
                                                                })
                                                                : <div className="d-flex align-items-center"> No Alias Users</div>}
                                                        </ul>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        </Tab>
                                    )}
                                </Tabs>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
            {/* user-tabs  ends hear */}
            <Offcanvas
                show={showAddAlias}
                onHide={() => {
                    setShowAddAlias(false);
                    getSelectedAlias();
                }}
                backdrop="static"
                placement="end"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Add Alias User</Offcanvas.Title>
                </Offcanvas.Header>
                <hr />
                <div className="alias-user-search white-bg py-2 px-2">
                    <input
                        className="form-control"
                        type="search"
                        placeholder="Search User"
                        aria-label="Search"
                        onChange={(e) => {
                            setExceptedUsersPayload({
                                ...exceptedUsersPayload,
                                name: e.target.value,
                            });
                        }}
                        name="profile_search"
                    />
                </div>
                <Offcanvas.Body className="py-1">
                    <div className="row org-checkbox-container">

                        {exceptedUsers.length > 0
                            ? exceptedUsers?.map((item, key) => {
                                return (
                                  item.id !== userDetails.id &&
                                  myTeamIds?.includes(item.id) && (
                                    <div
                                      className="col-12 p-1"
                                      onClick={() =>
                                        updateSelectedUser(item.id)
                                      }
                                    >
                                      <label className="alias-user-sidecard">
                                        <div
                                          className={
                                            seledtedUser?.includes(item.id)
                                              ? "org-list inner-div"
                                              : "org-list"
                                          }
                                        >
                                          <div className="alias-img">
                                            {/* <img src={profile} className="alias-avatar" /> */}
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
                                          </div>
                                          <div className="alias-content">
                                            <h5>
                                              {item.name} {item.lastname}
                                              <span>
                                                {fetchDesignation(item.id)}
                                              </span>
                                            </h5>
                                          </div>
                                        </div>
                                      </label>
                                    </div>
                                  )
                                );
                            })
                            : "No Users Found"}
                    </div>
                </Offcanvas.Body>
                <div className="offcanvas-footer">
                    <div className="d_aic_jcc gap-2 m-2">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowAddAlias(false);
                                getSelectedAlias();
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                            onClick={aliasUserUpdate}
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
                                <span> Update</span>
                            )}
                        </Button>{" "}
                    </div>
                </div>
            </Offcanvas>
            <Offcanvas
                show={showSwitchUser}
                onHide={() => {
                    setShowSwitchUser(false);
                    setSwithUser();
                }}
                backdrop="static"
                placement="end"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Switch User</Offcanvas.Title>
                </Offcanvas.Header>
                <hr />
                <Offcanvas.Body>
                    <div className="row p-1">
                        <input
                            className="form-control switch-user-search"
                            type="search"
                            placeholder="Search User"
                            aria-label="Search"
                            onChange={(e) => {
                                setExceptedUsersPayload({
                                    ...exceptedUsersPayload,
                                    name: e.target.value,
                                });
                            }}
                            name="user-search"
                        />
                        {switchUsers?.length > 0
                            ? switchUsers?.map((item, key) => {
                                return fetchSwithUsers(item);
                            })
                            : "No Users Found"}
                    </div>
                </Offcanvas.Body>
                <div className="offcanvas-footer d-flex justify-content-center white-bg">
                    <div className="d-flex align-self-center w-100 m-2">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowSwitchUser(false);
                                setSwithUser();
                            }}
                        >
                            Close
                        </Button>
                        {
                            switchUsers?.length > 0 && <Button
                                disabled={!switchUser}
                                variant="primary"
                                type="submit"
                                onClick={() => profileSwitch("switch")}
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
                                    <span> Switch Profile</span>
                                )}
                            </Button>
                        }
                    </div>
                </div>

            </Offcanvas>

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
            Verification mail sent to {user?.email}
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

            <Modal
                className="change-paswrd-modal"
                show={showChangePassword}
                centered
                backdrop="static"
                onHide={() => {
                    setChangePassword(false);
                    setShowError(false);
                    setPasswordError('');
                    setChangePasswordObj({});
                }}
            >
                <Form onSubmit={(e) => updatePassword(e)} autoComplete="off">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FiUnlock />
                            Change Password
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3 mt-3" controlId="formBasicEmail">
                                    <Form.Label>Existing Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={existingPassType ? 'text' : 'password'}
                                            required
                                            onChange={(e) =>
                                                setChangePasswordObj({
                                                    ...changePasswordObj,
                                                    currentPassword: e.target.value,
                                                })
                                            }
                                        />
                                        <InputGroup.Text id="inputGroupPrepend" onClick={() => setExistingPassType(!existingPassType)}>
                                            {/* <AiFillEye/> */}
                                            {existingPassType ? <AiFillEye /> : <AiFillEyeInvisible />}
                                        </InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={6}>
                                <Form.Group className="mb-3 mt-3" controlId="formBasicEmail">
                                    <Form.Label>New Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={newPassType ? 'text' : 'password'}
                                            required
                                            onChange={handlePasswordValidation}
                                        // onChange={(e) =>
                                        //     setChangePasswordObj({
                                        //         ...changePasswordObj,
                                        //         newPassword: e.target.value,
                                        //     })
                                        // }
                                        />

                                        <InputGroup.Text id="inputGroupPrepend" onClick={() => setNewPassType(!newPassType)}>
                                            {/* <AiFillEye/> */}
                                            {newPassType ? <AiFillEye /> : <AiFillEyeInvisible />}
                                        </InputGroup.Text>
                                    </InputGroup>
                                    <small style={{ color: 'red', fontSize: 10 }}>{showPasswordError && passwordError}</small>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group className="mb-3 mt-3" controlId="formBasicEmail">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        required
                                        onChange={(e) =>
                                            setChangePasswordObj({
                                                ...changePasswordObj,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        {showError && (
                            <p style={{ color: "red" }}>Passwords Doesn't Match</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            className="dark-btn btn btn-secondary"
                            variant="secondary"
                            onClick={() => {
                                setChangePassword(false);
                                setPasswordError('');
                                setShowError(false);
                            }}
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
                                <span> Update</span>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}
