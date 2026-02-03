import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'COD';

interface PaymentSelectionProps {
    selectedMethod: PaymentMethod;
    onSelectMethod: (method: PaymentMethod) => void;
    isCodAvailable: boolean;
    codReason?: string;
}

export const PaymentSelection = ({
    selectedMethod,
    onSelectMethod,
    isCodAvailable,
    codReason
}: PaymentSelectionProps) => {

    const renderOption = (id: PaymentMethod, title: string, subtitle?: string, iconName?: keyof typeof Ionicons.glyphMap) => {
        const isSelected = selectedMethod === id;
        const isDisabled = id === 'COD' && !isCodAvailable;

        return (
            <TouchableOpacity
                disabled={isDisabled}
                onPress={() => onSelectMethod(id)}
                className={`flex-row items-center p-4 border-b border-gray-100 bg-white ${isDisabled ? 'opacity-50' : ''}`}
            >
                {/* Radio Button */}
                <View className={`w-5 h-5 rounded-full border-2 mr-4 items-center justify-center ${isSelected ? 'border-primary' : 'border-gray-300'}`}>
                    {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </View>

                {/* Text Content */}
                <View className="flex-1">
                    <Text className="text-base font-medium text-secondary">{title}</Text>
                    {subtitle && <Text className="text-xs text-gray-500 mt-0.5">{subtitle}</Text>}

                    {/* Error Message for COD */}
                    {isDisabled && codReason && (
                        <Text className="text-xs text-error mt-1">{codReason}</Text>
                    )}
                </View>

                {/* Icon (Optional) */}
                {iconName && (
                    <Ionicons name={iconName} size={24} color={isSelected ? '#FFD700' : '#666'} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View className="bg-surface mt-2 rounded-lg overflow-hidden shadow-sm">
            <Text className="text-xs font-bold text-gray-500 px-4 py-3 bg-gray-50 uppercase tracking-wider">
                Recommended
            </Text>

            {renderOption('UPI', 'UPI', 'Google Pay, PhonePe, Paytm', 'qr-code-outline')}

            <Text className="text-xs font-bold text-gray-500 px-4 py-3 bg-gray-50 uppercase tracking-wider mt-2">
                Payment Options
            </Text>

            {renderOption('CARD', 'Credit / Debit Card', 'Visa, Mastercard, RuPay', 'card-outline')}
            {renderOption('NETBANKING', 'Net Banking', 'All Indian banks supported', 'business-outline')}
            {renderOption('COD', 'Cash on Delivery', isCodAvailable ? 'Pay on delivery' : 'Unavailable', 'cash-outline')}
        </View>
    );
};