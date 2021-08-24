import os
from io import StringIO, BytesIO
from urllib.request import urlopen
from pdf2image import convert_from_path, convert_from_bytes
from PIL import Image

import boto3
from botocore.exceptions import ClientError

import server_hooks

bucket = os.environ["AWS_BUCKET"]

def to_image(event, context):
    key = event['s3Key']
    object_id = event['objectId']
    page_index = event['pageIndex']
    s3 = boto3.resource('s3')
    s3_client = boto3.client('s3')

    obj = s3.Object(bucket, key)
    memoryFile = obj.get()['Body'].read()
    images = convert_from_bytes(memoryFile, dpi=100)

    buf = BytesIO()
    images[0].convert('P', palette=Image.ADAPTIVE, colors=256).save(buf, format="PNG", optimize=True, quality=80)

    image = Image.open(buf)
    sheet_width, sheet_height = image.size

    buf.seek(0)

    try:
        dest_key = key.replace('.pdf', '.png')
        response = s3_client.upload_fileobj(buf, bucket, dest_key, ExtraArgs={'ContentType': 'image/png', 'ACL':'public-read'})
    except ClientError as e:
        raise e

    server_hooks.notify_sheet_to_image_completion(object_id, page_index, sheet_width, sheet_height)

    return True
