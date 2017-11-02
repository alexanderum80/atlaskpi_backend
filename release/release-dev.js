const { execSync } = require('child_process');

exports.release = function(version) {
    console.log('Releasing version ' + version + ' to development');

    // nothing to implement for now because this release it just pushing changes to development
    // that not always get to this computer because we could also release through bitbucket cirectly using pull requests
}