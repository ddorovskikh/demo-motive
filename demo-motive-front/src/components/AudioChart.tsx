import { useCallback, useEffect, useRef, useState } from 'react';

const THIN_POINT = 40;
const POINT_IN_SAMPLE = 40;
const TIME_INTERVAL_MS = 25;

const CHART_WIDTH = 1000;
const CHART_HEIGHT = 200;

const AUDIO_COLOR = '#9747FF';
const VAD_KWS_COLOR = '#46CDED';

const LINE_COLOR = '#00000075';
const Y_TICK_COUNT = 3;

const AudioChart: React.FC<any> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<any[]>([]);
  const maxDataPoints = 19200; // Total number of points (12 seconds at 25ms intervals)


  useEffect(() => {
    if (props.audioData === null) return;

    const amplitude: any[] = [];

    props.audioData.data.arrayBuffer().then((dataAudio: any) => {
      const byteArray = new Uint8Array(dataAudio);

      for (let i = 0; i < byteArray.length; i += THIN_POINT) { // 40 points for each 25ms interval
        const sample = new Float32Array(byteArray.buffer, i, 1)[0];
        amplitude.push(sample);
      }

      setData(prevData => {
        const updatedData = [...prevData, ...amplitude];
        if (updatedData.length > maxDataPoints) {
          updatedData.splice(0, THIN_POINT);
        } else {
          const initialLeftTail = new Array(maxDataPoints - updatedData.length); //.fill(null);

          return [...initialLeftTail, updatedData];
        }
        return updatedData;
      });
    });

    if (indexesTrue.length) {
      const newIndexes = indexesTrue.map((ind: any) => ind - THIN_POINT > 0 ? ind - THIN_POINT : undefined).filter((x: any) => !!x);
      setIndexesTrue(newIndexes);
    }
    if (indexesCenterTrueClass.length) {
      const newIndexesClass = indexesCenterTrueClass
        .map((item: any) => item.ind - THIN_POINT > 0 ?{ ind: item.ind - THIN_POINT, class: item.class, timestamp: item.timestamp }: undefined)
          .filter((x: any) => !!x);
      setIndexesCenterTrueClass(newIndexesClass);
    }
    if (indexesVad.length) {
      const newIndexesVad = indexesVad.map((ind: any) => ind - THIN_POINT > 0 ? ind - THIN_POINT : undefined).filter((x: any) => !!x);
      setIndexesVad(newIndexesVad);
    }
    if (indexesCenterKWSClass.length) {
      const newIndexesKWS = indexesCenterKWSClass.map((item: any) => item.ind - THIN_POINT > 0 ? {ind: item.ind-THIN_POINT, class: item.class} : undefined).filter((x: any) => !!x);
      setIndexesCenterKWSClass(newIndexesKWS);
    }
  }, [props.audioData]);

  const [indexesTrue, setIndexesTrue] = useState<any>([]);
  const [timeGetTrueSpeech, setTimeGetTrueSpeech] = useState<any>();
  const [timeGetVADSpeech, setTimeGetVADSpeech] = useState<any>();
  const [indexesCenterTrueClass, setIndexesCenterTrueClass] = useState<any>([]);
  const [indexesCenterKWSClass, setIndexesCenterKWSClass] = useState<any>([]);
  const [trueSpeechStep, setTrueSpeechStep] = useState<number>(0);

  useEffect(() => {
    if (!props.classId) return;
    if (props.speechRange) {
      const ind = Math.ceil(props.speechRange.timestamp * 1000 * (maxDataPoints-1) / Date.now());
      setTimeGetTrueSpeech(Date.now());
      const step = Math.ceil(props.speechRange.length_samples / 10); // number of points after ind
      setTrueSpeechStep(step);
      setIndexesTrue((prevValue: any) => [...prevValue, ind, ind + step]);
      setIndexesCenterTrueClass((prevValue: any) => [...prevValue, { ind: Math.ceil((2*ind + step)/2), class: props.classId, timestamp: props.speechRange.timestamp }]); //class
    }

  }, [props.speechRange]);

  const [indexesVad, setIndexesVad] = useState<any>([]);

  useEffect(() => {
    if (props.vadInfo) {
      const vadInfo = JSON.parse(props.vadInfo);
      const ind = Math.ceil(vadInfo.vad_timestamp * 1000 * (maxDataPoints-1) / (Date.now()));
      const lagTimeMS = Date.now() - timeGetTrueSpeech;
      setTimeGetVADSpeech(Date.now());
      const lagInd = lagTimeMS ? lagTimeMS / TIME_INTERVAL_MS * POINT_IN_SAMPLE : 0;
      const step = Math.ceil(vadInfo.vad_length_in_samples) * POINT_IN_SAMPLE;
      setIndexesVad((prevValue: any) => [...prevValue, ind - lagInd, ind + step - lagInd]);
      //setTimeGetTrueSpeech(undefined);
    }

  }, [props.vadInfo]);

  useEffect(() => {
    if (!indexesCenterTrueClass.length) {
      return;
    }
    if (props.kwsInfo) {
      const kwsInfo = JSON.parse(props.kwsInfo);
      
      setIndexesCenterKWSClass((prevValue: any) => {
        const findTrueClass = indexesCenterTrueClass.find((item: any) => item?.timestamp === kwsInfo?.timestamp);
        if (!indexesCenterKWSClass.some((item: any) => item?.timestamp === findTrueClass?.timestamp)) {
          return [...prevValue, { ind: findTrueClass?.ind, class: kwsInfo.class_name, timestamp: kwsInfo.timestamp }];
        }
        return prevValue;
      });
    }

  }, [props.kwsInfo]);

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

    ctx.globalAlpha = 0.8;
    const maxDataValue = Math.max(...data);

    data.forEach((value, index) => {
      const x = index * sliceWidth; // Calculate x position from left
      const y = (value + 1) * (height / 2); // Scale value to fit in canvas height
      ctx.lineTo(x, y);
    });
    
    ctx.strokeStyle = AUDIO_COLOR;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    drawVerticalLines(canvas, ctx, indexesTrue, AUDIO_COLOR, false, indexesCenterTrueClass);
    drawVerticalLines(canvas, ctx, indexesVad, VAD_KWS_COLOR, true, 2);
    drawTextBox(canvas, ctx, indexesCenterTrueClass);
    drawTextBox(canvas, ctx, indexesCenterKWSClass, 'Up');
    //drawXAxis(canvas, ctx);

    //drawYAxis(canvas, ctx, maxDataValue)

  }, [data, props.speechRange, props.vadInfo]);

  const drawVerticalLines = (canvas: any, ctx: any, indexes: any, color: string, dashed: boolean = false, lineWidth: number = 1) => {
    if (!data || !indexes.length) return;
    indexes.forEach((index: any) => {
      if (index && index < maxDataPoints) {
        const x = (index * (canvas.width / maxDataPoints));
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        dashed && ctx.setLineDash([5, 5]);
        ctx.strokeStyle = color; // Color for vertical lines
        ctx.lineWidth = lineWidth; // Width of vertical lines
        ctx.stroke();
        dashed && ctx.setLineDash([]);
        ctx.lineWidth = 1;
        //ctx.closePath();
      }
    });
  }

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, color?: string) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = color || VAD_KWS_COLOR; // Fill color
    ctx.fill();
  };

  const drawTextBox = useCallback((canvas: any, ctx: any, centerIndClass: any, pos: 'Up' | 'Down' = 'Down' ) => {
    if (!centerIndClass.length) return;
    const padding = 10;

    centerIndClass.forEach((item: any) => {
      if (item.ind < maxDataPoints) {
        const textWidth = ctx.measureText(item.class).width;
        const textKWSWidth = ctx.measureText('KWS').width;
        const rectWidth = textWidth + padding * 2;
        const rectKWSWidth = textKWSWidth + padding * 2;
        const rectX = item.ind*(canvas.width / maxDataPoints) - rectWidth/2;
        const rectKWSX = item.ind*(canvas.width / maxDataPoints) - rectKWSWidth/2;
        ctx.font = '20px Involve';
        const rectHeight = parseInt(ctx.font, 15);
        const rectY = (pos === 'Down') ? canvas.height - rectHeight : 0;

        ctx.font = '20px Arial';
        //ctx.fillStyle = 'lightblue';
        //ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

        if (pos === 'Up') {
          //ctx.font = '12px Arial';
            //drawRoundedRect(ctx, rectX, rectY, rectKWSWidth, rectHeight, 10);
          //ctx.fillStyle = 'black';
          //ctx.fillText('KWS', rectX + padding, rectY + rectHeight - padding);
          ctx.globalAlpha = 0.5;
          drawRoundedRect(ctx, rectX, rectY, rectWidth, rectHeight, 10);
          ctx.globalAlpha = 1.0;
          ctx.font = '20px Involve';
          ctx.fillStyle = 'black';
          ctx.fillText(item.class, rectX + padding, rectY + rectHeight - padding);
          return;
        }
        ctx.globalAlpha = 0.2;
        drawRoundedRect(ctx, rectX, rectY, rectWidth, rectHeight, 10, AUDIO_COLOR);
        ctx.globalAlpha = 1.0;
        ctx.font = '20px Involve';
        ctx.fillStyle = 'black';
        ctx.fillText(item.class, rectX + padding, rectY + rectHeight - padding);
      }
    });
  }, [indexesCenterTrueClass]);


  const drawYAxis = (canvas: any, ctx: any, maxYValue: any) => {
    // Draw Y-axis
    ctx.beginPath();
    ctx.moveTo(50, 9);
    ctx.lineTo(50, canvas.height);
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
    drawArrow(ctx, 50, 10, 50, 0);
  }

  function drawX1Axis(canvas: any, ctx: any) {
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

  const drawXAxis = (canvas: any, ctx: any) => {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height-5);
    
    ctx.lineTo(CHART_WIDTH, canvas.height-5);
    //ctx.lineWidth = 2;
    ctx.strokeStyle = LINE_COLOR;
    ctx.stroke();
    //drawArrow(ctx, canvas.width-50, canvas.height, canvas.width, canvas.height);

    const tickCount = 12;
    for (let i: number = tickCount; i >= 0; i--) {
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
          ctx.font = '13.52px Involve';
          ctx.textAlign = 'center';
          ctx.fillText(labelValue.toFixed(0), x+2, canvas.height - 15); // Position label slightly below tick mark
      }
      
    }
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
};


export default AudioChart;