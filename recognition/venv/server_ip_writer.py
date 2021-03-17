import gspread
from oauth2client.service_account import ServiceAccountCredentials

def write_api_address(url):
    scope = ['https://spreadsheets.google.com/feeds',
             'https://www.googleapis.com/auth/drive']
    creds = ServiceAccountCredentials.from_json_keyfile_name("detection\\Otvinta-key.json", scope)
    client = gspread.authorize(creds)
    sheet = client.open('server-data').sheet1

    sheet.update_cell(1, 1, url)
    data = sheet.row_values(1)
    print(data)