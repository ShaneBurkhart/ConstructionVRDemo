const express = require("express");
const fetch = require('node-fetch');
const Queue = require('bee-queue');

const QUEUES = ["split_pdf", "pdf_to_image"];
const CONFIG = { redis: { host: 'redis' } };
const _singleton = {};

const _getQueue = (name) => {
    if (!_singleton[name]) _singleton[name] = new Queue(name, CONFIG)
    return _singleton[name];
};

QUEUES.forEach(q => {
    const camelCase = "start" + q.split("_").map(t=>(t.charAt(0).toUpperCase() + t.slice(1))).join("");
    const queue = _getQueue(q);

    // CHECK FOR PROD OR DEVELOPMENT
    // DEV uses queues
    // PROD uses aws sdk
    exports[camelCase] = (data) => queue.createJob(data).save();
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