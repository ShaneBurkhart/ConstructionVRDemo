import React from 'react';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Icon } from 'semantic-ui-react';

const Cell = ({ children, width="100%" }) => (
  <span className="className='flex items-center w-full px-4 text-sm text-gray-500 truncate" style={{ width, minWidth: width, maxWidth: width }}>
    {children}
  </span>
);

const Row = ({ children }) => (
  <div className={`flex w-full px-4 py-3`}>
    {children}
  </div>
);

export const Table = ({ children, columnHeaderDetails=[] }) => (
  <div className="relative table w-full border border-gray-200 divide-y divide-gray-200 rounded">
    <div className="flex items-center w-full px-4 text-sm capitalize bg-blueGray-50 h-14">
      {columnHeaderDetails.map((col, i) => {
        return (
          <Cell
            key={col.key}
            width={col.width}
            role="columnheader"
            aria-colindex={i}
          >
            {col.displayName}
          </Cell>
        );
      })}
    </div>
    {children}
  </div>
);

const DraggableRow = React.forwardRef(
  ({provided, snapshot, children}, ref) => (
    <div
      className={`flex w-full px-4 py-3 bg-white ${snapshot.isDragging ? 'bg-blue-50' : ''} `}
      ref={ref}
      {...provided.draggableProps}
    >
      {provided.dragHandleProps && (
        <div className="flex items-center px-1" width="40px">
          <div {...provided.dragHandleProps} className="flex justify-center text-gray-400 rounded group hover:bg-blue-50" style={{ fontSize: '.9rem' }}>
            <Icon name="vertical ellipsis" className="cursor-pointer group-hover:text-blue-600" />
            <Icon name="vertical ellipsis" style={{ marginLeft: -12 }} className="cursor-pointer group-hover:text-blue-600" />
          </div>
        </div>
      )}
      {children}
    </div>
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

  const columnController = [
    { key: "order", displayName: "#", width: '50px' },
    { key: "name", displayName: "Name", width: '300px' },
    { key: "uploadedAt", displayName: "Uploaded At", width: '300px' },
    { key: "url", displayName: "Download File", width: '300px' },
  ];
  
  const controlsColumn = { key: '_controls', displayName: "Controls", width: '350px' };
  const headerColumnController = [...columnController, controlsColumn];
  
  const dragHandleColumnController = { key: '_drag', displayName: "", width: '40px' };
  if (adminMode && plans.length > 1) headerColumnController.unshift(dragHandleColumnController);
  
  const formattedCells = {
    order: (plan) => <>{plan.order + 1}</>,
    updatedAt: (plan) => <>{new Date(plan.uploadedAt).toLocaleDateString()} {new Date(plan.uploadedAt).toLocaleTimeString()}</>,
    url: (plan) => <a target="_blank" href={plan.url} className="text-blue-600 cursor-pointer">{plan.filename}</a>,
  }
  

  const onDragEnd = ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    handleReorderPlans({ planId: draggableId, newOrderNum: destination.index });
  }
  
  return (
    <div className={`flex w-full`}>
      <section className="w-full py-5 overflow-x-auto">
        <Table columnHeaderDetails={headerColumnController}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="plans" type="PLAN">
              {(provided, _snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-gray-200">
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
                          {columnController.map(col => {
                            const content = formattedCells[col.key] ? formattedCells[col.key](plan) : plan[col.key];
                            return  (
                              <Cell key={col.key} width={col.width}>
                                <span className="block truncate">{content}</span>
                              </Cell>
                            );
                          })}
                          <Cell>
                            <span><a className="text-blue-600 cursor-pointer" onClick={() => setEditPlan(plan)}>Edit</a></span>
                            <span><a className="text-blue-600 cursor-pointer" onClick={() => toggleArchivePlan(plan.id)}>Archive</a></span>
                            {!!(plan.PlanHistories || []).length && <span><a className="text-blue-600 cursor-pointer" onClick={() => setShowHistory(plan)}>History</a></span>}
                          </Cell>
                        </DraggableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {!(plans || []).length && (
            <Row className="text-sm text-gray-600 bg-white">You have not added any files</Row>
          )}
        </Table>
      </section>
    </div>
  );
};

export const ArchivedPlansTable = ({
  plans=[],
  toggleArchivePlan,
}) => {
  const columnController = [
    { key: "name", displayName: "Name", width: '300px' },
    { key: "uploadedAt", displayName: "Uploaded At", width: '300px' },
    { key: "url", displayName: "Download File", width: '200px' },
  ];
  const controlsColumn = { key: '_controls', displayName: "Controls", width: '200px' }
  
  return (
    <div className={`flex w-full mt-10`}>
      <section className="w-full py-5 overflow-x-auto">
        <Table columnHeaderDetails={[...columnController, controlsColumn]}>
          {(plans || []).map(plan => (
            <Row key={plan.id} className="bg-white">
              {columnController.map(col => (
                <Cell key={col.key} width={col.width} className="text-sm text-gray-500">
                  <span className="block truncate">{plan[col.key]}</span>
                </Cell>
              ))}
              <Cell width={controlsColumn.width}>
                <a className="text-blue-600 cursor-pointer" onClick={() => toggleArchivePlan(plan.id)}>Re-activate</a>
              </Cell>
            </Row>
          ))}
          {!(plans || []).length && (
            <Row className="text-sm text-gray-600 bg-white">There are no archived files</Row>
          )}
        </Table>
      </section>
    </div>
  );
};

