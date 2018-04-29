import { createJob, startJobs } from "./lib/job-handler";

const userReminder = createJob({
  name: "remind user about the event",
  handleJob({ email }, done) {
    // Sending user email logic goes here
    console.log(`Sending ${email} reminder about the event.`);
    done();
  }
});

startJobs([userReminder]);
