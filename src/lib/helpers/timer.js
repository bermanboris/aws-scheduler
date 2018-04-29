import BigTime from "big-time";
import uuid from "uuid";

const sleep = ms => new Promise(resolve => BigTime.setTimeout(resolve, ms));

const createTimer = ms => {
  let timer;
  let promiseResolve;

  return {
    id: uuid.v4(),
    start() {
      return new Promise(resolve => {
        promiseResolve = resolve;
        timer = BigTime.setTimeout(() => {
          resolve();
        }, ms);
      });
    },
    stop() {
      promiseResolve();
      return BigTime.clearTimeout(timer);
    }
  };
};

export { createTimer, sleep };
