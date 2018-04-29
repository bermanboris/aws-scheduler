import AWS from "aws-sdk";
import Consumer from "sqs-consumer";

import SQS from "./sqs";
import { normalizeText } from "./helpers";
import { Job } from "./job";

async function createJob({ name, handleJob }) {
  const queueUrl = await SQS.findOrCreateQueue(normalizeText(name));

  const sqsConsumer = Consumer.create({
    queueUrl,
    sqs: new AWS.SQS(),
    batchSize: 10,
    messageAttributeNames: ["jobId"],
    async handleMessage(rawMessage, done) {
      let jsonMessage;
      let message;

      const jobId = rawMessage.MessageAttributes.jobId.StringValue;

      try {
        message = JSON.parse(rawMessage.Body);
      } catch (err) {
        message = jsonMessage.Body;
      }

      await Job.changeStatus({
        id: jobId,
        inProgress: true,
        finished: false
      });

      handleJob(message, async () => {
        await Job.changeStatus({
          id: jobId,
          inProgress: false,
          finished: true
        });

        done();
      });

      return true;
    }
  });

  return {
    start: () => sqsConsumer.start(),
    stop: () => sqsConsumer.stop()
  };
}

function startJobs(jobs) {
  jobs.forEach(async promisedJob => {
    const job = await promisedJob;
    job.start();
  });
}

export { createJob, startJobs };
