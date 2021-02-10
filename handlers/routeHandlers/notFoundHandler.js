const handler = {}

handler.notFoundHandler = (requestProperties, callBack) => {
    console.log(requestProperties)

    callBack(404, {
        message: 'Your requested url was not found!'
    })
}

module.exports = handler