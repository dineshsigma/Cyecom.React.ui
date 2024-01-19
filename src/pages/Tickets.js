import {Container,  Col,Nav,Row,Tab,Card,Button,Form,Dropdown,Modal,Spinner,Accordion} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Avatar from '../components/Avatar'
import { avatarBrColors } from '../environment'
import { toast, ToastContainer } from 'react-toastify';
import { FaTicketAlt } from "react-icons/fa";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { create_tickets, getAll_tickets, deleteTicket, setButtonLoading } from '../redux/reducers/supportTicketReducer.'
import { getUsers } from "../redux/reducers/userReducer";
import moment from 'moment'
import Badge from 'react-bootstrap/Badge';
import {FaPlus} from "react-icons/fa";



function Tickets() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userDetails = useSelector((state) => state.auth.userDetails)
  const orgId = useSelector((state) => state.auth.current_organization)
  const createTicketResponse = useSelector((state) => state.tickets.createTicketResponse)
  const deleteTicketResponse = useSelector((state) => state.tickets.deleteTicketResponse)
  const allTickets = useSelector((state) => state.tickets.tickets)
  const [AddTicketDialog, setDialog] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState();
  const loading = useSelector((state) => state.tickets.buttonLoading)
  const [newTicket, setNewTicket] = useState({
    title: "",
    type: "",
    comment: "",
    user_id: userDetails.id,
    org_id: orgId,
    status : 'new'
  })

  const showAddTicket = () => {
    setDialog(!AddTicketDialog)
  }

  const getTickets = () => {
    dispatch(getAll_tickets(""))
  }
  useEffect(() => {
    getTickets()
    dispatch(getUsers(""));
  }, [createTicketResponse, deleteTicketResponse])

  const createTickets = async (event) => {
    event.preventDefault();
    dispatch(setButtonLoading(true))
    await dispatch(create_tickets(newTicket))
    setDialog(!AddTicketDialog)
  }

  const deleteDialog = async (id, event) => {
    event.preventDefault();
    setDeleteId(id)
    setDeleteModal(!deleteModal)
  }
  const Delete_Ticket = async () => {
    //console.log('Deleting Location')
    // dispatch(setLocationButtonLoading(true))
    dispatch(setButtonLoading(true))
    await dispatch(deleteTicket(deleteId))
    // dispatch((getLocations(filterSearch)))
    setDeleteModal(!deleteModal)
  }
  const redirectToRaisedTickets = (id, e) => {
    e.preventDefault();
    navigate(`/raisedtickets/${id}`)
  }
  return (
    <Container>
      <Row className='m-4'>
        <Col md={6} className='text-start mt-2'>
          <h4>Tickets</h4>
        </Col>
        <Col md={6} className="mt-2 text-end">
          <Button variant="primary" size="md" onClick={showAddTicket}>
            <span className="d_aic_jcc gap-2"><FaPlus/>Add Ticket</span> 
          </Button>
        </Col>
      </Row>

      <Card className='no-border-card'>
        {/* <Card.Header>
          <div className="faq-title text-start">Tickets</div>
        </Card.Header> */}
          {allTickets && allTickets?.map((ticket, id) => {
            return (
              <Card.Body key={id} onClick={(event) => { redirectToRaisedTickets(ticket.id, event) }}>
                <Col md={12}>
                  <div className="card-grid-item ticket_card">
                    <div className='card-gt-body d_aic_jcsb'>
                      <div className='avatar d_aic_jcc'>
                        <FaTicketAlt />
                      </div>
                      <div className='content d-flex align-items-center justify-content-between '>
                        <h4>
                          {ticket.title}
                          <span>{moment(ticket.created_at, "YYYYMMDD").fromNow()}</span>
                        </h4>
                        <div>
                          {ticket.status === 'new' && <Badge className='status-badges' pill bg="success">New</Badge>}
                          {/* {ticket.status === 'in-progress' && <Badge className='status-badges' pill bg="info">In-Progress</Badge>}
                          {ticket.status === 'in-review' && <Badge className='status-badges' pill bg="warning">In-Review</Badge>} */}
                          {ticket.status === 'closed' && <Badge className='status-badges' pill bg="danger">Closed</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Card.Body>
            )
          })}
      </Card>

      <Modal
        show={AddTicketDialog}
        onHide={() => setDialog(!AddTicketDialog)}
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
              <Form.Control type="text" placeholder="Ticket Title" required onChange={(e) => { setNewTicket({ ...newTicket, title: e.target.value }) }} />
            </Form.Group>
            <Form.Select required className="mb-3 mt-3" aria-label="Select" onChange={(e) => { setNewTicket({ ...newTicket, type: e.target.value }) }}>
              <option value=''>Select Type</option>
              <option value="Testing">Testing</option>
              <option value="Review">Review</option>
            </Form.Select>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Control as="textarea" rows={3} placeholder="Ticket Comments" required onChange={(e) => { setNewTicket({ ...newTicket, comment: e.target.value }) }} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDialog(!AddTicketDialog)}>
              Close
            </Button>
            <Button variant="primary" type='submit' disabled={loading}>{loading ? <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            /> : <span> Add ticket</span>}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={deleteModal}
        onHide={() => setDeleteModal(!deleteModal)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>


          {/* <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                <Form.Control as="textarea" rows={3}  placeholder="Add Announcement" />
            </Form.Group> */}


        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal(!deleteModal)}>
            Close
          </Button>
          <Button variant="primary" onClick={Delete_Ticket} disabled={loading}>{loading ? <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          /> : <span>Delete</span>}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Tickets;
