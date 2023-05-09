const { findUserInList } = require("../common/whitelist")
const { updateUser } = require("../user/db")

const defaultInMarketLocation = {
    //...
}

async function getLocation(){

    // check zip
    if(isZipInMarket()){
        return defaultInMarketLocation
    }



    // Check whitelist
    let isInTravelWhitelist = await findUserInList(email)
    if(isInTravelWhitelist){
        return defaultInMarketLocation
    }



    // Check cache
    let locations = locationCaches
    let expiredServices = []

    Object.entries(locations).forEach(([location, source]) => {
        if(isLocationExpired(location)){
            expiredServices.push(source)
        }
    })

    if(expiredServices.length <= 0){
        return locations
    }

    

    // Check ipLookUp service
    let updatedLocations = await getLocationByIp(ip, expiredServices)
    updateUser(user, {[`locationCaches.${ip}`]: mergedLocations})
    return mergedLocations
}


function isLocationExpired(isInMarket){

}


// Third party ip look up service
async function ipapiGetLocationByIp(ip){

}

// Third party ip look up service
async function ipstackGetLocationByIp(ip){

}



async function getLocationByIp(ip, services){

    ipapiGetLocationByIp()
    ipstackGetLocationByIp()

}

function isZipInMarket(zip){

}


module.exports.getLocation = getLocation