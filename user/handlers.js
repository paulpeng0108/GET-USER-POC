const User = require("./User")
const { findUserByUserID } = require("./db")
const { DeviceTravelStatus } = require("../deviceTravelStatus/DeviceTravelStatus")
const { getLocation } = require("../ipLookUp/helper")
const { getEntitlmentDetail } = require("../entitlement/helper")
const { createNewUser, getUserLocation, updateUserDeviceTravelStatus } = require("./helper")





// V2 moves the get/set cache logic to userHelper,  makes location module, deviceTravelStatus module completely decompled from user module

// user helper is responsible to 
//      - check cache in user
//      - use location module, deviceTravelStatus module to get datas
//      - save cache in user

// So that location module, deviceTravelStatus module can be stand-alone without user

async function getUser(event){
    console.log(LOG_TAG.DEBUG_REQUEST, event.pathParameters.userId, event.headers)

    let requestParams

    // Validate request
    try {
        requestParams = await getUserValidateSchema.validateAsync({
            pathParameters: {
                userId: event.pathParameters.userId
            },
            headers: {
                accessToken: event.headers['nesn-access-token'],
                idToken: event.headers['nesn-user-token'],
                tveToken: event.headers['nesn-tve-token'],
                platform: event.headers['nesn-platform'],
            }
        })
    } catch(validateError){
        console.log("Request validation failed", validateError)
        return lambdaReponse(Boom.badRequest(validateError.message))
    }

    // Check auth
    if(requestParams.pathParameters.userId !== requestParams.headers?.accessToken?.username){
        return lambdaReponse(Boom.unauthorized(INVALID_TOKEN_MESSAGE))
    }


    // Fetch user from db
    let user = await findUserByUserID(requestParams.pathParameters.userId)


    // create user if not exist
    if(!user){
        user = await createNewUser(requestParams.headers.accessToken, requestParams.headers.idToken, event.headers['nesn-access-token'])
    }


    // ROKU stay untouched, will be moved to its own module/endpoint in future
    const rokuCustomerID = event.headers["nesn-roku-customer-id"]
    if(rokuCustomerID){
        try {
            user = await linkRokuAccToNESNAcc(rokuCustomerID, user)
        } catch (rokuError){
            console.error(LOG_TAG.ROKU_PAY, user.data.username, rokuCustomerID, rokuError.errorCode)
            let boomResponse = Boom.badRequest(process.env.ENABLE_DEBUG_MODE ? rokuError.message : "Failed to conncet roku account.")
            boomResponse.output.payload.errorCode = rokuError.errorCode
            return lambdaReponse(boomResponse)
        }
    }

    // Get user enetilement detail
    let entitlement = await getEntitlmentDetail({
        whitelistedEmail: user.email,
        DTCSubscription: user.getSubscription(),
        mvpd: requestParams.headers.tveToken
    })



    let location
    let deviceTravelStatus
    let concurrentStatus

    if(entitlement?.isValid()){
        // Get current location
        location = await getUserLocation(user, ip, zip, option)

        // Update device travel status base on current location
        deviceTravelStatus = await updateUserDeviceTravelStatus({
            user,
            deviceID,
            location,
            ...options,
        })

        // Check concurrent control
        concurrentStatus = await isConcurrentLimitReached(deviceID, options)
    }


    // Build response
    let response = buildGetUserResponse({
        user,
        entitlement,
        location,
        deviceTravelStatus,
        concurrentStatus,
        event,
    })

    
    // Log
    console.log(LOG_TAG.DEBUG_RESPONSE, event.pathParameters.userId, response)
    logEntitlementDetails({
        user,
        entitlement,
        location,
        deviceTravelStatus,
        concurrentStatus,
        event,
    })


    // Send response
    return lambdaReponse(response)
};






