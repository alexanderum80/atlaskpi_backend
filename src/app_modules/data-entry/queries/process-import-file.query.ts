import { ProcessImportFileActivity } from './../activities/process-import-file.activity';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { DataSourcesService } from '../../../services/data-sources.service';

@injectable()
@query({
    name: 'processImportFile',
    activity: ProcessImportFileActivity,
    parameters: [
        { name: 'fileData', type: String },
        { name: 'fileType', type: String }
    ],
    output: { type: String }
})
export class ProcessImportFIleQuery implements IQuery<string> {
    constructor(@inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService) { }

    async run(data: { fileData: string, fileType: string}): Promise<string> {
        const fileData = JSON.parse(data.fileData);
        switch (data.fileType) {
            case 'csv':
                return this._dataSourcesSvc.processCsvFile(fileData);
            case 'excel':
                const result = this._dataSourcesSvc.processExcelFile(fileData);
                return result;
        }
    }
}