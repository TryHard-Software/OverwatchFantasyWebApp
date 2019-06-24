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

TEAM_HERO_THRESHOLD = 0.07
# REPLAY_WHITE_THRESHOLD = 215
STATUS_AREA_WHITE_THRESHOLD = 250
# REPLAY_THRESHOLD = 0.01
# LOGO_THRESHOLD = 0.01
# COVERAGE_CONTINUES_THRESHOLD = 0.01
WHITEISH_RATIO = 0.3

method = cv2.TM_SQDIFF_NORMED

team_heroes = [x.replace(".png", "") for x in os.listdir(dir_path + "/team_heroes")]

left_team = img[70:134, 20:460]
right_team = img[70:134, 820:1260]
# replay = img[154:212, 152:346]
# logo = img[149: 215, 59:134]
# killfeed = img[140:410, 890:1260]
status_area = img[148:184, 180:320]
# cv2.imwrite("status_area_test.png", status_area)

left_team_1 = left_team[0:64, 10:82]
left_team_2 = left_team[0:64, 82:152]
left_team_3 = left_team[0:64, 152:222]
left_team_4 = left_team[0:64, 222:292]
left_team_5 = left_team[0:64, 292:362]
left_team_6 = left_team[0:64, 362:442]

right_team_1 = right_team[0:64, 10:82]
right_team_2 = right_team[0:64, 82:152]
right_team_3 = right_team[0:64, 152:222]
right_team_4 = right_team[0:64, 222:292]
right_team_5 = right_team[0:64, 292:362]
right_team_6 = right_team[0:64, 362:442]



teams = [
    # left team
    [left_team_1, left_team_2, left_team_3,
        left_team_4, left_team_5, left_team_6],
    # right team
    [right_team_1, right_team_2, right_team_3,
        right_team_4, right_team_5, right_team_6]
]

team_players = [
    # left team
    [
        "", "", "", "", "", ""
    ],
    # right team
    [
        "", "", "", "", "" ,""
    ]
]

in_replay = False
# check if killfeed is whiteish. means replay is coming. protects us from
# data from the first few seconds of a replay
# total_red = 0
# total_green = 0
# total_blue = 0
# total_pixels = 0
# for row in killfeed:
#     for point in row:
#         total_pixels += 1
#         total_red += point[0]
#         total_green += point[1]
#         total_blue += point[2]
# if total_pixels > 0:
#     average_red = total_red / total_pixels
#     average_green = total_green / total_pixels
#     average_blue = total_blue / total_pixels
#     if average_red > REPLAY_WHITE_THRESHOLD and average_green > REPLAY_WHITE_THRESHOLD and average_blue > REPLAY_WHITE_THRESHOLD:
#         # must be replay screen
#         in_replay = True

# if status area is whiteish, dont count anything
total_pixels = 0
total_whiteish_pixels = 0
for row in status_area:
    for point in row:
        total_pixels += 1
        if point[0] > STATUS_AREA_WHITE_THRESHOLD and point[1] > STATUS_AREA_WHITE_THRESHOLD and point[2] > STATUS_AREA_WHITE_THRESHOLD:
            total_whiteish_pixels += 1

if total_pixels > 0:
    average_whiteish_pixels = total_whiteish_pixels / total_pixels
    if average_whiteish_pixels > WHITEISH_RATIO:
        # must be replay screen
        in_replay = True

# if logo, don't count anything
# large_image = logo
# small_image = cv2.imread("logo.png")
# result = cv2.matchTemplate(small_image, large_image, method)
# # cv2.imwrite("logo_test.png", small_image)

# result2 = np.reshape(result, result.shape[0]*result.shape[1])
# sort = np.argsort(result2)
# accuracy = result2[sort[0]]
# if accuracy < LOGO_THRESHOLD:
#     in_replay = True

# if in replay, don't count anything
# large_image = replay
# small_image = cv2.imread("replay.png")
# result = cv2.matchTemplate(small_image, large_image, method)

# result2 = np.reshape(result, result.shape[0]*result.shape[1])
# sort = np.argsort(result2)
# accuracy = result2[sort[0]]
# # print(accuracy)
# if accuracy < REPLAY_THRESHOLD:
#     in_replay = True

# if in coverage continues, don't count anything
# large_image = img
# small_image = cv2.imread("coverage_continues.png")
# result = cv2.matchTemplate(small_image, large_image, method)

# result2 = np.reshape(result, result.shape[0]*result.shape[1])
# sort = np.argsort(result2)
# accuracy = result2[sort[0]]
# # print(accuracy)
# if accuracy < COVERAGE_CONTINUES_THRESHOLD:
#     in_replay = True

if in_replay:
    sys.stdout.write("blocked")
    sys.stdout.flush()
    sys.exit(0)
else:
    t = 0
    for team in team_players:
        p = 0
        for player in teams[t]:
            final_pick = ["", 10000]
            for team_hero in team_heroes:

                small_image = cv2.imread(dir_path + "/team_heroes/" + team_hero + ".png")
                large_image = player

                result = cv2.matchTemplate(small_image, large_image, method)

                trows, tcols = small_image.shape[:2]

                result2 = np.reshape(result, result.shape[0]*result.shape[1])
                sort = np.argsort(result2)
                for i in sort:
                    accuracy = result2[i]
                    (y1, x1) = np.unravel_index(i, result.shape)  # best match
                    if result2[i] > 0.1:
                        break
                    break
                if final_pick[1] > accuracy:
                    final_pick = [team_hero, accuracy]
            if final_pick[1] < TEAM_HERO_THRESHOLD:
                team_players[t][p] = final_pick[0]

            # cv2.imwrite("test_" + str(t) + "_" + str(p) + ".png", teams[t][p])
            p += 1
        
        t += 1


sys.stdout.write(str(team_players))
sys.stdout.flush()
sys.exit(0)