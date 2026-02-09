import React from 'react';
import { LegalLayout, LegalSection } from '../../components/legal';

export default function DeleteAccountScreen() {
    const lastUpdated = new Date().toLocaleDateString("en-IN");

    return (
        <LegalLayout title="Delete Account" lastUpdated={lastUpdated}>
            <LegalSection
                content="At Horibol, we respect your privacy and your right to control your personal data. If you wish to delete your account and all associated data, please follow the instructions below."
            />

            <LegalSection
                title="1. How to request account deletion"
                content="To delete your Horibol account, you can:"
                items={[
                    "Send an email to support@horibol.com with subject 'Account Deletion Request'",
                    "Include your registered phone number or email in the request",
                    "We will verify your identity before processing the deletion"
                ]}
            />

            <LegalSection
                title="2. What happens when you delete your account"
                content="When your account deletion request is processed:"
                items={[
                    "Your personal information (name, email, phone, addresses) will be permanently deleted",
                    "Your order history will be anonymized for legal compliance",
                    "Any pending orders will be cancelled and refunded as per our refund policy",
                    "You will no longer be able to access the app with your current credentials"
                ]}
            />

            <LegalSection
                title="3. Data retention"
                content="Some information may be retained for legal and business purposes:"
                items={[
                    "Transaction records as required by tax and accounting laws (up to 7 years)",
                    "Communication logs for dispute resolution",
                    "Anonymized data for analytics and service improvement"
                ]}
            />

            <LegalSection
                title="4. Processing time"
                content="If you wish to delete your account and all associated data, please email us at support@horibol.com with the subject 'Delete Account'. We will process your request within 30 days. You will receive a confirmation email once your account has been deleted."
            />

            <LegalSection
                title="5. Reactivation"
                content="Once your account is deleted, it cannot be recovered. If you wish to use Horibol again, you will need to create a new account."
            />

            <LegalSection
                title="6. Contact us"
                content="For any questions regarding account deletion, please contact us at support@horibol.com or call our customer support."
            />
        </LegalLayout>
    );
}
