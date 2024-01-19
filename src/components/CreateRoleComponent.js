import { Form,Dropdown,SplitButton,DropdownButton,Button,ButtonGroup,Container,Row,Col, OverlayTrigger } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { setRoleAddform, getPermissionsByRole,getTaskPermisionByRole, setSelectedRole, createRoles, updateRolePermissions, getRoles,setLoader } from '../redux/reducers/rolesReducer'
import Spinner from 'react-bootstrap/Spinner';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { useRef } from 'react';
import {FaEllipsisV} from "react-icons/fa";
import Multiselect from "multiselect-react-dropdown-colors";
import { toast } from 'react-toastify';
import Tooltip from "react-bootstrap/Tooltip";
import Popover from 'react-bootstrap/Popover';

const CreateRole = () => {
    const dispatch = useDispatch()
    const inputRef = useRef();
    const showAddForm = useSelector((state) => state.roles.showAddForm)
    const loading = useSelector((state) => state.roles.buttonLoading)
    const selectedRole = useSelector((state) => state.roles.selectedRole)
    const orgId = useSelector((state) => state.auth.current_organization)
    const userDetails = useSelector((state) => state.auth.userDetails);
    const [taskUpdateId,setTaskUpdateId]=useState();
    const cloneItem = useSelector((state) => state.roles.cloneData);
    const [userRolePermission, setUserPermission] = useState(false);
    const [dropDownClass,setDropDownClass]=useState(false);
    const [taskDepartmentPermissions,setTaskDepartmentPermissions]=useState({});
    const [taskDelete,setTaskDelete]=useState(false)
    const [taskLocationPermissions,setTaskLocationPermissions]=useState({});
    const [taskAssignePermissions,setTaskAssigneePermissions]=useState({});
    const [assignePermissionError,setTaskAssignePermissionError]=useState(false);
    const [taskLocationPermissionError,setTaskLocationPermissionError]=useState(false);
    const [taskDepartmentPermissionError,setTaskDepartmentPermissionError]=useState(false);
    const rolesList = useSelector((state) => state.roles.rolesList);
	  const permissionData=useSelector((state)=>state.roles.permissionData);
    const dropDownList=useSelector((state)=>state.roles.accessDropDownList);
    const [locationPermissionError,setLocationPermissionError]=useState(false);
    const [userPermissionError,setUserPermissionError]=useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState([]);
    const [taskUpdatedDropPermissions,setTaskUpadteDropPermission]=useState([{
        is_enable: false,
        field: "startdate",
        value : ""},
      {
        is_enable: false,
        field: "duedate",
        value : ""
      },
      {
        is_enable: false,
        field:"title",
        value: ""
      },
      {
        value: "",
        field:"assignee",
        is_enable: false,
      },
      {
        value: "",
        field: "approval",
        is_enable: false,
      }
    ])
    const [taskUpadtePermissions,setTaskUpadtePermissions]=useState([{name:"assignee",value:false},{name:"start_date",value:false}, {name:"due_date",value:false},{name:"title",value:false}]);
    const [userPermissons, setUserPermissions] = useState({
        table: "users",
        create: false,
        update: false,
        view: false,
        delete: false,
        updated_by: userDetails.id,
        updated_on: new Date()
    })
    const [locationPermissons, setLocationPermissions] = useState({
        table: "locations",
        create: false,
        update: false,
        view: false,
        delete: false,
        updated_by: userDetails.id,
        updated_on: new Date(),
        // accessLevel: 'all'
    })
    const [departmentPermissons, setDepartmentPermissions] = useState({
        table: "departments",
        create: false,
        update: false,
        view: false,
        delete: false,
        updated_by: userDetails.id,
        updated_on: new Date()
    }
    )
    const [designationPermissons, setDesignationPermissions] = useState({
        table: "designations",
        create: false,
        update: false,
        view: false,
        delete: false,
        updated_by: userDetails.id,
        updated_on: new Date()
    }
    )
    const [rolePermissons, setRolePermissions] = useState({
        table: "roles",
        create: false,
        update: false,
        view: false,
        delete: false,
        updated_by: userDetails.id,
        updated_on: new Date()
    })
    const [orgPermissions, setOrgPermissions] = useState({
        table: "organization",
        create: false,
        update: false,
        view: false,
        delete: false,
        updated_by: userDetails.id,
        updated_on: new Date()
    })
    const [aliasPermissions, setAliasPermissions] = useState({
        table: "alias",
        create: false,
        update: false,
        view: false,
        delete: false,
        updated_by: userDetails.id,
        updated_on: new Date()
    })
    const [announcmentPermissions, setannouncementPermissions] = useState({
        table: "announcement",
        create: false,
        update: false,
        view: true,
        delete: false,
        updated_by: userDetails.id,
        updated_on: new Date()
    })

    const [groupsPermissions, setGroupsPermissions] = useState({
        table: "groups",
        create: false,
        update: false,
        view: false,
        delete: false,
        updated_by: userDetails.id,
        updated_on: new Date()
    })
    const [roleDetails, setRoleDetails] = useState({
        name: '',
        description: '',
        org_id: orgId,
        is_editable: true,
    })
	
    const [previousData, setPreviousData] = useState()
    const [showError, setShowError] = useState(false)
    const [showErrorDes, setShowErrorDes] = useState(false);
    const [duplicateError, setDuplicateError] = useState(false);
    const [roleNames, setRoleNames] = useState();
    const [editableName, setEditableName] = useState();
    const [trToggle,setTrToggle] = useState(false);
    const [userAccessDropDown,setUserAccessDropDown]=useState(false)
      

  const closeReportOptions=(e)=>{
    setSelectedTemplate()
      console.log("eee",e)
    }
  const handletr = (type) => {
    if(type=="locations"){
      setTrToggle(true);
      setUserAccessDropDown(false)
    }
    if(type=="userAccess"){
      setTrToggle(false);
      setUserAccessDropDown(true)
    }
  }

  const permissionsCheck=(data)=>{
    return Object.keys(data).filter(item=>item!='view').some(keyValue=>data[keyValue]==true)
  }

  const onPermissionsChange=(type,state,setState)=>{
    let checkPermission=!state[type]
    let permissionClone={...state}
    if(checkPermission||permissionsCheck(permissionClone)) {
      setState({
      ...state,
      [type]:checkPermission,
      view:true})
    }
    else{
      setState({
        ...state,
      [type]:checkPermission})
    }
  }
  
  //used to update check value to the state
  const selectTaskUpadte=(val)=>{
    let filterSelectedData=taskUpdatedDropPermissions?.filter(item=>item.field==val).map(item=>({...item,is_enable:!item.is_enable}));
    let filterPreviousData=taskUpdatedDropPermissions?.filter(item=>item.field!=val);
    setTaskUpadteDropPermission([...filterSelectedData,...filterPreviousData])
  }

//used to update selected permission to state
const setSelectedTaskPermissions=(type,permission)=>{
  let filterSelectedPermission=taskUpdatedDropPermissions.filter(item=>item.field==type).map(item=>({...item,value:permission}));
  let filterPreviousPermmission=taskUpdatedDropPermissions.filter(item=>item.field!=type);
  setTaskUpadteDropPermission([...filterSelectedPermission,...filterPreviousPermmission])
}

//used to return selected title to dropdown
const selectedDropDownTitleCheck=(val)=>{
  let titleCheck=taskUpdatedDropPermissions.filter(item=>item.field==val)
  if(titleCheck[0].value){
    return titleCheck[0].value
  }
  else{
    return val[0].toUpperCase()+val.slice(1,val.length)
  }
}
  const onRemoveSlecetedItem=(e,val)=>{
    let update_value={...val}
    update_value.value=false
    let filterSelectedData=taskUpadtePermissions?.filter(item=>item?.name!=update_value?.name);
    setTaskUpadtePermissions([...filterSelectedData,update_value])
  }

    useEffect(() => {
        if (selectedRole) {
            dispatch(getPermissionsByRole(selectedRole)).then((res) => {
              dispatch(getTaskPermisionByRole(selectedRole)).then((taskres)=>{
                setTaskAssigneePermissions({role_access:taskres.payload.data.task_permissions[0].assignee_access})
                setTaskLocationPermissions({role_access:taskres.payload.data.task_permissions[0].location_access})
                setTaskDepartmentPermissions({role_access:taskres.payload.data.task_permissions[0].department_access})
                setTaskUpadteDropPermission(JSON.parse(taskres.payload.data.task_permissions[0].update_access))
                let filterSelectedTaskPermissions=taskres.payload.data.task_permissions[0]?.update_access
                setSelectedTemplate(JSON.parse(filterSelectedTaskPermissions).filter((item)=>item.value==true));
                setTaskUpadtePermissions(JSON.parse(taskres.payload.data.task_permissions[0]?.update_access))
                setTaskUpdateId(taskres.payload.data.task_permissions[0].id);
                setTaskDelete(taskres.payload.data.task_permissions[0].delete)
              })
                if (!res.payload[0].roleByRoleId.is_editable) {
                    setUserPermission(true)
                }
                setRoleDetails(res.payload[0].roleByRoleId)
                setPreviousData(res.payload)
                setUserPermissions(res.payload.find((item) => item.table === 'users'))
                setLocationPermissions(res.payload.find((item) => item.table === 'locations'))
                setDepartmentPermissions(res.payload.find((item) => item.table === 'departments'))
                setDesignationPermissions(res.payload.find((item) => item.table === 'designations'))
                setRolePermissions(res.payload.find((item) => item.table === 'roles'))
                setOrgPermissions(res.payload.find((item) => item.table === 'organization'))
                setAliasPermissions(res.payload.find((item) => item.table === 'alias'))
                setGroupsPermissions(res.payload.find((item) => item.table === 'groups'))
                setannouncementPermissions(res.payload.find((item) => item.table === 'announcement'))
                setEditableName(res.payload[0].roleByRoleId.name);
            })
        }
        if (cloneItem.id) {
            dispatch(getPermissionsByRole(cloneItem.id)).then((res) => {
                setRoleDetails({
                    name: '',
                    description: '',
                    org_id: orgId,
                    is_editable: true,
                })
                dispatch(getTaskPermisionByRole(cloneItem.id)).then((taskres)=>{
                  setTaskAssigneePermissions({role_access:taskres.payload.data.task_permissions[0].assignee_access})
                  setTaskLocationPermissions({role_access:taskres.payload.data.task_permissions[0].location_access})
                  setTaskDepartmentPermissions({role_access:taskres.payload.data.task_permissions[0].department_access})
                  setTaskUpdateId(taskres.payload.data.task_permissions[0].id);
                  setTaskDelete(taskres.payload.data.task_permissions[0].delete)
                })
                res.payload.forEach(item => {
                    if (item.table === 'users') {
                        const userPermissions = {
                            table: item.table,
                            create: item.create,
                            update: item.update,
                            delete: item.delete,
                            view: item.view,
                            role_access:item.role_access
                        };
                        setUserPermissions(userPermissions);
                    }
                    if (item.table === 'locations') {
                        const userPermissions = {
                            table: item.table,
                            create: item.create,
                            update: item.update,
                            delete: item.delete,
                            view: item.view,
                            role_access:item.role_access
                        };
                        setLocationPermissions(userPermissions);
                    }
                    if (item.table === 'departments') {
                        const userPermissions = {
                            table: item.table,
                            create: item.create,
                            update: item.update,
                            delete: item.delete,
                            view: item.view,
                        };
                        setDepartmentPermissions(userPermissions);
                    }
                    if (item.table === 'designations') {
                        const userPermissions = {
                            table: item.table,
                            create: item.create,
                            update: item.update,
                            delete: item.delete,
                            view: item.view,
                        };
                        setDesignationPermissions(userPermissions);
                    }
                    if (item.table === 'roles') {
                        const userPermissions = {
                            table: item.table,
                            create: item.create,
                            update: item.update,
                            delete: item.delete,
                            view: item.view,
                        };
                        setRolePermissions(userPermissions);
                    }
                    if (item.table === 'organization') {
                        const userPermissions = {
                            table: item.table,
                            create: item.create,
                            update: item.update,
                            delete: item.delete,
                            view: item.view,
                        };
                        setOrgPermissions(userPermissions);
                    }
                    if (item.table === 'alias') {
                        const userPermissions = {
                            table: item.table,
                            create: item.create,
                            update: item.update,
                            delete: item.delete,
                            view: item.view,
                        };
                        setAliasPermissions(userPermissions);
                    }
                    if (item.table === 'groups') {
                        const userPermissions = {
                            table: item.table,
                            create: item.create,
                            update: item.update,
                            delete: item.delete,
                            view: item.view,
                            role_access:item.role_access
                        };
                        setGroupsPermissions(userPermissions);
                    }
                    if (item.table.trim() ==="announcement") {
                        const userPermissions = {
                            table: item.table,
                            create: item.create,
                            update: item.update,
                            delete: item.delete,
                            view: item.view,
                        };
                        setannouncementPermissions(userPermissions);
                    }
                });
            })
        }
    }, [])

    useEffect(() => {
      if(rolesList.length>0){
        let names = [];
        rolesList.map(item => names.push(item.name));
        setRoleNames(names);
      }
    }, [rolesList]);

    const createRole = () => {
      roleDetails.name = roleDetails?.name?.trim().toLowerCase();
      if(!locationPermissons?.role_access||!userPermissons?.role_access||!taskDepartmentPermissions?.role_access||!taskLocationPermissions?.role_access||!taskAssignePermissions?.role_access){
        if(!locationPermissons?.role_access){
          setLocationPermissionError(true);
        }
        if(!userPermissons?.role_access){
          setUserPermissionError(true);
        }
        if(!taskDepartmentPermissions?.role_access){
          setTaskDepartmentPermissionError(true);
        }
        if(!taskLocationPermissions?.role_access){
          setTaskLocationPermissionError(true);
        }
        if(!taskAssignePermissions?.role_access){
          setTaskAssignePermissionError(true);
        }
        return
      }
      if (roleNames?.includes(roleDetails?.name)) {
        setDuplicateError(!duplicateError);
      } else {
        let body = {
          role: roleDetails,
          permissions: [
            userPermissons,
            locationPermissons,
            departmentPermissons,
            designationPermissons,
            rolePermissons,
            orgPermissions,
            announcmentPermissions,
            aliasPermissions,
            groupsPermissions
          ],
        };
        let filterSelectedTaskUpdatePermission=taskUpdatedDropPermissions.find(item=>(item.is_enable&&!item.value))
        if(filterSelectedTaskUpdatePermission?.is_enable&&!filterSelectedTaskUpdatePermission?.value){
          toast.error(`please select permissions for ${filterSelectedTaskUpdatePermission.field}`)
          return
        }
       let permissionData={  
       department_access:taskDepartmentPermissions?.role_access,
      location_access: taskLocationPermissions?.role_access,
      assignee_access:taskAssignePermissions?.role_access,
      delete:taskDelete,
      update_access:JSON.stringify(taskUpdatedDropPermissions)
      }
      let payload={permissionData:permissionData,payload:body}
        if (body.role.name == "") {
          setShowError(true);
        } else if (body.role.description == "") {
          setShowErrorDes(true);
        } else {
          dispatch(createRoles(payload)).then((res) => {
            dispatch(setLoader(true))
            dispatch(getRoles("")).then(res=>dispatch(setLoader(false)));
          });
        }
      }
    };

    const handleButton = (e) => {
      console.log("evenee", e.target);
    };

    const compareJson = (obj1, obj2) => {

        // Check if the objects have the same number of properties

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
            return false;
        }

        // Check if the values of each property are equal
        for (let key of keys1) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }

        // If all properties are equal, return true
        return true;
    }

    const updateRole = () => {
      if (roleNames?.includes(roleDetails?.name) && editableName != roleDetails?.name) {
        setDuplicateError(!duplicateError);
      } else {
        var body = {
          role: roleDetails,
          permissions: [
            userPermissons,
            locationPermissons,
            departmentPermissons,
            designationPermissons,
            rolePermissons,
            orgPermissions,
            aliasPermissions,
            announcmentPermissions,
            groupsPermissions,
          ],
        };
        if (body.role.name == "") {
          setShowError(true);
        } else if (body.role.description == "") {
          setShowErrorDes(true);
        } else {
          let tempPermissions = [];

          for (var i = 0; i < previousData.length; i++) {
            if (!compareJson(body.permissions[i], previousData[i])) {
              const updatedPermissions = {
                ...body.permissions[i],
                updated_by: userDetails.id,
                updated_on: new Date().toISOString(),
              };

              tempPermissions.push({
                id: updatedPermissions.id,
                create: updatedPermissions.create,
                view: updatedPermissions.view,
                update: updatedPermissions.update,
                delete: updatedPermissions.delete,
                role_access:updatedPermissions.role_access,
                org_id: updatedPermissions.org_id,
                table: updatedPermissions.table,
                role_id: updatedPermissions.role_id,
                updated_by: updatedPermissions.updated_by,
                updated_on: updatedPermissions.updated_on,
              });
            }
            // if (!compareJson(body.permissions[i], previousData[i])) {
            // //    body.permissions[i].updated_by = userDetails.id
            //     body.permissions[i].updated_on = new Date()
            // }

            // tempPermissions.push({
            //     "id": body.permissions[i].id,
            //     "create": body.permissions[i].create,
            //     "view": body.permissions[i].view,
            //     "update": body.permissions[i].update,
            //     "delete": body.permissions[i].delete,
            //     "org_id": body.permissions[i].org_id,
            //     "table": body.permissions[i].table,
            //     "role_id": body.permissions[i].role_id,
            //     "updated_by" :body.permissions[i].updated_by,
            //     "updated_on" :body.permissions[i].updated_on
            // })
          }
        let filterSelectedTaskUpdatePermission=taskUpdatedDropPermissions.find(item=>(item.is_enable&&!item.value))
        if(filterSelectedTaskUpdatePermission?.is_enable&&!filterSelectedTaskUpdatePermission?.value){
          toast.error(`please select permissions for ${filterSelectedTaskUpdatePermission.field}`)
          return
        }
          body.permissions = tempPermissions;
          let taskPermission={department_access:taskDepartmentPermissions?.role_access,
            location_access: taskLocationPermissions?.role_access,
            assignee_access:taskAssignePermissions?.role_access,
            delete:taskDelete,
            update_access:JSON.stringify(taskUpdatedDropPermissions),
            id:taskUpdateId,
            role_id:body.role.id,
            org_id:body.role.org_id
          }
          body['taskPermission']=taskPermission
          dispatch(updateRolePermissions(body)).then((res) => {
            dispatch(setLoader(true))
            dispatch(getRoles("")).then(res=>dispatch(setLoader(false)));
          });
        }
      }
    };

    return (
      <Modal
        show={showAddForm}
        onHide={() => {
          dispatch(setRoleAddform(false));
          dispatch(setSelectedRole(undefined));
          setPreviousData();
        }}
        dialogClassName="modal-90w rolemodal"
        aria-labelledby="example-custom-modal-styling-title"
        centered
        backdrop="static"
      >
        <Form>
          <Modal.Header closeButton>
            <Modal.Title id="example-modal-sizes-title-lg">
              {selectedRole ? "Update Role" : "Create Role"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Container fluid>
              <Row>
                <Form.Group className="col-6 mb-3">
                  <Form.Label className="d-flex icon_space star">
                    {" "}
                    Role Name <b>*</b>
                  </Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={roleDetails?.name}
                    onChange={(e) => {
                      setRoleDetails({ ...roleDetails, name: e.target.value });
                    }}
                    disabled={userRolePermission}
                  />
                  {roleDetails?.name.length == 0 && showError && (
                    <p className="mt-3 text-danger fs-10">
                      {" "}
                      Please Enter Roll Name
                    </p>
                  )}
                  {roleDetails?.name.length != 0 && duplicateError && (
                    <p className="mt-3 text-danger fs-10">
                      {" "}
                      Duplicate Role Name
                    </p>
                  )}
                </Form.Group>
                <Form.Group className="col-6 mb-3">
                  <Form.Label className="d-flex icon_space star">
                    {" "}
                    Role Description <b>*</b>
                  </Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={roleDetails?.description}
                    onChange={(e) => {
                      setRoleDetails({
                        ...roleDetails,
                        description: e.target.value,
                      });
                    }}
                    disabled={userRolePermission}
                  />
                  {roleDetails?.description.length == 0 && showErrorDes && (
                    <p
                      className="mt-3 text-danger fs-10"
                      style={{ color: "red", fontSize: 10 }}
                    >
                      {" "}
                      Please Enter Roll Description
                    </p>
                  )}
                </Form.Group>
              </Row>
              <Row>
                <Col md={12}>
                  <div className="table-responsive">
                    <table className="table table-style1">
                      <thead>
                        <tr>
                          <th>Permissions</th>
                          <th></th>
                          <th>Create</th>
                          <th>Update</th>
                          <th>View</th>
                          <th>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          className={
                            trToggle ? "card-table pr99" : "card-table"
                          }
                        >
                          <td className="">Locations</td>
                          {/* <Form.Group className="">
                            <Form.Label className='d-flex icon_space'>Access Level</Form.Label>
                            <Form.Select aria-label="Access Level" onChange={(e) => setLocationPermissions({
                                    ...locationPermissons,
                                    accessLevel: e.target.value,
                                  })} value={locationPermissons.accessLevel}>
                              <option value="all">All</option>
                              <option value="children">Assigned locations + children</option>
                              <option value="assigned">Only Assigned</option>
                            </Form.Select>
                            </Form.Group> */}

                          <td>
                            <OverlayTrigger
                              placement="top"
                              delay={{ show: 100, hide: 400 }}
                              trigger="hover"
                              overlay={
                                <Popover id="top">
                                  <Popover.Body>
                                    <p className="m-1">
                                      <strong>Me -</strong> My Location
                                    </p>
                                    <p className="m-1">
                                      <strong>Me+childs -</strong> My Location +
                                      Locations Reporting to My location
                                    </p>
                                    <pc className="m-1">
                                      <strong>Organization -</strong> Entire
                                      Organization{" "}
                                    </pc>
                                  </Popover.Body>
                                </Popover>
                              }
                            >
                              <DropdownButton
                                as={ButtonGroup}
                                key={"down"}
                                id={`dropdown-button-drop-${"down"}`}
                                drop={"down"}
                                variant="secondary"
                                title={
                                  locationPermissons?.role_access
                                    ? locationPermissons.role_access
                                    : "Role Access"
                                }
                                onSelect={(item) => {
                                  setLocationPermissions((prev) => ({
                                    ...prev,
                                    role_access: item,
                                  }));
                                  setLocationPermissionError(false);
                                }}
                                onClick={() => handletr("locations")}
                              >
                                {dropDownList?.map((item) => {
                                  return (
                                    <>
                                      <Dropdown.Item
                                        eventKey={item}
                                        onChange={() => alert(item)}
                                      >
                                        {item}
                                      </Dropdown.Item>
                                    </>
                                  );
                                })}
                              </DropdownButton>
                            </OverlayTrigger>
                            {locationPermissionError && (
                              <span className="text-danger">
                                Please Select Location Permission
                              </span>
                            )}
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="createLocation"
                                checked={locationPermissons?.create}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('create',locationPermissons,setLocationPermissions)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="updateLocation"
                                checked={locationPermissons?.update}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('update',locationPermissons,setLocationPermissions)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="viewLocation"
                                checked={locationPermissons?.view}
                                disabled={userRolePermission||permissionsCheck(locationPermissons)}
                                onChange={(e) =>
                                  setLocationPermissions({
                                    ...locationPermissons,
                                    view: !locationPermissons?.view,
                                  })
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="deleteLocation"
                                checked={locationPermissons?.delete}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('delete',locationPermissons,setLocationPermissions)}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr
                          className={
                            userAccessDropDown
                              ? "card-table pr99"
                              : "card-table"
                          }
                        >
                          <td>Users</td>
                          <td>
                            <OverlayTrigger
                              placement="top"
                              delay={{ show: 100, hide: 400 }}
                              overlay={
                                <Popover id="top">
                                  <Popover.Body>
                                    <p className="m-1">
                                      <strong>Me -</strong> Only Me
                                    </p>
                                    <p className="m-1">
                                      <strong>Me+childs -</strong> Me + users
                                      Reporting to Me
                                    </p>
                                    <p className="m-1">
                                      <strong>Organization -</strong> Entire
                                      Organization{" "}
                                    </p>
                                  </Popover.Body>
                                </Popover>
                              }
                            >
                              <DropdownButton
                                as={ButtonGroup}
                                key={"down"}
                                id={`dropdown-button-drop-${"down"}`}
                                drop={"down"}
                                variant="secondary"
                                onClick={() => handletr("userAccess")}
                                title={
                                  userPermissons?.role_access
                                    ? userPermissons.role_access
                                    : "Role Access"
                                }
                                onSelect={(item) => {
                                  setUserPermissions((prev) => ({
                                    ...prev,
                                    role_access: item,
                                  }));
                                  setUserPermissionError(false);
                                }}
                              >
                                {dropDownList?.map((item) => {
                                  return (
                                    <>
                                      <Dropdown.Item eventKey={item}>
                                        {item}
                                      </Dropdown.Item>
                                    </>
                                  );
                                })}
                              </DropdownButton>
                            </OverlayTrigger>
                            {userPermissionError && (
                              <span className="text-danger">
                                Please Select User Permission
                              </span>
                            )}
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="createUser"
                                checked={userPermissons?.create}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('create',userPermissons,setUserPermissions)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="updateUser"
                                checked={userPermissons?.update}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('update',userPermissons,setUserPermissions)}                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="viewUser"
                                checked={userPermissons?.view}
                                disabled={userRolePermission||permissionsCheck(userPermissons)}
                                onChange={(e) =>
                                  setUserPermissions({
                                    ...userPermissons,
                                    view: !userPermissons?.view,
                                  })
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="deleteUser"
                                checked={userPermissons?.delete}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('delete',userPermissons,setUserPermissions)}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr
                          className={
                            dropDownClass ? "card-table pr99" : "card-table "
                          }
                        >
                          <td>Departments</td>
                          <td></td>
                          {/* <td>
                        <DropdownButton
                          as={ButtonGroup}
                          key={'end'}
                          id={`dropdown-button-drop-${'end'}`}
                          drop={'end'}
                          variant="secondary"
                          title={departmentPermissons?.role_access?departmentPermissons.role_access:"Role Access"}
                          onSelect={(item)=>setDepartmentPermissions((prev)=>({...prev,role_access:item}))}
                          >
                            {dropDownList?.map(item=>{
                              return(
                                <>
                                <Dropdown.Item eventKey={item}>{item}</Dropdown.Item>
                                </>
                              )
                            })}
                        </DropdownButton>
                        </td> */}
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="createDepartment"
                                checked={departmentPermissons?.create}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('create',departmentPermissons,setDepartmentPermissions)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="updateDepartment"
                                checked={departmentPermissons?.update}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('update',departmentPermissons,setDepartmentPermissions)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="viewDepartment"
                                checked={departmentPermissons?.view}
                                disabled={userRolePermission||permissionsCheck(departmentPermissons)}
                                onChange={(e) =>
                                  setDepartmentPermissions({
                                    ...departmentPermissons,
                                    view: !departmentPermissons?.view,
                                  })
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="deleteDepartment"
                                checked={departmentPermissons?.delete}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('delete',departmentPermissons,setDepartmentPermissions)}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr
                          className={
                            dropDownClass ? "card-table pr99" : "card-table"
                          }
                        >
                          <td>Designations</td>
                          <td></td>
                          {/* <td>
                        <DropdownButton
                          as={ButtonGroup}
                          key={'end'}
                          id={`dropdown-button-drop-${'end'}`}
                          drop={'end'}
                          variant="secondary"
                          title={designationPermissons?.role_access?designationPermissons.role_access:"Role Access"}
                          onSelect={(item)=>setDesignationPermissions((prev)=>({...prev,role_access:item}))}
                          >
                            {dropDownList?.map(item=>{
                              return(
                                <>
                                <Dropdown.Item eventKey={item}>{item}</Dropdown.Item>
                                </>
                              )
                            })}
                        </DropdownButton>
                        </td> */}
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="createDesignation"
                                checked={designationPermissons?.create}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('create',designationPermissons,setDesignationPermissions)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="updateDesignation"
                                checked={designationPermissons?.update}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('update',designationPermissons,setDesignationPermissions)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="viewDesignation"
                                checked={designationPermissons?.view}
                                disabled={userRolePermission||permissionsCheck(designationPermissons)}
                                onChange={(e) =>
                                  setDesignationPermissions({
                                    ...designationPermissons,
                                    view: !designationPermissons?.view,
                                  })
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="deleteDesignation"
                                checked={designationPermissons?.delete}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('delete',designationPermissons,setDesignationPermissions)}
                              />
                            </div>
                          </td>
                        </tr>

                        <tr
                          className={
                            dropDownClass ? "card-table pr99" : "card-table"
                          }
                        >
                          <td>Teams</td>
                          <td></td>
                          {/* <td>
                        <DropdownButton
                          as={ButtonGroup}
                          key={'end'}
                          id={`dropdown-button-drop-${'end'}`}
                          drop={'end'}
                          variant="secondary"
                          title={groupsPermissions?.role_access?groupsPermissions.role_access:"Role Access"}
                          onSelect={(item)=>setGroupsPermissions((prev)=>({...prev,role_access:item}))}
                          >
                            {dropDownList?.map(item=>{
                              return(
                                <>
                                <Dropdown.Item eventKey={item}>{item}</Dropdown.Item>
                                </>
                              )
                            })}
                        </DropdownButton>
                        </td> */}
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="createGroup"
                                checked={groupsPermissions?.create}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('create',groupsPermissions,setGroupsPermissions)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="updateGroup"
                                checked={groupsPermissions?.update}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('update',groupsPermissions,setGroupsPermissions)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="viewGroup"
                                checked={groupsPermissions?.view}
                                disabled={userRolePermission||permissionsCheck(groupsPermissions)}
                                onChange={(e) =>
                                  setGroupsPermissions({
                                    ...groupsPermissions,
                                    view: !groupsPermissions?.view,
                                  })
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="deleteGroup"
                                checked={groupsPermissions?.delete}
                                disabled={userRolePermission}
                                onChange={()=>onPermissionsChange('delete',groupsPermissions,setGroupsPermissions)}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr
                          className={
                            dropDownClass ? "card-table pr99" : "card-table"
                          }
                        >
                          <td>Roles</td>
                          <td></td>
                          {/* <td>
                        <DropdownButton
                          as={ButtonGroup}
                          key={'end'}
                          id={`dropdown-button-drop-${'end'}`}
                          drop={'end'}
                          variant="secondary"
                          title={rolePermissons?.role_access?rolePermissons.role_access:"Role Access"}
                          onSelect={(item)=>setRolePermissions((prev)=>({...prev,role_access:item}))}
                          >
                            {dropDownList?.map(item=>{
                              return(
                                <>
                                <Dropdown.Item eventKey={item}>{item}</Dropdown.Item>
                                </>
                              )
                            })}
                        </DropdownButton>
						           </td> */}
                          <td>
                            <div className=" Checklist-check">
                            <OverlayTrigger
                              placement="top"
                              delay={{ show: 100, hide: 400 }}
                              overlay={
                                  <Tooltip>Role Permission Only For Admin and Owner</Tooltip>
                              }
                            >
                              <input
                                type="checkbox"
                                name="createRole"
                                checked={rolePermissons?.create}
                                disabled={true}
                                onChange={(e) =>
                                  setRolePermissions({
                                    ...rolePermissons,
                                    create: !rolePermissons?.create,
                                  })
                                }
                              />
                              </OverlayTrigger>
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                            <OverlayTrigger
                              placement="top"
                              delay={{ show: 100, hide: 400 }}
                              overlay={
                                  <Tooltip>Role Permission Only For Admin and Owner</Tooltip>
                              }
                            >
                              <input
                                type="checkbox"
                                name="updateRole"
                                checked={rolePermissons?.update}
                                disabled={true}
                                onChange={(e) =>
                                  setRolePermissions({
                                    ...rolePermissons,
                                    update: !rolePermissons?.update,
                                  })
                                }
                              />
                              </OverlayTrigger>
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                            <OverlayTrigger
                              placement="top"
                              delay={{ show: 100, hide: 400 }}
                              overlay={
                                  <Tooltip>Role Permission Only For Admin and Owner</Tooltip>
                              }
                            >
                              <input
                                type="checkbox"
                                name="viewRole"
                                checked={rolePermissons?.view}
                                disabled={true}
                                onChange={(e) =>
                                  setRolePermissions({
                                    ...rolePermissons,
                                    view: !rolePermissons?.view,
                                  })
                                }
                              />
                              </OverlayTrigger>
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                            <OverlayTrigger
                              placement="top"
                              delay={{ show: 100, hide: 400 }}
                              overlay={
                                  <Tooltip>Role Permission Only For Admin and Owner</Tooltip>
                              }
                            >
                              <input
                                type="checkbox"
                                name="deleteRole"
                                checked={rolePermissons?.delete}
                                disabled={true}
                                onChange={(e) =>
                                  setRolePermissions({
                                    ...rolePermissons,
                                    delete: !rolePermissons?.delete,
                                  })
                                }
                              />
                              </OverlayTrigger>
                            </div>
                          </td>
                        </tr>
                        <tr
                          className={
                            dropDownClass ? "card-table pr99" : "card-table"
                          }
                        >
                          <td>Announcements</td>
                          <td></td>
                          {/* <td>
                        <DropdownButton
                          as={ButtonGroup}
                          key={'end'}
                          id={`dropdown-button-drop-${'end'}`}
                          drop={'end'}
                          variant="secondary"
                          title={announcmentPermissions?.role_access?announcmentPermissions.role_access:"Role Access"}
                          onSelect={(item)=>setannouncementPermissions((prev)=>({...prev,role_access:item}))}
                          >
                            {dropDownList?.map(item=>{
                              return(
                                <>
                                <Dropdown.Item eventKey={item}>{item}</Dropdown.Item>
                                </>
                              )
                            })}
                        </DropdownButton>
                        </td> */}
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="createAnnouncement"
                                checked={announcmentPermissions?.create}
                                disabled={userRolePermission}
                                onChange={(e) =>
                                  setannouncementPermissions({
                                    ...announcmentPermissions,
                                    create: !announcmentPermissions?.create,
                                  })
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="updateAnnouncement"
                                checked={announcmentPermissions?.update}
                                disabled={userRolePermission}
                                onChange={(e) =>
                                  setannouncementPermissions({
                                    ...announcmentPermissions,
                                    update: !announcmentPermissions?.update,
                                  })
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="viewAnnouncement"
                                checked={announcmentPermissions?.view}
                                disabled={true}
                                onChange={(e) =>
                                  setannouncementPermissions({
                                    ...announcmentPermissions,
                                    view: !announcmentPermissions?.view,
                                  })
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="deleteAnnouncement"
                                checked={announcmentPermissions?.delete}
                                disabled={userRolePermission}
                                onChange={(e) =>
                                  setannouncementPermissions({
                                    ...announcmentPermissions,
                                    delete: !announcmentPermissions?.delete,
                                  })
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-style1 ">
                      <thead>
                        <tr>
                          <th>Task Permissions</th>
                          <th>Departments</th>
                          <th>Locations</th>
                          <th>Assignees</th>
                          <th>Update</th>
                          <th>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          className={
                            dropDownClass ? "card-table pr99" : "card-table "
                          }
                        >
                          <td className="">Task</td>
                          <td>
                            <OverlayTrigger
                              placement="top"
                              delay={{ show: 100, hide: 400 }}
                              overlay={
                                <Popover id="top">
                                  <Popover.Body>
                                    <p className="m-1">
                                      <strong>Me -</strong> My Department
                                    </p>
                                    <p className="m-1">
                                      <strong>Me+childs -</strong> My Department
                                      + Department Reporting to Me
                                    </p>
                                    <p className="m-1">
                                      <strong>Organization -</strong> Entire
                                      Organization{" "}
                                    </p>
                                  </Popover.Body>
                                </Popover>
                              }
                            >
                              <DropdownButton
                                as={ButtonGroup}
                                key={"end"}
                                id={`dropdown-button-drop-${"end"}`}
                                drop={"end"}
                                variant="secondary"
                                title={
                                  taskDepartmentPermissions?.role_access
                                    ? taskDepartmentPermissions.role_access
                                    : "Role Access"
                                }
                                onSelect={(item) => {
                                  setTaskDepartmentPermissions((prev) => ({
                                    ...prev,
                                    role_access: item,
                                  }));
                                  setTaskDepartmentPermissionError(false);
                                }}
                              >
                                {dropDownList?.map((item) => {
                                  return (
                                    <>
                                      <Dropdown.Item
                                        eventKey={item}
                                        onChange={() => alert(item)}
                                      >
                                        {item}
                                      </Dropdown.Item>
                                    </>
                                  );
                                })}
                              </DropdownButton>
                            </OverlayTrigger>
                          </td>
                          <td>
                            <OverlayTrigger
                              placement="top"
                              delay={{ show: 100, hide: 400 }}
                              overlay={   <Popover id="top">
                              <Popover.Body>
                                <p className="m-1">
                                  <strong>Me -</strong> My Locations
                                </p>
                                <p className="m-1">
                                  <strong>Me+childs -</strong> My Locations
                                  + Locations Reporting to Me
                                </p>
                                <p className="m-1">
                                  <strong>Organization -</strong> Entire
                                  Organization{" "}
                                </p>
                              </Popover.Body>
                            </Popover>}
                            >
                              <DropdownButton
                                as={ButtonGroup}
                                key={"end"}
                                id={`dropdown-button-drop-${"end"}`}
                                drop={"end"}
                                variant="secondary"
                                title={
                                  taskLocationPermissions?.role_access
                                    ? taskLocationPermissions.role_access
                                    : "Role Access"
                                }
                                onSelect={(item) => {
                                  setTaskLocationPermissions((prev) => ({
                                    ...prev,
                                    role_access: item,
                                  }));
                                  setTaskLocationPermissionError(false);
                                }}
                              >
                                {dropDownList?.map((item) => {
                                  return (
                                    <>
                                      <Dropdown.Item
                                        eventKey={item}
                                        onChange={() => alert(item)}
                                      >
                                        {item}
                                      </Dropdown.Item>
                                    </>
                                  );
                                })}
                              </DropdownButton>
                            </OverlayTrigger>
                          </td>
                          <td>
                              <DropdownButton
                                as={ButtonGroup}
                                key={"end"}
                                id={`dropdown-button-drop-${"end"}`}
                                drop={"end"}
                                variant="secondary"
                                title={
                                  taskAssignePermissions?.role_access
                                    ? taskAssignePermissions.role_access
                                    : "Role Access"
                                }
                                onSelect={(item) => {
                                  setTaskAssigneePermissions((prev) => ({
                                    ...prev,
                                    role_access: item,
                                  }));
                                  setTaskAssignePermissionError(false);
                                }}
                              >
                                {dropDownList?.map((item) => {
                                  return (
                                    <>
                                      <Dropdown.Item
                                        eventKey={item}
                                        onChange={() => alert(item)}
                                      >
                                        {item}
                                      </Dropdown.Item>
                                    </>
                                  );
                                })}
                              </DropdownButton>
                          </td>
                          <td className="ps-5">
                            {/* <Multiselect
                        options={taskUpadtePermissions}
                        placeholder={selectedTemplate?.length>=1?"":"choose access"}
                        displayValue="name"
                        showCheckbox={true}
                        selectedValues={selectedTemplate}
                        onSelect={selectTaskUpadte}
                        onRemove={onRemoveSlecetedItem}
                        closeOnSelect={true}
                  /> */}
                            <div className="role-modal">
                              <div className="d-flex gap-2 align-items-center pb-2  justify-content-between">
                                <Form.Check
                                  className="m-0 p-0 align-items-center  d-flex justify-content-center gap-2"
                                  type="checkbox"
                                  id="1"
                                  label="Assignee"
                                  checked={taskUpdatedDropPermissions.some(
                                    (item) =>
                                      item.field == "assignee" && item.is_enable
                                  )}
                                  onClick={() => selectTaskUpadte("assignee")}
                                />
                                {taskUpdatedDropPermissions.some(
                                  (item) =>
                                    item.field == "assignee" && item.is_enable
                                ) && (
                                  <DropdownButton
                                    as={ButtonGroup}
                                    key={"end"}
                                    id={`dropdown-button-drop-${"end"}`}
                                    drop={"end"}
                                    variant="secondary"
                                    title={selectedDropDownTitleCheck(
                                      "assignee"
                                    )}
                                    onSelect={(item) =>
                                      setSelectedTaskPermissions(
                                        "assignee",
                                        item
                                      )
                                    }
                                  >
                                    {dropDownList?.map((item) => {
                                      return (
                                        <>
                                          <Dropdown.Item
                                            eventKey={item}
                                            onChange={() => alert(item)}
                                          >
                                            {item}
                                          </Dropdown.Item>
                                        </>
                                      );
                                    })}
                                  </DropdownButton>
                                )}
                              </div>
                              <div className="d-flex gap-2 align-items-center pb-2 justify-content-between">
                                <Form.Check
                                  className="m-0 p-0 align-items-center d-flex justify-content-center gap-2"
                                  type="checkbox"
                                  id="2"
                                  label="start date"
                                  checked={taskUpdatedDropPermissions.some(
                                    (item) =>
                                      item.field == "startdate" &&
                                      item.is_enable
                                  )}
                                  onClick={() => selectTaskUpadte("startdate")}
                                />
                                {taskUpdatedDropPermissions.some(
                                  (item) =>
                                    item.field == "startdate" && item.is_enable
                                ) && (
                                  <DropdownButton
                                    as={ButtonGroup}
                                    key={"end"}
                                    id={`dropdown-button-drop-${"end"}`}
                                    drop={"end"}
                                    variant="secondary"
                                    title={selectedDropDownTitleCheck(
                                      "startdate"
                                    )}
                                    onSelect={(item) =>
                                      setSelectedTaskPermissions(
                                        "startdate",
                                        item
                                      )
                                    }
                                  >
                                    {dropDownList?.map((item) => {
                                      return (
                                        <>
                                          <Dropdown.Item
                                            eventKey={item}
                                            onChange={() => alert(item)}
                                          >
                                            {item}
                                          </Dropdown.Item>
                                        </>
                                      );
                                    })}
                                  </DropdownButton>
                                )}
                              </div>
                              <div className="d-flex gap-2 align-items-center pb-2  justify-content-between">
                                <Form.Check
                                  className="m-0 p-0 align-items-center d-flex justify-content-center gap-2"
                                  type="checkbox"
                                  id="3"
                                  label="due date"
                                  checked={taskUpdatedDropPermissions.some(
                                    (item) =>
                                      item.field == "duedate" && item.is_enable
                                  )}
                                  onClick={() => selectTaskUpadte("duedate")}
                                />
                                {taskUpdatedDropPermissions.some(
                                  (item) =>
                                    item.field == "duedate" && item.is_enable
                                ) && (
                                  <DropdownButton
                                    as={ButtonGroup}
                                    key={"end"}
                                    id={`dropdown-button-drop-${"end"}`}
                                    drop={"end"}
                                    variant="secondary"
                                    title={selectedDropDownTitleCheck(
                                      "duedate"
                                    )}
                                    onSelect={(item) =>
                                      setSelectedTaskPermissions(
                                        "duedate",
                                        item
                                      )
                                    }
                                  >
                                    {dropDownList?.map((item) => {
                                      return (
                                        <>
                                          <Dropdown.Item
                                            eventKey={item}
                                            onChange={() => alert(item)}
                                          >
                                            {item}
                                          </Dropdown.Item>
                                        </>
                                      );
                                    })}
                                  </DropdownButton>
                                )}
                              </div>
                              <div className="d-flex gap-2 align-items-center justify-content-between pb-2">
                                <Form.Check
                                  className="m-0 p-0 align-items-center d-flex justify-content-center gap-2"
                                  type="checkbox"
                                  id="4"
                                  label="Title"
                                  checked={taskUpdatedDropPermissions.some(
                                    (item) =>
                                      item.field == "title" && item.is_enable
                                  )}
                                  onClick={() => selectTaskUpadte("title")}
                                />
                                {taskUpdatedDropPermissions.some(
                                  (item) =>
                                    item.field == "title" && item.is_enable
                                ) && (
                                  <DropdownButton
                                    as={ButtonGroup}
                                    key={"end"}
                                    id={`dropdown-button-drop-${"end"}`}
                                    drop={"end"}
                                    variant="secondary"
                                    title={selectedDropDownTitleCheck("title")}
                                    onSelect={(item) =>
                                      setSelectedTaskPermissions("title", item)
                                    }
                                  >
                                    {dropDownList?.map((item) => {
                                      return (
                                        <>
                                          <Dropdown.Item
                                            eventKey={item}
                                            onChange={() => alert(item)}
                                          >
                                            {item}
                                          </Dropdown.Item>
                                        </>
                                      );
                                    })}
                                  </DropdownButton>
                                )}
                              </div>
                              <div className="d-flex gap-2 align-items-center justify-content-between">
                                <Form.Check
                                  className="m-0 p-0 align-items-center d-flex justify-content-center gap-2"
                                  type="checkbox"
                                  id="5"
                                  label="Approval"
                                  checked={taskUpdatedDropPermissions.some(
                                    (item) =>
                                      item.field == "approval" && item.is_enable
                                  )}
                                  onClick={() => selectTaskUpadte("approval")}
                                />
                                {taskUpdatedDropPermissions.some(
                                  (item) =>
                                    item.field == "approval" && item.is_enable
                                ) && (
                                  <DropdownButton
                                    as={ButtonGroup}
                                    key={"end"}
                                    id={`dropdown-button-drop-${"end"}`}
                                    drop={"end"}
                                    variant="secondary"
                                    title={selectedDropDownTitleCheck(
                                      "approval"
                                    )}
                                    onSelect={(item) =>
                                      setSelectedTaskPermissions(
                                        "approval",
                                        item
                                      )
                                    }
                                  >
                                    {dropDownList?.map((item) => {
                                      return (
                                        <>
                                          <Dropdown.Item
                                            eventKey={item}
                                            onChange={() => alert(item)}
                                          >
                                            {item}
                                          </Dropdown.Item>
                                        </>
                                      );
                                    })}
                                  </DropdownButton>
                                )}
                              </div>
                            </div>{" "}
                          </td>
                          <td>
                            <div className=" Checklist-check">
                              <input
                                type="checkbox"
                                name="deleteLocation"
                                checked={taskDelete}
                                disabled={userRolePermission}
                                onChange={(e) => setTaskDelete(!taskDelete)}
                              />
                            </div>
                          </td>
                        </tr>
                        {(taskDepartmentPermissionError ||
                          taskLocationPermissionError ||
                          assignePermissionError) && (
                          <tr>
                            <td></td>
                            <td>
                              {taskDepartmentPermissionError && (
                                <span className="text-danger">
                                  Please Select Department Permission
                                </span>
                              )}
                            </td>
                            <td>
                              {taskLocationPermissionError && (
                                <span className="text-danger">
                                  Please Select Location Permission
                                </span>
                              )}
                            </td>
                            <td>
                              {assignePermissionError && (
                                <span className="text-danger">
                                  Please Select Assignee Permission
                                </span>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            {!userRolePermission && (
              <Button
                variant="primary"
                onClick={() => (selectedRole ? updateRole() : createRole())}
              >
                {loading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <span> {selectedRole ? "Update Role" : "Create Role"} </span>
                )}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    );
}

export default CreateRole;