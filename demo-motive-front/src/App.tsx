import { useEffect, useMemo, useRef, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { Line as Line2 } from 'react-chartjs-2';
import './App.css';
import LeftMenu from './components/LeftMenu';
import TopMenu from './components/TopMenu';
import { topMenuItems } from './const/TopMenu';
import useWebSocket, { ReadyState } from "react-use-websocket";
import { AudioVisualizer } from 'react-audio-visualize';
//import { Visualizer } from 'react-sound-visualizer';
import ReactPlayer from 'react-player'
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';


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
  
  const [blob, setBlob] = useState<any>();
  const [audioData2, setAudioData2] = useState<Float32Array | null>(null);
  //const [src, setSrc] = useState<any>();
  //const [error, setError] = useState<any>();

  //const src = useObjectUrl(audioData?.data.text().then((data: any) => data));
  useEffect(() => {
    if (!audioData?.data) return;
    if (referedStateAudio.current === ReadyState.OPEN) {
      //console.log(audioData?.data.stream(), audioData?.data.text())
      //audioData?.data.text().then((data: any) => console.log(data))
      //console.log((audioData?.data.arrayBuffer().then((data: any) => console.log(data))))
      console.log(audioData.data)

      /*
      audioData?.data.text().then((data: any) => {
        const bytes = new Uint8Array(data);
        const blob2 = new Blob([bytes], {type: "application/pdf"});
        setBlob(bytes);
        setPreloadedAudioBlob(data);
      })
      */
      //const byteArray = new Uint8Array(audioData?.data.arrayBuffer());
      //const blob = new Blob([JSON.parse(audioData.data)], { type: "audio/mp3" });
      //setBlob(blob)

      //const url = URL.createObjectURL(audioData?.data)
      //console.log(blob.arrayBuffer())
      //setSrc(src);
      //const bytes = new Uint8Array(audioData?.data.bytes());
      //const arr = new Uint8Array(audioData?.data.arrayBuffer());
      //console.log(audioData?.data.arrayBuffer(), arr)
      //setBytes(arr);
    }
  }, [referedStateAudio, audioData]);


  useEffect(() => {
    if (audioData !== null) {
        const byteArray = new Uint8Array(audioData.data); // Преобразовать данные из сообщения
        const floatArray = new Float32Array(byteArray.buffer);
        setAudioData2(floatArray);

        const amplitude: number[] = [];

        // Преобразование массива байт в амплитуду
        for (let i = 0; i < byteArray.length; i += 4) {
            // Чтение 32-битных значений и нормализация
            const sample = new Float32Array(byteArray.buffer, i, 1)[0]; // Чтение Float32
            amplitude.push(sample);
        }

        setAmplitudeData((prevData) => [...prevData, ...amplitude]); // Обновляем состояние
    }
}, [audioData]);

const chartData = {
  labels: amplitudeData.map((_, index) => index), // временные метки по индексу данных амплитуды
  datasets: [
      {
          label: 'Amplitude',
          data: amplitudeData,
          fill: false,
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.1,
      },
  ],
};

  useEffect(() => {
    if (!error) return;

    console.log(error);
}, [error]);

  const visualizerRef = useRef<HTMLCanvasElement>(null)
  //audioData?//.then((data: any) => {console.log(data) })
  //audioData?.data.text().then((data: any) => console.log(data.blob()))

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
              <div>
                <h2>Audio Amplitude Visualization</h2>
                <Line2 data={chartData} options={{ responsive: true }} />
              </div>
              */}

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
