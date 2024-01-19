import React, { useEffect } from "react";    
import { Button, Form, Col, Row, InputGroup, Spinner } from "react-bootstrap";

import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { login, validateUser, forgotPasswordValidation, setPasswordValidation } from "../redux/reducers/authReducer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserNotificatinos } from '../redux/reducers/userReducer'
import { AiOutlineArrowLeft, AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; 
import { SlEnvolope, SlPhone } from "react-icons/sl"; 
import OTPInput, { ResendOTP } from "otp-input-react";  
import logoLg from "../assets/CyecomLg.png";
import "react-toastify/dist/ReactToastify.css";  

import lockLogo from "../assets/lock.png";
// import emailpng from '../assets/email.png';
import logo from '../assets/logo.png';
import station from "../assets/station.svg";


export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordType, setPasswordType] = useState(true);
  const [loading, setLoading] = useState(false)
  const [screen, setScreen] = useState('Login')
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState()
  const [forgotEmail, setForgotEmail] = useState('')
  const [counter, setCounter] = useState(300);
  const [minutes,setMinutes]=useState(5)
  const [resendOtpLoading, setResendOtpLoading] = useState(false)
  const [showOTPInput,setshowOTPInput]=useState(false)
  const [checkvalue,setCheckvalue]=useState(false) 
  const [sendOtpCheck,setSendOtpCheck]=useState(false)
  const [showTimer, setShowTimer] = useState(true);
  const [successOtp,setSuccessOtp]=useState(false)
  const [showCounter,setShowCounter]=useState();
  const [otpError,setOtpError]=useState(false);
  const[backClearInterval,setBackClearInterval]=useState(false)
  // console.log("Error",otpError)


  // useEffect(() => {
  //   let timer;
  //   if (counter > 0&&showOtp) {
  //     timer = setInterval(() => {
  //       setCounter((time) => time > 0 && time - 1);
  //     }, 1000);
  //   } else {
  //     setShowTimer(false);
  //   }

  //   return () => {
  //     clearInterval(timer);
  //     setCounter(60)
  //   };
  // }, [counter,showOtp]);
  useEffect(() => {
    let timer;
    let seconds;
    let minutes_count;
    if (showOtp && showTimer) {
      timer = setInterval(() => {
      setCounter((time) => time > 0 ? time - 1 : 0)
      minutes_count = Math.floor(counter / 60);
      const seconds = counter % 60;
      const formattedSeconds = seconds.toString().padStart(2, "0");
      setShowCounter(formattedSeconds)
      const formattedMinutes = minutes_count.toString().padStart(2, "0");
      setMinutes(formattedMinutes)
      }, 1000);
    }
    if(backClearInterval){
      clearInterval(timer);
      setCounter(300)
      setBackClearInterval(false)
      setShowCounter()
      setMinutes(5)
    }
    return () => {
      clearInterval(timer);
    };
  }, [showOtp,showTimer,counter]);

  useEffect(() => {
    if (counter === 0) {
      setShowTimer(false)
      setCounter(300); 
    }
    // if(showCounter===0&&counter!=0){
    //   setShowCounter(59)
    // }
  }, [counter]);


  const userLogin = async (event) => {
    event.preventDefault();
    setLoading(true)

    const payload = {
      login_type: "email",
      password: password,
      username: username.trim().toLowerCase(),
      is_remember:checkvalue
    }
    if (username.includes('@')) {
      payload.login_type = 'email'
    } else {
      payload.login_type = 'phone'
    }

    dispatch(login(payload)).then((res) => {
      // console.log(res.payload.accessToken)
      if (res.payload.accessToken) {
        dispatch(getUserNotificatinos())
        navigate('/')
      }
      setLoading(false)

    })
  };

  function signup() {
    if(!loading) navigate('/signup')
  }
  

//this function Send otp to Email
  const sednOtp = (e) => {
    e.preventDefault()
      let timer;
      setLoading(true);
      // console.log("forgotEmail----",forgotEmail);
      dispatch(forgotPasswordValidation(forgotEmail)).then((res) => {
        // console.log('Otp Send Sucessfully')
        // console.log(res.payload, 'RESSS');
        if (res.payload.response.status) {
          setForgotEmail(res.payload.data)
          toast.success(res.payload.response.message)
          setshowOTPInput(true)
          setShowOtp(true)
          setLoading(false)         
        } else {
          toast.error(res.payload.response.message)
          setLoading(false)
        }
  
      })
    
   

  }

  // this function Again send Otp to Email
  const resendOtp = (e) => {
    e.preventDefault()
    setShowTimer(true)
    setResendOtpLoading(true)
    dispatch(forgotPasswordValidation(forgotEmail)).then((res) => {
      // console.log('Otp Send Sucessfully')
      // console.log(res.payload)
      if (res.payload.status) {
        toast.success(res.payload.message)
        setShowOtp(true)
        setResendOtpLoading(false)
      } else {
        toast.error(res.payload.message)
        setResendOtpLoading(false)
      }

    })
  }



 
  //this function to verify the otp valid or not
  const verifyOtp = (e) => {
    e.preventDefault()
    if(otp?.length<6||!otp){
      setOtpError(true)
      return
    }
    setLoading(true)
    let body = {
      email: forgotEmail,
      otp: otp
    }
    dispatch(setPasswordValidation(body)).then((res) => {
      if (res.payload.status) {
        toast.success(res.payload.message)
        setSuccessOtp(true)
        setLoading(false)
        // setScreen('Login')
        setShowOtp(false)
        setOtp()
        setShowCounter()
        setMinutes(5)
      } else {
        if(!res.payload.status){
          toast.error(res.payload.message)
        }
        setLoading(false)
      }
    })

  }

  return (
    <div className="login-page p-0 d_aic_jcc">
      <div className="container">
        <div className="row d-flex align-item-center justify-content-center">
          <div className="col-xl-4 col-lg-5 col-md-10 col-sm-10 d-none d-sm-block">
            <div className="login-sliderimg">
              <img src={station} alt="station" />
            </div>
          </div>
          <div className="col-xl-4 col-lg-5 col-md-8 col-sm-9">
            <div className="login_card text-center">
              {screen == "Login" ? (
                <div className="lg-logo">
                  <img src={logoLg} alt="logo" />
                </div>
              ) : (
                <div className="lock-logo d_aic_jcc">
                  <img src={lockLogo} alt="locklogo" />
                </div>
              )}
              {screen === "Login" && (
                <div className="loginform-card border-0">
                  <center className="mt-4 mb-5">
                    <h1>Sign In</h1>
                  </center>
                  <Form className="mt-4" onSubmit={userLogin}>
                    <Form.Group className="formGroup mb-3" controlId="email">
                      <Form.Label>
                        Enter Email/Phone <b>*</b>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                        }}
                        onFocus={() => setSendOtpCheck(true)}
                        disabled={loading}
                        required
                        autoFocus
                      />
                    </Form.Group>

                    <Form.Group className="formGroup" controlId="password">
                      <Form.Label>
                        Password <b>*</b>
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={passwordType ? "password" : "text"}
                          onChange={(e) => {
                            setPassword(e.target.value);
                          }}
                          required
                          disabled={loading}
                        />
                        <InputGroup.Text
                          id="inputGroupPrepend"
                          onClick={() => {!loading&&setPasswordType(!passwordType)}}
                        >
                          {passwordType ? (
                            <AiFillEyeInvisible />
                          ) : (
                            <AiFillEye />
                          )}
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="formGroup mt-3 d-flex align-items-center justify-content-between">
                      <div className="d_aic_jcc gap-2">
                        <Form.Check
                          className="m-0 p-0 align-items-center"
                          type="checkbox"
                          onClick={() => setCheckvalue(!checkvalue)}
                          disabled={loading}
                          id="1"
                          label={`Remember me`}
                        />
                      </div>
                      <div className="float-start signup-link">
                        <a
                          href="javascript:void(0)"
                          onClick={() =>{ !loading&&setScreen("ForgorPassword")}}
                        >
                          Forgot Password?
                        </a>
                      </div>
                    </Form.Group>

                    <Form.Group className="formGroup mt-4">
                      <Row className="row d-flex align-item-center justify-content-end">
                        <Col className="col-12 mb-4">
                          <Button
                            variant="primary"
                            type="submit"
                            className="btn-login d_aic_jcc m-0 p-0"
                            disabled={loading}
                          >
                            {loading ? (
                              <Spinner
                                as="span"
                                animation="border"
                                size="md"
                                role="status"
                                aria-hidden="true"
                              />
                            ) : (
                              <span> Login </span>
                            )}
                          </Button>
                        </Col>

                        <Col className="col-md-12">
                          <div className="text-center signup-link">
                            Don't have an account yet{" "}
                            <a href="javascript:void(0)" onClick={signup}>
                              Sign Up
                            </a>
                          </div>
                        </Col>
                      </Row>
                    </Form.Group>
                  </Form>
                </div>
              )}
              {screen === "ForgorPassword" && (
                <div className="loginform-card border-0">
                  <center className="mt-4 mb-2">
                    <h1>
                      {showOtp
                        ? "Enter OTP"
                        : successOtp
                        ? "Password Sent Successfully"
                        : "Forgot Password ?"}
                    </h1>
                  </center>
                  <p className="para-text">
                    {showOtp
                      ? `Otp has been sent to ${
                          forgotEmail.slice(0, 3) +
                          "****" +
                          forgotEmail.slice(
                            forgotEmail.length - 3,
                            forgotEmail.length
                          )
                        } email address`
                      : successOtp
                      ? `Password has been sent to ${
                          forgotEmail.slice(0, 3) +
                          "****" +
                          forgotEmail.slice(
                            forgotEmail.length - 3,
                            forgotEmail.length
                          )
                        }`
                      : "Enter phone number associate with your account and we'll send password to your registered mail id"}
                  </p>
                  <Form
                    className="mt-4"
                    onSubmit={(e) => (showOtp ? verifyOtp(e) : sednOtp(e))}
                  >
                    {!showOtp && !successOtp && (
                      <Form.Group className="formGroup" controlId="forgotEmail">
                        <Form.Control
                          type="tel"
                          placeholder="Phone No"
                          autoFocus
                          onChange={(e) => {
                            // Limit the input to 10 characters
                            if (e.target.value.length <= 10) {
                              setForgotEmail(e.target.value.toLowerCase());
                            }
                          }}
                          required
                          maxLength={10}
                        />
                        {/* <SlPhone className="mail-icon"/> */}
                      </Form.Group>
                    )}

                    {showOtp && (
                      <>
                        <Form.Group
                          className="formgroup mt-3"
                          controlId="emailOtp"
                        >
                          <Form.Label className="text-center otp-text mb-3">
                            Enter your Code here{" "}
                          </Form.Label>
                          <OTPInput
                            className="otp-text"
                            required
                            value={otp}
                            onChange={setOtp}
                            disabled={!showTimer}
                            autoFocus
                            OTPLength={6}
                            onFocus={() => setOtpError(false)}
                            otpType="number"
                          />
                        </Form.Group>
                        {otpError && (
                          <span className="text-danger mt-3">
                            please Enter OTP Completely
                          </span>
                        )}
                        <div className="d-flex justify-content-center">
                          <div className="float-end resent-otp">
                            {counter > 0 && showTimer ? (
                              <h6 className="mt-3">
                                {minutes}:{showCounter ? showCounter : "00"} sec
                              </h6>
                            ) : (
                              ""
                            )}

                            {minutes < 4 ? (
                              resendOtpLoading ? (
                                <Spinner
                                  lassName="m-3"
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                />
                              ) : (
                                <>
                                  <Row>
                                    <Col className="signup-link mt-3">
                                      if you don't receive a code!{" "}
                                      <a
                                        href="javascript:void(0)"
                                        onClick={(e) => {
                                          resendOtp(e);
                                        }}
                                      >
                                        Resend
                                      </a>
                                    </Col>
                                  </Row>
                                </>
                              )
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <Form.Group className="formGroup mt-3" controlId="">
                      <Row className="row d-flex align-item-center justify-content-end">
                        <Col className="col-md-12 justify-content-end text-end">
                          {!successOtp && (
                            <Button
                              variant="primary"
                              type="submit"
                              className="btn-login"
                              disabled={loading}
                            >
                              {loading ? (
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="md"
                                  role="status"
                                  aria-hidden="true"
                                />
                              ) : (
                                <b> {showOtp ? "SUBMIT OTP" : "Submit"} </b>
                              )}
                            </Button>
                          )}
                        </Col>
                        <Col className="col-md-12">
                          <div className="float-center signin-link mt-3">
                            <a
                              className="text-decoration-none"
                              href="javascript:void(0)"
                              onClick={() => {
                                setScreen("Login");
                                setShowOtp(false);
                                setLoading(false);
                                setOtp();
                                setBackClearInterval(true);
                                setSuccessOtp(false);
                              }}
                            >
                              <AiOutlineArrowLeft /> Back to Login?
                            </a>
                          </div>
                        </Col>
                      </Row>
                    </Form.Group>
                  </Form>
                </div>
              )}
              {/* {
                screen === 'ForgorPassword' && 
                <div className="loginform-card border-0">
                  <center className="mt-4 mb-2"><h1>{showOtp?"Enter OTP":successOtp?"Password Sent Successfully":"Forgot Password ?"}</h1></center>
                  <p className="para-text">
                    {showOtp?`Otp has been sent to this  ${forgotEmail.slice(0,3)+"****"+forgotEmail.slice(forgotEmail.length-3,forgotEmail.length)} email address`:successOtp?`Password has been sent to ${forgotEmail.slice(0,3)+"****"+forgotEmail.slice(forgotEmail.length-3,forgotEmail.length)}`:"Enter email address associate with your account and we'll send to a link to reset your password"}
                  </p>
                  <Form className="mt-4" onSubmit={(e) => showOtp ? verifyOtp(e) : sednOtp(e)}>
                    {
                      (!showOtp&&!successOtp)&&<Form.Group className="formGroup" controlId="forgotEmail"> 
                      <Form.Control type="text" placeholder="Email ID" autoFocus onChange={(e) => {setForgotEmail(e.target.value.toLowerCase());}} required/>
                      <SlEnvolope className="mail-icon"/>
                  </Form.Group>
                    }
                  

                    {showOtp  &&
                      <>
                      <Form.Group className="formgroup mt-3" controlId="emailOtp"> 
                        <Form.Label className="text-center otp-text mb-3">Enter your Code here </Form.Label>
                        <OTPInput className='otp-text' required value={otp} onChange={setOtp} disabled={!showTimer} autoFocus OTPLength={6} onFocus={()=>setOtpError(false)} otpType="number"/> 
                       
                          </Form.Group>
                          {otpError&&<span className="text-danger mt-3">please Enter OTP Completely</span>}
                        <div className="d-flex justify-content-center">
                          <div className="float-end resent-otp">
                            {counter > 0&&showTimer?
                            <h6 className="mt-3">{minutes}:{showCounter?showCounter:"00"} sec</h6>:""}
                           
                            {minutes<4?
                            resendOtpLoading ? 
                              <Spinner lassName="m-3" as="span" animation="border" size="sm" role="status" aria-hidden="true"/> :<>
                              <Row>
                                <Col className="signup-link mt-3">if you don't receive a code! <a href="javascript:void(0)" onClick={(e) =>{resendOtp(e)}} >Resend</a></Col>
                              </Row>
                              </>
                              :""
                            }
                          </div>
                        </div>
                      </>
                    }

                    <Form.Group className="formGroup mt-3" controlId="">
                      <Row className="row d-flex align-item-center justify-content-end">
                        <Col className="col-md-12 justify-content-end text-end">
                          {
                            !successOtp&&<Button variant="primary" type="submit" className="btn-login" disabled={loading}>
                            {loading ? <Spinner as="span" animation="border" size="md" role="status" aria-hidden="true"/> : <b> {showOtp ? 'SUBMIT OTP' : 'Submit'} </b>}
                          </Button>
                          }

                        </Col>
                        <Col className="col-md-12">
                          <div className="float-center signin-link mt-3">
                            <a className="text-decoration-none" href="javascript:void(0)" onClick={() => {setScreen('Login');setShowOtp(false);setLoading(false);setOtp();setBackClearInterval(true);setSuccessOtp(false)}}><AiOutlineArrowLeft/> Back to Login?</a>
                          </div>
                        </Col>
                      </Row>
                    </Form.Group>
                  </Form>
                </div>
              } */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}