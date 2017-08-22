export function detachFromDashboards(dashboardModel, chart): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        // remove references
        dashboardModel.update({ charts: { $in: [chart._id] } },
                              { $pull : { charts: chart._id }},
                              { multi: true }).exec()
        .then(() => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}

export function attachToDashboards(dashboardModel, dashboards, chart): Promise<boolean> {
    const ids = dashboards.map(d => d._id);
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({_id: { $in: ids}},
                              { $push: { charts: chart._id }},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}