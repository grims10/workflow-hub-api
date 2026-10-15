const bcrypt = require("bcryptjs");

// Dependency injection keeps the handler easy to test without a live database.
const createRegisterUser = ({ userStore, hashPassword = bcrypt.hash }) => async (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ success: false, message: "Name must be between 2 and 100 characters." });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Provide a valid email address." });
  }
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({ success: false, message: "Password must contain at least 12 characters and no more than 72 UTF-8 bytes." });
  }

  try {
    const passwordHash = await hashPassword(password, 12);
    const user = await userStore.create({
      data: { name, email, password: passwordHash },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return res.status(201).json({ success: true, message: "User created successfully", data: user });
  } catch (error) {
    if (error && error.code === "P2002") {
      return res.status(409).json({ success: false, message: "An account with that email already exists." });
    }
    return res.status(500).json({ success: false, message: "Unable to create account." });
  }
};

const registerUser = createRegisterUser({
  userStore: { create: (args) => require("../config/prisma").user.create(args) },
});

module.exports = { createRegisterUser, registerUser };
