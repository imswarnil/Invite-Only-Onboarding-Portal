@isTest
private class InviteHomeControllerTest {
  @TestSetup
  static void setup() {
    Id companyRt = Schema.SObjectType.Invite_Request__c.getRecordTypeInfosByDeveloperName()
      .get('Company')
      .getRecordTypeId();
    Id individualRt = Schema.SObjectType.Invite_Request__c.getRecordTypeInfosByDeveloperName()
      .get('Individual')
      .getRecordTypeId();

    Invite_Request__c req = new Invite_Request__c(
      RecordTypeId = companyRt,
      Applicant_Type__c = 'Company',
      First_Name__c = 'Test',
      Last_Name__c = 'Applicant',
      Work_Email__c = 'test@example.com',
      Stage__c = 'Received'
    );
    insert req;

    req.Stage__c = 'AI Validation';
    update req;

    insert new Invite_Request__c(
      RecordTypeId = individualRt,
      Applicant_Type__c = 'Individual',
      First_Name__c = 'Solo',
      Last_Name__c = 'Founder',
      Work_Email__c = 'solo@example.com',
      Stage__c = 'Received'
    );

    Account acct = new Account(Name = 'Test Account', Type = 'Invite Only');
    insert acct;

    insert new List<Provisioned_Account__c>{
      new Provisioned_Account__c(Account__c = acct.Id, Status__c = 'Active'),
      new Provisioned_Account__c(Account__c = acct.Id, Status__c = 'Paused'),
      new Provisioned_Account__c(Account__c = acct.Id, Status__c = 'Cancelled')
    };
  }

  @isTest
  static void testGetOverviewStats() {
    Test.startTest();
    InviteHomeController.OverviewStats stats = InviteHomeController.getOverviewStats();
    Test.stopTest();

    System.assertEquals(2, stats.totalRequests);
  }

  @isTest
  static void testGetStageCounts() {
    Test.startTest();
    List<InviteHomeController.StageCount> results = InviteHomeController.getStageCounts();
    Test.stopTest();

    System.assertEquals(
      10,
      results.size(),
      'Should return one row per pipeline stage'
    );
    Integer total = 0;
    for (InviteHomeController.StageCount sc : results) {
      total += sc.total;
    }
    System.assertEquals(
      2,
      total,
      'Both seeded records should show up across the stage buckets'
    );
  }

  @isTest
  static void testGetTypeSplit() {
    Test.startTest();
    InviteHomeController.TypeSplit split = InviteHomeController.getTypeSplit();
    Test.stopTest();

    System.assertEquals(1, split.individualCount);
    System.assertEquals(1, split.companyCount);
  }

  @isTest
  static void testGetRecentInvites() {
    Test.startTest();
    List<Invite_Request__c> results = InviteHomeController.getRecentInvites(5);
    Test.stopTest();

    System.assertEquals(2, results.size());
  }

  @isTest
  static void testGetRecentInvitesDefaultsLimit() {
    Test.startTest();
    List<Invite_Request__c> results = InviteHomeController.getRecentInvites(
      null
    );
    Test.stopTest();

    System.assertEquals(
      2,
      results.size(),
      'A null limit should fall back to a default, not error'
    );
  }

  @isTest
  static void testGetProvisionedAccountSummary() {
    Test.startTest();
    InviteHomeController.ProvisionedAccountSummary summary = InviteHomeController.getProvisionedAccountSummary();
    Test.stopTest();

    System.assertEquals(1, summary.activeCount);
    System.assertEquals(1, summary.pausedCount);
    System.assertEquals(1, summary.cancelledCount);
  }

  @isTest
  static void testGetFieldHistory() {
    // Field History Tracking records are written by an async process that does not run
    // during Apex test execution, so this can't assert non-empty results here even though
    // the Stage__c change in @TestSetup would show up in a real transaction. This just
    // confirms the query itself is valid and the method doesn't error.
    Invite_Request__c req = [SELECT Id FROM Invite_Request__c LIMIT 1];

    Test.startTest();
    List<InviteHomeController.HistoryEntry> history = InviteHomeController.getFieldHistory(
      req.Id
    );
    Test.stopTest();

    System.assertNotEquals(
      null,
      history,
      'Should return a list, even if empty in test context'
    );
  }
}
