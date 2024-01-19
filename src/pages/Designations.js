import {
  Col,
  Row,
  Dropdown,
  Button,
  Spinner,
  Modal,
  Form,
  Offcanvas,
  Tooltip,
  Card,DropdownButton,OverlayTrigger
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getDesignations,
  setAddform,
  setUpdateForm,
  setButtonLoading,
  createDesignation,
  updateDesignation,
  designationsCsvUpload,
  deleteParentDesignationCheck,
} from "../redux/reducers/designationReducers";
import { baseUrl } from "../environment";
import {
  FaEllipsisV,
  FiPlus,
  FaCloudUploadAlt,
  FaCloudDownloadAlt,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { BiX } from "react-icons/bi";
import NoDataFound from "../assets/No_Data_File.png";
import LoaderComponent from "../components/Loader";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getPermissionsByRole} from '../redux/reducers/rolesReducer';

const Designations = () => {
  const dispatch = useDispatch();
  const designationList = useSelector(
    (state) => state.designation.designationList
  );
  const addDesignationForm = useSelector(
    (state) => state.designation.showAddForm
  );
  const loading = useSelector((state) => state.designation.buttonLoading);
  const orgId = useSelector((state) => state.auth.current_organization);
  const updateDesignationForm = useSelector(
    (state) => state.designation.showUpdateForm
  );
  const loader = useSelector((state) => state.designation.loader);
  const [filterSearch, setFilter] = useState("");
  const [name, setName] = useState("");
  const [deptId, setDeptId] = useState({});
  const [degDetails, setDegDetails] = useState({});
  const [showDeleteDialog, setDialog] = useState(false);
  const [showUpload, setShowUploadModel] = useState(false);
  const token = useSelector((state) => state.auth.accessToken);
  const [file, setFile] = useState();
  const bulkDownloadUrl = `${baseUrl}download/designation/${orgId}?token=${token}`;
  const userDetails = useSelector((state) => state.auth.userDetails);
  const [validated, setValidated] = useState(false);
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
  const currentOrganization = useSelector(
    (state) => state.auth.current_organization
  );
  const user_OrgData = useState(localStorage.getItem("userOrgData")&&JSON.parse(localStorage.getItem("userOrgData")));
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  // const permissions = useState(JSON.parse(localStorage.getItem("permissions")));
  const [permissions,setPermissions] = useState();
  const [designationPermissions, setDesignationPermissions] = useState();
  const navigate = useNavigate();

  //to get Org Permissions
  useEffect(() => {
    dispatch(getPermissionsByRole(user_OrgData[0]?.role_id)).then((res)=>{
      setPermissions(res.payload)
      setDesignationPermissions(res.payload?.find((item) => item.table == "designations"));
    })
  }, []);

  //to invoke Sweet Alert
  useEffect(() => {
    if (designationPermissions?.view == false) {
      opensweetalert();
    }
  }, [designationPermissions]);

  const opensweetalert = () => {
    Swal.fire({
      title: "Access Denied !",
      icon: "warning",
      showCancelButton: false,
      showConfirmButton: false,
    });
  };

  useEffect(() => {
    dispatch(getDesignations(filterSearch));
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
  }, [filterSearch]);

  const showAddForm = () => {
    dispatch(setAddform(!addDesignationForm));
    setValidated(false);
  };

  const showUpdateForm = (item, event) => {
    event.preventDefault();
    setDegDetails(item);
    dispatch(setUpdateForm(!updateDesignationForm));
  };

  const addDesignation = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
    } else {
      dispatch(setButtonLoading(true));
      event.preventDefault();
      let body = {
        name: name,
        org_id: orgId,
        created_by: userDetails.id,
        is_primary: false,
      };
      dispatch(createDesignation(body)).then(() => {
        dispatch(getDesignations(filterSearch));
        setValidated(false);
      });
    }
  };

  const update = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
    } else {
      dispatch(setButtonLoading(true));
      event.preventDefault();
      dispatch(updateDesignation(degDetails)).then(() => {
        dispatch(getDesignations(filterSearch));
        setValidated(false);
      });
    }
  };

  const deleteDialog = async (item, event) => {
    event.preventDefault();
    setDeptId(item);
    setDialog(!showDeleteDialog);
  };

  const deleteDept = async () => {
    dispatch(setButtonLoading(true));
    // await dispatch(deleteDesignation(deptId))
    await dispatch(deleteParentDesignationCheck(deptId));
    dispatch(getDesignations(filterSearch));
    setDialog(!showDeleteDialog);
  };

  const uploadBulkUpload = (e) => {
    e.preventDefault();
    dispatch(setButtonLoading(true));
    // console.log(file);
    dispatch(designationsCsvUpload(file)).then((res) => {
      // console.log(res);
      if (res.payload.data.status) {
        dispatch(setButtonLoading(false));
        setShowUploadModel(!showUpload);
        dispatch(getDesignations(filterSearch));
      } else {
        dispatch(setButtonLoading(false));
        dispatch(getDesignations(filterSearch));
      }
    });
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);
  };

  return (
    <div>
      {loader ? (
        <LoaderComponent />
      ) : designationPermissions?.view == true ? (
        <>
          <section className="breadcum_section">
            <div className="container-fluid">
              <div className="row align-items-center justify-content-between">
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
                    <h2 className="bs_title">Designations</h2>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="aside_left d-flex align-items-center justify-content-end gap-2">
                    <div className="search-box">
                      <input
                        className="form-control text"
                        type="search"
                        name="designation-search"
                        placeholder="Search here"
                        autoFocus
                        onChange={(e) => {
                          setFilter(e.target.value);
                        }}
                      />
                      <button type="submit">
                        <FaSearch />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary disable-btn"
                      onClick={showAddForm}
                      disabled={designationPermissions?.create == false}
                    >
                      Create Designation
                    </button>
                    <OverlayTrigger
                      overlay={
                      <Tooltip id="tooltip-disabled">{" Download CSV"}</Tooltip>
                      }
                    >
                      <a href={bulkDownloadUrl} className="btn btn-secondary master-btns d-flex align-items-center justify-content-center">
                        <FaCloudDownloadAlt className="icons-btns-master" />
                      </a>
                    </OverlayTrigger>
                    <OverlayTrigger
                    overlay={
                      <Tooltip id="tooltip-disabled">{"Upload CSV"}</Tooltip>
                      }
                    >
                      <button onClick={() => setShowUploadModel(!showUpload)} type="button"
                        className="btn master-btns  btn-secondary d-flex align-items-center justify-content-center">
                        <FaCloudUploadAlt className="icons-btns-master" />
                      </button>
                    </OverlayTrigger>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="designation">
            <div className="container-fluid">
              <div className="row">
                {designationList?.length > 0 ? (
                  designationList?.map((item) => {
                    return (
                      <div className="col-12 col-xl-3 col-lg-4 col-md-4 col-sm-6">
                         <Card className="master-card master-global-card mb-4">
                            <Card.Body>
                              <div className="d-flex align-items-center gap-2">
                              <div>
                              <div className="avatar d-flex align-items-center justify-content-center text-center">
                              <span>
                                  {item.name.substring(0, 2).toUpperCase()}
                                </span>
                                </div>
                              
                              </div>
                              <div className="content">
                                <h3 className="m-0 ttww">{item.name}</h3>
                              </div>
                              <div>
                              {["start"].map((direction) => (
                                <>
                                  <DropdownButton id="dropdown-menu-align-start" drop={direction} title={<FaEllipsisV className="faelli"/>}>
                                    <div className="d_aic_jcc">
                                      <Dropdown.Item onClick={(event) => showUpdateForm(item, event)} disabled={designationPermissions?.update == false}>
                                        <FaEdit className="dropdown-btnicon" />
                                      </Dropdown.Item>
                                      {item.is_primary !== true && (
                                        <Dropdown.Item onClick={(event) => deleteDialog(item, event)} disabled={designationPermissions?.delete == false}>
                                          <FaTrashAlt className="dropdown-btnicon" />
                                        </Dropdown.Item>
                                      )}
                                    </div>
                                  </DropdownButton>
                                </>
                              ))}
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
              </div>
            </div>
          </section>

          <Offcanvas
            show={addDesignationForm}
            onHide={showAddForm}
            backdrop="static"
            placement="end"
            className="offcanvas_forms"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title className="offcanvas-title">
                <h2>Create Designation</h2>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Form noValidate validated={validated} onSubmit={addDesignation}>
                <Form.Group
                  as={Col}
                  controlId="formGridEmail"
                  className="formGroup"
                >
                  <Form.Label className="star">
                    Designation Name <b>*</b>
                  </Form.Label>
                  <Form.Control
                    required
                    minLength={2}
                    maxLength={100}
                    onChange={(e) => {
                      setName(
                        e.target.value.trim().replace(/\s+/g, " ").toLowerCase()
                      );
                    }}
                    type="text"
                    placeholder="Enter Designation"
                  />
                  <Form.Control.Feedback type="invalid">
                    Designation should have minimum 2 letters
                  </Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" disabled={loading} type="submit">
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
            show={updateDesignationForm}
            onHide={() => {
              dispatch(setUpdateForm(!updateDesignationForm));
              setValidated(false);
            }}
            backdrop="static"
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Update Designation</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <div className="container">
                <div className="row">
                  <Form noValidate validated={validated} onSubmit={update}>
                    <Row className="mb-3">
                      <Form.Group as={Col} controlId="formGridEmail">
                        <Form.Label>Designation Name *</Form.Label>
                        <Form.Control
                          required
                          minLength={2}
                          maxLength={20}
                          onChange={(e) =>
                            setDegDetails({
                              ...degDetails,
                              name: e.target.value
                                .trim()
                                .replace(/\s+/g, " ")
                                .toLowerCase(),
                            })
                          }
                          value={degDetails.name}
                          type="text"
                          placeholder="Enter Organization"
                        />
                        <Form.Control.Feedback type="invalid">
                          Designation should have minimum 2 letters
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    <Button variant="primary" disabled={loading} type="submit">
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
                  </Form>
                </div>
              </div>
            </Offcanvas.Body>
          </Offcanvas>

          <Modal
            show={showDeleteDialog}
            onHide={() => setDialog(!showDeleteDialog)}
            backdrop="static"
            keyboard={false}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="modal_forms modal-sm"
          >
            <Modal.Header closeButton>
              {/* <Modal.Title className="modal-title text-center">
              <h2 className="text-center">Delete Designation</h2>
          </Modal.Title> */}
            </Modal.Header>

            <Modal.Body className="text-center">
              <div className="d_aic_jcc icon_info mt-3 mb-4">
                <BiX className="i" />
              </div>
              <h3 className="text-center title mb-3">Delete Designation</h3>
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
                onClick={deleteDept}
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

          <Modal
            show={showUpload}
            onHide={() => setShowUploadModel(!showUpload)}
            centered
            backdrop="static"
            className="modal_forms"
          >
            <Form onSubmit={(e) => uploadBulkUpload(e)}>
              <Modal.Header closeButton>
                <Modal.Title className="modal-title">
                  <h2>Designations bulk Upload</h2>
                </Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <Form.Group className="formGroup" controlId="formFile">
                  <Form.Label>Select File to Upload</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
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
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Designations;
