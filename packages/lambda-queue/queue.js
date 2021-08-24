const express = require("express");
const fetch = require('node-fetch');
const Queue = require('bee-queue');
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();

const QUEUE_TO_FUNCTION = {
    'split_pdf': process.env.AWS_SPLIT_PDF_LAMBDA_FUNCTION_NAME,
    'pdf_to_image': process.env.AWS_SPLIT_PDF_LAMBDA_FUNCTION_NAME,
}

const QUEUES = Object.keys(QUEUE_TO_FUNCTION)
const CONFIG = { redis: { host: 'redis' } };
const _singleton = {};

const _getQueue = (name) => {
    if (!_singleton[name]) _singleton[name] = new Queue(name, CONFIG)
    return _singleton[name];
};

QUEUES.forEach(q => {
    const camelCase = "start" + q.split("_").map(t=>(t.charAt(0).toUpperCase() + t.slice(1))).join("");
    const queue = _getQueue(q);

    // DEV uses queues
    let handler = (data) => queue.createJob(data).save();

    // CHECK FOR PROD OR DEVELOPMENT
    if (process.env.NODE_ENV === "production") {
        handler = (data) => {
            // PROD uses aws sdk
            const params = {
                "FunctionName": QUEUE_TO_FUNCTION[q],
                "InvocationType": "Event",
                "Payload": JSON.stringify(data)
            }      

            // No need to wait since we designated async
            const result = lambda.invoke(params, (err, data) => {
                if (err) console.log('LAMBDA ERROR', err)
            })
        }
    }

    exports[camelCase] = handler
});

const _processJob = async (name, data) => {
    const url = `http://${name}:8080/2015-03-31/functions/function/invocations`;
    console.log(url, data);
    await fetch(url, { method: 'post', body: JSON.stringify(data) });
}

exports.startProcessors = () => {
    console.log("STARTING QUEUE PROCESSORS...");
    QUEUES.forEach(q => {
        _getQueue(q).process(1, async (job) =>  await _processJob(job.queue.name, job.data));
    });
}

exports.startServer = () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.post("/", (req, res) => {
        const name = req.body.name;
        const data = req.body.data;

        console.log("Queue job for " + name, data);
        if (QUEUES.includes(name) && data) _getQueue(name).createJob(data).save();
        res.status(200).end();
    });

    app.listen(3000, () => { console.log(`JOB QUEUE SERVER STARTED`) });
}