import { useEffect } from "react";
import type { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ui-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Dialog"}
        onClick={(event) => event.stopPropagation()}
      >
        <img className="ui-modal__frame" src="/ui/global/modal_frame.png" alt="" />
        <div className="ui-modal__content">
          {title ? <h2 className="ui-modal__title">{title}</h2> : null}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
