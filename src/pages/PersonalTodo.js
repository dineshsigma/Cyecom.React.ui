import {Card, Button, Spinner, Modal, Form} from "react-bootstrap";
import {setTodoAddform,setTodoDeleteform,getTodos,setTodoButtonLoading,createTodo,deleteTodo,updateTodo,} from "../redux/reducers/todoReducer";
import {BiTrashAlt,BiPencil,BiPlus, BiX } from "react-icons/bi"; 
import {useEffect, useState } from "react";
import {useDispatch, useSelector } from "react-redux";
import {getOrganizations } from "../redux/reducers/organizationReducer";
import {getUserOrgByid } from "../redux/reducers/authReducer";
import LoaderComponent from '../components/Loader' 
import {FaPlus} from "react-icons/fa"; 
import NoDataFound from "../assets/No_Data_File.png";  
import ReactQuill from 'react-quill';

function PersonalTodo() {
  const dispatch = useDispatch();
  const [filterSearch, setFilter] = useState("");
  const available_organizations = useSelector((state) => state.auth.available_organizations);
  const [organizationsdata,setorganizations]=useState({ data:available_organizations, name: '' })
  const userData = useState(localStorage.getItem('userData')&&JSON.parse(localStorage.getItem('userData')));
  const addTodoForm = useSelector((state) => state.todo.showAddForm);
  const deleteTodoForm = useSelector((state) => state.todo.showDeleteForm);
  const [AddTodoDialog, setDialog] = useState(false);
  const [UpdateTodoItem, setTodoItem] = useState(false);
  const [showError, setShowError] = useState(false);
  const loading = useSelector((state) => state.todo.buttonLoading);
  const TodoList = useSelector((state) => state.todo.todoList);
  const done = useSelector((state) => state.todo.is_done);
  const edit = useSelector((state) => state.todo.is_edit);
  const userId = useSelector((state) => state.auth.user_id);
  const [TodoName, setTodoName] = useState("");
  const [UpdatedTodoName, setUpdatedTodoName] = useState("");
  const orgId = useSelector((state) => state.auth.current_organization); 
  const [body, setBody] = useState({ user_id: userId, org_id: orgId });
  const [todoId, setTodoId] = useState({});
  const loader = useSelector((state) => state.todo.loader)

  useEffect(() => {
    dispatch(getTodos(body));
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
  }, []);

  const onChangeTodo = (item) => {
    setTodoId(item);
    let payload = item;
    payload = { ...item, is_done: !item.is_done };
    payload = { ...payload, user_id: userId };
    dispatch(setTodoButtonLoading(true));
    dispatch(updateTodo(payload)).then(() => {
      dispatch(getTodos(body));
    });
  };

  const updateInput = (item) => {
    setTodoId(item);
    setUpdatedTodoName(item.title);
    setTodoItem(!UpdateTodoItem);
  };

  const onUpdateTodo = (item) => {
    if (todoId.title !== UpdatedTodoName && UpdatedTodoName.trim().length > 0) {
      setTodoId(item);
      let payload = item;
      payload = { ...item, title: UpdatedTodoName };
      payload = { ...payload, user_id: userId };
      dispatch(setTodoButtonLoading(true));
      dispatch(updateTodo(payload)).then(() => {
        dispatch(getTodos(body));
        setTodoItem(!UpdateTodoItem);
      });
    } else {
      setShowError(true);
      setTodoItem(!UpdateTodoItem);
    }
  };

  const showAddTodo = () => {
    setDialog(!AddTodoDialog);
    setShowError(false);
    dispatch(setTodoAddform(!addTodoForm));
  };

  const deleteTodoDialog = async (id, event) => {
    setTodoId(id);
    dispatch(setTodoDeleteform(!deleteTodoForm));
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (TodoName.trim().length === 0) {
      setShowError(true);
    } else {
      dispatch(setTodoButtonLoading(true));
      let body = {
        title: TodoName,
        is_done: done,
        org_id: orgId,
        user_id: userId,
        edit: edit,
      };
      dispatch(createTodo(body)).then(() => {
        dispatch(getTodos(body)); 
      });
    }
  };

  const TodoDelete = async () => {
    dispatch(setTodoButtonLoading(true));
    dispatch(deleteTodo(todoId)).then(() => {
      dispatch(getTodos(body));
      dispatch(setTodoDeleteform(!deleteTodoForm));
      // setDialog(!showDeleteDialog)
    });
  };
 
  // useEffect(() => {
  //   console.log(TodoList,"tototot")
  // },[TodoList])

  return (
<div>
    {loader?<LoaderComponent /> :
    <>
      <section className="breadcum_section">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between">
            <div className="col-6">
              <h2 className="bs_title">Personal Todo</h2>
            </div>
            <div className="col-6 text-end">
              <Button className="primary_btn" variant="primary" size="md" onClick={() => showAddTodo()}>
                <span className="d_aic_jcc gap-2"><FaPlus/>Add Todo</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <Card className="no-border-card">
                <Card.Body className="m-1">
                  {TodoList?.length > 0 &&
                    TodoList?.map((item, key) => {
                      return (
                        <div className="todo_card d-flex align-items-start justify-content-between gap-3">
                          <div className="Checklist-check rounded" id={key}>
                            <input type="checkbox" id={item.id} name="todo" value={item.id} checked={item.is_done} onChange={() => onChangeTodo(item)} />
                          </div>
                            <i className={item.is_done && "edit_icon2"}><BiPencil/></i>
                            {UpdateTodoItem && item.id === todoId.id ? (
                                <div className="form_fullwidth">
                                  {/* <div dangerouslySetInnerHTML={createMarkup(item)}  />; */}
                                  {/* <ReactQuill theme="snow" required value={UpdatedTodoName}  onBlur={() => onUpdateTodo(item)}  onChange={(e) => {setUpdatedTodoName(e);}}  placeholder="Enter Comment"  className="form-control"/> */}
                                  <input required type="text"  maxLength={64} rows={3} onChange={(e) => {setUpdatedTodoName(e.target.value);}} onBlur={() => onUpdateTodo(item)} className="form-control" value={UpdatedTodoName} name="UpdatedTodoName"/>
                                </div>
                              ) : (
                                <h4 className={item.is_done && "todo-strike"} onClick={() => updateInput(item)} dangerouslySetInnerHTML={{ __html: item.title }}>
                                </h4>                                
                              )}
                          <button id="todoDelete" className="btn-todo-actions" onClick={() => deleteTodoDialog(item.id)}><BiTrashAlt/></button>
                        </div>  
                      );
                    })}
                  {TodoList && TodoList?.length === 0 ? (
                    <div className="col-md-12 center text-center">
                      <img src={NoDataFound} height="420px"/>
                    </div>
                  ) : ("")}
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>     
      </section>

      <Modal show={addTodoForm} onHide={() => showAddTodo()} backdrop="static" keyboard={false} aria-labelledby="contained-modal-title-vcenter" centered 
      className="modal_forms">
        <Form onSubmit={(e) => addTodo(e)}>
          <Modal.Header closeButton>
            <Modal.Title><h2>Add a Personal Todo</h2></Modal.Title>
          </Modal.Header>

        
              

          <Modal.Body>
            <Form.Group className="formGroup mb-0" controlId="todoText">
              <Form.Label className="star">Description <b>*</b></Form.Label>
              <Form.Control required as="textarea" placeholder="Add Description"  maxLength={64} rows={3} onChange={(e) => {setTodoName(e.target.value);}}/>
              {/* <ReactQuill theme="snow" required as="textarea" placeholder="Add Description" rows={3}   onChange={(e) => {setTodoName(e);}}/> */}
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button className="dark-btn" variant="secondary" onClick={() => showAddTodo()}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
              ) : (<span> Add Todo</span>)}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      

      <Modal show={deleteTodoForm} onHide={() => deleteTodoDialog()} backdrop="static"keyboard={false} aria-labelledby="contained-modal-title-vcenter" centered className="modal_forms modal-sm">
        <Modal.Header closeButton>
          {/* <Modal.Title className="modal-title text-center">
              <h2 className="text-center">Delete PersonalTodo</h2>
          </Modal.Title> */}
        </Modal.Header>

        <Modal.Body className="text-center">
          <div className="d_aic_jcc icon_info mt-3 mb-4">
              <BiX className="i"/> 
          </div>
          <h3 className="text-center title mb-3">Delete PersonalTodo</h3>
          <p>Are you sure you want to Delete Permanently</p>                    
        </Modal.Body> 

        <Modal.Footer className="modal-footer-jcc border-0">
          <Button className="dark-btn" variant="secondary" onClick={() => deleteTodoDialog()}>Cancel</Button>
          <Button onClick={TodoDelete}  variant="primary" type="submit" disabled={loading}>
          {loading ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
          ) : (<span> Ok</span>)}
          </Button>
        </Modal.Footer> 
      </Modal> 
      </>
          }        
    </div>
  );
}

export default PersonalTodo;
