from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
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
import pynvml

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

def get_gpu_info_2():
    device_count = pynvml.nvmlDeviceGetCount()
    datas = []
    for i in range(device_count):
        gpu_data = {}
        handle = pynvml.nvmlDeviceGetHandleByIndex(i)
        power_in_mW = pynvml.nvmlDeviceGetPowerUsage(handle)
        gpu_data["power"] = power_in_mW
        datas.append(gpu_data)
    return datas

def get_power():
    while True:
        p_data = float(get_gpu_info()[0]["power"].replace(" W",""))

# Constants
CHUNK_DURATION = 0.025  # 25ms
SAMPLE_RATE = 16000  # Should match the sample rate in the Dash app
CHUNK_SIZE = int(CHUNK_DURATION * SAMPLE_RATE)

current_audio_command = None
current_chunk = None

@app.websocket("/wsx/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    await websocket.accept()
    match channel:
        case 'power':
            while True:
                t = datetime.datetime.now().time()
                h, m, s = str(t).split(":");
                seconds = (float(h) * 60 * 60) + (float(m) * 60) + float(s);
                power = get_gpu_info()[0]['power'].replace(" W","")
                try:
                    await websocket.send_json({'power': float(power), 'time': seconds})
                    await asyncio.sleep(0.01)
                except ConnectionClosedError:
                    print("Client disconnected.")
                    break
        case 'audio':
            while True:
                chunk = np.random.random(CHUNK_SIZE) * 0.01 - 0.005
                #print(chunk)
                if current_audio_command and current_audio_command.is_playing:
                    command_chunk = current_audio_command.audio_data[current_audio_command.shift:current_audio_command.shift + CHUNK_SIZE]
                    current_audio_command.shift += CHUNK_SIZE
                    if current_audio_command.shift >= current_audio_command.length_samples - 1:
                        current_audio_command.is_playing = False
                    chunk[:len(command_chunk)] += command_chunk
                    chunk = np.clip(chunk, -1, 1)
                await websocket.send(chunk.astype(np.float32).tobytes())
                await asyncio.sleep(CHUNK_DURATION)


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

COMMANDS_CLASSES = ["yes", "no", "up", "down", "left", "right", "on", "off", "stop", "go",
                    "backward", "forward", "follow", "learn", "visual",
                    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
                    "create", "cry", "over", "discord", "harm", "dies", "nails", "rustier",
                    "exclude", "motto", "grief", "newer", "knock", "blow off"]

@app.post("/play_command")
async def play_command(class_data: dict) -> dict:
    class_id = class_data['class_id']
    #command_playing_class = COMMANDS_CLASSES[class_id]
    print(class_id)
    '''
    command_audio_file = random.choice(os.listdir(SOUNDS_DIR / command_playing_class))
    try:
        command_audio_data, _ = librosa.load(SOUNDS_DIR / command_playing_class / command_audio_file, sr=SAMPLE_RATE)
    except:
        raise HTTPException(status_code=400, detail="Wrong audio class")
    current_audio_command = CurrentAudioCommand(timestamp=datetime.timestamp(datetime.now()),
                                                is_playing=True,
                                                file_path=SOUNDS_DIR / command_playing_class / command_audio_file,
                                                audio_data=command_audio_data,
                                                length_samples=len(command_audio_data))
    '''
    return {
        "timestamp": str(datetime.datetime.now().time()),
        "length_samples": 5,
    }
