import pytesseract
from PIL import Image, ImageFont, ImageDraw
import numpy as np
from cv2 import cv2
import sys
import os

dir_path = os.path.dirname(os.path.realpath(__file__))

if len(sys.argv) < 2:
    print("no filename")
    sys.exit(0)

input_filename = sys.argv[1]
img = cv2.imread(input_filename)

TEAM_LOGO_THRESHOLD = 0.05

method = cv2.TM_SQDIFF_NORMED

team_names = [x.replace(".png", "") for x in os.listdir(dir_path + "/teams")]

left_team_logo = img[36:66, 234:478]
right_team_logo = img[36:66, 802:1046]

teams = ['', '']

large_image = left_team_logo
# cv2.imwrite("testtt.png", large_image)
for team_name in team_names:
    small_image = cv2.imread(dir_path + "/teams/" + team_name + ".png")
    result = cv2.matchTemplate(small_image, large_image, method)
    result2 = np.reshape(result, result.shape[0]*result.shape[1])
    sort = np.argsort(result2)
    accuracy = result2[sort[0]]
    # print(accuracy)
    if accuracy < TEAM_LOGO_THRESHOLD:
        teams[0] = team_name
        break
large_image = right_team_logo
for team_name in team_names:
    small_image = cv2.imread(dir_path + "/teams/" + team_name + ".png")
    result = cv2.matchTemplate(small_image, large_image, method)
    result2 = np.reshape(result, result.shape[0]*result.shape[1])
    sort = np.argsort(result2)
    accuracy = result2[sort[0]]
    # print(accuracy)
    if accuracy < TEAM_LOGO_THRESHOLD:
        teams[1] = team_name
        break

sys.stdout.write(str(teams))
sys.stdout.flush()
sys.exit(0)