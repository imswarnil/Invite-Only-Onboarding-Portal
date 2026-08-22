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

    Invite_Request__c provisionedSource = [
      SELECT Id
      FROM Invite_Request__c
      WHERE Applicant_Type__c = 'Company'
      LIMIT 1
    ];

    insert new List<Provisioned_Account__c>{
      new Provisioned_Account__c(
        Invite_Request__c = provisionedSource.Id,
        Status__c = 'Active'
      ),
      new Provisioned_Account__c(Status__c = 'Paused'),
      new Provisioned_Account__c(Status__c = 'Cancelled')
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
  static void testGetUsageSummary() {
    Invite_Request__c req = [
      SELECT Id
      FROM Invite_Request__c
      WHERE Applicant_Type__c = 'Company'
      LIMIT 1
    ];
    Provisioned_Account__c pa = [
      SELECT Id
      FROM Provisioned_Account__c
      WHERE Invite_Request__c = :req.Id
      LIMIT 1
    ];
    insert new Usage_Snapshot__c(
      Provisioned_Account__c = pa.Id,
      Volume_INR__c = 1000,
      Revenue_INR__c = 20
    );

    Test.startTest();
    InviteHomeController.UsageSummary summary = InviteHomeController.getUsageSummary(
      pa.Id
    );
    Test.stopTest();

    System.assertEquals(1, summary.snapshotCount);
    System.assertEquals(1000, summary.totalVolumeInr);
    System.assertEquals(20, summary.totalRevenueInr);
    System.assertEquals(req.Id, summary.sourceInviteRequestId);
  }

  @isTest
  static void testGetAgingRequests() {
    insert new Invite_Request__c(
      Applicant_Type__c = 'Individual',
      First_Name__c = 'Aging',
      Last_Name__c = 'Applicant',
      Work_Email__c = 'aging@example.com',
      Stage__c = 'Action Needed'
    );

    Test.startTest();
    List<InviteHomeController.AgingRequest> results = InviteHomeController.getAgingRequests(
      5
    );
    Test.stopTest();

    System.assertEquals(1, results.size());
    System.assertEquals('Action Needed', results[0].stage);
    System.assert(results[0].daysInStage >= 0);
  }

  @isTest
  static void testGetTopPerformingAccounts() {
    Provisioned_Account__c pa = [
      SELECT Id
      FROM Provisioned_Account__c
      WHERE Status__c = 'Active'
      LIMIT 1
    ];
    pa.Plan_Tier__c = 'Enterprise';
    update pa;
    insert new Usage_Snapshot__c(
      Provisioned_Account__c = pa.Id,
      Volume_INR__c = 5000
    );

    Test.startTest();
    List<InviteHomeController.TopAccount> results = InviteHomeController.getTopPerformingAccounts(
      5
    );
    Test.stopTest();

    System.assertEquals(1, results.size());
    System.assertEquals(pa.Id, results[0].recordId);
    System.assertEquals('Enterprise', results[0].planTier);
    System.assertEquals(5000, results[0].totalVolumeInr);
  }

  @isTest
  static void testGetReadyToProvision() {
    insert new Invite_Request__c(
      Applicant_Type__c = 'Company',
      First_Name__c = 'Ready',
      Last_Name__c = 'Applicant',
      Work_Email__c = 'ready@example.com',
      Stage__c = 'In Review',
      Decision__c = 'Pending',
      Fit_Score__c = 80,
      Legitimacy_Verdict__c = 'Verified'
    );

    Test.startTest();
    List<InviteHomeController.ReadyToProvision> results = InviteHomeController.getReadyToProvision(
      5
    );
    Test.stopTest();

    System.assertEquals(1, results.size());
    System.assertEquals(80, results[0].fitScore);
    System.assertEquals('Verified', results[0].legitimacyVerdict);
  }

  @isTest
  static void testGetRelatedProvisionedAccount() {
    Invite_Request__c req = [
      SELECT Id
      FROM Invite_Request__c
      WHERE Applicant_Type__c = 'Company'
      LIMIT 1
    ];
    Provisioned_Account__c pa = [
      SELECT Id
      FROM Provisioned_Account__c
      WHERE Invite_Request__c = :req.Id
      LIMIT 1
    ];
    pa.Plan_Tier__c = 'Growth';
    pa.Risk_Level__c = 'Medium';
    pa.Contract_Value_INR__c = 400000;
    update pa;

    Invite_Request__c individualReq = [
      SELECT Id
      FROM Invite_Request__c
      WHERE Applicant_Type__c = 'Individual'
      LIMIT 1
    ];

    Test.startTest();
    InviteHomeController.RelatedProvisionedAccount related = InviteHomeController.getRelatedProvisionedAccount(
      req.Id
    );
    InviteHomeController.RelatedProvisionedAccount none = InviteHomeController.getRelatedProvisionedAccount(
      individualReq.Id
    );
    Test.stopTest();

    System.assertEquals(pa.Id, related.recordId);
    System.assertEquals('Growth', related.planTier);
    System.assertEquals(null, none);
  }

  @isTest
  static void testGetMonthOverMonthDelta() {
    Provisioned_Account__c pa = [
      SELECT Id
      FROM Provisioned_Account__c
      WHERE Status__c = 'Active'
      LIMIT 1
    ];
    insert new Usage_Snapshot__c(
      Provisioned_Account__c = pa.Id,
      Month__c = Date.newInstance(2026, 6, 1),
      Volume_INR__c = 1000
    );
    Usage_Snapshot__c julySnapshot = new Usage_Snapshot__c(
      Provisioned_Account__c = pa.Id,
      Month__c = Date.newInstance(2026, 7, 1),
      Volume_INR__c = 1500
    );
    insert julySnapshot;

    Test.startTest();
    InviteHomeController.MonthOverMonthDelta delta = InviteHomeController.getMonthOverMonthDelta(
      julySnapshot.Id
    );
    Test.stopTest();

    System.assertEquals(true, delta.hasPrevious);
    System.assertEquals(1000, delta.previousVolumeInr);
    System.assertEquals(50, delta.deltaPercent.setScale(0));
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

  @isTest
  static void testGetTrendDataByDay() {
    Test.startTest();
    List<InviteHomeController.TrendPoint> results = InviteHomeController.getTrendData(
      'LAST_7',
      'DAY'
    );
    Test.stopTest();

    System.assertEquals(7, results.size(), 'One bucket per day in the range');
    Integer total = 0;
    for (InviteHomeController.TrendPoint p : results) {
      total += p.total;
    }
    System.assertEquals(
      2,
      total,
      'The two @TestSetup records were both created today, inside the range'
    );
  }

  @isTest
  static void testGetTrendDataByMonth() {
    Test.startTest();
    List<InviteHomeController.TrendPoint> results = InviteHomeController.getTrendData(
      'LAST_90',
      'MONTH'
    );
    Test.stopTest();

    System.assert(
      results.size() >= 1,
      'Should return at least the current month bucket'
    );
  }

  @isTest
  static void testGetMyOwnedInvites() {
    Test.startTest();
    List<InviteHomeController.OwnedInvite> results = InviteHomeController.getMyOwnedInvites();
    Test.stopTest();

    System.assert(
      results.size() >= 1,
      'Records inserted by the running test user should default to owned by that user'
    );
  }

  @isTest
  static void testGetStateBreakdown() {
    insert new Invite_Request__c(
      Applicant_Type__c = 'Individual',
      First_Name__c = 'State',
      Last_Name__c = 'Tester',
      Work_Email__c = 'statetester@example.com',
      State__c = 'Karnataka',
      Stage__c = 'Received'
    );

    Test.startTest();
    List<InviteHomeController.StateCount> results = InviteHomeController.getStateBreakdown();
    Test.stopTest();

    Boolean foundKarnataka = false;
    for (InviteHomeController.StateCount sc : results) {
      if (sc.state == 'Karnataka') {
        foundKarnataka = true;
      }
    }
    System.assert(foundKarnataka, 'Should include the Karnataka bucket');
  }

  @isTest
  static void testGetInviteTableRows() {
    Test.startTest();
    List<InviteHomeController.InviteRow> results = InviteHomeController.getInviteTableRows(
      5
    );
    Test.stopTest();

    System.assertEquals(2, results.size());
    System.assertNotEquals(null, results[0].ownerName);
  }
}
