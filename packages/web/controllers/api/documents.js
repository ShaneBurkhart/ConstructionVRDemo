const models = require("../../models/index.js");

module.exports = (app) => {
  app.get("/api2/v2/documents/:documentUuid", async (req, res) => {
		const { documentUuid } = req.params;
		const document = await models.Document.findOne({ where: { uuid: documentUuid }});
		if (!document) return res.status(422).send("Document not found");
		res.json(document);
	});

	// pipelineWebhooks
	app.post("/api2/_webhooks/documents", async (req, res) => {
		const { type, data } = req.body;

		console.log("FORM", req.body);

		switch (type) {
			case "SPLIT_PDF_COMPLETED":
				// Nothing to do 
				break
			case "PAGE_COUNT":
				await models.Document.update({ pageCount: data.pageCount }, { where: { uuid: data.objectId }})
				break
			case "SHEET_TO_IMAGE_COMPLETED":
				const doc = await models.Document.findOne({ where: { uuid: data.objectId }, include: models.Sheet })
				if (!doc) return res.status(422).send("")

				const sheets = doc.Sheets || []
				const pageIndex = data.pageIndex
				const sheet = sheets.find(s => s.index === pageIndex)
				if (sheet) return res.status(422).send("")

				await doc.createSheet({ index: pageIndex, width: data.sheetWidth, height: data.sheetHeight, DocumentUuid: doc.uuid })
				break

			default: 
				console.log("Invalid event type to webhook", type)
				res.status(422).send("Invalid type for webhook event")
		}

		res.send("Completed")
	});
}
