// This file is an example brought in from SnappyPDF --> implementation is found ./plans.js
const models = require("../models")
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const uuid = require("uuid").v4;
const queue = require("lambda-queue");

const AWS_BUCKET = process.env.AWS_BUCKET;
const AWS_REGION = process.env.AWS_REGION;

exports.getDocument = async (req, res) => {
	const { documentUuid } = req.form
	const document = await models.Document.findOne({ where: { uuid: documentUuid }, include: models.Sheet })
	if (!document) return res.status(422).send("Document not found")
	res.json(document)
}

exports.createDocument = async (req, res) => {
	const { s3Url, filename } = req.form
	const document = await models.Document.create({ 
		s3Url, filename, startedPipelineAt: Date.now()
	})
	if (!document) return res.status(422).send("Could not create document")

	queue.startSplitPdf({
		's3Key': encodeURIComponent(document.s3Url),
		'objectId': document.uuid
	});

	res.json(document)
}

exports.generatePresignedURL = (req, res) => {
	const { filename, mime } = req.form
	const id = uuid()
	const s3Key = `documents/${id}_${filename}`;
	const expiresInSeconds = 60 * 5;

	console.log(filename, mime)

	const url = s3.getSignedUrl('putObject', {
		Bucket: AWS_BUCKET,
		Key: s3Key,
		ContentType: mime,
		ContentDisposition: `attachment; filename='${filename}'`,
		ACL: "public-read",
		Expires: expiresInSeconds
	}, (err, url) => {
		if (err) console.log(err)
		if (err) return res.status(422).send("Could not initiate upload");

		const encodedKey = `documents/${id}_${encodeURIComponent(filename)}`;

		res.json({
			presignedURL: url,
			awsURL: `https://${AWS_BUCKET}.s3-${AWS_REGION}.amazonaws.com/${encodedKey}`,
		});
	})
}

exports.pipelineWebhooks = async (req, res) => {
	const { type, data } = req.form

	console.log("FORM", req.form)

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
}