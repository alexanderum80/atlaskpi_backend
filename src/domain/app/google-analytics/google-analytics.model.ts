import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import { IBatchProperties } from './../../../services/kpis/google-analytics-kpi/google-analytics.helper';
import { ModelBase } from './../../../type-mongo/model-base';
import { AppConnection } from './../app.connection';
import { IGoogleAnalytics, IGoogleAnalyticsModel } from './google-analytics';

// define mongo schema
export const GoogleAnalyticsSchema = new mongoose.Schema({
    connector: {
        connectorId: String!,
        connectorName: String!,
        viewId: String!
    },

    websiteUrl: String,

    // Type String fields
    date: Date,

    userType: String,
    sessionCount: String,
    daysSinceLastSession: String,
    userDefinedValue: String,
    userBucket: String,
    sessionDurationBucket: String,
    referralPath: String,
    fullReferrer: String,
    campaign: String,
    source: String,
    medium: String,
    sourceMedium: String,
    keyword: String,
    adContent: String,
    socialNetwork: String,
    hasSocialSourceReferral: String,
    campaignCode: String,
    adGroup: String,
    adSlot: String,
    adDistributionNetwork: String,
    adMatchType: String,
    adKeywordMatchType: String,
    adMatchedQuery: String,
    adPlacementDomain: String,
    adPlacementUrl: String,
    adFormat: String,
    adTargetingType: String,
    adTargetingOption: String,
    adDisplayUrl: String,
    adDestinationUrl: String,
    adwordsCustomerID: String,
    adwordsCampaignID: String,
    adwordsAdGroupID: String,
    adwordsCreativeID: String,
    adwordsCriteriaID: String,
    adQueryWordCount: String,
    isTrueViewVideoAd: String,
    goalCompletionLocation: String,
    goalPreviousStep1: String,
    goalPreviousStep2: String,
    goalPreviousStep3: String,
    browser: String,
    browserVersion: String,
    operatingSystem: String,
    operatingSystemVersion: String,
    mobileDeviceBranding: String,
    mobileDeviceModel: String,
    mobileInputSelector: String,
    mobileDeviceInfo: String,
    mobileDeviceMarketingName: String,
    deviceCategory: String,
    browserSize: String,
    dataSource: String,
    continent: String,
    subContinent: String,
    country: String,
    region: String,
    metro: String,
    city: String,
    latitude: String,
    longitude: String,
    networkDomain: String,
    networkLocation: String,
    cityId: String,
    continentId: String,
    countryIsoCode: String,
    metroId: String,
    regionId: String,
    regionIsoCode: String,
    subContinentCode: String,
    flashVersion: String,
    javaEnabled: String,
    language: String,
    screenColors: String,
    sourcePropertyDisplayName: String,
    sourcePropertyTrackingId: String,
    screenResolution: String,
    hostname: String,
    pagePath: String,
    pagePathLevel1: String,
    pagePathLevel2: String,
    pagePathLevel3: String,
    pagePathLevel4: String,
    pageTitle: String,
    landingPagePath: String,
    secondPagePath: String,
    exitPagePath: String,
    previousPagePath: String,
    pageDepth: String,
    landingContentGroupXX: String,
    previousContentGroupXX: String,
    contentGroupXX: String,
    searchUsed: String,
    searchKeyword: String,
    searchKeywordRefinement: String,
    searchCategory: String,
    searchStartPage: String,
    searchDestinationPage: String,
    searchAfterDestinationPage: String,
    appInstallerId: String,
    appVersion: String,
    appName: String,
    appId: String,
    screenName: String,
    screenDepth: String,
    landingScreenName: String,
    exitScreenName: String,
    eventCategory: String,
    eventAction: String,
    eventLabel: String,
    transactionId: String,
    affiliation: String,
    sessionsToTransaction: String,
    daysToTransaction: String,
    productSku: String,
    productName: String,
    productCategory: String,
    currencyCode: String,
    checkoutOptions: String,
    internalPromotionCreative: String,
    internalPromotionId: String,
    internalPromotionName: String,
    internalPromotionPosition: String,
    orderCouponCode: String,
    productBrand: String,
    productCategoryHierarchy: String,
    productCategoryLevelXX: String,
    productCouponCode: String,
    productListName: String,
    productListPosition: String,
    productVariant: String,
    shoppingStage: String,
    socialInteractionNetwork: String,
    socialInteractionAction: String,
    socialInteractionNetworkAction: String,
    socialInteractionTarget: String,
    socialEngagementType: String,
    userTimingCategory: String,
    userTimingLabel: String,
    userTimingVariable: String,

    // numeric fields
    users: Number,
    newUsers: Number,
    percent: Number,
    '1day': Number,
    '7day': Number,
    '14day': Number,
    '28day': Number,
    '30day': Number,
    sessionsPerUser: Number,
    sessions: Number,
    bounces: Number,
    bounceRate: Number,
    sessionDuration: Number,
    avgSessionDuration: Number,
    uniqueDimensionCombinations: Number,
    hits: Number,
    organicSearches: Number,
    impressions: Number,
    adClicks: Number,
    adCost: Number,
    CPM: Number,
    CPC: Number,
    CTR: Number,
    costPerTransaction: Number,
    costPerGoalConversion: Number,
    costPerConversion: Number,
    RPC: Number,
    ROAS: Number,
    goalXXStarts: Number,
    goalStartsAll: Number,
    goalXXCompletions: Number,
    goalCompletionsAll: Number,
    goalXXValue: Number,
    goalValueAll: Number,
    goalValuePerSession: Number,
    goalXXConversionRate: Number,
    goalConversionRateAll: Number,
    goalXXAbandons: Number,
    goalAbandonsAll: Number,
    goalXXAbandonRate: Number,
    goalAbandonRateAll: Number,
    pageValue: Number,
    entrances: Number,
    entranceRate: Number,
    pageviews: Number,
    pageviewsPerSession: Number,
    uniquePageviews: Number,
    timeOnPage: Number,
    avgTimeOnPage: Number,
    exits: Number,
    exitRate: Number,
    contentGroupUniqueViewsXX: Number,
    searchResultViewsResults: Number,
    searchUniquesTotal: Number,
    avgSearchResultViewsResults: Number,
    searchSessionsSessions: Number,
    percentSessionsWithSearch: Number,
    searchDepthSearch: Number,
    avgSearchDepthAvg: Number,
    searchRefinementsSearch: Number,
    percentSearchRefinements: Number,
    searchDurationTime: Number,
    avgSearchDurationTime: Number,
    searchExitsSearch: Number,
    searchExitRate: Number,
    searchGoalXXConversionRateSite: Number,
    searchGoalConversionRateAllSite: Number,
    goalValueAllPerSearchPer: Number,
    pageLoadTimePage: Number,
    pageLoadSamplePage: Number,
    avgPageLoadTimeAvg: Number,
    domainLookupTimeDomain: Number,
    avgDomainLookupTimeAvg: Number,
    pageDownloadTimePage: Number,
    avgPageDownloadTimeAvg: Number,
    redirectionTimeRedirection: Number,
    avgRedirectionTimeAvg: Number,
    serverConnectionTimeServer: Number,
    avgServerConnectionTimeAvg: Number,
    serverResponseTimeServer: Number,
    avgServerResponseTimeAvg: Number,
    speedMetricsSampleSpeed: Number,
    domInteractiveTimeDocument: Number,
    avgDomInteractiveTimeAvg: Number,
    domContentLoadedTimeDocument: Number,
    avgDomContentLoadedTimeAvg: Number,
    domLatencyMetricsSampleDOM: Number,
    screenviews: Number,
    uniqueScreenviews: Number,
    screenviewsPerSession: Number,
    timeOnScreen: Number,
    avgScreenviewDuration: Number,
    totalEvents: Number,
    uniqueEvents: Number,
    eventValue: Number,
    avgEventValue: Number,
    sessionsWithEvent: Number,
    eventsPerSessionWithEvent: Number,
    transactions: Number,
    transactionsPerSession: Number,
    transactionRevenue: Number,
    revenuePerTransaction: Number,
    transactionRevenuePerSession: Number,
    transactionShipping: Number,
    transactionTax: Number,
    totalValue: Number,
    itemQuantity: Number,
    uniquePurchases: Number,
    revenuePerItem: Number,
    itemRevenue: Number,
    itemsPerPurchase: Number,
    localTransactionRevenue: Number,
    localTransactionShipping: Number,
    localTransactionTax: Number,
    localItemRevenue: Number,
    buyToDetailRate: Number,
    cartToDetailRate: Number,
    internalPromotionCTR: Number,
    internalPromotionClicks: Number,
    internalPromotionViews: Number,
    localProductRefundAmount: Number,
    localRefundAmount: Number,
    productAddsToCart: Number,
    productCheckouts: Number,
    productDetailViews: Number,
    productListCTR: Number,
    productListClicks: Number,
    productListViews: Number,
    productRefundAmount: Number,
    productRefunds: Number,
    productRemovesFromCart: Number,
    productRevenuePerPurchase: Number,
    quantityAddedToCart: Number,
    quantityCheckedOut: Number,
    quantityRefunded: Number,
    quantityRemovedFromCart: Number,
    refundAmount: Number,
    revenuePerUser: Number,
    totalRefunds: Number,
    transactionsPerUser: Number,
    socialInteractions: Number,
    uniqueSocialInteractions: Number,
    socialInteractionsPerSession: Number,
    userTimingValue: Number,
    userTimingSample: Number,
    avgUserTimingValue: Number,

    // we use this to identify the request
    _batchId: String,
    _batchTimestamp: Date
});

GoogleAnalyticsSchema.statics.batchUpsert = function(data: IGoogleAnalytics[], startDate: string, batchProps: IBatchProperties): Promise<IBatchProperties> {
    if (!data || !data.length) {
        return Promise.resolve(batchProps);
    }

    const that = this;
    const hasDate = data[0] && data[0].date;

    // if no date was requested to analytics lest use the start date
    if (!hasDate) {
        data.forEach(d => d.date = moment(startDate).toDate());
    }

    return new Promise<IBatchProperties>((resolve, reject) => {
        // clean old batches....
        that.remove({ _batchTimestamp: { $lt: moment().subtract(10, 'minutes') }}, (err) => {
            if (err) {
                reject(err);
                return;
            }

            that.insertMany(data, { continueOnError: true }, function(err, docs: any[]) {
                if (err) {
                    console.log(err);
                }

                that.find({ _batchId: { $in:  batchProps._batchId }}, (err, foundDocs) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    let inserted = [];

                    if (!foundDocs || foundDocs.length === 0) {
                        inserted = [];
                    } else {
                        inserted = foundDocs.map(d => String(d.id));
                    }

                    resolve(batchProps);
                    return;
                });
            });
        });
    });
};

@injectable()
export class GoogleAnalytics extends ModelBase<IGoogleAnalyticsModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'GoogleAnalytics', GoogleAnalyticsSchema, 'googleAnalytics__temp');
    }
}
