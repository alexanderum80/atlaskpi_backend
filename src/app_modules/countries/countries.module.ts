import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CountriesQuery } from './queries/countries.query';
import { StatesForCountryQuery } from './queries/states-for-country.query';

@AppModule({
    queries: [
        CountriesQuery,
        StatesForCountryQuery
    ]
})
export class CountriesModule extends ModuleBase { }
