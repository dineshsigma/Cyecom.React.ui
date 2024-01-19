import React from "react";
import moment from "moment";
import { ImAttachment } from "react-icons/im";
import { BiCommentDetail } from "react-icons/bi";
import { Line } from 'rc-progress';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
export default function Card(props) {
  const navigate = useNavigate();
  const statusConfigList = useSelector(
    (state) => state.status.statusConfigList
  );
  let details = props.cardDetails
  let statusColor;
  let percentage = details.subtaskClosedCount / details.totalSubtaskCount * 100
  let allStatusConfig = statusConfigList?.filter((item, index) => { return item?.parent_id != null })
  allStatusConfig?.map((status, statuskey) => {
    if (details.internal_status === status.name) {
      statusColor = status.color
    }

  })

  return (
    <div className="board-vie-card" onClick={(event) => navigate(`/taskdetails/${details.id}`)}>
      {details.description && <div className="bvcard_des" dangerouslySetInnerHTML={{__html: details.description,  }}></div>}
      {!details.description && <div className="bvcard_des"><p>N/A</p></div>}
      <div className="d_aic_jcsb mb-1">
        <p className="m-0"><strong>{details.task_code}</strong></p>
        <h6 className="m-0">{details.subtaskClosedCount}/{details.totalSubtaskCount}</h6>
      </div>
      <div className="d_aic_jcsb mb-3">
        <Line percent={percentage} strokeWidth={2} trailWidth={2} strokeColor="lightgreen" />
      </div>
      <div className="d_aic_jcsb">
        <div className="change-passwordz date-card">
          {moment(new Date(details.due_date)).format("ddd, MMM DD, YYYY, h:mm A")}
        </div>
        <div className="d_aic_jcsb gap-2">
          <div className="m-0"><span className="me-1"><BiCommentDetail /></span>{details.commentCount}</div>
          <div className="m-0"><span className="me-1"><ImAttachment /></span>{details.attachmentCount}</div>
        </div>
      </div>
    </div>
  );
}