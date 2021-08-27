import React from 'react';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';
import { DotsVerticalIcon } from '@heroicons/react/outline';

import FocusEditableInput from '../components/FocusEditableInput';


const dateOptions = { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "numeric" }


const DraggableRow = React.forwardRef(
  ({provided, snapshot, children}, ref) => (
    <tr
      className={snapshot.isDragging ? 'bg-blue-50' : ''}
      ref={ref}
      {...provided.draggableProps}
    >
      {provided.dragHandleProps && (
        <td className="p-2">
          <div {...provided.dragHandleProps} className="flex justify-center py-1 text-gray-400 rounded group hover:bg-blue-50">
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
  handleEditPlanName,
  toggleArchivePlan,
  setEditPlan,
  setShowHistory,
}) => {
  const adminMode = IS_SUPER_ADMIN;

  const onDragEnd = ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    handleReorderPlans({ planId: draggableId, newOrderNum: destination.index });
  }
  
  return (
    <div className="flex flex-col mt-10">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className=" bg-gray-50">
                <tr>
                  {adminMode && <th/>}
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
                    Uploaded
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Download
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Controls
                  </th>
                </tr>
              </thead>
              {!(plans || []).length && (
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="text-gray-600 bg-white">
                    <td className="px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap max-w-0">
                      You have not added any files
                    </td>
                  </tr>
                </tbody>
              )}
              {!!(plans || []).length && (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="plans" type="PLAN">
                    {(provided, _snapshot) => (
                      <tbody ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-gray-200 ">
                        {(plans || []).map((p, idx) => (
                          <Draggable
                            key={p.id}
                            draggableId={`${p.id}`}
                            index={idx}
                            isDragDisabled={!adminMode}
                            type="PLAN"
                          >
                            {(provided, snapshot) => (
                              <DraggableRow provided={provided} snapshot={snapshot} ref={provided.innerRef}>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {p.order + 1}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  <div className="truncate" style={{ width: 225 }}>
                                    <FocusEditableInput
                                      editable={adminMode}
                                      value={p.name}
                                      onUpdate={(newName) => handleEditPlanName(p.id, newName)}
                                    />
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {new Date(p.uploadedAt).toLocaleDateString('en', dateOptions)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  <div className="truncate" style={{ maxWidth: 200 }}>
                                    <a href={(p.Document || {}).s3Url} className="mr-2 text-indigo-600 cursor-pointer hover:text-indigo-900" target="_blank">
                                      {(p.Document || {}).filename}
                                    </a>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                  {adminMode && (
                                    <>
                                      <a onClick={() => setEditPlan(p)} className="mr-2 text-indigo-600 cursor-pointer hover:text-indigo-900">
                                        Edit
                                      </a>
                                      <a onClick={() => toggleArchivePlan(p.id)} className="mr-2 text-indigo-600 cursor-pointer hover:text-indigo-900">
                                        Archive
                                      </a>
                                    </>
                                  )}
                                  {!!(p.PlanHistories || []).length && (
                                    <a onClick={() => setShowHistory(p)} className="text-indigo-600 cursor-pointer hover:text-indigo-900">
                                      History
                                    </a>
                                  )}
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
  );
};

export const ArchivedPlansTable = ({
  plans=[],
  toggleArchivePlan,
  setShowHistory,
}) => {
  const adminMode = IS_SUPER_ADMIN;
  return (
    <div className="flex flex-col w-full mt-10">
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
                    Uploaded
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Download
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Controls
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!(plans || []).length && (
                  <tr className="text-gray-600 bg-white">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      There are no archived files
                    </td>
                  </tr>
                )}
                {(plans || []).map(p => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <div className="truncate" style={{ width: 225 }}>
                        {p.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(p.uploadedAt).toLocaleDateString('en', dateOptions)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <div className="truncate" style={{ maxWidth: 200 }}>
                        <a href={(p.Document || {}).s3Url} className="mr-2 text-indigo-600 cursor-pointer hover:text-indigo-900" target="_blank">
                          {(p.Document || {}).filename}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      {adminMode && (
                        <a onClick={() => toggleArchivePlan(p.id)} className="mr-2 text-indigo-600 cursor-pointer hover:text-indigo-900">
                          Re-activate
                        </a>
                      )}
                      {!!(p.PlanHistories || []).length && (
                        <a onClick={() => setShowHistory(p)} className="text-indigo-600 cursor-pointer hover:text-indigo-900">
                          History
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

