import AWS from "aws-sdk";
import { sleep } from "./helpers";

function DynamoDB(TableName = process.env.DYNAMODB_JOBS_TABLE || "__jobs__") {
  const dynamodb = new AWS.DynamoDB();
  const dynamo = new AWS.DynamoDB.DocumentClient();

  function generateUpdateExpression(data) {
    return Object.keys(data).reduce((all, key, i) => {
      if (i === 0) {
        return Object.assign({}, all, {
          UpdateExpression: `set ${key} = :${key}`,
          ExpressionAttributeValues: {
            [`:${key}`]: data[key]
          }
        });
      }

      return Object.assign({}, all, {
        UpdateExpression: `${all.UpdateExpression}, ${key} = :${key}`,
        ExpressionAttributeValues: {
          [`:${key}`]: data[key]
        }
      });
    }, {});
  }

  /*
    To prevent race condition problems related to initial table creation, we use ES6 proxy decorator.
    This way, we don't end in the situation, where user is trying to interact with non-existing table in the database.
  */
  function decorateObject(obj) {
    let hasTable = false;

    const proxyHandler = {
      get(target, propKey) {
        const origMethod = target[propKey];

        if (hasTable) {
          return origMethod;
        }

        return async (...args) => {
          const { TableNames } = await dynamodb.listTables().promise();

          let tableCreated = false;

          if (!TableNames.includes(TableName)) {
            const { TableDescription } = await dynamodb
              .createTable({
                KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
                AttributeDefinitions: [
                  { AttributeName: "id", AttributeType: "S" }
                ],
                ProvisionedThroughput: {
                  ReadCapacityUnits: 5,
                  WriteCapacityUnits: 5
                },
                TableName
              })
              .promise();

            if (TableDescription.TableStatus === "CREATING") {
              while (!tableCreated) {
                const { Table } = await dynamodb
                  .describeTable({ TableName })
                  .promise();

                if (Table.TableStatus === "CREATING") {
                  await sleep(1000);
                  // eslint-disable-next-line no-continue
                  continue;
                }
                tableCreated = true;
              }
            }
          }

          hasTable = true;

          return origMethod(...args);
        };
      }
    };

    return new Proxy(obj, proxyHandler);
  }

  return decorateObject({
    add(Item) {
      return dynamo.put({ TableName, Item }).promise();
    },
    get(id) {
      return dynamo.get({ Key: { id }, TableName }).promise();
    },
    delete(id) {
      return dynamo.delete({ Key: { id }, TableName }).promise();
    },
    update({ id, ...params }) {
      return dynamo
        .update({
          TableName,
          Key: { id },
          ...generateUpdateExpression(params)
        })
        .promise();
    },
    async getAll() {
      const { Items } = await dynamo.scan({ TableName }).promise();

      if (!Items) {
        return [];
      }

      return Items.reduce((all, item) => {
        let data;

        try {
          data = JSON.parse(item.data);
        } catch (err) {
          // eslint-disable-next-line prefer-destructuring
          data = item.data;
        }

        return [...all, { ...item, data }];
      }, []);
    }
  });
}

export default DynamoDB;
