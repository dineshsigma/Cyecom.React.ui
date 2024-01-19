
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import SignUpLayout from "./layout";
import Multiselect from 'multiselect-react-dropdown';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { sendCreateOrgOtp, getOrganizations, getConfigurationQuery } from '../redux/reducers/organizationReducer'
import { toast } from 'react-toastify';
import { setOrgCreateObj, setPlanDetails } from '../redux/reducers/organizationReducer'
import Form from 'react-bootstrap/Form';
import { useEffect } from "react";
import Spinner from 'react-bootstrap/Spinner';

function OrganisationDetails() {
    let business = ['Business-1', 'Business-2', 'Business-3'];
    let segment = ['Segment-1', 'Segment-2', 'Segment-3']
    const [headQuarters, setHeadQuarters] = useState('')
    const createUserObj = useSelector((state) => state.organization.createUserObj)
    const plan_details = useSelector((state) => state.organization.plan_details)
    const createOrgObj = useSelector((state) => state.organization.createOrgObj)
    const [showError, setShowError] = useState(false)
    const [showPincodeError, setShowPincodeError] = useState(false)
    const [selectMonths, setMonths] = useState('3')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const [validated, setValidated] = useState(false);
    const [selectedBusinessType, setSelectedBusinessType] = useState('');
    const [selectedSegmentType, setSelectedSegmentType] = useState('');
    const [orgCreateObj, setOrgObj] = useState({
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
        logo: ""
    })

    // console.log("orgCreateObj",orgCreateObj);
    const getConfigaration = useSelector((state) => state.organization.configation);
    // console.log("getConfigaration",getConfigaration);
    const uniqueBusinessTypes = [...new Set(getConfigaration.map((item) => item.busssiness_type))];
    // console.log("uniqueBusinessTypes",uniqueBusinessTypes);
    // console.log("orgCreateObj.business_type",orgCreateObj.business_type);

    const segmentTypes = getConfigaration
        .filter((config) => config.busssiness_type
        == orgCreateObj.business_type)
        .map((config) => config.segment_type);

        // console.log("segmentTypes",segmentTypes);

    useEffect(() => {
        dispatch(getConfigurationQuery());
        if (createOrgObj) {
            setOrgObj(createOrgObj.orgObj)
            setHeadQuarters(createOrgObj.headquarter_location_name)
            // setOrgObj(createUserObj)
        }
    }, [])

    const [showBusinessError, setShowBusinessError] = useState(false);
    const [showSegmentError, setShowSegmentError] = useState(false)
    const sendOtp = (event) => {
        // console.log("event", event);
        // console.log("setShowBusinessError",showBusinessError);
        // console.log("buss",orgCreateObj.business_type)
        

        const form = event.currentTarget;
        
        if (form.checkValidity() === false ) {
            event.preventDefault();
            event.stopPropagation();
            setShowBusinessError(true)
            setShowSegmentError(true)
            setValidated(true);

            return ;
           
        } else {
            event.preventDefault();
            setLoading(true)
            let temp = plan_details
            let body = {
                headquarter_location_name: headQuarters,
                orgObj: orgCreateObj
            }
            let otpBody = {
                client_type: '',
                phone: createUserObj.phone,
                email: createUserObj.email
            }
            

            if (plan_details.plan_type === 'basic') {
                let temp = {
                    plan_type: 'basic',
                    subscription_months: selectMonths
                }
                dispatch(setPlanDetails(temp))
            }
            // if(orgCreateObj.business_type == "")  return  setShowBusinessError(true)
            // if(orgCreateObj.segment_type == "")   return setShowSegmentError(true)
            ///console.log("setShowBusinessError",showBusinessError,showSegmentError);
            else if(orgCreateObj.business_type.length == 0 ){
                // console.log("segment eroor")
                setShowBusinessError(true)
                setLoading(false)
                return ;
            }
            else if(orgCreateObj.segment_type.length == 0){
                setShowSegmentError(true)
                // console.log("business eroor")
                setLoading(false)
                return ;

            }
            dispatch(sendCreateOrgOtp(otpBody)).then((res) => {
                // console.log(res)
                if (res.payload.status) {
                    toast.success(res.payload.message);
                    // console.log(body)
                    dispatch(setOrgCreateObj(body))
                    navigate('/signup/otp')
                    setLoading(false)
                    setValidated(false);
                    setShowBusinessError(false)
                    setShowSegmentError(false)
                } else {
                    toast.error(res.payload.message);
                    setLoading(false)
                }
            })
        }
    }

    const goPreviousPage = () => {
        let body = {
            headquarter_location_name: headQuarters,
            orgObj: orgCreateObj
        }
        dispatch(setOrgCreateObj(body))
        navigate('/signup/userdetails')
        setValidated(false)
    }

    


    // useEffect(() => {
    //     console.log(orgCreateObj, 'ORGG');

    // }, [orgCreateObj])

   

    return (
        <SignUpLayout heading="Step 3: Organization Details">
            <Container id="organisation" className="mt-5">
                <Row className="text-center justify-content-center">
                    <h4>What is this Organization about?</h4>
                    <p className="light-gray fz-md mb-4">Manage better by adding all relevant Organization information</p>

                    <Col xl={6} lg={6} md={10} sm={10} xs={10} className="mx-auto mb-5">
                        <Form noValidate validated={validated} onSubmit={(e) => sendOtp(e)}>
                            <Card className="border-0 card_registration white-bg rounded-2">
                                <Card.Body className="border-0 p-0 m-0">
                                    <Row>
                                        <Col className="col-12 col-sm-6">
                                            <Form.Group className="formGroup" controlId="">
                                                <Form.Control id="orgCode" required minLength={3} maxLength={15} pattern="^\S*$" value={orgCreateObj.uni_code} onChange={(e) => setOrgObj({ ...orgCreateObj, uni_code: e.target.value })} type="text" placeholder="Organisation Code*" />
                                                <Form.Control.Feedback type="invalid">Code Should have minimum 3 letters and should not contain spaces</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col className="col-12 col-sm-6">
                                            <Form.Group className="formGroup" controlId="">
                                                <Form.Control id="orgName" required minLength={3} maxLength={15} value={orgCreateObj.name} onChange={(e) => setOrgObj({ ...orgCreateObj, name: e.target.value })} type="text" placeholder="Organisation Name*" />
                                                <Form.Control.Feedback type="invalid">Name should have atleast minimum 3 letters</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col className="col-12 col-sm-6">
                                            <Form.Group className="formGroup" controlId="">
                                                <Form.Control required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$" onChange={(e) => setOrgObj({ ...orgCreateObj, email: e.target.value })} type="email" value={orgCreateObj.email} placeholder="Organisation Email *" id="orgEmail" />
                                                <Form.Control.Feedback type="invalid">Invalid Email</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col className="col-12 col-sm-6">
                                            <Form.Group className="formGroup" controlId="">
                                                <Form.Control id="orgPhone" type="tel" maxLength={10} value={orgCreateObj.contact_no} pattern="[6789][0-9]{9}" minLength={10} onChange={(e) => setOrgObj({ ...orgCreateObj, contact_no: e.target.value })} placeholder="Organization Phone *" required />
                                                <Form.Control.Feedback type="invalid">Invalid Phone Number</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col className="col-12">
                                            <Form.Group className="formGroup" controlId="">
                                                <Form.Control id="orgHeadQuarters" required minLength={3} maxLength={15} value={headQuarters} onChange={(e) => setHeadQuarters(e.target.value)} type="text" placeholder="Head-Quaters Location *" />
                                                <Form.Control.Feedback type="invalid">Head Quarters should have atleast minimum 3 letters</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col className="col-12">
                                            <Form.Group className="formGroup" controlId="">
                                                <Form.Control id="orgAddress" required minLength={3} maxLength={40} value={orgCreateObj.address} onChange={(e) => setOrgObj({ ...orgCreateObj, address: e.target.value })} type="text" placeholder="Organisation Address *" />
                                                <Form.Control.Feedback type="invalid">Address should have atleast minimum 3 letters</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col className="col-12 col-sm-4">
                                            <Form.Group className="formGroup" controlId="">
                                                <Form.Control id="orgDistrict" required minLength={3} maxLength={15} value={orgCreateObj.district} onChange={(e) => setOrgObj({ ...orgCreateObj, district: e.target.value })} type="text" placeholder="District *" />
                                                <Form.Control.Feedback type="invalid">District should have atleast minimum 3 letters</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col className="col-12 col-sm-4">
                                            <Form.Group className="formGroup" controlId="">
                                                <Form.Control id="orgState" required minLength={3} maxLength={15} value={orgCreateObj.state} onChange={(e) => setOrgObj({ ...orgCreateObj, state: e.target.value })} type="text" placeholder="State *" />
                                                <Form.Control.Feedback type="invalid">State should have atleast minimum 3 letters</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col className="col-12 col-sm-4">
                                            <Form.Group className="formGroup" controlId="">
                                                <Form.Control id="orgPincode" required minLength={6} maxLength={6} pattern="[0-9]{6}" value={orgCreateObj.pincode} onChange={(e) => setOrgObj({ ...orgCreateObj, pincode: e.target.value })} type="text" placeholder="Pincode *" />
                                                <Form.Control.Feedback type="invalid">Invalid Pincode</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col className="col-12">
                                            <Form.Group className="formGroup" controlId="">
                                                <Form.Control id="orgDomain" required minLength={3} maxLength={15} value={orgCreateObj.domain_name} onChange={(e) => setOrgObj({ ...orgCreateObj, domain_name: e.target.value })} type="text" placeholder="Domain Name *" />
                                                <Form.Control.Feedback type="invalid">Domain should have atleast minimum 3 letters</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col className="col-12 col-sm-6">
                                            <Form.Group className="formGroup" controlId=""  >
                                                <Multiselect  id ="orgBusiness" options={uniqueBusinessTypes}   required  singleSelect={true} onSelect={(e) => setOrgObj({...orgCreateObj, business_type: e?.[0]})} avoidHighlightFirstOption={true} isObject={false} placeholder="Business Type"></Multiselect>
                                                {showBusinessError && orgCreateObj.business_type.length == 0 && <span className="mt-4 text-danger">Please Enter Business Type</span>}
                                            </Form.Group>
                                        </Col>

                                        <Col className="col-12 col-sm-6">
                                            <Form.Group className="formGroup" controlId="">
                                                <Multiselect options={segmentTypes}   singleSelect={true} onSelect={(e) => setOrgObj({ ...orgCreateObj, segment_type: e?.[0] })} avoidHighlightFirstOption={true}  isObject={false} placeholder="Segment Type"  disable={orgCreateObj.business_type == ""}></Multiselect>
                                                { showBusinessError && setShowSegmentError && orgCreateObj.segment_type.length == 0 && <span className="mt-4 text-danger">Please Enter Business Type</span>}
                                            </Form.Group>
                                        </Col>



                                        {/* <Col className="col-12 col-sm-6">
                                            <Form.Group className="formGroup" controlId="">
                                                <Multiselect avoidHighlightFirstOption={true} onChange={(e) => setOrgObj({ ...orgCreateObj, time_zone: e.target.value })} singleSelect={true} placeholder="Time Zone"></Multiselect>
                                            </Form.Group>
                                        </Col> */}

                                        <Col className="col-12 col-sm-12">
                                            {/* <Form.Group className="formGroup" controlId="">
                                                <Multiselect avoidHighlightFirstOption={true} singleSelect={true} placeholder="Select Language"></Multiselect>
                                            </Form.Group> */}
                                        </Col>
                                    </Row>
                                    {
                                        plan_details.plan_type === 'basic' && <Row className="mt-3">

                                            <Col className="col-12">
                                                <Form.Group className="formGroup" controlId="">
                                                    <Form.Select aria-label="Default select example" value={selectMonths} onChange={(e) => { setMonths(e.target.value) }}>
                                                        <option id="3" value="3" >3 Months</option>
                                                        <option id="6" value="6">6 Months</option>
                                                        <option id="9" value="9">9 Months</option>
                                                        <option id="12" value="12">12 Months</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    }

                                    <Row className="mt-3">
                                        <Col className="d-grid">
                                            <Button className="dark-btn" variant="secondary" id="orgPrev" onClick={goPreviousPage}>Previous</Button>
                                        </Col>
                                        <Col className="d-grid">
                                            <Button id="orgNext" variant="primary" type="submit" disabled={loading}>
                                                {loading ? (
                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                ) : (<span> Next</span>)}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                        </Form>
                    </Col>
                </Row>
            </Container>
        </SignUpLayout>
    )
}

export default OrganisationDetails;