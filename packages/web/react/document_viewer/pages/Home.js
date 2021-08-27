import React, { Fragment, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Popover, Transition } from '@headlessui/react'
import { MenuIcon, XIcon, PaperClipIcon } from '@heroicons/react/outline'
import useClient from "../util/useClient"

import { getPresignedUrl, uploadFile } from '../util/awsPresign';

import StyledDropzone from '../components/StyledDropzone'

const uuid = require('uuid').v4

const Home = (props) => {
	const history = useHistory();

	const [loadingFileTracker, setLoadingFileTracker] = useState({});
  const loadingFileIds = Object.keys(loadingFileTracker).filter(fileId => !loadingFileTracker[fileId].complete);
	const [files, setFiles] = useState([])
	const [loading, setLoading] = useState(false)

	const bouncer = useClient(null)
	const createDocumentRequest = bouncer.post("/api/documents")

	const maxFiles = 1
	const maxFilesRemaining = files.length ? 0 : 1;

  const onDrop = (acceptedFiles) => {
    if (loading) return;
    if (!acceptedFiles.length) return;
    if (acceptedFiles.length > maxFilesRemaining) return alert(`Maximum ${maxFiles} file allowed`);

    const dropSessionId = uuid();
    
    let toLoad = acceptedFiles.length;
    setLoading(true);
    
    //TODO: error handling - if some doc fails, allow others to continue, loading spinner edge cases etc
    const onPresignError = err => { setLoading(false); console.log('_', err); alert(`error - ${err}`) };
    const onUploadFileError = err => { setLoading(false); console.log(err); alert(err) };
    
    (acceptedFiles || []).forEach((file, i) => {
      file.id = `${dropSessionId}-${i}`;
      loadingFileTracker[file.id] = { filename: file.name, progress: 0, complete: false };
      
      const onPresignSuccess = (data) => {
        uploadFile(
          file,
          data.presignedURL,
          function onProgress(progress) {
            setLoadingFileTracker(prev => ({ ...prev, [file.id]: { ...prev[file.id], progress } }));
          },
          function uploadSuccess() {
            setLoadingFileTracker(prev => ({ ...prev, [file.id]: { ...prev[file.id], complete: true } }));
            setFiles(prev => [ ...prev, {  id: file.id, filename: file.name, sheetUrl: data.awsURL } ]);
            toLoad -= 1;
            if (!toLoad) {
              setLoading(false);
							setLoadingFileTracker({});

							createDocumentRequest.sendRequest({ s3Url: data.awsURL, filename: file.name }, (doc) => {
								history.push("/d/" + doc.uuid)
							}, (err) => console.log(err))
            };
          },
          onUploadFileError
        )
      };

      getPresignedUrl(
        file,
        onPresignSuccess,
        onPresignError
      );
    });
	}

	return (
		<>
			<div className="relative bg-gray-50 overflow-hidden h-screen">
				<div className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full" aria-hidden="true">
					<div className="relative h-full max-w-7xl mx-auto">
						<svg
							className="absolute right-full transform translate-y-1/4 translate-x-1/4 lg:translate-x-1/2"
							width={404}
							height={784}
							fill="none"
							viewBox="0 0 404 784"
						>
							<defs>
								<pattern
									id="f210dbf6-a58d-4871-961e-36d5016a0f49"
									x={0}
									y={0}
									width={20}
									height={20}
									patternUnits="userSpaceOnUse"
								>
									<rect x={0} y={0} width={4} height={4} className="text-gray-200" fill="currentColor" />
								</pattern>
							</defs>
							<rect width={404} height={784} fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
						</svg>
						<svg
							className="absolute left-full transform -translate-y-3/4 -translate-x-1/4 md:-translate-y-1/2 lg:-translate-x-1/2"
							width={404}
							height={784}
							fill="none"
							viewBox="0 0 404 784"
						>
							<defs>
								<pattern
									id="5d0dd344-b041-4d26-bec4-8d33ea57ec9b"
									x={0}
									y={0}
									width={20}
									height={20}
									patternUnits="userSpaceOnUse"
								>
									<rect x={0} y={0} width={4} height={4} className="text-gray-200" fill="currentColor" />
								</pattern>
							</defs>
							<rect width={404} height={784} fill="url(#5d0dd344-b041-4d26-bec4-8d33ea57ec9b)" />
						</svg>
					</div>
				</div>

				<div className="relative pt-6 pb-16 sm:pb-24">
					<main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
						<div className="text-center">
							<h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
								<span className="block xl:inline">Upload a PDF for</span>{' '}
								<span className="block text-indigo-600 xl:inline">snappy viewing</span>
							</h1>
							<div className="mt-5 max-w-lg mx-auto sm:justify-center md:mt-8">
								{(!files.length && !loadingFileIds.length) && (
									<StyledDropzone accept=".pdf" onDrop={onDrop} maxFiles={1} />
								)}

								{(!!files.length || !!loadingFileIds.length) && (
									<div className="mb-5 border border-gray-200 divide-y divide-gray-200 rounded">
										{(files || []).map(file => (
											<div key={file.id} className="flex items-center justify-between p-4 bg-blueGray-50">
												<span className="flex items-center">
													<PaperClipIcon className="w-4 h-4 mr-5 text-gray-500" />
													<a href={file.sheetUrl} target="_blank" className="ml-2 text-blue-800 hover:text-blue-700">{file.filename}</a>
												</span>
												<XIcon
													className="w-4 h-4 text-gray-600 cursor-pointer hover:text-blue-600"
													onClick={() => setFiles(files.filter(f => f.sheetUrl !== file.sheetUrl))}
												/>
											</div>
										))}
										{(loadingFileIds || []).map(fileId => {
											const loadingFile = loadingFileTracker[fileId];
											return (
												<div key={`${fileId}_loading`} className="p-4 bg-blueGray-50">
													<div className="flex items-center">
														<PaperClipIcon className="w-4 h-4 mr-5 text-gray-500" />
														<span className="ml-2 text-gray-500">{loadingFile.filename}</span>
													</div>
													<div className="relative px-10 pt-1">
														<div className="text-xs text-gray-400">Loading {loadingFile.progress}%</div>
														<div className="flex h-2 mb-4 overflow-hidden text-xs bg-green-200 rounded">
															<div style={{ width: `${loadingFile.progress}%` }} className="flex flex-col justify-center text-center text-white bg-green-400 shadow-none whitespace-nowrap"></div>
														</div>
													</div>
												</div>
										)})}
									</div>
								)}
							</div>
						</div>
					</main>
				</div>
			</div>
		</>
	)
}

export default Home