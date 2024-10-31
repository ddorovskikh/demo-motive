import { useEffect, useId, useMemo, useRef, useState, startTransition } from 'react';
import { lightningChart } from '@lightningchart/lcjs';
import { useCanvas } from 'react-canvas-typescript';

/*
const Waveform: React.FC<{ data: Float32Array }> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [offset, setOffset] = useState(0); // Offset for moving the waveform

  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height); // Clear the canvas

      ctx.beginPath();
      const sliceWidth = (width * 1.0) / data.length; // Width of each slice
      let x = offset;

      for (let i = 0; i < data.length; i++) {
          const v = data[i] * 0.5; // Scale value to fit in canvas
          const y = (v + 1) * height / 2; // Convert to y coordinate
          ctx.lineTo(x, y);
          x += sliceWidth;
      }

      ctx.lineTo(width + offset, height / 2);
      ctx.strokeStyle = '#3498db';
      ctx.stroke();
  }, [data, offset]);

  useEffect(() => {
      const intervalId = setInterval(() => {
          setOffset((prevOffset) => (prevOffset - (800 / (4 * 1000 / 25))) % 800); // Move left over time
      }, 25); // Update every 25ms

      return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return <canvas ref={canvasRef} width={100} height={50} />;
};
*/

const AudioChart: React.FC<any> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<number[]>([]);
  const maxDataPoints = 6400; // Total number of points (4 seconds at 25ms intervals)

  useEffect(() => {
    if (props.audioData === null) return;
    //const interval = setInterval(() => {
        // Simulate receiving new data (replace this with actual data fetching)
        const amplitude: any[] = [];
        
        props.audioData.data.arrayBuffer().then((data: any) => {
          const byteArray = new Uint8Array(data);

          for (let i = 0; i < byteArray.length; i += 40) {
            // Чтение 32-битных значений и нормализация
            const sample = new Float32Array(byteArray.buffer, i, 1)[0]; // Чтение Float32
            amplitude.push(sample * 20);
            //setTime(+1);
          }
          setData(prevData => {
            const updatedData = [...prevData, ...amplitude];
            if (updatedData.length > maxDataPoints) {
                updatedData.splice(0, 40); // Remove the oldest point to maintain the length
            }
            return updatedData;
          })
          
          
        })
        /*
        const newDataPoint = Math.random() * 2 - 1; // Random value between -1 and 1
        setData(prevData => {
            const updatedData = [...prevData, newDataPoint];
            if (updatedData.length > maxDataPoints) {
                updatedData.shift(); // Remove the oldest point to maintain the length
            }
            return updatedData;
        });
        */
    //}, 25); // Update every 25ms

    //return () => clearInterval(interval); // Cleanup on unmount
  }, [props.audioData]);

  const minY = -1; // Minimum value
  const maxY = 1;  // Maximum value

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

      // Draw waveform from right to left
      data.forEach((value, index) => {
          const x = index * sliceWidth; // Calculate x position from left
          const y = (value + 1) * (height / 2); // Scale value to fit in canvas height
          //const y = ((value - minY) / (maxY - minY)) * height; 
          ctx.lineTo(x, y);
      });

      ctx.strokeStyle = '#3498db';
      ctx.stroke();
      //ctx.scale(1.5, 1.5);

  }, [data]);

  return <canvas ref={canvasRef} width={600} height={300} />;
};


export default AudioChart;