# Scheduler Cron API

![Project Architecture](/docs/architecture.png?raw=true "Project Architecture")

This package is responsible for creating new scheduled jobs, and adding them up to the queue when their time is due.

When cron service is started, it connects to DynamoDB table, and gets previously created jobs.
After jobs are fetched, cron service schedules the jobs accordingly to their time format (cron / specific ISO date). Cron service is smart enough to work with recurrent jobs (such as: clear cache every night). Recurrent jobs implemented using ES6 iterators.

When job time is due, cron service adds it the job to the SQS queue accordingly to the job name. If queue does not exists, it's being created. On the other side, job handler must be created with the same job name.

## Prerequisites

What things you need to install the software and how to install them

* Node.js
* AWS Account with access to the SQS and DynamoDB

## Installation

A step by step series of examples that tell you have to get a development env running

```bash
yarn add @bermanboris/scheduler-cron-api
```

You have to setup these environment variables before the use:

```
AWS_ACCESS_KEY_ID=XXX
AWS_SECRET_ACCESS_KEY=XXX
AWS_REGION=eu-west-1
DYNAMODB_JOBS_TABLE=scheduled_jobs
```

## Usage

```js
import cronApi from "@bermanboris/scheduler";

const cron = cronApi();
cron.start({ port: 8080 });
```

Congratulation! Cron API is now running on "http://localhost:8080".

Available routes:

| Description             | URL          | Method |
| ----------------------- | :----------- | :----: |
| Get all scheduled tasks | /list        |  GET   |
| Create new task         | /create      |  POST  |
| Delete task             | /delete/:id  | DELETE |
| Reload jobs from DB     | /reload-jobs |  GET   |

To create new task, you need to send POST request to /create, with body such as:

```js
{
  "name": String,
  "data": Object,
  "cron": String,
  "date": String
}
```

When you create a new task, you can choose between "cron", and ISO date formats.

Example of task that executes once at specific date:

```js
{
  "name": "Remind user before the event",
  "date": "2018-04-28T09:48:35.429Z",
  "data": { "eventName": "Eminem Concert", "email": "john@gmail.com" }
}
```

Example of task that executes every 30 seconds:

```js
{
  "name": "Check for software updates",
  "cron": "*/30 * * * * *",
  "data": { "name": "winrar" }
}
```

## Job Handlers

After job is added to the queue, job handler has to pull it off, do it's thing, and mark job as done.

Let's create job handler for user reminder example:

```js
import { createJob, startJobs } from "@bermanboris/scheduler";

const userReminderJob = createJob({
  name: "Remind user before the event",
  handleJob({ email, eventName }, done) {
    console.log(`Sending ${email} reminder about the ${eventName} event.`);
    done();
  }
});

startJobs([userReminderJob]);
```

"createJob" function provides us with an easy API to setup the jobs listener. You must provide it a configuration object with the job name, and handleJob method that receives the data object from the job, and done method. After you job is finished, you have to call "done" method, to delete it from the queue. If job is failed for some reason, you want to return it to the queue. To mark job as "failed" and return it to the queue, you have to call "done" method with an Error object.

## Tests

```bash
yarn test
```
