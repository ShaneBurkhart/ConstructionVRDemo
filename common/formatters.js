exports.formatUrl = (url) => {
  if (!/^https?:\/\//i.test(url)) {
    url = 'http://' + url;
  }
  return url;
}
  
exports.formatPrice = (num) => new Intl.NumberFormat().format(num);
