import React from 'react';
import Navbar from '../../componentes/Navbar/Navbar';
import Footer from '../../componentes/Footer/Footer';
import ProfileInfo from './componentes/ProfileInfo/ProfileInfo';
import styles from './ProfilePage.module.css';
import { useNavigation } from '../../context/NavigationContext';

const ProfilePage = () => {
    const { user, profile } = useNavigation();

    const handleCancelSubscription = () => {
        alert("Subscription cancelled.");
    };

    const handleViewHistory = () => {
        alert("Showing download history...");
    };

    if (!user || !profile) {
        return (
            <div className={styles.profilePage}>
                <Navbar />
                <main className={styles.mainContent}>
                    <p>Loading profile...</p>
                </main>
                <Footer />
            </div>
        );
    }

    const memberSinceDate = new Date(user.created_at);
    const memberSinceFormatted = memberSinceDate.toLocaleString('default', { month: 'short', year: 'numeric' });

    const subscriptionPlan = profile.is_subscribed ? 'Pro' : 'Free';
    const subscriptionStatus = profile.is_subscribed ? 'Active' : 'Inactive';

    return (
        <div className={styles.profilePage}>
            <Navbar />
            <main className={styles.mainContent}>
                <div className={styles.profileHeader}>
                    <h1>Welcome, {profile.full_name?.split(' ')[0]}!</h1>
                    <p>This is your profile page. You can manage your account and settings here.</p>
                </div>
                <div className={styles.profileGrid}>
                    <ProfileInfo 
                        name={profile.full_name} 
                        email={user.email} 
                        memberSince={memberSinceFormatted}
                    />

                    <div className={styles.subscriptionCard}>
                        <h2>Subscription</h2>
                        <p>Plan: {subscriptionPlan}</p>
                        <p>Status: {subscriptionStatus}</p>
                        <p>Next billing: Oct 25, 2025</p>
                        <button onClick={handleCancelSubscription} className={`${styles.actionButton} ${styles.cancelButton}`}>
                            Cancel Subscription
                        </button>
                    </div>
                    
                    <div className={styles.metricsCard}>
                        <h2>Download Metrics</h2>
                        {/* A LINHA DO MÊS FOI REMOVIDA DAQUI */}
                        <p>Total downloads: {profile.downloads_made || 0}</p>
                        <button onClick={handleViewHistory} className={`${styles.actionButton} ${styles.historyButton}`}>
                            View History
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProfilePage;