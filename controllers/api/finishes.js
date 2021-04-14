const { Sequelize, Op, QueryTypes } = require('sequelize');
const got = require('got');
const FileType = require('file-type');
const AWS = require('aws-sdk')
const request = require('request');
const m = require("../middleware.js");
const models = require("../../models/index.js");
const { attrMap, finishCategoriesMap } = require("../../common/constants.js");
const { uuid } = require('uuidv4');

AWS.config.update({
  region: process.env["REGION"],
  credentials: new AWS.Credentials(process.env["ACCESS_KEY_ID"], process.env["SECRET_ACCESS_KEY"])
});
const s3 = new AWS.S3({ params: { Bucket: process.env.BUCKET } });


module.exports = (app) => {
  app.put("/api2/v2/finishes/search", m.authUser, async (req, res) => {
    const searchQuery = req.query["q"] || "";
    const { category } = req.body;
    const dbSearchQuery = Sequelize.Validator.escape(`%${searchQuery}%`);
    const categoryAttributes = finishCategoriesMap[category].attr;
    let postgresLiteralQuery = '(';
    categoryAttributes.forEach((attr, i) => {
      if (i === 0) {
        postgresLiteralQuery+= `attributes->> '${attr}' ILIKE '${dbSearchQuery}'`
      } else {
        postgresLiteralQuery+= ` OR attributes->> '${attr}' ILIKE '${dbSearchQuery}'`
      }
    });
    postgresLiteralQuery+= ')';

    try {
      const results = await models.Finish.findAll({
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("attributes")), "attributes"],
        ],
        where: {
          category: category,
          [Op.and]: Sequelize.literal(postgresLiteralQuery)
        },
        limit: 100,
      });
      // console.log({results})
      res.json({results})
    } catch (error){
      console.error(error)
      res.status(422).send("Could not complete search request");
    }

  });

  app.get("/api2/v2/finishes/:project_access_token", async (req, res) => {
    const projectAccessToken = req.params["project_access_token"];
    
    try {
      const project = await models.Project.findOne({ where: { accessToken: projectAccessToken } });
      if (!project) return res.status(404).send("Project not found");
      
      const finishes = await project.getFinishes();
      const categoryLocks = await project.getCategoryLocks();

      const projectId = project.id;
      const projectName = project.name;

      const lockedCategories = (categoryLocks || []).map(cl => cl.category);
  
      return res.json({ finishes, projectId, projectName, lockedCategories });
    } catch(error){
      console.log(error);
      res.status(422).send("Could not retrieve project information")
    }
  });
  
  app.post("/api2/v2/finishes/:project_access_token", m.authUser, async (req, res) => {
    const projectAccessToken = req.params["project_access_token"];
    
    const project = await models.Project.findOne({ where: { accessToken: projectAccessToken } });
    if (!project) return res.status(404).send("Project not found");

    const { category, attributes } = req.body;
    try {
      const formattedAttributes = {};
      (Object.keys(attributes) || []).forEach(a => {
        if (attrMap[a]) {
          formattedAttributes[a] = attrMap[a].format(attributes[a]);
        }
      });
      
      const finishList = await models.Finish.findAll({ where: { ProjectId: project.id, category: category }});
      const newFinish = await models.Finish.create({
        ProjectId: project.id,
        category,
        orderNumber: finishList.length,
        attributes: formattedAttributes,
      });
      return res.json(newFinish);
    } catch(error){
      console.error(error);
      return res.status(422).send("Could not create new Finish");
    }
  });
  
  app.put("/api2/v2/finishes/:project_access_token/:finish_id", m.authUser, async (req, res) => {
    const projectAccessToken = req.params["project_access_token"];
    const finishId = req.params["finish_id"];
    if (!finishId) return res.status(400).send("Finish ID required");
    
    const project = await models.Project.findOne({ where: { accessToken: projectAccessToken } });
    if (!project) return res.status(404).send("Project not found");

    const finish = await models.Finish.findOne({ where: { id: finishId, ProjectId: project.id }});
    if (!finish) return res.status(404).send("Finish not found");

    const { category, attributes } = req.body;
    
    try {
      const formattedAttributes = {};
      (Object.keys(attributes) || []).forEach(a => {
        if (attrMap[a]) {
          formattedAttributes[a] = attrMap[a].format(attributes[a])
        }
      });
      const updatedFinish = await finish.update({
        category,
        attributes: formattedAttributes,
      });
      return res.json(updatedFinish);
    } catch(error){
      console.error(error);
      return res.status(422).send("Could not update Finish");
    }
  });
  
  app.delete("/api2/v2/finishes/:project_access_token/:finish_id", m.authUser, async (req, res) => {
    const projectAccessToken = req.params["project_access_token"];
    const finishId = req.params["finish_id"];
    if (!finishId) return res.status(400).send("Finish ID required");
    
    try {
      const project = await models.Project.findOne({ where: { accessToken: projectAccessToken } });
      if (!project) return res.status(404).send("Project not found");

      const finish = await models.Finish.findOne({ where: { id: finishId, ProjectId: project.id }});
      if (!finish) return res.status(404).send("Finish not found");

      const category = finish.category;
      const categoryIsLocked = await models.CategoryLock.findOne({ where: { ProjectId: project.id, category: category }});
      if (categoryIsLocked) return res.status(422).send("This category is locked");

      await finish.destroy();
      const finishList = await models.Finish.findAll({ where: { ProjectId: project.id, category }});
      const promisedNewOrderedList = finishList.sort((a,b) => a.orderNumber - b.orderNumber).map((f, i) => f.update({ orderNumber: i }));
      const newOrderedFinishes = await Promise.all(promisedNewOrderedList);

      return res.json({category, newOrderedFinishes});
    } catch(error){
      console.error(error);
      return res.status(422).send("Could not update Finish");
    }
  });
  
  app.patch("/api2/v2/finishes/:project_access_token/:finish_id/order", m.authUser, async (req, res) => {
    const projectAccessToken = req.params["project_access_token"];
    const finishId = req.params["finish_id"];
    if (!finishId) return res.status(400).send("Finish ID required");

    try {
      const project = await models.Project.findOne({ where: { accessToken: projectAccessToken } });
      if (!project) return res.status(404).send("Project not found");
  
      const finish = await models.Finish.findOne({ where: { id: finishId, ProjectId: project.id }});
      if (!finish) return res.status(404).send("Finish not found");
  
      const { orderNumber } = req.body;
      if (!orderNumber || isNaN(Number(orderNumber))) return res.status(400).send("A valid order number is required");
  
      const category = finish.category;

      const categoryIsLocked = await models.CategoryLock.findOne({ where: { ProjectId: project.id, category: category }});
      if (categoryIsLocked) return res.status(422).send("This category is locked");
  
      const getOrderNumber = (num, list) => {
        if (num < 0) return 0;
        if (num > list.length) return list.length;
        return num;
      }

      const finishList = await models.Finish.findAll({ where: { ProjectId: project.id, category: category }});
      const newOrderNumber = getOrderNumber(Number(orderNumber), finishList);
      const nextFinishList = finishList.filter(f => f.id !== finish.id).sort((a,b) => a.orderNumber - b.orderNumber);
      nextFinishList.splice(newOrderNumber, 0, finish);

      const promisedNewOrderedFinishes = nextFinishList.map((f, i) => f.update({ orderNumber: i }));
      const newOrderedFinishes = await Promise.all(promisedNewOrderedFinishes);
      if (newOrderedFinishes.includes(null)) return res.status(422).send("Could not complete request");

      return res.json({category, newOrderedFinishes});
    } catch(error){
      console.error(error);
      return res.status(422).send("Could not complete update");
    }
  });
  
  app.post("/api2/v2/project/lock_category/:project_access_token", m.authUser, async (req, res) => {
    const projectAccessToken = req.params["project_access_token"];
    const { category } = req.body;
    if (!category) return res.status(422).send("a category is required");
  
    try {
      const project = await models.Project.findOne({ where: { accessToken: projectAccessToken } });
      if (!project) return res.status(404).send("Project not found");
      
      await models.CategoryLock.findOrCreate({
        where: {
          ProjectId: project.id,
          category
        }
      });
      
      const categoryLocks = await project.getCategoryLocks();

      const lockedCategories = categoryLocks.map(cl => cl.category);
      return res.json({ lockedCategories });
    } catch(error){
      console.error(error);
      return res.status(422).send("Could not complete update");
    }
  });

    
  app.delete("/api2/v2/project/unlock_category/:project_access_token", m.authSuperAdmin, async (req, res) => {
    const projectAccessToken = req.params["project_access_token"];
    const { category } = req.body;
    if (!category) return res.status(422).send("a category is required");
  
    try {
      const project = await models.Project.findOne({ where: { accessToken: projectAccessToken } });
      if (!project) return res.status(404).send("Project not found");
      
      await models.CategoryLock.destroy({
        where: {
          ProjectId: project.id,
          category
        }
      });
      
      const categoryLocks = await project.getCategoryLocks();

      const lockedCategories = categoryLocks.map(cl => cl.category);
      return res.json({ lockedCategories });
    } catch(error){
      console.error(error);
      return res.status(422).send("Could not complete update");
    }
  });

  app.post("/api2/v2/upload/from_url", m.authUser, async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).send("a web resource is required");
    try {
      const stream = got.stream(url);
      const filetype = await FileType.fromStream(stream);
      if (!filetype) return res.status(422).send("this URL cannot be processed as an image");
      const { ext, mime } = filetype;
      if (!mime.startsWith('image/')) return res.status(422).send("cannot convert this web resource into image");
  
      const filename = `tmp/${uuid()}.${ext}`;
  
      request({ url, encoding: null }, (err, r, body) => {
        if (err) return res.status(422).json({ error: err })
        const bucket = process.env.BUCKET;
        const imageURL = `https://${bucket}.s3-us-west-2.amazonaws.com/${filename}`;

        s3.putObject({
          Bucket: bucket,
          Key: filename,
          ACL: "public-read",
          ContentType: r.headers['content-type'],
          ContentLength: r.headers['content-length'],
          Body: body,
        }, (error, data) => {
          if (error) console.error(error);
          if (error) return res.status(422).send("Could not upload this image");
          return res.json({ imageURL });
        });

      });
    } catch (error){
      console.error(error);
      res.status(422).send("Could not complete this request");
    }
  });
}
