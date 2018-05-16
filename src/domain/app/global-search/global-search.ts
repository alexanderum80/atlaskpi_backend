import { ISearchResult } from "../../../app_modules/search/queries/search.query";

export interface IGlobalSearch {
    name: string;
    data: ISearchResultItem[];
}

export interface ISearchResultItem {
    id: string;
    name: string;
    description: string;
}

export interface IGlobalSearchFieldMap {
    idField: string;
    nameField: string;
    descriptionField: string;
}

export interface ISearchableModel {
    globalSearch(query: string, searchPaths: string[], sectionName: string, nameField: string, descriptionField: string): Promise<IGlobalSearch>;
}