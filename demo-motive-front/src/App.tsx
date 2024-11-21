import { useState } from 'react';
import './App.css';
import LeftMenu from './components/LeftMenu';
import TopMenu from './components/TopMenu';
import AudioChart from './components/AudioChart';
import GpuPowerChart from './components/GpuPowerChart';
import AltaiPowerChart from './components/AltaiPowerChart';
import { topMenuItems } from './const/TopMenu';
import useWebSocket from "react-use-websocket";


export default function App() {
  //const socketUrlPower = "ws://localhost:8000/wsx/power";
  const socketUrlPower = "ws://localhost:8007/data_stream";
  const socketUrlAudio = "ws://localhost:8008/data_stream";
  const socketUrlSpeechInfoVAD = "ws://localhost:8008/vad_speech_info";
  const socketUrlSpeechInfoKWS = "ws://localhost:8009/speech_receiving";
  const socketUrlSpeechInfoKWSClass = "ws://localhost:8009/class_sending";

  const { lastMessage: gpuData } = useWebSocket<any>(socketUrlPower, { share: true });

  const { lastMessage: audioData } = useWebSocket<any>(socketUrlAudio, { share: true });
  
  const { lastMessage: SpeechInfoVAD } = useWebSocket<any>(socketUrlSpeechInfoVAD, { share: true });
  const { lastMessage: SpeechInfoKWS } = useWebSocket<any>(socketUrlSpeechInfoKWS, { share: true });
  const { lastMessage: SpeechInfoKWSClass } = useWebSocket<any>(socketUrlSpeechInfoKWSClass, { share: true });

  //console.log(SpeechInfoKWSClass)
  const [categorySelected, setCategorySelected] = useState<string>('tick');
  const [classInfo, setClassInfo] = useState<any>();
  const [classId, setClassId] = useState<string>('');

  return (
    <div className="h-screen bg-amber-50">
      <div className='flex flex-col'>
        <LeftMenu onSelectedCategoryChange={setCategorySelected}/>
        <div className='flex flex-col ml-card mt-12 gap-6'>
          <span className='title'> Подкатегория </span>
          <TopMenu items={topMenuItems[categorySelected]} onClassClick={setClassInfo} setClassId={setClassId}/>
          <div className='rounded-3xl pt-6 pl-12 pb-12 pr-6 bg-white shadow-lg min-w-max mr-6'>
              
            <AudioChart
              audioData={audioData}
              speechRange={classInfo}
              vadInfo={SpeechInfoVAD?.data}
              classId={classId}
              kwsInfo={SpeechInfoKWSClass?.data}
            />

            {/*<div className='align-bottom text-center mt-6'>
              <span className='text '> Время, с </span>
            </div>*/}
          </div>
          <div className='rounded-3xl pt-6 pl-2 pb-6 pr-6 bg-white shadow-lg min-w-max mr-6'>
            {/* здесь должны быть 2 графика энергопотребления Nvidia и Altai */}
            <GpuPowerChart gpuData={gpuData} />
            <AltaiPowerChart altaiData={gpuData} />
          </div>
        </div>
      </div>
    </div>
  );
}
