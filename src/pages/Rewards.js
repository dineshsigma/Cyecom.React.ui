import React, { useEffect, useState } from "react";
import { Button, Tabs, Tab, Accordion, Table, OverlayTrigger, Popover, Form } from "react-bootstrap";
import Switch from "react-switch";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { BiInfoCircle } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { getRewardsConfig, createRewardsConfig, updateRewardsConfig } from '../redux/reducers/rewardsReducer'
//getrewardsList




function Rewards() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let [checked, setChecked] = useState(true);
  const [originalData, setOriginalData] = useState([]);
  const rewardsConfigList = useSelector((state) => state.rewards.getrewardsList);
  const orgId = useSelector((state) => state.auth.current_organization);
  const [toogleVisibility, setToogleVisibility] = useState({});
  const [tempRewardsConfigList, setTempRewardsConfigList] = useState([]);
  useEffect(() => {
    dispatch(getRewardsConfig());
  }, [])
  useEffect(() => {
    setTempRewardsConfigList(rewardsConfigList);
    let data = rewardsConfigList.map((rewards) => ({
      ...rewards,
    }));

    setOriginalData(data);
  }, [rewardsConfigList])


  const handleEnable = (rewards, key, indexVal) => {
    const newtempRewardsList = [...tempRewardsConfigList];
    const index = newtempRewardsList.findIndex((rem) => rem.id == rewards.id);
    newtempRewardsList[index] = { ...rewards };
    if (newtempRewardsList[index][key]) {
      newtempRewardsList[index][key] = !newtempRewardsList[index][key];

    } else {
      newtempRewardsList[index][key] = true;
    }


    let filteredRewardss = newtempRewardsList.filter(
      (r) =>
        r.status === rewards.assignee_type &&
        r.priority === rewards.priority &&
        r.org_id === orgId
    );

    // console.log("filteredRewardss", filteredRewardss.length);
    if (filteredRewardss.length == 0) {
      filteredRewardss = newtempRewardsList.filter(
        (r) =>
          r.status === rewards.assignee_type &&
          r.priority === rewards.priority &&
          r.org_id === 0
      );
    }
    const toggle = filteredRewardss.some((r) => r["is_enable"]);

    setToogleVisibility((prev) => ({ ...prev, [indexVal]: toggle }));
    setTempRewardsConfigList(newtempRewardsList);

  };


  const handleLevels = (rewards, key, value, indexVal) => {
    const newtempRewardsList = [...tempRewardsConfigList];
    const index = newtempRewardsList.findIndex((rem) => rem.id == rewards.id);
    newtempRewardsList[index] = { ...rewards };
    // console.log(value);
    if (key === "created_by_rewards" || key === "reviewed_by_rewards" || key === "assigneed_to_rewards") {
      newtempRewardsList[index][key] = value;
    } else {
      newtempRewardsList[index][key] = !newtempRewardsList[index][key];
    }
    // console.log("newtempRewardsList[index][key]",newtempRewardsList[index][key])
    newtempRewardsList[index][key] = value;
    setTempRewardsConfigList(newtempRewardsList);
  };


  const rewardsRender = (rewards, assignee_type, priority, index) => {
    let allRewards = rewards?.filter((rewards) => rewards.assignee_type === assignee_type).filter((d) => d.priority === priority);
    let orgRewards = allRewards?.filter((item) => item.org_id == orgId);
    if (orgRewards?.length > 0) allRewards = orgRewards;
    // setAllRewards(allRewards);
    return allRewards?.map((rewarditem) => {
      return (
        <tr>
          <td>
            {rewarditem?.category.trim() == 'beforeduedate' ? 'Before Due Date' : rewarditem?.category.trim() == 'afterduedate' ? "After Due Date" : "Over Due Date"+" "+parseInt(rewarditem?.category?.split('overduedate')[1])}
          </td>
          <td>
            <Form.Check
              type="checkbox"
              id={`default-checkbox`}
              checked={rewarditem.is_enable}
              value={rewarditem.is_enable}
              onChange={(e) => {
                handleEnable(rewarditem, "is_enable", index);
              }}

            />
          </td>
          <td className="input_maxwithctrl">
            <Form.Group>
              <Form.Control required type="number" value={rewarditem.created_by_rewards} onChange={(e) => {
                handleLevels(rewarditem, "created_by_rewards", e.target.value);
              }} />
            </Form.Group>
          </td>
          <td className="input_maxwithctrl">
            <Form.Group>
              <Form.Control required type="number" value={rewarditem.assigneed_to_rewards} onChange={(e) => {
                handleLevels(rewarditem, "assigneed_to_rewards", e.target.value);
              }} />
            </Form.Group>
          </td>
          <td className="input_maxwithctrl">
            <Form.Group>
              <Form.Control required type="number" value={rewarditem.reviewed_by_rewards} onChange={(e) => {
                handleLevels(rewarditem, "reviewed_by_rewards", e.target.value);
              }} />
            </Form.Group>
          </td>
        </tr>
      )
    })
  }
  const toggleCheck=(assignee_type,priority)=>{
    let checkOrg=tempRewardsConfigList?.some(item=>item.org_id==orgId);
    let filterOrgData;
      if(checkOrg){
        filterOrgData=tempRewardsConfigList?.filter((item) => item.org_id == orgId);
      }
      if(!checkOrg){
        filterOrgData=tempRewardsConfigList?.filter((item) => item.org_id == 0)
      }
    // let filterOrgData=tempRewardsConfigList?.filter((item) => item.org_id == orgId);
    let checkisEnableData=filterOrgData.filter(item=>item.assignee_type===assignee_type&&item.priority===priority).some(item=>item.is_enable==true)
    // console.log("checkisEnableData",checkisEnableData)
    let data=[]
    let filterData=filterOrgData.map((item)=>{
      if(item.assignee_type===assignee_type&&item.priority===priority){
        if(checkisEnableData){
          return{
            ...item,is_enable:false
          }
        }
        if(!checkisEnableData){
          return{
            ...item,is_enable:true
          }
        }
       
      }
      else{
       return{
        ...item
       }
      }
    })
    setTempRewardsConfigList(filterData)
  }

  //clear ALLL Button 
  const clearButton = (assignee_type,priority) => {
    // console.log("assignee_type",assignee_type,"priority",priority);
    let checkOrg=tempRewardsConfigList.some(item=>item.org_id==orgId);
    let filterOrgData;
    if(checkOrg){
      filterOrgData=tempRewardsConfigList?.filter((item) => item.org_id == orgId);
    }
    if(!checkOrg){
      filterOrgData=tempRewardsConfigList?.filter((item) => item.org_id == 0);
    }
    // console.log("filterOrgData",filterOrgData)
    let filterRecords=filterOrgData.filter(item=>{
      // console.log("itemm",item)
        if(!(item.assignee_type==assignee_type&&item.priority==priority)){
        return {...item}
      }
    }
      );
    let orgfilter;
    if(checkOrg){
      orgfilter =originalData?.filter(item=>item.org_id == orgId).filter(item=>item.assignee_type==assignee_type&&item.priority==priority);
    }
    if(!checkOrg){
      orgfilter= originalData?.filter(item=>item.org_id == 0).filter(item=>item.assignee_type==assignee_type&&item.priority==priority);
    }
    let tempData=[...filterRecords,...orgfilter]
    setTempRewardsConfigList(tempData);
    // dispatch(getRewardsConfig());
  };

  //submit Rewards

  const SubmitRewards = (assignee_type, priority) => {
    let response = tempRewardsConfigList.filter((rewards) => rewards.assignee_type === assignee_type).filter((d) => d.priority === priority).filter((a) => a.org_id == orgId);
    let newdata = response.map((rewards) => ({ ...rewards }));
    // console.log("newdata---", newdata);
    if (newdata.length > 0) { ///write update query
      let originalResponse = [];
      for (let i = 0; i < newdata.length; i++) {
        newdata[i].org_id = orgId;
        originalResponse.push(newdata[i]);
      }
      // console.log("originalResponseuuuuuuuuuuuuu", originalResponse);
      //calling update query add dispatch
      dispatch(updateRewardsConfig(originalResponse))


    }
    else {//write create rewards for particular organization
      let response = tempRewardsConfigList.filter((rewards) => rewards.assignee_type === assignee_type).filter((d) => d.priority === priority).filter((a) => a.org_id == 0);
      let response1 = tempRewardsConfigList.filter((rewards) => rewards.assignee_type !== assignee_type || rewards.priority !== priority).filter((a) => a.org_id == 0);
      let entireData = response1.concat(response);
      let newdata = entireData.map((rewards) => ({ ...rewards }));
      let originalResponse = [];
      for (let i = 0; i < newdata.length; i++) {
        delete newdata[i].id;
        newdata[i].org_id = orgId;
        originalResponse.push(newdata[i]);
      }
      dispatch(createRewardsConfig(originalResponse)).then((response) => {
        dispatch(getRewardsConfig());
      })
    }
  }

 const  criticalCheck=(assignee_type,priority)=>{
  let allRewards = tempRewardsConfigList?.filter((rewards) => rewards?.assignee_type === assignee_type).filter((d) => d.priority === priority);
  let checkOrg=allRewards?.some(item=>item.org_id==orgId);
  let orgFilter;
  if(checkOrg){
    orgFilter=allRewards?.filter((item) => item.org_id == orgId);
  }
  if(!checkOrg){
    orgFilter=allRewards?.filter((item) => item.org_id == 0)
  }
  let fliterRewards=orgFilter.some((item)=>item.is_enable==true)
  return fliterRewards
 }
  return (
    <>
      <section className="breadcum_section">
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-3 masterback-btn">
            <Button
              className="primary_btn white_btn d-flex align-items-center justify-content-center"
              variant="light"
              size="md"
              onClick={() => navigate("/master")}
            >
              <FaArrowLeft />
            </Button>
            <h2 className="bs_title">Rewards Settings</h2>
          </div>
        </div>
      </section>
      <section className="remainders rewards">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="rounded bg-white px-3 py-4 Offcanvas_cust">
                <Tabs className="mb-4 gap-3 position-relative notification">
                  <Tab eventKey="Open" title="INDIVIDUAL">
                    <h2 className="mb-1">Rewards settings</h2>
                    <p className="mb-4">
                      Please select sub levels of settings below
                    </p>
                    <Accordion defaultActiveKey="0">
                      <Accordion.Item
                        eventKey="0"
                        className="accordian-chev-icon p-2 mb-2"
                      >
                        <div className="d-flex align-items-center">
                          <Accordion.Header>
                            <h2 className="m-0 ms-4">CRITICAL</h2>
                          </Accordion.Header>
                          <Switch height={18} width={38} id="" checked={criticalCheck("individual","critical")} 
                          onChange={()=>{  toggleCheck( "individual","critical")}                                 } />
                        </div>
                        <Accordion.Body className="ps-5 pt-0">
                          <div>
                            <h4 className="mb-1">
                             Rewards settings
                            </h4>
                            <p>
                              Please select sublevel of configartion setting below
                            </p>
                          </div>

                          <div>
                            <Table className="m-0">
                              <thead>
                                <tr>
                                  <th></th>
                                  <th>Enable/Disable</th>
                                  <th>
                                    CREATOR REWARDS
                                  </th>
                                  <th>
                                    ASSIGNED REWARDS
                                  </th>
                                  <th>
                                    REVIEWER REWARDS
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {rewardsRender(tempRewardsConfigList, 'individual', 'critical', 0)}
                              </tbody>
                            </Table>
                            <div className="task_transfer_footer d_aic_jce gap-2">
                              <button
                                id="addTask"
                                type="button"
                                className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                onClick={() => clearButton('individual', 'critical')}
                              >
                                Clear
                              </button>
                              <button
                                id="addTask"
                                type="button"
                                className="btn btn-primary mt-3 mb-2 "
                                onClick={() =>
                                  SubmitRewards("individual", "critical")
                                }
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                      <Accordion.Item
                        eventKey="1"
                        className="accordian-chev-icon p-2 mb-2"
                      >
                        <div className="d-flex align-items-center">
                          <Accordion.Header>
                            <h2 className="ms-4 m-0"> HIGH</h2>
                          </Accordion.Header>
                          <Switch height={18} width={38} id="" checked={criticalCheck('individual', 'high')} onChange={()=>{  toggleCheck('individual', 'high')}} />

                        </div>

                        <Accordion.Body className="ps-5 pt-0">
                          <h4>
                            Rewards settings
                          </h4>
                          <p>Please select sublevel of setting below</p>

                          <div>
                            <Table>
                              <thead>
                                <tr>
                                  <th></th>
                                  <th>Enable/Disable</th>
                                  <th>
                                    CREATOR REWARDS
                                  </th>
                                  <th>
                                    ASSIGNED REWARDS
                                  </th>
                                  <th>
                                    REVIEWER REWARDS
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {rewardsRender(tempRewardsConfigList, 'individual', 'high', 1)}
                              </tbody>
                            </Table>
                            <div className="task_transfer_footer  d_aic_jce gap-2">
                              <button
                                id="addTask"
                                type="button"
                                className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                onClick={() => clearButton('individual', 'high')}
                              >
                                Clear
                              </button>
                              <button
                                id="addTask"
                                type="button"
                                className="btn btn-primary mt-3 mb-2 "
                                onClick={() =>
                                  SubmitRewards("individual", "high")
                                }
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                      <Accordion.Item
                        eventKey="2"
                        className="accordian-chev-icon p-2 mb-2"
                      >
                        <div className="d-flex align-items-center">
                          <Accordion.Header>
                            <h2 className="ms-4 m-0"> MEDIUM </h2>
                          </Accordion.Header>
                          <Switch height={18} width={38} checked={criticalCheck('individual', 'medium')} onChange={()=>{  toggleCheck( "individual","medium")}} />
                        </div>

                        <Accordion.Body className="ps-5 pt-0">
                          <div>
                            <h4>
                             Rewards settings
                            </h4>
                            <p>
                              Please select sublevel of setting below
                            </p>
                          </div>
                          <div>
                            <Table>
                              <thead>
                                <tr>
                                  <th></th>
                                  <th>Enable/Disable</th>
                                  <th>
                                    CREATOR REWARDS
                                  </th>
                                  <th>
                                    ASSIGNED REWARDS
                                  </th>
                                  <th>
                                    REVIEWER REWARDS
                                  </th>
                                  
                                </tr>
                              </thead>
                              <tbody>
                                {rewardsRender(tempRewardsConfigList, 'individual', 'medium', 2)}
                              </tbody>
                            </Table>
                            <div className="task_transfer_footer  d_aic_jce gap-2">
                              <button
                                id="addTask"
                                type="button"
                                className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                onClick={() => clearButton("individual","medium")}
                              >
                                Clear
                              </button>
                              <button
                                id="addTask"
                                type="button"
                                className="btn btn-primary mt-3 mb-2 "
                                onClick={() =>
                                  SubmitRewards("individual", "medium")
                                }
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                      <Accordion.Item
                        eventKey="3"
                        className="accordian-chev-icon p-2 mb-2"
                      >
                        <div className="d-flex align-items-center">
                          <Accordion.Header>
                            <h2 className="ms-4 m-0"> LOW</h2>
                          </Accordion.Header>
                          <Switch height={18} width={38} checked={criticalCheck('individual', 'low')} onChange={()=>{  toggleCheck( "individual","low")}} />
                        </div>
                        <Accordion.Body className="ps-5 pt-0">
                          <div>
                            <h4>
                             Rewards settings
                            </h4>
                            <p>
                              Please select sublevel of setting below
                            </p>
                          </div>

                          <div>
                            <Table>
                              <thead>
                                <tr>
                                  <th></th>
                                  <th>Enable/Disable</th>
                                  <th>
                                    CREATOR REWARDS
                                  </th>
                                  <th>
                                    ASSIGNED REWARDS
                                  </th>
                                  <th>
                                    REVIEWER REWARDS
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {rewardsRender(tempRewardsConfigList, 'individual', 'low', 3)}
                              </tbody>
                            </Table>
                            <div className="task_transfer_footer  d_aic_jce gap-2">
                              <button
                                id="addTask"
                                type="button"
                                className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                onClick={() => clearButton("individual","low")}
                              >
                                Clear
                              </button>
                              <button
                                id="addTask"
                                type="button"
                                className="btn btn-primary mt-3 mb-2 "
                                onClick={() =>
                                  SubmitRewards("individual", "low")
                                }
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </Tab>
                  <Tab eventKey="In Progress" title="GROUP">
                    <div>
                      <h2 className="mb-1">Rewards settings</h2>
                      <p
                        className="select-sublevel"
                        style={{ "padding-left": "5px" }}
                      >
                        Please select sub levels of settings below
                      </p>
                    </div>
                    <div>
                      <Accordion defaultActiveKey="0">
                        <Accordion.Item
                          eventKey="0"
                          className="accordian-chev-icon p-2 mb-2"
                        >
                          <div className="d-flex align-items-center">
                            <Accordion.Header>
                              <h2 className="ms-4 m-0">CRITICAL</h2>
                            </Accordion.Header>
                            <Switch height={18} width={38} checked={criticalCheck('group', 'critical')} onChange={()=>{  toggleCheck( "group","critical")}} />
                          </div>

                          <Accordion.Body className="ps-5 pt-0">
                            <div>
                              <h4>
                               Rewards settings 
                              </h4>
                              <p>
                                Please select sublevel of setting below
                              </p>
                            </div>
                            <div>
                              <Table>
                                <thead>
                                  <tr>
                                    <th></th>
                                    <th>Enable/Disable</th>
                                    <th>
                                      CREATOR REWARDS
                                    </th>
                                    <th>
                                      ASSIGNED REWARDS
                                    </th>
                                    <th>
                                      REVIEWER REWARDS
                                    </th>
                                  </tr>
                                </thead>
                                <tbody> {rewardsRender(tempRewardsConfigList, 'group', 'critical', 4)}</tbody>
                              </Table>
                              <div className="task_transfer_footer  d_aic_jce gap-2">
                                <button
                                  id="addTask"
                                  type="button"
                                  className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                  onClick={() => clearButton()}
                                >
                                  Clear
                                </button>
                                <button
                                  id="addTask"
                                  type="button"
                                  className="btn btn-primary mt-3 mb-2 "
                                  onClick={() =>
                                    SubmitRewards("group", "critical")
                                  }
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item
                          eventKey="1"
                          className="accordian-chev-icon p-2 mb-2"
                        >
                          <div className="d-flex align-items-center">
                            <Accordion.Header>
                              <h2 className="ms-4 m-0">HIGH</h2>
                            </Accordion.Header>
                            <Switch height={18} width={38} checked={criticalCheck('group', 'high')} onChange={()=>{  toggleCheck( "group","high")}}/>
                          </div>
                          <Accordion.Body className="ps-5 pt-0">
                            <div>
                              <h4>
                               Rewards settings
                              </h4>
                              <p>
                                Please select sublevel of setting below
                              </p>
                            </div>
                            <div>
                              <Table>
                                <thead>
                                  <tr>
                                    <th></th>
                                    <th>Enable/Disable</th>
                                    <th>
                                      CREATOR REWARDS
                                    </th>
                                    <th>
                                      ASSIGNED REWARDS
                                    </th>
                                    <th>
                                      REVIEWER REWARDS
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>{rewardsRender(tempRewardsConfigList, 'group', 'high', 5)}</tbody>
                              </Table>
                              <div className="task_transfer_footer  d_aic_jce gap-2">
                                <button
                                  id="addTask"
                                  type="button"
                                  className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                  onClick={() => clearButton()}
                                >
                                  Clear
                                </button>
                                <button
                                  id="addTask"
                                  type="button"
                                  className="btn btn-primary mt-3 mb-2 "
                                  onClick={() =>
                                    SubmitRewards("group", "high")
                                  }
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item
                          eventKey="2"
                          className="accordian-chev-icon p-2 mb-2"
                        >
                          <div className="d-flex align-items-center">
                            <Accordion.Header>
                              <h2 className="ms-4 m-0">MEDIUM</h2>
                            </Accordion.Header>
                            <Switch height={18} width={38} checked={criticalCheck('group', 'medium')} onChange={()=>{  toggleCheck( "group","medium")}} />
                          </div>
                          <Accordion.Body className="ps-5 pt-0">
                            <div>
                              <h4>
                               Rewards settings
                              </h4>
                              <p>
                                Please select sublevel of setting below
                              </p>
                            </div>
                            <div>
                              <Table>
                                <thead>
                                  <tr>
                                    <th></th>
                                    <th>Enable/Disable</th>
                                    <th>
                                      CREATOR REWARDS
                                    </th>
                                    <th>
                                      ASSIGNED REWARDS
                                    </th>
                                    <th>
                                      REVIEWER REWARDS
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rewardsRender(tempRewardsConfigList, 'group', 'medium', 6)}
                                </tbody>
                              </Table>
                              <div className="task_transfer_footer  d_aic_jce gap-2">
                                <button
                                  id="addTask"
                                  type="button"
                                  className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                  onClick={() => clearButton()}
                                >
                                  Clear
                                </button>
                                <button
                                  id="addTask"
                                  type="button"
                                  className="btn btn-primary mt-3 mb-2 "
                                  onClick={() =>
                                    SubmitRewards("group", "medium")
                                  }
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item
                          eventKey="3"
                          className="accordian-chev-icon p-2 mb-2"
                        >
                          <div className="d-flex align-items-center">
                            <Accordion.Header>
                              <h2 className="ms-4 m-0">LOW</h2>
                            </Accordion.Header>
                            <Switch height={18} width={38} checked={criticalCheck('group', 'low')} onChange={()=>{ toggleCheck( "group","low")}} />

                          </div>

                          <Accordion.Body className="ps-5 pt-0">
                            <div>
                              <h4>
                               Rewards settings
                              </h4>
                              <p>
                                Please select sublevel of setting below
                              </p>
                            </div>

                            <div>
                              <Table>
                                <thead>
                                  <tr>
                                    <th></th>
                                    <th>Enable/Disable</th>
                                    <th>
                                      CREATOR REWARDS
                                    </th>
                                    <th>
                                      ASSIGNED REWARDS
                                    </th>
                                    <th>
                                      REVIEWER REWARDS
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rewardsRender(tempRewardsConfigList, 'group', 'low', 7)}
                                </tbody>
                              </Table>
                              <div className="task_transfer_footer  d_aic_jce gap-2">
                                <button
                                  id="addTask"
                                  type="button"
                                  className="btn btn-secondary mb-2 mt-3 cancel_btn"
                                  onClick={() => clearButton()}
                                >
                                  Clear
                                </button>
                                <button
                                  id="addTask"
                                  type="button"
                                  className="btn btn-primary mt-3 mb-2 "
                                  onClick={() =>
                                    SubmitRewards("group", "low")
                                  }
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Rewards