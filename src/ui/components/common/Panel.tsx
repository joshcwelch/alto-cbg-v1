import type { ReactNode } from "react";

type PanelProps = {
  title?: string;
  frameSrc?: string;
  className?: string;
  children: ReactNode;
};

const Panel = ({ title, frameSrc, className = "", children }: PanelProps) => {
  return (
    <div className={`ui-panel ${className}`.trim()}>
      {frameSrc ? <img className="ui-panel__frame ui-frame ui-frame--multiply" src={frameSrc} alt="" /> : null}
      <div className="ui-panel__content">
        {title ? <h2 className="ui-panel__title">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
};

export default Panel;
