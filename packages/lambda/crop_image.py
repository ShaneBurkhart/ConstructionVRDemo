from io import StringIO, BytesIO
from urllib.request import urlopen
from PIL import Image

import boto3
import server_hooks
import pipeline

def crop(event, context):
    key = event['s3Key']
    planset_id = event['plansetId']
    page_index = event['pageIndex']
    sheet_width = event['sheetWidth']
    sheet_height = event['sheetHeight']

    width = event.get('width', 0.2)
    height = event.get('height', 0.1)
    left = event.get('left', 0.8)
    top = event.get('top', 0.9)

    crop_type = event.get('cropType', 'num')
    if crop_type not in ['num', 'name']:
        crop_type = 'num'

    s3 = boto3.resource('s3')
    s3_client = boto3.client('s3')

    obj = s3.Object("gmi-plan-viewer-staging", key)
    memoryFile = obj.get()['Body'].read()

    image = Image.open(BytesIO(memoryFile))
    w, h = image.size

    l = w * float(left)
    t = h * float(top)
    r = l + w * float(width)
    b = t + h * float(height)

    cropped = image.crop((l, t, r, b))

    buf = BytesIO()
    cropped.save(buf, format="PNG")
    buf.seek(0)

    try:
        dest_key = key.replace('.png', '_{}_crop.png'.format(crop_type))
        print('dest_key', dest_key)
        response = s3_client.upload_fileobj(buf, "gmi-plan-viewer-staging", dest_key, ExtraArgs={'ContentType': 'image/png', 'ACL':'public-read'})
    except ClientError as e:
        raise e

    pipeline.start_image_text_recognition(dest_key, planset_id, page_index, crop_type, float(sheet_width), float(sheet_height))

    return True
