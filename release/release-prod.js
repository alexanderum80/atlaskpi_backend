const { execSync } = require('child_process');
var inquirer = require('inquirer');
const semver = require('semver');
const chalk = require('chalk');
var fs = require('fs');
const Handlebars = require('handlebars');
var jsonminify = require("jsonminify");

exports.release = function(version) {
    console.log('Releasing to production');

    const newVersions = parseVersion(version);

    // ask the user if he/she updated the package version and committed the changes
    // make sure we are in the master branch
    inquirer.prompt([
        {
            type: 'list',
            name: 'git',
            message: 'Did you commit all your changes to git?',
            choices: ['Yes', 'No (we will commit the changes for you)'],
            filter: function (val) {
              return val.toLowerCase();
            }
        },
        {
          type: 'list',
          name: 'releaseType',
          message: 'What type of release are you doing?',
          choices: [
            'Patch ( ' + newVersions.patch + ' ) ',
            'Minor ( ' + newVersions.minor + ' ) ',
            'Major ( ' + newVersions.mayor + ' ) '
          ]
        }        
      ]).then(function (answers) {
        // console.log(JSON.stringify(answers, null, '  '));
        const selectedVersion = parseSelectedVersion(answers.releaseType);
        applyGitChanges(answers.git, selectedVersion);
        updatePackageJson(selectedVersion);
        buildApp(selectedVersion);
        dockerizeApp(selectedVersion);
        uploadAppToEC2(selectedVersion);
        const task = createTaskRevision(selectedVersion);
        updateClusterService(task);
      });

    // create git tag with rthe package json version

    // compile
    // cd dist
    // update cluster service
    // #aws ecs update-service --cluster "$CLUSTER" --service "$SERVICE" --task-definition "$TASK_DEFINITION":"$REVISION"
}

function log(message) {
    console.log(chalk.cyan.bold(message));
}

function run(task) {
    return execSync(task, {stdio:[0,1,2]});
}

function parseVersion(version) {
    return {
        patch: semver.inc(version, 'patch'),
        minor: semver.inc(version, 'minor'),
        mayor: semver.inc(version, 'major')
    };
}

function updatePackageJson(version) {
    // cat package.json | json -e 'this.version = "0.5.5"' > package.json
    const packageJsonPath = __dirname + '/../package.json';
    // execSync('cat ' + packageJsonPath + ' | json -e \'this.version = \"' + version + '\"\' > ' + packageJsonPath);
}

function parseSelectedVersion(releaseType) {
    return releaseType.split('(')[1].split(')')[0].trim();
}

function applyGitChanges(gitAnswer, version) {
    log('applying git changes');

    if (gitAnswer.toLowerCase() !== 'yes') {
        run('git add .');
        run('git commit -m "release ' + version + '"');
        run('git push');
    }

    // tag version and push it
    // run('git tag -a v' + version  + ' -m "version release ' + version + '"');
    run('git push origin v' + version);
}

function buildApp(version) {
    log('building app version ' + version + '...');
    run('npm run build');
}

function dockerizeApp(version) {
    if (!version) {
        throw new Error('I cannot dockerize the release without a version number');
    }

    log('dockerizing app ...');
    run('docker build -t webapp-backend dist');
    run('docker tag webapp-backend:latest 288812438107.dkr.ecr.us-east-1.amazonaws.com/webapp-backend:' + version);

}

function uploadAppToEC2(version) {
    if (!version) {
        throw new Error('I cannot upload the release to EC2 without a version number');
    }

    log('uploading app to ec2 ...');
    const acrLogin = execSync('aws ecr get-login --no-include-email --region us-east-1');
    run(acrLogin);
    run('docker push 288812438107.dkr.ecr.us-east-1.amazonaws.com/webapp-backend:' + version);
}

function createTaskRevision(version) {
    log('Creating new task revision');

    const taskTmpl = fs.readFileSync(__dirname + '/api.task.json.tmpl').toString();
    const compiledTmpl = Handlebars.compile(taskTmpl);
    const task = compiledTmpl({ tag: version });

    const taskOutputBuffer = execSync('aws ecs register-task-definition --family api --container-definitions ' + JSON.stringify(jsonminify(task)));
    const taskObject = JSON.parse(taskOutputBuffer.toString());

    if (taskObject.taskDefinition.status !== 'ACTIVE') {
        throw new Error('There was an error while creating task on aws: \n' + taskOutputBuffer.toString())
    }

    return taskObject;
}

function updateClusterService(task) {
    if (!task) {
        throw new Error('Cannot update a cluster service without a task');
    }

    log('updating cluster service ...');
    const taskDefinition = task.taskDefinition.taskDefinitionArn;

    run('aws ecs update-service --cluster api-cluster --desired-count 1 --service backend --task-definition ' + taskDefinition);
}


updatePackageJson('0.5.5');
    