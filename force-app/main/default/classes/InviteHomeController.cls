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

  public class AgingRequest {
    @AuraEnabled
    public Id recordId;
    @AuraEnabled
    public String name;
    @AuraEnabled
    public String stage;
    @AuraEnabled
    public Integer daysInStage;
  }

  private static final List<String> AGING_STAGES = new List<String>{
    'Action Needed',
    'In Review'
  };

  @AuraEnabled(cacheable=true)
  public static List<AgingRequest> getAgingRequests(Integer maxResults) {
    Integer safeLimit = (maxResults == null ||
      maxResults <= 0)
      ? 5
      : Math.min(maxResults, 25);
    List<AgingRequest> results = new List<AgingRequest>();
    for (Invite_Request__c r : [
      SELECT Id, Name, Stage__c, LastModifiedDate
      FROM Invite_Request__c
      WHERE Stage__c IN :AGING_STAGES
      ORDER BY LastModifiedDate ASC
      LIMIT :safeLimit
    ]) {
      AgingRequest aging = new AgingRequest();
      aging.recordId = r.Id;
      aging.name = r.Name;
      aging.stage = r.Stage__c;
      aging.daysInStage = Integer.valueOf(
        (Datetime.now().getTime() - r.LastModifiedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      results.add(aging);
    }
    return results;
  }

  public class TopAccount implements Comparable {
    @AuraEnabled
    public Id recordId;
    @AuraEnabled
    public String name;
    @AuraEnabled
    public String planTier;
    @AuraEnabled
    public Decimal totalVolumeInr;

    public Integer compareTo(Object other) {
      Decimal otherVolume = ((TopAccount) other).totalVolumeInr;
      if (this.totalVolumeInr == otherVolume) {
        return 0;
      }
      return this.totalVolumeInr > otherVolume ? -1 : 1;
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<TopAccount> getTopPerformingAccounts(Integer maxResults) {
    Integer safeLimit = (maxResults == null ||
      maxResults <= 0)
      ? 5
      : Math.min(maxResults, 25);

    Map<Id, Decimal> volumeByAccount = new Map<Id, Decimal>();
    for (AggregateResult ar : [
      SELECT Provisioned_Account__c pa, SUM(Volume_INR__c) total
      FROM Usage_Snapshot__c
      GROUP BY Provisioned_Account__c
    ]) {
      volumeByAccount.put((Id) ar.get('pa'), (Decimal) ar.get('total'));
    }
    if (volumeByAccount.isEmpty()) {
      return new List<TopAccount>();
    }

    List<TopAccount> results = new List<TopAccount>();
    for (Provisioned_Account__c pa : [
      SELECT Id, Name, Plan_Tier__c
      FROM Provisioned_Account__c
      WHERE Id IN :volumeByAccount.keySet()
    ]) {
      TopAccount top = new TopAccount();
      top.recordId = pa.Id;
      top.name = pa.Name;
      top.planTier = pa.Plan_Tier__c;
      top.totalVolumeInr = volumeByAccount.get(pa.Id);
      results.add(top);
    }
    results.sort();
    List<TopAccount> trimmed = new List<TopAccount>();
    for (Integer i = 0; i < Math.min(results.size(), safeLimit); i++) {
      trimmed.add(results[i]);
    }
    return trimmed;
  }

  public class ReadyToProvision {
    @AuraEnabled
    public Id recordId;
    @AuraEnabled
    public String name;
    @AuraEnabled
    public String applicantType;
    @AuraEnabled
    public Decimal fitScore;
    @AuraEnabled
    public String legitimacyVerdict;
  }

  @AuraEnabled(cacheable=true)
  public static List<ReadyToProvision> getReadyToProvision(Integer maxResults) {
    Integer safeLimit = (maxResults == null ||
      maxResults <= 0)
      ? 5
      : Math.min(maxResults, 25);
    List<ReadyToProvision> results = new List<ReadyToProvision>();
    for (Invite_Request__c r : [
      SELECT Id, Name, Applicant_Type__c, Fit_Score__c, Legitimacy_Verdict__c
      FROM Invite_Request__c
      WHERE Stage__c = 'In Review' AND Decision__c = 'Pending'
      ORDER BY Fit_Score__c DESC
      LIMIT :safeLimit
    ]) {
      ReadyToProvision ready = new ReadyToProvision();
      ready.recordId = r.Id;
      ready.name = r.Name;
      ready.applicantType = r.Applicant_Type__c;
      ready.fitScore = r.Fit_Score__c;
      ready.legitimacyVerdict = r.Legitimacy_Verdict__c;
      results.add(ready);
    }
    return results;
  }

  public class RelatedProvisionedAccount {
    @AuraEnabled
    public Id recordId;
    @AuraEnabled
    public String name;
    @AuraEnabled
    public String status;
    @AuraEnabled
    public String planTier;
    @AuraEnabled
    public String riskLevel;
    @AuraEnabled
    public Decimal contractValueInr;
  }

  @AuraEnabled(cacheable=true)
  public static RelatedProvisionedAccount getRelatedProvisionedAccount(
    Id inviteRequestId
  ) {
    List<Provisioned_Account__c> matches = [
      SELECT Id, Name, Status__c, Plan_Tier__c, Risk_Level__c, Contract_Value_INR__c
      FROM Provisioned_Account__c
      WHERE Invite_Request__c = :inviteRequestId
      LIMIT 1
    ];
    if (matches.isEmpty()) {
      return null;
    }
    Provisioned_Account__c pa = matches[0];
    RelatedProvisionedAccount related = new RelatedProvisionedAccount();
    related.recordId = pa.Id;
    related.name = pa.Name;
    related.status = pa.Status__c;
    related.planTier = pa.Plan_Tier__c;
    related.riskLevel = pa.Risk_Level__c;
    related.contractValueInr = pa.Contract_Value_INR__c;
    return related;
  }

  public class MonthOverMonthDelta {
    @AuraEnabled
    public Decimal currentVolumeInr;
    @AuraEnabled
    public Decimal previousVolumeInr;
    @AuraEnabled
    public Decimal deltaPercent;
    @AuraEnabled
    public Boolean hasPrevious;
  }

  @AuraEnabled(cacheable=true)
  public static MonthOverMonthDelta getMonthOverMonthDelta(
    Id usageSnapshotId
  ) {
    MonthOverMonthDelta delta = new MonthOverMonthDelta();
    delta.hasPrevious = false;

    Usage_Snapshot__c current = [
      SELECT Provisioned_Account__c, Month__c, Volume_INR__c
      FROM Usage_Snapshot__c
      WHERE Id = :usageSnapshotId
    ];
    delta.currentVolumeInr = current.Volume_INR__c;

    if (current.Month__c == null) {
      return delta;
    }
    List<Usage_Snapshot__c> priors = [
      SELECT Volume_INR__c
      FROM Usage_Snapshot__c
      WHERE
        Provisioned_Account__c = :current.Provisioned_Account__c
        AND Month__c < :current.Month__c
      ORDER BY Month__c DESC
      LIMIT 1
    ];
    if (priors.isEmpty() || priors[0].Volume_INR__c == null) {
      return delta;
    }
    delta.hasPrevious = true;
    delta.previousVolumeInr = priors[0].Volume_INR__c;
    if (priors[0].Volume_INR__c != 0 && delta.currentVolumeInr != null) {
      delta.deltaPercent = ((delta.currentVolumeInr - priors[0].Volume_INR__c) /
      priors[0].Volume_INR__c) * 100;
    }
    return delta;
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

  public class UsageSummary {
    @AuraEnabled
    public Integer snapshotCount;
    @AuraEnabled
    public Decimal totalVolumeInr;
    @AuraEnabled
    public Decimal totalRevenueInr;
    @AuraEnabled
    public String sourceInviteRequestName;
    @AuraEnabled
    public Id sourceInviteRequestId;
  }

  @AuraEnabled(cacheable=true)
  public static UsageSummary getUsageSummary(Id provisionedAccountId) {
    UsageSummary summary = new UsageSummary();
    summary.snapshotCount = 0;
    summary.totalVolumeInr = 0;
    summary.totalRevenueInr = 0;

    List<Usage_Snapshot__c> snapshots = [
      SELECT Volume_INR__c, Revenue_INR__c
      FROM Usage_Snapshot__c
      WHERE Provisioned_Account__c = :provisionedAccountId
    ];
    summary.snapshotCount = snapshots.size();
    for (Usage_Snapshot__c usage : snapshots) {
      summary.totalVolumeInr += usage.Volume_INR__c == null
        ? 0
        : usage.Volume_INR__c;
      summary.totalRevenueInr += usage.Revenue_INR__c == null
        ? 0
        : usage.Revenue_INR__c;
    }

    List<Provisioned_Account__c> source = [
      SELECT Invite_Request__c, Invite_Request__r.Name
      FROM Provisioned_Account__c
      WHERE Id = :provisionedAccountId AND Invite_Request__c != null
      LIMIT 1
    ];
    if (!source.isEmpty()) {
      summary.sourceInviteRequestId = source[0].Invite_Request__c;
      summary.sourceInviteRequestName = source[0].Invite_Request__r.Name;
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

  public class TrendPoint {
    @AuraEnabled
    public String bucketLabel;
    @AuraEnabled
    public Integer total;
  }

  private static final List<String> MONTH_NAMES = new List<String>{
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  };

  private static String formatBucketLabel(Date bucketStart, String groupBy) {
    String month = MONTH_NAMES[bucketStart.month() - 1];
    if (groupBy == 'MONTH') {
      return month + ' ' + String.valueOf(bucketStart.year());
    }
    return month + ' ' + String.valueOf(bucketStart.day());
  }

  // Buckets are anchored on the range's start date (not calendar week/month boundaries) --
  // simpler than day-of-week arithmetic, and arguably more intuitive for a rolling
  // "last N days" view than forcing alignment to Mon-Sun weeks.
  @AuraEnabled(cacheable=true)
  public static List<TrendPoint> getTrendData(String rangeKey, String groupBy) {
    Integer days = 30;
    if (rangeKey == 'LAST_7') {
      days = 7;
    } else if (rangeKey == 'LAST_90') {
      days = 90;
    }
    String bucketBy = String.isBlank(groupBy) ? 'DAY' : groupBy;
    Date startDate = Date.today().addDays(-(days - 1));
    Integer bucketSizeDays = bucketBy == 'WEEK' ? 7 : 1;

    List<Date> bucketStarts = new List<Date>();
    Map<Date, Integer> countsByBucketStart = new Map<Date, Integer>();

    if (bucketBy == 'MONTH') {
      Date cursor = Date.newInstance(startDate.year(), startDate.month(), 1);
      Date endMonth = Date.newInstance(Date.today().year(), Date.today().month(), 1);
      while (cursor <= endMonth) {
        bucketStarts.add(cursor);
        countsByBucketStart.put(cursor, 0);
        cursor = cursor.addMonths(1);
      }
    } else {
      Date cursor = startDate;
      while (cursor <= Date.today()) {
        bucketStarts.add(cursor);
        countsByBucketStart.put(cursor, 0);
        cursor = cursor.addDays(bucketSizeDays);
      }
    }

    for (Invite_Request__c r : [
      SELECT CreatedDate
      FROM Invite_Request__c
      WHERE CreatedDate >= :startDate
    ]) {
      Date createdDate = r.CreatedDate.date();
      Date bucketKey;
      if (bucketBy == 'MONTH') {
        bucketKey = Date.newInstance(createdDate.year(), createdDate.month(), 1);
      } else {
        Integer offsetDays = startDate.daysBetween(createdDate);
        Integer bucketIndex = offsetDays / bucketSizeDays;
        bucketKey = startDate.addDays(bucketIndex * bucketSizeDays);
      }
      if (!countsByBucketStart.containsKey(bucketKey)) {
        countsByBucketStart.put(bucketKey, 0);
        bucketStarts.add(bucketKey);
      }
      countsByBucketStart.put(bucketKey, countsByBucketStart.get(bucketKey) + 1);
    }

    bucketStarts.sort();
    List<TrendPoint> results = new List<TrendPoint>();
    for (Date bucketStart : bucketStarts) {
      TrendPoint point = new TrendPoint();
      point.bucketLabel = formatBucketLabel(bucketStart, bucketBy);
      point.total = countsByBucketStart.get(bucketStart);
      results.add(point);
    }
    return results;
  }

  public class OwnedInvite {
    @AuraEnabled
    public Id recordId;
    @AuraEnabled
    public String name;
    @AuraEnabled
    public String stage;
    @AuraEnabled
    public String applicantType;
    @AuraEnabled
    public Datetime createdDate;
  }

  @AuraEnabled(cacheable=true)
  public static List<OwnedInvite> getMyOwnedInvites() {
    List<OwnedInvite> results = new List<OwnedInvite>();
    for (Invite_Request__c r : [
      SELECT Id, Name, Stage__c, Applicant_Type__c, CreatedDate
      FROM Invite_Request__c
      WHERE OwnerId = :UserInfo.getUserId()
      ORDER BY CreatedDate DESC
      LIMIT 10
    ]) {
      OwnedInvite owned = new OwnedInvite();
      owned.recordId = r.Id;
      owned.name = r.Name;
      owned.stage = r.Stage__c;
      owned.applicantType = r.Applicant_Type__c;
      owned.createdDate = r.CreatedDate;
      results.add(owned);
    }
    return results;
  }

  public class StateCount {
    @AuraEnabled
    public String state;
    @AuraEnabled
    public Integer total;
  }

  @AuraEnabled(cacheable=true)
  public static List<StateCount> getStateBreakdown() {
    List<StateCount> results = new List<StateCount>();
    for (AggregateResult ar : [
      SELECT State__c st, COUNT(Id) total
      FROM Invite_Request__c
      WHERE State__c != null
      GROUP BY State__c
    ]) {
      StateCount sc = new StateCount();
      sc.state = (String) ar.get('st');
      sc.total = (Integer) ar.get('total');
      results.add(sc);
    }
    return results;
  }

  public class InviteRow {
    @AuraEnabled
    public Id recordId;
    @AuraEnabled
    public String name;
    @AuraEnabled
    public String applicantType;
    @AuraEnabled
    public String stage;
    @AuraEnabled
    public String subStatus;
    @AuraEnabled
    public String decision;
    @AuraEnabled
    public Decimal fitScore;
    @AuraEnabled
    public String country;
    @AuraEnabled
    public String state;
    @AuraEnabled
    public Datetime createdDate;
    @AuraEnabled
    public String ownerName;
  }

  @AuraEnabled(cacheable=true)
  public static List<InviteRow> getInviteTableRows(Integer maxResults) {
    Integer safeLimit = (maxResults == null ||
      maxResults <= 0)
      ? 50
      : Math.min(maxResults, 200);
    List<Invite_Request__c> records = [
      SELECT
        Id,
        Name,
        Applicant_Type__c,
        Stage__c,
        Sub_Status__c,
        Decision__c,
        Fit_Score__c,
        Country__c,
        State__c,
        CreatedDate,
        OwnerId
      FROM Invite_Request__c
      ORDER BY CreatedDate DESC
      LIMIT :safeLimit
    ];

    // OwnerId is polymorphic (User or Queue) -- look names up separately via a plain User
    // query instead of a dot-relationship traversal, and default to the Id string for any
    // owner that isn't a User (a Queue, most likely) rather than leaving it blank.
    Set<Id> ownerIds = new Set<Id>();
    for (Invite_Request__c r : records) {
      ownerIds.add(r.OwnerId);
    }
    Map<Id, String> ownerNameById = new Map<Id, String>();
    for (User u : [SELECT Id, Name FROM User WHERE Id IN :ownerIds]) {
      ownerNameById.put(u.Id, u.Name);
    }

    List<InviteRow> results = new List<InviteRow>();
    for (Invite_Request__c r : records) {
      InviteRow row = new InviteRow();
      row.recordId = r.Id;
      row.name = r.Name;
      row.applicantType = r.Applicant_Type__c;
      row.stage = r.Stage__c;
      row.subStatus = r.Sub_Status__c;
      row.decision = r.Decision__c;
      row.fitScore = r.Fit_Score__c;
      row.country = r.Country__c;
      row.state = r.State__c;
      row.createdDate = r.CreatedDate;
      row.ownerName = ownerNameById.containsKey(r.OwnerId)
        ? ownerNameById.get(r.OwnerId)
        : String.valueOf(r.OwnerId);
      results.add(row);
    }
    return results;
  }
}
