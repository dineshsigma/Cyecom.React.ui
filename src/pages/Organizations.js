import {
  Col,
  Row,
  Button,
  Spinner,
  Modal,
  Form,
  Offcanvas,
  Dropdown, Card
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setOrganizationAddform,
  sendCreateOrgOtp,
  createOrganization,
  setOrganizationButtonLoading,
  getOrganizations,
  activateDeactivate,
  update_Organization,
} from "../redux/reducers/organizationReducer";
import { avatarBrColors } from "../environment";
import { useNavigate } from "react-router-dom";
import { logOut } from "../redux/reducers/authReducer";
import {
  FaRegTimesCircle,
  FaSearch,
  FaEdit,
  FaEllipsisV,
  FaArrowLeft,
} from "react-icons/fa";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import DropdownButton from 'react-bootstrap/DropdownButton';
import SplitButton from 'react-bootstrap/SplitButton';


import { getLocations } from "../redux/reducers/locationsReducer";
import OTPInput, { ResendOTP } from "otp-input-react";
import Avatar from "../components/Avatar";
import NoDataFound from "../assets/No_Data_File.png";
import LoaderComponent from "../components/Loader";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import Swal from "sweetalert2";
import { getConfigurationQuery } from '../redux/reducers/organizationReducer';
import Multiselect from 'multiselect-react-dropdown';
import { getPermissionsByRole } from "../redux/reducers/rolesReducer";

function Organizations() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filterSearch, setFilter] = useState("");
  const userId = useSelector((state) => state.auth.user_id);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const addOrganizationForm = useSelector(
    (state) => state.organization.showAddForm
  );
  const [headQuarters, setHeadQuarters] = useState("");
  const loading = useSelector((state) => state.organization.buttonLoading);
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const organizationsList = useSelector(
    (state) => state.organization.organizationsList
  );
  // const loader = useSelector((state) => state.organization.loader);
  const [loader,setLoader]=useState(true);
  const [optLoading, setOtpLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showPincodeError, setShowPincodeError] = useState(false);
  const [updateData, setUpdateData] = useState();
  const [createOrgObj, setCreateObj] = useState({
    uni_code: "",
    name: "",
    email: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    language: "",
    contact_no: "",
    domain_name: "",
    segment_type: "",
    time_zone: "",
    business_type: "",
    logo: "",
  });
  const [headQuarter, setHeadQuarter] = useState();
  const [showVerifyDialog, setVerifyDialog] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [verifyOtpDialog, setVerifyOtpDialog] = useState(false);
  const [dialogText, setDialogText] = useState("");
  const [selectedOrg, setSelectedOrg] = useState({});
  const [activeOtp, setActiveOtp] = useState();
  const locationsList = useSelector((state) => state.location.locationsList);
  const [counter, setCounter] = useState(60);
  const [resendOtpLoading, setResendOtpLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  }); //both to get organizations and to filter data
  const [updateOrganization, setUpdateOrganization] = useState(false);
  const currentOrganization = useSelector(
    (state) => state.auth.current_organization
  );
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const userOrgData = useState(localStorage.getItem("userOrgData")&&JSON.parse(localStorage.getItem("userOrgData")));
  // const permissions = useState(JSON.parse(localStorage.getItem("permissions")));
  const [permissions, setPermissions] = useState();
  const [orgPermissions, setOrgPermissions] = useState();
  const getConfigaration = useSelector((state) => state.organization.configation);
  const uniqueBusinessTypes = [...new Set(getConfigaration.map((item) => item.busssiness_type))];
  const segmentTypes = getConfigaration
    .filter((config) => config.busssiness_type
      == createOrgObj.business_type)
    .map((config) => config.segment_type);


  //to get Permissions for announcements
  useEffect(() => {
    // setOrgPermissions(
    //   permissions?.[0].find((item) => item.table == "organization")
    // );
    dispatch(getPermissionsByRole(userOrgData[0]?.role_id)).then((res) => {
      setPermissions(res.payload);
    });
  }, []);

  useEffect(() => {
    // let permission = permissions?.[0];
    setOrgPermissions(
      permissions?.find((item) => item.table == "organization")
    );
  },[permissions])

  //to invoke Sweet Alert
  useEffect(() => {
    if (orgPermissions?.view == false) {
      opensweetalert();
    }
  }, [orgPermissions]);

  const opensweetalert = () => {
    Swal.fire({
      title: "Access Denied !",
      icon: "warning",
      showCancelButton: false,
      showConfirmButton: false,
    });
  };

  useEffect(() => {
    dispatch(getLocations(""));
    dispatch(getUserOrgByid(userData?.[0].id));
    dispatch(getConfigurationQuery());
  }, []);

  useEffect(() => {
    dispatch(getOrganizations(organizationsdata)).then(res=>setLoader(false));
  }, [organizationsdata]);

  useEffect(() => {
    if (locationsList?.length > 0) {
      getHeadQuarterData();
    }
  }, [locationsList]);

  const userLogout = (event) => {
    dispatch(logOut());
    navigate("/");
  };

  const getHeadQuarterData = () => {
    const data = locationsList?.filter((item) => item.is_primary == true);
    setHeadQuarter(data[0].name);
  };

  const addOrganization = (event) => {
    dispatch(setOrganizationButtonLoading(true));
    event.preventDefault();
    let body = {
      organization: createOrgObj,
      headquarter_location_name: headQuarters,
      user_id: userId,
      subscription: {
        plan_type: "free",
        subscription_months: "6",
      },
      otps: {
        client_type: "",
        phoneotp: phoneOtp,
        emailotp: emailOtp,
      },
    };

    dispatch(createOrganization(body)).then((res) => {
      if (res.payload.status) {
        setVerifyDialog(false);
        dispatch(setOrganizationButtonLoading(false));
        userLogout(event);
      } else {
        dispatch(setOrganizationButtonLoading(false));
      }
    });
  };

  const sendOtp = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
      setShowBusinessError(true)
      setShowSegmentError(true)
    } else {
      if (createOrgObj.business_type.length == 0) {
        // console.log("segment eroor")
        setShowBusinessError(true)
        setOtpLoading(false)
        return;
      }
      else if (createOrgObj.segment_type.length == 0) {
        setShowSegmentError(true)
        // console.log("business eroor")
        setOtpLoading(false)
        return;

      }
      event.preventDefault();
      setOtpLoading(true);
      let body = {
        client_type: "",
        phone: userDetails.phone,
        email: userDetails.email,
      };

      dispatch(sendCreateOrgOtp(body)).then((response) => {
        if (response.payload.status) {
          toast.success(response.payload.message);
          setInterval(() => {
            setCounter((time) => time > 0 && time - 1);
          }, 1000);
          setVerifyDialog(!showVerifyDialog);
          setOtpLoading(false);
          setValidated(false);
          setShowBusinessError(false)
          setShowSegmentError(false)
        } else {
          toast.error(response.payload.message);
          setOtpLoading(false);
          setValidated(false);
        }
        setOtpLoading(false);
      });
    }
  };

  const activateDeactivateOrg = (e) => {
    setOtpLoading(true);
    e.preventDefault();
    if (activeOtp === "000000") {
      dispatch(activateDeactivate(selectedOrg)).then((res) => {
        if (res.payload.status) {
          setLoader(true)
          dispatch(getOrganizations(organizationsdata)).then(res=>setLoader(false));
          setVerifyOtpDialog(false);
          setActiveOtp();
          setOtpLoading(false);
        }
      });
    } else {
      toast.error("Invalid Otp");
      setOtpLoading(false);
    }
  };
  //sets state with upadte Data
  const updateOrganizationData = (org) => {
    setUpdateOrganization(true);
    setCreateObj({
      ...createOrgObj,
      uni_code: org.uni_code,
      id: org.id,
      name: org.name,
      email: org.email,
      address: org.address,
      district: org.district,
      state: org.state,
      pincode: org.pincode,
      language: "",
      contact_no: org.contact_no,
      domain_name: org.domain_name,
      segment_type: org.segment_type,
      time_zone: org.time_zone,
      business_type: org.business_type,
      logo: "",
    });
  };

  //Sets State to empty while hiding offCanvas
  const setCreateOrgData = () => {
    setCreateObj({
      uni_code: "",
      name: "",
      email: "",
      address: "",
      district: "",
      state: "",
      pincode: "",
      language: "",
      contact_no: "",
      domain_name: "",
      segment_type: "",
      time_zone: "",
      business_type: "",
      logo: "",
    });
  };

  const verifyDialog = (org, item) => {
    if (item == "active") {
      setSelectedOrg(org);
      setVerifyOtpDialog(!verifyOtpDialog);
      item === "active"
        ? setDialogText("Activate")
        : setDialogText("Deactivate");
      toast.success("Otp Send Sucessfully");
    }
    if (item == "deactive") {
      const data = organizationsList.filter((item) => item.is_active == true);
      if (data.length > 1) {
        setSelectedOrg(org);
        setVerifyOtpDialog(!verifyOtpDialog);
        item === "active"
          ? setDialogText("Activate")
          : setDialogText("Deactivate");
        toast.success("Otp Send Sucessfully");
      } else {
        toast.error("Unable to deactiavte");
      }
    }
  };

  //Updates The Organization Data
  const UpdateOrg = (e) => {
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setValidated(true);
    } else {
      e.preventDefault();
      setValidated(false);
      dispatch(update_Organization(createOrgObj)).then((res) => {
        setUpdateOrganization(false);
        setCreateOrgData();
        setLoader(true)
        dispatch(getOrganizations(organizationsdata)).then(res=>setLoader(false));
      });
    }
  };
  const resendOtp = (e) => {
    e.preventDefault();
    setResendOtpLoading(true);
    let body = {
      client_type: "",
      phone: userDetails.phone,
      email: userDetails.email,
    };
    dispatch(sendCreateOrgOtp(body)).then((response) => {
      if (response.payload.status) {
        toast.success(response.payload.message);
        setResendOtpLoading(false);
      } else {
        toast.error(response.payload.message);
        setResendOtpLoading(false);
      }
      setOtpLoading(false);
    });
  };

  const [showBusinessError, setShowBusinessError] = useState(false);
  const [showSegmentError, setShowSegmentError] = useState(false)

  return (
    <div>
      <section className="breadcum_section">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between">
            <div className="col-xl-5 col-lg-5 col-md-5">
              <div className="d-flex align-items-center gap-3 masterback-btn">
                <Button
                  className="primary_btn white_btn d_aic_jcc"
                  variant="light"
                  size="md"
                  onClick={() => navigate("/master")}
                >
                  <FaArrowLeft />
                </Button>
                <h2 className="bs_title">Organizations</h2>
              </div>
            </div>
            <div className="col-xl-7 col-lg-7 col-md-7">
              <div className="aside_left d-flex align-items-center justify-content-end gap_05rm">
                <div className="search-box">
                  <input
                    className="form-control text"
                    type="text"
                    name="Organization-search"
                    placeholder="Search here"
                    autoFocus
                    onChange={(e) => {
                      setorganizations({
                        ...organizationsdata,
                        name: e.target.value,
                      });
                    }}
                  />
                  <button type="button">
                    <FaSearch />
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-primary disable-btn"
                  onClick={() =>
                    dispatch(setOrganizationAddform(!addOrganizationForm))
                  }
                  disabled={orgPermissions?.create == false}
                >
                  Create Organization
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loader ? (<LoaderComponent />) : orgPermissions?.view == true ? (
        <section>
          <div className="container-fluid">
            <div className="row">
              {organizationsList?.length > 0 ? (
                organizationsList?.map((org, key) => {
                  return (
                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 col-12" id={key}>
                      <Card className=" master-global-card mb-4">
                        <Card.Body className="d-flex align-items-center gap-2 master-card">
                          <div className="Avatar_width">
                            <Avatar
                              size="medium"
                              color={
                                avatarBrColors[
                                Math.floor(
                                  Math.random() * avatarBrColors.length
                                )
                                ]
                              }
                              initials={org.name.substring(0, 2).toUpperCase()}
                            ></Avatar>
                            {/* <span className="org-active "></span> */}
                            {org.is_active ? (
                              <span className="org-active "></span>
                            ) : (
                              <span className="org-in-active">
                                <FaRegTimesCircle />
                              </span>
                            )}
                          </div>
                          <div className="content org-content">
                            <h3 className="org-name ttww m-0">
                              {org.name}
                            </h3>
                            <h6>{org.district}</h6>
                            {/* <Badge className="bdg-success subscription-label mt-2">Paid</Badge>
                                                        <Badge className="bdg-free subscription-label mt-2">Free</Badge> */}
                          </div>
                          {/* <div className="users-dropdown ms-2"> */}
                          <Form.Check
                            checked={org.is_active}
                            onChange={() => {
                              org.is_active
                                ? verifyDialog(org, "deactive")
                                : verifyDialog(org, "active");
                            }}
                            type="switch"
                            id="custom-switch"
                          />
                          <div>
                            {["start"].map((direction) => (
                              <>
                                <DropdownButton id="dropdown-menu-align-start" drop={direction} title={<FaEllipsisV className="faelli" />}>
                                  <div className="d_aic_jcc">
                                    <Dropdown.Item
                                      onClick={() =>
                                        updateOrganizationData(org)
                                      }
                                      disabled={orgPermissions?.update == false}
                                    >
                                      <FaEdit className="dropdown-btnicon" />
                                    </Dropdown.Item>
                                  </div>
                                </DropdownButton>
                              </>
                            ))}
                          </div>
                          {/* <Dropdown>
                                  <Dropdown.Toggle
                                    variant="success"
                                    id="dropdown-basic" 
                                    align="start"
                                  >
                                    <FaEllipsisV id="dropdown-basic" />
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item
                                      onClick={() =>
                                        updateOrganizationData(org)
                                      }
                                      disabled={orgPermissions?.update == false}
                                    >
                                      <FaEdit className="dropdown-btnicon" />
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown> */}

                          {/* <Dropdown>
                                  <Dropdown.Toggle variant="success" id="dropdown-basic"><FaEllipsisV id="dropdown-basic" /></Dropdown.Toggle>
                                    <Dropdown.Menu>
                                     {org.is_active ? <Dropdown.Item onClick={() => verifyDialog(org, 'deactive')} >Deactivate Organization</Dropdown.Item> : <Dropdown.Item onClick={() => verifyDialog(org, 'active')} >Activate Organization</Dropdown.Item>}
                                    </Dropdown.Menu>
                                </Dropdown> */}
                          {/* </div> */}
                        </Card.Body>
                      </Card>
                    </div>
                  );
                })
              ) : (
                <Col md={12} className="text-center"><img src={NoDataFound} height="500px" /></Col>
              )}
            </div>
          </div>
        </section>
      ) : (
        <Col md={12}>
          <img src={NoDataFound} height="500px" alt="NoDataFound" />
        </Col>)}

      <Offcanvas
        show={addOrganizationForm || updateOrganization}
        onHide={() => {
          dispatch(setOrganizationAddform(false));
          setValidated(false);
          setUpdateOrganization(false);
          setCreateOrgData();
        }}
        backdrop="static"
        placement="end"
        className="offcanvas_forms"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="offcanvas-title">
            <h2>
              {updateOrganization
                ? "Update Organization"
                : "Create Organization"}
            </h2>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="">
          <Form
            noValidate
            validated={validated}
            onSubmit={updateOrganization ? UpdateOrg : sendOtp}
          >
            <div className="offcanvas-scroll">
              <Form.Group
                as={Col}
                controlId="formGridEmail"
                className="formGroup"
              >
                <Form.Label className="star form-label">
                  Organization Code <b>*</b>
                </Form.Label>
                <Form.Control
                  required
                  value={createOrgObj.uni_code}
                  minLength={3}
                  maxLength={10}
                  pattern="^\S*$"
                  disabled={updateOrganization}
                  onChange={(e) => {
                    setCreateObj({
                      ...createOrgObj,
                      uni_code: e.target.value,
                    });
                  }}
                  type="text"
                />
                <Form.Control.Feedback type="invalid">
                  Organizaation code length must be grater than 3 lettrs and
                  spaces not Allowed
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                controlId="formGridEmail"
                className="formGroup"
              >
                <Form.Label className="star">
                  Organization Name <b>*</b>
                </Form.Label>
                <Form.Control
                  required
                  value={createOrgObj.name}
                  disabled={updateOrganization}
                  onChange={(e) => {
                    setCreateObj({ ...createOrgObj, name: e.target.value });
                  }}
                  type="text"
                />
                <Form.Control.Feedback type="invalid">
                  Enter Organization name
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                controlId="formGridEmail"
                className="formGroup"
              >
                <Form.Label className="star">
                  Organization Email <b>*</b>
                </Form.Label>
                <Form.Control
                  required
                  value={createOrgObj.email}
                  disabled={updateOrganization}
                  pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,63}$"
                  onChange={(e) => {
                    setCreateObj({
                      ...createOrgObj,
                      email: e.target.value.toLowerCase(),
                    });
                  }}
                  type="email"
                />
                <Form.Control.Feedback type="invalid">
                  Invalid Email
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                controlId="formGridEmail"
                className="formGroup"
              >
                <Form.Label className="star">
                  Head Quarters <b>*</b>
                </Form.Label>
                <Form.Control
                  required
                  disabled={updateOrganization}
                  value={updateOrganization ? headQuarter : headQuarters}
                  onChange={(e) => {
                    setHeadQuarters(e.target.value);
                  }}
                  type="text"
                />
                <Form.Control.Feedback type="invalid">
                  Enter Valid Head Quarters
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                controlId="formGridEmail"
                className="formGroup"
              >
                <Form.Label className="star">
                  Address <b>*</b>
                </Form.Label>
                <Form.Control
                  required
                  value={createOrgObj.address}
                  onChange={(e) => {
                    setCreateObj({
                      ...createOrgObj,
                      address: e.target.value,
                    });
                  }}
                  type="text"
                />
                <Form.Control.Feedback type="invalid">
                  Enter Valid Address
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                controlId="formGridEmail"
                className="formGroup"
              >
                <Form.Label className="star">
                  District <b>*</b>
                </Form.Label>
                <Form.Control
                  required
                  value={createOrgObj.district}
                  onChange={(e) => {
                    setCreateObj({
                      ...createOrgObj,
                      district: e.target.value,
                    });
                  }}
                  type="text"
                />
                <Form.Control.Feedback type="invalid">
                  Enter Valid District
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                controlId="formGridEmail"
                className="formGroup"
              >
                <Form.Label className="star">
                  State <b>*</b>
                </Form.Label>
                <Form.Control
                  required
                  value={createOrgObj.state}
                  onChange={(e) => {
                    setCreateObj({ ...createOrgObj, state: e.target.value });
                  }}
                  type="text"
                />
                <Form.Control.Feedback type="invalid">
                  Enter Valid State
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                controlId="formGridEmail"
                className="formGroup"
              >
                <Form.Label className="star">
                  Pincode <b>*</b>
                </Form.Label>
                <Form.Control
                  required
                  value={createOrgObj.pincode}
                  minLength={6}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  onChange={(e) => {
                    const pincode = e.target.value.slice(0, 6);
                    setCreateObj({ ...createOrgObj, pincode: pincode });
                  }}
                  type="text"
                />
                <Form.Control.Feedback type="invalid">
                  Invalid Pincode
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                controlId="formGridEmail"
                className="formGroup"
              >
                <Form.Label className="star">
                  Contact no. <b>*</b>
                </Form.Label>
                <Form.Control
                  required
                  value={createOrgObj.contact_no}
                  pattern="[6789][0-9]{9}"
                  minLength={10}
                  maxLength={10}
                  onChange={(e) => {
                    const phoneValue = e.target.value.slice(0, 10);
                    setCreateObj({ ...createOrgObj, contact_no: phoneValue });
                  }}
                  type="text"
                />
                <Form.Control.Feedback type="invalid">
                  Invalid Phone Number
                </Form.Control.Feedback>
              </Form.Group>
              {/* setCreateObj({ ...createOrgObj, contact_no: e.target.value }) */}
              <Form.Group
                as={Col}
                controlId="formGridEmail"
                className="formGroup"
              >
                <Form.Label className="star">
                  Domain Name <b>*</b>
                </Form.Label>
                <Form.Control
                  required
                  value={createOrgObj.domain_name}
                  onChange={(e) => {
                    setCreateObj({
                      ...createOrgObj,
                      domain_name: e.target.value,
                    });
                  }}
                  type="text"
                />
                <Form.Control.Feedback type="invalid">
                  Domain Name should have atleast minimum 3 letters
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                controlId="formGridState"
                id="formGridCheckbox"
                className="formGroup"
              >
                <Form.Label>Business Type </Form.Label>
                <Form.Group className="formGroup" controlId="">
                <Form.Select value={ createOrgObj.business_type} onChange={(e) => setCreateObj({ ...createOrgObj, business_type: e.target.value})}>
                <option value="" selected>
                    Choose Option
                  </option>
               { uniqueBusinessTypes.map((item)=>{
                  return <option value={item}>{item}</option>
                })
              }
                </Form.Select>
                  {/* <Multiselect id="orgBusiness" options={uniqueBusinessTypes} required  value={createOrgObj.business_type} singleSelect={true} onSelect={(e) => setCreateObj({ ...createOrgObj, business_type: e?.[0] })} avoidHighlightFirstOption={true} isObject={false} placeholder="Business Type" 
                  // defaultValue={
                  //   updateOrganization
                  //     ? createOrgObj.business_type
                  //     : "Choose..."
                     
                  // }
                  ></Multiselect> */}
                   {showBusinessError && createOrgObj.business_type.length == 0 && <span className="mt-4 text-danger">Please Enter Business Type</span>}

                </Form.Group>
                
                <Form.Group
                as={Col}
                controlId="formGridState"
                id="formGridCheckbox"
                className="formGroup"
              >
                <Form.Label>Segment Type </Form.Label>
                <Form.Group className="formGroup" controlId="">
                <Form.Select value={ createOrgObj.segment_type} onChange={(e) => setCreateObj({ ...createOrgObj, segment_type: e.target.value })}>
                <option value="" selected>
                    Choose Option
                  </option>
               { segmentTypes.map((item)=>{
                  return <option value={item}>{item}</option>
                })
              }
                </Form.Select>
                  {/* <Multiselect options={segmentTypes} singleSelect={true} onSelect={(e) => setCreateObj({ ...createOrgObj, segment_type: e?.[0] })} avoidHighlightFirstOption={true} isObject={false} placeholder="Segment Type" disable={createOrgObj.business_type == ""}></Multiselect> */}
                  {showBusinessError && setShowSegmentError && createOrgObj.segment_type.length == 0 && <span className="mt-4 text-danger">Please Enter Business Type</span>}
                </Form.Group>
                {/* <Form.Select
                  required
                  onChange={(e) => {
                    setCreateObj({
                      ...createOrgObj,
                      segment_type: e.target.value,
                    });
                  }}
                  defaultValue={
                    updateOrganization ? createOrgObj.segment_type : "Choose..."
                  }
                >
                  <option value={"segment1"}>Segment 1</option>
                  <option value={"segment2"}>Segment 2</option>
                  <option value={"segment3"}>Segment 3</option>
                </Form.Select> */}
              </Form.Group>
                {/* <Form.Select
                  required
                  onChange={(e) => {
                    setCreateObj({
                      ...createOrgObj,
                      business_type: e.target.value,
                    });
                  }}
                  defaultValue={
                    updateOrganization
                      ? createOrgObj.business_type
                      : "Choose..."
                  }
                >
                  <option value={uniqueBusinessTypes}>Business 1</option>
                </Form.Select> */}
              </Form.Group>
              <Form.Group
                as={Col}
                controlId="formGridState"
                id="formGridCheckbox"
                className="formGroup"
              >
                <Form.Label>Segment Type </Form.Label>
                <Form.Group className="formGroup" controlId="">
                <Form.Select value={ createOrgObj.segment_type} onChange={(e) => setCreateObj({ ...createOrgObj, segment_type: e.target.value })}>
                <option value="" selected>
                    Choose Option
                  </option>
               { segmentTypes.map((item)=>{
                  return <option value={item}>{item}</option>
                })
              }
                </Form.Select>
                  {/* <Multiselect options={segmentTypes} singleSelect={true} onSelect={(e) => setCreateObj({ ...createOrgObj, segment_type: e?.[0] })} avoidHighlightFirstOption={true} isObject={false} placeholder="Segment Type" disable={createOrgObj.business_type == ""}></Multiselect> */}
                  {showBusinessError && setShowSegmentError && createOrgObj.segment_type.length == 0 && <span className="mt-4 text-danger">Please Enter Business Type</span>}
                </Form.Group>
                {/* <Form.Select
                  required
                  onChange={(e) => {
                    setCreateObj({
                      ...createOrgObj,
                      segment_type: e.target.value,
                    });
                  }}
                  defaultValue={
                    updateOrganization ? createOrgObj.segment_type : "Choose..."
                  }
                >
                  <option value={"segment1"}>Segment 1</option>
                  <option value={"segment2"}>Segment 2</option>
                  <option value={"segment3"}>Segment 3</option>
                </Form.Select> */}
              </Form.Group>
              {/* {
                            !updateOrganization? <Form.Group as={Col} controlId="formGridState" id="formGridCheckbox" className="formGroup">

                            <Form.Label>Time Zone </Form.Label>
                                                    <Form.Select required onChange={(e) => { setCreateObj({ ...createOrgObj, time_zone: e.target.value }) }} defaultValue="Choose...">
                                <option value={'Asia/Kolkata'}>Asia/Kolkata</option>
                            </Form.Select>
                        </Form.Group>:""
                        } */}


            </div>

            <div className="d_aic_jcsb gap-2">
              <Button
                className="dark-btn offcanvas-btns"
                variant="secondary"
                onClick={() => {
                  dispatch(setOrganizationAddform(false));
                  setValidated(false);
                  setUpdateOrganization(false);
                  setCreateOrgData();
                }}
              >
                cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={optLoading}
                className=" offcanvas-btns"
              >
                {optLoading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <span> {updateOrganization ? "Update" : "Create"}</span>
                )}
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>

        {/* <Offcanvas.Header>
                    <Button variant="primary" type="submit" disabled={optLoading}>
                        {optLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> : <span> Create</span>}
                    </Button>
                </Offcanvas.Header> */}
      </Offcanvas>

      <Modal
        show={showVerifyDialog}
        centered
        backdrop="static"
        onHide={() => setVerifyDialog(!showVerifyDialog)}
        className="modal_forms modal-sm"
      >
        <Modal.Header closeButton>
          {/* <Modal.Title className="modal-title">
                        <h2>Verify OTP</h2>
                    </Modal.Title> */}
        </Modal.Header>

        <Modal.Body className="text-center">
          <h3 className="text-center title mb-4">Verify OTP</h3>
          <Form>
            <Form.Group
              className="formGroup"
              controlId="exampleForm.ControlInput1"
            >
              <Form.Label className="mb-3">Email OTP</Form.Label>
              <OTPInput
                className="form-controlz text-center OTPInput_center"
                value={emailOtp}
                onChange={setEmailOtp}
                autoFocus
                OTPLength={6}
                otpType="number"
              />
            </Form.Group>

            <Form.Group
              className="formGroup mb-0"
              controlId="exampleForm.ControlInput1"
            >
              <Form.Label className="mb-3">Phone OTP</Form.Label>
              <OTPInput
                className="form-controlz text-center OTPInput_center"
                value={phoneOtp}
                onChange={setPhoneOtp}
                autoFocus
                OTPLength={6}
                otpType="number"
              />
            </Form.Group>
          </Form>

          <div className="row">
            <div className="col-md-12">
              <div className="float-end pt-3">
                {counter > 0 ? (
                  <h6 className="otp_text">
                    Resend Otp in <span>{counter}</span> s
                  </h6>
                ) : resendOtpLoading ? (
                  <Spinner
                    className="m-3 org-creat-a"
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <Row>
                    <Col>
                      <div className="signup-link mt-3" size="lg">
                        <a
                          href="javascript:void(0)"
                          onClick={(e) => resendOtp(e)}
                        >
                          Resend Otp
                        </a>
                      </div>
                    </Col>
                  </Row>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="modal-footer-jcc border-0">
          <Button
            className="dark-btn"
            variant="secondary"
            onClick={() => setVerifyDialog(!showVerifyDialog)}
          >
            Close
          </Button>
          <Button
            onClick={addOrganization}
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
              <span> Verify</span>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={verifyOtpDialog}
        centered
        backdrop="static"
        onHide={() => setVerifyOtpDialog(!verifyOtpDialog)}
        className="modal_forms modal-sm"
      >
        <Form onSubmit={(e) => activateDeactivateOrg(e)}>
          <Modal.Header closeButton>
            {/* <Modal.Title className="modal-title text-center">
                            <h2 className="text-center">Do you Want to {dialogText} Organization</h2>
                        </Modal.Title> */}
          </Modal.Header>

          <Modal.Body className="text-center">
            <h3 className="text-center title mb-3">
              Do you want to {dialogText} Organization
            </h3>
            <Form.Group
              className="formGroup"
              controlId="exampleForm.ControlInput1"
            >
              <Form.Label className="mb-3">Enter OTP</Form.Label>
              <OTPInput
                className="form-controlz text-center OTPInput_center"
                value={activeOtp}
                onChange={setActiveOtp}
                autoFocus
                OTPLength={6}
                otpType="number"
                required
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="modal-footer-jcc border-0">
            <Button
              className="dark-btn"
              variant="secondary"
              onClick={() => setVerifyOtpDialog(!verifyOtpDialog)}
            >
              Cancel
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
                <span> Verify</span>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Organizations;
