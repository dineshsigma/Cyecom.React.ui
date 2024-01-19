import { Image, Navbar } from "react-bootstrap";
import Container from 'react-bootstrap/Container';
import CyecomShort from '../assets/CyecomShort.png';

function SignUpLayout({heading,children}){
    return(
        <>
            <Navbar bg="light" expand="lg">
                <Container fluid>
                    <Navbar.Brand href="/" className="border-end pe-2">
                        <Image src={CyecomShort} height={50} />
                    </Navbar.Brand>
                    <Navbar.Collapse id="navbarScroll">
                        <h6><b>{heading}</b></h6>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            {children}
        </>
    )
}

export default SignUpLayout;