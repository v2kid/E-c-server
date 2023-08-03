// See https://github.com/typicode/json-server#module
const fs = require("fs");
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const userdb = JSON.parse(fs.readFileSync("users.json", "UTF-8"));
const middlewares = jsonServer.defaults()
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
server.use(middlewares)
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(jsonServer.defaults());
const SECRET_KEY = "123456789";
const expiresIn = "1h";
function createToken(payload) {
	return jwt.sign(payload, SECRET_KEY, { expiresIn });
}
function verifyToken(token) {
	return jwt.verify(token, SECRET_KEY, (err, decode) => (decode !== undefined ? decode : err));
}
function isAuthenticated({ email, password }) {
	return userdb.users.findIndex((user) => user.email === email && user.password === password) !== -1;
}
server.post("/auth/login", (req, res) => {
	console.log("login endpoint called; request body:");
	console.log(req.body);
	const { email, password } = req.body;
	if (isAuthenticated({ email, password }) === false) {
		const status = 401;
		const message = "Incorrect email or password";
		res.status(status).json({ status, message });
		return;
	}
	const access_token = createToken({ email, password });
	console.log("Access Token:" + access_token);
	res.status(200).json({ access_token });
});
server.use(/^(?!\/auth).*$/, (req, res, next) => {
	if (req.headers.authorization === undefined || req.headers.authorization.split(" ")[0] !== "Bearer") {
		const status = 401;
		const message = "Error in authorization format";
		res.status(status).json({ status, message });
		return;
	}
	try {
		let verifyTokenResult;
		verifyTokenResult = verifyToken(req.headers.authorization.split(" ")[1]);
		if (verifyTokenResult instanceof Error) {
			const status = 401;
			const message = "Access token not provided";
			res.status(status).json({ status, message });
			return;
		}
		next();
	} catch (err) {
		const status = 401;
		const message = "Error access_token is revoked";
		res.status(status).json({ status, message });
	}
});
server.post("/auth/register", (req, res) => {
	console.log("register endpoint called; request body:");
	console.log(req.body);
	const { email, password } = req.body;
	if (isAuthenticated({ email, password }) === true) {
		const status = 401;
		const message = "Email and Password already exist";
		res.status(status).json({ status, message });
		return;
	}
	
	var lastUserId = userdb.users[userdb.users.length - 1].id;
	userdb.users.push({ id: lastUserId + 1, email: email, password: password });
	fs.writeFile("./users.json", JSON.stringify(userdb), (err, result) => {
		if (err) {
			const status = 401;
			const message = err;
			res.status(status).json({ status, message });
			return;
		}
	});
	const access_token = createToken({ email, password });
	console.log("Access Token:" + access_token);
	res.status(200).json({ access_token });
});











server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id'
}))
server.put('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = req.body;
 
    res.send(user);
  });
  // Custom DELETE route for deleting a user
  server.delete('/users?:id', (req, res) => {
    const userId = parseInt(req.params.id);
   
    res.status(204).end();
  });


server.use(router)
server.listen(3001, () => {
    console.log('JSON Server is running')
})

// Export the Server API
module.exports = server
