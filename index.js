// dependencies
const http = require("http")
const { handleReqRes } = require("./helpers/handleReqRes")
const data = require('./lib/data')

// app object - module scaffolding
const app = {}

// testing file system
data.delete('', 'newFile', (err) => {
    console.log(err)
})

// configuration
app.config = {
    port: 3000
}

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes)
    server.listen(app.config.port, () => {
        console.log(`listening to port ${app.config.port}`)
    })
}

// handle Request Response
app.handleReqRes = handleReqRes

// start server
app.createServer()