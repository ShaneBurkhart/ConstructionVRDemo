import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Document = (props) => {
	const { documentUuid } = useParams()
	const [loading, setLoading] = useState(true)
	const [progress, setProgress] = useState(null)
	const [document, setDocument] = useState(null)

	const sheets = (document || {}).Sheets || []
	sheets.sort((a, b) => a.index < b.index ? -1 : (a.index > b.index ? 1 : 0))

	// const getDocumentRequest = bouncer.get("/api/documents/" + documentUuid)

	// console.log(loading, progress, document)

	const checkDocument = () => {
		$.ajax({
      type: "GET",
      url: `/api2/v2/documents/${documentUuid}`,
      dataType: "json",
      success: (document) => {
				console.log({document})
        setDocument(document);
      },
      error: (error) => {
        alert(error);
      }
    })
	}

	useEffect(() => { checkDocument() }, [])

	return (
		<>
			Document {documentUuid}
			{sheets.map(sheet => {
				return (
					<img key={sheet.index} src={sheet.fullImgUrl} />
				)
			})}
		</>
	)
}

export default Document