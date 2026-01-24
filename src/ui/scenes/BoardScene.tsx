import { useEffect, useState } from "react";
import BoardScreen from "../screens/BoardScreen";
import Modal from "../components/common/Modal";
import { usePlayFlowStore } from "../state/usePlayFlowStore";
import { useUIStore } from "../state/useUIStore";

const BoardScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const resetPlayFlow = usePlayFlowStore((state) => state.resetAll);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const shell = document.querySelector(".ui-shell");
    const layer = document.querySelector(".ui-layer");
    const safeFrame = document.querySelector(".ui-safe-frame");
    shell?.classList.add("ui-shell--board");
    layer?.classList.add("ui-layer--board");
    safeFrame?.classList.add("ui-safe-frame--board");

    return () => {
      shell?.classList.remove("ui-shell--board");
      layer?.classList.remove("ui-layer--board");
      safeFrame?.classList.remove("ui-safe-frame--board");
    };
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (isConfirmOpen) {
        setIsConfirmOpen(false);
        return;
      }
      setIsMenuOpen((open) => !open);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isConfirmOpen]);

  useEffect(() => {
    const handleOpen = () => {
      setIsConfirmOpen(false);
      setIsMenuOpen(true);
    };

    window.addEventListener("board-menu-open", handleOpen);
    return () => window.removeEventListener("board-menu-open", handleOpen);
  }, []);

  const handleExit = () => {
    resetPlayFlow();
    setIsConfirmOpen(false);
    setIsMenuOpen(false);
    setScene("MAIN_MENU");
  };

  return (
    <div className="board-scene">
      <BoardScreen />
      {isMenuOpen ? (
        <div className="board-menu" role="dialog" aria-modal="true" aria-label="Game menu">
          <div className="board-menu__panel">
            <div className="board-menu__title">Game Menu</div>
            <div className="board-menu__actions">
              <button type="button" className="ui-button ui-button--secondary" onClick={() => setIsMenuOpen(false)}>
                Resume
              </button>
              <button type="button" className="ui-button ui-button--primary" onClick={() => setIsConfirmOpen(true)}>
                Exit to Main Menu
              </button>
            </div>
            <div className="board-menu__hint">Press Esc to close.</div>
          </div>
        </div>
      ) : null}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Leave match?"
      >
        <p>Are you sure you want to leave and return to the main menu?</p>
        <div className="ui-modal__actions">
          <button type="button" className="ui-button ui-button--ghost" onClick={() => setIsConfirmOpen(false)}>
            Stay
          </button>
          <button type="button" className="ui-button ui-button--primary" onClick={handleExit}>
            Leave
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BoardScene;
