import React from "react";
import { Text, View } from "react-native";

const EmptyTeamState: React.FC = () => {
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Team Assigned</Text>
            <Text style={styles.emptyMessage}>
                You are not currently assigned to a team.
                {"\n"}
                Please contact the office to be placed on an appropriate team.
            </Text>
        </View>
    );
};
