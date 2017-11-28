export const revokTokenInfo = {
    'quickbooks-online': {
        enpoint: 'https://developer.api.intuit.com/v2/oauth2/tokens/revoke',
        headers: {
            'Authorization': 'Basic ',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    },
    'square': {
        endpoint: 'https://connect.squareup.com/oauth2/revoke',
        headers: {
            'Authorization': 'Client sq0csp-8hJv6t0Xrbh2gkGqiziduQGgd47gBN5JnziuL4ZgA9k',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        'client_id': 'sq0idp-_Ojf7lOc-mlVXV67a5MlPA'
    }
};
