function showObject(obj, title = "") {
  console.log(
    _counter++,
    "=========================================",
    title,
    JSON.stringify(obj, null, 4)
  );
}

var _counter = 1;
module.exports.msg = function (msg, color = 31) {
  console.log(_counter++ + ": \u001b[%dm%s\u001b[0m", color, msg);
};

module.exports.error = function (msg, color = 31) {
  console.log(
    _counter++ + ": \u001b[31mERROR:\u001b[0m \u001b[%dm%s\u001b[0m",
    color,
    msg
  );
};

// module.exports = { showObject, myprint };
