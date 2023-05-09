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
    

    // Get location from ipLookUp service
    let locations = await getLocationByIp(ip, expiredServices)

    return locations
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