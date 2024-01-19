import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  getTodos,
  setTodoButtonLoading,
  updateTodo,
} from "../redux/reducers/todoReducer";
import { useNavigate } from "react-router-dom";
import NoDataFound from "../assets/No_Data_File.png";
import captialLetter from '../modules/CaptialLetter';

const Todos = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.user_id);
  const orgId = useSelector((state) => state.auth.current_organization);
  const TodoList = useSelector((state) => state.todo.todoList);
  const [body, setBody] = useState({ user_id: userId, org_id: orgId });
  const [todoId, setTodoId] = useState({});
  const [UpdateTodoItem, setTodoItem] = useState(false);

  useEffect(() => {
    dispatch(getTodos(body));
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

  return (
    <div className="card ann-card dashboard-card">
      <div className="ann-header d-flex align-items-center justify-content-between">
        <h4 className="m-0">Todo's</h4>
        <button onClick={() => navigate("/personaltodo")}>SEE ALL</button>
      </div>
      <div className="todo-content mt-2">
        <ul className="mb-0">
          {TodoList?.length > 0 ?
            TodoList?.slice(0, 4)?.map((item, key) => {
              return (
                <a key={key}>
                  <li key={key}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <input
                      type="checkbox"
                      id={item.id}
                      name="todo"
                      value={item.id}
                      checked={item.is_done}
                      onChange={() => onChangeTodo(item)}
                      className="me-2"
                    /></div>

                    <div>
                    <label className={item.is_done ? "td-strike" : ""} dangerouslySetInnerHTML={{ __html: captialLetter(item.title.slice(0,28)) }}></label>
                    </div>
                   

                    </div>
                    
                  </li>
                </a>
              );
            }) :
            <div className="h-100 d_aic_jcc">
            <img src={NoDataFound} alt="No data found"/>
           </div>
            }
        </ul>
      </div>
    </div>
  );
};

export default Todos;
