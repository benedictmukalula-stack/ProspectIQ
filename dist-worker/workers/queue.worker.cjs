"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("dotenv/config");
const queue_service_1 = require("../lib/queue/queue.service");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function processJob(job) {
    console.log("Processing:", job.id);
    await (0, queue_service_1.markJobProcessing)(job.id);
    await sleep(1000);
    await (0, queue_service_1.markJobSent)(job.id, job.attempts || 0);
    console.log("Done:", job.id);
}
async function run() {
    console.log("Queue worker running...");
    while (true) {
        const { data } = await (0, queue_service_1.getPendingJobs)(5);
        if (data?.length) {
            for (const job of data) {
                await processJob(job);
            }
        }
        await sleep(2000);
    }
}
run();
