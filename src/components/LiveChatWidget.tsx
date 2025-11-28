import { useEffect } from "react";

export const LiveChatWidget = () => {
  useEffect(() => {
    // Crisp Chat Integration
    // @ts-ignore
    window.$crisp = [];
    // @ts-ignore
    window.CRISP_WEBSITE_ID = "YOUR_CRISP_WEBSITE_ID"; // Replace with actual Crisp ID

    (function() {
      const d = document;
      const s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = true;
      d.getElementsByTagName("head")[0].appendChild(s);
    })();

    // Configure Crisp to route to WhatsApp
    // @ts-ignore
    window.$crisp.push(["on", "chat:initiated", function() {
      // Route to WhatsApp agents
      const whatsappNumber = "+2348000000000"; // Replace with actual WhatsApp number
      const message = encodeURIComponent("Hello! I need support with Betfuz.");
      // @ts-ignore
      window.$crisp.push(["do", "message:send", ["text", 
        `Our WhatsApp agents are available 24/7. Click here to chat: https://wa.me/${whatsappNumber}?text=${message}`
      ]]);
    }]);

    return () => {
      // Cleanup
      const script = document.querySelector('script[src="https://client.crisp.chat/l.js"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return null; // Widget is injected by script
};
