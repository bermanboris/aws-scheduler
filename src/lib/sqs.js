import AWS from "aws-sdk";

const sqs = new AWS.SQS();

class SQS {
  static async addToQueue({ message, queueUrl, metadata }) {
    try {
      return await sqs
        .sendMessage({
          MessageBody: JSON.stringify(message),
          QueueUrl: queueUrl,
          MessageAttributes: this.generateMessageAttributes(metadata)
        })
        .promise();
    } catch (err) {
      throw err;
    }
  }

  static generateMessageAttributes(metadata) {
    return Object.keys(metadata).reduce(
      (all, key) =>
        Object.assign({}, all, {
          [key]: {
            DataType: "String",
            StringValue: metadata[key]
          }
        }),
      {}
    );
  }

  static async getQueueUrl(QueueName) {
    try {
      const response = await sqs.getQueueUrl({ QueueName }).promise();
      return response.QueueUrl;
    } catch (err) {
      return null;
    }
  }

  static async createQueue(name) {
    try {
      const response = await sqs.createQueue({ QueueName: name }).promise();
      return response.QueueUrl;
    } catch (err) {
      console.error("Cannot create Queue", err.message);
      return null;
    }
  }

  static async findOrCreateQueue(name) {
    try {
      const queueUrl = await this.getQueueUrl(name);

      if (!queueUrl) {
        return await this.createQueue(name);
      }
    } catch (err) {
      throw new Error("Cannot create queue.");
    }
  }
}

export default SQS;
