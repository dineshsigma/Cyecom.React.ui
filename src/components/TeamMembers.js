import tmavatar from "../assets/tmavatar.png";
import tmgraph from "../assets/tmgraph.png";
import redgraph from "../assets/redgraph.png";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useSelector, useDispatch } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import { getGroupsByOrgId } from "../redux/reducers/dashboardReducer";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NoDataFound from "../assets/No_Data_File.png";
import { getUsers } from "../redux/reducers/userReducer";
import Avatar from "./Avatar";

const TeamMembers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const groupsDropDown = useSelector((state) => state.dashboard.groupsDropDown);
  const usersList = useSelector((state) => state.users.usersList);
  const teamMembersbyId = useSelector(
    (state) => state.dashboard.teamMembersbyId?.teamTaskClosedFilter?.data
  );

  useEffect(() => {
    dispatch(getUsers(""));
  }, []);

  //Data for DropDown
  useEffect(() => {
    let body = {
      object: {
        group_id: groupsDropDown?.[0]?.id,
      },
    };
    dispatch(getGroupsByOrgId(body));
  }, [groupsDropDown]);

  function change(eventkey) {
    eventkey = parseInt(eventkey.target.value);
    let body = {
      object: {
        group_id: eventkey,
      },
    };
    dispatch(getGroupsByOrgId(body));
  }

  const getUser = (id) => {
    return usersList?.find((user) => user.id === id);
  };

  return (
    <div className="card ann-card team-card dashboard-card">
      <div className="team-header d_aic_jcsb pt-2">
          <h4 className="m-0">Team Members</h4>
          <select
            className="dd-class"
            aria-label="Select Body"
            placeholder="Any Body"
            onChange={change}
          >
            <option value="" disabled hidden>
              Change Team
            </option>
            {groupsDropDown?.length>0?
              groupsDropDown?.map((data, index) => {
                return (
                  <option key={index} value={data.id}>
                    {data?.title}
                  </option>
                );
              }):<option>No Teams Found</option>}
          </select>
      </div>
      <div className="mt-3 teams-body">
        <ul>
          {teamMembersbyId?.length > 0 ?
            teamMembersbyId?.slice(0,4)?.map((item, index) => {
              const user = getUser(item?.userid);

              return (
                <li key={index} className="d-flex">
                  <div className="tm-c">
                    <div className="tm-image">
                      <Avatar
                        color={user?.color}
                        initials={`${user?.name
                          .substring(0, 1)
                          .toUpperCase()}${user?.lastname
                          .substring(0, 1)
                          .toUpperCase()}`}
                        image={user?.avatar}
                      />
                    </div>
                    <div className="tm-content">
                      <h5 className="m-0">
                        {item.username.charAt(0).toUpperCase() +
                          item.username.slice(1)}
                      </h5>
                      <span>
                        {item.designame.charAt(0).toUpperCase() +
                          item.designame.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="graph-circle d-flex">
                    <div style={{ width: 40, height: 40 }}>
                      <CircularProgressbar
                        value={item.percent || 1}
                        text={item.percent || 1}
                        strokeWidth={12}
                        minValue={0}
                        maxValue={100}
                        styles={buildStyles({
                          // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                          strokeLinecap: "round",

                          // Text size
                          textSize: "32px",

                          // How long animation takes to go from one percentage to another, in seconds
                          pathTransitionDuration: 0.5,

                          // Can specify path transition in more detail, or remove it entirely
                          // pathTransition: 'none',

                          // Colors
                          pathColor: "#39C956",
                          textColor: "#000000",
                          trailColor: "#E6E8F5",
                          backgroundColor: "#3e98c7",
                        })}
                        className="text-style"
                      />
                    </div>
                    <div className="tm-graph">
                      {item?.percent > 60 ? (
                        <img src={tmgraph} />
                      ) : (
                        <img src={redgraph} />
                      )}
                    </div>
                  </div>
                </li>
              );
            }) : <div className="center text-center">
              <img src={NoDataFound}  />
            </div>}
        </ul>
      </div>
        <button className="text-end tea" onClick={() => navigate("/master/teams")}>SEE ALL</button>
    </div>
  );
};

export default TeamMembers;
