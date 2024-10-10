from subprocess import Popen, PIPE
from xml.etree.ElementTree import fromstring
from threading import Thread
from dataclasses import dataclass
from dataclasses_json import dataclass_json

import numpy as np
from typing import List
import json 

@dataclass_json
@dataclass
class Audio_Data_To_Inference:
    features: List[float]

class Worker_power:
    QUEUE_AUDIO_FEATURES_TO_ALTAI = "queue_audio_features_to_altai"

    def __init__(self):
        #self._connection = pika.BlockingConnection(pika.ConnectionParameters('0.0.0.0', port='5672'))
        #self.channel = self._connection.channel(channel_number=1)
        '''
        self.i = 0
        self.body = None
        self.altai_power_prev = None
        self.thread_on = True
        '''

        self.power_thread = Thread(target = self.get_power)
        self.power_thread.start()
        self.p_data = None

        #self.starting = False
        #self.power_data = Thread(target=self.send_powerdata)
        #self.power_data.start()

        # self.broker_worker = Thread(target=self.start, args = [self.channel])
        # self.broker_worker.start()
        #self.start(self.channel)
        
    '''
    def start(self, channel):
        self.starting = True
        channel.start_consuming()
        
        # channel.connection.process_data_events(time_limit=1)
    '''    
    def send_powerdata(self):
        #if self.altai_power_prev != self.p_data:  # altai_power_prev - ?
            '''
            self.channel.basic_publish(exchange="",
                                routing_key="queue_measurments",
                                body=json.dumps({
                                        "pdata": self.p_data,
                                        "source": "gpu"
                                    }))
            '''
            return json.dumps({
                        "pdata": self.p_data,
                        "source": "gpu"
                    })
            #self.altai_power_prev = self.p_data
            #self.i +=1
            # print("GPU_power : basic_publish",self.p_data)


    def get_gpu_info(self):
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

    
    def get_power(self,):
        while True: 
            self.p_data = float(self.get_gpu_info()[0]["power"].replace(" W",""))
    