import os
import requests
from threading import Thread
import boto3

JOB_QUEUE_SERVER_URL = "http://lambda_queue_proxy:3000"

# PDF_TO_IMAGE_DEV_URL = "http://pdf_to_image:8080/2015-03-31/functions/function/invocations"
# IMAGE_CROP_DEV_URL = "http://crop_image:8080/2015-03-31/functions/function/invocations"
# IMAGE_TEXT_RECOGNITION_DEV_URL = "http://image_text_recognition:8080/2015-03-31/functions/function/invocations"

headers = {
    'Content-Type': 'application/json',
}

queueToFunctionName = {
    "pdf_to_image": os.environ["AWS_PDF_TO_IMAGE_LAMBDA_FUNCTION_NAME"]
}

def start_job(queueName, data):
    if os.environ["NODE_ENV"] == 'production':
        lam = boto3.resource('lambda')
        lambda_client = boto3.client('lam')

        functionName = queueToFunctionName[queueName]
        payloadStr = json.dumps(data)
        payloadBytesArr = bytes(payloadStr, encoding='utf8')

        response = lambda_client.invoke(
            FunctionName=functionName,
            InvocationType="RequestResponse",
            Payload=payloadBytesArr
        )
    else:
        json = { 'name': queueName, 'data': data }
        res = requests.post(JOB_QUEUE_SERVER_URL, json=json, headers=headers)
        print(res.text)

def start_pdf_to_image_job(s3Key, plansetId, pageIndex):
    # Send a request to the lambda process running our job
    # In dev, that is a local docker container
    # In prod, it is a lambda instance
    json = { 's3Key': s3Key, 'plansetId': plansetId, 'pageIndex': pageIndex }
    start_job("pdf_to_image", json)

    # If production, use a thread
    # Thread(target=requests.post, args=(DEV_URL,), kwargs={ 'json': json, 'headers': headers }).start()

    return True
