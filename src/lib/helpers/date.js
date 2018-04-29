import moment from "moment";
import cronParser from "cron-parser";

const isDateFromPast = date => moment(date).isBefore(moment());
const getMSUntilDate = date => moment(date).diff(moment());

function* dateGenerator(expression) {
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

export { dateGenerator, isDateFromPast, getMSUntilDate };
