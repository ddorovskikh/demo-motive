import type { FC } from 'react';

interface ILeftMenuButtonProps {
  url?: string;
  label: string;
  icon: any;
  activeButton: string;
  onClick?: () => void;
  changeActive: any;
}

const LeftMenuButton: FC<ILeftMenuButtonProps> = (props) => {
  // ${props.label === 'leftMenu.man' ? 'pl-6' : 'pl-4'}
  return (props.activeButton === props.label ? (
    <div className={`rounded-l-3xl py-2 pl-4 flex bg-amber-50 w-9/12 place-self-end`}>
      <button className='flex justify-start' onClick={() => props.changeActive(props.label)}>
        {props.icon}
      </button>
    </div>
    ) : (
    <div className={`py-2 pl-4 flex w-9/12 place-self-end`}>
      <button className='flex ' onClick={() => props.changeActive(props.label)}>
        {props.icon}
      </button>
    </div>
  ));
}

export default LeftMenuButton;