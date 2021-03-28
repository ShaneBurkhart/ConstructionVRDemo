module.exports = {
  
  preFormatUrl: (url) => url.replace(/(^\w+:|^)\/\//, ''),
  
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
