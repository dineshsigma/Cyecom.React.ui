import {Button, Card, Col, Form, Nav, Row, Spinner,Tab } from "react-bootstrap";

 
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/reducers/authReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import { getLocations } from "../redux/reducers/locationsReducer";
import { getDepartments } from "../redux/reducers/departmentReducer";
import { getRoles } from "../redux/reducers/rolesReducer";
import { getDesignations } from "../redux/reducers/designationReducers";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { resetPassword} from '../redux/reducers/userReducer'
import { toast } from "react-toastify";

import UserIcon from "../assets/user-profile.png";
import orglogo from "../assets/Cypro_logo.png";

function Profile() {
  const dispatch = useDispatch()
  const userDetails = useSelector((state) => state.auth.userDetails)
  const [locaionDetails, setLocaionDetails] = useState({})
  const [departmentDetails, setDepartmentDetails] = useState({})
  const [designationDetails, setDesignationDetails] = useState({})
  const [orgDetails, setOrgDetails] = useState({})
  const userOrgList = useSelector((state) => state.auth.userOrgDetails)
  const current_organization = useSelector((state) => state.auth.current_organization)
  const orgList = useSelector((state) => state.organization.organizationsList)
  const userOrgDetails = userOrgList?.find((item) => item.org_id == current_organization)
  const locationsList = useSelector((state) => state.location.locationsList)
  const departmentsList = useSelector((state) => state.department.departmentsList)
  const rolesList = useSelector((state) => state.roles.rolesList)
  const designationList = useSelector((state) => state.designation.designationList)
  const available_organizations = useSelector((state) => state.auth.available_organizations)
  const [changePasswordObj, setChangePasswordObj] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [showError, setShowError] = useState(false) 

  useEffect(() => { 
    dispatch((getDepartments(''))).then((res) => {
      let department = res.payload?.find((i) => i.id == userOrgDetails.department_id)
      // console.log('departmentDetails', department)
      department && setDepartmentDetails(department)
    })

    dispatch(getOrganizations(available_organizations)).then((res) => {
      let org = res.payload?.find((i) => i.id == current_organization)
      // console.log('organiationslist', org)
      org && setOrgDetails(org)
    })
    dispatch((getLocations(''))).then((res) => {
      let location = res.payload?.find((i) => i.id == userOrgDetails.location_id)
      // console.log('locationDetails', location)
      location && setLocaionDetails(location)
    })
    dispatch((getRoles('')))
    dispatch((getDesignations(''))).then((res) => {
      let designation = res.payload?.find((i) => i.id == userOrgDetails.designation_id)
      // console.log('designatoinDetails', designation)
      designation && setDesignationDetails(designation)
    })

  }, [userOrgDetails])

  const updatePassword = (e) => {
    setLoading(true)
    e.preventDefault();
    const form = e.currentTarget;
    if(changePasswordObj.newPassword === changePasswordObj.confirmPassword){
      let body = { "oldpassword":changePasswordObj.currentPassword ,"newpassword": changePasswordObj.confirmPassword}
      // console.log(body)
      dispatch(resetPassword(body)).then((res)=> { 
        if(res.payload.status){
          toast.success(res.payload.message)
          setLoading(false)
          setChangePasswordObj({})
          form.reset()
        }else{
          toast.error(res.payload.message)
          setLoading(false)
        }
      })
    }else{
      setShowError(true)
      setLoading(false)
    }

  }

  return (
    <div className='container'> 
        <div className="profile-title text-start">
          <h4 className="title">Profile</h4>
        </div>
        <Row>
          <Card className='col-12 m-3 profile_card'>
            <Card.Body>
              <Tab.Container id="left-tabs-example" defaultActiveKey="Genral">
                <Row>
                  <Col sm={2} className="profile-cards">
                    <Card variant="light" className="m-3 no-border-card">
                      <Nav variant="pills" className="flex-column profile-pills">
                        <Nav.Item>
                          <Nav.Link eventKey="Genral">General Info</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="Organization">Organization</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="Passwords">Change Password</Nav.Link>
                        </Nav.Item>
                      </Nav>
                    </Card>
                  </Col>
                  
                  <Col sm={10} className="profile-cards">
                    <Tab.Content>
                      <Tab.Pane eventKey="Genral">
                        <Card className="m-4">
                          <Card.Header>
                            <div className="text-center ">
                              <h4>General Info</h4>
                              <span>
                                Edit your Account's general Information
                              </span>
                            </div>
                          </Card.Header>
                          <Card.Body>
                            <Form>
                              <div className='row'>
                                <div className='col-2'></div>
                                <div className='col-4'>
                                  <Form.Group className="mb-3 mt-3" controlId="formFname">
                                    {userDetails ? <Form.Control readOnly type="text" placeholder="First name" value={userDetails.name} /> : <Form.Control readOnly type="text" placeholder="First name" />}
                                  </Form.Group>
                                </div>
                                <div className='col-4'>
                                  <Form.Group className="mb-3 mt-3" controlId="formLname">
                                    {userDetails ? <Form.Control readOnly type="text" placeholder="Last Name" value={userDetails.lastname} /> : <Form.Control readOnly type="text" placeholder="Last name" />}
                                  </Form.Group>
                                </div>
                                <div className='col-2'></div>
                              </div>
                              <div className='row'>
                                <div className='col-2'></div>
                                <div className='col-8'>
                                  <Form.Group className="mb-3 mt-3" controlId="formDesignation">
                                    {userDetails ? <Form.Control readOnly type="text" placeholder="Last Name" value={userDetails.phone} /> : <Form.Control readOnly type="text" placeholder="Phone" />}
                                  </Form.Group>
                                </div>
                                <div className='col-2'></div>
                              </div>
                              <div className='row'>
                                <div className='col-2'></div>
                                <div className='col-8'>
                                  <Form.Group className="mb-3 mt-3" controlId="formDesignation">
                                    {userDetails ? <Form.Control readOnly type="text" placeholder="Designation" value={userDetails.email} /> : <Form.Control readOnly type="email" placeholder="email" />}
                                  </Form.Group>
                                </div>
                                <div className='col-2'></div>
                              </div>
                            </Form>
                          </Card.Body>
                        </Card>
                      </Tab.Pane>
                      <Tab.Pane eventKey="Organization">
                        <Card className='m-4'>
                          <Card.Header>
                            <div className='text-center'>
                              <h4>Organization Info</h4>
                              <span>Edit your Organization's Information</span>
                            </div>
                          </Card.Header>
                          <Card.Body>
                            <Form>
                              <div className="row">
                                <div className="col-2"></div>
                                <div className="col-8">
                                  <Form.Group
                                    className="mb-3 mt-3"
                                    controlId="formBasicEmail"
                                  >
                                    {orgDetails ? (
                                      <Form.Control
                                        type="text"
                                        placeholder="Organization name"
                                        value={orgDetails.name}
                                        readOnly
                                      />
                                    ) : (
                                      <Form.Control
                                        readOnly
                                        type="text"
                                        placeholder="Organization name"
                                      />
                                    )}
                                  </Form.Group>
                                </div>
                                <div className="col-2"></div>
                              </div>
                              <div className="row">
                                <div className="col-2"></div>
                                <div className="col-8">
                                  <Form.Group
                                    className="mb-3 mt-2"
                                    controlId="formLocation"
                                  >
                                    {departmentDetails ? (
                                      <Form.Control
                                        readOnly
                                        type="text"
                                        placeholder="Department"
                                        value={departmentDetails.name}
                                      />
                                    ) : (
                                      <Form.Control
                                        readOnly
                                        type="text"
                                        placeholder="Department"
                                      />
                                    )}
                                  </Form.Group>
                                </div>
                                <div className="col-2"></div>
                              </div>
                              <div className="row">
                                <div className="col-2"></div>
                                <div className="col-8">
                                  <Form.Group
                                    className="mb-3 mt-3"
                                    controlId="formDesignation"
                                  >
                                    {designationDetails ? (
                                      <Form.Control
                                        readOnly
                                        type="text"
                                        placeholder="Designation"
                                        value={designationDetails.name}
                                      />
                                    ) : (
                                      <Form.Control
                                        readOnly
                                        type="text"
                                        placeholder="Designation"
                                      />
                                    )}
                                  </Form.Group>
                                </div>
                                <div className="col-2"></div>
                              </div>
                              <div className="row">
                                <div className="col-2"></div>
                                <div className="col-8">
                                  <Form.Group
                                    className="mb-3 mt-2"
                                    controlId="formLocation"
                                  >
                                    {locaionDetails ? (
                                      <Form.Control
                                        readOnly
                                        type="text"
                                        placeholder="Location"
                                        value={locaionDetails.name}
                                      />
                                    ) : (
                                      <Form.Control
                                        readOnly
                                        type="text"
                                        placeholder="Location"
                                      />
                                    )}
                                  </Form.Group>
                                </div>
                                <div className="col-2"></div>
                              </div>
                            </Form>
                          </Card.Body>
                        </Card>
                      </Tab.Pane>
                      <Tab.Pane eventKey="Passwords">
                        <Card className='m-4'>
                          <Card.Header>
                            <div className='text-center'>
                              <h4>Change Password</h4>
                              <span>Manage Your Passwords</span>
                            </div>
                          </Card.Header>
                          <Card.Body>
                            <Form onSubmit={(e) =>updatePassword(e)} autoComplete="off">
                              <div className="row">
                                <div className="col-2"></div>
                                <div className="col-8">
                                  <Form.Group
                                    className="mb-3 mt-3"
                                    controlId="formBasicEmail"
                                  >
                                    <Form.Label>Existing Password</Form.Label>
                                    <Form.Control
                                      type="password"
                                      required
                                      onChange={(e) => setChangePasswordObj({ ...changePasswordObj, currentPassword: e.target.value })}

                                    />
                                  </Form.Group>
                                </div>
                                <div className="col-2"></div>
                              </div>
                              <div className="row">
                                <div className="col-2"></div>
                                <div className="col-8">
                                  <Form.Group
                                    className="mb-3 mt-3"
                                    controlId="formBasicEmail"
                                  >
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control
                                      type="password"
                                      required
                                      onChange={(e) => setChangePasswordObj({ ...changePasswordObj, newPassword: e.target.value })}
                                    />
                                  </Form.Group>
                                </div>
                                <div className="col-2"></div>
                              </div>
                              <div className="row">
                                <div className="col-2"></div>
                                <div className="col-8">
                                  <Form.Group
                                    className="mb-3 mt-3"
                                    controlId="formBasicEmail"
                                  >
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                      type="password"
                                      required
                                      onChange={(e) => setChangePasswordObj({ ...changePasswordObj, confirmPassword: e.target.value })}
                                    />
                                  </Form.Group>
                                </div>
                                <div className="col-2"></div>
                              </div>
                              {showError && <p style={{color : 'red'}}>Passwords Doesn't Match</p> }
                              <div className="row">
                                <div className="col-8"></div>
                                <div className="col-4">
                                  <Button variant="primary" disabled={loading} type="submit">
                                    {loading ? <Spinner
                                      as="span"
                                      animation="border"
                                      size="sm"
                                      role="status"
                                      aria-hidden="true"
                                    /> : <span> Update Password</span>}
                                  </Button>
                                </div>
                              </div>
                            </Form>
                          </Card.Body>
                        </Card>
                      </Tab.Pane>
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Row> 
    </div>
  );
}

export default Profile;
