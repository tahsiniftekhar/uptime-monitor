const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler')
const { userHandler } = require('./handlers/routeHandlers/userHandler')
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler')
const { checkHandler } = require('./handlers/routeHandlers/checkHandler')

const routes = {
    'check': checkHandler,
    'sample': sampleHandler,
    'user': userHandler,
    'token': tokenHandler,
}

module.exports = routes