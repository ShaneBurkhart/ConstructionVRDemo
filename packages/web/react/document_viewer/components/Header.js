import React from 'react';
import { DocumentDownloadIcon } from '@heroicons/react/solid'


export default function Header({ pageTitle, s3Url }) {
  return (
    <div className="p-2 mb-2 sm:flex sm:items-center sm:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">{pageTitle}</h2>
      </div>
      <div className="flex mt-5 lg:ml-4">
        <span className="sm:ml-3">
          {!!s3Url && (
            <a
              href={s3Url}
              target="_blank"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentDownloadIcon className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
              Download File
            </a>
          )}
        </span>
      </div>
    </div>
  )
}