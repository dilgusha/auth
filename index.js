const express = require("express");
const jwt = require("jsonwebtoken");  //token yaratmaq ve user validation ucun 

const app = express();
const PORT = 3000;

app.use(express.json());

const SECRET_KEY = "supersecretkey";

const users = [
  { id: 1, username: "admin", password: "12345" },
  { id: 2, username: "user", password: "1234" },
];

const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, SECRET_KEY); //{ expiresIn: "1h"} ;-bunu yazsaq 1 saat ucun kecerli bir token olacaq
};
const authorize = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: "Authorization required" });
  }

  const token = authHeader.split(" ")[1];// Bearer sozunun tokenden ayirir
  try {
    const decoded = jwt.verify(token, SECRET_KEY); // token ve acar
    req.user = decoded;// bu setri ona gore yaziriq ki istifadecinin melumatlati bize lazim olur meselen profile-de req.user.username
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token not valid' });
  }

  // RFC 6750 standardına göre, token bu formatta gönderilmelidir:   Authorization: Bearer <token>

};
app.post('/register', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) res.status(400).json({ message: 'Username or password is required' })

  const existUser = users.find(item => item.username === username)
  if (existUser) res.status(200).json({ message: 'User already exists' })

  const newUser = {
    id: users.length + 1,
    username,
    password
  }
  users.push(newUser)

  const token = generateToken(newUser) // istifadeci ucun token yaradir username ve id-e esasen
  res.json({ message: 'Register succesfully', token })
})


app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((item) => item.username === username && item.password === password);

  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  const token = generateToken(user);  // daxil olan istifadecinin tokeni ile bazadaki tokeni qarsilasdirmaq ucun yaziriq 
  res.json({ token });
});



app.get("/profile", authorize, (req, res) => {
  res.json({ message: `Hello: ${req.user.username}` });
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});


// bunu fs ile yazin
