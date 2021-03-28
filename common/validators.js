module.exports = {

  validatePrice: (price) => {
    var pattern = /^[1-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/;
    return !!pattern.test(price);
  },

  validatePresence: (str) => str.trim().length(),

  noOp: () => true,

}