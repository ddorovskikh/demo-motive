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

interface IGpuInfo{
  time: number,
  power: number,
}

export default function App() {
  const socketUrlPower = "ws://localhost:8000/wsx/power";
  const socketUrlAudio = "ws://localhost:8008/data_stream";
  const socketUrlSpeechInfoVAD = "ws://localhost:8008/vad_speech_info";

  const { readyState: readyStateGpuPower, lastJsonMessage: gpuData } =
    useWebSocket<IGpuInfo>(socketUrlPower, { share: true });

  const { lastMessage: audioData } = useWebSocket<any>(socketUrlAudio, { share: true });
  
  const { readyState: readyStateSpeechInfoVAD, lastMessage: SpeechInfoVAD } =
    useWebSocket<any>(socketUrlSpeechInfoVAD, { share: true });

  const [categorySelected, setCategorySelected] = useState<string>('tick');
  const [classInfo, setClassInfo] = useState<any>();
  const [gpuPowerData, setGpuPowerData] = useState<IGpuInfo[]>([]);
  const referedStateGpuPower = useRef(ReadyState.CONNECTING);
  //const referedStateAudio = useRef(ReadyState.CONNECTING);
  const maxGpuPower = useRef(0);
  const minGpuPower = useRef(0);


  useEffect(() => {
    referedStateGpuPower.current = readyStateGpuPower;
  }, [readyStateGpuPower]);

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

  return (
    <div className="h-screen bg-amber-50">
      <div className='flex flex-col'>
        <LeftMenu onSelectedCategoryChange={setCategorySelected}/>
        <div className='flex flex-col ml-card mt-12 gap-6'>
          <span className='title'> Подкатегория </span>
          <TopMenu items={topMenuItems[categorySelected]} onClassClick={setClassInfo}/>
          <div className='rounded-3xl pt-6 pl-12 pb-1 pr-6 bg-white shadow-lg min-w-max mr-6'>
              
            <AudioChart audioData={audioData} speechRange={classInfo} />

            {/*<div className='align-bottom text-center mt-6'>
              <span className='text '> Время, с </span>
            </div>*/}
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
