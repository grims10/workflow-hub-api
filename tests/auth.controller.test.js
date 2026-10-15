const test = require("node:test");
const assert = require("node:assert/strict");
const { createRegisterUser } = require("../backend/src/controllers/auth.controller");

function responseRecorder() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

const validBody = { name: "  Ada Lovelace ", email: " ADA@EXAMPLE.COM ", password: "long-password-123" };

test("registers normalized user, hashes password, and returns no password", async () => {
  let created;
  const handler = createRegisterUser({
    userStore: { async create(args) { created = args; return { id: "u1", name: "Ada Lovelace", email: "ada@example.com", role: "EMPLOYEE" }; } },
    async hashPassword(password, cost) { assert.equal(password, validBody.password); assert.equal(cost, 12); return "hashed-value"; },
  });
  const res = responseRecorder();
  await handler({ body: validBody }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(created.data.name, "Ada Lovelace");
  assert.equal(created.data.email, "ada@example.com");
  assert.equal(created.data.password, "hashed-value");
  assert.equal("password" in res.body.data, false);
});

test("rejects malformed input before database access", async () => {
  let called = false;
  const handler = createRegisterUser({ userStore: { async create() { called = true; } } });
  const res = responseRecorder();
  await handler({ body: { ...validBody, email: "bad", password: "short" } }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(called, false);
});

test("maps duplicate email to conflict", async () => {
  const handler = createRegisterUser({
    userStore: { async create() { const error = new Error("duplicate"); error.code = "P2002"; throw error; } },
    async hashPassword() { return "hash"; },
  });
  const res = responseRecorder();
  await handler({ body: validBody }, res);
  assert.equal(res.statusCode, 409);
});

test("returns a generic error for unexpected database failures", async () => {
  const handler = createRegisterUser({
    userStore: { async create() { throw new Error("sensitive internal detail"); } },
    async hashPassword() { return "hash"; },
  });
  const res = responseRecorder();
  await handler({ body: validBody }, res);
  assert.equal(res.statusCode, 500);
  assert.doesNotMatch(res.body.message, /sensitive/);
});
