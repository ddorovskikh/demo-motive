import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import './App.css';
import LeftMenu from './components/LeftMenu';
import TopMenu from './components/TopMenu';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowOn, ArrowOff,
  ManGo, ManForward, ManReverse, ManFollow, ManLook, ManLearn, ManStop,
  NumbersNull, NumbersOne, NumbersTwo, NumbersThree, NumbersFour, NumbersFive,
  NumbersSix, NumbersSeven, NumbersEight, NumbersNine,
  FaceCreate, FaceCry, FaceOver, FaceDiscord, FaceForward, FaceDie,
  HammerNail, HammerRusty, HammerExclude, HammerSlogan, HammerTrouble, HammerNew,
  HammerKnock, HammerBlowAway, TickYes, TickNo } from './icons';

export default function App() {
  const [categorySelected, setCategorySelected] = useState<string>('tick');

  const topMenuItems: any = {
    tick: [
      { label: 'Да', icon: <TickYes /> },
      { label: 'Нет', icon: <TickNo /> },
    ],
    arrow: [
      { label: 'Вверх', icon: <ArrowUp /> },
      { label: 'Вниз', icon: <ArrowDown /> },
      { label: 'Налево', icon: <ArrowLeft /> },
      { label: 'Направо', icon: <ArrowRight /> },
      { label: 'Включи', icon: <ArrowOn /> },
      { label: 'Выключи', icon: <ArrowOff /> },
    ],
    man: [
      { label: 'Стоп', icon: <ManStop /> },
      { label: 'Иди', icon: <ManGo /> },
      { label: 'Вперед', icon: <ManForward /> },
      { label: 'Назад', icon: <ManReverse /> },
      { label: 'Следуй', icon: <ManFollow /> },
      { label: 'Наблюдай', icon: <ManLook /> },
      { label: 'Изучай', icon: <ManLearn /> },
    ],
    numbers: [
      { label: 'Ноль', icon: <NumbersNull /> },
      { label: 'Один', icon: <NumbersOne /> },
      { label: 'Два', icon: <NumbersTwo /> },
      { label: 'Три', icon: <NumbersThree /> },
      { label: 'Четыре', icon: <NumbersFour /> },
      { label: 'Пять', icon: <NumbersFive /> },
      { label: 'Шесть', icon: <NumbersSix /> },
      { label: 'Семь', icon: <NumbersSeven /> },
      { label: 'Восемь', icon: <NumbersEight /> },
      { label: 'Девять', icon: <NumbersNine /> },
    ],
    face: [
      { label: 'Создай', icon: <FaceCreate /> },
      { label: 'Зарыдай', icon: <FaceCry /> },
      { label: 'Сверх', icon: <FaceOver /> },
      { label: 'Разлад', icon: <FaceDiscord /> },
      { label: 'Вперед', icon: <FaceForward /> },
      { label: 'Гибнет', icon: <FaceDie /> },
    ],
    hammer: [
      { label: 'Гвозди', icon: <HammerNail /> },
      { label: 'Ржавее', icon: <HammerRusty /> },
      { label: 'Исключи', icon: <HammerExclude /> },
      { label: 'Девиз', icon: <HammerSlogan /> },
      { label: 'Беда', icon: <HammerTrouble /> },
      { label: 'Новее', icon: <HammerNew /> },
      { label: 'Стучи', icon: <HammerKnock /> },
      { label: 'Сдуй', icon: <HammerBlowAway /> },
    ]
  }

  const [powerTimeGpu, setPowerTimeGpu] = useState<any>([]);
  const [newWebSocketData, setNewWebSocketData] = useState<any>();

  const ws = new WebSocket("ws://localhost:8000/wsx");  

  ws.onmessage = function(event) {
    console.log(JSON.parse(event.data))
    if (!JSON.parse(event.data)) return;
    const data_buff = JSON.parse(event.data);
    setNewWebSocketData(data_buff);
    
    data_buff.map((data: any) => {
      if (data.power && data.time) {
        const [h, m, s] = data.time?.split(":");
        const seconds = (parseFloat(h) * 60 * 60) + (parseFloat(m) * 60) + parseFloat(s);

        const prepareData = {
          'power': parseFloat(data.power),
          'time': seconds,
        }
        setPowerTimeGpu((prevState: any) => ([...prevState, prepareData]));
        //setNewWebSocketData(prepareData);
      }
    });
    

  };

  useEffect(() => {
    if (!newWebSocketData) return;
    console.log(newWebSocketData)
    /*
    setPowerTimeGpu((prevState: any) => {
      if (prevState.length < 15) {
        return [...prevState, newWebSocketData];
      } else {
        return [...prevState.slice(1), newWebSocketData];
      }
    });
    */
  }, [newWebSocketData]);
  //console.log(powerTimeGpu)
  //const animals = ['ant', 'bison', 'camel', 'duck', 'elephant'];
  //console.log(animals.slice(1))
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
            {/* здесь должны быть 2 графика производительности Nvidia и Altai */}
            {!!powerTimeGpu.length && (
              <LineChart width={950} height={200} data={powerTimeGpu} >
                <XAxis tickLine={false} dataKey="time" />
                <YAxis domain={[0, 50]}/>
                <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                <Line type="monotone" dataKey="power" stroke="#8884d8"  yAxisId={0} />
              </LineChart>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
