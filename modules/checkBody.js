function checkBody(body, keys) {
  let value = { status: true, error: "" };

  for (const field of keys) {
    if (!body[field] || body[field] === "") {
      value.status = false;
      if (value.error !== "") value.error += "\n";
      value.error += `Missing or empty "${field}".`;
    }
  }

  return value;
}

module.exports = { checkBody };
