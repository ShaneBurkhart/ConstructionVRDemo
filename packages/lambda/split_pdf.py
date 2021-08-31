import os
from io import StringIO, BytesIO
from urllib.request import urlopen
from PyPDF2 import PdfFileWriter, PdfFileReader
# import asyncio
import urllib.parse
import boto3
from botocore.exceptions import ClientError

import server_hooks
import pipeline

bucket = os.environ["AWS_BUCKET"]

def split(event, context):
    object_id = event["objectId"]
    encoded_url = event['s3Key']
    url = urllib.parse.unquote(encoded_url)
    remoteFile = urlopen(url).read()
    memoryFile = BytesIO(remoteFile)

    input_pdf = PdfFileReader(memoryFile, strict=False)

    page_count = input_pdf.getNumPages()

    s3_client = boto3.client('s3')

    server_hooks.notify_page_count(object_id, page_count)
    for i in range(page_count):
        print(i)
        output = PdfFileWriter()
        output.addPage(input_pdf.getPage(i))

        buf = BytesIO()
        output.write(buf)
        buf.seek(0)

        try:
            key = "documents/{}_{}.pdf".format(object_id, i)
            response = s3_client.upload_fileobj(buf, bucket, key, ExtraArgs={'ContentType': 'application/pdf', 'ACL':'public-read'})
            # Kick off next job
            pipeline.start_pdf_to_image_job(key, object_id, i)
        except ClientError as e:
            raise e

    server_hooks.notify_split_pdf_completion(object_id)

    return True

# asyncio.run(split())
