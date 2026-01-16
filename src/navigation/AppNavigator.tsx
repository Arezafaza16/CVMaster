// CV Master - Navigation Setup
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, fontSize } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/auth/LoginScreen.tsx';
import RegisterScreen from '../screens/auth/RegisterScreen.tsx';
import HomeScreen from '../screens/home/HomeScreen.tsx';
import CVFormScreen from '../screens/cv-builder/CVFormScreen.tsx';
import CVPreviewScreen from '../screens/cv-builder/CVPreviewScreen.tsx';
import CVViewScreen from '../screens/cv-builder/CVViewScreen.tsx';
import ScannerScreen from '../screens/cv-scanner/ScannerScreen.tsx';
import ScoreResultScreen from '../screens/cv-scanner/ScoreResultScreen.tsx';
import JobMatchScreen from '../screens/job-matching/JobMatchScreen.tsx';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen.tsx';
import ProfileScreen from '../screens/home/ProfileScreen.tsx';

// Types
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
        }}
    >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                borderTopWidth: 1,
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarLabelStyle: {
                fontSize: fontSize.xs,
                fontWeight: '600',
            },
            tabBarIcon: ({ focused, color, size }) => {
                let iconName: string;

                switch (route.name) {
                    case 'Home':
                        iconName = focused ? 'home' : 'home-outline';
                        break;
                    case 'JobMatch':
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                        break;
                    case 'Profile':
                        iconName = focused ? 'person' : 'person-outline';
                        break;
                    default:
                        iconName = 'ellipse-outline';
                }

                return <Icon name={iconName} size={size} color={color} />;
            },
        })}
    >
        <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ tabBarLabel: 'Beranda' }}
        />
        <Tab.Screen
            name="JobMatch"
            component={JobMatchScreen}
            options={{ tabBarLabel: 'Job Match' }}
        />
        <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ tabBarLabel: 'Profil' }}
        />
    </Tab.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        // Could add a splash screen here
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                    animation: 'slide_from_right',
                }}
            >
                {user ? (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen
                            name="CVForm"
                            component={CVFormScreen}
                            options={{ animation: 'slide_from_bottom' }}
                        />
                        <Stack.Screen name="CVPreview" component={CVPreviewScreen} />
                        <Stack.Screen
                            name="CVView"
                            component={CVViewScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen name="ScoreResult" component={ScoreResultScreen} />
                        <Stack.Screen
                            name="Subscription"
                            component={SubscriptionScreen}
                            options={{ animation: 'slide_from_bottom' }}
                        />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
