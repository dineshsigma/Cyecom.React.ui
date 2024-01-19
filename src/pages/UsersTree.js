import * as d3 from 'd3';
import { OrgChart } from 'd3-org-chart';
import { useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {getUsersTree,setUserUpdateForm,setSelectedOrgUser,setSelectedUser} from "../redux/reducers/userReducer";
import { Container,Row,Col } from 'react-bootstrap';
import LoaderComponent from "../components/Loader";


const UsersTree = () => {
    const dispatch = useDispatch()
    const usersTreeData = useSelector((state) => state.users.usersTreeData);
    console.log("usersTreeData",usersTreeData)
    const loader=useSelector((state)=>state.users.userTreeLoader);
    const usersList = useSelector((state) => state.users.usersList);
    const userOrgData = useState(localStorage.getItem("userOrgData")&&JSON.parse(localStorage.getItem("userOrgData")));
    const orgUsersList = useSelector((state) => state.users.orgUsersList);
    const orgId = useSelector((state) => state.auth.current_organization);
    let expanded;
    useEffect(() => {
        dispatch(getUsersTree())
    }, [])
    function calculateTotalChildCount(node) {
        let totalChildCount = 0;
    
        if (node.children) {
            totalChildCount += node.children.length; // Count visible children
    
            // Recursively count the total child count of each child node
            node.children.forEach(child => {
                totalChildCount += calculateTotalChildCount(child);
            });
        }
    
        if (node._children) {
            totalChildCount += node._children.length; // Count hidden children
            // Recursively count the total child count of each hidden child node
            node._children.forEach(child => {
                totalChildCount += calculateTotalChildCount(child);
            });
        }
    
        return totalChildCount;
    }
    
    function customLayout(d) {
        if (d.children) {
            const availableWidth = d.x1 - d.x0;
            const nodeCount = d.children.length;
            const horizontalSpacing = availableWidth / (nodeCount + 1); // Equal spacing
    
            d.children.forEach((child, index) => {
                child.x0 = d.x0 + (index + 1) * horizontalSpacing;
                child.x1 = child.x0;
                customLayout(child);
            });
        }
    }
    

    const nodeHandleFunction = (d, i, arr) => {
        let orgData = {
            location_id: 0,
            department_id: 0,
            role_id: 0,
            reporting_manager: 0,
            designation_id: 0,
            org_id: orgId,
        };
        let userData = {
            name: "",
            lastname: "",
            email: "",
            phone: "",
            login_type: "",
            password: "",
            pin: "",
        };
        let userDetails = usersList?.find((item) => item.id === d);
        let userOrgDetails = orgUsersList?.find((item) => item.user_id === d);
        if (userOrgDetails !== undefined) {
            dispatch(setSelectedOrgUser(userOrgDetails))
        } else {
            dispatch(setSelectedOrgUser(orgData))
        }
        if (userDetails) {
            dispatch(setSelectedUser(userDetails))
        } else {
            dispatch(setSelectedUser(userData))
        }
        dispatch(setUserUpdateForm(true));
    }
    const calculateChildCount = (data) => {
        let count = 0;
        if (data && data.children && data.children.length > 0) {
          count = data.children.length;
          data.children.forEach((child) => {
            count += calculateChildCount(child);
          });
        }
        return count;
      };

    const linkGenerator = d3.linkHorizontal()
  .x(d => d.x)
  .y(d => d.y);

// Adding linkGroupArc
const linkGroupArc = d3.linkHorizontal()
  .x(d => d.x)
  .y(d => d.y);
    const renderTree = (treeData) => {
        let chart;
        setTimeout(() => {
            let data = treeData && JSON.parse(JSON.stringify(treeData));
            chart = new OrgChart()
                .container('.chart-container')
                .data(data)
                .nodeHeight((d) => 95)
                .nodeWidth((d) => {
                    return 250;
                })
                .childrenMargin((d) => 50)
                .compactMarginPair((d) => 100)
                .compactMarginBetween((d) => 20)
                .siblingsMargin((d) => 25)
                // .buttonContent(({ node, state }) => {
                //     return `<div style="color:white;border-radius:50%;height:26px;width:26px;display:flex;align-items:center;justify-content:center;margin:auto;background-color:#ed2169;border: 1px solid #E4E2E9"> 
                //     <span style="font-size:9px">
                //      <img src='https://happimobiles.s3.ap-south-1.amazonaws.com/test-images/svg/minus.svg' style='width:14px;height:10px;'/>
                //     ${node.children
                //             ? `<i className="fas fa-angle-up"></i>`
                //             : `<i className="fas fa-angle-down"></i>`
                //         }
                //         </span>  
                //         </div>`;
                // })
                .buttonContent(({ node, state }) => {
                    const hasChildren = node.children && node.children.length > 0;
                    const isExpanded = hasChildren && node._children !== node.children; // Check if the node is expanded
                  
                    const toggleNode = () => {
                      if (isExpanded) {
                        // Collapse the node
                        node._children = node.children;
                        node.children = null;
                        expanded=true
                      } else {
                        // Expand the node
                        node.children = node._children;
                        node._children = null;
                        expanded=false
                      }
                  
                      // Call the chart's update method to redraw the chart with the updated node
                      chart.update();
                    };
                  
                    return `
                      <div style="color:white;border-radius:50%;height:26px;width:26px;display:flex;align-items:center;justify-content:center;margin:auto;background-color:#ed2169;border: 1px solid #E4E2E9" onclick="(${toggleNode})()"> 
                        <span style="font-size:20px">
                        ${isExpanded?'-':'+'}
                        </span>  
                      </div>`;
                  })
                .linkUpdate(function (d, i, arr) {
                    d3.select(this)
                        .attr('stroke', (d) =>
                            d.data._upToTheRootHighlighted ? '#152785' : '#E4E2E9'
                        )
                        .attr('stroke-width', (d) =>
                            d.data._upToTheRootHighlighted ? 5 : 1
                        );

                    if (d.data._upToTheRootHighlighted) {
                        d3.select(this).raise();
                    }
                })
                .onNodeClick((d, i, arr) =>{
                    if((userOrgData?.[0]?.role_id == 1 ||userOrgData?.[0]?.role_id == 2)){
                        nodeHandleFunction(d, i, arr)
                    } })
                .nodeContent(function (d, i, arr, state) {
                    const color = '#FFFFFF';
                    //Added nested ternary condition to check for children available or _children available for both opena and closed condition
                    const childCount = d.children ? d.children.length : d._children ? d._children.length : 0;
                    let content = '';
    if (d.data.image) {
        content += `<div class='top-icon-users'><img src='${d.data.image}'/></div>`;
    } else {
        const initials = (d.data.name?.charAt(0).toUpperCase() + d.data?.name?.charAt(1).toUpperCase());
        content += `<div class='top-icon-users d_aic_jcc'><p className="users-avatar-img d_aic_jcc m-0">${initials}</p></div>`;
    }

    if((userOrgData?.[0]?.role_id == 1 ||
        userOrgData?.[0]?.role_id == 2)){
        content+= `<button class='deatils-icons'>
            <img src='https://happimobiles.s3.ap-south-1.amazonaws.com/test-images/svg/menu-vertical_svgrepo.com.svg' />
        </button>`
    }
   
    content += `
        
        <div class='side-user-img' style='display:none'>
            <img src='https://happimobiles.s3.ap-south-1.amazonaws.com/test-images/svg/1+Wrm0UtVJZH8Gl_vsOWBYyg+1.svg' />
        </div>
        <div style='display:flex;flex-direction:column;text-transform:capitalize;'> 
            <div class='user-name-tree'>${d.data.name}</div>
            <div class='user-designation-tree'>${d.data.designation}</div>
            <p><span>${childCount}</span>Members</p>
        </div>
    `;

    return `
        <div class='tree-card' style="font-family:'Inter',sans-serif;background-color:${color};padding:15px 18px 10px 18px;display:flex;align-items:center;box-shadow: 0 0 5px #0000000f;margin-left:-1px;width:${d.width}px;border-radius:10px;border: 1px solid #E4E2E9"font-family: 'Inter', sans-serif;">
            ${content}
        </div>
    `;
                })  
                                  // <div style="color:#716E7B;margin-left:20px;margin-top:3px;font-size:10px;" > ${d.data.positionName} </div>

                .render();
        }, 2000)

    }

    // <div className='sub-label'> ${d.data.parentId} <label style='color:#737373'> Members</label> </div>

    return (<>
    {loader?<LoaderComponent/>:
    <>
        {usersTreeData?.length > 0 && renderTree(usersTreeData)}
        <section>
            <Container fluid>
                <Row>
                    <Col lg={12}>
                        <div className="chart-container" style={{ height: '100%', backgroundColor: '#fffeff' }}></div>
                    </Col>
                </Row>
            </Container>
        </section>
        </>}
    </>)
};

export default UsersTree;



 //<button class='deatils-icons'>
   // <img src='https://happimobiles.s3.ap-south-1.amazonaws.com/test-images/svg/menu-vertical_svgrepo.com.svg' />
    //</button>