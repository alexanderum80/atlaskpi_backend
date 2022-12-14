import { IBatchProperties } from './../../../services/kpis/google-analytics-kpi/google-analytics.helper';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IGoogleAnalytics {
    // id fields
    connector: {
        connectorId: string;
        connectorName: string;
        viewId: string;
    };

    websiteUrl: string;

    // Type String fields
    date: Date;

    userType?: string;
    sessionCount?: string;
    daysSinceLastSession?: string;
    userDefinedValue?: string;
    userBucket?: string;
    sessionDurationBucket?: string;
    referralPath?: string;
    fullReferrer?: string;
    campaign?: string;
    source?: string;
    medium?: string;
    sourceMedium?: string;
    keyword?: string;
    adContent?: string;
    socialNetwork?: string;
    hasSocialSourceReferral?: string;
    campaignCode?: string;
    adGroup?: string;
    adSlot?: string;
    adDistributionNetwork?: string;
    adMatchType?: string;
    adKeywordMatchType?: string;
    adMatchedQuery?: string;
    adPlacementDomain?: string;
    adPlacementUrl?: string;
    adFormat?: string;
    adTargetingType?: string;
    adTargetingOption?: string;
    adDisplayUrl?: string;
    adDestinationUrl?: string;
    adwordsCustomerID?: string;
    adwordsCampaignID?: string;
    adwordsAdGroupID?: string;
    adwordsCreativeID?: string;
    adwordsCriteriaID?: string;
    adQueryWordCount?: string;
    isTrueViewVideoAd?: string;
    goalCompletionLocation?: string;
    goalPreviousStep1?: string;
    goalPreviousStep2?: string;
    goalPreviousStep3?: string;
    browser?: string;
    browserVersion?: string;
    operatingSystem?: string;
    operatingSystemVersion?: string;
    mobileDeviceBranding?: string;
    mobileDeviceModel?: string;
    mobileInputSelector?: string;
    mobileDeviceInfo?: string;
    mobileDeviceMarketingName?: string;
    deviceCategory?: string;
    browserSize?: string;
    dataSource?: string;
    continent?: string;
    subContinent?: string;
    country?: string;
    region?: string;
    metro?: string;
    city?: string;
    latitude?: string;
    longitude?: string;
    networkDomain?: string;
    networkLocation?: string;
    cityId?: string;
    continentId?: string;
    countryIsoCode?: string;
    metroId?: string;
    regionId?: string;
    regionIsoCode?: string;
    subContinentCode?: string;
    flashVersion?: string;
    javaEnabled?: string;
    language?: string;
    screenColors?: string;
    sourcePropertyDisplayName?: string;
    sourcePropertyTrackingId?: string;
    screenResolution?: string;
    hostname?: string;
    pagePath?: string;
    pagePathLevel1?: string;
    pagePathLevel2?: string;
    pagePathLevel3?: string;
    pagePathLevel4?: string;
    pageTitle?: string;
    landingPagePath?: string;
    secondPagePath?: string;
    exitPagePath?: string;
    previousPagePath?: string;
    pageDepth?: string;
    landingContentGroupXX?: string;
    previousContentGroupXX?: string;
    contentGroupXX?: string;
    searchUsed?: string;
    searchKeyword?: string;
    searchKeywordRefinement?: string;
    searchCategory?: string;
    searchStartPage?: string;
    searchDestinationPage?: string;
    searchAfterDestinationPage?: string;
    appInstallerId?: string;
    appVersion?: string;
    appName?: string;
    appId?: string;
    screenName?: string;
    screenDepth?: string;
    landingScreenName?: string;
    exitScreenName?: string;
    eventCategory?: string;
    eventAction?: string;
    eventLabel?: string;
    transactionId?: string;
    affiliation?: string;
    sessionsToTransaction?: string;
    daysToTransaction?: string;
    productSku?: string;
    productName?: string;
    productCategory?: string;
    currencyCode?: string;
    checkoutOptions?: string;
    internalPromotionCreative?: string;
    internalPromotionId?: string;
    internalPromotionName?: string;
    internalPromotionPosition?: string;
    orderCouponCode?: string;
    productBrand?: string;
    productCategoryHierarchy?: string;
    productCategoryLevelXX?: string;
    productCouponCode?: string;
    productListName?: string;
    productListPosition?: string;
    productVariant?: string;
    shoppingStage?: string;
    socialInteractionNetwork?: string;
    socialInteractionAction?: string;
    socialInteractionNetworkAction?: string;
    socialInteractionTarget?: string;
    socialEngagementType?: string;
    userTimingCategory?: string;
    userTimingLabel?: string;
    userTimingVariable?: string;

    // numeric fields
    users?: number;
    newUsers?: number;
    percent?: number;
    '1day'?: number;
    '7day'?: number;
    '14day'?: number;
    '28day'?: number;
    '30day'?: number;
    sessionsPerUser?: number;
    sessions?: number;
    bounces?: number;
    bounceRate?: number;
    sessionDuration?: number;
    avgSessionDuration?: number;
    uniqueDimensionCombinations?: number;
    hits?: number;
    organicSearches?: number;
    impressions?: number;
    adClicks?: number;
    adCost?: number;
    CPM?: number;
    CPC?: number;
    CTR?: number;
    costPerTransaction?: number;
    costPerGoalConversion?: number;
    costPerConversion?: number;
    RPC?: number;
    ROAS?: number;
    goalXXStarts?: number;
    goalStartsAll?: number;
    goalXXCompletions?: number;
    goalCompletionsAll?: number;
    goalXXValue?: number;
    goalValueAll?: number;
    goalValuePerSession?: number;
    goalXXConversionRate?: number;
    goalConversionRateAll?: number;
    goalXXAbandons?: number;
    goalAbandonsAll?: number;
    goalXXAbandonRate?: number;
    goalAbandonRateAll?: number;
    pageValue?: number;
    entrances?: number;
    entranceRate?: number;
    pageviews?: number;
    pageviewsPerSession?: number;
    uniquePageviews?: number;
    timeOnPage?: number;
    avgTimeOnPage?: number;
    exits?: number;
    exitRate?: number;
    contentGroupUniqueViewsXX?: number;
    searchResultViewsResults?: number;
    searchUniquesTotal?: number;
    avgSearchResultViewsResults?: number;
    searchSessionsSessions?: number;
    percentSessionsWithSearch?: number;
    searchDepthSearch?: number;
    avgSearchDepthAvg?: number;
    searchRefinementsSearch?: number;
    percentSearchRefinements?: number;
    searchDurationTime?: number;
    avgSearchDurationTime?: number;
    searchExitsSearch?: number;
    searchExitRate?: number;
    searchGoalXXConversionRateSite?: number;
    searchGoalConversionRateAllSite?: number;
    goalValueAllPerSearchPer?: number;
    pageLoadTimePage?: number;
    pageLoadSamplePage?: number;
    avgPageLoadTimeAvg?: number;
    domainLookupTimeDomain?: number;
    avgDomainLookupTimeAvg?: number;
    pageDownloadTimePage?: number;
    avgPageDownloadTimeAvg?: number;
    redirectionTimeRedirection?: number;
    avgRedirectionTimeAvg?: number;
    serverConnectionTimeServer?: number;
    avgServerConnectionTimeAvg?: number;
    serverResponseTimeServer?: number;
    avgServerResponseTimeAvg?: number;
    speedMetricsSampleSpeed?: number;
    domInteractiveTimeDocument?: number;
    avgDomInteractiveTimeAvg?: number;
    domContentLoadedTimeDocument?: number;
    avgDomContentLoadedTimeAvg?: number;
    domLatencyMetricsSampleDOM?: number;
    screenviews?: number;
    uniqueScreenviews?: number;
    screenviewsPerSession?: number;
    timeOnScreen?: number;
    avgScreenviewDuration?: number;
    totalEvents?: number;
    uniqueEvents?: number;
    eventValue?: number;
    avgEventValue?: number;
    sessionsWithEvent?: number;
    eventsPerSessionWithEvent?: number;
    transactions?: number;
    transactionsPerSession?: number;
    transactionRevenue?: number;
    revenuePerTransaction?: number;
    transactionRevenuePerSession?: number;
    transactionShipping?: number;
    transactionTax?: number;
    totalValue?: number;
    itemQuantity?: number;
    uniquePurchases?: number;
    revenuePerItem?: number;
    itemRevenue?: number;
    itemsPerPurchase?: number;
    localTransactionRevenue?: number;
    localTransactionShipping?: number;
    localTransactionTax?: number;
    localItemRevenue?: number;
    buyToDetailRate?: number;
    cartToDetailRate?: number;
    internalPromotionCTR?: number;
    internalPromotionClicks?: number;
    internalPromotionViews?: number;
    localProductRefundAmount?: number;
    localRefundAmount?: number;
    productAddsToCart?: number;
    productCheckouts?: number;
    productDetailViews?: number;
    productListCTR?: number;
    productListClicks?: number;
    productListViews?: number;
    productRefundAmount?: number;
    productRefunds?: number;
    productRemovesFromCart?: number;
    productRevenuePerPurchase?: number;
    quantityAddedToCart?: number;
    quantityCheckedOut?: number;
    quantityRefunded?: number;
    quantityRemovedFromCart?: number;
    refundAmount?: number;
    revenuePerUser?: number;
    totalRefunds?: number;
    transactionsPerUser?: number;
    socialInteractions?: number;
    uniqueSocialInteractions?: number;
    socialInteractionsPerSession?: number;
    userTimingValue?: number;
    userTimingSample?: number;
    avgUserTimingValue?: number;

    // we use this to identify the request
    _batchId: string;
    _batchTimestamp: Date;
}


export interface IGoogleAnalyticsDocument extends IGoogleAnalytics, mongoose.Document {
}

export interface IGoogleAnalyticsModel extends mongoose.Model<IGoogleAnalyticsDocument> {
    batchUpsert(data: any[], batchProps: IBatchProperties): Promise<IBatchProperties>;
}