import { FC } from 'react';
import TopMenuButton from './TopMenuButton';

interface ICategoryItem {
  label?: string,
  icon?: any,
}

interface ITopMenuProps {
  items?: ICategoryItem[],
}

const TopMenu: FC<ITopMenuProps> = (props) => {
  return (
    <div className='rounded-3xl p-5 bg-card-yellow shadow-lg mr-6 min-w-max'>
      <div className='flex gap-8'>
      {props.items && props.items.map((item: any) => 
        <TopMenuButton
          key={item.label}
          label={item.label}
          icon={item.icon}
        />
      )}
      </div>
    </div>
  );
}

export default TopMenu;