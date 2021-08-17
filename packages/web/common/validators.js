module.exports = {

  validatePrice: (price) => !price.length || !isNaN(price),

  validatePresence: (str) => str.trim().length(),

  noOp: () => true,

}
