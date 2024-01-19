import { Button, Card, Col, Container, Row, Form,Spinner } from "react-bootstrap";

import SignUpLayout from "./layout";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { organizationRegistartion } from '../redux/reducers/authReducer'
import { sendCreateOrgOtp, getOrganizations } from '../redux/reducers/organizationReducer' 
import { toast } from 'react-toastify'; 
import lockLogo from "../assets/lock.png";

function Otp() {
    const navigate = useNavigate();
    const createOrgObj = useSelector((state) => state.organization.createOrgObj)
    const createUserObj = useSelector((state) => state.organization.createUserObj)
    const plan_details = useSelector((state) => state.organization.plan_details)
    const [phoneotp, setPhoneOtp] = useState()
    const [emailotp, setEmailOtp] = useState()
    const [counter, setCounter] = useState(60);
    const [showResendOtp, setResendOtp] = useState(false)
    const [resendOtpLoading, setResendOtpLoading] = useState(false)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const organizationCreate = (e) => {
        // console.log(createOrgObj)
        e.preventDefault();
        setLoading(true)
        let body = {
            organization: createOrgObj.orgObj,
            subscription: plan_details,
            headquarter_location_name: createOrgObj.headquarter_location_name,
            user: createUserObj,
            otps: {
                client_type: '',
                phoneotp: phoneotp,
                emailotp: emailotp
            }
        }
        dispatch((organizationRegistartion(body))).then((res) => {
            if (res.payload.status) {
                toast.success(res.payload.message);
                setLoading(false)
                navigate('/')
            } else {
                toast.error(res.payload.message);
                setLoading(false)
            }
        })
    }

    const resendOtp = (e) => {
        e.preventDefault()
        setResendOtpLoading(true)
        let otpBody = {
            client_type: '',
            phone: createUserObj.phone,
            email: createUserObj.email
        }

        dispatch(sendCreateOrgOtp(otpBody)).then((res) => {
            console.log(res)
            if (res.payload.status) {
                toast.success(res.payload.message);
                setResendOtpLoading(false)
            } else {
                toast.error(res.payload.message);
                setResendOtpLoading(false)
            }
        })
    }

    useEffect(() => {
        setInterval(() => {
            setCounter((time) => time > 0 && time - 1);
        }, 1000);
    }, [])

    return (

        <SignUpLayout heading="Step 4: Verification">
            <Container className="mt-5">
                <Row className="text-center justify-content-center">
                    {/* <p>Otp sent to Email & mobile no</p> */}
                    <h4 className="mb-3">
                        OTP HAS BEEN SENT TO                  
                    </h4>
                    <Col xl={6} lg={6} md={10} sm={10} xs={10} className="mx-auto">
                        <Form onSubmit={(e) => organizationCreate(e)}>
                            <Card className="border-0 card_registration white-bg rounded-2">
                                <Card.Body className="border-0 p-0 m-0">
                                    <Col className="col-12">
                                        <Form.Group className="formGroup"> 
                                            <div className="lock-logo lock-logo_opt d_aic_jcc"><img src={lockLogo}/></div> <br></br>
                                            <span className="opt_text">{createUserObj?.email.split('@')[0].slice(0, 2)}*****@{createUserObj?.email.split('@')[1]} & {createUserObj?.phone.slice(0, 2)}******{createUserObj?.phone.slice(8, 10)}</span>
                                        </Form.Group> 
                                    </Col> 

                                    
                                    <Col className="col-12">
                                        <Form.Group className="formGroup"> 
                                            <Form.Control id="emailOtp" type="text" onChange={(e) => setEmailOtp(e.target.value)} className="form-control" placeholder="Email Otp *" required/>
                                        </Form.Group> 
                                    </Col> 
                                    <Col className="col-12">
                                        <Form.Group className="formGroup"> 
                                            <Form.Control id="phoneOtp" type="tel" onChange={(e) => setPhoneOtp(e.target.value)} className="form-control" placeholder="Mobile Otp *" required/>
                                        </Form.Group> 
                                    </Col>  
                                    <Col className="mt-3 mb-4">
                                        {counter > 0 ? <h6>Resend Otp in {counter}s</h6> :
                                         resendOtpLoading ? <Spinner className="m-3" as="span" animation="border" size="sm" role="status" aria-hidden="true"/> : 
                                         <Row>
                                            <div className="signup-link mt-3" size="lg"><a id="signupResend" href="javascript:void(0)" onClick={(e) => resendOtp(e)} >Resend Otp</a></div>
                                        </Row>
                                        }
                                    </Col>

                                    <Row className="mt-3">
                                        <Col className="d-grid">
                                            <Button className="dark-btn" variant="secondary"  onClick={() => navigate('/signup/organisationdetails')}>Previous</Button>
                                        </Col>
                                        <Col className="d-grid">
                                            <Button id="verifySignup" variant="primary" type="submit" disabled={loading}>
                                                {loading ? (
                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                                                ) : (<span> Submit</span>)} 
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

export default Otp;