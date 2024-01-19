import * as d3 from 'd3';
import { OrgChart } from 'd3-org-chart';
import { useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLocationTreeData, setSelectedLocationDetails, setLocationUpdateForm } from '../redux/reducers/locationsReducer';
import {Container,Row,Col} from 'react-bootstrap';
const LocationTree = () => {
    const dispatch = useDispatch()
    const locationTreeData = useSelector((state) => state.location.locationTreeData)
    const [loading , setLoading]  = useState(true)
    const locationsList = useSelector((state) => state.location.locationsList)

    useEffect(() => {
        dispatch(getLocationTreeData())
    }, [])

    const nodeHandleFunction = (d,i, arr) => {
        let location = locationsList.find((item) => item.id == d)
        dispatch(setSelectedLocationDetails(location))
        dispatch(setLocationUpdateForm(true))
    }

    const renderTree = (treeData) => {
        let chart;
        setTimeout(() => {
            let data = treeData && JSON.parse(JSON.stringify(treeData));
            chart = new OrgChart()
                .container('.chart-container')
                .data(data)
                .nodeHeight((d) => 85)
                .nodeWidth((d) => {
                    return 220;
                })
                .childrenMargin((d) => 50)
                .compactMarginBetween((d) => 25)
                .siblingsMargin((d) => 25)
                .buttonContent(({ node, state }) => {
                    const hasChildren = node.children && node.children.length > 0;
                    const isExpanded = hasChildren && node._children !== node.children; // Check if the node is expanded
                  
                    const toggleNode = () => {
                      if (isExpanded) {
                        // Collapse the node
                        node._children = node.children;
                        node.children = null;
                      } else {
                        // Expand the node
                        node.children = node._children;
                        node._children = null;
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
                            d.data._upToTheRootHighlighted ? '#152785' : '#000000'
                        )
                        .attr('stroke-width', (d) =>
                            d.data._upToTheRootHighlighted ? 5 : 1
                        );

                    if (d.data._upToTheRootHighlighted) {
                        d3.select(this).raise();
                    }
                })
                .onNodeClick((d, i, arr) => nodeHandleFunction(d))
                .nodeContent(function (d, i, arr, state) {
                    const color = '#FFFFFF';
                    return `
                    <div class='tree-card' style="font-family:'Inter',sans-serif;background-color:${color};padding: 30px 18px 30px 18px;display:flex;align-items:center;box-shadow: 0 0 5px #0000000f;margin-left:-1px;width:${d.width}px;border-radius:10px;border: 2px solid #000000"font-family: 'Inter', sans-serif;>
                  <div class='texting-tops' style=' position: absolute;
                  top: -17px;
                  left: 5%;
                  border-radius: 41px;
                  padding: 2%;
                  border: 2px solid #000000; background:#fff;
                  line-height: 0;'>
                  <img src='https://happimobiles.s3.ap-south-1.amazonaws.com/test-images/svg/Vector+(5).svg' style='padding: 3px;width: 25px;height: 26px;'/>
                  </div> 
                  <button class='deatils-icons' ><img  src='https://happimobiles.s3.ap-south-1.amazonaws.com/test-images/svg/menu-vertical_svgrepo.com.svg' /></button>
                  <div style='display:flex;flex-direction:column;text-transform:capitalize;'> 
                  <div style="font-size:20px;color:#08011E;"> ${d.data.name} </div>
                    </div>  
                 </div>
              `;
                })                    // <div style="color:#716E7B;margin-left:20px;margin-top:3px;font-size:10px;" > ${d.data.positionName} </div>

                .render();
        }, 2000)

    }

    return (<>
        {renderTree(locationTreeData)}
        <section>
            <Container fluid>
                <Row>
                    <Col lg={12}>
                        <div className="chart-container" style={{ height: '1000px', backgroundColor: '#fffeff' }}></div >
                    </Col>
                </Row>
            </Container>
        </section>
    </>)

};

export default LocationTree;