import React, { useState, useEffect } from "react";
import { BiTrashAlt } from "react-icons/bi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { BsPlusLg } from "react-icons/bs";
import { CgShapeCircle } from "react-icons/cg";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {
  getpriorityConfig,
  createpriorityConfig,
  updatepriorityConfig,
  deletepriorityConfig,
  getColors,
  priorityStatusCheck,
  getPriorityConfigList
} from "../redux/reducers/priorityConfigReducer";
import { useDispatch, useSelector } from "react-redux";
import { FaEdit, FaSearch, FaSave, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import LoaderComponent from "../components/Loader";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import { useNavigate } from "react-router-dom";
import { yellow } from "@mui/material/colors";
import { BiMinus } from "react-icons/bi";
import { BiRadioCircleMarked } from "react-icons/bi";

function PriorityConfig() {
  const [prioritycolormodal,setPriorityColorModal] = useState(false);
  const [showColorSelect,setShowColorSelect]=useState(false)
  const dispatch = useDispatch();
  const [sublevelCount, setSubLevelCount] = useState(0);
  const [addproxy, setpriority] = useState(false);
  const [color, setColor] = useState("#000000");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState({});
  const [showTitleEdit, setTitleEdit] = useState(false);
  const [priorityCheck,setPriorityCheck]=useState();
  const [priorityValue,setPriorityValue]=useState('');
  const [priorityId,setPriorityId]=useState('');
  const [deletePriorityDisable,setDeletePriorityDisable]=useState(false);
  const [checklabel,setChecklabel]=useState('');
  const [priorityCount,setPriorityCount]=useState(0);
  const [priortyUpadteDeleteModal,setPriortyUpadteDeleteModal]=useState(false);
  const [priorityItem,setPriortyItem]=useState('');
  const getPriorityList = useSelector(
    (state) => state.priority.priorityConfigList
  );
  const colorsList=useSelector((state)=>state.priority.colors);
  const loader = useSelector((state) => state.priority.loader);
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
  const currentOrganization = useSelector(
    (state) => state.auth.current_organization
  );
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const [rowVisibility, setRowVisibility] = useState({});
  const [plusrowVisibility1, setUpsetRowVisibility] = useState({});
  const [priorityUpdatePayload,setUpdatePriorityPayload]=useState({});
  const [showPriorityDropDown,setShowPriorityDropDown]=useState(false);
  const [childColors,setChildColors]=useState([]);
  // console.log("childColors",childColors)
  const orgId = useSelector((state) => state.auth.current_organization);
  const priorityChildConfig_List=useSelector((state)=>state.priority.priorityChildList);
  // console.log("priorityChildConfig_List",priorityChildConfig_List)
  const getParentPriority_List=useSelector((state)=>state.priority.priorityParentList);
  const navigate = useNavigate();
  const [priorityform, setPriorityForm] = useState({ name: "", color: "" });
  //To Edit Priority
  const editPriorityConfig = (item, priorityform) => {
    let getParentId=getParentPriority_List.filter(filter_data=>filter_data.id==item.parent_id);
    setPriorityCheck(item?.color);
    setPriorityId(getParentId[0].id)
    setPriorityValue(getParentId[0].name)
    setRowVisibility({})
    let payload={
        type:"update",
         field:item.name,
         new_field:"",
         field_type:"priority"   
        }
      dispatch(priorityStatusCheck(payload)).then(res=>{
        setPriorityCount(res.payload.statusPriorityDelCheck.response.message)
        setPriortyUpadteDeleteModal(true)
        setUpdatePriorityPayload({
          type:"update",
          field:item.name,
          new_field:"",
          field_type:"priority"   
          })
      })
      setPriortyItem(item)
  };
  //To create new priority and to update priority
  const SavepriorityConfig = (item, priorityform1, color) => {
    let payload = {
      name: priorityform1.name.replace(/^\s+|\s+$/gm, "")?.toLowerCase(),
      org_id: orgId,
      parent_id: item.parent_id,
      color: priorityCheck,
    }; 
    if (payload.name != "") {
      let priorityArray = [];
      let childResponse = getPriorityList?.filter((item, index) => {
        return item.parent_id != null;
      });
      let unique = priorityChildConfig_List?.filter((item, index) => {
        return item?.name?.toLowerCase() == payload?.name.toLowerCase();
      });
      if (unique.length>1) {
        return toast.error("Priority name already exits");
      }
      let newdata = childResponse.map((response) => ({ ...response }));
      if (newdata.length <= 4) {
        for (var i = 0; i < newdata.length; i++) {
          delete newdata[i]?.id;
          newdata[i].org_id = orgId;
          priorityArray.push(newdata[i]);
        }
        priorityArray.push(payload);
          dispatch(createpriorityConfig(priorityArray)).then((res) => {
            dispatch(getpriorityConfig());
            dispatch(getPriorityConfigList(orgId))
            setPriorityForm({ name: "", color: "" });
            setTitleEdit(false);
            setSubLevelCount(sublevelCount + 1); 
          });
        // setColor("#000000");
      } else {
        payload.is_delete = false;
        payload.id = priorityform1.id;
        priorityArray.push(payload);
        let priority_payload={
          type:priorityUpdatePayload.type,
          field:priorityUpdatePayload.field,
          new_field:payload.name,
          field_type:priorityUpdatePayload.field_type}
          let unique = priorityChildConfig_List?.filter((item, index) => {
            return item?.name?.toLowerCase() == priority_payload?.new_field?.toLowerCase();
          });
          if (unique.length>1) {
            return toast.error("Priority name already exits");
          }
          dispatch(priorityStatusCheck(priority_payload)).then(res=>{
            dispatch(updatepriorityConfig(priorityArray)).then((response) => {
              setPriorityForm(priorityform1);
              setPriorityValue();
              setPriorityId()
              setTitleEdit(false);
              dispatch(getpriorityConfig());
              dispatch(getPriorityConfigList(orgId));
              setSubLevelCount(sublevelCount + 1);
            });
          })

      }
    } else {
      toast.error("Please enter sub level name");
    }
  };
  let changeHandler = (e) => {
    setPriorityForm({ ...priorityform, [e.target.name]: e.target.value });
  };

  //confirmation to get priority delete
  const deleteDialog = async (item, event) => {
    let getParentId=getParentPriority_List.filter(filter_data=>filter_data.id==item.parent_id);
    setPriorityId(getParentId[0].id)
    event.preventDefault();
    let delete_payload={
      type:"delete",
      field:item.name,
      new_field:"",
     field_type:"priority" 
    }
    setUpdatePriorityPayload(delete_payload)
    dispatch(priorityStatusCheck(delete_payload)).then(res=>{
      setPriorityCount(res.payload.statusPriorityDelCheck.response.message);
      if(res.payload.statusPriorityDelCheck.response.message>0){
        setDeletePriorityDisable(true);
        setShowPriorityDropDown(true);
        dispatch(getPriorityConfigList(orgId));
      }
      setDeleteId(item);
      setDeleteModal(!deleteModal);
    })
  };
  const addDialog = (subpriorityform, color, item, event) => {
    event.preventDefault();
    setpriority(false);
    const initialRowVisibility = {};
    getPriorityList.forEach((item, index) => {
      initialRowVisibility[index] = false;
    });
    setRowVisibility(initialRowVisibility);
    let payload = {
      name: subpriorityform.name?.replace(/^\s+|\s+$/gm, "")?.toLowerCase(),
      org_id: orgId,
      parent_id: item.id,
      color: priorityCheck,
    };
    
    let unique = priorityChildConfig_List?.filter(item=>item?.name?.toLowerCase() == payload.name?.toLowerCase());
    if (unique.length >=1) return toast.error("Priority name already exits");
    if(!priorityCheck) return toast.error("Please select color");
    if (payload.name != "") {

      let priorityArray = [];

      let childResponse = getPriorityList?.filter((item, index) => {
        return item.parent_id != null;
      });
      let newdata = childResponse.map((response) => ({ ...response }));
      if (newdata.length <= 4) {
        for (var i = 0; i < newdata.length; i++) {
          delete newdata[i]?.id;
          newdata[i].org_id = orgId;
          priorityArray.push(newdata[i]);
        }
        priorityArray.push(payload);
      } else {
        priorityArray.push(payload);
      }

      dispatch(createpriorityConfig(priorityArray)).then((res) => {
        dispatch(getpriorityConfig());
        dispatch(getPriorityConfigList(orgId));
      });
      setPriorityForm({ name: "", color: "" });
    } else {
      toast.error("Please enter sub level name");
    }
  };

  useEffect(()=>{
    getPriorityChildList()
},[])

const getPriorityChildList=()=>{
  dispatch(getPriorityConfigList(orgId))
}
useEffect(()=>{
  let colors=[]
  priorityChildConfig_List.map((item)=>{
    colors.push(item.color)
  })
  setChildColors(colors)
},[priorityChildConfig_List])

  useEffect(() => {
    dispatch(getpriorityConfig());
    const initialRowVisibility = {};
    getPriorityList.forEach((item, index) => {
      initialRowVisibility[index] = false;
    });
    setRowVisibility(initialRowVisibility);
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
    dispatch(getColors())
  }, []);

  //plus button
  const toggleRowVisibility = (index) => {
    if (!plusrowVisibility1[index]) {
      setUpsetRowVisibility({
        ...plusrowVisibility1,
        [index]: !plusrowVisibility1[index],
      });
    }

    setRowVisibility({
      [index]: !rowVisibility[index],
    });
  };
  // up and down
  const UpDowntoggleRowVisibility = (index) => {
    setUpsetRowVisibility({
      ...plusrowVisibility1,
      [index]: !plusrowVisibility1[index],
    });
    if(rowVisibility[index]){
      setRowVisibility({
        [index]: !rowVisibility[index],
      });
    }
  };

  //Deletes the priority
  const Delete_priority = async () => {
    let payload_deleteData = {
      id: deleteId.id,
      name: deleteId.name,
      parent_id: deleteId.id,
      org_id: orgId,
      is_delete: true,
    };
    if(showPriorityDropDown){
      dispatch(priorityStatusCheck(priorityUpdatePayload)).then(res=>{
        dispatch(deletepriorityConfig(payload_deleteData)).then((res) => {
          dispatch(getpriorityConfig());
          setDeleteModal(!deleteModal);
          dispatch(getpriorityConfig());
          dispatch(getPriorityConfigList(orgId))
          setShowPriorityDropDown(false);
        });
      })
    }
    if(!showPriorityDropDown){
      dispatch(deletepriorityConfig(payload_deleteData)).then((res) => {
        dispatch(getpriorityConfig());
        setDeleteModal(!deleteModal);
        dispatch(getpriorityConfig());
        dispatch(getPriorityConfigList(orgId))
        setShowPriorityDropDown(false);
      });
    }
  };
  const getPriorityCount = (priority) => {
    let list = getPriorityList.filter((item) => item.parent_id === priority);
    return list.length;
  };
  const selectCreatePriorityColor=(priority,rowIndex,index)=>{
    setRowVisibility({[index]:rowIndex[index]})
      setPriorityColorModal(true);
      setShowColorSelect(true);
      setChecklabel(priority?.name);
      setPriorityValue(priority?.name);
  }
  const renderPriority = (priority) => {
    let data=[]
    let allpriorityConfig = getPriorityList?.filter((item, index) => {
      return item?.parent_id != null && item?.parent_id == priority?.id;
    });
    let originalPriorityConfig = allpriorityConfig.filter((item, index) => {
      return item.org_id == orgId;
    });
    if (originalPriorityConfig?.length > 0)
      allpriorityConfig = originalPriorityConfig;
      data.push(allpriorityConfig)
      
    return allpriorityConfig.map(item => {
      return (
        <>
                              <Modal
                              size="lg"
                              aria-labelledby="contained-modal-title-vcenter"
                              centered
                              show={priortyUpadteDeleteModal}
                              onHide={() => {setPriortyUpadteDeleteModal(false);setPriorityValue();setPriorityId(); setPriorityCheck();setPriorityForm({ name: "", color: "" });}}
                              className="color-modal priority"
                            >
                              <Modal.Header closeButton>
                                <Modal.Title>Update Priority</Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                <sapn>{priorityCount} tasks on this {priorityUpdatePayload.field} Priority</sapn>
                               <h6>Are you sure want to update </h6>
                               <Button onClick={()=>{setPriortyUpadteDeleteModal(false);;setPriorityValue();setPriorityId();setPriorityCheck()}}>No</Button>
                               <Button  className="ms-3" onClick={()=>{setTitleEdit(true);setPriorityForm(priorityItem);setPriortyUpadteDeleteModal(false)}}>Yes</Button>
                               
                              </Modal.Body>
                            </Modal>
          <tr>
            <td colspan="4" className="p-0 priority-listtd">
              <table className="w-90 priority-table">
                <tr
                  className="card-table pl-2 priority-color"
                  style={{ "border-left": `4px solid ${item.color}` }}
                >
                  <td className="w-40">
                    {showTitleEdit ? (
                      <>
                        {priorityform.id == item.id ? (
                          <div className="input-wrapper">
                            <input
                              type="text"
                              name="name"
                              value={priorityform?.name}
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
                          <BiRadioCircleMarked className="priority-circle-icon" style={{color: `${item.color}`,}}/>{" "}
                          &nbsp;{" "}
                          {item?.name.charAt(0).toUpperCase() +
                            item?.name.slice(1)}{" "}
                        </div>
                      </>
                    )}
                  </td>
                   
                  <td className="w-30">
                    <>
                   {(showColorSelect||showTitleEdit)&&<Modal
                              size="lg"
                              aria-labelledby="contained-modal-title-vcenter"
                              centered
                              show={prioritycolormodal}
                              onHide={() => {setPriorityColorModal(false);setShowColorSelect(false);setPriorityValue(priorityValue);setPriorityId();}}
                              className="color-modal priority"
                            >
                              <Modal.Body>
                                <ul>
                                  {
                                   colorsList.map((item)=>{
                                    if((item.type=='priority'&&item.value_type==priorityValue)){
                                      return <li>
                                      <div className="position-relative"  onClick={!childColors.includes(item.value)?()=>setPriorityCheck(item.value):()=>toast.error("Already Selected")}>
                                        <input type="radio" id="" name="options"/>
                                        <label for="" style={{backgroundColor:`${item['value']}`}}></label>
                                        {childColors.includes(item.value)?<span></span>:priorityCheck==item.value&&<span></span>}
                                      </div>
                                    </li>
                                    }
                                   
                                   }) 
                                  }
                                  
                                </ul>
                                {
                                  priorityCheck&&
                                  <>
                                   <h4>SELECTED</h4>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="position-relative"  style={{backgroundColor:priorityCheck}}>
                                    <input type="radio" id="option1" name="options" />
                                    <label for="option1"></label>
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
                        {priorityform.id == item.id ? (
                          <div>
                            <div className="position-relative"  onClick={() =>{ setPriorityColorModal(true);setPriorityCheck(priorityform.color)}}>
                              <input type="radio" id="" name="options"/>
                              <label for="" style={{backgroundColor:showTitleEdit&&priorityCheck?priorityCheck:priorityform.color}}></label>
                            </div>
                            <Modal
                              size="lg"
                              aria-labelledby="contained-modal-title-vcenter"
                              centered
                              show={prioritycolormodal}
                              onHide={() => {setPriorityColorModal(false)}}
                              className="color-modal priority"
                            >
                              <Modal.Body>
                                <ul>
                                  {
                                   colorsList.map((item)=>{
                                    if((item.type=='priority'&&item.value_type==priorityValue)){
                                      return <li>
                                      <div className="position-relative"  onClick={!childColors.includes(item.value)?()=>setPriorityCheck(item.value):()=>toast.error("Already Selected")}>
                                        <input type="radio" id="" name="options"/>
                                        <label for="" style={{backgroundColor:`${item['value']}`}}></label>
                                        {childColors.includes(item.value)?<span></span>:priorityCheck==item.value&&<span></span>}
                                      </div>
                                    </li>
                                    }
                                   }) 
                                  }
                                </ul>
                                {
                                  priorityCheck&&
                                  <>
                                   <h4>SELECTED</h4>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="position-relative">
                                    <input type="radio" id="option1" name="options" />
                                    <label for="option1" style={{backgroundColor:priorityCheck}}></label>
                                    <span></span>
                                  </div>
                                  <h6 className="m-0">{priorityCheck}</h6>
                                </div>
                                  </>
                                }
                               
                              </Modal.Body>
                            </Modal>
                          </div>
                        ) : (
                          <div className="position-relative">
                          <input type="radio" id="" name="options"/>
                          <label for=""   style={{backgroundColor:item.color}}></label>
                        </div>
                        )}
                      </>
                    ) : (
                      <>
                            <div className="position-relative">
                              <input type="radio" id="" name="options"/>
                              <label for=""  style={{backgroundColor:item.color}} ></label>
                            </div>
                      </>
                    )}
                  </td>
                  <td>
                    <div className="tb-actions d-flex align-item-center justify-content-start">
                      {showTitleEdit ? (
                        <>
                          {priorityform.id == item.id ? (
                            <button
                              id="editDraftBtn"
                              className="btn-tl-actions"
                              onClick={() =>
                                SavepriorityConfig(item, priorityform, color)
                              }
                            >
                              <FaSave />
                            </button>
                          ) : (
                            <FaEdit
                              onClick={() =>
                                editPriorityConfig(item, priorityform, color)
                              }
                            />
                          )}
                        </>
                      ) : (
                        <button
                          id="editDraftBtn"
                          className="btn-tl-actions"
                          onClick={() =>
                            editPriorityConfig(item, priorityform, color)
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
                        {getPriorityCount(priority.id) > 2 && <BiTrashAlt />}
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
                <div className="col-12">
                  <div className="d-flex align-items-center gap-3 masterback-btn">
                    <Button
                      className="primary_btn white_btn d-flex align-items-center justify-content-center"
                      variant="light"
                      size="md"
                      onClick={() => navigate("/master")}
                    >
                      <FaArrowLeft />
                    </Button>
                    <h2 className="bs_title">Priority Configuration</h2>
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
                        <th>Name</th>
                        <th></th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* // priority table iterate here  and match org_id ==0 */}
                      {Array.isArray(getPriorityList) &&
                        getPriorityList?.map((priority, index) => {
                          return (
                            <>
                              {priority.parent_id == null && (
                                <>
                                  <tr
                                    className="card-table"
                                    key={index}
                                    // style={{
                                    //   "border-left": `4px solid ${priority.color}`,
                                    // }}
                                  >
                                    <td className="d-flex align-items-center gap-2">
                                      {/* <CgShapeCircle className="priority-circle-icon" /> */}
                                      <div className="priority-name">
                                        {priority?.name
                                          ?.charAt(0)
                                          .toUpperCase() +
                                          priority?.name?.slice(1)}
                                      </div>
                                      <div>
                                        {plusrowVisibility1[index]
                                          ? getPriorityCount(priority.id) >
                                              0 && (
                                              <FaChevronDown
                                                className="chev-up"
                                                onClick={() => {
                                                  UpDowntoggleRowVisibility(
                                                    index
                                                  );
                                                  setPriorityValue("");
                                                  setPriorityCheck();
                                                  setPriorityId();
                                                }}
                                              />
                                            )
                                          : getPriorityCount(priority.id) >
                                              0 && (
                                              <FaChevronDown
                                                className="chev-down"
                                                onClick={() => {
                                                  UpDowntoggleRowVisibility(
                                                    index
                                                  );
                                                  
                                                  setPriorityCheck();
                                                  setPriorityId(priority?.id);
                                                }}
                                              />
                                            )}
                                      </div>
                                    </td>
                                    <td>
                                      <div className="tn"></div>
                                    </td>

                                    <td>
                                      <div className="tb-actions">
                                        <button
                                          id="taskDetails"
                                          className="btn-tl-actions"
                                          onClick={() => {
                                            toggleRowVisibility(index);
                                            setPriorityId(priority);
                                            setPriorityCheck();
                                            setPriorityValue(priority?.name);
                                            setTitleEdit(false);
                                          }}
                                        >
                                          {rowVisibility[index] ?
                                              <BiMinus/> : <BsPlusLg />
                                            }
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                  <>
                                    {/* //get priority list parentname with their sub levels start there */}
                                    {plusrowVisibility1[index] && (
                                      <>{renderPriority(priority)}</>
                                    )}
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
                                                <td className="w-40">
                                                  <div className="input-wrapper">
                                                    <input
                                                      type="text"
                                                      name="name"
                                                      value={
                                                        priorityform.subname
                                                      }
                                                      className="underline-input"
                                                      placeholder="Enter sub title"
                                                      onChange={changeHandler}
                                                    />
                                                  </div>
                                                </td>
                                                <td>
                                                  <div
                                                    className="position-relative"
                                                    onClick={()=>selectCreatePriorityColor(priority,rowVisibility,index)}
                                                  >
                                                    <input
                                                      type="radio"
                                                      id=""
                                                      name="options"
                                                    />
                                                    <label
                                                      for=""
                                                      style={{
                                                        backgroundColor:
                                                          priority?.name ==
                                                            checklabel &&
                                                          priorityCheck,
                                                      }}
                                                      key={priority?.name}
                                                    ></label>
                                                  </div>
                                                </td>
                                                <td>
                                                  <div className="tb-actions d_aic_jcfs">
                                                    <button
                                                      id="taskDelete"
                                                      className="btn-tl-actions"
                                                      onClick={(event) =>
                                                        addDialog(
                                                          priorityform,
                                                          color,
                                                          priority,
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
                                </>
                              )}
                            </>
                          );
                        })}
                      {/* //priority table ends here */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
      {/* //pop up model for delete priority  */}
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
                  {priorityChildConfig_List?.map((item) => {
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
            onClick={() => Delete_priority()}
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

export default PriorityConfig;
