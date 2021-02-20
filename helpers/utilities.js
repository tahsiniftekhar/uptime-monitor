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

// create random string
utilities.createRandomString = strLength => {
    length = typeof(strLength) === 'number' && strLength > 0 ? strLength : false

    if(length) {
        let possiblecharacters = 'abcdefghojklmnopqrstuvwxyz1234567890'
        let output = ''
        for(let i=1; i<=length; i++){
            let randomCharacter = possiblecharacters.charAt(Math.floor(Math.random() * possiblecharacters.length))

            output += randomCharacter
        }
        return output
    }
    return false
}

module.exports = utilities