function showObject(obj, title = "") {
  console.log(
    _counter++,
    "=========================================",
    title,
    JSON.stringify(obj, null, 4)
  );
}

var _counter = 1;
module.exports.msg = function (msg, color = 1) {
  console.log(_counter++ + ": \u001b[%dm%s\u001b[0m", color, msg);
};

module.exports.error = function (msg, color = 31) {
  console.log(
    _counter++ + ": \u001b[31mERROR:\u001b[0m \u001b[%dm%s\u001b[0m",
    color,
    msg
  );
};

module.exports.warning = function (msg, color = 32) {
  console.log(
    _counter++ + ": \u001b[32mWARNING:\u001b[0m \u001b[%dm%s\u001b[0m",
    color,
    msg
  );
};

module.exports.sleep = function (ms, text = "") {
  if (!text.length !== 0) console.log(text);
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports.catchError = (res, internalError, userError = "") => {
  let fullErrorMsg = "";

  if (userError) {
    fullErrorMsg = userError;
  }

  if (internalError.message) {
    if (fullErrorMsg.length > 0) fullErrorMsg += "\n";
    fullErrorMsg += internalError.message;
  }

  console.log(fullErrorMsg);

  res.json({
    result: false,
    errorMsg: fullErrorMsg,
  });
};
