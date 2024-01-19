import { useState, useEffect } from 'react';
import { logOut } from '../redux/reducers/authReducer';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

const useUserData = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userOrgData = localStorage.getItem('userOrgData') ? JSON.parse(localStorage.getItem('userOrgData')) : null
    const userOrgDat = useState(localStorage.getItem("userOrgData") ? JSON.parse(localStorage.getItem("userOrgData")) : null);
    const userData = useState(localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")) : null);
    const accessToken = useState(localStorage.getItem("token"))

    useEffect(() => {
        if (!accessToken || !userData || !userOrgDat) {
            dispatch(logOut())
            navigate('/')
        }
    }, [userOrgDat, userData, accessToken]);

    return null;
};

export default useUserData;
