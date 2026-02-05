import React from 'react';
import { LegalLayout, LegalSection } from '../../components/legal';

export default function CancellationReplacementPolicyScreen() {
    const lastUpdated = new Date().toLocaleDateString("en-IN");

    return (
        <LegalLayout title="Cancellation & Replacement Policy" lastUpdated={lastUpdated}>
            <LegalSection
                content="We understand that situations may arise where you wish to cancel or modify your order. This policy outlines the guidelines for cancellations and replacements."
            />

            <LegalSection
                title="1. Order cancellation"
                content="You may cancel an order within:"
                items={[
                    "1 hour after placing the order, OR",
                    "Before the order is shipped."
                ]}
            />

            <LegalSection
                content="Once shipped, the order cannot be cancelled. However, you may request a return or replacement after delivery based on our Return Policy."
            />

            <LegalSection
                title="2. Replacement requests"
                content="You may request a replacement if:"
                items={[
                    "The product received is defective.",
                    "The product delivered is incorrect.",
                    "The item is damaged during transit."
                ]}
            />

            <LegalSection
                content="Replacements depend on stock availability. If a replacement is not available, we will issue a refund."
            />

            <LegalSection
                title="3. Situations where cancellation is not allowed"
                items={[
                    "Orders already shipped or out for delivery.",
                    "Products damaged after delivery due to customer misuse.",
                    "Items used, unboxed, or missing accessories."
                ]}
            />

            <LegalSection
                title="4. How to request"
                content="To cancel or request a replacement, email us at support@horibol.com with:"
                items={[
                    "Order ID",
                    "Reason for cancellation/replacement",
                    "Photos/videos (for defective or damaged items)"
                ]}
            />
        </LegalLayout>
    );
}
