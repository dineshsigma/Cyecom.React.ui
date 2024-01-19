import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import Card from "react-bootstrap/Card";
import Avatar from "../components/Avatar";
import { avatarBrColors } from "../environment";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaTicketAlt } from "react-icons/fa";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";

function Help() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  useEffect(() => {
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
  }, []);
  const goToTickets = () => {
    // 👇️ navigate to /contacts
    navigate("/tickets");
  };
  return (
    <div>
      <section className="breadcum_section">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between">
            <div className="col-6">
              <h2 className="bs_title">Help</h2>
            </div>
            <div className="col-6 d-flex justify-content-end">
              <Button
                id="redirectTickets"
                className="d-flex align-items-center justify-content-center gap-2"
                variant="primary"
                size="md"
                onClick={goToTickets}
              >
                <span className="mx-1">
                  <FaTicketAlt />
                </span>
                Raised Tickets
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <Card className="border-0">
                <Card.Header>
                  <div className="faq-title text-start p-0">FAQs</div>
                </Card.Header>
                <Card.Body>
                  <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header className="shadow-none">
                        What is Cyecom?
                      </Accordion.Header>
                      <Accordion.Body>
                        Cyecom is a Task Management tool which helps any
                        individual, team, or organization to complete projects
                        efficiently by organizing and prioritizing related
                        tasks. You can monitor progress, assign tasks to
                        different team members, set deadlines and ensure that
                        work is done in an efficient, coordinated way.
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                      <Accordion.Header className="shadow-none">
                        What is Task Management?
                      </Accordion.Header>
                      <Accordion.Body>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Ut enim ad minim veniam, quis nostrud
                        exercitation ullamco laboris nisi ut aliquip ex ea
                        commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate velit esse cillum dolore eu
                        fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit
                        anim id est laborum.
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                      <Accordion.Header>
                        How to create a Ticket?
                      </Accordion.Header>
                      <Accordion.Body>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Ut enim ad minim veniam, quis nostrud
                        exercitation ullamco laboris nisi ut aliquip ex ea
                        commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate velit esse cillum dolore eu
                        fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit
                        anim id est laborum.
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Help;
