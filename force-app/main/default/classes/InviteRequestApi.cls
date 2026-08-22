/**
 * Public, Guest-accessible REST endpoint for the "apply for an invite" form —
 * the web-to-lead-style path for a custom object (Web-to-Lead itself only works with
 * the standard Lead object, so this is the modern equivalent).
 *
 * Reached at: https://<site-domain>/invite/services/apexrest/inviteRequest
 * (the /invite path prefix comes from the Experience Cloud site the Guest user belongs to —
 * that's what authenticates the request as that site's Guest User, no OAuth token needed).
 *
 * Create-only, by design: this class never reads back or updates existing records, matching
 * the Guest User profile's own Create-only object permission on Invite_Request__c.
 */
@RestResource(urlMapping='/inviteRequest')
global with sharing class InviteRequestApi {
    public class SubmissionRequest {
        public String applicantType;
        public String firstName;
        public String lastName;
        public String workEmail;
        public String phone;
        public String country;
        public String state;
        public String city;
        public String companyWebsite;
        public String companyRegistrationNumber;
        public String panNumber;
        public String gstNumber;
        public String annualRevenueBand;
        public Decimal expectedRevenueInr;
        public String jobLevel;
        public String jobFunction;
        public Boolean hasOverseasEntity;
        public Boolean seekingOverseasExpansion;
        public String sells;
        public String notes;
        public Boolean marketingConsent;
    }

    public class SubmissionResponse {
        public Boolean success;
        public String recordName;
        public String errorMessage;
    }

    @HttpPost
    global static void submit() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        SubmissionResponse out = new SubmissionResponse();

        try {
            SubmissionRequest body = (SubmissionRequest) JSON.deserialize(
                req.requestBody.toString(),
                SubmissionRequest.class
            );

            if (String.isBlank(body.applicantType) || String.isBlank(body.workEmail) ||
                String.isBlank(body.firstName) || String.isBlank(body.lastName)) {
                out.success = false;
                out.errorMessage = 'Applicant type, first name, last name, and work email are required.';
                res.statusCode = 400;
                res.responseBody = Blob.valueOf(JSON.serialize(out));
                return;
            }

            Map<String, Schema.RecordTypeInfo> rtByName = Schema.SObjectType.Invite_Request__c
                .getRecordTypeInfosByDeveloperName();
            if (!rtByName.containsKey(body.applicantType)) {
                out.success = false;
                out.errorMessage = 'Applicant type must be "Company" or "Individual".';
                res.statusCode = 400;
                res.responseBody = Blob.valueOf(JSON.serialize(out));
                return;
            }

            Invite_Request__c newRequest = new Invite_Request__c(
                RecordTypeId = rtByName.get(body.applicantType).getRecordTypeId(),
                Applicant_Type__c = body.applicantType,
                First_Name__c = body.firstName,
                Last_Name__c = body.lastName,
                Work_Email__c = body.workEmail,
                Phone__c = body.phone,
                Country__c = String.isBlank(body.country) ? 'India' : body.country,
                State__c = body.state,
                City__c = body.city,
                Company_Website__c = body.companyWebsite,
                Company_Registration_Number__c = body.companyRegistrationNumber,
                PAN_Number__c = body.panNumber,
                GST_Number__c = body.gstNumber,
                Annual_Revenue_Band__c = body.annualRevenueBand,
                Expected_Revenue_INR__c = body.expectedRevenueInr,
                Job_Level__c = body.jobLevel,
                Job_Function__c = body.jobFunction,
                Has_Overseas_Entity__c = body.hasOverseasEntity == true,
                Seeking_Overseas_Expansion__c = body.seekingOverseasExpansion == true,
                Sells__c = body.sells,
                Notes__c = body.notes,
                Marketing_Consent__c = body.marketingConsent == true,
                Stage__c = 'Received',
                Sub_Status__c = 'New Submission'
            );
            insert newRequest;

            // Guest Users can never read back a record they just created (Salesforce's
            // "Secure Guest User Record Access" applies regardless of object permissions),
            // so we return the Id captured from the insert itself rather than re-querying Name.
            out.success = true;
            out.recordName = newRequest.Id;
            res.statusCode = 201;
            res.responseBody = Blob.valueOf(JSON.serialize(out));
        } catch (Exception e) {
            out.success = false;
            out.errorMessage = 'We could not process your application right now. Please try again shortly.';
            res.statusCode = 500;
            res.responseBody = Blob.valueOf(JSON.serialize(out));
        }
    }
}
