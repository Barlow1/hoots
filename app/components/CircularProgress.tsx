import React from "react";

interface CircularProgressProps {
  value: number;
  min?: number;
  max?: number;
  children?: React.ReactNode;
}

function valueToPercent(value: number, min: number, max: number) {
  return ((value - min) * 100) / (max - min);
}

export default function CircularProgress(props: CircularProgressProps) {
  const { min = 0, max = 100, value, children } = props;
  const progress = { percent: valueToPercent(value, min, max) };
  const determinant = (progress.percent ?? 0) * 2.64;

  const strokeDasharray =
    determinant == null ? undefined : `${determinant} ${264 - determinant}`;
  return (
    <div
      style={{
        display: "inline-block",
        position: "relative",
        verticalAlign: "middle",
        fontSize: "150px",
      }}
    >
      <svg viewBox="0 0 100 100" className="w-[150px] h-[150px]">
        <circle
          cx="50"
          cy="50"
          r="42"
          strokeWidth="10px"
          className="background-progress"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          strokeWidth="10px"
          strokeDashoffset="66"
          strokeDasharray={strokeDasharray}
          className="inner-progress"
          opacity={value === 0 ? 0 : undefined}
        />
      </svg>
      {children}
    </div>
  );
}

export function CircularProgressLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: "0.24em",
        top: "50%",
        left: "50%",
        width: "100%",
        textAlign: "center",
        position: "absolute",
        transform: "translate(-50%, -50%)",
      }}
    >
      {children}
    </div>
  );
}
