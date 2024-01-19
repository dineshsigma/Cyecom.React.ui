import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Popover from "react-bootstrap/Popover";
function Avatar(props) {
  let sizes = { large: "48px", medium: "40px", small: "24px" };
  const avatar = {
    width: props.size ? sizes[`${props.size}`] : "32px",
    height: props.size ? sizes[`${props.size}`] : "32px",
    background: props.color ? `var(${props.color})` : "var(--br-default)",
    borderRadius: "100%",
    border: "1px solid white",
  };
  const avatarImg = {
    width: props.size ? sizes[`${props.size}`] : "32px",
    height: props.size ? sizes[`${props.size}`] : "32px",
    borderRadius: "100%",
    border: "1px solid white",
  };
  return (
    <>
      {/* <div className="avatarStyle"> */}
      <OverlayTrigger
        overlay={
          props?.name?.length > 0 && props?.lastname?.length > 0 ? (
            <Tooltip>
              {props?.name} {props?.lastname}
            </Tooltip>
          ) : (
            <></>
          )
        }
      >
        {props.image ? (
          <div className="d_aic_jcc">
            <img style={avatarImg}src={props.image}/>
          </div>
        ) : (
          <div
            style={avatar}
            className="d-flex align-items-center justify-content-center text-center"
          >
            <span>{props.initials}</span>
          </div>
        )}
      </OverlayTrigger>
      {/* </div> */}
    </>
  );
}
export default Avatar;
