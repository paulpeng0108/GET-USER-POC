async function updateDeviceTravelStatus(option){
    

    // If travel status not changed
    if(option.previousTravelStatus?.isInMarket === option.isInMarket){
        return option.previousTravelStatus
    }


    // If travel status changed
    let currentTravelStatus

    // Build travel status obj
    // ...


    // Update devcie travel status
    await updateUser(user._id,  {[`deviceTravelStatus.${deviceID}`]: currentTravelStatus})

    return currentTravelStatus
}

module.exports.updateDeviceTravelStatus = updateDeviceTravelStatus