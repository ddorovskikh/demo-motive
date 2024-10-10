import type { FC } from 'react';

interface ITopMenuButton {
  icon?: any,
  label?: string,
}

const TopMenuButton: FC<ITopMenuButton> = (props) => {
  return (
    <div className='flex flex-col gap-2'>
      <button className='flex justify-center rounded-full w-[90.24px] h-[90.24px] bg-[#FEDB99] place-items-center'>
        {props.icon}
      </button>
      <span className='text-top-menu text-center'> {props.label} </span>
    </div>
  );
}

export default TopMenuButton;