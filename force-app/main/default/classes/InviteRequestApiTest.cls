@isTest
private class InviteRequestApiTest {
    private static RestRequest buildRequest(String body) {
        RestRequest req = new RestRequest();
        req.requestURI = '/services/apexrest/inviteRequest';
        req.httpMethod = 'POST';
        req.requestBody = Blob.valueOf(body);
        return req;
    }

    @isTest
    static void testValidCompanySubmission() {
        String body = JSON.serialize(new Map<String, Object>{
            'applicantType' => 'Company',
            'firstName' => 'Test',
            'lastName' => 'Founder',
            'workEmail' => 'founder@example.in',
            'country' => 'India',
            'state' => 'Karnataka',
            'city' => 'Bengaluru',
            'sells' => 'Services'
        });
        RestContext.request = buildRequest(body);
        RestContext.response = new RestResponse();

        Test.startTest();
        InviteRequestApi.submit();
        Test.stopTest();

        InviteRequestApi.SubmissionResponse res = (InviteRequestApi.SubmissionResponse) JSON.deserialize(
            RestContext.response.responseBody.toString(),
            InviteRequestApi.SubmissionResponse.class
        );
        System.assertEquals(201, RestContext.response.statusCode);
        System.assertEquals(true, res.success);
        System.assertNotEquals(null, res.recordName);

        Invite_Request__c created = [SELECT Stage__c, Applicant_Type__c FROM Invite_Request__c WHERE Work_Email__c = 'founder@example.in'];
        System.assertEquals('Received', created.Stage__c);
        System.assertEquals('Company', created.Applicant_Type__c);
    }

    @isTest
    static void testMissingRequiredFields() {
        String body = JSON.serialize(new Map<String, Object>{ 'applicantType' => 'Company' });
        RestContext.request = buildRequest(body);
        RestContext.response = new RestResponse();

        Test.startTest();
        InviteRequestApi.submit();
        Test.stopTest();

        System.assertEquals(400, RestContext.response.statusCode);
    }

    @isTest
    static void testInvalidApplicantType() {
        String body = JSON.serialize(new Map<String, Object>{
            'applicantType' => 'NotARealType',
            'firstName' => 'Test',
            'lastName' => 'User',
            'workEmail' => 'test@example.in'
        });
        RestContext.request = buildRequest(body);
        RestContext.response = new RestResponse();

        Test.startTest();
        InviteRequestApi.submit();
        Test.stopTest();

        System.assertEquals(400, RestContext.response.statusCode);
    }
}
