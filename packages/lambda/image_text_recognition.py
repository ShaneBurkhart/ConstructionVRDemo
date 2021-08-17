from io import StringIO, BytesIO
from urllib.request import urlopen
from PyPDF2 import PdfFileWriter, PdfFileReader

import boto3
from botocore.exceptions import ClientError

import server_hooks
import pipeline

TEMP_FILE_URL = "https://gmi-plan-viewer-staging.s3-us-west-2.amazonaws.com/plan_sheets.pdf"

def read(event, context):
    key = event['s3Key']
    planset_id = event['plansetId']
    page_index = event['pageIndex']
    sheet_width = event['sheetWidth']
    sheet_height = event['sheetHeight']
    client=boto3.client('rekognition', 'us-west-2')

    crop_type = event.get('cropType', 'num')
    if crop_type not in ['num', 'name']:
        crop_type = 'num'

    response=client.detect_text(
        Image={'S3Object':{'Bucket':"gmi-plan-viewer-staging",'Name':key}},
        Filters={ 'WordFilter': { 'MinConfidence': 90 } }
    )

    textDetections=response['TextDetections']

    textDetections = filter(lambda item: 'LINE' in item['Type'], textDetections)
    textDetections = sorted(textDetections, key=lambda item: item['Geometry']['BoundingBox']['Height'])

    print('crop_type', crop_type)
    for text in textDetections[-1:]:
        print (text['DetectedText'])

    if len(textDetections) > 0:
        detected_text = textDetections[-1:][0]['DetectedText']
    else:
        detected_text = ''
    
    # SERVER HOOK to create WizardSheets record for WizardPlanSetId -- findOrCreate, set finishedAt, pull variables out of textDetections
    server_hooks.notify_create_sheet(planset_id, page_index, detected_text, crop_type, sheet_width, sheet_height)
    return True
