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
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  createDepartment,
  updateDepartment,
  getDepartments,
  setAddform,
  setUpdateForm,
  setButtonLoading,
  deleteDepartment,
  departmentsCsvUpload,
  deleteParentDepartmentCheck,
} from "../redux/reducers/departmentReducer";
import { baseUrl } from "../environment";
import { getUserOrgByid } from "../redux/reducers/authReducer";
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
import "react-toastify/dist/ReactToastify.css";
import NoDataFound from "../assets/No_Data_File.png";
import LoaderComponent from "../components/Loader";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getPermissionsByRole} from '../redux/reducers/rolesReducer';


function Departments() {
  const dispatch = useDispatch();
  const [filterSearch, setFilter] = useState("");
  const orgId = useSelector((state) => state.auth.current_organization);
  const departmentsList = useSelector(
    (state) => state.department.departmentsList
  );
  const addDepartmentForm = useSelector(
    (state) => state.department.showAddForm
  );
  const updateDepartmentForm = useSelector(
    (state) => state.department.showUpdateForm
  );
  const user_OrgData = useState(localStorage.getItem("userOrgData")&&JSON.parse(localStorage.getItem("userOrgData")));
  const loading = useSelector((state) => state.department.buttonLoading);
  const loader = useSelector((state) => state.department.loader);
  const [parent, setParent] = useState(0);
  const [name, setName] = useState("");
  const [deptDetails, setDeptDetails] = useState({});
  const [showDeleteDialog, setDialog] = useState(false);
  const [deptId, setDeptId] = useState({});
  const [showUpload, setShowUploadModel] = useState(false);
  const token = useSelector((state) => state.auth.accessToken);
  const [file, setFile] = useState();
  const bulkDownloadUrl = `${baseUrl}download/department/${orgId}?token=${token}`;
  const userDetails = useSelector((state) => state.auth.userDetails);
  const [validated, setValidated] = useState(false);
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  // const permissions = useState(JSON.parse(localStorage.getItem("permissions")));
  const [permissions,setPermissions] = useState();
  const [depPermissions, setDepPermissions] = useState();
  const navigate = useNavigate();

  //to get Org Permissions
  useEffect(() => {
    dispatch(getPermissionsByRole(user_OrgData[0]?.role_id)).then((res)=>{
      setPermissions(res.payload)
      setDepPermissions(res.payload?.find((item) => item.table == "departments"));
    })
  }, []);

  //to invoke Sweet Alert
  useEffect(() => {
    if (depPermissions?.view == false) {
      opensweetalert();
    }
  }, [depPermissions]);

  const opensweetalert = () => {
    Swal.fire({
      title: "Access Denied !",
      icon: "warning",
      showCancelButton: false,
      showConfirmButton: false,
    });
  };
  useEffect(() => {
    dispatch(getUserOrgByid(userData?.[0].id));
    dispatch(getDepartments(filterSearch));
  }, [filterSearch]);

  const showAddForm = () => {
    dispatch(setAddform(!addDepartmentForm));
    setValidated(false);
  };

  const showUpdateForm = (item, event) => {
    event.preventDefault();
    setDeptDetails(item);
    dispatch(setUpdateForm(!updateDepartmentForm));
  };

  const addDepartment = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
    } else {
      dispatch(setButtonLoading(true));
      event.preventDefault();
      let body = {
        name: name.trim().replace(/\s+/g, " ").toLowerCase(),
        parent: parent,
        org_id: orgId,
        created_by: userDetails.id,
      };
      dispatch(createDepartment(body)).then(() => {
        dispatch(getDepartments(filterSearch));
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
      //setLoading(true)
      dispatch(setButtonLoading(true));
      event.preventDefault();
      let temp = {
        ...deptDetails,
        name: deptDetails.name.trim().replace(/\s+/g, " ").toLowerCase(),
      };
      dispatch(updateDepartment(temp)).then(() => {
        dispatch(getDepartments(filterSearch));
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
    //deleteParentDepartmentCheck
    dispatch(setButtonLoading(true));
    await dispatch(deleteParentDepartmentCheck(deptId));
    //await dispatch(deleteDepartment(deptId))
    dispatch(getDepartments(filterSearch));
    setDialog(!showDeleteDialog);
  };

  const uploadBulkUpload = (e) => {
    e.preventDefault();
    dispatch(setButtonLoading(true));
    // console.log(file);
    dispatch(departmentsCsvUpload(file)).then((res) => {
      // console.log(res);
      if (res.payload.data.status) {
        dispatch(setButtonLoading(false));
        // toast.success(res.payload.data.message);
        setShowUploadModel(!showUpload);
        dispatch(getDepartments(filterSearch));
      } else {
        dispatch(setButtonLoading(false));
        // toast.error(res.payload.data.message.detail);
        dispatch(getDepartments(filterSearch));
      }
    });
  };

  return (
    <div>
          <section className="breadcum_section">
            <div className="container-fluid">
              <div className="row align-items-center justify-content-between">
                <div className="col-xl-4 col-lg-4 col-md-12">
                  <div className="d-flex align-items-center gap-3 masterback-btn">
                    <Button
                      className="primary_btn white_btn d-flex align-items-center justify-content-center"
                      variant="light"
                      size="md"
                      onClick={() => navigate("/master")}
                    >
                      <FaArrowLeft />
                    </Button>
                    <h2 className="bs_title">Departments</h2>
                  </div>
                </div>
                <div className="col-xl-8 col-lg-8 pt-lg-0 col-md-12 pt-md-3 d-md-flex justify-content-md-start justify-content-lg-end">
                  <div className="aside_left d-flex align-items-center justify-content-end gap-2">
                    <div className="search-box">
                      <input
                        className="form-control text"
                        type="text"
                        name="departments-search"
                        placeholder="Search here"
                        autoFocus
                        onChange={(e) => {
                          setFilter(e.target.value);
                        }}
                      />
                      <button>
                        <FaSearch />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary disable-btn"
                      onClick={showAddForm}
                      disabled={depPermissions?.create == false}
                    >
                      Create Department
                    </button>
                    <OverlayTrigger
                    overlay={
                      <Tooltip id="tooltip-disabled">{" Download CSV"}</Tooltip>
                    }
                    >
                      <a
                        href={bulkDownloadUrl}
                        className="btn btn-secondary master-btns d-flex align-items-center justify-content-center"
                      >
                        <FaCloudDownloadAlt className="icons-btns-master" />
                      </a>
                    </OverlayTrigger>
                    <OverlayTrigger
                    overlay={
                      <Tooltip id="tooltip-disabled">{"Upload CSV"}</Tooltip>
                    }
                    >
                      <button
                        onClick={() => setShowUploadModel(!showUpload)}
                        type="button"
                        className="btn btn-secondary  master-btns d-flex align-items-center justify-content-center"
                      >
                        <FaCloudUploadAlt className="icons-btns-master" />
                      </button>
                    </OverlayTrigger>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {loader ? (<LoaderComponent />) : depPermissions?.view == true ? (
          <section>
            <div className="container-fluid">
              <div className="row">
                {departmentsList?.length > 0 ? (
                  departmentsList?.map((item,index) => {
                    return (
                      <div className="col-12 col-xl-3 col-lg-4 col-md-4 col-sm-6" key={index}>
                        <Card className="master-card master-global-card mb-4">
                            <Card.Body>
                              <div className="d-flex align-items-center gap-2">
                          <div>
                            <div className="avatar d-flex align-items-center justify-content-center text-center">
                              <span>
                                {item?.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            </div>
                            <div className="content">
                              <h3 className="m-0 ttww">{item.name}</h3>
                              </div>
                              <div>
                              {["start"].map((direction) => (
                                <>
                                  <DropdownButton id="dropdown-menu-align-start" drop={direction} title={<FaEllipsisV className="faelli" />}>
                                    <div className="d_aic_jcc">
                                      <Dropdown.Item onClick={(event) => showUpdateForm(item, event)} disabled={depPermissions?.update == false}>
                                        <FaEdit className="dropdown-btnicon" />
                                      </Dropdown.Item>
                                      {!item.is_primary && (
                                      <Dropdown.Item onClick={(event) => deleteDialog(item, event)} disabled={depPermissions?.delete == false}>
                                        <FaTrashAlt className="dropdown-btnicon" />
                                      </Dropdown.Item>
                                      )}
                                    </div>
                                  </DropdownButton>
                                </>
                              ))}
                            </div>
                              {/* <Dropdown>
                                <Dropdown.Toggle
                                  variant="success"
                                  id="dropdown-basic"
                                >
                                  <FaEllipsisV id="dropdown-basic" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item
                                    onClick={(event) =>
                                      showUpdateForm(item, event)
                                    }
                                    disabled={depPermissions?.update == false}
                                  >
                                    Edit
                                  </Dropdown.Item>
                                  {!item.is_primary && (
                                    <Dropdown.Item
                                      onClick={(event) =>
                                        deleteDialog(item, event)
                                      }
                                      disabled={depPermissions?.delete == false}
                                    >
                                      Delete
                                    </Dropdown.Item>
                                  )}
                                </Dropdown.Menu>
                              </Dropdown> */}
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
          ) : (<></>)}
      
      <Offcanvas
        show={addDepartmentForm}
        onHide={showAddForm}
        backdrop="static"
        placement="end"
        className="offcanvas_forms"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="offcanvas-title">
            <h2>Create Department</h2>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form noValidate validated={validated} onSubmit={addDepartment}>
            <Form.Group
              as={Col}
              controlId="formGridEmail"
              className="formGroup"
            >
              <Form.Label className="star">
                Department Name <b>*</b>
              </Form.Label>
              <Form.Control
                minLength={2}
                required
                onChange={(e) => {
                  setName(e.target.value);
                }}
                type="text"
                placeholder="Enter Department"
              />
              <Form.Control.Feedback type="invalid">
                Department should have atleast minimum 2 letters
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group
              as={Col}
              controlId="formGridState"
              id="formGridCheckbox"
              className="formGroup"
            >
              <Form.Label className="star">
                Parent <b>*</b>
              </Form.Label>
              <Form.Select
                required
                onChange={(e) => {
                  setParent(e.target.value);
                }}
                defaultValue="Choose..."
              >
                <option value="">Select Parent Departments</option>
                {departmentsList?.map((department) => {
                  return (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  );
                })}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Select atleast one parent
              </Form.Control.Feedback>
            </Form.Group>
            <Button
              className="mt-3"
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
                <span> Create</span>
              )}
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas
        show={updateDepartmentForm}
        onHide={() => {
          dispatch(setUpdateForm(!updateDepartmentForm));
          setValidated(false);
        }}
        backdrop="static"
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Update Department</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="container">
            <div className="row">
              <Form noValidate validated={validated} onSubmit={update}>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label>
                      Department Name <b className="text-danger">*</b>
                    </Form.Label>
                    <Form.Control
                      required
                      onChange={(e) => {
                        setDeptDetails({
                          ...deptDetails,
                          name: e.target.value,
                        });
                      }}
                      value={deptDetails.name}
                      type="text"
                      placeholder="Enter Department"
                    />
                    <Form.Control.Feedback type="invalid">
                      Department should have atleast minimum 2 letters
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                {!deptDetails.is_primary && (
                  <Form.Group
                    as={Col}
                    controlId="formGridState"
                    id="formGridCheckbox"
                  >
                    <Form.Label>
                      Parent <b className="text-danger">*</b>
                    </Form.Label>
                    <Form.Select
                      required
                      onChange={(e) => {
                        setDeptDetails({
                          ...deptDetails,
                          parent: e.target.value,
                        });
                      }}
                      value={deptDetails.parent}
                    >
                      <option>Select Parent Departments</option>
                      {departmentsList?.map((department) => {
                        return (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        );
                      })}
                      <Form.Control.Feedback type="invalid">
                        Select atleast one parent
                      </Form.Control.Feedback>
                    </Form.Select>
                  </Form.Group>
                )}

                <Button
                  className="mt-3"
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
        aria-labelledby="contained-modal-title-vcenter"
        keyboard={false}
        centered
        className="modal_forms modal-sm"
      >
        <Modal.Header closeButton>
          {/* <Modal.Title className="modal-title text-center">
              <h2 className="text-center">Delete Department</h2>
          </Modal.Title> */}
        </Modal.Header>

        <Modal.Body className="text-center">
          <div className="d_aic_jcc icon_info mt-3 mb-4">
            <BiX className="i" />
          </div>
          <h3 className="text-center title mb-3">Delete Department</h3>
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
              <h2>Departments Bulk Upload</h2>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="formGroup" controlId="formFile">
              <Form.Label>Select File to Upload</Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                required
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
    </div>
  );
}

export default Departments;
