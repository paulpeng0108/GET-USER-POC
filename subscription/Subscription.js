const { SUBSCRIPTION_STATUS, STRIPE_SUBSCRIPTION_STATUS, stripeSubscriptionIntervalConverter } = require("./utilities")
const { getRokuSubscriptionStatus } = require("../webhooks/roku/utilities")
const { ROKU_SUBSCRIPTION_INTERVAL_MAP } = require("../webhooks/roku/blueconic")
const { SUBSCRIPTION_TYPE } = require("./constants")

class Subscription {
    constructor(data = {}){
        this.data = data
    }

    static getSubscriptionType(){}

    getName(){}

    getPrice(){}

    getPriceString(){}

    getExpiry(){}

    getInterval(){}

    getStatus(){}

    cancelAtPeriodEnd(){}

    isValid(){
        let status = this.getStatus()

        return status === SUBSCRIPTION_STATUS.ACTIVE || status == SUBSCRIPTION_STATUS.DUNNING
    }
}



class StripeSubscription extends Subscription {
    static getSubscriptionType(){
        return SUBSCRIPTION_TYPE.STRIPE
    }

    getName(){
        return process.env.STRIPE_PLAN_NAME + ' - ' + this.getInterval()
    }

    getPrice(){
        return this.data.plan.amount/100
    }
    
    getPriceString(){
        return `$${this.getPrice()}/${this.data.plan.interval}`
    }

    getInterval(){
        return stripeSubscriptionIntervalConverter(this.data.plan.interval)
    }

    getExpiry(){
        return this.data.current_period_end
    }

    getStatus(){
        switch(this.data.status){
            case STRIPE_SUBSCRIPTION_STATUS.ACTIVE:
                return SUBSCRIPTION_STATUS.ACTIVE
            case STRIPE_SUBSCRIPTION_STATUS.PAST_DUE:
                return SUBSCRIPTION_STATUS.DUNNING
            case STRIPE_SUBSCRIPTION_STATUS.CANCELED:
                return SUBSCRIPTION_STATUS.CANCELED
            default:
                return SUBSCRIPTION_STATUS.OTHER
        }
    }

    cancelAtPeriodEnd(){
        return this.data.cancel_at_period_end
    }
}

class RokuSubscription extends Subscription {
    static getSubscriptionType(){
        return SUBSCRIPTION_TYPE.ROKU
    }

    getName(){
        return this.data.productName
    }

    getPrice(){
        return this.data.amount
    }

    getPriceString(){
        let subscriptionLength = ''

        switch(this.getInterval()){
            case "Monthly":
                subscriptionLength = "month"
        }

        return `$${this.getPrice()}/${subscriptionLength}`
    }

    getExpiry(){
        return this.data.expirationDate
    }

    getInterval(){
        return ROKU_SUBSCRIPTION_INTERVAL_MAP[this.data.productId]
    }

    getStatus(){
        return getRokuSubscriptionStatus(this.data)
    }

    cancelAtPeriodEnd(){
        return this.data.cancelled
    }
}

class FreeSubscription extends Subscription {
    static getSubscriptionType(){
        return SUBSCRIPTION_TYPE.WHITELIST
    }

    getStatus(){
        return SUBSCRIPTION_STATUS.ACTIVE
    }
}

class MVPDSubscription extends Subscription {
    static getSubscriptionType(){
        return SUBSCRIPTION_TYPE.TVE
    }

    getStatus(){
        return SUBSCRIPTION_STATUS.ACTIVE
    }
}

module.exports.Subscription = Subscription
module.exports.StripeSubscription = StripeSubscription
module.exports.RokuSubscription = RokuSubscription
module.exports.FreeSubscription = FreeSubscription
module.exports.MVPDSubscription = MVPDSubscription