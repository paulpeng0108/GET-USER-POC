const { ConfigId } = require("../common/const/mongo")
const { findUserInList } = require("../common/findUserInList")
const { MVPDSubscription, FreeSubscription } = require("../subscription/Subscription")

async function getEntitlmentDetail(entitlements){
    if(entitlements.tve){
        return new MVPDSubscription()
    }

    const isWhitelisted = await findUserInList(ConfigId.FREESUBSCRIPTION, entitlements.whitelistedEmail)

    if(isWhitelisted){
        return new FreeSubscription()
    }

    return entitlements.DTCSubscription
}

module.exports.getEntitlmentDetail = getEntitlmentDetail