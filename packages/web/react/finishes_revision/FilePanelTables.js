import React from 'react';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';
import { DotsVerticalIcon } from '@heroicons/react/outline';


const DraggableRow = React.forwardRef(
  ({provided, snapshot, children}, ref) => (
    <tr
      className={snapshot.isDragging ? 'bg-blue-50' : ''}
      ref={ref}
      {...provided.draggableProps}
    >
      {provided.dragHandleProps && (
        <td>
          <div {...provided.dragHandleProps} className="flex justify-center text-gray-400 rounded group hover:bg-blue-50">
            <DotsVerticalIcon className="w-5 h-4 group-hover:text-blue-600" />
            <DotsVerticalIcon className="w-5 h-4 -ml-3.5 group-hover:text-blue-600" />
          </div>
        </td>
      )}
      {children}
    </tr>
  )
);

export const ActivePlansTable = ({
  plans=[],
  handleReorderPlans,
  toggleArchivePlan,
  setEditPlan,
  setShowHistory,
}) => {
  const adminMode = IS_SUPER_ADMIN;

  // const columnController = [
  //   { key: "order", displayName: "#", width: '50px' },
  //   { key: "name", displayName: "Name", width: '300px' },
  //   { key: "uploadedAt", displayName: "Uploaded At", width: '300px' },
  //   { key: "url", displayName: "Download File", width: '300px' },
  // ];
  
  // const controlsColumn = { key: '_controls', displayName: "Controls", width: '350px' };
  // const headerColumnController = [...columnController, controlsColumn];
  
  // const dragHandleColumnController = { key: '_drag', displayName: "", width: '40px' };
  // if (adminMode && plans.length > 1) headerColumnController.unshift(dragHandleColumnController);
  
  // const formattedCells = {
  //   order: (plan) => <>{plan.order + 1}</>,
  //   updatedAt: (plan) => <>{new Date(plan.uploadedAt).toLocaleDateString()} {new Date(plan.uploadedAt).toLocaleTimeString()}</>,
  //   url: (plan) => <a target="_blank" href={plan.url} className="text-blue-600 cursor-pointer">{plan.filename}</a>,
  // }
  

  const onDragEnd = ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    handleReorderPlans({ planId: draggableId, newOrderNum: destination.index });
  }
  
  return (
      // <section className="w-full py-5 overflow-x-auto">
        <div className="flex flex-col mt-10">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className=" bg-gray-50">
                    <tr>
                      <th/>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        #
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Uploaded At
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Download Files
                      </th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        <span>Controls</span>
                      </th>
                    </tr>
                  </thead>
                  {!(plans || []).length && (
                    <tbody className="bg-white divide-y divide-gray-200 ">
                      <tr className="text-sm text-gray-600 bg-white"><td>You have not added any files</td></tr>
                    </tbody>
                  )}
                  {!!(plans || []).length && (
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="plans" type="PLAN">
                        {(provided, _snapshot) => (
                          <tbody ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-gray-200 ">
                            {(plans || []).map((plan, idx) => (
                              <Draggable
                                key={plan.id}
                                draggableId={`${plan.id}`}
                                index={idx}
                                isDragDisabled={plans.length < 2}
                                type="PLAN"
                              >
                                {(provided, snapshot) => (
                                  <DraggableRow provided={provided} snapshot={snapshot} ref={provided.innerRef}>
                                    <td className="w-4 px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{plan.order + 1}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{plan.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{plan.uploadedAt}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{plan.role}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                      {!!(plan.PlanHistories || []).length && (
                                        <a onClick={() => setShowHistory(plan)} className="mr-2 text-indigo-600 hover:text-indigo-900">
                                          History
                                        </a>
                                      )}
                                      <a onClick={() => setEditPlan(plan)} className="mr-2 text-indigo-600 hover:text-indigo-900">
                                        Edit
                                      </a>
                                      <a onClick={() => toggleArchivePlan(plan.id)} className="text-indigo-600 hover:text-indigo-900">
                                        Archive
                                      </a>
                                    </td>
                                  </DraggableRow>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </tbody>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      // </section>
  );
};

export const ArchivedPlansTable = ({
  plans=[],
  toggleArchivePlan,
}) => {
  // const columnController = [
  //   { key: "name", displayName: "Name", width: '300px' },
  //   { key: "uploadedAt", displayName: "Uploaded At", width: '300px' },
  //   { key: "url", displayName: "Download File", width: '200px' },
  // ];
  // const controlsColumn = { key: '_controls', displayName: "Controls", width: '200px' }
  
  return (
    <div className="flex w-full mt-10">
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      Uploaded At
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      Download Link
                    </th>

                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Re-Activate</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!(plans || []).length && (
                    <tr className="text-sm text-gray-600 bg-white"><td>There are no archived files</td></tr>
                  )}
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{plan.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{plan.uploadedAt}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{plan.name}</td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <a onClick={() => toggleArchivePlan(plan.id)} className="text-indigo-600 hover:text-indigo-900">
                          Re-activate
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

