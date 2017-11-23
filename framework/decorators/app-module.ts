import { IModule } from '../module-definition';

export function AppModule(options: IModule) {
    return function (target: Object) {
        console.log('AppModule Decorator: called');
    };
}