import React, { useEffect, useRef } from "react";

interface CanvasCircularProps {
  size: number;
  strokeWidth: number;
  percentage: number;
  color?: string;
}

const CanvasCircular: React.FC<CanvasCircularProps> = ({
  size,
  strokeWidth,
  percentage,
  color,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (context && canvas) {
      const ratio = 2;
      // window.devicePixelRatio

      canvas.width = size * ratio;
      canvas.height = size * ratio;
      context.scale(ratio, ratio);

      const radius = (size - strokeWidth) / 2;
      const centerX = canvas.width / 4;
      const centerY = canvas.height / 4;
      const progress = (percentage / 100) * 2 * -Math.PI;

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background circle
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, 2 * Math.PI, true);
      context.strokeStyle = color ? color : "#3498db";

      context.lineWidth = strokeWidth;
      context.stroke();

      // Draw progress arc
      context.beginPath();
      context.arc(
        centerX,
        centerY,
        radius,
        -Math.PI / 2,
        progress - Math.PI / 2,
        true
      );
      context.strokeStyle = "#f0f0f0";

      context.stroke();
    }
  }, [percentage]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};

export default CanvasCircular;
