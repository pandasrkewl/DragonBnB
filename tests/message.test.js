const {
  getUserConversations,
  getConversationById,
  getConversationMessages,
  createOrGetConversation,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  getUnreadCountForConversation,
  deleteConversation,
} = require("../scripts/queryDb");

const pool = require("../db");

let testConversationId;

test("creates a new conversation or gets an existing one", async () => {
  testConversationId = await createOrGetConversation(1, 2, 1);

  expect(testConversationId).toBeDefined();
  expect(typeof testConversationId).toBe("number");
});

test("gets all conversations for a specific user", async () => {
  const conversations = await getUserConversations(1);

  expect(Array.isArray(conversations)).toBe(true);
  expect(conversations.length).toBeGreaterThan(0);
});

test("gets a specific conversation by its id", async () => {
  const conversation = await getConversationById(testConversationId);

  expect(conversation).toBeDefined();
  expect(conversation.id).toBe(testConversationId);
  expect(conversation.host_id).toBeDefined();
  expect(conversation.guest_id).toBeDefined();
});

test("returns falsy for a nonexistent conversation id", async () => {
  const conversation = await getConversationById(999999);

  expect(conversation).toBeFalsy();
});

test("gets messages for a specific conversation", async () => {
  const messages = await getConversationMessages(testConversationId, 50, 0);

  expect(Array.isArray(messages)).toBe(true);
  expect(messages.length).toBeGreaterThan(0);
});

test("returns empty array of messages for a nonexistent conversation", async () => {
  const messages = await getConversationMessages(999999);

  expect(messages).toEqual([]);
});

test("gets unread message count for a specific conversation", async () => {
  const unreadCount = await getUnreadCountForConversation(
    testConversationId,
    1,
  );

  expect(typeof unreadCount).toBe("number");
  expect(unreadCount).toBeGreaterThanOrEqual(1);
});

test("gets total unread message count for a user across all conversations", async () => {
  const totalUnread = await getUnreadMessageCount(1);

  expect(typeof totalUnread).toBe("number");
  expect(totalUnread).toBeGreaterThanOrEqual(0);
});

test("marks messages as read", async () => {
  const readMessages = await markMessagesAsRead(testConversationId, 1);

  expect(Array.isArray(readMessages)).toBe(true);

  const newUnreadCount = await getUnreadCountForConversation(
    testConversationId,
    1,
  );
  expect(newUnreadCount).toBe(0);
});

test("deletes a conversation successfully", async () => {
  const dummyConvoId = await createOrGetConversation(4, 5, 5);

  const isDeleted = await deleteConversation(dummyConvoId);
  expect(isDeleted).toBe(true);

  const checkDeleted = await getConversationById(dummyConvoId);
  expect(checkDeleted).toBeFalsy();
});

afterAll(async () => {
  await pool.end();
});
