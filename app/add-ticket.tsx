import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const scaleSize = (size: number) => {
    const baseWidth = 375;
    const scale = width / baseWidth;
    return Math.round(size * Math.min(scale, 1.2));
};

interface Attachment {
    id: string;
    uri: string;
    name: string;
    type: 'image' | 'video' | 'file';
    size?: number;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    seen?: boolean;
    attachments?: Attachment[];
}

const AddTicket: React.FC = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm here to help you create a support ticket. You can describe your issue and attach photos or files if needed.",
            sender: 'bot',
            timestamp: new Date(),
            seen: true,
        },
    ]);
    const [suggestedQuestions, setSuggestedQuestions] = useState([
        "My internet is not working",
        "Slow internet speed",
        "Billing issue",
        "Want to upgrade my plan",
        "Router problems",
        "Service interruption",
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const lastMessageRef = useRef<string>('');

    const botResponses = {
        "My internet is not working": "I see you're having internet connectivity issues. Let me help you create a ticket for this. What error messages are you seeing?",
        "Slow internet speed": "Slow internet can be frustrating. Are you experiencing this on all devices? What's your current speed test result?",
        "Billing issue": "I can help with billing concerns. Is it about an incorrect charge, late payment, or invoice question?",
        "Want to upgrade my plan": "Great! Let's upgrade your plan. What specific needs do you have for the upgrade?",
        "Router problems": "Router issues are common. Is it not turning on, showing red lights, or WiFi not working?",
        "Service interruption": "Service interruptions are serious. How long has the service been down? Is it affecting your whole area?",
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload images.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const newAttachment: Attachment = {
                    id: Date.now().toString(),
                    uri: asset.uri,
                    name: asset.fileName || `image_${Date.now()}.jpg`,
                    type: 'image',
                    size: asset.fileSize,
                };
                setAttachments(prev => [...prev, newAttachment]);
            }
            setShowAttachmentOptions(false);
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const pickVideo = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload videos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 0.8,
                videoMaxDuration: 60,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const newAttachment: Attachment = {
                    id: Date.now().toString(),
                    uri: asset.uri,
                    name: asset.fileName || `video_${Date.now()}.mp4`,
                    type: 'video',
                    size: asset.fileSize,
                };
                setAttachments(prev => [...prev, newAttachment]);
            }
            setShowAttachmentOptions(false);
        } catch (error) {
            console.error('Error picking video:', error);
            Alert.alert('Error', 'Failed to pick video. Please try again.');
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.type === 'success' && result.assets) {
                const asset = result.assets[0];
                const newAttachment: Attachment = {
                    id: Date.now().toString(),
                    uri: asset.uri,
                    name: asset.name,
                    type: 'file',
                    size: asset.size,
                };
                setAttachments(prev => [...prev, newAttachment]);
            }
            setShowAttachmentOptions(false);
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick document. Please try again.');
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(attachment => attachment.id !== id));
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'Unknown size';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (type: 'image' | 'video' | 'file') => {
        switch (type) {
            case 'image': return 'image';
            case 'video': return 'videocam';
            default: return 'document';
        }
    };

    const sendMessage = (text?: string) => {
        const messageText = text || inputText;

        if (!messageText.trim() && attachments.length === 0) {
            Alert.alert('Empty message', 'Please enter a message or attach a file.');
            return;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            text: messageText.trim(),
            sender: 'user',
            timestamp: new Date(),
            seen: false,
            attachments: attachments.length > 0 ? [...attachments] : undefined,
        };

        setMessages(prev => [...prev, userMessage]);

        // Clear input and attachments
        if (!text) {
            setInputText('');
        }
        setAttachments([]);
        setIsLoading(true);

        setTimeout(() => {
            let botResponse = "Thanks for sharing that information. ";

            if (attachments.length > 0) {
                botResponse += `I've received your ${attachments.length} attachment(s). `;
            }

            if (messageText.trim()) {
                botResponse += getBotResponse(messageText);
            } else {
                botResponse += "Could you provide more details about the attached files?";
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                sender: 'bot',
                timestamp: new Date(),
                seen: false,
            };
            setMessages(prev => [...prev, botMessage]);

            // Mark all previous bot messages as seen when new bot message arrives
            setMessages(prev => prev.map(msg =>
                msg.sender === 'bot' ? { ...msg, seen: true } : msg
            ));

            if (messageText.trim()) {
                updateSuggestedQuestions(messageText);
            }
            setIsLoading(false);
        }, 1500); // Increased delay for attachments
    };

    const handleSendMessage = () => {
        sendMessage();
    };

    const getBotResponse = (userInput: string) => {
        const lowerInput = userInput.toLowerCase();

        if (lowerInput.includes('internet') && lowerInput.includes('not working')) {
            return botResponses["My internet is not working"];
        } else if (lowerInput.includes('slow') || lowerInput.includes('speed')) {
            return botResponses["Slow internet speed"];
        } else if (lowerInput.includes('bill') || lowerInput.includes('payment')) {
            return botResponses["Billing issue"];
        } else if (lowerInput.includes('upgrade') || lowerInput.includes('plan')) {
            return botResponses["Want to upgrade my plan"];
        } else if (lowerInput.includes('router') || lowerInput.includes('wifi')) {
            return botResponses["Router problems"];
        } else if (lowerInput.includes('down') || lowerInput.includes('interruption')) {
            return botResponses["Service interruption"];
        } else {
            return "I understand. Could you provide more details so I can create a proper ticket for you?";
        }
    };

    const updateSuggestedQuestions = (userInput: string) => {
        const lowerInput = userInput.toLowerCase();
        let newQuestions = [];

        if (lowerInput.includes('internet') || lowerInput.includes('connection')) {
            newQuestions = [
                "What error lights are you seeing?",
                "Is it wired or wireless issue?",
                "When did it start?",
                "Have you tried restarting?",
            ];
        } else if (lowerInput.includes('speed') || lowerInput.includes('slow')) {
            newQuestions = [
                "What speed test results?",
                "All devices affected?",
                "Time of day it's slow?",
                "Wired or wireless speed?",
            ];
        } else if (lowerInput.includes('bill') || lowerInput.includes('payment')) {
            newQuestions = [
                "Incorrect amount?",
                "Missing payment?",
                "Need invoice copy?",
                "Payment method issue?",
            ];
        } else {
            // Keep some default suggestions if no match
            newQuestions = [
                "Can you provide more details?",
                "When did this issue start?",
                "Have you tried any fixes?",
                "Any error messages?",
            ];
        }

        setTimeout(() => {
            setSuggestedQuestions(newQuestions);
        }, 300);
    };

    const handleQuickQuestion = (question: string) => {
        sendMessage(question);
    };

    const handleCreateTicket = () => {
        if (messages.length <= 1) {
            Alert.alert('Please describe your issue first');
            return;
        }

        Alert.alert(
            'Create Ticket?',
            'Would you like to create a support ticket from this conversation?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Create Ticket',
                    onPress: () => {
                        Alert.alert(
                            'Ticket Created!',
                            'Your support ticket has been created from this conversation.',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => router.back(),
                                },
                            ]
                        );
                    }
                },
            ]
        );
    };

    const renderAttachment = (attachment: Attachment) => {
        return (
            <View key={attachment.id} style={styles.attachmentContainer}>
                {attachment.type === 'image' ? (
                    <Image
                        source={{ uri: attachment.uri }}
                        style={styles.attachmentImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.fileAttachment}>
                        <Ionicons
                            name={getFileIcon(attachment.type) as keyof typeof Ionicons.glyphMap}
                            size={24}
                            color="#00afa1ff"
                        />
                        <View style={styles.fileInfo}>
                            <Text style={styles.fileName} numberOfLines={1}>
                                {attachment.name}
                            </Text>
                            <Text style={styles.fileSize}>
                                {formatFileSize(attachment.size)}
                            </Text>
                        </View>
                    </View>
                )}
                <TouchableOpacity
                    style={styles.removeAttachmentButton}
                    onPress={() => removeAttachment(attachment.id)}
                >
                    <Ionicons name="close-circle" size={20} color="#ff3b30" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageContainer,
            item.sender === 'user' ? styles.userMessage : styles.botMessage
        ]}>
            <View style={[
                styles.messageBubble,
                item.sender === 'user' ? styles.userBubble : styles.botBubble
            ]}>
                {item.text ? (
                    <Text style={[
                        styles.messageText,
                        item.sender === 'user' ? styles.userMessageText : styles.botMessageText
                    ]}>
                        {item.text}
                    </Text>
                ) : null}

                {item.attachments && item.attachments.length > 0 && (
                    <View style={styles.messageAttachments}>
                        {item.attachments.map(attachment => (
                            <View key={attachment.id} style={styles.sentAttachment}>
                                {attachment.type === 'image' ? (
                                    <Image
                                        source={{ uri: attachment.uri }}
                                        style={styles.sentAttachmentImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.sentFileAttachment}>
                                        <Ionicons
                                            name={getFileIcon(attachment.type) as keyof typeof Ionicons.glyphMap}
                                            size={20}
                                            color={item.sender === 'user' ? '#fff' : '#00afa1ff'}
                                        />
                                        <Text style={[
                                            styles.sentFileName,
                                            { color: item.sender === 'user' ? '#fff' : '#333' }
                                        ]} numberOfLines={1}>
                                            {attachment.name}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.messageFooter}>
                    <Text style={[
                        styles.timestamp,
                        item.sender === 'user' ? styles.userTimestamp : styles.botTimestamp
                    ]}>
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>

                    {item.sender === 'user' && item.seen && (
                        <Text style={styles.seenText}>Seen</Text>
                    )}
                </View>
            </View>
        </View>
    );

    const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
        const visibleMessageIds = viewableItems.map((item: any) => item.key);

        setMessages(prev => prev.map(msg =>
            msg.sender === 'user' && visibleMessageIds.includes(msg.id) && !msg.seen
                ? { ...msg, seen: true }
                : msg
        ));
    }).current;

    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }

        const lastBotMessage = messages
            .filter(msg => msg.sender === 'bot')
            .slice(-1)[0];

        if (lastBotMessage && lastBotMessage.id !== lastMessageRef.current) {
            lastMessageRef.current = lastBotMessage.id;

            setTimeout(() => {
                setMessages(prev => prev.map(msg =>
                    msg.id === lastBotMessage.id ? { ...msg, seen: true } : msg
                ));
            }, 1500);
        }
    }, [messages]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
            >
                {/* Header Section */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={scaleSize(24)} color="#333" />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <View style={styles.logoTitleRow}>
                            <Image
                                source={require("../assets/images/kazi.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <View style={styles.titleContainer}>
                                <Text style={styles.headerTitle}>KaziChat</Text>
                            </View>
                        </View>

                        <Text style={styles.headerSubtitle}>Describe your issue.</Text>
                    </View>
                </View>

                <View style={styles.chatContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        style={styles.chatList}
                        contentContainerStyle={[
                            styles.chatContent,
                            { paddingBottom: 150 + (attachments.length * 60) }
                        ]}
                        onViewableItemsChanged={handleViewableItemsChanged}
                        viewabilityConfig={{
                            itemVisiblePercentThreshold: 50,
                            minimumViewTime: 500,
                        }}
                        ListFooterComponent={
                            <View style={styles.suggestionsContainer}>
                                {isLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <Text style={styles.loadingText}>KAZI is thinking...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Text style={styles.suggestionsTitle}>Suggested questions:</Text>
                                        <View style={styles.suggestionsGrid}>
                                            {suggestedQuestions.map((question, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={styles.suggestionButton}
                                                    onPress={() => handleQuickQuestion(question)}
                                                    disabled={isLoading}
                                                >
                                                    <Text style={styles.suggestionText}>{question}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </>
                                )}
                            </View>
                        }
                        onLayout={() => {
                            if (flatListRef.current) {
                                flatListRef.current.scrollToEnd({ animated: false });
                            }
                        }}
                        onContentSizeChange={() => {
                            if (flatListRef.current) {
                                flatListRef.current.scrollToEnd({ animated: true });
                            }
                        }}
                        keyboardShouldPersistTaps="handled"
                    />
                    {attachments.length > 0 && (
                        <View style={styles.attachmentsPreview}>
                            {attachments.map(renderAttachment)}
                        </View>
                    )}

                    <View style={[
                        styles.inputContainer,
                        {
                            paddingBottom: insets.bottom > 0 ? insets.bottom : Platform.OS === 'ios' ? 20 : 10,
                        }
                    ]}>
                        <TouchableOpacity
                            style={styles.attachButton}
                            onPress={() => setShowAttachmentOptions(true)}
                        >
                            <Ionicons name="attach" size={24} color="#00afa1ff" />
                        </TouchableOpacity>

                        <TextInput
                            style={styles.textInput}
                            placeholder="Type your issue here..."
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                            onSubmitEditing={handleSendMessage}
                            blurOnSubmit={false}
                        />

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!inputText.trim() && attachments.length === 0 || isLoading) && styles.sendButtonDisabled
                            ]}
                            onPress={handleSendMessage}
                            disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            <Modal
                visible={showAttachmentOptions}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAttachmentOptions(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowAttachmentOptions(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Attachment Type</Text>

                        <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
                            <Ionicons name="image" size={24} color="#34C759" />
                            <Text style={styles.modalOptionText}>Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalOption} onPress={pickVideo}>
                            <Ionicons name="videocam" size={24} color="#007AFF" />
                            <Text style={styles.modalOptionText}>Video</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalOption} onPress={pickDocument}>
                            <Ionicons name="document" size={24} color="#FF9500" />
                            <Text style={styles.modalOptionText}>File</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setShowAttachmentOptions(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000ff',
    },

    keyboardAvoid: {
        flex: 1,
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },

    headerContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: scaleSize(16),
        paddingTop: Platform.OS === 'ios' ? scaleSize(16) : scaleSize(12),
        paddingBottom: scaleSize(12),
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? scaleSize(20) : scaleSize(16),
        left: scaleSize(16),
        zIndex: 10,
        padding: scaleSize(8),
    },
    headerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: scaleSize(6),
    },
    logo: {
        width: scaleSize(32),
        height: scaleSize(32),
        marginRight: scaleSize(8),
    },
    headerTitle: {
        fontSize: scaleSize(18),
        fontWeight: 'bold',
        color: '#000',
        letterSpacing: scaleSize(0.5),
    },
    headerSubtitle: {
        fontSize: scaleSize(12),
        color: '#666',
        textAlign: 'center',
        lineHeight: scaleSize(16),
    },

    chatList: {
        flex: 1,
    },
    chatContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        flexGrow: 1,
    },
    messageContainer: {
        marginBottom: 16,
        flexDirection: 'row',
    },
    userMessage: {
        justifyContent: 'flex-end',
    },
    botMessage: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    userBubble: {
        backgroundColor: '#00afa1ff',
        borderBottomRightRadius: 4,
    },
    botBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    userMessageText: {
        color: '#fff',
    },
    botMessageText: {
        color: '#333',
    },
    messageAttachments: {
        marginTop: 8,
        gap: 8,
    },
    sentAttachment: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    sentAttachmentImage: {
        width: 150,
        height: 100,
    },
    sentFileAttachment: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        gap: 8,
    },
    sentFileName: {
        fontSize: 12,
        flex: 1,
    },
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    timestamp: {
        fontSize: 10,
    },
    userTimestamp: {
        color: 'rgba(255,255,255,0.7)',
    },
    botTimestamp: {
        color: 'rgba(0,0,0,0.5)',
    },
    seenText: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.7)',
        fontStyle: 'italic',
        marginLeft: 8,
    },
    suggestionsContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    loadingContainer: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    suggestionsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
    },
    suggestionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    suggestionButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#00afa1ff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    suggestionText: {
        fontSize: 12,
        color: '#00afa1ff',
        fontWeight: '500',
    },
    attachmentsPreview: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxHeight: 200,
    },
    attachmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 8,
        position: 'relative',
    },
    attachmentImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    fileAttachment: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    fileSize: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    removeAttachmentButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 2,
    },
    inputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        alignItems: 'center',
    },
    attachButton: {
        padding: 8,
        marginRight: 4,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 12 : 10,
        fontSize: 14,
        maxHeight: 100,
        marginRight: 8,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    sendButton: {
        backgroundColor: '#00afa1ff',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    sendButtonDisabled: {
        backgroundColor: '#cccccc',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 30,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 15,
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    modalCancel: {
        marginTop: 20,
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
    },
    modalCancelText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
});

export default AddTicket;