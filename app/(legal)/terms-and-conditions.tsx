import React from 'react';
import { LegalLayout, LegalSection } from '../../components/legal';

export default function TermsConditionsScreen() {
    const lastUpdated = new Date().toLocaleDateString("en-IN");

    return (
        <LegalLayout title="Terms & Conditions" lastUpdated={lastUpdated}>
            <LegalSection
                content="These Terms & Conditions ('Terms') govern your use of the Horibol mobile application, website, and services (collectively, the 'Services'). By accessing or using Horibol, you agree to be bound by these Terms."
            />

            <LegalSection
                title="1. Eligibility"
                content="You must be at least 18 years old and capable of entering into a legally binding contract under applicable laws to use Horibol and place orders."
            />

            <LegalSection
                title="2. Account and security"
                items={[
                    "You are responsible for all activities under your account.",
                    "You must provide accurate and complete information while creating your account and keep it updated.",
                    "You must keep your login credentials confidential and notify us immediately if you suspect unauthorised access."
                ]}
            />

            <LegalSection
                title="3. Products and pricing"
                items={[
                    "We strive to display accurate product information, specifications, and images. However, minor variations may occur.",
                    "Prices, offers and availability are subject to change without prior notice.",
                    "In case of obvious pricing errors, we reserve the right to cancel the order or contact you for confirmation before processing."
                ]}
            />

            <LegalSection
                title="4. Orders and payments"
                items={[
                    "Placing an order constitutes an offer to purchase products.",
                    "An order is confirmed when payment is successfully completed and you receive an order confirmation.",
                    "We may cancel or refuse any order due to product unavailability, payment issues, suspected fraud, or incorrect information.",
                    "Payments are processed via third-party payment gateways and banking partners. We do not store your complete card information."
                ]}
            />

            <LegalSection
                title="5. Shipping and delivery"
                content="Please refer to our Shipping & Delivery Policy for details on expected delivery timelines, serviceable locations, shipping fees, and delivery attempts."
            />

            <LegalSection
                title="6. Returns and refunds"
                content="Returns, replacements, and refunds are governed by our Refund & Return Policy. Please review it carefully before placing an order."
            />

            <LegalSection
                title="7. Prohibited activities"
                items={[
                    "Misusing the app or website for illegal or fraudulent purposes.",
                    "Attempting to interfere with the security or integrity of Horibol.",
                    "Using automated tools or scraping data without our written consent."
                ]}
            />

            <LegalSection
                title="8. Limitation of liability"
                content="To the maximum extent permitted by law, Horibol shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the Services, including but not limited to loss of data, revenue, or profits."
            />

            <LegalSection
                title="9. Changes to the Terms"
                content="We may update these Terms from time to time. The revised version will be posted on this page with an updated date. Continued use of the Services after changes means you accept the updated Terms."
            />

            <LegalSection
                title="10. Contact"
                content="If you have any questions regarding these Terms, please contact us at support@horibol.com."
            />
        </LegalLayout>
    );
}
