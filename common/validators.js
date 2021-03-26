exports.validateUrl = (url) => {
  if (!url) return true;
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+'i'); // fragment locator
  if (!pattern.test(url)) console.log(`${url} is not a valid url type`);
  if (!!pattern.test(url)) console.log(`${url} is an acceptable url pattern`);
  // return !!pattern.test(url);
  return true;
}

exports.validatePrice = (price) => {
  var pattern = /^[1-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/;
  if (!pattern.test(price)) console.log(`${price} is not a valid price type`);
  if (!!pattern.test(price)) console.log(`${price} is an acceptable price pattern`);
  return !!pattern.test(price);
}
