import { useEffect, useId, useMemo, useRef, useState, startTransition } from 'react';

const AudioChart: React.FC<any> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<any[]>([]);
  const maxDataPoints = 19200; // Total number of points (12 seconds at 25ms intervals)
  const [speechRange, setSpeechRange] = useState<any>();
  const [countSamples, setCountSamples] = useState<number>(0);
  const [lenSamplesToNextLine, setLenSamplesToNextLine] = useState<any>();
  const [step, setStep] = useState<any>();

  var count = 0;
  var check: any = null;

  useEffect(() => {
    if (props.audioData === null) return;

    const amplitude: any[] = [];

    if (typeof step === 'number') {
      setStep((prev: any) => prev - 1);
    }
    
    props.audioData.data.arrayBuffer().then((dataAudio: any) => {
      const byteArray = new Uint8Array(dataAudio);

      for (let i = 0; i < byteArray.length; i += 40) { // 40 точек на интервал 25мс вместо 400
        // Чтение 32-битных значений и нормализация
        const sample = new Float32Array(byteArray.buffer, i, 1)[0];
        amplitude.push(sample);
      }

      if (speechRange && Math.ceil(speechRange.timestamp) === Math.ceil(Date.now() / 1000)) {
        setData(prevData => !prevData.slice(-120).includes('lineLeft') ? [...prevData.slice(1), 'lineLeft'] : prevData);
        setSpeechRange(undefined);
        setStep(Math.round(speechRange.length_samples / 400));
      }

      setData(prevData => {
        const updatedData = [...prevData, ...amplitude];
        if (updatedData.length > maxDataPoints) {
            updatedData.splice(0, 40);
        }
        return updatedData;
      });
    });
  }, [props.audioData, speechRange]);

  useEffect(() => {
    if (step === 0) {
      setData(prevData => [...prevData.slice(1), 'lineRight']);
      setStep(undefined);
    }
  }, [step]);

  useEffect(() => {
    setSpeechRange(props.speechRange)
  }, [props.speechRange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height); // Clear the canvas
    ctx.beginPath();
    
    const sliceWidth = width / maxDataPoints; // Width of each slice

    data.forEach((value, index) => {
      const x = index * sliceWidth; // Calculate x position from left
      const y = (value + 1) * (height / 2); // Scale value to fit in canvas height
      ctx.lineTo(x, y);
    });

    ctx.strokeStyle = '#3498db';
    ctx.stroke();

    drawVerticalLines(canvas, ctx);
    //drawTextBox(canvas, ctx)
    //drawXAxis(canvas, ctx);

  }, [data, props.speechRange]);

  function drawVerticalLines(canvas: any, ctx: any) {
    if (!data) return
    const indexes = data.map((dp, ind) => { if (dp === 'lineLeft' || dp === 'lineRight') return ind}).filter(x => !!x);
    //console.log(indexes)
    if (!indexes) return;
    indexes.forEach(index => {
      if (index && index !== -1) {
        const x = (index * (canvas.width / maxDataPoints));
        ctx.beginPath();
        ctx.moveTo(x, 0); // Start from top of canvas
        ctx.lineTo(x, canvas.height); // End at bottom of canvas
        ctx.setLineDash([5, 5]); 
        ctx.strokeStyle = 'red'; // Color for vertical lines
        //ctx.lineWidth = 2; // Width of vertical lines
        ctx.stroke();
        ctx.setLineDash([]);
        //ctx.closePath();
      }
    });
  }

  function drawTextBox(canvas: any, ctx: any) {
    const indexes = data.map((dp, ind) => {
      if (dp === 'lineLeft') {
        return {ind: ind, pos: 'left'};
      }
      if (dp === 'lineRight') {
        return {ind: ind, pos: 'right'};
      }
    }).filter(x => !!x);
    if (!indexes) return;
    indexes.forEach(index => {

      if (!index) return;
      const xStart = index.ind * canvas.width / maxDataPoints; // Starting X position for the text box
      const xEnd = 250;   // Ending X position for the text box
      const yPosition = 0; // Y position for the text box

      const width = xEnd - xStart;
      const height = 50;
      
      // Draw rounded rectangle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Background color with some transparency
      ctx.beginPath();
      ctx.moveTo(xStart + 10, yPosition); // Move to start point with corner radius
      ctx.lineTo(xEnd - 10, yPosition); 
      ctx.quadraticCurveTo(xEnd, yPosition, xEnd, yPosition + 10); 
      ctx.lineTo(xEnd, yPosition + height - 10);
      ctx.quadraticCurveTo(xEnd, yPosition + height, xEnd - 10, yPosition + height);
      ctx.lineTo(xStart + 10, yPosition + height);
      ctx.quadraticCurveTo(xStart, yPosition + height, xStart, yPosition + height - 10);
      ctx.lineTo(xStart, yPosition + 10);
      ctx.quadraticCurveTo(xStart, yPosition, xStart + 10, yPosition);
      ctx.closePath();
      
      ctx.fill(); // Fill the rectangle

      // Draw text inside the rectangle
      ctx.fillStyle = 'black'; // Text color
      ctx.font = '20px Arial'; // Font style and size
      ctx.textAlign = 'center'; 
      ctx.fillText('Waveform Data', (xStart + xEnd) / 2, yPosition + height / 2 + 7); // Adjust Y position for centering text
    });
  }

  function drawXAxis(canvas: any, ctx: any) {
    const tickCount = maxDataPoints / 1600; // Number of ticks on the x-axis

    for (let i: number = 0; i <= tickCount; i++) {
      const x = (i * (canvas.width / tickCount)); // Calculate x position for each tick
      
      // Draw tick mark
      ctx.beginPath();
      ctx.moveTo(x + 2, canvas.height - 10); // Start at bottom of canvas for tick mark
      ctx.lineTo(x+ 2, canvas.height);       // Tick mark length is 10 pixels
      ctx.strokeStyle = 'black';          // Color of tick marks
      //ctx.lineWidth = 2;
      ctx.stroke();

      // Draw labels below each tick mark
      
      if (i <= tickCount) { 
          const labelValue = i * (maxDataPoints / tickCount / 1600); 
          ctx.fillStyle = 'black'; 
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(labelValue.toFixed(1), x, canvas.height - 15); // Position label slightly below tick mark
      }
      
    }

    // Draw signature below the x-axis centered on the canvas width.
    //ctx.fillStyle = 'black';
    //ctx.font = '16px Arial';
    //ctx.textAlign = 'center';
    //ctx.fillText('Time (arbitrary units)', canvas.width / 2, canvas.height - 30); 
  }

  return <canvas ref={canvasRef} width={1500} height={300} />;
};


export default AudioChart;