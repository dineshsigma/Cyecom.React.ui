import React from "react";
import { useState, useEffect } from "react";
import Board, { moveCard } from '@asseinfo/react-kanban'
import '@asseinfo/react-kanban/dist/styles.css'
import { getTasksforBoard, updateStatus } from "../redux/reducers/boardviewReducer";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import { getStatusConfig, getAllTaksStatus } from "../redux/reducers/statusConfigReducer";
import LoaderComponent from "../components/Loader";

function BoardView() {
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.auth.user_id);
    const org_id = useSelector((state) => state.auth.current_organization);
    const statusConfigList = useSelector(
        (state) => state.status.statusConfigList
    );
   
    // You need to control the state yourself.
    const [controlledBoard, setBoard] = useState();
    const [allStatus, setAllStatus] = useState([]);
    const [reviewIds, setReviewIds] = useState();
    const [closeId, setCloseId] = useState();
    const [loader, setLoader] = useState(true)
    const [destinationClosedId, setDestinationClosedId] = useState()

    let data = {
        "assignee": userId.toString(),
        "team_tasks": []
    }
    function handleCardMove(_card, source, destination) {
        const updatedBoard = moveCard(controlledBoard, source, destination);
        let object = {
            internal_status: controlledBoard.columns[destination.toColumnId - 1].title,
            id: _card.description.props.cardDetails.id
        }
        if (reviewIds.includes(source.fromColumnId)) {
            alert("Sorry can't move Review tasks")
            return;
        }

        if (closeId.includes(source.fromColumnId)) {
            alert("Sorry can't move In closed tasks")
            return;
        }
        if (closeId.includes(destination.toColumnId)) {
            alert("Sorry can't move to  closed tasks")
            return;
        }
        if (!reviewIds.includes(source.fromColumnId) || !closeId.includes(source.fromColumnId) || !closeId.includes(destination.toColumnId)) dispatch(updateStatus(object))
        setBoard(updatedBoard);
    }

    useEffect(() => {
        let statusLists = []
        let status = []
        let reviewIds = [];
        let closeId = [];
        let closedId;
        dispatch(getAllTaksStatus(org_id)).then((statusRes) => {
            if (statusRes?.payload?.org_childs?.length > 0) {
                statusLists = [...statusRes?.payload?.parents, ...statusRes?.payload?.org_childs]
            }
               else {
                statusLists = [...statusRes?.payload.parents,...statusRes?.payload?.base_childs]
               }
            statusLists?.map((list) => {
                let ob = {};
                let a = []

                if (list.parent_id == 4) {
                    reviewIds.push(list)
                }

                if (list.parent_id == 38) {
                    closeId.push(list)
                }

                if (list.org_id == 0 && list.parent_id == null) {
                    ob.id = list.id
                    ob.status = list.name
                    statusLists?.map((child) => {

                        if (list.id == child?.parent_id) {
                            a.push(child)
                            ob.internal = a
                        }
                    })
                    status.push(ob)
                }

            })
        })

        let finalData = [];
        let boar = {};
        dispatch(getTasksforBoard(data)).then((ressss) => {
            // let finalData = [];
            console.log(ressss)

            // let data;
            let final;
            let internal_status_list = []
            let olddata = ressss?.payload;
            
            let data = olddata?.map((item) => {
                let { attachmentCount,
                    commentCount,
                    subtaskClosedCount, totalSubtaskCount, task } = item
                return {
                    attachmentCount,
                    commentCount,
                    subtaskClosedCount,
                    totalSubtaskCount,
                    task: {
                        ...task,
                        attachmentCount,
                        commentCount,
                        subtaskClosedCount,
                        totalSubtaskCount
                    }
                }
            })
            console.log("data",data)
            let columns = []
            let globalId = 1;
            let ids = 1
            console.log("status",status)
            status?.forEach((each) => {
                each.internal.forEach((internal, id) => {
                    let obj = {}
                    let cards = []
                    obj.id = ids++;
                    if (each.status == "in-review") {
                        reviewIds.push(obj.id)
                    }
                    if (each.status == "closed") {
                        closeId.push(obj.id)
                    }
                    obj.title = internal.name
                    data?.forEach((item, id) => {
                        if (internal.name == item.task.internal_status) {
                            let specobj = {}
                            specobj.id = globalId++;
                            specobj.title = item.task.name;
                            specobj.description = <Card cardDetails={item.task} />
                            cards.push(specobj)
                        }
                    })
                    obj.cards = cards
                    columns.push(obj)
                })
            })

            //         data?.forEach((item, id) => {
            //             if (!internal_status_list.includes(item.task.internal_status)) internal_status_list.push(item.task.internal_status);
            //         })
            //         let columns = []
            //         let globalId = 1;
            //         internal_status_list.forEach((status,id) => {
            //             let obj = {}
            //             let cards = []
            //             obj.id = id+1;
            //             obj.title = status
            //             data?.forEach((item,id) => {
            //                 if (status == item.task.internal_status) {
            //                     let specobj = {}
            //                      specobj.id = globalId++;
            //                      specobj.title = item.task.name;
            //                      specobj.description = <Card cardDetails={item.task} />
            //                      cards.push(specobj)
            //                 }
            //             })
            //            obj.cards = cards
            //           columns.push(obj)
            //         })

            boar.columns = columns

            setReviewIds(reviewIds)
            setCloseId(closeId)

            // setTimeout(() => {
            // setDestinationClosedId(closedId)
            setBoard(boar)
            setLoader(false)
            // }, 2000)
        })
    }, [])

    return (
      <div>
        {loader && <LoaderComponent />}
        {controlledBoard ? ( 
         <>
            <section className="breadcum_section mb-2">
            <div className="container-fluid">
                <div className="row d-flex align-items-center justify-content-between">
                <div className="col-md-4">
                    <h2 className="bs_title">Board view</h2>
                </div>
                </div>
            </div>
            </section>
            <section>
                
            <div className="container-fluid">
                <div className="row">
                <div className="col-12">
                    <div className="boardcard_border" style={{ background: "white",padding:"10px"}}>
                        <Board onCardDragEnd={handleCardMove} disableColumnDrag>
                        {controlledBoard}
                        </Board>
                    </div>
                </div>
                </div>
            </div>
            </section>
        </> 
        ) : "No Data Found"}
      </div>
    );
}

export default BoardView