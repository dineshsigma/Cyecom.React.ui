import { Button, Form, Modal, Spinner, Tooltip, OverlayTrigger, Container,Col,Row} from "react-bootstrap";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { create_tickets, getAll_tickets, setButtonLoading, create_Comment } from "../redux/reducers/supportTicketReducer.";
import { getUsers } from "../redux/reducers/userReducer";
import { BiLinkExternal } from "react-icons/bi"
import { FaTicketAlt, FaSearch } from "react-icons/fa";
import { attachmentTicketUpload } from "../redux/reducers/attachmentsReducer";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import moment from "moment";
import DatePicker from "react-datepicker";
import LoaderComponent from '../components/Loader'
import NoDataFound from "../assets/No_Data_File.png";
import ReactQuill from 'react-quill';
import { getStatusConfig} from '../redux/reducers/statusConfigReducer';
import StatusBadge from "../components/StatusBadge";
import { modules } from '../environment';


function Raised_new_Tickets() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [BtnTitle, setBtnTitle] = useState(false)
  const allTickets = useSelector((state) => state.tickets.tickets);
  const orgId = useSelector((state) => state.auth.current_organization);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const usersList = useSelector((state) => state.users.usersList)
  const createTicketResponse = useSelector((state) => state.tickets.createTicketResponse)
  const [AddTicketDialog, setDialog] = useState(false)
  const [addTicketDialog, set_Dialog] = useState(false);
  const loader = useSelector((state) => state.tickets.loader)
  const [file, setFile] = useState();
  const [search, setSearch] = useState("")
  const [createComment, setCreateComment] = useState("");
  const available_organizations = useSelector((state) => state.auth.available_organizations);
  const [organizationsdata, setorganizations] = useState({ data: available_organizations, name: '' })
  const currentOrganization = useSelector(
    (state) => state.auth.current_organization
  );
  const userData = useState(localStorage.getItem('userData')&&JSON.parse(localStorage.getItem('userData')));
  const loading = useSelector((state) => state.tickets.buttonLoading);
  const [newTicket, setNewTicket] = useState({
    title: "",
    type: "",
    comment: "",
    user_id: userDetails.id,
    created_by: userDetails.id,
    org_id: orgId,
    status: "open",
  });
  const statusConfigList = useSelector((state) => state.status.statusConfigList);


  // function to show added tickets 
  const showAddTicket = () => {
    set_Dialog(!addTicketDialog);
    setBtnTitle(!BtnTitle)
  };

  // function to get all added tickets 
  const getTickets = () => {
    dispatch(getAll_tickets(search))
  }

  useEffect(() => {
    getTickets()
    dispatch(getUsers(""));
    dispatch(getStatusConfig());
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
  }, [search, createTicketResponse])

  // function to fetch user
  const fetchUser = (id) => {
    let user = usersList?.find((item) => item.id === id)
    return `${user?.name} ${user?.lastname}`
  }

  // function to fetch mail
  const fetchemail = (id) => {
    if (userDetails?.id === id) {
      return `${userDetails?.email}`
    }
  }

  // function to create tickets and to add Attachements
  const createTickets = async (event) => {
    event.preventDefault();
    dispatch(setButtonLoading(true))
    await dispatch(create_tickets(newTicket)).then((res) => {
      let payload = {
        user_type: "user",
        comment_type: "text",
        ticket_id: res.payload.res.id,
        user_id: userDetails.id,
        comment: newTicket.comment,
      };
      dispatch(create_Comment(payload)).then((resp) => {
        // console.log("Comment-ressssssss", resp.payload.insert_ticket_comment_one.id)
        if (res.payload.res.id && file) {
          const attachmentObj = {
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            folder_path: `org/${currentOrganization}/tickets/${res.payload.res.id}`,
            ticket_id: res.payload.res.id,
            comment_id: resp.payload.insert_ticket_comment_one.id,
            user_id: userDetails.id,
            org_id: currentOrganization,
            file: file,
          }
          dispatch(attachmentTicketUpload(attachmentObj))
        }
      })

      setDialog(!AddTicketDialog)
      set_Dialog(!addTicketDialog)
      setBtnTitle(!BtnTitle)
    })

  }

  let ticket_type = [
    {
      "id": 1,
      "type": "App issues"
    },
    {
      "id": 2,
      "type": "Tech Support"
    },
    {
      "id": 3,
      "type": "Payment Issues"
    }
  ]

  const getAvatar = (user_id) => {
    let usernames = usersList?.find(
      (i) => i.id == user_id
    );
    return usernames?.avatar
  }

   //console.log("allTickets",allTickets);
  // console.log("statusConfigList",statusConfigList)

  return (
    <div>
      <>
        <section className="breadcum_section help">
          <Container fluid>
            <Row className="align-items-center">
              <Col xl={6} lg={6} md={6}>
                <h2 className="bs_title">Tickets</h2>
              </Col>
              <Col xl={6} lg={6} md={6} className="btn-rotate">
                <div className="aside_left d_aic_jce gap-2">
                  <div class="search-box">
                    <input
                      class="form-control text" 
                      type="text"
                      name="raised_tickets-search"
                      placeholder="Search here"
                      value={search}
                      autoFocus
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                    />
                    <button><FaSearch/></button>
                  </div>
                  <Button id="btnShowAddTicket" variant="primary" size="md" onClick={showAddTicket}>
                    <span className="d_aic_jcc gap-2">
                      <FaTicketAlt className={BtnTitle ? "rotate-icon" : ""}/>{BtnTitle ? "" : "Add Ticket"}
                    </span>
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* All ticktes data-table*/}
        {loader ? (
          <LoaderComponent />
        ) : (
          <section>
            <Container fluid>
              <Row>
                <Col lg={12}>
                  {allTickets?.length > 0 ? (
                    <Col md={12}>
                      <div className="table-responsive">
                        <table className="table table-style1  raise-table">
                          <thead>
                            <tr>
                              <th>REQUESTED BY</th>
                              <th>TICKET ID</th>
                              <th>DESCRIPTION</th>
                              <th>CATEGORY TYPE</th>
                              <th>STATUS</th>
                              <th>CREATED DATE</th>
                              <th>ACTIONS</th>
                            </tr>
                          </thead>
                          {allTickets?.map((item, key) => {
                            return (
                              <tbody id={key}>
                                {/*card-table  card-table-an */}
                                <tr className="card-table">
                                  <td>
                                    <div className="tn d-flex align-items-center gap-2">
                                      <div className="raise-icon text-uppercase">
                                        {getAvatar(item?.user_id) !=
                                          undefined || null ? (
                                          <img
                                            src={getAvatar(item?.user_id)}
                                            alt="user-img"
                                            className="rounded-circle"
                                          />
                                        ) : (
                                          fetchUser(item.user_id).slice(0, 2)
                                        )}
                                      </div>
                                      <div className="user-name-email">
                                        <h5 className="mb-1">
                                          {fetchUser(
                                            item.user_id
                                          ).toLowerCase()}
                                        </h5>
                                        <h4>{fetchemail(item.user_id)}</h4>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="tn">
                                      <h3>{"TKT-" + item.id}</h3>
                                    </div>
                                  </td>
                                  <td className="card-table-task-name card-table-desc">
                                    <div className="tn">
                                      <OverlayTrigger
                                        overlay={
                                          <Tooltip id="tooltip-task-name">
                                            {" "}
                                            {item.title}
                                          </Tooltip>
                                        }
                                      >
                                        <h5 className="ttww">{item.title}</h5>
                                      </OverlayTrigger>
                                      <OverlayTrigger
                                        overlay={
                                          <Tooltip id="tooltip-task-name">
                                            <span dangerouslySetInnerHTML={{__html: item.comment}}></span>
                                          </Tooltip>
                                        }
                                      >
                                        <span dangerouslySetInnerHTML={{__html: item.comment}}></span>
                                      </OverlayTrigger>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="tn">
                                      <h3>{item.type}</h3>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="tn raise">
                                      {Array.isArray(statusConfigList) &&
                                        statusConfigList?.map(
                                          (status, index) => {
                                            return (status.name == item.status && (<StatusBadge status={status} />));
                                          }
                                        )}
                                      {/* <Badge className="bdg-success">
                                            {item.status.toUpperCase()}
                                          </Badge> */}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="tn">
                                      <h4>{moment(item.created_at).format("ddd, MMM DD, YYYY, h:mm A")}</h4>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="tb-actions d-flex align-item-center justify-content-start">
                                      <button className="btn-tl-actions" onClick={() => navigate(`/raisedtickets/${item.id}`)}><BiLinkExternal/></button>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            );
                          })}
                        </table>
                      </div>
                    </Col>
                  ) : (
                    <Col md={12} className="center text-center">
                      <img src={NoDataFound} height="500px" alt="No data found"/>
                    </Col>
                  )}
                </Col>
              </Row>
            </Container>
          </section>
        )}

        {/* modal dialog for adding ticket */}
        <Modal
          show={addTicketDialog}
          onHide={showAddTicket}
          backdrop="static"
          keyboard={false}
          aria-labelledby="contained-modal-title-vcenter"
          scrollable={true}
          centered
          className="ticket-modalz modal_forms"
        >
        <Modal.Header closeButton className="d_aic_jcsb">
          <Modal.Title className="modal-title">
            <FaTicketAlt className="rotate-icon" />
            <h2>RAISE A TICKET</h2>
          </Modal.Title>
        </Modal.Header>
          <Form onSubmit={(e) => createTickets(e)}>
            <Modal.Body>
              <h3 className="mb-3">Detailed Ticket Info</h3>
              <Form.Group className="formGroup" controlId="formTicketTitle">
                <Form.Label className="star">
                  Title <b>*</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Add Title"
                  onChange={(e) => {
                    setNewTicket({ ...newTicket, title: e.target.value });
                  }}
                />
              </Form.Group>

              <Form.Group
                className="formGroup"
                controlId="exampleForm.ControlTextarea1"
              >
                <Form.Label className="star">
                  Description <b>*</b>
                </Form.Label>
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  formats={[]}
                  as="textarea"
                  placeholder="Add Description"
                  rows={3}
                  required
                  onChange={(e) => {
                    setNewTicket({ ...newTicket, comment: e });
                  }}
                />
              </Form.Group>

              {/* <Form.Group className="formGroup" controlId="exampleForm.ControlTextarea1">
                  <Form.Label className="star">Description <b>*</b></Form.Label>
                  <Form.Control required as="textarea" placeholder="Add Description" rows={3} onChange={(e) => { setNewTicket({ ...newTicket, comment: e.target.value }); }} />
                </Form.Group> */}
              <Form.Group className="formGroup" controlId="formTicketTitle">
                <Form.Label className="star">
                  Ticket Type <b>*</b>
                </Form.Label>
                <Form.Select
                  required
                  aria-label="Select"
                  onChange={(e) => {
                    setNewTicket({ ...newTicket, type: e.target.value });
                  }}
                >
                  <option value="" selected>
                    Choose Option
                  </option>
                  {ticket_type.length > 0 &&
                    ticket_type?.map((item, index) => (
                      <option value={item.type} key={index}>{item.type}</option>
                    ))}
                </Form.Select>
              </Form.Group>

              <Form.Group controlId="formFile" className="mb-3">
                <Form.Control
                  placeholder="Select File to Upload"
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </Form.Group>

              <Form.Group
                className="formGroup mb-0"
                controlId="formTicketTitle"
              >
                <Form.Label>
                  Created Date <b>*</b>
                </Form.Label>
                <DatePicker
                  className="form-control"
                  timeInputLabel="Time:"
                  dateFormat="eee, MMM dd, yyyy, h:mm aa"
                  showTimeInput
                  minDate={new Date()}
                  selected={new Date()}
                  required
                  disabled
                  onChange={(e) => {
                    setNewTicket({ ...newTicket, created_at: e.target.value });
                  }}
                />
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button
                className="dark-btn"
                variant="secondary"
                onClick={showAddTicket}
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
                  <span> Add ticket</span>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </>
    </div>
  );
}
export default Raised_new_Tickets;
