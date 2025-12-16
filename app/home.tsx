// import { useRouter } from "expo-router";
// import React, { useState } from "react";
// import {
//     Image,
//     SafeAreaView,
//     ScrollView,
//     StatusBar,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View
// } from "react-native";

// export default function HomeScreen() {
//     const router = useRouter();
//     const [activeTab, setActiveTab] = useState("home");
    
//     // Tab navigation items
//     const tabs = [
//         { id: "home", label: "Home", icon: "🏠" },
//         { id: "subscription", label: "Subscription", icon: "📋" },
//         { id: "billing", label: "Billing", icon: "💰" },
//         { id: "promo", label: "Promo", icon: "🎁" },
//         { id: "ticket", label: "Ticket", icon: "🎫" },
//     ];

//     // Render content based on active tab
//     const renderContent = () => {
//         switch (activeTab) {
//             case "home":
//                 return (
//                     <ScrollView style={styles.content}>
//                         <View style={styles.welcomeSection}>
//                             <Text style={styles.welcomeTitle}>Welcome back! 👋</Text>
//                             <Text style={styles.welcomeSubtitle}>
//                                 You have successfully logged in to Kazibufast
//                             </Text>
//                         </View>

//                         <View style={styles.card}>
//                             <Text style={styles.cardTitle}>Account Balance</Text>
//                             <Text style={styles.cardAmount}>₱ 2,500.00</Text>
//                             <Text style={styles.cardSubtitle}>Available Balance</Text>
//                         </View>

//                         <View style={styles.card}>
//                             <Text style={styles.cardTitle}>Recent Transactions</Text>
//                             {[
//                                 { id: 1, name: "Load Purchase", amount: "₱ 100.00", date: "Today" },
//                                 { id: 2, name: "Bill Payment", amount: "₱ 1,200.00", date: "Yesterday" },
//                                 { id: 3, name: "Money Transfer", amount: "₱ 500.00", date: "Dec 3" },
//                             ].map((transaction) => (
//                                 <View key={transaction.id} style={styles.transactionItem}>
//                                     <View>
//                                         <Text style={styles.transactionName}>{transaction.name}</Text>
//                                         <Text style={styles.transactionDate}>{transaction.date}</Text>
//                                     </View>
//                                     <Text style={styles.transactionAmount}>{transaction.amount}</Text>
//                                 </View>
//                             ))}
//                         </View>

//                         <View style={styles.card}>
//                             <Text style={styles.cardTitle}>Quick Actions</Text>
//                             <View style={styles.quickActions}>
//                                 {[
//                                     { id: 1, name: "Send Money", icon: "💸" },
//                                     { id: 2, name: "Pay Bills", icon: "🧾" },
//                                     { id: 3, name: "Buy Load", icon: "📱" },
//                                     { id: 4, name: "Cash In", icon: "🏧" },
//                                 ].map((action) => (
//                                     <TouchableOpacity key={action.id} style={styles.actionButton}>
//                                         <Text style={styles.actionIcon}>{action.icon}</Text>
//                                         <Text style={styles.actionName}>{action.name}</Text>
//                                     </TouchableOpacity>
//                                 ))}
//                             </View>
//                         </View>
//                     </ScrollView>
//                 );
            
//             case "subscription":
//                 return (
//                     <ScrollView style={styles.content}>
//                         <View style={styles.welcomeSection}>
//                             <Text style={styles.welcomeTitle}>Subscriptions 📋</Text>
//                             <Text style={styles.welcomeSubtitle}>
//                                 Manage your active subscriptions
//                             </Text>
//                         </View>
                        
//                         <View style={styles.card}>
//                             <Text style={styles.cardTitle}>Active Subscriptions</Text>
//                             <Text style={styles.placeholderText}>
//                                 No active subscriptions yet
//                             </Text>
//                         </View>
//                     </ScrollView>
//                 );
            
//             case "billing":
//                 return (
//                     <ScrollView style={styles.content}>
//                         <View style={styles.welcomeSection}>
//                             <Text style={styles.welcomeTitle}>Billing 💰</Text>
//                             <Text style={styles.welcomeSubtitle}>
//                                 View and pay your bills
//                             </Text>
//                         </View>
                        
//                         <View style={styles.card}>
//                             <Text style={styles.cardTitle}>Pending Bills</Text>
//                             <Text style={styles.placeholderText}>
//                                 No pending bills
//                             </Text>
//                         </View>
//                     </ScrollView>
//                 );
            
//             case "promo":
//                 return (
//                     <ScrollView style={styles.content}>
//                         <View style={styles.welcomeSection}>
//                             <Text style={styles.welcomeTitle}>Promotions 🎁</Text>
//                             <Text style={styles.welcomeSubtitle}>
//                                 Available deals and promotions
//                             </Text>
//                         </View>
                        
//                         <View style={styles.card}>
//                             <Text style={styles.cardTitle}>Active Promos</Text>
//                             <Text style={styles.placeholderText}>
//                                 Check back soon for promotions
//                             </Text>
//                         </View>
//                     </ScrollView>
//                 );
            
//             case "ticket":
//                 return (
//                     <ScrollView style={styles.content}>
//                         <View style={styles.welcomeSection}>
//                             <Text style={styles.welcomeTitle}>Support Tickets 🎫</Text>
//                             <Text style={styles.welcomeSubtitle}>
//                                 Your support requests
//                             </Text>
//                         </View>
                        
//                         <View style={styles.card}>
//                             <Text style={styles.cardTitle}>Open Tickets</Text>
//                             <Text style={styles.placeholderText}>
//                                 No open support tickets
//                             </Text>
//                         </View>
//                     </ScrollView>
//                 );
            
//             default:
//                 return null;
//         }
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <StatusBar backgroundColor="#00AFA1" barStyle="light-content" />
            
//             {/* Header */}
//             <View style={styles.header}>
//                 <View style={styles.headerContent}>
//                     <Image
//                         source={require("../assets/images/kazi.png")}
//                         style={styles.headerLogo}
//                         resizeMode="contain"
//                     />
//                     <View>
//                         <Text style={styles.headerTitle}>Kazibufast</Text>
//                     </View>
//                 </View>
//                 <TouchableOpacity 
//                     style={styles.logoutButton}
//                     onPress={() => router.replace("/")}
//                 >
//                     <Text style={styles.logoutText}>Logout</Text>
//                 </TouchableOpacity>
//             </View>

//             {/* Main Content */}
//             <View style={styles.mainContent}>
//                 {renderContent()}
//             </View>

//             {/* Bottom Navigation Bar */}
//             <View style={styles.bottomNav}>
//                 {tabs.map((tab) => (
//                     <TouchableOpacity
//                         key={tab.id}
//                         style={[
//                             styles.navItem,
//                             activeTab === tab.id && styles.navItemActive
//                         ]}
//                         onPress={() => setActiveTab(tab.id)}
//                     >
//                         <Text style={[
//                             styles.navIcon,
//                             activeTab === tab.id && styles.navIconActive
//                         ]}>
//                             {tab.icon}
//                         </Text>
//                         <Text style={[
//                             styles.navLabel,
//                             activeTab === tab.id && styles.navLabelActive
//                         ]}>
//                             {tab.label}
//                         </Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#f5f5f5",
//     },
//     header: {
//         backgroundColor: "#00AFA1",
//         paddingHorizontal: 20,
//         paddingTop: 20,
//         paddingBottom: 20,
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//     },
//     headerContent: {
//         flexDirection: "row",
//         alignItems: "center",
//     },
//     headerLogo: {
//         width: 40,
//         height: 40,
//         marginRight: 10,
//         borderRadius: 20,
//         borderWidth: 2,
//         borderColor: "#fff",
//     },
//     headerTitle: {
//         color: "#fff",
//         fontSize: 20,
//         fontWeight: "bold",
//     },
//     headerSubtitle: {
//         color: "#fff",
//         fontSize: 12,
//         opacity: 0.9,
//     },
//     logoutButton: {
//         paddingHorizontal: 15,
//         paddingVertical: 8,
//         backgroundColor: "rgba(255,255,255,0.2)",
//         borderRadius: 20,
//     },
//     logoutText: {
//         color: "#fff",
//         fontSize: 14,
//         fontWeight: "500",
//     },
//     mainContent: {
//         flex: 1,
//     },
//     content: {
//         padding: 20,
//     },
//     welcomeSection: {
//         marginBottom: 20,
//         padding: 20,
//         backgroundColor: "#fff",
//         borderRadius: 15,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     welcomeTitle: {
//         fontSize: 22,
//         fontWeight: "bold",
//         color: "#333",
//         marginBottom: 5,
//     },
//     welcomeSubtitle: {
//         fontSize: 14,
//         color: "#666",
//         lineHeight: 20,
//     },
//     card: {
//         backgroundColor: "#fff",
//         borderRadius: 15,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     cardTitle: {
//         fontSize: 18,
//         fontWeight: "600",
//         color: "#333",
//         marginBottom: 15,
//     },
//     cardAmount: {
//         fontSize: 32,
//         fontWeight: "bold",
//         color: "#00AFA1",
//         marginBottom: 5,
//     },
//     cardSubtitle: {
//         fontSize: 14,
//         color: "#666",
//     },
//     transactionItem: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         paddingVertical: 12,
//         borderBottomWidth: 1,
//         borderBottomColor: "#f0f0f0",
//     },
//     transactionName: {
//         fontSize: 16,
//         color: "#333",
//         fontWeight: "500",
//     },
//     transactionDate: {
//         fontSize: 12,
//         color: "#999",
//         marginTop: 2,
//     },
//     transactionAmount: {
//         fontSize: 16,
//         fontWeight: "600",
//         color: "#333",
//     },
//     quickActions: {
//         flexDirection: "row",
//         flexWrap: "wrap",
//         justifyContent: "space-between",
//     },
//     actionButton: {
//         width: "48%",
//         backgroundColor: "#f8f9fa",
//         borderRadius: 12,
//         padding: 15,
//         marginBottom: 10,
//         alignItems: "center",
//     },
//     actionIcon: {
//         fontSize: 24,
//         marginBottom: 8,
//     },
//     actionName: {
//         fontSize: 14,
//         color: "#333",
//         fontWeight: "500",
//     },
//     placeholderText: {
//         fontSize: 16,
//         color: "#999",
//         textAlign: "center",
//         paddingVertical: 30,
//     },
//     bottomNav: {
//         flexDirection: "row",
//         backgroundColor: "#fff",
//         borderTopWidth: 1,
//         borderTopColor: "#eee",
//         paddingVertical: 10,
//         paddingHorizontal: 5,
//     },
//     navItem: {
//         flex: 1,
//         alignItems: "center",
//         paddingVertical: 8,
//     },
//     navItemActive: {
//         borderTopWidth: 2,
//         borderTopColor: "#00AFA1",
//     },
//     navIcon: {
//         fontSize: 20,
//         marginBottom: 4,
//         color: "#999",
//     },
//     navIconActive: {
//         color: "#00AFA1",
//     },
//     navLabel: {
//         fontSize: 11,
//         color: "#999",
//         fontWeight: "500",
//     },
//     navLabelActive: {
//         color: "#00AFA1",
//         fontWeight: "600",
//     },
// });