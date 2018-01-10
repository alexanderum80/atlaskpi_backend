import { IBridgeContainer } from '../framework/di/bridge-container';
import { ChartIntentProcessor } from './search/queries/intent-processors/chart-intent.processor';

export function addModulesRegistrations(container: IBridgeContainer) {
    container.registerSingleton(ChartIntentProcessor);
}