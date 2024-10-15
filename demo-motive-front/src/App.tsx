import { useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import './App.css';
import LeftMenu from './components/LeftMenu';
import TopMenu from './components/TopMenu';
import { topMenuItems } from './const/TopMenu';
import useWebSocket, { ReadyState } from "react-use-websocket";

interface IGpuInfo{
  time: number,
  power: number,
}

export default function App() {
  const socketUrl = "ws://localhost:8000/wsx";
  const { readyState, lastJsonMessage } =
    useWebSocket<IGpuInfo>(socketUrl, { share: true });

  const [categorySelected, setCategorySelected] = useState<string>('tick');
  const [gpuPowerData, setGpuPowerData] = useState<IGpuInfo[]>([]);
  const referedState = useRef(ReadyState.CONNECTING);
  const maxGpuPower = useRef(0);
  const minGpuPower = useRef(0);

  useEffect(() => {
    referedState.current = readyState;
  }, [readyState]);
  
  useEffect(() => {
    if (referedState.current === ReadyState.OPEN) {
      const maxGpuPowerCur = Math.max(...gpuPowerData.map((item: any) => item.power));
      if (maxGpuPowerCur !== maxGpuPower.current) {
        maxGpuPower.current = maxGpuPowerCur;
      }
      const minGpuPowerCur = Math.min(...gpuPowerData.map((item: any) => item.power));
      if (minGpuPowerCur !== minGpuPower.current) {
        minGpuPower.current = minGpuPowerCur;
      }
      if (gpuPowerData.length < 400) {
        setGpuPowerData([...gpuPowerData, lastJsonMessage]);
      } else {
        setGpuPowerData([...gpuPowerData.slice(1), lastJsonMessage]);
      }
    }
  }, [referedState, lastJsonMessage]);

  return (
    <div className="h-screen bg-amber-50">
      <div className='flex flex-col'>
        <LeftMenu onSelectedCategoryChange={setCategorySelected}/>
        <div className='flex flex-col ml-card mt-12 gap-6'>
          <span className='title'> Подкатегория </span>
          <TopMenu items={topMenuItems[categorySelected]} />
          <div className='rounded-3xl pt-6 pl-12 pb-1 pr-6 bg-white shadow-lg min-w-max mr-6'>
            <div className='flex border-black h-rect border-rect'>
              {/* звуковая дорожка соответствующая выбранному классу в TopMenu */}
            </div>
            <div className='align-bottom text-center mt-6'>
              <span className='text '> Время, с </span>
            </div>
          </div>
          <div className='rounded-3xl pt-6 pl-12 pb-2 pr-6 bg-white shadow-lg min-w-max mr-6'>
            {/* здесь должны быть 2 графика энергопотребления Nvidia и Altai */}
            {!!gpuPowerData.length && (
              <LineChart width={950} height={200} data={gpuPowerData.slice(0, 400)} >
                <XAxis tickLine={false} tick={false} dataKey="time" />
                <YAxis domain={[Math.round(minGpuPower.current - 2), Math.round(maxGpuPower.current + 2)]}/>
                <Line type="monotone" dataKey="power" dot={false} stroke="#000000" yAxisId={0} />
              </LineChart>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
