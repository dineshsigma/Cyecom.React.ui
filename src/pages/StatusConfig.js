import React, { useState, useEffect } from "react";
import { BiTrashAlt } from "react-icons/bi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { BsPlusLg } from "react-icons/bs";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {
  getStatusConfig,
  createStatusConfig,
  updateStatusConfig,
  deleteStatusConfig,
  getAllTaksStatus,
} from "../redux/reducers/statusConfigReducer";
import { getColors,priorityStatusCheck,  getPriorityConfigList
} from "../redux/reducers/priorityConfigReducer";
import { useDispatch, useSelector } from "react-redux";
import { FaEdit, FaSave, FaArrowLeft } from "react-icons/fa";
import { BiRadioCircleMarked } from "react-icons/bi";
import { toast } from "react-toastify";
import LoaderComponent from "../components/Loader";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import { useNavigate } from "react-router-dom";
import { ModalFooter } from "react-bootstrap";
import { set } from "date-fns";
import { BiMinus } from "react-icons/bi";

function StatusConfig() {
  const [prioritycolormodal, setPriorityColorModal] = useState(false);
  const [showColorSelect, setShowColorSelect] = useState(false)
  const dispatch = useDispatch();
  const [sublevelCount, setSubLevelCount] = useState(0);
  const [priorityUpdatePayload,setUpdatePriorityPayload]=useState({});
  const [priortyUpadteDeleteModal,setPriortyUpadteDeleteModal]=useState(false);
  const [priorityCount,setPriorityCount]=useState(0);
  const [showPriorityDropDown,setShowPriorityDropDown]=useState(false);
  const [deletePriorityDisable,setDeletePriorityDisable]=useState(false);
  const [priorityId,setPriorityId]=useState('');
  const [checklabel,setChecklabel]=useState('');
  const [addproxy, setstatus] = useState(false);
  const [color, setColor] = useState("#000000");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState({});
  const [showTitleEdit, setTitleEdit] = useState(false);
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [priorityCheck, setPriorityCheck] = useState();
  const colorsList = useSelector((state) => state.priority.colors)
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
  const [childColors, setChildColors] = useState([]);
  const [statusItem,setStatusItem]=useState();
  const currentOrganization = useSelector(
    (state) => state.auth.current_organization
  );
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const statusConfigList = useSelector(
    (state) => state.status.statusConfigList
  );
  const loader = useSelector((state) => state.status.loader);
  const [rowVisibility, setRowVisibility] = useState({});
  // console.log("rowVisibility",rowVisibility)
  const [plusrowVisibility, setUpsetRowVisibility] = useState({});
  const orgId = useSelector((state) => state.auth.current_organization);
  const statusList = useSelector(
    (state) => state.status.tasksStatus
);
const parentStatusList=statusList?.parents
  let statusChildList = statusList?.org_childs?.length ? statusList?.org_childs : statusList?.base_childs;
  const navigate = useNavigate();
  const [statusform, setstatusform] = useState({ name: "", color: "" });

  const editStatusConfig = (item, statusform) => {
    let getParentId=parentStatusList.filter(filter_data=>filter_data.id==item.parent_id);
     setPriorityId(getParentId[0].id)
     setPriorityCheck(item?.color);
     setRowVisibility({})
    let payload={
      type:"update",
       field:item.name,
       new_field:"",
       field_type:"status"   
      }
    dispatch(priorityStatusCheck(payload)).then(res=>{
      setPriorityCount(res.payload.statusPriorityDelCheck.response.message)
      setPriortyUpadteDeleteModal(true)
      setUpdatePriorityPayload({
        type:"update",
        field:item.name,
        new_field:"",
        field_type:"status"   
        })
    })
    setStatusItem(item)
    setTitleEdit(true);
  };

  const SaveStatusConfig = (item, statusform1) => {
    let payload = {
      name: statusform1.name?.replace(/^\s+|\s+$/gm, "")?.toLowerCase(),
      org_id: orgId,
      parent_id: item.parent_id,
      color: priorityCheck,
    };
    if (payload.name != "") {
      let statusArray = [];
      let childResponse = statusConfigList?.filter((item, index) => {
        return item.parent_id != null;
      });
     
      let newdata = childResponse.map((response) => ({ ...response }));
      if (newdata.length <= 4) {
        for (var i = 0; i < newdata.length; i++) {
          delete newdata[i]?.id;
          newdata[i].org_id = orgId;
          statusArray.push(newdata[i]);
        }
        statusArray.push(payload);
        let unique = statusChildList?.filter((item, index) => {
          return item?.name?.toLowerCase() == payload?.name.toLowerCase();
        });
        if (unique.length>=1) {
          setPriorityCheck();
          return toast.error("Status name already exits");
        }
        dispatch(createStatusConfig(statusArray)).then((res) => {
          dispatch(getStatusConfig());
          dispatch(getAllTaksStatus(orgId))
          setstatusform(statusform1);
          setTitleEdit(false);
          setPriorityCheck();
          setSubLevelCount(sublevelCount + 1);
        });
        setColor("#000000");
      } else {
        payload.is_delete = false;
        payload.id = statusform1.id;
        statusArray.push(payload);
        let priority_payload={
          type:priorityUpdatePayload.type,
          field:priorityUpdatePayload.field,
          new_field:payload.name,
          field_type:priorityUpdatePayload.field_type}
          let unique = statusChildList?.filter((item, index) => {
            return item?.name?.toLowerCase() == priority_payload?.new_field?.toLowerCase();
          });
          if (unique.length>1) {
            return toast.error("Status name already exits");
            //return setnameError(true);
          }
          dispatch(priorityStatusCheck(priority_payload)).then(res=>{
            dispatch(updateStatusConfig(statusArray)).then((response) => {
              setstatusform(statusform1);
              setTitleEdit(false);
              setPriorityCheck();
              dispatch(dispatch(getStatusConfig()));
              dispatch(getAllTaksStatus(orgId))
              setSubLevelCount(sublevelCount + 1);
            });
          })

      }
    } else {
      toast.error("Please enter sub level name");
    }
  };

  let changeHandler = (e) => {
    setstatusform({ ...statusform, [e.target.name]: e.target.value });
  };

  //Delete Dilaog functionality
  const deleteDialog = async (item, event) => {
    let getParentId=parentStatusList.filter(filter_data=>filter_data.id==item.parent_id);
    setPriorityId(getParentId[0].id)
    event.preventDefault();
    let delete_payload={
      type:"delete",
      field:item.name,
      new_field:"",
     field_type:"status" 
    }
    setUpdatePriorityPayload(delete_payload)
    dispatch(priorityStatusCheck(delete_payload)).then(res=>{
      setPriorityCount(res.payload.statusPriorityDelCheck.response.message);
      if(res.payload.statusPriorityDelCheck.response.message>0){
        setDeletePriorityDisable(true);
        setShowPriorityDropDown(true)
      }
      setDeleteId(item);
      setDeleteModal(!deleteModal);
    })
  };
  // const deleteDialog = async (item, event) => {
  //   event.preventDefault();
  //   setDeleteId(item);
  //   setDeleteModal(!deleteModal);
  // };

  //insert new status config function
  const addDialog = (substatusform, color, item, event) => {
    event.preventDefault();
    setstatus(false);
    const initialRowVisibility = {};
    statusConfigList.forEach((item, index) => {
      initialRowVisibility[index] = false;
    });
    setRowVisibility(initialRowVisibility);
    let payload = {
      name: substatusform.name?.replace(/^\s+|\s+$/gm, "")?.toLowerCase(),
      org_id: orgId,
      parent_id: item.id,
      color: priorityCheck,
    };
    if (payload.name != "") {
      let statusArray = [];
      let unique = statusChildList?.filter((item, index) => {
        return item?.name?.toLowerCase() == payload?.name?.toLowerCase();
      });
      if (unique.length >=1) {
        setPriorityCheck()
        return toast.error("Status name already exits");
      }
      let childResponse = statusConfigList?.filter((item, index) => {
        return item.parent_id != null;
      });
      let newdata = childResponse.map((response) => ({ ...response }));
      if (newdata.length <= 4) {
        for (var i = 0; i < newdata.length; i++) {
          delete newdata[i]?.id;
          newdata[i].org_id = orgId;
          statusArray.push(newdata[i]);
        }
        statusArray.push(payload);
      } else {
        statusArray.push(payload);
      }
      if(!priorityCheck) return toast.error("Please select color")
      dispatch(createStatusConfig(statusArray)).then((res) => {
        dispatch(getStatusConfig());
        setPriorityCheck();
        dispatch(getAllTaksStatus(orgId))
      });
      setColor("#000000");
      setstatusform({ name: "", color: "" });
    } else {
      toast.error("Please enter sub level name");
    }
  };

  useEffect(() => {
    dispatch(getColors())
    dispatch(getAllTaksStatus(orgId));
    dispatch(getPriorityConfigList(orgId))
  }, [])


  useEffect(() => {
    let colors = []
    statusChildList?.map((item) => {
      colors.push(item.color)
    })
    setChildColors(colors)
  }, [statusChildList])

  //get All Status records
  useEffect(() => {
    dispatch(getStatusConfig());
    const initialRowVisibility = {};
    statusConfigList.forEach((item, index) => {
      initialRowVisibility[index] = false;
    });
    setRowVisibility(initialRowVisibility);
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
  }, []);

  //plus button
  const toggleRowVisibility = (index) => {
    if (!plusrowVisibility[index]) {
      setUpsetRowVisibility({
        ...plusrowVisibility,
        [index]: !plusrowVisibility[index],
      });
    }
    setstatusform({ name: "", color: "" })
    setPriorityCheck();
    setRowVisibility({
      [index]: !rowVisibility[index],
    });
  };
  // up and down
  const UpDowntoggleRowVisibility = (index) => {
    setUpsetRowVisibility({
      ...plusrowVisibility,
      [index]: !plusrowVisibility[index],
    });
  };

  //Delete Status function

  const Delete_Status = async () => {
    let payload_deleteData = {
      id: deleteId.id,
      name: deleteId.name,
      parent_id: deleteId.parent_id,
      org_id: orgId,
      is_delete: true,
    };
    if(showPriorityDropDown){
      dispatch(priorityStatusCheck(priorityUpdatePayload)).then(res=>{
        dispatch(deleteStatusConfig(payload_deleteData)).then((res) => {
          dispatch(getStatusConfig());
          setDeleteModal(!deleteModal);
          dispatch(getStatusConfig());
          dispatch(getAllTaksStatus(orgId));
          setShowPriorityDropDown(false);
        });
      })
    }
    if(!showPriorityDropDown){
      dispatch(deleteStatusConfig(payload_deleteData)).then((res) => {
        dispatch(getStatusConfig());
        setDeleteModal(!deleteModal);
        dispatch(getStatusConfig());
        dispatch(getAllTaksStatus(orgId));
        setShowPriorityDropDown(false);
      });
    }
    
  };
const createStatusColor=(status,rowIndex,index)=>{
  setRowVisibility({[index]:rowIndex[index]})
  setPriorityColorModal(true);
  setShowColorSelect(true);
  setPriorityCheck()
  setChecklabel(status?.name)
}
  const getStatusCount = (status) => {
    let list = statusConfigList.filter((item) => item.parent_id === status);
    return list.length;
  };
  const renderStatus = (status) => {
    // item.parent_id == status.id && item.org_id
    let allStatusConfig = statusConfigList?.filter((item, index) => {
      return item?.parent_id != null && item?.parent_id == status?.id;
    });
    let originalStatusConfig = allStatusConfig.filter((item, index) => {
      return item.org_id == orgId;
    });
    if (originalStatusConfig?.length > 0)
      allStatusConfig = originalStatusConfig;


    return allStatusConfig.map(item => {
      return (
        <>
                                      <Modal
                              size="lg"
                              aria-labelledby="contained-modal-title-vcenter"
                              centered
                              show={priortyUpadteDeleteModal}
                              onHide={() => {setPriortyUpadteDeleteModal(false)}}
                              className="color-modal priority"
                            >
                              <Modal.Header closeButton>
                                <Modal.Title>Update Status</Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                <sapn>{priorityCount} tasks on this {priorityUpdatePayload.field} Priority</sapn>
                               <h6>Are you sure want to update </h6>
                              </Modal.Body>
                              <ModalFooter>
                              <Button variant="secondary" className="dark-btn" onClick={()=>setPriortyUpadteDeleteModal(false)}>No</Button>
                               <Button  className="ms-3" onClick={()=>{setTitleEdit(true);setstatusform(statusItem);setPriortyUpadteDeleteModal(false)}}>Yes</Button>
                              </ModalFooter>
                            </Modal>
          <tr>
            <td colspan="4" className="p-0 priority-listtd">
              <table className="w-90 priority-table">
                <tr
                  className="card-table pl-2 priority-color"
                  style={{
                    "border-left": `4px solid ${item.color}`,
                  }}
                >
                  <td className="w-44">

                    {showTitleEdit ? (
                      <>
                        {statusform.id == item.id ? (
                          <div className="input-wrapper">
                            <input
                              type="text"
                              name="name"
                              value={statusform.name}
                              className="underline-input"
                              placeholder="Enter text here"
                              onChange={changeHandler}
                            />
                          </div>
                        ) : (
                          <div>
                            {item?.name.charAt(0).toUpperCase() +
                              item?.name.slice(1)}{" "}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>
                          {" "}
                          <BiRadioCircleMarked
                            style={{
                              color: `${item.color}`,
                            }}
                            className="biradio-circle"
                          />
                          &nbsp;{" "}
                          {item?.name.charAt(0).toUpperCase() +
                            item?.name.slice(1)}{" "}
                        </div>
                      </>
                    )}
                  </td>
                  <td className="w-25 status-title">
                    <>
                      {(showColorSelect || showTitleEdit) && <Modal
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        show={prioritycolormodal}
                        onHide={() => { setPriorityColorModal(false); setShowColorSelect(false);}}
                        className="color-modal"
                      >
                        <Modal.Body>
                          <ul>
                            {
                              colorsList.map((item) => {
                                if (item.type == 'status') {
                                  return <li>
                                    <div className="position-relative" onClick={!childColors.includes(item.value) ? () => setPriorityCheck(item.value) : () => toast.error("Already Selected")}>
                                      <input type="radio" id="" name="options" />
                                      <label for="" style={{ backgroundColor: `${item['value']}` }}></label>
                                      {childColors.includes(item.value) ? <span></span> : priorityCheck == item.value && <span></span>}
                                    </div>
                                  </li>
                                }

                              })
                            }

                          </ul>
                          {
                            priorityCheck &&
                            <>
                              <h4>SELECTED</h4>
                              <div className="d-flex align-items-center gap-2">
                                <div className="position-relative">
                                  <input type="radio" id="option1" name="options" />
                                  <label for="option1"  style={{ backgroundColor: priorityCheck }}></label>
                                  <span></span>
                                </div>
                                <h6 className="m-0">{priorityCheck}</h6>
                              </div>
                            </>
                          }

                        </Modal.Body>
                      </Modal>}
                    </>
                    {showTitleEdit ? (
                      <>
                        {statusform.id == item.id ? (
                          <div>
                            <div className="position-relative" onClick={() => {setPriorityColorModal(true);setPriorityCheck(item.color)}}>
                              <input type="radio" id="" name="options" />
                              <label for="" style={{ backgroundColor: item.color }}></label>
                            </div>
                            {/* <Modal
                              size="lg"
                              aria-labelledby="contained-modal-title-vcenter"
                              centered
                              show={prioritycolormodal}
                              onHide={() => setPriorityColorModal(false)}
                              className="color-modal"
                            >
                              <Modal.Body>
                                <ul>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options" checked/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options"/>
                                      <label htmlFor=""></label> 
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options"/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options"/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options"/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options"/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options" checked/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options" checked/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options" checked/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options" checked/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options" checked/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id=""  name="options" checked/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options" checked/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options" checked/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options" checked/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="position-relative">
                                      <input type="radio" id="" name="options" checked/>
                                      <label htmlFor=""></label>
                                      <span></span>
                                    </div>
                                  </li>
                                </ul>
                                <h4>SELECTED</h4>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="position-relative">
                                    <input type="radio" id="option1" name="options" />
                                    <label htmlFor="option1"></label>
                                    <span></span>
                                  </div>
                                  <h6 className="m-0">#deddedededede</h6>
                                </div>
                              </Modal.Body>
                            </Modal> */}
                          </div>
                        ) : (
                          // <div>
                          //   <Form.Label htmlFor="exampleColorInput"></Form.Label>
                          //   <Form.Control
                          //     type="color"
                          //     id="exampleColorInput"
                          //     defaultValue={statusform.color}
                          //     className="underline-input"
                          //     disabled="false"
                          //     title="Choose your color"
                          //     value={item.color}
                          //   />{" "}
                          // </div>
                          <div className="position-relative">
                            <input type="radio" id="" name="options" />
                            <label htmlFor="" style={{ backgroundColor: item.color }}></label>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* <div>
                          <Form.Control
                            type="color"
                            id="exampleColorInput"
                            defaultValue={statusform.color}
                            className="underline-input"
                            disabled="false"
                            title="Choose your color"
                            value={item.color}
                          />{" "}
                        </div> */}
                        <div className="position-relative" onClick={() => {setPriorityColorModal(true);setPriorityCheck(item.color)}}>
                          <input type="radio" id="" name="options" />
                          <label htmlFor="" style={{ backgroundColor: item.color }}></label>
                        </div>
                      </>
                    )}
                  </td>
                  <td>
                    <div className="tb-actions d-flex align-item-center justify-content-start">
                      {showTitleEdit ? (
                        <>
                          {statusform.id == item.id ? (
                            <button id="editDraftBtn" className="btn-tl-actions" onClick={() => SaveStatusConfig(item, statusform)}>
                              <FaSave />
                            </button>
                          ) : (
                            <FaEdit
                              onClick={() =>
                                editStatusConfig(item, statusform, color)
                              }
                            />
                          )}
                        </>
                      ) : (
                        <button
                          id="editDraftBtn"
                          className="btn-tl-actions"
                          onClick={() =>
                            editStatusConfig(item, statusform, color)
                          }
                        >
                          <FaEdit />
                        </button>
                      )}
                      <button
                        id="taskDelete"
                        className="btn-tl-actions"
                        onClick={(event) => deleteDialog(item, event)}
                      >
                        {getStatusCount(status.id) > 2 && <BiTrashAlt />}
                      </button>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </>
      );
    });
  };
  return (
    <div>
      {loader ? (
        <LoaderComponent />
      ) : (
        <>
          <section className="breadcum_section priority-table">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-12">
                  <div className="d-flex align-items-center gap-3 masterback-btn">
                    <Button
                      className="primary_btn white_btn d-flex align-items-center justify-content-center"
                      variant="light"
                      size="md"
                      onClick={() => navigate("/master")}
                    >
                      <FaArrowLeft />
                    </Button>
                    <h2 className="bs_title">Status Configuration</h2>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section>
            <div className="container-fluid">
              <div className="row">
                <div className="col-lg-12">
                  <table className="table table-style2 priority-table">
                    <thead>
                      <tr>
                        <th>Status Name</th>
                        <th></th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(statusConfigList) &&
                        statusConfigList?.map((status, index) => {
                          return (
                            <>
                              {status.org_id == 0 &&
                                status.parent_id == null && (
                                  <>
                                    <tr className="card-table" key={index}>
                                      <td>
                                        {/* <BiRadioCircleMarked style={{ "color": `${status.color}` }} className="biradio-circle" /> &nbsp; */}
                                        <div  className="d-flex align-items-center gap-2">
                                          <div className="priority-name status-name">
                                            {status?.name
                                              .charAt(0)
                                              .toUpperCase() +
                                              status?.name.slice(1)}
                                          </div>
                                          <div>
                                            {plusrowVisibility[index] ? getStatusCount(status.id) > 0 && 
                                              (<FaChevronDown className="chev-up" onClick={() => UpDowntoggleRowVisibility(index)}/>)
                                              : getStatusCount(status.id) > 0 &&
                                                (<FaChevronDown className="chev-down" onClick={() =>{ UpDowntoggleRowVisibility(index)}}/>)
                                            }
                                          </div>
                                        </div>  
                                      </td>
                                      
                                      <td>
                                        {/* <Form.Control
                                                                        type="color"
                                                                        id="exampleColorInput"
                                                                        defaultValue={status.color}
                                                                        className="underline-input"
                                                                        disabled="false"
                                                                        title="Choose your color" value={status.color}
                                                                    /> */}
                                      </td>
                                      <td>
                                        {status.name != "closed" &&
                                        <div className="tb-actions">
                                          <button
                                            id="taskDetails"
                                            className="btn-tl-actions"
                                            onClick={() =>
                                              toggleRowVisibility(index)
                                            }
                                          >
                                            {plusrowVisibility[index] && rowVisibility[index] ?
                                              <BiMinus/> : <BsPlusLg />
                                            }
                                          </button>
                                        </div>
                                      }
                                      </td>
                                    </tr>

                                    {plusrowVisibility[index] && (
                                      <>
                                        {renderStatus(status)}
                                        <>
                                          {rowVisibility[index] && (
                                            <tr>
                                              <td
                                                colspan="4"
                                                className="p-0 priority-listtd"
                                              >
                                                <table className="w-90">
                                                  <tr
                                                    className="card-table pl-2 priority-color"
                                                    // style={{
                                                    //   "border-left": `4px solid ${color}`,
                                                    // }}
                                                  >
                                                    <td className="w-40-status">
                                                      <div className="input-wrapper">
                                                        <input
                                                          type="text"
                                                          name="name"
                                                          value={
                                                            statusform.subname
                                                          }
                                                          className="underline-input"
                                                          placeholder="Enter status"
                                                          onChange={changeHandler}
                                                        />
                                                      </div>
                                                    </td>
                                                    <td >
                                                    <div className="position-relative" onClick={()=>createStatusColor(status,rowVisibility,index)}>
                                                          <input type="radio" id="" name="options" />
                                                          <label for="" style={{backgroundColor:status?.name ==checklabel &&priorityCheck}}></label>
                                                        </div>
                                                      {/* <div>
                                                        <Form.Control
                                                          type="color"
                                                          id="exampleColorInput"
                                                          defaultValue="#563d7c"
                                                          title="Choose your color"
                                                          value={color}
                                                          onChange={(e) =>
                                                            setColor(
                                                              e.target.value
                                                            )
                                                          }
                                                        />
                                                     
                                                      </div> */}
                                                    </td>
                                                    <td>
                                                      <div className="tb-actions d-flex align-item-center justify-content-start">
                                                        <button
                                                          id="taskDelete"
                                                          className="btn-tl-actions"
                                                          onClick={(event) =>
                                                            addDialog(
                                                              statusform,
                                                              priorityCheck,
                                                              status,
                                                              event
                                                            )
                                                          }
                                                        >
                                                          <FaSave />
                                                        </button>
                                                      </div>
                                                    </td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                          )}
                                        </>
                                      </>
                                    )}
                                  </>
                                )}
                            </>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
      {/* //pop up model for delete priority  start here */}
      {/* <Modal
        show={deleteModal}
        onHide={() => setDeleteModal(!deleteModal)}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Status configuration will be Deleted Permanently
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="closeBtn"
            variant="secondary"
            onClick={() => setDeleteModal(!deleteModal)}
          >
            Close
          </Button>
          <Button
            id="confirmDeleteBtn"
            variant="primary"
            onClick={() => Delete_Status()}
          >
            {" "}
            Delete
          </Button>
        </Modal.Footer>
      </Modal> */}
      <Modal
        show={deleteModal}
        onHide={() => {
          setDeleteModal(!deleteModal);
          setDeletePriorityDisable(false);
          setShowPriorityDropDown(false);
        }}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete priority</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>Priority configuration will be Deleted Permanently</h6>
          <h6>
            {priorityCount} tasks on this {priorityUpdatePayload.field} Priority
          </h6>
          <h6>Are you sure want to Delete </h6>
          {showPriorityDropDown && (
            <Form>
              <Form.Group className="formGroup" controlId="formTicketTitle">
                <Form.Label className="star">
                  Priority options<b>{" "}*</b>
                </Form.Label>
                <Form.Select
                  required
                  aria-label="Select"
                  onChange={(e) => {
                    setUpdatePriorityPayload({
                      ...priorityUpdatePayload,
                      new_field: e.target.value,
                    });
                    setDeletePriorityDisable(false);
                  }}
                >
                  <option value="" selected disabled>
                    Choose option
                  </option>
                  {statusChildList?.map((item) => {
                    if (
                      item.parent_id == priorityId &&
                      priorityUpdatePayload.field != item.name
                    ) {
                      return <option value={item?.name}>{item?.name}</option>;
                    }
                  })}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="closeBtn"
            variant="secondary"
            onClick={() => {
              setDeleteModal(!deleteModal);
              setDeletePriorityDisable(false);
              setShowPriorityDropDown(false);
            }}
          >
            Close
          </Button>
          <Button
            id="confirmDeleteBtn"
            variant="primary"
            onClick={() => Delete_Status()}
            disabled={deletePriorityDisable}
          >
            {" "}
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default StatusConfig;
