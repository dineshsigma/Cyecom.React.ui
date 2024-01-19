import { Button, Card, Col, Container, Row, Form } from "react-bootstrap";
import SignUpLayout from "./layout";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { setUserObj,getCheckExistUser,setcheckExistUser } from '../redux/reducers/organizationReducer'
import CryptoJS from 'crypto-js'
import { avatarBrColors } from '../environment' 
import { toast } from 'react-toastify';

function UserDetails() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showError, setShowError] = useState(false)
    const [userDetails, setUserDetails] = useState({
        name: "",
        lastname: "",
        email: "",
        phone: "",
        password: generatePassword(),
        login_type: "email",
        created_by: 0,
        color: avatarBrColors[Math.floor(Math.random() * avatarBrColors.length)]
    })
    const createUserObj = useSelector((state) => state?.organization?.createUserObj)
    const plan_details = useSelector((state) => state?.organization?.plan_details)
    const checkUser = useSelector((state) => state?.organization?.checkExistUser?.response)
    const [validated, setValidated] = useState(false);
    const [mobileDuplicateError,setMobileDuplicateError]=useState(false)

    const updateUserDetails = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
           setValidated(true)
            
        } else { 
            dispatch(setUserObj(userDetails))
            navigate('/signup/organisationdetails')
            setValidated(false);

        }
    }

    function addtask(){
        console.log('dshgfdsgfvdsg fdgshfj jhd fj sdhf sd')
    }



    useEffect(() => {
        if(checkUser&&checkUser.message!=""){
            toast.error(checkUser.message)
          }
    }, [checkUser])

    useEffect(()=>{
        if (createUserObj.name) {
            setUserDetails(createUserObj)
        }
    },[])

    function generatePassword() {
        var pass = '';
        const secret = "Y3llY29tbG9naW5lbmNyeXB0aW9u";
        var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
            'abcdefghijklmnopqrstuvwxyz0123456789@#';

        for (let i = 1; i <= 12; i++) {
            var char = Math.floor(Math.random()
                * str.length + 1);

            pass += str.charAt(char)
        }
        let password = CryptoJS.AES.encrypt(pass, secret).toString();

        return password;
    }
//Checks Mobile number exists or not
    const mobileBlurChange=(e)=>{
    if(userDetails.phone!=""){
      dispatch(getCheckExistUser({"phone": userDetails.phone})).then((res)=>{
        if(res.payload?.response?.message){
            setMobileDuplicateError(true)
        }
        else{
            setMobileDuplicateError(false)
        }
      })
        }
    }


const mobileHandleChange=(e)=>{
    setUserDetails({ ...userDetails, phone: e.target.value })
    if(e.target.value.length==10){
        dispatch(getCheckExistUser({"phone":e.target.value})).then((res)=>{
            if(res.payload?.response?.message){
                setMobileDuplicateError(true)
            }
            else{
                setMobileDuplicateError(false)
            }
          })
}
}

const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text/plain');
    setUserDetails({ ...userDetails, phone:pastedText })
    if(pastedText.length==10){
        dispatch(getCheckExistUser({"phone":pastedText})).then((res)=>{
            // console.log("Duplicate Responnsee",res)
            if(res.payload?.response?.status){
                setMobileDuplicateError(true)
            }
          })
    }

  };

//navigate to previous page 
    const previousHandleChange=()=>{
    navigate('/signup')
    setUserDetails({ ...userDetails})
    setValidated(false)
    dispatch(setcheckExistUser(""))
    }

    return (
        <SignUpLayout heading="Step 2: Personal details">
            <Container className="mt-5">
                <Row className="text-center d_aic_jcc">
                    <h4>User Details</h4>
                    <p className="light-gray fz-md mb-4">Manage better by adding all relevant Personal information</p>

                    <Col xl={5} lg={6} md={10} sm={10} xs={10}  className="mx-auto">
                        <Form noValidate validated={validated} onSubmit={(e) => updateUserDetails(e)} autoComplete="off">
                            <Card className="border-0 card_registration white-bg rounded-2">
                                <Card.Body className="border-0 p-0 m-0"> 
                                    <Row>
                                        <Col className="col-12 col-sm-6">
                                            <Form.Group className="formGroup" controlId="firstname">
                                                {/* <Form.Label>Start Date</Form.Label> */}
                                                <Form.Control required pattern="[a-zA-Z]*" minLength={3} maxLength={15} value={userDetails.name} onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })} type="text" placeholder="First Name *" />
                                                <Form.Control.Feedback type="invalid">First Name should have atleast minimum 3 letters contains only alphates</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col className="col-12 col-sm-6">
                                            <Form.Group className="formGroup" controlId="lastname">
                                                <Form.Control required minLength={3} maxLength={15} value={userDetails.lastname} onChange={(e) => setUserDetails({ ...userDetails, lastname: e.target.value })} type="text" placeholder="Last Name *" />
                                                <Form.Control.Feedback type="invalid">Last Name should have atleast minimum 3 letters</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        
                                        <Col className="col-12">
                                            <Form.Group className="formGroup" controlId="email">
                                                <Form.Control required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$"
                                                onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value.toLowerCase()})} type="email" value={userDetails.email} placeholder="Email *"/>
                                                <Form.Control.Feedback type="invalid">Invalid Email</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col> 

                                        <Col className="col-12 mb-3">
                                            <Form.Group className="formGroup" controlId="phone">
                                                <Form.Control id="orgPhone" type="tel" value={userDetails.phone} pattern="[6789][0-9]{9}" minLength={10} maxLength={10}  onChange={(e)=>mobileHandleChange(e)} onPaste={(e)=>handlePaste(e)} onBlur={(e)=>mobileBlurChange(e)} placeholder="Phone *" required/>
                                                <Form.Control.Feedback type="invalid">Invalid Phone Number</Form.Control.Feedback>
                                                {mobileDuplicateError&&<span className="text-danger">Duplicate Mobile Number</span>}
                                            </Form.Group>
                                        </Col> 

                                        <Col className="d-grid">
                                            <Button className="dark-btn" variant="secondary" id="userDetailsPrev" onClick={previousHandleChange}>Previous</Button>
                                        </Col>
                                        <Col className="d-grid">
                                            <Button id="userDetailsNext" variant="primary" type="submit" disabled={mobileDuplicateError} >Next</Button>
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

export default UserDetails;