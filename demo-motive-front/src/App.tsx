import { useEffect, useMemo, useRef, useState, startTransition } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { Line as Line2 } from 'react-chartjs-2';
import './App.css';
import LeftMenu from './components/LeftMenu';
import TopMenu from './components/TopMenu';
import AudioChart from './components/AudioChart';
import { topMenuItems } from './const/TopMenu';
import useWebSocket, { ReadyState } from "react-use-websocket";
import { AudioVisualizer } from 'react-audio-visualize';
//import { Visualizer } from 'react-sound-visualizer';
import ReactPlayer from 'react-player'
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';
import WaveSurfer from 'wavesurfer.js'
import Wavesurfer from '@wavesurfer/react';
import { useCanvas } from 'react-canvas-typescript';

import { Chart, registerables } from 'chart.js';
import { arrayBuffer } from 'stream/consumers';
Chart.register(...registerables);


const BarChart: React.FC<{ data: number[] }> = ({ data }) => {
  const canvasRef = useCanvas({
      draw: (ctx: any, frameCount: any) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          ctx.clearRect(0, 0, width, height); // Clear the canvas

          const barWidth = width / data.length;
          data.forEach((value, index) => {
              const barHeight = (value / Math.max(...data)) * height; // Normalize bar height
              ctx.fillStyle = '#3498db';
              ctx.fillRect(index * barWidth, height - barHeight, barWidth - 5, barHeight); // Draw each bar
          });
      },
      contextType: '2d'
  });

  return <canvas ref={canvasRef} width={500} height={300} />;
};

interface IGpuInfo{
  time: number,
  power: number,
}

function useObjectUrl (blob: any) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);
  useEffect(() => () => URL.revokeObjectURL(url), [blob]);
  return url;
}

export default function App() {
  const recorderControls = useVoiceVisualizer();
  const {
    // ... (Extracted controls and states, if necessary)
    setPreloadedAudioBlob,
    error,
    audioRef
} = recorderControls;

  const socketUrlPower = "ws://localhost:8000/wsx/power";
  //const socketUrlAudio = "ws://localhost:8000/wsx/audio";
  const socketUrlAudio = "ws://localhost:8008/data_stream";
  const { readyState: readyStateGpuPower, lastJsonMessage: gpuData } =
    useWebSocket<IGpuInfo>(socketUrlPower, { share: true });
  /*
  const { readyState: readyStateAudio, lastJsonMessage: audioData } =
    useWebSocket<any>(socketUrlAudio, { share: true });
  */

  const { readyState: readyStateAudio, lastMessage: audioData } =
    useWebSocket<any>(socketUrlAudio, { share: true });

  const [categorySelected, setCategorySelected] = useState<string>('tick');
  const [classId, setClassId] = useState<string>();
  const [gpuPowerData, setGpuPowerData] = useState<IGpuInfo[]>([]);
  const referedStateGpuPower = useRef(ReadyState.CONNECTING);
  const referedStateAudio = useRef(ReadyState.CONNECTING);
  const maxGpuPower = useRef(0);
  const minGpuPower = useRef(0);

  const [amplitudeData, setAmplitudeData] = useState<number[]>([]); // Данные амплитуды для графика


  useEffect(() => {
    referedStateGpuPower.current = readyStateGpuPower;
  }, [readyStateGpuPower]);

  useEffect(() => {
    referedStateAudio.current = readyStateAudio;
  }, [readyStateAudio]);

  useEffect(() => {
    if (referedStateGpuPower.current === ReadyState.OPEN) {
      const maxGpuPowerCur = Math.max(...gpuPowerData.map((item: any) => item.power));
      if (maxGpuPowerCur !== maxGpuPower.current) {
        maxGpuPower.current = maxGpuPowerCur;
      }
      const minGpuPowerCur = Math.min(...gpuPowerData.map((item: any) => item.power));
      if (minGpuPowerCur !== minGpuPower.current) {
        minGpuPower.current = minGpuPowerCur;
      }
      if (gpuPowerData.length < 400) {
        setGpuPowerData([...gpuPowerData, gpuData]);
      } else {
        setGpuPowerData([...gpuPowerData.slice(1), gpuData]);
      }
    }
  }, [referedStateGpuPower, gpuData]);

  useEffect(() => {
    if (!audioData?.data) return;
    if (referedStateAudio.current === ReadyState.OPEN) {
    }
  }, [referedStateAudio, audioData]);

  const [audio, setAudio] = useState<any>([]);
  const [time, setTime] = useState<number>(0);
  const [audioBuffer, setAudioBuffer] = useState<any>([]);

  const reverseArr = () => {
    let output: any[] = [];
    for (let i = 0; i < 6400; i += 1) {
      output.push(i);
    }
    return output.reverse();
  }
  
  const refDataListener = useRef(undefined);

  useEffect(() => {
    if (audioData !== null) {
        const amplitude: any[] = [];

        audioData.data.arrayBuffer().then((data: any) => {
          const byteArray = new Uint8Array(data);

          for (let i = 0; i < byteArray.length; i += 40) {
            // Чтение 32-битных значений и нормализация
            const sample = new Float32Array(byteArray.buffer, i, 1)[0]; // Чтение Float32
            amplitude.push({data: sample, time: time});
            //setTime((prev: any) => prev < 6400 ? +1 : prev);
            setTime(+1);
          }
          console.log(amplitude.length) //== 400
          //setAmplitudeData(amplitude)

          if (amplitudeData.length < 3200) { // 2 sec
            startTransition(() => {
              setAmplitudeData([...amplitudeData, ...amplitude]);
            });
            //setAmplitudeData([...amplitudeData, ...amplitude]); // Обновляем состояние
            //setAudio([...audio, {audio: amplitude, time: time}]);
          } else {
            startTransition(() => {
              setAmplitudeData([...amplitudeData.slice(40), ...amplitude]);
            });
            //setAmplitudeData([...amplitudeData.slice(40), ...amplitude]);
            //setAudio([...audio.slice(amplitude.length), {audio: amplitude, time: time}]);
          }
          
          
        })
    }
  }, [refDataListener, referedStateAudio, audioData]);

  return (
    <div className="h-screen bg-amber-50">
      <div className='flex flex-col'>
        <LeftMenu onSelectedCategoryChange={setCategorySelected}/>
        <div className='flex flex-col ml-card mt-12 gap-6'>
          <span className='title'> Подкатегория </span>
          <TopMenu items={topMenuItems[categorySelected]} setClassId={setClassId}/>
          <div className='rounded-3xl pt-6 pl-12 pb-1 pr-6 bg-white shadow-lg min-w-max mr-6'>
              {/*<VoiceVisualizer controls={recorderControls} ref={audioRef}/>*/}

              {/*{blob && (<ReactPlayer url={URL.createObjectURL(blob)} playing />)}*/}
              {/* звуковая дорожка соответствующая выбранному классу в TopMenu */}
              {/*
              {blob && (
                <AudioVisualizer
                  ref={visualizerRef}
                  blob={blob}
                  width={500}
                  height={75}
                  barWidth={1}
                  gap={0}
                  barColor={'#f76565'}
                />
              )}
              */}
              {/*
              <Wavesurfer
                  onReady={handleReady}
                  waveColor="violet"
                  progressColor="purple"
                  height={100}
              />*/}
              <h2>Audio Amplitude Visualization</h2>
              {/*<Line2 data={chartData} options={{ responsive: true }} />*/}
              {/*<ResponsiveContainer width="99%" height={150}>
                <LineChart data={amplitudeData} >
                  <XAxis tickLine={false} tick={false} dataKey="time" />
                  <YAxis domain={[-0.01, 0.01]} />
                  <Line type="monotone" dataKey="data" dot={false} stroke="blue" yAxisId={0} />
                </LineChart>
              </ResponsiveContainer>*/}
              
              <AudioChart audioData={audioData} />
              

            {/*{audioData && src && (<audio controls {...{src}} /> ) }*/}
            {/* Visualizer audio={new MediaStream(audioData?.data.text().then((data: any) => data))}> 
              {({ canvasRef, stop, start, reset }) => (
                <>
                  <canvas ref={canvasRef} width={500} height={100} />

                  <div>
                    <button onClick={start}>Start</button>
                    <button onClick={stop}>Stop</button>
                    <button onClick={reset}>Reset</button>
                  </div>
                </>
              )}
            </Visualizer>
            */}
            {/*<canvas ref={visualizerRef} className='flex border-black h-rect border-rect' />*/}
            <div className='align-bottom text-center mt-6'>
              <span className='text '> Время, с </span>
            </div>
          </div>
          <div className='rounded-3xl pt-6 pb-2 pr-6 bg-white shadow-lg min-w-max mr-6'>
            {/* здесь должны быть 2 графика энергопотребления Nvidia и Altai */}
            {!!gpuPowerData.length && (
              <ResponsiveContainer width="99%" height={150}>
                <LineChart data={gpuPowerData.slice(0, 400)} >
                  <XAxis tickLine={false} tick={false} dataKey="time" />
                  <YAxis domain={[Math.round(minGpuPower.current - 2), Math.round(maxGpuPower.current + 2)]} />
                  <Line type="monotone" dataKey="power" dot={false} stroke="#000000" yAxisId={0} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
