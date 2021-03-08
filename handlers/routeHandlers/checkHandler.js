const data = require('../../lib/data')
const { parseJSON, createRandomString  } = require('../../helpers/utilities')
const tokenHandler = require('./tokenHandler')

const handler = {}

handler.checkHandler = (requestProperties, callBack) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete']
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callBack)
    } else {
        callBack(405)
    }
}

handler._check = {}

handler._check.post = (requestProperties, callBack) => {
    // validate inputs
    const protocol = typeof(requestProperties.body.protocol) === "string" && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false

    const url = typeof(requestProperties.body.url) === "string" && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false

    const method = typeof(requestProperties.body.method) === "string" && ['GET', 'PUT', 'POST', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false

    const successCodes = typeof(requestProperties.body.successCodes) === "object" && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false
    
    const timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0  && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false

    if (protocol && url && method && successCodes && timeoutSeconds) {
        const token = typeof(requestProperties.headerObject.token) === 'string' ? requestProperties.headerObject.token : false

        // look up the user phone by reading the token
        data.read('tokens', token, (err1, tokenData) => {
            if (!err1 && tokenData){
                const userPhone = parseJSON(tokenData).phone 

                // lookup the user data
                data.read('users', userPhone, (err2, userData) => {
                    if(!err2 && userData){
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                let userObject = parseJSON(userData)
                                let userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : []

                                if (userChecks.length < 5) {
                                    let checkId = createRandomString(20)
                                    let checkObject = {
                                        'id': checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds
                                    }

                                    // save the object
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            // add check id to the user's object
                                            userObject.checks = userChecks
                                            userObject.checks.push(checkId)

                                            //save the new user
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if (!err4) {
                                                    callBack(200, checkObject)
                                                } else {
                                                    callBack(500, {
                                                        error: 'server side error 2'
                                                    })
                                                }
                                            })
                                        } else {
                                            callBack(500, {
                                                error: 'server side error'
                                            })
                                        }
                                    })
                                } else {
                                    callBack(401, {
                                        error: 'User has already reached max check limit'
                                    })
                                }
                            }else {
                                callBack(403, {
                                    error: 'Token Problem'
                                })
                            }
                        })
                    } else {
                        callBack(403, {
                            error: 'User not found'
                        })
                    }
                })
            } else {
                callBack(403, {
                    error: 'Authentication probelem'
                })
            }
        })

    } else {
        callBack(400, {
            error: 'You have a problem in your request'
        })
    }
}

handler._check.get = (requestProperties, callBack) => {
    const id = typeof(requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false

    if (id) {
        // lookup the check
        data.read('checks', id, (err, checkData) => {
            if(!err && checkData){
                const token = typeof(requestProperties.headerObject.token) === 'string' ? requestProperties.headerObject.token : false

                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        callBack(200, parseJSON(checkData))
                    } else {
                        callBack(403, {
                            error: 'Authentication error!'
                        }) 
                    }
                })
            } else {
                callBack(500, {
                    error: 'You have a problem in your request 2'
                }) 
            }
        })
    } else {
        callBack(400, {
            error: 'You have a problem in your request'
        })
    }
}

handler._check.put = (requestProperties, callBack) => {
    const id = typeof(requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false

    const protocol = typeof(requestProperties.body.protocol) === "string" && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false

    const url = typeof(requestProperties.body.url) === "string" && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false

    const method = typeof(requestProperties.body.method) === "string" && ['GET', 'PUT', 'POST', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false

    const successCodes = typeof(requestProperties.body.successCodes) === "object" && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false
    
    const timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0  && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err1, checkData) => {
                if(!err1 && checkData){
                    let checkObject = parseJSON(checkData)
                    const token = typeof(requestProperties.headerObject.token) === 'string' ? requestProperties.headerObject.token : false

                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if(protocol){
                                checkObject.protocol = protocol
                            }
                            if(url){
                                checkObject.url = url
                            }
                            if(method){
                                checkObject.method = method
                            }
                            if(successCodes){
                                checkObject.successCodes = successCodes
                            }
                            if(timeoutSeconds){
                                checkObject.timeoutSeconds = timeoutSeconds
                            }
                            
                            // store the checkObject
                            data.update('checks', id, checkObject, (err2) => {
                                if(!err2){
                                    callBack(200, checkObject)
                                } else {
                                    callBack(500, {
                                        error: 'server side error 2!'
                                    })
                                }
                            })
                        }else{
                            callBack(403, {
                                error: 'Authentication error!'
                            })
                        }
                    })
                } else {
                    callBack(500, {
                        error: 'server side error!'
                    })
                }
            })
        } else {
            callBack(400, {
                error: 'Required atleast one field for update!'
            })
        }
    } else {
        callBack(400, {
            error: 'You have a problem in your request'
        })
    }
}

handler._check.delete = (requestProperties, callBack) => {
    const id = typeof(requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false

    if (id) {
        // lookup the check
        data.read('checks', id, (err, checkData) => {
            if(!err && checkData){
                const token = typeof(requestProperties.headerObject.token) === 'string' ? requestProperties.headerObject.token : false
                let checkObject = parseJSON(checkData)
                
                tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // delete the checkdata
                        data.delete('checks', id, (err1)=>{
                            if(!err1){
                                data.read('users', checkObject.userPhone,  (err3, userData) => {
                                    let userObject = parseJSON(userData)
                                    if(!err3 && userData){
                                        let userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : []

                                        // remove the deleted check id from user's list of checks
                                        let checkPosition = userChecks.indexOf(id)
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition, 1)

                                            // resave the user data
                                            userObject.checks = userChecks
                                            data.update('users', userObject.phone, userObject, (err4) => {
                                                if(!err4){
                                                    callBack(200, {
                                                        message: "successfully deleted!"
                                                    })
                                                } else {
                                                    callBack(500, {
                                                        error: 'server side error 3!'
                                                    }) 
                                                }
                                            })
                                        } else {
                                            callBack(500, {
                                                error: 'item could not found!'
                                            }) 
                                        }
                                    } else {
                                        callBack(500, {
                                            error: 'server side error 2!'
                                        }) 
                                    }
                                })
                            } else {
                                callBack(500, {
                                    error: 'server side error!'
                                })  
                            }
                        })
                    } else {
                        callBack(403, {
                            error: 'Authentication error!'
                        }) 
                    }
                })
            } else {
                callBack(500, {
                    error: 'You have a problem in your request 2'
                }) 
            }
        })
    } else {
        callBack(400, {
            error: 'You have a problem in your request'
        })
    }  
}

module.exports = handler