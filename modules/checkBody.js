function checkBody(body, keys) {
  let value = { status: true, error: "" };

  for (const field of keys) {
    if (!body[field] || body[field] === "") {
      value.status = false;
      value.error += `Missing or empty "${field}"\n.`;
    }
  }

  return value;
}

module.exports = { checkBody };
