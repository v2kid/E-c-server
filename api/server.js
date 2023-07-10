// See https://github.com/typicode/json-server#module
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
// Add this before server.use(router)
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
