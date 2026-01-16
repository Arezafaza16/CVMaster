// CV Master - Subscription Context
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { SUBSCRIPTION_PRICE } from '../types';

interface SubscriptionContextType {
    isPremium: boolean;
    subscriptionExpiry: Date | null;
    loading: boolean;
    canScanWithoutAds: boolean;
    canUseJobMatching: boolean;
    canUseAiFix: boolean;
    canCreateMultipleCvs: boolean;
    maxFreeCvs: number;
    checkFeatureAccess: (feature: PremiumFeature) => boolean;
    refreshSubscription: () => Promise<void>;
}

export type PremiumFeature =
    | 'no_ads'
    | 'job_matching'
    | 'ai_fix'
    | 'multiple_cvs'
    | 'premium_templates';

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { userData } = useAuth();
    const [isPremium, setIsPremium] = useState(false);
    const [subscriptionExpiry, setSubscriptionExpiry] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);

    const MAX_FREE_CVS = 1;

    // Check subscription status
    useEffect(() => {
        if (userData) {
            const isSubscribed = userData.subscriptionStatus === 'premium';
            const expiry = userData.subscriptionExpiry;

            // Check if subscription is still valid
            if (isSubscribed && expiry) {
                const expiryDate = expiry instanceof Date ? expiry : new Date(expiry);
                const now = new Date();

                if (expiryDate > now) {
                    setIsPremium(true);
                    setSubscriptionExpiry(expiryDate);
                } else {
                    // Subscription expired
                    setIsPremium(false);
                    setSubscriptionExpiry(null);
                }
            } else {
                setIsPremium(false);
                setSubscriptionExpiry(null);
            }
        } else {
            setIsPremium(false);
            setSubscriptionExpiry(null);
        }
        setLoading(false);
    }, [userData]);

    const checkFeatureAccess = useCallback((feature: PremiumFeature): boolean => {
        if (isPremium) return true;

        // Free users can't access these features
        const premiumOnlyFeatures: PremiumFeature[] = [
            'no_ads',
            'job_matching',
            'ai_fix',
            'multiple_cvs',
            'premium_templates',
        ];

        return !premiumOnlyFeatures.includes(feature);
    }, [isPremium]);

    const refreshSubscription = useCallback(async () => {
        // This would typically verify with Google Play Billing
        // For now, it just re-reads from Firestore (handled by userData effect)
        setLoading(true);
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
        setLoading(false);
    }, []);

    const value: SubscriptionContextType = {
        isPremium,
        subscriptionExpiry,
        loading,
        canScanWithoutAds: isPremium,
        canUseJobMatching: isPremium,
        canUseAiFix: isPremium,
        canCreateMultipleCvs: isPremium,
        maxFreeCvs: MAX_FREE_CVS,
        checkFeatureAccess,
        refreshSubscription,
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};

// Subscription plan details
export const subscriptionPlan = {
    id: 'premium_monthly',
    name: 'CV Master Premium',
    price: SUBSCRIPTION_PRICE,
    currency: 'IDR',
    period: 'monthly' as const,
    features: [
        'Scan CV tanpa iklan',
        'Job requirement matching',
        'AI CV improvement',
        'Template premium unlimited',
        'Buat CV unlimited',
        'Priority support',
    ],
};

export default SubscriptionContext;
