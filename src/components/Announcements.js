import ceremony from "../assets/ceremony.png";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAnnouncements } from "../redux/reducers/announcementsReducer";
import { useNavigate } from "react-router-dom";
import NoDataFound from "../assets/No_Data_File.png";
import Birthdayicon from "../assets/Birthday.svg";
import Anniversaryicon from "../assets/Anniversary_icon.svg";
import Announcementicon from "../assets/Announcement_Icon.svg";
import Festivalicon from "../assets/Festival_icon.svg";
import LoaderComponent from "../components/Loader";
import captialLetter from '../modules/CaptialLetter';
const Announcements = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  useEffect(() => {
    dispatch(getAllAnnouncements(filter));
  }, []);
  const allAnnoucements = useSelector(
    (state) => state.announcement.announcements
  );

  const compareDate = (startDate, endDate) => {
    let date1 = new Date(startDate).getTime();
    let date2 = new Date(endDate).getTime();

    if (new Date() < date1) {
      return "Upcomming";
    } else if (new Date() > date1 && new Date() < date2) {
      return "Live";
    } else {
      return "Expired";
    }
  };
  return (
    <div className="card ann-card dashboard-card">
      <div className="ann-header d-flex align-items-center justify-content-between">
        <h4 className="m-0 ttww">Announcements</h4>
        <button onClick={() => navigate("/announcements")}>SEE ALL</button>
      </div>
      <div className="mt-2">
        {allAnnoucements?.filter((item, index) => { return compareDate(item.start_date, item.end_date) === "Live" }).length > 0 ? (
          <ul className="mb-0">
            {/* ---------- List Element starts from here --------------- */}
            {allAnnoucements.filter(item => { return compareDate(item.start_date, item.end_date) === "Live" }).slice(0, 4)?.map((announcement) => {
              return (
                <li>
                  <div className="ann-title d-flex align-items-center gap-2">
                    <div className="ann-avatar d_aic_jcc">
                      {/* <img src={ceremony} /> */}
                      
                      {/* <img src={announcement.image} alt={announcement.image}/> */}
                      <span className="fs-1">{announcement.image} </span>
                    </div>
                    <div className="ann-content">
                      <h5 className="mb-1">
                        {captialLetter(announcement?.title)}
                      </h5>
                      {compareDate(
                        announcement.start_date,
                        announcement.end_date
                      ) === "Live" && (
                          <div className="ann-status">
                            <p>Live</p>
                          </div>
                        )}
                      {/* {compareDate(
                        announcement.start_date,
                        announcement.end_date
                      ) === "Expired" && (
                          <div className="ann-status-upcoming">
                            <p>Expired</p>
                          </div>
                        )} */}
                      {/* {compareDate(
                        announcement.start_date,
                        announcement.end_date
                      ) === "Upcomming" && (
                          <div className="ann-status-upcoming">
                            <p>Upcoming</p>
                          </div>
                        )} */}
                    </div>
                  </div>

                </li>
              );
            })}
          </ul>
        ) : <>{allAnnoucements?.filter((item, index) => { return compareDate(item.start_date, item.end_date) === "Upcomming" }).length > 0 ? (
          <ul className="mb-0">
            {/* ---------- List Element starts from here --------------- */}
            {allAnnoucements?.filter((item, index) => { return compareDate(item.start_date, item.end_date) === "Upcomming" }).slice(0, 5)?.map((announcement) => {
              return (
                <li>
                  <div className="ann-title d-flex align-items-center gap-2">
                    <div className="ann-avatar d_aic_jcc">
                      {/* <img src={ceremony} /> */}
                      <span className="fs-4">{announcement.image}</span>

                      {/* <img src={announcement.image)} alt={announcement.image} /> */}
                    </div>
                    <div className="ann-content">
                      <h5 className="mb-1">
                        {captialLetter(announcement?.title)}  
                      </h5>
                      {/* {compareDate(
                        announcement.start_date,
                        announcement.end_date
                      ) === "Live" && (
                          <div className="ann-status">
                            <p>Live</p>
                          </div>
                        )} */}
                      {/* {compareDate(
                        announcement.start_date,
                        announcement.end_date
                      ) === "Expired" && (
                          <div className="ann-status-upcoming">
                            <p>Expired</p>
                          </div>
                        )} */}
                      {compareDate(
                        announcement.start_date,
                        announcement.end_date
                      ) === "Upcomming" && (
                          <div className="ann-status-upcoming">
                            <p>Upcoming</p>
                          </div>
                        )}
                    </div>
                  </div>

                </li>
              );
            })}
          </ul>
        ) : 
        <div className="h-100 d_aic_jcc">
        <img src={NoDataFound} alt="No data found"/>
       </div>
        }</>}
      </div>
    </div>
  );
};

export default Announcements;
