import { stripIndents } from "common-tags";

import { debug, error, log } from "./logger";
import { Job } from "./job";
import * as helpers from "./helpers";
import SQS from "./sqs";

class Cron {
  constructor() {
    this.activeTimers = [];
    this.resolvers = [];
  }

  removeScheduledJobs() {
    this.activeTimers.forEach(timer => timer.stop());
    this.resolvers.forEach(resolver => resolver());
    this.activeTimers = [];
    this.resolvers = [];
  }

  async init() {
    const delayBetweenAttempts = 5000;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await this.scheduleJobs();
      console.log("Cleaning after myself...", this.activeTimers);
      this.removeScheduledJobs();
      debug("Don't have any more scheduled tasks. Retrying in 5 sec...");
      await helpers.sleep(delayBetweenAttempts);
    }
  }

  async removeTimer(id) {
    this.activeTimers = this.activeTimers.filter(timer => timer.id !== id);
  }

  async scheduleJobs() {
    const jobs = await Job.getAll();

    const scheduledJobs = jobs.map(job => {
      const promise = new Promise(async resolve => {
        this.resolvers.push(resolve);
        const iterableDate = helpers.dateGenerator(job.cron || job.date);

        for (const nextDate of iterableDate) {
          const timeUntilScheduledDate = helpers.getMSUntilDate(nextDate);

          if (helpers.isDateFromPast(nextDate)) {
            error("Scheduled date is from the PAST. Skipping...");
            break;
          }

          log(stripIndents`
              === SCHEDULING NEW TASK ===
              Scheduled task: "${job.name}"
              Next Execution Date: ${nextDate}
          `);

          const timer = helpers.createTimer(timeUntilScheduledDate);
          this.activeTimers.push(timer);

          await timer.start();

          const queueMessage = await SQS.addToQueue({
            message: job.data,
            queueUrl: job.queueUrl,
            metadata: { jobId: job.id }
          });

          debug(queueMessage);

          this.removeTimer(timer.id);
        }

        resolve();
      });

      return promise;
    });

    await Promise.all(scheduledJobs);
  }
}

export default new Cron();
