import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CountriesQuery } from './queries/countries.query';
import { StatesForCountryQuery } from './queries/states-for-country.query';
import { StatesAllQuery } from './queries/states-all.query';

@AppModule({
    queries: [
        CountriesQuery,
        StatesForCountryQuery,
        StatesAllQuery
    ]
})
export class CountriesModule extends ModuleBase { }
