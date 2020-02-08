import $ from 'jquery';
import Actions from './actions'
import _  from 'underscore'

export default {
  load: (callback) => {
    $.get("/api/project/" + PROJECT_ACCESS_TOKEN + "/finishes", callback);
  },

  searchOptions: (query, callback) => {
    $.get("/api/finishes/options/search?q=" + encodeURIComponent(query), callback);
  },

  save: (categories, callback) => {
    console.log("Saving...", categories);

    $.post({
      url: "/api/project/" + PROJECT_ACCESS_TOKEN + "/finishes/save",
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({ categories: categories }),
      dataType: "json",
      success: callback
    });
  },

  presignedURL: (file, callback) => {
    $.ajax({
      type: "POST",
      url: "/api/temp_upload/presign",
      data: {
        filename: file.name,
        mime: file.type,
      },
      dataType: "json",
      success: callback
    });
  },

  uploadFile: (file, presignedURL, callback) => {
    $.ajax({
      type: "PUT",
      url: presignedURL,
      data: file,
      dataType: "text",
      cache : false,
      contentType : file.type,
      processData : false,
      success: callback
    });
  }
}
