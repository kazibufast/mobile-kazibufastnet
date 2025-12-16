import React from "react";
import {
    Dimensions,
    Image,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Header from "../../components/Header";

const { width } = Dimensions.get("window");

type TeamMember = {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    avatar: string;
};

const teamData: TeamMember[] = [
    {
        id: "1",
        name: "Alice Johnson",
        role: "Project Manager",
        email: "alice@example.com",
        phone: "+1234567890",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
        id: "2",
        name: "Bob Smith",
        role: "Software Engineer",
        email: "bob@example.com",
        phone: "+1234567891",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
        id: "3",
        name: "Carol Williams",
        role: "UI/UX Designer",
        email: "carol@example.com",
        phone: "+1234567892",
        avatar: "https://randomuser.me/api/portraits/women/55.jpg"
    },
    // Add more members here
];

export default function TeamScreen() {

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleEmail = (email: string) => {
        Linking.openURL(`mailto:${email}`);
    };

    const renderMember = (item: TeamMember) => (
        <View key={item.id} style={styles.memberCard}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.role}>{item.role}</Text>
                <View style={styles.contactContainer}>
                    <TouchableOpacity onPress={() => handleCall(item.phone)}>
                        <Text style={styles.contactText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleEmail(item.email)}>
                        <Text style={styles.contactText}>Email</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <Text style={styles.title}>Our Team</Text>
                {teamData.map(member => renderMember(member))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F7F7",
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginVertical: 20,
        textAlign: "center",
        color: "#333",
    },
    memberCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 16,
    },
    infoContainer: {
        flex: 1,
        justifyContent: "center",
    },
    name: {
        fontSize: 18,
        fontWeight: "600",
        color: "#222",
    },
    role: {
        fontSize: 14,
        color: "#666",
        marginVertical: 4,
    },
    contactContainer: {
        flexDirection: "row",
        marginTop: 8,
    },
    contactText: {
        marginRight: 20,
        fontSize: 14,
        fontWeight: "500",
        color: "#00AFA1",
    },
});
