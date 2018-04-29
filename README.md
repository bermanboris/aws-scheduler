# Scheduler Cron API

This package is responsible for creating new scheduled jobs, and adding them up to the queue when their time is due.

When cron service is started, it connects to DynamoDB table, and gets previously created jobs.
After jobs are fetched, cron service schedules the jobs accordingly to their time format (cron / specific ISO date). Cron service is smart enough to work with recurrent jobs (such as cache clean every night). Recurrent jobs implemented using ES6 iterators.

## Prerequisites

What things you need to install the software and how to install them

* Node.js
* AWS Account

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
import cronApi from "@bermanboris/scheduler-cron-api";

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
  "date": "*/30 * * * * *",
  "data": { "name": "winrar" }
}
```

## Tests

```bash
yarn test
```
