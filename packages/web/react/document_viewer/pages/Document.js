import React, { useState, useEffect } from 'react';
import lscache from 'lscache';
import { useParams } from 'react-router-dom';

import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';

const thirtySecondsDidPass = startedPipelineAt => {
	const startedAt = new Date(startedPipelineAt).getTime();
	const now = new Date(new Date().getTime());
	return now > startedAt + (30 * 1000);
}

const THIRTY_DAYS = 60 * 24 * 30;

const Document = () => {
	const { documentUuid } = useParams();
	const [loading, setLoading] = useState(true);
	const [document, setDocument] = useState(null);

	const sheets = (document || {}).Sheets || [];
	sheets.sort((a, b) => a.index < b.index ? -1 : (a.index > b.index ? 1 : 0));

	const checkDocument = () => {
		$.ajax({
      type: "GET",
      url: `/api2/v2/documents/${documentUuid}`,
      dataType: "json",
      success: (doc) => {
				window.document.title = doc.Plan.name;
        setDocument(doc);
				if (!doc.startedPipelineAt || thirtySecondsDidPass(doc.startedPipelineAt)){
					lscache.set(documentUuid, doc, THIRTY_DAYS);
					return setLoading(false);
				};
				if (!doc.pageCount || (doc.Sheets || []).length !== doc.pageCount) {
					setTimeout(checkDocument, 1000);
				} else {
					lscache.set(documentUuid, doc, THIRTY_DAYS);
					setLoading(false);
				}
      },
      error: (error) => {
				console.error(error)
        alert('could not retrieve document');
      }
    });
	}

	useEffect(() => {
		const cache = lscache.get(documentUuid);
		if (cache) {
			setDocument(cache);
			setLoading(false)
		}
		checkDocument();
	}, []);

	
	if (loading) return !!document ? (
		<div className="p-2">
			Loading {sheets.length} of {document.pageCount}
		</div>
	) : (
		<LoadingSpinner />
	);

	return (
		<>
			<Header pageTitle={`Document ${document.filename}`} uuid={document.uuid}/>
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