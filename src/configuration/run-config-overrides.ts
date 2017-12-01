import { configMongoose } from './config-mongoose';
import { configValidator } from './config-validator';
import { configLogger } from './config-logger';

export function runConfigOverrides() {
    configLogger();
    configValidator();
    configMongoose();
}