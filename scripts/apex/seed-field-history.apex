// Now that trackHistory is actually on for Stage__c/Sub_Status__c/Decision__c/Fit_Score__c/
// Legitimacy_Verdict__c, nudge a few demo records through a couple of real field changes so
// the inviteTimeline widget has more than one entry to show when reviewing the demo data.
// Run with: sf apex run --file scripts/apex/seed-field-history.apex --target-org iop-dev

List<Invite_Request__c> requests = [
    SELECT Id, Sub_Status__c, Legitimacy_Verdict__c, Fit_Score__c
    FROM Invite_Request__c
    WHERE Stage__c IN ('AI Validation', 'In Review', 'Action Needed')
];

for (Invite_Request__c r : requests) {
    r.Legitimacy_Verdict__c = 'Uncertain';
}
update requests;

for (Invite_Request__c r : requests) {
    r.Legitimacy_Verdict__c = 'Verified';
    if (r.Fit_Score__c != null) {
        r.Fit_Score__c = r.Fit_Score__c - 3;
    }
}
update requests;

System.debug('Nudged ' + requests.size() + ' records through two more tracked field changes.');
