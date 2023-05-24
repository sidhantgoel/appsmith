import React, { forwardRef } from "react";
import { mergeProps } from "@react-aria/utils";
import { useButton } from "@react-aria/button";
import { useFocusRing } from "@react-aria/focus";
import { useHover } from "@react-aria/interactions";
import type { AriaButtonProps as SpectrumAriaBaseButtonProps } from "@react-types/button";

export interface ButtonProps extends SpectrumAriaBaseButtonProps {
  className?: string;
  visuallyDisabled?: boolean;
}

export type ButtonRef = React.Ref<HTMLButtonElement>;
type ButtonRefObject = React.RefObject<HTMLButtonElement>;

export const Button = forwardRef((props: ButtonProps, ref: ButtonRef) => {
  const { autoFocus, children, className, isDisabled, visuallyDisabled } =
    props;
  let computedProps = props;
  // Note: this is a workaround for making button more accessible
  if (visuallyDisabled) {
    computedProps = {
      ...props,
      isDisabled: false,
      onPress: undefined,
    };
  }
  const { buttonProps, isPressed } = useButton(
    computedProps,
    ref as ButtonRefObject,
  );
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { focusProps, isFocusVisible } = useFocusRing({ autoFocus });

  return (
    <button
      {...mergeProps(buttonProps, hoverProps, focusProps)}
      aria-disabled={visuallyDisabled ? true : undefined}
      className={className}
      data-active={isPressed ? "" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      data-focused={isFocusVisible ? "" : undefined}
      data-hovered={isHovered ? "" : undefined}
      disabled={visuallyDisabled ? undefined : isDisabled}
      ref={ref}
    >
      {children}
    </button>
  );
});
