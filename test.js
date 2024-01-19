import React, { useState, useEffect } from 'react';
import { Table, Accordion, Card, Row, Col, Container } from 'react-bootstrap';
import { BiLinkExternal, BiTrashAlt, BiEditAlt } from "react-icons/bi";
import { BsCircle } from "react-icons/bs";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { MdOutlineExpandLess,MdOutlineCircle } from "react-icons/md"
import Dropdown from 'react-bootstrap/Dropdown';
import { BsPlusLg } from "react-icons/bs";
import { CgShapeCircle } from "react-icons/cg";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import { getpriorityConfig, createpriorityConfig, updatepriorityConfig, deletepriorityConfig } from '../redux/reducers/priorityConfigReducer';
import { useDispatch, useSelector } from 'react-redux';
import { FaEdit, FaSearch, FaSave } from "react-icons/fa";
function PriorityConfig() {
  const dispatch = useDispatch();
  const [sublevelCount, setSubLevelCount] = useState(0);
  let [show, setShow] = useState(false);
  const [addproxy, setproxy] = useState(false);
  const [rgb, setrgb] = useState(false)
  const [color, setColor] = useState('#000000');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState({});
  const [showTitleEdit, setTitleEdit] = useState(false);
  const getPriorityList = useSelector((state) => state.priority.priorityConfigList)
  const [rowVisibility, setRowVisibility] = useState({});
  const [rowVisibility1, setUpsetRowVisibility] = useState({});
  const [upRowVisibility, setupRowVisibility] = useState({});
  const [editData, setEditData] = useState(null);
  const orgId = useSelector((state) => state.auth.current_organization)
  const deleteResponse = useSelector((state) => state.priority.deletepriorityConfig)
  const [priorityform, setPriorityForm] = useState({
    "name": "",
    "color": ""

  })
  const editPriorityConfig = (item, priorityform) => {
    setTitleEdit(true);
    setPriorityForm(item);
  }

  const SavepriorityConfig = (item, priorityform1, color) => {
    let payload = {
      "id": priorityform1.id,
      "name": priorityform1.name,
      "org_id": orgId,
      "parent_id": priorityform1.id,
      "is_delete": false,
      "color": color
    }
    dispatch(updatepriorityConfig(payload)).then((response) => {
      setPriorityForm(priorityform1);
      setTitleEdit(false);
      dispatch(getpriorityConfig())
      setSubLevelCount(sublevelCount + 1)
    })
  }

  let changeHandler = e => {
    setPriorityForm({ ...priorityform, [e.target.name]: e.target.value })
  }
  const deleteDialog = async (item, event) => {
    event.preventDefault();
    setDeleteId(item)
    setDeleteModal(!deleteModal)
  }
  const addDialog = (subpriorityform, color, item, event) => {
    console.log("item----",item)
    event.preventDefault();
    setproxy(false);
    const initialRowVisibility = {};
    getPriorityList.forEach((item, index) => {
      initialRowVisibility[index] = false;
    });
    setRowVisibility(initialRowVisibility);
    let payload =
    {
      "name": subpriorityform.name,
      "org_id": orgId,
      "parent_id": item.id,
      "color": color
    }
    console.log("paylosd--",payload);
    dispatch(createpriorityConfig(payload)).then((res) => {
      dispatch(getpriorityConfig())
    });
  }

  useEffect(() => {
    dispatch(getpriorityConfig())
    const initialRowVisibility = {};
    getPriorityList.forEach((item, index) => {
      initialRowVisibility[index] = false;
    });
    setRowVisibility(initialRowVisibility);
  }, [])


  //plus button
  const toggleRowVisibility = (index) => {
    if (!rowVisibility1[index]) {
      setUpsetRowVisibility({
        ...rowVisibility1,
        [index]: !rowVisibility1[index]
      });
    }


    setRowVisibility({
      ...rowVisibility,
      [index]: !rowVisibility[index]
    });

  };
  // up and down 
  const UpDowntoggleRowVisibility = (index) => {
    setUpsetRowVisibility({
      ...rowVisibility1,
      [index]: !rowVisibility1[index]
    });

  };


  const Delete_Task = async () => {
    let payload_deleteData = {
      "id": deleteId.id,
      "name": deleteId.parent_name,
      "parent_id": deleteId.name,
      "org_id": orgId,
      "is_delete": true
    }
    dispatch(deletepriorityConfig(payload_deleteData)).then((res) => {
      dispatch(getpriorityConfig())
      setDeleteModal(!deleteModal)
      dispatch(getpriorityConfig())
    });

  }
  const getPriorityCount = (priority) => {
    let list = getPriorityList.filter((item) => item.parent_name === priority)
    return list.length
  }
  return (
    <>
      <section className="mb-3 priority-table">
        <div className="container-fluid">
          <div className="row m-3">
            <div>
              <h2 >Priority Configuration Settings</h2>
            </div>
            <div className="col-md-12">
              <div className="table-responsivez">
                <table className="table table-style2">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>No Sub Levels</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* // priority table iterate here  and match org_id ==0 */}
                    {getPriorityList?.map((priority, index) => {
                      return (
                        <>
                          {
                            priority.org_id == 0 && <>
                              <tr className="card-table" key={index} style={{ "border-left": `4px solid ${priority.color}` }}>
                                <td className="d-flex">
                                  <div><CgShapeCircle className='priority-circle-icon' /> &nbsp;</div>
                                  <div className='priority-name'>{priority.name}</div>&nbsp;

                                  <a>
                                    {rowVisibility1[index] ? <FaChevronUp onClick={() => UpDowntoggleRowVisibility(index)} /> : <FaChevronDown onClick={() => UpDowntoggleRowVisibility(index)} />}

                                  </a>
                                </td>
                                <td>
                                  <div className="tn">{getPriorityCount(priority.name)}</div>
                                </td>
                                <td>
                                  <div className="tn">
                                    <BsPlusLg onClick={() => toggleRowVisibility(index)}>

                                      {rowVisibility[index] ? "Hide" : "Show"}
                                    </BsPlusLg>
                                  </div>
                                </td>
                              </tr>
                              <>
                              {/* //get priority list parentname with their sub levels start there */}
                                {rowVisibility1[index] && (
                                  <>
                                  {/* // get parent name with their childrens eg: critical(parent) and child as critical high,critical medium */}
                                    {getPriorityList.map((item, key1) => {
                                      {
                                       // match partent_name and child name inner table starts hear --------
                                        return item.parent_id == priority.id ?
                                        <tr>
                                          <td colspan='4'>
                                            <table className='w-100'>
                                         <tr className="card-table pl-2 priority-color" style={{ "border-left": `4px solid ${item.color}` }}   >
                                          <td className='w-40'>
                                            {showTitleEdit ? <>{priorityform.id == item.id ? (<div className="input-wrapper">
                                              <input type="text" name="name" value={priorityform.name} className="underline-input" placeholder="Enter text here" onChange={changeHandler} />
                                            </div>) : <div >{item.name} </div>}</> : (
                                              <>
                                                <div ><CgShapeCircle className='priority-circle-icon' /> &nbsp; {item.name} </div>
                                              </>
                                            )}
                                          </td>
                                          <td className='w-30'>
                                            {showTitleEdit ? <>{priorityform.id == item.id ? (<div className="input-wrapper">
                                              <Form.Control
                                                type="color"
                                                id="exampleColorInput"
                                                defaultValue={priorityform.color}
                                                title="Choose your color" value={priorityform.color} onChange={(e) => setColor(e.target.value)}
                                              />
                                            </div>) : <div>
                                              <Form.Control
                                                type="color"
                                                id="exampleColorInput"
                                                defaultValue={priorityform.color}
                                                className="underline-input"
                                                disabled="false"
                                                title="Choose your color" value={item.color}
                                              />  </div>}</> : (
                                              <>
                                                <div>
                                                  <Form.Control
                                                    type="color"
                                                    id="exampleColorInput"
                                                    defaultValue={priorityform.color}
                                                    className="underline-input"
                                                    disabled="false"
                                                    title="Choose your color" value={item.color}
                                                  /> </div>
                                              </>
                                            )}
                                          </td>
                                          <td>
                                            <div className='tb-actions d-flex align-item-center justify-content-start'>
                                              {
                                                showTitleEdit ? <>{priorityform.id == item.id ? (<button id='editDraftBtn' className="btn-tl-actions" onClick={() => SavepriorityConfig(item, priorityform, color)} ><FaSave /></button>) : <FaEdit onClick={() => editPriorityConfig(item, priorityform, color)} />}</> : <button id='editDraftBtn' className="btn-tl-actions" onClick={() => editPriorityConfig(item, priorityform, color)} ><FaEdit /></button>
                                              }
                                              <button id='taskDelete' className="btn-tl-actions" onClick={(event) => deleteDialog(item, event)}>
                                                <BiTrashAlt />
                                              </button>
                                            </div>
                                          </td>
                                        </tr> 
                                        </table>
                                        </td>
                                        </tr>
                                        : ""
                                      }
                                    })}
                                  </>
                                )}
                                 {/* //get priority list parentname with their sub levels end there */}
                                {/* //* Add  new Priority Data starts */}
                              </>
                              <>
                                {rowVisibility[index] && <tr className="card-table">
                                  <td>
                                    <div>Enter Sub type</div>
                                    <div className="input-wrapper">
                                      <input type="text" name="name" value={priorityform.subname} className="underline-input" placeholder="Enter text here" onChange={changeHandler} />
                                    </div>
                                  </td>
                                  <td>
                                    <div>
                                      <Form.Label htmlFor="exampleColorInput">Color picker</Form.Label>
                                      <Form.Control
                                        type="color"
                                        id="exampleColorInput"
                                        defaultValue="#563d7c"
                                        title="Choose your color" value={color} onChange={(e) => setColor(e.target.value)}
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div className='tb-actions d-flex align-item-center justify-content-start'>
                                      <button id='taskDelete' className="btn-tl-actions" onClick={(event) => addDialog(priorityform, color, priority, event)}>
                                        <FaSave />
                                      </button>
                                    </div>
                                  </td>
                                </tr>}</>
                                 {/* //* Add  new Priority Data ends */}
                            </>
                          }
                        </>
                      )
                    })}
                    {/* //priority table ends here */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* //pop up model for delete priority  */}
      <Modal
        show={deleteModal}
        onHide={() => setDeleteModal(!deleteModal)}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete proxy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          configartion  will be Deleted Permanently
        </Modal.Body>
        <Modal.Footer>
          <Button id='closeBtn' variant="secondary" onClick={() => setDeleteModal(!deleteModal)}>
            Close
          </Button>
          <Button id='confirmDeleteBtn' variant="primary" onClick={() => Delete_Task()} > Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  )

}

export default PriorityConfig