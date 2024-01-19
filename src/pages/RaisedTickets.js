import Card from "react-bootstrap/Card";
import Avatar from "../components/Avatar";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "react-bootstrap/Spinner";
import { useParams } from "react-router-dom";
import {
  getAll_ticketsComments_byid,
  create_Comment,
} from "../redux/reducers/supportTicketReducer.";
import {
  create_tickets,
  getAll_tickets,
  deleteTicket,
  setButtonLoading,
} from "../redux/reducers/supportTicketReducer.";
import { getUsers } from "../redux/reducers/userReducer";
import moment from "moment";
import logo from "../assets/Cypro_logo.png";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import { FaTicketAlt } from "react-icons/fa";
import NoDataFound from "../assets/No_Data_File.png";

function RaisedTickets() {
  const dispatch = useDispatch();
  const allTickets = useSelector((state) => state.tickets.tickets);
  const commentsList = useSelector((state) => state.tickets.getTicketsByid);
  const orgId = useSelector((state) => state.auth.current_organization);
  const usersList = useSelector((state) => state.users.usersList);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const [search, ticketSearch] = useState("");
  const [selectTicket, setSelectedTicket] = useState();
  const [createComment, setCreateComment] = useState("");
  const [addTicketDialog, setDialog] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState();
  const loading = useSelector((state) => state.tickets.buttonLoading);
  const [newTicket, setNewTicket] = useState({
    title: "",
    type: "",
    comment: "",
    user_id: userDetails.id,
    org_id: orgId,
    status: "new",
  });
  const showAddTicket = () => {
    setDialog(!addTicketDialog);
  };

  useEffect(() => {
    // dispatch(getAll_ticketsComments_byid(getTicketComment_payload))
    dispatch(getUsers(""));
    dispatch(getAll_tickets(search)).then((res) => {
      setSelectedTicket(res.payload[0]);
      dispatch(
        getAll_ticketsComments_byid({ ticket_id: parseInt(res.payload[0].id) })
      );
    });
  }, [search]);

  const submitComment = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    let payload = {
      user_type: "user",
      comment_type: "text",
      ticket_id: selectTicket.id,
      user_id: userDetails.id,
      comment: createComment,
    };
    dispatch(create_Comment(payload)).then((res) => {
      dispatch(
        getAll_ticketsComments_byid({ ticket_id: parseInt(selectTicket.id) })
      );
      form.reset();
    });
  };

  const fetchUser = (item) => {
    let user = usersList.find((usr) => usr.id === item.user_id);
    if (item.user_type === "user") {
      if (user) {
        return (
          <div className="card-gt-body d-flex align-items-center justify-content-between gap_1rm">
            <Avatar
              initials={`${user.name
                .substring(0, 1)
                .toUpperCase()}${user.lastname.substring(0, 1).toUpperCase()}`}
            />
            <div className="content d-flex align-items-center justify-content-between ">
              <h4>
                {user?.name} {user?.lastname}
                <span>{moment(item.created_at, "YYYYMMDD").fromNow()}</span>
              </h4>
            </div>
          </div>
        );
      }
    } else {
      return (
        <div className="card-gt-body d-flex align-items-center justify-content-between gap_1rm">
          <Avatar image={logo} />
          <div className="content d-flex align-items-center justify-content-between ">
            <h4>
              Cyecom Team
              <span>{moment(item.created_at, "YYYYMMDD").fromNow()}</span>
            </h4>
          </div>
        </div>
      );
    }
  };

  // useEffect(() => {
  //     dispatch(getAll_ticketsComments_byid(getTicketComment_payload))
  // }, [createCommentResponse, dispatch, getTicketComment_payload])

  useMemo(() => {
    selectTicket &&
      dispatch(
        getAll_ticketsComments_byid({ ticket_id: parseInt(selectTicket?.id) })
      );
  }, [selectTicket]);

  const fetchComment = (comment, key) => {
    if (comment.user_type === "user") {
      let user = usersList.find((usr) => usr.id === comment.user_id);
      if (user) {
        return (
          <li id={key} className="me client-reply">
            <div className="message">
              <div className="box sb4"> {comment.comment}</div>
            </div>
            <div className="entete">
              {/* <span className="status blue"></span>&nbsp; */}
              <h3>
                <b className="text-black">{user.name} {user.lastname}</b> &nbsp;
             {moment(comment.created_at).format("LLL")}</h3>
            </div>
          </li>
        );
      }
    } else {
      return (
        <li id={key} className="you team-reply">
              <div className="message">
            <div className="box admin-reply"> {comment.comment}</div>
          </div>
          <div className="entete">
            <h3>
            <b className="text-black">Cyecom Team</b> &nbsp;
            {moment(comment.created_at).format("LLL")}</h3> &nbsp;
            {/* <span className="status green"></span> */}
          </div>
        
        </li>
      );
    }
  };

  const createTickets = async (event) => {
    event.preventDefault();
    dispatch(setButtonLoading(true));
    dispatch(create_tickets(newTicket)).then((res) => {
      if (res.payload.status) {
        setDialog(!addTicketDialog);
        dispatch(getAll_tickets(search));
        dispatch(setButtonLoading(false));
      } else {
        dispatch(setButtonLoading(false));
      }
    });
  };

  return (
    <div className="container-fluid">
      <div className="row m-4 mb-0">
        <div className="text-start mt-2 col-6">
          <h4>Tickets</h4>
        </div>
        <div className="col-6 mt-2 text-end">
          <Button
            id="btnShowAddTicket"
            variant="primary"
            size="md"
            onClick={showAddTicket}
          >
            + Add Ticket
          </Button>
        </div>
      </div>

      {allTickets?.length > 0 ? (
        <Card className="m-4 no-border-card">
          <div className="tickets-container">
            <div className="row my-2 ">
              <div className="col-3 p-0 raised-tickes-list">
                <div className="p-3">
                  <input
                    className="form-control mr-sm-2 ticket-search"
                    type="search"
                    name="ticket-search"
                    placeholder="Search"
                    aria-label="Search"
                    onChange={(e) => ticketSearch(e.target.value)}
                  />
                </div>
                <div className="">
                  <ul className="pl-3">
                    {allTickets.map((item, key) => {
                      return (
                        <li
                          id={key}
                          className={
                            item.id === selectTicket?.id ? "ticket-active" : ""
                          }
                          onClick={() => setSelectedTicket(item)}
                        >
                          <div className="ticket-icons">
                            <FaTicketAlt />
                          </div>
                          {/* <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/1940306/chat_avatar_01.jpg" alt="" /> */}
                          <div className="pl-3">
                            <h2>{item.title}</h2>
                            <h3>
                              {item.status === "new" && (
                                <Badge
                                  className="status-badges"
                                  pill
                                  bg="success"
                                >
                                  New
                                </Badge>
                              )}
                              {item.status === "closed" && (
                                <Badge
                                  className="status-badges"
                                  pill
                                  bg="danger"
                                >
                                  Closed
                                </Badge>
                              )}
                              {item.status === "null" && (
                                <Badge
                                  className="status-badges open"
                                  pill
                                  bg="info"
                                >
                                  Open
                                </Badge>
                              )}
                            </h3>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              <div className="col p-0">
              <header>
                  <div>
                    <h2>{selectTicket?.title}</h2>
                    <h3>already {commentsList?.length} messages</h3>
                  </div>
                </header>
                <ul id="chat">
                  {commentsList.map((comment, key) =>
                    fetchComment(comment, key)
                  )}
                </ul>
                <footer>
                  <Form onSubmit={(e) => submitComment(e)}>
                    <Form.Control
                      as="textarea"
                      required
                      placeholder="Enter Your Comment"
                      onChange={(e) => setCreateComment(e.target.value)}
                    />

                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      ) : (
                        <span> Add Comment</span>
                      )}
                    </Button>
                  </Form>
                </footer>
              </div>
            </div>
          </div>
<br></br>
          <Card.Body className="p-0 d-none">
            <div id="container">
              <aside>
                <header>
                  <input
                    className="form-control mr-sm-2 ticket-search"
                    type="search"
                    name="ticket-search"
                    placeholder="Search"
                    aria-label="Search"
                    onChange={(e) => ticketSearch(e.target.value)}
                  />
                  {/* <input type="text" placeholder="search" onChange={(e) => ticketSearch(e.target.value)} /> */}
                </header>
                <ul>
                  {allTickets.map((item, key) => {
                    return (
                      <li
                        id={key}
                        className={
                          item.id === selectTicket?.id ? "ticket-active" : ""
                        }
                        onClick={() => setSelectedTicket(item)}
                      >
                        <div className="ticket-icons">
                          <FaTicketAlt />
                        </div>
                        {/* <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/1940306/chat_avatar_01.jpg" alt="" /> */}
                        <div className="pl-3">
                          <h2>{item.title}</h2>
                          <h3>
                            {item.status === "new" && (
                              <Badge
                                className="status-badges"
                                pill
                                bg="success"
                              >
                                New
                              </Badge>
                            )}
                            {item.status === "closed" && (
                              <Badge className="status-badges" pill bg="danger">
                                Closed
                              </Badge>
                            )}
                            {item.status === "null" && (
                              <Badge
                                className="status-badges open"
                                pill
                                bg="info"
                              >
                                Open
                              </Badge>
                            )}
                          </h3>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </aside>
              <main>
                <header>
                  <div>
                    <h2>{selectTicket?.title}</h2>
                    <h3>already {commentsList?.length} messages</h3>
                  </div>
                </header>
                <ul id="chat">
                  {commentsList.map((comment, key) =>
                    fetchComment(comment, key)
                  )}
                </ul>

                <footer>
                  <Form onSubmit={(e) => submitComment(e)}>
                    <Form.Control
                      as="textarea"
                      required
                      placeholder="Enter Your Comment"
                      onChange={(e) => setCreateComment(e.target.value)}
                    />

                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      ) : (
                        <span> Add Comment</span>
                      )}
                    </Button>
                  </Form>
                </footer>
              </main>
            </div>
            {/* {getTicketsByid && getTicketsByid.map((item) => {
                            return (
                                <div className="card-grid-item mb-3 ticket_card">
                                    {fetchUser(item)}
                                    <div className='justify-content-between ticket-content p-2'>
                                        <p>{item.comment}</p>
                                    </div> 
                                </div>                               
                            )
                        })} */}
          </Card.Body>
          {/* <Card.Footer>
                    <Form className='m-2' onSubmit={(e) => submitComment(e)}>
                        <Form.Control as="textarea" required placeholder='Enter Your Comment' onChange={(e) => setCreateComment(e.target.value)} />
                        <Button className='mt-3' type='submit' disabled={loading}>
                            {loading ? <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            /> : <span> Add Comment</span>}
                        </Button>
                    </Form>
                </Card.Footer> */}
        </Card>
      ) : (
        <div className="col-md-12 center text-center">
          <img src={NoDataFound} height="500px" alt="NoDataFound"/>
        </div>
      )}

      <Modal
        show={addTicketDialog}
        onHide={() => setDialog(!addTicketDialog)}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Form onSubmit={(e) => createTickets(e)}>
          <Modal.Header closeButton>
            <Modal.Title>Add a Ticket</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3 mt-3" controlId="formTicketTitle">
              <Form.Control
                type="text"
                placeholder="Ticket Title"
                required
                onChange={(e) => {
                  setNewTicket({ ...newTicket, title: e.target.value });
                }}
              />
            </Form.Group>
            <Form.Select
              required
              className="mb-3 mt-3"
              aria-label="Select"
              onChange={(e) => {
                setNewTicket({ ...newTicket, type: e.target.value });
              }}
            >
              <option value="">Select Type</option>
              <option value="Testing">Testing</option>
              <option value="Review">Review</option>
            </Form.Select>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ticket Comments"
                required
                onChange={(e) => {
                  setNewTicket({ ...newTicket, comment: e.target.value });
                }}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setDialog(!addTicketDialog)}
            >
              Close
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
    </div>
  );
}

export default RaisedTickets;
