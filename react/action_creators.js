import $ from 'jquery';

export default {
  load: () => {
    $.get("/api/project/" + PROJECT_ACCESS_TOKEN, function (data) {
    });
  }
}
