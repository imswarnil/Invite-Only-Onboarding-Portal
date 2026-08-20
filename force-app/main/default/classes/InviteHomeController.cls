/**
 * Aggregate/rollup data for the Invite Only homepage widgets. Split into one method per
 * widget need rather than one big payload, so each LWC's @wire only recomputes when its
 * own data actually changes.
 */
public with sharing class InviteHomeController {
  private static final List<String> STAGE_ORDER = new List<String>{
    'Received',
    'AI Validation',
    'Action Needed',
    'In Review',
    'Approved',
    'Onboarding',
    'Activated',
    'Won',
    'Waitlisted',
    'Rejected'
  };

  public class StageCount {
    @AuraEnabled
    public String stage;
    @AuraEnabled
    public Integer total;
  }

  public class TypeSplit {
    @AuraEnabled
    public Integer individualCount;
    @AuraEnabled
    public Integer companyCount;
  }

  public class HistoryEntry {
    @AuraEnabled
    public String fieldLabel;
    @AuraEnabled
    public String oldValue;
    @AuraEnabled
    public String newValue;
    @AuraEnabled
    public DateTime changedDate;
    @AuraEnabled
    public String changedByName;
  }

  public class OverviewStats {
    @AuraEnabled
    public Integer totalRequests;
    @AuraEnabled
    public Decimal averageFitScore;
  }

  @AuraEnabled(cacheable=true)
  public static OverviewStats getOverviewStats() {
    OverviewStats stats = new OverviewStats();
    List<AggregateResult> results = [
      SELECT COUNT(Id) total, AVG(Fit_Score__c) avgScore
      FROM Invite_Request__c
    ];
    stats.totalRequests = (Integer) results[0].get('total');
    Object avg = results[0].get('avgScore');
    stats.averageFitScore = avg == null ? null : ((Decimal) avg).setScale(0);
    return stats;
  }

  @AuraEnabled(cacheable=true)
  public static List<StageCount> getStageCounts() {
    Map<String, Integer> counts = new Map<String, Integer>();
    for (AggregateResult ar : [
      SELECT Stage__c stageValue, COUNT(Id) total
      FROM Invite_Request__c
      GROUP BY Stage__c
    ]) {
      counts.put((String) ar.get('stageValue'), (Integer) ar.get('total'));
    }
    List<StageCount> results = new List<StageCount>();
    for (String stage : STAGE_ORDER) {
      StageCount sc = new StageCount();
      sc.stage = stage;
      sc.total = counts.containsKey(stage) ? counts.get(stage) : 0;
      results.add(sc);
    }
    return results;
  }

  @AuraEnabled(cacheable=true)
  public static TypeSplit getTypeSplit() {
    TypeSplit split = new TypeSplit();
    split.individualCount = 0;
    split.companyCount = 0;
    for (AggregateResult ar : [
      SELECT Applicant_Type__c typeValue, COUNT(Id) total
      FROM Invite_Request__c
      GROUP BY Applicant_Type__c
    ]) {
      String type = (String) ar.get('typeValue');
      Integer total = (Integer) ar.get('total');
      if (type == 'Individual') {
        split.individualCount = total;
      } else if (type == 'Company') {
        split.companyCount = total;
      }
    }
    return split;
  }

  @AuraEnabled(cacheable=true)
  public static List<Invite_Request__c> getRecentInvites(Integer maxResults) {
    Integer safeLimit = (maxResults == null ||
      maxResults <= 0)
      ? 10
      : Math.min(maxResults, 50);
    return [
      SELECT
        Id,
        Name,
        First_Name__c,
        Last_Name__c,
        Work_Email__c,
        Applicant_Type__c,
        Country__c,
        Stage__c,
        Fit_Score__c,
        LastModifiedDate
      FROM Invite_Request__c
      ORDER BY LastModifiedDate DESC
      LIMIT :safeLimit
    ];
  }

  public class ProvisionedAccountSummary {
    @AuraEnabled
    public Integer activeCount;
    @AuraEnabled
    public Integer pausedCount;
    @AuraEnabled
    public Integer cancelledCount;
  }

  @AuraEnabled(cacheable=true)
  public static ProvisionedAccountSummary getProvisionedAccountSummary() {
    ProvisionedAccountSummary summary = new ProvisionedAccountSummary();
    summary.activeCount = 0;
    summary.pausedCount = 0;
    summary.cancelledCount = 0;
    for (AggregateResult ar : [
      SELECT Status__c statusValue, COUNT(Id) total
      FROM Provisioned_Account__c
      GROUP BY Status__c
    ]) {
      String status = (String) ar.get('statusValue');
      Integer total = (Integer) ar.get('total');
      if (status == 'Active') {
        summary.activeCount = total;
      } else if (status == 'Paused') {
        summary.pausedCount = total;
      } else if (status == 'Cancelled') {
        summary.cancelledCount = total;
      }
    }
    return summary;
  }

  public class AccountInviteSummary {
    @AuraEnabled
    public Integer provisionedAccountCount;
    @AuraEnabled
    public Decimal totalVolumeInr;
    @AuraEnabled
    public String sourceInviteRequestName;
    @AuraEnabled
    public Id sourceInviteRequestId;
  }

  @AuraEnabled(cacheable=true)
  public static AccountInviteSummary getAccountInviteSummary(Id accountId) {
    AccountInviteSummary summary = new AccountInviteSummary();
    summary.provisionedAccountCount = 0;
    summary.totalVolumeInr = 0;

    List<Provisioned_Account__c> provisioned = [
      SELECT Id, (SELECT Volume_INR__c FROM Usage_Snapshots__r)
      FROM Provisioned_Account__c
      WHERE Account__c = :accountId
    ];
    summary.provisionedAccountCount = provisioned.size();
    for (Provisioned_Account__c pa : provisioned) {
      for (Usage_Snapshot__c usage : pa.Usage_Snapshots__r) {
        summary.totalVolumeInr += usage.Volume_INR__c == null
          ? 0
          : usage.Volume_INR__c;
      }
    }

    List<Invite_Request__c> source = [
      SELECT Id, Name
      FROM Invite_Request__c
      WHERE Converted_Account__c = :accountId
      LIMIT 1
    ];
    if (!source.isEmpty()) {
      summary.sourceInviteRequestId = source[0].Id;
      summary.sourceInviteRequestName = source[0].Name;
    }
    return summary;
  }

  @AuraEnabled(cacheable=true)
  public static List<HistoryEntry> getFieldHistory(Id recordId) {
    List<HistoryEntry> entries = new List<HistoryEntry>();
    for (Invite_Request__History h : [
      SELECT Field, OldValue, NewValue, CreatedDate, CreatedBy.Name
      FROM Invite_Request__History
      WHERE ParentId = :recordId
      ORDER BY CreatedDate DESC
      LIMIT 50
    ]) {
      HistoryEntry entry = new HistoryEntry();
      entry.fieldLabel = h.Field;
      entry.oldValue = h.OldValue == null ? '—' : String.valueOf(h.OldValue);
      entry.newValue = h.NewValue == null ? '—' : String.valueOf(h.NewValue);
      entry.changedDate = h.CreatedDate;
      entry.changedByName = h.CreatedBy.Name;
      entries.add(entry);
    }
    return entries;
  }
}
