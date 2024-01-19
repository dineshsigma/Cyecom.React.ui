import { Col, Container, Row, Button, Card  } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setPlanDetails } from '../redux/reducers/organizationReducer' 
import { useNavigate } from "react-router-dom";
import SignUpLayout from "./layout"; 
import FreeTrial from "../assets/cutomizedplan.svg";
import BasicPlan from "../assets/cutomizedplan.svg"
import { HiChevronLeft } from "react-icons/hi"; 

 
function SignUp() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const setPlanType = (type) => {
        let body = {
            plan_type: type,
            subscription_months: '1'
        }
        dispatch(setPlanDetails(body))
        navigate('/signup/userdetails')
    }
    //navigate to previous page 
    const previousHandleChange=()=>{
        navigate('/')
    }

    return ( 
        <SignUpLayout className="login-page d-flex align-item-center justify-content-center" heading={"Step 1: Select plan type"}> 
            <button className="backbutton rounded-pill d_aic_jcc" onClick={previousHandleChange}><HiChevronLeft/> Back to Login</button>

            <Container id="signupcontent" className="container-fluid d_aic_jcc">
                <Row className="row d-flex align-item-center justify-content-center text-center">
                    <Col lg={12}><h3 className="mb-5 text-uppercase">Select a Plan type</h3></Col> 
                </Row>
                
                <Row className="row d-flex align-item-center justify-content-center text-center g-5"> 
                    <Col lg={5} className='col-sm-6 col-12'>
                        <Card className="text-center p-3">
                            <Card.Img variant="top" src={FreeTrial}/>
                            <Card.Body className="p-0">
                                <Card.Title className="mb-3">Free Trail</Card.Title>
                                <Card.Text>
                                    Some short explanation about the type goes here.
                                </Card.Text>
                                <Button color="primary" id="freePlan" onClick={() => setPlanType('free')} className="rounded-pill px-5 mb-3">Continue</Button>
                            </Card.Body>
                        </Card>
                    </Col> 
                    <Col lg={5} className='col-sm-6 col-12'>
                        <Card className="text-center p-3">
                            <Card.Img variant="top" src={BasicPlan}/>
                            <Card.Body className="p-0">
                                <Card.Title className="mb-3">Basic Plan</Card.Title>
                                <Card.Text>
                                    Some short explanation about the type goes here.
                                </Card.Text>
                                <Button color="primary" id="basicPlan" onClick={() => setPlanType('basic')} className="rounded-pill px-5 mb-3">Continue</Button>
                            </Card.Body>
                        </Card>
                    </Col> 
                </Row>
            </Container>
        </SignUpLayout> 
    )
}

export default SignUp;