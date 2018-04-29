import jobController from "../src/controllers/jobController";
import cron from "../src/lib/cron";
import { Job, mockSaveJob } from "../src/lib/job";

jest.mock("../src/lib/job");
jest.mock("../src/lib/cron");

describe("Scheduler", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = { json: jest.fn() };
  });

  describe("Cron API", () => {
    test("returns existing jobs", async () => {
      await jobController.list(req, res);
      expect(res.json).toBeCalledWith([]);
    });

    test("reloads jobs from the db", async () => {
      jobController.reloadJobs(req, res);
      expect(cron.removeScheduledJobs).toBeCalled();
    });

    test("deletes the passed job by id", async () => {
      req = { params: { id: "abc123" } };
      jobController.delete(req, res);

      expect(Job.delete).toBeCalledWith("abc123");
    });

    test("creates new job", async () => {
      req = {
        body: {
          name: "Send email before the event",
          cron: "*/10 * * * * *",
          data: { email: "john@gmail.com" }
        }
      };

      jobController.create(req, res);

      expect(Job).toHaveBeenCalledTimes(1);
      expect(mockSaveJob).toBeCalled();
    });
  });
});
