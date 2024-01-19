import React from "react";
import {useState,useEffect} from "react";
import {Button, Modal, Form, Card} from "react-bootstrap";
import {useNavigate, useParams} from "react-router-dom";
import {getAll_ticketsComments_byid, create_Comment, update_Ticket,setDisableTaskComponent} from "../redux/reducers/supportTicketReducer.";
import {getAll_tickets} from "../redux/reducers/supportTicketReducer.";
import { getTicketAttachement,downloadAttachment,deleteTicketAttachement,updateTicketAtachement,attachmentTicketUpload,getCommentsAttachement} from "../redux/reducers/attachmentsReducer";
import {useDispatch, useSelector} from "react-redux";
import {getUsers} from "../redux/reducers/userReducer";
import {FaPlus, FaArrowLeft} from "react-icons/fa";
import {BiPencil} from "react-icons/bi"; 
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import moment from "moment";
import ReactQuill from 'react-quill';
import NoDataFound from '../assets/No_Data_File.png'
import {FaTrashAlt,FaFile,FaRegEye} from "react-icons/fa";
import { unstable_composeClasses } from "@mui/material";
import LoaderComponent from "../components/Loader";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import { modules } from '../environment';




export default function Ticket_new_Details() {
  const navigate = useNavigate();
  const param = useParams()
  const commentsList = useSelector((state) => state.tickets.getTicketsByid);
  const [selectTicket, setSelectedTicket] = useState();
  const dispatch = useDispatch();
  const [addCommentDialog, setCommentDialog] = useState(false);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const [createComment, setCreateComment] = useState("");
  const [updateTicketData,setUpdateTicket]=useState({});
  const [priorityUpdate,setPriorityupdate]=useState(false)
  const [statusUpdate,setStatusupdate]=useState(false)
  const [typeUpdate,setTypeupdate]=useState(false)
  const [attachmentData,setAttachements]=useState();
  const [showAttachment,setShowAttachment]=useState(false)
  const [attachmentLoading, setAttchmentLoading] = useState(false);
  const [AttachmentDelete,setAttachmentDelete]=useState()
  const [commentAttacments,setCommentAttachemnts]=useState([])
  const available_organizations = useSelector((state) => state.auth.available_organizations);
  const [organizationsdata,setorganizations]=useState({ data:available_organizations, name: '' })
  const currentOrganization = useSelector(
    (state) => state.auth.current_organization
  );
  const userData = useState(localStorage.getItem('userData')&&JSON.parse(localStorage.getItem('userData')));
  const loader = useSelector((state) => state.tickets.loader)
  const [file, setFile] = useState();
  const usersList = useSelector((state) => state.users.usersList);
  
  // console.log("fileeeeee",file)

  useEffect(() => {
    getTicktes()
    dispatch(getUsers(""));
    dispatch(setDisableTaskComponent(true))
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
    return () => {
      dispatch(setDisableTaskComponent(false))
     
    };
  
  }, []);
  useEffect(()=>{
    getCommentAttachment(commentsList)
   
  },[commentsList])

  const getCommentAttachment=(commentsList)=>{
   Array.isArray(commentsList)&&commentsList?.map((item)=>{
      dispatch(getCommentsAttachement({"ticket_id":parseInt(param.id),comment_id:item.id})).then((res)=>{
        if(res?.payload?.data?.ticketAttachments){
        setCommentAttachemnts((prevAttachments) => [...prevAttachments, ...res?.payload?.data?.ticketAttachments]);
        }
      })
  })
  }
  // const getCommentAttachement=()=>{
    // const getCommentAttachment = async (commentsList) => {
    //   console.log("calling..Attachments");
    
    //   for (const item of commentsList) {
    //     try {
    //       const res = await dispatch(
    //         getCommentsAttachement({
    //           "ticket_id": parseInt(param.id),
    //           comment_id: item.id,
    //         })
    //       );
          
    //       console.log("getCommentsAttachement", res.payload.data.ticketAttachments);
          
    //       setCommentAttachemnts((prevAttachments) => [
    //         ...prevAttachments,
    //         ...res.payload.data.ticketAttachments,
    //       ]);
    //     } catch (error) {
    //       console.error("Error occurred while fetching comment attachments", error);
    //     }
    //   }
    // };
    
    // setTimeout(() => {
    //   getCommentAttachment(commentsList);
    // }, 20000);
    
    
    
  // // return "Hello"
  //   //return true
  // }
  // getCommentAttachement()

  const getTicktes=()=>{
    dispatch(getUsers(""));
    dispatch(getAll_tickets("")).then((res) => {
      setSelectedTicket(res.payload?.filter((item) => item.id === parseInt(param.id)));
      dispatch(getTicketAttachement({"ticket_id":parseInt(param.id)})).then((res)=>{
        setAttachements(res.payload.data.ticketAttachments)
      })
      dispatch(
        getAll_ticketsComments_byid({ ticket_id: parseInt(param.id) })
      );
    });
   
  }

  const handleComment = (e) => {
    var htmlRegexG = /<\/?\w+>/g;
    if (e.replace(htmlRegexG, '') != "") {
      setCreateComment(e)
    }
    else {
      setCreateComment("")
    }
  }

  const fetchUser = (id) => {
    if (userDetails?.id === id) {
      return `${userDetails?.name} ${userDetails?.lastname}`
    }
  }
  //To View Attachment
  const downloadFile = (file) => {
    let body = {
      file_name: file?.file_name,
      folder_path: file?.folder_path,
    };
    dispatch(downloadAttachment(body)).then((res) => {
      window.open(res.payload);
    });
  };

  const fetchemail = (id) => {
    if (userDetails?.id === id) {
      return `${userDetails?.email}`
    }
  }
  //To delete Attachement
  const attachmentDelete = (attachmentData) => {
    const data = {
      ...attachmentData,
      is_delete: true  
    };
    const {comment_id}=attachmentData
    dispatch(deleteTicketAttachement(data)).then((res)=>{
      dispatch(getCommentsAttachement({"ticket_id":parseInt(param.id),comment_id:comment_id})).then((res)=>{
        const filterAttachments=commentAttacments?.filter(item=>item.comment_id!=comment_id)
        setCommentAttachemnts(filterAttachments);
        getTicktes()
      })
    })
  }


  const submitComment = async (e) => {
    e.preventDefault();
    // let payload = {
    //   user_type: "user",
    //   comment_type: "text",
    //   ticket_id: param.id,
    //   user_id: userDetails.id,
    //   comment: createComment,
    // };
    let payload = {
      user_type: "user",
      comment_type: "text",
      ticket_id: parseInt(param?.id),
      user_id: userDetails?.id,
      comment: createComment,
    };
    dispatch(create_Comment(payload)).then((resp)=>{
      dispatch(getAll_ticketsComments_byid({ ticket_id: parseInt(param?.id) }))
      if(parseInt(param.id)&&file){
        const attachmentObj = {
          file_name: file?.name,
          file_type: file?.type,
          file_size:file.size,
          folder_path: `org/${currentOrganization}/tickets/${parseInt(param.id)}`,
          ticket_id: parseInt(param.id),
          comment_id:resp.payload.insert_ticket_comment_one.id,
          user_id: userDetails?.id,
          org_id: currentOrganization,
          file: file,
        }
      dispatch(attachmentTicketUpload(attachmentObj)).then((res)=>{
        dispatch(getAll_ticketsComments_byid({ ticket_id: parseInt(param.id) }))
      })
      }
      else{
        dispatch(getAll_ticketsComments_byid({ ticket_id: parseInt(param.id) }))
      }
    })

    // dispatch(create_Comment(payload)).then((res) => {
    //  
    //    
    //   );
    // });
    setCreateComment("");
    setCommentDialog(!addCommentDialog)
  };

  //It Will Update Ticket Data
  const raiseTicketUpdate=(data)=>{
    dispatch(update_Ticket(data)).then((res)=>{
      getTicktes()
      setPriorityupdate(false)
      setStatusupdate(false)
      setTypeupdate(false)
    })
  }

//To Add Attachement
const addNewAttachment=(e)=>{
  e.preventDefault()
  const attachmentObj = {
    file_name: file?.name,
    file_type: file?.type,
    folder_path: `org/${currentOrganization}/tickets/${parseInt(param.id)}`,
    ticket_id: parseInt(param?.id),
    user_id: userDetails?.id,
    org_id: currentOrganization,
    file: file,
  }
 
dispatch(attachmentTicketUpload(attachmentObj)).then((res)=>{
  getTicktes()
  setShowAttachment(false)
})
}

//Sets Update Data Object
  const UpdateTicket=(e,type)=>{
      if(type=="status"){
      let data={...updateTicketData,status:e.target.value}
      const update_obj={data:data,status:'Ticket Status'}
      raiseTicketUpdate(update_obj)
    }
  
    if(type=="typ"){
      let data={...updateTicketData,type:e.target.value}
      const update_obj={data:data,status:'Category Type'}
      raiseTicketUpdate(update_obj)
    }
    if(type=="priority"){
      let data={...updateTicketData,priority:e.target.value}
      const update_obj={data:data,status:'Priority'}
      raiseTicketUpdate(update_obj)
    }
   
  }


  
  const getObjectSize = (file) => {
    const fileSizeInBytes = file?.file_size;
    const mb=fileSizeInBytes/(1024 * 1024);
    const Kpbs_data=mb.toFixed(3);
    let show_size;
    if(Math.floor(Kpbs_data)<1){
      show_size=`${Kpbs_data} KB`
    }
    if(Math.floor(Kpbs_data)>1){
      show_size=`${Kpbs_data} MB`
    }
    return <>
    <div className="d-flex justify-content-end">
      <span className="me-3 fs-10">{show_size}</span>
      <span className="me-3 fs-10">{file?.file_type}</span>
    </div>
    </>
    
    
    // console.log("fileSizeInBytes",fileSizeInBytes)
    // const fileSizeInKbps = (parseInt(fileSizeInBytes)* 8) / 1000;
    // console.log("fileSizeInKbps",fileSizeInKbps.toFixed(2))
  };
  const fetchComments=(item)=>{
    let commentData=[]
    let data=commentAttacments?.filter((com)=>com?.comment_id==item.id)
    commentData.push(data[0])
    // console.log("commentData",commentData[0])
  return <>{commentData[0]!=undefined?commentData.map((comments)=>(
    <div className="gap-2 my-3 ticket-attachments">
    <div className="d-flex align-items-center ">
    <div className="d-flex align-items-center justify-content-between gap-2">
      <FaFile className="Attachment-icon fs-3"/>
      <h4 className="m-0">{comments?.file_name}</h4>
    </div>
    <div className="d-flex justify-content-between">
      <button
        className="icon-buttons-download"
        onClick={() => downloadFile(comments)}
      >
        <FaRegEye />
      </button>
     
    </div>
   
  </div>
  {getObjectSize(comments)}</div>
  
  )):""}</>
}
//   const attachmentMap = commentsList.map((item) => ({
//     attachment: getCommentAttachement(item.id)
//   }));
// }

const getAvatar = (user_id) => {
  let usernames = usersList?.find(
    (i) => i.id == user_id
  );
  return usernames?.avatar
}

  return (  
    <div>
       {loader?<LoaderComponent /> :
       <>
         <section className="breadcum_section">
            <div className="container-fluid">
      <div className="row">
        <div className="col-6">
          <Button className="primary_btn white_btn" variant="light" size="md" onClick={() => navigate('/tickets')}>
            <FaArrowLeft className="me-2"/> Back
          </Button>
        </div>
        <div className="col-6 text-end">
          <Button className="primary_btn" variant="primary" size="md" onClick={() => setCommentDialog(!addCommentDialog)}>
            <FaPlus className="mr-2"/> Add Comment
          </Button>
        </div>
      </div> 
      </div>
      </section>

      <section>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 bg-white">
        <div className="row">
        <div className="col-lg-9 col-md-9">
          <div className="comments-section">
            {/* comments section card  for ticktes */}
            {commentsList?.length > 0 ? <>
              {
                commentsList?.map((item,index) => (
                  // console.log("Comments",item)
                  <Card className="card-shadow" key={index}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="requested-user d-flex align-items-center gap-2">
                          <div className="raise-icon">
                            {
                              item?.user_type=="user"? getAvatar(item?.user_id) != undefined || null ? <img src={getAvatar(item?.user_id)} alt="user-img" className="rounded-circle"/> : fetchUser(item.user_id).slice(0, 2) :"AD"
                              } 
                          </div>
                          <div className="user-name-email">
                            {
                                item?.user_type=="user"?<> <h5>{fetchUser(item?.user_id).toLowerCase()}</h5>
                                <h4>{fetchemail(item?.user_id)}</h4></>:<><h5>Admin</h5> <h4>admin@iipl.work</h4></>
                            }
                          </div>
                        </div>
                        <p className="commented-date">{moment(item?.created_at).format('ddd, MMM DD, YYYY, h:mm A')}</p>
                      </div>
                     
                      <div className="inbox-data mt-3">
                        <p dangerouslySetInnerHTML={{ __html: item?.comment }}></p>
                      </div>
                      <div className="d-flex">
                        {fetchComments(item)}
                      {/* {commentAttacments?.length>0?
                 commentAttacments.map((comments)=>{
                  // console.log()
                  if(item.id===comments.comment_id){
                    console.log("commnetsssssssssss",comments)
                 return(
                 
                        <div className=" d-flex justify-content-between mt-2 mb-3">
                          <div className="d-flex align-items-center">
                            <FaFile className="Attachment-icon" />

                            <h4 className="editable m-0">{comments.file_name}</h4>
                          </div>
                          <div className="">
                            <button
                              className="icon-buttons-download"
                              onClick={() => downloadFile(item)}
                            >
                              <FaRegEye />
                            </button>
                            <button
                              className="icon-buttons"
                              onClick={() => attachmentDelete(item)}
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                        )}})
                  : "No Attachements Found"} */}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
            </>
              :<div className='col-md-12 center text-center'>
                <img src={NoDataFound} height='500px' alt="NoDataFound"/>
              </div>}
          </div>
        </div>
        {/* Ticket Details Card */}
        {selectTicket?.map((item) => (
          <div className="col-lg-3 col-left p-2">
            <div className="ticket-id-details d-flex align-items-center ">
              <h4>TICKET ID</h4>
              <span className="ticket-id">{item.id}</span>
            </div>
            <Card className="no-border-card ps-0 mt-3">
              <div className="requested-user pl d-flex align-items-center gap-2">
                <div className="raise-icon">
                {getAvatar(item?.user_id) != undefined || null ? <img src={getAvatar(item?.user_id)} alt="user-img" className="rounded-circle"/> : fetchUser(item.user_id).slice(0, 2)}
                  {/* {fetchUser(item?.user_id).slice(0, 2)} */}
                </div>
                <div className="user-name-email">
                  <h5>{fetchUser(item?.user_id).toLowerCase()}</h5>
                  <h4>{fetchemail(item?.user_id)}</h4>
                </div>
              </div>
              <Card.Body className="ps-0 ticket-details">
                <div className="title-desc pl mt-2">
                  <h4>TICKET DETAILS</h4>
                  <h6 className="mt-2">{item?.title}</h6>
                  <span className="mt-3" dangerouslySetInnerHTML={{ __html: item?.comment }}></span>
                </div>
                <div className="Category-type pl mt-3  d-flex  align-items-center ticket-border" >
                  <div className="flex-grow-1 ">
                  <h4 className="mt-3">CATEGORY TYPE</h4>

                  {typeUpdate?
                  <Form.Select required aria-label="Select" onChange={(e)=>UpdateTicket(e,"typ")} defaultValue={updateTicketData.type} autoFocus>
                    <option value="Testing">Testing</option>
                    <option value="Review">Review</option>
                  </Form.Select>
                : <span>{item.type}</span>}
                </div>
                <div onClick={()=>{setTypeupdate(!typeUpdate);setUpdateTicket(item)}}><BiPencil/></div>
                </div>
                <div className="status mt-3 pl ticket-border d-flex  align-items-center ">
                <div className="flex-grow-1 ">
                  <h4 className="mt-3">STATUS</h4>
                 <Badge className="bdg-success mt-1"> <span>{item?.status}</span> </Badge>
                 </div>
                 </div>
                <div className="create-date mt-3 pl ticket-border" >
                  <h4 className="mt-3">CREATED DATE</h4>
                  <span className="created-date">{moment(item?.created_at).format('ddd, MMM DD, YYYY, h:mm A')}</span>
                </div>
                 <div className="mt-3 pl ticket-border">
                  <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mt-3">Attachments</h5>
                  <div className="taskdetail_page">
                  <button type="button"
                    className="task-description-btn"
                    onClick={() => setShowAttachment(!showAttachment)}
                  ><FaPlus className="task-description-plus-icon" /></button>
                  </div>                   
                  </div>
                  {
                    showAttachment?
                      <Form onSubmit={addNewAttachment}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Control
                          placeholder="Select File to Upload"
                          type="file"
                          required
                          onChange={(e) => setFile(e.target.files[0])}
                        />
                      </Form.Group>
                      <Button variant="primary" type="submit">
                        Add
                      </Button>
                    </Form>
                    :""
                  } 
                  <div className="assignees-card">  
                 {attachmentData?.length>0?
                 attachmentData?.map((item)=>{
                 return(
                  <div className="gap-3 align-items-center d-flex mt-2 mb-3">
                  <FaFile className="Attachment-icon" />

                  <h4 className=" m-0">{item?.file_name}</h4>
                  <div>
                  <button
                    className="icon-buttons-download"
                    onClick={() => downloadFile(item)}
                  >
                    <FaRegEye />
                  </button>
                  <button
                    className="icon-buttons"
                    onClick={() => attachmentDelete(item?.id)}
                  >
                    <FaTrashAlt />
                  </button>
                  </div>
              </div>
            );
          })
          : "No Attachments Found"}
          </div>
          </div>
              </Card.Body>

            </Card>
          </div>
        ))}
      </div>
      </div>
          </div>
      </div>
      </section>
      </>
}
      {/* Modal for adding comment */}
      <Modal show={addCommentDialog} onHide={() => setCommentDialog(!addCommentDialog)}
        keyboard="True" centered className="modal_forms">
        <Form onSubmit={(e) => submitComment(e)}>
          <Modal.Header className="add-comment-header" closeButton>
            <Modal.Title>Add Comment</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Label className='d-flex icon_space star'> Description <b>*</b></Form.Label>
            <ReactQuill theme="snow" modules={modules} formats={[]} value={createComment} className="quill-comment" onChange={handleComment} required placeholder="Enter Comment" />

            <Form.Group controlId="formFile" className="mt-3">
            <Form.Label className='d-flex icon_space star'> Add Attachment <b>*</b></Form.Label>
                        <Form.Control
                          placeholder="Select File to Upload"
                          type="file"
                          onChange={(e) => setFile(e.target.files[0])}
                        />
                </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button className="dark-btn" variant="secondary"  onClick={() => setCommentDialog(!addCommentDialog)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={createComment.trim().length === 0}>Add Comment</Button>
          </Modal.Footer> 
        </Form>
      </Modal>
    </div>
  )
}