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

async function getUserLocation(user, ){
    // check cache in user
    let locationCaches = user.getLocation()

    if(!locationCaches || locationCaches.expired()){

        // get location by location module
        location = await getLocation()

        // Cache location
        updateUser(user, location)
    }

    return location
}

async function updateUserDeviceTravelStatus (user, deviceID, location){

    // Update device travel status base on current location
    /** @type {DeviceTravelStatus} */
    let deviceTravelStatus = user.getDeviceTravelStatus(deviceID)

    // check travel status in user device
    if(location.isInMarket !== deviceTravelStatus.isInMarket){

        // Set device travel status
        deviceTravelStatus.setTravelStatus(isInMarket)

        // Save device travel status
        updateUser(userID, deviceTravelStatus)
    }

    return deviceTravelStatus
}

module.exports.createNewUser = createNewUser
module.exports.getUserLocation = getUserLocation
module.exports.updateUserDeviceTravelStatus = updateUserDeviceTravelStatus