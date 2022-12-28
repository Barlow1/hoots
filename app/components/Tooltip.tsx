import * as React from "react";
import { mergeRefs } from "react-merge-refs";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react-dom-interactions";
import type { Placement } from "@floating-ui/react-dom-interactions";
import { useRef } from "react";

interface TooltipOptions {
  initialOpen?: boolean;
  placement?: Placement;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isAnimated?: boolean;
}

export function useTooltip({
  initialOpen = false,
  placement = "top",
  isAnimated = false,
  isOpen: controlledOpen,
  onOpenChange: setControlledOpen,
}: TooltipOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);

  const arrowRef = useRef<HTMLDivElement>(null);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: (reference, floating, update) =>
      // IMPORTANT: Make sure the cleanup function is returned!
      autoUpdate(reference, floating, update, {
        animationFrame: isAnimated,
      }),
    middleware: [offset(7), flip(), shift(), arrow({ element: arrowRef })],
  });

  const { context } = data;

  const hover = useHover(context, {
    move: false,
    enabled: controlledOpen == null,
  });
  const focus = useFocus(context, {
    enabled: controlledOpen == null,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const interactions = useInteractions([hover, focus, dismiss, role]);

  return React.useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      arrowRef,
    }),
    [open, setOpen, interactions, data, arrowRef]
  );
}

type ContextType = ReturnType<typeof useTooltip> | null;

const TooltipContext = React.createContext<ContextType>(null);

export const useTooltipState = () => {
  const context = React.useContext(TooltipContext);

  if (context == null) {
    throw new Error("Tooltip components must be wrapped in <Tooltip />");
  }

  return context;
};

export function Tooltip({
  children,
  ...options
}: { children: React.ReactNode } & TooltipOptions) {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const tooltip = useTooltip(options);
  return (
    <TooltipContext.Provider value={tooltip}>
      {children}
    </TooltipContext.Provider>
  );
}

export const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLProps<HTMLElement> & { asChild?: boolean }
>(({ children, asChild = false, ...props }, propRef) => {
  const state = useTooltipState();

  const childrenRef = (children as any).ref;
  const ref = React.useMemo(
    () => mergeRefs([state.reference, propRef, childrenRef]),
    [state.reference, propRef, childrenRef]
  );

  // `asChild` allows the user to pass any element as the anchor
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children,
      state.getReferenceProps({
        ref,
        ...props,
        ...children.props,
        "data-state": state.open ? "open" : "closed",
      })
    );
  }

  return (
    <div
      ref={ref}
      // The user can style the trigger based on the state
      data-state={state.open ? "open" : "closed"}
      {...state.getReferenceProps(props)}
    >
      {children}
    </div>
  );
});

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>((props, propRef) => {
  const state = useTooltipState();
  const { arrow: { x: arrowX, y: arrowY } = {} } = state.middlewareData;

  const ref = React.useMemo(
    () => mergeRefs([state.floating, propRef]),
    [state.floating, propRef]
  );

  const staticSide: string = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[state.placement.split("-")[0]] as string;

  return (
    <FloatingPortal id="hoots-portal">
      {state.open && (
        <div
          ref={ref}
          style={{
            position: state.strategy,
            top: state.y ?? 0,
            left: state.x ?? 0,
            visibility: state.x == null ? "hidden" : "visible",
            ...props.style,
          }}
          className="absolute whitespace-nowrap rounded bg-black dark:bg-white px-2 py-1 text-white dark:text-gray-700 z-50"
          {...state.getFloatingProps(props)}
        >
          <div
            style={{
              position: "absolute",
              width: "8px",
              height: "8px",
              transform: "rotate(45deg)",
              left: arrowX != null ? `${arrowX}px` : "",
              top: arrowY != null ? `${arrowY}px` : "",
              right: "",
              bottom: "",
              [staticSide]: "-4px",
            }}
            id="arrow"
            className="bg-black dark:bg-white text-white dark:text-gray-700 z-50"
            ref={state.arrowRef}
          />
          {props.children}
        </div>
      )}
    </FloatingPortal>
  );
});
