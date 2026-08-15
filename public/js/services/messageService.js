export async function getConversations() {
    try {
        const response = await fetch('/api/conversations');
        if (!response.ok) {
            throw new Error('Failed to fetch conversations');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
    }
}

export async function getConversation(conversationId, limit = 50, offset = 0) {
    try {
        const response = await fetch(
            `/api/conversations/${conversationId}?limit=${limit}&offset=${offset}`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch conversation');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return null;
    }
}

export async function sendMessage(conversationId, content) {
    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ conversationId, content }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending message:', error);
        return null;
    }
}

export async function createOrGetConversation(hostId, guestId, propertyId) {
    try {
        const response = await fetch('/api/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ hostId, guestId, propertyId }),
        });

        if (!response.ok) {
            throw new Error('Failed to create conversation');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating conversation:', error);
        return null;
    }
}

export async function markConversationAsRead(conversationId) {
    try {
        const response = await fetch(
            `/api/conversations/${conversationId}/read`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to mark as read');
        }

        return await response.json();
    } catch (error) {
        console.error('Error marking as read:', error);
        return null;
    }
}

export async function getUnreadMessageCount() {
    try {
        const response = await fetch('/api/me/unread-messages');
        if (!response.ok) {
            throw new Error('Failed to fetch unread count');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return { unreadCount: 0 };
    }
}

export async function contactHost(propertyId, message) {
    try {
        const response = await fetch(
            `/api/properties/${propertyId}/contact-host`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to contact host');
        }

        return await response.json();
    } catch (error) {
        console.error('Error contacting host:', error);
        return null;
    }
}
