import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function SignupCard({img, title, description}){
    const navigate = useNavigate();
    return(
        <Card className="text-center mx-auto p-3" style={{ width: '20rem' }}>
            <Card.Img variant="top" src={img} />
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text>
                    {description}
                </Card.Text>
                <Button color="primary" onClick={()=>navigate('/signup/userdetails')} className="rounded-pill px-5">Continue</Button>
            </Card.Body>    
        </Card>
    )
}

export default SignupCard;