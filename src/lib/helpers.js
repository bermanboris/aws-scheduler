import moment from "moment";
import uuid from "uuid";
import cronParser from "cron-parser";
import BigTime from "big-time";

export const normalizeText = text =>
  text
    .split(" ")
    .join("_")
    .toUpperCase();

export const createTimer = ms => {
  let timer;
  let promiseResolve;

  const active = false;

  return {
    id: uuid.v4(),
    active,
    start() {
      this.active = true;
      return new Promise(resolve => {
        promiseResolve = resolve;
        timer = BigTime.setTimeout(() => {
          this.active = false;
          resolve();
        }, ms);
      });
    },
    stop() {
      this.active = false;
      promiseResolve();
      return BigTime.clearTimeout(timer);
    }
  };
};

export const isDateFromPast = date => moment(date).isBefore(moment());

export const getMSUntilDate = date => moment(date).diff(moment());

export const sleep = ms =>
  new Promise(resolve => BigTime.setTimeout(resolve, ms));

export function* createIterableDate(expression) {
  while (true) {
    try {
      const cronExpression = cronParser.parseExpression(expression);
      yield cronExpression.next().toISOString();
    } catch (err) {
      // One time event (expression is a ISO string), yield once and exit.
      yield expression;
      return;
    }
  }
}
