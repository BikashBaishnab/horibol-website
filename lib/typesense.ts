import Typesense from 'typesense';

// 1. Define the shape of your Product data
export interface SearchResultItem {
    product_id: string;
    product_name: string;
    brand_name: string;
    category_name: string;
    main_image: string;
    price: number;
    highlight?: {
        product_name?: { snippet: string };
        brand_name?: { snippet: string };
    };
}

// 2. Initialize the Client (UPDATED WITH YOUR SCREENSHOT DATA)
const client = new Typesense.Client({
    nodes: [{
        host: 'search.horibol.com',  // Exact host from your screenshot
        port: 443,                   // Standard HTTPS port
        protocol: 'https',           // Secure connection
    }],
    apiKey: 'typesense_api_horibol', // Exact key from your screenshot
    connectionTimeoutSeconds: 2,
});

// 3. The Search Function
export const searchProducts = async (queryText: string): Promise<SearchResultItem[]> => {
    try {
        const searchParameters = {
            q: queryText,
            query_by: 'brand_name, product_name, category_name', // Updated to match your widget
            collection: 'products', // Updated from 'typesense_search_view' to 'products'

            prefix: 'true',
            num_typos: 2,
            group_by: 'product_id',
            group_limit: 1,
            highlight_full_fields: 'product_name, brand_name',
            highlight_start_tag: '<mark>',
            highlight_end_tag: '</mark>',
        };

        const response = await client.collections('products').documents().search(searchParameters);

        if (response.grouped_hits) {
            return response.grouped_hits.map((group) => {
                const doc = group.hits[0].document as unknown as SearchResultItem;
                const highlight = group.hits[0].highlight;
                return { ...doc, highlight };
            });
        }
        return [];

    } catch (error) {
        console.error("Typesense Error:", error);
        return [];
    }
};