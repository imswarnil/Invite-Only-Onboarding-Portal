// Seeds monthly Usage_Snapshot__c demo data for whatever Provisioned_Account__c records
// currently exist (created for real by Provision_On_Approval, not hand-inserted).
// Run with: sf apex run --file scripts/apex/seed-usage-snapshots.apex --target-org iop-dev

List<Provisioned_Account__c> accounts = [SELECT Id FROM Provisioned_Account__c];
List<String> months = new List<String>{ '2026-06-01', '2026-07-01', '2026-08-01' };

List<Usage_Snapshot__c> snapshots = new List<Usage_Snapshot__c>();
Integer base = 0;
for (Provisioned_Account__c pa : accounts) {
    base++;
    for (Integer m = 0; m < months.size(); m++) {
        Decimal growth = 1 + (m * 0.35);
        snapshots.add(new Usage_Snapshot__c(
            Provisioned_Account__c = pa.Id,
            Month__c = Date.valueOf(months[m]),
            Volume_INR__c = (500000 * base * growth).setScale(2),
            Txn_Count__c = Integer.valueOf(120 * base * growth),
            Dispute_Rate__c = 0.4 + (base * 0.1),
            Revenue_INR__c = (500000 * base * growth * 0.02).setScale(2)
        ));
    }
}
insert snapshots;
System.debug('Inserted ' + snapshots.size() + ' Usage_Snapshot__c records across ' + accounts.size() + ' provisioned accounts.');
