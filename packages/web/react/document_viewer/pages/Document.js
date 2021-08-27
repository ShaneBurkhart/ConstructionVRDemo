import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Header from '../components/Header';

const Document = (props) => {
	const { documentUuid } = useParams()
	const [loading, setLoading] = useState(true)
	const [progress, setProgress] = useState(null)
	const [document, setDocument] = useState(null)

	const sheets = (document || {}).Sheets || []
	sheets.sort((a, b) => a.index < b.index ? -1 : (a.index > b.index ? 1 : 0))

	const checkDocument = () => {
		$.ajax({
      type: "GET",
      url: `/api2/v2/documents/${documentUuid}`,
      dataType: "json",
      success: (document) => {
        setDocument(document);
      },
      error: (error) => {
				console.error(error)
        alert('could not retrieve document');
      }
    })
	}

	useEffect(() => { checkDocument() }, [])

	if (!document) return (
		<Header pageTitle="Loading Document..." />
	)

	return (
		<>
			<Header pageTitle={`Document ${document.filename}`} s3Url={document.s3Url}/>
			{!sheets.length && (
				<div className="p-2">
					Document cannot be displayed in viewer.
				</div>
			)}
			{sheets.map(sheet => {
				return (
					<img key={sheet.index} src={sheet.fullImgUrl} />
				)
			})}
		</>
	);
}

export default Document