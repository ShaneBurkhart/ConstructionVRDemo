module.exports = {
  
  formatUrl: (url) => url.replace(/(^\w+:|^)\/\//, ''),
  
  formatPrice: (num) => {
    const currencyOptions = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).resolvedOptions();
    return (num).toLocaleString('en-US', { ...currencyOptions, style: 'decimal' });
  },

  noFormat: (val) => val,

}
