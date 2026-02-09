import React from 'react';
import { LegalLayout, LegalSection } from '../../components/legal';

export default function PrivacyPolicyScreen() {
    const lastUpdated = new Date().toLocaleDateString("en-IN");

    return (
        <LegalLayout title="Privacy Policy" lastUpdated={lastUpdated}>
            <LegalSection
                content="This Privacy Policy explains how Horibol ('we', 'us', 'our') collects, uses, discloses, and protects your information when you use our mobile application, website, and related services."
            />

            <LegalSection
                title="1. Information we collect"
                items={[
                    "Account details like name, phone, email, addresses.",
                    "Order history, delivery details and payment status.",
                    "Device details: IP, OS, app version, logs.",
                    "Support messages and communication sent to us."
                ]}
            />

            <LegalSection
                title="2. How we use your data"
                items={[
                    "To create and manage your Horibol account.",
                    "To deliver your orders and send updates.",
                    "To improve app performance and reliability.",
                    "To prevent fraud and comply with law enforcement."
                ]}
            />

            <LegalSection
                title="3. Sharing of information"
                content="We do not sell your personal information. We may only share it with:"
                items={[
                    "Delivery partners for order fulfilment.",
                    "Payment gateways to process secure payments.",
                    "Service providers who assist with analytics or support.",
                    "Government authorities if required by law."
                ]}
            />

            <LegalSection
                title="4. Security"
                content="We use reasonable technical measures to protect your data. However, no method of transmission is 100% secure."
            />

            <LegalSection
                title="5. Your rights"
                content="You may request access, update or deletion of your personal information subject to applicable laws."
                items={[
                    "Account Deletion: If you wish to delete your account and all associated data, please email us at support@horibol.com with the subject 'Delete Account'. We will process your request within 30 days."
                ]}
            />

            <LegalSection
                title="6. Updates to this policy"
                content="We may update this Privacy Policy from time to time. Continued use of our Services means acceptance of the updated policy."
            />

            <LegalSection
                title="7. Contact us"
                content="For any privacy-related queries, contact us at support@horibol.com."
            />
        </LegalLayout>
    );
}
