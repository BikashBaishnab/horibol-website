import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

interface HighlightedTextProps {
    text: string;
    highlight?: { snippet?: string }; // Matches Typesense response structure
    style?: StyleProp<TextStyle>;
    highlightStyle?: StyleProp<TextStyle>;
}

export default function HighlightedText({
    text,
    highlight,
    style,
    highlightStyle
}: HighlightedTextProps) {

    // 1. Fallback: If no highlight data, just return normal text
    if (!highlight?.snippet) {
        return <Text style={style}>{text}</Text>;
    }

    // 2. Logic: Split the snippet by the <mark> tags
    // "Super <mark>Data</mark> Cable" -> ["Super ", "<mark>Data</mark>", " Cable"]
    const parts = highlight.snippet.split(/(<mark>.*?<\/mark>)/g);

    return (
        <Text style={style}>
            {parts.map((part, index) => {
                if (part.startsWith('<mark>')) {
                    // Remove the tags to get just the word inside
                    const cleanText = part.replace(/<\/?mark>/g, '');
                    return (
                        <Text key={index} style={highlightStyle}>
                            {cleanText}
                        </Text>
                    );
                }
                // Return non-highlighted parts as is
                return <Text key={index}>{part}</Text>;
            })}
        </Text>
    );
}