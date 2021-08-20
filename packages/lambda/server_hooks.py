import os
import requests

headers = {
    'Content-Type': 'application/json',
}

def get_host():
    if os.environ["NODE_ENV"] == 'production':
        return "https://{}".format(os.environ["SITE_URL"])
    else:
        return "http://nginx:3000"

def notify_split_pdf_completion(planset_id):
    # Send a request to the server w auth tokens and such
    # Our server will kick off the next lambda job
    # For preliminary testing, we will kick it off in here
    res = requests.put("{}/api/plansets/{}/complete".format(get_host(), planset_id))
    print(res.text)
    return True

def notify_page_count(planset_id, page_count):
    json = { 'page_count': page_count }
    res = requests.put("{}/api/plansets/{}/page_count".format(get_host(), planset_id), json=json, headers=headers)
    print(res.text)
    return True

def notify_create_sheet(planset_id, page_index, detected_text, crop_type, sheet_width, sheet_height):
    json = {
        'page_index': page_index, 
        'detected_text': detected_text,
        'crop_type': crop_type,
        'sheet_width': sheet_width, 
        'sheet_height': sheet_height
    }
    res = requests.post("{}/api/plansets/{}/sheets".format(get_host(), planset_id), json=json)
    print(res.text)
    return True
