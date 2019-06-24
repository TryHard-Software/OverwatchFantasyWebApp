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

KILLFEED_THRESHOLD = 0.07
KILLFEED_X_SPLIT = 250
TEAM_COLOR_THRESHOLD = 140
# REPLAY_WHITE_THRESHOLD = 215
# REPLAY_THRESHOLD = 0.01
# LOGO_THRESHOLD = 0.01
# COVERAGE_CONTINUES_THRESHOLD = 0.01

heroes = [x.replace(".png", "") for x in os.listdir(dir_path + "/heroes")]

killfeed = img[140:410, 890:1260]
# replay = img[154:212, 152:346]
# logo = img[149: 215, 59:134]

method = cv2.TM_SQDIFF_NORMED

def get_team(base_image, x, y):
    if x < KILLFEED_X_SPLIT:
        color_check = base_image[y-5:y+20, x-40:x-15]
    else:
        color_check = base_image[y-5:y+20, x+30:x+55]
    total_red = 0
    total_green = 0
    total_blue = 0
    total_pixels = 0
    for row in color_check:
        for point in row:
            total_pixels += 1
            total_red += point[0]
            total_green += point[1]
            total_blue += point[2]
    if total_pixels == 0:
        return "none"
    average_red = total_red / total_pixels
    average_green = total_green / total_pixels
    average_blue = total_blue / total_pixels
    if average_red > TEAM_COLOR_THRESHOLD and average_green > TEAM_COLOR_THRESHOLD and average_blue > TEAM_COLOR_THRESHOLD:
        # must be white team
        return "left"
    else:
        return "right"

# in_replay = False
# # check if entire screen is whiteish. means replay is coming. protects us from
# # data from the first few seconds of a replay
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

# if logo, don't count anything
# large_image = img
# cv2.imwrite("logo_test.png", large_image)
# small_image = cv2.imread("logo.png")
# result = cv2.matchTemplate(small_image, large_image, method)
# # cv2.imwrite("logo_test.png", small_image)

# result2 = np.reshape(result, result.shape[0]*result.shape[1])
# sort = np.argsort(result2)
# accuracy = result2[sort[0]]
# if accuracy < LOGO_THRESHOLD:
#     in_replay = True

# # if in replay, don't count anything
# large_image = img
# small_image = cv2.imread("replay.png")
# result = cv2.matchTemplate(small_image, large_image, method)

# result2 = np.reshape(result, result.shape[0]*result.shape[1])
# sort = np.argsort(result2)
# accuracy = result2[sort[0]]
# # print(accuracy)
# if accuracy < REPLAY_THRESHOLD:
#     in_replay = True

# # if in coverage continues, don't count anything
# large_image = img
# small_image = cv2.imread("coverage_continues.png")
# result = cv2.matchTemplate(small_image, large_image, method)

# result2 = np.reshape(result, result.shape[0]*result.shape[1])
# sort = np.argsort(result2)
# accuracy = result2[sort[0]]
# # print(accuracy)
# if accuracy < COVERAGE_CONTINUES_THRESHOLD:
#     in_replay = True



top_accuracy_heroes = {
    0: (0, 0, 0, 0, 0, 1000, "none"),
    1: (0, 0, 0, 0, 0, 1000, "none"),
    2: (0, 0, 0, 0, 0, 1000, "none"),
    3: (0, 0, 0, 0, 0, 1000, "none"),
    4: (0, 0, 0, 0, 0, 1000, "none"),
    5: (0, 0, 0, 0, 0, 1000, "none"),
    6: (0, 0, 0, 0, 0, 1000, "none"),
    7: (0, 0, 0, 0, 0, 1000, "none"),
    8: (0, 0, 0, 0, 0, 1000, "none"),
    9: (0, 0, 0, 0, 0, 1000, "none"),
    10: (0, 0, 0, 0, 0, 1000, "none"),
    11: (0, 0, 0, 0, 0, 1000, "none")
}

for hero in heroes:

    method = cv2.TM_SQDIFF_NORMED

    small_image = cv2.imread(dir_path + "/heroes/" + hero + '.png')
    large_image = killfeed

    result = cv2.matchTemplate(small_image, large_image, method)

    trows, tcols = small_image.shape[:2]

    result2 = np.reshape(result, result.shape[0]*result.shape[1])
    sort = np.argsort(result2)
    for i in sort:
        accuracy = result2[i]
        (y1, x1) = np.unravel_index(i, result.shape)  # best match
        if result2[i] > KILLFEED_THRESHOLD: 
            break
        team = 'none'
        if x1 < KILLFEED_X_SPLIT:
            if y1 < 30:
                if top_accuracy_heroes[0][5] > accuracy:
                    top_accuracy_heroes[0] = (
                        hero, x1, y1, trows, tcols, accuracy, team)
            elif y1 < 64:
                if top_accuracy_heroes[1][5] > accuracy:
                    top_accuracy_heroes[1] = (
                        hero, x1, y1, trows, tcols, accuracy, team)
            elif y1 < 100:
                if top_accuracy_heroes[2][5] > accuracy:
                    top_accuracy_heroes[2] = (
                        hero, x1, y1, trows, tcols, accuracy, team)
            elif y1 < 134:
                if top_accuracy_heroes[3][5] > accuracy:
                    top_accuracy_heroes[3] = (
                        hero, x1, y1, trows, tcols, accuracy, team)
            elif y1 < 170:
                if top_accuracy_heroes[4][5] > accuracy:
                    top_accuracy_heroes[4] = (
                        hero, x1, y1, trows, tcols, accuracy, team)
            elif y1 < 200:
                if top_accuracy_heroes[5][5] > accuracy:
                    top_accuracy_heroes[5] = (
                        hero, x1, y1, trows, tcols, accuracy, team)
        else:
            if y1 < 30:
                if top_accuracy_heroes[6][5] > accuracy:
                    top_accuracy_heroes[6] = (
                        hero, x1, y1, trows, tcols, accuracy, team)
            elif y1 < 64:
                if top_accuracy_heroes[7][5] > accuracy:
                    top_accuracy_heroes[7] = (
                        hero, x1, y1, trows, tcols, accuracy, team)
            elif y1 < 100:
                if top_accuracy_heroes[8][5] > accuracy:
                    top_accuracy_heroes[8] = (
                        hero, x1, y1, trows, tcols, accuracy, team)
            elif y1 < 134:
                if top_accuracy_heroes[9][5] > accuracy:
                    top_accuracy_heroes[9] = (
                        hero, x1, y1, trows, tcols, accuracy, team)
            elif y1 < 170:
                if top_accuracy_heroes[10][5] > accuracy:
                    top_accuracy_heroes[10] = (
                        hero, x1, y1, trows, tcols, accuracy, team)
            elif y1 < 200:
                if top_accuracy_heroes[11][5] > accuracy:
                    top_accuracy_heroes[11] = (
                        hero, x1, y1, trows, tcols, accuracy, team)

for hero in top_accuracy_heroes:
    my_hero = top_accuracy_heroes[hero]
    team = get_team(killfeed, my_hero[1], my_hero[2])
    my_hero = (my_hero[0], my_hero[1], my_hero[2], my_hero[3], my_hero[4], my_hero[5], team)
    top_accuracy_heroes[hero] = my_hero

sys.stdout.write(str(top_accuracy_heroes))
sys.stdout.flush()
sys.exit(0)