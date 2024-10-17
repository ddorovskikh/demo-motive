import { FC, useEffect, useState } from 'react';
import TopMenuButton from './TopMenuButton';

interface ICategoryItem {
  label?: string,
  icon?: any,
  id?: string,
}

interface ITopMenuProps {
  items?: ICategoryItem[],
  setClassId?: any,
}

const TopMenu: FC<ITopMenuProps> = (props) => {
  const [response, setResponse] = useState<any>();
  useEffect(() => {
    console.log(response);
  }, [response]);
  return (
    <div className='rounded-3xl p-5 bg-card-yellow shadow-lg mr-6 min-w-max'>
      <div className='flex gap-8'>
      {props.items && props.items.map((item: any) => 
        <TopMenuButton
          key={item.label}
          label={item.label}
          icon={item.icon}
          id={item.id}
          onClassChoose={setResponse}
        />
      )}
      </div>
    </div>
  );
}

export default TopMenu;