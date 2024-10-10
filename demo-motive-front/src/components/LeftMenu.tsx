import { FC, useEffect, useState } from 'react';
import { ArrowDark, ArrowWhite, FaceDark, FaceWhite, HammerDark, HammerWhite, ManDark, ManWhite, NumbersDark, NumbersWhite, TickDark, TickWhite } from '../icons';
import LeftMenuButton from './LeftMenuButton';

interface ILeftMenuProps {
  onSelectedCategoryChange: any;
}

const LeftMenu: FC<ILeftMenuProps> = (props) => {
  const [activeButton, setActiveButton] = useState<string>('tick');

  useEffect(() => {
    activeButton && props.onSelectedCategoryChange(activeButton);
  }, [activeButton]);

  const menuItems = [
    {
      label: 'tick',
      url: '/tick',
      iconWhite: <TickWhite />,
      iconDark: <TickDark />,
    },
    {
      label: 'arrow',
      url: '/arrow',
      iconWhite: <ArrowWhite />,
      iconDark: <ArrowDark />,
    },
    {
      label: 'man',
      url: '/man',
      iconWhite: <ManWhite />,
      iconDark: <ManDark />,
    },
    {
      label: 'numbers',
      url: '/numbers',
      iconWhite: <NumbersWhite />,
      iconDark: <NumbersDark />,
    },
    {
      label: 'face',
      url: '/face',
      iconWhite: <FaceWhite />,
      iconDark: <FaceDark />,
    },
    {
      label: 'hammer',
      url: '/hammer',
      iconWhite: <HammerWhite />,
      iconDark: <HammerDark />,
    }
  ]

  return (
    <div className="fixed opacity-80 z-10 flex place-content-center max-h-left-menu min-h-left-menu rounded-3xl my-6 ml-6 min-w-left-menu max-w-left-menu flex-col overflow-y-auto bg-black">
      <div className='flex items-center flex-col gap-12'>
        {menuItems.map((item: any, ind: number) =>
          <LeftMenuButton
            key={ind}
            label={item.label}
            icon={activeButton === item.label ? item.iconDark : item.iconWhite}
            activeButton={activeButton}
            changeActive={setActiveButton}
          />
        )}
      </div>
    </div>
  );
}

export default LeftMenu;