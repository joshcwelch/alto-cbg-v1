import type { ButtonHTMLAttributes } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  iconSrc: string;
  label: string;
};

const IconButton = ({ iconSrc, label, className = "", ...props }: IconButtonProps) => {
  return (
    <button className={`ui-icon-button ${className}`.trim()} aria-label={label} {...props}>
      <img src={iconSrc} alt="" />
      <span className="sr-only">{label}</span>
    </button>
  );
};

export default IconButton;
