// Demo seed data: Indian applicants at various pipeline stages, including two that
// have "succeeded" (Decision__c = Approved triggers Provision_On_Approval automatically,
// which creates the Account -- not inserted here directly).
// Run with: sf apex run --file scripts/apex/seed-demo.apex --target-org iop-dev

Id companyRt = Schema.SObjectType.Invite_Request__c.getRecordTypeInfosByDeveloperName()
    .get('Company')
    .getRecordTypeId();
Id individualRt = Schema.SObjectType.Invite_Request__c.getRecordTypeInfosByDeveloperName()
    .get('Individual')
    .getRecordTypeId();

List<Invite_Request__c> seeds = new List<Invite_Request__c>{
    new Invite_Request__c(
        RecordTypeId = individualRt,
        Applicant_Type__c = 'Individual',
        First_Name__c = 'Priya',
        Last_Name__c = 'Sharma',
        Work_Email__c = 'priya.sharma@example.in',
        Phone__c = '+91 98765 43210',
        Country__c = 'India',
        State__c = 'Karnataka',
        City__c = 'Bengaluru',
        Sells__c = 'Services',
        Annual_Revenue_Band__c = '0-10L INR',
        Expected_Revenue_INR__c = 400000,
        Stage__c = 'Received',
        Sub_Status__c = 'New Submission'
    ),
    new Invite_Request__c(
        RecordTypeId = companyRt,
        Applicant_Type__c = 'Company',
        First_Name__c = 'Rohan',
        Last_Name__c = 'Mehta',
        Work_Email__c = 'rohan@mehtatraders.in',
        Company_Website__c = 'https://mehtatraders.in',
        Phone__c = '+91 98200 11223',
        Country__c = 'India',
        State__c = 'Maharashtra',
        City__c = 'Mumbai',
        Sells__c = 'Goods',
        Job_Level__c = 'Founder/Owner',
        Annual_Revenue_Band__c = '10L-50L INR',
        Expected_Revenue_INR__c = 2500000,
        Stage__c = 'AI Validation',
        Sub_Status__c = 'Awaiting Score',
        Fit_Score__c = 62
    ),
    new Invite_Request__c(
        RecordTypeId = individualRt,
        Applicant_Type__c = 'Individual',
        First_Name__c = 'Ananya',
        Last_Name__c = 'Iyer',
        Work_Email__c = 'ananya.iyer@example.in',
        Country__c = 'India',
        State__c = 'Tamil Nadu',
        City__c = 'Chennai',
        Sells__c = 'Services',
        Stage__c = 'Action Needed',
        Sub_Status__c = 'Docs Requested'
    ),
    new Invite_Request__c(
        RecordTypeId = companyRt,
        Applicant_Type__c = 'Company',
        First_Name__c = 'Vikram',
        Last_Name__c = 'Nair',
        Work_Email__c = 'vikram@nairenterprises.in',
        Company_Website__c = 'https://nairenterprises.in',
        Country__c = 'India',
        State__c = 'Kerala',
        City__c = 'Kochi',
        Sells__c = 'Both',
        Job_Level__c = 'C-Level',
        Annual_Revenue_Band__c = '50L-1Cr INR',
        Expected_Revenue_INR__c = 8000000,
        Stage__c = 'In Review',
        Sub_Status__c = 'Assigned to Reviewer',
        Fit_Score__c = 81,
        Legitimacy_Verdict__c = 'Verified'
    ),
    new Invite_Request__c(
        RecordTypeId = individualRt,
        Applicant_Type__c = 'Individual',
        First_Name__c = 'Meera',
        Last_Name__c = 'Reddy',
        Work_Email__c = 'meera.reddy@example.in',
        Country__c = 'India',
        State__c = 'Telangana',
        City__c = 'Hyderabad',
        Sells__c = 'Services',
        Stage__c = 'Waitlisted',
        Sub_Status__c = 'Low Score',
        Fit_Score__c = 32
    ),
    new Invite_Request__c(
        RecordTypeId = companyRt,
        Applicant_Type__c = 'Company',
        First_Name__c = 'Sanjay',
        Last_Name__c = 'Gupta',
        Work_Email__c = 'sanjay@guptaimports.in',
        Company_Website__c = 'https://guptaimports.in',
        Country__c = 'India',
        State__c = 'Delhi',
        City__c = 'New Delhi',
        Sells__c = 'Goods',
        Job_Level__c = 'Founder/Owner',
        Annual_Revenue_Band__c = '1Cr-5Cr INR',
        Expected_Revenue_INR__c = 30000000,
        Stage__c = 'In Review',
        Fit_Score__c = 88,
        Legitimacy_Verdict__c = 'Verified',
        Decision__c = 'Pending'
    ),
    new Invite_Request__c(
        RecordTypeId = companyRt,
        Applicant_Type__c = 'Company',
        First_Name__c = 'Arjun',
        Last_Name__c = 'Kapoor',
        Work_Email__c = 'arjun@kapoortextiles.in',
        Company_Website__c = 'https://kapoortextiles.in',
        Country__c = 'India',
        State__c = 'Gujarat',
        City__c = 'Surat',
        Sells__c = 'Goods',
        Job_Level__c = 'Founder/Owner',
        Annual_Revenue_Band__c = '50L-1Cr INR',
        Expected_Revenue_INR__c = 9000000,
        Stage__c = 'In Review',
        Fit_Score__c = 79,
        Legitimacy_Verdict__c = 'Verified',
        Decision__c = 'Pending'
    ),
    new Invite_Request__c(
        RecordTypeId = individualRt,
        Applicant_Type__c = 'Individual',
        First_Name__c = 'Divya',
        Last_Name__c = 'Nair',
        Work_Email__c = 'divya.nair@example.in',
        Country__c = 'India',
        State__c = 'Kerala',
        City__c = 'Kochi',
        Sells__c = 'Services',
        Stage__c = 'Rejected',
        Sub_Status__c = 'Ineligible Country',
        Fit_Score__c = 18
    )
};
insert seeds;
System.debug('Inserted ' + seeds.size() + ' Invite_Request__c seed records.');

// Now approve the two that "succeeded" -- this update fires Provision_On_Approval,
// which creates the Account, links Converted_Account__c, and moves Stage__c to Onboarding.
List<Invite_Request__c> toApprove = [
    SELECT Id FROM Invite_Request__c WHERE Work_Email__c IN ('sanjay@guptaimports.in', 'arjun@kapoortextiles.in')
];
for (Invite_Request__c r : toApprove) {
    r.Decision__c = 'Approved';
}
update toApprove;
System.debug('Approved ' + toApprove.size() + ' records -- Provision_On_Approval should have created their Accounts.');
