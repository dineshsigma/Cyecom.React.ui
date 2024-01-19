import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const EmailVerified = () => {
  const navigate = useNavigate();
  return (
    <section className="email-section">
      <div className=" email">
        <div className=" email-body">
          <div className=" email-icon">
            <span>&#10003;</span>
          </div>
          <h3>Email Verified Successfully</h3>
          <h6>
            Your email has been successfully verified. You can now proceed to
            the login page.
          </h6>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate("/")}
          >
            Continue to Login
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EmailVerified;
