import Badge from 'react-bootstrap/Badge';

export default function StatusBadge(props) {
    const statusBadge = {
        color: props.status.color,
        border:`1px solid ${props.status.color}`

    }
    return <Badge className='statusBadge' pill style={statusBadge} >{props.status.name.charAt(0).toUpperCase() + props.status.name.slice(1)}</Badge>
}