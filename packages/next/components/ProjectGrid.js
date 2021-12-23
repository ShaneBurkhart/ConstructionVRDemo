import React, { useState } from 'react';
import { Grid, Header, Table } from 'semantic-ui-react';
import { SearchIcon } from '@heroicons/react/outline';

const CustomInputWrapper = ({ children }) => (
  <div className="relative flex items-center p-1 px-2 py-0 mt-2 leading-6 border border-gray-400 rounded xs:mt-0 max-w-max focus-within:ring-blue-600 focus-within:ring-1 focus-within:ring-offset-0 focus-within:border-blue-600 focus-within:ring-offset-white">
    {children}
  </div>
);

export default function ProjectGrid({ title, projects, isAdmin=false, archived=false, search=false, className='' }) {
	const [searchQuery, setSearchQuery] = useState('');

	let filteredProjects = [...(projects || [])];
	const q = searchQuery.trim().toLowerCase();
	if (!!q) {
		filteredProjects = projects.filter(p => p.name.toLowerCase().includes(q) || (p.Document || {}).filename?.toLowerCase().includes(q));
	}

	return (
		<div className={className}>
			<Grid stackable>
				<Grid.Column width={12}>
					<Header as='h2'>{title}</Header>
				</Grid.Column>
				{search && (
					<Grid.Column width={4}>
						<CustomInputWrapper>
							<input 
								onChange={e => setSearchQuery(e.target.value)} 
								style={{ width: 230 }}
								className="leading-5 text-black placeholder-gray-400 bg-transparent border-none focus:border-none focus:ring-0 focus:ring-offset-0"
								type="search" 
								name="search" 
								placeholder="Search projects"
							/> 
							<SearchIcon className="w-4 h-4 text-gray-400" />
						</CustomInputWrapper>
					</Grid.Column>
				)}
			</Grid>
			<Table celled>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell width={10}>Project</Table.HeaderCell>
						<Table.HeaderCell>Controls</Table.HeaderCell>
						<Table.HeaderCell width={1}>V1</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{filteredProjects.map(({ id, accessToken, name, v1 }) => (
							<tr className="project-row" key={accessToken}>
								<td>
										<a className="py-2 text-blue-600 project-controls hover:text-blue-800" href={`/app/project/${accessToken}/finishes`} onClick={() => updateSeenAt(id)}>{name}</a>
								</td>
								{isAdmin && !archived &&  (
									<td> 
										<a className="py-2 mr-4 text-blue-600 cursor-pointer project-controls hover:text-blue-800" onClick={() => openCopyModal(id, name)}>Copy</a>
										<a className="py-2 text-blue-600 cursor-pointer project-controls hover:text-blue-800" onClick={() => openConfirmModal(id, name, 'archive')}>Archive</a>
									</td>
								)}
								{isAdmin && !!archived && (
									<td> 
										<a className="py-2 text-blue-600 cursor-pointer project-controls hover:text-blue-800" onClick={() => openConfirmModal(id, name, 'reactivate')}>Re-Activate</a>
									</td>
								)}
								<td>
									{v1 && <Icon name="check" color="grey" />}
								</td>
							</tr>
					))}
				</Table.Body>
			</Table>
		</div>
	);
}