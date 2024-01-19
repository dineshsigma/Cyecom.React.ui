import {
  Col,
  Row,
  Dropdown,
  Button,
  Badge,
  Spinner,
  Modal,
  Form,
  OverlayTrigger,
  Offcanvas,
  Tooltip,Card,DropdownButton
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLocationAddform,
  getLocations,
  getLocationsPageData,
  getLocationTreeData,
  setLocationButtonLoading,
  createLocation,
  deleteLocation,
  updateLocation,
  setLocationUpdateForm,
  setSelectedLocationDetails,
  locationsCsvUpload,
  downloadCSVLocation,
  deleteParentLocationCheck,
} from "../redux/reducers/locationsReducer";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../environment";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import {
  FaEllipsisV,
  FaCloudUploadAlt,
  FaCloudDownloadAlt,
  FaSearch,
  FaTrashAlt,
  FaEdit,
  FaArrowLeft,
} from "react-icons/fa";
import { BiX } from "react-icons/bi";
import { TbHierarchy2, TbListDetails } from "react-icons/tb";
import LocationTree from "./LocationTree";
import NoDataFound from "../assets/No_Data_File.png";
import LoaderComponent from "../components/Loader";
import Swal from "sweetalert2";
import { tree } from "d3";
import { getPermissionsByRole} from '../redux/reducers/rolesReducer';

function Locations() {
  const dispatch = useDispatch();
  const [filterSearch, setFilter] = useState({name:"",limit:20,offset:0});
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const orgId = useSelector((state) => state.auth.current_organization);
  const addLocationForm = useSelector((state) => state.location.showAddForm);
  const updateLocationForm = useSelector(
    (state) => state.location.showUpdateForm
  );
  
  const user_OrgData = useState(localStorage.getItem("userOrgData")&&JSON.parse(localStorage.getItem("userOrgData")));
  const locationRes = useSelector((state) => state.location.locationResponse);
  const loading = useSelector((state) => state.location.buttonLoading);
  // const locationsList = useSelector((state) => state.location.locationsList);
  const [locationsList,setLocationList]=useState([])
  const token = useSelector((state) => state.auth.accessToken);
  const [locationName, setLoactionName] = useState("");
  const [parent, setParent] = useState(0);
  const selectedLocation = useSelector(
    (state) => state.location.selectedLocation
  );
  const [locationDetails, setLocationDetails] = useState({});
  const [showDeleteDialog, setDialog] = useState(false);
  const [locationId, setLocationId] = useState(0);
  const [showUpload, setShowUploadModel] = useState(false);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const bulkDownloadUrl = `${baseUrl}download/location/${orgId}?token=${token}`;
  const [file, setFile] = useState();
  const [deleteLocationObj, setDeleteLocation] = useState({});
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [showTree, setShowTree] = useState(false);
  const [initialLoader,setInitialLoader]=useState(true);
  const [hasMore,setHasMore]=useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [inifinityLoader,setInifinityLoader]=useState(false);
  const [searchCheck,setSearchCheck]=useState(false)
  const [loader,setLoader]=useState(false)
  // const loader = useSelector((state) => state.location.loader);
  // const permissions = useState(JSON.parse(localStorage.getItem("permissions")));
  const [permissions,setPermissions] = useState();
  const [locPermissions, setLocPermissions] = useState();
  
  const navigate = useNavigate();

  //to get Org Permissions
  useEffect(() => {
    dispatch(getPermissionsByRole(user_OrgData[0]?.role_id)).then((res)=>{
      setPermissions(res.payload)
      setLocPermissions(res.payload?.find((item) => item.table == "locations"));
    })
  }, []);

  //to invoke Sweet Alert
  useEffect(() => {
    if (locPermissions?.view == false) {
      opensweetalert();
    }
  }, [locPermissions]);

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
    selectedLocation && setLocationDetails(selectedLocation);
    dispatch(getLocationTreeData());
  }, [selectedLocation]);

useEffect(()=>{
  if(initialLoader){
    setLoader(true)
  }
  let pageNumberCal=(pageNumber-1)*filterSearch.limit
  dispatch(getLocationsPageData({...filterSearch,offset:pageNumberCal})).then(res=>{
    if(searchCheck){
      if(res.payload.length>0) setLocationList(res.payload);
      setSearchCheck(false)
    }
    else{
      if(res.payload.length>0) setLocationList((prev)=>[...prev,...res.payload])
    }
    setInitialLoader(false)
    setHasMore(res.payload.length>0)
    setLoader(false)
  });
 },[pageNumber,filterSearch])

 const onLoactionSearch=(e)=>{
  if(!e.target.value) setSearchCheck(true)
  setLocationList([]);
  setHasMore(false)
  setFilter({...filterSearch,name:e.target.value,offset:0});
  setInitialLoader(true);
  setPageNumber(1)
 }

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

  const showAddForm = () => {
    dispatch(setLocationAddform(!addLocationForm));
    setValidated(false);
  };

  const addLocation = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
    } else {
      dispatch(setLocationButtonLoading(true));
      event.preventDefault();
      let body = {
        name: locationName,
        parent: parent,
        org_id: orgId,
        created_by: userDetails.id,
      };
      // console.log(body);
      dispatch(createLocation(body)).then(() => {
        setLocationList([]);
        setInitialLoader(true)
        setPageNumber(1)
        // dispatch(getLocations(filterSearch));
        dispatch(getLocationTreeData());
        //console.log('createdLocationResponse', locationRes)
      });
      setValidated(false);
    }
  };

  const showUpdateForm = (item, event) => {
    event.preventDefault();
    setLocationDetails(item);
    dispatch(setLocationUpdateForm(!updateLocationForm));
  };

  const update = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
    } else {
      //setLoading(true)
      // dispatch(setLocationButtonLoading(true))
      event.preventDefault();
      dispatch(updateLocation(locationDetails)).then((res) => {
        // dispatch(getLocations(filterSearch));
        setLocationList([]);
        setInitialLoader(true)
        setPageNumber(1)
        dispatch(getLocationTreeData());
      });
      setValidated(false);
    }
  };

  const deleteDialog = async (item, event) => {
    event.preventDefault();
    setDeleteLocation(item);
    setDialog(!showDeleteDialog);
  };

  const locationDelete = () => {
    dispatch(setLocationButtonLoading(true));
    dispatch(deleteParentLocationCheck(deleteLocationObj)).then((res) => {
      // dispatch(getLocations(filterSearch));
      setLocationList([]);
      setInitialLoader(true)
      setPageNumber(1)
      dispatch(getLocationTreeData());
      setDialog(!showDeleteDialog);
    });
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    dispatch(setLocationButtonLoading(true));
    // console.log(file);
    await dispatch(locationsCsvUpload(file)).then((res) => {
      // console.log(res);
      if (res.payload.data.status) {
        dispatch(setLocationButtonLoading(false));
        // toast.success(res.payload.data.message);
        setShowUploadModel(!showUpload);
        // dispatch(getLocations(filterSearch));
        setPageNumber(1)
        setLocationList([]);
        setInitialLoader(true)
        dispatch(getLocationTreeData());
      } else {
        dispatch(setLocationButtonLoading(false));
        // toast.error(res.payload.data.message.detail);
        // dispatch(getLocations(filterSearch));
        setPageNumber(1)
        setLocationList([]);
        setInitialLoader(true)
        dispatch(getLocationTreeData());
      }
    });
  };
  return (
    <div>
      {locPermissions?.view == true ? (
        <div>
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
                    <h2 className="bs_title">Locations</h2>
                  </div>{" "}
                </div>
                <div className="col-md-8">
                  <div className="aside_left d-flex align-items-center justify-content-end gap-2">
                    <div className="search-box">
                      <input
                        className="form-control text"
                        type="text"
                        name="locations-search"
                        placeholder="Search here"
                        autoFocus
                        onChange={(e)=>onLoactionSearch(e)}
                      />
                      <button>
                        <FaSearch />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary disable-btn"
                      onClick={showAddForm}
                      disabled={!locPermissions?.create}
                    >
                      Create Location
                    </button>

                    {showTree ? (
                      <OverlayTrigger
                        overlay={
                          <Tooltip id="tooltip-disabled">{"List View"}</Tooltip>
                        }
                      >
                        {/* <span className="d-inline-block"> */}
                          <button
                            onClick={() => setShowTree(!showTree)}
                            type="button"
                            className="master-btns btn btn-secondary d-flex align-items-center justify-content-center"
                          >
                            <TbListDetails />
                          </button>
                        {/* </span> */}
                      </OverlayTrigger>
                    ) : (
                      <OverlayTrigger
                        overlay={
                          <Tooltip id="tooltip-disabled">{"Tree View"}</Tooltip>
                        }
                      >
                        {/* <span className="d-inline-block"> */}
                          <button onClick={() => setShowTree(!showTree)} type="button" className="master-btns btn btn-secondary  d-flex align-items-center justify-content-center">
                            <TbHierarchy2 />
                          </button>
                        {/* </span> */}
                      </OverlayTrigger>
                    )}

                    <OverlayTrigger
                      overlay={
                        <Tooltip id="tooltip-disabled">
                          {"Download CSV"}
                        </Tooltip>
                      }
                    >
                      <span className="d-inline-block">
                        <a href={bulkDownloadUrl} className="btn btn-secondary master-btns d-flex align-items-center justify-content-center">
                          <FaCloudDownloadAlt className="icons-btns-master" />
                        </a>
                      </span>
                    </OverlayTrigger>

                    <OverlayTrigger
                      overlay={
                        <Tooltip id="tooltip-disabled">{"Upload CSV"}</Tooltip>
                      }
                    >
                      <span className="d-inline-block">
                        <button onClick={() => setShowUploadModel(!showUpload)} type="button" className="master-btns btn btn-secondary d-flex align-items-center justify-content-center">
                          <FaCloudUploadAlt className="icons-btns-master" />
                        </button>
                      </span>
                    </OverlayTrigger>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            {showTree ? (
              <LocationTree />
            ) : (
              <div className="container-fluid">
                {/* <GridLoading /> */}
                <div className="row">
                {loader ? (
                 <LoaderComponent />):
                  locationsList?.length > 0 ? (
                    locationsList?.map((item,id) => {
                      return (
                        <div className="col-12 col-xl-3 col-lg-4 col-md-4 col-sm-6"
                        ref={locationsList.length==id+1?lastBookElementRef:null}>
                          <Card className="master-card master-global-card mb-3">
                            <Card.Body className="d-flex align-items-center gap-2">
                            <div className="avatar d-flex align-items-center justify-content-center text-center">
                                <span>
                                  {item.name.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div className="content">
                              <h3 className="m-0 ttww">{item.name}</h3>
                              </div>
                              <div>
                              {["start"].map((direction) => (
                                <>
                                  <DropdownButton id="dropdown-menu-align-start" drop={direction} title={<FaEllipsisV className="faelli" />}>
                                  <div className="d_aic_jcc">
                                    <Dropdown.Item
                                   onClick={(event) =>
                                    showUpdateForm(item, event)
                                  }
                                  disabled={locPermissions?.update == false}
                                    >
                                      <FaEdit className="dropdown-btnicon" />
                                    </Dropdown.Item>
                                    {!item.is_primary && (
                                    <Dropdown.Item
                                      onClick={(event) =>
                                        deleteDialog(item, event)
                                      }
                                      disabled={locPermissions?.delete == false}
                                    >
                                      <FaTrashAlt className="dropdown-btnicon" />
                                    </Dropdown.Item>
                                    )}
                                  </div>
                                  </DropdownButton>
                                </>
                              ))}
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
            )}
          </section>

          <Offcanvas
            show={addLocationForm}
            onHide={showAddForm}
            backdrop="static"
            placement="end"
            className="offcanvas_forms"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title className="offcanvas-title">
                <h2>Create Location</h2>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Form noValidate validated={validated} onSubmit={addLocation}>
                <Form.Group
                  as={Col}
                  controlId="formGridEmail"
                  className="formGroup"
                >
                  <Form.Label className="star">
                    Location Name <b>*</b>
                  </Form.Label>
                  <Form.Control
                    required
                    minLength={3}
                    maxLength={30}
                    onChange={(e) => {
                      setLoactionName(
                        e.target.value.trim().replace(/\s+/g, " ").toLowerCase()
                      );
                    }}
                    type="text"
                    placeholder="Enter Location"
                  />
                  <Form.Control.Feedback type="invalid">
                    Location should have atleast minimum 3 letters
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
                    <option value="">Select Parent Location</option>
                    {locationsList?.map((location) => {
                      return (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      );
                    })}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Select atleast one parent
                  </Form.Control.Feedback>
                </Form.Group>
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
            show={updateLocationForm}
            onHide={() => {
              dispatch(setLocationUpdateForm(!updateLocationForm));
              setValidated(false);
            }}
            backdrop="static"
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Update Location</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <div className="container">
                <div className="row">
                  <Form noValidate validated={validated} onSubmit={update}>
                    <Row className="mb-3">
                      <Form.Group as={Col} controlId="formGridEmail">
                        <Form.Label>
                          Location Name <b className="text-danger">*</b>
                        </Form.Label>
                        <Form.Control
                          required
                          minLength={3}
                          maxLength={30}
                          onChange={(e) => {
                            setLocationDetails({
                              ...locationDetails,
                              name: e.target.value
                                .trim()
                                .replace(/\s+/g, " ")
                                .toLowerCase(),
                            });
                          }}
                          value={locationDetails.name}
                          type="text"
                          placeholder="Enter Location"
                        />
                        <Form.Control.Feedback type="invalid">
                          Location should have atleast minimum 3 letters
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    {locationDetails.parent && (
                      <Form.Group
                        as={Col}
                        controlId="formGridState"
                        id="formGridCheckbox"
                      >
                        <Form.Label>
                          Parent <b className="text-danger">*</b>
                        </Form.Label>
                        <Form.Select
                          onChange={(e) => {
                            setLocationDetails({
                              ...locationDetails,
                              parent: e.target.value,
                            });
                          }}
                          value={locationDetails.parent}
                        >
                          <option>Select Parent Location</option>
                          {locationsList?.map((location) => {
                            return (
                              <option key={location.id} value={location.id}>
                                {location.name}
                              </option>
                            );
                          })}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          Select atleast one parent
                        </Form.Control.Feedback>
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
            keyboard={false}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="modal_forms modal-sm"
          >
            <Modal.Header closeButton>
              {/* <Modal.Title className="modal-title text-center">
                        <h2 className="text-center">Delete Location</h2>
                    </Modal.Title> */}
            </Modal.Header>

            <Modal.Body className="text-center">
              <div className="d_aic_jcc icon_info mt-3 mb-4">
                <BiX className="i" />
              </div>
              <h3 className="text-center title mb-3">Delete Location</h3>
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
                onClick={locationDelete}
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
            <Form onSubmit={(e) => uploadFile(e)}>
              <Modal.Header closeButton>
                <Modal.Title className="modal-title">
                  <h2>Location Bulk Upload</h2>
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
      ) : (
        <></>
      )}
    </div>
  );
}
export default Locations;
