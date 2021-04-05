const { preFormatUrl, noFormat } = require('./formatters');
const { validatePrice, noOp } = require('./validators');

const finishAttributes = [
  {
    name: "Manufacturer",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Product Number",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Color",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Style",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Dimensions",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Repeat",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Grout Tag",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Grout Joint Thickness",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Installation Method",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Carpet Pad",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Finish",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Type",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Thickness",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Edge Profile",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Wood Species",
    width: 5,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Product URL",
    width: 8,
    validate: noOp, 
    format: preFormatUrl,
  },
  {
    name: "Price",
    width: 5,
    validate: validatePrice,
    format: noFormat,
  },
  {
    name: "Details",
    width: 16,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Images",
    width: 16,
    validate: noOp,
    format: noFormat,
  },
  {
    name: "Name",
    width: 8,
    validate: noOp,
    format: noFormat,
  },
];

const finishCategoriesArr = [
  { name: "Paint",
    tag: "PT",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Price","Details","Images",], 
  },
  { name: "Wall Covering",
    tag: "WC",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Repeat","Price","Details","Images",], 
  },
  { name: "Tile",
    tag: "T",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Grout Tag","Grout Joint Thickness","Price","Details","Images",], 
  },
  { name: "Grout",
    tag: "G",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Price","Details","Images",], 
  },
  { name: "Carpet",
    tag: "CPT",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Installation Method","Carpet Pad","Price","Details","Images",], 
  },
  { name: "Luxury Vinyl Tile",
    tag: "LVT",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Price","Details","Images",], 
  },
  { name: "Sealed Concrete",
    tag: "SC",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Finish","Price","Details","Images",], 
  },
  { name: "Laminate",
    tag: "L",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Finish","Price","Details","Images",], 
  },
  { name: "Stone Countertops",
    tag: "ST",
    attr: ["Name","Product URL","Manufacturer","Color","Finish","Type","Thickness","Edge Profile","Price","Details","Images",], 
  },
  { name: "Wood Stain",
    tag: "WS",
    attr: ["Name","Product URL","Color","Finish","Wood Species","Price","Details","Images",], 
  },
  { name: "Wood Products",
    tag: "WP",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Wood Species","Price","Details","Images",], 
  },
  { name: "Metal Products",
    tag: "MP",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Finish","Price","Details","Images",], 
  },
  { name: "Wall Base",
    tag: "B",
    attr: ["Name","Product URL","Manufacturer","Product Number","Style","Dimensions","Type","Price","Details","Images",], 
  },
  { name: "Trim",
    tag: "TR",
    attr: ["Name","Product URL","Manufacturer","Product Number","Style","Dimensions","Type","Price","Details","Images",], 
  },
  { name: "Transition Strips",
    tag: "TS",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Finish","Type","Price","Details","Images",], 
  },
  { name: "Doors",
    tag: "D",
    attr: ["Name","Product URL","Manufacturer","Product Number","Style","Dimensions","Type","Price","Details","Images",], 
  },
  { name: "Door Hardware",
    tag: "DH",
    attr: ["Name","Product URL","Manufacturer","Color","Style","Price","Details","Images",], 
  },
  { name: "Cabinets",
    tag: "CB",
    attr: ["Name","Product URL","Manufacturer","Color","Style","Price","Details","Images",], 
  },
  { name: "Cabinet Hardware",
    tag: "CH",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  { name: "Mailboxes",
    tag: "MB",
    attr: ["Name","Manufacturer","Product Number","Color","Style","Dimensions","Details","Images",], 
  },
  { name: "Electrical",
    tag: "E",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Price","Details","Images",], 
  },
  { name: "Lighting Fixtures",
    tag: "LT",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Price","Details","Images",], 
  },
  { name: "Electronics",
    tag: "EL",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  { name: "Plumbing",
    tag: "PL",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Finish","Type","Price","Details","Images",], 
  },
  { name: "Restroom Accessories",
    tag: "RA",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Finish","Type","Price","Details","Images",], 
  },
  { name: "Appliances",
    tag: "AP",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  { name: "Fabric",
    tag: "FA",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Repeat","Type","Price","Details","Images",], 
  },
  { name: "Furniture",
    tag: "F",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  { name: "Wall Decor",
    tag: "WD",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  { name: "Misc Decor",
    tag: "MD",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  { name: "Window Treatments",
    tag: "WT",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  { name: "Miscellaneous",
    tag: "M",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Price","Details","Images",], 
  },
];

const finishCategoriesMap = {};
finishCategoriesArr.forEach((category, i) => finishCategoriesMap[category.name] = {...category, order: i });



 const attrMap = {};
 finishAttributes.forEach(a => attrMap[a.name] = { ...a });
 const allCategoryNames = Object.keys(finishCategoriesMap);


 module.exports = {
    finishCategoriesArr,
    finishCategoriesMap,
    attrMap,
    allCategoryNames,
    getAttrWidth: (attrName) => attrMap[attrName].width,
    getCategoryTag: (category) => finishCategoriesMap[category].tag,
    getAttrList: (category) => category.attr.map(attribute => finishAttributes.find(({name}) => name === attribute)),
    getAttrGridRows: (attrList=[]) => {
      let remainingWidth = 16;
      const attrRows = [];
      let row = [];
    
      for (let i = 0; i < attrList.length; i++){
        row.push(attrList[i])
        remainingWidth = remainingWidth - attrList[i].width;
        if (!attrList[i+1]) {
          attrRows.push(row);
        } else if (attrList[i+1].width > remainingWidth) {
          attrRows.push(row);
          remainingWidth = 16;
          row = [];
        }
      }
      return attrRows;
    },
 }
