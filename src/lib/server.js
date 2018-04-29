import express from "express";
import bodyParser from "body-parser";

import JobRouter from "../routes/job";
import cron from "./cron";

function startCronService() {
  const app = express();

  app.use(bodyParser.json());
  app.use(JobRouter);

  cron.init();

  return {
    _express: app,
    scheduledJobs: () => cron.activeTimers.length,
    start(options = { port: process.env.PORT || 3000 }) {
      app.listen(options.port, () =>
        console.log(`Server is running on port ${options.port}`)
      );
    }
  };
}

export default startCronService;
