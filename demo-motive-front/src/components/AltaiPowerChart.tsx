import { useEffect, useRef, useState } from 'react';

const CHART_WIDTH = 1030;
const CHART_HEIGHT = 150;
const MAX_DATA_POINTS = 120;
const LINE_COLOR = '#00000075';
const ALTAI_COLOR = '#46CDED';
const Y_TICK_COUNT = 3;

const AltaiPowerChart: React.FC<any> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!props.altaiData) return;

    const chunk: any[] = [];

    // get altai power data in bytes
    props.altaiData.data.arrayBuffer().then((data: any) => {
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

  }, [props.altaiData]);

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

    ctx.strokeStyle = ALTAI_COLOR;
    ctx.stroke();

    drawYAxis(canvas, ctx, maxDataValue);
    drawXAxis(canvas, ctx);

  }, [data]);

  const drawYAxis = (canvas: any, ctx: any, maxYValue: any) => {

    // Draw Y-axis
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, canvas.height-5);
    ctx.strokeStyle = LINE_COLOR;
    ctx.stroke();

    // Draw Y-axis ticks and signatures
    const tickCount = Y_TICK_COUNT; // Number of ticks on Y-axis
    const step = maxYValue / tickCount; // Calculate step size

    for (let i = 1; i <= tickCount; i++) {
      const yValue = step * i;
      const yPos = canvas.height - (yValue / maxYValue) * (canvas.height - 20); // Scale position
      //const yiPos = canvas.height - (i / maxYValue) * (canvas.height - 20);
      ctx.font = '13.52px Involve';
      ctx.fillStyle = 'black';
      ctx.fillText(yValue.toFixed(0), 20, yPos); // Add label
      ctx.beginPath();
      ctx.moveTo(45, yPos);
      ctx.lineTo(50, yPos);
      ctx.stroke();
    }
  }

  const drawXAxis = (canvas: any, ctx: any) => {
    ctx.beginPath();
    ctx.moveTo(50, canvas.height-5);
    
    ctx.lineTo(CHART_WIDTH-9, canvas.height-5);
    //ctx.lineWidth = 2;
    ctx.strokeStyle = LINE_COLOR;
    ctx.stroke();
    drawArrow(ctx, canvas.width-50, canvas.height-5, canvas.width, canvas.height-5);
  }

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLength = 10; // Length of arrow head
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    // Draw arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fillStyle = LINE_COLOR;
    ctx.fill();
  };

  return <canvas ref={canvasRef} width={CHART_WIDTH} height={CHART_HEIGHT} />;
}

export default AltaiPowerChart;