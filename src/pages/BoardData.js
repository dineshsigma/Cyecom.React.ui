import React from "react";
import { ButtonGroup, Button } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getAll_tasks } from "../redux/reducers/taskReducer";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import NoDataFound from "../assets/No_Data_File.png";
import { useNavigate } from "react-router-dom";
import LoaderComponent from "../components/Loader";

function BoardData() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userDetails = useSelector((state) => state.auth.userDetails);
  const loader = useSelector((state) => state.tasks.loader);
  //   const tasks = useSelector((state) => state.tasks.tasks);
  const [filterSearch, setFilter] = useState({
    name: "",
    status: "",
    priority: "",
    assignee: [userDetails.id],
    created_by: userDetails.id,
    limit: 10000,
    offset: 0
  });
  const [today, setToday] = useState(new Date().toString().slice(4, 15));
  const [dayName, setDayName] = useState(new Date().toString().slice(0, 4));
  const [tasks, setTasks] = useState();
  const [selectedDay, setSelectedDay] = useState(
    new Date().toString().slice(4, 15)
  );
  const [timeOnetasks, setTimeOneTasks] = useState();
  const [timeTwotasks, setTimeTwoTasks] = useState();
  const [filteredTaks, setFilteredTasks] = useState();

  //to get all tasks
  useEffect(() => {
    dispatch(getAll_tasks(filterSearch)).then((res) => setTasks(res.payload));
  }, []);

  //tasks filter based on date change
  useEffect(() => {
    let dayDate = selectedDay.slice(4, 6);
    let dayMonth = selectedDay.slice(0, 3);
    let monthReq = monthToNumber(dayMonth);
    const filtered = tasks?.filter(
      (item) => item.due_date.slice(8, 10) == dayDate && item.due_date.slice(5, 7) == monthReq && item.status != 'closed'
    );
    setFilteredTasks(filtered);
    let timeOne = filtered?.filter(
      (item) => getISTHoursFromString(item.due_date) <= 12
    );
    setTimeOneTasks(timeOne);
    let timeTwo = filtered?.filter(
      (item) => getISTHoursFromString(item.due_date) > 12
    );
    setTimeTwoTasks(timeTwo);
  }, [selectedDay, tasks]);

  const monthToNumber = (month) => {
    let monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let monthNum = monthNames.indexOf(month) + 1;
    if(monthNum.toString().length == 1){
      monthNum = '0' + monthNum.toString();
    }
    return monthNum;
  }

  function getISTHoursFromString(timeString) {
    var date = new Date(timeString);
    var options = { timeZone: "Asia/Kolkata", hour12: false };
    var hoursIST = date
      .toLocaleString("en-US", options)
      .split(",")[1]
      .trim()
      .split(":")[0];
    return parseInt(hoursIST);
  }

  //today button text
  const dayButton = () => {
    if (selectedDay == today) {
      return "Today";
    } else if (selectedDay.slice(4, 6) - today.slice(4, 6) == 1 && selectedDay.slice(0, 3) == today.slice(0, 3)) {
      return "Tomorrow";
    } else if (selectedDay.slice(4, 6) - today.slice(4, 6) == -1 && selectedDay.slice(0, 3) == today.slice(0, 3)) {
      return "Yesterday";
    } else {
      return selectedDay;
    }
  };

  function convertToDateObject(dateString) {
    var dateParts = dateString.split(" ");
    var monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var month = monthNames.indexOf(dateParts[0]);
    var day = parseInt(dateParts[1], 10);
    var year = parseInt(dateParts[2], 10);

    var timestamp = Date.parse(month + 1 + " " + day + ", " + year);
    var date = new Date(timestamp);
    return date;
  }

  //Next Day
  const nextDay = (date) => {
    let dateString = convertToDateObject(date);
    var inputDate = new Date(dateString);
    var nextDay = new Date(inputDate);
    nextDay.setDate(inputDate.getDate() + 1);
    setSelectedDay(nextDay.toString().slice(4, 15));
    setDayName(nextDay.toString().slice(0, 4));
  };

  //Previous Day
  const prevDay = (date) => {
    let dateString = convertToDateObject(date);
    var inputDate = new Date(dateString);
    var nextDay = new Date(inputDate);
    nextDay.setDate(inputDate.getDate() - 1);
    setSelectedDay(nextDay.toString().slice(4, 15));
    setDayName(nextDay.toString().slice(0, 4));
  };

  //   console.log(today, "TODAY", selectedDay);

  return (
    <section className="timeline">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="bg-white px-3 py-4 d-flex justify-content-between align-items-center">
                <ButtonGroup aria-label="Button group">
                  <Button
                    className="btn-middle board-data-btn"
                    onClick={() => prevDay(selectedDay)}
                  >
                    <FaChevronLeft />
                  </Button>
                  <Button className="btn-middle board-data-btn">
                    {dayButton()}
                  </Button>
                  <Button
                    className="board-data-btn"
                    onClick={() => nextDay(selectedDay)}
                  >
                    <FaChevronRight />
                  </Button>
                </ButtonGroup>
                <div className="m-auto">
                  {/* <Button>Day</Button> */}
                  {/* <Button className="white_btn">Week</Button> */}
                </div>
              </div>
              <div className="card-body p-2">
                <div className="header">
                  <h2>
                    <span>{dayName}</span>
                    <br />
                    {selectedDay}
                  </h2>
                </div>
                <>
                {loader && <LoaderComponent/> }
                {filteredTaks?.length > 0 ? (
                  <div className="container_section">
                    {timeOnetasks?.length > 0 && (
                      <div className="content_list pt-2 pe-2 d-flex">
                        <div className="time">
                          <h2>12:00 PM</h2>
                        </div>
                        <ul className="ps-2">
                          {timeOnetasks?.map((item) => {
                            return (
                              <li
                                onClick={(event) =>
                                  navigate(`/taskdetails/${item.id}`)
                                }
                              >
                                <a className="status_bg_border">
                                  <h3 className="py-2 ps-2">{item?.name}</h3>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {timeTwotasks?.length > 0 && (
                      <div className="content_list pt-2 pe-2 d-flex">
                        <div className="time">
                          <h2>06:00 PM</h2>
                        </div>
                        <ul className="ps-2">
                          {timeTwotasks?.map((item) => {
                            return (
                              <li
                                onClick={(event) =>
                                  navigate(`/taskdetails/${item.id}`)
                                }
                              >
                                <a className="status_bg_border">
                                  <h3 className="py-2 ps-2">{item?.name}</h3>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="col-md-12 center text-center">
                    <img src={NoDataFound} height="500px" alt="" />
                  </div>
                )} 
                </>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BoardData;
