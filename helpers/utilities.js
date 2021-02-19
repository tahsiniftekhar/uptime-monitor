const crypto = require('crypto')

const utilities = {}

// parse json string to object
utilities.parseJSON = jsonString => {
    let output

    try {
        output = JSON.parse(jsonString)
    } catch {
        output = {}
    }
    
    return output
}

// hash string
utilities.hash = str => {
    if(typeof(str) === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', 'dgdkfgdkk')
            .update(str)
            .digest('hex')
        return hash
    }
    return false
}

module.exports = utilities