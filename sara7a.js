saraha/
├── src/
│   ├── config/db.js
│   ├── models/user.model.js
│   ├── models/message.model.js
│   ├── controllers/user.controller.js
│   ├── controllers/message.controller.js
│   ├── routes/user.routes.js
│   ├── routes/message.routes.js
│   ├── middlewares/auth.js
│   ├── middlewares/validate.js
│   └── app.js
├── .env
└── package.json


// user.model.js
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isConfirmed: { type: Boolean, default: false }
}, { timestamps: true });

// message.model.js
const messageSchema = new mongoose.Schema({
  content:    { type: String, required: true },
  receiverId: { type: mongoose.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });



 // signup
const hashed = await bcrypt.hash(password, 10);   // Hashing
await User.create({ name, email, password: hashed });

// login
const user = await User.findOne({ email });
if (!user || !(await bcrypt.compare(password, user.password)))
  return res.status(401).json({ message: "Invalid credentials" });

const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
res.json({ token });



module.exports = async (req, res, next) => {
  const header = req.headers.authorization;           // "Bearer <token>"
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ message: "Token required" });

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};




// send
exports.sendMessage = async (req, res) => {
  const receiver = await User.findById(req.params.receiverId);
  if (!receiver) return res.status(404).json({ message: "User not found" });
  await Message.create({ content: req.body.content, receiverId: receiver._id });
  res.status(201).json({ message: "Sent" });
};

// get my messages
exports.getMessages = async (req, res) => {
  const messages = await Message.find({ receiverId: req.user._id });
  res.json({ messages });
};





