// Base class for creating oauth connectors
import { ConnectorTypeEnum } from './connector-type.enum';

export interface IOAuthConnector {
    // Get
    getType(): ConnectorTypeEnum;
    getTypeString(): string;
    getAuthConfiguration(): string;
}
