import React, { useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
// import { useEffect } from "react";
import {
  getTasksOverview,
  getTaskOverviewGraph,
} from "../redux/reducers/dashboardReducer";
import { getStatusConfig } from "../redux/reducers/statusConfigReducer";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      align: "end",
      pointStyleWidth: "1",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        font: {
          size: "10",
        },
      },
    },
    title: {
      display: false,
      text: "Chart.js Line Chart",
    },
  },
};

// TO GET LAST 7 DATES
const today = new Date();
const dates = [];

// for (let i = 1; i >= 1; i--) {
//   const d = new Date(today);
//   d.setDate(today.getDate() - i);
//   const month = d.getMonth() + 1;
//   const date = d.getDate();
//   const dateString = `${date}/${month}`;
//   dates.push(dateString);
// }
// console.log("dates", dates);
const labels1 = dates;
// Dummy graph data
const openData = [10, 15, 20, 15, 13, 10, 10];
const inProgressData = [5, 6, 10, 4, 8, 7, 2];
const completedData = [5, 9, 10, 11, 5, 3, 8];
// const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
// console.log(faker.datatype.number({ min: 0, max: 20 }), "FFFFFFFFFFFFF");

export const data = {
  labels1,
  datasets: [
    {
      label: "open",
      data: labels1.map((item, index) => (item = openData[index])),
      borderColor: "#FC7D58",
      backgroundColor: "#FC7D58",
      borderWidth: "1",
      tension: 0.2,
    },
    {
      label: "inprogress",
      data: labels1.map((item, index) => (item = inProgressData[index])),
      borderColor: "#03a9f4",
      backgroundColor: "#03a9f4",
      borderWidth: "1",
      tension: 0.2,
    },
    {
      label: "Completed",
      data: labels1.map((item, index) => (item = completedData[index])),
      borderColor: "#38C976",
      backgroundColor: "#38C976",
      borderWidth: "1",
      tension: 0.2,
    },
  ],
};

//console.log("dataold.",data)
// let l = [], inprogress = [], inreview = [];
// for (let i = 0; i < query.rowCount; i++) {
//   l.push(query.rows[i].date);
//   if (query.rows[i].status == 'in-progress')
//     inprogress.push(query.rows[i].count)
//   else inreview.push(query.rows[i].count)
// }
// var data2 = { l,
//   datasets: [
//     { label: 'in-progress',
//     data: inprogress,
//     borderColor: "#FC7D58",
//      backgroundColor: "#FC7D58",
//      borderWidth: "1", tension: 0.2
//     },
//     { label: 'inreview',
//     data: inreview,
//      borderColor: "#FC7D58",
//      backgroundColor: "#FC7D58",
//       borderWidth: "1",
//       tension: 0.2
//     }] }

const TaskOverview = () => {
  const dispatch = useDispatch();
  const orgId = useSelector((state) => state.auth.current_organization);

  useEffect(() => {
    dispatch(getTaskOverviewGraph({ orgid: orgId }));
    dispatch(getStatusConfig());
  }, []);
  const getTasKoverviewList = useSelector(
    (state) => state.dashboard?.getTasksOverView
  );
  const statusConfigList = useSelector(
    (state) => state.status.statusConfigList
  );
  //  console.log("getTasKoverviewList", getTasKoverviewList);

  const labels = [];
  let inprogress = [],
    inreview = [];
  var inprogress_rawdata = {};
  var inreview_rawdata = {};
  let open_rawdata = {};
  let closed_rawdata = {};

  function isWithinLastSevenDays(dateStr) {
    const date = new Date(dateStr);

    const today = new Date();

    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return date >= sevenDaysAgo;
  }

  const lastSevenDaysRecords = Array.isArray(getTasKoverviewList)&&getTasKoverviewList?.filter((record) =>
    isWithinLastSevenDays(record?.date)
  );

  // console.log("lastSevenDaysRecords", lastSevenDaysRecords);
  for (let i = 0; i < lastSevenDaysRecords?.length; i++) {
    const originalDate = new Date(lastSevenDaysRecords[i].date);
    const formattedDate = originalDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
    // console.log("formattedDate",formattedDate);

    if (labels.indexOf(formattedDate) == -1)
      //labels.push(getTasKoverviewList[i].date)
      labels.push(formattedDate);

    if (getTasKoverviewList[i].status == "in-progress") {
      inprogress_rawdata[formattedDate] = parseInt(
        getTasKoverviewList[i].count
      );
      //inprogress.push(parseInt(getTasKoverviewList[i].count))
      //inreview.push(0)
    } else if (getTasKoverviewList[i].status == "in-review") {
      inreview_rawdata[formattedDate] = parseInt(getTasKoverviewList[i].count);

      // inreview.push(parseInt(getTasKoverviewList[i].count))
      // inprogress.push(0)
    } else if (getTasKoverviewList[i].status == "open") {
      open_rawdata[formattedDate] = parseInt(getTasKoverviewList[i].count);

      // inreview.push(parseInt(getTasKoverviewList[i].count))
      // inprogress.push(0)
    } else if (getTasKoverviewList[i].status == "closed") {
      closed_rawdata[formattedDate] = parseInt(getTasKoverviewList[i].count);

      // inreview.push(parseInt(getTasKoverviewList[i].count))
      // inprogress.push(0)
    }
  }

  //  console.log("label", labels);
  // console.log("inprogress", inprogress);
  // console.log("inreview", inreview);

  var data = {
    labels,
    datasets: [
      {
        label: 'Open',
        data: labels.map((item, index) => (item = open_rawdata[item])),
        borderColor: "#929292",
        backgroundColor: "#929292", 
        // borderColor: statusConfigList?.find((item,index)=>{return item?.name == 'open' && item?.org_id == 0 && item?.parent_id == null})?.color, 
        // backgroundColor: statusConfigList?.find((item,index)=>{return item?.name == 'open' && item?.org_id == 0 && item?.parent_id == null})?.color, 
        borderWidth: "1",
        tension: 0.2,
      },
      {
        label: 'In Progress',
        data: labels.map((item, index) => (item = inprogress_rawdata[item])),
        borderColor: statusConfigList?.find((item, index) => {
          return (
            item?.name == "in-progress" &&
            item?.org_id == 0 &&
            item?.parent_id == null
          );
        })?.color,
        backgroundColor: statusConfigList?.find((item, index) => {
          return (
            item?.name == "in-progress" &&
            item?.org_id == 0 &&
            item?.parent_id == null
          );
        })?.color,
        borderWidth: "1",
        tension: 0.2,
      },
      {
        label: 'In Review',
        data: labels.map((item, index) => (item = inreview_rawdata[item])), 
        borderColor: statusConfigList?.find((item,index)=>{return item?.name == 'in-review' && item?.org_id == 0 && item?.parent_id == null})?.color,
         backgroundColor: statusConfigList?.find((item,index)=>{return item?.name == 'in-review' && item?.org_id == 0 && item?.parent_id == null})?.color,
          borderWidth: "1",
        tension: 0.2
      },
      {
        label: 'Closed',
        data: labels.map((item, index) => (item = closed_rawdata[item])), 
        borderColor: "#78d700",
        backgroundColor: "#78d700",
        // borderColor: statusConfigList?.find((item,index)=>{return item?.name == 'closed' && item?.org_id == 0 && item?.parent_id == null})?.color, 
        // backgroundColor: statusConfigList?.find((item,index)=>{return item?.name == 'closed' && item?.org_id == 0 && item?.parent_id == null})?.color,
         borderWidth: "1",
        tension: 0.2
      }
    ]
  };

  // console.log("data0000000000000", data);

  // useEffect disabled as of now showing data static
  // useEffect(() => {
  //   let body = {
  //     object: {
  //       type: "self",
  //     },
  //   };
  //   dispatch(getTasksOverview(body));
  // }, []);

  // console.log("getTasKoverviewList",getTasKoverviewList)
  return (
    <div className="card task-card dashboard-card">
      <div className="task-header">
        <h4 className="m-0 pt-2">Task Overview</h4>
        {/* <button>SEE ALL</button> */}
      </div>
      <div>
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default TaskOverview;
