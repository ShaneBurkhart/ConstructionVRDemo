const { removeHTTPFromUrlIfPresent, noFormat } = require('./formatters');
const { validatePrice, noOp } = require('./validators');

const finishAttributes = [
  {
    name: "Manufacturer",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Product Number",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Color",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Style",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Dimensions",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Repeat",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Grout Tag",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Grout Joint Thickness",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Installation Method",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Carpet Pad",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Finish",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Type",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Thickness",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Edge Profile",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Wood Species",
    width: 5,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Product URL",
    width: 8,
    validate: noOp, 
    format: removeHTTPFromUrlIfPresent,
    inlineEditable: true,
  },
  {
    name: "Price",
    width: 5,
    validate: validatePrice,
    format: noFormat,
    inlineEditable: true,
  },
  {
    name: "Details",
    width: 16,
    validate: noOp,
    format: noFormat,
    inlineEditable: true,
    excludeFromName: true,
    excludeFromLibraryDetails: true,
  },
  {
    name: "Images",
    width: 16,
    validate: noOp,
    format: noFormat,
    inlineEditable: false,
    excludeFromName: true,
    excludeFromLibraryDetails: true,
    excludeFromCardDetails: true,
  },
  {
    name: "Document",
    width: 16,
    validate: noOp,
    format: noFormat,
    isURL: true,
    hideIfBlank: true,
    inlineEditable: false,
    excludeFromName: true,
    excludeFromLibraryDetails: true,
  }
];

const finishCategoriesArr = [
  { name: "Paint",
    tag: "PT",
    attr: ["Manufacturer","Product Number","Color","Details","Images","Document",], 
  },
  { name: "Wall Covering",
    tag: "WC",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Repeat","Details","Images","Document",], 
  },
  { name: "Tile",
    tag: "T",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Grout Tag","Grout Joint Thickness","Details","Images","Document",], 
  },
  { name: "Grout",
    tag: "G",
    attr: ["Manufacturer","Product Number","Color","Style","Details","Images","Document",], 
  },
  { name: "Carpet",
    tag: "CPT",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Installation Method","Carpet Pad","Details","Images","Document",], 
  },
  { name: "Luxury Vinyl Tile",
    tag: "LVT",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "Sealed Concrete",
    tag: "SC",
    attr: ["Manufacturer","Product Number","Color","Finish","Details","Images","Document",], 
  },
  { name: "Laminate",
    tag: "L",
    attr: ["Manufacturer","Product Number","Color","Style","Finish","Details","Images","Document",], 
  },
  { name: "Stone Countertops",
    tag: "ST",
    attr: ["Manufacturer","Color","Finish","Type","Thickness","Edge Profile","Details","Images","Document",], 
  },
  { name: "Wood Stain",
    tag: "WS",
    attr: ["Color","Finish","Wood Species","Details","Images","Document",], 
  },
  { name: "Wood Products",
    tag: "WP",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Type","Wood Species","Details","Images","Document",], 
  },
  { name: "Metal Products",
    tag: "MP",
    attr: ["Manufacturer","Product Number","Color","Style","Finish","Details","Images","Document",], 
  },
  { name: "Wall Base",
    tag: "B",
    attr: ["Manufacturer","Product Number","Style","Dimensions","Type","Details","Images","Document",], 
  },
  { name: "Trim",
    tag: "TR",
    attr: ["Manufacturer","Product Number","Style","Dimensions","Type","Details","Images","Document",], 
  },
  { name: "Transition Strips",
    tag: "TS",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Finish","Type","Details","Images","Document",], 
  },
  { name: "Doors",
    tag: "D",
    attr: ["Manufacturer","Product Number","Style","Dimensions","Type","Details","Images","Document",], 
  },
  { name: "Door Hardware",
    tag: "DH",
    attr: ["Manufacturer","Color","Style","Details","Images","Document",], 
  },
  { name: "Cabinets",
    tag: "CB",
    attr: ["Manufacturer","Color","Style","Details","Images","Document",], 
  },
  { name: "Cabinet Hardware",
    tag: "CH",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Type","Details","Images","Document",], 
  },
  { name: "Mailboxes",
    tag: "MB",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "Electrical",
    tag: "E",
    attr: ["Manufacturer","Product Number","Color","Style","Details","Images","Document",], 
  },
  { name: "Lighting Fixtures",
    tag: "LT",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "Electronics",
    tag: "EL",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Type","Details","Images","Document",], 
  },
  { name: "Plumbing",
    tag: "PL",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Finish","Type","Details","Images","Document",], 
  },
  { name: "Restroom Accessories",
    tag: "RA",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Finish","Type","Details","Images","Document",], 
  },
  { name: "Appliances",
    tag: "AP",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Type","Details","Images","Document",], 
  },
  { name: "Fabric",
    tag: "FA",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Repeat","Type","Details","Images","Document",], 
  },
  { name: "Furniture",
    tag: "F",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Type","Details","Images","Document",], 
  },
  { name: "Wall Decor",
    tag: "WD",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Type","Details","Images","Document",], 
  },
  { name: "Misc Decor",
    tag: "MD",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Type","Details","Images","Document",], 
  },
  { name: "Window Treatments",
    tag: "WT",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Type","Details","Images","Document",], 
  },
  { name: "Miscellaneous",
    tag: "M",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "xBrick",
    tag: "xB",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "xStone",
    tag: "xS",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "xConcrete",
    tag: "xC",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "xFiber Cement",
    tag: "xFC",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "xMetal Siding",
    tag: "xMS",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "xStucco Systems",
    tag: "xSS",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "xMisc Metals",
    tag: "xMM",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "xWindow & Door Frames",
    tag: "xWD",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "xAwnings",
    tag: "xA",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "xMetal Balconies",
    tag: "xMB",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
  { name: "xMisc",
    tag: "xM",
    attr: ["Manufacturer","Product Number","Color","Style","Dimensions","Details","Images","Document",], 
  },
];

const finishCategoriesMap = {};
finishCategoriesArr.forEach((category, i) => finishCategoriesMap[category.name] = {...category, order: i });

const attrMap = {};
finishAttributes.forEach(a => attrMap[a.name] = { ...a });


module.exports = {
  finishCategoriesArr,
  finishCategoriesMap,
  attrMap,
  getInlineEditableAttrList: (category) => {
    return finishCategoriesMap[category].attr.filter(a => attrMap[a].inlineEditable)
  },
  getAttrGridRows: (attrList=[]) => {
    let remainingWidth = 16;
    const attrRows = [];
    let row = [];
  
    for (let i = 0; i < attrList.length; i++){
      row.push(attrList[i])
      remainingWidth = remainingWidth - attrMap[attrList[i]].width;
      if (!attrList[i+1]) {
        attrRows.push(row);
      } else if (attrMap[attrList[i+1]].width > remainingWidth) {
        attrRows.push(row);
        remainingWidth = 16;
        row = [];
      }
    }
    return attrRows;
  },
}
