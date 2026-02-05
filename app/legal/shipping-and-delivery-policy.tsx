import React from 'react';
import { LegalLayout, LegalSection } from '../../components/legal';

export default function ShippingPolicyScreen() {
    const lastUpdated = new Date().toLocaleDateString("en-IN");

    return (
        <LegalLayout title="Shipping & Delivery Policy" lastUpdated={lastUpdated}>
            <LegalSection
                content="Horibol partners with trusted courier and delivery services to provide safe and timely delivery of orders across India."
            />

            <LegalSection
                title="1. Delivery areas"
                content="We currently deliver to all major cities, towns, and serviceable PIN codes across India."
            />

            <LegalSection
                title="2. Delivery timelines"
                content="Typical delivery times:"
                items={[
                    "Metro cities: 2–4 working days",
                    "Tier 2 & Tier 3 cities: 3–6 working days",
                    "Remote areas: 5–10 working days"
                ]}
            />

            <LegalSection
                content="Delivery times may vary due to public holidays, weather, or courier delays."
            />

            <LegalSection
                title="3. Shipping charges"
                items={[
                    "Free delivery on most products.",
                    "Certain products or remote locations may have an additional shipping charge, shown during checkout."
                ]}
            />

            <LegalSection
                title="4. Order tracking"
                content="Once your order is shipped, you will receive a tracking link via SMS or email. You can use this link to track the status of your shipment."
            />

            <LegalSection
                title="5. Delivery attempts"
                content="The courier partner will make up to 2–3 attempts to deliver your order. If the delivery fails due to an incorrect address or unavailability, the order may be returned to us."
            />

            <LegalSection
                title="6. Damaged deliveries"
                content="If the package appears damaged, tampered or opened at the time of delivery:"
                items={[
                    "Please refuse to accept the order.",
                    "Immediately contact us at support@horibol.com."
                ]}
            />

            <LegalSection
                title="7. Incorrect address"
                content="Orders may be cancelled or delayed if the shipping address is inaccurate or incomplete. Customers are responsible for providing correct details."
            />
        </LegalLayout>
    );
}
