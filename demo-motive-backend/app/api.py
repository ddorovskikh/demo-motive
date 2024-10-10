from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from .powerdata_gpu import Worker_power

from subprocess import Popen, PIPE
from xml.etree.ElementTree import fromstring
from threading import Thread
from dataclasses import dataclass
from dataclasses_json import dataclass_json

import asyncio
import datetime

from starlette.websockets import WebSocketClose
from websockets.exceptions import ConnectionClosedError

import numpy as np
from typing import List
import json

import websockets


app = FastAPI()

origins = [
    "http://localhost:3001",
    "localhost:3001"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"msg": "Hello World"}

def get_gpu_info():
        p = Popen(["nvidia-smi", "-q", "-x"], stdout=PIPE)
        outs, errors = p.communicate()
        xml = fromstring(outs)
        datas = []
        driver_version = xml.findall("driver_version")[0].text
        cuda_version = xml.findall("cuda_version")[0].text

        for gpu_id, gpu in enumerate(xml.iter("gpu")):
            gpu_data = {}

            minor_number = gpu.findall("minor_number")[0].text
            power_R = gpu.findall("gpu_power_readings")[0]
            power_draw = power_R.findall("power_draw")[0].text

            gpu_data["minor_number"] = minor_number
            gpu_data["power"] = power_draw
            datas.append(gpu_data)
        return datas

def get_power():
    while True:
        p_data = float(get_gpu_info()[0]["power"].replace(" W",""))

wp = Worker_power()

power_thread = Thread(target = get_power)
power_thread.start()
print(power_thread.is_alive())

@app.websocket("/wsx")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    power_buff = []
    while True:
        t = datetime.datetime.now().time()
        #print(wp.p_data)
        power = get_gpu_info()[0]['power'].replace(" W","")
        print(power)
        power_buff.append({'power': power, 'time': str(t)})
        print(power_buff)
        if (len(power_buff) == 10):
            try:
                '''
                if t.second % 5 == 0:
                    print("Sending the time!")
                    await websocket.send_text(str(t))
                    await asyncio.sleep(1)
                '''
                print("Sending gpu power!")
                #await websocket.send_json({'power': power, 'time': str(t)})
                await websocket.send_text(json.dumps(power_buff))
                await asyncio.sleep(1)
                power_buff = []
            except ConnectionClosedError:
                print("Client disconnected.")
                power_buff = []
                break


'''
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    #wp = Worker_power()
    while True:
        #data = await websocket.receive_text()
        #data = wp.p_data
        #await websocket.send_text(f"Message text was: {data}")
        power = get_gpu_info()[0]['power']
        await websocket.send_text(f"Message text was: {get_gpu_info()[0]}")
'''

'''
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    #wp = Worker_power()
    while True:
        power = get_gpu_info()[0]['power']
        print(get_gpu_info())
        print(power)
        await websocket.send_text(f"Message text was: ")
        #await websocket.send_text(f"Power: {wp.p_data}")
        #await websocket.send(json.stringify(get_gpu_info()[0]))
        #await websocket.send_text(get_gpu_info()[0].power);
        #data = 'xcvbxnvb'
        #await websocket.send_text(f"Message text was: {data}")
'''