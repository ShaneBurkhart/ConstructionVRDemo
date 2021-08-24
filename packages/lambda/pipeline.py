import os
import json
import requests
from threading import Thread
import boto3

JOB_QUEUE_SERVER_URL = "http://lambda_queue_proxy:3000"

# PDF_TO_IMAGE_DEV_URL = "http://pdf_to_image:8080/2015-03-31/functions/function/invocations"

headers = {
    'Content-Type': 'application/json',
}

queueToFunctionName = {
    "pdf_to_image": os.environ["AWS_PDF_TO_IMAGE_LAMBDA_FUNCTION_NAME"],
}

def start_job(queueName, data):
    if os.environ["NODE_ENV"] == 'production':
        lambda_client = boto3.client('lambda')

        functionName = queueToFunctionName[queueName]
        payloadStr = json.dumps(data)
        payloadBytesArr = bytes(payloadStr, encoding='utf8')

        response = lambda_client.invoke(
            FunctionName=functionName,
            InvocationType="RequestResponse",
            Payload=payloadBytesArr
        )
    else:
        j = { 'name': queueName, 'data': data }
        res = requests.post(JOB_QUEUE_SERVER_URL, json=j, headers=headers)
        print(res.text)

def start_pdf_to_image_job(s3Key, objectId, pageIndex):
    j = { 's3Key': s3Key, 'objectId': objectId, 'pageIndex': pageIndex }
    start_job("pdf_to_image", j)

    return True