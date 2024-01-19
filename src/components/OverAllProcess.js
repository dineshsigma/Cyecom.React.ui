import AvatarStack from "./AvatarStack";
import { useEffect } from "react";
import { getHighTasks } from "../redux/reducers/dashboardReducer";
import { useDispatch, useSelector } from "react-redux";
import { getUsers, getOrgUsers } from '../redux/reducers/userReducer';
import { useNavigate } from "react-router-dom";
import NoDataFound from "../assets/No_Data_File.png";
import moment from 'moment';
import captialLetter from '../modules/CaptialLetter';

// const avatars = [
//   {
//     id: 143,
//     name: "IVORY",
//     lastname: "INNOVATIONS",
//     email: "ivory.innovations2018@gmail.com",
//     phone: "8341562867",
//     is_delete: false,
//     password: "U2FsdGVkX18hOZlm08FOjlrEOMtZE2pWgOHhd50vBoM=",
//     login_type: "email",
//     created_at: "2023-01-07T05:30:49.973435+00:00",
//     created_by: 0,
//     deleted_by: null,
//     deleted_on: null,
//     is_active: true,
//     updated_by: 143,
//     updated_on: "2023-04-06T03:57:52.646+00:00",
//     color: "--br-dark",
//     image:
//       "https://s3.ap-south-1.amazonaws.com/happimobiles/retool-upload/b9862214-a5e0-4cef-bc64-7ade5a8a7f6f.png",
//   },
//   {
//     id: 146,
//     name: "Sai Pavan",
//     lastname: "Kasula",
//     email: "saipvan@iipl.work",
//     phone: "8555090576",
//     is_delete: false,
//     password: "U2FsdGVkX18AkIG+aNDWs/EBZU6PiC+8RBzFy5zd3Ss=",
//     login_type: "",
//     created_at: "2023-01-07T07:27:58.870147+00:00",
//     created_by: 143,
//     deleted_by: null,
//     deleted_on: null,
//     is_active: true,
//     updated_by: 146,
//     updated_on: "2023-04-06T04:57:07.796+00:00",
//     color: "--br-success",
//   },
//   {
//     id: 2527,
//     name: "Rhianon",
//     lastname: "Dowdeswell",
//     email: "rdowdeswell1@wikipedia.org",
//     phone: "5237583888",
//     is_delete: false,
//     password: "U2FsdGVkX18cnwLCHBY4k07Z6DEfiVvUePBFF0X8g7o=",
//     login_type: "phone",
//     created_at: "2023-03-03T11:40:46.27392+00:00",
//     created_by: null,
//     deleted_by: null,
//     deleted_on: null,
//     is_active: true,
//     updated_by: null,
//     updated_on: null,
//     color: "--br-dark",
//   },
//   {
//     id: 10536,
//     name: "Pavan",
//     lastname: "Kumar",
//     email: "revanthkumarpatha@gmail.com",
//     phone: "9898989898",
//     is_delete: false,
//     password: "U2FsdGVkX1/y8h1fb11jkPaFSj2J07Bz/X9os77lplY=",
//     login_type: "",
//     created_at: "2023-03-09T12:48:08.699244+00:00",
//     created_by: 143,
//     deleted_by: null,
//     deleted_on: null,
//     is_active: true,
//     updated_by: null,
//     updated_on: null,
//     color: "",
//   },
//   {
//     id: 10555,
//     name: "pk",
//     lastname: "pk",
//     email: "pk@pk.com",
//     phone: "9339900887",
//     is_delete: false,
//     password: "U2FsdGVkX1/h55HmcsdMMpE2WAJHKRMuRA8xEfWmrtQ=",
//     login_type: "phone",
//     created_at: "2023-03-16T05:27:07.686928+00:00",
//     created_by: null,
//     deleted_by: null,
//     deleted_on: null,
//     is_active: true,
//     updated_by: null,
//     updated_on: null,
//     color: "--br-success",
//   },
//   {
//     id: 10556,
//     name: "Sai Pavan",
//     lastname: "kasul",
//     email: "saipavan@iipl.works",
//     phone: "8555090572",
//     is_delete: false,
//     password: "U2FsdGVkX1/vfqrNVYZRBdY1f8cQOkqT1LBQjFwlkwQ=",
//     login_type: "",
//     created_at: "2023-03-16T09:38:30.967701+00:00",
//     created_by: 143,
//     deleted_by: null,
//     deleted_on: null,
//     is_active: true,
//     updated_by: null,
//     updated_on: null,
//     color: "--br-primary",
//   },
//   {
//     id: 10557,
//     name: "fgfg",
//     lastname: "gfgf",
//     email: "fgfgfg@gmail.com",
//     phone: "7935437800",
//     is_delete: false,
//     password: "U2FsdGVkX1+tsMAo+btBEj2t9bnq9pUbtoTXegbMo4Q=",
//     login_type: "phone",
//     created_at: "2023-03-16T10:35:25.356441+00:00",
//     created_by: null,
//     deleted_by: null,
//     deleted_on: null,
//     is_active: true,
//     updated_by: 143,
//     updated_on: "2023-03-31T09:07:05.71+00:00",
//     color: "--br-success",
//   },
//   {
//     id: 10558,
//     name: "TEstq",
//     lastname: "userq",
//     email: "tester@gmail.com",
//     phone: "654320116",
//     is_delete: false,
//     password: "U2FsdGVkX1/ZAuvEjJpeePGNenD5DWi4Zwn5YjSxw7o=",
//     login_type: "phone",
//     created_at: "2023-03-17T04:24:06.976303+00:00",
//     created_by: null,
//     deleted_by: null,
//     deleted_on: null,
//     is_active: true,
//     updated_by: null,
//     updated_on: null,
//     color: "--br-info",
//   },
//   {
//     id: 10560,
//     name: "Genevra",
//     lastname: "Gundry",
//     email: "ggundryy0@mashable.com",
//     phone: "6238737810",
//     is_delete: false,
//     password: "U2FsdGVkX1/pEHoedDHsegTyA0HPCTtekdB4sehwRgI=",
//     login_type: "",
//     created_at: "2023-03-17T05:53:52.528601+00:00",
//     created_by: 148,
//     deleted_by: null,
//     deleted_on: null,
//     is_active: true,
//     updated_by: null,
//     updated_on: null,
//     color: "--br-success",
//   },
// ];

const OverAllProcess = () => {
  const highPriorityTasks = useSelector(
    (state) => state.dashboard.highPriorityTasks
  );

  const filterTaks=highPriorityTasks?.filter(item=>item.priority=="high")
  const usersList = useSelector((state) => state.users.usersList);
  const orgListData = useSelector(
    (state) => state.organization.organizationsList
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // useEffect(() => {
  //   dispatch(getHighTasks());
  //   dispatch((getUsers('')));
  // }, []);
  const getOrgCode = (orgData, orgId) => {
    let data = orgData?.filter((item) => {
      return item?.id === orgId;
    });
    if(data?.length>0)  return data?.length == 0 ? "" : data[0]["uni_code"]
   
  }; 

  const fetchAvatarStack = (avatars) => {
    let avstarsFinal = [];
    avatars?.map((item) => {
      let user = usersList?.find((i) => i.id === item);
      user && avstarsFinal.push(user);
    });
    return <AvatarStack limit={3} avatars={avstarsFinal} />;
  };
  return (
    <div className="card oap-card ann-card dashboard-card">
      <div className="oap-header d-flex align-items-center justify-content-between">
        <div>
          <h4>
            High Priority Tasks{" "}
            {highPriorityTasks?.length > 0 && highPriorityTasks?.length}
          </h4>
          {/* <span>Total Tasks-</span> */}
        </div>
        <button onClick={() => navigate("/highprioritytasks")}>SEE ALL</button>
      </div>
      <div className="oap-content mt-3">
        {/* <p>Today</p> */}
        {highPriorityTasks?.length > 0 ? (
          <ul className="mb-0 gap-2">
            {highPriorityTasks?.slice(0, 3).map((item,index) => {
              return (
                  <li className="oap-c mb-3 d-flex align-items-center gap-2" key={index}>
                    <div className="ids">
                      {getOrgCode(orgListData, item.org_id)}-{item.task_code}
                    </div>
                    <div className="oap-head">
                      {/* <div className="oap-l-avt"></div> */}
                      <h5 className="text-overflow-dashboard ttww">
                        {captialLetter(item?.name)}
                      </h5>
                      <p className="text-overflow-dashboard m-0">
                        {/* A piece of work to be done or undertaken */}
                        {moment(item.due_date).format(
                          "ddd, MMM DD, YYYY, h:mm A"
                        )}
                      </p>
                    </div>
                    <div className="oapul">
                      {/* <AvatarStack avatars={avatars} limit={5} /> */}
                      {item?.assignee && fetchAvatarStack(item?.assignee)}
                    </div>
                  </li>
              );
            })}{" "}
          </ul>
        ) : (
          <div className="h-100 d_aic_jcc">
          <div className="w-50">
            <img src={NoDataFound} alt="data not found"  />
          </div>
      </div>
        )}
      </div>
    </div>
  );
};

export default OverAllProcess;
