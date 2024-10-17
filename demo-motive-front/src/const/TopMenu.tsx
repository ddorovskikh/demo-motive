import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowOn, ArrowOff,
  ManGo, ManForward, ManReverse, ManFollow, ManLook, ManLearn, ManStop,
  NumbersNull, NumbersOne, NumbersTwo, NumbersThree, NumbersFour, NumbersFive,
  NumbersSix, NumbersSeven, NumbersEight, NumbersNine,
  FaceCreate, FaceCry, FaceOver, FaceDiscord, FaceForward, FaceDie,
  HammerNail, HammerRusty, HammerExclude, HammerSlogan, HammerTrouble, HammerNew,
  HammerKnock, HammerBlowAway, TickYes, TickNo } from '../icons';

const COMMANDS_CLASSES = ["yes", "no", "up", "down", "left", "right", "on", "off", "stop", "go",
    "backward", "forward", "follow", "learn", "visual",
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "create", "cry", "over", "discord", "harm", "dies", "nails", "rustier",
    "exclude", "motto", "grief", "newer", "knock", "blow off"]

export const topMenuItems: any = {
  tick: [
    { label: 'Да', icon: <TickYes />, id: 'yes' },
    { label: 'Нет', icon: <TickNo />, id: 'no' },
  ],
  arrow: [
    { label: 'Вверх', icon: <ArrowUp />, id: 'up'  },
    { label: 'Вниз', icon: <ArrowDown />, id: 'down'  },
    { label: 'Налево', icon: <ArrowLeft />, id: 'left'  },
    { label: 'Направо', icon: <ArrowRight />, id: 'right'  },
    { label: 'Включи', icon: <ArrowOn />, id: 'on'  },
    { label: 'Выключи', icon: <ArrowOff />, id: 'off'  },
  ],
  man: [
    { label: 'Стоп', icon: <ManStop />, id: 'stop'  },
    { label: 'Иди', icon: <ManGo />, id: 'go'  },
    { label: 'Вперед', icon: <ManForward />, id: 'forward'  },
    { label: 'Назад', icon: <ManReverse />, id: 'backward'  },
    { label: 'Следуй', icon: <ManFollow />, id: 'follow'  },
    { label: 'Наблюдай', icon: <ManLook />, id: 'visual'  },
    { label: 'Изучай', icon: <ManLearn />, id: 'learn'  },
  ],
  numbers: [
    { label: 'Ноль', icon: <NumbersNull />, id: 'zero' },
    { label: 'Один', icon: <NumbersOne />, id: 'one' },
    { label: 'Два', icon: <NumbersTwo />, id: 'two' },
    { label: 'Три', icon: <NumbersThree />, id: 'three' },
    { label: 'Четыре', icon: <NumbersFour />, id: 'four' },
    { label: 'Пять', icon: <NumbersFive />, id: 'five' },
    { label: 'Шесть', icon: <NumbersSix />, id: 'six' },
    { label: 'Семь', icon: <NumbersSeven />, id: 'seven' },
    { label: 'Восемь', icon: <NumbersEight />, id: 'eight' },
    { label: 'Девять', icon: <NumbersNine />, id: 'nine' },
  ],
  face: [
    { label: 'Создай', icon: <FaceCreate />, id: 'create' },
    { label: 'Зарыдай', icon: <FaceCry />, id: 'cry' },
    { label: 'Сверх', icon: <FaceOver />, id: 'over' },
    { label: 'Разлад', icon: <FaceDiscord />, id: 'discord' },
    { label: 'Вперед', icon: <FaceForward />, id: 'harm' },
    { label: 'Гибнет', icon: <FaceDie />, id: 'dies' },
  ],
  hammer: [
    { label: 'Гвозди', icon: <HammerNail />, id: 'nails'  },
    { label: 'Ржавее', icon: <HammerRusty />, id: 'rustier'  },
    { label: 'Исключи', icon: <HammerExclude />, id: 'exclude'  },
    { label: 'Девиз', icon: <HammerSlogan />, id: 'motto'  },
    { label: 'Беда', icon: <HammerTrouble />, id: 'grief'  },
    { label: 'Новее', icon: <HammerNew />, id: 'newer'  },
    { label: 'Стучи', icon: <HammerKnock />, id: 'knock'  },
    { label: 'Сдуй', icon: <HammerBlowAway />, id: 'blow off' },
  ]
}