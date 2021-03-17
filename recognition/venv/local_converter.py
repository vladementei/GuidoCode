import cv2
from imageai.Detection.Custom import CustomObjectDetection
from image_modifier import warp_image
from convert_utils import convert_song, convert_midi


detector = CustomObjectDetection()
detector.setModelTypeAsYOLOv3()
detector.setModelPath("detection\\last-detect.h5")
detector.setJsonPath("detection\\best-conf.json")
detector.loadModel()


file_name = "resources\\99.jpg"
sliced_image = warp_image(cv2.imread(file_name), isDebug=True)
if sliced_image is None:
    print("Image slice failed, use original image")
else:
    print("Image slice succes, override original image")
    cv2.imwrite(file_name, sliced_image)


detections = detector.detectObjectsFromImage(
    input_image=file_name,
    output_image_path="resources\\detected.jpg",
    minimum_percentage_probability=70,
    display_object_name=True,
    display_percentage_probability=True
)

song = convert_song(detections, file_name)
convert_midi(song, file_name)

for elem in song:
    print(elem.dlit)
    print(elem.name)
