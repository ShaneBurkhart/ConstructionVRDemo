module.exports = {
  
  removeHTTPFromUrlIfPresent: (url) => url.replace(/(^\w+:|^)\/\//, ''),
  
  addHTTPToUrlIfMissing: (str) => {
    var prefix1 = 'http://';
    var prefix2 = 'https://';
    if (str.substr(0, prefix1.length) !== prefix1 || s.substr(0, prefix2.length) !== prefix2) {
        str = prefix2 + str;
    }

    return str;
  },
  
  formatPrice: (num) => {
    if (isNaN(num)) return '';
    const currencyOptions = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).resolvedOptions();
    return Number(num).toLocaleString('en-US', { ...currencyOptions, style: 'decimal' });
  },

  noFormat: (val) => val,

}
