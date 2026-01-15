import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const Button = ({ variant = "primary", className = "", children, ...props }: ButtonProps) => {
  return (
    <button className={`ui-button ui-button--${variant} ${className}`.trim()} {...props}>
      <span className="ui-button__content">{children}</span>
    </button>
  );
};

export default Button;
