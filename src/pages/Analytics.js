import { useDispatch } from "react-redux";
import {logOut } from '../redux/reducers/authReducer'
import { useNavigate } from "react-router-dom";
import { useState } from "react";


const Analytics = () => {
  //console.log('++++++++++++++++++++++++++++++++ This is Analytics Page ++++++++++++++++++++++++')
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accessToken=useState(localStorage.getItem('token'))
  const userOrgDat = useState(localStorage.getItem("userOrgData")&&JSON.parse(localStorage.getItem("userOrgData")));
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  console.log("userOrgDat",userOrgDat);
  console.log("accessToken",accessToken);
  console.log("userData",userData);

  const userLogin = (event) => {
    dispatch(logOut())
    navigate('/')
  }
  
  

  return (
    <div>
      <div className="title"> Analytics</div>
      <button onClick={userLogin}>Logout</button>
    </div>
  );
  
};

export default Analytics;
