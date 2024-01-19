import {Col,Row,Button,Badge,Spinner,Modal,Form,OverlayTrigger,InputGroup,Tooltip, Container,} from "react-bootstrap";
import moment from "moment";
import { BiTrashAlt, BiEditAlt,BiChat } from "react-icons/bi";
import {FaPlus} from "react-icons/fa";
import { MdOutlineCampaign } from "react-icons/md";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import EmojiPicker from 'emoji-picker-react';
import {createAnnouncement,getAllAnnouncements,deleteAnnouncements,updateAnnouncements,setButtonLoading,getTodayAnnouncements,} from "../redux/reducers/announcementsReducer";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import Birthdayicon from "../assets/Birthday.svg";
import Anniversaryicon from "../assets/Anniversary_icon.svg";
import Announcementicon from "../assets/Announcement_Icon.svg";
import Festivalicon from "../assets/Festival_icon.svg";
import ceremony from "../assets/ceremony.png";
import NoDataFound from "../assets/No_Data_File.png";
import LoaderComponent from "../components/Loader";
import captialLetter from '../modules/CaptialLetter';
import ReactQuill from 'react-quill';
import Swal from "sweetalert2";
import { modules } from '../environment';
import { getPermissionsByRole} from '../redux/reducers/rolesReducer';

function Announcements() {
  const icons = [
    { name: "Birthdayicon", icon: Birthdayicon },
    { name: "Anniversaryicon", icon: Anniversaryicon },
    { name: "Announcementicon", icon: Announcementicon },
    { name: "Festivalicon", icon: Festivalicon },
    { name: "ceremony", icon: ceremony },
    { name: "meeting", icon: Festivalicon },
  ];
  const dispatch = useDispatch();
  const [dateerror, setdateerror] = useState("");
  const [AddAnnouncementDialog, setDialog] = useState(false);
  const [updateAnnouncementDialog, setUpdateAnnouncementDialog] = useState(false);
  const userOrgData = useState(localStorage.getItem("userOrgData")&&JSON.parse(localStorage.getItem("userOrgData")));
  const loading = useSelector((state) => state.announcement.buttonLoading);
  const [startDateError, setStartDateError] = useState(false)
  const [endDateError, setEndDateError] = useState(false);
  const [endDateLessError,setEndDateLessError]= useState(false);
  const loader = useSelector((state) => state.announcement.loader);
  const orgId = useSelector((state) => state.auth.current_organization);
  //const permissions = useState(JSON.parse(localStorage.getItem("permissions")));
  const user_OrgData = useState(localStorage.getItem("userOrgData")&&JSON.parse(localStorage.getItem("userOrgData")));
  const [permissions,setPermissions] = useState();
  const [annPermissions, setAnnPermissions] = useState();
  const allAnnoucements = useSelector((state) => state.announcement.announcements);
  const addAnnounceResponse = useSelector((state) => state.announcement.addAnnounceResponse);
  const deleteResponse = useSelector((state) => state.announcement.deleteResponse);
  const updateResponse = useSelector((state) => state.announcement.updateResponse);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const [createAnnounce_obj, setCreateAnnounce_obj] = useState({
    title: "",
    description: "",
    end_date: new Date(
      new Date().getTime() + 24 * 60 * 60 * 1000
    ).toISOString(),
    start_date: new Date().toISOString(),
    is_active: true,
    image: "",
    created_by: userDetails.id,
    org_id: orgId,
  });
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [updateAnnouncement, setUpdateAnnouncement] = useState({});
  const available_organizations = useSelector((state) => state.auth.available_organizations);
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const [organizationsdata, setorganizations] = useState({data: available_organizations,name: "",});
  const [iconImage, setIconImage] = useState("");
  const [expandDesc,setExpandDesc]=useState(false)
  const [announceId,setAnnounceId]=useState("");

  useEffect(() => {
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
    dispatch(getAllAnnouncements(filter));
  }, []);

  //to get Permissions for announcements
  useEffect(() => {
    dispatch(getPermissionsByRole(user_OrgData[0]?.role_id)).then((res)=>{
      setPermissions(res.payload)
      setAnnPermissions(res.payload?.find((item) => item.table == "announcement"));
    })
  }, []);

  //to invoke Sweet Alert
  useEffect(() => {
    if (annPermissions?.view == false) {
      opensweetalert();
    }
  }, [annPermissions]);

  const opensweetalert = () => {
    Swal.fire({
      title: "Access Denied !",
      icon: "warning",
      showCancelButton: false,
      showConfirmButton: false,
    });
  };

  const showAddAnnouncement = () => {
    setDialog(!AddAnnouncementDialog);
    setCreateAnnounce_obj({
      title: "",
      description: "",
      end_date: new Date(
        new Date().getTime() + 24 * 60 * 60 * 1000
      ).toISOString(),
      start_date: new Date().toISOString(),
      is_active: true,
      image: "",
      created_by: userDetails.id,
      org_id: orgId,
    })
  };

  const descriptionHandeler=(e)=>{
     console.log(e)
     
      setCreateAnnounce_obj({
        ...createAnnounce_obj,
        description: e,
      });
    
  }
  const addAnnouncement = (e) => {
    e.preventDefault();
    if (!createAnnounce_obj.image)
     return setError("Please select announcement type");
     const startDate=(new Date(createAnnounce_obj.start_date))
     const dueDate=(new Date(createAnnounce_obj.end_date))
     let timeDifference = (startDate.getTime()-dueDate.getTime()) / 1000;
     let totalMinutes=timeDifference/60;
     let minutesDifference=Math.abs(Math.round(totalMinutes))
     if (startDate.getDate()>dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()) {
       setEndDateLessError(true)
       return
      }
     if (
         startDate.getHours()==dueDate.getHours()&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()
       ) {
         setEndDateError(true)
         return
     }
     if (
     startDate.getMonth()>dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()
    ) {
      setEndDateError(true)
      return
  }
     if((dueDate.getHours()-startDate.getHours()==1)&&minutesDifference<59&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()){
         setEndDateError(true)
         return
     }
     if(startDate.getHours()>dueDate.getHours()&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()){
         setStartDateError(true)
         return
     }
    //  if(startDate.getDate()>dueDate.getDate()||startDate.getDate()==dueDate.getDate()&&startDate.getFullYear()==dueDate.getFullYear()&&startDate.getMonth()==dueDate.getMonth()){
    //   setStartDateError(true)
    //   setEndDateError(true)
    //   return
    //  }
    createAnnounce_obj.title.trimEnd();
    createAnnounce_obj.description.trimEnd();
    dispatch(setButtonLoading(true));
    dispatch(createAnnouncement(createAnnounce_obj)).then((res) => {
      dispatch(getAllAnnouncements(filter));
      dispatch(getTodayAnnouncements());
    });

    setDialog(!AddAnnouncementDialog);
    setCreateAnnounce_obj({
      title: "",
      description: "",
      end_date: new Date(
        new Date().getTime() + 24 * 60 * 60 * 1000
      ).toISOString(),
      start_date: new Date().toISOString(),
      is_active: true,
      image: "",
      created_by: userDetails.id,
      org_id: orgId,
    })
  };

  const update = (data) => {
    setUpdateAnnouncement(data);
    setUpdateAnnouncementDialog(!updateAnnouncementDialog);
  };

  const update_Announcement = (e) => {
    e.preventDefault();
    updateAnnouncement.title.trimEnd();
    updateAnnouncement.description.trimEnd();
    const startDate=(new Date(updateAnnouncement.start_date))
    const dueDate=(new Date(updateAnnouncement.end_date))
    let timeDifference = (startDate.getTime()-dueDate.getTime()) / 1000;
     let totalMinutes=timeDifference/60;
     let minutesDifference=Math.abs(Math.round(totalMinutes))
     if (
         startDate.getHours()==
         dueDate.getHours()&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()
       ) {
         setEndDateError(true)
         return
     }
     if((dueDate.getHours()-startDate.getHours()==1)&&minutesDifference<59&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()){
         setEndDateError(true)
         return
     }
     if (
      startDate.getMonth()>dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()
     ) {
       setEndDateError(true)
       return
   }
     if(startDate.getHours()>dueDate.getHours()&&startDate.getDate()==dueDate.getDate()&&startDate.getMonth()==dueDate.getMonth()&&startDate.getFullYear()==dueDate.getFullYear()){
         setStartDateError(true)
         return
     }
    // if(startDate.getDate()>dueDate.getDate()||startDate.getDate()==dueDate.getDate()&&startDate.getFullYear()==dueDate.getFullYear()&&startDate.getMonth()==dueDate.getMonth()){
    //  setStartDateError(true)
    //  setEndDateError(true)
    //  return
    // }
    dispatch(setButtonLoading(true));
    dispatch(updateAnnouncements(updateAnnouncement)).then((res) => {
      dispatch(getAllAnnouncements(filter));
      dispatch(getTodayAnnouncements());
      dispatch(setButtonLoading(false));
    });
    setUpdateAnnouncementDialog(!updateAnnouncementDialog);
  };

  const announcementDelete = (item) => {
    dispatch(deleteAnnouncements(item.id)).then((res) => {
      dispatch(getAllAnnouncements(filter));
      dispatch(getTodayAnnouncements());
    });
  };

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

  const emojiSelect = (e) => {
    setCreateAnnounce_obj({
      ...createAnnounce_obj,
      image: e.emoji,
    });
    // let img=document.getElementsByClassName('__EmojiPicker__ epr-emoji-img')
    // console.log("im gggggggggggg",img)
  };

  // console.log("allAnnoucements",allAnnoucements);

  return (
    <>
      {loader ? (
        <LoaderComponent />
      ) : annPermissions?.view == true||(userOrgData?.[0]?.role_id == 1 ||
        userOrgData?.[0]?.role_id == 2) ? (
        <>
          <section className="breadcum_section">
            <Container fluid>
              <Row className="d_aic_jcsb">
                <Col md={6}>
                  <h2 className="bs_title">Announcements</h2>
                </Col>
                <Col md={6} className="text-end">
                  <Button variant="primary" size="md" onClick={showAddAnnouncement} disabled={annPermissions?.create == false}>
                    <span className="d_aic_jcc gap-2"><FaPlus/>Add Announcement</span>
                  </Button>
                </Col>
              </Row>
            </Container>
          </section>

          <section>
            <Container fluid>
              <Row>
                <Col lg={12}>
                  {allAnnoucements?.length > 0 ? (
                    <Col md={12}>
                      <div className="table-responsive">
                        <table className="table table-style1">
                          <thead>
                            <tr>
                              <th>Announcement Name</th>
                              <th>Created by </th>
                              <th>Start Date</th>
                              <th>End Date</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allAnnoucements?.map((item, key) => {
                              return (
                                <tr
                                 key={key}
                                  className={
                                    compareDate(
                                      item.start_date,
                                      item.end_date
                                    ) === "Live"
                                      ? "card-table card-table-success" //live
                                      : compareDate(
                                          item.start_date,
                                          item.end_date
                                        ) === "Expired"
                                      ? "card-table card-table-danger" //expierd
                                      : "card-table card-table-warning" //upcoming
                                  }
                                >
                                  <td className="table-an-name d-flex align-items-center">
                                    {/* <OverlayTrigger overlay={<Tooltip id="tooltip-task-name">{captialLetter(item?.title)}</Tooltip>}>
                                        <div className="tn d_aic_jcsb">
                                          <div>
                                            <span className="fs-3">
                                              {item.image}
                                            </span>
                                          </div>
                                          <div className="d-flex flex-column ttww">
                                            <h4>{captialLetter(item?.title)}</h4>
                                            <span className="" dangerouslySetInnerHTML={{__html: item.description,}}/>
                                          </div>
                                        </div>
                                      </OverlayTrigger> */}
                                    <OverlayTrigger overlay={<Tooltip id="tooltip-task-name">{captialLetter(item?.title)}</Tooltip>}>
                                      <div className="tn d_aic_jcsb">
                                        <div>
                                          <span className="fs-3">{item.image}</span>
                                        </div>
                                        <div className="d-flex flex-column ttww">
                                          <h4>{captialLetter(item?.title)}</h4>
                                          <div key={item.id} className={item.description.length > 150 &&!expandDesc? "overFlowDesc": item.id == announceId? "": item.description.length > 150 &&"overFlowDesc"}>
                                            <span dangerouslySetInnerHTML={{__html: item.description}}/>
                                          </div>
                                          {item.description.length > 150 && item.id != announceId ? (<a className="mt-3 text-decoration-underline" onClick={() => {setExpandDesc(true);setAnnounceId(item.id);}}>Read More...</a>) : (item.id == announceId &&item.description.length > 150 && expandDesc && (<a className="mt-3 text-danger text-decoration-underline" onClick={() => {setExpandDesc(false);setAnnounceId("");}}>Read Less...</a>))}
                                        </div>
                                      </div>
                                    </OverlayTrigger>
                                  </td>

                                  <td>
                                    <div className="tn">
                                      {captialLetter(item?.user?.name)}{" "}
                                      {captialLetter(item?.user?.lastname)}
                                    </div>
                                  </td>

                                  <td>
                                    <div className="tn">
                                      {moment(item.start_date).format(
                                        "ddd, MMM DD, YYYY, h:mm A"
                                      )}
                                    </div>
                                  </td>

                                  <td>
                                    <div className="tn">
                                      {moment(item.end_date).format(
                                        "ddd, MMM DD, YYYY, h:mm A"
                                      )}
                                    </div>
                                  </td>

                                  <td>
                                    <div className="tn">
                                      {compareDate(
                                        item.start_date,
                                        item.end_date
                                      ) === "Live" && (
                                        <Badge className="bdg-success">
                                          Live
                                        </Badge>
                                      )}
                                      {compareDate(
                                        item.start_date,
                                        item.end_date
                                      ) === "Expired" && (
                                        <Badge className="bdg-danger">
                                          Expired
                                        </Badge>
                                      )}
                                      {compareDate(
                                        item.start_date,
                                        item.end_date
                                      ) === "Upcomming" && (
                                        <Badge className="bdg-warning">
                                          Upcoming
                                        </Badge>
                                      )}
                                    </div>
                                  </td>

                                  <td>
                                    <div className="tb-actions d_aic_jcfs">
                                      <button
                                        className={
                                          annPermissions?.update
                                            ? "btn-tl-actions"
                                            : "btn-tl-actions disabled-action"
                                        }
                                        onClick={() => update(item)}
                                        disabled={
                                          annPermissions?.update == false
                                        }
                                      >
                                        {compareDate(
                                          item.start_date,
                                          item.end_date
                                        ) !== "Expired" && <BiEditAlt />}
                                      </button>
                                      <button
                                        className={
                                          annPermissions?.update
                                            ? "btn-tl-actions"
                                            : "btn-tl-actions disabled-action"
                                        }
                                        onClick={() => announcementDelete(item)}
                                        disabled={
                                          annPermissions?.delete == false
                                        }
                                      >
                                        <BiTrashAlt />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Col>
                  ) : (
                    <Col md={12} className="center text-center">
                      <img src={NoDataFound} height="500px" alt="NoDataFound" />
                    </Col>
                  )}
                </Col>
              </Row>
            </Container>
          </section>
        </>
      ) : (
        <></>
      )}

      <Modal
        scrollable={true}
        show={AddAnnouncementDialog}
        onHide={() => {
          setError("");
          setDialog(!AddAnnouncementDialog);
          setEndDateError(false);
          setCreateAnnounce_obj((prev) => ({ ...prev, image: "" }));
        }}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="modal_forms"
      >
        <Modal.Header closeButton className="d_aic_jcsb">
          <Modal.Title className="modal-title">
            <MdOutlineCampaign className="announcement-icon" />
            <h2>Add a Announcement</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => addAnnouncement(e)}>
            <Form.Group className="formGroup" controlId="announcementTitle">
              <Form.Label className="star">
                Title <b>*</b>
              </Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Add Title"
                value={createAnnounce_obj.title.trimStart()}
                onChange={(e) => {
                  setCreateAnnounce_obj({
                    ...createAnnounce_obj,
                    title: e.target.value,
                  });
                }}
              />
            </Form.Group>
            <Form.Group className="formGroup" controlId="announcementDesc">
              <Form.Label className="star">
                {" "}
                <BiChat /> Description{" "}
              </Form.Label>
              <ReactQuill
                theme="snow"
                modules={modules}
                formats={[]}
                required
                value={createAnnounce_obj.description.trimStart()}
                onChange={(e)=>descriptionHandeler(e)}
              />
            </Form.Group>
            <Row>
              <Col className="col-6">
                <Form.Group className="formGroup" controlId="announcementDesc">
                  <Form.Label>Start Date</Form.Label>
                  <InputGroup>
                    <DatePicker
                      className="form-control"
                      minDate={new Date()}
                      required
                      selected={new Date(createAnnounce_obj.start_date)}
                      onChange={(date) =>
                        setCreateAnnounce_obj({
                          ...createAnnounce_obj,
                          start_date: new Date(date).toISOString(),
                        })
                      }
                      onFocus={() => {
                        setStartDateError(false);
                        setEndDateError(false);
                        setEndDateLessError(false)
                      }}
                      timeInputLabel="Time:"
                      dateFormat="eee, MMM dd, yyyy, h:mm aa"
                      showTimeInput
                      popperModifiers={{
                        preventOverflow: {
                          enabled: true,
                          escapeWithReference: false,
                          boundariesElement: "viewport",
                        },
                      }}
                      popperPlacement="bottom"
                    />

                    <InputGroup.Text className="calendar-icon">
                      {/* <FiCalendar /> */}
                    </InputGroup.Text>
                  </InputGroup>
                  {startDateError && (
                    <small className="text-danger">
                      start date must be less than due date
                    </small>
                  )}
                </Form.Group>
              </Col>
              <Col className="col-6">
                <Form.Group className="formGroup" controlId="announcementDesc">
                  <Form.Label>Due Date</Form.Label>
                  <InputGroup>
                    <DatePicker
                      className="form-control"
                      calendarClassName="smaller-datepicker"
                      minDate={new Date(createAnnounce_obj.start_date)}
                      required
                      selected={new Date(createAnnounce_obj.end_date)}
                      onChange={(date) =>
                        setCreateAnnounce_obj({
                          ...createAnnounce_obj,
                          end_date: new Date(date).toISOString(),
                        })
                      }
                      onFocus={() => {
                        setStartDateError(false);
                        setEndDateError(false);
                        setEndDateLessError(false)
                      }}
                      timeInputLabel="Time:"
                      dateFormat="eee, MMM dd, yyyy, h:mm aa"
                      showTimeInput
                    />
                    <InputGroup.Text className="calendar-icon">
                      {/* <FiCalendar /> */}
                    </InputGroup.Text>
                  </InputGroup>
                  {endDateError && (
                    <small className="text-danger">
                      Need atleast 1 hour difference between dates
                    </small>
                  )}
                   {endDateLessError && (
                    <span className="text-danger">
                    due date must be greater than start date
                    </span>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="formGroup mb-0" controlId="formFile">
              <Form.Label>Announcement Type</Form.Label>
              {createAnnounce_obj.image != "" ? (
                <h6 className="">Selected {createAnnounce_obj.image}</h6>
              ) : (
                ""
              )}
              <label className="checkbox-wrapper">
                {/* <input
                        type="radio"
                        name="icon"
                        className="checkbox-input"
                        onChange={() => {
                          setError("")
                          setCreateAnnounce_obj({
                            ...createAnnounce_obj,
                            image: ""
                          });
                        }}
                      /> */}
                <div className="">
                  {/* <img src={icon.icon} alt="Birthdayicon" /> */}
                  <EmojiPicker
                    height={300}
                    width={550}
                    size={12}
                    suggestedEmojisMode={"recent"}
                    onEmojiClick={(e) => emojiSelect(e)}
                  />
                </div>
              </label>
              {/* <p>{icon.name}</p> */}
              <p style={{ color: "red", "font-size": "13px" }}>{error}</p>
            </Form.Group>
            <div className="modal-footer w-100">
              <Button
                className="dark-btn"
                variant="secondary"
                onClick={() => {
                  setError("");
                  setCreateAnnounce_obj((prev) => ({ ...prev, image: "" }));
                  setDialog(!AddAnnouncementDialog);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <span>Submit</span>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
        {/* <Modal.Footer>
            <Button
              className="dark-btn"
              variant="secondary"
              onClick={() => {
                setError("");
                setCreateAnnounce_obj((prev) => ({ ...prev, image: "" }));
                setDialog(!AddAnnouncementDialog);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                <span>Submit</span>
              )}
            </Button>
          </Modal.Footer> */}
      </Modal>

      <Modal
        show={updateAnnouncementDialog}
        onHide={() => setUpdateAnnouncementDialog(!updateAnnouncementDialog)}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="modal_forms"
      >
        <Form onSubmit={update_Announcement}>
          <Modal.Header closeButton>
            <Modal.Title className="modal-title">
              <h2>Update Announcement</h2>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="formGroup" controlId="announcementTitle">
              <Form.Label className="star">
                Title <b>*</b>
              </Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Add Title"
                value={updateAnnouncement.title?.trimStart()}
                onChange={(e) => {
                  setUpdateAnnouncement({
                    ...updateAnnouncement,
                    title: e.target.value,
                  });
                }}
              />
            </Form.Group>

            <Form.Group className="formGroup" controlId="announcementTitle">
              <Form.Label className="star">
                Description <b>*</b>
              </Form.Label>
              <ReactQuill
                theme="snow"
                modules={modules}
                formats={[]}
                as="textarea"
                placeholder="Update Description"
                rows={3}
                required
                value={updateAnnouncement.description?.trimStart()}
                onChange={(e) => {
                  setUpdateAnnouncement({
                    ...updateAnnouncement,
                    description: e,
                  });
                }}
              />
              {/* <Form.Control
                required
                as="textarea"
                placeholder="Update Description"
                value={updateAnnouncement.description?.trimStart()}
                rows={3}
                onChange={(e) => {
                  setUpdateAnnouncement({
                    ...updateAnnouncement,
                    description: e.target.value,
                  });
                }}
              /> */}
            </Form.Group>

            <Row>
              <Col xl={6} lg={6}>
                <Form.Group className="formGroup" controlId="announcementDesc">
                  <Form.Label>Start Date</Form.Label>
                  <InputGroup>
                    <DatePicker
                      className="form-control"
                      selected={new Date(updateAnnouncement.start_date)}
                      onChange={(date) =>
                        setUpdateAnnouncement({
                          ...updateAnnouncement,
                          start_date: new Date(date).toISOString(),
                          end_date: new Date(
                            date.getTime() + 24 * 60 * 60 * 1000
                          ).toISOString(),
                        })
                      }
                      onFocus={() => {
                        setStartDateError(false);
                        setEndDateError(false);
                        setEndDateLessError(false)
                      }}
                      minDate={new Date()}
                      timeInputLabel="Time:"
                      dateFormat="eee, MMM dd, yyyy, h:mm aa"
                      showTimeInput
                    />
                    <InputGroup.Text className="calendar-icon">
                      {/* <FiCalendar /> */}
                    </InputGroup.Text>
                  </InputGroup>
                  {startDateError && (
                    <span className="text-danger">
                      start date must be less than due date
                    </span>
                  )}
                </Form.Group>
              </Col>
              <Col className="col-6">
                <Form.Group className="formGroup" controlId="announcementDesc">
                  <Form.Label>Due Date</Form.Label>
                  <InputGroup>
                    <DatePicker
                      className="form-control"
                      selected={new Date(updateAnnouncement.end_date)}
                      onChange={(date) =>
                        setUpdateAnnouncement({
                          ...updateAnnouncement,
                          end_date: new Date(date).toISOString(),
                        })
                      }
                      onFocus={() => {
                        setStartDateError(false);
                        setEndDateError(false);
                        setEndDateLessError(false)
                      }}
                      minDate={new Date(updateAnnouncement.start_date)}
                      timeInputLabel="Time:"
                      dateFormat="eee, MMM dd, yyyy, h:mm aa"
                      showTimeInput
                    />
                    <InputGroup.Text className="calendar-icon">
                      {/* <FiCalendar /> */}
                    </InputGroup.Text>
                  </InputGroup>
                  {endDateError && (
                    <span className="text-danger">
                      Need atleast 1 hour difference between dates
                    </span>
                  )}
                   {endDateLessError && (
                    <span className="text-danger">
                    due date must be greater than start date
                    </span>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="formGroup mb-0" controlId="formFile">
              <Form.Label>Announcement Type</Form.Label>
              <div className="checkbox-container">
                <span className="fs-4">
                  Selected {updateAnnouncement.image}
                </span>
                <EmojiPicker
                  height={300}
                  width={530}
                  size={12}
                  suggestedEmojisMode={"recent"}
                  onEmojiClick={(e) => {
                    setUpdateAnnouncement({
                      ...updateAnnouncement,
                      image: e.emoji,
                    });
                  }}
                />
                {/* {icons.map((icon) => (
                  <div className="checkbox">
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={
                          icon.name === iconImage ||
                          icon.name === updateAnnouncement.image
                        }
                        className="checkbox-input"
                        onChange={() => {
                          setUpdateAnnouncement((prev) => ({
                            ...prev,
                            image: "",
                          }));
                          setIconImage(icon.name);
                          setUpdateAnnouncement((prev) => ({
                            ...prev,
                            image: icon.name,
                          }));
                        }}
                      />
                      <div className="checkbox-tile">
                        <img src={icon.icon} alt="Birthdayicon" />
                      </div>
                    </label>
                    <p>{icon.name}</p>
                  </div>
                ))} */}
              </div>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              className="dark-btn"
              variant="secondary"
              onClick={() => {
                setUpdateAnnouncementDialog(!updateAnnouncementDialog);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                <span> Update </span>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
export default Announcements;
