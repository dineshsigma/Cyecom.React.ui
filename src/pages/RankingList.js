import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUsers, getOrgUsers } from "../redux/reducers/userReducer";
import { getRewardsList } from "../redux/reducers/dashboardReducer";
import captialLetter from "../modules/CaptialLetter";
import NoDataFound from "../assets/No_Data_File.png";
import RewardIcon from "../assets/class-reward.svg";
import CrownGold from "../assets/crown_gold.svg";
import CrownSliver from "../assets/crown_sliver.svg";
import CrownBrownze from "../assets/crown_brownze.svg";
import LoaderComponent from "../components/Loader";

function Rankinglist() {
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const rankingData = useSelector((state) => state.dashboard.rankingData);
    const loader = useSelector((state) => state.tasks.loader);
    const usersList = useSelector((state) => state.users.usersList);
    const userOrgList = useSelector((state) => state.auth.userOrgDetails);
    const designationList = useSelector((state) => state.designation.designationList);
    const orgUsersList = useSelector((state) => state.users.orgUsersList);

    useEffect(() => {
      dispatch(getRewardsList());
      dispatch(getUsers(""))
      dispatch(getOrgUsers());
    }, []);

    useEffect(() => {
      setUsers(usersList);
    }, [usersList]);

    useEffect(() => {
      const newUsers = usersList.filter((user) => user.name.toLowerCase().includes(search.toLowerCase()) || user.lastname.toLowerCase().includes(search.toLowerCase()));
      
      setUsers(newUsers);
    }, [search])

    const getname = (user_id) => {
      const usernames = users?.find((u) => u.id == user_id);
      return usernames?.name +" "+ usernames?.lastname
    }

    const getAvatar = (user_id) => {
      const usernames = users?.find((u) => u.id == user_id);
      return usernames?.avatar;
    };

    const fetchUser = (userId) => {
      const user = users?.find((i) => i.id == userId);
      return `${captialLetter(user?.name)} ${captialLetter(user?.lastname)}`;
    };
   
    const fetchDesignation = (id) => {
      const userOrgDetails = orgUsersList?.find((item) => item?.user_id === id);
      let Designation

      if (userOrgDetails)
        Designation = designationList?.find((item) => item.id === userOrgDetails?.designation_id);;
      
      return Designation?.name;
    };

    return (
      <>
        <section className="breadcum_section tasklist-section">
          <div className="container-fluid">
            <div className="row align-items-center justify-content-between">
              <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2">
                <h2 className="bs_title">Ranking List</h2>
              </div>
              <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10">
                <div className="aside_left d-flex align-items-center justify-content-end gap_05rm">
                  <>
                    <div className="search-box">
                      <input
                        className="form-control text"
                        type="text"
                        name="rankinglist-search"
                        placeholder="Search here"
                        value={search}
                        autoFocus
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <button>
                        {" "}
                        <FaSearch />
                      </button>
                    </div>
                  </>
                </div>
              </div>
            </div>
          </div>
        </section>
        {loader ? (
          <LoaderComponent />
        ) : rankingData?.length > 0 ? (
          <section className="taskslist">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12">
                  <div className="table-responsive">
                    <table className="table table-style1 rewards_table">
                      <thead>
                        <tr>
                          <th className="maxw_120">Ranking</th>
                          <th>User Name</th>
                          <th>Designation</th>
                          <th>Rewards</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankingData?.map((rewards, index) => {
                          let ingg;
                          if (index == 0) ingg = CrownGold;
                          if (index == 1) ingg = CrownSliver;
                          if (index == 2) ingg = CrownBrownze;
                          return (
                            <>
                              {getname(rewards?.user_id) !== "undefined undefined" && (
                                <tr
                                  className={rewards.user_id == userOrgList[0]?.user_id ? "card-table active_tablebg" : "card-table"}
                                  id={index}
                                >
                                  <td className="maxw_120">
                                    <div className="rank_count">
                                      {index == 0 || index == 1 || index == 2 ? (<img src={ingg} alt="" />) : (index + 1)}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="tn d-flex align-items-center gap-2">
                                      <div className="raise-icon text-uppercase">
                                        {getAvatar(rewards?.user_id) ? (
                                          <img
                                            src={getAvatar(rewards?.user_id)}
                                            alt="user-img"
                                            className="rounded-circle"
                                          />
                                        ) : (
                                          fetchUser(rewards.user_id).slice(0, 2)
                                        )}
                                      </div>
                                      {getname(rewards?.user_id)}
                                    </div>
                                  </td>
                                  <td>{fetchDesignation(rewards?.user_id)}</td>
                                  <td>
                                    <div className="reward_count">
                                      <img src={RewardIcon} alt="Reward Icon" />{" "}
                                      {rewards?.points}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="col-md-12 center text-center">
            <img src={NoDataFound} height="420px" alt="" />
          </div>
        )}
      </>
    );
}

export default Rankinglist;
