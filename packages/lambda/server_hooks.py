import os
import requests

headers = {
    'Content-Type': 'application/json',
}

def get_host():
    if os.environ["NODE_ENV"] == 'production':
        return "{}".format(os.u["SITE_URL"])
    else:
        return "http://nginx:3000"
    
def get_webhook_url():
    return "{}/api/_webhooks/documents".format(get_host())

def notify_split_pdf_completion(object_id):
    json = { 
        'type': "SPLIT_PDF_COMPLETED", 
        'data': { 'objectId': object_id } 
    }
    res = requests.post(get_webhook_url(), json=json, headers=headers)
    print(res.text)
    return True

def notify_page_count(object_id, page_count):
    json = { 
        'type': "PAGE_COUNT", 
        'data': { 'objectId': object_id, 'pageCount': page_count } 
    }
    res = requests.post(get_webhook_url(), json=json, headers=headers)
    print(res.text)
    return True

def notify_sheet_to_image_completion(object_id, page_index, sheet_width, sheet_height):
    json = {
        'type': "SHEET_TO_IMAGE_COMPLETED", 
        'data': {
            'objectId': object_id,
            'pageIndex': page_index, 
            'sheetWidth': sheet_width, 
            'sheetHeight': sheet_height
        }
    }
    res = requests.post(get_webhook_url(), json=json, headers=headers)
    print(res.text)
    return True
