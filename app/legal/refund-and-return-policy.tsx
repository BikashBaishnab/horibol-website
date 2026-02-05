import React from 'react';
import { LegalLayout, LegalSection } from '../../components/legal';

export default function RefundReturnPolicyScreen() {
    const lastUpdated = new Date().toLocaleDateString("en-IN");

    return (
        <LegalLayout title="Refund & Return Policy" lastUpdated={lastUpdated}>
            <LegalSection
                content="Thank you for shopping with Horibol. We aim to ensure a smooth and reliable shopping experience. This Refund & Return Policy explains when and how returns, replacements, and refunds can be requested."
            />

            <LegalSection
                title="1. Eligibility for returns"
                content="Returns or replacements may be accepted under the following conditions:"
                items={[
                    "You received a damaged or defective product.",
                    "You received the wrong product or variant.",
                    "The product is not functioning as described."
                ]}
            />

            <LegalSection
                content="To be eligible, the product must be returned in the original condition with all box contents, accessories, and packaging."
            />

            <LegalSection
                title="2. Non-returnable items"
                items={[
                    "Used earphones / headphones for hygiene reasons.",
                    "Physical screen damage caused after delivery.",
                    "Water-damaged or customer-damaged items.",
                    "Items without their original box or accessories."
                ]}
            />

            <LegalSection
                title="3. Return window and process"
                content="You must request a return or replacement within:"
                items={[
                    "48 hours for damaged or defective products.",
                    "72 hours for wrong product/variant delivered."
                ]}
            />

            <LegalSection
                content="Email us at support@horibol.com with:"
                items={[
                    "Order ID",
                    "Product name",
                    "Issue description",
                    "Photos/video of the issue"
                ]}
            />

            <LegalSection
                title="4. Refund process"
                content="Refunds are issued only after:"
                items={[
                    "The product is returned and inspected.",
                    "Quality check is passed for genuine issues."
                ]}
            />

            <LegalSection
                content={`Refund timeline:
• 3–7 business days for UPI/wallet refunds
• 7–10 business days for bank refunds`}
            />

            <LegalSection
                title="5. Replacement process"
                content="Eligible products will be replaced with the same or similar model depending on availability. If a replacement is not possible, we will issue a refund instead."
            />

            <LegalSection
                title="6. Contact"
                content="If you need help with a return or refund, contact us at support@horibol.com."
            />
        </LegalLayout>
    );
}
