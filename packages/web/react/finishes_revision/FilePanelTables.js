import React, { useState } from 'react';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';
import { DotsVerticalIcon, SearchIcon } from '@heroicons/react/outline';

import FocusEditableInput from '../components/FocusEditableInput';


const dateOptions = { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "numeric" }
const CustomInputWrapper = ({ children }) => (
  <div className="relative flex items-center p-1 px-2 py-0 mt-2 leading-6 border border-gray-400 rounded xs:mt-0 max-w-max focus-within:ring-blue-600 focus-within:ring-1 focus-within:ring-offset-0 focus-within:border-blue-600 focus-within:ring-offset-white">
    {children}
  </div>
);

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
  const [searchQuery, setSearchQuery] = useState('');

  let filteredPlans = [...(plans || [])];
  const q = searchQuery.trim().toLowerCase();
  if (!!q) {
    filteredPlans = plans.filter(p => p.name.toLowerCase().includes(q) || (p.Document || {}).filename?.toLowerCase().includes(q));
  }

  const onDragEnd = ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    let newOrderNum = 0;
    const idx = destination.index;
    if (source.index < idx || idx === 0) {
      newOrderNum = filteredPlans[idx].order;
    } else {
      newOrderNum = filteredPlans[idx - 1].order + 1;
    }
    handleReorderPlans({ planId: draggableId, newOrderNum });
  }
  
  return (
    <>
      <div className="xs:flex xs:items-center xs:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="p-0 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Project Documents
          </h2>
        </div>
          <CustomInputWrapper>
            <input 
              onChange={e => setSearchQuery(e.target.value)} 
              style={{ width: 230 }}
              className="leading-5 text-black placeholder-gray-400 bg-transparent border-none focus:border-none focus:ring-0 focus:ring-offset-0"
              type="search" 
              name="search" 
              placeholder="Search name or filename"
            /> 
            <SearchIcon className="w-4 h-4 text-gray-400" />
          </CustomInputWrapper>
      </div>
      <div className="flex flex-col mt-8">
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
                {!!(plans || []).length && !filteredPlans.length && (
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="text-gray-600 bg-white">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap max-w-0">
                        No matches
                      </td>
                    </tr>
                  </tbody>
                )}
                {!!filteredPlans.length && (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="plans" type="PLAN">
                      {(provided, _snapshot) => (
                        <tbody ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-gray-200 ">
                          {filteredPlans.map((p, idx) => (
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
                                      <a href={`/app/document/${(p.Document || {}).uuid}`} className="mr-2 text-indigo-600 cursor-pointer hover:text-indigo-900" target="_blank">
                                        {(p.Document || {}).filename}
                                      </a>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                    {adminMode && (
                                      <>
                                        <a onClick={() => setEditPlan(p)} className="mr-2 text-indigo-600 cursor-pointer hover:text-indigo-900">
                                          Update
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
    </>
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
                        <a href={`/app/document/${(p.Document || {}).uuid}`} className="mr-2 text-indigo-600 cursor-pointer hover:text-indigo-900" target="_blank">
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

