import * as _ from 'lodash';
import { each } from 'lodash';

import { IChart } from '../../../domain/app/charts/chart';

export const GroupingMap = {
    sales: {
        location: 'location.name',
        employee: 'employee.fullName',
        provider: 'employee.fullName',
        category: 'category.name',
        product: 'product.itemDescription',
        serviceType: 'serviceType',
        businessUnit: 'businessUnit.name',
        customerState: 'customer.state',
        customerCity: 'customer.city',
        customerZip: 'customer.zip',
        customerGender: 'customer.gender'
    },
    expenses: {
        businessUnit: 'businessUnit.name',
        concept: 'expense.concept',
        location: 'location.name'
    },
    inventory: {
        location: 'location.name',
        product: 'product.itemDescription',
    },
    // Groupings for google analytrics
    googleanalytics: {
        connector: 'connector.connectorName',
        website: 'websiteUrl',
        browser: 'browser',
        city: 'city',
        country: 'country',
        deviceCategory: 'deviceCategory',
        language: 'language',
        operatingSystem: 'operatingSystem'
    },
    calls: {
        answered: 'answered',
        deviceType: 'device_type',
        direction: 'direction',
        duration: 'duration',
        voicemail: 'voicemail',
        firstCall: 'first_call',
        priorCall: 'prior_calls',
        keywords: 'keywords',
        medium: 'medium',
        sourceName: 'source_name',
        referringUrl: 'referring_url',
        landingPageUrl: 'landing_page_url',
        lastRequestedUrl: 'last_requested_url',
        leadStatus: 'lead_status',
        totalCalls: 'total_calls',
        trackingSource: 'formatted_tracking_source',
        recordDuration: 'recording.duration',
        referrerDomain: 'referrer_domain',
        trackingPhone: 'tracking.phoneNumber',
        companyName: 'company.name',
        customerState: 'customer.state',
        customerCity: 'customer.city',
        customerZip: 'customer.zip',
        customerCountry: 'customer.country',
        businessPhone: 'business.phoneNumber',
        tags: 'tags',
        speakerPercentAgent: 'speaker_percent.agent',
        speakerPercentCustomer: 'speaker_percent.customer'
    }
};

export function getGroupingMetadata(chartDocument: IChart, groupings: string[]) {
    if ((!chartDocument || !chartDocument.groupings) && !groupings) {
        return null;
    }

    if (!chartDocument) chartDocument = <any>{};

    let result: string[] = [];
    let groups: string[] = [];

    groups = groups.concat(chartDocument.groupings, groupings);

    let uniqGrouping = [];
    each(GroupingMap, collection => {
        Object.keys(collection).forEach(key => {
            uniqGrouping[key] = collection[key];
        });
    });

    groups.forEach(g => {
            let group = uniqGrouping[g];

            if (group && result.indexOf(g) === -1) {
                result.push(uniqGrouping[g]);
            }
        });

    return result;
}

