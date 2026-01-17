import { useEffect, useMemo, useRef, useState } from "react";
import { useAstraStore } from "../state/useAstraStore";

type Topic = {
  label: string;
  body: string;
};

const AstraModal = () => {
  const close = useAstraStore((state) => state.close);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
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
      <div className="astra-modal__header">
        <div
          className="astra-modal__portrait"
          aria-hidden="true"
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "1px solid rgba(220, 190, 130, 0.7)",
            background:
              "radial-gradient(circle at 30% 30%, rgba(130, 190, 240, 0.7), rgba(40, 30, 25, 0.9))",
            boxShadow: "0 10px 18px rgba(0, 0, 0, 0.45)",
          }}
        />
        <div className="astra-modal__title">
          Greetings! How can I assist you today?
        </div>
      </div>
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
      {selectedTopic ? (
        <div className="astra-modal__body">
          <strong>{selectedTopic.label}</strong>
          <p>{selectedTopic.body}</p>
        </div>
      ) : null}
    </div>
  );
};

export default AstraModal;
