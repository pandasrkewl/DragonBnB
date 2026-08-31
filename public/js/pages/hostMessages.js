import { createNavbar } from "../components/navbar.js";
import { createElement } from "../reusable/functions.js";
import {
  createConversationList,
  createMessageBubble,
} from "../components/messagesUI.js";
import { createActiveThread } from "../components/activeThreadUI.js";
import {
  getConversations,
  getConversation,
  sendMessage,
} from "../services/messageService.js";

const navBarContainer = document.getElementById("navbar-container");
const sidebarContainer = document.getElementById("conversations-sidebar");
const threadContainer = document.getElementById("active-thread-container");

let currentUser = null;
let activeConversationId = null;
let socket = null;
const SOCKET_SERVER_URL = "https://dragonbnb-socket.onrender.com";

async function init() {
  try {
    const response = await fetch("/api/me");
    if (!response.ok) throw new Error("Unauthorized");
    currentUser = await response.json();

    if (!currentUser || !currentUser.host) {
      window.location.href = "/";
      return;
    }

    const navElement = createNavbar({
      userMode: "host",
      isRegisteredHost: currentUser.host,
      activeHostTab: 3,
    });
    navBarContainer.appendChild(navElement);
  } catch (err) {
    window.location.href = "/";
    return;
  }

  if (!window.io) {
    console.error("Socket.IO client failed to load");
    return;
  }

  socket = io(SOCKET_SERVER_URL);

  socket.on("receiveMessage", (newMessage) => {
    if (newMessage.conversation_id === activeConversationId) {
      appendMessageToThread(newMessage);
    } else {
      loadSidebar();
    }
  });

  await loadSidebar();

  const params = new URLSearchParams(window.location.search);
  const convoId = params.get("convoId");
  if (convoId) {
    loadConversation(convoId);
  }
}

async function loadSidebar() {
  const conversations = await getConversations();

  const backButton = createElement("button", { className: "back-btn" }, [
    createElement("img", {
      src: "/assets/icons/back.svg",
      alt: "Back",
    }),
  ]);

  backButton.addEventListener("click", () => {
    window.location.href = "/host/today.html";
  });

  const header = createElement("div", { className: "sidebar-header" }, [
    backButton,
    createElement("h2", { textContent: "Past conversations" }),
  ]);

  const listUI = createConversationList(
    conversations,
    activeConversationId,
    loadConversation,
  );

  sidebarContainer.replaceChildren(header, listUI);
}

async function loadConversation(convoId) {
  activeConversationId = convoId;

  await loadSidebar();

  const data = await getConversation(convoId);
  if (!data) return;

  const { conversation: activeConvo, messages } = data;

  socket.emit("joinRoom", convoId);

  const { headerUI, threadBody, messagesArea } = createActiveThread(
    activeConvo,
    messages,
    currentUser,
    async (text, msgArea) => {
      const tempMsg = {
        sender_id: currentUser.id,
        message: text,
        created_at: new Date().toISOString(),
      };

      msgArea.appendChild(createMessageBubble(tempMsg, currentUser.id));
      msgArea.scrollTop = msgArea.scrollHeight;

      const responseData = await sendMessage(convoId, text);

      if (responseData && responseData.message) {
        socket.emit("sendMessage", responseData.message);
      }
    },
    () => loadConversation(convoId),
  );

  threadContainer.replaceChildren(headerUI, threadBody);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

function appendMessageToThread(message) {
  const messagesArea = document.querySelector(".messages-scroll-area");
  if (messagesArea) {
    messagesArea.appendChild(createMessageBubble(message, currentUser.id));
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }
}

init();
