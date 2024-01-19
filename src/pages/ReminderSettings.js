import React, { useState, useEffect } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Accordion from "react-bootstrap/Accordion";
import Switch from "react-switch";
import {Table,InputGroup} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { BiInfoCircle } from "react-icons/bi";
import Popover from "react-bootstrap/Popover";
import Form from "react-bootstrap/Form";
import { useDispatch, useSelector } from "react-redux";
import LoaderComponent from "../components/Loader";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { 
  getRemindersConfig, 
  createRemindersConfig, 
  updateRemindersConfig 
} from "../redux/reducers/reminderReducer";

function ReminderSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [originalData, setOriginalData] = useState([]);
  const [tempReminderConfigList, setTempReminderConfigList] = useState([]);
  const orgId = useSelector((state) => state.auth.current_organization);
  const loader = useSelector((state) => state.reminder.loader);
  const reminderConfigList = useSelector((state) => state.reminder.reminderConfigList);
  const [isHovered,setIsHovered]=useState(false)
  
  useEffect(() => {
    dispatch(getRemindersConfig());
  }, []);

  useEffect(() => {
    setTempReminderConfigList(reminderConfigList?.data?.remainders);
    setOriginalData(reminderConfigList?.data?.remainders);
  }, [reminderConfigList]);
  window.addEventListener('click',()=>{setIsHovered(false)})
  window.addEventListener('keydown',(e)=>{if (e.key === 'Escape' || e.keyCode === 27) setIsHovered(false)})
  const handelTimeChange = (e, index, reminder) => {
    let timeIndex = `timefield${index}+${reminder?.status}+${reminder?.priority}`;
    let minuteIndex = `minutefield${index}+${reminder?.status}+${reminder?.priority}`;
    let currentHours = document.getElementById(timeIndex);
    let currentMinutes = document.getElementById(minuteIndex);
    const hourValue = parseInt(currentHours.value);
    const minuteValue = parseInt(currentMinutes.value);
    let timeMilliValue;
    let minuteMiliValue;
    const twoDigitPattern = /^[0-9]{0,2}$/;
    const millisecondsInHour = 60 * 60 * 1000; // 3600000 milliseconds in an hour
    if (
      (twoDigitPattern.test(hourValue) || hourValue === "") &&
      hourValue >= 0 &&
      hourValue <= 23
    ) {
      const milliseconds = hourValue * millisecondsInHour;
      timeMilliValue = milliseconds;
    }
    if (hourValue == 24) {
      const milliseconds = hourValue * millisecondsInHour;
      timeMilliValue = milliseconds;
      minuteMiliValue = 0;
    }
    if (
      (twoDigitPattern.test(minuteValue) || minuteValue === "") &&
      minuteValue >= 0 &&
      minuteValue <= 59
    ) {
      const millisecondsInHour = 60 * 1000; // 3600000 milliseconds in an hour
      const milliseconds = minuteValue * millisecondsInHour;
      if (hourValue != 24 && (minuteValue < 59 || minuteValue == 59)) {
        minuteMiliValue = parseInt(milliseconds);
        if (minuteValue == 59) {
          minuteMiliValue = 1 * 60 * 60 * 1000;
        }
      }
      if (hourValue == 23 && minuteValue == 59) {
        timeMilliValue = 24 * 60 * 60 * 1000;
        minuteMiliValue = 0;
      }
    }
    let totalMillSeconds = timeMilliValue + minuteMiliValue;
    handleLevels(reminder, "timer", totalMillSeconds);
  };
 
  const isChecked = (status, priority) => {
    const allReminders = tempReminderConfigList?.filter((r) => r.status === status && r.priority === priority);
  
    const orgRemainders = allReminders?.filter((r) => r.org_id === Number(orgId));
    if(orgRemainders?.length > 0) return orgRemainders?.some((r) => r.is_enable);

    const zeroOrgReminders = allReminders?.filter((r) => r.org_id === 0);
    return zeroOrgReminders?.some((r) => r.is_enable);
  }

  const toggleCheck = (status, priority) => {
    let checkEnabled;
    const allReminders = tempReminderConfigList.filter((reminder) => reminder.status === status && reminder.priority === priority);
    const orgRemainders = allReminders.filter((r) => r.org_id === Number(orgId));
    
    if(orgRemainders.length > 0) checkEnabled = orgRemainders.some((r) => r["is_enable"]);
    else checkEnabled = allReminders.some((r) => r["is_enable"]);

    const updatedReminders = tempReminderConfigList.map((reminder) => {
      if (reminder.status === status && reminder.priority === priority) {
        if (checkEnabled) return { ...reminder, is_enable: false, email: false, in_app: false, notification: false, }
        else return { ...reminder, is_enable: true, email: true, in_app: true, notification: true, };
      } else {
        return reminder;
      }
    });

    setTempReminderConfigList(updatedReminders);
  }

  const handleEnable = (reminder, key) => {
    const newtempReminderList = [...tempReminderConfigList];
    const index = newtempReminderList.findIndex((r) => r.id == reminder.id);
    newtempReminderList[index] = { ...reminder };

    if (key !== "timer" && key !== "execution")
      newtempReminderList[index][key] = !newtempReminderList[index][key];

    if (newtempReminderList[index][key]) {
      newtempReminderList[index]["email"] = true;
      newtempReminderList[index]["in_app"] = true;
      newtempReminderList[index]["notification"] = true;
    } else {
      newtempReminderList[index]["email"] = false;
      newtempReminderList[index]["in_app"] = false;
      newtempReminderList[index]["notification"] = false;
    }

    setTempReminderConfigList(newtempReminderList);
  };

  const handleLevels = (reminder, key, value) => {
    if (key == "timer" && isNaN(value)) {
      value = 0;
    }
    const newtempReminderList = [...tempReminderConfigList];
    const index = newtempReminderList.findIndex((r) => r.id == reminder.id);
    newtempReminderList[index] = { ...reminder };

    if (key == "timer" || key == "execution")
      newtempReminderList[index][key] = value;
    else newtempReminderList[index][key] = !newtempReminderList[index][key];

    const disable =
      !newtempReminderList[index]["email"] &&
      !newtempReminderList[index]["in_app"] &&
      !newtempReminderList[index]["notification"];

    const enabled =
      newtempReminderList[index]["email"] ||
      newtempReminderList[index]["in_app"] ||
      newtempReminderList[index]["notification"];

    if (disable) newtempReminderList[index]["is_enable"] = false;
    if (enabled) newtempReminderList[index]["is_enable"] = true;

    setTempReminderConfigList(newtempReminderList);
  };
const getTime=(timeInMilliSeconds,type,itemId)=>{
  const totalMinutes = timeInMilliSeconds / 60000; // Total minutes
  const hours = Math.floor(totalMinutes / 60); // Calculate hours
  const remainingMinutes = Math.round(totalMinutes % 60); // Calculate remaining minutes
  const filterdata=tempReminderConfigList.filter(item=>item.id==itemId);
  if (type === "hours"&&filterdata[0].id==itemId) {
    return hours;
  }
  
  if (type === "minutes"&&filterdata[0].id==itemId) {
    return remainingMinutes;
  }

}
  const clearButton = (status, priority) => {
    const originalReminders = originalData?.filter((r) => r.status === status && r.priority === priority);
    const modifiedReminders = tempReminderConfigList?.filter((r) => r.status !== status || r.priority !== priority);

    setTempReminderConfigList([...originalReminders, ...modifiedReminders]);
  };

  const submitReminders = (status, priority) => {
    const reminders = tempReminderConfigList.filter((r) => r.org_id === Number(orgId));

    if (reminders.length === 0) {
      const newReminders = tempReminderConfigList.map((reminder) => ({ ...reminder}));

      for (let i = 0; i < newReminders.length; i++) {
        delete newReminders[i].id;
        newReminders[i].org_id = parseInt(orgId);
      }
   
      dispatch(createRemindersConfig(newReminders)).then(() => {
        dispatch(getRemindersConfig({ org_id: orgId }));
      });
    } else {
      const updatedReminders = tempReminderConfigList.filter((r) => r.status === status && r.priority === priority && r.org_id === Number(orgId));
      dispatch(updateRemindersConfig(updatedReminders));
    }
  }

  const renderReminders = (reminders, status, priority) => {
    let allRemainders = reminders?.filter((r) => r.status === status && r.priority === priority);
    let orgRemainders = allRemainders?.filter((item) => item.org_id === Number(orgId));

    if (orgRemainders?.length > 0) allRemainders = orgRemainders;

    allRemainders = allRemainders?.sort((a, b) => {
      if (a.type === "startdate" && b.type !== "startdate") return -1;
      if (a.type !== "startdate" && b.type === "startdate") return 1;
     
      const daysTypeComparison = a.days_type.localeCompare(b.days_type);
      if (daysTypeComparison !== 0) return daysTypeComparison;

      if (a.days_type === "o") return a.days - b.days;

      return b.days - a.days;
    });

    return allRemainders?.map((remainderitem, index) => {
      return (
        <>
          <tr className="td-background">
            {index == 0 && (
              <td colSpan="7">
                <h4>Start Date</h4>
              </td>
            )}
            {index == 4 && (
              <td colSpan="7">
                <h4>Due Date</h4>
              </td>
            )}
            {index == 9 && (
              <td colSpan="7">
                <h4>Overdue</h4>
              </td>
            )}
          </tr>
          <tr>
            <td style={{ "font-weight": "500" }}>
              {remainderitem.days_type == "b"
                ? `${
                    remainderitem.type === "startdate"
                      ? "Before"
                      : "Due Date in"
                  } ${remainderitem.days} ${
                    remainderitem.days === 1 ? "Day" : "Days"
                  }`
                : remainderitem.days_type == "c"
                ? `Current Day`
                : `Overdue ${remainderitem.days} ${
                    remainderitem.days === 1 ? "Day" : "Days"
                  }`}
            </td>
            <td>
              <Form.Check
                type="checkbox"
                id={`default-checkbox`}
                checked={remainderitem.is_enable}
                value={remainderitem.is_enable}
                onChange={() => handleEnable(remainderitem, "is_enable")}
              />
            </td>
            <td>
              <Form.Check
                type="checkbox"
                id={`default-checkbox`}
                checked={remainderitem.email}
                value={remainderitem}
                onChange={() => handleLevels(remainderitem, "email")}
              />
            </td>
            <td>
              <Form.Check
                type="checkbox"
                id={`default-checkbox`}
                checked={remainderitem.in_app}
                value={remainderitem.in_app}
                onChange={() => handleLevels(remainderitem, "in_app")}
              />
            </td>
            <td>
              <Form.Check
                type="checkbox"
                id={`default-checkbox`}
                checked={remainderitem.notification}
                value={remainderitem.notification}
                onChange={() => handleLevels(remainderitem, "notification")}
              />
            </td>
            <td>
              <div>
                <InputGroup key={index}>
                  <Form.Control placeholder="Hours..." aria-label="Hours" onChange={(e)=>handelTimeChange(e,index,remainderitem)} id={`timefield${index}+${remainderitem?.status}+${remainderitem?.priority}`} value={getTime(remainderitem.timer,"hours",remainderitem.id)} type="number" min="0" max="23" />
                  <Form.Control placeholder="Minutes..." aria-label="Minutes" onChange={(e)=>handelTimeChange(e,index,remainderitem)} id={`minutefield${index}+${remainderitem?.status}+${remainderitem?.priority}`}value={getTime(remainderitem.timer,"minutes",remainderitem.id)} type="number" min="0" max="59" maxLength="2"/>
                </InputGroup>
                {/* <Form.Select
                  value={remainderitem.timer}
                  onChange={(e) => handleLevels(remainderitem, "timer", e.target.value)}
                >
                  <option value="">Select Timer</option>
                  <option value="900000">15 min</option>
                  <option value="1200000">20 min</option>
                  <option value="1800000">30 min</option>
                  <option value="2700000">45 min</option>
                </Form.Select> */}
              </div>
            </td>
            <td>
              <div>
                <Form.Select
                  value={remainderitem.execution}
                  onChange={(e) =>
                    handleLevels(remainderitem, "execution", e.target.value)
                  }
                >
                  <option value="">Select Level</option>
                  <option value="L1">Level-1</option>
                  <option value="L2">Level-2</option>
                  <option value="L3">Level-3</option>
                  <option value="L4">Level-4</option>
                </Form.Select>
              </div>
            </td>
          </tr>
        </>
      );
    });
  };
  
  const popover = (
    <Popover id="popover-basic">
      <Popover.Body>Level-1 = Self</Popover.Body>
      <Popover.Body>Level-2 = Self + Reporting Manager</Popover.Body>
      <Popover.Body>Level-3 = Self + Reporting Manager + Manager of Reporting Manager</Popover.Body>
      <Popover.Body>Level-4 = All</Popover.Body>
    </Popover>
  );

  const popoverTimer = (
    <Popover id="popover-basic">
      <Popover.Body>15 min</Popover.Body>
      <Popover.Body>20 min</Popover.Body>
      <Popover.Body>30 min</Popover.Body>
      <Popover.Body>45 min</Popover.Body>
    </Popover>
  );

  return (
    <>
      {loader ? (
        <LoaderComponent />
      ) : (
        <>
          <section className="breadcum_section">
            <div className="container-fluid">
              <div className="d-flex align-items-center gap-3">
                <Button
                  className="primary_btn white_btn d-flex align-items-center justify-content-center"
                  variant="light"
                  size="md"
                  onClick={() => navigate("/master")}
                >
                  <FaArrowLeft />
                </Button>
                <h2 className="bs_title">Reminder Settings</h2>
              </div>
            </div>
          </section>
          <section className="remainders">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="rounded bg-white px-3 py-4 Offcanvas_cust">
                    <Tabs
                      defaultActiveKey="Open"
                      id="uncontrolled-tab-example"
                      className="mb-4 gap-3 position-relative notification"
                    >
                      <Tab eventKey="Open" title="OPEN">
                        <h2 className="mb-1">Sub Levels of Status Type</h2>
                        <p className="mb-4">
                          Please select sub levels of settings below
                        </p>
                        <Accordion defaultActiveKey="0">
                          <Accordion.Item
                            eventKey="0"
                            className="accordian-chev-icon p-2 mb-2"
                          >
                            <div className="d-flex align-items-center">
                              <Accordion.Header>
                                <h2 className="m-0 ms-4">CRITICAL</h2>
                              </Accordion.Header>
                              <Switch
                                height={18}
                                width={38}
                                checked={isChecked("open", "critical")}
                                onChange={() => toggleCheck("open", "critical")}
                              />
                            </div>
                            <Accordion.Body className="ps-5 pt-0">
                              <div>
                                <h4 className="mb-1">
                                  Reminder settings for day wise and
                                  notification alerts
                                </h4>
                                <p>
                                  Please select sublevel configartion setting
                                  below
                                </p>
                              </div>

                              <div>
                                <Table className="m-0">
                                  <thead>
                                    <tr>
                                      <th></th>
                                      <th>Enable/Disable</th>
                                      <th>Email</th>
                                      <th>InApp</th>
                                      <th>Push</th>
                                      <th>
                                        Timer(HH:MM)
                                        {/* <OverlayTrigger
                                          placement="right"
                                          overlay={popoverTimer}
                                        >
                                          <span className="ms-2">
                                            <BiInfoCircle />
                                          </span>
                                        </OverlayTrigger> */}
                                      </th>
                                      <th>
                                        Execution Level
                                        <OverlayTrigger
                                          placement="top"
                                          overlay={popover}
                                          show={isHovered}
                                        >
                                          <span className="ms-2">
                                            <BiInfoCircle onMouseOver={()=> {setIsHovered(true);!isHovered&&window.scrollTo({top:0,behavior:'smooth'})}} style={{ cursor: isHovered ? 'pointer' : 'default' }}></BiInfoCircle>
                                          </span>
                                        </OverlayTrigger>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {renderReminders(tempReminderConfigList, "open", "critical")}
                                  </tbody>
                                </Table>
                                <div className="task_transfer_footer d_aic_jce gap-2">
                                  <button
                                    id="addTask"
                                    type="button"
                                    className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                    onClick={() => clearButton("open", "critical")}
                                  >
                                    Clear
                                  </button>
                                  <button
                                    id="addTask"
                                    type="button"
                                    className="btn btn-primary mt-3 mb-2"
                                    onClick={() => submitReminders("open", "critical")}
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item
                            eventKey="1"
                            className="accordian-chev-icon p-2 mb-2"
                          >
                            <div className="d-flex align-items-center">
                              <Accordion.Header>
                                <h2 className="ms-4 m-0"> HIGH</h2>
                              </Accordion.Header>
                              <Switch
                                height={18}
                                width={38}
                                checked={isChecked("open", "high")}
                                onChange={() => toggleCheck("open", "high")}
                              />
                            </div>
                            <Accordion.Body className="ps-5 pt-0">
                              <h4>
                                Remainder settings for day wise and notification
                                alerts
                              </h4>
                              <p>
                                Please select sublevel configartion setting
                                below
                              </p>

                              <div>
                                <Table>
                                  <thead>
                                    <tr>
                                      <th></th>
                                      <th>Enable/Disable</th>
                                      <th>Email</th>
                                      <th>InApp</th>
                                      <th>Push</th>
                                      <th>
                                        Timer(HH:MM)
                                        {/* <OverlayTrigger
                                          placement="right"
                                          overlay={popoverTimer}
                                        >
                                          <span className="ms-2">
                                            <BiInfoCircle />
                                          </span>
                                        </OverlayTrigger> */}
                                      </th>
                                      <th>
                                        Execution Level
                                        <OverlayTrigger
                                          placement="right"
                                          overlay={popover}
                                        >
                                          <span className="ms-2">
                                            <BiInfoCircle />
                                          </span>
                                        </OverlayTrigger>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {renderReminders(tempReminderConfigList, "open", "high")}
                                  </tbody>
                                </Table>
                                <div className="task_transfer_footer d_aic_jce gap-2">
                                  <button
                                    id="addTask"
                                    type="button"
                                    className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                    onClick={() => clearButton("open", "high")}
                                  >
                                    Clear
                                  </button>
                                  <button
                                    id="addTask"
                                    type="button"
                                    className="btn btn-primary mt-3 mb-2"
                                    onClick={() => submitReminders("open", "high")}
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item
                            eventKey="2"
                            className="accordian-chev-icon p-2 mb-2"
                          >
                            <div className="d-flex align-items-center">
                              <Accordion.Header>
                                <h2 className="ms-4 m-0"> MEDIUM </h2>
                              </Accordion.Header>
                              <Switch
                                height={18}
                                width={38}
                                checked={isChecked("open", "medium")}
                                onChange={() => toggleCheck("open", "medium")}
                              />
                            </div>
                            <Accordion.Body className="ps-5 pt-0">
                              <div>
                                <h4>
                                  Remainder settings for day wise and
                                  notification alerts
                                </h4>
                                <p>
                                  Please select sublevel configartion setting
                                  below
                                </p>
                              </div>

                              <div>
                                <Table>
                                  <thead>
                                    <tr>
                                      <th></th>
                                      <th>Enable/Disable</th>
                                      <th>Email</th>
                                      <th>InApp</th>
                                      <th>Push</th>
                                      <th>
                                        Timer(HH:MM)
                                        {/* <OverlayTrigger
                                          placement="right"
                                          overlay={popoverTimer}
                                        >
                                          <span className="ms-2">
                                            <BiInfoCircle />
                                          </span>
                                        </OverlayTrigger> */}
                                      </th>
                                      <th>
                                        Execution Level
                                        <OverlayTrigger
                                          placement="right"
                                          overlay={popover}
                                        >
                                          <span className="ms-2">
                                            <BiInfoCircle />
                                          </span>
                                        </OverlayTrigger>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {renderReminders(tempReminderConfigList, "open", "medium")}
                                  </tbody>
                                </Table>
                                <div className="task_transfer_footer d_aic_jce gap-2">
                                  <button
                                    id="addTask"
                                    type="button"
                                    className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                    onClick={() => clearButton("open", "medium")}
                                  >
                                    Clear
                                  </button>
                                  <button
                                    id="addTask"
                                    type="button"
                                    className="btn btn-primary mt-3 mb-2"
                                    onClick={() => submitReminders("open", "medium")}
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item
                            eventKey="3"
                            className="accordian-chev-icon p-2 mb-2"
                          >
                            <div className="d-flex align-items-center">
                              <Accordion.Header>
                                <h2 className="ms-4 m-0"> LOW</h2>
                              </Accordion.Header>
                              <Switch
                                height={18}
                                width={38}
                                checked={isChecked("open", "low")}
                                onChange={() => toggleCheck("open", "low")}
                              />
                            </div>
                            <Accordion.Body className="ps-5 pt-0">
                              <div>
                                <h4>
                                  Remainder settings for day wise and
                                  notification alerts
                                </h4>
                                <p>
                                  Please select sublevel configartion setting
                                  below
                                </p>
                              </div>

                              <div>
                                <Table>
                                  <thead>
                                    <tr>
                                      <th></th>
                                      <th>Enable/Disable</th>
                                      <th>Email</th>
                                      <th>InApp</th>
                                      <th>Push</th>
                                      <th>
                                        Timer(HH:MM)
                                        {/* <OverlayTrigger
                                          placement="right"
                                          overlay={popoverTimer}
                                        >
                                          <span className="ms-2">
                                            <BiInfoCircle />
                                          </span>
                                        </OverlayTrigger> */}
                                      </th>
                                      <th>
                                        Execution Level
                                        <OverlayTrigger
                                          placement="right"
                                          overlay={popover}
                                        >
                                          <span className="ms-2">
                                            <BiInfoCircle />
                                          </span>
                                        </OverlayTrigger>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {renderReminders(tempReminderConfigList, "open", "low")}
                                  </tbody>
                                </Table>
                                <div className="task_transfer_footer d_aic_jce gap-2">
                                  <button
                                    id="addTask"
                                    type="button"
                                    className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                    onClick={() => clearButton("open", "low")}
                                  >
                                    Clear
                                  </button>
                                  <button
                                    id="addTask"
                                    type="button"
                                    className="btn btn-primary mt-3 mb-2 "
                                    onClick={() => submitReminders("open", "low")}
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Tab>
                      <Tab eventKey="In Progress" title="IN PROGRESS">
                        <div>
                          <h2 className="mb-1">Sub Levels of Status Type</h2>
                          <p
                            className="select-sublevel"
                            style={{ "padding-left": "5px" }}
                          >
                            Please select sub levels of settings below
                          </p>
                        </div>
                        <div>
                          <Accordion defaultActiveKey="0">
                            <Accordion.Item
                              eventKey="0"
                              className="accordian-chev-icon p-2 mb-2"
                            >
                              <div className="d-flex align-items-center">
                                <Accordion.Header>
                                  <h2 className="ms-4 m-0">CRITICAL</h2>
                                </Accordion.Header>
                                <Switch
                                  height={18}
                                  width={38}
                                  checked={isChecked("in-progress", "critical")}
                                  onChange={() => toggleCheck("in-progress", "critical")}
                                />
                              </div>
                              <Accordion.Body className="ps-5 pt-0">
                                <div>
                                  <h4>
                                    Reminder settings for day wise and
                                    notification alerts
                                  </h4>
                                  <p>
                                    Please select sublevel configartion setting
                                    below
                                  </p>
                                </div>

                                <div>
                                  <Table>
                                    <thead>
                                      <tr>
                                        <th></th>
                                        <th>Enable/Disable</th>
                                        <th>Email</th>
                                        <th>InApp</th>
                                        <th>Push</th>
                                        <th>
                                          Timer(HH:MM)
                                          {/* <OverlayTrigger
                                            placement="right"
                                            overlay={popoverTimer}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger> */}
                                        </th>
                                        <th>
                                          Execution Level
                                          <OverlayTrigger
                                            placement="right"
                                            overlay={popover}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {renderReminders(tempReminderConfigList, "in-progress", "critical")}
                                    </tbody>
                                  </Table>
                                  <div className="task_transfer_footer d_aic_jce gap-2">
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                      onClick={() => clearButton("in-progress", "critical")}
                                    >
                                      Clear
                                    </button>
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-primary mt-3 mb-2"
                                      onClick={() => submitReminders("in-progress", "critical")}
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item
                              eventKey="1"
                              className="accordian-chev-icon p-2 mb-2"
                            >
                              <div className="d-flex align-items-center">
                                <Accordion.Header>
                                  <h2 className="ms-4 m-0">HIGH</h2>
                                </Accordion.Header>
                                <Switch
                                  height={18}
                                  width={38}
                                  checked={isChecked("in-progress", "high")}
                                  onChange={() => toggleCheck("in-progress", "high")}
                                />
                              </div>
                              <Accordion.Body className="ps-5 pt-0">
                                <div>
                                  <h4>
                                    Reminder settings for day wise and
                                    notification alerts
                                  </h4>
                                  <p>
                                    Please select sublevel configartion setting
                                    below
                                  </p>
                                </div>

                                <div>
                                  <Table>
                                    <thead>
                                      <tr>
                                        <th></th>
                                        <th>Enable/Disable</th>
                                        <th>Email</th>
                                        <th>InApp</th>
                                        <th>Push</th>
                                        <th>
                                          Timer(HH:MM)
                                          {/* <OverlayTrigger
                                            placement="right"
                                            overlay={popoverTimer}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger> */}
                                        </th>
                                        <th>
                                          Execution Level
                                          <OverlayTrigger
                                            placement="right"
                                            overlay={popover}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {renderReminders(tempReminderConfigList, "in-progress", "high")}
                                    </tbody>
                                  </Table>
                                  <div className="task_transfer_footer d_aic_jce gap-2">
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                      onClick={() => clearButton("in-progress", "high")}
                                    >
                                      Clear
                                    </button>
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-primary mt-3 mb-2"
                                      onClick={() => submitReminders("in-progress", "high")}
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item
                              eventKey="2"
                              className="accordian-chev-icon p-2 mb-2"
                            >
                              <div className="d-flex align-items-center">
                                <Accordion.Header>
                                  <h2 className="ms-4 m-0">MEDIUM</h2>
                                </Accordion.Header>
                                <Switch
                                  height={18}
                                  width={38}
                                  checked={isChecked("in-progress", "medium")}
                                  onChange={() => toggleCheck("in-progress", "medium")}
                                />
                              </div>
                              <Accordion.Body className="ps-5 pt-0">
                                <div>
                                  <h4>
                                    Reminder settings for day wise and
                                    notification alerts
                                  </h4>
                                  <p>
                                    Please select sublevel configartion setting
                                    below
                                  </p>
                                </div>

                                <div>
                                  <Table>
                                    <thead>
                                      <tr>
                                        <th></th>
                                        <th>Enable/Disable</th>
                                        <th>Email</th>
                                        <th>InApp</th>
                                        <th>Push</th>
                                        <th>
                                          Timer(HH:MM)
                                          {/* <OverlayTrigger
                                            placement="right"
                                            overlay={popoverTimer}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger> */}
                                        </th>
                                        <th>
                                          Execution Level
                                          <OverlayTrigger
                                            placement="right"
                                            overlay={popover}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {renderReminders(tempReminderConfigList, "in-progress", "medium")}
                                    </tbody>
                                  </Table>
                                  <div className="task_transfer_footer d_aic_jce gap-2">
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                      onClick={() => clearButton("in-progress", "medium")}
                                    >
                                      Clear
                                    </button>
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-primary mt-3 mb-2 "
                                      onClick={() => submitReminders("in-progress", "medium")}
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item
                              eventKey="3"
                              className="accordian-chev-icon p-2 mb-2"
                            >
                              <div className="d-flex align-items-center">
                                <Accordion.Header>
                                  <h2 className="ms-4 m-0">LOW</h2>
                                </Accordion.Header>
                                <Switch
                                  height={18}
                                  width={38}
                                  checked={isChecked("in-progress", "low")}
                                  onChange={() => toggleCheck("in-progress", "low")}
                                />
                              </div>
                              <Accordion.Body className="ps-5 pt-0">
                                <div>
                                  <h4>
                                    Reminder settings for day wise and
                                    notification alerts
                                  </h4>
                                  <p>
                                    Please select sublevel configartion setting
                                    below
                                  </p>
                                </div>

                                <div>
                                  <Table>
                                    <thead>
                                      <tr>
                                        <th></th>
                                        <th>Enable/Disable</th>
                                        <th>Email</th>
                                        <th>InApp</th>
                                        <th>Push</th>
                                        <th>
                                          Timer(HH:MM)
                                          {/* <OverlayTrigger
                                            placement="right"
                                            overlay={popoverTimer}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger> */}
                                        </th>
                                        <th>
                                          Execution Level
                                          <OverlayTrigger
                                            placement="right"
                                            overlay={popover}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {renderReminders(tempReminderConfigList, "in-progress", "low")}
                                    </tbody>
                                  </Table>
                                  <div className="task_transfer_footer d_aic_jce gap-2">
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                      onClick={() => clearButton("in-progress", "low")}
                                    >
                                      Clear
                                    </button>
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-primary mt-3 mb-2"
                                      onClick={() => submitReminders("in-progress", "low")}
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        </div>
                      </Tab>
                      <Tab eventKey="In Review" title="In Review">
                        <div>
                          <h2 className="mb-1">Sub Levels of Status Type</h2>
                          <p
                            className="select-sublevel"
                            style={{ "padding-left": "5px" }}
                          >
                            Please select sub levels of settings below
                          </p>
                        </div>
                        <div>
                          <Accordion defaultActiveKey="0">
                            <Accordion.Item
                              eventKey="0"
                              className="accordian-chev-icon p-2 mb-2"
                            >
                              <div className="d-flex align-items-center">
                                <Accordion.Header>
                                  <h2 className="ms-4 m-0"> CRITICAL</h2>
                                </Accordion.Header>
                                <Switch
                                  height={18}
                                  width={38}
                                  checked={isChecked("in-review", "critical")}
                                  onChange={() => toggleCheck("in-review", "critical")}
                                />
                              </div>
                              <Accordion.Body className="ps-5 pt-0">
                                <div>
                                  <h4>
                                    Reminder settings for day wise and
                                    notification alerts
                                  </h4>
                                  <p>
                                    Please select sublevel configartion setting
                                    below
                                  </p>
                                </div>

                                <div>
                                  <Table>
                                    <thead>
                                      <tr>
                                        <th></th>
                                        <th>Enable/Disable</th>
                                        <th>Email</th>
                                        <th>InApp</th>
                                        <th>Push</th>
                                        <th>
                                          Timer(HH:MM)
                                          {/* <OverlayTrigger
                                            placement="right"
                                            overlay={popoverTimer}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger> */}
                                        </th>
                                        <th>
                                          Execution Level
                                          <OverlayTrigger
                                            placement="right"
                                            overlay={popover}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {renderReminders(tempReminderConfigList, "in-review", "critical")}
                                    </tbody>
                                  </Table>
                                  <div className="task_transfer_footer d_aic_jce gap-2">
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                      onClick={() => clearButton("in-review", "critical")}
                                    >
                                      Clear
                                    </button>
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-primary mt-3 mb-2"
                                      onClick={() => submitReminders("in-review", "critical")}
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item
                              eventKey="1"
                              className="accordian-chev-icon p-2 mb-2"
                            >
                              <div className="d-flex align-items-center">
                                <Accordion.Header>
                                  <h2 className="ms-4 m-0">HIGH</h2>
                                </Accordion.Header>
                                <Switch
                                  height={18}
                                  width={38}
                                  checked={isChecked("in-review", "high")}
                                  onChange={() => toggleCheck("in-review", "high")}
                                />
                              </div>
                              <Accordion.Body className="ps-5 pt-0">
                                <div>
                                  <h4>
                                    Reminder settings for day wise and
                                    notification alerts
                                  </h4>
                                  <p>
                                    Please select sublevel configartion setting
                                    below
                                  </p>
                                </div>

                                <div>
                                  <Table>
                                    <thead>
                                      <tr>
                                        <th></th>
                                        <th>Enable/Disable</th>
                                        <th>Email</th>
                                        <th>InApp</th>
                                        <th>Push</th>
                                        <th>
                                          Timer(HH:MM)
                                          {/* <OverlayTrigger
                                            placement="right"
                                            overlay={popoverTimer}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger> */}
                                        </th>
                                        <th>
                                          Execution Level
                                          <OverlayTrigger
                                            placement="right"
                                            overlay={popover}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {renderReminders(tempReminderConfigList, "in-review", "high")}
                                    </tbody>
                                  </Table>
                                  <div className="task_transfer_footer d_aic_jce gap-2">
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                      onClick={() => clearButton("in-review", "high")}
                                    >
                                      Clear
                                    </button>
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-primary mt-3 mb-2"
                                      onClick={() => submitReminders("in-review", "high")}
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item
                              eventKey="2"
                              className="accordian-chev-icon p-2 mb-2"
                            >
                              <div className="d-flex align-items-center">
                                <Accordion.Header>
                                  <h2 className="ms-4 m-0">MEDIUM</h2>
                                </Accordion.Header>
                                <Switch
                                  height={18}
                                  width={38}
                                  checked={isChecked("in-review", "medium")}
                                  onChange={() => toggleCheck("in-review", "medium")}
                                />
                              </div>
                              <Accordion.Body className="ps-5 pt-0">
                                <div>
                                  <h4>
                                    Reminder settings for day wise and
                                    notification alerts
                                  </h4>
                                  <p>
                                    Please select sublevel configartion setting
                                    below
                                  </p>
                                </div>

                                <div>
                                  <Table>
                                    <thead>
                                      <tr>
                                        <th></th>
                                        <th>Enable/Disable</th>
                                        <th>Email</th>
                                        <th>InApp</th>
                                        <th>Push</th>
                                        <th>
                                          Timer(HH:MM)
                                          {/* <OverlayTrigger
                                            placement="right"
                                            overlay={popoverTimer}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger> */}
                                        </th>
                                        <th>
                                          Execution Level
                                          <OverlayTrigger
                                            placement="right"
                                            overlay={popover}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {renderReminders(tempReminderConfigList, "in-review", "medium")}
                                    </tbody>
                                  </Table>
                                  <div className="task_transfer_footer d_aic_jce gap-2">
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                      onClick={() => clearButton("in-review", "medium")}
                                    >
                                      Clear
                                    </button>
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-primary mt-3 mb-2"
                                      onClick={() => submitReminders("in-review", "medium")}
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item
                              eventKey="3"
                              className="accordian-chev-icon p-2 mb-2"
                            >
                              <div className="d-flex align-items-center">
                                <Accordion.Header>
                                  <h2 className="ms-4 m-0">LOW</h2>
                                </Accordion.Header>
                                <Switch
                                  height={18}
                                  width={38}
                                  checked={isChecked("in-review", "low")}
                                  onChange={() => toggleCheck("in-review", "low")}
                                />
                              </div>
                              <Accordion.Body className="ps-5 pt-0">
                                <div>
                                  <h4>
                                    Reminder settings for day wise and
                                    notification alerts
                                  </h4>
                                  <p>
                                    Please select sublevel configartion setting
                                    below
                                  </p>
                                </div>

                                <div>
                                  <Table>
                                    <thead>
                                      <tr>
                                        <th></th>
                                        <th>Enable/Disable</th>
                                        <th>Email</th>
                                        <th>InApp</th>
                                        <th>Push</th>
                                        <th>
                                          Timer(HH:MM)
                                          {/* <OverlayTrigger
                                            placement="right"
                                            overlay={popoverTimer}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger> */}
                                        </th>
                                        <th>
                                          Execution Level
                                          <OverlayTrigger
                                            placement="right"
                                            overlay={popover}
                                          >
                                            <span className="ms-2">
                                              <BiInfoCircle />
                                            </span>
                                          </OverlayTrigger>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {renderReminders(tempReminderConfigList, "in-review", "low")}
                                    </tbody>
                                  </Table>
                                  <div className="task_transfer_footer d_aic_jce gap-2">
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                      onClick={() => clearButton("in-review", "low")}
                                    >
                                      Clear
                                    </button>
                                    <button
                                      id="addTask"
                                      type="button"
                                      className="btn btn-primary mt-3 mb-2"
                                      onClick={() => submitReminders("in-review", "low")}
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        </div>
                      </Tab>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
export default ReminderSettings;
