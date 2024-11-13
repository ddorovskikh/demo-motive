import { useCallback, useEffect, useId, useMemo, useRef, useState, startTransition } from 'react';

const THIN_POINT = 40; // 40
const POINT_IN_SAMPLE = 40;
const TIME_INTERVAL_MS = 25;

const AudioChart: React.FC<any> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<any[]>([]);
  const maxDataPoints = 19200; // Total number of points (12 seconds at 25ms intervals)


  useEffect(() => {
    if (!props.vadInfo) return;
    //console.log(JSON.parse(props.vadInfo));
  }, [props.vadInfo]);

  useEffect(() => {
    if (props.audioData === null) return;

    const amplitude: any[] = [];

    props.audioData.data.arrayBuffer().then((dataAudio: any) => {
      const byteArray = new Uint8Array(dataAudio);

      for (let i = 0; i < byteArray.length; i += THIN_POINT) { // 40 точек на интервал 25мс вместо 400
        // Чтение 32-битных значений и нормализация
        const sample = new Float32Array(byteArray.buffer, i, 1)[0];
        amplitude.push(sample);
      }

      setData(prevData => {
        const updatedData = [...prevData, ...amplitude];
        if (updatedData.length > maxDataPoints) {
            updatedData.splice(0, THIN_POINT);
        }
        return updatedData;
      });
    });
    if (indexesTrue.length) {
      const newIndexes = indexesTrue.map((ind: any) => ind - THIN_POINT > 0 ? ind - THIN_POINT : undefined).filter((x: any) => !!x);
      setIndexesTrue(newIndexes);
    }
    if (indexesCenterTrueClass.length) {
      const newIndexesClass = indexesCenterTrueClass.map((item: any) => item.ind - THIN_POINT > 0 ? {ind: item.ind-THIN_POINT, class: item.class} : undefined).filter((x: any) => !!x);
      setIndexesCenterTrueClass(newIndexesClass);
    }
    if (indexesVad.length) {
      const newIndexesVad = indexesVad.map((ind: any) => ind - THIN_POINT > 0 ? ind - THIN_POINT : undefined).filter((x: any) => !!x);
      setIndexesVad(newIndexesVad);
    }
  }, [props.audioData]);

  const [indexesTrue, setIndexesTrue] = useState<any>([]);
  const [timeGetTrueSpeech, setTimeGetTrueSpeech] = useState<any>();
  const [indexesCenterTrueClass, setIndexesCenterTrueClass] = useState<any>([]);

  useEffect(() => {
    if (!props.classId) return;
    if (props.speechRange) {
      const ind = Math.ceil(props.speechRange.timestamp * 1000 * (maxDataPoints-1) / Date.now()); // ms / ms -> index
      setTimeGetTrueSpeech(Date.now());
      const step = Math.ceil(props.speechRange.length_samples / 10); // number of points after ind
      setIndexesTrue((prevValue: any) => [...prevValue, ind, ind + step]);
      setIndexesCenterTrueClass((prevValue: any) => [...prevValue, { ind: Math.ceil((2*ind + step)/2), class: props.classId }]); //class
    }

  }, [props.speechRange, props.classId]);

  const [indexesVad, setIndexesVad] = useState<any>([]);

  useEffect(() => {
    if (props.vadInfo) {
      const vadInfo = JSON.parse(props.vadInfo);
      const ind = Math.ceil(vadInfo.vad_timestamp * 1000 * (maxDataPoints-1) / (Date.now()));
      const lagTimeMS = Date.now() - timeGetTrueSpeech;
      const lagInd = lagTimeMS ? lagTimeMS / TIME_INTERVAL_MS * POINT_IN_SAMPLE : 0;
      const step = Math.ceil(vadInfo.vad_length_in_samples) * POINT_IN_SAMPLE;
      setIndexesVad((prevValue: any) => [...prevValue, ind - lagInd, ind + step - lagInd]);
      setTimeGetTrueSpeech(undefined);
    }

  }, [props.vadInfo]);

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

    drawVerticalLines(canvas, ctx, indexesTrue, 'pink', false, indexesCenterTrueClass);
    drawVerticalLines(canvas, ctx, indexesVad, 'green', true);
    drawTextBox(canvas, ctx, indexesCenterTrueClass);
    //drawXAxis(canvas, ctx);

  }, [data, props.speechRange, props.vadInfo]);

  const drawVerticalLines = (canvas: any, ctx: any, indexes: any, color: string, dashed: boolean = false, centerIndClass?: any) => {
    if (!data || !indexes.length) return;
    indexes.forEach((index: any) => {
      if (index && index < maxDataPoints) {
        const x = (index * (canvas.width / maxDataPoints));
        ctx.beginPath();
        ctx.moveTo(x, 0); // Start from top of canvas
        ctx.lineTo(x, canvas.height); // End at bottom of canvas
        dashed && ctx.setLineDash([5, 8]);
        ctx.strokeStyle = color; // Color for vertical lines
        //ctx.lineWidth = 2; // Width of vertical lines
        ctx.stroke();
        dashed && ctx.setLineDash([]);
        //ctx.closePath();
      }
    });
  }

  const drawTextBox = useCallback((canvas: any, ctx: any, centerIndClass: any) => {
    if (!centerIndClass.length) return;
    const padding = 10;
    //const rectY = canvas.height;
    centerIndClass.forEach((item: any) => {
      if (item.ind < maxDataPoints) {
        const textWidth = ctx.measureText(item.class).width;
        const rectWidth = textWidth + padding * 2;
        const rectX = item.ind*(canvas.width / maxDataPoints) - rectWidth/2;
        ctx.font = '20px Arial';

        const rectHeight = parseInt(ctx.font, 15);
        const rectY = canvas.height - rectHeight  ;
        ctx.fillStyle = 'lightblue';
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

        ctx.fillStyle = 'black';
        ctx.fillText(item.class, rectX + padding, rectY + rectHeight - padding);
      }
    });
  }, [indexesCenterTrueClass]);

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

  return <canvas ref={canvasRef} width={1000} height={300} />;
};


export default AudioChart;