import { Ionicons } from '@expo/vector-icons'; // Added Ionicons
import { Tabs } from 'expo-router';
import React from 'react';
import { useCart } from '../../context/CartContext'; // <--- 1. IMPORT HOOK

export default function TabLayout() {
  const { cartCount } = useCart(); // <--- 2. GET LIVE COUNT

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "cart" : "cart-outline"} size={24} color={color} />,
          // 3. APPLY BADGE (Only show if > 0)
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}