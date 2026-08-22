// Backfills the new Plan Tier / Risk / commercial dates on existing Provisioned_Account__c demo
// records, and chargeback/refund/net-revenue on existing Usage_Snapshot__c demo records.
// Run with: sf apex run --file scripts/apex/backfill-enrichment-fields.apex --target-org iop-dev

List<Provisioned_Account__c> accounts = [SELECT Id FROM Provisioned_Account__c ORDER BY CreatedDate];
List<String> tiers = new List<String>{ 'Starter', 'Growth', 'Scale', 'Enterprise' };
List<String> risks = new List<String>{ 'Low', 'Low', 'Medium', 'High' };

Integer i = 0;
for (Provisioned_Account__c pa : accounts) {
    pa.Plan_Tier__c = tiers[Math.mod(i, tiers.size())];
    pa.Risk_Level__c = risks[Math.mod(i, risks.size())];
    pa.Go_Live_Date__c = Date.newInstance(2026, 6, 1).addDays(i * 5);
    pa.Renewal_Date__c = Date.newInstance(2027, 6, 1).addDays(i * 5);
    pa.Contract_Value_INR__c = (250000.0 * (i + 1)).setScale(2);
    i++;
}
update accounts;
System.debug('Backfilled ' + accounts.size() + ' Provisioned_Account__c records.');

List<Usage_Snapshot__c> snapshots = [
    SELECT Id, Volume_INR__c, Revenue_INR__c
    FROM Usage_Snapshot__c
    ORDER BY CreatedDate
];
Integer j = 0;
for (Usage_Snapshot__c s : snapshots) {
    s.Chargeback_Count__c = Math.mod(j, 4);
    s.Refund_Rate__c = 0.3 + Math.mod(j, 5) * 0.15;
    s.Net_Revenue_INR__c = s.Revenue_INR__c == null
        ? null
        : (s.Revenue_INR__c * 0.85).setScale(2);
    j++;
}
update snapshots;
System.debug('Backfilled ' + snapshots.size() + ' Usage_Snapshot__c records.');
