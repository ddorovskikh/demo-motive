import os
import json
import asyncio
import random
import logging
from datetime import datetime, time
import struct
from dataclasses import dataclass
from pathlib import Path
from subprocess import Popen, PIPE
from xml.etree.ElementTree import fromstring
import signal
from contextlib import asynccontextmanager

import uvicorn
import websockets
import numpy as np
import pynvml
from fastapi import FastAPI, WebSocket, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
log_handler = logging.FileHandler(f"logs/{datetime.now().strftime('%Y-%m-%d %H%M%S')}.log")
log_handler.setFormatter(logging.Formatter("[%(levelname)s:[%(asctime)s]:%(funcName)s]: %(message)s"))
log.addHandler(log_handler)

MAX_RECONNECT_DELAY = 360


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting stream")
    scheduler = AsyncIOScheduler()
    scheduler.add_job(stream_to_frontend, "interval", seconds=0.1, max_instances=1)
    scheduler.start()
    yield

app = FastAPI(lifespan=lifespan)

# Enable CORS
'''
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
'''

websocket_stream = None

async def stream_to_frontend():
    if websocket_stream is None:
        return
    power = float(get_gpu_info()[0].replace(" W",""))
    powerArray = np.array([power])
    await websocket_stream.send_bytes(powerArray.astype(np.float32).tobytes())

@app.websocket("/data_stream")
async def websocket_endpoint_1(websocket: WebSocket):
    global websocket_stream
    await websocket.accept()
    websocket_stream = websocket
    try:
        while True:
            await websocket.receive_text()
    except:
        log.warning("data_stream socket is closed")
        websocket_stream = None

def get_gpu_info():
    p = Popen(["nvidia-smi", "-q", "-x"], stdout=PIPE)
    outs, errors = p.communicate()
    xml = fromstring(outs)
    datas = []
    driver_version = xml.findall("driver_version")[0].text
    cuda_version = xml.findall("cuda_version")[0].text

    for gpu_id, gpu in enumerate(xml.iter("gpu")):
        power_R = gpu.findall("gpu_power_readings")[0]
        power_draw = power_R.findall("power_draw")[0].text
        datas.append(power_draw)
    return datas
