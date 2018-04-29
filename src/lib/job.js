import uuid from "uuid";

import SQS from "./sqs";
import { normalizeText } from "./helpers";
import DynamoDB from "./dynamodb";

const dynamo = DynamoDB();

export class Job {
  constructor({ name, data, cron, date, recurring = false }) {
    this.job = {
      id: uuid.v4(),
      name: normalizeText(name),
      data: JSON.stringify(data),
      cron,
      date,
      recurring,
      inProgress: false,
      finished: false
    };
  }

  static get(id) {
    return dynamo.get(id);
  }

  static delete(id) {
    return dynamo.delete(id);
  }

  static changeStatus({ id, inProgress, finished }) {
    return dynamo.update({ id, inProgress, finished });
  }

  static async getAll() {
    return dynamo.getAll();
  }

  async save() {
    const jobName = this.job.name;
    let queueUrl = await SQS.getQueueUrl(jobName);

    if (!queueUrl) {
      queueUrl = await SQS.createQueue(jobName);
    }

    return dynamo.add({ ...this.job, queueUrl });
  }
}
