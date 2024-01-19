import Avatar from '../components/Avatar'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Popover from 'react-bootstrap/Popover';


function AvatarStack(props) {
    const size = props.avatars?.length - props?.limit;
    const popover = (
        <Popover id="popover-positioned-bottom">
            <Popover.Body>
                <ul className='p-0 m-0'>
                    {props.avatars?.slice(5).map((item,index) => {
                        return (
                                <li key={index}>{item.name} {item.lastname}</li>
                        )
                    })}
                </ul>
            </Popover.Body>
        </Popover>
    );

    return (
        <ul className='avatar-stack' >
            <OverlayTrigger
                overlay={
                    <Tooltip>
                        {props.avatars[0]?.name} {props.avatars[0]?.lastname}
                    </Tooltip>
                }
            >
                <li className='avatarStyle'>
                    <Avatar color={props.avatars[0]?.color} initials={`${props.avatars[0]?.name.substring(0, 1).toUpperCase()}${props.avatars[0]?.lastname.substring(0, 1).toUpperCase()}`} image={props.avatars[0]?.avatar}/>
                </li>
            </OverlayTrigger>
            {props.avatars.slice(1, props.limit).map((avatar, i) => (
                <OverlayTrigger
                    overlay={
                        <Tooltip>
                            {avatar.name} {avatar.lastname}
                        </Tooltip>
                    }
                >
                    <li className='avatarStyle' key={i}>
                        <Avatar
                            color={avatar.color}
                            initials={`${avatar.name.substring(0, 1).toUpperCase()}${avatar.lastname.substring(0, 1).toUpperCase()} `}
                            image={avatar.avatar}
                        />
                    </li>
                </OverlayTrigger>
            ))}
            {size > 1 && (
                <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" overlay={popover}><li className='avatarStyle'>
                    <Avatar initials={`+${size}`} />
                </li></OverlayTrigger>
                // <div className='avatarStyle' >
                //     <Avatar initials={`+${size}`} />
                // </div>

            )}
        </ul>
    );
}

export default AvatarStack;
