const {getCognitoUserProfile, decodeAccessToken, decodeIDoken} = require("../common/cognitoHelper")
const {createBlueconicUserProfile} = require("../common/blueconicHelper")
const { updateUser } = require("./db")

async function createNewUser(accessToken, idToken){

    // Build user profile by decode accessToken & idToken
    let userProfile


    // Save user profile to DB
    await updateUser(userProfile)


    // Create Blueconic profile 
    await createBlueconicUserProfile()

    return userProfile
}

module.exports.createNewUser = createNewUser