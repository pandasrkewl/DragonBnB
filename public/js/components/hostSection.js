import { createElement } from "../reusable/functions.js";
import { createOrGetConversation } from "../services/messageService.js";

export function createHostSection(property) {
  const hostContainer = createElement("div", {
    className: "host-section",
  });

  const hostImage = createElement("img", {
    className: "host-image",
    src: property.host_image_url,
    alt: `${property.host_first_name} ${property.host_last_name}`,
  });

  const hostInfo = createElement("div", {
    className: "host-info",
  });

  const hostName = createElement("p", {
    className: "host-name",
    textContent: `Hosted by ${property.host_first_name} ${property.host_last_name}`,
  });

  const messageHost = createElement("button", {
    className: "message-host",
    textContent: "Message",
  });

  messageHost.addEventListener("click", async () => {
    try {
      const userResponse = await fetch("/api/me");

      const currentUser = userResponse.ok ? await userResponse.json() : null;

      if (!currentUser || !currentUser.id) {
        const loginBtn = document.querySelector(".btn-login");
        if (loginBtn) {
          loginBtn.click();
        } else {
          console.error("You must be logged in to message a host.");
        }
        return;
      }

      const responseData = await createOrGetConversation(
        property.host_id,
        currentUser.id,
        property.id,
      );

      const targetConvoId =
        responseData?.conversationId || responseData?.conversation?.id;

      if (responseData?.success && targetConvoId) {
        window.location.href = `/messages?convoId=${targetConvoId}`;
      } else {
        console.error("Could not load conversation.");
      }
    } catch (error) {
      console.error("Error initiating message:", error);
    }
  });

  const hostDetails = createElement("p", {
    className: "host-details",
    textContent: "Host",
  });

  hostInfo.append(hostName, hostDetails);
  hostContainer.append(hostImage, hostInfo, messageHost);

  return hostContainer;
}
