import {Button,Col} from "react-bootstrap";
import { FaPlus, FaArrowLeft } from "react-icons/fa";
import CreateRole from "../components/CreateRoleComponent";
import { useDispatch, useSelector } from "react-redux";
import { setRoleAddform, setCloneData,getPermissionsByRole,setPermissionData,getTaskPermisionByRole,getRoleAccessDropDown, setLoader } from "../redux/reducers/rolesReducer";
import { useEffect, useState } from "react";
import {
  getRoles,
  setSelectedRole,
  deleteRole,
  roledeleteCheck,
} from "../redux/reducers/rolesReducer";
import NoDataFound from "../assets/No_Data_File.png";
import { BiTrashAlt, BiEditAlt, BiCopy, BiPlus } from "react-icons/bi";
import { getOrganizations } from "../redux/reducers/organizationReducer";
import { getUserOrgByid } from "../redux/reducers/authReducer";
import moment from "moment";
import LoaderComponent from "../components/Loader";
import { useNavigate } from "react-router-dom";

const RoleManagement = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const rolesList = useSelector((state) => state.roles.rolesList);
  const showAddForm = useSelector((state) => state.roles.showAddForm);
  const [rolePermissionsData,setRolePermissionData]=useState([]);
  const available_organizations = useSelector(
    (state) => state.auth.available_organizations
  );
  const [organizationsdata, setorganizations] = useState({
    data: available_organizations,
    name: "",
  });
  const userData = useState(localStorage.getItem("userData")&&JSON.parse(localStorage.getItem("userData")));
  const loader = useSelector((state) => state.roles.loader);
  // const [loader,setLoader]=useState(true)
  const navigate = useNavigate();
  const userOrgList = useSelector((state) => state.auth.userOrgDetails);
  const current_organization = useSelector((state) => state.auth.current_organization);
  const userOrgDetails = userOrgList?.find((item) => item.org_id == current_organization);
  const [createdBy,setCreatedBy]=useState('')
  // const [selectedRole,setSelectedRole]=useState('');

  useEffect(() => {
    dispatch(setLoader(true))
    dispatch(getRoles(search)).then((res)=>{
      dispatch(setLoader(false))
      let createdby = res.payload?.find(
        (i) => i.id == userOrgDetails?.role_id
    );

    createdby && setCreatedBy(createdby);
    });
    dispatch(getOrganizations(organizationsdata));
    dispatch(getUserOrgByid(userData?.[0].id));
    dispatch(getRoleAccessDropDown())
    dispatch(getPermissionsByRole(userOrgList[0]?.role_id)).then(res=>setRolePermissionData(res.payload))
  }, [search]);

  const editPermissons = (id) => {
    dispatch(setRoleAddform(true));
    dispatch(setSelectedRole(id));
    dispatch(setCloneData(""));
  };
  // To clone Data
  const clonedata = (item) => {
    dispatch(setSelectedRole(""));
    dispatch(setCloneData(item));
    dispatch(setRoleAddform(true));
  };
  const RoleAddForm = () => {
    dispatch(setRoleAddform(true));
    dispatch(setPermissionData(rolePermissionsData));
    dispatch(setCloneData(""));
    dispatch(setSelectedRole(""));
  };

  const deleterole = (item) => {
    dispatch(roledeleteCheck(item)).then((res) => {
      dispatch(setLoader(true))
      dispatch(getRoles("")).then(res=>dispatch(setLoader(false)));
    });
  };

  return (
    <>
      {showAddForm && <CreateRole />}

          <section className="breadcum_section">
            <div className="container-fluid">
              <div className="row align-items-center">
                <div className="col-6">
                  <div className="d-flex align-items-center gap-3 masterback-btn">
                    <Button
                      className="primary_btn white_btn d-flex align-items-center justify-content-center"
                      variant="light"
                      size="md"
                      onClick={() => navigate("/master")}
                    >
                      <FaArrowLeft />
                    </Button>
                    <h2 className="bs_title">Role Management</h2>
                  </div>
                </div>
                <div className="col-6 d-flex justify-content-end">
                  <Button className="primary_btn" variant="primary" size="md" onClick={RoleAddForm}>
                   <span className="d_aic_jcc gap-2"><FaPlus/>Create Role</span>
                  </Button>
                </div>
              </div>
            </div>
          </section>
          {loader ? (
        <LoaderComponent />
      ) : rolesList?.length > 0 ? (
          <section>
            <div className="container-fluid">
              <div className="row">
                <div className="col-xl-12 col-lg-12 col-md-12">
                  <div className="table-responsive">
                    <table className="table table-style1">
                      {rolesList?.length > 0 && (
                        <thead>
                          <tr>
                            <th>Role Title</th>
                            <th>Created By</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                      )}

                      <tbody>
                        {rolesList?.length > 0 ? (
                          rolesList?.map((item, key) => {
                            return (
                              <tr className="card-table">
                                <td>
                                  {item.name?.charAt(0).toUpperCase() +
                                    item?.name?.slice(1)}
                                </td>
                                <td>{createdBy.name}</td>
                                <td>{moment(item.created_at).format("LLL")}</td>
                                <td>
                                  <div className="tb-actions d-flex align-item-center justify-content-start">
                                    {item.org_id !== 0 ? (
                                      <button
                                        className="btn-tl-actions"
                                        onClick={() => editPermissons(item.id)}
                                      >
                                        <BiEditAlt />
                                      </button>
                                    ) : (
                                      ""
                                    )}
                                    <button
                                      className="btn-tl-actions"
                                      onClick={() => clonedata(item)}
                                    >
                                      <BiCopy />
                                    </button>
                                    {item.org_id !== 0 ? (
                                      <button
                                        className="btn-tl-actions"
                                        onClick={() => deleterole(item)}
                                      >
                                        <BiTrashAlt />
                                      </button>
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <Col md={12} className="text-center"><img src={NoDataFound} height="500px" /></Col>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
            ) : (
        <div className="col-md-12 center text-center">
          <img src={NoDataFound} height="500px" alt="" />
        </div>
      )}
    </>
  );
};

export default RoleManagement;
