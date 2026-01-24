import { useEffect, useMemo, useRef, useState } from "react";
import { useAstraStore } from "../state/useAstraStore";
import ArtSlot from "../components/ArtSlot";

type Topic = {
  label: string;
  body: string;
};

const AstraModal = () => {
  const close = useAstraStore((state) => state.close);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [message, setMessage] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);

  const topics = useMemo<Topic[]>(
    () => [
      {
        label: "How do I create a deck?",
        body: "Deck creation lives in the Collection screen. We'll add a real walkthrough here soon.",
      },
      {
        label: "Explain card mechanics",
        body: "Cards have stats, abilities, and keywords. We'll expand this with full rules next.",
      },
      {
        label: "What are the daily quests?",
        body: "Daily quests refresh every 24 hours. We'll surface your current quests here soon.",
      },
    ],
    []
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;
      const modalEl = modalRef.current;
      if (!modalEl) return;
      const focusable = Array.from(
        modalEl.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const isShift = event.shiftKey;
      const active = document.activeElement;

      if (!isShift && active === last) {
        event.preventDefault();
        first.focus();
      }
      if (isShift && active === first) {
        event.preventDefault();
        last.focus();
      }
    };

    const focusFirst = () => {
      const modalEl = modalRef.current;
      if (!modalEl) return;
      const firstButton = modalEl.querySelector<HTMLElement>("button");
      firstButton?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    focusFirst();

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  return (
    <div className="astra-modal" role="dialog" aria-modal="true" ref={modalRef}>
      <div className="astra-modal__layout">
        <div className="astra-modal__stage">
          <div className="astra-modal__frameLayer">
            <ArtSlot assetKey="astraContextFrame" className="astra-modal__frameArt" alt="" />
          </div>
          <div className="astra-modal__contentLayer">
            <div className="astra-modal__contentBounds">
              {!selectedTopic ? (
                <div className="astra-modal__header">
                  <div className="astra-modal__title">
                    Greetings! How can I assist you today?
                  </div>
                </div>
              ) : null}
              {!selectedTopic ? (
                <div className="astra-buttons" role="list">
                  {topics.map((topic) => (
                    <button
                      key={topic.label}
                      type="button"
                      className="ui-button ui-button--primary"
                      onClick={() => setSelectedTopic(topic)}
                    >
                      {topic.label}
                    </button>
                  ))}
                  <button type="button" className="ui-button ui-button--ghost" onClick={close}>
                    Close
                  </button>
                </div>
              ) : null}
              {selectedTopic ? (
                <div className="astra-modal__body astra-chat">
                  <div className="astra-chat__panel">
                    <div className="astra-chat__bubble astra-chat__bubble--incoming">
                      {selectedTopic.body}
                    </div>
                    <div className="astra-chat__bubble astra-chat__bubble--outgoing">
                      {selectedTopic.label}
                    </div>
                    {/* TODO: Replace placeholder replies with GPT-backed guidance. */}
                    <form
                      className="astra-chat__input"
                      onSubmit={(event) => {
                        event.preventDefault();
                      }}
                    >
                      <button
                        type="button"
                        className="astra-chat__back"
                        onClick={() => setSelectedTopic(null)}
                        aria-label="Back to help topics"
                      >
                        <span aria-hidden="true">{"<-"}</span>
                      </button>
                      <input
                        type="text"
                        className="astra-chat__field"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        aria-label="Message Astra"
                      />
                      <button type="submit" className="astra-chat__send" aria-label="Send message">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path
                            d="M3 12l17-9-5.6 8H3zm11.4 4L20 21 3 12h11.4z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="astra-modal__portraitLayer">
            <ArtSlot assetKey="astraPortrait" className="astra-modal-portrait__art" alt="" fit="contain" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AstraModal;

