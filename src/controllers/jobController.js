import { Job } from "../lib/job";
import Cron from "../lib/cron";

const JobController = {
  create: async (req, res) => {
    const { name, cron, data, date, recurring = false } = req.body;
    const job = new Job({ name, data, cron, date, recurring });

    await job.save();

    Cron.removeScheduledJobs();
    res.json(job);
  },
  delete: async (req, res) => {
    const jobId = req.params.id;
    await Job.delete(jobId);

    Cron.removeScheduledJobs();
    res.json({ success: true });
  },
  list: async (req, res) => {
    const jobs = await Job.getAll();
    res.json(jobs);
  },
  reloadJobs: async (req, res) => {
    Cron.removeScheduledJobs();
    res.json(true);
  }
};

export default JobController;
