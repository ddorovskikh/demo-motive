import type { FC } from 'react';

interface ITopMenuButton {
  icon?: any,
  label?: string,
  id?: string,
  onClassChoose?: any,
  setClassId?: any;
}

const TopMenuButton: FC<ITopMenuButton> = (props) => {
  const clickHandler = async () => {
    props.setClassId(props.id);
    try {
      const classResponse = await fetch('http://127.0.0.1:8008/play_command', {
        method: 'POST',
        headers: { "Content-Type": "text/plain", 'Accept': 'application/json' },
        body: props.id,
      });
      if (!classResponse.ok) {
        throw new Error(classResponse.statusText);
      }
      const data = await classResponse.json(); // Parse response as text
      props.onClassChoose(JSON.parse(data));

    } catch (error: any) {
      console.log('Error: ' + error.message);
      console.log(error.response);
    }

    /*.then((response) => {
         if (response.status >= 200 && response.status < 300) {
           return response.json();
         } else {
           let error = new Error(response.statusText);
           throw error;
         }
       })
       .then( (data) =>  { props.onClassChoose(data); })
       .catch((e) => {
           console.log('Error: ' + e.message);
           console.log(e.response);
       });*/
  }

  return (
    <div className='flex flex-col gap-2'>
      <button
        className='flex justify-center rounded-full w-[90.24px] h-[90.24px] bg-[#FEDB99] place-items-center'
        onClick={() => clickHandler()}
      >
        {props.icon}
      </button>
      <span className='text-top-menu text-center'> {props.label} </span>
    </div>
  );
}

export default TopMenuButton;