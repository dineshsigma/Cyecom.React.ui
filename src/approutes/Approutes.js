import { Route, Routes } from "react-router-dom";
import SideBar from "../components/Sidebar/SideBar";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Master from "../pages/Master";
import FileManager from "../pages/FileManager";
import Setting from "../pages/Setting";
import Login from "../pages/Login";
import Departments from "../pages/Departments";
import Locations from "../pages/Locations"
import Designations from '../pages/Designations'
import Organizations from '../pages/Organizations'
import Groups from '../pages/Groups'
import Taskslist from '../pages/Tasklists'
import TaskDetails from '../pages/TaskDetails'
import SignUp from "../pages/Signup";
import { useSelector } from "react-redux";
import UserDetails from "../pages/UserDetails";
import OrganisationDetails from "../pages/organisationDetails";
import Otp from "../pages/otp";
import Help from '../pages/Help'
import Tickets from '../pages/Tickets'
import Announcements from "../pages/Announcements";
import PersonalTodo from "../pages/PersonalTodo";
import ReccuringTaskList from "../pages/ReccuringTaskList";
import Raised_new_Tickets from "../pages/Raised_Tickets";
import Header from '../components/Header'
import DraftTaskslist  from '../pages/DraftTaskList'
import ProfileNew from '../pages/Profile-new'
import  RoleManagement  from "../pages/Roles";
import LocationTree from '../pages/LocationTree';
import Ticket_new_Details from "../pages/Ticket_Details";
import RaisedTickets from "../pages/RaisedTickets";
import PriorityConfig from "../pages/PriorityConfig";
import StatusConfig from "../pages/StatusConfig";
import UsersTree from '../pages/UsersTree';
import ReminderSettings from "../pages/ReminderSettings";
import Approvals from "../pages/Approvals";
import MyApprovals from "../pages/MyApprovals";
import HighPriorityTaskslist from "../pages/Highprioritytasks";
import BoardData from "../pages/BoardData";
import Rewards from "../pages/Rewards";
import BoardView from "../pages/BoardView";
import Rankinglist from "../pages/RankingList";
import Reports from "../pages/Reports";
import EmailVerified from "../pages/EmailVeified";
import Upcomigtasks from "../pages/Upcomigtasks";
import CreatedBy from "../pages/CreatedBy";
import { useState } from "react";


const Approutes = () => {
    const accessToken = useSelector((state) => state.auth.accessToken)
    const access_Token=useState(localStorage.getItem("token"))
    return (<div>
        {accessToken ?
            <>
                <SideBar> 
                    <Header />
                    <Routes>
                        <Route path="" element={<Dashboard />} />
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/master/users" element={<Users />} />
                        <Route path="/master" element={<Master />} />
                        <Route path="/master/roles" element={<RoleManagement />} />
                        <Route path="/file-manager" element={<FileManager />} />
                        <Route path="/profile-new" element={<ProfileNew />} />
                        <Route path="/saved" element={<LocationTree />} />
                        <Route path="/settings" element={<Setting />} />
                        <Route path="/master/departments" element={<Departments />} />
                        <Route path="/master/teams" element={<Groups />} />
                        <Route path="/master/designations" element={<Designations />} />
                        <Route path="/master/organizations" element={<Organizations />} />
                        <Route path="/master/locations" element={<Locations />} />
                        <Route path="/taskslist" element={<Taskslist />} />
                        <Route path="/myapprovals" element={<MyApprovals />} />
                        <Route path="/drafttasks" element={<DraftTaskslist />} />
                        <Route path="/profile" element={<ProfileNew />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="/tickets" element={<Raised_new_Tickets />} />
                        <Route path="/announcements" element={<Announcements />} />
                        <Route path="/personaltodo" element={<PersonalTodo />} />
                        <Route path="/raisedtickets/:id" element={<Ticket_new_Details />} />
                        <Route path="/recurringtasklist" element={<ReccuringTaskList />} />
                        <Route path="/highprioritytasks" element={<HighPriorityTaskslist/>}/>
                        <Route path="/taskdetails/:id" element={<TaskDetails/>} />
                        <Route path="*" element={<> not found</>} />
                        <Route path="/taskdetails/:id" element={<TaskDetails />} />
                        <Route path="/master/priority" element={<PriorityConfig />} />
                        <Route path="/master/status" element={<StatusConfig />} />
                        <Route path="/master/reminder" element={<ReminderSettings />} />
                        <Route path="/master/approvals" element={<Approvals />} />
                        <Route path="/boarddata" element={<BoardData />} />
                        <Route path="/boardview" element={<BoardView />} />
                        <Route path="/master/rewards" element={<Rewards />} />
                        <Route path="/rankinglist" element={<Rankinglist />} />
                        <Route path="/master/reports" element={<Reports />} />
                        <Route path="/upcomingtasks" element={<Upcomigtasks />} />
                        <Route path="/createdby" element={<CreatedBy />} />
                        <Route path="*" element={<> not found</>} />
                </Routes> 
                </SideBar>
            </> : <>
                <Routes>
                    <Route path="/signup" element={<SignUp />}></Route>
                    <Route path="/signup/userdetails" element={<UserDetails />}></Route>
                    <Route path="/signup/organisationdetails" element={<OrganisationDetails />}></Route>
                    <Route path="/signup/otp" element={<Otp />}></Route>
                    <Route path="/" element={<Login />} />
                    <Route path="*" element={<Login />} />
                    <Route path="/emailverified" element={<EmailVerified />}/>
                </Routes>
            </>
        }


    </div>)
}

export default Approutes;