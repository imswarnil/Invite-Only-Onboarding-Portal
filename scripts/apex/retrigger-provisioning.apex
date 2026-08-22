// Re-fires Provision_On_Approval for the already-approved demo Invite_Request__c records so
// their Provisioned_Account__c records come from the real automation, not a hand-seeded insert.
// The flow only acts when Decision__c changes TO "Approved", so toggle it off and back on.
// Run with: sf apex run --file scripts/apex/retrigger-provisioning.apex --target-org iop-dev

List<Invite_Request__c> approved = [
    SELECT Id, Decision__c
    FROM Invite_Request__c
    WHERE Decision__c = 'Approved'
];

for (Invite_Request__c r : approved) {
    r.Decision__c = 'Pending';
}
update approved;

for (Invite_Request__c r : approved) {
    r.Decision__c = 'Approved';
}
update approved;

System.debug('Re-triggered Provision_On_Approval for ' + approved.size() + ' records.');
