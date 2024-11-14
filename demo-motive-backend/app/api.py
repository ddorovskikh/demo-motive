from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
# from .powerdata_gpu import Worker_power

from subprocess import Popen, PIPE
from xml.etree.ElementTree import fromstring
from threading import Thread
from dataclasses import dataclass
from dataclasses_json import dataclass_json

import asyncio
from datetime import datetime, time

from starlette.websockets import WebSocketClose
from websockets.exceptions import ConnectionClosedError

import numpy as np
from typing import List
import json
import pynvml

import websockets
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging

log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
log_handler = logging.FileHandler(f"logs/{datetime.now().strftime('%Y-%m-%d %H%M%S')}.log")
log_handler.setFormatter(logging.Formatter("[%(levelname)s:[%(asctime)s]:%(funcName)s]: %(message)s"))
log.addHandler(log_handler)

@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting stream")
    scheduler = AsyncIOScheduler()
    scheduler.add_job(stream_to_frontend, "interval", seconds=0.025, max_instances=1)
    scheduler.start()
    yield


app = FastAPI(lifespan=lifespan)

websocket_stream = None

async def stream_to_frontend():
    if websocket_stream is None:
        return
    chunk = np.random.random(CHUNK_SIZE) * 0.01 - 0.005
    print(get_gpu_info_2())
    powerArray = [get_gpu_info_2()[0]]
    await websocket_stream.send_bytes(chunk.astype(np.float32).tobytes())

@app.websocket("/data_stream")
async def websocket_endpoint_1(websocket: WebSocket):
    global websocket_stream
    await websocket.accept()
    websocket_stream = websocket
    try:
        while True:
            print('yes')
            await websocket.receive_text()
            #await asyncio.sleep(0.01)
    except:
        log.warning("gpu_data_stream socket is closed")
        websocket_stream = None


def get_gpu_info_2():
    device_count = pynvml.nvmlDeviceGetCount()
    datas = []
    for i in range(device_count):
        # gpu_data = {}
        handle = pynvml.nvmlDeviceGetHandleByIndex(i)
        power_in_mW = pynvml.nvmlDeviceGetPowerUsage(handle)
        # gpu_data["power"] = power_in_mW
        datas.append(power_in_mW)
    return datas
'''
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
        # gpu_data = {}
        handle = pynvml.nvmlDeviceGetHandleByIndex(i)
        power_in_mW = pynvml.nvmlDeviceGetPowerUsage(handle)
        # gpu_data["power"] = power_in_mW
        datas.append(power_in_mW)
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
                h, m, s = str(t).split(":")
                seconds = (float(h) * 60 * 60) + (float(m) * 60) + float(s)
                power = get_gpu_info()[0]['power'].replace(" W","")
                try:
                    await websocket.send_json({'power': float(power), 'time': seconds})
                    await asyncio.sleep(0.025)
                except ConnectionClosedError:
                    print("Client disconnected.")
                    break
'''
