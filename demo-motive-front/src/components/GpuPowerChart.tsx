import { useEffect, useRef, useState } from 'react';


const CHART_WIDTH = 1030;
const CHART_HEIGHT = 200;
const MAX_DATA_POINTS = 120;

const GpuPowerChart: React.FC<any> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (props.gpuData === null) return;

    const chunk: any[] = [];

    props.gpuData.data.arrayBuffer().then((data: any) => {
      const byteArray = new Uint8Array(data);

      for (let i = 0; i < byteArray.length; i += 4) {
        const power = new Float32Array(byteArray.buffer, i, 1)[0];
        chunk.push(power);
      }

      setData(prevData => {
        const updatedData = [...prevData, ...chunk];
        if (updatedData.length > MAX_DATA_POINTS) {
          updatedData.splice(0, 1);
        }
        return updatedData;
      });
    });

  }, [props.gpuData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    
    const sliceWidth = (width - 50) / MAX_DATA_POINTS;
    const maxDataValue = Math.max(...data);

    data.forEach((value, index) => {
      const x = index * sliceWidth + 50; // Calculate x position from left + Offset for Y-axis at x=50
      //const y = value * scaleFactor ; //(value + 1) * (height / 2); // Scale value to fit in canvas height
      const y = height - (value / maxDataValue) * (height - 20);
      ctx.lineTo(x, y);
    });

    ctx.strokeStyle = 'green';
    ctx.stroke();

    drawYAxis(canvas, ctx, maxDataValue);

  }, [data]);

  const drawYAxis = (canvas: any, ctx: any, maxYValue: any) => {

    // Draw Y-axis
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Draw Y-axis ticks and signatures
    const tickCount = 10; // Number of ticks on Y-axis
    const step = maxYValue / tickCount; // Calculate step size

    for (let i = 0; i <= tickCount; i++) {
      const yValue = step * i;
      const yPos = canvas.height - (yValue / maxYValue) * (canvas.height - 20); // Scale position
      ctx.fillText(yValue.toFixed(2), 20, yPos); // Add label
      ctx.beginPath();
      ctx.moveTo(45, yPos);
      ctx.lineTo(50, yPos);
      ctx.stroke();
    }
  }

  return <canvas ref={canvasRef} width={CHART_WIDTH} height={CHART_HEIGHT} />;
}

export default GpuPowerChart;