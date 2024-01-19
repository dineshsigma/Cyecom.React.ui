import ProgressBar from "react-bootstrap/ProgressBar";
import Carousel from 'react-multi-carousel';
import { useEffect } from "react";
import "react-multi-carousel/lib/styles.css";
import {
  BiGasPump,
  BiCalendar,
  BiTachometer,
  BiChevronRight,
  BiChevronLeft,
} from "react-icons/bi";
import {
  FaEllipsisH,
  FaArrowAltCircleRight,
  FaArrowAltCircleLeft,
} from "react-icons/fa";
import AvatarStack from "../components/AvatarStack";
import Avatar from "../components/Avatar";
import { FaListUl } from "react-icons/fa";
import { getDeparmentTaskFilter } from "../redux/reducers/dashboardReducer";
import { useDispatch, useSelector } from "react-redux";

const DepartmentCarousel = () => {
  const dispatch=useDispatch();
  const departmentsData=useSelector((state)=>state.dashboard.departmentsData);
  const usersList = useSelector((state) => state.users.usersList);

  const fetchAvatarStack = (avatars) => {
    let avstarsFinal = []
    avatars.map((item) => {
      let user = usersList?.find((i) => i.id === item)
      user && avstarsFinal.push(user)
    })
    return <AvatarStack limit={5} avatars={avstarsFinal}/>
  }

  const progressCount=(progressData)=>{
    let tasksData={
      openCount:0,
      closedCount:0,
      totalCount:0,
      progress:0
    }
    progressData.counts.map((item)=>{
      if(item.status=='closed'){
        tasksData.closedCount=parseInt(item.count)
      }
      if(item.status=='open'){
        tasksData.openCount=parseInt(item.count)
      }
    })
    tasksData.totalCount=tasksData.openCount+tasksData.closedCount
    tasksData.progress = (tasksData.closedCount / tasksData.totalCount) * 100
    return tasksData
  }

  const avatars = [
    {
      id: 143,
      name: "IVORY",
      lastname: "INNOVATIONS",
      email: "ivory.innovations2018@gmail.com",
      phone: "8341562867",
      is_delete: false,
      password: "U2FsdGVkX18hOZlm08FOjlrEOMtZE2pWgOHhd50vBoM=",
      login_type: "email",
      created_at: "2023-01-07T05:30:49.973435+00:00",
      created_by: 0,
      deleted_by: null,
      deleted_on: null,
      is_active: true,
      updated_by: 143,
      updated_on: "2023-04-06T03:57:52.646+00:00",
      color: "--br-dark",
      image:
        "https://s3.ap-south-1.amazonaws.com/happimobiles/retool-upload/b9862214-a5e0-4cef-bc64-7ade5a8a7f6f.png",
    },
    {
      id: 10556,
      name: "Sai Pavan",
      lastname: "kasul",
      email: "saipavan@iipl.works",
      phone: "8555090572",
      is_delete: false,
      password: "U2FsdGVkX1/vfqrNVYZRBdY1f8cQOkqT1LBQjFwlkwQ=",
      login_type: "",
      created_at: "2023-03-16T09:38:30.967701+00:00",
      created_by: 143,
      deleted_by: null,
      deleted_on: null,
      is_active: true,
      updated_by: null,
      updated_on: null,
      color: "--br-primary",
    },
    {
      id: 10557,
      name: "fgfg",
      lastname: "gfgf",
      email: "fgfgfg@gmail.com",
      phone: "7935437800",
      is_delete: false,
      password: "U2FsdGVkX1+tsMAo+btBEj2t9bnq9pUbtoTXegbMo4Q=",
      login_type: "phone",
      created_at: "2023-03-16T10:35:25.356441+00:00",
      created_by: null,
      deleted_by: null,
      deleted_on: null,
      is_active: true,
      updated_by: 143,
      updated_on: "2023-03-31T09:07:05.71+00:00",
      color: "--br-success",
    },
    {
      id: 10558,
      name: "TEstq",
      lastname: "userq",
      email: "tester@gmail.com",
      phone: "654320116",
      is_delete: false,
      password: "U2FsdGVkX1/ZAuvEjJpeePGNenD5DWi4Zwn5YjSxw7o=",
      login_type: "phone",
      created_at: "2023-03-17T04:24:06.976303+00:00",
      created_by: null,
      deleted_by: null,
      deleted_on: null,
      is_active: true,
      updated_by: null,
      updated_on: null,
      color: "--br-info",
    },
    {
      id: 10560,
      name: "Genevra",
      lastname: "Gundry",
      email: "ggundryy0@mashable.com",
      phone: "6238737810",
      is_delete: false,
      password: "U2FsdGVkX1/pEHoedDHsegTyA0HPCTtekdB4sehwRgI=",
      login_type: "",
      created_at: "2023-03-17T05:53:52.528601+00:00",
      created_by: 148,
      deleted_by: null,
      deleted_on: null,
      is_active: true,
      updated_by: null,
      updated_on: null,
      color: "--br-success",
    },
  ];
  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: departmentsData.length==1?1:departmentsData.length==2?2:departmentsData.length==3?3:departmentsData.length==4?4:5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: departmentsData.length==1?1:departmentsData.length==2?2:3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items:departmentsData.length==1?1: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  const CustomLeftArrow = ({ onClick, ...rest }) => {
    const {
      onMove,
      carouselState: { previousSlide },
    } = rest;
    // onMove means if dragging or swiping in progress.
    return (
      <button
        onClick={() => onClick()}
        className="arrow-btn-l position-absolute"
      >
        <BiChevronLeft />
      </button>
    );
  };
useEffect(()=>{
  dispatch(getDeparmentTaskFilter())
},[])
useEffect(()=>{

},[departmentsData])
  const CustomRightArrow = ({ onClick, ...rest }) => {
    const {
      onMove,
      carouselState: { currentSlide },
    } = rest;
    // onMove means if dragging or swiping in progress.
    return (
      <button
        onClick={() => onClick()}
        className="arrow-btn-r position-absolute end-0"
      >
        <BiChevronRight />
      </button>
    );
  };
  return (
    <div className="department-carousel">
      <Carousel
        responsive={responsive}
        customLeftArrow={<CustomLeftArrow />}
        customRightArrow={<CustomRightArrow />}
        arrows={true}
        ariaLabel="My Carousel"
      >

        {
          departmentsData?departmentsData.map((item,index)=>{
            return(  <div className="ms-2 departments" key={index}>
            <div className="card dashboard-card">
              <div className="card-header">
                <div className="avatar-content">
                  {/* <div className="avatar-icon"></div> */}
                  <h2 className="card-head">
                  {item?.department?.name.slice(0,1).toUpperCase()+item?.department?.name.slice(1,item?.department?.name.length)}
                    
                    <span className="card-sub-text">Department</span>
                  </h2>
                </div>
                {/* <button className="dot-btn">
                  <FaEllipsisH />
                </button> */}
              </div>
              <div className="card-body px-0">
                <div className="avatars-box">
                  {
                    fetchAvatarStack(item?.department?.user_ids)
                  }

                </div>
                <div className="progressbar-box">
                  <div className="pb-header">
                    <h2>
                      <FaListUl className="ellipse-icon" />
                      Progress
                    </h2>

                    <h3> {progressCount(item).closedCount}/{progressCount(item).totalCount}</h3>
                  </div>
                  <div className="pbar">
                    <ProgressBar
                      className="groups-progress"
                      now={progressCount(item).progress}
                      variant="warning"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>)
          })

      :"No Data"
}
      </Carousel>
    </div>
  );
};

export default DepartmentCarousel;
